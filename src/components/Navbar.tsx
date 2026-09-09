'use client';

import React from 'react';
import { ShieldAlert, Sparkles, User, GraduationCap, CheckCircle2, AlertTriangle, Database } from 'lucide-react';
import { Student } from '@/types';

interface NavbarProps {
  student: Student | null;
  overallPercentage: number;
  criticalCount: number;
  warningCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  student,
  overallPercentage,
  criticalCount,
  warningCount,
  activeTab,
  setActiveTab,
  onOpenChat
}) => {
  const getOverallColor = (pct: number) => {
    if (pct >= 75) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (pct >= 65) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('summary')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">CampusTrack</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">AI</span>
              </div>
              <p className="text-xs text-slate-400">Intelligent Attendance & Shortage Assistant</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            {[
              { id: 'summary', label: 'Dashboard' },
              { id: 'prediction', label: 'Shortage & Predictor' },
              { id: 'whatif', label: 'What-If Simulator' },
              { id: 'trends', label: 'Trend Analytics' },
              { id: 'alerts', label: `Alerts ${criticalCount + warningCount > 0 ? `(${criticalCount + warningCount})` : ''}` },
              { id: 'leave', label: 'Leave / OD' },
              { id: 'condonation', label: 'Condonation' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Metrics & Profile */}
          <div className="flex items-center space-x-3">
            {/* Overall Attendance Pill */}
            <div className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${getOverallColor(overallPercentage)}`}>
              <span className="text-xs text-slate-400 font-medium">Overall:</span>
              <span className="text-sm font-bold">{overallPercentage}%</span>
              {overallPercentage >= 75 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              )}
            </div>

            {/* AI Assistant Quick Launcher Button */}
            <button
              onClick={onOpenChat}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-md shadow-blue-500/25 hover:opacity-95 transition-all"
            >
              <Sparkles className="h-4 w-4 text-blue-200 animate-pulse" />
              <span>Ask AI</span>
            </button>

            {/* Student Badge */}
            {student && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  {student.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-200 leading-tight">{student.name}</p>
                  <p className="text-[10px] text-slate-400">{student.studentId} • Sem {student.semester}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
