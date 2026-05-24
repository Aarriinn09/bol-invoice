from tkinter.font import names

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_vendor
import models
import schemas
from sqlalchemy import func, case
from datetime import datetime, timedelta, timezone
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from gst_data import get_gst_info, get_gst_breakdown

router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.post("/", response_model=schemas.InvoiceOut)
def save_invoice(
    data: schemas.InvoiceSave,
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor),
):
    invoice = models.Invoice(
        invoice_number = data.invoice_number,
        vendor_id      = vendor.id,
        buyer_name     = data.buyer_name or "Customer",
        buyer_phone    = data.buyer_phone,
        subtotal       = data.subtotal,
        gst_rate       = data.gst_rate,
        gst_amount     = data.gst_amount,
        total          = data.total,
        status         = "draft",
    )
    db.add(invoice)
    db.flush()  # get invoice.id before adding items

    for item_data in data.items:
        item = models.InvoiceItem(
            invoice_id   = invoice.id,
            product_name = item_data.product_name,
            qty          = item_data.qty,
            unit         = item_data.unit,
            price        = float(item_data.price),
            total        = float(item_data.total),
        )
        db.add(item)

    db.commit()
    db.refresh(invoice)
    return invoice


@router.get("/", response_model=List[schemas.InvoiceOut])
def get_invoices(
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor),
    skip: int = 0,
    limit: int = 50,
):
    return (
        db.query(models.Invoice)
        .filter(models.Invoice.vendor_id == vendor.id)
        .order_by(models.Invoice.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{invoice_id}", response_model=schemas.InvoiceOut)
def get_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor),
):
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.vendor_id == vendor.id,
    ).first()

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    return invoice


@router.patch("/{invoice_id}/status")
def update_status(
    invoice_id: str,
    status: str,
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor),
):
    if status not in ["draft", "sent", "paid"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.vendor_id == vendor.id,
    ).first()

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice.status = status
    db.commit()
    return {"message": f"Status updated to {status}"}

@router.patch("/{invoice_id}", response_model=schemas.InvoiceOut)
def update_invoice(
    invoice_id: str,
    data: schemas.InvoiceSave,
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor),
):
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.vendor_id == vendor.id,
    ).first()

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # Update invoice fields
    invoice.buyer_name  = data.buyer_name or "Customer"
    invoice.buyer_phone = data.buyer_phone
    invoice.subtotal    = data.subtotal
    invoice.gst_rate    = data.gst_rate
    invoice.gst_amount  = data.gst_amount
    invoice.total       = data.total

    # Delete old items and replace with new ones
    db.query(models.InvoiceItem).filter(
        models.InvoiceItem.invoice_id == invoice_id
    ).delete()

    for item_data in data.items:
        item = models.InvoiceItem(
            invoice_id   = invoice_id,
            product_name = item_data.product_name,
            qty          = item_data.qty,
            unit         = item_data.unit,
            price        = float(item_data.price),
            total        = float(item_data.total),
        )
        db.add(item)

    db.commit()
    db.refresh(invoice)
    return invoice  

from customer_auth import get_current_customer


@router.post("/{invoice_id}/send")
def send_invoice_to_customer(
    invoice_id: str,
    phone: str,                    # ← changed from email to phone
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor),
):
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.vendor_id == vendor.id,
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # Find customer by phone number
    customer = db.query(models.Customer).filter(
        models.Customer.phone == phone
    ).first()

    if not customer:
        # Store as pending link using phone
        existing_pending = db.query(models.PendingInvoiceLink).filter(
            models.PendingInvoiceLink.invoice_id == invoice_id,
            models.PendingInvoiceLink.phone      == phone,
        ).first()

        if not existing_pending:
            pending = models.PendingInvoiceLink(
                invoice_id = invoice_id,
                phone      = phone,
            )
            db.add(pending)
            db.commit()

        return {
            "found":       False,
            "public_link": f"http://localhost:5173/#invoice/{invoice.invoice_number}",
            "message":     "Customer not on BOL. Share this public link.",
        }

    # Customer found — check if already sent
    existing = db.query(models.CustomerInvoice).filter(
        models.CustomerInvoice.invoice_id  == invoice_id,
        models.CustomerInvoice.customer_id == customer.id,
    ).first()

    if existing:
        return {
            "found":   True,
            "message": f"Invoice already sent to {customer.name or customer.phone}",
        }

    link = models.CustomerInvoice(
        invoice_id  = invoice_id,
        customer_id = customer.id,
    )
    db.add(link)
    invoice.status = "sent"
    db.commit()

    return {
        "found":   True,
        "message": f"Invoice sent to {customer.name or customer.phone}",
    }
    
