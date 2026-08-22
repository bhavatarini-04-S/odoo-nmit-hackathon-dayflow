from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, date
from ..models import Attendance, AttendanceCreate, User
from ..auth import get_current_user
from ..database import get_db
import uuid

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.get("", response_model=List[Attendance])
async def get_attendance(
    employee_id: str = None,
    date_str: str = None,
    current_user: User = Depends(get_current_user)
):
    """Get attendance records with optional filters"""
    if current_user.role not in ["admin", "hr"] and employee_id and employee_id != current_user.employeeId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view other employees' attendance"
        )
    
    db = await get_db()
    query = {}
    if employee_id:
        query["employee_id"] = employee_id
    if date_str:
        query["date"] = date_str
    
    attendance_data = await db.attendances.find(query).to_list(length=None)
    for att in attendance_data:
        att["id"] = str(att.pop("_id"))
        att["employeeId"] = att.pop("employee_id")
    return [Attendance(**att) for att in attendance_data]

@router.get("/{attendance_id}", response_model=Attendance)
async def get_attendance_record(attendance_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific attendance record by ID"""
    db = await get_db()
    attendance = await db.attendances.find_one({"_id": attendance_id})
    if not attendance:
        attendance = await db.attendances.find_one({"id": attendance_id})
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )
    
    if current_user.role not in ["admin", "hr"] and attendance.get("employee_id") != current_user.employeeId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this attendance record"
        )
    
    attendance["id"] = str(attendance.pop("_id"))
    attendance["employeeId"] = attendance.pop("employee_id")
    return Attendance(**attendance)

@router.post("/check-in")
async def check_in(current_user: User = Depends(get_current_user)):
    """Check in for the day"""
    today = date.today().isoformat()
    
    db = await get_db()
    # Check if already checked in today
    existing = await db.attendances.find_one({"employee_id": current_user.employeeId, "date": today})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked in today"
        )
    
    now = datetime.now().strftime("%H:%M")
    
    new_attendance = {
        "employee_id": current_user.employeeId,
        "date": today,
        "status": "Present",
        "check_in": now,
        "check_out": None
    }
    
    result = await db.attendances.insert_one(new_attendance)
    new_attendance["id"] = str(result.inserted_id)
    new_attendance["employeeId"] = new_attendance.pop("employee_id")
    new_attendance["checkIn"] = new_attendance.pop("check_in")
    new_attendance["checkOut"] = new_attendance.pop("check_out")
    return Attendance(**new_attendance)

@router.post("/check-out")
async def check_out(current_user: User = Depends(get_current_user)):
    """Check out for the day"""
    today = date.today().isoformat()
    
    db = await get_db()
    # Find today's attendance record
    existing = await db.attendances.find_one({"employee_id": current_user.employeeId, "date": today})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No check-in record found for today"
        )
    
    if existing.get("check_out"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked out today"
        )
    
    now = datetime.now().strftime("%H:%M")
    await db.attendances.update_one({"_id": existing["_id"]}, {"$set": {"check_out": now}})
    
    existing["check_out"] = now
    existing["id"] = str(existing.pop("_id"))
    existing["employeeId"] = existing.pop("employee_id")
    existing["checkIn"] = existing.pop("check_in")
    existing["checkOut"] = existing.pop("check_out")
    return Attendance(**existing)

@router.post("", response_model=Attendance)
async def create_attendance(attendance: AttendanceCreate, current_user: User = Depends(get_current_user)):
    """Create an attendance record (Admin/HR only)"""
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create attendance records"
        )
    
    db = await get_db()
    new_attendance = {
        "employee_id": attendance.employeeId,
        "date": attendance.date,
        "status": attendance.status,
        "check_in": attendance.checkIn,
        "check_out": attendance.checkOut
    }
    
    result = await db.attendances.insert_one(new_attendance)
    new_attendance["id"] = str(result.inserted_id)
    new_attendance["employeeId"] = new_attendance.pop("employee_id")
    new_attendance["checkIn"] = new_attendance.pop("check_in")
    new_attendance["checkOut"] = new_attendance.pop("check_out")
    return Attendance(**new_attendance)

@router.put("/{attendance_id}", response_model=Attendance)
async def update_attendance(attendance_id: str, attendance_update: AttendanceCreate, current_user: User = Depends(get_current_user)):
    """Update an attendance record (Admin/HR only)"""
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update attendance records"
        )
    
    db = await get_db()
    updates = attendance_update.model_dump()
    mongo_updates = {
        "employee_id": updates["employeeId"],
        "date": updates["date"],
        "status": updates["status"],
        "check_in": updates["checkIn"],
        "check_out": updates["checkOut"]
    }
    
    result = await db.attendances.update_one({"_id": attendance_id}, {"$set": mongo_updates})
    if result.matched_count == 0:
        result = await db.attendances.update_one({"id": attendance_id}, {"$set": mongo_updates})
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )
    
    attendance = await db.attendances.find_one({"_id": attendance_id})
    if not attendance:
        attendance = await db.attendances.find_one({"id": attendance_id})
    
    attendance["id"] = str(attendance.pop("_id"))
    attendance["employeeId"] = attendance.pop("employee_id")
    attendance["checkIn"] = attendance.pop("check_in")
    attendance["checkOut"] = attendance.pop("check_out")
    return Attendance(**attendance)
