'use client';

import React from 'react';
import { SubjectStats, AttendanceLog } from '@/types';
import { TrendingDown, Calendar, Clock, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';

interface TrendAnalysisProps {
  subjects: SubjectStats[];
  logs: AttendanceLog[];
  onOpenChatWithPrompt: (prompt: string) => void;
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ subjects, logs, onOpenChatWithPrompt }) => {
  // Aggregate patterns across subjects
  const allPatterns = subjects.flatMap(s =>
    s.timeSlotPatterns.map(p => ({
      subjectCode: s.code,
      subjectName: s.name,
      ...p
    }))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-blue-400">
          <TrendingDown className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white">Trend Analytics & Slot Pattern Spotter</h2>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          CampusTrack AI tracks your attendance velocity over the last 4 weeks to spot hidden declining trends before they turn into critical shortages, and detects recurring day/time slot absence patterns.
        </p>
      </div>

      {/* Pattern Warning Banner */}
      {allPatterns.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Recurring Time Slot Pattern Flags Detected</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allPatterns.map((pat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/20 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">{pat.subjectCode}: {pat.slot}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px]">
                    Missed {pat.missedCount}x
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">{pat.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {subjects.map(sub => {
          const recentWeek = sub.weeklyHistory[sub.weeklyHistory.length - 1];
          const prevWeek = sub.weeklyHistory[sub.weeklyHistory.length - 2];
          const isDeclining = recentWeek && prevWeek && recentWeek.percentage < prevWeek.percentage;

          return (
            <div key={sub.subjectId} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {sub.code}
                  </span>
                  <h4 className="font-semibold text-white text-sm mt-1">{sub.name}</h4>
                </div>

                {isDeclining ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center space-x-1">
                    <TrendingDown className="h-3.5 w-3.5" />
                    <span>Declining Trend</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Stable Velocity</span>
                  </span>
                )}
              </div>

              {/* Weekly History Breakdown Bar representation */}
              <div className="space-y-2">
                <span className="text-[11px] font-medium text-slate-400">Weekly Trajectory (Last 4 Weeks):</span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {sub.weeklyHistory.map((w, i) => (
                    <div key={i} className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <span className="block text-[10px] text-slate-500 font-mono">{w.week}</span>
                      <span className={`font-bold text-xs ${
                        w.percentage >= 75 ? 'text-emerald-400' : w.percentage >= 65 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {w.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slot Patterns for this subject */}
              {sub.timeSlotPatterns.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center space-x-1 text-slate-300 font-medium">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span>Slot Pattern Highlight</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{sub.timeSlotPatterns[0].note}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
