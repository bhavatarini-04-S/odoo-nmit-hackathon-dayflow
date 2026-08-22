from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class Role(str, Enum):
    EMPLOYEE = "employee"
    ADMIN = "admin"
    HR = "hr"

class LeaveType(str, Enum):
    PAID = "Paid"
    SICK = "Sick"
    UNPAID = "Unpaid"

class LeaveStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class NotificationType(str, Enum):
    SUCCESS = "success"
    WARNING = "warning"
    ALERT = "alert"
    INFO = "info"

class User(BaseModel):
    id: str
    employeeId: str
    fullName: str
    email: EmailStr
    role: Role
    department: str
    designation: str
    phone: str
    address: str
    profileImage: str
    joiningDate: str

class UserCreate(BaseModel):
    fullName: str
    email: EmailStr
    role: Role = Role.EMPLOYEE

class UserUpdate(BaseModel):
    fullName: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None

class Attendance(BaseModel):
    id: str
    employeeId: str
    date: str
    status: str
    checkIn: Optional[str] = None
    checkOut: Optional[str] = None

class AttendanceCreate(BaseModel):
    employeeId: str
    date: str
    status: str
    checkIn: Optional[str] = None
    checkOut: Optional[str] = None

class Leave(BaseModel):
    id: str
    employeeId: str
    leaveType: LeaveType
    startDate: str
    endDate: str
    status: LeaveStatus
    remarks: str
    adminComment: Optional[str] = None

class LeaveCreate(BaseModel):
    employeeId: str
    leaveType: LeaveType
    startDate: str
    endDate: str
    remarks: str

class LeaveDecision(BaseModel):
    status: LeaveStatus
    comment: Optional[str] = None

class Payroll(BaseModel):
    id: str
    employeeId: str
    month: int
    year: int
    basicSalary: float
    allowances: float
    deductions: float
    netSalary: float

class PayrollCreate(BaseModel):
    employeeId: str
    month: int
    year: int
    basicSalary: float
    allowances: float
    deductions: float

class Notification(BaseModel):
    id: str
    userId: str
    title: str
    message: str
    type: NotificationType
    isRead: bool
    createdAt: str

class NotificationCreate(BaseModel):
    userId: str
    title: str
    message: str
    type: NotificationType = NotificationType.INFO

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignUpRequest(BaseModel):
    fullName: str
    email: EmailStr
    password: str
