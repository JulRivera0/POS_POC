from sqlalchemy import Column, Integer, String, Numeric      # <-- asegúrate de importar Numeric
from database import Base

class Product(Base):
    __tablename__ = "products"

    id       = Column(Integer, primary_key=True, index=True)
    name     = Column(String(120),  nullable=False)   # ← aquí
    sku      = Column(String(60),   unique=True, nullable=False)
    price    = Column(Numeric(10, 2), nullable=False)
    stock    = Column(Integer, default=0)
    category = Column(String(60),   nullable=True)

