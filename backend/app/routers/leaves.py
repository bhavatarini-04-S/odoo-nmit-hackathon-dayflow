from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..models import Leave, LeaveCreate, LeaveDecision, User
from ..auth import get_current_user
from ..database import get_db
import uuid

router = APIRouter(prefix="/leaves", tags=["Leaves"])

@router.get("", response_model=List[Leave])
async def get_leaves(
    employee_id: str = None,
    current_user: User = Depends(get_current_user)
):
    """Get leave requests with optional filter by employee"""
    if current_user.role not in ["admin", "hr"] and employee_id and employee_id != current_user.employeeId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view other employees' leaves"
        )
    
    db = await get_db()
    query = {}
    if employee_id:
        query["employee_id"] = employee_id
    elif current_user.role == "employee":
        query["employee_id"] = current_user.employeeId
    
    leaves_data = await db.leaves.find(query).to_list(length=None)
    for leave in leaves_data:
        leave["id"] = str(leave.pop("_id"))
        leave["employeeId"] = leave.pop("employee_id")
        leave["leaveType"] = leave.pop("leave_type")
        leave["startDate"] = leave.pop("start_date")
        leave["endDate"] = leave.pop("end_date")
        leave["adminComment"] = leave.pop("admin_comment")
    return [Leave(**leave) for leave in leaves_data]

@router.get("/{leave_id}", response_model=Leave)
async def get_leave(leave_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific leave request by ID"""
    db = await get_db()
    leave = await db.leaves.find_one({"_id": leave_id})
    if not leave:
        leave = await db.leaves.find_one({"id": leave_id})
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found"
        )
    
    if current_user.role not in ["admin", "hr"] and leave.get("employee_id") != current_user.employeeId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this leave request"
        )
    
    leave["id"] = str(leave.pop("_id"))
    leave["employeeId"] = leave.pop("employee_id")
    leave["leaveType"] = leave.pop("leave_type")
    leave["startDate"] = leave.pop("start_date")
    leave["endDate"] = leave.pop("end_date")
    leave["adminComment"] = leave.pop("admin_comment")
    return Leave(**leave)

@router.post("", response_model=Leave)
async def create_leave(leave: LeaveCreate, current_user: User = Depends(get_current_user)):
    """Create a new leave request"""
    # Employees can only create leaves for themselves
    if current_user.role == "employee" and leave.employeeId != current_user.employeeId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only create leave requests for yourself"
        )
    
    db = await get_db()
    new_leave = {
        "employee_id": leave.employeeId,
        "leave_type": leave.leaveType.value if hasattr(leave.leaveType, 'value') else leave.leaveType,
        "start_date": leave.startDate,
        "end_date": leave.endDate,
        "status": "Pending",
        "remarks": leave.remarks,
        "admin_comment": None
    }
    
    result = await db.leaves.insert_one(new_leave)
    new_leave["id"] = str(result.inserted_id)
    new_leave["employeeId"] = new_leave.pop("employee_id")
    new_leave["leaveType"] = new_leave.pop("leave_type")
    new_leave["startDate"] = new_leave.pop("start_date")
    new_leave["endDate"] = new_leave.pop("end_date")
    new_leave["adminComment"] = new_leave.pop("admin_comment")
    return Leave(**new_leave)

@router.put("/{leave_id}/decision")
async def decide_leave(leave_id: str, decision: LeaveDecision, current_user: User = Depends(get_current_user)):
    """Approve or reject a leave request (Admin/HR only)"""
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to approve/reject leaves"
        )
    
    db = await get_db()
    leave = await db.leaves.find_one({"_id": leave_id})
    if not leave:
        leave = await db.leaves.find_one({"id": leave_id})
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found"
        )
    
    if leave.get("status") != "Pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Leave request has already been processed"
        )
    
    updates = {
        "status": decision.status.value if hasattr(decision.status, 'value') else decision.status,
        "admin_comment": decision.comment
    }
    
    await db.leaves.update_one({"_id": leave["_id"]}, {"$set": updates})
    
    leave["status"] = updates["status"]
    leave["admin_comment"] = updates["admin_comment"]
    leave["id"] = str(leave.pop("_id"))
    leave["employeeId"] = leave.pop("employee_id")
    leave["leaveType"] = leave.pop("leave_type")
    leave["startDate"] = leave.pop("start_date")
    leave["endDate"] = leave.pop("end_date")
    leave["adminComment"] = leave.pop("admin_comment")
    return Leave(**leave)

@router.delete("/{leave_id}")
async def delete_leave(leave_id: str, current_user: User = Depends(get_current_user)):
    """Delete a leave request (only pending ones by the employee)"""
    db = await get_db()
    leave = await db.leaves.find_one({"_id": leave_id})
    if not leave:
        leave = await db.leaves.find_one({"id": leave_id})
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found"
        )
    
    # Only the employee who created it can delete it, and only if it's pending
    if leave.get("employee_id") != current_user.employeeId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this leave request"
        )
    
    if leave.get("status") != "Pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only delete pending leave requests"
        )
    
    await db.leaves.delete_one({"_id": leave["_id"]})
    return {"message": "Leave request deleted successfully"}
