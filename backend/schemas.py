from pydantic import BaseModel
from decimal import Decimal
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    sku: str
    price: Decimal
    stock: int
    category: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int

    class Config:
        orm_mode = True

class SaleItemIn(BaseModel):
    product_id: int
    quantity: int

class SaleIn(BaseModel):
    items: list[SaleItemIn]

class SaleOut(BaseModel):
    id: int
    timestamp: datetime
    total: Decimal

    class Config:
        orm_mode = True