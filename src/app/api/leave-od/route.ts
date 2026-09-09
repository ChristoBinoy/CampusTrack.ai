import { NextRequest, NextResponse } from 'next/server';
import { getLeaveODRequests, submitLeaveODRequest, uploadProofDocument } from '@/lib/db';

export async function GET() {
  try {
    const requests = await getLeaveODRequests();
    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, requestId, studentId, requestType, reason, fromDate, toDate, affectedSubjects } = body;

    if (action === 'UPLOAD_PROOF') {
      const ok = await uploadProofDocument(requestId);
      if (ok) {
        return NextResponse.json({ success: true, message: 'Proof document submitted successfully!' });
      } else {
        return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
      }
    }

    // Default: submit new Leave/OD application
    const newReq = await submitLeaveODRequest({
      studentId: studentId || 'd1111111-1111-1111-1111-111111111111',
      requestType,
      reason,
      fromDate,
      toDate,
      affectedSubjects: affectedSubjects || []
    });

    return NextResponse.json({ success: true, request: newReq });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
