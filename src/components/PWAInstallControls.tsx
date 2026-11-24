import React, { useEffect, useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    install,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return isOnline;
}

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-[#075DEB] text-white font-semibold hover:bg-[#0547B8] transition-colors whitespace-nowrap shrink-0 ${
          compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'
        }`}
      >
        <Download className="w-4 h-4" />
        Install MEBT App
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowGuide(true)}
        className={`inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#0F1D36] text-[#09234F] dark:text-[#F1F5FF] font-semibold hover:bg-[#F5F8FF] dark:hover:bg-[#132544] transition-colors whitespace-nowrap shrink-0 ${
          compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'
        }`}
      >
        <Smartphone className="w-4 h-4 text-[#075DEB] dark:text-[#6AA6FF]" />
        {isIOS ? 'Install on iPhone / iPad' : 'Install as App (PWA)'}
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#09234F]/50 dark:bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Install MEBT Progressive Web App"
        >
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0F1D36] p-6 border border-[#DCE6F7] dark:border-[#1E3254] animate-mebt-sheet space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF]">
                Add MEBT to your Home Screen
              </h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close install instructions"
                className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-[#4A5D7A] dark:text-[#A9B9D4] hover:bg-[#F5F8FF] dark:hover:bg-[#132544]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {isIOS ? (
              <ol className="space-y-2.5 text-sm text-[#4A5D7A] dark:text-[#A9B9D4] list-decimal pl-5 leading-relaxed">
                <li>
                  Tap the <strong className="text-[#09234F] dark:text-[#F1F5FF]">Share</strong> icon in the Safari
                  toolbar.
                </li>
                <li>
                  Scroll down and select{' '}
                  <strong className="text-[#09234F] dark:text-[#F1F5FF]">Add to Home Screen</strong>.
                </li>
                <li>
                  Tap <strong className="text-[#09234F] dark:text-[#F1F5FF]">Add</strong> to launch MEBT like a native
                  app.
                </li>
              </ol>
            ) : (
              <div className="space-y-2.5 text-sm text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">
                <p>
                  MEBT includes a Web App Manifest and static-shell service worker. Open MEBT in a
                  direct Chromium or Android browser tab and choose{' '}
                  <strong className="text-[#09234F] dark:text-[#F1F5FF]">Install app</strong> or{' '}
                  <strong className="text-[#09234F] dark:text-[#F1F5FF]">Add to Home screen</strong> from the browser
                  menu.
                </p>
                <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
                  Safety note: Only the static interface shell is cached for offline viewing; no
                  sensitive personal documents are stored or cached.
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full min-h-[44px] rounded-xl bg-[#075DEB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0547B8]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC<{ label: string }> = ({ label }) => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 lg:bottom-5 left-4 right-4 sm:right-auto z-50 flex items-center gap-2.5 rounded-2xl bg-[#09234F] dark:bg-[#162C52] border border-transparent dark:border-[#2C4B80] px-4 py-3 text-xs font-medium text-white shadow-lg"
    >
      <WifiOff className="w-4 h-4 text-[#FFB300] shrink-0" />
      <span>{label}</span>
    </div>
  );
};
