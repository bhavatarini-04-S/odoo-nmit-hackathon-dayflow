import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getPayroll } from "@/services/payrollService";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, TrendingDown, FileText } from "lucide-react";

export function Payroll() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [loading, setLoading] = useState(true);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadPayroll();
  }, [currentUser, selectedMonth, selectedYear]);

  const loadPayroll = async () => {
    try {
      setLoading(true);
      const data = await getPayroll({
        employeeId: currentUser?.employeeId,
        month: selectedMonth,
        year: selectedYear,
      });
      setPayroll(data);
    } catch (error) {
      console.error("Failed to load payroll:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentPayslip = payroll.find(
    (p) => p.month === selectedMonth && p.year === selectedYear
  );

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

  const years = [2024, 2025, 2026];

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Payroll
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          View your payslips and salary history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Select Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger>
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
            <div className="flex-1">
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentPayslip ? (
        <Card>
          <CardHeader>
            <CardTitle>Payslip Breakdown</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Basic Salary</p>
                </div>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  ₹{currentPayslip.basicSalary.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Allowances</p>
                </div>
                <p className="mt-2 text-2xl font-semibold text-emerald-600">
                  +₹{currentPayslip.allowances.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Deductions</p>
                </div>
                <p className="mt-2 text-2xl font-semibold text-red-600">
                  -₹{currentPayslip.deductions.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="rounded-lg border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Net Salary</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    After all deductions
                  </p>
                </div>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  ₹{currentPayslip.netSalary.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-slate-900 dark:text-slate-100">
                Detailed Breakdown
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Basic Salary</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    ₹{currentPayslip.basicSalary.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-slate-600 dark:text-slate-400">HRA Allowance</span>
                  <span className="text-sm font-medium text-emerald-600">
                    +₹{Math.round(currentPayslip.allowances * 0.4).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Medical Allowance</span>
                  <span className="text-sm font-medium text-emerald-600">
                    +₹{Math.round(currentPayslip.allowances * 0.3).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Transport Allowance</span>
                  <span className="text-sm font-medium text-emerald-600">
                    +₹{Math.round(currentPayslip.allowances * 0.3).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Provident Fund</span>
                  <span className="text-sm font-medium text-red-600">
                    -₹{Math.round(currentPayslip.deductions * 0.6).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Professional Tax</span>
                  <span className="text-sm font-medium text-red-600">
                    -₹{Math.round(currentPayslip.deductions * 0.4).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 font-semibold">
                  <span className="text-sm text-slate-900 dark:text-slate-100">Net Salary</span>
                  <span className="text-sm text-indigo-600 dark:text-indigo-400">
                    ₹{currentPayslip.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12">
            <p className="text-center text-slate-500 dark:text-slate-400">
              No payslip available for {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Salary History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Month
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Year
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
                </tr>
              </thead>
              <tbody>
                {payroll.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No payroll records found
                    </td>
                  </tr>
                ) : (
                  payroll.map((record) => (
                    <tr key={record.id} className="border-b">
                      <td className="p-3 text-sm text-slate-900 dark:text-slate-100">
                        {months.find((m) => m.value === record.month)?.label}
                      </td>
                      <td className="p-3 text-sm text-slate-900 dark:text-slate-100">
                        {record.year}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
