import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getLeaves, createLeave } from "@/services/leaveService";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Send, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { LeaveType } from "@/services/leaveService";

export function Leave() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"apply" | "requests">("apply");
  const [leaves, setLeaves] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: "Paid" as LeaveType,
    startDate: "",
    endDate: "",
    remarks: "",
  });

  useEffect(() => {
    loadLeaves();
  }, [currentUser]);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaves({ employeeId: currentUser?.employeeId });
      setLeaves(data);
    } catch (error) {
      console.error("Failed to load leaves:", error);
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formData.startDate || !formData.endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      setSubmitting(true);
      await createLeave({
        employeeId: currentUser.employeeId,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        remarks: formData.remarks,
      });
      toast.success("Leave request submitted successfully");
      setFormData({
        leaveType: "Paid",
        startDate: "",
        endDate: "",
        remarks: "",
      });
      loadLeaves();
    } catch (error) {
      console.error("Failed to submit leave:", error);
      toast.error("Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Leave Management
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Apply for leave and track your requests
        </p>
      </div>

      <div className="flex gap-6 border-b">
        <button
          onClick={() => setActiveTab("apply")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "apply"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          Apply for Leave
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "requests"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          My Requests
        </button>
      </div>

      {activeTab === "apply" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Submit Leave Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type</Label>
                  <Select
                    value={formData.leaveType}
                    onValueChange={(value: LeaveType) =>
                      setFormData({ ...formData, leaveType: value })
                    }
                  >
                    <SelectTrigger id="leaveType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid Leave</SelectItem>
                      <SelectItem value="Sick">Sick Leave</SelectItem>
                      <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="pl-9"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="pl-9"
                      min={formData.startDate || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Total Days</Label>
                  <Input
                    value={calculateDays()}
                    readOnly
                    className="bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Reason for leave..."
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Leave Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaves.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No leave requests found
              </p>
            ) : (
              <div className="space-y-4">
                {leaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={leave.leaveType} />
                        <StatusBadge status={leave.status} />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {format(new Date(leave.startDate), "MMM d")} -{" "}
                        {format(new Date(leave.endDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <p className="text-sm text-slate-900 dark:text-slate-100">
                      {leave.remarks}
                    </p>
                    {leave.adminComment && (
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
