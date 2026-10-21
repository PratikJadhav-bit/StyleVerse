from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    designer = Column(String(150), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    rating = Column(Float, default=4.5)
    review_count = Column(Integer, default=0)
    is_new = Column(Boolean, default=False)
    is_exclusive = Column(Boolean, default=False)
    is_limited = Column(Boolean, default=False)
    is_ai_pick = Column(Boolean, default=False)
    tryon_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    category = relationship("Category", back_populates="products")
    inventory = relationship("Inventory", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    wishlist_items = relationship("Wishlist", back_populates="product")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False, index=True)
    password_hash = Column(String(500), nullable=False)
    tier = Column(String(50), default="Silver")
    style_points = Column(Integer, default=0)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    orders = relationship("Order", back_populates="user")
    style_profile = relationship("StyleProfile", back_populates="user", uselist=False)
    loyalty_transactions = relationship("LoyaltyTransaction", back_populates="user")
    wishlist = relationship("Wishlist", back_populates="user")


class StyleProfile(Base):
    __tablename__ = "style_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    primary_aesthetic = Column(String(100), default="Quiet Luxury")
    color_palette = Column(String(500), default='["#FAFAFA","#111111","#C9A227","#8B7355","#DDD5C8"]')
    occasions = Column(String(300), default='["Events","Business","Evening"]')
    fit_preference = Column(String(100), default="Tailored & Structured")
    style_score = Column(Integer, default=72)
    elegance_score = Column(Float, default=0.95)
    bold_score = Column(Float, default=0.60)
    minimal_score = Column(Float, default=0.88)
    trend_score = Column(Float, default=0.78)
    classic_score = Column(Float, default=0.82)
    edge_score = Column(Float, default=0.45)
    user = relationship("User", back_populates="style_profile")


class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="Pending")
    total_amount = Column(Float, nullable=False)
    shipping_address = Column(Text, nullable=True)
    payment_method = Column(String(50), default="card")
    tracking_number = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)
    size = Column(String(10), nullable=True)
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    size = Column(String(10), nullable=False)
    quantity = Column(Integer, default=0)
    warehouse_location = Column(String(100), nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    product = relationship("Product", back_populates="inventory")


class LoyaltyTransaction(Base):
    __tablename__ = "loyalty_transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    points = Column(Integer, nullable=False)
    transaction_type = Column(String(50), nullable=False)  # earned / spent
    description = Column(String(300), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="loyalty_transactions")


class Wishlist(Base):
    __tablename__ = "wishlist"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="wishlist")
    product = relationship("Product", back_populates="wishlist_items")


class TrendData(Base):
    __tablename__ = "trend_data"
    id = Column(Integer, primary_key=True, index=True)
    trend_name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    growth_percent = Column(Float, nullable=False)
    week_number = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)


class SalesData(Base):
    __tablename__ = "sales_data"
    id = Column(Integer, primary_key=True, index=True)
    month = Column(String(20), nullable=False)
    year = Column(Integer, nullable=False)
    actual_revenue = Column(Float, nullable=False)
    forecast_revenue = Column(Float, nullable=True)
    units_sold = Column(Integer, nullable=False)
