from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import hash_password, verify_password, create_access_token
from customer_auth import get_current_customer
import models, schemas

router = APIRouter(prefix="/customers", tags=["customers"])


@router.post("/register", response_model=schemas.CustomerToken)
def register_customer(
    data: schemas.CustomerRegister,
    db: Session = Depends(get_db),
):
    # Check phone unique
    if db.query(models.Customer).filter(
        models.Customer.phone == data.phone
    ).first():
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered"
        )

    customer = models.Customer(
        name          = data.name,
        phone         = data.phone,
        email         = data.email,
        password_hash = hash_password(data.password),
    )
    db.add(customer)
    db.flush()

    # Auto-attach pending invoices by phone
    pending_links = db.query(models.PendingInvoiceLink).filter(
        models.PendingInvoiceLink.phone == data.phone
    ).all()

    for pending in pending_links:
        already = db.query(models.CustomerInvoice).filter(
            models.CustomerInvoice.invoice_id  == pending.invoice_id,
            models.CustomerInvoice.customer_id == customer.id,
        ).first()
        if not already:
            link = models.CustomerInvoice(
                invoice_id  = pending.invoice_id,
                customer_id = customer.id,
            )
            db.add(link)
            invoice = db.query(models.Invoice).filter(
                models.Invoice.id == pending.invoice_id
            ).first()
            if invoice:
                invoice.status = "sent"
        db.delete(pending)

    db.commit()
    db.refresh(customer)

    token = create_access_token({"sub": customer.id, "role": "customer"})
    return {
        "access_token": token,
        "token_type":   "bearer",
        "customer":     customer,
    }


@router.post("/login", response_model=schemas.CustomerToken)
def login_customer(
    data: schemas.CustomerLogin,
    db: Session = Depends(get_db),
):
    # Login by phone
    customer = db.query(models.Customer).filter(
        models.Customer.phone == data.phone
    ).first()

    if not customer or not verify_password(
        data.password, customer.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid phone number or password"
        )

    token = create_access_token({"sub": customer.id, "role": "customer"})
    return {
        "access_token": token,
        "token_type":   "bearer",
        "customer":     customer,
    }


@router.get("/me", response_model=schemas.CustomerOut)
def get_me(
    customer: models.Customer = Depends(get_current_customer),
):
    return customer


@router.get("/invoices", response_model=List[schemas.InvoiceOut])
def get_my_invoices(
    db: Session = Depends(get_db),
    customer: models.Customer = Depends(get_current_customer),
):
    from sqlalchemy.orm import joinedload
    links = (
        db.query(models.CustomerInvoice)
        .filter(models.CustomerInvoice.customer_id == customer.id)
        .order_by(models.CustomerInvoice.created_at.desc())
        .all()
    )
    invoice_ids = [link.invoice_id for link in links]
    if not invoice_ids:
        return []

    invoices = (
        db.query(models.Invoice)
        .options(joinedload(models.Invoice.items))
        .filter(models.Invoice.id.in_(invoice_ids))
        .all()
    )
    return sorted(invoices, key=lambda x: x.created_at, reverse=True)


