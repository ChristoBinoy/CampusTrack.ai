'use client';

import React, { useState, useEffect } from 'react';
import { SubjectStats, WhatIfSimulationResult } from '@/types';
import { runWhatIfSimulation } from '@/lib/attendance-engine';
import { Sliders, Sparkles, ArrowRight, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface WhatIfSimulatorProps {
  subjects: SubjectStats[];
  initialSubjectCode?: string;
  onOpenChatWithPrompt: (prompt: string) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  subjects,
  initialSubjectCode,
  onOpenChatWithPrompt
}) => {
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>(initialSubjectCode || subjects[0]?.code || 'CS601');
  const [futureMisses, setFutureMisses] = useState<number>(2);
  const [futureAttends, setFutureAttends] = useState<number>(0);
  const [simulationResults, setSimulationResults] = useState<WhatIfSimulationResult[]>([]);

  useEffect(() => {
    if (initialSubjectCode) {
      setSelectedSubjectCode(initialSubjectCode);
    }
  }, [initialSubjectCode]);

  useEffect(() => {
    if (selectedSubjectCode === 'ALL') {
      const results = subjects.map(s => runWhatIfSimulation(s, futureMisses, futureAttends));
      setSimulationResults(results);
    } else {
      const sub = subjects.find(s => s.code === selectedSubjectCode);
      if (sub) {
        setSimulationResults([runWhatIfSimulation(sub, futureMisses, futureAttends)]);
      }
    }
  }, [selectedSubjectCode, futureMisses, futureAttends, subjects]);

  const selectedSubject = subjects.find(s => s.code === selectedSubjectCode);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Sliders className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white">Interactive What-If Attendance Simulator</h2>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Simulate attendance outcomes before taking leave. Test scenarios like &quot;What if I miss the next 3 Operating Systems classes?&quot; or &quot;What if I attend 5 consecutive DBMS lectures?&quot;
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <h3 className="font-semibold text-white text-sm flex items-center space-x-2">
            <span>Simulation Parameters</span>
          </h3>

          {/* Subject Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Select Target Subject</label>
            <select
              value={selectedSubjectCode}
              onChange={e => setSelectedSubjectCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">🌐 All Subjects Simultaneously</option>
              {subjects.map(s => (
                <option key={s.subjectId} value={s.code}>
                  {s.code}: {s.name} ({s.currentPercentage}%)
                </option>
              ))}
            </select>
          </div>

          {/* Slider 1: Future Misses */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-rose-300">Future Classes to Miss</label>
              <span className="text-xs font-bold text-rose-400 px-2 py-0.5 bg-rose-500/10 rounded border border-rose-500/20">
                {futureMisses} Class{futureMisses !== 1 ? 'es' : ''}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={futureMisses}
              onChange={e => setFutureMisses(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 Misses</span>
              <span>5 Classes</span>
              <span>10 Classes</span>
            </div>
          </div>

          {/* Slider 2: Future Attends */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-emerald-300">Future Classes to Attend</label>
              <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                {futureAttends} Class{futureAttends !== 1 ? 'es' : ''}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={futureAttends}
              onChange={e => setFutureAttends(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 Attends</span>
              <span>7 Classes</span>
              <span>15 Classes</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] font-medium text-slate-400">Quick Simulation Presets:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setFutureMisses(2); setFutureAttends(0); }}
                className="p-2 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-left"
              >
                Miss next 2 classes
              </button>
              <button
                onClick={() => { setFutureMisses(4); setFutureAttends(0); }}
                className="p-2 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-left"
              >
                Miss next 4 classes
              </button>
              <button
                onClick={() => { setFutureMisses(0); setFutureAttends(5); }}
                className="p-2 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-left"
              >
                Attend next 5 classes
              </button>
              <button
                onClick={() => { setFutureMisses(0); setFutureAttends(10); }}
                className="p-2 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-left"
              >
                Attend next 10 classes
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Simulation Results Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">Projected Outcomes</h3>
            <span className="text-xs text-slate-400">
              Simulating: +{futureAttends} attends, -{futureMisses} misses
            </span>
          </div>

          <div className="space-y-4">
            {simulationResults.map((sim, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl bg-slate-900 border transition-all space-y-3 ${
                  sim.projectedStatus === 'CRITICAL'
                    ? 'border-rose-500/50 bg-rose-950/10'
                    : sim.projectedStatus === 'WARNING'
                    ? 'border-amber-500/50 bg-amber-950/10'
                    : 'border-emerald-500/50 bg-emerald-950/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {sim.subjectCode}
                    </span>
                    <span className="font-semibold text-white text-sm">{sim.subjectName}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">Status Shift:</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {sim.initialStatus}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-500" />
                    <span className={`text-xs px-2 py-0.5 rounded font-bold border ${
                      sim.projectedStatus === 'SAFE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      sim.projectedStatus === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {sim.projectedStatus}
                    </span>
                  </div>
                </div>

                {/* Percentage Shift Gauge */}
                <div className="grid grid-cols-3 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-center">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Current Pct</span>
                    <span className="text-sm font-bold text-slate-200">{sim.currentPercentage}%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Projected Pct</span>
                    <span className={`text-lg font-black ${
                      sim.projectedPercentage >= 75 ? 'text-emerald-400' :
                      sim.projectedPercentage >= 65 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {sim.projectedPercentage}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Net Change</span>
                    <span className={`text-sm font-bold flex items-center justify-center space-x-1 ${
                      sim.percentageChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {sim.percentageChange >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5 inline" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 inline" />
                      )}
                      <span>{sim.percentageChange > 0 ? `+${sim.percentageChange}%` : `${sim.percentageChange}%`}</span>
                    </span>
                  </div>
                </div>

                {/* Recommendation */}
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                  {sim.recommendation}
                </p>

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() =>
                      onOpenChatWithPrompt(`What happens if I miss ${futureMisses} classes in ${sim.subjectCode}?`)
                    }
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Ask AI detailed explanation</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
