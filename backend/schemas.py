# backend/schemas.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# -----------------------
# PRODUCTOS
# -----------------------

class ProductCreate(BaseModel):
    name: str
    sku: str
    price: float
    cost: float
    stock: int
    category: Optional[str] = None
    image_url: Optional[str] = None

class ProductOut(ProductCreate):
    id: int

    class Config:
        from_attributes = True

# -----------------------
# VENTAS
# -----------------------

class SaleItemIn(BaseModel):
    product_id: int
    quantity: int

class SaleIn(BaseModel):
    items: List[SaleItemIn]

class SaleItemOut(BaseModel):
    product_id: int
    product_name: str
    unit_price: float
    unit_cost: float
    quantity: int
    subtotal: float
    cost_total: float

class SaleDetailOut(BaseModel):
    id: int
    timestamp: datetime
    total: float
    cost: float
    profit: float
    items: List[SaleItemOut]

class SaleCreateResponse(BaseModel):
    id: int
    total: float
