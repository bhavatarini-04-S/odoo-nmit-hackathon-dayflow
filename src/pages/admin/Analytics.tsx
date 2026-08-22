import { useEffect, useState } from "react";
import { getEmployees } from "@/services/employeeService";
import { getAttendance } from "@/services/attendanceService";
import { getLeaves } from "@/services/leaveService";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateWorkforceInsights } from "@/utils/attendanceCalculations";
import { AlertTriangle, TrendingUp, Shield } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesData, attendanceData, leavesData] = await Promise.all([
        getEmployees(),
        getAttendance(),
        getLeaves(),
      ]);
      setEmployees(employeesData);
      setAttendance(attendanceData);
      setLeaves(leavesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyAttendanceData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
      const dayAttendance = attendance.filter((a) => a.date === date);
      const present = dayAttendance.filter((a) => a.status === "Present").length;
      const absent = dayAttendance.filter((a) => a.status === "Absent").length;
      const halfDay = dayAttendance.filter((a) => a.status === "Half-Day").length;
      return {
        date: format(subDays(new Date(), 6 - i), "EEE"),
        present,
        absent,
        halfDay,
        total: dayAttendance.length,
      };
    });
    return last7Days;
  };

  const getMonthlyAttendanceData = () => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(new Date(), 5 - i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const monthAttendance = attendance.filter((a) => {
        const date = new Date(a.date);
        return date >= start && date <= end;
      });
      const present = monthAttendance.filter((a) => a.status === "Present").length;
      const absent = monthAttendance.filter((a) => a.status === "Absent").length;
      return {
        month: format(monthDate, "MMM yyyy"),
        present,
        absent,
        total: monthAttendance.length,
      };
    });
    return last6Months;
  };

  const getDepartmentAttendanceData = () => {
    const departments = Array.from(new Set(employees.map((e) => e.department)));
    const today = format(new Date(), "yyyy-MM-dd");
    
    return departments.map((dept) => {
      const deptEmployees = employees.filter((e) => e.department === dept);
      const deptAttendanceToday = attendance.filter((a) => 
        a.date === today && deptEmployees.some((e) => e.employeeId === a.employeeId)
      );
      const present = deptAttendanceToday.filter((a) => a.status === "Present").length;
      return {
        department: dept,
        present,
        total: deptEmployees.length,
        percentage: deptEmployees.length > 0 ? Math.round((present / deptEmployees.length) * 100) : 0,
      };
    });
  };

  const getLeaveDistributionData = () => {
    const leaveTypes = ["Paid", "Sick", "Unpaid"];
    return leaveTypes.map((type) => ({
      type,
      count: leaves.filter((l) => l.leaveType === type).length,
    }));
  };

  const getLeaveStatusData = () => {
    const statuses = ["Pending", "Approved", "Rejected"];
    return statuses.map((status) => ({
      status,
      count: leaves.filter((l) => l.status === status).length,
    }));
  };

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

  if (loading) {
    return <LoadingSkeleton />;
  }

  const weeklyData = getWeeklyAttendanceData();
  const monthlyData = getMonthlyAttendanceData();
  const departmentData = getDepartmentAttendanceData();
  const leaveDistributionData = getLeaveDistributionData();
  const leaveStatusData = getLeaveStatusData();

  const workforceInsights = calculateWorkforceInsights(attendance, employees);
  const highRiskEmployees = workforceInsights.filter((i) => i.riskLevel === "High").slice(0, 3);
  const topPerformers = workforceInsights.filter((i) => i.riskLevel === "Low").slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Analytics
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Workforce insights and attendance trends
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              High Risk Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {highRiskEmployees.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {topPerformers.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Excellent attendance records
            </p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Shield className="h-5 w-5" />
              Avg Attendance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {Math.round(
                workforceInsights.reduce((sum, i) => sum + i.score, 0) / workforceInsights.length
              )}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Across all employees
            </p>
          </CardContent>
        </Card>
      </div>

      {highRiskEmployees.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              High Risk Employees - Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highRiskEmployees.map((employee) => (
                <div key={employee.employeeId} className="rounded-lg border p-3 bg-red-50 dark:bg-red-950">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {employee.employeeName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {employee.department} • {employee.employeeId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {employee.score}/100
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                        {employee.riskLevel} Risk
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {employee.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} name="Present" />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} name="Absent" />
                <Line type="monotone" dataKey="halfDay" stroke="#f59e0b" strokeWidth={2} name="Half-Day" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="Present" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department-wise Attendance (Today)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="department" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="present" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leaveDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }: any) => `${type}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {leaveDistributionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Request Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leaveStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }: any) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {leaveStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Attendance Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="percentage" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
