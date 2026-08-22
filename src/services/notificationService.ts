import { notifications } from "../mock/mockData";
import type { Notification, NotificationType } from "../types";
import { mockApi, newMockId } from "./mockApi";

export async function getNotifications(
  userId: string,
): Promise<Notification[]> {
  return mockApi(() =>
    notifications
      .filter((item) => item.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}
export async function createNotification(
  data: Omit<Notification, "id" | "isRead" | "createdAt">,
): Promise<Notification> {
  return mockApi(() => {
    const notification: Notification = {
      ...data,
      id: newMockId("notification"),
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    notifications.unshift(notification);
    return notification;
  });
}
export async function markNotificationRead(id: string): Promise<Notification> {
  return mockApi(() => {
    const notification = notifications.find((item) => item.id === id);
    if (!notification) throw new Error("Notification not found");
    notification.isRead = true;
    return notification;
  });
}
export type { NotificationType };
