import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Edit3,
  Eye,
  FileCheck2,
  Plus,
  Search,
  Share2,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VaultDocument, VaultDocumentCategory } from '../../types/mebt';
import {
  getDocumentExpiryStatus,
  getMissingDocumentsForCases,
} from '../../engine/workflowEngine';

const CATEGORY_LABELS: Record<VaultDocumentCategory | 'all', string> = {
  all: 'All categories',
  identity: 'Identity records',
  residence_permits: 'Residence & permits',
  refugee_asylum: 'Refugee & asylum',
  civil_records: 'Civil records',
  proof_of_address: 'Proof of address',
  receipts_submissions: 'Receipts & submissions',
};

export const VaultScreen: React.FC = () => {
  const {
    state,
    focusedVaultDocId,
    clearFocusTargets,
    addVaultDocument,
    updateVaultDocument,
    deleteVaultDocument,
    openCase,
    switchAuthMode,
    showToast,
    t,
  } = useApp();

  const [category, setCategory] = useState<VaultDocumentCategory | 'all'>('all');
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'expiring' | 'expired' | 'valid'>('all');
  const [query, setQuery] = useState('');

  // Create/Edit fictional metadata modal (strictly NO file picker or camera)
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [docCategory, setDocCategory] = useState<VaultDocumentCategory>('residence_permits');
  const [refCode, setRefCode] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState('');
  const [linkedCaseId, setLinkedCaseId] = useState('');
  const [notes, setNotes] = useState('');
  const [sampleTemplate, setSampleTemplate] =
    useState<VaultDocument['sampleTemplate']>('permit_card');
  const [formError, setFormError] = useState('');

  // Sample preview & simulated share modals
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
  const [shareDoc, setShareDoc] = useState<VaultDocument | null>(null);

  useEffect(() => {
    if (focusedVaultDocId) {
      const target = state.vaultDocuments.find((d) => d.id === focusedVaultDocId);
      if (target) {
        setPreviewDoc(target);
      }
      clearFocusTargets();
    }
  }, [focusedVaultDocId, state.vaultDocuments, clearFocusTargets]);

  const missingIndicators = getMissingDocumentsForCases(state.cases, state.vaultDocuments);

  const openCreateModal = (presetCategory?: VaultDocumentCategory, presetCaseId?: string) => {
    setEditingId(null);
    setTitle('');
    setDocCategory(presetCategory ?? 'residence_permits');
    setRefCode(`SAMPLE-${Math.floor(1000 + Math.random() * 8999)}`);
    setIssueDate(new Date().toISOString().slice(0, 10));
    setExpiryDate('');
    setLinkedCaseId(presetCaseId ?? state.cases[0]?.id ?? '');
    setNotes('');
    setSampleTemplate('permit_card');
    setFormError('');
    setFormOpen(true);
  };

  const openEditModal = (doc: VaultDocument) => {
    setEditingId(doc.id);
    setTitle(doc.title);
    setDocCategory(doc.category);
    setRefCode(doc.fictionalRefCode);
    setIssueDate(doc.issueDate);
    setExpiryDate(doc.expiryDate ?? '');
    setLinkedCaseId(doc.linkedCaseId ?? '');
    setNotes(doc.notes);
    setSampleTemplate(doc.sampleTemplate);
    setFormError('');
    setFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please provide a fictional document title.');
      return;
    }
    setFormError('');
    const payload = {
      title,
      category: docCategory,
      fictionalRefCode: refCode,
      holderName: state.user.displayName,
      issueDate,
      expiryDate: expiryDate || undefined,
      linkedCaseId: linkedCaseId || undefined,
      notes,
      sampleTemplate,
    };

    if (editingId) {
      updateVaultDocument(editingId, payload);
    } else {
      addVaultDocument(payload);
    }
    setFormOpen(false);
  };

  const filteredDocs = state.vaultDocuments.filter((doc) => {
    if (category !== 'all' && doc.category !== category) return false;
    const exp = getDocumentExpiryStatus(doc);
    if (expiryFilter === 'expiring' && exp.status !== 'expiring_soon') return false;
    if (expiryFilter === 'expired' && exp.status !== 'expired') return false;
    if (expiryFilter === 'valid' && exp.status !== 'valid') return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.fictionalRefCode.toLowerCase().includes(q) ||
        doc.notes.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-mebt-in">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-[#09234F] dark:text-[#F1F5FF]">
            {t('vault.title')}
          </h1>
          <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4] mt-0.5">{t('vault.subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={() => openCreateModal()}
          disabled={state.user.isGuest}
          className="min-h-[44px] px-5 rounded-2xl bg-[#075DEB] text-white text-sm font-semibold hover:bg-[#0547B8] disabled:opacity-50 inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t('vault.addDoc')}
        </button>
      </section>

      {/* Honest Security & Demo Storage Disclaimer */}
      <div className="rounded-2xl bg-[#FFF7E0] dark:bg-[#2A210D] border border-[#FFB300]/50 p-4 flex items-start gap-3 text-xs sm:text-sm text-[#09234F] dark:text-[#F1F5FF]">
        <ShieldAlert className="w-5 h-5 text-[#8A5300] dark:text-[#FFB300] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Demonstration Metadata Only — Not Production-Secure Storage</p>
          <p className="text-[#4A5D7A] dark:text-[#D9C7A3] leading-relaxed">
            {t('vault.disclaimer')}
          </p>
        </div>
      </div>

      {state.user.isGuest && (
        <div className="mebt-card rounded-2xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4]">
            Guest mode lets you inspect sample vault records. Switch to a fictional demo account to
            create or edit metadata records.
          </p>
          <button
            type="button"
            onClick={() => switchAuthMode('phone')}
            className="min-h-[44px] px-4 rounded-xl bg-[#075DEB] text-white text-xs font-semibold whitespace-nowrap shrink-0"
          >
            {t('cases.switchDemoAccount')}
          </button>
        </div>
      )}

      {/* Missing Document Indicators derived automatically from Active Cases */}
      {missingIndicators.length > 0 && (
        <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 space-y-3">
          <div className="flex items-center gap-2 text-[#8A5300] dark:text-[#FFD166]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <h2 className="font-heading text-sm font-bold text-[#09234F] dark:text-[#F1F5FF]">
              {t('vault.missingTitle')} ({missingIndicators.length})
            </h2>
          </div>
          <div className="divide-y divide-[#DCE6F7] dark:divide-[#1E3254]">
            {missingIndicators.slice(0, 4).map((m, idx) => (
              <div
                key={`${m.caseId}-${idx}`}
                className="py-3 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <p className="text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF]">
                    {CATEGORY_LABELS[m.category]}
                  </p>
                  <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">
                    Needed for “{m.checklistTitle}” in {m.caseTitle}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!state.user.isGuest && (
                    <button
                      type="button"
                      onClick={() => openCreateModal(m.category, m.caseId)}
                      className="min-h-[40px] px-3.5 rounded-xl bg-[#EBF2FF] dark:bg-[#162C52] text-[#075DEB] dark:text-[#6AA6FF] text-xs font-semibold hover:bg-[#DCE9FF] dark:hover:bg-[#1E3A6A] whitespace-nowrap"
                    >
                      Add sample record
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openCase(m.caseId)}
                    className="min-h-[40px] px-3 text-xs font-semibold text-[#4A5D7A] dark:text-[#A9B9D4] hover:text-[#09234F] dark:hover:text-[#F1F5FF] whitespace-nowrap"
                  >
                    View case
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search & Filter Bar */}
      <section className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-[#4A5D7A] dark:text-[#A9B9D4] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fictional documents or reference codes..."
              aria-label="Search fictional documents"
              className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] pl-10 pr-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
            />
          </div>
          <select
            value={expiryFilter}
            onChange={(e) =>
              setExpiryFilter(e.target.value as 'all' | 'expiring' | 'expired' | 'valid')
            }
            aria-label="Filter by expiry status"
            className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-[#F5F8FF] dark:bg-[#132544] px-3 text-sm font-medium text-[#09234F] dark:text-[#F1F5FF]"
          >
            <option value="all">All expiry states</option>
            <option value="expiring">Expiring within 30 days</option>
            <option value="expired">Past demo expiry date</option>
            <option value="valid">Valid (&gt;30 days)</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_LABELS) as Array<VaultDocumentCategory | 'all'>).map((cat) => {
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

      {/* Vault Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-8 text-center space-y-3">
          <h2 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF]">
            No fictional vault records found
          </h2>
          <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4]">
            Add a fictional sample record to explore expiry tracking and case links.
          </p>
          {!state.user.isGuest && (
            <button
              type="button"
              onClick={() => openCreateModal()}
              className="min-h-[44px] px-5 rounded-xl bg-[#075DEB] text-white text-sm font-semibold"
            >
              {t('vault.addDoc')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => {
            const exp = getDocumentExpiryStatus(doc);
            const linkedCase = state.cases.find((c) => c.id === doc.linkedCaseId);
            return (
              <article
                key={doc.id}
                className="mebt-card rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-[#4A5D7A] dark:text-[#A9B9D4]">
                      {CATEGORY_LABELS[doc.category]}
                    </span>
                    <span
                      className={`font-semibold tabular-nums ${
                        exp.status === 'expired'
                          ? 'text-red-700 dark:text-red-400'
                          : exp.status === 'expiring_soon'
                          ? 'text-[#8A5300] dark:text-[#FFD166]'
                          : 'text-[#075DEB] dark:text-[#6AA6FF]'
                      }`}
                    >
                      {exp.label}
                    </span>
                  </div>

                  <h2 className="font-heading text-base font-bold text-[#09234F] dark:text-[#F1F5FF]">
                    {doc.title}
                  </h2>
                  <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] tabular-nums">
                    Fictional code:{' '}
                    <strong className="text-[#09234F] dark:text-[#F1F5FF]">
                      {doc.fictionalRefCode}
                    </strong>{' '}
                    · Issued: {doc.issueDate}
                    {doc.expiryDate ? ` · Expires: ${doc.expiryDate}` : ''}
                  </p>
                  {doc.notes && (
                    <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4]">{doc.notes}</p>
                  )}
                  {linkedCase && (
                    <button
                      type="button"
                      onClick={() => openCase(linkedCase.id)}
                      className="text-xs font-semibold text-[#075DEB] dark:text-[#6AA6FF] hover:underline"
                    >
                      Linked case: {linkedCase.title}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#DCE6F7] dark:border-[#1E3254]">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="min-h-[40px] px-3 rounded-xl bg-[#EBF2FF] dark:bg-[#162C52] text-[#075DEB] dark:text-[#6AA6FF] text-xs font-semibold hover:bg-[#DCE9FF] dark:hover:bg-[#1E3A6A] inline-flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Sample preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareDoc(doc)}
                    className="min-h-[40px] px-3 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-[#09234F] dark:text-[#F1F5FF] text-xs font-semibold hover:bg-[#F5F8FF] dark:hover:bg-[#132544] inline-flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#075DEB] dark:text-[#6AA6FF]" />
                    Share preview
                  </button>
                  {!state.user.isGuest && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditModal(doc)}
                        aria-label={`Edit ${doc.title}`}
                        className="min-h-[40px] px-3 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-[#4A5D7A] dark:text-[#A9B9D4] text-xs font-semibold hover:text-[#09234F] dark:hover:text-[#F1F5FF] inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteVaultDocument(doc.id)}
                        aria-label={`Delete ${doc.title}`}
                        className="min-h-[40px] px-2.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 inline-flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT FICTIONAL METADATA MODAL (NO FILE INPUT) */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#09234F]/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? 'Edit fictional document record' : 'Add fictional document record'}
        >
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-6 space-y-4 animate-mebt-sheet max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF]">
                  {editingId ? 'Edit fictional document record' : 'Add fictional document metadata'}
                </h2>
                <p className="text-xs text-[#8A5300] dark:text-[#FFD166] mt-0.5">
                  Metadata demo only — do not enter real ID numbers, passport numbers, or personal
                  data. File uploads are intentionally disabled.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Close modal"
                className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-[#4A5D7A] dark:text-[#A9B9D4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor="vault-title"
                  className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1"
                >
                  Fictional document title
                </label>
                <input
                  id="vault-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setFormError('');
                  }}
                  placeholder="e.g., Sample Residence Receipt (Fictional)"
                  className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="vault-cat"
                    className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="vault-cat"
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as VaultDocumentCategory)}
                    className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                  >
                    {(Object.keys(CATEGORY_LABELS) as Array<VaultDocumentCategory | 'all'>)
                      .filter((k) => k !== 'all')
                      .map((k) => (
                        <option key={k} value={k}>
                          {CATEGORY_LABELS[k]}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="vault-ref"
                    className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1"
                  >
                    Fictional reference label
                  </label>
                  <input
                    id="vault-ref"
                    type="text"
                    value={refCode}
                    onChange={(e) => setRefCode(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF] tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="vault-issue"
                    className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1"
                  >
                    Sample issue date
                  </label>
                  <input
                    id="vault-issue"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF] tabular-nums"
                  />
                </div>
                <div>
                  <label
                    htmlFor="vault-expiry"
                    className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1"
                  >
                    Sample expiry date (optional)
                  </label>
                  <input
                    id="vault-expiry"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF] tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="vault-case"
                    className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1"
                  >
                    Link to demo case (optional)
                  </label>
                  <select
                    id="vault-case"
                    value={linkedCaseId}
                    onChange={(e) => setLinkedCaseId(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                  >
                    <option value="">Not linked</option>
                    {state.cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="vault-template"
                    className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1"
                  >
                    Bundled sample preview layout
                  </label>
                  <select
                    id="vault-template"
                    value={sampleTemplate}
                    onChange={(e) =>
                      setSampleTemplate(e.target.value as VaultDocument['sampleTemplate'])
                    }
                    className="w-full min-h-[44px] rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                  >
                    <option value="permit_card">Sample Permit Sheet</option>
                    <option value="receipt_letter">Sample Submission Receipt</option>
                    <option value="civil_certificate">Sample Civil Record</option>
                    <option value="address_proof">Sample Proof of Address</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="vault-notes"
                  className="block text-xs font-semibold text-[#09234F] dark:text-[#F1F5FF] mb-1"
                >
                  Organisational notes (fictional)
                </label>
                <textarea
                  id="vault-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] p-3 text-sm text-[#09234F] dark:text-[#F1F5FF]"
                />
              </div>

              {formError && (
                <p role="alert" className="text-xs font-medium text-red-700 dark:text-red-400">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="min-h-[44px] px-4 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF]"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 rounded-xl bg-[#075DEB] text-white text-sm font-semibold hover:bg-[#0547B8]"
                >
                  {editingId ? 'Save changes' : 'Add sample record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BUNDLED SAMPLE DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#09234F]/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Sample document preview"
        >
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-6 space-y-4 animate-mebt-sheet">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#8A5300] dark:text-[#FFD166]">
                  BUNDLED SAMPLE FICTIONAL DOCUMENT
                </p>
                <h2 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF] mt-0.5">
                  {previewDoc.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                aria-label="Close sample preview"
                className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-[#4A5D7A] dark:text-[#A9B9D4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-[#075DEB]/40 bg-[#F5F8FF] dark:bg-[#132544] p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#DCE6F7] dark:border-[#1E3254] pb-2.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075DEB] dark:text-[#6AA6FF]">
                  <FileCheck2 className="w-4 h-4" />
                  SAMPLE PREVIEW ONLY
                </span>
                <span className="text-xs font-mono text-[#4A5D7A] dark:text-[#A9B9D4] tabular-nums">
                  {previewDoc.fictionalRefCode}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-[#4A5D7A] dark:text-[#A9B9D4]">Fictional Holder</dt>
                  <dd className="font-semibold text-[#09234F] dark:text-[#F1F5FF] mt-0.5">
                    {previewDoc.holderName}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#4A5D7A] dark:text-[#A9B9D4]">Category</dt>
                  <dd className="font-semibold text-[#09234F] dark:text-[#F1F5FF] mt-0.5">
                    {CATEGORY_LABELS[previewDoc.category]}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#4A5D7A] dark:text-[#A9B9D4]">Sample Issue Date</dt>
                  <dd className="font-semibold text-[#09234F] dark:text-[#F1F5FF] tabular-nums mt-0.5">
                    {previewDoc.issueDate}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#4A5D7A] dark:text-[#A9B9D4]">Sample Expiry Date</dt>
                  <dd className="font-semibold text-[#09234F] dark:text-[#F1F5FF] tabular-nums mt-0.5">
                    {previewDoc.expiryDate || 'Not set'}
                  </dd>
                </div>
              </dl>
              <p className="text-[11px] text-[#4A5D7A] dark:text-[#A9B9D4] border-t border-[#DCE6F7] dark:border-[#1E3254] pt-2.5">
                Illustrative sample sheet only. Not an official document, scan, or encrypted file.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPreviewDoc(null)}
              className="w-full min-h-[44px] rounded-xl bg-[#075DEB] text-white text-sm font-semibold"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

      {/* SIMULATED SHARING MODAL */}
      {shareDoc && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#09234F]/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Simulated document sharing preview"
        >
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0F1D36] border border-[#DCE6F7] dark:border-[#1E3254] p-6 space-y-4 animate-mebt-sheet">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#8A5300] dark:text-[#FFD166]">
                  Simulated Sharing Preview · Nothing is transmitted
                </p>
                <h2 className="font-heading text-lg font-bold text-[#09234F] dark:text-[#F1F5FF] mt-0.5">
                  Share “{shareDoc.title}” (Demo)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShareDoc(null)}
                aria-label="Close share preview"
                className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-[#4A5D7A] dark:text-[#A9B9D4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">
              In a future verified, POPIA-reviewed release, MEBT could allow you to generate a
              temporary read-only summary link for an accredited legal clinic. In this prototype,
              no links are created and no data leaves your browser.
            </p>

            <button
              type="button"
              onClick={() => {
                showToast('Simulated sharing preview completed (zero external data sent).', 'info');
                setShareDoc(null);
              }}
              className="w-full min-h-[44px] rounded-xl bg-[#075DEB] text-white text-sm font-semibold"
            >
              Simulate advisor share preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
