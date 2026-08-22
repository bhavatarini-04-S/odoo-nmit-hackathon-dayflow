from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from ..models import Notification, NotificationCreate, User
from ..auth import get_current_user
from ..database import get_db
import uuid

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[Notification])
async def get_notifications(current_user: User = Depends(get_current_user)):
    """Get all notifications for the current user"""
    db = await get_db()
    notifications_data = await db.notifications.find({"user_id": current_user.employeeId}).to_list(length=None)
    
    # Sort by createdAt descending (newest first)
    notifications_data.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    for notif in notifications_data:
        notif["id"] = str(notif.pop("_id"))
        notif["userId"] = notif.pop("user_id")
        notif["isRead"] = notif.pop("is_read")
        notif["createdAt"] = notif.pop("created_at")
    return [Notification(**notif) for notif in notifications_data]

@router.get("/unread", response_model=List[Notification])
async def get_unread_notifications(current_user: User = Depends(get_current_user)):
    """Get unread notifications for the current user"""
    db = await get_db()
    unread_notifications = await db.notifications.find({
        "user_id": current_user.employeeId,
        "is_read": False
    }).to_list(length=None)
    
    # Sort by createdAt descending (newest first)
    unread_notifications.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    for notif in unread_notifications:
        notif["id"] = str(notif.pop("_id"))
        notif["userId"] = notif.pop("user_id")
        notif["isRead"] = notif.pop("is_read")
        notif["createdAt"] = notif.pop("created_at")
    return [Notification(**notif) for notif in unread_notifications]

@router.get("/{notification_id}", response_model=Notification)
async def get_notification(notification_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific notification by ID"""
    db = await get_db()
    notification = await db.notifications.find_one({"_id": notification_id})
    if not notification:
        notification = await db.notifications.find_one({"id": notification_id})
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    if notification.get("user_id") != current_user.employeeId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this notification"
        )
    
    notification["id"] = str(notification.pop("_id"))
    notification["userId"] = notification.pop("user_id")
    notification["isRead"] = notification.pop("is_read")
    notification["createdAt"] = notification.pop("created_at")
    return Notification(**notification)

@router.post("", response_model=Notification)
async def create_notification(notification: NotificationCreate, current_user: User = Depends(get_current_user)):
    """Create a new notification (Admin/HR only)"""
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create notifications"
        )
    
    db = await get_db()
    new_notification = {
        "user_id": notification.userId,
        "title": notification.title,
        "message": notification.message,
        "type": notification.type.value if hasattr(notification.type, 'value') else notification.type,
        "is_read": False,
        "created_at": datetime.now().isoformat()
    }
    
    result = await db.notifications.insert_one(new_notification)
    new_notification["id"] = str(result.inserted_id)
    new_notification["userId"] = new_notification.pop("user_id")
    new_notification["isRead"] = new_notification.pop("is_read")
    new_notification["createdAt"] = new_notification.pop("created_at")
    return Notification(**new_notification)

@router.put("/{notification_id}/mark-read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    """Mark a notification as read"""
    db = await get_db()
    notification = await db.notifications.find_one({"_id": notification_id})
    if not notification:
        notification = await db.notifications.find_one({"id": notification_id})
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    if notification.get("user_id") != current_user.employeeId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this notification"
        )
    
    await db.notifications.update_one({"_id": notification["_id"]}, {"$set": {"is_read": True}})
    
    notification["is_read"] = True
    notification["id"] = str(notification.pop("_id"))
    notification["userId"] = notification.pop("user_id")
    notification["isRead"] = notification.pop("is_read")
    notification["createdAt"] = notification.pop("created_at")
    return Notification(**notification)

@router.put("/mark-all-read")
async def mark_all_notifications_read(current_user: User = Depends(get_current_user)):
    """Mark all notifications as read for the current user"""
    db = await get_db()
    result = await db.notifications.update_many(
        {"user_id": current_user.employeeId, "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return {"message": f"Marked {result.modified_count} notifications as read"}

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, current_user: User = Depends(get_current_user)):
    """Delete a notification"""
    db = await get_db()
    notification = await db.notifications.find_one({"_id": notification_id})
    if not notification:
        notification = await db.notifications.find_one({"id": notification_id})
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    if notification.get("user_id") != current_user.employeeId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this notification"
        )
    
    await db.notifications.delete_one({"_id": notification["_id"]})
    return {"message": "Notification deleted successfully"}
