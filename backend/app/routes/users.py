from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, StyleProfile, LoyaltyTransaction
from app.schemas.schemas import UserRegister, UserLogin, TokenOut, UserOut, UserUpdate, StyleProfileOut
from app.services.auth_service import hash_password, verify_password, create_access_token, decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/api/auth", tags=["auth"])
users_router = APIRouter(prefix="/api/users", tags=["users"])
security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/register", response_model=TokenOut, status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        tier="Silver",
        style_points=0,
    )
    db.add(user)
    db.flush()
    # Create default style profile
    profile = StyleProfile(user_id=user.id)
    db.add(profile)
    # Welcome bonus points
    bonus = LoyaltyTransaction(
        user_id=user.id, points=200,
        transaction_type="earned",
        description="Welcome bonus — StyleVerse member"
    )
    db.add(bonus)
    user.style_points = 200
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": user.id})
    return TokenOut(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": user.id})
    return TokenOut(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@users_router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@users_router.put("/me", response_model=UserOut)
def update_me(payload: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.name:
        current_user.name = payload.name
    if payload.avatar_url:
        current_user.avatar_url = payload.avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user


@users_router.get("/me/style-profile", response_model=StyleProfileOut)
def get_style_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(StyleProfile).filter(StyleProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Style profile not found")
    return profile


@users_router.get("/me/loyalty")
def get_loyalty(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    txns = db.query(LoyaltyTransaction).filter(
        LoyaltyTransaction.user_id == current_user.id
    ).order_by(LoyaltyTransaction.created_at.desc()).limit(20).all()
    next_tier_points = 5000 if current_user.tier == "Gold" else (1000 if current_user.tier == "Silver" else 0)
    return {
        "balance": current_user.style_points,
        "tier": current_user.tier,
        "next_tier_points": next_tier_points,
        "transactions": [
            {"id": t.id, "points": t.points, "type": t.transaction_type,
             "description": t.description, "date": t.created_at.isoformat()}
            for t in txns
        ]
    }
