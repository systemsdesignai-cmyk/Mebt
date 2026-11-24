import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AccessibilitySettings,
  ActionRecommendation,
  AdminCase,
  AppState,
  AuthMethod,
  CaseBlocker,
  CaseOrgState,
  CorrespondenceTemplateType,
  DocStatus,
  LanguageCode,
  NotificationPreferences,
  PathwayCategoryId,
  SavedCorrespondence,
  ScheduledFollowUp,
  SimulatedNotification,
  TabRoute,
  VaultDocument,
} from '../types/mebt';
import { createEmptyDemoState, createInitialDemoState, DEMO_ACCOUNTS } from '../data/demoDataset';
import { getPathwayById } from '../data/pathways';
import {
  computeActionRecommendations,
  deriveNextCaseState,
  getBlockerGuidance,
  getDocumentExpiryStatus,
} from '../engine/workflowEngine';
import { sanitiseInput, storageAdapter } from '../services/storageAdapter';
import { translate } from '../i18n/translations';

export interface ToastNotice {
  id: string;
  message: string;
  tone: 'info' | 'success' | 'warning';
  undoAction?: () => void;
}

interface AppContextValue {
  state: AppState;
  activeTab: TabRoute;
  selectedCaseId: string | null;
  focusedRightsId: string | null;
  focusedVaultDocId: string | null;
  toast: ToastNotice | null;
  recommendations: ActionRecommendation[];
  unreadNotificationCount: number;
  t: (key: string) => string;
  setActiveTab: (tab: TabRoute) => void;
  setSelectedCaseId: (id: string | null) => void;
  openCase: (caseId: string) => void;
  openRightsEntry: (entryId: string) => void;
  openVaultDocument: (docId: string) => void;
  clearFocusTargets: () => void;
  toggleTheme: () => void;
  showToast: (message: string, tone?: ToastNotice['tone'], undoAction?: () => void) => void;
  dismissToast: () => void;
  setLanguage: (lang: LanguageCode) => void;
  updateAccessibility: (patch: Partial<AccessibilitySettings>) => void;
  updateNotificationPrefs: (patch: Partial<NotificationPreferences>) => void;
  completeOnboarding: (options: {
    authMethod: AuthMethod;
    displayName?: string;
    documentationStatus: DocStatus;
    objectives: string[];
    startClean?: boolean;
  }) => void;
  switchAuthMode: (authMethod: AuthMethod) => void;
  updateDocStatus: (status: DocStatus) => void;
  togglePremiumPreview: (enabled: boolean) => void;
  setTutorialState: (step: number, dismissed: boolean) => void;
  replayOnboarding: () => void;
  resetDemoData: () => void;
  loadEmptyWorkspace: () => void;
  createCase: (input: {
    title: string;
    pathwayId: PathwayCategoryId;
    referenceLabel?: string;
    userTargetDate?: string;
    initialNote?: string;
  }) => AdminCase | null;
  updateCaseTitle: (caseId: string, newTitle: string) => void;
  updateCaseStateManual: (caseId: string, newState: CaseOrgState) => void;
  updateCaseTargetDate: (caseId: string, date: string) => void;
  toggleChecklistItem: (caseId: string, itemId: string) => void;
  addBlocker: (caseId: string, type: CaseBlocker['type'], title: string, details: string) => void;
  resolveBlocker: (caseId: string, blockerId: string) => void;
  addCaseNote: (caseId: string, text: string) => void;
  deleteCaseNote: (caseId: string, noteId: string) => void;
  scheduleFollowUp: (
    caseId: string,
    input: {
      title: string;
      dueDate: string;
      planStatement: string;
      channel: ScheduledFollowUp['channel'];
    }
  ) => void;
  toggleFollowUpComplete: (caseId: string, followUpId: string) => void;
  saveCorrespondence: (
    caseId: string,
    input: {
      templateType: CorrespondenceTemplateType;
      subject: string;
      recipientLabel: string;
      body: string;
    }
  ) => SavedCorrespondence | null;
  archiveCase: (caseId: string, archived: boolean) => void;
  deleteCase: (caseId: string) => void;
  addVaultDocument: (doc: Omit<VaultDocument, 'id' | 'createdAt'>) => void;
  updateVaultDocument: (id: string, patch: Partial<VaultDocument>) => void;
  deleteVaultDocument: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  snoozeNotification: (id: string, days: number) => void;
  dismissRecommendation: (recId: string) => void;
  postponeRecommendation: (recId: string, days: number) => void;
  clearMilestone: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() =>
    storageAdapter.load(() => createInitialDemoState(false))
  );
  const [activeTab, setActiveTab] = useState<TabRoute>('home');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [focusedRightsId, setFocusedRightsId] = useState<string | null>(null);
  const [focusedVaultDocId, setFocusedVaultDocId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastNotice | null>(null);

  // Persist fictional demo state locally on change
  useEffect(() => {
    storageAdapter.save(state);
  }, [state]);

  // Apply accessibility & dark/light theme attributes to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.lang = state.language;
    root.dataset.textScale = state.accessibility.textScale;
    root.dataset.highContrast = String(state.accessibility.highContrast);
    root.dataset.reducedMotion = String(state.accessibility.reducedMotion);
    if (state.accessibility.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.language, state.accessibility]);

  // Auto-hide toast after 5s
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (
    message: string,
    tone: ToastNotice['tone'] = 'info',
    undoAction?: () => void
  ) => {
    setToast({ id: uid('toast'), message, tone, undoAction });
  };

  const dismissToast = () => setToast(null);

  const t = (key: string) => translate(state.language, key);

  const recommendations = useMemo(() => computeActionRecommendations(state), [state]);

  const unreadNotificationCount = useMemo(() => {
    const nowIso = new Date().toISOString();
    return state.notifications.filter(
      (n) => !n.dismissed && !n.read && (!n.snoozedUntil || n.snoozedUntil <= nowIso)
    ).length;
  }, [state.notifications]);

  const openCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('cases');
  };

  const openRightsEntry = (entryId: string) => {
    setFocusedRightsId(entryId);
    setSelectedCaseId(null);
    setActiveTab('rights');
  };

  const openVaultDocument = (docId: string) => {
    setFocusedVaultDocId(docId);
    setSelectedCaseId(null);
    setActiveTab('vault');
  };

  const clearFocusTargets = () => {
    setFocusedRightsId(null);
    setFocusedVaultDocId(null);
  };

  const toggleTheme = () => {
    setState((prev) => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        theme: prev.accessibility.theme === 'dark' ? 'light' : 'dark',
      },
    }));
  };

  const setLanguage = (lang: LanguageCode) => {
    setState((prev) => ({ ...prev, language: lang }));
  };

  const updateAccessibility = (patch: Partial<AccessibilitySettings>) => {
    setState((prev) => ({
      ...prev,
      accessibility: { ...prev.accessibility, ...patch },
    }));
  };

  const updateNotificationPrefs = (patch: Partial<NotificationPreferences>) => {
    setState((prev) => ({
      ...prev,
      notificationPrefs: { ...prev.notificationPrefs, ...patch },
    }));
  };

  const completeOnboarding: AppContextValue['completeOnboarding'] = ({
    authMethod,
    displayName,
    documentationStatus,
    objectives,
    startClean,
  }) => {
    const preset = DEMO_ACCOUNTS[authMethod] ?? DEMO_ACCOUNTS.phone;
    const safeName = displayName ? sanitiseInput(displayName, 48) : preset.displayName;
    const baseState = startClean ? createEmptyDemoState() : createInitialDemoState(true);

    setState((prev) => ({
      ...baseState,
      language: prev.language,
      accessibility: prev.accessibility,
      user: {
        ...preset,
        displayName: safeName || preset.displayName,
        documentationStatus,
        objectives,
        onboardingCompleted: true,
        tutorialDismissed: false,
        tutorialStep: 0,
      },
    }));
    setActiveTab('home');
    setSelectedCaseId(null);
    showToast(
      authMethod === 'guest'
        ? 'Entered Guest Explorer mode (fictional demo).'
        : `Welcome to MEBT, ${safeName || preset.displayName}!`,
      'success'
    );
  };

  const switchAuthMode = (authMethod: AuthMethod) => {
    const preset = DEMO_ACCOUNTS[authMethod] ?? DEMO_ACCOUNTS.phone;
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        id: preset.id,
        displayName: preset.displayName,
        authMethod: preset.authMethod,
        contactLabel: preset.contactLabel,
        isGuest: preset.isGuest,
        premiumPreviewEnabled: preset.isGuest ? false : prev.user.premiumPreviewEnabled,
      },
    }));
    showToast(
      authMethod === 'guest'
        ? 'Switched to Guest mode.'
        : `Switched to fictional demo account: ${preset.displayName}`,
      'info'
    );
  };

  const updateDocStatus = (documentationStatus: DocStatus) => {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, documentationStatus },
    }));
    showToast('Optional demonstration status updated.', 'success');
  };

  const togglePremiumPreview = (enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, premiumPreviewEnabled: enabled },
    }));
    showToast(
      enabled
        ? 'Premium Preview enabled for demonstration testing (no payment).'
        : 'Switched to Free Tier preview.',
      'info'
    );
  };

  const setTutorialState = (step: number, dismissed: boolean) => {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, tutorialStep: step, tutorialDismissed: dismissed },
    }));
  };

  const replayOnboarding = () => {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, onboardingCompleted: false },
    }));
    setActiveTab('home');
    setSelectedCaseId(null);
  };

  const resetDemoData = () => {
    storageAdapter.clear();
    const fresh = createInitialDemoState(true);
    setState((prev) => ({
      ...fresh,
      language: prev.language,
      accessibility: prev.accessibility,
    }));
    setActiveTab('home');
    setSelectedCaseId(null);
    showToast('Demonstration dataset restored to defaults.', 'success');
  };

  const loadEmptyWorkspace = () => {
    setState((prev) => {
      const empty = createEmptyDemoState({
        ...prev.user,
        isGuest: false,
        authMethod: prev.user.isGuest ? 'phone' : prev.user.authMethod,
        displayName: prev.user.isGuest ? DEMO_ACCOUNTS.phone.displayName : prev.user.displayName,
      });
      return {
        ...empty,
        language: prev.language,
        accessibility: prev.accessibility,
      };
    });
    setActiveTab('home');
    setSelectedCaseId(null);
    showToast('Loaded clean empty workspace for testing.', 'info');
  };

  const createCase: AppContextValue['createCase'] = ({
    title,
    pathwayId,
    referenceLabel,
    userTargetDate,
    initialNote,
  }) => {
    const safeTitle = sanitiseInput(title, 100);
    if (!safeTitle) return null;

    const pathway = getPathwayById(pathwayId);
    const nowIso = new Date().toISOString();
    const checklist = (pathway?.defaultChecklist ?? []).map((item, idx) => ({
      ...item,
      id: uid(`chk-${idx}`),
      completed: false,
    }));

    const safeRef = sanitiseInput(referenceLabel ?? '', 40) || `DEMO-${Date.now().toString().slice(-5)}`;
    const safeNote = sanitiseInput(initialNote ?? '', 400);

    const newCase: AdminCase = {
      id: uid('case'),
      title: safeTitle,
      pathwayId,
      institutionLabel: pathway?.institutionExample ?? 'Administrative Office (Example)',
      referenceLabel: safeRef,
      state: safeNote ? 'preparing_information' : 'not_started',
      userTargetDate: userTargetDate || undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
      archived: false,
      checklist,
      blockers: [],
      notes: safeNote
        ? [{ id: uid('note'), text: safeNote, createdAt: nowIso }]
        : [],
      followUps: [],
      correspondence: [],
      timeline: [
        {
          id: uid('tl'),
          date: nowIso,
          kind: 'case_created',
          title: `Created fictional case: ${safeTitle}`,
          detail: `Pathway: ${pathway?.title ?? pathwayId} · Ref: ${safeRef}`,
        },
      ],
    };

    const activityNotif: SimulatedNotification = {
      id: uid('notif'),
      kind: 'case_activity',
      urgency: 'low',
      title: `Case created: ${safeTitle}`,
      body: `${checklist.length} example preparation steps ready to track.`,
      createdAt: nowIso,
      read: false,
      dismissed: false,
      relatedCaseId: newCase.id,
      targetTab: 'cases',
    };

    setState((prev) => ({
      ...prev,
      cases: [newCase, ...prev.cases],
      notifications: [activityNotif, ...prev.notifications],
      lastMilestoneMessage: `Great start! "${safeTitle}" is organised with ${checklist.length} clear steps.`,
    }));

    setSelectedCaseId(newCase.id);
    setActiveTab('cases');
    showToast(`Created fictional case "${safeTitle}".`, 'success');
    return newCase;
  };

  const mutateCase = (
    caseId: string,
    updater: (c: AdminCase) => {
      updated: AdminCase;
      notification?: SimulatedNotification;
      milestone?: string | null;
    }
  ) => {
    setState((prev) => {
      let extraNotif: SimulatedNotification | undefined;
      let nextMilestone = prev.lastMilestoneMessage;
      const nextCases = prev.cases.map((c) => {
        if (c.id !== caseId) return c;
        const result = updater(c);
        extraNotif = result.notification;
        if (result.milestone !== undefined) {
          nextMilestone = result.milestone;
        }
        return result.updated;
      });
      return {
        ...prev,
        cases: nextCases,
        notifications: extraNotif ? [extraNotif, ...prev.notifications] : prev.notifications,
        lastMilestoneMessage: nextMilestone,
      };
    });
  };

  const updateCaseTitle = (caseId: string, newTitle: string) => {
    const safe = sanitiseInput(newTitle, 100);
    if (!safe) return;
    mutateCase(caseId, (c) => ({
      updated: {
        ...c,
        title: safe,
        updatedAt: new Date().toISOString(),
      },
    }));
    showToast('Case title updated.', 'success');
  };

  const updateCaseStateManual = (caseId: string, newState: CaseOrgState) => {
    const nowIso = new Date().toISOString();
    mutateCase(caseId, (c) => ({
      updated: {
        ...c,
        state: newState,
        updatedAt: nowIso,
        timeline: [
          {
            id: uid('tl'),
            date: nowIso,
            kind: 'state_changed',
            title: `User-recorded state updated to ${newState.replace(/_/g, ' ')}`,
          },
          ...c.timeline,
        ],
      },
    }));
    showToast('Internal organisational state updated.', 'info');
  };

  const updateCaseTargetDate = (caseId: string, date: string) => {
    mutateCase(caseId, (c) => ({
      updated: {
        ...c,
        userTargetDate: date || undefined,
        updatedAt: new Date().toISOString(),
      },
    }));
    showToast(date ? `Personal target date set to ${date}.` : 'Target date cleared.', 'info');
  };

  const toggleChecklistItem = (caseId: string, itemId: string) => {
    const nowIso = new Date().toISOString();
    let toggledTitle = '';
    let becameCompleted = false;

    mutateCase(caseId, (c) => {
      const nextChecklist = c.checklist.map((item) => {
        if (item.id !== itemId) return item;
        toggledTitle = item.title;
        becameCompleted = !item.completed;
        return {
          ...item,
          completed: !item.completed,
          completedAt: !item.completed ? nowIso : undefined,
        };
      });

      const draft: AdminCase = {
        ...c,
        checklist: nextChecklist,
        updatedAt: nowIso,
        timeline: [
          {
            id: uid('tl'),
            date: nowIso,
            kind: becameCompleted ? 'checklist_completed' : 'checklist_reopened',
            title: becameCompleted
              ? `Completed checklist item: ${toggledTitle}`
              : `Reopened checklist item: ${toggledTitle}`,
          },
          ...c.timeline,
        ],
      };

      const derivedState = deriveNextCaseState(draft);
      const completedCount = nextChecklist.filter((i) => i.completed).length;
      const allDone = nextChecklist.length > 0 && completedCount === nextChecklist.length;

      let milestone: string | undefined;
      if (becameCompleted && allDone) {
        milestone = `Milestone reached! All ${nextChecklist.length} preparation steps for "${c.title}" are complete.`;
      } else if (becameCompleted) {
        milestone = `Step completed (${completedCount}/${nextChecklist.length}) on "${c.title}".`;
      }

      return {
        updated: { ...draft, state: derivedState },
        milestone,
      };
    });

    showToast(
      becameCompleted ? `Completed: ${toggledTitle}` : `Reopened: ${toggledTitle}`,
      becameCompleted ? 'success' : 'info',
      () => toggleChecklistItem(caseId, itemId)
    );
  };

  const addBlocker: AppContextValue['addBlocker'] = (caseId, type, title, details) => {
    const safeTitle = sanitiseInput(title, 120);
    if (!safeTitle) return;
    const safeDetails = sanitiseInput(details, 400);
    const nowIso = new Date().toISOString();

    const blocker: CaseBlocker = {
      id: uid('blk'),
      type,
      title: safeTitle,
      details: safeDetails || 'Logged in demonstration case.',
      guidanceSteps: getBlockerGuidance(type),
      createdAt: nowIso,
      resolved: false,
    };

    mutateCase(caseId, (c) => {
      const updated: AdminCase = {
        ...c,
        blockers: [blocker, ...c.blockers],
        state: 'blocked',
        updatedAt: nowIso,
        timeline: [
          {
            id: uid('tl'),
            date: nowIso,
            kind: 'blocker_added',
            title: `Blocker recorded: ${safeTitle}`,
            detail: blocker.details,
          },
          ...c.timeline,
        ],
      };
      const notif: SimulatedNotification = {
        id: uid('notif'),
        kind: 'blocker_reminder',
        urgency: 'high',
        title: `Blocker logged on ${c.title}`,
        body: `${safeTitle}. Open case to view suggested generic resolution steps.`,
        createdAt: nowIso,
        read: false,
        dismissed: false,
        relatedCaseId: c.id,
        targetTab: 'cases',
      };
      return { updated, notification: notif };
    });

    showToast('Administrative blocker recorded with next-step guidance.', 'warning');
  };

  const resolveBlocker = (caseId: string, blockerId: string) => {
    const nowIso = new Date().toISOString();
    mutateCase(caseId, (c) => {
      const target = c.blockers.find((b) => b.id === blockerId);
      const nextBlockers = c.blockers.map((b) =>
        b.id === blockerId ? { ...b, resolved: true, resolvedAt: nowIso } : b
      );
      const draft: AdminCase = {
        ...c,
        blockers: nextBlockers,
        updatedAt: nowIso,
        timeline: [
          {
            id: uid('tl'),
            date: nowIso,
            kind: 'blocker_resolved',
            title: `Blocker resolved: ${target?.title ?? 'Blocker'}`,
          },
          ...c.timeline,
        ],
      };
      return {
        updated: { ...draft, state: deriveNextCaseState(draft) },
        milestone: `Blocker addressed on "${c.title}". Your next action has been recalculated.`,
      };
    });
    showToast('Blocker marked resolved!', 'success');
  };

  const addCaseNote = (caseId: string, text: string) => {
    const safe = sanitiseInput(text, 500);
    if (!safe) return;
    const nowIso = new Date().toISOString();
    mutateCase(caseId, (c) => {
      const draft: AdminCase = {
        ...c,
        notes: [{ id: uid('note'), text: safe, createdAt: nowIso }, ...c.notes],
        updatedAt: nowIso,
        timeline: [
          {
            id: uid('tl'),
            date: nowIso,
            kind: 'note_added',
            title: 'Added case note',
            detail: safe.slice(0, 90),
          },
          ...c.timeline,
        ],
      };
      return { updated: { ...draft, state: deriveNextCaseState(draft) } };
    });
    showToast('Note saved to case history.', 'success');
  };

  const deleteCaseNote = (caseId: string, noteId: string) => {
    mutateCase(caseId, (c) => ({
      updated: {
        ...c,
        notes: c.notes.filter((n) => n.id !== noteId),
        updatedAt: new Date().toISOString(),
      },
    }));
    showToast('Note removed.', 'info');
  };

  const scheduleFollowUp: AppContextValue['scheduleFollowUp'] = (
    caseId,
    { title, dueDate, planStatement, channel }
  ) => {
    const safeTitle = sanitiseInput(title, 120);
    if (!safeTitle || !dueDate) return;
    const safePlan = sanitiseInput(planStatement, 220) || safeTitle;
    const nowIso = new Date().toISOString();

    const followUp: ScheduledFollowUp = {
      id: uid('fu'),
      title: safeTitle,
      dueDate,
      planStatement: safePlan,
      channel,
      completed: false,
    };

    mutateCase(caseId, (c) => {
      const draft: AdminCase = {
        ...c,
        followUps: [followUp, ...c.followUps],
        updatedAt: nowIso,
        timeline: [
          {
            id: uid('tl'),
            date: nowIso,
            kind: 'followup_scheduled',
            title: `Follow-up scheduled for ${dueDate}: ${safeTitle}`,
            detail: safePlan,
          },
          ...c.timeline,
        ],
      };
      const nextState = draft.blockers.some((b) => !b.resolved)
        ? 'blocked'
        : 'follow_up_scheduled';

      const notif: SimulatedNotification = {
        id: uid('notif'),
        kind: 'followup_reminder',
        urgency: 'medium',
        title: `Follow-up scheduled (${dueDate}): ${safeTitle}`,
        body: `Plan for "${c.title}": ${safePlan}`,
        createdAt: nowIso,
        read: false,
        dismissed: false,
        relatedCaseId: c.id,
        targetTab: 'cases',
      };

      return {
        updated: { ...draft, state: nextState },
        notification: notif,
        milestone: `Follow-up planned for ${dueDate}. Simulated reminder added to Notification Centre.`,
      };
    });

    showToast(`Follow-up scheduled for ${dueDate} and reminder created.`, 'success');
  };

  const toggleFollowUpComplete = (caseId: string, followUpId: string) => {
    const nowIso = new Date().toISOString();
    mutateCase(caseId, (c) => {
      let label = '';
      let done = false;
      const nextFollowUps = c.followUps.map((f) => {
        if (f.id !== followUpId) return f;
        label = f.title;
        done = !f.completed;
        return { ...f, completed: done, completedAt: done ? nowIso : undefined };
      });
      const draft: AdminCase = {
        ...c,
        followUps: nextFollowUps,
        updatedAt: nowIso,
        timeline: [
          {
            id: uid('tl'),
            date: nowIso,
            kind: 'followup_completed',
            title: done ? `Follow-up recorded complete: ${label}` : `Follow-up reopened: ${label}`,
          },
          ...c.timeline,
        ],
      };
      return {
        updated: { ...draft, state: deriveNextCaseState(draft) },
        milestone: done ? `Follow-up recorded on "${c.title}". Great consistency!` : undefined,
      };
    });
    showToast('Follow-up status updated.', 'success');
  };

  const saveCorrespondence: AppContextValue['saveCorrespondence'] = (
    caseId,
    { templateType, subject, recipientLabel, body }
  ) => {
    const safeSubject = sanitiseInput(subject, 160);
    const safeBody = sanitiseInput(body, 4000);
    if (!safeSubject || !safeBody) return null;
    const nowIso = new Date().toISOString();

    const record: SavedCorrespondence = {
      id: uid('corr'),
      templateType,
      subject: safeSubject,
      recipientLabel: sanitiseInput(recipientLabel, 120) || 'Administrative Desk (Example)',
      body: safeBody,
      createdAt: nowIso,
    };

    mutateCase(caseId, (c) => {
      const draft: AdminCase = {
        ...c,
        correspondence: [record, ...c.correspondence],
        updatedAt: nowIso,
        timeline: [
          {
            id: uid('tl'),
            date: nowIso,
            kind: 'correspondence_saved',
            title: `Saved demonstration correspondence: ${safeSubject}`,
            detail: `Addressed to ${record.recipientLabel} (not transmitted externally)`,
          },
          ...c.timeline,
        ],
      };
      return {
        updated: { ...draft, state: deriveNextCaseState(draft) },
        milestone: `Correspondence saved to "${c.title}" timeline.`,
      };
    });

    showToast('Fictional correspondence saved to case timeline.', 'success');
    return record;
  };

  const archiveCase = (caseId: string, archived: boolean) => {
    const nowIso = new Date().toISOString();
    mutateCase(caseId, (c) => ({
      updated: {
        ...c,
        archived,
        updatedAt: nowIso,
        timeline: [
          {
            id: uid('tl'),
            date: nowIso,
            kind: 'case_archived',
            title: archived ? 'Case archived' : 'Case restored from archive',
          },
          ...c.timeline,
        ],
      },
    }));
    showToast(archived ? 'Case archived.' : 'Case restored.', 'info');
  };

  const deleteCase = (caseId: string) => {
    setState((prev) => ({
      ...prev,
      cases: prev.cases.filter((c) => c.id !== caseId),
      notifications: prev.notifications.filter((n) => n.relatedCaseId !== caseId),
    }));
    if (selectedCaseId === caseId) {
      setSelectedCaseId(null);
    }
    showToast('Demonstration case deleted.', 'info');
  };

  const addVaultDocument: AppContextValue['addVaultDocument'] = (doc) => {
    const safeTitle = sanitiseInput(doc.title, 100);
    if (!safeTitle) return;
    const nowIso = new Date().toISOString();
    const newDoc: VaultDocument = {
      ...doc,
      id: uid('doc'),
      title: safeTitle,
      fictionalRefCode: sanitiseInput(doc.fictionalRefCode, 48) || `SAMPLE-${Date.now().toString().slice(-4)}`,
      holderName: sanitiseInput(doc.holderName, 60) || state.user.displayName,
      notes: sanitiseInput(doc.notes, 300),
      createdAt: nowIso,
    };

    const expiry = getDocumentExpiryStatus(newDoc);
    const expiryNotif: SimulatedNotification | null =
      expiry.status === 'expired' || expiry.status === 'expiring_soon'
        ? {
            id: uid('notif'),
            kind: 'document_expiry',
            urgency: expiry.status === 'expired' ? 'high' : 'medium',
            title: `Vault reminder: ${newDoc.title}`,
            body: `${expiry.label}. Fictional document metadata tracked in Vault.`,
            createdAt: nowIso,
            read: false,
            dismissed: false,
            relatedDocId: newDoc.id,
            targetTab: 'vault',
          }
        : null;

    setState((prev) => ({
      ...prev,
      vaultDocuments: [newDoc, ...prev.vaultDocuments],
      notifications: expiryNotif ? [expiryNotif, ...prev.notifications] : prev.notifications,
      cases: newDoc.linkedCaseId
        ? prev.cases.map((c) =>
            c.id === newDoc.linkedCaseId
              ? {
                  ...c,
                  timeline: [
                    {
                      id: uid('tl'),
                      date: nowIso,
                      kind: 'document_linked',
                      title: `Linked fictional vault record: ${newDoc.title}`,
                    },
                    ...c.timeline,
                  ],
                }
              : c
          )
        : prev.cases,
      lastMilestoneMessage: `Document organised: "${newDoc.title}" added to your demo vault.`,
    }));

    showToast(`Added fictional record "${safeTitle}" to Vault.`, 'success');
  };

  const updateVaultDocument = (id: string, patch: Partial<VaultDocument>) => {
    setState((prev) => ({
      ...prev,
      vaultDocuments: prev.vaultDocuments.map((d) =>
        d.id === id
          ? {
              ...d,
              ...patch,
              title: patch.title !== undefined ? sanitiseInput(patch.title, 100) : d.title,
              fictionalRefCode:
                patch.fictionalRefCode !== undefined
                  ? sanitiseInput(patch.fictionalRefCode, 48)
                  : d.fictionalRefCode,
              notes: patch.notes !== undefined ? sanitiseInput(patch.notes, 300) : d.notes,
            }
          : d
      ),
    }));
    showToast('Fictional document record updated.', 'success');
  };

  const deleteVaultDocument = (id: string) => {
    setState((prev) => ({
      ...prev,
      vaultDocuments: prev.vaultDocuments.filter((d) => d.id !== id),
    }));
    showToast('Fictional document record deleted.', 'info');
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
    showToast('All simulated notifications marked as read.', 'info');
  };

  const dismissNotification = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, dismissed: true, read: true } : n
      ),
    }));
  };

  const snoozeNotification = (id: string, days: number) => {
    const until = new Date();
    until.setDate(until.getDate() + days);
    const untilIso = until.toISOString();
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, snoozedUntil: untilIso, read: true } : n
      ),
    }));
    showToast(`Reminder snoozed for ${days} day${days > 1 ? 's' : ''}.`, 'info');
  };

  const dismissRecommendation = (recId: string) => {
    setState((prev) => ({
      ...prev,
      dismissedRecommendationIds: [...prev.dismissedRecommendationIds, recId],
    }));
    showToast('Recommendation dismissed.', 'info', () => {
      setState((prev) => ({
        ...prev,
        dismissedRecommendationIds: prev.dismissedRecommendationIds.filter((id) => id !== recId),
      }));
    });
  };

  const postponeRecommendation = (recId: string, days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    const dateStr = target.toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      postponedRecommendations: {
        ...prev.postponedRecommendations,
        [recId]: dateStr,
      },
    }));
    showToast(`Recommendation postponed until ${dateStr}.`, 'info', () => {
      setState((prev) => {
        const copy = { ...prev.postponedRecommendations };
        delete copy[recId];
        return { ...prev, postponedRecommendations: copy };
      });
    });
  };

  const clearMilestone = () => {
    setState((prev) => ({ ...prev, lastMilestoneMessage: null }));
  };

  return (
    <AppContext.Provider
      value={{
        state,
        activeTab,
        selectedCaseId,
        focusedRightsId,
        focusedVaultDocId,
        toast,
        recommendations,
        unreadNotificationCount,
        t,
        setActiveTab,
        setSelectedCaseId,
        openCase,
        openRightsEntry,
        openVaultDocument,
        clearFocusTargets,
        toggleTheme,
        showToast,
        dismissToast,
        setLanguage,
        updateAccessibility,
        updateNotificationPrefs,
        completeOnboarding,
        switchAuthMode,
        updateDocStatus,
        togglePremiumPreview,
        setTutorialState,
        replayOnboarding,
        resetDemoData,
        loadEmptyWorkspace,
        createCase,
        updateCaseTitle,
        updateCaseStateManual,
        updateCaseTargetDate,
        toggleChecklistItem,
        addBlocker,
        resolveBlocker,
        addCaseNote,
        deleteCaseNote,
        scheduleFollowUp,
        toggleFollowUpComplete,
        saveCorrespondence,
        archiveCase,
        deleteCase,
        addVaultDocument,
        updateVaultDocument,
        deleteVaultDocument,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification,
        snoozeNotification,
        dismissRecommendation,
        postponeRecommendation,
        clearMilestone,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
