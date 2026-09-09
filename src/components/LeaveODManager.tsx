'use client';

import React, { useState } from 'react';
import { LeaveODRequest, SubjectStats } from '@/types';
import { FileText, Plus, CheckCircle2, Clock, Upload, AlertCircle, Calendar } from 'lucide-react';

interface LeaveODManagerProps {
  requests: LeaveODRequest[];
  subjects: SubjectStats[];
  onUploadProof: (requestId: string) => Promise<void>;
  onSubmitRequest: (req: { requestType: 'LEAVE' | 'ON_DUTY'; reason: string; fromDate: string; toDate: string; affectedSubjects: string[] }) => Promise<void>;
}

export const LeaveODManager: React.FC<LeaveODManagerProps> = ({
  requests,
  subjects,
  onUploadProof,
  onSubmitRequest
}) => {
  const [showModal, setShowModal] = useState(false);
  const [requestType, setRequestType] = useState<'LEAVE' | 'ON_DUTY'>('ON_DUTY');
  const [reason, setReason] = useState('');
  const [fromDate, setFromDate] = useState('2026-09-15');
  const [toDate, setToDate] = useState('2026-09-16');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['CS602 Operating Systems']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingProofRequests = requests.filter(r => r.status === 'PROOF_REQUIRED' && !r.proofSubmitted);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setIsSubmitting(true);
    await onSubmitRequest({
      requestType,
      reason,
      fromDate,
      toDate,
      affectedSubjects: selectedSubjects
    });
    setIsSubmitting(false);
    setShowModal(false);
    setReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-blue-400">
            <FileText className="h-5 w-5" />
            <h2 className="text-lg font-bold text-white">Leave & On-Duty (OD) Reconciliation Portal</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Cross-check unmarked absences against sanctioned Leave and official On-Duty (OD) applications to ensure attendance records are reconciled before term end.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Leave / OD Application</span>
        </button>
      </div>

      {/* Proof Submission Deadline Reminder Banner */}
      {pendingProofRequests.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Pending Proof Document Submissions ({pendingProofRequests.length})</span>
            </div>
            <span className="text-xs text-amber-300">Action Required Before Deadline</span>
          </div>

          <div className="space-y-2">
            {pendingProofRequests.map(req => (
              <div key={req.id} className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{req.requestType === 'ON_DUTY' ? 'On-Duty (OD)' : 'Medical Leave'}</span>
                    <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono text-[10px]">
                      Deadline: {req.proofDeadline}
                    </span>
                  </div>
                  <p className="text-slate-300">{req.reason}</p>
                  <p className="text-[11px] text-slate-500">Affected: {req.affectedSubjects.join(', ')}</p>
                </div>

                <button
                  onClick={() => onUploadProof(req.id)}
                  className="py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center space-x-1.5 shrink-0"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Proof Slip</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requests History */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 text-xs font-semibold text-slate-200">
          <span>Submitted Requests & Reconciliation Log</span>
          <span>Total: {requests.length} Requests</span>
        </div>

        <div className="divide-y divide-slate-800">
          {requests.map(req => (
            <div key={req.id} className="p-5 hover:bg-slate-800/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1 md:w-2/3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    req.requestType === 'ON_DUTY' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}>
                    {req.requestType}
                  </span>

                  <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] border ${
                    req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    req.status === 'PROOF_REQUIRED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {req.status === 'APPROVED' ? 'Approved & Reconciled' : req.status === 'PROOF_REQUIRED' ? 'Proof Submission Pending' : req.status}
                  </span>
                </div>

                <h4 className="font-semibold text-white text-sm pt-1">{req.reason}</h4>
                <p className="text-slate-400 flex items-center space-x-2">
                  <Calendar className="h-3 w-3 text-slate-500 inline" />
                  <span>Dates: {req.fromDate} to {req.toDate}</span>
                </p>
                <p className="text-slate-500 text-[11px]">Affected Subjects: {req.affectedSubjects.join(', ')}</p>
              </div>

              <div className="md:w-1/3 flex items-center justify-end">
                {req.proofSubmitted ? (
                  <span className="text-emerald-400 flex items-center space-x-1 font-medium bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Proof Verified</span>
                  </span>
                ) : (
                  <button
                    onClick={() => onUploadProof(req.id)}
                    className="py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all font-medium"
                  >
                    Upload Document
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Submit Leave / OD Application</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Request Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestType('ON_DUTY')}
                    className={`py-2 rounded-xl font-semibold transition-all ${
                      requestType === 'ON_DUTY' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    On-Duty (OD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType('LEAVE')}
                    className={`py-2 rounded-xl font-semibold transition-all ${
                      requestType === 'LEAVE' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Medical / Leave
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Reason / Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hackathon representation or Viral fever rest"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
