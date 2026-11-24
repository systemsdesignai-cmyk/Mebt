import React, { useState } from 'react';
import {
  Bell,
  BookOpen,
  Briefcase,
  FolderLock,
  Globe,
  Home,
  LifeBuoy,
  Moon,
  Sparkles,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LanguageCode, TabRoute } from '../types/mebt';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { MebtLogo } from './MebtLogo';
import { OfflineIndicator } from './PWAInstallControls';
import { TutorialModal } from './TutorialModal';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    state,
    activeTab,
    setActiveTab,
    setSelectedCaseId,
    setLanguage,
    toggleTheme,
    unreadNotificationCount,
    toast,
    dismissToast,
    clearMilestone,
    t,
  } = useApp();

  const [tutorialOpen, setTutorialOpen] = useState(false);
  const isDark = state.accessibility.theme === 'dark';

  const primaryTabs: Array<{ id: TabRoute; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'cases', label: t('nav.cases'), icon: Briefcase },
    { id: 'rights', label: t('nav.rights'), icon: BookOpen },
    { id: 'vault', label: t('nav.vault'), icon: FolderLock },
    { id: 'profile', label: t('nav.profile'), icon: User },
  ];

  const handleNav = (tab: TabRoute) => {
    if (tab !== 'cases') {
      setSelectedCaseId(null);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: state.accessibility.reducedMotion ? 'auto' : 'smooth' });
  };

  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === state.language);

  return (
    <div className="min-h-screen bg-[#F5F8FF] dark:bg-[#081224] text-[#09234F] dark:text-[#F1F5FF] flex flex-col lg:flex-row transition-colors duration-150">
      {/* Desktop Sidebar (lg and up) */}
      <aside
        aria-label="Primary navigation"
        className="hidden lg:flex lg:flex-col lg:w-68 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen bg-white dark:bg-[#0F1D36] border-r border-[#DCE6F7] dark:border-[#1E3254] px-5 py-6 justify-between"
      >
        <div className="space-y-7">
          <button
            type="button"
            onClick={() => handleNav('home')}
            className="flex items-center text-left rounded-2xl focus-visible:outline-2"
            aria-label="MEBT Home"
          >
            <MebtLogo size="md" showWordmark />
          </button>

          <nav className="space-y-1.5">
            {primaryTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#EBF2FF] dark:bg-[#162C52] text-[#075DEB] dark:text-[#6AA6FF]'
                      : 'text-[#4A5D7A] dark:text-[#A9B9D4] hover:bg-[#F5F8FF] dark:hover:bg-[#132544] hover:text-[#09234F] dark:hover:text-[#F1F5FF]'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="my-3 border-t border-[#DCE6F7] dark:border-[#1E3254]" />

            <button
              type="button"
              onClick={() => handleNav('assistance')}
              aria-current={activeTab === 'assistance' ? 'page' : undefined}
              className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'assistance'
                  ? 'bg-[#EBF2FF] dark:bg-[#162C52] text-[#075DEB] dark:text-[#6AA6FF]'
                  : 'text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#F5F8FF] dark:hover:bg-[#132544]'
              }`}
            >
              <LifeBuoy className="w-5 h-5 shrink-0 text-[#075DEB] dark:text-[#6AA6FF]" />
              <span>{t('nav.assistance')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('notifications')}
              aria-current={activeTab === 'notifications' ? 'page' : undefined}
              className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'bg-[#EBF2FF] dark:bg-[#162C52] text-[#075DEB] dark:text-[#6AA6FF]'
                  : 'text-[#4A5D7A] dark:text-[#A9B9D4] hover:bg-[#F5F8FF] dark:hover:bg-[#132544] hover:text-[#09234F] dark:hover:text-[#F1F5FF]'
              }`}
            >
              <span className="flex items-center gap-3">
                <Bell className="w-5 h-5 shrink-0" />
                <span>{t('nav.notifications')}</span>
              </span>
              {unreadNotificationCount > 0 && (
                <span className="text-xs font-bold tabular-nums text-[#075DEB] dark:text-[#6AA6FF]">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="space-y-3 border-t border-[#DCE6F7] dark:border-[#1E3254] pt-4">
          {/* Desktop Theme Switcher — placed cleanly in sidebar utilities rather than clustering top bar */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? t('theme.light') : t('theme.dark')}
            className="w-full min-h-[42px] px-3 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#EBF2FF] dark:hover:bg-[#1B335C] flex items-center justify-between gap-2 transition-colors"
          >
            <span className="inline-flex items-center gap-2">
              {isDark ? (
                <Sun className="w-4 h-4 text-[#FFB300]" />
              ) : (
                <Moon className="w-4 h-4 text-[#075DEB]" />
              )}
              <span>{isDark ? t('theme.light') : t('theme.dark')}</span>
            </span>
          </button>

          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="desktop-lang-select"
              className="text-xs font-medium text-[#4A5D7A] dark:text-[#A9B9D4] flex items-center gap-1.5"
            >
              <Globe className="w-4 h-4 text-[#075DEB] dark:text-[#6AA6FF]" />
              {t('profile.language')}
            </label>
            <select
              id="desktop-lang-select"
              value={state.language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="min-h-[40px] rounded-lg border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] px-2.5 py-1 text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF]"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] leading-relaxed text-[#4A5D7A] dark:text-[#A9B9D4]">
            {t('demo.banner')}
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Compact Mobile & Desktop Top Bar (keeps mobile sticky height compact <= 15%) */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0F1D36]/95 backdrop-blur-md border-b border-[#DCE6F7] dark:border-[#1E3254] h-14 px-4 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => handleNav('home')}
              className="lg:hidden flex items-center shrink-0"
              aria-label="MEBT Home"
            >
              <MebtLogo size="sm" showWordmark />
            </button>
            <p className="hidden lg:block text-xs text-[#4A5D7A] dark:text-[#A9B9D4] truncate">
              {t('demo.banner')}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Compact Language Selector on Mobile/Tablet */}
            <label className="sr-only" htmlFor="mobile-lang-select">
              {t('profile.language')}
            </label>
            <select
              id="mobile-lang-select"
              value={state.language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              aria-label={t('profile.language')}
              className="lg:hidden min-h-[40px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] px-2 text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF]"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </option>
              ))}
            </select>

            {/* Dark/Light Mode Toggle — spacious touch target on mobile; subtle icon button on desktop top bar */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? t('theme.light') : t('theme.dark')}
              title={isDark ? t('theme.light') : t('theme.dark')}
              className="lg:hidden min-h-[44px] min-w-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] flex items-center justify-center text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#EBF2FF] dark:hover:bg-[#1B335C] transition-colors shrink-0"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[#FFB300]" />
              ) : (
                <Moon className="w-4 h-4 text-[#075DEB]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNav('assistance')}
              className={`min-h-[44px] px-3 rounded-xl inline-flex items-center gap-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'assistance'
                  ? 'bg-[#075DEB] text-white'
                  : 'bg-[#EBF2FF] dark:bg-[#162C52] text-[#075DEB] dark:text-[#6AA6FF] hover:bg-[#DCE9FF] dark:hover:bg-[#1E3A6A]'
              }`}
            >
              <LifeBuoy className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{t('nav.assistance')}</span>
              <span className="sm:hidden">Help</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('notifications')}
              aria-label={`${t('nav.notifications')} (${unreadNotificationCount} unread)`}
              className={`relative min-h-[44px] min-w-[44px] px-2.5 rounded-xl inline-flex items-center justify-center gap-1 text-xs font-semibold transition-colors shrink-0 ${
                activeTab === 'notifications'
                  ? 'bg-[#075DEB] text-white'
                  : 'text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#F5F8FF] dark:hover:bg-[#132544]'
              }`}
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="text-[11px] font-bold tabular-nums">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Workspace Content */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-24 lg:pb-10 space-y-5">
          {/* Non-sticky contextual notices (demo + native translation review) */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4A5D7A] dark:text-[#A9B9D4] border-b border-[#DCE6F7]/80 dark:border-[#1E3254] pb-3">
            <span className="lg:hidden">{t('demo.banner')}</span>
            <span className="hidden lg:inline">{t('demo.notLegalAdvice')}</span>
            <div className="flex items-center gap-3">
              {currentLangMeta?.reviewNotice && (
                <span className="font-medium text-[#8A5300] dark:text-[#FFD166]">
                  {currentLangMeta.reviewNotice}
                </span>
              )}
              <button
                type="button"
                onClick={() => setTutorialOpen(true)}
                className="text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF] hover:underline whitespace-nowrap"
              >
                {t('profile.openTutorial')}
              </button>
            </div>
          </div>

          {/* Restrained positive reinforcement milestone banner */}
          {state.lastMilestoneMessage && (
            <div
              role="status"
              className="mebt-card rounded-2xl bg-[#FFF7E0] dark:bg-[#2A210D] border border-[#FFB300]/50 px-4 py-3 flex items-center justify-between gap-3 animate-mebt-in"
            >
              <div className="flex items-center gap-2.5 text-sm text-[#09234F] dark:text-[#F1F5FF]">
                <Sparkles className="w-4 h-4 text-[#8A5300] dark:text-[#FFB300] shrink-0" />
                <span className="font-medium">{state.lastMilestoneMessage}</span>
              </div>
              <button
                type="button"
                onClick={clearMilestone}
                aria-label="Dismiss milestone message"
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#8A5300] dark:text-[#FFB300] hover:bg-[#FFB300]/15"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {children}
        </main>
      </div>

      {/* Mobile Fixed 5-Tab Bottom Navigation */}
      <nav
        aria-label="Bottom navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F1D36]/95 backdrop-blur-md border-t border-[#DCE6F7] dark:border-[#1E3254] pb-safe"
      >
        <div className="grid grid-cols-5 h-16 max-w-xl mx-auto">
          {primaryTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? 'text-[#075DEB] dark:text-[#6AA6FF]'
                    : 'text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-[#09234F] dark:hover:text-[#F1F5FF]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-semibold leading-none truncate max-w-[68px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Interactive Toast with optional Undo */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 lg:bottom-6 right-4 left-4 sm:left-auto sm:max-w-md z-50 rounded-2xl bg-[#09234F] dark:bg-[#162C52] border border-transparent dark:border-[#2C4B80] text-white px-4 py-3 shadow-lg flex items-center justify-between gap-3 animate-mebt-in"
        >
          <span className="text-sm font-medium leading-snug">{toast.message}</span>
          <div className="flex items-center gap-2 shrink-0">
            {toast.undoAction && (
              <button
                type="button"
                onClick={() => {
                  toast.undoAction?.();
                  dismissToast();
                }}
                className="min-h-[36px] px-2.5 rounded-lg bg-[#FFB300] text-[#09234F] text-xs font-bold hover:bg-[#FFC433]"
              >
                {t('common.undo')}
              </button>
            )}
            <button
              type="button"
              onClick={dismissToast}
              aria-label="Close notification"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <OfflineIndicator label={t('common.offlineBanner')} />
      <TutorialModal isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </div>
  );
};