@router.get("/analytics")
def get_customer_analytics(
    period: str = "month",
    db: Session = Depends(get_db),
    customer: models.Customer = Depends(get_current_customer),
):
    from datetime import datetime, timedelta, timezone
    from collections import defaultdict

    now = datetime.now(timezone.utc)

    if period == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:
        start_date = datetime(2000, 1, 1, tzinfo=timezone.utc)

    links = db.query(models.CustomerInvoice).filter(
        models.CustomerInvoice.customer_id == customer.id
    ).all()
    invoice_ids = [link.invoice_id for link in links]

    if not invoice_ids:
        return {
            "period": period,
            "summary": {
                "total_spent": 0, "total_invoices": 0,
                "avg_bill": 0, "this_month": 0,
            },
            "spend_chart": [], "top_items": [],
            "vendor_breakdown": [], "category_spend": [],
        }

    from sqlalchemy.orm import joinedload
    invoices = (
        db.query(models.Invoice)
        .options(joinedload(models.Invoice.items))
        .filter(
            models.Invoice.id.in_(invoice_ids),
            models.Invoice.created_at >= start_date,
        )
        .all()
    )

    all_items = []
    for inv in invoices:
        all_items.extend(inv.items)

    total_spent    = sum(float(inv.total) for inv in invoices)
    total_invoices = len(invoices)
    avg_bill       = round(total_spent / total_invoices, 2) if total_invoices else 0

    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    all_invoices_month = (
        db.query(models.Invoice)
        .filter(
            models.Invoice.id.in_(invoice_ids),
            models.Invoice.created_at >= month_start,
        ).all()
    )
    this_month = sum(float(inv.total) for inv in all_invoices_month)

    daily_spend = defaultdict(float)
    for inv in invoices:
        day = inv.created_at.strftime("%Y-%m-%d")
        daily_spend[day] += float(inv.total)

    if invoices:
        from datetime import date as date_type
        first = invoices[0].created_at.date()
        last  = now.date()
        curr  = first
        while curr <= last:
            day_str = curr.strftime("%Y-%m-%d")
            if day_str not in daily_spend:
                daily_spend[day_str] = 0
            curr += timedelta(days=1)

    spend_chart = [
        {
            "date":  day,
            "spend": round(daily_spend[day], 2),
            "label": datetime.strptime(day, "%Y-%m-%d").strftime("%d %b"),
        }
        for day in sorted(daily_spend.keys())
    ]

    item_counts = defaultdict(lambda: {"qty": 0, "spend": 0.0})
    for item in all_items:
        item_counts[item.product_name]["qty"]   += item.qty
        item_counts[item.product_name]["spend"] += float(item.total)

    top_items = sorted(
        [{"name": n, "qty": d["qty"], "spend": round(d["spend"], 2)}
         for n, d in item_counts.items()],
        key=lambda x: x["qty"], reverse=True
    )[:10]

    vendor_spend = defaultdict(lambda: {"total": 0.0, "visits": 0, "shop_name": ""})
    for inv in invoices:
        vendor = db.query(models.Vendor).filter(
            models.Vendor.id == inv.vendor_id
        ).first()
        shop_name = vendor.shop_name if vendor else "Unknown Shop"
        vendor_spend[inv.vendor_id]["shop_name"] = shop_name
        vendor_spend[inv.vendor_id]["total"]     += float(inv.total)
        vendor_spend[inv.vendor_id]["visits"]    += 1

    vendor_breakdown = sorted(
        [{"name": d["shop_name"], "total": round(d["total"], 2), "visits": d["visits"]}
         for d in vendor_spend.values()],
        key=lambda x: x["total"], reverse=True
    )

    CATEGORY_KEYWORDS = {
        "Snacks":    ["lays", "chips", "kurkure", "bhujia"],
        "Beverages": ["pepsi", "coke", "sprite", "bisleri", "water", "juice",
                      "frooti", "maaza", "thums"],
        "Chocolate": ["dairy milk", "kitkat", "5 star", "munch", "chocolate"],
        "Biscuits":  ["parle", "oreo", "monaco", "hide seek", "britannia"],
        "Instant":   ["maggi", "noodles", "yippee"],
        "Personal":  ["soap", "shampoo", "colgate", "toothpaste", "dove"],
        "Household": ["surf", "ariel", "tide", "vim", "harpic"],
        "Dairy":     ["milk", "butter", "cheese", "curd", "dahi", "amul"],
        "Staples":   ["rice", "atta", "oil", "salt", "tea", "coffee"],
    }

    category_totals = defaultdict(float)
    for item in all_items:
        name_lower = item.product_name.lower()
        matched    = False
        for category, keywords in CATEGORY_KEYWORDS.items():
            if any(kw in name_lower for kw in keywords):
                category_totals[category] += float(item.total)
                matched = True
                break
        if not matched:
            category_totals["Other"] += float(item.total)

    total_cat = sum(category_totals.values()) or 1
    category_spend = sorted(
        [{"category": cat, "amount": round(amt, 2),
          "pct": round((amt / total_cat) * 100, 1)}
         for cat, amt in category_totals.items() if amt > 0],
        key=lambda x: x["amount"], reverse=True
    )

    return {
        "period": period,
        "summary": {
            "total_spent":    round(total_spent, 2),
            "total_invoices": total_invoices,
            "avg_bill":       avg_bill,
            "this_month":     round(this_month, 2),
        },
        "spend_chart":      spend_chart,
        "top_items":        top_items,
        "vendor_breakdown": vendor_breakdown,
        "category_spend":   category_spend,
    }