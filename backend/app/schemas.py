from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None


class UserCreate(UserBase):
    clerk_id: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None


class UserResponse(UserBase):
    id: int
    clerk_id: Optional[str] = None
    address: Optional[str]
    city: Optional[str]
    postal_code: Optional[str]
    country: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    id: str
    title: str
    price: float
    category: str


class ProductCreate(ProductBase):
    old_price: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    in_stock: int = 1


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    price: Optional[float] = None
    old_price: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    in_stock: Optional[int] = None


class ProductResponse(ProductBase):
    old_price: Optional[float]
    description: Optional[str]
    image_url: Optional[str]
    in_stock: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class CartItemBase(BaseModel):
    product_id: str
    quantity: int = 1


class CartItemCreate(CartItemBase):
    pass


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemResponse(CartItemBase):
    id: int
    user_id: int
    added_at: datetime
    product: ProductResponse
    model_config = ConfigDict(from_attributes=True)


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int


class OrderItemResponse(BaseModel):
    id: int
    product_id: str
    quantity: int
    price: float
    product: ProductResponse
    model_config = ConfigDict(from_attributes=True)


class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    CASH = "cash"
    CLICK = "click"


class OrderCreate(BaseModel):
    shipping_address: str
    items: List[OrderItemCreate]


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    notes: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: OrderStatus
    total_amount: float
    shipping_cost: float
    tax_amount: float
    shipping_address: str
    notes: Optional[str]
    items: List[OrderItemResponse]
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int


class PhoneLookupRequest(BaseModel):
    phone: str


class UserPointsResponse(BaseModel):
    loyalty_points: int


class CheckoutRequest(BaseModel):
    phone: str
    first_name: str
    shipping_address: str
    location_url: str
    payment_method: PaymentMethod
    use_loyalty_points: bool = False
    items: List[OrderItemCreate]


class CheckoutResponse(BaseModel):
    order_id: int
    total_amount: float
    status: str
    payment_url: Optional[str] = None
    message: str
