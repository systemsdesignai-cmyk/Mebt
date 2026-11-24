import {
  ActionRecommendation,
  AdminCase,
  AppState,
  CaseBlocker,
  CaseOrgState,
  CorrespondenceTemplateType,
  VaultDocument,
  VaultDocumentCategory,
} from '../types/mebt';
import { getPathwayById } from '../data/pathways';

export const CASE_STATE_LABELS: Record<CaseOrgState, string> = {
  not_started: 'Not started',
  preparing_information: 'Preparing information',
  ready_for_next_action: 'Ready for next action',
  action_recorded: 'Action recorded',
  awaiting_response: 'Awaiting response',
  follow_up_scheduled: 'Follow-up scheduled',
  blocked: 'Blocked',
  closed: 'Closed',
};

export const BLOCKER_PRESETS: Record<
  CaseBlocker['type'],
  { label: string; guidanceSteps: string[] }
> = {
  long_wait: {
    label: 'Long waiting period with no feedback',
    guidanceSteps: [
      'Confirm your fictional reference label and original submission date in the timeline.',
      'Draft a polite written Request for Information or Application Follow-Up in the Correspondence tab.',
      'Schedule a 14-day follow-up reminder to record whether a response arrives.',
      'If repeated documented follow-ups receive no reply, preview escalation options in the Assistance Directory.',
    ],
  },
  missing_document: {
    label: 'Missing or unverified supporting document',
    guidanceSteps: [
      'List the exact document name requested so nothing is overlooked.',
      'Check the Document Vault to see whether related metadata already exists.',
      'Ask the issuing office in writing for a clear list of acceptable alternatives if a document is unavailable.',
      'Record any replacement receipt or affidavit date in your case notes.',
    ],
  },
  appointment_difficulty: {
    label: 'Difficulty booking or confirming an appointment',
    guidanceSteps: [
      'Save dated notes of every booking attempt or portal error you encounter.',
      'Draft a Request for Clarification noting your attempts and asking for the next available slot.',
      'Check free refugee or community legal assistance contacts in the Assistance Directory if expiry is near.',
    ],
  },
  conflicting_instructions: {
    label: 'Conflicting verbal instructions from staff',
    guidanceSteps: [
      'Write down the date, office name, and exact wording of each instruction received.',
      'Send a calm Request for Clarification asking for the required steps in writing.',
      'Keep your correspondence saved in MEBT before taking the next visit.',
    ],
  },
  expired_paperwork: {
    label: 'Document expired while waiting for processing',
    guidanceSteps: [
      'Keep copies of all prior renewal attempts, receipts, and application references together.',
      'Check the Know Your Rights section for plain-language guidance on expired documentation (pending verification).',
      'Review free Legal Assistance or Emergency Protection contacts in the Assistance Directory immediately if urgent.',
    ],
  },
  custom: {
    label: 'Other administrative blocker',
    guidanceSteps: [
      'Describe what is preventing progress in factual, dated terms.',
      'Identify one small verifiable step you can complete next (such as requesting written clarification).',
      'Schedule a realistic follow-up date so the blocker does not stall indefinitely.',
    ],
  },
};

export function getBlockerGuidance(type: CaseBlocker['type']): string[] {
  return BLOCKER_PRESETS[type]?.guidanceSteps ?? BLOCKER_PRESETS.custom.guidanceSteps;
}

/**
 * Deterministic state machine: computes the recommended internal organisational state
 * based on user-completed checklist progress, blockers, and follow-ups.
 * Note: This is strictly an internal organisational state, never an official government status.
 */
export function deriveNextCaseState(c: AdminCase): CaseOrgState {
  if (c.state === 'closed') return 'closed';

  const activeBlockers = c.blockers.filter((b) => !b.resolved);
  if (activeBlockers.length > 0) {
    return 'blocked';
  }

  const pendingFollowUps = c.followUps.filter((f) => !f.completed);
  const completedCount = c.checklist.filter((item) => item.completed).length;
  const totalCount = c.checklist.length;

  if (totalCount > 0 && completedCount === totalCount) {
    if (pendingFollowUps.length > 0) return 'follow_up_scheduled';
    if (c.correspondence.length > 0) return 'awaiting_response';
    return 'action_recorded';
  }

  if (pendingFollowUps.length > 0 && completedCount > 0) {
    return 'follow_up_scheduled';
  }

  const prerequisites = c.checklist.filter((item) => item.isPrerequisite);
  const allPrereqsDone =
    prerequisites.length > 0 && prerequisites.every((item) => item.completed);

  if (allPrereqsDone && completedCount < totalCount) {
    return 'ready_for_next_action';
  }

  if (completedCount > 0 || c.notes.length > 0 || c.correspondence.length > 0) {
    return 'preparing_information';
  }

  return 'not_started';
}

