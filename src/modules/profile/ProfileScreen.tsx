import React, { useState } from 'react';
import {
  Check,
  Crown,
  Eye,
  Globe,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuthMethod, DocStatus, LanguageCode } from '../../types/mebt';
import { DOC_STATUS_LABELS, SUPPORTED_LANGUAGES } from '../../i18n/translations';
import { PWAInstallButton } from '../../components/PWAInstallControls';
import { TutorialModal } from '../../components/TutorialModal';

const STATUS_OPTIONS: DocStatus[] = [
  'citizen',
  'permanent_resident',
  'refugee',
  'asylum_seeker',
  'visa_permit',
  'expired_doc',
  'undocumented_uncertain',
  'prefer_not_to_say',
];

export const ProfileScreen: React.FC = () => {
  const {
    state,
    setLanguage,
    updateAccessibility,
    updateDocStatus,
    switchAuthMode,
    togglePremiumPreview,
    resetDemoData,
    loadEmptyWorkspace,
    replayOnboarding,
    setActiveTab,
    t,
  } = useApp();

  const [confirmReset, setConfirmReset] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  return (
    <div className="space-y-6 animate-mebt-in">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-[#09234F] dark:text-[#F1F5FF]">
            {t('profile.title')}
          </h1>
          <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4] mt-0.5">
            Manage fictional demo identity, language, accessibility, premium preview, and reset
            controls.
          </p>
        </div>
        <PWAInstallButton />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Fictional Account Identity Card */}
          <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF2FF] dark:bg-[#162C52] text-[#075DEB] dark:text-[#6AA6FF] flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF]">
                    {state.user.displayName}
                  </h2>
                  <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
                    {state.user.contactLabel} · Mode: {state.user.authMethod}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#4A5D7A] dark:text-[#A9B9D4]">
                Switch simulated session (no real authentication):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['phone', 'email', 'google', 'guest'] as AuthMethod[]).map((method) => {
                  const active = state.user.authMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => switchAuthMode(method)}
                      className={`min-h-[42px] rounded-xl border px-3 text-xs font-semibold capitalize transition-colors ${
                        active
                          ? 'border-[#075DEB] bg-[#075DEB] text-white'
                          : 'border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#EBF2FF] dark:hover:bg-[#1B335C]'
                      }`}
                    >
                      {method === 'guest' ? 'Guest mode' : `${method} demo`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-[#DCE6F7] dark:border-[#1E3254]">
              <label
                htmlFor="profile-doc-status"
                className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1.5"
              >
                Optional demonstration documentation status (never required)
              </label>
              <select
                id="profile-doc-status"
                value={state.user.documentationStatus}
                onChange={(e) => updateDocStatus(e.target.value as DocStatus)}
                className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] px-3 text-sm font-medium text-[#09234F] dark:text-[#F1F5FF]"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {DOC_STATUS_LABELS[state.language][st]}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Language Settings */}
          <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#075DEB] dark:text-[#6AA6FF]" />
              <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
                {t('profile.language')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const selected = state.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code as LanguageCode)}
                    className={`min-h-[56px] rounded-2xl border p-3 text-left flex items-center justify-between transition-colors ${
                      selected
                        ? 'border-[#075DEB] bg-[#EBF2FF]/70 dark:bg-[#162C52]'
                        : 'border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] hover:bg-[#F5F8FF] dark:hover:bg-[#1B335C]'
                    }`}
                  >
                    <div>
                      <p className="font-heading text-sm font-bold text-[#09234F] dark:text-[#F1F5FF]">
                        {lang.nativeName}
                      </p>
                      <p className="text-[11px] text-[#4A5D7A] dark:text-[#A9B9D4]">{lang.englishName}</p>
                    </div>
                    {selected && <Check className="w-4 h-4 text-[#075DEB] dark:text-[#6AA6FF]" />}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[#8A5300] dark:text-[#FFD166]">
              Amharic (አማርኛ) and Tigrinya (ትግርኛ) translations cover the core interface and are
              labelled pending native-language review.
            </p>
          </section>

          {/* Accessibility Preferences */}
          <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#075DEB] dark:text-[#6AA6FF]" />
              <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
                {t('profile.accessibility')}
              </h2>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF]">Text size</p>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'standard', label: 'Standard (16px)' },
                    { id: 'large', label: 'Large (18px)' },
                    { id: 'xlarge', label: 'Extra Large (20px)' },
                  ] as const
                ).map((opt) => {
                  const active = state.accessibility.textScale === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateAccessibility({ textScale: opt.id })}
                      className={`min-h-[44px] rounded-xl border px-3 text-xs font-semibold transition-colors ${
                        active
                          ? 'border-[#075DEB] bg-[#075DEB] text-white'
                          : 'border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] text-[#09234F] dark:text-[#F1F5FF]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="divide-y divide-[#DCE6F7] dark:divide-[#1E3254]">
              {[
                {
                  key: 'highContrast' as const,
                  label: 'High-contrast borders & text',
                  desc: 'Increases surface border definition and text contrast for outdoor legibility.',
                },
                {
                  key: 'reducedMotion' as const,
                  label: 'Reduce interface motion',
                  desc: 'Disables transition and card entrance animations immediately.',
                },
                {
                  key: 'simplifiedGuidance' as const,
                  label: 'Always expand plain-language guidance',
                  desc: 'Automatically opens “Why this matters” hints on checklists for lower-literacy support.',
                },
              ].map((item) => {
                const enabled = state.accessibility[item.key];
                return (
                  <div
                    key={item.key}
                    className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF]">{item.label}</p>
                      <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={item.label}
                      onClick={() => updateAccessibility({ [item.key]: !enabled })}
                      className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 ${
                        enabled ? 'bg-[#075DEB]' : 'bg-[#DCE6F7] dark:bg-[#1E3254]'
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                          enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right column: Premium Preview + Privacy + Demo Reset */}
        <div className="lg:col-span-5 space-y-6">
          {/* Premium Feature Preview (Zero Checkout / Zero Pricing) */}
          <section className="mebt-card rounded-3xl bg-[#09234F] dark:bg-[#12274B] border border-transparent dark:border-[#24406E] text-white p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#FFB300] inline-flex items-center gap-1.5">
                  <Crown className="w-4 h-4" />
                  {t('profile.premiumTitle')}
                </p>
                <h2 className="font-heading text-lg font-bold text-white">
                  Explore Free vs. Proposed Premium
                </h2>
              </div>
            </div>

            <p className="text-xs text-white/80 leading-relaxed">
              No payment, subscription, or pricing commitment exists in this prototype. Toggle
              Premium Preview below to test proposed advanced workflow concepts during user
              interviews.
            </p>

            <div className="space-y-2.5 text-xs bg-white/10 rounded-2xl p-4">
              <p className="font-bold text-[#FFB300]">Always Free (Never Paywalled):</p>
              <ul className="list-disc pl-4 space-y-1 text-white/90">
                <li>Know Your Rights plain-language library &amp; audio demos</li>
                <li>Emergency Legal Protection &amp; Assistance Directory</li>
                <li>Introductory administrative guidance &amp; guest browsing</li>
              </ul>

              <p className="font-bold text-[#FFB300] pt-2">Proposed Premium Preview Concepts:</p>
              <ul className="list-disc pl-4 space-y-1 text-white/90">
                <li>Multi-case organisation &amp; automated follow-up planner</li>
                <li>Editable correspondence studio &amp; case report exports</li>
                <li>Document vault expiry tracking &amp; missing-document checks</li>
              </ul>
            </div>

            <div className="flex items-center justify-between gap-3 bg-white/10 rounded-2xl p-3.5">
              <div>
                <p className="text-sm font-bold text-white">Premium Preview Mode</p>
                <p className="text-xs text-white/75">
                  {state.user.premiumPreviewEnabled ? 'Active (Demo toggle)' : 'Viewing Free tier'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={state.user.premiumPreviewEnabled}
                aria-label="Toggle Premium Preview Mode"
                onClick={() => togglePremiumPreview(!state.user.premiumPreviewEnabled)}
                className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 ${
                  state.user.premiumPreviewEnabled ? 'bg-[#FFB300]' : 'bg-white/25'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                    state.user.premiumPreviewEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Privacy & Demo Controls */}
          <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#075DEB] dark:text-[#6AA6FF]" />
              <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
                Privacy &amp; Demo Workspace Controls
              </h2>
            </div>

            <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">
              MEBT prototype runs 100% locally in your browser using fictional data. Zero analytics,
              zero paid AI APIs, zero external transmission. Production authentication, encrypted
              storage, and POPIA compliance review are deferred to the verified release.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setTutorialOpen(true)}
                className="w-full min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#EBF2FF] dark:hover:bg-[#1B335C] inline-flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-[#075DEB] dark:text-[#6AA6FF]" />
                {t('profile.openTutorial')}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className="w-full min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#0F1D36] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#F5F8FF] dark:hover:bg-[#132544] inline-flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#075DEB] dark:text-[#6AA6FF]" />
                Notification preferences
              </button>

              <button
                type="button"
                onClick={replayOnboarding}
                className="w-full min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#0F1D36] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#F5F8FF] dark:hover:bg-[#132544]"
              >
                {t('profile.replayOnboarding')}
              </button>

              <button
                type="button"
                onClick={loadEmptyWorkspace}
                className="w-full min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#0F1D36] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#F5F8FF] dark:hover:bg-[#132544] inline-flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4 text-[#4A5D7A] dark:text-[#A9B9D4]" />
                {t('profile.emptyState')}
              </button>

              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full min-h-[44px] px-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/35 text-sm font-semibold text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/55 inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {t('profile.resetDemo')}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Confirm Demo Reset Modal */}
      {confirmReset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#09234F]/55 dark:bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Reset demonstration environment"
        >
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-6 space-y-4 animate-mebt-sheet">
            <h3 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF]">
              Reset demonstration environment?
            </h3>
            <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4]">
              This clears your local browser demo changes and restores the original fictional cases,
              sample vault records, and simulated reminders.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF]"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmReset(false);
                  resetDemoData();
                }}
                className="min-h-[44px] px-5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
              >
                Reset now
              </button>
            </div>
          </div>
        </div>
      )}

      <TutorialModal isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </div>
  );
};
