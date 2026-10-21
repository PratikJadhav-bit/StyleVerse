from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Order, OrderItem, Product, User, LoyaltyTransaction, Inventory
from app.schemas.schemas import OrderCreate, OrderOut
from app.routes.users import get_current_user
import random, string

router = APIRouter(prefix="/api/orders", tags=["orders"])


def generate_tracking(order_id: int) -> str:
    return f"SV-2026-{order_id:04d}"


@router.post("", response_model=OrderOut, status_code=201)
def place_order(payload: OrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total = sum(item.quantity * item.unit_price for item in payload.items)
    order = Order(
        user_id=current_user.id,
        status="Confirmed",
        total_amount=total,
        shipping_address=payload.shipping_address,
        payment_method=payload.payment_method,
    )
    db.add(order)
    db.flush()
    order.tracking_number = generate_tracking(order.id)

    for item_data in payload.items:
        item = OrderItem(
            order_id=order.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            size=item_data.size,
        )
        db.add(item)
        # Decrease inventory
        inv = db.query(Inventory).filter(
            Inventory.product_id == item_data.product_id,
            Inventory.size == (item_data.size or "M")
        ).first()
        if inv and inv.quantity >= item_data.quantity:
            inv.quantity -= item_data.quantity

    # Award loyalty points (1 point per ₹100 spent)
    points_earned = int(total / 100)
    txn = LoyaltyTransaction(
        user_id=current_user.id,
        points=points_earned,
        transaction_type="earned",
        description=f"Purchase — Order #{order.tracking_number}"
    )
    db.add(txn)
    current_user.style_points += points_earned

    # Update tier
    pts = current_user.style_points
    if pts >= 5000:
        current_user.tier = "Diamond"
    elif pts >= 1000:
        current_user.tier = "Gold"
    else:
        current_user.tier = "Silver"

    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=List[OrderOut])
def get_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/{order_id}/track")
def track_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    steps_map = {
        "Pending": 0, "Confirmed": 1, "Packaged": 2,
        "In Transit": 3, "Out for Delivery": 4, "Delivered": 5
    }
    current_step = steps_map.get(order.status, 1)
    return {
        "order_id": order.id,
        "tracking_number": order.tracking_number,
        "status": order.status,
        "current_step": current_step,
        "steps": [
            {"label": "Order Placed", "completed": current_step >= 1, "timestamp": order.created_at.isoformat()},
            {"label": "Confirmed & Packaged", "completed": current_step >= 2, "timestamp": None},
            {"label": "In Transit", "completed": current_step >= 3, "timestamp": None},
            {"label": "Out for Delivery", "completed": current_step >= 4, "timestamp": None},
            {"label": "Delivered", "completed": current_step >= 5, "timestamp": None},
        ],
        "estimated_delivery": "2-3 Business Days"
    }
