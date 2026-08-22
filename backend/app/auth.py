from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .models import User, LoginRequest, SignUpRequest
from .database import get_db
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        employee_id: str = payload.get("sub")
        if employee_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    db = await get_db()
    user_data = await db.users.find_one({"employee_id": employee_id})
    if user_data is None:
        raise credentials_exception
    
    # Convert ObjectId to string and handle field names
    user_data["id"] = str(user_data.pop("_id"))
    user_data["employeeId"] = user_data.pop("employee_id")
    user_data["fullName"] = user_data.pop("full_name")
    user_data["profileImage"] = user_data.pop("profile_image")
    user_data["joiningDate"] = user_data.pop("joining_date")
    
    return User(**user_data)

async def authenticate_user(email: str, password: str) -> Optional[User]:
    db = await get_db()
    user_data = await db.users.find_one({"email": email})
    if user_data and verify_password(password, user_data.get("hashed_password", "")):
        user_data["id"] = str(user_data.pop("_id"))
        user_data["employeeId"] = user_data.pop("employee_id")
        user_data["fullName"] = user_data.pop("full_name")
        user_data["profileImage"] = user_data.pop("profile_image")
        user_data["joiningDate"] = user_data.pop("joining_date")
        return User(**user_data)
    return None
