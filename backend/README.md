# DayFlow Backend API

FastAPI backend for the DayFlow HR Management System.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /auth/login` - Login and get access token
- `POST /auth/signup` - Register new user
- `GET /auth/me` - Get current user info

### Employees
- `GET /employees` - Get all employees (Admin/HR)
- `GET /employees/{employee_id}` - Get specific employee
- `POST /employees` - Create new employee (Admin/HR)
- `PUT /employees/{employee_id}` - Update employee
- `DELETE /employees/{employee_id}` - Delete employee (Admin)

### Attendance
- `GET /attendance` - Get attendance records
- `GET /attendance/{attendance_id}` - Get specific attendance
- `POST /attendance/check-in` - Check in for the day
- `POST /attendance/check-out` - Check out for the day
- `POST /attendance` - Create attendance record (Admin/HR)
- `PUT /attendance/{attendance_id}` - Update attendance (Admin/HR)

### Leaves
- `GET /leaves` - Get leave requests
- `GET /leaves/{leave_id}` - Get specific leave
- `POST /leaves` - Create leave request
- `PUT /leaves/{leave_id}/decision` - Approve/reject leave (Admin/HR)
- `DELETE /leaves/{leave_id}` - Delete pending leave request

### Payroll
- `GET /payroll` - Get payroll records
- `GET /payroll/{payroll_id}` - Get specific payroll
- `POST /payroll` - Create payroll record (Admin/HR)
- `PUT /payroll/{payroll_id}` - Update payroll (Admin/HR)
- `DELETE /payroll/{payroll_id}` - Delete payroll (Admin)

### Notifications
- `GET /notifications` - Get all notifications
- `GET /notifications/unread` - Get unread notifications
- `GET /notifications/{notification_id}` - Get specific notification
- `POST /notifications` - Create notification (Admin/HR)
- `PUT /notifications/{notification_id}/mark-read` - Mark as read
- `PUT /notifications/mark-all-read` - Mark all as read
- `DELETE /notifications/{notification_id}` - Delete notification

## Data Storage

Data is stored in JSON files in the `backend/data/` directory:
- `employees.json` - Employee records
- `attendance.json` - Attendance records
- `leaves.json` - Leave requests
- `payroll.json` - Payroll records
- `notifications.json` - Notifications

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Roles

- **employee** - Can view/edit own data, create leave requests, check-in/out
- **hr** - Can view all employee data, approve/reject leaves, manage payroll
- **admin** - Full access including employee management
