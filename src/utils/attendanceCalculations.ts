import type { Attendance } from "../types";

export interface AttendanceScoreResult {
  score: number;
  riskLevel: "Low" | "Medium" | "High";
  reasoning: string;
}

export function calculateAttendanceScore(
  attendanceRecords: Attendance[],
  employeeId: string
): AttendanceScoreResult {
  const employeeAttendance = attendanceRecords.filter(
    (a) => a.employeeId === employeeId
  );

  if (employeeAttendance.length === 0) {
    return {
      score: 0,
      riskLevel: "High",
      reasoning: "No attendance records available for this employee.",
    };
  }

  const totalDays = employeeAttendance.length;
  const presentDays = employeeAttendance.filter((a) => a.status === "Present").length;
  const absentDays = employeeAttendance.filter((a) => a.status === "Absent").length;
  const halfDays = employeeAttendance.filter((a) => a.status === "Half-Day").length;

  // Count late check-ins (after 9:30 AM)
  const lateCheckIns = employeeAttendance.filter(
    (a) => a.checkIn && a.checkIn > "09:30"
  ).length;

  // Calculate base attendance percentage
  const effectivePresent = presentDays + halfDays * 0.5;
  const attendancePercentage = (effectivePresent / totalDays) * 100;

  // Calculate score (0-100)
  let score = attendancePercentage;

  // Deduct points for absences
  score -= (absentDays / totalDays) * 20;

  // Deduct points for late check-ins
  score -= (lateCheckIns / totalDays) * 10;

  // Bonus for perfect attendance
  if (absentDays === 0 && lateCheckIns === 0) {
    score += 5;
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine risk level
  let riskLevel: "Low" | "Medium" | "High";
  let reasoning: string;

  if (score >= 85) {
    riskLevel = "Low";
    reasoning = `Excellent attendance (${attendancePercentage.toFixed(1)}% present). ${
      lateCheckIns > 0 ? `${lateCheckIns} late arrival(s).` : "No late arrivals."
    }`;
  } else if (score >= 70) {
    riskLevel = "Medium";
    reasoning = `Good attendance (${attendancePercentage.toFixed(1)}% present). ${
      absentDays > 0 ? `${absentDays} absence(s).` : ""
    } ${
      lateCheckIns > 0 ? `${lateCheckIns} late arrival(s).` : ""
    } Room for improvement.`;
  } else {
    riskLevel = "High";
    reasoning = `Poor attendance (${attendancePercentage.toFixed(1)}% present). ${
      absentDays > 0 ? `${absentDays} absence(s).` : ""
    } ${
      lateCheckIns > 0 ? `${lateCheckIns} late arrival(s).` : ""
    } Immediate attention required.`;
  }

  return {
    score: Math.round(score),
    riskLevel,
    reasoning,
  };
}

export function calculateWorkforceInsights(
  attendanceRecords: Attendance[],
  employees: any[]
) {
  const insights = employees.map((employee) => {
    const scoreResult = calculateAttendanceScore(attendanceRecords, employee.employeeId);
    return {
      employeeId: employee.employeeId,
      employeeName: employee.fullName,
      department: employee.department,
      ...scoreResult,
    };
  });

  // Sort by score (lowest first for risk assessment)
  return insights.sort((a, b) => a.score - b.score);
}

export function getDepartmentSummary(
  insights: ReturnType<typeof calculateWorkforceInsights>
) {
  const departments = Array.from(new Set(insights.map((i) => i.department)));

  return departments.map((dept) => {
    const deptInsights = insights.filter((i) => i.department === dept);
    const avgScore =
      deptInsights.reduce((sum, i) => sum + i.score, 0) / deptInsights.length;
    const highRisk = deptInsights.filter((i) => i.riskLevel === "High").length;
    const mediumRisk = deptInsights.filter((i) => i.riskLevel === "Medium").length;
    const lowRisk = deptInsights.filter((i) => i.riskLevel === "Low").length;

    return {
      department: dept,
      avgScore: Math.round(avgScore),
      highRisk,
      mediumRisk,
      lowRisk,
      totalEmployees: deptInsights.length,
    };
  });
}