@router.get("/public/{invoice_number}")
def get_public_invoice(
    invoice_number: str,
    db: Session = Depends(get_db),
):
    """Public route — no auth needed. For sharing invoice links."""
    invoice = db.query(models.Invoice).filter(
        models.Invoice.invoice_number == invoice_number,
    ).first()

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # Get vendor info
    vendor = db.query(models.Vendor).filter(
        models.Vendor.id == invoice.vendor_id
    ).first()

    return {
        "invoice":    invoice,
        "shop_name":  vendor.shop_name if vendor else "Shop",
        "items":      invoice.items,
    }


@router.get("/analytics/summary")
def get_analytics(
    period: str = "month",  # today | week | month | all
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor),
):
    """Returns all analytics data for vendor dashboard in one call"""

    from datetime import timezone
    now = datetime.now(timezone.utc)

    # ── Date filter ───────────────────────────────────────────────────────────
    if period == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:
        start_date = datetime(2000, 1, 1)  # all time

    # ── Base query — all invoices for this vendor in period ───────────────────
    invoices = (
        db.query(models.Invoice)
        .filter(
            models.Invoice.vendor_id == vendor.id,
            models.Invoice.created_at >= start_date,
        )
        .order_by(models.Invoice.created_at.asc())
        .all()
    )

    # ── All items across those invoices ───────────────────────────────────────
    invoice_ids = [inv.id for inv in invoices]
    all_items = []
    if invoice_ids:
        all_items = (
            db.query(models.InvoiceItem)
            .filter(models.InvoiceItem.invoice_id.in_(invoice_ids))
            .all()
        )

    # ── Summary stats ─────────────────────────────────────────────────────────
    total_revenue = sum(float(inv.total) for inv in invoices)
    total_invoices = len(invoices)
    avg_bill = round(total_revenue / total_invoices, 2) if total_invoices else 0
    paid_revenue = sum(
        float(inv.total) for inv in invoices if inv.status == "paid"
    )
    unpaid_revenue = sum(
        float(inv.total) for inv in invoices if inv.status != "paid"
    )

    # ── Revenue over time (daily buckets) ─────────────────────────────────────
    from collections import defaultdict
    daily_revenue = defaultdict(float)
    daily_count   = defaultdict(int)

    for inv in invoices:
        day = inv.created_at.strftime("%Y-%m-%d")
        daily_revenue[day] += float(inv.total)
        daily_count[day]   += 1

    # Fill in missing days with 0
    if invoices:
        first_date = invoices[0].created_at.date()
        last_date  = now.date()
        current    = first_date
        while current <= last_date:
            day_str = current.strftime("%Y-%m-%d")
            if day_str not in daily_revenue:
                daily_revenue[day_str] = 0
                daily_count[day_str]   = 0
            current += timedelta(days=1)

    revenue_chart = [
        {
            "date":     day,
            "revenue":  round(daily_revenue[day], 2),
            "invoices": daily_count[day],
            "label":    datetime.strptime(day, "%Y-%m-%d").strftime("%d %b"),
        }
        for day in sorted(daily_revenue.keys())
    ]

    # ── Top selling items ─────────────────────────────────────────────────────
    item_counts = defaultdict(lambda: {"qty": 0, "revenue": 0.0})
    for item in all_items:
        name = item.product_name
        item_counts[name]["qty"]     += item.qty
        item_counts[name]["revenue"] += float(item.total)

    top_items = sorted(
        [
            {
                "name":    name,
                "qty":     data["qty"],
                "revenue": round(data["revenue"], 2),
            }
            for name, data in item_counts.items()
        ],
        key=lambda x: x["qty"],
        reverse=True,
    )[:10]

    # ── Unpaid invoices ───────────────────────────────────────────────────────
    unpaid = [
        {
            "id":           inv.id,
            "invoice_number": inv.invoice_number,
            "buyer_name":   inv.buyer_name,
            "total":        float(inv.total),
            "status":       inv.status,
            "days_ago":     (now - inv.created_at).days,
            "created_at":   inv.created_at.isoformat(),
        }
        for inv in invoices
        if inv.status in ("draft", "sent")
    ]
    unpaid.sort(key=lambda x: x["days_ago"], reverse=True)

    # ── Top customers ─────────────────────────────────────────────────────────
    customer_spend = defaultdict(lambda: {"total": 0.0, "visits": 0})
    for inv in invoices:
        name = inv.buyer_name or "Walk-in"
        customer_spend[name]["total"]  += float(inv.total)
        customer_spend[name]["visits"] += 1

    top_customers = sorted(
        [
            {
                "name":   name,
                "total":  round(data["total"], 2),
                "visits": data["visits"],
            }
            for name, data in customer_spend.items()
        ],
        key=lambda x: x["total"],
        reverse=True,
    )[:8]
    
    # ── Peak sales by hour ────────────────────────────────────────────────────
    from collections import Counter
    def fmt_hour(h):
        suffix  = "AM" if h < 12 else "PM"
        display = h if h <= 12 else h - 12
        display = 12 if display == 0 else display
        return f"{display}{suffix}"

    # Get ALL invoices for hour analysis (not filtered by period)
    all_vendor_invoices = (
        db.query(models.Invoice)
        .filter(models.Invoice.vendor_id == vendor.id)
        .all()
    )   

    hour_counts = Counter(inv.created_at.hour for inv in all_vendor_invoices)
    hour_revenue = defaultdict(float)
    for inv in all_vendor_invoices:
        hour_revenue[inv.created_at.hour] += float(inv.total)

    hourly_chart = [
        {
            "hour":    h,
            "label":   fmt_hour(h),
            "count":   hour_counts.get(h, 0),
            "revenue": round(hour_revenue.get(h, 0), 2),
        }
        for h in range(24)
        if hour_counts.get(h, 0) > 0
    ]

    # ── Growth vs previous period ─────────────────────────────────────────────
    period_days = {
        "today": 1, "week": 7, "month": 30, "all": 3650
    }.get(period, 30)

    prev_start = start_date - timedelta(days=period_days)
    prev_invoices = (
        db.query(models.Invoice)
        .filter(
            models.Invoice.vendor_id == vendor.id,
            models.Invoice.created_at >= prev_start,
            models.Invoice.created_at < start_date,
        )
        .all()
    )
    prev_revenue  = sum(float(i.total) for i in prev_invoices)
    prev_count    = len(prev_invoices)

    growth = {
        "revenue_pct": round(
            ((total_revenue - prev_revenue) / prev_revenue * 100)
            if prev_revenue > 0 else 0, 1
        ),
        "invoices_pct": round(
            ((total_invoices - prev_count) / prev_count * 100)
            if prev_count > 0 else 0, 1
        ),
        "prev_revenue":  round(prev_revenue, 2),
        "prev_invoices": prev_count,
    }
    # ── Customer retention — new vs returning ─────────────────────────────────
    # Split period in half to compare first half vs second half
    mid_point = start_date + (now - start_date) / 2

    # Customers who first appeared BEFORE this period = returning
    # Customers who first appeared IN this period = new
    all_time_customers = {}
    for inv in (
        db.query(models.Invoice)
        .filter(
            models.Invoice.vendor_id == vendor.id,
            models.Invoice.created_at < start_date,
        )
        .all()
    ):
        name = inv.buyer_name
        if name and name != "Customer":
            all_time_customers[name] = True

    new_this_period      = set()
    returning_this_period = set()
    for inv in invoices:
        name = inv.buyer_name
        if not name or name == "Customer":
            continue
        if name in all_time_customers:
            returning_this_period.add(name)
        else:
            new_this_period.add(name)

    # Churn — customers seen before but not in this period
    churned_customers = []
    for name in all_time_customers:
        last_seen = max(
            (inv.created_at for inv in all_invoices
             if inv.buyer_name == name),
            default=None
        )
        if last_seen:
            days_away = (now - last_seen).days
            visits    = sum(
                1 for inv in all_invoices
                if inv.buyer_name == name
            )
            if days_away >= 7 and visits >= 2:
                churned_customers.append({
                    "name":     name,
                    "days_ago": days_away,
                    "visits":   visits,
                })

    churned_customers.sort(key=lambda x: x["days_ago"], reverse=True)

    retention = {
        "new_count":       len(new_this_period),
        "returning_count": len(returning_this_period),
        "new_customers":   list(new_this_period)[:5],
        "churned":         churned_customers[:5],
    }

    return {
        "period": period,
        "summary": {
            "total_revenue":  round(total_revenue, 2),
            "total_invoices": total_invoices,
            "avg_bill":       avg_bill,
            "paid_revenue":   round(paid_revenue, 2),
            "unpaid_revenue": round(unpaid_revenue, 2),
        },
        "revenue_chart":  revenue_chart,
        "top_items":      top_items,
        "top_customers":  top_customers,
        "unpaid_invoices": unpaid[:10],
        "hourly_chart":    hourly_chart,   
        "growth":          growth,        
        "retention":       retention, 
    }

