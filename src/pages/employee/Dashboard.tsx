import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { checkIn, checkOut, getAttendance } from "@/services/attendanceService";
import { getLeaves } from "@/services/leaveService";
import { getNotifications } from "@/services/notificationService";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, Clock, LogIn, LogOut, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState({
    todayStatus: "-",
    checkInTime: "-",
    attendancePercentage: 0,
    leaveBalance: 12,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), "yyyy-MM-dd");

      const [attendanceData, leavesData, notifs] = await Promise.all([
        getAttendance({ employeeId: currentUser?.employeeId }),
        getLeaves({ employeeId: currentUser?.employeeId }),
        getNotifications(currentUser?.id || ""),
      ]);

      const todayRecord = attendanceData.find((a) => a.date === today);
      setTodayAttendance(todayRecord);

      const presentDays = attendanceData.filter((a) => a.status === "Present").length;
      const totalDays = attendanceData.length;
      const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      const approvedLeaves = leavesData.filter((l) => l.status === "Approved").length;
      const leaveBalance = 12 - approvedLeaves;

      setAttendanceStats({
        todayStatus: todayRecord?.status || "Not Checked In",
        checkInTime: todayRecord?.checkIn || "-",
        attendancePercentage: percentage,
        leaveBalance,
      });

      const activityItems = attendanceData
        .slice(0, 5)
        .map((a) => ({
          id: a.id,
          type: a.checkIn ? "check-in" : "attendance",
          title: `${a.status} on ${format(new Date(a.date), "MMM d")}`,
          timestamp: `${a.date}T${a.checkIn || "09:00"}`,
          status: a.status === "Present" ? "success" : a.status === "Absent" ? "error" : "warning",
        }));

      setActivities(activityItems);
      setNotifications(notifs.slice(0, 3));
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!currentUser) return;
    try {
      const now = new Date();
      const time = format(now, "HH:mm");
      const date = format(now, "yyyy-MM-dd");
      await checkIn(currentUser.employeeId, date, time);
      toast.success("Checked in successfully");
      loadDashboardData();
    } catch (error) {
      toast.error("Failed to check in");
    }
  };

  const handleCheckOut = async () => {
    if (!currentUser) return;
    try {
      const now = new Date();
      const time = format(now, "HH:mm");
      const date = format(now, "yyyy-MM-dd");
      await checkOut(currentUser.employeeId, date, time);
      toast.success("Checked out successfully");
      loadDashboardData();
    } catch (error) {
      toast.error("Failed to check out");
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  const greeting =
    currentTime.getHours() < 12
      ? "Good morning"
      : currentTime.getHours() < 18
      ? "Good afternoon"
      : "Good evening";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {greeting}, {currentUser?.fullName?.split(" ")[0]}!
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {format(currentTime, "EEEE, MMMM d, yyyy • h:mm:ss a")}
          </p>
        </div>
        <div className="relative">
          <Button variant="outline" size="icon" className="relative h-9 w-9">
            <Bell className="h-5 w-5" />
            {notifications.some((n) => !n.isRead) && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Attendance"
          value={attendanceStats.todayStatus}
          icon={UserCheck}
        />
        <StatCard
          title="Check-in Time"
          value={attendanceStats.checkInTime}
          icon={Clock}
        />
        <StatCard
          title="Attendance %"
          value={`${attendanceStats.attendancePercentage}%`}
          icon={Calendar}
        />
        <StatCard
          title="Leave Balance"
          value={attendanceStats.leaveBalance}
          icon={Calendar}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {!todayAttendance?.checkIn ? (
              <Button onClick={handleCheckIn} className="gap-2">
                <LogIn className="h-4 w-4" />
                Check In
              </Button>
            ) : (
              <Button onClick={handleCheckOut} variant="outline" className="gap-2">
                <LogOut className="h-4 w-4" />
                Check Out
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate("/employee/leave")}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Apply for Leave
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/employee/attendance")}
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              View Attendance
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityFeed activities={activities} />
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No notifications
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`rounded-lg border p-3 ${
                      !notif.isRead
                        ? "bg-indigo-50 dark:bg-indigo-950/20"
                        : "bg-white dark:bg-slate-900"
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {notif.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
