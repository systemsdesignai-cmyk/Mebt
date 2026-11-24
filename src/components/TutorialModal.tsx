import React from 'react';
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  FolderLock,
  LifeBuoy,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const STEPS = [
  {
    icon: Sparkles,
    title: '1. Start with your Next Recommended Action',
    body: 'Home uses clear rules—never guesswork—to surface your most urgent target date, overdue follow-up, or unresolved blocker first. You can postpone or dismiss any suggestion.',
  },
  {
    icon: Briefcase,
    title: '2. Organise cases with step-by-step checklists',
    body: 'Track fictional Citizenship, Permanent Residence, or Refugee & Asylum journeys. Completing a step updates your checklist progress, timeline, and dashboard automatically.',
  },
  {
    icon: BookOpen,
    title: '3. Know Your Rights & Emergency Help are always free',
    body: 'Filter plain-language rights guides by documentation status, listen to simulated audio walkthroughs, or open the Assistance & Emergency Centre anytime.',
  },
  {
    icon: FolderLock,
    title: '4. Track fictional document dates safely',
    body: 'Record sample permit metadata and expiry dates in the Demo Vault so MEBT alerts you early. Never enter real ID numbers or upload real files in this prototype.',
  },
  {
    icon: LifeBuoy,
    title: '5. Draft letters & export case summaries',
    body: 'Turn your timeline into polite editable follow-up letters or a clean one-page case report before calling an office or visiting a legal clinic.',
  },
];

export const TutorialModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { state, setTutorialState } = useApp();
  if (!isOpen) return null;

  const stepIndex = Math.min(Math.max(state.user.tutorialStep, 0), STEPS.length - 1);
  const current = STEPS[stepIndex];
  const Icon = current.icon;

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setTutorialState(stepIndex + 1, false);
    } else {
      setTutorialState(0, true);
      onClose();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setTutorialState(stepIndex - 1, false);
    }
  };

  const handleDismiss = () => {
    setTutorialState(stepIndex, true);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#09234F]/55 dark:bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="MEBT Interactive Tutorial"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-6 animate-mebt-sheet space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF] tabular-nums">
            Quick Guide · Step {stepIndex + 1} of {STEPS.length}
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss tutorial"
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-[#4A5D7A] dark:text-[#A9B9D4] hover:bg-[#F5F8FF] dark:hover:bg-[#132544]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EBF2FF] dark:bg-[#162C52] text-[#075DEB] dark:text-[#6AA6FF] flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF]">{current.title}</h2>
            <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">{current.body}</p>
          </div>
        </div>

        {/* Step progress bar */}
        <div className="flex gap-1.5" aria-hidden="true">
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                idx <= stepIndex ? 'bg-[#075DEB] dark:bg-[#4D8EFF]' : 'bg-[#DCE6F7] dark:bg-[#1E3254]'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={stepIndex === 0 ? handleDismiss : handleBack}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#F5F8FF] dark:hover:bg-[#132544]"
          >
            {stepIndex === 0 ? 'Skip for now' : 'Back'}
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#075DEB] text-sm font-semibold text-white hover:bg-[#0547B8] inline-flex items-center gap-2"
          >
            {stepIndex === STEPS.length - 1 ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Finish guide
              </>
            ) : (
              'Next tip'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
