from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import Product, Category
from app.schemas.schemas import ProductOut, ProductCreate

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=List[ProductOut])
def get_products(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    is_new: Optional[bool] = Query(None),
    is_ai_pick: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query("newest"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    q = db.query(Product)
    if category:
        cat = db.query(Category).filter(Category.slug == category).first()
        if cat:
            q = q.filter(Product.category_id == cat.id)
    if min_price is not None:
        q = q.filter(Product.price >= min_price)
    if max_price is not None:
        q = q.filter(Product.price <= max_price)
    if is_new is not None:
        q = q.filter(Product.is_new == is_new)
    if is_ai_pick is not None:
        q = q.filter(Product.is_ai_pick == is_ai_pick)
    if search:
        q = q.filter(
            Product.name.ilike(f"%{search}%") |
            Product.designer.ilike(f"%{search}%")
        )
    if sort == "price_asc":
        q = q.order_by(Product.price.asc())
    elif sort == "price_desc":
        q = q.order_by(Product.price.desc())
    elif sort == "rating":
        q = q.order_by(Product.rating.desc())
    else:
        q = q.order_by(Product.created_at.desc())

    return q.offset(offset).limit(limit).all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=ProductOut, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for k, v in payload.model_dump().items():
        setattr(product, k, v)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()


@router.get("/categories/all", response_model=List[dict])
def get_categories(db: Session = Depends(get_db)):
    return [{"id": c.id, "name": c.name, "slug": c.slug} for c in db.query(Category).all()]
