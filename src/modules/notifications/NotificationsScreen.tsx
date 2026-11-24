import React, { useState } from 'react';
import {
  ArrowRight,
  Bell,
  CheckCheck,
  Clock,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationPreferences } from '../../types/mebt';

export const NotificationsScreen: React.FC = () => {
  const {
    state,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    snoozeNotification,
    updateNotificationPrefs,
    openCase,
    setActiveTab,
    t,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const nowIso = new Date().toISOString();

  const visibleNotifications = state.notifications
    .filter((n) => !n.dismissed)
    .filter((n) => !n.snoozedUntil || n.snoozedUntil <= nowIso)
    .filter((n) => (filter === 'unread' ? !n.read : true));

  const snoozedCount = state.notifications.filter(
    (n) => !n.dismissed && n.snoozedUntil && n.snoozedUntil > nowIso
  ).length;

  const prefChannels: Array<{
    key: keyof Omit<NotificationPreferences, 'frequency'>;
    label: string;
    detail: string;
  }> = [
    { key: 'inApp', label: 'In-app reminders', detail: 'Shown inside MEBT Notification Centre' },
    { key: 'push', label: 'Push notifications (Demo)', detail: 'Simulated preference — not sent' },
    { key: 'email', label: 'Email summaries (Demo)', detail: 'Simulated preference — not sent' },
    { key: 'whatsapp', label: 'WhatsApp reminders (Demo)', detail: 'Simulated preference — not sent' },
    { key: 'sms', label: 'SMS alerts (Demo)', detail: 'Simulated preference — not sent' },
    { key: 'calendar', label: 'Calendar reminders (Demo)', detail: 'Simulated preference — not synced' },
  ];

  return (
    <div className="space-y-6 animate-mebt-in">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-[#09234F] dark:text-[#F1F5FF]">
            {t('notifications.title')}
          </h1>
          <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4] mt-0.5">{t('notifications.subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#0F1D36] text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#F5F8FF] dark:hover:bg-[#132544] inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <CheckCheck className="w-4 h-4 text-[#075DEB] dark:text-[#6AA6FF]" />
          {t('notifications.markAllRead')}
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Notifications Feed */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex p-1 rounded-xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254]">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold ${
                  filter === 'all' ? 'bg-[#075DEB] text-white' : 'text-[#4A5D7A] dark:text-[#A9B9D4]'
                }`}
              >
                All ({visibleNotifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold ${
                  filter === 'unread' ? 'bg-[#075DEB] text-white' : 'text-[#4A5D7A] dark:text-[#A9B9D4]'
                }`}
              >
                Unread
              </button>
            </div>
            {snoozedCount > 0 && (
              <span className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] tabular-nums">
                {snoozedCount} snoozed reminder(s)
              </span>
            )}
          </div>

          {visibleNotifications.length === 0 ? (
            <div className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-8 text-center space-y-2">
              <Bell className="w-7 h-7 text-[#075DEB] dark:text-[#6AA6FF] mx-auto" />
              <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
                You’re all caught up
              </h2>
              <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4]">
                Scheduling a follow-up, logging a blocker, or adding an expiring fictional document
                automatically creates a reminder here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleNotifications.map((n) => (
                <article
                  key={n.id}
                  className={`mebt-card rounded-3xl border p-4 sm:p-5 space-y-3 transition-colors ${
                    n.read
                      ? 'bg-white dark:bg-[#0F1D36] border-[#DCE6F7] dark:border-[#1E3254]'
                      : 'bg-white dark:bg-[#0F1D36] border-[#075DEB]/50 dark:border-[#4D8EFF]/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">
                        <span
                          className={
                            n.urgency === 'high'
                              ? 'text-[#8A5300] dark:text-[#FFD166]'
                              : n.urgency === 'medium'
                              ? 'text-[#075DEB] dark:text-[#6AA6FF]'
                              : 'text-[#4A5D7A] dark:text-[#A9B9D4]'
                          }
                        >
                          {n.urgency === 'high'
                            ? 'Action needed'
                            : n.urgency === 'medium'
                            ? 'Reminder'
                            : 'Activity update'}
                        </span>
                        <span className="text-[#4A5D7A] dark:text-[#A9B9D4] font-normal tabular-nums">
                          {' '}
                          · {n.createdAt.slice(0, 10)} {!n.read ? '· Unread' : ''}
                        </span>
                      </p>
                      <h2 className="font-heading text-sm sm:text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
                        {n.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">{n.body}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#DCE6F7]/80 dark:border-[#1E3254]">
                    <button
                      type="button"
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.relatedCaseId) {
                          openCase(n.relatedCaseId);
                        } else {
                          setActiveTab(n.targetTab);
                        }
                      }}
                      className="min-h-[40px] px-3.5 rounded-xl bg-[#075DEB] text-white text-xs font-semibold hover:bg-[#0547B8] inline-flex items-center gap-1.5"
                    >
                      Open item
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(n.id)}
                        className="min-h-[40px] px-3 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#F5F8FF] dark:hover:bg-[#132544]"
                      >
                        Mark read
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => snoozeNotification(n.id, 3)}
                      className="min-h-[40px] px-3 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-xs font-semibold text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-[#09234F] dark:hover:text-[#F1F5FF] inline-flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Snooze 3d
                    </button>

                    <button
                      type="button"
                      onClick={() => dismissNotification(n.id)}
                      aria-label="Dismiss notification"
                      className="min-h-[40px] px-2.5 rounded-xl text-xs font-semibold text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-red-700 dark:hover:text-red-400 inline-flex items-center gap-1 ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Dismiss
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Simulated Delivery Preferences */}
        <aside className="lg:col-span-5 mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-[#075DEB] dark:text-[#6AA6FF] shrink-0 mt-0.5" />
            <div>
              <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
                {t('notifications.prefsTitle')}
              </h2>
              <p className="text-xs text-[#8A5300] dark:text-[#FFD166] mt-0.5">{t('notifications.noDelivery')}</p>
            </div>
          </div>

          <div>
            <label htmlFor="notif-freq" className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1">
              Reminder pacing (ethical, calm frequency)
            </label>
            <select
              id="notif-freq"
              value={state.notificationPrefs.frequency}
              onChange={(e) =>
                updateNotificationPrefs({
                  frequency: e.target.value as NotificationPreferences['frequency'],
                })
              }
              className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] px-3 text-sm font-medium text-[#09234F] dark:text-[#F1F5FF]"
            >
              <option value="immediate">Immediate when scheduled</option>
              <option value="daily_digest">Once-daily calm summary</option>
              <option value="weekly_summary">Weekly check-in digest</option>
            </select>
          </div>

          <div className="divide-y divide-[#DCE6F7] dark:divide-[#1E3254]">
            {prefChannels.map((ch) => {
              const checked = state.notificationPrefs[ch.key];
              return (
                <div
                  key={ch.key}
                  className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF]">{ch.label}</p>
                    <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">{ch.detail}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    aria-label={ch.label}
                    onClick={() => updateNotificationPrefs({ [ch.key]: !checked })}
                    className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 ${
                      checked ? 'bg-[#075DEB]' : 'bg-[#DCE6F7] dark:bg-[#1E3254]'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        checked ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};
