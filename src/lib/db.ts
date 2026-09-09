import { createClient } from '@supabase/supabase-js';
import {
  Student,
  SubjectStats,
  AttendanceLog,
  LeaveODRequest,
  CondonationRule
} from '@/types';
import { processSubjectStats } from './attendance-engine';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// --- IN-MEMORY DEMO DATABASE STATE ---

const mockStudent: Student = {
  id: 'd1111111-1111-1111-1111-111111111111',
  studentId: 'CS2026-089',
  name: 'Rahul Sharma',
  department: 'Computer Science & Engineering',
  semester: 6,
  targetAttendancePct: 75.0
};

const rawSubjectsData = [
  {
    subjectId: 's1111111-1111-1111-1111-111111111111',
    code: 'CS601',
    name: 'Data Structures & Algorithms',
    faculty: 'Dr. Aris Thorne',
    minRequirement: 75.0,
    condonationMin: 65.0,
    classesHeld: 38,
    classesAttended: 32,
    remainingClassesInTerm: 12,
    totalClassesScheduled: 50,
    weeklyHistory: [
      { week: 'Week 1', percentage: 90, held: 10, attended: 9 },
      { week: 'Week 2', percentage: 85, held: 10, attended: 8 },
      { week: 'Week 3', percentage: 80, held: 10, attended: 8 },
      { week: 'Week 4', percentage: 87.5, held: 8, attended: 7 },
    ],
    timeSlotPatterns: [
      { slot: 'Wednesday 11:00 AM', missedCount: 2, note: 'Missed 2 lab tutorial sessions.' }
    ]
  },
  {
    subjectId: 's2222222-2222-2222-2222-222222222222',
    code: 'CS602',
    name: 'Operating Systems',
    faculty: 'Prof. Meera Nair',
    minRequirement: 75.0,
    condonationMin: 65.0,
    classesHeld: 28,
    classesAttended: 19,
    remainingClassesInTerm: 10,
    totalClassesScheduled: 38,
    weeklyHistory: [
      { week: 'Week 1', percentage: 75, held: 8, attended: 6 },
      { week: 'Week 2', percentage: 70, held: 8, attended: 5 },
      { week: 'Week 3', percentage: 62.5, held: 8, attended: 5 },
      { week: 'Week 4', percentage: 75, held: 4, attended: 3 },
    ],
    timeSlotPatterns: [
      { slot: 'Monday 08:00 AM', missedCount: 4, note: 'Frequent early morning slot absence flag.' },
      { slot: 'Friday 02:00 PM', missedCount: 2, note: 'Missed post-lunch laboratory slots.' }
    ]
  },
  {
    subjectId: 's3333333-3333-3333-3333-333333333333',
    code: 'CS603',
    name: 'Database Management Systems',
    faculty: 'Dr. Rajesh Kumar',
    minRequirement: 75.0,
    condonationMin: 65.0,
    classesHeld: 31,
    classesAttended: 23,
    remainingClassesInTerm: 14,
    totalClassesScheduled: 45,
    weeklyHistory: [
      { week: 'Week 1', percentage: 80, held: 8, attended: 6 },
      { week: 'Week 2', percentage: 75, held: 8, attended: 6 },
      { week: 'Week 3', percentage: 70, held: 10, attended: 7 },
      { week: 'Week 4', percentage: 80, held: 5, attended: 4 },
    ],
    timeSlotPatterns: [
      { slot: 'Thursday 10:00 AM', missedCount: 2, note: 'Missed during inter-college event preparation.' }
    ]
  },
  {
    subjectId: 's4444444-4444-4444-4444-444444444444',
    code: 'CS604',
    name: 'Computer Networks',
    faculty: 'Prof. Vikram Seth',
    minRequirement: 75.0,
    condonationMin: 65.0,
    classesHeld: 30,
    classesAttended: 25,
    remainingClassesInTerm: 10,
    totalClassesScheduled: 40,
    weeklyHistory: [
      { week: 'Week 1', percentage: 87.5, held: 8, attended: 7 },
      { week: 'Week 2', percentage: 83.3, held: 8, attended: 7 },
      { week: 'Week 3', percentage: 80, held: 10, attended: 8 },
      { week: 'Week 4', percentage: 75, held: 4, attended: 3 },
    ],
    timeSlotPatterns: []
  },
  {
    subjectId: 's5555555-5555-5555-5555-555555555555',
    code: 'CS605',
    name: 'Machine Learning Essentials',
    faculty: 'Dr. Sunita Rao',
    minRequirement: 75.0,
    condonationMin: 65.0,
    classesHeld: 22,
    classesAttended: 16,
    remainingClassesInTerm: 12,
    totalClassesScheduled: 34,
    weeklyHistory: [
      { week: 'Week 1', percentage: 80, held: 5, attended: 4 },
      { week: 'Week 2', percentage: 71.4, held: 7, attended: 5 },
      { week: 'Week 3', percentage: 71.4, held: 7, attended: 5 },
      { week: 'Week 4', percentage: 66.6, held: 3, attended: 2 },
    ],
    timeSlotPatterns: [
      { slot: 'Tuesday 03:00 PM', missedCount: 2, note: 'Missed elective research project slot.' }
    ]
  }
];

