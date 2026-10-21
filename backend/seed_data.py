"""
StyleVerse Database Seeder
Populates the database with rich sample data for demonstration.
Run: python seed_data.py
"""
import sys, os
sys.path.append(os.path.dirname(__file__))

from app.database import engine, SessionLocal, Base
from app.models.models import (
    Category, Product, User, StyleProfile, Inventory,
    LoyaltyTransaction, TrendData, SalesData
)
from app.services.auth_service import hash_password
from datetime import datetime, timedelta
import random

Base.metadata.create_all(bind=engine)
db = SessionLocal()


def seed():
    print("🌟 Seeding StyleVerse database...")

    # ─── Categories ───
    cats_data = [
        ("New Arrivals", "new-arrivals", "The latest additions to our curated luxury collection"),
        ("Dresses & Gowns", "dresses", "From silk slips to couture evening gowns"),
        ("Outerwear", "outerwear", "Structured blazers, tailored coats, and refined layers"),
        ("Accessories", "accessories", "Handbags, jewelry, and statement pieces"),
        ("Evening Wear", "eveningwear", "Gala-worthy gowns and black-tie essentials"),
        ("Sustainable Edit", "sustainable", "Luxury with a conscience — eco-crafted pieces"),
    ]
    categories = {}
    for name, slug, desc in cats_data:
        existing = db.query(Category).filter(Category.slug == slug).first()
        if not existing:
            cat = Category(name=name, slug=slug, description=desc)
            db.add(cat)
            db.flush()
            categories[slug] = cat.id
        else:
            categories[slug] = existing.id
    db.commit()
    print(f"  ✅ {len(cats_data)} categories seeded")

    # ─── Products ───
    products_data = [
        ("Celestial Silk Gown", "STYLEVERSE COUTURE", "dresses", 48500, 55000,
         "A masterpiece in ivory silk charmeuse, this gown drapes effortlessly with a hand-finished hem and subtle gold thread detailing. The embodiment of modern couture.",
         "/assets/collection_white_dress.png", 4.9, 128, True, False, False, True, True),
        ("Midnight Power Blazer", "ATELIER NOIR", "outerwear", 32000, None,
         "Precision-cut from double-faced wool, this blazer redefines executive dressing with structured shoulders and minimalist lapels.",
         "/assets/collection_black_blazer.png", 4.7, 94, True, False, False, False, True),
        ("Ivory Structured Tote", "MAISON LUXE", "accessories", 85000, None,
         "Crafted from full-grain Italian leather with solid brass hardware. The ultimate status accessory.",
         "/assets/collection_handbag.png", 4.9, 217, False, True, False, True, False),
        ("Luminary Evening Gown", "COUTURE BLANCHE", "eveningwear", 125000, 145000,
         "Limited-edition couture gown sculpted from pure organza with hand-embroidered micro-crystal details.",
         "/assets/hero_fashion_banner.png", 5.0, 56, False, False, True, False, True),
        ("Obsidian Power Set", "MONOCHROME ATELIER", "dresses", 42500, None,
         "A coordinated blazer and trouser set in matte obsidian crepe. Ultra-modern and sharply tailored.",
         "/assets/collection_black_blazer.png", 4.6, 83, False, False, False, True, False),
        ("Gold Chain Micro Bag", "GILDED HOUSE", "accessories", 62000, None,
         "The season's most coveted micro-bag with hand-set gold chain links and a satin interior.",
         "/assets/collection_handbag.png", 4.8, 145, True, False, True, True, False),
        ("Cashmere Wrap Coat", "MAISON NOIR", "outerwear", 68000, 78000,
         "Ultra-fine Grade-A cashmere in a generous wrap silhouette. The definitive cold-weather luxury.",
         "/assets/collection_black_blazer.png", 4.7, 62, True, False, False, False, True),
        ("Satin Slip Dress", "SILK ATELIER", "dresses", 28000, None,
         "Bias-cut pure silk satin in champagne ivory. Effortlessly elegant for day or evening.",
         "/assets/collection_white_dress.png", 4.8, 189, False, False, False, True, True),
        ("Pearl Drop Earrings", "GILDED HOUSE", "accessories", 8500, None,
         "South Sea cultured pearls set in 18k gold vermeil. The quintessential luxury accessory.",
         "/assets/collection_handbag.png", 4.9, 321, True, False, False, True, False),
        ("Sheer Organza Blouse", "COUTURE BLANCHE", "dresses", 18000, None,
         "Hand-crafted sheer organza with delicate pintuck detailing. Pairs with everything.",
         "/assets/collection_white_dress.png", 4.5, 77, True, False, False, False, True),
        ("Structured Leather Belt", "MAISON LUXE", "accessories", 12500, None,
         "Italian full-grain leather with a solid gold-tone buckle. The finishing touch.",
         "/assets/collection_handbag.png", 4.6, 143, False, False, False, True, False),
        ("Velvet Evening Blazer", "ATELIER NOIR", "eveningwear", 55000, None,
         "Midnight velvet with silk satin lapels. The most refined way to dress for dinner.",
         "/assets/collection_black_blazer.png", 4.8, 38, False, True, False, False, True),
    ]

    prod_ids = []
    for row in products_data:
        name, designer, cat_slug, price, orig_price, desc, img, rating, reviews, is_new, is_excl, is_lim, is_ai, tryon = row
        existing = db.query(Product).filter(Product.name == name).first()
        if not existing:
            prod = Product(
                name=name, designer=designer,
                category_id=categories.get(cat_slug, categories["dresses"]),
                price=price, original_price=orig_price, description=desc,
                image_url=img, rating=rating, review_count=reviews,
                is_new=is_new, is_exclusive=is_excl, is_limited=is_lim,
                is_ai_pick=is_ai, tryon_available=tryon,
            )
            db.add(prod)
            db.flush()
            prod_ids.append(prod.id)
            # Add inventory
            for size in ["XS", "S", "M", "L", "XL"]:
                qty = random.randint(2, 30)
                inv = Inventory(product_id=prod.id, size=size, quantity=qty, warehouse_location="Mumbai-WH1")
                db.add(inv)
        else:
            prod_ids.append(existing.id)
    db.commit()
    print(f"  ✅ {len(products_data)} products + inventory seeded")

    # ─── Demo User ───
    demo = db.query(User).filter(User.email == "priya@styleverse.com").first()
    if not demo:
        demo = User(
            name="Priya Sharma",
            email="priya@styleverse.com",
            password_hash=hash_password("StyleVerse@2026"),
            tier="Diamond",
            style_points=2840,
        )
        db.add(demo)
        db.flush()
        profile = StyleProfile(
            user_id=demo.id,
            primary_aesthetic="Quiet Luxury",
            color_palette='["#FAFAFA","#111111","#C9A227","#8B7355","#DDD5C8"]',
            occasions='["Events","Business","Evening"]',
            fit_preference="Tailored & Structured",
            style_score=94,
            elegance_score=0.95, bold_score=0.60, minimal_score=0.88,
            trend_score=0.78, classic_score=0.82, edge_score=0.45,
        )
        db.add(profile)

        txns = [
            (485, "earned", "Purchase — Celestial Silk Gown", -2),
            (-200, "spent", "Redeemed — Style Discount", -7),
            (500, "earned", "Referral Bonus — Friend Joined", -14),
            (300, "earned", "Birthday Bonus", -30),
            (200, "earned", "Welcome Bonus", -60),
        ]
        for pts, ttype, desc, days in txns:
            t = LoyaltyTransaction(
                user_id=demo.id, points=pts,
                transaction_type=ttype, description=desc,
                created_at=datetime.utcnow() + timedelta(days=days)
            )
            db.add(t)
        db.commit()
        print("  ✅ Demo user: priya@styleverse.com / StyleVerse@2026")
    else:
        print("  ℹ️  Demo user already exists")

    # ─── Trend Data ───
    if db.query(TrendData).count() == 0:
        trends = [
            ("Quiet Luxury", "Aesthetics", 94),
            ("Gold Accents", "Accessories", 87),
            ("Sheer Elegance", "Eveningwear", 79),
            ("Sustainable Chic", "Movement", 73),
            ("Monochrome Power", "Styling", 68),
            ("Micro Bags", "Accessories", 65),
            ("Velvet Revival", "Fabrics", 61),
            ("Structured Tailoring", "Outerwear", 58),
            ("Ivory & Cream", "Color Palette", 54),
            ("Transparent Fabrics", "Trends", 49),
        ]
        for name, cat, growth in trends:
            db.add(TrendData(trend_name=name, category=cat, growth_percent=growth, week_number=22, year=2026))
        db.commit()
        print("  ✅ Trend data seeded")

    # ─── Sales Data ───
    if db.query(SalesData).count() == 0:
        sales = [
            ("Jan", 2026, 420000, 450000, 42),
            ("Feb", 2026, 580000, 550000, 58),
            ("Mar", 2026, 510000, 600000, 51),
            ("Apr", 2026, 740000, 700000, 74),
            ("May", 2026, 680000, 750000, 68),
            ("Jun", 2026, 850000, 820000, 85),
            ("Jul", 2026, 790000, 880000, 79),
            ("Aug", 2026, 920000, 970000, 92),
        ]
        for month, year, actual, forecast, units in sales:
            db.add(SalesData(month=month, year=year, actual_revenue=actual, forecast_revenue=forecast, units_sold=units))
        db.commit()
        print("  ✅ Sales forecast data seeded")

    print("\n🎉 Database seeding complete!")
    print(f"   → Demo login: priya@styleverse.com / StyleVerse@2026")
    print(f"   → API Docs: http://localhost:8000/api/docs")


if __name__ == "__main__":
    seed()
    db.close()
