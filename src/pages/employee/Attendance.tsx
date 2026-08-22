import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { checkIn, checkOut, getAttendance } from "@/services/attendanceService";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, LogOut } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subDays, addDays } from "date-fns";
import { toast } from "sonner";

export function Attendance() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [weekStart, setWeekStart] = useState(new Date());

  useEffect(() => {
    loadAttendance();
  }, [currentUser]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const data = await getAttendance({ employeeId: currentUser?.employeeId });
      setAttendance(data);

      const today = format(new Date(), "yyyy-MM-dd");
      const todayData = data.find((a) => a.date === today);
      setTodayRecord(todayData);
    } catch (error) {
      console.error("Failed to load attendance:", error);
      toast.error("Failed to load attendance");
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
      loadAttendance();
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
      loadAttendance();
    } catch (error) {
      toast.error("Failed to check out");
    }
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  };

  const getMonthDays = () => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return eachDayOfInterval({ start, end });
  };

  const getAttendanceForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return attendance.find((a) => a.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-emerald-500";
      case "Absent":
        return "bg-red-500";
      case "Half-Day":
        return "bg-amber-500";
      case "Leave":
        return "bg-slate-400";
      default:
        return "bg-slate-200";
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  const weekDays = getWeekDays();
  const monthDays = getMonthDays();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Attendance
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Track your daily attendance and work hours
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                {todayRecord ? (
                  <StatusBadge status={todayRecord.status} />
                ) : (
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Not Checked In
                  </p>
                )}
              </div>
              {todayRecord?.checkIn && (
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Check In</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {todayRecord.checkIn}
                  </p>
                </div>
              )}
              {todayRecord?.checkOut && (
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Check Out</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {todayRecord.checkOut}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {!todayRecord?.checkIn ? (
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
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>This Week</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekStart(subDays(weekStart, 7))}
                className="gap-1.5"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekStart(addDays(weekStart, 7))}
                className="gap-1.5"
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const record = getAttendanceForDate(day);
              return (
                <div
                  key={day.toISOString()}
                  className="flex flex-col items-center p-3 rounded-lg border bg-white dark:bg-slate-900"
                >
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {format(day, "EEE")}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {format(day, "d")}
                  </p>
                  <div
                    className={`mt-2 h-2 w-2 rounded-full ${getStatusColor(
                      record?.status || ""
                    )}`}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {format(selectedMonth, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1)))}
                className="gap-1.5"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth(new Date())}
                className="gap-1.5"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1)))}
                className="gap-1.5"
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-slate-600 dark:text-slate-400 p-2">
                {day}
              </div>
            ))}
            {monthDays.map((day) => {
              const record = getAttendanceForDate(day);
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`flex flex-col items-center p-2 rounded-lg border ${
                    isToday ? "ring-2 ring-indigo-500" : ""
                  } bg-white dark:bg-slate-900`}
                >
                  <p className={`text-sm ${isToday ? "font-bold" : ""} text-slate-900 dark:text-slate-100`}>
                    {format(day, "d")}
                  </p>
                  <div
                    className={`mt-1 h-2 w-2 rounded-full ${getStatusColor(
                      record?.status || ""
                    )}`}
                  />
                  {record?.checkIn && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {record.checkIn}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Date
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Status
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Check In
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Check Out
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 20).map((record) => (
                  <tr key={record.id} className="border-b">
                    <td className="p-3 text-sm text-slate-900 dark:text-slate-100">
                      {format(new Date(record.date), "MMM d, yyyy")}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="p-3 text-sm text-slate-900 dark:text-slate-100">
                      {record.checkIn || "-"}
                    </td>
                    <td className="p-3 text-sm text-slate-900 dark:text-slate-100">
                      {record.checkOut || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
