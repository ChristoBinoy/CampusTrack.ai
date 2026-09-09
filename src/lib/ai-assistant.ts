import { SubjectStats, LeaveODRequest, CondonationRule, ChatMessage } from '@/types';
import { runWhatIfSimulation, checkCondonationEligibility } from './attendance-engine';

export async function processAIChatQuery(
  query: string,
  subjects: SubjectStats[],
  leaveRequests: LeaveODRequest[],
  condonationRules: CondonationRule[]
): Promise<ChatMessage> {
  const lowerQuery = query.toLowerCase().trim();

  // Calculate overall metrics
  const totalHeld = subjects.reduce((sum, s) => sum + s.classesHeld, 0);
  const totalAttended = subjects.reduce((sum, s) => sum + s.classesAttended, 0);
  const overallPct = Math.round((totalAttended / totalHeld) * 10000) / 100;

  const criticalSubjects = subjects.filter(s => s.status === 'CRITICAL');
  const warningSubjects = subjects.filter(s => s.status === 'WARNING');
  const safeSubjects = subjects.filter(s => s.status === 'SAFE');

  let responseText = '';
  let suggestedActions: string[] = [];

  // Match intent 1: "Am I at risk anywhere?", "risk", "shortage", "status summary"
  if (
    lowerQuery.includes('risk') ||
    lowerQuery.includes('shortage') ||
    lowerQuery.includes('safe') ||
    lowerQuery.includes('overall') ||
    lowerQuery.includes('summary') ||
    lowerQuery.includes('status')
  ) {
    responseText = `Here is your current CampusTrack AI attendance overview:\n\n`;
    responseText += `📊 **Overall Attendance**: **${overallPct}%** (${totalAttended} / ${totalHeld} total classes attended across 5 subjects).\n\n`;

    if (criticalSubjects.length > 0) {
      responseText += `🚨 **Critical Alert**: You have **${criticalSubjects.length} subject in Critical status**:\n`;
      criticalSubjects.forEach(s => {
        responseText += `• **${s.code} (${s.name})**: Currently at **${s.currentPercentage}%** (below ${s.minRequirement}% requirement). `;
        if (s.isRecoveryFeasible) {
          responseText += `You must attend the next **${s.recoveryNeeded} consecutive classes** to recover to 75%.\n`;
        } else {
          responseText += `Recovery is NOT feasible (${s.recoveryNeeded} needed vs ${s.remainingClassesInTerm} left). File for Condonation immediately!\n`;
        }
      });
      responseText += `\n`;
    }

    if (warningSubjects.length > 0) {
      responseText += `⚠️ **Warning Alert**: **${warningSubjects.length} subjects in Warning status**:\n`;
      warningSubjects.forEach(s => {
        responseText += `• **${s.code} (${s.name})**: Currently at **${s.currentPercentage}%**. ${
          s.safeMisses > 0
            ? `You have a tight buffer of **${s.safeMisses} safe miss**. `
            : `Attend the next **${s.recoveryNeeded} class** to reach ${s.minRequirement}%.`
        }\n`;
      });
      responseText += `\n`;
    }

    if (safeSubjects.length > 0) {
      responseText += `✅ **Safe Subjects**: ${safeSubjects.map(s => `**${s.code}** (${s.currentPercentage}%)`).join(', ')}.\n`;
    }

    suggestedActions = [
      "How many classes can I miss in Data Structures?",
      "Can I apply for condonation in Operating Systems?",
      "What if I miss 2 classes in Computer Networks?"
    ];
  }

  // Match intent 2: Subject specific query e.g. "Data Structures", "CS601", "Operating Systems", "CS602", "DBMS", "CS603", "Networks", "Machine Learning"
  else {
    const matchedSubject = subjects.find(s =>
      lowerQuery.includes(s.code.toLowerCase()) ||
      lowerQuery.includes(s.name.toLowerCase()) ||
      (s.code === 'CS601' && (lowerQuery.includes('ds') || lowerQuery.includes('data structure') || lowerQuery.includes('dsa'))) ||
      (s.code === 'CS602' && (lowerQuery.includes('os') || lowerQuery.includes('operating system'))) ||
      (s.code === 'CS603' && (lowerQuery.includes('dbms') || lowerQuery.includes('database'))) ||
      (s.code === 'CS604' && (lowerQuery.includes('cn') || lowerQuery.includes('network'))) ||
      (s.code === 'CS605' && (lowerQuery.includes('ml') || lowerQuery.includes('machine learning')))
    );

    if (matchedSubject) {
      responseText = `Here are the exact metrics for **${matchedSubject.code}: ${matchedSubject.name}**:\n\n`;
      responseText += `• **Classes Attended vs Held**: ${matchedSubject.classesAttended} / ${matchedSubject.classesHeld}\n`;
      responseText += `• **Current Attendance**: **${matchedSubject.currentPercentage}%** (Target: ${matchedSubject.minRequirement}%)\n`;
      responseText += `• **Status**: **${matchedSubject.status}**\n\n`;

      if (matchedSubject.status === 'SAFE') {
        responseText += `🟢 **Buffer Status**: You are safely above the minimum requirement. You can miss up to **${matchedSubject.safeMisses} upcoming classes** without dropping below ${matchedSubject.minRequirement}%.\n`;
      } else if (matchedSubject.status === 'WARNING') {
        responseText += `🟡 **Action Needed**: You are currently below ${matchedSubject.minRequirement}%. You must attend the next **${matchedSubject.recoveryNeeded} consecutive classes** to safely return to the safe threshold.\n`;
        responseText += `\n💡 *Tip*: You are eligible for Condonation if you hold valid medical or OD documentation!`;
      } else {
        responseText += `🔴 **Urgent Action**: Your attendance is in the Critical zone at ${matchedSubject.currentPercentage}%. `;
        if (matchedSubject.isRecoveryFeasible) {
          responseText += `You need **${matchedSubject.recoveryNeeded} consecutive attends** out of the remaining ${matchedSubject.remainingClassesInTerm} working classes in the term.`;
        } else {
          responseText += `Remaining classes (${matchedSubject.remainingClassesInTerm}) are insufficient to recover to ${matchedSubject.minRequirement}% purely through attendance. You must apply for Medical / OD Condonation immediately!`;
        }
      }

      if (matchedSubject.timeSlotPatterns.length > 0) {
        responseText += `\n\n🔍 **Pattern Flag**: ${matchedSubject.timeSlotPatterns[0].note}`;
      }

      suggestedActions = [
        `What if I miss the next 2 classes in ${matchedSubject.code}?`,
        `Am I eligible for condonation in ${matchedSubject.code}?`,
        "Show my overall risk summary"
      ];
    } 
    // Match intent 3: "What if I miss N classes" or simulation query
    else if (lowerQuery.includes('what if') || lowerQuery.includes('miss next') || lowerQuery.includes('absent')) {
      const matchNumber = lowerQuery.match(/\d+/);
      const missCount = matchNumber ? parseInt(matchNumber[0], 10) : 2;

      responseText = `🧪 **What-If Simulation Results** (Assuming you miss the next **${missCount} classes**):\n\n`;

      subjects.forEach(sub => {
        const sim = runWhatIfSimulation(sub, missCount, 0);
        responseText += `• **${sub.code} (${sub.name})**: Current ${sub.currentPercentage}% ➔ **${sim.projectedPercentage}%** (${sim.projectedStatus})\n`;
      });

      responseText += `\n📌 **Key Takeaway**: Missing ${missCount} consecutive classes across all subjects will drop Operating Systems down to ${runWhatIfSimulation(subjects.find(s=>s.code==='CS602')!, missCount, 0).projectedPercentage}%!`;

      suggestedActions = [
        "What if I attend all next 5 classes instead?",
        "Check my condonation eligibility",
        "View pending OD/Leave proof deadlines"
      ];
    }
    // Match intent 4: "Condonation", "medical", "od proof", "rules"
    else if (lowerQuery.includes('condonation') || lowerQuery.includes('medical') || lowerQuery.includes('proof') || lowerQuery.includes('od')) {
      const eligibleSubjects = subjects.map(s => checkCondonationEligibility(s, condonationRules)).filter(c => c.isEligible);

      responseText = `📋 **Condonation & Leave Reconciliation Insights**:\n\n`;

      if (eligibleSubjects.length > 0) {
        responseText += `✨ **Condonation Eligibility**: You are currently eligible for condonation in **${eligibleSubjects.map(e => e.subjectCode).join(', ')}** (Attendance between 65% - 74.9%).\n\n`;
        responseText += `📑 **Required Documents Checklist**:\n`;
        eligibleSubjects[0].requiredDocs.forEach(doc => {
          responseText += ` • ${doc}\n`;
        });
        responseText += `\n`;
      } else {
        responseText += `You currently do not have subjects strictly in the 65% - 74.9% condonation bracket.\n\n`;
      }

      const pendingProofs = leaveRequests.filter(r => r.status === 'PROOF_REQUIRED' && !r.proofSubmitted);
      if (pendingProofs.length > 0) {
        responseText += `⏰ **Pending Proof Submissions**:\n`;
        pendingProofs.forEach(p => {
          responseText += ` • **${p.requestType}**: "${p.reason}" (Deadline: **${p.proofDeadline}**)\n`;
        });
      } else {
        responseText += `✅ All submitted Leave/OD proof documents are up to date!`;
      }

      suggestedActions = [
        "Upload proof for CodeChef Hackathon OD",
        "Am I at risk of shortage anywhere?",
        "How many classes can I miss in DS?"
      ];
    }
    // Fallback general supportive response
    else {
      responseText = `I'm **CampusTrack AI**, your intelligent attendance assistant! I can help you with:\n\n` +
        `• 📊 **Subject & Overall Summaries**: Real-time percentages and requirement thresholds.\n` +
        `• 🔮 **Shortage & Recovery Predictions**: Exact counts of safe misses or required consecutive attends.\n` +
        `• 🧪 **What-If Simulations**: Project your attendance if you miss or attend future classes.\n` +
        `• 📜 **Condonation & OD Reconciliation**: Check medical eligibility and proof deadlines.\n\n` +
        `Try asking me one of the questions below:`;

      suggestedActions = [
        "Am I at risk of shortage anywhere?",
        "How many classes can I miss in CS601?",
        "What if I miss the next 2 classes?",
        "Check my condonation eligibility"
      ];
    }
  }

  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    text: responseText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestedActions
  };
}