@router.get("/analytics/insights")
def get_insights(
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor),
):
    """Generates human-readable insights from vendor's invoice data"""

    from datetime import timezone
    now        = datetime.now(timezone.utc)
    week_ago   = now - timedelta(days=7)
    prev_week  = now - timedelta(days=14)
    month_ago  = now - timedelta(days=30)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # ── Fetch data ────────────────────────────────────────────────────────────
    all_invoices = (
        db.query(models.Invoice)
        .filter(models.Invoice.vendor_id == vendor.id)
        .order_by(models.Invoice.created_at.desc())
        .all()
    )

    if not all_invoices:
        return {"insights": [], "score": 0}

    all_ids = [inv.id for inv in all_invoices]
    all_items = (
        db.query(models.InvoiceItem)
        .filter(models.InvoiceItem.invoice_id.in_(all_ids))
        .all()
    )

    # ── Split by period ───────────────────────────────────────────────────────
    this_week_inv  = [i for i in all_invoices if i.created_at >= week_ago]
    prev_week_inv  = [i for i in all_invoices
                      if prev_week <= i.created_at < week_ago]
    this_month_inv = [i for i in all_invoices if i.created_at >= month_ago]
    today_inv      = [i for i in all_invoices if i.created_at >= today_start]

    this_week_rev  = sum(float(i.total) for i in this_week_inv)
    prev_week_rev  = sum(float(i.total) for i in prev_week_inv)
    today_rev      = sum(float(i.total) for i in today_inv)

    insights = []

    # ── Insight 1 — Revenue growth ────────────────────────────────────────────
    if prev_week_rev > 0:
        growth = ((this_week_rev - prev_week_rev) / prev_week_rev) * 100
        if growth > 0:
            insights.append({
                "type":    "positive",
                "icon":    "trending_up",
                "title":   f"Revenue up {round(growth)}% this week",
                "detail":  f"₹{round(this_week_rev):,} vs ₹{round(prev_week_rev):,} last week",
            })
        elif growth < -10:
            insights.append({
                "type":    "warning",
                "icon":    "trending_down",
                "title":   f"Revenue down {abs(round(growth))}% this week",
                "detail":  f"₹{round(this_week_rev):,} vs ₹{round(prev_week_rev):,} last week",
            })
    elif this_week_rev > 0:
        insights.append({
            "type":   "positive",
            "icon":   "trending_up",
            "title":  f"₹{round(this_week_rev):,} revenue this week",
            "detail": "Keep it up!",
        })

    # ── Insight 2 — Today's performance ──────────────────────────────────────
    if today_rev > 0:
        insights.append({
            "type":   "info",
            "icon":   "today",
            "title":  f"₹{round(today_rev):,} collected today",
            "detail": f"{len(today_inv)} invoice{'s' if len(today_inv) != 1 else ''} so far",
        })

    # ── Insight 3 — Peak sales hour ───────────────────────────────────────────
    if len(all_invoices) >= 5:
        from collections import Counter
        hour_counts = Counter(
            inv.created_at.hour for inv in all_invoices
        )
        peak_hour = hour_counts.most_common(1)[0][0]
        peak_count = hour_counts[peak_hour]

        # Format hour nicely
        def fmt_hour(h):
            suffix = "AM" if h < 12 else "PM"
            display = h if h <= 12 else h - 12
            display = 12 if display == 0 else display
            return f"{display} {suffix}"

        insights.append({
            "type":   "info",
            "icon":   "clock",
            "title":  f"Peak sales at {fmt_hour(peak_hour)}",
            "detail": f"{peak_count} invoices typically at this hour",
        })

    # ── Insight 4 — Best selling item ────────────────────────────────────────
    if all_items:
        from collections import defaultdict
        item_qty = defaultdict(int)
        for item in all_items:
            item_qty[item.product_name] += item.qty
        top_item = max(item_qty, key=item_qty.get)
        insights.append({
            "type":   "info",
            "icon":   "star",
            "title":  f"{top_item} is your best seller",
            "detail": f"{item_qty[top_item]} units sold overall",
        })

    # ── Insight 5 — Customer churn detection ──────────────────────────────────
    # Find customers who used to visit regularly but haven't recently
    customer_last_visit = {}
    customer_visit_count = {}
    for inv in all_invoices:
        name = inv.buyer_name
        if name and name != "Customer":
            if name not in customer_last_visit:
                customer_last_visit[name] = inv.created_at
                customer_visit_count[name] = 1
            else:
                customer_visit_count[name] += 1

    # Regular customers (3+ visits) who haven't been in 7+ days
    churned = []
    for name, last in customer_last_visit.items():
        days_away = (now - last).days
        if customer_visit_count[name] >= 3 and days_away >= 7:
            churned.append((name, days_away))

    churned.sort(key=lambda x: x[1], reverse=True)
    if churned:
        names = ", ".join(c[0] for c in churned[:2])
        verb = "haven't" if len(churned) > 1 else "hasn't"

        insights.append({
            "type":   "warning",
            "icon":   "user_x",
            "title":  f"{len(churned)} regular customer{'s' if len(churned) > 1 else ''} missing",
            "detail": f"{names} {verb} visited in {churned[0][1]}+ days",
        })

    # ── Insight 6 — Unpaid invoice alert ──────────────────────────────────────
    overdue = [
        inv for inv in all_invoices
        if inv.status in ("draft", "sent") and
           (now - inv.created_at).days >= 7
    ]
    if overdue:
        total_overdue = sum(float(inv.total) for inv in overdue)
        insights.append({
            "type":   "danger",
            "icon":   "alert",
            "title":  f"₹{round(total_overdue):,} overdue",
            "detail": f"{len(overdue)} invoice{'s' if len(overdue) > 1 else ''} unpaid for 7+ days",
        })

    # ── Insight 7 — Basket analysis ───────────────────────────────────────────
    # Find items frequently bought together
    invoice_item_map = defaultdict(list)
    for item in all_items:
        invoice_item_map[item.invoice_id].append(item.product_name)

    pair_counts = defaultdict(int)
    for invoice_id, items_list in invoice_item_map.items():
        unique_items = list(set(items_list))
        for idx in range(len(unique_items)):
            for jdx in range(idx + 1, len(unique_items)):
                pair = tuple(sorted([unique_items[idx], unique_items[jdx]]))
                pair_counts[pair] += 1

    if pair_counts:
        top_pair = max(pair_counts, key=pair_counts.get)
        top_pair_count = pair_counts[top_pair]
        if top_pair_count >= 2:
            insights.append({
                "type":   "info",
                "icon":   "basket",
                "title":  f"{top_pair[0]} + {top_pair[1]} bought together",
                "detail": f"Happened {top_pair_count} times — consider bundling",
            })

    # ── Insight 8 — New vs returning customers ────────────────────────────────
    this_month_customers = set(
        inv.buyer_name for inv in this_month_inv
        if inv.buyer_name and inv.buyer_name != "Customer"
    )
    prev_customers = set(
        inv.buyer_name for inv in all_invoices
        if inv.created_at < month_ago and
           inv.buyer_name and inv.buyer_name != "Customer"
    )
    new_customers = this_month_customers - prev_customers

    if new_customers:
        insights.append({
            "type":   "positive",
            "icon":   "user_plus",
            "title":  f"{len(new_customers)} new customer{'s' if len(new_customers) > 1 else ''} this month",
            "detail": ", ".join(list(new_customers)[:3]),
        })

    # ── Business health score (0-100) ────────────────────────────────────────
    score = 50  # base
    if this_week_rev > prev_week_rev: score += 15
    if today_rev > 0: score += 10
    if not overdue: score += 10
    if not churned: score += 10
    if new_customers: score += 5
    score = min(score, 100)

    return {
        "insights": insights,
        "score":    score,
        "growth": {
            "this_week_rev": round(this_week_rev, 2),
            "prev_week_rev": round(prev_week_rev, 2),
            "pct_change": round(
                ((this_week_rev - prev_week_rev) / prev_week_rev * 100)
                if prev_week_rev > 0 else 0, 1
            ),
        }
    }
    
