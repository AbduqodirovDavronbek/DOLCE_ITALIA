from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from ..models import Product
from ..schemas import ProductCreate, ProductResponse, ProductUpdate

router = APIRouter()


def _get_product(db: Session, product_id: str):
    return db.scalars(select(Product).where(Product.id == product_id)).first()


@router.get("/", response_model=List[ProductResponse])
async def get_all_products(category: str | None = None, db: Session = Depends(get_db)):
    query = select(Product)
    if category:
        query = query.where(Product.category == category)
    return db.scalars(query).all()


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str, db: Session = Depends(get_db)):
    product = _get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductResponse)
async def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, product_update: ProductUpdate, db: Session = Depends(get_db)):
    db_product = _get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in product_update.model_dump(exclude_unset=True).items():
        setattr(db_product, field, value)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.delete("/{product_id}")
async def delete_product(product_id: str, db: Session = Depends(get_db)):
    db_product = _get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"detail": "Product deleted successfully"}


@router.get("/category/{category}", response_model=List[ProductResponse])
async def get_products_by_category(category: str, db: Session = Depends(get_db)):
    products = db.scalars(select(Product).where(Product.category == category)).all()
    if not products:
        raise HTTPException(status_code=404, detail="No products found in this category")
    return products
