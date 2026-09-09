'use client';

import React from 'react';
import { SubjectStats } from '@/types';
import { ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Calendar, ArrowRight, Info, HelpCircle } from 'lucide-react';

interface ShortagePredictorProps {
  subjects: SubjectStats[];
  onOpenChatWithPrompt: (prompt: string) => void;
}

export const ShortagePredictor: React.FC<ShortagePredictorProps> = ({ subjects, onOpenChatWithPrompt }) => {
  // Sort subjects by status urgency: CRITICAL first, then WARNING, then SAFE
  const sortedSubjects = [...subjects].sort((a, b) => {
    const rank = (s: SubjectStats) => (s.status === 'CRITICAL' ? 1 : s.status === 'WARNING' ? 2 : 3);
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    return a.currentPercentage - b.currentPercentage;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-blue-400">
          <ShieldAlert className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white">Shortage & Consecutive Recovery Predictor</h2>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          CampusTrack AI calculates exact safe miss buffers for subjects above target, and exact consecutive class recovery counts for subjects falling below requirements based on remaining working days in the term.
        </p>
      </div>

      {/* Main Table / Grid of Predictions */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <span className="text-xs font-semibold text-slate-200">Subject Predictive Breakdown</span>
          <span className="text-xs text-slate-400">Institute Minimum Threshold: <strong>75%</strong></span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {sortedSubjects.map(sub => (
            <div key={sub.subjectId} className="p-5 hover:bg-slate-800/40 transition-all space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Subject Info */}
                <div className="space-y-1 md:w-1/3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {sub.code}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                      sub.status === 'SAFE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      sub.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {sub.status} ({sub.currentPercentage}%)
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-100 text-sm">{sub.name}</h4>
                  <p className="text-xs text-slate-400">Faculty: {sub.faculty}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 md:w-1/3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 text-center">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Held / Attended</span>
                    <span className="text-xs font-bold text-slate-200">{sub.classesAttended} / {sub.classesHeld}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Remaining Term</span>
                    <span className="text-xs font-bold text-blue-400">{sub.remainingClassesInTerm} classes</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Buffer / Needed</span>
                    <span className={`text-xs font-bold ${
                      sub.status === 'SAFE' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {sub.status === 'SAFE' ? `+${sub.safeMisses} Misses` : `${sub.recoveryNeeded} Attends`}
                    </span>
                  </div>
                </div>

                {/* Actionable Verdict */}
                <div className="md:w-1/3 flex flex-col justify-center space-y-2">
                  {sub.status === 'SAFE' ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                      <div className="font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Safe Attendance Buffer</span>
                      </div>
                      <p className="text-[11px] text-emerald-400/90 leading-snug">
                        You can miss up to <strong>{sub.safeMisses} upcoming classes</strong> and still remain at or above 75%.
                      </p>
                    </div>
                  ) : sub.isRecoveryFeasible ? (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                      <div className="font-semibold flex items-center space-x-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Recovery Feasible</span>
                      </div>
                      <p className="text-[11px] text-amber-400/90 leading-snug">
                        Attend the next <strong>{sub.recoveryNeeded} consecutive classes</strong> out of {sub.remainingClassesInTerm} remaining classes.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                      <div className="font-semibold flex items-center space-x-1">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Condonation Required</span>
                      </div>
                      <p className="text-[11px] text-rose-400/90 leading-snug">
                        Recovery requires {sub.recoveryNeeded} classes, but only {sub.remainingClassesInTerm} remain in term. Submit medical/OD condonation immediately.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() =>
                      onOpenChatWithPrompt(`How many classes can I miss in ${sub.code} this month and what is my recovery plan?`)
                    }
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center justify-end space-x-1 font-medium pt-1"
                  >
                    <span>Detailed AI Roadmap</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
