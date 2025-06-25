from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from models import Sale, SaleItem
from database import Base, engine, SessionLocal
import crud
import schemas

Base.metadata.create_all(bind=engine)  # ② autogenera tabla

app = FastAPI(title="POS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Endpoints Inventario ---
@app.post("/products", response_model=schemas.ProductOut)
def create_product(p: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db, p)

@app.get("/products", response_model=list[schemas.ProductOut])
def list_products(db: Session = Depends(get_db)):
    return crud.get_products(db)

@app.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, p: schemas.ProductUpdate, db: Session = Depends(get_db)):
    res = crud.update_product(db, product_id, p)
    if not res:
        raise HTTPException(status_code=404, detail="Product not found")
    return res

@app.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    res = crud.delete_product(db, product_id)
    if not res:
        raise HTTPException(status_code=404, detail="Product not found")

@app.post("/sales", response_model=schemas.SaleOut)
def registrar_venta(sale: schemas.SaleIn, db: Session = Depends(get_db)):
    return crud.create_sale(db, sale)

@app.get("/sales", response_model=list[schemas.SaleDetailOut])
def listar_ventas(db: Session = Depends(get_db)):
    sales = db.query(Sale).options(joinedload(Sale.items).joinedload(SaleItem.product)).order_by(Sale.timestamp.desc()).all()
    
    # Enriquecer SaleItemOut con nombre del producto
    result = []
    for s in sales:
        enriched_items = [
            schemas.SaleItemOut(
                product_id=item.product_id,
                quantity=item.quantity,
                subtotal=item.subtotal,
                product_name=item.product.name if item.product else 'Desconocido'
            ) for item in s.items
        ]
        result.append(schemas.SaleDetailOut(
            id=s.id,
            timestamp=s.timestamp,
            total=s.total,
            items=enriched_items
        ))
    return result