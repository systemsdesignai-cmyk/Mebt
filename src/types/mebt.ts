export type LanguageCode = 'en' | 'am' | 'ti';

export type DocStatus =
  | 'citizen'
  | 'permanent_resident'
  | 'refugee'
  | 'asylum_seeker'
  | 'visa_permit'
  | 'expired_doc'
  | 'undocumented_uncertain'
  | 'prefer_not_to_say';

export type AuthMethod = 'guest' | 'phone' | 'email' | 'google';

export type TabRoute =
  | 'home'
  | 'cases'
  | 'rights'
  | 'vault'
  | 'profile'
  | 'assistance'
  | 'notifications';

export type PathwayCategoryId =
  | 'citizenship'
  | 'permanent_residence'
  | 'refugee_asylum'
  | 'complaints_followups'
  | 'identity_civil'
  | 'know_your_rights'
  | 'business_financial'
  | 'visas_permits'
  | 'emergency_protection';

export type CaseOrgState =
  | 'not_started'
  | 'preparing_information'
  | 'ready_for_next_action'
  | 'action_recorded'
  | 'awaiting_response'
  | 'follow_up_scheduled'
  | 'blocked'
  | 'closed';

export interface DemoUserProfile {
  id: string;
  displayName: string;
  authMethod: AuthMethod;
  contactLabel: string;
  documentationStatus: DocStatus;
  objectives: string[];
  isGuest: boolean;
  premiumPreviewEnabled: boolean;
  onboardingCompleted: boolean;
  tutorialDismissed: boolean;
  tutorialStep: number;
}

export interface AccessibilitySettings {
  textScale: 'standard' | 'large' | 'xlarge';
  highContrast: boolean;
  reducedMotion: boolean;
  simplifiedGuidance: boolean;
  theme: 'light' | 'dark';
}

export interface NotificationPreferences {
  inApp: boolean;
  push: boolean;
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
  calendar: boolean;
  frequency: 'immediate' | 'daily_digest' | 'weekly_summary';
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
  isPrerequisite?: boolean;
  requiresDocumentCategory?: VaultDocumentCategory;
  completed: boolean;
  completedAt?: string;
}

export interface CaseBlocker {
  id: string;
  type:
    | 'long_wait'
    | 'missing_document'
    | 'appointment_difficulty'
    | 'conflicting_instructions'
    | 'expired_paperwork'
    | 'custom';
  title: string;
  details: string;
  guidanceSteps: string[];
  createdAt: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface CaseNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface ScheduledFollowUp {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  planStatement: string;
  channel: 'in_person' | 'email' | 'phone' | 'call_centre';
  completed: boolean;
  completedAt?: string;
}

export type CorrespondenceTemplateType =
  | 'application_followup'
  | 'request_information'
  | 'request_clarification'
  | 'administrative_complaint'
  | 'escalation_preparation';

export interface SavedCorrespondence {
  id: string;
  templateType: CorrespondenceTemplateType;
  subject: string;
  recipientLabel: string;
  body: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  kind:
    | 'case_created'
    | 'checklist_completed'
    | 'checklist_reopened'
    | 'state_changed'
    | 'blocker_added'
    | 'blocker_resolved'
    | 'followup_scheduled'
    | 'followup_completed'
    | 'correspondence_saved'
    | 'note_added'
    | 'document_linked'
    | 'case_archived';
  title: string;
  detail?: string;
}

export interface AdminCase {
  id: string;
  title: string;
  pathwayId: PathwayCategoryId;
  institutionLabel: string;
  referenceLabel: string; // Fictional user-recorded label
  state: CaseOrgState;
  userTargetDate?: string; // User-entered date, never legal deadline
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  checklist: ChecklistItem[];
  blockers: CaseBlocker[];
  notes: CaseNote[];
  followUps: ScheduledFollowUp[];
  correspondence: SavedCorrespondence[];
  timeline: TimelineEvent[];
}

export interface PathwayDefinition {
  id: PathwayCategoryId;
  title: string;
  shortTitle: string;
  summary: string;
  depth: 'deep_demo' | 'shared_demo' | 'preview';
  institutionExample: string;
  estimatedStepsLabel: string;
  verificationNote: string;
  targetRoute?: TabRoute;
  defaultChecklist: Omit<ChecklistItem, 'id' | 'completed' | 'completedAt'>[];
  previewHighlights: string[];
  isPremiumPreview?: boolean;
}

export type RightsTopicCategory =
  | 'identity_documentation'
  | 'administrative_fairness'
  | 'access_to_services'
  | 'family_civil_records'
  | 'interactions_officials'
  | 'complaints_escalation';

export interface RightsEntry {
  id: string;
  title: string;
  topic: RightsTopicCategory;
  applicableStatuses: DocStatus[];
  plainSummary: string;
  whyItMatters: string;
  practicalSteps: string[];
  whatToWatchOutFor: string;
  sourceLabel: string;
  verificationDate: string;
  verificationStatus: 'pending_verification';
  audioScriptSummary: string;
  audioDurationSec: number;
}

export type AssistanceCategory =
  | 'government_departments'
  | 'refugee_assistance'
  | 'legal_assistance'
  | 'complaint_institutions'
  | 'emergency_legal_protection';

export interface AssistanceOrg {
  id: string;
  name: string;
  category: AssistanceCategory;
  province: string;
  city: string;
  summary: string;
  languages: string[];
  hoursLabel: string;
  isEmergencyFree: boolean;
  mockPhone: string;
  mockWhatsApp: string;
  mockEmail: string;
  mockWebsite: string;
  escalationNote: string;
  verificationStatus: 'mock_pending_verification';
}

export type VaultDocumentCategory =
  | 'identity'
  | 'residence_permits'
  | 'refugee_asylum'
  | 'civil_records'
  | 'proof_of_address'
  | 'receipts_submissions';

export interface VaultDocument {
  id: string;
  title: string;
  category: VaultDocumentCategory;
  fictionalRefCode: string;
  holderName: string;
  issueDate: string;
  expiryDate?: string;
  linkedCaseId?: string;
  notes: string;
  sampleTemplate: 'permit_card' | 'receipt_letter' | 'civil_certificate' | 'address_proof';
  createdAt: string;
}

export type NotificationKind =
  | 'followup_reminder'
  | 'document_expiry'
  | 'scheduled_task'
  | 'outstanding_action'
  | 'blocker_reminder'
  | 'case_activity';

export interface SimulatedNotification {
  id: string;
  kind: NotificationKind;
  urgency: 'high' | 'medium' | 'low';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  dismissed: boolean;
  snoozedUntil?: string;
  relatedCaseId?: string;
  relatedDocId?: string;
  targetTab: TabRoute;
}

export interface ActionRecommendation {
  id: string;
  priorityRank: 1 | 2 | 3 | 4 | 5 | 6;
  priorityLabel: string;
  urgency: 'high' | 'medium' | 'low';
  title: string;
  whyRecommended: string;
  actionLabel: string;
  relatedCaseId?: string;
  relatedDocId?: string;
  targetTab: TabRoute;
  postponedUntil?: string;
  dismissed?: boolean;
}

export interface AppState {
  schemaVersion: number;
  language: LanguageCode;
  user: DemoUserProfile;
  accessibility: AccessibilitySettings;
  notificationPrefs: NotificationPreferences;
  cases: AdminCase[];
  vaultDocuments: VaultDocument[];
  notifications: SimulatedNotification[];
  dismissedRecommendationIds: string[];
  postponedRecommendations: Record<string, string>; // recId -> ISO date
  lastMilestoneMessage: string | null;
}
