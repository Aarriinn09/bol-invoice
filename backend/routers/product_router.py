from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_vendor
import models
import schemas

router = APIRouter(prefix="/products", tags=["products"])


def generate_aliases(name: str) -> List[str]:
    """Auto-generate aliases from product name — vendor never sees this"""
    base  = name.lower().strip()
    words = base.split()
    aliases = [base]

    for word in words:
        if len(word) > 3 and word not in aliases:
            aliases.append(word)

    if len(words) > 1:
        aliases.append(''.join(words))

    if len(words) > 2:
        aliases.append(f"{words[0]} {words[-1]}")

    return aliases


@router.get("/", response_model=List[schemas.ProductOut])
def get_products(
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor),
):
    return db.query(models.Product).filter(
        models.Product.vendor_id == vendor.id
    ).order_by(models.Product.created_at.desc()).all()


@router.post("/", response_model=schemas.ProductOut)
def add_product(
    product_data: schemas.ProductCreate,
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor),
):
    # Check duplicate for this vendor
    existing = db.query(models.Product).filter(
        models.Product.vendor_id == vendor.id,
        models.Product.name.ilike(product_data.name)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product already exists")

    # Auto-generate aliases — vendor just types name + price
    aliases = generate_aliases(product_data.name)

    product = models.Product(
        vendor_id     = vendor.id,
        name          = product_data.name.strip(),
        aliases       = aliases,
        category      = product_data.category or "custom",
        default_price = product_data.default_price or 0,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor),
):
    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.vendor_id == vendor.id,
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": "Deleted"}