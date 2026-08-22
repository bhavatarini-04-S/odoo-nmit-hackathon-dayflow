import { useEffect, useState } from "react";
import { getEmployees } from "@/services/employeeService";
import { getAttendance } from "@/services/attendanceService";
import { getLeaves } from "@/services/leaveService";
import { decideLeave } from "@/services/leaveService";
import { createNotification } from "@/services/notificationService";
import { StatCard } from "@/components/dashboard/StatCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Building2,
  Check,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";
import { toast } from "sonner";

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    pendingLeaves: 0,
    attendanceRate: 0,
    departments: 0,
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), "yyyy-MM-dd");

      const [employees, attendance, leaves] = await Promise.all([
        getEmployees(),
        getAttendance(),
        getLeaves({ status: "Pending" }),
      ]);

      const todayAttendance = attendance.filter((a) => a.date === today);
      const presentToday = todayAttendance.filter(
        (a) => a.status === "Present"
      ).length;
      const absentToday = todayAttendance.filter(
        (a) => a.status === "Absent"
      ).length;

      const attendanceRate =
        todayAttendance.length > 0
          ? Math.round((presentToday / todayAttendance.length) * 100)
          : 0;

      const departments = new Set(employees.map((e) => e.department)).size;

      setStats({
        totalEmployees: employees.length,
        presentToday,
        absentToday,
        pendingLeaves: leaves.length,
        attendanceRate,
        departments,
      });

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
        const dayAttendance = attendance.filter((a) => a.date === date);
        const present = dayAttendance.filter((a) => a.status === "Present").length;
        return {
          date: format(subDays(new Date(), 6 - i), "EEE"),
          present,
          total: dayAttendance.length,
        };
      });
      setWeeklyData(last7Days);

      setPendingLeaveRequests(leaves.slice(0, 5));

      const deptAttendance = employees.map((emp) => {
        const empAttendance = attendance.filter(
          (a) => a.employeeId === emp.employeeId && a.date === today
        );
        return {
          department: emp.department,
          present: empAttendance.filter((a) => a.status === "Present").length,
          total: empAttendance.length,
        };
      });

      const deptSummary = deptAttendance.reduce((acc, curr) => {
        const existing = acc.find((d) => d.department === curr.department);
        if (existing) {
          existing.present += curr.present;
          existing.total += curr.total;
        } else {
          acc.push({ ...curr });
        }
        return acc;
      }, [] as any[]);

      setDepartmentData(deptSummary);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveDecision = async (
    leaveId: string,
    status: "Approved" | "Rejected",
    comment?: string
  ) => {
    try {
      const leave = pendingLeaveRequests.find((l) => l.id === leaveId);
      if (!leave) return;

      await decideLeave(leaveId, status, comment || null);

      await createNotification({
        userId: leave.employeeId,
        title: `Leave request ${status.toLowerCase()}`,
        message: `Your leave request has been ${status.toLowerCase()}${
          comment ? `. ${comment}` : ""
        }`,
        type: status === "Approved" ? "success" : "alert",
      });

      toast.success(`Leave request ${status.toLowerCase()}`);
      loadDashboardData();
    } catch (error) {
      toast.error("Failed to process leave request");
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Overview of workforce metrics and pending actions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          icon={UserCheck}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Absent Today"
          value={stats.absentToday}
          icon={AlertTriangle}
          trend={{ value: 2, isPositive: false }}
        />
        <StatCard
          title="Pending Leaves"
          value={stats.pendingLeaves}
          icon={Calendar}
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard
          title="Departments"
          value={stats.departments}
          icon={Building2}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="#6366f1"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department-wise Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingLeaveRequests.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No pending leave requests
            </p>
          ) : (
            <div className="space-y-4">
              {pendingLeaveRequests.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {leave.employeeId}
                      </p>
                      <StatusBadge status={leave.leaveType} />
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {format(new Date(leave.startDate), "MMM d")} -{" "}
                      {format(new Date(leave.endDate), "MMM d, yyyy")}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {leave.remarks}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const comment = prompt(
                          "Enter rejection reason (optional):"
                        );
                        if (comment !== null) {
                          handleLeaveDecision(leave.id, "Rejected", comment);
                        }
                      }}
                      className="gap-1.5"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleLeaveDecision(leave.id, "Approved")
                      }
                      className="gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
