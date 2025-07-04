from datetime import datetime
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import DeclarativeBase, relationship
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable


class Base(DeclarativeBase):
    pass

class User(Base, SQLAlchemyBaseUserTable[int]):
    __tablename__ = "user"  # ← forzamos nombre que espera el sistema
    id = Column(Integer, primary_key=True)  # ← forzamos PK

    products = relationship("Product", back_populates="owner", cascade="all, delete-orphan")
    sales    = relationship("Sale", back_populates="owner", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"
    id        = Column(Integer, primary_key=True)
    name      = Column(String,  nullable=False)
    sku       = Column(String,  unique=True, nullable=False)
    price     = Column(Numeric(10, 2), nullable=False)
    cost      = Column(Numeric(10, 2), default=0)
    stock     = Column(Integer, default=0)
    category  = Column(String,  nullable=True)
    image_url = Column(String,  nullable=True)
    user_id   = Column(Integer, ForeignKey("user.id"))
    owner     = relationship("User", back_populates="products")

class Sale(Base):
    __tablename__ = "sales"
    id        = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    total     = Column(Numeric(10, 2), nullable=False)
    cost      = Column(Numeric(10, 2), default=0)
    user_id   = Column(Integer, ForeignKey("user.id"))
    items     = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")
    owner     = relationship("User", back_populates="sales")

class SaleItem(Base):
    __tablename__ = "sale_items"
    id         = Column(Integer, primary_key=True)
    sale_id    = Column(Integer, ForeignKey("sales.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity   = Column(Integer, nullable=False)
    subtotal   = Column(Numeric(10, 2), nullable=False)
    cost_total = Column(Numeric(10, 2), default=0)
    sale       = relationship("Sale", back_populates="items")
    product    = relationship("Product")
