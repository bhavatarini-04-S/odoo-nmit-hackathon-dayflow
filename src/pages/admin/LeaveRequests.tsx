import { useEffect, useState } from "react";
import { getEmployees } from "@/services/employeeService";
import { getLeaves, decideLeave } from "@/services/leaveService";
import { createNotification } from "@/services/notificationService";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Check, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { LeaveStatus, LeaveType } from "@/types";

export function AdminLeaveRequests() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "" as LeaveStatus | "",
    leaveType: "" as LeaveType | "",
  });
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    leaveId: string;
    comment: string;
  }>({ open: false, leaveId: "", comment: "" });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leaves, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesData, leavesData] = await Promise.all([
        getEmployees(),
        getLeaves(),
      ]);
      setEmployees(employeesData);
      setLeaves(leavesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leaves];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((l) => {
        const employee = employees.find((e) => e.employeeId === l.employeeId);
        return (
          l.employeeId.toLowerCase().includes(searchLower) ||
          employee?.fullName.toLowerCase().includes(searchLower)
        );
      });
    }

    if (filters.status) {
      filtered = filtered.filter((l) => l.status === filters.status);
    }

    if (filters.leaveType) {
      filtered = filtered.filter((l) => l.leaveType === filters.leaveType);
    }

    setFilteredLeaves(filtered);
  };

  const handleApprove = async (leaveId: string) => {
    try {
      const leave = leaves.find((l) => l.id === leaveId);
      if (!leave) return;

      await decideLeave(leaveId, "Approved", "Approved by admin");

      await createNotification({
        userId: employees.find((e) => e.employeeId === leave.employeeId)?.id || "",
        title: "Leave request approved",
        message: `Your leave request from ${format(new Date(leave.startDate), "MMM d")} to ${format(new Date(leave.endDate), "MMM d")} has been approved.`,
        type: "success",
      });

      toast.success("Leave request approved");
      loadData();
    } catch (error) {
      console.error("Failed to approve leave:", error);
      toast.error("Failed to approve leave request");
    }
  };

  const handleReject = async () => {
    try {
      const leave = leaves.find((l) => l.id === rejectDialog.leaveId);
      if (!leave) return;

      await decideLeave(rejectDialog.leaveId, "Rejected", rejectDialog.comment);

      await createNotification({
        userId: employees.find((e) => e.employeeId === leave.employeeId)?.id || "",
        title: "Leave request rejected",
        message: `Your leave request from ${format(new Date(leave.startDate), "MMM d")} to ${format(new Date(leave.endDate), "MMM d")} has been rejected. ${rejectDialog.comment}`,
        type: "alert",
      });

      toast.success("Leave request rejected");
      setRejectDialog({ open: false, leaveId: "", comment: "" });
      loadData();
    } catch (error) {
      console.error("Failed to reject leave:", error);
      toast.error("Failed to reject leave request");
    }
  };

  const getEmployee = (employeeId: string) => {
    return employees.find((e) => e.employeeId === employeeId);
  };

  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "Pending").length,
    approved: leaves.filter((l) => l.status === "Approved").length,
    rejected: leaves.filter((l) => l.status === "Rejected").length,
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Leave Requests
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Review and manage employee leave requests
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Requests</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {stats.total}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
            <p className="text-2xl font-semibold text-amber-600">
              {stats.pending}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Approved</p>
            <p className="text-2xl font-semibold text-emerald-600">
              {stats.approved}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Rejected</p>
            <p className="text-2xl font-semibold text-red-600">
              {stats.rejected}
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
          <div className="grid gap-4 md:grid-cols-3">
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value: LeaveStatus | "") =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leaveType">Leave Type</Label>
              <Select
                value={filters.leaveType}
                onValueChange={(value: LeaveType | "") =>
                  setFilters({ ...filters, leaveType: value })
                }
              >
                <SelectTrigger id="leaveType">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Sick">Sick</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() =>
                setFilters({ search: "", status: "", leaveType: "" })
              }
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLeaves.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">
              No leave requests found
            </p>
          ) : (
            <div className="space-y-4">
              {filteredLeaves.map((leave) => {
                const employee = getEmployee(leave.employeeId);
                return (
                  <div
                    key={leave.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {employee?.fullName || "Unknown"}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {leave.employeeId}
                          </p>
                          <StatusBadge status={leave.leaveType} />
                          <StatusBadge status={leave.status} />
                        </div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {format(new Date(leave.startDate), "MMM d, yyyy")} -{" "}
                          {format(new Date(leave.endDate), "MMM d, yyyy")}
                        </p>
                      </div>
                      {leave.status === "Pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setRejectDialog({
                                open: true,
                                leaveId: leave.id,
                                comment: "",
                              })
                            }
                            className="gap-1.5"
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(leave.id)}
                            className="gap-1.5"
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-900 dark:text-slate-100">
                      {leave.remarks}
                    </p>
                    {leave.adminComment && leave.status !== "Pending" && (
                      <div className="rounded-md bg-slate-50 dark:bg-slate-800 p-3">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Admin Comment:
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                          {leave.adminComment}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {rejectDialog.open && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-amber-600 dark:text-amber-400">
              Reject Leave Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectComment">Rejection Reason (Required)</Label>
              <Input
                id="rejectComment"
                placeholder="Enter reason for rejection..."
                value={rejectDialog.comment}
                onChange={(e) =>
                  setRejectDialog({ ...rejectDialog, comment: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() =>
                  setRejectDialog({ open: false, leaveId: "", comment: "" })
                }
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectDialog.comment}
              >
                Reject Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
