import {
  AttendanceStatus,
  SubjectStats,
  RiskAlert,
  CondonationRule,
  CondonationStatus,
  WhatIfSimulationInput,
  WhatIfSimulationResult,
  AttendanceLog
} from '@/types';

/**
 * Calculates current percentage rounded to 2 decimal places.
 */
export function calculatePercentage(attended: number, held: number): number {
  if (held === 0) return 100.0;
  return Math.round((attended / held) * 10000) / 100;
}

/**
 * Determines status classification: Safe / Warning / Critical.
 */
export function calculateStatus(percentage: number, minReq: number = 75.0, condonationMin: number = 65.0): AttendanceStatus {
  if (percentage >= minReq) return 'SAFE';
  if (percentage >= condonationMin) return 'WARNING';
  return 'CRITICAL';
}

/**
 * Calculates how many upcoming classes the student can miss while staying at or above minReq.
 * Formula: floor( (100 * Attended / minReq) - Held )
 */
export function calculateSafeMisses(attended: number, held: number, minReq: number = 75.0): number {
  const reqFraction = minReq / 100.0;
  const maxAllowedHeldForCurrentAttended = Math.floor(attended / reqFraction);
  const safeMisses = maxAllowedHeldForCurrentAttended - held;
  return safeMisses > 0 ? safeMisses : 0;
}

/**
 * Calculates how many consecutive upcoming classes must be attended to recover to minReq.
 * Formula: ceil( (minReq * Held - 100 * Attended) / (100 - minReq) )
 */
export function calculateRecoveryNeeded(attended: number, held: number, minReq: number = 75.0): number {
  const currentPct = calculatePercentage(attended, held);
  if (currentPct >= minReq) return 0;

  const target = minReq / 100.0;
  const numerator = target * held - attended;
  const denominator = 1.0 - target;
  
  const consecutiveNeeded = Math.ceil(numerator / denominator);
  return consecutiveNeeded > 0 ? consecutiveNeeded : 0;
}

/**
 * Process raw subject data into enriched stats including safe misses, recovery, and trend.
 */
export function processSubjectStats(raw: {
  subjectId: string;
  code: string;
  name: string;
  faculty: string;
  minRequirement: number;
  condonationMin: number;
  classesHeld: number;
  classesAttended: number;
  remainingClassesInTerm: number;
  totalClassesScheduled: number;
  weeklyHistory?: { week: string; percentage: number; held: number; attended: number }[];
  timeSlotPatterns?: { slot: string; missedCount: number; note: string }[];
}): SubjectStats {
  const currentPercentage = calculatePercentage(raw.classesAttended, raw.classesHeld);
  const status = calculateStatus(currentPercentage, raw.minRequirement, raw.condonationMin);
  const safeMisses = calculateSafeMisses(raw.classesAttended, raw.classesHeld, raw.minRequirement);
  const recoveryNeeded = calculateRecoveryNeeded(raw.classesAttended, raw.classesHeld, raw.minRequirement);
  const isRecoveryFeasible = recoveryNeeded <= raw.remainingClassesInTerm;
  const classesMissed = raw.classesHeld - raw.classesAttended;

  return {
    ...raw,
    classesMissed,
    currentPercentage,
    status,
    safeMisses,
    recoveryNeeded,
    isRecoveryFeasible,
    weeklyHistory: raw.weeklyHistory || [],
    timeSlotPatterns: raw.timeSlotPatterns || []
  };
}

/**
 * Generates prioritized Risk Alerts based on subject statuses.
 */
export function generateRiskAlerts(subjects: SubjectStats[]): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  // Sort subjects by urgency: Critical first, then Warning, then Safe
  const sorted = [...subjects].sort((a, b) => {
    const score = (s: SubjectStats) => (s.status === 'CRITICAL' ? 1 : s.status === 'WARNING' ? 2 : 3);
    if (score(a) !== score(b)) return score(a) - score(b);
    return a.currentPercentage - b.currentPercentage;
  });

  sorted.forEach((sub, idx) => {
    if (sub.status === 'CRITICAL') {
      const recoveryText = sub.isRecoveryFeasible
        ? `Must attend the next ${sub.recoveryNeeded} consecutive classes to recover to ${sub.minRequirement}%.`
        : `Feasibility Warning: ${sub.recoveryNeeded} classes needed to reach ${sub.minRequirement}%, but only ${sub.remainingClassesInTerm} remaining in term. File for Condonation immediately!`;

      alerts.push({
        id: `alert-crit-${sub.code}`,
        subjectCode: sub.code,
        subjectName: sub.name,
        status: 'CRITICAL',
        urgency: idx + 1,
        title: `CRITICAL ATTENDANCE SHORTAGE in ${sub.code}`,
        message: `Current attendance is ${sub.currentPercentage}%, which is below the minimum threshold of ${sub.minRequirement}%.`,
        actionableStep: recoveryText,
        iconType: 'critical'
      });
    } else if (sub.status === 'WARNING') {
      alerts.push({
        id: `alert-warn-${sub.code}`,
        subjectCode: sub.code,
        subjectName: sub.name,
        status: 'WARNING',
        urgency: idx + 1,
        title: `Attendance Borderline in ${sub.code}`,
        message: `Current attendance is ${sub.currentPercentage}%, near the ${sub.minRequirement}% threshold.`,
        actionableStep: sub.recoveryNeeded > 0 
          ? `Attend next ${sub.recoveryNeeded} classes to get back into Safe zone.` 
          : `You have zero buffer left (${sub.safeMisses} safe misses). Do not miss the next class!`,
        iconType: 'warning'
      });
    } else {
      // Safe subject with low margin
      if (sub.safeMisses <= 1) {
        alerts.push({
          id: `alert-info-${sub.code}`,
          subjectCode: sub.code,
          subjectName: sub.name,
          status: 'SAFE',
          urgency: 10 + idx,
          title: `Low Miss Buffer in ${sub.code}`,
          message: `Attendance is safe at ${sub.currentPercentage}%, but you can only miss ${sub.safeMisses} more class.`,
          actionableStep: `Plan absences carefully to avoid slipping into Warning territory.`,
          iconType: 'info'
        });
      }
    }
  });

  return alerts;
}

