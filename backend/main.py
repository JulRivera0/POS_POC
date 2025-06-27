# backend/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from decimal import Decimal

import models
import schemas
from database import Base

DATABASE_URL = "sqlite:///./pv.db"  # o tu ruta real

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Punto de Venta")

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- DB dependency ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- PRODUCTOS ----------
@app.get("/products", response_model=list[schemas.ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(models.Product).order_by(models.Product.id).all()

@app.post("/products", response_model=schemas.ProductOut)
def create_product(p: schemas.ProductCreate, db: Session = Depends(get_db)):
    prod = models.Product(**p.dict())
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return prod

@app.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, p: schemas.ProductCreate, db: Session = Depends(get_db)):
    prod = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for k, v in p.dict().items():
        setattr(prod, k, v)
    db.commit()
    db.refresh(prod)
    return prod

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    prod = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(prod)
    db.commit()
    return {"ok": True}

# ---------- CREAR VENTA ----------
@app.post("/sales", response_model=schemas.SaleCreateResponse)
def create_sale(s: schemas.SaleIn, db: Session = Depends(get_db)):
    total = Decimal("0")
    cost = Decimal("0")
    items = []

    for it in s.items:
        prod = db.query(models.Product).filter(models.Product.id == it.product_id).first()
        if not prod:
            raise HTTPException(status_code=404, detail=f"Producto {it.product_id} no existe")
        if prod.stock < it.quantity:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {prod.name}")
        
        prod.stock -= it.quantity

        subtotal = prod.price * it.quantity
        cost_total = prod.cost * it.quantity

        total += subtotal
        cost += cost_total

        items.append(models.SaleItem(
            product_id=prod.id,
            quantity=it.quantity,
            subtotal=subtotal,
            cost_total=cost_total
        ))

    venta = models.Sale(
        timestamp=datetime.utcnow(),
        total=total,
        cost=cost,
        items=items
    )

    db.add(venta)
    db.commit()
    db.refresh(venta)

    return {"id": venta.id, "total": venta.total}

# ---------- LISTAR VENTAS ----------
@app.get("/sales", response_model=list[schemas.SaleDetailOut])
def list_sales(db: Session = Depends(get_db)):
    sales = (
        db.query(models.Sale)
        .options(joinedload(models.Sale.items).joinedload(models.SaleItem.product))
        .order_by(models.Sale.timestamp.desc())
        .all()
    )

    return [
        {
            "id": s.id,
            "timestamp": s.timestamp,
            "total": s.total,
            "cost": s.cost,
            "profit": s.total - s.cost,
            "items": [
                {
                    "product_id": item.product_id,
                    "product_name": item.product.name if item.product else "N/A",
                    "unit_price": item.subtotal / item.quantity if item.quantity else Decimal("0"),
                    "unit_cost": item.cost_total / item.quantity if item.quantity else Decimal("0"),
                    "quantity": item.quantity,
                    "subtotal": item.subtotal,
                    "cost_total": item.cost_total
                }
                for item in s.items
            ]
        }
        for s in sales
    ]

# ---------- DETALLE DE UNA VENTA ----------
@app.get("/sales/{sale_id}", response_model=schemas.SaleDetailOut)
def read_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = (
        db.query(models.Sale)
        .options(joinedload(models.Sale.items).joinedload(models.SaleItem.product))
        .filter(models.Sale.id == sale_id)
        .first()
    )
    if not sale:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    return {
        "id": sale.id,
        "timestamp": sale.timestamp,
        "total": sale.total,
        "cost": sale.cost,
        "profit": sale.total - sale.cost,
        "items": [
            {
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else "N/A",
                "unit_price": item.subtotal / item.quantity if item.quantity else Decimal("0"),
                "unit_cost": item.cost_total / item.quantity if item.quantity else Decimal("0"),
                "quantity": item.quantity,
                "subtotal": item.subtotal,
                "cost_total": item.cost_total
            }
            for item in sale.items
        ]
    }
