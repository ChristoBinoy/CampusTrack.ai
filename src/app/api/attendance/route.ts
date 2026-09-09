import { NextResponse } from 'next/server';
import { getStudentProfile, getSubjectStats, getAttendanceLogs } from '@/lib/db';
import { generateRiskAlerts } from '@/lib/attendance-engine';

export async function GET() {
  try {
    const [student, subjects, logs] = await Promise.all([
      getStudentProfile(),
      getSubjectStats(),
      getAttendanceLogs()
    ]);

    const alerts = generateRiskAlerts(subjects);

    // Calculate total stats
    const totalHeld = subjects.reduce((sum, s) => sum + s.classesHeld, 0);
    const totalAttended = subjects.reduce((sum, s) => sum + s.classesAttended, 0);
    const overallPercentage = Math.round((totalAttended / totalHeld) * 10000) / 100;

    return NextResponse.json({
      success: true,
      student,
      overallPercentage,
      totalHeld,
      totalAttended,
      subjects,
      alerts,
      logs
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch attendance data' },
      { status: 500 }
    );
  }
}
