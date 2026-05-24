from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────
class VendorRegister(BaseModel):
    shop_name: str
    phone:     str           # ← required now
    password:  str
    email:     Optional[str] = None   # ← optional
    gstin:     Optional[str] = None
    address:   Optional[str] = None


class VendorLogin(BaseModel):
    phone:    str            # ← phone instead of email
    password: str

class VendorOut(BaseModel):
    id:         str
    shop_name:  str
    email:      Optional[str]
    phone:      Optional[str]
    gstin:      Optional[str]
    address:    Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type:   str
    vendor:       VendorOut


# ── Products ──────────────────────────────────────────────────────────────────
class ProductCreate(BaseModel):
    name: str
    default_price: Optional[float] = 0
    category: Optional[str] = "custom"
    aliases: Optional[List[str]] = []


class ProductOut(BaseModel):
    id: str
    name: str
    aliases: List[str]
    category: str
    default_price: float
    created_at: datetime

    class Config:
        from_attributes = True


# ── Invoices ──────────────────────────────────────────────────────────────────
class InvoiceItemIn(BaseModel):
    product_name: str
    qty: int
    unit: Optional[str] = None
    price: float
    total: float


class InvoiceSave(BaseModel):
    invoice_number: str
    buyer_name: Optional[str] = "Customer"
    buyer_phone: Optional[str] = None
    items: List[InvoiceItemIn]
    subtotal: float
    gst_rate: int = 0
    gst_amount: float = 0
    total: float


class InvoiceItemOut(BaseModel):
    id: str
    product_name: str
    qty: int
    unit: Optional[str]
    price: float
    total: float

    class Config:
        from_attributes = True


class InvoiceOut(BaseModel):
    id: str
    invoice_number: str
    buyer_name: str
    buyer_phone: Optional[str]
    subtotal: float
    gst_rate: int
    gst_amount: float
    total: float
    status: str
    created_at: datetime
    items: List[InvoiceItemOut] = []

    class Config:
        from_attributes = True

# ── Customer ──────────────────────────────────────────────────────────────────
class CustomerRegister(BaseModel):
    name:     str
    phone:    str            # ← required
    password: str
    email:    Optional[str] = None   # ← optional


class CustomerLogin(BaseModel):
    phone:    str            # ← phone instead of email
    password: str


class CustomerOut(BaseModel):
    id:         str
    name:       Optional[str]
    email:      Optional[str]
    phone:      Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class CustomerToken(BaseModel):
    access_token: str
    token_type:   str
    customer:     CustomerOut
    
class VendorProfileUpdate(BaseModel):
    gstin: Optional[str] = None
    phone: Optional[str] = None