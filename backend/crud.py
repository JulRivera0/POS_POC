from fastapi import HTTPException
from sqlalchemy.orm import Session
from models import Product, Sale, SaleItem
from schemas import ProductCreate, ProductUpdate, SaleIn 

def create_product(db: Session, p: ProductCreate):
    db_p = Product(**p.dict())
    db.add(db_p)
    db.commit()
    db.refresh(db_p)
    return db_p

def get_products(db: Session):
    return db.query(Product).all()

def get_product(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()

def update_product(db: Session, product_id: int, p: ProductUpdate):
    db_p = get_product(db, product_id)
    if not db_p:
        return None
    for k, v in p.dict().items():
        setattr(db_p, k, v)
    db.commit()
    db.refresh(db_p)
    return db_p

def delete_product(db: Session, product_id: int):
    db_p = get_product(db, product_id)
    if not db_p:
        return None
    db.delete(db_p)
    db.commit()
    return db_p

def create_sale(db: Session, sale_in: SaleIn):
    total = 0
    sale_items = []

    for item in sale_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Producto {item.product_id} sin stock suficiente")
        subtotal = product.price * item.quantity
        product.stock -= item.quantity
        total += subtotal
        sale_items.append(SaleItem(product_id=product.id, quantity=item.quantity, subtotal=subtotal))

    sale = Sale(total=total, items=sale_items)
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale

def get_sales(db: Session):
    return db.query(Sale).order_by(Sale.timestamp.desc()).all()