@router.get("/analytics/credit")
def get_credit_analysis(
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor),
):
    """Credit behavior per customer — udhaar tracking"""

    from datetime import timezone
    now = datetime.now(timezone.utc)

    invoices = (
        db.query(models.Invoice)
        .filter(models.Invoice.vendor_id == vendor.id)
        .order_by(models.Invoice.created_at.desc())
        .all()
    )

    from collections import defaultdict
    customer_data = defaultdict(lambda: {
        "total_billed":  0.0,
        "total_unpaid":  0.0,
        "invoice_count": 0,
        "unpaid_count":  0,
        "days_list":     [],
        "last_visit":    None,
    })

    for inv in invoices:
        name = inv.buyer_name
        if not name or name == "Customer":
            continue

        days_pending = (now - inv.created_at).days
        customer_data[name]["total_billed"]  += float(inv.total)
        customer_data[name]["invoice_count"] += 1

        if inv.status in ("draft", "sent"):
            customer_data[name]["total_unpaid"] += float(inv.total)
            customer_data[name]["unpaid_count"] += 1
            customer_data[name]["days_list"].append(days_pending)

        if (customer_data[name]["last_visit"] is None or
                inv.created_at > customer_data[name]["last_visit"]):
            customer_data[name]["last_visit"] = inv.created_at

    result = []
    for name, data in customer_data.items():
        avg_delay = (
            round(sum(data["days_list"]) / len(data["days_list"]))
            if data["days_list"] else 0
        )

        # Risk score — green / yellow / red
        if avg_delay == 0 and data["unpaid_count"] == 0:
            risk = "low"
        elif avg_delay <= 7 or data["total_unpaid"] < 200:
            risk = "medium"
        else:
            risk = "high"

        result.append({
            "name":          name,
            "total_billed":  round(data["total_billed"], 2),
            "total_unpaid":  round(data["total_unpaid"], 2),
            "invoice_count": data["invoice_count"],
            "unpaid_count":  data["unpaid_count"],
            "avg_delay_days": avg_delay,
            "risk":          risk,
            "last_visit":    data["last_visit"].isoformat()
                             if data["last_visit"] else None,
        })

    result.sort(key=lambda x: x["total_unpaid"], reverse=True)

    return {
        "customers":       result,
        "total_credit_out": round(
            sum(r["total_unpaid"] for r in result), 2
        ),
        "high_risk_count":  sum(1 for r in result if r["risk"] == "high"),
    }
    
