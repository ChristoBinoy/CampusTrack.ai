'use client';

import React, { useState } from 'react';
import { SubjectStats, AttendanceStatus } from '@/types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Clock
} from 'lucide-react';

interface AttendanceSummaryProps {
  subjects: SubjectStats[];
  overallPercentage: number;
  totalHeld: number;
  totalAttended: number;
  onSelectSubjectForWhatIf: (subjectCode: string) => void;
  onOpenChatWithPrompt: (prompt: string) => void;
}

export const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({
  subjects,
  overallPercentage,
  totalHeld,
  totalAttended,
  onSelectSubjectForWhatIf,
  onOpenChatWithPrompt
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'SAFE'>('ALL');

  const filteredSubjects = subjects.filter(s => filter === 'ALL' || s.status === filter);

  // Stats calculation
  const criticalCount = subjects.filter(s => s.status === 'CRITICAL').length;
  const warningCount = subjects.filter(s => s.status === 'WARNING').length;
  const safeCount = subjects.filter(s => s.status === 'SAFE').length;

  const getBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'SAFE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Safe</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Warning</span>
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
            <XCircle className="h-3.5 w-3.5" />
            <span>Critical Shortage</span>
          </span>
        );
    }
  };

  const getProgressColor = (status: AttendanceStatus) => {
    if (status === 'SAFE') return 'bg-emerald-500';
    if (status === 'WARNING') return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Percentage Card */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <TrendingUp className="h-32 w-32 text-blue-400" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Term Attendance</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Min Target: 75%
              </span>
            </div>

            <div className="flex items-baseline space-x-4">
              <span className="text-4xl font-extrabold text-white tracking-tight">{overallPercentage}%</span>
              <span className="text-sm text-slate-400">
                ({totalAttended} / {totalHeld} classes attended)
              </span>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallPercentage >= 75 ? 'bg-emerald-500' : overallPercentage >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {overallPercentage >= 75
                ? 'Your overall attendance is comfortably above the 75% institute minimum threshold.'
                : 'Attention needed: Overall attendance is below target. Focus on critical subjects immediately.'}
            </p>
          </div>
        </div>

        {/* Status Counters */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Risk Status Breakdown</span>
            <ShieldAlert className="h-4 w-4 text-slate-500" />
          </div>
          <div className="space-y-2 my-2">
            <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <span>Critical Shortage (&lt;65%)</span>
              <span className="font-bold text-sm">{criticalCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <span>Warning Zone (65-74%)</span>
              <span className="font-bold text-sm">{warningCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <span>Safe Zone (&ge;75%)</span>
              <span className="font-bold text-sm">{safeCount}</span>
            </div>
          </div>
        </div>

        {/* Quick Assistant Callout */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold">
              <Sparkles className="h-4 w-4" />
              <span>CampusTrack Assistant</span>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Ask natural language queries like &quot;How many DS classes can I miss?&quot; or &quot;Am I safe anywhere?&quot;
            </p>
          </div>
          <button
            onClick={() => onOpenChatWithPrompt("Am I at risk of shortage anywhere?")}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all shadow-md shadow-blue-600/30 flex items-center justify-center space-x-1.5"
          >
            <span>Ask Shortage Status</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-white">Subject Attendance Records</span>
          <span className="text-xs text-slate-400">({subjects.length} Subjects)</span>
        </div>

        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {(['ALL', 'CRITICAL', 'WARNING', 'SAFE'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === tab
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Subjects' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSubjects.map(subject => (
          <div
            key={subject.subjectId}
            className={`p-5 rounded-2xl bg-slate-900 border transition-all hover:border-slate-700 flex flex-col justify-between space-y-4 ${
              subject.status === 'CRITICAL'
                ? 'border-rose-500/40 bg-gradient-to-b from-slate-900 to-rose-950/10'
                : subject.status === 'WARNING'
                ? 'border-amber-500/40 bg-gradient-to-b from-slate-900 to-amber-950/10'
                : 'border-slate-800'
            }`}
          >
            {/* Header: Code, Title, Badge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {subject.code}
                </span>
                {getBadge(subject.status)}
              </div>
              <h3 className="font-semibold text-slate-100 text-base leading-snug line-clamp-1">{subject.name}</h3>
              <p className="text-xs text-slate-400 flex items-center space-x-1">
                <BookOpen className="h-3 w-3 text-slate-500" />
                <span>{subject.faculty}</span>
              </p>
            </div>

            {/* Attendance Percentage & Progress */}
            <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Attended vs Held</span>
                <span className="text-xs font-mono text-slate-300">
                  <span className="text-white font-bold">{subject.classesAttended}</span> / {subject.classesHeld} classes
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-white">{subject.currentPercentage}%</span>
                <span className="text-[11px] text-slate-400">Min Req: {subject.minRequirement}%</span>
              </div>

              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getProgressColor(subject.status)}`}
                  style={{ width: `${Math.min(subject.currentPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Safe Miss or Recovery Guidance */}
            <div className="text-xs rounded-xl p-3 bg-slate-950/40 border border-slate-800/60 space-y-1">
              {subject.status === 'SAFE' ? (
                <div className="text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Can miss <strong className="font-bold underline">{subject.safeMisses} upcoming classes</strong> safely.
                  </span>
                </div>
              ) : subject.status === 'WARNING' ? (
                <div className="text-amber-400 flex items-center space-x-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Must attend next <strong className="font-bold underline">{subject.recoveryNeeded} consecutive classes</strong> to reach 75%.
                  </span>
                </div>
              ) : (
                <div className="text-rose-400 flex items-center space-x-1.5">
                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {subject.isRecoveryFeasible
                      ? `Critical: Need ${subject.recoveryNeeded} consecutive attends out of ${subject.remainingClassesInTerm} remaining classes.`
                      : `Recovery unfeasible (${subject.recoveryNeeded} needed > ${subject.remainingClassesInTerm} left). File Condonation!`}
                  </span>
                </div>
              )}
            </div>

            {/* Card Footer Actions */}
            <div className="pt-2 flex items-center justify-between space-x-2">
              <button
                onClick={() => onSelectSubjectForWhatIf(subject.code)}
                className="flex-1 py-1.5 px-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all text-center"
              >
                What-If
              </button>
              <button
                onClick={() =>
                  onOpenChatWithPrompt(`What is my exact attendance and shortage prediction for ${subject.code}?`)
                }
                className="flex-1 py-1.5 px-2 text-xs font-medium rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-all text-center flex items-center justify-center space-x-1"
              >
                <Sparkles className="h-3 w-3" />
                <span>Ask AI</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
