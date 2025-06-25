from sqlalchemy.orm import Session
from models import Product
from schemas import ProductCreate, ProductUpdate

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
