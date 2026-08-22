from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta
from ..models import LoginRequest, SignUpRequest, User, UserCreate
from ..auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user
)
from ..database import get_db
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
async def login(request: LoginRequest):
    user = await authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.employeeId}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/signup")
async def signup(request: SignUpRequest):
    db = await get_db()
    
    # Check if email already exists
    existing = await db.users.find_one({"email": request.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate employee ID
    employee_id = f"EMP{str(uuid.uuid4())[:8].upper()}"
    
    # Create new user
    new_user = {
        "employee_id": employee_id,
        "full_name": request.fullName,
        "email": request.email,
        "hashed_password": get_password_hash(request.password),
        "role": request.role.value if hasattr(request.role, 'value') else request.role,
        "department": "General",
        "designation": "Employee",
        "phone": "",
        "address": "",
        "profile_image": "",
        "joining_date": ""
    }
    
    result = await db.users.insert_one(new_user)
    new_user["id"] = str(result.inserted_id)
    new_user["employeeId"] = new_user.pop("employee_id")
    new_user["fullName"] = new_user.pop("full_name")
    new_user["profileImage"] = new_user.pop("profile_image")
    new_user["joiningDate"] = new_user.pop("joining_date")
    
    # Return user without password
    user_response = User(**new_user)
    return user_response

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
