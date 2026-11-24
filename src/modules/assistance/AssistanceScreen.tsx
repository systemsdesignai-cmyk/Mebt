import React, { useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Mail,
  MessageCircle,
  Phone,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ASSISTANCE_DIRECTORY } from '../../data/assistanceDirectory';
import { AssistanceCategory, AssistanceOrg } from '../../types/mebt';

const CATEGORY_LABELS: Record<AssistanceCategory | 'all', string> = {
  all: 'All organisations',
  emergency_legal_protection: 'Emergency legal protection',
  refugee_assistance: 'Refugee assistance',
  legal_assistance: 'Legal assistance',
  government_departments: 'Government departments',
  complaint_institutions: 'Complaint institutions',
};

type ContactActionType = 'phone' | 'whatsapp' | 'email' | 'website' | 'escalation';

export const AssistanceScreen: React.FC = () => {
  const { t, showToast } = useApp();
  const [category, setCategory] = useState<AssistanceCategory | 'all'>('all');
  const [province, setProvince] = useState<string>('all');
  const [query, setQuery] = useState('');

  const [previewModal, setPreviewModal] = useState<{
    org: AssistanceOrg;
    action: ContactActionType;
  } | null>(null);

  const provinces = ['all', ...Array.from(new Set(ASSISTANCE_DIRECTORY.map((o) => o.province)))];

  const filtered = ASSISTANCE_DIRECTORY.filter((org) => {
    if (category !== 'all' && org.category !== category) return false;
    if (province !== 'all' && org.province !== province) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        org.name.toLowerCase().includes(q) ||
        org.city.toLowerCase().includes(q) ||
        org.summary.toLowerCase().includes(q) ||
        org.languages.some((l) => l.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const emergencyOrg = ASSISTANCE_DIRECTORY.find(
    (o) => o.category === 'emergency_legal_protection'
  );

  return (
    <div className="space-y-6 animate-mebt-in">
      {/* Header */}
      <section className="space-y-1">
        <h1 className="font-heading text-2xl font-extrabold text-[#09234F] dark:text-[#F1F5FF]">
          {t('assistance.title')}
        </h1>
        <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4]">{t('assistance.subtitle')}</p>
      </section>

      {/* Always-Free Emergency Protection Hero */}
      {emergencyOrg && (
        <section className="mebt-card rounded-3xl bg-[#09234F] dark:bg-[#12274B] border border-transparent dark:border-[#24406E] text-white p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFB300] text-[#09234F] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#FFB300]">
                {t('assistance.emergencyBanner')}
              </p>
              <h2 className="font-heading text-lg font-bold text-white">{emergencyOrg.name}</h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                {emergencyOrg.summary}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setPreviewModal({ org: emergencyOrg, action: 'phone' })}
              className="min-h-[44px] px-4 rounded-xl bg-[#FFB300] text-[#09234F] text-xs font-bold hover:bg-[#FFC433] inline-flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Preview emergency call
            </button>
            <button
              type="button"
              onClick={() => setPreviewModal({ org: emergencyOrg, action: 'whatsapp' })}
              className="min-h-[44px] px-4 rounded-xl bg-white/15 text-white text-xs font-semibold hover:bg-white/25 inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Preview WhatsApp help
            </button>
            <button
              type="button"
              onClick={() => setPreviewModal({ org: emergencyOrg, action: 'escalation' })}
              className="min-h-[44px] px-4 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 inline-flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Escalation checklist
            </button>
          </div>
        </section>
      )}

      {/* Search & Filters */}
      <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-[#4A5D7A] dark:text-[#A9B9D4] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('assistance.searchPlaceholder')}
              aria-label={t('assistance.searchPlaceholder')}
              className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] pl-10 pr-3 text-sm text-[#09234F] dark:text-[#F1F5FF] placeholder:text-[#4A5D7A] dark:placeholder:text-[#8CA0C2]"
            />
          </div>
          <div>
            <label htmlFor="assist-province" className="sr-only">
              Filter by province
            </label>
            <select
              id="assist-province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] px-3 text-sm font-medium text-[#09234F] dark:text-[#F1F5FF]"
            >
              {provinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov === 'all' ? 'All provinces' : prov}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Organisation category filters">
          {(Object.keys(CATEGORY_LABELS) as Array<AssistanceCategory | 'all'>).map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                aria-pressed={active}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#075DEB] text-white'
                    : 'bg-[#F5F8FF] dark:bg-[#132544] border border-[#DCE6F7] dark:border-[#1E3254] text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-[#09234F] dark:hover:text-[#F1F5FF]'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </section>

      {/* Directory Cards */}
      {filtered.length === 0 ? (
        <div className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-8 text-center space-y-3">
          <p className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
            No matching directory entries
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory('all');
              setProvince('all');
              setQuery('');
            }}
            className="min-h-[44px] px-5 rounded-xl bg-[#075DEB] text-white text-sm font-semibold"
          >
            Show all entries
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((org) => (
            <article
              key={org.id}
              className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#4A5D7A] dark:text-[#A9B9D4]">
                  {CATEGORY_LABELS[org.category]} · {org.city}, {org.province}
                </p>
                <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">{org.name}</h2>
                <p className="text-xs sm:text-sm text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">{org.summary}</p>
                <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
                  <strong className="text-[#09234F] dark:text-[#F1F5FF]">Hours:</strong> {org.hoursLabel} ·{' '}
                  <strong className="text-[#09234F] dark:text-[#F1F5FF]">Languages:</strong> {org.languages.join(', ')}
                </p>
                <p className="text-[11px] font-semibold text-[#8A5300] dark:text-[#FFD166]">
                  Mock contact details · Pending directory verification · Free access
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-[#DCE6F7] dark:border-[#1E3254]">
                <button
                  type="button"
                  onClick={() => setPreviewModal({ org, action: 'phone' })}
                  className="min-h-[40px] px-3 rounded-xl bg-[#EBF2FF] dark:bg-[#162C52] text-[#075DEB] dark:text-[#6AA6FF] text-xs font-semibold hover:bg-[#DCE9FF] dark:hover:bg-[#1E3A6A] inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call preview
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModal({ org, action: 'whatsapp' })}
                  className="min-h-[40px] px-3 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-[#09234F] dark:text-[#F1F5FF] text-xs font-semibold hover:bg-[#F5F8FF] dark:hover:bg-[#132544] inline-flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#075DEB] dark:text-[#6AA6FF]" />
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModal({ org, action: 'email' })}
                  className="min-h-[40px] px-3 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-[#09234F] dark:text-[#F1F5FF] text-xs font-semibold hover:bg-[#F5F8FF] dark:hover:bg-[#132544] inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#075DEB] dark:text-[#6AA6FF]" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModal({ org, action: 'website' })}
                  className="min-h-[40px] px-3 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-[#09234F] dark:text-[#F1F5FF] text-xs font-semibold hover:bg-[#F5F8FF] dark:hover:bg-[#132544] inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#075DEB] dark:text-[#6AA6FF]" />
                  Website
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModal({ org, action: 'escalation' })}
                  className="min-h-[40px] px-3 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-[#8A5300] dark:text-[#FFD166] text-xs font-semibold hover:bg-[#FFF7E0] dark:hover:bg-[#2A210D]"
                >
                  Escalation tip
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Simulated Contact Action Modal (strictly NO real calls/messages/navigation) */}
      {previewModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#09234F]/55 dark:bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Simulated contact preview"
        >
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-6 space-y-4 animate-mebt-sheet">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#8A5300] dark:text-[#FFD166]">
                  Simulated preview · No real call or message is placed
                </p>
                <h2 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF] mt-0.5">
                  {previewModal.org.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                aria-label="Close preview"
                className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-[#4A5D7A] dark:text-[#A9B9D4] hover:bg-[#F5F8FF] dark:hover:bg-[#132544]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-[#F5F8FF] dark:bg-[#132544] border border-[#DCE6F7] dark:border-[#1E3254] p-4 space-y-2 text-sm text-[#09234F] dark:text-[#F1F5FF]">
              {previewModal.action === 'phone' && (
                <>
                  <p className="font-semibold">Simulated Phone Dial Preview</p>
                  <p className="font-mono text-base font-bold text-[#075DEB] dark:text-[#6AA6FF] tabular-nums">
                    {previewModal.org.mockPhone}
                  </p>
                  <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
                    In a verified production release, tapping Call would open your phone dialer
                    with verified helpline hours ({previewModal.org.hoursLabel}).
                  </p>
                </>
              )}
              {previewModal.action === 'whatsapp' && (
                <>
                  <p className="font-semibold">Simulated WhatsApp Message Preview</p>
                  <p className="font-mono text-sm font-bold text-[#075DEB] dark:text-[#6AA6FF]">
                    {previewModal.org.mockWhatsApp}
                  </p>
                  <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] bg-white dark:bg-[#0F1D36] rounded-xl p-3 border border-[#DCE6F7] dark:border-[#1E3254]">
                    Draft demo message: “Hello, I would like information about appointment intake
                    for an administrative documentation question. Languages preferred:{' '}
                    {previewModal.org.languages.join(', ')}.”
                  </p>
                </>
              )}
              {previewModal.action === 'email' && (
                <>
                  <p className="font-semibold">Simulated Email Preview</p>
                  <p className="font-mono text-xs font-bold text-[#075DEB] dark:text-[#6AA6FF] break-all">
                    {previewModal.org.mockEmail}
                  </p>
                  <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
                    No email is sent in prototype mode. You can prepare full written drafts inside
                    any Case’s Letters tab.
                  </p>
                </>
              )}
              {previewModal.action === 'website' && (
                <>
                  <p className="font-semibold">Simulated Website Link Preview</p>
                  <p className="font-mono text-xs font-bold text-[#075DEB] dark:text-[#6AA6FF] break-all">
                    {previewModal.org.mockWebsite}
                  </p>
                  <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
                    This is a placeholder .invalid domain so no accidental external navigation
                    occurs during testing.
                  </p>
                </>
              )}
              {previewModal.action === 'escalation' && (
                <>
                  <p className="font-semibold">Escalation Preparation Guidance</p>
                  <p className="text-xs sm:text-sm text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">
                    {previewModal.org.escalationNote}
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  showToast('Simulated contact preview acknowledged (no external action).', 'info');
                  setPreviewModal(null);
                }}
                className="min-h-[44px] px-5 rounded-xl bg-[#075DEB] text-white text-sm font-semibold hover:bg-[#0547B8]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
