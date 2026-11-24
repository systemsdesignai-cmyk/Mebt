import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  FolderLock,
  LifeBuoy,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CASE_STATE_LABELS, daysUntilDate, getCaseProgress } from '../../engine/workflowEngine';
import { RIGHTS_LIBRARY_ENTRIES } from '../../data/rightsLibrary';
import { DOC_STATUS_LABELS } from '../../i18n/translations';

const PLAN_PRESETS = [
  'Follow up on my application on Monday',
  'Prepare my supporting documents tomorrow',
  'Review my outstanding requirements this weekend',
];

function defaultOffsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

type SearchScope = 'all' | 'cases' | 'documents' | 'rights';

export const HomeScreen: React.FC = () => {
  const {
    state,
    recommendations,
    openCase,
    openRightsEntry,
    openVaultDocument,
    setActiveTab,
    postponeRecommendation,
    dismissRecommendation,
    scheduleFollowUp,
    switchAuthMode,
    t,
  } = useApp();

  const activeCases = state.cases.filter((c) => !c.archived && c.state !== 'closed');
  const topRecommendation = recommendations[0] ?? null;
  const secondaryRecs = recommendations.slice(1, 3);

  // Unified Home Search bar state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!trimmedQuery) {
      return { cases: [], documents: [], rights: [], total: 0 };
    }

    const matchedCases =
      searchScope === 'all' || searchScope === 'cases'
        ? activeCases.filter(
            (c) =>
              c.title.toLowerCase().includes(trimmedQuery) ||
              c.referenceLabel.toLowerCase().includes(trimmedQuery) ||
              c.institutionLabel.toLowerCase().includes(trimmedQuery) ||
              c.pathwayId.replace(/_/g, ' ').toLowerCase().includes(trimmedQuery)
          )
        : [];

    const matchedDocuments =
      searchScope === 'all' || searchScope === 'documents'
        ? state.vaultDocuments.filter(
            (d) =>
              d.title.toLowerCase().includes(trimmedQuery) ||
              d.fictionalRefCode.toLowerCase().includes(trimmedQuery) ||
              d.category.replace(/_/g, ' ').toLowerCase().includes(trimmedQuery) ||
              d.notes.toLowerCase().includes(trimmedQuery)
          )
        : [];

    const matchedRights =
      searchScope === 'all' || searchScope === 'rights'
        ? RIGHTS_LIBRARY_ENTRIES.filter(
            (r) =>
              r.title.toLowerCase().includes(trimmedQuery) ||
              r.plainSummary.toLowerCase().includes(trimmedQuery) ||
              r.whyItMatters.toLowerCase().includes(trimmedQuery) ||
              r.topic.replace(/_/g, ' ').toLowerCase().includes(trimmedQuery)
          )
        : [];

    return {
      cases: matchedCases,
      documents: matchedDocuments,
      rights: matchedRights,
      total: matchedCases.length + matchedDocuments.length + matchedRights.length,
    };
  }, [trimmedQuery, searchScope, activeCases, state.vaultDocuments]);

  // Implementation intention ("Make a Plan") form state
  const [planCaseId, setPlanCaseId] = useState<string>(activeCases[0]?.id ?? '');
  const [planText, setPlanText] = useState<string>(PLAN_PRESETS[0]);
  const [planDate, setPlanDate] = useState<string>(defaultOffsetDate(2));
  const [planError, setPlanError] = useState<string>('');

  const selectedPlanCaseId =
    activeCases.some((c) => c.id === planCaseId) ? planCaseId : activeCases[0]?.id ?? '';

  const activeBlockersCount = activeCases.reduce(
    (sum, c) => sum + c.blockers.filter((b) => !b.resolved).length,
    0
  );
  const outstandingTasksCount = activeCases.reduce(
    (sum, c) => sum + c.checklist.filter((i) => !i.completed).length,
    0
  );
  const upcomingFollowUps = activeCases
    .flatMap((c) =>
      c.followUps
        .filter((f) => !f.completed)
        .map((f) => ({ ...f, caseId: c.id, caseTitle: c.title }))
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const recentTimeline = state.cases
    .flatMap((c) => c.timeline.map((ev) => ({ ...ev, caseId: c.id, caseTitle: c.title })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const relevantRights = RIGHTS_LIBRARY_ENTRIES.filter((entry) =>
    state.user.documentationStatus === 'prefer_not_to_say'
      ? true
      : entry.applicableStatuses.includes(state.user.documentationStatus)
  ).slice(0, 2);

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanCaseId) {
      setPlanError('Create a demo case first to attach a scheduled reminder.');
      return;
    }
    if (!planText.trim() || !planDate) {
      setPlanError('Please enter an action plan and pick a target date.');
      return;
    }
    setPlanError('');
    scheduleFollowUp(selectedPlanCaseId, {
      title: planText.trim().slice(0, 80),
      dueDate: planDate,
      planStatement: planText.trim(),
      channel: 'email',
    });
  };

  return (
    <div className="space-y-7 animate-mebt-in">
      {/* Top Unified Search Bar — dedicated breathing room at top of Home */}
      <section aria-label="Quick search" className="space-y-3">
        <div className="relative">
          <Search
            className="w-5 h-5 text-[#4A5D7A] dark:text-[#A9B9D4] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchQuery('');
            }}
            placeholder={t('home.searchPlaceholder')}
            aria-label={t('home.searchPlaceholder')}
            className="w-full min-h-[50px] rounded-2xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#0F1D36] pl-12 pr-11 text-sm text-[#09234F] dark:text-[#F1F5FF] placeholder:text-[#4A5D7A] dark:placeholder:text-[#8CA0C2] shadow-xs focus:border-[#075DEB] dark:focus:border-[#4D8EFF] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="min-h-[40px] min-w-[40px] absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl flex items-center justify-center text-[#4A5D7A] dark:text-[#A9B9D4] hover:bg-[#F5F8FF] dark:hover:bg-[#132544]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progressive Live Search Results Panel — only shown when typing */}
        {trimmedQuery && (
          <div className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-4 sm:p-5 space-y-4 animate-mebt-in">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE6F7] dark:border-[#1E3254] pb-3">
              <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Search scope">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'cases', label: 'Active cases' },
                    { id: 'documents', label: 'Documents' },
                    { id: 'rights', label: 'Legal rights' },
                  ] as Array<{ id: SearchScope; label: string }>
                ).map((tab) => {
                  const active = searchScope === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSearchScope(tab.id)}
                      aria-pressed={active}
                      className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-[#075DEB] text-white'
                          : 'bg-[#F5F8FF] dark:bg-[#132544] text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-[#09234F] dark:hover:text-[#F1F5FF]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <span className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] tabular-nums">
                {searchResults.total} result{searchResults.total === 1 ? '' : 's'}
              </span>
            </div>

            {searchResults.total === 0 ? (
              <div className="py-4 text-center space-y-2">
                <p className="text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF]">
                  No matches found for “{searchQuery.trim()}”
                </p>
                <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
                  Try searching for a permit, receipt, renewal, citizenship, asylum, or rights topic.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.cases.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF]">
                      Active cases ({searchResults.cases.length})
                    </p>
                    <div className="divide-y divide-[#DCE6F7] dark:divide-[#1E3254]">
                      {searchResults.cases.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            openCase(c.id);
                          }}
                          className="w-full min-h-[48px] py-2.5 px-2 -mx-2 rounded-xl text-left flex items-center justify-between gap-3 hover:bg-[#F5F8FF] dark:hover:bg-[#132544] transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <Briefcase className="w-4 h-4 text-[#075DEB] dark:text-[#6AA6FF] shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] truncate">
                                {c.title}
                              </p>
                              <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] tabular-nums">
                                {CASE_STATE_LABELS[c.state]} · Ref: {c.referenceLabel}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#4A5D7A] dark:text-[#A9B9D4] shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.documents.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF]">
                      Document Vault ({searchResults.documents.length})
                    </p>
                    <div className="divide-y divide-[#DCE6F7] dark:divide-[#1E3254]">
                      {searchResults.documents.map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            openVaultDocument(doc.id);
                          }}
                          className="w-full min-h-[48px] py-2.5 px-2 -mx-2 rounded-xl text-left flex items-center justify-between gap-3 hover:bg-[#F5F8FF] dark:hover:bg-[#132544] transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <FileText className="w-4 h-4 text-[#075DEB] dark:text-[#6AA6FF] shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] truncate">
                                {doc.title}
                              </p>
                              <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] tabular-nums">
                                {doc.fictionalRefCode}
                                {doc.expiryDate ? ` · Expires ${doc.expiryDate}` : ''}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#4A5D7A] dark:text-[#A9B9D4] shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.rights.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF]">
                      Legal rights ({searchResults.rights.length})
                    </p>
                    <div className="divide-y divide-[#DCE6F7] dark:divide-[#1E3254]">
                      {searchResults.rights.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            openRightsEntry(r.id);
                          }}
                          className="w-full min-h-[48px] py-2.5 px-2 -mx-2 rounded-xl text-left flex items-center justify-between gap-3 hover:bg-[#F5F8FF] dark:hover:bg-[#132544] transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <BookOpen className="w-4 h-4 text-[#075DEB] dark:text-[#6AA6FF] shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] truncate">
                                {r.title}
                              </p>
                              <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] truncate">
                                {r.plainSummary}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#4A5D7A] dark:text-[#A9B9D4] shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Personalised Header Row */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#4A5D7A] dark:text-[#A9B9D4]">
            {state.user.isGuest
              ? 'Guest Explorer Session'
              : `${DOC_STATUS_LABELS[state.language][state.user.documentationStatus]} · Demo Profile`}
          </p>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#09234F] dark:text-[#F1F5FF]">
            {state.user.isGuest
              ? t('home.guestGreeting')
              : `${t('home.greeting')}, ${state.user.displayName}`}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('cases')}
          className="min-h-[44px] px-5 rounded-2xl bg-[#075DEB] text-white text-sm font-semibold hover:bg-[#0547B8] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t('home.newCase')}
        </button>
      </section>

      {/* Guest prompt banner */}
      {state.user.isGuest && (
        <section className="mebt-card rounded-2xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4]">{t('cases.guestNotice')}</p>
          <button
            type="button"
            onClick={() => switchAuthMode('phone')}
            className="min-h-[44px] px-4 rounded-xl bg-[#075DEB] text-white text-xs font-semibold hover:bg-[#0547B8] whitespace-nowrap shrink-0"
          >
            {t('cases.switchDemoAccount')}
          </button>
        </section>
      )}

      {/* Primary Focal Anchor: Deterministic Rule-Based Next Action Card */}
      {topRecommendation && (
        <section
          aria-label={t('home.nextActionTitle')}
          className="mebt-card rounded-3xl bg-[#09234F] dark:bg-[#12274B] border border-transparent dark:border-[#24406E] text-white p-6 sm:p-7 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/75">
            <span className="font-semibold text-[#FFB300]">
              {t('home.nextActionTitle')} · {topRecommendation.priorityLabel}
            </span>
            <span className="tabular-nums">Priority {topRecommendation.priorityRank} of 6</span>
          </div>

          <div className="space-y-2 max-w-2xl">
            <h2 className="font-heading text-xl sm:text-2xl font-bold leading-snug text-white">
              {topRecommendation.title}
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              <strong className="text-white">{t('home.whyRecommended')}:</strong>{' '}
              {topRecommendation.whyRecommended}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                if (topRecommendation.relatedCaseId) {
                  openCase(topRecommendation.relatedCaseId);
                } else if (topRecommendation.relatedDocId) {
                  openVaultDocument(topRecommendation.relatedDocId);
                } else {
                  setActiveTab(topRecommendation.targetTab);
                }
              }}
              className="min-h-[46px] px-5 rounded-2xl bg-[#FFB300] text-[#09234F] text-sm font-bold hover:bg-[#FFC433] transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              {topRecommendation.actionLabel}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => postponeRecommendation(topRecommendation.id, 3)}
              className="min-h-[44px] px-4 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors whitespace-nowrap"
            >
              {t('home.postpone')}
            </button>

            <button
              type="button"
              onClick={() => dismissRecommendation(topRecommendation.id)}
              className="min-h-[44px] px-3 rounded-xl text-white/75 text-xs font-semibold hover:text-white transition-colors whitespace-nowrap"
            >
              {t('home.dismiss')}
            </button>
          </div>
        </section>
      )}

      {/* Key Metrics Strip (clean typography, tabular numbers, zero badge clutter) */}
      <section aria-label="Administrative summary" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: t('home.activeCases'),
            value: activeCases.length,
            detail: 'Fictional demo cases',
            onClick: () => setActiveTab('cases'),
          },
          {
            label: 'Outstanding steps',
            value: outstandingTasksCount,
            detail: 'Across active checklists',
            onClick: () => setActiveTab('cases'),
          },
          {
            label: 'Active blockers',
            value: activeBlockersCount,
            detail: activeBlockersCount > 0 ? 'Guidance ready' : 'No active blockers',
            highlight: activeBlockersCount > 0,
            onClick: () => setActiveTab('cases'),
          },
          {
            label: 'Scheduled plans',
            value: upcomingFollowUps.length,
            detail: 'Simulated reminders',
            onClick: () => setActiveTab('notifications'),
          },
        ].map((metric) => (
          <button
            key={metric.label}
            type="button"
            onClick={metric.onClick}
            className="mebt-card text-left rounded-2xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-4 hover:border-[#075DEB]/50 dark:hover:border-[#4D8EFF]/60 transition-colors space-y-1"
          >
            <p className="text-xs font-medium text-[#4A5D7A] dark:text-[#A9B9D4]">{metric.label}</p>
            <p
              className={`font-heading text-2xl sm:text-3xl font-extrabold tabular-nums ${
                metric.highlight
                  ? 'text-[#8A5300] dark:text-[#FFD166]'
                  : 'text-[#09234F] dark:text-[#F1F5FF]'
              }`}
            >
              {metric.value}
            </p>
            <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] truncate">{metric.detail}</p>
          </button>
        ))}
      </section>

      {/* Quick Actions Strip */}
      <section aria-label={t('home.quickActions')} className="space-y-3">
        <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
          {t('home.quickActions')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: Briefcase,
              label: t('cases.explorePathways'),
              sub: '9 categories',
              onClick: () => setActiveTab('cases'),
            },
            {
              icon: BookOpen,
              label: t('rights.title'),
              sub: 'Always free',
              onClick: () => setActiveTab('rights'),
            },
            {
              icon: LifeBuoy,
              label: t('nav.emergency'),
              sub: 'Mock directory',
              onClick: () => setActiveTab('assistance'),
            },
            {
              icon: FolderLock,
              label: t('vault.title'),
              sub: `${state.vaultDocuments.length} sample records`,
              onClick: () => setActiveTab('vault'),
            },
          ].map((qa) => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.label}
                type="button"
                onClick={qa.onClick}
                className="mebt-card min-h-[72px] text-left rounded-2xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-3.5 hover:border-[#075DEB]/50 dark:hover:border-[#4D8EFF]/60 transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EBF2FF] dark:bg-[#162C52] text-[#075DEB] dark:text-[#6AA6FF] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] truncate">
                    {qa.label}
                  </p>
                  <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] truncate">{qa.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2-Column Main Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Active Cases + Secondary Recommendations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Cases */}
          <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF]">
                  {t('home.activeCases')}
                </h2>
                <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] mt-0.5">
                  {t('home.progressDisclaimer')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('cases')}
                className="min-h-[40px] px-3 text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF] hover:underline whitespace-nowrap"
              >
                View all
              </button>
            </div>

            {activeCases.length === 0 ? (
              <div className="rounded-2xl bg-[#F5F8FF] dark:bg-[#132544] p-6 text-center space-y-3">
                <p className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
                  {t('cases.emptyTitle')}
                </p>
                <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4] max-w-md mx-auto">
                  {t('cases.emptyBody')}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('cases')}
                  className="min-h-[44px] px-5 rounded-xl bg-[#075DEB] text-white text-sm font-semibold hover:bg-[#0547B8]"
                >
                  {t('cases.createCase')}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#DCE6F7] dark:divide-[#1E3254]">
                {activeCases.map((c) => {
                  const prog = getCaseProgress(c);
                  const activeBlockers = c.blockers.filter((b) => !b.resolved).length;
                  const targetDays = daysUntilDate(c.userTargetDate);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => openCase(c.id)}
                      className="w-full text-left py-4 first:pt-1 last:pb-1 hover:bg-[#F5F8FF]/60 dark:hover:bg-[#132544]/70 rounded-xl px-2 -mx-2 transition-colors space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <h3 className="font-heading text-sm sm:text-base font-bold text-[#09234F] dark:text-[#F1F5FF] truncate">
                            {c.title}
                          </h3>
                          <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span>{CASE_STATE_LABELS[c.state]}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">Ref: {c.referenceLabel}</span>
                            {targetDays !== null && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="tabular-nums">
                                  Personal target: {c.userTargetDate}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-[#075DEB] dark:text-[#6AA6FF] tabular-nums shrink-0">
                          {prog.completed}/{prog.total} steps
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-[#EBF2FF] dark:bg-[#1A3159] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#075DEB] dark:bg-[#4D8EFF] transition-all duration-300"
                          style={{ width: `${prog.percent}%` }}
                        />
                      </div>

                      {activeBlockers > 0 && (
                        <p className="text-xs font-semibold text-[#8A5300] dark:text-[#FFD166] inline-flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          {activeBlockers} active blocker logged — tap for guidance
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Additional Priority Suggestions */}
          {secondaryRecs.length > 0 && (
            <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
              <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
                Also worth your attention
              </h2>
              <div className="divide-y divide-[#DCE6F7] dark:divide-[#1E3254]">
                {secondaryRecs.map((rec) => (
                  <div key={rec.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                    <p className="text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF]">
                      {rec.priorityLabel}
                    </p>
                    <p className="text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF]">
                      {rec.title}
                    </p>
                    <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">
                      {rec.whyRecommended}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          rec.relatedCaseId
                            ? openCase(rec.relatedCaseId)
                            : rec.relatedDocId
                            ? openVaultDocument(rec.relatedDocId)
                            : setActiveTab(rec.targetTab)
                        }
                        className="min-h-[38px] text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF] hover:underline inline-flex items-center gap-1"
                      >
                        {rec.actionLabel}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => postponeRecommendation(rec.id, 3)}
                        className="min-h-[38px] text-xs font-medium text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-[#09234F] dark:hover:text-[#F1F5FF]"
                      >
                        {t('home.postpone')}
                      </button>
                      <button
                        type="button"
                        onClick={() => dismissRecommendation(rec.id)}
                        className="min-h-[38px] text-xs font-medium text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-[#09234F] dark:hover:text-[#F1F5FF]"
                      >
                        {t('home.dismiss')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column (5 cols): Implementation Intentions Planner + Recent Activity + Rights */}
        <div className="lg:col-span-5 space-y-6">
          {/* Implementation Intentions ("Make a Plan") */}
          <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF7E0] dark:bg-[#2A210D] text-[#8A5300] dark:text-[#FFB300] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
                  {t('home.makePlanTitle')}
                </h2>
                <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] mt-0.5">
                  {t('home.makePlanSubtitle')}
                </p>
              </div>
            </div>

            {state.user.isGuest ? (
              <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] bg-[#F5F8FF] dark:bg-[#132544] rounded-xl p-3">
                Switch to a fictional demo account to schedule follow-up plans and simulated reminders.
              </p>
            ) : (
              <form onSubmit={handlePlanSubmit} className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {PLAN_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPlanText(preset)}
                      className={`min-h-[36px] text-left rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                        planText === preset
                          ? 'border-[#075DEB] bg-[#EBF2FF] dark:bg-[#162C52] text-[#075DEB] dark:text-[#6AA6FF]'
                          : 'border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-[#09234F] dark:hover:text-[#F1F5FF]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div>
                  <label
                    htmlFor="home-plan-text"
                    className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1"
                  >
                    My concrete action
                  </label>
                  <input
                    id="home-plan-text"
                    type="text"
                    value={planText}
                    onChange={(e) => setPlanText(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="home-plan-date"
                      className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1"
                    >
                      Target date
                    </label>
                    <input
                      id="home-plan-date"
                      type="date"
                      value={planDate}
                      onChange={(e) => setPlanDate(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF] tabular-nums"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="home-plan-case"
                      className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1"
                    >
                      Link to case
                    </label>
                    <select
                      id="home-plan-case"
                      value={selectedPlanCaseId}
                      onChange={(e) => setPlanCaseId(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                    >
                      {activeCases.length === 0 ? (
                        <option value="">No active case</option>
                      ) : (
                        activeCases.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {planError && (
                  <p role="alert" className="text-xs font-medium text-red-700 dark:text-red-400">
                    {planError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full min-h-[44px] rounded-xl bg-[#075DEB] text-white text-sm font-semibold hover:bg-[#0547B8] transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Schedule simulated reminder
                </button>
              </form>
            )}
          </section>

          {/* Recent Activity */}
          <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-3">
            <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
              {t('home.recentActivity')}
            </h2>
            {recentTimeline.length === 0 ? (
              <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
                Actions you complete on any case will appear here automatically.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentTimeline.map((ev) => (
                  <li key={ev.id} className="flex items-start gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#075DEB] dark:text-[#6AA6FF] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-medium text-[#09234F] dark:text-[#F1F5FF]">{ev.title}</p>
                      <p className="text-[#4A5D7A] dark:text-[#A9B9D4] tabular-nums">
                        {ev.date.slice(0, 10)} · {ev.caseTitle}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Tailored Rights Guidance */}
          <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
                {t('home.rightsForYou')}
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('rights')}
                className="text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF] hover:underline"
              >
                Open library
              </button>
            </div>
            <div className="space-y-3">
              {relevantRights.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openRightsEntry(item.id)}
                  className="w-full text-left rounded-2xl bg-[#F5F8FF] dark:bg-[#132544] p-3.5 hover:bg-[#EBF2FF]/70 dark:hover:bg-[#1B335C] transition-colors space-y-1"
                >
                  <p className="text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF]">
                    {item.title}
                  </p>
                  <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] line-clamp-2">
                    {item.plainSummary}
                  </p>
                  <p className="text-[11px] font-medium text-[#8A5300] dark:text-[#FFD166] inline-flex items-center gap-1 pt-0.5">
                    <Clock className="w-3 h-3" />
                    Pending legal verification · Always free
                  </p>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
