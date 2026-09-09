import { NextRequest, NextResponse } from 'next/server';
import { getSubjectStats, getLeaveODRequests, getCondonationRules } from '@/lib/db';
import { processAIChatQuery } from '@/lib/ai-assistant';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ success: false, error: 'Query prompt is required' }, { status: 400 });
    }

    const [subjects, leaveRequests, condonationRules] = await Promise.all([
      getSubjectStats(),
      getLeaveODRequests(),
      getCondonationRules()
    ]);

    const chatResponse = await processAIChatQuery(query, subjects, leaveRequests, condonationRules);

    return NextResponse.json({ success: true, message: chatResponse });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'AI Chat processing failed' },
      { status: 500 }
    );
  }
}
