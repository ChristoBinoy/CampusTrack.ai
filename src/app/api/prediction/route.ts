import { NextRequest, NextResponse } from 'next/server';
import { getSubjectStats } from '@/lib/db';
import { runWhatIfSimulation } from '@/lib/attendance-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subjectId, futureMisses, futureAttends } = body;

    const subjects = await getSubjectStats();
    
    if (subjectId === 'ALL') {
      const results = subjects.map(sub => runWhatIfSimulation(sub, futureMisses || 0, futureAttends || 0));
      return NextResponse.json({ success: true, results });
    }

    const targetSubject = subjects.find(s => s.subjectId === subjectId || s.code === subjectId);
    if (!targetSubject) {
      return NextResponse.json({ success: false, error: 'Subject not found' }, { status: 404 });
    }

    const result = runWhatIfSimulation(targetSubject, futureMisses || 0, futureAttends || 0);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Simulation failed' },
      { status: 500 }
    );
  }
}
