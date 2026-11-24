import { AppState, DemoUserProfile } from '../types/mebt';
import { CURRENT_SCHEMA_VERSION } from '../services/storageAdapter';

function daysFromToday(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function isoDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export const DEMO_ACCOUNTS: Record<string, DemoUserProfile> = {
  phone: {
    id: 'demo-user-phone',
    displayName: 'Selamawit T. (Demo)',
    authMethod: 'phone',
    contactLabel: '+27 00 555 0101 (Fictional)',
    documentationStatus: 'permanent_resident',
    objectives: ['citizenship', 'complaints_followups', 'know_your_rights'],
    isGuest: false,
    premiumPreviewEnabled: true,
    onboardingCompleted: true,
    tutorialDismissed: false,
    tutorialStep: 0,
  },
  email: {
    id: 'demo-user-email',
    displayName: 'Dawit B. (Demo)',
    authMethod: 'email',
    contactLabel: 'dawit.demo@example.mebt.invalid',
    documentationStatus: 'asylum_seeker',
    objectives: ['refugee_asylum', 'know_your_rights', 'emergency_protection'],
    isGuest: false,
    premiumPreviewEnabled: true,
    onboardingCompleted: true,
    tutorialDismissed: false,
    tutorialStep: 0,
  },
  google: {
    id: 'demo-user-google',
    displayName: 'Hanna G. (Demo)',
    authMethod: 'google',
    contactLabel: 'hanna.demo@example.mebt.invalid',
    documentationStatus: 'visa_permit',
    objectives: ['permanent_residence', 'know_your_rights'],
    isGuest: false,
    premiumPreviewEnabled: true,
    onboardingCompleted: true,
    tutorialDismissed: false,
    tutorialStep: 0,
  },
  guest: {
    id: 'demo-guest',
    displayName: 'Guest Explorer',
    authMethod: 'guest',
    contactLabel: 'Guest session (local only)',
    documentationStatus: 'prefer_not_to_say',
    objectives: ['know_your_rights'],
    isGuest: true,
    premiumPreviewEnabled: false,
    onboardingCompleted: true,
    tutorialDismissed: false,
    tutorialStep: 0,
  },
};

export function createInitialDemoState(skipOnboarding = false): AppState {
  const todayPlus4 = daysFromToday(4);
  const todayPlus12 = daysFromToday(12);
  const todayPlus24 = daysFromToday(24);
  const todayMinus2 = daysFromToday(-2);

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    language: 'en',
    user: {
      ...DEMO_ACCOUNTS.phone,
      onboardingCompleted: skipOnboarding,
      tutorialDismissed: false,
      tutorialStep: 0,
    },
    accessibility: {
      textScale: 'standard',
      highContrast: false,
      reducedMotion: false,
      simplifiedGuidance: false,
      theme: 'light',
    },
    notificationPrefs: {
      inApp: true,
      push: false,
      email: true,
      whatsapp: false,
      sms: false,
      calendar: true,
      frequency: 'immediate',
    },
    cases: [
      {
        id: 'case-demo-pr-1',
        title: 'Permanent Residence Follow-Up (Fictional Demo)',
        pathwayId: 'permanent_residence',
        institutionLabel: 'Department of Home Affairs (Example)',
        referenceLabel: 'DEMO-PR-2025-0418',
        state: 'blocked',
        userTargetDate: todayPlus4,
        createdAt: isoDaysAgo(21),
        updatedAt: isoDaysAgo(1),
        archived: false,
        checklist: [
          {
            id: 'pr-1',
            title: 'Review current permit validity and expiry dates (Demo prerequisite)',
            description: 'Record expiry date of current permit metadata in the Vault.',
            whyItMatters: 'Knowing your expiry window early helps you plan ahead without gaps.',
            isPrerequisite: true,
            requiresDocumentCategory: 'residence_permits',
            completed: true,
            completedAt: isoDaysAgo(18),
          },
          {
            id: 'pr-2',
            title: 'Organise identity and civil status records',
            description: 'Group identity metadata, birth or marriage certificates, and translation notes.',
            whyItMatters: 'Consistent records prevent administrative hold-ups.',
            isPrerequisite: true,
            requiresDocumentCategory: 'civil_records',
            completed: true,
            completedAt: isoDaysAgo(15),
          },
          {
            id: 'pr-3',
            title: 'Store submission receipt metadata',
            description: 'Add your fictional receipt label to the Vault and link it to this case.',
            whyItMatters: 'A written receipt proves when and where your file was lodged.',
            requiresDocumentCategory: 'receipts_submissions',
            completed: true,
            completedAt: isoDaysAgo(12),
          },
          {
            id: 'pr-4',
            title: 'Prepare written follow-up letter for delayed outcome',
            description: 'Use MEBT correspondence templates to draft a polite inquiry with your reference label.',
            whyItMatters: 'A clear written paper trail is essential if escalation is needed later.',
            completed: false,
          },
          {
            id: 'pr-5',
            title: 'Log call-centre or email inquiry response',
            description: 'Record the ticket number and date of any response received.',
            whyItMatters: 'Helps you track how long each step takes.',
            completed: false,
          },
        ],
        blockers: [
          {
            id: 'blk-pr-1',
            type: 'long_wait',
            title: 'No feedback after 6 months since receipt (Fictional example)',
            details: 'Recorded two counter visits without a written update or tracking status.',
            guidanceSteps: [
              'Gather your submission receipt date and fictional reference label in one summary.',
              'Draft a polite written Request for Information using the Correspondence tab.',
              'Set a 14-day follow-up reminder so you can track whether a reply arrives.',
              'If no response arrives after documented follow-ups, review free Legal Assistance contacts.',
            ],
            createdAt: isoDaysAgo(3),
            resolved: false,
          },
        ],
        notes: [
          {
            id: 'note-pr-1',
            text: 'Visited regional counter (fictional log). Was advised to check back via written inquiry with receipt reference.',
            createdAt: isoDaysAgo(5),
          },
        ],
        followUps: [
          {
            id: 'fu-pr-1',
            title: 'Send written status inquiry to contact desk',
            dueDate: todayMinus2,
            planStatement: 'Follow up on my permanent residence application with receipt DEMO-PR-2025-0418.',
            channel: 'email',
            completed: false,
          },
        ],
        correspondence: [
          {
            id: 'corr-pr-1',
            templateType: 'application_followup',
            subject: 'Polite Follow-Up: Permanent Residence File DEMO-PR-2025-0418 (Demo)',
            recipientLabel: 'Civic & Immigration Inquiries Desk (Example)',
            body: 'Dear Sir/Madam,\n\nI am writing to politely follow up on my demonstration Permanent Residence record (Reference: DEMO-PR-2025-0418). Please advise if any additional supporting information is needed.\n\nKind regards,\nSelamawit T. (Demo)',
            createdAt: isoDaysAgo(10),
          },
        ],
        timeline: [
          {
            id: 'tl-pr-1',
            date: isoDaysAgo(21),
            kind: 'case_created',
            title: 'Created fictional Permanent Residence case',
            detail: 'Reference DEMO-PR-2025-0418 recorded.',
          },
          {
            id: 'tl-pr-2',
            date: isoDaysAgo(12),
            kind: 'checklist_completed',
            title: 'Completed 3 preparation checklist steps',
            detail: 'Permit validity, civil records, and submission receipt organised.',
          },
          {
            id: 'tl-pr-3',
            date: isoDaysAgo(10),
            kind: 'correspondence_saved',
            title: 'Saved demonstration follow-up correspondence',
            detail: 'Application follow-up template recorded.',
          },
          {
            id: 'tl-pr-4',
            date: isoDaysAgo(3),
            kind: 'blocker_added',
            title: 'Logged administrative blocker: Long waiting period',
            detail: 'Case state moved to Blocked with generic follow-up guidance.',
          },
        ],
      },
      {
        id: 'case-demo-asylum-1',
        title: 'Refugee / Asylum Permit Renewal Preparation (Fictional Demo)',
        pathwayId: 'refugee_asylum',
        institutionLabel: 'Refugee Reception Office (Example)',
        referenceLabel: 'DEMO-RRO-2026-0192',
        state: 'follow_up_scheduled',
        userTargetDate: todayPlus12,
        createdAt: isoDaysAgo(14),
        updatedAt: isoDaysAgo(2),
        archived: false,
        checklist: [
          {
            id: 'as-1',
            title: 'Record current permit expiry date in Vault (Demo prerequisite)',
            description: 'Track fictional expiry date so reminders fire early.',
            whyItMatters: 'Avoids last-minute renewal pressure.',
            isPrerequisite: true,
            requiresDocumentCategory: 'refugee_asylum',
            completed: true,
            completedAt: isoDaysAgo(13),
          },
          {
            id: 'as-2',
            title: 'Check contact details & proof of address',
            description: 'Ensure phone, email, and residential address note are up to date.',
            whyItMatters: 'Ensures you do not miss office appointment notices.',
            requiresDocumentCategory: 'proof_of_address',
            completed: true,
            completedAt: isoDaysAgo(9),
          },
          {
            id: 'as-3',
            title: 'Prepare written summary of prior visits and receipts',
            description: 'List dates of previous renewals or online extension confirmations.',
            whyItMatters: 'Protects your history if an office file cannot be located immediately.',
            requiresDocumentCategory: 'receipts_submissions',
            completed: false,
          },
          {
            id: 'as-4',
            title: 'Confirm official renewal instructions directly',
            description: 'Verify current procedure with the reception office or accredited legal clinic.',
            whyItMatters: 'Procedures vary across offices and change periodically.',
            completed: false,
          },
        ],
        blockers: [],
        notes: [
          {
            id: 'note-as-1',
            text: 'Saved sample proof of address metadata ahead of renewal check-in.',
            createdAt: isoDaysAgo(8),
          },
        ],
        followUps: [
          {
            id: 'fu-as-1',
            title: 'Confirm renewal appointment details',
            dueDate: todayPlus12,
            planStatement: 'Review my renewal checklist and confirm office procedure next week.',
            channel: 'in_person',
            completed: false,
          },
        ],
        correspondence: [],
        timeline: [
          {
            id: 'tl-as-1',
            date: isoDaysAgo(14),
            kind: 'case_created',
            title: 'Created fictional Refugee & Asylum Renewal case',
            detail: 'Reference DEMO-RRO-2026-0192 recorded.',
          },
          {
            id: 'tl-as-2',
            date: isoDaysAgo(9),
            kind: 'followup_scheduled',
            title: 'Scheduled renewal preparation follow-up',
            detail: `Planned for ${todayPlus12}`,
          },
        ],
      },
    ],
    vaultDocuments: [
      {
        id: 'doc-demo-1',
        title: 'Sample Temporary Permit Record (Fictional)',
        category: 'refugee_asylum',
        fictionalRefCode: 'SAMPLE-PERMIT-8841',
        holderName: 'Selamawit T. (Demo)',
        issueDate: daysFromToday(-165),
        expiryDate: todayPlus24,
        linkedCaseId: 'case-demo-asylum-1',
        notes: 'Fictional sample metadata illustrating upcoming renewal tracking.',
        sampleTemplate: 'permit_card',
        createdAt: isoDaysAgo(20),
      },
      {
        id: 'doc-demo-2',
        title: 'Sample Submission Receipt (Fictional)',
        category: 'receipts_submissions',
        fictionalRefCode: 'DEMO-PR-2025-0418',
        holderName: 'Selamawit T. (Demo)',
        issueDate: daysFromToday(-190),
        linkedCaseId: 'case-demo-pr-1',
        notes: 'Fictional receipt metadata linked to the Permanent Residence demo case.',
        sampleTemplate: 'receipt_letter',
        createdAt: isoDaysAgo(18),
      },
      {
        id: 'doc-demo-3',
        title: 'Sample Proof of Address Summary (Fictional)',
        category: 'proof_of_address',
        fictionalRefCode: 'SAMPLE-ADDR-2026',
        holderName: 'Selamawit T. (Demo)',
        issueDate: daysFromToday(-35),
        expiryDate: daysFromToday(55),
        linkedCaseId: 'case-demo-asylum-1',
        notes: 'Fictional municipal statement metadata for demonstration purposes.',
        sampleTemplate: 'address_proof',
        createdAt: isoDaysAgo(10),
      },
    ],
    notifications: [
      {
        id: 'notif-demo-1',
        kind: 'followup_reminder',
        urgency: 'high',
        title: 'Overdue follow-up: Permanent Residence inquiry',
        body: `Your planned follow-up for DEMO-PR-2025-0418 was scheduled for ${todayMinus2}. You can draft a polite follow-up note or reschedule.`,
        createdAt: isoDaysAgo(1),
        read: false,
        dismissed: false,
        relatedCaseId: 'case-demo-pr-1',
        targetTab: 'cases',
      },
      {
        id: 'notif-demo-2',
        kind: 'blocker_reminder',
        urgency: 'high',
        title: 'Active blocker logged on Permanent Residence case',
        body: 'Review suggested generic follow-up steps or browse free legal assistance options.',
        createdAt: isoDaysAgo(2),
        read: false,
        dismissed: false,
        relatedCaseId: 'case-demo-pr-1',
        targetTab: 'cases',
      },
      {
        id: 'notif-demo-3',
        kind: 'document_expiry',
        urgency: 'medium',
        title: 'Fictional permit metadata expires in 24 days',
        body: `Sample Temporary Permit Record (SAMPLE-PERMIT-8841) has a demo expiry date of ${todayPlus24}.`,
        createdAt: isoDaysAgo(1),
        read: false,
        dismissed: false,
        relatedDocId: 'doc-demo-1',
        targetTab: 'vault',
      },
    ],
    dismissedRecommendationIds: [],
    postponedRecommendations: {},
    lastMilestoneMessage: null,
  };
}

export function createEmptyDemoState(userOverride?: Partial<DemoUserProfile>): AppState {
  const base = createInitialDemoState(true);
  return {
    ...base,
    user: {
      ...base.user,
      onboardingCompleted: true,
      ...(userOverride ?? {}),
    },
    cases: [],
    vaultDocuments: [],
    notifications: [],
    dismissedRecommendationIds: [],
    postponedRecommendations: {},
    lastMilestoneMessage: null,
  };
}
