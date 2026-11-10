from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, ResumeProfile
from ..schemas import UserCreate, UserLogin, UserResponse, TokenResponse, UserBase
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role if user_in.role in ["job_seeker", "employer", "admin"] else "job_seeker",
        headline=user_in.headline or ("Job Seeker" if user_in.role == "job_seeker" else "Hiring Manager"),
        location=user_in.location,
        phone=user_in.phone,
        avatar_url=user_in.avatar_url,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize empty resume profile for job seekers
    if user.role == "job_seeker":
        profile = ResumeProfile(
            user_id=user.id,
            title=user.headline or "Software Professional",
            summary="Passionate software developer interested in modern cloud and web engineering.",
            skills="[]",
            experience="[]",
            education="[]",
            projects="[]",
            certifications="[]"
        )
        db.add(profile)
        db.commit()

    token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return TokenResponse(access_token=token, user=UserResponse.from_orm(user))


@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return TokenResponse(access_token=token, user=UserResponse.from_orm(user))


@router.post("/demo-login/{role}", response_model=TokenResponse)
def demo_login(role: str, db: Session = Depends(get_db)):
    """One-click instant login for testing without typing credentials."""
    role_email_map = {
        "candidate": "candidate@example.com",
        "job_seeker": "candidate@example.com",
        "employer": "employer@example.com",
        "admin": "admin@example.com"
    }
    target_email = role_email_map.get(role.lower())
    if not target_email:
        raise HTTPException(status_code=400, detail="Invalid demo role specified.")

    user = db.query(User).filter(User.email == target_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo user not found. Database seeding may be required.")

    token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return TokenResponse(access_token=token, user=UserResponse.from_orm(user))


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_data: UserBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.full_name = profile_data.full_name
    current_user.headline = profile_data.headline
    current_user.location = profile_data.location
    current_user.phone = profile_data.phone
    current_user.avatar_url = profile_data.avatar_url
    
    db.commit()
    db.refresh(current_user)
    return current_user

