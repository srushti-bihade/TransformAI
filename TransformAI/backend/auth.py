from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta

from database import SessionLocal
from models import User, AuditLog


# --------------------------------------------------
# ROUTER
# --------------------------------------------------

router = APIRouter()


# --------------------------------------------------
# PASSWORD HASHING
# --------------------------------------------------

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)


# --------------------------------------------------
# JWT SETTINGS
# --------------------------------------------------

SECRET_KEY = "transformai-change-this-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# --------------------------------------------------
# REQUEST MODELS
# --------------------------------------------------

class SignupRequest(BaseModel):

    email: str
    password: str


class LoginRequest(BaseModel):

    email: str
    password: str


# --------------------------------------------------
# DATABASE CONNECTION
# --------------------------------------------------

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


# --------------------------------------------------
# CREATE JWT TOKEN
# --------------------------------------------------

def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    token = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# --------------------------------------------------
# SIGNUP
# --------------------------------------------------

@router.post("/signup")
def signup(
    user_data: SignupRequest,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()


    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists."
        )


    # ----------------------------------------------
    # HASH PASSWORD
    # ----------------------------------------------

    hashed_password = pwd_context.hash(
        user_data.password
    )


    # ----------------------------------------------
    # CREATE USER
    # ----------------------------------------------

    new_user = User(
        email=user_data.email,
        password=hashed_password
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)


    return {

        "message":
            "Account created successfully!",

        "email":
            new_user.email
    }


# --------------------------------------------------
# LOGIN
# --------------------------------------------------

@router.post("/login")
def login(
    user_data: LoginRequest,
    db: Session = Depends(get_db)
):

    # ----------------------------------------------
    # FIND USER
    # ----------------------------------------------

    user = db.query(User).filter(
        User.email == user_data.email
    ).first()


    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )


    # ----------------------------------------------
    # VERIFY PASSWORD
    # ----------------------------------------------

    password_correct = pwd_context.verify(
        user_data.password,
        user.password
    )


    if not password_correct:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )


    # ----------------------------------------------
    # CREATE JWT TOKEN
    # ----------------------------------------------

    access_token = create_access_token({

        "sub":
            str(user.id),

        "email":
            user.email
    })


    # ----------------------------------------------
    # CREATE LOGIN AUDIT LOG
    # ----------------------------------------------

    audit_log = AuditLog(

        user_email=
            user.email,

        action=
            "LOGIN",

        details=
            "User logged in successfully."
    )

    db.add(audit_log)

    db.commit()


    # ----------------------------------------------
    # RETURN LOGIN RESPONSE
    # ----------------------------------------------

    return {

        "message":
            "Login successful!",

        "access_token":
            access_token,

        "token_type":
            "bearer",

        "email":
            user.email
    }