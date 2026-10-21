from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Product
from app.schemas.schemas import AIRecommendRequest, ProductOut
import random

router = APIRouter(prefix="/api/ai", tags=["ai"])

OCCASION_CATEGORIES = {
    "wedding": ["eveningwear", "dresses"],
    "office": ["outerwear", "dresses"],
    "party": ["eveningwear", "accessories"],
    "casual": ["dresses", "outerwear"],
    "date": ["dresses", "eveningwear"],
    "vacation": ["dresses", "accessories"],
}

STYLE_TIPS = {
    "wedding": [
        "Choose flowing silhouettes for outdoor weddings.",
        "Gold jewelry elevates ivory and white gowns perfectly.",
        "A structured clutch over a tote for evening events.",
        "Opt for heel-friendly flats if the venue is on grass.",
    ],
    "office": [
        "Tailored blazers project confidence and authority.",
        "A structured tote in neutral tones reads professional.",
        "Monochromatic looks streamline your silhouette.",
        "Keep accessories minimal — quality over quantity.",
    ],
    "party": [
        "Metallics are always a crowd-pleaser for evening events.",
        "A micro bag paired with an embellished dress is iconic.",
        "Bold earrings can replace a necklace for cleaner styling.",
        "Let one statement piece anchor the entire look.",
    ],
    "casual": [
        "Elevated basics — think cashmere and silk — look effortless.",
        "A leather tote instantly elevates any casual outfit.",
        "Slip into a satin blouse for relaxed-luxury vibes.",
        "Tonal dressing in neutrals is the ultimate casual chic.",
    ],
    "default": [
        "Invest in timeless pieces over trend-driven fast fashion.",
        "Fit is everything — tailoring transforms any garment.",
        "Build a capsule wardrobe in 3 neutral tones.",
        "Quality fabrics drape better and last longer.",
    ]
}


@router.post("/recommend")
def ai_recommend(payload: AIRecommendRequest, db: Session = Depends(get_db)):
    occasion_key = payload.occasion.lower().replace(" ", "")
    cat_slugs = OCCASION_CATEGORIES.get(occasion_key, ["dresses", "accessories"])

    q = db.query(Product)
    if payload.budget_max:
        q = q.filter(Product.price <= payload.budget_max)

    products = q.order_by(Product.rating.desc()).limit(50).all()
    selected = random.sample(products, min(6, len(products))) if products else []

    tips = STYLE_TIPS.get(occasion_key, STYLE_TIPS["default"])

    return {
        "occasion": payload.occasion,
        "recommendations": [
            {
                "id": p.id, "name": p.name, "designer": p.designer,
                "price": p.price, "image_url": p.image_url, "rating": p.rating,
                "match_score": round(random.uniform(88, 99), 1)
            }
            for p in selected
        ],
        "style_tips": tips[:4],
    }


@router.get("/chat")
def ai_chat(message: str, db: Session = Depends(get_db)):
    msg = message.lower()
    if any(w in msg for w in ["wedding", "bridal", "bride"]):
        key = "wedding"
    elif any(w in msg for w in ["office", "work", "business", "meeting"]):
        key = "office"
    elif any(w in msg for w in ["party", "night", "club", "date"]):
        key = "party"
    elif any(w in msg for w in ["casual", "weekend", "relaxed"]):
        key = "casual"
    else:
        key = "default"

    responses = {
        "wedding": "For a wedding, I recommend flowing silk gowns paired with gold accessories. The Celestial Silk Gown from our collection is a perfect match — ethereal, timeless, unforgettable. ✨",
        "office": "Professional yet powerful — the Midnight Power Blazer paired with structured trousers is your boardroom armor. Add the Ivory Structured Tote to complete the executive look. 💼",
        "party": "A night out calls for drama. The Gold Chain Micro Bag paired with a sleek gown is iconic. Think metallics, statement earrings, and a look that commands every room. 🥂",
        "casual": "Quiet luxury for the weekend — a cashmere wrap over a silk slip dress with the Ivory Structured Tote. Effortless sophistication, no effort required. ☀️",
        "default": "Based on your style DNA, I'm curating pieces that blend timeless elegance with modern edge. Let me show you the perfect ensemble — shall I start with occasion, color, or budget? 🎨"
    }
    products = db.query(Product).filter(Product.is_ai_pick == True).limit(3).all()
    return {
        "response": responses[key],
        "suggested_products": [{"id": p.id, "name": p.name, "price": p.price, "image_url": p.image_url} for p in products]
    }


@router.get("/wishlist/{user_id}/add/{product_id}")
def add_to_wishlist(user_id: int, product_id: int, db: Session = Depends(get_db)):
    from app.models.models import Wishlist
    existing = db.query(Wishlist).filter(Wishlist.user_id == user_id, Wishlist.product_id == product_id).first()
    if not existing:
        w = Wishlist(user_id=user_id, product_id=product_id)
        db.add(w)
        db.commit()
    return {"status": "added"}
