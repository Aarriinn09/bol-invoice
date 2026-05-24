from sqlalchemy import (
    Column, String, Text, Integer, Numeric,
    Boolean, DateTime, ForeignKey, ARRAY
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


def gen_uuid():
    return str(uuid.uuid4())


class Vendor(Base):
    __tablename__ = "vendors"

    id            = Column(String, primary_key=True, default=gen_uuid)
    shop_name     = Column(String, nullable=False)
    phone         = Column(String, unique=True, nullable=False)  # ← unique + required
    email         = Column(String, unique=True, nullable=True)   # ← optional
    password_hash = Column(String, nullable=False)
    gstin         = Column(String, nullable=True)
    address       = Column(Text, nullable=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    products = relationship("Product", back_populates="vendor", cascade="all, delete")
    invoices = relationship("Invoice", back_populates="vendor", cascade="all, delete")


class Product(Base):
    __tablename__ = "products"

    id            = Column(String, primary_key=True, default=gen_uuid)
    vendor_id     = Column(String, ForeignKey("vendors.id"), nullable=False)
    name          = Column(String, nullable=False)
    aliases       = Column(ARRAY(Text), default=[])
    category      = Column(String, default="custom")
    default_price = Column(Numeric(10, 2), default=0)
    is_global     = Column(Boolean, default=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    vendor = relationship("Vendor", back_populates="products")
    variants = relationship(
      "ProductVariant", back_populates="product", cascade="all, delete"
    )


class Invoice(Base):
    __tablename__ = "invoices"

    id             = Column(String, primary_key=True, default=gen_uuid)
    invoice_number = Column(String, nullable=False)
    vendor_id      = Column(String, ForeignKey("vendors.id"), nullable=False)
    buyer_name     = Column(String, default="Customer")
    buyer_phone    = Column(String, nullable=True)
    subtotal       = Column(Numeric(10, 2), default=0)
    gst_rate       = Column(Integer, default=0)
    gst_amount     = Column(Numeric(10, 2), default=0)
    total          = Column(Numeric(10, 2), default=0)
    status         = Column(String, default="draft")
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    vendor = relationship("Vendor", back_populates="invoices")
    items  = relationship("InvoiceItem", back_populates="invoice",
                          cascade="all, delete")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id           = Column(String, primary_key=True, default=gen_uuid)
    invoice_id   = Column(String, ForeignKey("invoices.id"), nullable=False)
    product_name = Column(String, nullable=False)
    qty          = Column(Integer, default=1)
    unit         = Column(String, nullable=True)
    price        = Column(Numeric(10, 2), nullable=False)
    total        = Column(Numeric(10, 2), nullable=False)

    invoice = relationship("Invoice", back_populates="items")


class Customer(Base):
    __tablename__ = "customers"

    id            = Column(String, primary_key=True, default=gen_uuid)
    name          = Column(String, nullable=True)
    phone         = Column(String, unique=True, nullable=False)  # ← unique + required
    email         = Column(String, unique=True, nullable=True)   # ← optional
    password_hash = Column(String, nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    received_invoices = relationship(
        "CustomerInvoice", back_populates="customer", cascade="all, delete"
    )

class CustomerInvoice(Base):
    __tablename__ = "customer_invoices"

    id          = Column(String, primary_key=True, default=gen_uuid)
    invoice_id  = Column(String, ForeignKey("invoices.id"), nullable=False)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    seen_at     = Column(DateTime(timezone=True), nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("Customer", back_populates="received_invoices")
    invoice  = relationship("Invoice")

class PendingInvoiceLink(Base):
    __tablename__ = "pending_invoice_links"

    id             = Column(String, primary_key=True, default=gen_uuid)
    invoice_id     = Column(String, ForeignKey("invoices.id"), nullable=False)
    email          = Column(String, nullable=True)
    phone          = Column(String, nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    invoice = relationship("Invoice")
    

class ProductVariant(Base):
    __tablename__ = "product_variants"

    id         = Column(String, primary_key=True, default=gen_uuid)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    label      = Column(String, nullable=False)   # e.g. "26g", "52g", "1kg"
    price      = Column(Numeric(10, 2), default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="variants")
    