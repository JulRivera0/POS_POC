from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
import crud, schemas

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