/**
 * Runs a What-If simulation for a specific subject.
 */
export function runWhatIfSimulation(
  subject: SubjectStats,
  futureMisses: number,
  futureAttends: number
): WhatIfSimulationResult {
  const currentHeld = subject.classesHeld;
  const currentAttended = subject.classesAttended;

  const projectedClassesHeld = currentHeld + futureMisses + futureAttends;
  const projectedClassesAttended = currentAttended + futureAttends;
  const projectedPercentage = calculatePercentage(projectedClassesAttended, projectedClassesHeld);

  const initialStatus = subject.status;
  const projectedStatus = calculateStatus(projectedPercentage, subject.minRequirement, subject.condonationMin);
  const statusChanged = initialStatus !== projectedStatus;
  const percentageChange = Math.round((projectedPercentage - subject.currentPercentage) * 100) / 100;

  let recommendation = '';
  if (projectedStatus === 'SAFE') {
    recommendation = `You will maintain a safe attendance level of ${projectedPercentage}%.`;
  } else if (projectedStatus === 'WARNING') {
    recommendation = `Your attendance will drop to ${projectedPercentage}%. You will be in the Warning zone. Avoid missing further classes.`;
  } else {
    recommendation = `DANGER: Your attendance will plummet to ${projectedPercentage}%, triggering a Critical shortage alert below the required ${subject.minRequirement}%.`;
  }

  return {
    subjectCode: subject.code,
    subjectName: subject.name,
    currentPercentage: subject.currentPercentage,
    projectedClassesHeld,
    projectedClassesAttended,
    projectedPercentage,
    percentageChange,
    initialStatus,
    projectedStatus,
    statusChanged,
    recommendation
  };
}

/**
 * Checks condonation eligibility for a subject.
 */
export function checkCondonationEligibility(
  subject: SubjectStats,
  rules: CondonationRule[]
): CondonationStatus {
  const isEligible = subject.currentPercentage >= subject.condonationMin && subject.currentPercentage < subject.minRequirement;
  const marginNeededPct = isEligible ? Math.round((subject.minRequirement - subject.currentPercentage) * 100) / 100 : 0;
  
  // Calculate equivalent shortfall classes
  const classesShortfall = isEligible ? subject.recoveryNeeded : 0;

  const matchingRules = isEligible ? rules : [];
  const requiredDocs = matchingRules.flatMap(r => r.requiredDocuments);

  return {
    subjectCode: subject.code,
    subjectName: subject.name,
    currentPct: subject.currentPercentage,
    isEligible,
    marginNeededPct,
    classesShortfall,
    matchingRules,
    requiredDocs: Array.from(new Set(requiredDocs))
  };
}

/**
 * Detects patterns in attendance logs (e.g. repeated absences on Monday mornings)
 */
export function detectAbsencePatterns(logs: AttendanceLog[]): { slot: string; missedCount: number; note: string }[] {
  const absentLogs = logs.filter(l => l.status === 'ABSENT');
  const slotCounts: Record<string, number> = {};

  absentLogs.forEach(log => {
    const key = `${log.dayOfWeek} (${log.timeSlot})`;
    slotCounts[key] = (slotCounts[key] || 0) + 1;
  });

  const patterns: { slot: string; missedCount: number; note: string }[] = [];
  Object.entries(slotCounts).forEach(([slot, count]) => {
    if (count >= 2) {
      patterns.push({
        slot,
        missedCount: count,
        note: `Frequent absence pattern detected: missed ${count} times on ${slot}.`
      });
    }
  });

  return patterns;
}
