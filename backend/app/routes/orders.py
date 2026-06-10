import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import (
    Order,
    OrderItem,
    OrderStatus,
    PaymentMethod as PaymentMethodEnum,
    Product,
    User,
)
from ..schemas import (
    CheckoutRequest,
    CheckoutResponse,
    OrderListResponse,
    OrderResponse,
    OrderUpdate,
    PaymentMethod,
    PhoneLookupRequest,
    UserPointsResponse,
)
import httpx

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
TELEGRAM_URL = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage" if TELEGRAM_TOKEN else ""
POINT_VALUE = 10000
LOYALTY_RATE = 0.10
SHIPPING_COST = 25000.0

router = APIRouter()


def _get_order(db: Session, order_id: int):
    return db.scalars(select(Order).where(Order.id == order_id)).first()


def _get_product(db: Session, product_id: str):
    return db.scalars(select(Product).where(Product.id == product_id)).first()


@router.get("/", response_model=OrderListResponse)
async def get_all_orders(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    orders = db.scalars(select(Order).offset(skip).limit(limit)).all()
    total = db.scalar(select(func.count()).select_from(Order))
    return OrderListResponse(orders=orders, total=total)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    order = _get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/users/lookup-points", response_model=UserPointsResponse)
async def lookup_user_points(lookup_data: PhoneLookupRequest, db: Session = Depends(get_db)):
    user = db.scalars(select(User).where(User.phone == lookup_data.phone)).first()
    points = user.loyalty_points if user else 0
    return UserPointsResponse(loyalty_points=points)


@router.post("/checkout", response_model=CheckoutResponse)
async def checkout(checkout_data: CheckoutRequest, db: Session = Depends(get_db)):
    if not checkout_data.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    user = db.scalars(select(User).where(User.phone == checkout_data.phone)).first()
    if not user:
        user = User(phone=checkout_data.phone, first_name=checkout_data.first_name)
        db.add(user)
        db.flush()

    subtotal = 0.0
    order_items = []
    product_titles = []

    for item_data in checkout_data.items:
        product = _get_product(db, item_data.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item_data.product_id} not found")
        if product.in_stock is None or product.in_stock < item_data.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Product {product.title} is not available in requested quantity",
            )
        subtotal += product.price * item_data.quantity
        product.in_stock -= item_data.quantity
        order_items.append(
            OrderItem(
                product_id=product.id,
                quantity=item_data.quantity,
                price=product.price,
            )
        )
        product_titles.append(f"{product.title} x{item_data.quantity}")

    points_redeemed = 0
    if checkout_data.use_loyalty_points and user.loyalty_points > 0:
        redeemed_value = min(user.loyalty_points * POINT_VALUE, int(subtotal))
        points_redeemed = redeemed_value // POINT_VALUE

    subtotal_after_discount = subtotal - points_redeemed * POINT_VALUE
    points_earned = int((subtotal_after_discount * LOYALTY_RATE) // POINT_VALUE)
    user.loyalty_points = max(0, user.loyalty_points - points_redeemed + points_earned)
    db.add(user)

    final_total = subtotal_after_discount + SHIPPING_COST
    order = Order(
        user_id=user.id,
        status=OrderStatus.PENDING,
        payment_method=PaymentMethodEnum(checkout_data.payment_method.value),
        points_earned=points_earned,
        points_redeemed=points_redeemed,
        location_url=checkout_data.location_url,
        total_amount=final_total,
        shipping_address=checkout_data.shipping_address,
        shipping_cost=SHIPPING_COST,
        tax_amount=0.0,
    )
    db.add(order)
    db.flush()

    for item in order_items:
        item.order_id = order.id
        db.add(item)

    payment_url = None
    if checkout_data.payment_method is PaymentMethod.CLICK:
        amount_value = int(round(final_total))
        payment_url = (
            f"https://click.uz/?service_id=12345"
            f"&merchant_id=9999"
            f"&amount={amount_value}"
            f"&transaction_param=ORDER_{order.id}"
            f"&return_url=http://localhost:5173/success"
        )
    elif TELEGRAM_URL and TELEGRAM_CHAT_ID:
        message = (
            f"🛵 New order!\n"
            f"Customer: {checkout_data.first_name}\n"
            f"Phone: {checkout_data.phone}\n"
            f"Address: {checkout_data.shipping_address}\n"
            f"Location: {checkout_data.location_url}\n"
            f"Products: {', '.join(product_titles)}\n"
            f"Subtotal: {int(round(subtotal)):,} UZS\n"
            f"Delivery fee: {int(round(SHIPPING_COST)):,} UZS\n"
            f"Discount points: {points_redeemed} ({points_redeemed * POINT_VALUE} UZS)\n"
            f"Payment method: {checkout_data.payment_method.value}\n"
            f"Total: {int(round(final_total)):,} UZS"
        )
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    TELEGRAM_URL,
                    json={"chat_id": TELEGRAM_CHAT_ID, "text": message},
                    timeout=10,
                )
        except Exception:
            pass

    db.commit()
    db.refresh(order)
    return CheckoutResponse(
        order_id=order.id,
        total_amount=final_total,
        status="created",
        payment_url=payment_url,
        message="Order completed successfully",
    )


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(order_id: int, order_update: OrderUpdate, db: Session = Depends(get_db)):
    order = _get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order_update.status:
        order.status = order_update.status
    if order_update.notes is not None:
        order.notes = order_update.notes
    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}")
async def cancel_order(order_id: int, db: Session = Depends(get_db)):
    order = _get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status in [OrderStatus.SHIPPED, OrderStatus.DELIVERED]:
        raise HTTPException(status_code=400, detail="Cannot cancel shipped or delivered orders")
    order.status = OrderStatus.CANCELLED
    db.commit()
    return {"detail": "Order cancelled successfully"}


@router.get("/{order_id}/status")
async def get_order_status(order_id: int, db: Session = Depends(get_db)):
    order = _get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {
        "order_id": order.id,
        "status": order.status,
        "total_amount": order.total_amount,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
    }
