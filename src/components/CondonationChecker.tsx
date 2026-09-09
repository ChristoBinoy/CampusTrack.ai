'use client';

import React from 'react';
import { SubjectStats, CondonationRule } from '@/types';
import { checkCondonationEligibility } from '@/lib/attendance-engine';
import { FileCheck, AlertTriangle, CheckCircle2, XCircle, Info, Sparkles, DollarSign } from 'lucide-react';

interface CondonationCheckerProps {
  subjects: SubjectStats[];
  rules: CondonationRule[];
  onOpenChatWithPrompt: (prompt: string) => void;
}

export const CondonationChecker: React.FC<CondonationCheckerProps> = ({
  subjects,
  rules,
  onOpenChatWithPrompt
}) => {
  const condonationStatuses = subjects.map(s => checkCondonationEligibility(s, rules));
  const eligibleSubjects = condonationStatuses.filter(c => c.isEligible);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-indigo-400">
          <FileCheck className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white">Institute Condonation Policy & Eligibility Checker</h2>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Under Institute Academic Regulations, students with attendance between <strong>65.00% and 74.99%</strong> are eligible to apply for formal condonation on genuine medical or officially sanctioned On-Duty grounds.
        </p>
      </div>

      {/* Summary Alert */}
      <div className={`p-5 rounded-2xl border ${
        eligibleSubjects.length > 0
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-sm">
            {eligibleSubjects.length > 0 ? (
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            )}
            <span>
              {eligibleSubjects.length > 0
                ? `You have ${eligibleSubjects.length} subject(s) eligible for Condonation Application`
                : 'No subjects currently require Condonation'}
            </span>
          </div>

          {eligibleSubjects.length > 0 && (
            <button
              onClick={() => onOpenChatWithPrompt("Am I eligible for condonation in any of my subjects?")}
              className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center space-x-1"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask AI Application Guidance</span>
            </button>
          )}
        </div>
      </div>

      {/* Subject-by-Subject Condonation Status Cards */}
      <div className="space-y-4">
        {condonationStatuses.map(item => (
          <div
            key={item.subjectCode}
            className={`p-5 rounded-2xl border transition-all space-y-4 ${
              item.isEligible
                ? 'bg-amber-950/20 border-amber-500/40'
                : item.currentPct >= 75
                ? 'bg-slate-900 border-slate-800'
                : 'bg-rose-950/20 border-rose-500/40'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
                  {item.subjectCode}
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm">{item.subjectName}</h4>
                  <p className="text-xs text-slate-400">Current Attendance: <strong>{item.currentPct}%</strong></p>
                </div>
              </div>

              <div>
                {item.isEligible ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                    Eligible for Condonation (65-74.9%)
                  </span>
                ) : item.currentPct >= 75 ? (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Not Needed (Above 75%)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    Ineligible (&lt;65% - Special Appeal Required)
                  </span>
                )}
              </div>
            </div>

            {/* If Eligible: Show Document Checklist & Fee */}
            {item.isEligible && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/20 space-y-3 text-xs">
                <div className="flex items-center justify-between text-amber-300 font-medium">
                  <span>Margin Needed to reach 75%: <strong>+{item.marginNeededPct}%</strong> (~{item.classesShortfall} classes shortfall)</span>
                  <span className="flex items-center space-x-1 text-slate-300">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Fee: ₹500 / Subject</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Required Documents Checklist:</span>
                  <ul className="space-y-1 pl-1">
                    {item.requiredDocs.map((doc, i) => (
                      <li key={i} className="flex items-center space-x-2 text-slate-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rules Information Box */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm">Official Condonation Policy Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map(rule => (
            <div key={rule.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-blue-400">{rule.ruleName}</span>
              <p className="text-slate-300 leading-relaxed">{rule.description}</p>
              <p className="text-[11px] text-slate-500 font-mono">
                Eligibility Range: {rule.minEligibilityPct}% - {rule.maxThresholdPct}% | Fee: ₹{rule.feePerSubject}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