from pydantic import BaseModel
from typing import List

class GSTLookupRequest(BaseModel):
    items: List[str]

@router.post("/gst/lookup")
def lookup_gst(
    request: GSTLookupRequest,
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor),
):
    result = []
    for item_name in request.items:
        info = get_gst_info(item_name)
        result.append({
            "name":     item_name,
            "gst_rate": info["gst_rate"],
            "hsn_code": info["hsn_code"],
            "category": info["category"],
            "matched":  info["matched"],
        })
    return result


@router.get("/analytics/gst-summary")
def get_gst_summary(
    period: str = "month",
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor),
):
    """Monthly GST summary for GSTR-1 filing"""
    from datetime import timezone
    now = datetime.now(timezone.utc)

    if period == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:
        start_date = datetime(2000, 1, 1, tzinfo=timezone.utc)

    invoices = (
        db.query(models.Invoice)
        .filter(
            models.Invoice.vendor_id == vendor.id,
            models.Invoice.created_at >= start_date,
        )
        .all()
    )

    # Group by GST rate slab
    from collections import defaultdict
    slab_data = defaultdict(lambda: {
        "taxable_amount": 0.0,
        "cgst":           0.0,
        "sgst":           0.0,
        "total_gst":      0.0,
        "invoice_count":  0,
    })

    total_taxable = 0.0
    total_cgst    = 0.0
    total_sgst    = 0.0

    for inv in invoices:
        rate      = inv.gst_rate
        breakdown = get_gst_breakdown(float(inv.subtotal), rate)
        slab      = f"{rate}%"

        slab_data[slab]["taxable_amount"] += float(inv.subtotal)
        slab_data[slab]["cgst"]           += breakdown["cgst"]
        slab_data[slab]["sgst"]           += breakdown["sgst"]
        slab_data[slab]["total_gst"]      += breakdown["total_gst"]
        slab_data[slab]["invoice_count"]  += 1

        total_taxable += float(inv.subtotal)
        total_cgst    += breakdown["cgst"]
        total_sgst    += breakdown["sgst"]

    slabs = [
        {
            "rate":           rate,
            "taxable_amount": round(data["taxable_amount"], 2),
            "cgst":           round(data["cgst"], 2),
            "sgst":           round(data["sgst"], 2),
            "total_gst":      round(data["total_gst"], 2),
            "invoice_count":  data["invoice_count"],
        }
        for rate, data in sorted(slab_data.items())
    ]

    return {
        "period":        period,
        "slabs":         slabs,
        "total_taxable": round(total_taxable, 2),
        "total_cgst":    round(total_cgst, 2),
        "total_sgst":    round(total_sgst, 2),
        "total_gst":     round(total_cgst + total_sgst, 2),
        "grand_total":   round(total_taxable + total_cgst + total_sgst, 2),
    }


