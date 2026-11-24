import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Headphones,
  Info,
  LifeBuoy,
  Pause,
  Play,
  RotateCcw,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RIGHTS_LIBRARY_ENTRIES } from '../../data/rightsLibrary';
import { DocStatus, RightsTopicCategory } from '../../types/mebt';
import { DOC_STATUS_LABELS } from '../../i18n/translations';

const STATUS_FILTERS: Array<DocStatus | 'all'> = [
  'all',
  'citizen',
  'permanent_resident',
  'refugee',
  'asylum_seeker',
  'visa_permit',
  'expired_doc',
  'undocumented_uncertain',
];

const TOPIC_LABELS: Record<RightsTopicCategory | 'all', string> = {
  all: 'All topics',
  identity_documentation: 'Identity & documentation',
  administrative_fairness: 'Administrative fairness',
  access_to_services: 'Access to public services',
  family_civil_records: 'Family & civil records',
  interactions_officials: 'Interactions with officials',
  complaints_escalation: 'Complaints & escalation',
};

export const RightsScreen: React.FC = () => {
  const { state, focusedRightsId, clearFocusTargets, setActiveTab, t } = useApp();

  const defaultStatus: DocStatus | 'all' =
    state.user.documentationStatus === 'prefer_not_to_say'
      ? 'all'
      : state.user.documentationStatus;

  const [selectedStatus, setSelectedStatus] = useState<DocStatus | 'all'>(
    focusedRightsId ? 'all' : defaultStatus
  );
  const [selectedTopic, setSelectedTopic] = useState<RightsTopicCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(
    focusedRightsId ?? RIGHTS_LIBRARY_ENTRIES[0]?.id ?? null
  );

  useEffect(() => {
    if (focusedRightsId) {
      setSelectedStatus('all');
      setSelectedTopic('all');
      setQuery('');
      setExpandedId(focusedRightsId);
      clearFocusTargets();
    }
  }, [focusedRightsId, clearFocusTargets]);

  // Simulated audio demonstration state (no external speech API or microphone recording)
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioProgressSec, setAudioProgressSec] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!playingId) return;
    const entry = RIGHTS_LIBRARY_ENTRIES.find((r) => r.id === playingId);
    if (!entry) return;

    const timer = window.setInterval(() => {
      setAudioProgressSec((prev) => {
        const current = prev[playingId] ?? 0;
        if (current + 1 >= entry.audioDurationSec) {
          setPlayingId(null);
          return { ...prev, [playingId]: 0 };
        }
        return { ...prev, [playingId]: current + 1 };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [playingId]);

  const filtered = RIGHTS_LIBRARY_ENTRIES.filter((entry) => {
    if (selectedStatus !== 'all' && !entry.applicableStatuses.includes(selectedStatus)) {
      return false;
    }
    if (selectedTopic !== 'all' && entry.topic !== selectedTopic) {
      return false;
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.plainSummary.toLowerCase().includes(q) ||
        entry.whyItMatters.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-mebt-in">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-extrabold text-[#09234F] dark:text-[#F1F5FF]">
            {t('rights.title')}
          </h1>
          <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4]">{t('rights.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('assistance')}
          className="min-h-[44px] px-4 rounded-xl bg-[#EBF2FF] dark:bg-[#162C52] text-[#075DEB] dark:text-[#6AA6FF] text-xs font-bold hover:bg-[#DCE9FF] dark:hover:bg-[#1E3A6A] inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <LifeBuoy className="w-4 h-4" />
          Need urgent legal help? (Free)
        </button>
      </section>

      {/* Pending verification banner */}
      <div className="rounded-2xl bg-[#FFF7E0] dark:bg-[#2A210D] border border-[#FFB300]/50 p-4 flex items-start gap-3 text-xs sm:text-sm text-[#09234F] dark:text-[#F1F5FF]">
        <Info className="w-4 h-4 text-[#8A5300] dark:text-[#FFB300] shrink-0 mt-0.5" />
        <p>{t('rights.pendingNotice')}</p>
      </div>

      {/* Search & Topic Filters */}
      <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-[#4A5D7A] dark:text-[#A9B9D4] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('rights.searchPlaceholder')}
              aria-label={t('rights.searchPlaceholder')}
              className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] pl-10 pr-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
            />
          </div>
          <div>
            <label htmlFor="rights-topic-select" className="sr-only">
              Filter by topic
            </label>
            <select
              id="rights-topic-select"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value as RightsTopicCategory | 'all')}
              className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] px-3 text-sm font-medium text-[#09234F] dark:text-[#F1F5FF]"
            >
              {(Object.keys(TOPIC_LABELS) as Array<RightsTopicCategory | 'all'>).map((key) => (
                <option key={key} value={key}>
                  {TOPIC_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interactive Documentation Status Filter Bar (All 7 Approved Statuses) */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#4A5D7A] dark:text-[#A9B9D4]">
            Filter by documentation status (optional):
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Documentation status filters">
            {STATUS_FILTERS.map((st) => {
              const active = selectedStatus === st;
              const label =
                st === 'all' ? t('rights.allStatuses') : DOC_STATUS_LABELS[state.language][st];
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  aria-pressed={active}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#075DEB] text-white'
                      : 'bg-[#F5F8FF] dark:bg-[#132544] border border-[#DCE6F7] dark:border-[#1E3254] text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-[#09234F] dark:hover:text-[#F1F5FF]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Results List */}
      {filtered.length === 0 ? (
        <div className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-8 text-center space-y-3">
          <h2 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF]">
            No matching rights guides found
          </h2>
          <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4]">
            Try clearing your search keyword or switching to All statuses.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedStatus('all');
              setSelectedTopic('all');
              setQuery('');
            }}
            className="min-h-[44px] px-5 rounded-xl bg-[#075DEB] text-white text-sm font-semibold"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((entry) => {
            const expanded = expandedId === entry.id;
            const isPlaying = playingId === entry.id;
            const elapsed = audioProgressSec[entry.id] ?? 0;
            const pct = Math.min(100, Math.round((elapsed / entry.audioDurationSec) * 100));

            return (
              <article
                key={entry.id}
                className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-[#4A5D7A] dark:text-[#A9B9D4]">
                      {TOPIC_LABELS[entry.topic]} ·{' '}
                      <span className="text-[#8A5300] dark:text-[#FFD166] font-semibold">
                        Pending verification
                      </span>{' '}
                      · Always free
                    </p>
                    <h2 className="font-heading text-base sm:text-lg font-bold text-[#09234F] dark:text-[#F1F5FF]">
                      {entry.title}
                    </h2>
                    <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">
                      {entry.plainSummary}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : entry.id)}
                    aria-expanded={expanded}
                    aria-label={expanded ? 'Collapse details' : 'Expand details'}
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] flex items-center justify-center text-[#075DEB] dark:text-[#6AA6FF] hover:bg-[#F5F8FF] dark:hover:bg-[#132544] shrink-0"
                  >
                    {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Simulated Audio Guidance Bar */}
                <div className="rounded-2xl bg-[#F5F8FF] dark:bg-[#132544] border border-[#DCE6F7] dark:border-[#1E3254] p-3.5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPlayingId(isPlaying ? null : entry.id)}
                        className="min-h-[40px] px-3.5 rounded-xl bg-[#075DEB] text-white text-xs font-semibold hover:bg-[#0547B8] inline-flex items-center gap-1.5"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {isPlaying ? 'Pause audio demo' : 'Listen (Audio demo)'}
                      </button>
                      {elapsed > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setPlayingId(null);
                            setAudioProgressSec((prev) => ({ ...prev, [entry.id]: 0 }));
                          }}
                          aria-label="Restart audio demo"
                          className="min-h-[40px] min-w-[40px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#0F1D36] flex items-center justify-center text-[#4A5D7A] dark:text-[#A9B9D4]"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] inline-flex items-center gap-1.5 tabular-nums">
                      <Headphones className="w-3.5 h-3.5 text-[#075DEB] dark:text-[#6AA6FF]" />
                      {formatTime(elapsed)} / {formatTime(entry.audioDurationSec)} · Simulated audio
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#DCE6F7] dark:bg-[#1E3254] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#075DEB] dark:bg-[#4D8EFF] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {isPlaying && (
                    <p className="text-xs text-[#09234F] dark:text-[#F1F5FF] italic pt-1 leading-relaxed">
                      “{entry.audioScriptSummary}”
                    </p>
                  )}
                </div>

                {/* Expanded Plain-Language Details */}
                {expanded && (
                  <div className="space-y-4 pt-2 border-t border-[#DCE6F7] dark:border-[#1E3254] animate-mebt-in">
                    <div className="space-y-1">
                      <h3 className="font-heading text-sm font-bold text-[#09234F] dark:text-[#F1F5FF]">
                        Why this matters
                      </h3>
                      <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">
                        {entry.whyItMatters}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-heading text-sm font-bold text-[#09234F] dark:text-[#F1F5FF]">
                        Practical preparation steps
                      </h3>
                      <ol className="list-decimal pl-5 space-y-1.5 text-sm text-[#4A5D7A] dark:text-[#A9B9D4]">
                        {entry.practicalSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="rounded-2xl bg-[#FFF7E0]/70 dark:bg-[#2A210D] border border-[#FFB300]/40 p-3.5 text-xs text-[#09234F] dark:text-[#F1F5FF] space-y-1">
                      <p className="font-bold">Important boundary</p>
                      <p className="leading-relaxed">{entry.whatToWatchOutFor}</p>
                    </div>

                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F5F8FF] dark:bg-[#132544] rounded-2xl p-3.5 border border-[#DCE6F7] dark:border-[#1E3254]">
                      <div>
                        <dt className="font-semibold text-[#09234F] dark:text-[#F1F5FF]">Source</dt>
                        <dd className="text-[#4A5D7A] dark:text-[#A9B9D4] mt-0.5">{entry.sourceLabel}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[#09234F] dark:text-[#F1F5FF]">
                          Verification date
                        </dt>
                        <dd className="text-[#8A5300] dark:text-[#FFD166] font-medium mt-0.5">
                          {entry.verificationDate}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
