from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..models import Payroll, PayrollCreate, User
from ..auth import get_current_user
from ..database import get_db
import uuid

router = APIRouter(prefix="/payroll", tags=["Payroll"])

@router.get("", response_model=List[Payroll])
async def get_payroll(
    employee_id: str = None,
    month: int = None,
    year: int = None,
    current_user: User = Depends(get_current_user)
):
    """Get payroll records with optional filters"""
    if current_user.role not in ["admin", "hr"] and employee_id and employee_id != current_user.employeeId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view other employees' payroll"
        )
    
    db = await get_db()
    query = {}
    if employee_id:
        query["employee_id"] = employee_id
    elif current_user.role == "employee":
        query["employee_id"] = current_user.employeeId
    
    if month:
        query["month"] = month
    if year:
        query["year"] = year
    
    payroll_data = await db.payrolls.find(query).to_list(length=None)
    for payroll in payroll_data:
        payroll["id"] = str(payroll.pop("_id"))
        payroll["employeeId"] = payroll.pop("employee_id")
        payroll["basicSalary"] = payroll.pop("basic_salary")
        payroll["allowances"] = payroll.pop("allowances")
        payroll["deductions"] = payroll.pop("deductions")
        payroll["netSalary"] = payroll.pop("net_salary")
    return [Payroll(**payroll) for payroll in payroll_data]

@router.get("/{payroll_id}", response_model=Payroll)
async def get_payroll_record(payroll_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific payroll record by ID"""
    db = await get_db()
    payroll = await db.payrolls.find_one({"_id": payroll_id})
    if not payroll:
        payroll = await db.payrolls.find_one({"id": payroll_id})
    if not payroll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll record not found"
        )
    
    if current_user.role not in ["admin", "hr"] and payroll.get("employee_id") != current_user.employeeId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this payroll record"
        )
    
    payroll["id"] = str(payroll.pop("_id"))
    payroll["employeeId"] = payroll.pop("employee_id")
    payroll["basicSalary"] = payroll.pop("basic_salary")
    payroll["allowances"] = payroll.pop("allowances")
    payroll["deductions"] = payroll.pop("deductions")
    payroll["netSalary"] = payroll.pop("net_salary")
    return Payroll(**payroll)

@router.post("", response_model=Payroll)
async def create_payroll(payroll: PayrollCreate, current_user: User = Depends(get_current_user)):
    """Create a payroll record (Admin/HR only)"""
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create payroll records"
        )
    
    db = await get_db()
    # Check if payroll already exists for this employee, month, and year
    existing = await db.payrolls.find_one({
        "employee_id": payroll.employeeId,
        "month": payroll.month,
        "year": payroll.year
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payroll record already exists for this employee and period"
        )
    
    net_salary = payroll.basicSalary + payroll.allowances - payroll.deductions
    
    new_payroll = {
        "employee_id": payroll.employeeId,
        "month": payroll.month,
        "year": payroll.year,
        "basic_salary": payroll.basicSalary,
        "allowances": payroll.allowances,
        "deductions": payroll.deductions,
        "net_salary": net_salary
    }
    
    result = await db.payrolls.insert_one(new_payroll)
    new_payroll["id"] = str(result.inserted_id)
    new_payroll["employeeId"] = new_payroll.pop("employee_id")
    new_payroll["basicSalary"] = new_payroll.pop("basic_salary")
    new_payroll["allowances"] = new_payroll.pop("allowances")
    new_payroll["deductions"] = new_payroll.pop("deductions")
    new_payroll["netSalary"] = new_payroll.pop("net_salary")
    return Payroll(**new_payroll)

@router.put("/{payroll_id}", response_model=Payroll)
async def update_payroll(payroll_id: str, payroll_update: PayrollCreate, current_user: User = Depends(get_current_user)):
    """Update a payroll record (Admin/HR only)"""
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update payroll records"
        )
    
    db = await get_db()
    net_salary = payroll_update.basicSalary + payroll_update.allowances - payroll_update.deductions
    
    updates = {
        "employee_id": payroll_update.employeeId,
        "month": payroll_update.month,
        "year": payroll_update.year,
        "basic_salary": payroll_update.basicSalary,
        "allowances": payroll_update.allowances,
        "deductions": payroll_update.deductions,
        "net_salary": net_salary
    }
    
    result = await db.payrolls.update_one({"_id": payroll_id}, {"$set": updates})
    if result.matched_count == 0:
        result = await db.payrolls.update_one({"id": payroll_id}, {"$set": updates})
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll record not found"
        )
    
    payroll = await db.payrolls.find_one({"_id": payroll_id})
    if not payroll:
        payroll = await db.payrolls.find_one({"id": payroll_id})
    
    payroll["id"] = str(payroll.pop("_id"))
    payroll["employeeId"] = payroll.pop("employee_id")
    payroll["basicSalary"] = payroll.pop("basic_salary")
    payroll["allowances"] = payroll.pop("allowances")
    payroll["deductions"] = payroll.pop("deductions")
    payroll["netSalary"] = payroll.pop("net_salary")
    return Payroll(**payroll)

@router.delete("/{payroll_id}")
async def delete_payroll(payroll_id: str, current_user: User = Depends(get_current_user)):
    """Delete a payroll record (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete payroll records"
        )
    
    db = await get_db()
    result = await db.payrolls.delete_one({"_id": payroll_id})
    if result.deleted_count == 0:
        result = await db.payrolls.delete_one({"id": payroll_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll record not found"
        )
    
    return {"message": "Payroll record deleted successfully"}
