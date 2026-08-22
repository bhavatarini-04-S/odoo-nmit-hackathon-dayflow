import { useEffect, useState } from "react";
import { getEmployees } from "@/services/employeeService";
import { getPayroll, savePayroll } from "@/services/payrollService";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Edit, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export function AdminPayroll() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [filteredPayroll, setFilteredPayroll] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payroll, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesData, payrollData] = await Promise.all([
        getEmployees(),
        getPayroll(),
      ]);
      setEmployees(employeesData);
      setPayroll(payrollData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payroll];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((p) => {
        const employee = employees.find((e) => e.employeeId === p.employeeId);
        return (
          p.employeeId.toLowerCase().includes(searchLower) ||
          employee?.fullName.toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredPayroll(filtered);
  };

  const handleOpenModal = (record?: any) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        employeeId: record.employeeId,
        basicSalary: record.basicSalary,
        allowances: record.allowances,
        deductions: record.deductions,
        month: record.month,
        year: record.year,
      });
    } else {
      setEditingRecord(null);
      setFormData({
        employeeId: "",
        basicSalary: 0,
        allowances: 0,
        deductions: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.employeeId) {
      toast.error("Please select an employee");
      return;
    }

    try {
      setSaving(true);

      await savePayroll({
        ...formData,
        id: editingRecord?.id,
      });

      toast.success(editingRecord ? "Payroll updated successfully" : "Payroll created successfully");
      setModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to save payroll:", error);
      toast.error("Failed to save payroll");
    } finally {
      setSaving(false);
    }
  };

  const getEmployee = (employeeId: string) => {
    return employees.find((e) => e.employeeId === employeeId);
  };

  const netSalary = formData.basicSalary + formData.allowances - formData.deductions;

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Payroll Management
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Manage employee salary records
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Payroll Record
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by employee name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Employee
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Month
                  </th>
                  <th className="text-right p-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Basic Salary
                  </th>
                  <th className="text-right p-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Allowances
                  </th>
                  <th className="text-right p-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Deductions
                  </th>
                  <th className="text-right p-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Net Salary
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayroll.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No payroll records found
                    </td>
                  </tr>
                ) : (
                  filteredPayroll.map((record) => {
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
                          {months.find((m) => m.value === record.month)?.label} {record.year}
                        </td>
                        <td className="p-3 text-sm text-slate-900 dark:text-slate-100 text-right">
                          ₹{record.basicSalary.toLocaleString()}
                        </td>
                        <td className="p-3 text-sm text-emerald-600 text-right">
                          +₹{record.allowances.toLocaleString()}
                        </td>
                        <td className="p-3 text-sm text-red-600 text-right">
                          -₹{record.deductions.toLocaleString()}
                        </td>
                        <td className="p-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 text-right">
                          ₹{record.netSalary.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(record)}
                            className="gap-1.5"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Edit Payroll Record" : "Add Payroll Record"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
              >
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.employeeId}>
                      {emp.fullName} ({emp.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select
                  value={formData.month.toString()}
                  onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}
                >
                  <SelectTrigger id="month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select
                  value={formData.year.toString()}
                  onValueChange={(value) => setFormData({ ...formData, year: parseInt(value) })}
                >
                  <SelectTrigger id="year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="basicSalary">Basic Salary</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="basicSalary"
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) || 0 })}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowances">Allowances</Label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500" />
                <Input
                  id="allowances"
                  type="number"
                  value={formData.allowances}
                  onChange={(e) => setFormData({ ...formData, allowances: parseFloat(e.target.value) || 0 })}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deductions">Deductions</Label>
              <div className="relative">
                <TrendingDown className="absolute left-3 top-2.5 h-4 w-4 text-red-500" />
                <Input
                  id="deductions"
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="rounded-lg border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Net Salary (Auto-calculated)
                </span>
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  ₹{netSalary.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingRecord ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
