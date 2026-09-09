'use client';

import React, { useState, useEffect } from 'react';
import { Student, SubjectStats, RiskAlert, AttendanceLog, LeaveODRequest, CondonationRule } from '@/types';
import { Navbar } from '@/components/Navbar';
import { AttendanceSummary } from '@/components/AttendanceSummary';
import { ShortagePredictor } from '@/components/ShortagePredictor';
import { WhatIfSimulator } from '@/components/WhatIfSimulator';
import { TrendAnalysis } from '@/components/TrendAnalysis';
import { RiskAlertCenter } from '@/components/RiskAlertCenter';
import { LeaveODManager } from '@/components/LeaveODManager';
import { CondonationChecker } from '@/components/CondonationChecker';
import { AIChatAssistant } from '@/components/AIChatAssistant';
import { Sparkles, Database, ShieldAlert, BookOpen, Layers } from 'lucide-react';

export default function Home() {
  const [student, setStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<SubjectStats[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveODRequest[]>([]);
  const [condonationRules, setCondonationRules] = useState<CondonationRule[]>([]);
  const [overallPercentage, setOverallPercentage] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<string>('summary');
  const [selectedWhatIfSubject, setSelectedWhatIfSubject] = useState<string>('CS601');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const [attRes, leaveRes] = await Promise.all([
        fetch('/api/attendance'),
        fetch('/api/leave-od')
      ]);

      const attData = await attRes.json();
      const leaveData = await leaveRes.json();

      if (attData.success) {
        setStudent(attData.student);
        setSubjects(attData.subjects);
        setAlerts(attData.alerts);
        setLogs(attData.logs || []);
        setOverallPercentage(attData.overallPercentage);
      }

      if (leaveData.success) {
        setLeaveRequests(leaveData.requests);
      }
    } catch (err) {
      console.error('Failed to load CampusTrack data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const handleSelectSubjectForWhatIf = (subjectCode: string) => {
    setSelectedWhatIfSubject(subjectCode);
    setActiveTab('whatif');
  };

  const handleOpenChatWithPrompt = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setIsChatOpen(true);
  };

  const handleUploadProof = async (requestId: string) => {
    try {
      const res = await fetch('/api/leave-od', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPLOAD_PROOF', requestId })
      });
      const data = await res.json();
      if (data.success) {
        fetchAttendanceData();
      }
    } catch (err) {
      console.error('Failed to upload proof:', err);
    }
  };

  const handleSubmitLeaveRequest = async (req: {
    requestType: 'LEAVE' | 'ON_DUTY';
    reason: string;
    fromDate: string;
    toDate: string;
    affectedSubjects: string[];
  }) => {
    try {
      const res = await fetch('/api/leave-od', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });
      const data = await res.json();
      if (data.success) {
        fetchAttendanceData();
      }
    } catch (err) {
      console.error('Failed to submit leave request:', err);
    }
  };

  const criticalCount = subjects.filter(s => s.status === 'CRITICAL').length;
  const warningCount = subjects.filter(s => s.status === 'WARNING').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 text-slate-300">
        <div className="h-12 w-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center animate-pulse">
          <Sparkles className="h-6 w-6 text-blue-400" />
        </div>
        <p className="text-sm font-semibold">Loading CampusTrack AI Data Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-blue-500/20 selection:text-blue-300">
      {/* Navigation Header */}
      <Navbar
        student={student}
        overallPercentage={overallPercentage}
        criticalCount={criticalCount}
        warningCount={warningCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenChat={() => handleOpenChatWithPrompt("Am I at risk of shortage anywhere?")}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Render Tab View */}
        {activeTab === 'summary' && (
          <AttendanceSummary
            subjects={subjects}
            overallPercentage={overallPercentage}
            totalHeld={subjects.reduce((a, b) => a + b.classesHeld, 0)}
            totalAttended={subjects.reduce((a, b) => a + b.classesAttended, 0)}
            onSelectSubjectForWhatIf={handleSelectSubjectForWhatIf}
            onOpenChatWithPrompt={handleOpenChatWithPrompt}
          />
        )}

        {activeTab === 'prediction' && (
          <ShortagePredictor
            subjects={subjects}
            onOpenChatWithPrompt={handleOpenChatWithPrompt}
          />
        )}

        {activeTab === 'whatif' && (
          <WhatIfSimulator
            subjects={subjects}
            initialSubjectCode={selectedWhatIfSubject}
            onOpenChatWithPrompt={handleOpenChatWithPrompt}
          />
        )}

        {activeTab === 'trends' && (
          <TrendAnalysis
            subjects={subjects}
            logs={logs}
            onOpenChatWithPrompt={handleOpenChatWithPrompt}
          />
        )}

        {activeTab === 'alerts' && (
          <RiskAlertCenter
            alerts={alerts}
            onOpenChatWithPrompt={handleOpenChatWithPrompt}
          />
        )}

        {activeTab === 'leave' && (
          <LeaveODManager
            requests={leaveRequests}
            subjects={subjects}
            onUploadProof={handleUploadProof}
            onSubmitRequest={handleSubmitLeaveRequest}
          />
        )}

        {activeTab === 'condonation' && (
          <CondonationChecker
            subjects={subjects}
            rules={[
              {
                id: 'rule-1',
                ruleName: 'Medical Ground Condonation',
                minEligibilityPct: 65,
                maxThresholdPct: 74.99,
                requiredDocuments: ['Medical Certificate', 'Prescription Slip', 'Parent Leave Intimation Letter'],
                feePerSubject: 500,
                description: 'For students missing classes due to certified medical reasons.'
              },
              {
                id: 'rule-2',
                ruleName: 'Official On-Duty (OD) Condonation',
                minEligibilityPct: 65,
                maxThresholdPct: 74.99,
                requiredDocuments: ['Hackathon Certificate', 'HOD Endorsement Letter'],
                feePerSubject: 0,
                description: 'For students representing the institute in competitions or sports.'
              }
            ]}
            onOpenChatWithPrompt={handleOpenChatWithPrompt}
          />
        )}
      </main>

      {/* Floating AI Drawer Component */}
      <AIChatAssistant
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialPrompt={chatInitialPrompt}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 CampusTrack AI — Intelligent Campus Attendance Assistant</p>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Next.js App Router</span>
            <span>•</span>
            <span>shadcn/ui</span>
            <span>•</span>
            <span>Supabase PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
