from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..models import User, UserCreate, UserUpdate
from ..auth import get_current_user, get_password_hash
from ..database import get_db
import uuid

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.get("", response_model=List[User])
async def get_employees(current_user: User = Depends(get_current_user)):
    """Get all employees (Admin/HR only)"""
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view all employees"
        )
    db = await get_db()
    employees = await db.users.find().to_list(length=None)
    for emp in employees:
        emp["id"] = str(emp.pop("_id"))
        emp["employeeId"] = emp.pop("employee_id")
        emp["fullName"] = emp.pop("full_name")
        emp["profileImage"] = emp.pop("profile_image")
        emp["joiningDate"] = emp.pop("joining_date")
    return [User(**emp) for emp in employees]

@router.get("/{employee_id}", response_model=User)
async def get_employee(employee_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific employee by ID"""
    if current_user.role not in ["admin", "hr"] and current_user.employeeId != employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this employee"
        )
    db = await get_db()
    employee = await db.users.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    employee["id"] = str(employee.pop("_id"))
    employee["employeeId"] = employee.pop("employee_id")
    employee["fullName"] = employee.pop("full_name")
    employee["profileImage"] = employee.pop("profile_image")
    employee["joiningDate"] = employee.pop("joining_date")
    return User(**employee)

@router.post("", response_model=User)
async def create_employee(employee: UserCreate, current_user: User = Depends(get_current_user)):
    """Create a new employee (Admin/HR only)"""
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create employees"
        )
    
    db = await get_db()
    existing = await db.users.find_one({"email": employee.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    new_employee = {
        "employee_id": f"EMP{str(uuid.uuid4())[:8].upper()}",
        "full_name": employee.fullName,
        "email": employee.email,
        "hashed_password": get_password_hash("password123"),  # Default password
        "role": employee.role.value if hasattr(employee.role, 'value') else employee.role,
        "department": "General",
        "designation": "Employee",
        "phone": "",
        "address": "",
        "profile_image": "",
        "joining_date": ""
    }
    
    result = await db.users.insert_one(new_employee)
    new_employee["id"] = str(result.inserted_id)
    new_employee["employeeId"] = new_employee.pop("employee_id")
    new_employee["fullName"] = new_employee.pop("full_name")
    new_employee["profileImage"] = new_employee.pop("profile_image")
    new_employee["joiningDate"] = new_employee.pop("joining_date")
    return User(**new_employee)

@router.put("/{employee_id}", response_model=User)
async def update_employee(employee_id: str, employee_update: UserUpdate, current_user: User = Depends(get_current_user)):
    """Update an employee"""
    if current_user.role not in ["admin", "hr"] and current_user.employeeId != employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this employee"
        )
    
    db = await get_db()
    # Filter out None values
    updates = {k: v for k, v in employee_update.model_dump().items() if v is not None}
    
    # Convert camelCase to snake_case for MongoDB
    mongo_updates = {}
    for key, value in updates.items():
        if key == "fullName":
            mongo_updates["full_name"] = value
        elif key == "profileImage":
            mongo_updates["profile_image"] = value
        else:
            mongo_updates[key] = value
    
    result = await db.users.update_one({"employee_id": employee_id}, {"$set": mongo_updates})
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    employee = await db.users.find_one({"employee_id": employee_id})
    employee["id"] = str(employee.pop("_id"))
    employee["employeeId"] = employee.pop("employee_id")
    employee["fullName"] = employee.pop("full_name")
    employee["profileImage"] = employee.pop("profile_image")
    employee["joiningDate"] = employee.pop("joining_date")
    return User(**employee)

@router.delete("/{employee_id}")
async def delete_employee(employee_id: str, current_user: User = Depends(get_current_user)):
    """Delete an employee (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete employees"
        )
    
    db = await get_db()
    result = await db.users.delete_one({"employee_id": employee_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    return {"message": "Employee deleted successfully"}
