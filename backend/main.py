# backend/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from database import get_db, engine
from models import Product, Sale, SaleItem, User, Base
from schemas import (
    ProductCreate, ProductOut,
    SaleIn, SaleCreateResponse, SaleDetailOut
)
from users.dependencies import current_user, fastapi_users
from users.schemas import UserRead, UserCreate
from users.manager import auth_backend

from decimal import Decimal
from datetime import datetime


app = FastAPI()

# ─────────────────────────────────────────────
# Middleware CORS
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# Auth routers (registro, login, usuarios)
# ─────────────────────────────────────────────
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"]
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"]
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserCreate),
    prefix="/users",
    tags=["users"]
)


# ─────────────────────────────────────────────
# Crear las tablas al iniciar
# ─────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# ─────────────────────────────────────────────
# Endpoints de productos
# ─────────────────────────────────────────────
@app.get("/products", response_model=list[ProductOut])
async def list_products(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):
    result = await db.execute(
        select(Product).where(Product.user_id == user.id)
    )
    return result.scalars().all()


@app.post("/products", response_model=ProductOut)
async def create_product(
    p: ProductCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):
    prod = Product(**p.dict(), user_id=user.id)
    db.add(prod)
    await db.commit()
    await db.refresh(prod)
    return prod


@app.put("/products/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: int,
    p: ProductCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):
    result = await db.execute(
        select(Product).where(Product.id == product_id, Product.user_id == user.id)
    )
    prod = result.scalar_one_or_none()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for k, v in p.dict().items():
        setattr(prod, k, v)
    await db.commit()
    await db.refresh(prod)
    return prod


@app.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):
    result = await db.execute(
        select(Product).where(Product.id == product_id, Product.user_id == user.id)
    )
    prod = result.scalar_one_or_none()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    await db.delete(prod)
    await db.commit()
    return {"ok": True}


# ─────────────────────────────────────────────
# Endpoints de ventas
# ─────────────────────────────────────────────
@app.post("/sales", response_model=SaleCreateResponse)
async def create_sale(
    s: SaleIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):
    total = Decimal("0")
    cost = Decimal("0")
    items = []

    for it in s.items:
        result = await db.execute(
            select(Product).where(Product.id == it.product_id, Product.user_id == user.id)
        )
        prod = result.scalar_one_or_none()
        if not prod or prod.stock < it.quantity:
            raise HTTPException(status_code=400, detail="Producto inválido o sin stock")
        prod.stock -= it.quantity
        subtotal = prod.price * it.quantity
        cost_total = prod.cost * it.quantity
        total += subtotal
        cost += cost_total
        items.append(SaleItem(
            product_id=prod.id,
            quantity=it.quantity,
            subtotal=subtotal,
            cost_total=cost_total
        ))

    venta = Sale(
        timestamp=datetime.utcnow(),
        total=total,
        cost=cost,
        items=items,
        user_id=user.id
    )

    db.add(venta)
    await db.commit()
    await db.refresh(venta)
    return {"id": venta.id, "total": venta.total}


@app.get("/sales", response_model=list[SaleDetailOut])
async def list_sales(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):
    result = await db.execute(
        select(Sale).options(
            selectinload(Sale.items).selectinload(SaleItem.product)
        ).where(Sale.user_id == user.id).order_by(Sale.timestamp.desc())
    )
    sales = result.scalars().all()
    return [{
        "id": s.id,
        "timestamp": s.timestamp,
        "total": s.total,
        "cost": s.cost,
        "profit": s.total - s.cost,
        "items": [{
            "product_id": i.product_id,
            "product_name": i.product.name if i.product else "N/A",
            "unit_price": i.subtotal / i.quantity if i.quantity else 0,
            "unit_cost": i.cost_total / i.quantity if i.quantity else 0,
            "quantity": i.quantity,
            "subtotal": i.subtotal,
            "cost_total": i.cost_total
        } for i in s.items]
    } for s in sales]


@app.get("/sales/{sale_id}", response_model=SaleDetailOut)
async def get_sale(
    sale_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):
    result = await db.execute(
        select(Sale).options(
            selectinload(Sale.items).selectinload(SaleItem.product)
        ).where(Sale.id == sale_id, Sale.user_id == user.id)
    )
    s = result.scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return {
        "id": s.id,
        "timestamp": s.timestamp,
        "total": s.total,
        "cost": s.cost,
        "profit": s.total - s.cost,
        "items": [{
            "product_id": i.product_id,
            "product_name": i.product.name if i.product else "N/A",
            "unit_price": i.subtotal / i.quantity if i.quantity else 0,
            "unit_cost": i.cost_total / i.quantity if i.quantity else 0,
            "quantity": i.quantity,
            "subtotal": i.subtotal,
            "cost_total": i.cost_total
        } for i in s.items]
    }