let mockLeaveRequests: LeaveODRequest[] = [
  {
    id: 'req-101',
    studentId: 'd1111111-1111-1111-1111-111111111111',
    requestType: 'ON_DUTY',
    reason: 'CodeChef National Level Hackathon Representation',
    fromDate: '2026-09-02',
    toDate: '2026-09-04',
    affectedSubjects: ['CS602 Operating Systems', 'CS603 Database Management Systems'],
    status: 'PROOF_REQUIRED',
    proofSubmitted: false,
    proofDeadline: '2026-09-12',
    createdAt: '2026-09-01T10:30:00Z'
  },
  {
    id: 'req-102',
    studentId: 'd1111111-1111-1111-1111-111111111111',
    requestType: 'LEAVE',
    reason: 'Viral Fever & Medical Rest',
    fromDate: '2026-08-18',
    toDate: '2026-08-20',
    affectedSubjects: ['CS601 Data Structures', 'CS605 Machine Learning'],
    status: 'APPROVED',
    proofSubmitted: true,
    proofDeadline: '2026-08-25',
    createdAt: '2026-08-17T09:00:00Z'
  }
];

const mockCondonationRules: CondonationRule[] = [
  {
    id: 'rule-01',
    ruleName: 'Medical Ground Condonation',
    minEligibilityPct: 65.0,
    maxThresholdPct: 74.99,
    requiredDocuments: [
      'Medical Certificate from Registered Practitioner',
      'Hospital Admission / Outpatient Prescription',
      'Parent Intimation & Clearance Form'
    ],
    feePerSubject: 500,
    description: 'Permits up to 10% attendance condonation for students missing classes due to certified illness.'
  },
  {
    id: 'rule-02',
    ruleName: 'On-Duty / Hackathon / Sports Representation',
    minEligibilityPct: 65.0,
    maxThresholdPct: 74.99,
    requiredDocuments: [
      'Official Event Participation Certificate',
      'Faculty Mentor / HOD Endorsement',
      'Approved OD Application Copy'
    ],
    feePerSubject: 0,
    description: 'Waives attendance shortage incurred while officially representing the institution.'
  }
];

const mockAttendanceLogs: AttendanceLog[] = [
  { id: 'log-1', subjectId: 's2222222-2222-2222-2222-222222222222', subjectCode: 'CS602', subjectName: 'Operating Systems', classDate: '2026-09-07', timeSlot: '08:00 AM - 09:00 AM', dayOfWeek: 'Monday', status: 'ABSENT' },
  { id: 'log-2', subjectId: 's2222222-2222-2222-2222-222222222222', subjectCode: 'CS602', subjectName: 'Operating Systems', classDate: '2026-08-31', timeSlot: '08:00 AM - 09:00 AM', dayOfWeek: 'Monday', status: 'ABSENT' },
  { id: 'log-3', subjectId: 's2222222-2222-2222-2222-222222222222', subjectCode: 'CS602', subjectName: 'Operating Systems', classDate: '2026-08-24', timeSlot: '08:00 AM - 09:00 AM', dayOfWeek: 'Monday', status: 'ABSENT' },
  { id: 'log-4', subjectId: 's2222222-2222-2222-2222-222222222222', subjectCode: 'CS602', subjectName: 'Operating Systems', classDate: '2026-08-17', timeSlot: '08:00 AM - 09:00 AM', dayOfWeek: 'Monday', status: 'ABSENT' },
  { id: 'log-5', subjectId: 's3333333-3333-3333-3333-333333333333', subjectCode: 'CS603', subjectName: 'Database Management Systems', classDate: '2026-09-03', timeSlot: '10:00 AM - 11:00 AM', dayOfWeek: 'Thursday', status: 'ABSENT' },
  { id: 'log-6', subjectId: 's5555555-5555-5555-5555-555555555555', subjectCode: 'CS605', subjectName: 'Machine Learning Essentials', classDate: '2026-09-01', timeSlot: '03:00 PM - 04:00 PM', dayOfWeek: 'Tuesday', status: 'ABSENT' }
];

// --- DATABASE PUBLIC SERVICES ---

export async function getStudentProfile(): Promise<Student> {
  return mockStudent;
}

export async function getSubjectStats(): Promise<SubjectStats[]> {
  return rawSubjectsData.map(processSubjectStats);
}

export async function getLeaveODRequests(): Promise<LeaveODRequest[]> {
  return [...mockLeaveRequests];
}

export async function submitLeaveODRequest(req: Omit<LeaveODRequest, 'id' | 'createdAt' | 'status' | 'proofSubmitted'>): Promise<LeaveODRequest> {
  const newReq: LeaveODRequest = {
    ...req,
    id: `req-${Date.now()}`,
    status: 'PROOF_REQUIRED',
    proofSubmitted: false,
    proofDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };
  mockLeaveRequests.unshift(newReq);
  return newReq;
}

export async function uploadProofDocument(requestId: string): Promise<boolean> {
  const target = mockLeaveRequests.find(r => r.id === requestId);
  if (target) {
    target.proofSubmitted = true;
    target.status = 'PENDING'; // Moves to pending review after proof upload
    return true;
  }
  return false;
}

export async function getCondonationRules(): Promise<CondonationRule[]> {
  return mockCondonationRules;
}

export async function getAttendanceLogs(): Promise<AttendanceLog[]> {
  return mockAttendanceLogs;
}
