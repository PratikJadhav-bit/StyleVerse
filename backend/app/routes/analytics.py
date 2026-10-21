from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import SalesData, TrendData, Product, Order, Inventory

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/sales")
def get_sales(db: Session = Depends(get_db)):
    data = db.query(SalesData).order_by(SalesData.year, SalesData.id).all()
    return [
        {
            "month": s.month, "year": s.year,
            "actual": s.actual_revenue, "forecast": s.forecast_revenue,
            "units": s.units_sold
        }
        for s in data
    ]


@router.get("/trends")
def get_trends(db: Session = Depends(get_db)):
    trends = db.query(TrendData).order_by(TrendData.growth_percent.desc()).limit(10).all()
    return [
        {"id": t.id, "name": t.trend_name, "category": t.category, "growth": t.growth_percent}
        for t in trends
    ]


@router.get("/categories")
def get_category_performance(db: Session = Depends(get_db)):
    from app.models.models import Category
    cats = db.query(Category).all()
    result = []
    for cat in cats:
        count = db.query(Product).filter(Product.category_id == cat.id).count()
        result.append({"category": cat.name, "count": count, "performance": min(95, 40 + count * 10)})
    return result


@router.get("/inventory-summary")
def get_inventory_summary(db: Session = Depends(get_db)):
    total_skus = db.query(Inventory).count()
    low_stock = db.query(Inventory).filter(Inventory.quantity <= 5).count()
    out_of_stock = db.query(Inventory).filter(Inventory.quantity == 0).count()
    total_products = db.query(Product).count()
    new_arrivals = db.query(Product).filter(Product.is_new == True).count()
    return {
        "total_skus": total_skus,
        "low_stock": low_stock,
        "out_of_stock": out_of_stock,
        "total_products": total_products,
        "new_arrivals": new_arrivals,
    }


@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0
    total_products = db.query(Product).count()
    avg_rating = db.query(func.avg(Product.rating)).scalar() or 0
    return {
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "total_products": total_products,
        "avg_rating": round(avg_rating, 1),
    }
