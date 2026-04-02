from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import AdminUser
from app.schemas import AdminLoginRequest, AdminRegisterRequest, TokenResponse
from app.auth import hash_password, verify_password, create_access_token, get_current_admin

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(body: AdminLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdminUser).where(AdminUser.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token)


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: AdminRegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdminUser).where(AdminUser.email == body.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = AdminUser(
        email=body.email,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token)


@router.get("/me")
async def me(current_admin: AdminUser = Depends(get_current_admin)):
    return {"email": current_admin.email, "id": current_admin.id}
