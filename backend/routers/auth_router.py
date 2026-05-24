from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.Token)
def register(
    vendor_data: schemas.VendorRegister,
    db: Session = Depends(get_db),
):
    # Check phone unique
    if db.query(models.Vendor).filter(
        models.Vendor.phone == vendor_data.phone
    ).first():
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered"
        )

    # Check email unique if provided
    if vendor_data.email and db.query(models.Vendor).filter(
        models.Vendor.email == vendor_data.email
    ).first():
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    vendor = models.Vendor(
        shop_name     = vendor_data.shop_name,
        phone         = vendor_data.phone,
        email         = vendor_data.email,
        password_hash = auth.hash_password(vendor_data.password),
        gstin         = vendor_data.gstin,
        address       = vendor_data.address,
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)

    token = auth.create_access_token({"sub": vendor.id})
    return {"access_token": token, "token_type": "bearer", "vendor": vendor}


@router.post("/login", response_model=schemas.Token)
def login(
    credentials: schemas.VendorLogin,
    db: Session = Depends(get_db),
):
    # Login by phone
    vendor = db.query(models.Vendor).filter(
        models.Vendor.phone == credentials.phone
    ).first()

    if not vendor or not auth.verify_password(
        credentials.password, vendor.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid phone number or password"
        )

    token = auth.create_access_token({"sub": vendor.id})
    return {"access_token": token, "token_type": "bearer", "vendor": vendor}


@router.get("/me", response_model=schemas.VendorOut)
def get_me(
    current_vendor: models.Vendor = Depends(auth.get_current_vendor),
):
    return current_vendor


class VendorProfileUpdate(BaseModel):
    gstin:   Optional[str] = None
    phone:   Optional[str] = None
    email:   Optional[str] = None
    address: Optional[str] = None


@router.patch("/profile", response_model=schemas.VendorOut)
def update_profile(
    data: VendorProfileUpdate,
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(auth.get_current_vendor),
):
    if data.gstin   is not None: vendor.gstin   = data.gstin
    if data.phone   is not None: vendor.phone   = data.phone
    if data.email   is not None: vendor.email   = data.email
    if data.address is not None: vendor.address = data.address
    db.commit()
    db.refresh(vendor)
    return vendor