export function getCaseProgress(c: AdminCase): {
  completed: number;
  total: number;
  percent: number;
} {
  const total = c.checklist.length;
  const completed = c.checklist.filter((i) => i.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}

export function daysUntilDate(dateStr?: string): number | null {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getDocumentExpiryStatus(doc: VaultDocument): {
  status: 'expired' | 'expiring_soon' | 'valid' | 'no_expiry';
  daysLeft: number | null;
  label: string;
} {
  const days = daysUntilDate(doc.expiryDate);
  if (days === null) {
    return { status: 'no_expiry', daysLeft: null, label: 'No expiry recorded' };
  }
  if (days < 0) {
    return {
      status: 'expired',
      daysLeft: days,
      label: `Demo date passed ${Math.abs(days)}d ago`,
    };
  }
  if (days <= 30) {
    return {
      status: 'expiring_soon',
      daysLeft: days,
      label: days === 0 ? 'Demo expiry today' : `Expires in ${days}d`,
    };
  }
  return {
    status: 'valid',
    daysLeft: days,
    label: `Valid (${days}d left)`,
  };
}

export function getMissingDocumentsForCases(
  cases: AdminCase[],
  docs: VaultDocument[]
): Array<{
  caseId: string;
  caseTitle: string;
  category: VaultDocumentCategory;
  checklistTitle: string;
}> {
  const missing: Array<{
    caseId: string;
    caseTitle: string;
    category: VaultDocumentCategory;
    checklistTitle: string;
  }> = [];

  for (const c of cases) {
    if (c.archived || c.state === 'closed') continue;
    for (const item of c.checklist) {
      if (item.completed || !item.requiresDocumentCategory) continue;
      const hasMatch = docs.some(
        (d) =>
          d.category === item.requiresDocumentCategory &&
          (!d.linkedCaseId || d.linkedCaseId === c.id)
      );
      if (!hasMatch) {
        missing.push({
          caseId: c.id,
          caseTitle: c.title,
          category: item.requiresDocumentCategory,
          checklistTitle: item.title,
        });
      }
    }
  }
  return missing;
}

/**
 * Deterministic rule-based Action Centre engine (MASTER_PROMPT §11).
 * Priority logic:
 * 1. User-recorded urgent deadlines (<= 7 days or overdue)
 * 2. Overdue scheduled actions / follow-ups
 * 3. Unresolved blockers
 * 4. Outstanding prerequisites
 * 5. Upcoming follow-ups
 * 6. Optional educational / rights recommendations
 */
export function computeActionRecommendations(state: AppState): ActionRecommendation[] {
  const recs: ActionRecommendation[] = [];
  const todayIso = new Date().toISOString().slice(0, 10);
  const activeCases = state.cases.filter((c) => !c.archived && c.state !== 'closed');

  // 1. User-recorded urgent deadlines (cases + vault expiries <= 7 days)
  for (const c of activeCases) {
    const days = daysUntilDate(c.userTargetDate);
    if (days !== null && days <= 7) {
      recs.push({
        id: `rec-deadline-${c.id}`,
        priorityRank: 1,
        priorityLabel: 'User-recorded target date',
        urgency: 'high',
        title:
          days < 0
            ? `Review target date passed on "${c.title}"`
            : `Prepare for target date (${days === 0 ? 'today' : `in ${days} days`}) on "${c.title}"`,
        whyRecommended:
          'You recorded this personal target date (not a legally verified deadline). Reviewing outstanding checklist tasks now prevents last-minute stress.',
        actionLabel: 'Open case checklist',
        relatedCaseId: c.id,
        targetTab: 'cases',
      });
    }
  }

  for (const doc of state.vaultDocuments) {
    const exp = getDocumentExpiryStatus(doc);
    if (exp.status === 'expired' || (exp.daysLeft !== null && exp.daysLeft <= 7)) {
      recs.push({
        id: `rec-doc-exp-${doc.id}`,
        priorityRank: 1,
        priorityLabel: 'Fictional document expiry',
        urgency: 'high',
        title: `Check renewal plan for "${doc.title}"`,
        whyRecommended: `${exp.label}. Tracking fictional dates early helps demonstrate renewal preparation.`,
        actionLabel: 'Inspect in Vault',
        relatedDocId: doc.id,
        targetTab: 'vault',
      });
    }
  }

  // 2. Overdue scheduled follow-ups
  for (const c of activeCases) {
    for (const fu of c.followUps) {
      if (fu.completed) continue;
      const days = daysUntilDate(fu.dueDate);
      if (days !== null && days < 0) {
        recs.push({
          id: `rec-overdue-fu-${fu.id}`,
          priorityRank: 2,
          priorityLabel: 'Overdue scheduled follow-up',
          urgency: 'high',
          title: `Follow up: ${fu.title}`,
          whyRecommended: `You scheduled this action for ${fu.dueDate} (${Math.abs(days)} days ago) on "${c.title}". Complete it, draft correspondence, or reschedule.`,
          actionLabel: 'Handle follow-up',
          relatedCaseId: c.id,
          targetTab: 'cases',
        });
      }
    }
  }

  // 3. Unresolved administrative blockers
  for (const c of activeCases) {
    const activeBlockers = c.blockers.filter((b) => !b.resolved);
    for (const b of activeBlockers) {
      recs.push({
        id: `rec-blocker-${b.id}`,
        priorityRank: 3,
        priorityLabel: 'Unresolved blocker',
        urgency: 'high',
        title: `Address blocker: ${b.title}`,
        whyRecommended: `This blocker is currently pausing "${c.title}". MEBT has prepared generic step-by-step suggestions and editable follow-up templates.`,
        actionLabel: 'View blocker steps',
        relatedCaseId: c.id,
        targetTab: 'cases',
      });
    }
  }

  // 4. Outstanding prerequisites
  for (const c of activeCases) {
    const nextPrereq = c.checklist.find((item) => item.isPrerequisite && !item.completed);
    if (nextPrereq) {
      recs.push({
        id: `rec-prereq-${c.id}-${nextPrereq.id}`,
        priorityRank: 4,
        priorityLabel: 'Outstanding prerequisite',
        urgency: 'medium',
        title: `Complete prerequisite: ${nextPrereq.title}`,
        whyRecommended: `${nextPrereq.whyItMatters} Completing prerequisites first unlocks the rest of "${c.title}".`,
        actionLabel: 'Go to checklist',
        relatedCaseId: c.id,
        targetTab: 'cases',
      });
    }
  }

  // 5. Upcoming follow-ups (0 to 21 days)
  for (const c of activeCases) {
    for (const fu of c.followUps) {
      if (fu.completed) continue;
      const days = daysUntilDate(fu.dueDate);
      if (days !== null && days >= 0 && days <= 21) {
        recs.push({
          id: `rec-upcoming-fu-${fu.id}`,
          priorityRank: 5,
          priorityLabel: 'Upcoming follow-up',
          urgency: 'medium',
          title: `Upcoming plan (${days === 0 ? 'today' : `in ${days}d`}): ${fu.title}`,
          whyRecommended: `Your implementation plan: "${fu.planStatement}". Preparing a draft note ahead of time reduces effort.`,
          actionLabel: 'Review case plan',
          relatedCaseId: c.id,
          targetTab: 'cases',
        });
      }
    }
  }

  // 6. Optional educational / rights recommendation
  if (activeCases.length === 0) {
    recs.push({
      id: 'rec-edu-start-case',
      priorityRank: 6,
      priorityLabel: 'Getting started',
      urgency: 'low',
      title: 'Explore an administrative pathway or start a fictional demo case',
      whyRecommended:
        'Try Citizenship, Permanent Residence, or Refugee & Asylum workflows using fictional data to see how MEBT organises steps and follow-ups.',
      actionLabel: 'Explore pathways',
      targetTab: 'cases',
    });
  }

  recs.push({
    id: 'rec-edu-rights',
    priorityRank: 6,
    priorityLabel: 'Recommended reading',
    urgency: 'low',
    title: 'Review Know Your Rights tailored to your optional status',
    whyRecommended:
      'Plain-language rights summaries and simulated audio guides are always free and help build confidence before visiting an office.',
    actionLabel: 'Open Rights Library',
    targetTab: 'rights',
  });

  // Apply dismissals & postponements
  return recs
    .filter((r) => !state.dismissedRecommendationIds.includes(r.id))
    .filter((r) => {
      const postponedUntil = state.postponedRecommendations[r.id];
      if (!postponedUntil) return true;
      return postponedUntil <= todayIso;
    })
    .sort((a, b) => a.priorityRank - b.priorityRank);
}

export const CORRESPONDENCE_TEMPLATES: Array<{
  type: CorrespondenceTemplateType;
  label: string;
  description: string;
}> = [
  {
    type: 'application_followup',
    label: 'Application follow-up',
    description: 'Polite written check-in on a pending administrative submission.',
  },
  {
    type: 'request_information',
    label: 'Request for information',
    description: 'Ask what documents, next steps, or reference details are recorded.',
  },
  {
    type: 'request_clarification',
    label: 'Request for clarification',
    description: 'Request clear written guidance when verbal instructions were conflicting.',
  },
  {
    type: 'administrative_complaint',
    label: 'Administrative complaint',
    description: 'Structured factual log of a service issue or prolonged silence.',
  },
  {
    type: 'escalation_preparation',
    label: 'Escalation preparation',
    description: 'Organised summary prepared for an oversight desk or legal aid clinic.',
  },
];

export function buildCorrespondenceTemplate(
  templateType: CorrespondenceTemplateType,
  adminCase: AdminCase,
  userName: string
): { subject: string; recipientLabel: string; body: string } {
  const today = new Date().toISOString().slice(0, 10);
  const pathway = getPathwayById(adminCase.pathwayId);
  const pathwayName = pathway?.title ?? 'Administrative Matter';
  const ref = adminCase.referenceLabel || 'DEMO-REF-PENDING';
  const activeBlocker = adminCase.blockers.find((b) => !b.resolved);
  const blockerText = activeBlocker
    ? `\nCurrent administrative concern: ${activeBlocker.title} (${activeBlocker.details}).`
    : '';

  switch (templateType) {
    case 'application_followup':
      return {
        subject: `Polite Status Follow-Up — ${pathwayName} (Ref: ${ref}) [DEMO]`,
        recipientLabel: adminCase.institutionLabel,
        body: `Date: ${today}\nReference: ${ref}\n\nDear Administrative Officer,\n\nI am writing respectfully to request an update on my ${pathwayName.toLowerCase()} matter (${adminCase.title}).${blockerText}\n\nCould you please confirm whether my file is active and whether any additional supporting information is required from me?\n\nPlease reply in writing and provide a tracking or inquiry reference number for my records.\n\nThank you for your assistance.\n\nKind regards,\n${userName}\n[Fictional demonstration template — not professionally reviewed legal advice]`,
      };
    case 'request_information':
      return {
        subject: `Request for Written Information — ${pathwayName} (Ref: ${ref}) [DEMO]`,
        recipientLabel: adminCase.institutionLabel,
        body: `Date: ${today}\nReference: ${ref}\n\nDear Sir/Madam,\n\nI kindly request written information regarding the current administrative requirements and next steps for ${adminCase.title}.\n\nSpecifically, please clarify:\n1. Which office or channel currently handles this record.\n2. Whether any supporting document is outstanding.\n3. The standard channel for submitting follow-up correspondence.\n\nThank you for your time and assistance.\n\nSincerely,\n${userName}\n[Fictional demonstration template — not professionally reviewed legal advice]`,
      };
    case 'request_clarification':
      return {
        subject: `Request for Clarification on Next Steps — Ref: ${ref} [DEMO]`,
        recipientLabel: adminCase.institutionLabel,
        body: `Date: ${today}\nReference: ${ref}\n\nDear Office Manager / Enquiries Team,\n\nI am writing to request written clarification regarding my ${pathwayName.toLowerCase()} preparation (${adminCase.title}).${blockerText}\n\nTo ensure I follow the exact required process without error, could you please confirm in writing the specific documents or appointment steps needed next?\n\nKind regards,\n${userName}\n[Fictional demonstration template — not professionally reviewed legal advice]`,
      };
    case 'administrative_complaint':
      return {
        subject: `Formal Administrative Service Complaint — Ref: ${ref} [DEMO]`,
        recipientLabel: `${adminCase.institutionLabel} — Complaints Desk`,
        body: `Date: ${today}\nReference: ${ref}\n\nDear Complaints Officer,\n\nI wish to record a formal administrative complaint regarding delays and lack of written feedback on ${adminCase.title}.${blockerText}\n\nSummary of prior steps recorded by me:\n- Case created in personal log: ${adminCase.createdAt.slice(0, 10)}\n- Prior correspondence recorded: ${adminCase.correspondence.length}\n- Follow-ups logged: ${adminCase.followUps.length}\n\nI respectfully request a written acknowledgment with a complaint reference number and an indication of when I may expect feedback.\n\nYours faithfully,\n${userName}\n[Fictional demonstration template — not professionally reviewed legal advice]`,
      };
    case 'escalation_preparation':
      return {
        subject: `Case Escalation Summary — ${adminCase.title} (Ref: ${ref}) [DEMO]`,
        recipientLabel: 'Legal Assistance Clinic / Administrative Oversight Desk (Demo)',
        body: `Date: ${today}\nCase Title: ${adminCase.title}\nPathway: ${pathwayName}\nFictional Reference: ${ref}\nUser-Recorded Internal State: ${CASE_STATE_LABELS[adminCase.state]}\n\nDear Legal Advisor / Oversight Officer,\n\nI am requesting guidance regarding an unresolved administrative matter.${blockerText}\n\nCompleted preparation steps: ${adminCase.checklist.filter((i) => i.completed).length} of ${adminCase.checklist.length}.\nPrior correspondence attempts logged: ${adminCase.correspondence.length}.\n\nI have attached my MEBT demonstration case summary for your review and would appreciate advice on lawful escalation options.\n\nKind regards,\n${userName}\n[Fictional demonstration template — not professionally reviewed legal advice]`,
      };
  }
}

export function buildCaseReportText(adminCase: AdminCase, userName: string): string {
  const pathway = getPathwayById(adminCase.pathwayId);
  const progress = getCaseProgress(adminCase);
  const completedItems = adminCase.checklist.filter((i) => i.completed);
  const outstandingItems = adminCase.checklist.filter((i) => !i.completed);

  const lines: string[] = [
    '============================================================',
    'MEBT (መብት) — FICTIONAL DEMONSTRATION CASE REPORT',
    '============================================================',
    'NOTICE: This report reflects user-recorded demonstration notes only.',
    'It is NOT an official government status check or legal advice.',
    '',
    `Case Title: ${adminCase.title}`,
    `Pathway: ${pathway?.title ?? adminCase.pathwayId}`,
    `Example Institution: ${adminCase.institutionLabel}`,
    `User-Recorded Reference: ${adminCase.referenceLabel || 'None recorded'}`,
    `Organisational State (Internal): ${CASE_STATE_LABELS[adminCase.state]}`,
    `Prepared By (Demo Profile): ${userName}`,
    `Generated On: ${new Date().toISOString().slice(0, 10)}`,
    `User Checklist Progress: ${progress.completed}/${progress.total} (${progress.percent}%)`,
    adminCase.userTargetDate
      ? `User-Recorded Target Date (Not Official): ${adminCase.userTargetDate}`
      : 'User-Recorded Target Date: None set',
    '',
    '--- COMPLETED PREPARATION ACTIONS ---',
    ...(completedItems.length > 0
      ? completedItems.map((i) => `[x] ${i.title}`)
      : ['(None completed yet)']),
    '',
    '--- OUTSTANDING TASKS ---',
    ...(outstandingItems.length > 0
      ? outstandingItems.map((i) => `[ ] ${i.title}`)
      : ['(All checklist items completed)']),
    '',
    '--- RECORDED BLOCKERS ---',
    ...(adminCase.blockers.length > 0
      ? adminCase.blockers.map(
          (b) => `- [${b.resolved ? 'Resolved' : 'Active'}] ${b.title}: ${b.details}`
        )
      : ['(No blockers recorded)']),
    '',
    '--- SCHEDULED FOLLOW-UPS ---',
    ...(adminCase.followUps.length > 0
      ? adminCase.followUps.map(
          (f) =>
            `- ${f.dueDate} [${f.completed ? 'Done' : 'Scheduled'}]: ${f.title} (${f.planStatement})`
        )
      : ['(No follow-ups scheduled)']),
    '',
    '--- CORRESPONDENCE HISTORY ---',
    ...(adminCase.correspondence.length > 0
      ? adminCase.correspondence.map(
          (c) => `- ${c.createdAt.slice(0, 10)}: ${c.subject} -> ${c.recipientLabel}`
        )
      : ['(No correspondence saved yet)']),
    '',
    '--- CASE TIMELINE ---',
    ...adminCase.timeline.map(
      (t) => `- ${t.date.slice(0, 10)}: ${t.title}${t.detail ? ` — ${t.detail}` : ''}`
    ),
    '============================================================',
  ];

  return lines.join('\n');
}
