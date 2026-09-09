export type AttendanceStatus = 'SAFE' | 'WARNING' | 'CRITICAL';

export interface Student {
  id: string;
  studentId: string;
  name: string;
  department: string;
  semester: number;
  targetAttendancePct: number;
}

export interface SubjectStats {
  subjectId: string;
  code: string;
  name: string;
  faculty: string;
  minRequirement: number;
  condonationMin: number;
  classesHeld: number;
  classesAttended: number;
  classesMissed: number;
  currentPercentage: number;
  remainingClassesInTerm: number;
  totalClassesScheduled: number;
  status: AttendanceStatus;
  safeMisses: number;
  recoveryNeeded: number;
  isRecoveryFeasible: boolean;
  weeklyHistory: { week: string; percentage: number; held: number; attended: number }[];
  timeSlotPatterns: { slot: string; missedCount: number; note: string }[];
}

export interface AttendanceLog {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  classDate: string;
  timeSlot: string;
  dayOfWeek: string;
  status: 'PRESENT' | 'ABSENT' | 'ON_DUTY' | 'LEAVE_SANCTIONED';
}

export interface RiskAlert {
  id: string;
  subjectCode: string;
  subjectName: string;
  status: AttendanceStatus;
  urgency: number; // 1 = highest
  title: string;
  message: string;
  actionableStep: string;
  iconType: 'critical' | 'warning' | 'info';
}

export interface LeaveODRequest {
  id: string;
  studentId: string;
  requestType: 'LEAVE' | 'ON_DUTY';
  reason: string;
  fromDate: string;
  toDate: string;
  affectedSubjects: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROOF_REQUIRED';
  proofSubmitted: boolean;
  proofDeadline?: string;
  createdAt: string;
}

export interface CondonationRule {
  id: string;
  ruleName: string;
  minEligibilityPct: number;
  maxThresholdPct: number;
  requiredDocuments: string[];
  feePerSubject: number;
  description: string;
}

export interface CondonationStatus {
  subjectCode: string;
  subjectName: string;
  currentPct: number;
  isEligible: boolean;
  marginNeededPct: number;
  classesShortfall: number;
  matchingRules: CondonationRule[];
  requiredDocs: string[];
}

export interface WhatIfSimulationInput {
  subjectId: string;
  futureMisses: number;
  futureAttends: number;
}

export interface WhatIfSimulationResult {
  subjectCode: string;
  subjectName: string;
  currentPercentage: number;
  projectedClassesHeld: number;
  projectedClassesAttended: number;
  projectedPercentage: number;
  percentageChange: number;
  initialStatus: AttendanceStatus;
  projectedStatus: AttendanceStatus;
  statusChanged: boolean;
  recommendation: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  metricsContext?: Record<string, any>;
}
