from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime      # <-- asegúrate de importar Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Product(Base):
    __tablename__ = "products"

    id       = Column(Integer, primary_key=True, index=True)
    name     = Column(String(120), nullable=False)
    sku      = Column(String(60), unique=True, nullable=False)
    price    = Column(Numeric(10, 2), nullable=False)         # precio venta
    cost     = Column(Numeric(10, 2), nullable=False, default=0)  # costo compra
    stock    = Column(Integer, default=0)
    category = Column(String(60), nullable=True)       

class Sale(Base):
    __tablename__ = "sales"
    id        = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    total     = Column(Numeric(10, 2), nullable=False)
    cost      = Column(Numeric(10, 2), nullable=False, default=0)  # 👈 AÑADIR ESTA LÍNEA
    items     = relationship("SaleItem", back_populates="sale")

class SaleItem(Base):
    __tablename__ = "sale_items"
    id = Column(Integer, primary_key=True)
    sale_id = Column(Integer, ForeignKey("sales.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    subtotal = Column(Numeric(10,2))
    cost_total = Column(Numeric(10,2), default=0)  # 👈 NUEVO

    sale = relationship("Sale", back_populates="items")
    product = relationship("Product")