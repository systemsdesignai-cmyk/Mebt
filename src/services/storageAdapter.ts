import { AppState } from '../types/mebt';

export const STORAGE_KEY = 'mebt_demo_state_v1';
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Sanitise user-editable demonstration strings: strips angle brackets / control chars
 * and enforces bounded lengths so local demo inputs remain clean and safe.
 */
export function sanitiseInput(value: string, maxLength = 240): string {
  return value
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Local-only fictional persistence adapter.
 * Designed so a future production backend/auth/POPIA-compliant adapter can
 * replace these functions without rewriting UI or workflow logic.
 */
export const storageAdapter = {
  load(fallback: () => AppState): AppState {
    if (typeof window === 'undefined') return fallback();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback();
      const parsed = JSON.parse(raw) as Partial<AppState>;
      if (!parsed || parsed.schemaVersion !== CURRENT_SCHEMA_VERSION) {
        return fallback();
      }
      const base = fallback();
      return {
        ...base,
        ...parsed,
        user: { ...base.user, ...(parsed.user ?? {}) },
        accessibility: { ...base.accessibility, ...(parsed.accessibility ?? {}) },
        notificationPrefs: { ...base.notificationPrefs, ...(parsed.notificationPrefs ?? {}) },
        cases: Array.isArray(parsed.cases) ? parsed.cases : base.cases,
        vaultDocuments: Array.isArray(parsed.vaultDocuments)
          ? parsed.vaultDocuments
          : base.vaultDocuments,
        notifications: Array.isArray(parsed.notifications)
          ? parsed.notifications
          : base.notifications,
        dismissedRecommendationIds: Array.isArray(parsed.dismissedRecommendationIds)
          ? parsed.dismissedRecommendationIds
          : [],
        postponedRecommendations:
          parsed.postponedRecommendations && typeof parsed.postponedRecommendations === 'object'
            ? parsed.postponedRecommendations
            : {},
      };
    } catch {
      return fallback();
    }
  },

  save(state: AppState): boolean {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage quota / privacy mode errors
    }
  },
};
