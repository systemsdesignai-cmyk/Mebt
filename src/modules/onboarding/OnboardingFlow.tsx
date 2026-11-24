import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuthMethod, DocStatus } from '../../types/mebt';
import { DOC_STATUS_LABELS, SUPPORTED_LANGUAGES } from '../../i18n/translations';
import { DEMO_ACCOUNTS } from '../../data/demoDataset';
import { MebtLogo } from '../../components/MebtLogo';

const OBJECTIVE_OPTIONS = [
  { id: 'citizenship', label: 'Citizenship & naturalisation preparation' },
  { id: 'permanent_residence', label: 'Permanent residence organisation & follow-up' },
  { id: 'refugee_asylum', label: 'Refugee or asylum permit renewal tracking' },
  { id: 'complaints_followups', label: 'Follow up on a delayed application' },
  { id: 'know_your_rights', label: 'Understand my administrative rights clearly' },
  { id: 'vault_org', label: 'Keep document dates & reminders in one place' },
  { id: 'emergency_protection', label: 'Know where to find free emergency legal help' },
];

const STATUS_ORDER: DocStatus[] = [
  'citizen',
  'permanent_resident',
  'refugee',
  'asylum_seeker',
  'visa_permit',
  'expired_doc',
  'undocumented_uncertain',
  'prefer_not_to_say',
];

