import { PathwayDefinition } from '../types/mebt';

/**
 * All 9 approved administrative pathway categories from PROTOTYPE_PRD.md & MASTER_PROMPT §12.
 * F13 (Household expansion) and Employment Rights are explicitly excluded.
 * All workflow steps are fictional demonstration checklists marked pending legal verification.
 */
export const PATHWAY_DEFINITIONS: PathwayDefinition[] = [
  {
    id: 'citizenship',
    title: 'Citizenship and naturalisation',
    shortTitle: 'Citizenship',
    summary:
      'Organise supporting records, track application preparation milestones, and manage follow-up correspondence for a demonstration citizenship journey.',
    depth: 'deep_demo',
    institutionExample: 'Department of Home Affairs (Example institution)',
    estimatedStepsLabel: '6 example steps',
    verificationNote: 'Example demonstration workflow · Legal eligibility rules pending verification',
    defaultChecklist: [
      {
        title: 'Confirm current residence history records (Demo prerequisite)',
        description:
          'Gather dates of entry, prior permit copies, and continuity notes in one organised checklist.',
        whyItMatters:
          'Having clear residence dates ready reduces delays when completing official forms or requesting clarification.',
        isPrerequisite: true,
        requiresDocumentCategory: 'residence_permits',
      },
      {
        title: 'Check validity of identity and travel records',
        description:
          'Confirm that sample identity and passport metadata in your vault are current and consistent in spelling.',
        whyItMatters:
          'Name spelling mismatches between documents are a common administrative blocker.',
        isPrerequisite: true,
        requiresDocumentCategory: 'identity',
      },
      {
        title: 'Prepare proof of residential address record',
        description:
          'Organise a recent municipal bill, lease summary, or official address confirmation.',
        whyItMatters:
          'Many administrative offices ask for proof of where you live before accepting follow-ups or forms.',
        requiresDocumentCategory: 'proof_of_address',
      },
      {
        title: 'Compile certified copy checklist (Example step)',
        description:
          'Note which photocopies may require certification before visiting a service counter. Verify official list directly.',
        whyItMatters:
          'Preparing copies in advance saves repeat visits and long queues.',
      },
      {
        title: 'Record submission receipt & reference label',
        description:
          'After submitting an application in real life, store a clear date and reference label so you can follow up calmly.',
        whyItMatters:
          'A written reference number is essential for every future inquiry or complaint.',
        requiresDocumentCategory: 'receipts_submissions',
      },
      {
        title: 'Schedule first administrative follow-up reminder',
        description:
          'Set a personal reminder to check on progress and send a polite follow-up note if needed.',
        whyItMatters:
          'Consistent documented follow-ups help you build a clear paper trail.',
      },
    ],
    previewHighlights: [
      'Full interactive checklist & state tracking',
      'Blocker resolution guidance',
      'Editable follow-up & complaint templates',
    ],
  },
  {
    id: 'permanent_residence',
    title: 'Permanent residence',
    shortTitle: 'Permanent residence',
    summary:
      'Track preparation steps, organise supporting documentation metadata, log delays, and prepare structured follow-ups for permanent residence administration.',
    depth: 'deep_demo',
    institutionExample: 'Department of Home Affairs / Visa Facilitation Centre (Example)',
    estimatedStepsLabel: '6 example steps',
    verificationNote: 'Example demonstration workflow · Official requirements pending verification',
    defaultChecklist: [
      {
        title: 'Review current permit validity and expiry dates (Demo prerequisite)',
        description:
          'Record the expiry date of your current permit metadata in the Vault so you see timely reminders.',
        whyItMatters:
          'Knowing your expiry window early helps you plan renewals or legal consultations before gaps arise.',
        isPrerequisite: true,
        requiresDocumentCategory: 'residence_permits',
      },
      {
        title: 'Organise identity and civil status records',
        description:
          'Group identity records, birth or marriage certificates (where applicable), and translation notes.',
        whyItMatters:
          'Missing civil records or uncertified translations frequently pause application reviews.',
        isPrerequisite: true,
        requiresDocumentCategory: 'civil_records',
      },
      {
        title: 'Prepare supporting financial or sponsorship folder',
        description:
          'Keep a structured list of supporting letters or statements required by your chosen pathway (verify official list).',
        whyItMatters:
          'Organising supporting records in advance prevents incomplete submissions.',
      },
      {
        title: 'Log appointment booking or submission date',
        description:
          'Write down the office location, booking date, and officer reference in your case notes.',
        whyItMatters:
          'Detailed records make it much easier to explain what happened if an appointment is rescheduled.',
      },
      {
        title: 'Store submission receipt metadata',
        description:
          'Add your fictional receipt label to the Vault and link it to this case.',
        whyItMatters:
          'Your receipt proves when and where your application was lodged.',
        requiresDocumentCategory: 'receipts_submissions',
      },
      {
        title: 'Plan periodic follow-up & escalation check-in',
        description:
          'Schedule a follow-up reminder and keep a record of every response you receive.',
        whyItMatters:
          'A complete timeline supports formal administrative inquiries if processing stalls.',
      },
    ],
    previewHighlights: [
      'Full interactive checklist & timeline',
      'Expiry tracking & missing document checks',
      'Correspondence & case report preview',
    ],
  },
  {
    id: 'refugee_asylum',
    title: 'Refugee and asylum documentation',
    shortTitle: 'Refugee & asylum',
    summary:
      'Keep track of renewal dates, appointment preparation, administrative blockers, and polite written follow-ups for refugee or asylum documentation.',
    depth: 'deep_demo',
    institutionExample: 'Refugee Reception Office (Example institution)',
    estimatedStepsLabel: '5 example steps',
    verificationNote: 'Example demonstration workflow · Legal procedures pending verification',
    defaultChecklist: [
      {
        title: 'Record current permit expiry date in Vault (Demo prerequisite)',
        description:
          'Enter a fictional permit expiry date so MEBT can remind you well ahead of time.',
        whyItMatters:
          'Early renewal preparation reduces the risk of travelling or working with an expired document.',
        isPrerequisite: true,
        requiresDocumentCategory: 'refugee_asylum',
      },
      {
        title: 'Check contact details & proof of address',
        description:
          'Ensure your phone number, email, and residential address note are accurate and consistent.',
        whyItMatters:
          'Offices may send appointment notices or decisions to the contact details on file.',
        requiresDocumentCategory: 'proof_of_address',
      },
      {
        title: 'Prepare written summary of prior visits and receipts',
        description:
          'List dates of previous renewals, stamped extensions, or online renewal confirmations.',
        whyItMatters:
          'If a system record is missing, your dated log and receipts help clarify your history.',
        requiresDocumentCategory: 'receipts_submissions',
      },
      {
        title: 'Confirm appointment or online renewal steps (Verify officially)',
        description:
          'Check current official instructions from the relevant reception office or accredited legal clinic.',
        whyItMatters:
          'Renewal procedures can change by office; verifying directly avoids wasted travel.',
      },
      {
        title: 'Schedule follow-up or legal clinic check-in',
        description:
          'If you face delays or lost files, schedule a follow-up note or review the Assistance Directory.',
        whyItMatters:
          'Free refugee legal clinics can assist when administrative barriers become urgent.',
      },
    ],
    previewHighlights: [
      'Renewal date tracking & timely reminders',
      'Blocker logging & referral to free assistance',
      'Written follow-up & escalation drafts',
    ],
  },
  {
    id: 'complaints_followups',
    title: 'Administrative complaints and follow-ups',
    shortTitle: 'Complaints & follow-ups',
    summary:
      'Shared demonstration tools to log long delays, draft polite requests for information, compile a dated timeline, and prepare structured escalations.',
    depth: 'shared_demo',
    institutionExample: 'Institutional Complaints Desk / Oversight Body (Example)',
    estimatedStepsLabel: '4 example steps',
    verificationNote: 'Shared demonstration workflow · Escalation rules pending legal verification',
    defaultChecklist: [
      {
        title: 'Compile dated timeline of previous attempts',
        description:
          'Record every call, email, counter visit, and reference number related to your issue.',
        whyItMatters:
          'Oversight bodies typically ask for proof that you first tried resolving the matter directly.',
        isPrerequisite: true,
      },
      {
        title: 'Draft a clear written follow-up or request for information',
        description:
          'Use the Correspondence tab to customise a polite, factual demonstration letter.',
        whyItMatters:
          'Clear written communication is easier to track and reference than unrecorded phone calls.',
      },
      {
        title: 'Allow a reasonable response window and set a reminder',
        description:
          'Schedule a follow-up date so you know when to check back without losing track.',
        whyItMatters:
          'Structured follow-up keeps your case moving steadily without daily stress.',
      },
      {
        title: 'Generate a case report summary before escalating',
        description:
          'Preview your organised case report to share with an accredited legal aid organisation if needed.',
        whyItMatters:
          'A concise one-page summary helps advisors understand your situation much faster.',
      },
    ],
    previewHighlights: [
      'Interactive complaint & follow-up checklist',
      '5 editable correspondence templates',
      'One-click case report summary export',
    ],
  },
  {
    id: 'identity_civil',
    title: 'Identity and civil documentation',
    shortTitle: 'Identity & civil docs',
    summary:
      'Interactive preview for organising birth registration, marriage certificates, ID book/smart card updates, and name-correction preparation.',
    depth: 'preview',
    institutionExample: 'Civil Registration Office (Example preview)',
    estimatedStepsLabel: 'Preview workflow',
    verificationNote: 'Interactive preview only · Official civil registration requirements pending verification',
    defaultChecklist: [],
    previewHighlights: [
      'Checklist preview for birth, marriage, and ID records',
      'Document spelling consistency reminder',
      'Planned for verified phase after user interviews',
    ],
    isPremiumPreview: true,
  },
  {
    id: 'know_your_rights',
    title: 'Know Your Rights',
    shortTitle: 'Know Your Rights',
    summary:
      'Plain-language, status-filtered rights library with source & verification date fields and simulated audio guidance. Always free.',
    depth: 'shared_demo',
    institutionExample: 'Public Educational Library (Pending legal review)',
    estimatedStepsLabel: '7 status filters',
    verificationNote: 'Always free · Legal content marked pending verification',
    targetRoute: 'rights',
    defaultChecklist: [],
    previewHighlights: [
      'Filter across 7 documentation statuses',
      'Simple language + simulated audio demo',
      'Never behind a paywall',
    ],
  },
  {
    id: 'business_financial',
    title: 'Business and financial accessibility',
    shortTitle: 'Business & finance',
    summary:
      'Interactive preview exploring practical administrative checklists for banking documentation, business registration records, and tax reference preparation.',
    depth: 'preview',
    institutionExample: 'Financial Institutions / Business Registry (Example preview)',
    estimatedStepsLabel: 'Preview workflow',
    verificationNote: 'Interactive preview only · Financial & regulatory guidance pending verification',
    defaultChecklist: [],
    previewHighlights: [
      'Bank account document preparation preview',
      'Small business administrative record organiser',
      'Scheduled for future verified release',
    ],
    isPremiumPreview: true,
  },
  {
    id: 'visas_permits',
    title: 'Visas and permits',
    shortTitle: 'Visas & permits',
    summary:
      'Interactive preview covering general visa renewal organisation, expiry alerts, and supporting document checklists for study, relative, or work permits.',
    depth: 'preview',
    institutionExample: 'Visa & Permit Administration (Example preview)',
    estimatedStepsLabel: 'Preview workflow',
    verificationNote: 'Interactive preview only · Visa regulations pending verification',
    defaultChecklist: [],
    previewHighlights: [
      'Expiry tracking & renewal planning preview',
      'Supporting folder checklist preview',
      'No unverified eligibility claims shown',
    ],
    isPremiumPreview: true,
  },
  {
    id: 'emergency_protection',
    title: 'Emergency legal protection',
    shortTitle: 'Emergency protection',
    summary:
      'Immediate access to mock emergency legal assistance contacts, detention or urgent rights checklists, and escalation previews. Always free.',
    depth: 'shared_demo',
    institutionExample: 'Emergency Legal Aid & Protection Desk (Mock demo)',
    estimatedStepsLabel: 'Free emergency access',
    verificationNote: 'Always free · Mock contact details pending verification',
    targetRoute: 'assistance',
    defaultChecklist: [],
    previewHighlights: [
      'Direct access to Assistance & Emergency Centre',
      'Simulated call, WhatsApp, and escalation previews',
      'Always accessible outside premium gates',
    ],
  },
];

export function getPathwayById(id: string): PathwayDefinition | undefined {
  return PATHWAY_DEFINITIONS.find((p) => p.id === id);
}
