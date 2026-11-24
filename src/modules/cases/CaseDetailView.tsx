import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Download,
  Edit3,
  FileText,
  Info,
  LifeBuoy,
  MessageSquarePlus,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  AdminCase,
  CaseBlocker,
  CaseOrgState,
  CorrespondenceTemplateType,
  ScheduledFollowUp,
} from '../../types/mebt';
import {
  BLOCKER_PRESETS,
  buildCaseReportText,
  buildCorrespondenceTemplate,
  CASE_STATE_LABELS,
  CORRESPONDENCE_TEMPLATES,
  getCaseProgress,
} from '../../engine/workflowEngine';
import { getPathwayById } from '../../data/pathways';
import { sanitiseInput } from '../../services/storageAdapter';

type DetailTab = 'checklist' | 'blockers' | 'followups' | 'correspondence' | 'report' | 'timeline';

const ALL_ORG_STATES: CaseOrgState[] = [
  'not_started',
  'preparing_information',
  'ready_for_next_action',
  'action_recorded',
  'awaiting_response',
  'follow_up_scheduled',
  'blocked',
  'closed',
];

export const CaseDetailView: React.FC<{ adminCase: AdminCase; onBack: () => void }> = ({
  adminCase,
  onBack,
}) => {
  const {
    state,
    toggleChecklistItem,
    updateCaseTitle,
    updateCaseStateManual,
    updateCaseTargetDate,
    addBlocker,
    resolveBlocker,
    addCaseNote,
    deleteCaseNote,
    scheduleFollowUp,
    toggleFollowUpComplete,
    saveCorrespondence,
    archiveCase,
    deleteCase,
    switchAuthMode,
    setActiveTab,
    showToast,
    t,
  } = useApp();

  const [tab, setTab] = useState<DetailTab>('checklist');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(adminCase.title);
  const [expandedWhyId, setExpandedWhyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Blocker form
  const [blockerType, setBlockerType] = useState<CaseBlocker['type']>('long_wait');
  const [blockerTitle, setBlockerTitle] = useState(BLOCKER_PRESETS.long_wait.label);
  const [blockerDetails, setBlockerDetails] = useState('');
  const [blockerError, setBlockerError] = useState('');

  // Follow-up form
  const [fuTitle, setFuTitle] = useState('Follow up on application progress');
  const [fuDate, setFuDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().slice(0, 10);
  });
  const [fuPlan, setFuPlan] = useState('Send a polite written check-in using my saved reference.');
  const [fuChannel, setFuChannel] = useState<ScheduledFollowUp['channel']>('email');
  const [fuError, setFuError] = useState('');

  // Correspondence studio
  const [templateType, setTemplateType] = useState<CorrespondenceTemplateType>('application_followup');
  const initialDraft = buildCorrespondenceTemplate(
    'application_followup',
    adminCase,
    state.user.displayName
  );
  const [corrSubject, setCorrSubject] = useState(initialDraft.subject);
  const [corrRecipient, setCorrRecipient] = useState(initialDraft.recipientLabel);
  const [corrBody, setCorrBody] = useState(initialDraft.body);
  const [corrPreviewMode, setCorrPreviewMode] = useState(false);

  // Notes form
  const [noteInput, setNoteInput] = useState('');
  const [noteError, setNoteError] = useState('');

  // Keep editable drafts synced if user opens a different case
  useEffect(() => {
    setTitleDraft(adminCase.title);
    setEditingTitle(false);
    const rebuilt = buildCorrespondenceTemplate(
      'application_followup',
      adminCase,
      state.user.displayName
    );
    setTemplateType('application_followup');
    setCorrSubject(rebuilt.subject);
    setCorrRecipient(rebuilt.recipientLabel);
    setCorrBody(rebuilt.body);
    setCorrPreviewMode(false);
  }, [adminCase.id]);

  const isGuest = state.user.isGuest;
  const requireDemoAccount = (): boolean => {
    if (!isGuest) return false;
    showToast(
      'Guest mode is read-only. Switch to a fictional demo account to edit or save changes.',
      'warning'
    );
    return true;
  };

  const pathway = getPathwayById(adminCase.pathwayId);
  const progress = getCaseProgress(adminCase);
  const activeBlockers = adminCase.blockers.filter((b) => !b.resolved);
  const reportText = buildCaseReportText(adminCase, state.user.displayName);

  const handleSelectTemplate = (type: CorrespondenceTemplateType) => {
    setTemplateType(type);
    const built = buildCorrespondenceTemplate(type, adminCase, state.user.displayName);
    setCorrSubject(built.subject);
    setCorrRecipient(built.recipientLabel);
    setCorrBody(built.body);
    setCorrPreviewMode(false);
  };

  const handleCopyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard.`, 'success');
    } catch {
      showToast('Copy unavailable in this browser context. Select text manually.', 'warning');
    }
  };

  const handleDownloadReport = () => {
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MEBT-Demo-Report-${adminCase.referenceLabel || adminCase.id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('Fictional case report exported locally (.txt).', 'success');
  };

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (requireDemoAccount()) return;
    if (!sanitiseInput(titleDraft, 100)) {
      showToast('Please enter a valid fictional case title.', 'warning');
      return;
    }
    updateCaseTitle(adminCase.id, titleDraft);
    setEditingTitle(false);
  };

  const handleAddBlocker = (e: React.FormEvent) => {
    e.preventDefault();
    if (requireDemoAccount()) return;
    if (!sanitiseInput(blockerTitle, 120)) {
      setBlockerError('Please enter a valid short description of the blocker.');
      return;
    }
    setBlockerError('');
    addBlocker(adminCase.id, blockerType, blockerTitle, blockerDetails);
    setBlockerDetails('');
  };

  const handleScheduleFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (requireDemoAccount()) return;
    if (!sanitiseInput(fuTitle, 120) || !fuDate) {
      setFuError('Please provide both a valid action title and a date.');
      return;
    }
    setFuError('');
    scheduleFollowUp(adminCase.id, {
      title: fuTitle,
      dueDate: fuDate,
      planStatement: fuPlan || fuTitle,
      channel: fuChannel,
    });
  };

  const handleSaveLetter = () => {
    if (requireDemoAccount()) return;
    if (!sanitiseInput(corrSubject, 160) || !sanitiseInput(corrBody, 4000)) {
      showToast('Please ensure subject and letter body contain valid text.', 'warning');
      return;
    }
    saveCorrespondence(adminCase.id, {
      templateType,
      subject: corrSubject,
      recipientLabel: corrRecipient,
      body: corrBody,
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (requireDemoAccount()) return;
    if (!sanitiseInput(noteInput, 500)) {
      setNoteError('Please enter a short fictional note before saving.');
      return;
    }
    setNoteError('');
    addCaseNote(adminCase.id, noteInput);
    setNoteInput('');
  };

  const detailTabs: Array<{ id: DetailTab; label: string; count?: number }> = [
    { id: 'checklist', label: t('cases.checklist'), count: progress.total - progress.completed },
    { id: 'blockers', label: t('cases.blockers'), count: activeBlockers.length },
    {
      id: 'followups',
      label: t('cases.followups'),
      count: adminCase.followUps.filter((f) => !f.completed).length,
    },
    { id: 'correspondence', label: t('cases.correspondence'), count: adminCase.correspondence.length },
    { id: 'report', label: t('cases.report') },
    { id: 'timeline', label: t('cases.timeline') },
  ];

  return (
    <div className="space-y-5 animate-mebt-in">
      {/* Back navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#0F1D36] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#F5F8FF] dark:hover:bg-[#132544] inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          All cases
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isGuest}
            onClick={() => archiveCase(adminCase.id, !adminCase.archived)}
            className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#0F1D36] text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#F5F8FF] dark:hover:bg-[#132544] disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {adminCase.archived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            {adminCase.archived ? 'Restore' : 'Archive'}
          </button>
          <button
            type="button"
            disabled={isGuest}
            onClick={() => setConfirmDelete(true)}
            className="min-h-[44px] px-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-[#0F1D36] text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            {t('common.delete')}
          </button>
        </div>
      </div>

      {/* Guest read-only prompt */}
      {isGuest && (
        <div className="mebt-card rounded-2xl bg-[#FFF7E0] dark:bg-[#2A210D] border border-[#FFB300]/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-[#09234F] dark:text-[#F1F5FF]">
            {t('cases.guestNotice')}
          </p>
          <button
            type="button"
            onClick={() => switchAuthMode('phone')}
            className="min-h-[44px] px-4 rounded-xl bg-[#075DEB] text-white text-xs font-semibold hover:bg-[#0547B8] whitespace-nowrap shrink-0"
          >
            {t('cases.switchDemoAccount')}
          </button>
        </div>
      )}

      {/* Case Overview Header Card */}
      <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF]">
            {pathway?.title ?? adminCase.pathwayId} · Example workflow (pending legal verification)
          </p>

          {editingTitle ? (
            <form onSubmit={handleSaveTitle} className="flex flex-wrap gap-2">
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                aria-label="Edit case title"
                className="flex-1 min-w-[200px] min-h-[44px] rounded-xl border border-[#075DEB] bg-white dark:bg-[#132544] px-3 text-base font-bold text-[#09234F] dark:text-[#F1F5FF]"
              />
              <button
                type="submit"
                className="min-h-[44px] px-4 rounded-xl bg-[#075DEB] text-white text-sm font-semibold"
              >
                {t('common.save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitleDraft(adminCase.title);
                  setEditingTitle(false);
                }}
                className="min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF]"
              >
                {t('common.cancel')}
              </button>
            </form>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#09234F] dark:text-[#F1F5FF]">
                {adminCase.title}
              </h1>
              <button
                type="button"
                disabled={isGuest}
                onClick={() => setEditingTitle(true)}
                aria-label="Edit case title"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-[#075DEB] dark:hover:text-[#6AA6FF] disabled:opacity-50 shrink-0"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] flex flex-wrap gap-x-2 gap-y-1">
            <span>{adminCase.institutionLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">User ref: {adminCase.referenceLabel}</span>
          </p>
        </div>

        {/* Checklist progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#09234F] dark:text-[#F1F5FF]">
              User checklist completion (not official government status)
            </span>
            <span className="font-bold text-[#075DEB] dark:text-[#6AA6FF] tabular-nums">
              {progress.completed} of {progress.total} ({progress.percent}%)
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[#EBF2FF] dark:bg-[#1A3159] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#075DEB] dark:bg-[#4D8EFF] transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        {/* Controls: Organisational State & Personal Target Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label
              htmlFor="case-org-state"
              className="block text-xs font-semibold text-[#4A5D7A] dark:text-[#A9B9D4] mb-1"
            >
              Internal organisational state (user-recorded)
            </label>
            <select
              id="case-org-state"
              disabled={isGuest}
              value={adminCase.state}
              onChange={(e) => updateCaseStateManual(adminCase.id, e.target.value as CaseOrgState)}
              className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] px-3 text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] disabled:opacity-60"
            >
              {ALL_ORG_STATES.map((st) => (
                <option key={st} value={st}>
                  {CASE_STATE_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="case-target-date"
              className="block text-xs font-semibold text-[#4A5D7A] dark:text-[#A9B9D4] mb-1"
            >
              Personal target date (not a legally verified deadline)
            </label>
            <input
              id="case-target-date"
              type="date"
              disabled={isGuest}
              value={adminCase.userTargetDate ?? ''}
              onChange={(e) => updateCaseTargetDate(adminCase.id, e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] px-3 text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] tabular-nums disabled:opacity-60"
            />
          </div>
        </div>
      </section>

      {/* Segmented Sub-Navigation */}
      <div
        role="tablist"
        aria-label="Case sections"
        className="flex items-center gap-1.5 overflow-x-auto pb-1"
      >
        {detailTabs.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.id)}
              className={`min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ${
                active
                  ? 'bg-[#075DEB] text-white'
                  : 'bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-[#09234F] dark:hover:text-[#F1F5FF]'
              }`}
            >
              <span>{item.label}</span>
              {typeof item.count === 'number' && item.count > 0 && (
                <span
                  className={`text-[11px] font-bold tabular-nums ${
                    active ? 'text-[#FFB300]' : 'text-[#075DEB] dark:text-[#6AA6FF]'
                  }`}
                >
                  ({item.count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CHECKLIST */}
      {tab === 'checklist' && (
        <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF]">
              Demonstration Preparation Checklist
            </h2>
            <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
              Check off items as you organise your own records. Completing steps recalculates your
              dashboard and next recommended action automatically.
            </p>
          </div>

          <div className="divide-y divide-[#DCE6F7] dark:divide-[#1E3254]">
            {adminCase.checklist.map((item) => {
              const showWhy = expandedWhyId === item.id || state.accessibility.simplifiedGuidance;
              return (
                <div key={item.id} className="py-4 first:pt-1 last:pb-1 space-y-2">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (requireDemoAccount()) return;
                        toggleChecklistItem(adminCase.id, item.id);
                      }}
                      aria-pressed={item.completed}
                      aria-label={`Mark "${item.title}" as ${item.completed ? 'incomplete' : 'complete'}`}
                      className={`mt-0.5 w-7 h-7 min-w-[28px] rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${
                        item.completed
                          ? 'bg-[#075DEB] border-[#075DEB] text-white'
                          : 'border-[#075DEB]/50 dark:border-[#6AA6FF]/60 bg-white dark:bg-[#132544] hover:border-[#075DEB]'
                      }`}
                    >
                      {item.completed && <Check className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 min-w-0 space-y-1">
                      <p
                        className={`text-sm font-semibold leading-snug ${
                          item.completed ? 'line-through text-[#4A5D7A] dark:text-[#8CA0C2]' : 'text-[#09234F] dark:text-[#F1F5FF]'
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">{item.description}</p>
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                        {item.isPrerequisite && (
                          <span className="font-semibold text-[#8A5300] dark:text-[#FFD166]">Prerequisite step</span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedWhyId(expandedWhyId === item.id ? null : item.id)
                          }
                          className="font-semibold text-[#075DEB] dark:text-[#6AA6FF] hover:underline inline-flex items-center gap-1"
                        >
                          <Info className="w-3.5 h-3.5" />
                          {showWhy ? 'Hide why this matters' : 'Why this matters'}
                        </button>
                      </div>
                      {showWhy && (
                        <p className="text-xs text-[#09234F] dark:text-[#F1F5FF] bg-[#F5F8FF] dark:bg-[#132544] rounded-xl p-3 mt-2 leading-relaxed">
                          <strong>Why it matters:</strong> {item.whyItMatters}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 2: BLOCKERS */}
      {tab === 'blockers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <section className="lg:col-span-5 mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
                Log an administrative blocker
              </h2>
              <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] mt-0.5">
                Recording what is holding up progress unlocks structured generic follow-up guidance.
              </p>
            </div>

            <form onSubmit={handleAddBlocker} className="space-y-3">
              <div>
                <label htmlFor="blocker-type" className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1">
                  Blocker category
                </label>
                <select
                  id="blocker-type"
                  value={blockerType}
                  onChange={(e) => {
                    const nextType = e.target.value as CaseBlocker['type'];
                    setBlockerType(nextType);
                    setBlockerTitle(BLOCKER_PRESETS[nextType].label);
                  }}
                  className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                >
                  {(Object.keys(BLOCKER_PRESETS) as Array<CaseBlocker['type']>).map((key) => (
                    <option key={key} value={key}>
                      {BLOCKER_PRESETS[key].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="blocker-title" className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1">
                  Short summary
                </label>
                <input
                  id="blocker-title"
                  type="text"
                  value={blockerTitle}
                  onChange={(e) => setBlockerTitle(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                />
              </div>

              <div>
                <label htmlFor="blocker-details" className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1">
                  Fictional context / notes
                </label>
                <textarea
                  id="blocker-details"
                  rows={3}
                  value={blockerDetails}
                  onChange={(e) => setBlockerDetails(e.target.value)}
                  placeholder="Describe dates, counter feedback, or missing details (fictional demo only)..."
                  className="w-full rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] p-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                />
              </div>

              {blockerError && (
                <p role="alert" className="text-xs font-medium text-red-700 dark:text-red-400">
                  {blockerError}
                </p>
              )}

              <button
                type="submit"
                className="w-full min-h-[44px] rounded-xl bg-[#075DEB] text-white text-sm font-semibold hover:bg-[#0547B8] inline-flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Record blocker &amp; get suggestions
              </button>
            </form>
          </section>

          <section className="lg:col-span-7 mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
            <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
              Recorded blockers &amp; generic guidance
            </h2>

            {adminCase.blockers.length === 0 ? (
              <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4] bg-[#F5F8FF] dark:bg-[#132544] rounded-2xl p-5">
                No blockers recorded for this case. If you encounter delays or missing records, log
                one on the left to see calm administrative options.
              </p>
            ) : (
              <div className="space-y-4">
                {adminCase.blockers.map((b) => (
                  <div
                    key={b.id}
                    className={`rounded-2xl border p-4 space-y-3 ${
                      b.resolved
                        ? 'border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF]/60 dark:bg-[#132544]/60'
                        : 'border-[#FFB300]/60 bg-[#FFF7E0]/50 dark:bg-[#2A210D]/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-[#8A5300] dark:text-[#FFD166]">
                          {b.resolved ? 'Resolved' : 'Active blocker'} · {b.createdAt.slice(0, 10)}
                        </p>
                        <h3 className="font-heading text-sm font-bold text-[#09234F] dark:text-[#F1F5FF] mt-0.5">
                          {b.title}
                        </h3>
                        <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] mt-1">{b.details}</p>
                      </div>
                      {!b.resolved && (
                        <button
                          type="button"
                          onClick={() => {
                            if (requireDemoAccount()) return;
                            resolveBlocker(adminCase.id, b.id);
                          }}
                          className="min-h-[40px] px-3.5 rounded-xl bg-[#075DEB] text-white text-xs font-semibold hover:bg-[#0547B8] whitespace-nowrap shrink-0"
                        >
                          Mark resolved
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5 bg-white dark:bg-[#0F1D36] rounded-xl p-3 border border-[#DCE6F7] dark:border-[#1E3254]">
                      <p className="text-xs font-bold text-[#09234F] dark:text-[#F1F5FF]">
                        Suggested generic administrative steps (not legal advice):
                      </p>
                      <ol className="list-decimal pl-4 space-y-1 text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
                        {b.guidanceSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectTemplate('request_clarification');
                            setTab('correspondence');
                          }}
                          className="text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF] hover:underline"
                        >
                          Draft clarification letter
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('assistance')}
                          className="text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF] hover:underline inline-flex items-center gap-1"
                        >
                          <LifeBuoy className="w-3.5 h-3.5" />
                          Browse free assistance directory
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 3: FOLLOW-UPS */}
      {tab === 'followups' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <section className="lg:col-span-5 mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
            <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
              Schedule a follow-up plan
            </h2>
            <form onSubmit={handleScheduleFollowUp} className="space-y-3">
              <div>
                <label htmlFor="fu-title" className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1">
                  Follow-up action
                </label>
                <input
                  id="fu-title"
                  type="text"
                  value={fuTitle}
                  onChange={(e) => setFuTitle(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fu-date" className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1">
                    Planned date
                  </label>
                  <input
                    id="fu-date"
                    type="date"
                    value={fuDate}
                    onChange={(e) => setFuDate(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF] tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="fu-channel" className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1">
                    Planned channel
                  </label>
                  <select
                    id="fu-channel"
                    value={fuChannel}
                    onChange={(e) => setFuChannel(e.target.value as ScheduledFollowUp['channel'])}
                    className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                  >
                    <option value="email">Written email</option>
                    <option value="in_person">In-person visit</option>
                    <option value="phone">Phone call</option>
                    <option value="call_centre">Contact centre</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="fu-plan" className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1">
                  Implementation intention note
                </label>
                <textarea
                  id="fu-plan"
                  rows={2}
                  value={fuPlan}
                  onChange={(e) => setFuPlan(e.target.value)}
                  className="w-full rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] p-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                />
              </div>

              {fuError && (
                <p role="alert" className="text-xs font-medium text-red-700 dark:text-red-400">
                  {fuError}
                </p>
              )}

              <button
                type="submit"
                className="w-full min-h-[44px] rounded-xl bg-[#075DEB] text-white text-sm font-semibold hover:bg-[#0547B8] inline-flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Save follow-up &amp; simulated alert
              </button>
            </form>
          </section>

          <section className="lg:col-span-7 mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
            <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
              Scheduled follow-ups
            </h2>
            {adminCase.followUps.length === 0 ? (
              <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4] bg-[#F5F8FF] dark:bg-[#132544] rounded-2xl p-5">
                No follow-ups scheduled yet. Adding a follow-up automatically creates a simulated
                reminder in your Notification Centre.
              </p>
            ) : (
              <div className="divide-y divide-[#DCE6F7] dark:divide-[#1E3254]">
                {adminCase.followUps.map((f) => (
                  <div
                    key={f.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF] tabular-nums">
                        {f.dueDate} · {f.channel.replace('_', ' ')}
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          f.completed ? 'line-through text-[#4A5D7A] dark:text-[#8CA0C2]' : 'text-[#09234F] dark:text-[#F1F5FF]'
                        }`}
                      >
                        {f.title}
                      </p>
                      <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">{f.planStatement}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (requireDemoAccount()) return;
                        toggleFollowUpComplete(adminCase.id, f.id);
                      }}
                      className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 ${
                        f.completed
                          ? 'border border-[#DCE6F7] dark:border-[#1E3254] text-[#4A5D7A] dark:text-[#A9B9D4]'
                          : 'bg-[#EBF2FF] dark:bg-[#162C52] text-[#075DEB] dark:text-[#6AA6FF] hover:bg-[#DCE9FF] dark:hover:bg-[#1E3A6A]'
                      }`}
                    >
                      {f.completed ? 'Completed' : 'Mark done'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 4: CORRESPONDENCE STUDIO */}
      {tab === 'correspondence' && (
        <div className="space-y-5">
          <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF]">
                  Demonstration Correspondence Studio
                </h2>
                <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] mt-0.5">
                  Fictional editable templates · Not professionally reviewed legal documents · No
                  real message is sent.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCorrPreviewMode((p) => !p)}
                className="min-h-[40px] px-3.5 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#F5F8FF] dark:hover:bg-[#132544]"
              >
                {corrPreviewMode ? 'Edit draft' : 'Preview formatted letter'}
              </button>
            </div>

            {/* 5 template selector buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {CORRESPONDENCE_TEMPLATES.map((tpl) => {
                const selected = templateType === tpl.type;
                return (
                  <button
                    key={tpl.type}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.type)}
                    className={`min-h-[48px] text-left rounded-xl border p-3 transition-colors ${
                      selected
                        ? 'border-[#075DEB] bg-[#EBF2FF]/70 dark:bg-[#162C52] text-[#09234F] dark:text-[#F1F5FF]'
                        : 'border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF]/60 dark:bg-[#132544] text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-[#09234F] dark:hover:text-[#F1F5FF]'
                    }`}
                  >
                    <p className="text-xs font-bold leading-snug">{tpl.label}</p>
                  </button>
                );
              })}
            </div>

            {corrPreviewMode ? (
              <div className="rounded-2xl border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] p-5 space-y-3">
                <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
                  <strong className="text-[#09234F] dark:text-[#F1F5FF]">To:</strong> {corrRecipient}
                </p>
                <p className="text-sm font-bold text-[#09234F] dark:text-[#F1F5FF]">
                  <strong>Subject:</strong> {corrSubject}
                </p>
                <pre className="whitespace-pre-wrap font-sans text-sm text-[#09234F] dark:text-[#F1F5FF] leading-relaxed border-t border-[#DCE6F7] dark:border-[#1E3254] pt-3">
                  {corrBody}
                </pre>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="corr-recipient" className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1">
                      Example recipient
                    </label>
                    <input
                      id="corr-recipient"
                      type="text"
                      value={corrRecipient}
                      onChange={(e) => setCorrRecipient(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                    />
                  </div>
                  <div>
                    <label htmlFor="corr-subject" className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1">
                      Subject line
                    </label>
                    <input
                      id="corr-subject"
                      type="text"
                      value={corrSubject}
                      onChange={(e) => setCorrSubject(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="corr-body" className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1">
                    Editable demonstration letter
                  </label>
                  <textarea
                    id="corr-body"
                    rows={9}
                    value={corrBody}
                    onChange={(e) => setCorrBody(e.target.value)}
                    className="w-full rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] p-3.5 text-sm text-[#09234F] dark:text-[#F1F5FF] leading-relaxed"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={handleSaveLetter}
                className="min-h-[44px] px-5 rounded-xl bg-[#075DEB] text-white text-sm font-semibold hover:bg-[#0547B8] inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Save record to case timeline
              </button>
              <button
                type="button"
                onClick={() =>
                  handleCopyText(`To: ${corrRecipient}\nSubject: ${corrSubject}\n\n${corrBody}`, 'Letter text')
                }
                className="min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#F5F8FF] dark:hover:bg-[#1B335C] inline-flex items-center gap-2"
              >
                <ClipboardCopy className="w-4 h-4" />
                Copy demonstration text
              </button>
            </div>
          </section>

          {/* Saved Correspondence History */}
          <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-3">
            <h3 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
              Saved correspondence history ({adminCase.correspondence.length})
            </h3>
            {adminCase.correspondence.length === 0 ? (
              <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
                No correspondence saved yet. Save a draft above to record it in your timeline.
              </p>
            ) : (
              <div className="divide-y divide-[#DCE6F7] dark:divide-[#1E3254]">
                {adminCase.correspondence.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] tabular-nums">
                      {item.createdAt.slice(0, 10)} · {item.recipientLabel}
                    </p>
                    <p className="text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF]">{item.subject}</p>
                    <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] line-clamp-2">{item.body}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 5: CASE REPORT PREVIEW */}
      {tab === 'report' && (
        <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF]">
                Demonstration Case Report Preview
              </h2>
              <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] mt-0.5">
                Summarises your user-recorded progress, blockers, follow-ups, and saved letters.
                Local export only.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleCopyText(reportText, 'Case report')}
                className="min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#F5F8FF] dark:hover:bg-[#1B335C] inline-flex items-center gap-1.5"
              >
                <ClipboardCopy className="w-4 h-4" />
                Copy report
              </button>
              <button
                type="button"
                onClick={handleDownloadReport}
                className="min-h-[44px] px-4 rounded-xl bg-[#075DEB] text-white text-xs font-semibold hover:bg-[#0547B8] inline-flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Export .txt locally
              </button>
            </div>
          </div>

          <pre className="rounded-2xl bg-[#F5F8FF] dark:bg-[#132544] border border-[#DCE6F7] dark:border-[#1E3254] p-4 sm:p-5 text-xs sm:text-sm font-mono text-[#09234F] dark:text-[#F1F5FF] whitespace-pre-wrap overflow-x-auto leading-relaxed">
            {reportText}
          </pre>
        </section>
      )}

      {/* TAB 6: TIMELINE & NOTES */}
      {tab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <section className="lg:col-span-5 mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
            <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
              Fictional case notes
            </h2>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows={3}
                value={noteInput}
                onChange={(e) => {
                  setNoteInput(e.target.value);
                  setNoteError('');
                }}
                placeholder="Log counter visits, call reference numbers, or next thoughts (fictional demo only)..."
                aria-label="Add fictional case note"
                className="w-full rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] p-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
              />
              {noteError && (
                <p role="alert" className="text-xs font-medium text-red-700 dark:text-red-400">
                  {noteError}
                </p>
              )}
              <button
                type="submit"
                className="w-full min-h-[44px] rounded-xl bg-[#075DEB] text-white text-sm font-semibold hover:bg-[#0547B8] inline-flex items-center justify-center gap-2"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Add note
              </button>
            </form>

            {adminCase.notes.length > 0 && (
              <div className="divide-y divide-[#DCE6F7] dark:divide-[#1E3254] pt-1">
                {adminCase.notes.map((n) => (
                  <div key={n.id} className="py-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] tabular-nums">{n.createdAt.slice(0, 10)}</p>
                      <p className="text-sm text-[#09234F] dark:text-[#F1F5FF] mt-0.5">{n.text}</p>
                    </div>
                    {!isGuest && (
                      <button
                        type="button"
                        onClick={() => deleteCaseNote(adminCase.id, n.id)}
                        aria-label="Delete note"
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-red-700 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="lg:col-span-7 mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
            <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
              Complete case timeline ({adminCase.timeline.length})
            </h2>
            <ol className="space-y-4">
              {adminCase.timeline.map((ev) => (
                <li key={ev.id} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#075DEB] dark:text-[#6AA6FF] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] tabular-nums">{ev.date.slice(0, 10)}</p>
                    <p className="text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF]">{ev.title}</p>
                    {ev.detail && <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">{ev.detail}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#09234F]/55 dark:bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Delete demonstration case"
        >
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-6 space-y-4 animate-mebt-sheet">
            <h3 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF]">
              Delete demonstration case?
            </h3>
            <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4]">
              This removes <strong className="text-[#09234F] dark:text-[#F1F5FF]">{adminCase.title}</strong> and its simulated timeline from your
              local demo workspace. You can restore the default dataset anytime in Profile.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF]"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(false);
                  deleteCase(adminCase.id);
                }}
                className="min-h-[44px] px-4 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
              >
                Delete case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
