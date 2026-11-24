# MEBT (መብት) — Interactive MVP Prototype

**MEBT** (*መብት* — meaning *right* or *entitlement* in Amharic) is a mobile-first, rule-based legal and administrative navigation prototype designed for Habesha individuals and households living in South Africa.

> **Demonstration Prototype Notice:** This application runs entirely locally in your browser using fictional data only. It is **not** a law firm, government institution, official application status checker, or substitute for qualified legal advice. Do **not** enter real ID numbers, passport numbers, passwords, or real immigration documents.

---

## Quick Start & Build Commands

```bash
# Install dependencies
npm install

# Run local development server on port 3000
npm run dev

# Type-check with TypeScript
npm run lint

# Build production bundle (Vite)
npm run build

# Preview built bundle locally
npm run preview
```

---

## Architecture Overview

- **Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons.
- **Zero External Services:** No Gemini/OpenAI API calls, no AI API keys, no real authentication, no file uploads, no analytics, no payments, and no external network transmission of user data.
- **Modular Structure:**
  - `src/types/mebt.ts` — Strongly typed domain models.
  - `src/engine/workflowEngine.ts` — Deterministic rule engine (6-tier Action Centre prioritisation, case state machine, blocker guidance, 5 correspondence templates, case report generator, expiry & missing-document detection).
  - `src/data/` — All 9 approved administrative pathways (`pathways.ts`), Know Your Rights entries (`rightsLibrary.ts`), mock Assistance & Emergency directory (`assistanceDirectory.ts`), and fictional demo + empty-state factories (`demoDataset.ts`).
  - `src/i18n/translations.ts` — Structured English, Amharic (`አማርኛ`), and Tigrinya (`ትግርኛ`) dictionaries with native-review disclosures.
  - `src/services/storageAdapter.ts` — Versioned local persistence adapter (`mebt_demo_state_v1`) with input sanitisation, engineered for clean swap-out in a future verified backend.
  - `src/context/AppContext.tsx` — Shared state synchronizing changes automatically across Home, Cases, Vault, Notifications, and Profile.
  - `src/modules/` — Self-contained UI modules for `onboarding`, `dashboard`, `cases`, `rights`, `assistance`, `vault`, `notifications`, and `profile`.
  - `public/` — Web App Manifest (`manifest.webmanifest`), F1 brand SVG (`icon.svg`), generated PNG PWA icons (`192x192`, `512x512`, `512x512 maskable`, `180x180 apple-touch-icon`), and static-shell-only service worker (`sw.js`).

---

## Feature-to-Screen Traceability Matrix

| ID | Feature | Prototype Status | Implemented Screen(s) & Module(s) |
|---|---|---|---|
| **F01** | Onboarding, guest access & simulated auth | Simulated | `OnboardingFlow.tsx`, `ProfileScreen.tsx` (Phone/Email/Google fictional sign-in, Guest mode, optional status, objectives, resumable `TutorialModal.tsx`) |
| **F02** | Multilingual & accessibility | Implemented (translations pending native review; audio simulated) | `src/i18n/translations.ts`, `AppShell.tsx`, `ProfileScreen.tsx`, `RightsScreen.tsx` (English/Amharic/Tigrinya, text scale, high contrast, reduced motion, expanded guidance, simulated audio player) |
| **F03** | Home & rule-based Action Centre | Implemented (fictional data) | `HomeScreen.tsx`, `workflowEngine.ts` (6-tier deterministic priority engine, Postpone/Dismiss + Undo, active case progress, Implementation Intentions planner, quick actions, recent activity) |
| **F04** | Administrative Pathway Explorer (9 categories) | 3 deep demos + shared follow-up + interactive previews | `CasesScreen.tsx`, `src/data/pathways.ts` (Citizenship, Permanent Residence, Refugee & Asylum deep demos; Complaints/Follow-ups shared demo; direct links to Rights & Emergency; interactive previews for Identity/Civil, Business/Finance, Visas/Permits) |
| **F05** | Case management engine & blockers | Implemented (local rule-based demo) | `CasesScreen.tsx`, `CaseDetailView.tsx`, `workflowEngine.ts` (Create/edit/archive/delete cases, 8 internal organisational states, checklist with undo & milestones, blocker presets + generic guidance, follow-up scheduler, notes, timeline) |
| **F06** | Correspondence & case report generation | Simulated (editable fictional templates) | `CaseDetailView.tsx`, `workflowEngine.ts` (5 editable templates, formatted preview, clipboard copy, timeline save, structured report preview + local `.txt` export) |
| **F07** | Know Your Rights library | Implemented (content pending legal verification; audio simulated) | `RightsScreen.tsx`, `rightsLibrary.ts` (All 7 documentation status filters, topic filters, search, expandable plain-language cards, Source & Verification Date fields, simulated audio demo; employment rights excluded) |
| **F08** | Assistance & Emergency Centre | Simulated (mock directory) | `AssistanceScreen.tsx`, `assistanceDirectory.ts` (5 categories, province/search filters, always-free Emergency Legal Protection banner, simulated Call/WhatsApp/Email/Website/Escalation modals) |
| **F09** | Document Vault | Simulated (fictional metadata & bundled samples only) | `VaultScreen.tsx` (Categories, search, expiry filters, missing-document indicators from active cases, create/edit/delete metadata, bundled sample sheet preview, simulated sharing modal; zero file pickers or real uploads) |
| **F10** | Notification Centre & reminders | Simulated (local in-app only) | `NotificationsScreen.tsx`, `AppContext.tsx` (Auto-synced follow-up/blocker/expiry alerts, read/all-read/snooze/dismiss, direct case/vault links, simulated multi-channel preferences) |
| **F11** | Profile & Premium preview | Preview only (no checkout/pricing) | `ProfileScreen.tsx` (Demo account switcher, optional status editor, Free vs Premium preview toggle, privacy disclosure, Demo Reset, Clean Empty State, Replay Onboarding) |
| **F12** | PWA & responsive experience | Implemented (static-shell SW; installability depends on HTTPS/browser context) | `manifest.webmanifest`, `sw.js`, `PWAInstallControls.tsx`, `AppShell.tsx` (360px–1440px responsive layout, 5-tab mobile bar + desktop sidebar, in-app install prompt + iOS guide, offline banner) |
| **F13** | Household expansion modules | **Excluded** | Intentionally excluded per approved MVP scope |

---

## Known Limitations & Production Gates

1. **Legal Content Pending Verification:** All rights summaries, workflow checklists, and correspondence templates are plain-language educational placeholders. Qualified South African legal review is required before production release.
2. **Translations Pending Native Review:** Amharic (`አማርኛ`) and Tigrinya (`ትግርኛ`) UI translations require review by native speakers and community testers.
3. **Simulated Infrastructure Only:** Authentication, document vault storage, directory contact actions, audio playback, and notification channels are simulated locally. Production requires secure authentication, encrypted POPIA-compliant storage, verified partner directories, and explicit consent management.
4. **PWA Installability Context:** Service worker registration and browser `beforeinstallprompt` require a top-level HTTPS context; inside embedded preview iframes, the fallback guided install instructions are shown.
5. **No Payment Integration:** Premium preview is a non-binding toggle for usability testing only; pricing and payment providers (e.g., Shop2Shop) remain deferred pending validation evidence.
