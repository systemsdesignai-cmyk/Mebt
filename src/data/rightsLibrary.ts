import { RightsEntry } from '../types/mebt';

/**
 * Accessible Rights Information Library (F07).
 * Covers all 7 approved documentation statuses.
 * Explicitly excludes employment-rights module per PRD.
 * All legal summaries are plain-language placeholders marked pending verification.
 */
export const RIGHTS_LIBRARY_ENTRIES: RightsEntry[] = [
  {
    id: 'rights-admin-fairness',
    title: 'Right to written reasons and respectful administrative treatment',
    topic: 'administrative_fairness',
    applicableStatuses: [
      'citizen',
      'permanent_resident',
      'refugee',
      'asylum_seeker',
      'visa_permit',
      'expired_doc',
      'undocumented_uncertain',
    ],
    plainSummary:
      'When an administrative office makes a decision that affects you, you can generally ask for clear written confirmation, a reference number, and an explanation of what is needed next. Keeping written records helps protect you if a dispute arises.',
    whyItMatters:
      'Verbal instructions at a counter are hard to prove later. Polite written requests create an objective record.',
    practicalSteps: [
      'Ask for a dated receipt or reference number whenever you hand in documents.',
      'Write down the date, office name, and what was discussed immediately after your visit.',
      'If something is unclear, request clarification in writing using calm, factual language.',
    ],
    whatToWatchOutFor:
      'This is general administrative guidance only. Specific statutory timelines and legal remedies must be confirmed with a qualified legal advisor.',
    sourceLabel: 'Placeholder — Constitutional & Administrative Justice framework (Pending legal verification)',
    verificationDate: 'Pending verification',
    verificationStatus: 'pending_verification',
    audioScriptSummary:
      'Audio demo script: Whenever you visit an office or submit forms, always keep a written reference number and note the date. Clear records help you follow up calmly and protect your administrative fairness.',
    audioDurationSec: 42,
  },
  {
    id: 'rights-asylum-renewal',
    title: 'Keeping documentation active while awaiting an asylum or refugee decision',
    topic: 'identity_documentation',
    applicableStatuses: ['asylum_seeker', 'refugee', 'expired_doc'],
    plainSummary:
      'Holders of asylum seeker or refugee permits generally need to track expiry dates carefully and keep proof of every renewal attempt, including screenshots or stamped dates, if queues or online portals cause delays.',
    whyItMatters:
      'Showing documented proof that you tried to renew on time helps explain administrative delays to clinics or officials.',
    practicalSteps: [
      'Record your permit expiry date at least 30 days ahead of time in your organiser.',
      'Keep copies or notes of every online submission, email, or visit attempt.',
      'If a permit expires due to system delays, contact a verified refugee legal assistance clinic promptly.',
    ],
    whatToWatchOutFor:
      'Renewal channels and validity rules change by reception office. Confirm current official instructions directly or through accredited legal aid.',
    sourceLabel: 'Placeholder — Refugee & Asylum Administrative Guide (Pending legal verification)',
    verificationDate: 'Pending verification',
    verificationStatus: 'pending_verification',
    audioScriptSummary:
      'Audio demo script: Check your permit expiry date early. Save proof of every attempt to renew, and reach out to free refugee legal clinics if you encounter delays.',
    audioDurationSec: 48,
  },
  {
    id: 'rights-pr-identity',
    title: 'Maintaining permanent residence records and identity documentation',
    topic: 'identity_documentation',
    applicableStatuses: ['permanent_resident', 'citizen'],
    plainSummary:
      'Permanent residents and citizens benefit from keeping consistent spelling across identity records, passports, and proof of address, and storing copies of official certificates safely.',
    whyItMatters:
      'Consistent personal details help avoid hold-ups during banking updates, civil registrations, or citizenship applications.',
    practicalSteps: [
      'Check that your names and dates match across all stored document metadata.',
      'Note the expiry dates of passports or supporting records before booking travel or applications.',
      'Keep a clear timeline of any correction requests lodged with civil offices.',
    ],
    whatToWatchOutFor:
      'Official eligibility periods and documentary requirements must be verified with the relevant authority before submitting applications.',
    sourceLabel: 'Placeholder — Civil & Residence Documentation Overview (Pending legal verification)',
    verificationDate: 'Pending verification',
    verificationStatus: 'pending_verification',
    audioScriptSummary:
      'Audio demo script: Keeping your name spelling consistent and tracking passport or certificate records in one place prevents common delays with banks and public offices.',
    audioDurationSec: 39,
  },
  {
    id: 'rights-essential-services',
    title: 'Understanding access to emergency healthcare and basic public services',
    topic: 'access_to_services',
    applicableStatuses: [
      'citizen',
      'permanent_resident',
      'refugee',
      'asylum_seeker',
      'visa_permit',
      'expired_doc',
      'undocumented_uncertain',
    ],
    plainSummary:
      'Emergency medical care and essential human dignity protections apply broadly regardless of administrative paperwork delays. If you are turned away from an urgent service because of a document question, ask for the reason in writing and contact a legal assistance centre.',
    whyItMatters:
      'People often avoid seeking help out of fear or confusion when documents are pending renewal.',
    practicalSteps: [
      'Bring whatever identification or application receipt you currently hold when visiting a clinic or school office.',
      'Stay calm and ask politely for the office manager or written reason if service is declined.',
      'Use the free Assistance & Emergency Centre in MEBT to find legal aid organisations that support access rights.',
    ],
    whatToWatchOutFor:
      'Service rules vary by institution and legal status. Verify specific entitlements with an accredited community advice office or legal clinic.',
    sourceLabel: 'Placeholder — Essential Public Services Access Note (Pending legal verification)',
    verificationDate: 'Pending verification',
    verificationStatus: 'pending_verification',
    audioScriptSummary:
      'Audio demo script: If you face a document question while seeking urgent healthcare or basic services, stay calm, ask for written reasons, and contact a free legal assistance organisation for guidance.',
    audioDurationSec: 46,
  },
  {
    id: 'rights-family-civil',
    title: 'Registering births and keeping family civil records organised',
    topic: 'family_civil_records',
    applicableStatuses: [
      'citizen',
      'permanent_resident',
      'refugee',
      'asylum_seeker',
      'visa_permit',
      'expired_doc',
      'undocumented_uncertain',
    ],
    plainSummary:
      'Keeping hospital birth confirmation notices, parents’ identity records, and certified translations organised makes civil registration smoother for households.',
    whyItMatters:
      'Early organisation of birth and family records helps protect children’s identity documentation and school access.',
    practicalSteps: [
      'Keep the hospital proof-of-birth record safe immediately after birth.',
      'Check how names are written before finalising any registration form.',
      'If registration is refused due to a parent’s document status, seek advice from a verified legal aid clinic immediately.',
    ],
    whatToWatchOutFor:
      'Birth registration requirements depend on family circumstances. Do not rely on informal advice; verify procedures with official civil offices or legal clinics.',
    sourceLabel: 'Placeholder — Civil Registration Guidance (Pending legal verification)',
    verificationDate: 'Pending verification',
    verificationStatus: 'pending_verification',
    audioScriptSummary:
      'Audio demo script: Store hospital birth notices carefully and double-check name spellings. If you encounter obstacles registering a child, reach out to a free legal clinic.',
    audioDurationSec: 40,
  },
  {
    id: 'rights-interactions-officials',
    title: 'Calm preparation when asked to show documentation by officials',
    topic: 'interactions_officials',
    applicableStatuses: [
      'refugee',
      'asylum_seeker',
      'visa_permit',
      'expired_doc',
      'undocumented_uncertain',
    ],
    plainSummary:
      'Knowing how to communicate calmly, verify official identification, keep copies of receipts, and know who to call in an emergency can reduce stress during unexpected document checks.',
    whyItMatters:
      'Preparation and knowing your emergency support contacts helps you stay calm and protect your rights.',
    practicalSteps: [
      'Keep an emergency legal protection contact number saved where you can reach it quickly.',
      'Know the reference number or date of any pending application or renewal.',
      'Never pay informal cash bribes; request official receipts and lawful procedures.',
    ],
    whatToWatchOutFor:
      'This summary is educational only and is not legal representation. In any urgent detention or enforcement situation, contact qualified emergency legal assistance immediately.',
    sourceLabel: 'Placeholder — Personal Safety & Official Verification Guide (Pending legal verification)',
    verificationDate: 'Pending verification',
    verificationStatus: 'pending_verification',
    audioScriptSummary:
      'Audio demo script: Stay calm during document checks, keep your emergency legal aid number ready, and never pay unofficial cash demands. Always seek qualified legal help in urgent situations.',
    audioDurationSec: 44,
  },
  {
    id: 'rights-complaints-escalation',
    title: 'When and how to escalate an unresolved administrative delay',
    topic: 'complaints_escalation',
    applicableStatuses: [
      'citizen',
      'permanent_resident',
      'refugee',
      'asylum_seeker',
      'visa_permit',
      'expired_doc',
      'undocumented_uncertain',
    ],
    plainSummary:
      'If repeated polite follow-ups receive no response, organising a chronological case summary with dates, reference numbers, and previous correspondence makes formal complaints or legal aid referrals far more effective.',
    whyItMatters:
      'Clear evidence of prior follow-ups shows oversight offices exactly where a process stalled.',
    practicalSteps: [
      'Log every follow-up date and response inside your MEBT case timeline.',
      'Send at least one structured written request for information before escalating.',
      'Generate your fictional case report summary to organise key facts before speaking with an advisor.',
    ],
    whatToWatchOutFor:
      'Escalation bodies have specific jurisdiction rules. Confirm the appropriate institution before filing a formal complaint.',
    sourceLabel: 'Placeholder — Administrative Escalation Overview (Pending legal verification)',
    verificationDate: 'Pending verification',
    verificationStatus: 'pending_verification',
    audioScriptSummary:
      'Audio demo script: Before escalating a long delay, build a clear timeline with dates, receipts, and copies of earlier follow-ups. A well-organised summary saves time with complaint desks and legal advisors.',
    audioDurationSec: 45,
  },
];
