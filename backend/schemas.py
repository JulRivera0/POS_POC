from pydantic import BaseModel, ConfigDict
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

class SaleItemOut(BaseModel):
    product_id: int
    quantity: int
    subtotal: Decimal
    product_name: str

    class Config:
        orm_mode = True

class SaleDetailOut(BaseModel):
    id: int
    timestamp: datetime
    total: Decimal
    items: list[SaleItemOut]

    model_config = ConfigDict(from_attributes=True)

class SaleItemOut(BaseModel):
    product_id: int               # ← requerido
    product_name: str
    quantity: int
    subtotal: Decimal

    model_config = ConfigDict(from_attributes=True)

class SaleCreateResponse(BaseModel):
    id: int
    total: Decimal