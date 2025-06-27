# backend/schemas.py
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, ConfigDict

# ---------- PRODUCTOS ----------

class ProductBase(BaseModel):
    sku: str
    name: str
    price: Decimal          # Precio de venta
    cost: Decimal           # 👈 Costo unitario de compra
    stock: int
    category: str | None = None

class ProductCreate(ProductBase):
    pass                    # mismo contenido

class ProductOut(ProductBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# ---------- VENTAS ----------

class SaleItemIn(BaseModel):
    product_id: int
    quantity: int

class SaleIn(BaseModel):
    items: list[SaleItemIn]

class SaleCreateResponse(BaseModel):
    id: int
    total: Decimal

# Detalle de cada ítem vendido con costo y precio
class SaleItemOut(BaseModel):
    product_id: int
    product_name: str
    unit_price: Decimal      # Precio venta c/u
    unit_cost:  Decimal      # 👈 Costo c/u
    quantity: int
    subtotal: Decimal        # unit_price * qty
    cost_total: Decimal      # unit_cost  * qty

    model_config = ConfigDict(from_attributes=True)

class SaleDetailOut(BaseModel):
    id: int
    timestamp: datetime
    total: Decimal            # Ingresos
    cost:  Decimal            # 👈 Costo total (sum cost_total)
    profit: Decimal           # total - cost
    items: list[SaleItemOut]

    model_config = ConfigDict(from_attributes=True)
