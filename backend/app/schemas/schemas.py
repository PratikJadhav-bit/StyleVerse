from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Category ───
class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    class Config: from_attributes = True


# ─── Product ───
class ProductOut(BaseModel):
    id: int
    name: str
    designer: str
    category_id: int
    price: float
    original_price: Optional[float]
    description: Optional[str]
    image_url: Optional[str]
    rating: float
    review_count: int
    is_new: bool
    is_exclusive: bool
    is_limited: bool
    is_ai_pick: bool
    tryon_available: bool
    created_at: datetime
    class Config: from_attributes = True


class ProductCreate(BaseModel):
    name: str
    designer: str
    category_id: int
    price: float
    original_price: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    rating: float = 4.5
    review_count: int = 0
    is_new: bool = False
    is_exclusive: bool = False
    is_limited: bool = False
    is_ai_pick: bool = False
    tryon_available: bool = True


# ─── Auth ───
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"


# ─── User ───
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    tier: str
    style_points: int
    avatar_url: Optional[str]
    created_at: datetime
    class Config: from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None


# ─── Style Profile ───
class StyleProfileOut(BaseModel):
    id: int
    user_id: int
    primary_aesthetic: str
    color_palette: str
    occasions: str
    fit_preference: str
    style_score: int
    elegance_score: float
    bold_score: float
    minimal_score: float
    trend_score: float
    classic_score: float
    edge_score: float
    class Config: from_attributes = True


# ─── Order ───
class OrderItemIn(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    size: Optional[str] = "M"


class OrderCreate(BaseModel):
    items: List[OrderItemIn]
    shipping_address: str
    payment_method: str = "card"


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    size: Optional[str]
    class Config: from_attributes = True


class OrderOut(BaseModel):
    id: int
    user_id: int
    status: str
    total_amount: float
    shipping_address: Optional[str]
    payment_method: str
    tracking_number: Optional[str]
    created_at: datetime
    items: List[OrderItemOut] = []
    class Config: from_attributes = True


# ─── Inventory ───
class InventoryOut(BaseModel):
    id: int
    product_id: int
    size: str
    quantity: int
    warehouse_location: Optional[str]
    last_updated: datetime
    class Config: from_attributes = True


class InventoryUpdate(BaseModel):
    quantity: int


# ─── Loyalty ───
class LoyaltyTransactionOut(BaseModel):
    id: int
    points: int
    transaction_type: str
    description: Optional[str]
    created_at: datetime
    class Config: from_attributes = True


# ─── Wishlist ───
class WishlistItemOut(BaseModel):
    id: int
    product_id: int
    created_at: datetime
    class Config: from_attributes = True


# ─── Analytics ───
class SalesDataOut(BaseModel):
    month: str
    year: int
    actual_revenue: float
    forecast_revenue: Optional[float]
    units_sold: int
    class Config: from_attributes = True


class TrendDataOut(BaseModel):
    id: int
    trend_name: str
    category: str
    growth_percent: float
    class Config: from_attributes = True


# ─── AI ───
class AIRecommendRequest(BaseModel):
    occasion: str
    style_preferences: Optional[List[str]] = []
    budget_max: Optional[float] = None


class AIRecommendResponse(BaseModel):
    occasion: str
    recommendations: List[ProductOut]
    style_tips: List[str]


# Fix forward reference
TokenOut.model_rebuild()
