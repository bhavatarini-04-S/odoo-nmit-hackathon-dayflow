import { useEffect, useState } from "react";
import { getEmployees } from "@/services/employeeService";
import { getAttendance } from "@/services/attendanceService";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown, Filter } from "lucide-react";
import { format } from "date-fns";

export function AdminAttendance() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [attendance, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesData, attendanceData] = await Promise.all([
        getEmployees(),
        getAttendance(),
      ]);
      setEmployees(employeesData);
      setAttendance(attendanceData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendance];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((a) => {
        const employee = employees.find((e) => e.employeeId === a.employeeId);
        return (
          a.employeeId.toLowerCase().includes(searchLower) ||
          employee?.fullName.toLowerCase().includes(searchLower)
        );
      });
    }

    if (filters.department) {
      filtered = filtered.filter((a) => {
        const employee = employees.find((e) => e.employeeId === a.employeeId);
        return employee?.department === filters.department;
      });
    }

    if (filters.status) {
      filtered = filtered.filter((a) => a.status === filters.status);
    }

    if (filters.startDate) {
      filtered = filtered.filter((a) => a.date >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter((a) => a.date <= filters.endDate);
    }

    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === "employeeName") {
          const empA = employees.find((e) => e.employeeId === a.employeeId);
          const empB = employees.find((e) => e.employeeId === b.employeeId);
          aValue = empA?.fullName || "";
          bValue = empB?.fullName || "";
        } else if (sortConfig.key === "department") {
          const empA = employees.find((e) => e.employeeId === a.employeeId);
          const empB = employees.find((e) => e.employeeId === b.employeeId);
          aValue = empA?.department || "";
          bValue = empB?.department || "";
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredAttendance(filtered);
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getEmployee = (employeeId: string) => {
    return employees.find((e) => e.employeeId === employeeId);
  };

  const departments = Array.from(new Set(employees.map((e) => e.department)));

  const stats = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter((a) => a.status === "Present").length,
    absent: filteredAttendance.filter((a) => a.status === "Absent").length,
    halfDay: filteredAttendance.filter((a) => a.status === "Half-Day").length,
    leave: filteredAttendance.filter((a) => a.status === "Leave").length,
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Attendance Management
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          View and manage employee attendance records
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Records</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {stats.total}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Present</p>
            <p className="text-2xl font-semibold text-emerald-600">
              {stats.present}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Absent</p>
            <p className="text-2xl font-semibold text-red-600">
              {stats.absent}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Half-Day</p>
            <p className="text-2xl font-semibold text-amber-600">
              {stats.halfDay}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Name or ID..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={filters.department}
                onValueChange={(value) =>
                  setFilters({ ...filters, department: value })
                }
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Half-Day">Half-Day</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  search: "",
                  department: "",
                  status: "",
                  startDate: "",
                  endDate: "",
                })
              }
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("employeeName")}
                      className="gap-1.5"
                    >
                      Employee
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("department")}
                      className="gap-1.5"
                    >
                      Department
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("date")}
                      className="gap-1.5"
                    >
                      Date
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-center p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("status")}
                      className="gap-1.5"
                    >
                      Status
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-left p-3">Check In</th>
                  <th className="text-left p-3">Check Out</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => {
                    const employee = getEmployee(record.employeeId);
                    return (
                      <tr key={record.id} className="border-b">
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {employee?.fullName || "Unknown"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {record.employeeId}
                            </p>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-slate-900 dark:text-slate-100">
                          {employee?.department || "-"}
                        </td>
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
