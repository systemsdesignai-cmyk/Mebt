import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Compass,
  FolderOpen,
  Lock,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PATHWAY_DEFINITIONS, getPathwayById } from '../../data/pathways';
import { CASE_STATE_LABELS, getCaseProgress } from '../../engine/workflowEngine';
import { PathwayCategoryId, PathwayDefinition } from '../../types/mebt';
import { CaseDetailView } from './CaseDetailView';

const DEEP_AND_SHARED_CREATE_IDS: PathwayCategoryId[] = [
  'citizenship',
  'permanent_residence',
  'refugee_asylum',
  'complaints_followups',
];

export const CasesScreen: React.FC = () => {
  const {
    state,
    selectedCaseId,
    setSelectedCaseId,
    setActiveTab,
    createCase,
    switchAuthMode,
    t,
  } = useApp();

  const [viewMode, setViewMode] = useState<'my_cases' | 'pathways'>('my_cases');
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Case Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [pathwayId, setPathwayId] = useState<PathwayCategoryId>('citizenship');
  const [caseTitle, setCaseTitle] = useState('');
  const [refLabel, setRefLabel] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [initialNote, setInitialNote] = useState('');
  const [formError, setFormError] = useState('');

  // Preview modal for deferred/preview pathways
  const [previewPathway, setPreviewPathway] = useState<PathwayDefinition | null>(null);

  const selectedCase = state.cases.find((c) => c.id === selectedCaseId);
  if (selectedCase) {
    return (
      <CaseDetailView
        adminCase={selectedCase}
        onBack={() => setSelectedCaseId(null)}
      />
    );
  }

  const openCreatorWithPathway = (id: PathwayCategoryId) => {
    if (state.user.isGuest) {
      setViewMode('my_cases');
      return;
    }
    const def = getPathwayById(id);
    setPathwayId(id);
    setCaseTitle(def ? `${def.shortTitle} Preparation (Fictional Demo)` : '');
    setRefLabel(`DEMO-${id.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 8999)}`);
    setTargetDate('');
    setInitialNote('');
    setFormError('');
    setCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTitle.trim()) {
      setFormError('Please enter a fictional title for this demonstration case.');
      return;
    }
    setFormError('');
    const created = createCase({
      title: caseTitle,
      pathwayId,
      referenceLabel: refLabel,
      userTargetDate: targetDate,
      initialNote,
    });
    if (created) {
      setCreateOpen(false);
    }
  };

  const filteredCases = state.cases
    .filter((c) => (showArchived ? c.archived : !c.archived))
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.referenceLabel.toLowerCase().includes(q) ||
        c.pathwayId.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6 animate-mebt-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-[#09234F] dark:text-[#F1F5FF]">
            {t('cases.title')}
          </h1>
          <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4] mt-0.5">
            Track fictional demonstration cases or explore all nine approved administrative
            categories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCreatorWithPathway('citizenship')}
          disabled={state.user.isGuest}
          className="min-h-[44px] px-5 rounded-2xl bg-[#075DEB] text-white text-sm font-semibold hover:bg-[#0547B8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t('cases.createCase')}
        </button>
      </div>

      {/* Guest access notice */}
      {state.user.isGuest && (
        <div className="mebt-card rounded-2xl bg-[#FFF7E0] dark:bg-[#2A210D] border border-[#FFB300]/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-[#09234F] dark:text-[#F1F5FF]">{t('cases.guestNotice')}</p>
          <button
            type="button"
            onClick={() => switchAuthMode('phone')}
            className="min-h-[44px] px-4 rounded-xl bg-[#075DEB] text-white text-xs font-semibold hover:bg-[#0547B8] whitespace-nowrap shrink-0"
          >
            {t('cases.switchDemoAccount')}
          </button>
        </div>
      )}

      {/* Segmented Switcher: My Cases vs 9 Pathways */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-2xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254]">
          <button
            type="button"
            onClick={() => setViewMode('my_cases')}
            className={`min-h-[40px] px-4 rounded-xl text-sm font-semibold transition-colors inline-flex items-center gap-2 ${
              viewMode === 'my_cases'
                ? 'bg-[#075DEB] text-white'
                : 'text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-[#09234F] dark:hover:text-[#F1F5FF]'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            {t('cases.myCases')} ({state.cases.filter((c) => !c.archived).length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('pathways')}
            className={`min-h-[40px] px-4 rounded-xl text-sm font-semibold transition-colors inline-flex items-center gap-2 ${
              viewMode === 'pathways'
                ? 'bg-[#075DEB] text-white'
                : 'text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-[#09234F] dark:hover:text-[#F1F5FF]'
            }`}
          >
            <Compass className="w-4 h-4" />
            {t('cases.explorePathways')}
          </button>
        </div>

        {viewMode === 'my_cases' && (
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#4A5D7A] dark:text-[#A9B9D4] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter cases..."
                aria-label="Filter cases"
                className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#0F1D36] pl-9 pr-3 text-sm text-[#09234F] dark:text-[#F1F5FF] placeholder:text-[#4A5D7A] dark:placeholder:text-[#8CA0C2]"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowArchived((s) => !s)}
              className={`min-h-[44px] px-3.5 rounded-xl border text-xs font-semibold whitespace-nowrap ${
                showArchived
                  ? 'border-[#075DEB] bg-[#EBF2FF] dark:bg-[#162C52] text-[#075DEB] dark:text-[#6AA6FF]'
                  : 'border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#0F1D36] text-[#4A5D7A] dark:text-[#A9B9D4]'
              }`}
            >
              {showArchived ? 'Showing archived' : 'Archived'}
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: MY DEMO CASES */}
      {viewMode === 'my_cases' && (
        <section className="space-y-4">
          {filteredCases.length === 0 ? (
            <div className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-8 text-center space-y-3">
              <h2 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF]">
                {showArchived ? 'No archived cases' : t('cases.emptyTitle')}
              </h2>
              <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4] max-w-md mx-auto">
                {showArchived
                  ? 'Archived demonstration cases appear here when you archive them.'
                  : t('cases.emptyBody')}
              </p>
              {!showArchived && (
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => openCreatorWithPathway('citizenship')}
                    disabled={state.user.isGuest}
                    className="min-h-[44px] px-5 rounded-xl bg-[#075DEB] text-white text-sm font-semibold hover:bg-[#0547B8] disabled:opacity-50"
                  >
                    Start Citizenship demo
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('pathways')}
                    className="min-h-[44px] px-5 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF]"
                  >
                    {t('cases.explorePathways')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCases.map((c) => {
                const prog = getCaseProgress(c);
                const activeBlockers = c.blockers.filter((b) => !b.resolved).length;
                const pathway = getPathwayById(c.pathwayId);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCaseId(c.id)}
                    className="mebt-card text-left rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 hover:border-[#075DEB]/60 dark:hover:border-[#4D8EFF]/60 transition-colors space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF]">
                        {pathway?.shortTitle ?? c.pathwayId} · {CASE_STATE_LABELS[c.state]}
                      </p>
                      <h2 className="font-heading text-base sm:text-lg font-bold text-[#09234F] dark:text-[#F1F5FF]">
                        {c.title}
                      </h2>
                      <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] tabular-nums">
                        Ref: {c.referenceLabel}
                        {c.userTargetDate ? ` · Target: ${c.userTargetDate}` : ''}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#4A5D7A] dark:text-[#A9B9D4]">Checklist progress</span>
                        <span className="font-bold text-[#09234F] dark:text-[#F1F5FF] tabular-nums">
                          {prog.completed}/{prog.total} ({prog.percent}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[#EBF2FF] dark:bg-[#1A3159] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#075DEB] dark:bg-[#4D8EFF]"
                          style={{ width: `${prog.percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1 text-xs">
                        {activeBlockers > 0 ? (
                          <span className="font-semibold text-[#8A5300] dark:text-[#FFD166] inline-flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {activeBlockers} active blocker
                          </span>
                        ) : (
                          <span className="text-[#4A5D7A] dark:text-[#A9B9D4]">
                            {c.followUps.filter((f) => !f.completed).length} scheduled follow-up(s)
                          </span>
                        )}
                        <span className="font-semibold text-[#075DEB] dark:text-[#6AA6FF] inline-flex items-center gap-1">
                          Open
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* VIEW 2: ALL 9 APPROVED PATHWAYS EXPLORER */}
      {viewMode === 'pathways' && (
        <section className="space-y-4">
          <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
            All nine approved administrative categories are shown below. Deep interactive demo
            workflows are enabled for Citizenship, Permanent Residence, Refugee &amp; Asylum, and
            shared Follow-Ups. Deferred household modules (F13) and employment rights are excluded.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PATHWAY_DEFINITIONS.map((p, index) => {
              const isDeep = p.depth === 'deep_demo';
              const isDirectRoute = Boolean(p.targetRoute);
              return (
                <article
                  key={p.id}
                  className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#075DEB] dark:text-[#6AA6FF] tabular-nums">
                        0{index + 1}.{' '}
                        {isDeep
                          ? 'Full demo pathway'
                          : p.depth === 'shared_demo'
                          ? 'Interactive module'
                          : 'Interactive preview'}
                      </span>
                      {p.isPremiumPreview && !state.user.premiumPreviewEnabled && (
                        <span className="text-[#8A5300] dark:text-[#FFD166] inline-flex items-center gap-1 font-medium">
                          <Lock className="w-3 h-3" />
                          Preview
                        </span>
                      )}
                    </div>

                    <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">{p.title}</h2>
                    <p className="text-xs sm:text-sm text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">{p.summary}</p>
                    <p className="text-[11px] font-medium text-[#8A5300] dark:text-[#FFD166] pt-1">
                      {p.verificationNote}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#DCE6F7]/80 dark:border-[#1E3254]">
                    {isDirectRoute && p.targetRoute ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab(p.targetRoute!)}
                        className="w-full min-h-[44px] rounded-xl bg-[#EBF2FF] dark:bg-[#162C52] text-[#075DEB] dark:text-[#6AA6FF] text-xs font-bold hover:bg-[#DCE9FF] dark:hover:bg-[#1E3A6A] inline-flex items-center justify-center gap-1.5"
                      >
                        Open {p.shortTitle}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : DEEP_AND_SHARED_CREATE_IDS.includes(p.id) ? (
                      <button
                        type="button"
                        onClick={() => openCreatorWithPathway(p.id)}
                        disabled={state.user.isGuest}
                        className="w-full min-h-[44px] rounded-xl bg-[#075DEB] text-white text-xs font-bold hover:bg-[#0547B8] disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        Start {p.shortTitle} case
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPreviewPathway(p)}
                        className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] text-[#09234F] dark:text-[#F1F5FF] text-xs font-bold hover:bg-[#EBF2FF] dark:hover:bg-[#1B335C] inline-flex items-center justify-center gap-1.5"
                      >
                        Explore interactive preview
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* CREATE FICTIONAL CASE MODAL */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#09234F]/55 dark:bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Create fictional demonstration case"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-6 space-y-5 animate-mebt-sheet max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF]">
                  Start a fictional demonstration case
                </h2>
                <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] mt-0.5">
                  Do not enter real ID numbers, official file numbers, or sensitive personal data.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                aria-label="Close modal"
                className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-[#4A5D7A] dark:text-[#A9B9D4] hover:bg-[#F5F8FF] dark:hover:bg-[#132544]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label htmlFor="new-case-pathway" className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1">
                  Administrative pathway
                </label>
                <select
                  id="new-case-pathway"
                  value={pathwayId}
                  onChange={(e) => {
                    const next = e.target.value as PathwayCategoryId;
                    setPathwayId(next);
                    const def = getPathwayById(next);
                    if (def) setCaseTitle(`${def.shortTitle} Preparation (Fictional Demo)`);
                  }}
                  className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                >
                  {DEEP_AND_SHARED_CREATE_IDS.map((id) => {
                    const def = getPathwayById(id);
                    return (
                      <option key={id} value={id}>
                        {def?.title ?? id}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label htmlFor="new-case-title" className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1">
                  Fictional case title
                </label>
                <input
                  id="new-case-title"
                  type="text"
                  value={caseTitle}
                  onChange={(e) => {
                    setCaseTitle(e.target.value);
                    setFormError('');
                  }}
                  placeholder="e.g., Citizenship Naturalisation Prep (Demo)"
                  className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-case-ref" className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1">
                    Fictional reference label
                  </label>
                  <input
                    id="new-case-ref"
                    type="text"
                    value={refLabel}
                    onChange={(e) => setRefLabel(e.target.value)}
                    placeholder="DEMO-CIT-2026"
                    className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF] tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="new-case-date" className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1">
                    Optional personal target date
                  </label>
                  <input
                    id="new-case-date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF] tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="new-case-note" className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1">
                  Optional starting note
                </label>
                <textarea
                  id="new-case-note"
                  rows={2}
                  value={initialNote}
                  onChange={(e) => setInitialNote(e.target.value)}
                  placeholder="Any fictional starting context..."
                  className="w-full rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] p-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                />
              </div>

              {formError && (
                <p role="alert" className="text-xs font-medium text-red-700 dark:text-red-400">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF]"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 rounded-xl bg-[#075DEB] text-white text-sm font-semibold hover:bg-[#0547B8]"
                >
                  Create demo case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW PATHWAY MODAL */}
      {previewPathway && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#09234F]/55 dark:bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={previewPathway.title}
        >
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-6 space-y-4 animate-mebt-sheet">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#8A5300] dark:text-[#FFD166]">
                  Interactive Preview · Pending legal verification
                </p>
                <h2 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF] mt-0.5">
                  {previewPathway.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPathway(null)}
                aria-label="Close preview"
                className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-[#4A5D7A] dark:text-[#A9B9D4] hover:bg-[#F5F8FF] dark:hover:bg-[#132544]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">{previewPathway.summary}</p>

            <div className="rounded-2xl bg-[#F5F8FF] dark:bg-[#132544] border border-[#DCE6F7] dark:border-[#1E3254] p-4 space-y-2">
              <p className="text-xs font-bold text-[#09234F] dark:text-[#F1F5FF]">Planned capabilities in verified phase:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
                {previewPathway.previewHighlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
              In the meantime, you can use the shared <strong className="text-[#09234F] dark:text-[#F1F5FF]">Complaints &amp; Follow-Ups</strong>{' '}
              case engine or <strong className="text-[#09234F] dark:text-[#F1F5FF]">Know Your Rights</strong> library to organise related letters
              and records.
            </p>

            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPreviewPathway(null)}
                className="min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF]"
              >
                {t('common.close')}
              </button>
              {!state.user.isGuest && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewPathway(null);
                    openCreatorWithPathway('complaints_followups');
                  }}
                  className="min-h-[44px] px-4 rounded-xl bg-[#075DEB] text-white text-sm font-semibold hover:bg-[#0547B8]"
                >
                  Open Follow-Up Case Demo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