@router.get("/analytics/gstr1-export")
def export_gstr1(
    period: str = "month",
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor),
):
    """Export GSTR-1 compatible CSV data"""
    from datetime import timezone
    from fastapi.responses import StreamingResponse
    import csv
    import io

    now = datetime.now(timezone.utc)

    if period == "month":
        start_date = now - timedelta(days=30)
    elif period == "week":
        start_date = now - timedelta(days=7)
    else:
        start_date = datetime(2000, 1, 1, tzinfo=timezone.utc)

    invoices = (
        db.query(models.Invoice)
        .filter(
            models.Invoice.vendor_id == vendor.id,
            models.Invoice.created_at >= start_date,
        )
        .order_by(models.Invoice.created_at.asc())
        .all()
    )

    # Build CSV
    output = io.StringIO()
    writer = csv.writer(output)

    # GSTR-1 B2C header format
    writer.writerow([
        "Invoice Number", "Invoice Date", "Customer Name",
        "Taxable Amount", "GST Rate", "CGST", "SGST",
        "Total Amount", "Status"
    ])

    for inv in invoices:
        breakdown = get_gst_breakdown(float(inv.subtotal), inv.gst_rate)
        writer.writerow([
            inv.invoice_number,
            inv.created_at.strftime("%d-%m-%Y"),
            inv.buyer_name or "Consumer",
            inv.subtotal,
            f"{inv.gst_rate}%",
            breakdown["cgst"],
            breakdown["sgst"],
            inv.total,
            inv.status.upper(),
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=GSTR1_{period}.csv"
        }
    )