export const OnboardingFlow: React.FC = () => {
  const { state, setLanguage, completeOnboarding, t } = useApp();
  const [step, setStep] = useState<number>(1);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [customName, setCustomName] = useState<string>(DEMO_ACCOUNTS.phone.displayName);
  const [simulatedCode, setSimulatedCode] = useState<string>('482910');
  const [verifiedSim, setVerifiedSim] = useState<boolean>(true);
  const [docStatus, setDocStatus] = useState<DocStatus>('permanent_resident');
  const [objectives, setObjectives] = useState<string[]>([
    'citizenship',
    'complaints_followups',
    'know_your_rights',
  ]);
  const [nameError, setNameError] = useState<string>('');

  const totalSteps = 6;
  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === state.language);

  const selectAuth = (method: AuthMethod) => {
    setAuthMethod(method);
    setCustomName(DEMO_ACCOUNTS[method].displayName);
    setNameError('');
    setVerifiedSim(method === 'guest');
  };

  const toggleObjective = (id: string) => {
    setObjectives((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleContinueFromAuth = () => {
    if (authMethod !== 'guest' && !customName.trim()) {
      setNameError('Please enter a fictional display name for the demo session.');
      return;
    }
    setNameError('');
    if (authMethod === 'guest') {
      setDocStatus('prefer_not_to_say');
    }
    setStep(5);
  };

  const handleFinish = (startClean: boolean) => {
    completeOnboarding({
      authMethod,
      displayName: customName.trim() || DEMO_ACCOUNTS[authMethod].displayName,
      documentationStatus: docStatus,
      objectives: objectives.length > 0 ? objectives : ['know_your_rights'],
      startClean,
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F8FF] dark:bg-[#081224] text-[#09234F] dark:text-[#F1F5FF] flex flex-col justify-between px-4 py-6 sm:py-10">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Progress bar & Demo notice */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
            <span className="font-semibold text-[#075DEB] dark:text-[#6AA6FF] tabular-nums">
              MEBT · መብት — Step {step} of {totalSteps}
            </span>
            <button
              type="button"
              onClick={() => handleFinish(false)}
              className="min-h-[36px] px-2 font-semibold text-[#075DEB] dark:text-[#6AA6FF] hover:underline"
            >
              {t('onboarding.skip')}
            </button>
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i + 1 <= step ? 'bg-[#075DEB] dark:bg-[#4D8EFF]' : 'bg-[#DCE6F7] dark:bg-[#1E3254]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="mebt-card bg-white dark:bg-[#0F1D36] rounded-3xl border border-[#DCE6F7] dark:border-[#1E3254] p-6 sm:p-8 space-y-6 animate-mebt-in">
          {/* STEP 1: Branded Welcome */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex justify-center pt-2">
                <MebtLogo size="lg" stacked />
              </div>

              <div className="text-center space-y-3 max-w-lg mx-auto">
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#09234F] dark:text-[#F1F5FF] leading-tight">
                  {t('onboarding.welcomeTitle')}
                </h1>
                <p className="text-sm sm:text-base text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">
                  {t('onboarding.welcomeBody')}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F5F8FF] dark:bg-[#132544] border border-[#DCE6F7] dark:border-[#1E3254] p-4 text-xs sm:text-sm text-[#4A5D7A] dark:text-[#A9B9D4] space-y-1.5">
                <p className="font-semibold text-[#09234F] dark:text-[#F1F5FF]">{t('demo.banner')}</p>
                <p>{t('demo.notLegalAdvice')}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="min-h-[48px] flex-1 rounded-2xl bg-[#075DEB] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0547B8] transition-colors inline-flex items-center justify-center gap-2"
                >
                  {t('onboarding.continue')}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    completeOnboarding({
                      authMethod: 'guest',
                      documentationStatus: 'prefer_not_to_say',
                      objectives: ['know_your_rights'],
                      startClean: false,
                    })
                  }
                  className="min-h-[48px] rounded-2xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-5 py-3 text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#F5F8FF] dark:hover:bg-[#1B335C] transition-colors"
                >
                  {t('onboarding.guestBtn')}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Language Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF]">
                  <Globe className="w-4 h-4" />
                  <span>English · አማርኛ · ትግርኛ</span>
                </div>
                <h2 className="font-heading text-2xl font-bold text-[#09234F] dark:text-[#F1F5FF]">
                  {t('onboarding.chooseLang')}
                </h2>
                <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4]">
                  You can switch languages anytime from the top bar or your profile settings.
                </p>
              </div>

              <div className="grid gap-3">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const selected = state.language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`min-h-[60px] w-full text-left rounded-2xl border p-4 flex items-center justify-between gap-4 transition-colors ${
                        selected
                          ? 'border-[#075DEB] bg-[#EBF2FF]/60 dark:bg-[#162C52]'
                          : 'border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] hover:bg-[#F5F8FF] dark:hover:bg-[#1B335C]'
                      }`}
                    >
                      <div>
                        <p className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
                          {lang.nativeName}
                        </p>
                        <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
                          {lang.englishName}
                          {lang.reviewNotice ? ' · Pending native review' : ''}
                        </p>
                      </div>
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                          selected
                            ? 'bg-[#075DEB] border-[#075DEB] text-white'
                            : 'border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#0F1D36]'
                        }`}
                      >
                        {selected && <Check className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {currentLangMeta?.reviewNotice && (
                <p className="text-xs font-medium text-[#8A5300] dark:text-[#FFD166] bg-[#FFF7E0] dark:bg-[#2A210D] border border-[#FFB300]/40 rounded-xl p-3">
                  {currentLangMeta.reviewNotice}
                </p>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('onboarding.back')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="min-h-[44px] px-6 rounded-xl bg-[#075DEB] text-sm font-semibold text-white hover:bg-[#0547B8] inline-flex items-center gap-1.5"
                >
                  {t('onboarding.continue')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Value Overview */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-bold text-[#09234F] dark:text-[#F1F5FF]">
                  {t('onboarding.howItHelps')}
                </h2>
                <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4]">
                  Designed for clarity, calm preparation, and independence—without legal jargon.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    icon: ClipboardCheck,
                    title: 'Step-by-step case organisation',
                    body: 'Know what to prepare, what is blocking progress, and what single action to take next.',
                  },
                  {
                    icon: FileText,
                    title: 'Editable follow-up letters & case summaries',
                    body: 'Draft polite written inquiries and export a clean timeline before calling offices or clinics.',
                  },
                  {
                    icon: BookOpen,
                    title: 'Free Know Your Rights & Emergency Help',
                    body: 'Essential rights guidance and emergency legal contacts stay accessible outside any paywall.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Honest boundaries & privacy-first demo',
                    body: 'Everything here stays locally in your browser using fictional examples. No real uploads or AI tracking.',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-3.5 rounded-2xl bg-[#F5F8FF] dark:bg-[#132544] p-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] flex items-center justify-center text-[#075DEB] dark:text-[#6AA6FF] shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="font-heading text-sm font-bold text-[#09234F] dark:text-[#F1F5FF]">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('onboarding.back')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="min-h-[44px] px-6 rounded-xl bg-[#075DEB] text-sm font-semibold text-white hover:bg-[#0547B8] inline-flex items-center gap-1.5"
                >
                  {t('onboarding.continue')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Guest or Simulated Registration */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <h2 className="font-heading text-2xl font-bold text-[#09234F] dark:text-[#F1F5FF]">
                  {t('onboarding.accessTitle')}
                </h2>
                <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">
                  {t('onboarding.accessSubtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'phone' as AuthMethod,
                    label: 'Simulated Phone Sign-In',
                    sub: '+27 00 555 0101 (Fictional)',
                    icon: Phone,
                  },
                  {
                    id: 'email' as AuthMethod,
                    label: 'Simulated Email Sign-In',
                    sub: 'dawit.demo@example.invalid',
                    icon: Mail,
                  },
                  {
                    id: 'google' as AuthMethod,
                    label: 'Simulated Google Sign-In',
                    sub: 'hanna.demo@example.invalid',
                    icon: UserCheck,
                  },
                  {
                    id: 'guest' as AuthMethod,
                    label: t('onboarding.guestBtn'),
                    sub: 'Browse public content only',
                    icon: BookOpen,
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = authMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => selectAuth(opt.id)}
                      className={`min-h-[68px] text-left rounded-2xl border p-3.5 flex items-start gap-3 transition-colors ${
                        active
                          ? 'border-[#075DEB] bg-[#EBF2FF]/60 dark:bg-[#162C52]'
                          : 'border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] hover:bg-[#F5F8FF] dark:hover:bg-[#1B335C]'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          active ? 'bg-[#075DEB] text-white' : 'bg-[#F5F8FF] dark:bg-[#0F1D36] text-[#075DEB] dark:text-[#6AA6FF]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF]">{opt.label}</p>
                        <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] truncate">{opt.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {authMethod !== 'guest' ? (
                <div className="rounded-2xl bg-[#F5F8FF] dark:bg-[#132544] border border-[#DCE6F7] dark:border-[#1E3254] p-4 space-y-3">
                  <div>
                    <label
                      htmlFor="demo-display-name"
                      className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1.5"
                    >
                      Fictional demo display name (do not use your real full name)
                    </label>
                    <input
                      id="demo-display-name"
                      type="text"
                      value={customName}
                      onChange={(e) => {
                        setCustomName(e.target.value);
                        setNameError('');
                      }}
                      placeholder="e.g., Selamawit T. (Demo)"
                      className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#0F1D36] px-3.5 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                    />
                    {nameError && (
                      <p role="alert" className="mt-1.5 text-xs font-medium text-red-700 dark:text-red-400">
                        {nameError}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
                      Simulated verification code:{' '}
                      <span className="font-mono font-bold text-[#09234F] dark:text-[#F1F5FF] tabular-nums">
                        {simulatedCode}
                      </span>{' '}
                      (demo only)
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSimulatedCode(String(100000 + Math.floor(Math.random() * 899999)));
                        setVerifiedSim(true);
                      }}
                      className="min-h-[40px] px-3 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#0F1D36] text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF] hover:bg-[#EBF2FF] dark:hover:bg-[#1B335C]"
                    >
                      {verifiedSim ? 'Verified (Simulated)' : 'Verify demo code'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-[#FFF7E0] dark:bg-[#2A210D] border border-[#FFB300]/40 p-4 text-xs sm:text-sm text-[#09234F] dark:text-[#F1F5FF]">
                  {t('onboarding.guestHint')}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('onboarding.back')}
                </button>
                <button
                  type="button"
                  onClick={handleContinueFromAuth}
                  className="min-h-[44px] px-6 rounded-xl bg-[#075DEB] text-sm font-semibold text-white hover:bg-[#0547B8] inline-flex items-center gap-1.5"
                >
                  {t('onboarding.continue')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Optional Documentation Status */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <h2 className="font-heading text-2xl font-bold text-[#09234F] dark:text-[#F1F5FF]">
                  {t('onboarding.statusTitle')}
                </h2>
                <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">
                  {t('onboarding.statusSubtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {STATUS_ORDER.map((status) => {
                  const selected = docStatus === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setDocStatus(status)}
                      className={`min-h-[48px] text-left rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-2 text-sm font-medium transition-colors ${
                        selected
                          ? 'border-[#075DEB] bg-[#EBF2FF]/70 dark:bg-[#162C52] text-[#09234F] dark:text-[#F1F5FF] font-semibold'
                          : 'border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] text-[#4A5D7A] dark:text-[#A9B9D4] hover:bg-[#F5F8FF] dark:hover:bg-[#1B335C]'
                      }`}
                    >
                      <span>{DOC_STATUS_LABELS[state.language][status]}</span>
                      {selected && <Check className="w-4 h-4 text-[#075DEB] dark:text-[#6AA6FF] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('onboarding.back')}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDocStatus('prefer_not_to_say');
                      setStep(6);
                    }}
                    className="min-h-[44px] px-4 rounded-xl text-sm font-semibold text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-[#09234F] dark:hover:text-[#F1F5FF]"
                  >
                    {t('onboarding.skip')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(6)}
                    className="min-h-[44px] px-6 rounded-xl bg-[#075DEB] text-sm font-semibold text-white hover:bg-[#0547B8] inline-flex items-center gap-1.5"
                  >
                    {t('onboarding.continue')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Administrative Objectives & Launch */}
          {step === 6 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <h2 className="font-heading text-2xl font-bold text-[#09234F] dark:text-[#F1F5FF]">
                  {t('onboarding.goalsTitle')}
                </h2>
                <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4]">{t('onboarding.goalsSubtitle')}</p>
              </div>

              <div className="space-y-2.5">
                {OBJECTIVE_OPTIONS.map((goal) => {
                  const active = objectives.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleObjective(goal.id)}
                      className={`min-h-[48px] w-full text-left rounded-xl border px-4 py-3 flex items-center justify-between gap-3 text-sm transition-colors ${
                        active
                          ? 'border-[#075DEB] bg-[#EBF2FF]/70 dark:bg-[#162C52] font-semibold text-[#09234F] dark:text-[#F1F5FF]'
                          : 'border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] text-[#4A5D7A] dark:text-[#A9B9D4] hover:bg-[#F5F8FF] dark:hover:bg-[#1B335C]'
                      }`}
                    >
                      <span>{goal.label}</span>
                      <span
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                          active
                            ? 'bg-[#075DEB] border-[#075DEB] text-white'
                            : 'border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#0F1D36]'
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleFinish(false)}
                  className="w-full min-h-[48px] rounded-2xl bg-[#075DEB] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0547B8] transition-colors inline-flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t('onboarding.startPopulated')}
                </button>
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t('onboarding.back')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFinish(true)}
                    className="min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#F5F8FF] dark:hover:bg-[#1B335C]"
                  >
                    {t('onboarding.startClean')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-[#4A5D7A] dark:text-[#A9B9D4] pt-6">
        MEBT (መብት) Prototype · Fictional demonstration environment · Zero external data transmission
      </footer>
    </div>
  );
};
