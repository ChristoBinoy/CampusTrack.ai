'use client';

import React from 'react';
import { RiskAlert } from '@/types';
import { ShieldAlert, AlertTriangle, XCircle, Info, Sparkles, ArrowRight } from 'lucide-react';

interface RiskAlertCenterProps {
  alerts: RiskAlert[];
  onOpenChatWithPrompt: (prompt: string) => void;
}

export const RiskAlertCenter: React.FC<RiskAlertCenterProps> = ({ alerts, onOpenChatWithPrompt }) => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-rose-400">
          <ShieldAlert className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white">Prioritized Risk Alert Center</h2>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Alerts are automatically ranked by mathematical urgency. Address Critical subjects first to prevent exam hall-ticket debarment or mandatory condonation penalties.
        </p>
      </div>

      {/* Alert Feed */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
            <ShieldAlert className="h-10 w-10 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-white text-base">All Clear! No Risk Alerts</h3>
            <p className="text-xs">Your attendance across all subjects is safely above requirements.</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                alert.status === 'CRITICAL'
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : alert.status === 'WARNING'
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${
                    alert.status === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                    alert.status === 'WARNING' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {alert.status === 'CRITICAL' ? (
                      <XCircle className="h-5 w-5" />
                    ) : alert.status === 'WARNING' ? (
                      <AlertTriangle className="h-5 w-5" />
                    ) : (
                      <Info className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Urgency #{alert.urgency}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                        alert.status === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                        alert.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-base mt-1">{alert.title}</h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>

              {/* Actionable Step Highlight */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Actionable Next Step:</span>
                <p className="text-slate-200 font-medium">{alert.actionableStep}</p>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  onClick={() =>
                    onOpenChatWithPrompt(`What should I do right now to resolve the ${alert.status} alert in ${alert.subjectCode}?`)
                  }
                  className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all flex items-center space-x-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  <span>Get AI Action Plan</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
