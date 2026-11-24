# MEBT — Feature register v1.1

Updated following interactive MVP prototype implementation.

| ID | Feature | Prototype scope | Implementation status | Production gate |
|---|---|---|---|---|
| F01 | Onboarding/guest/auth | Simulated (Phone, Email, Google, Guest, optional status, goals, resumable tutorial) | **Simulated & verified (build/typecheck)** | Secure auth, account recovery, POPIA consent |
| F02 | Language/accessibility | Core UI in English, Amharic, Tigrinya; text scale, high contrast, reduced motion, simplified guidance, audio demo placeholder | **Implemented (translations pending native review; audio simulated)** | Native-language review & WCAG accessibility QA |
| F03 | Home/action centre | Deterministic 6-tier rule engine, active cases, implementation intentions planner, postpone/dismiss with undo | **Implemented & verified (fictional data)** | Verified user data & production backend |
| F04 | Pathway explorer | All 9 approved categories (3 deep demos: Citizenship, PR, Refugee/Asylum; shared Follow-Ups; direct links to Rights & Emergency; 3 interactive previews) | **Implemented (3 deep demos + previews)** | Legal source review for all pathways |
| F05 | Case tracking/blockers | Local rule-based state machine (8 states), checklist, blocker presets + generic guidance, follow-ups, notes, timeline, archive/delete | **Implemented (local rule-based demo)** | Verified institutional rules & persistent storage |
| F06 | Correspondence/reports | 5 editable fictional templates, preview, copy, timeline logging, structured case report preview + local `.txt` export | **Simulated (editable fictional templates)** | Legal review of templates |
| F07 | Rights library | All 7 documentation status filters, topic filters, search, source/verification date fields, simulated audio demo (employment rights excluded) | **Implemented (pending legal verification; audio simulated)** | Verified legal content & native audio |
| F08 | Assistance/emergency | Mock directory across 5 categories, filters, always-free emergency banner, simulated Call/WhatsApp/Email/Website/Escalation previews | **Simulated (mock directory)** | Partner contact verification & SLA |
| F09 | Vault | Fictional metadata only, categories, search, expiry filters, missing-document indicators, bundled sample previews, simulated sharing (no uploads) | **Simulated (fictional metadata only)** | Encrypted storage, access controls, POPIA audit |
| F10 | Reminders | Local simulated in-app reminders synced with cases/vault; read/snooze/dismiss; simulated multi-channel preferences | **Simulated (local only)** | Consent, delivery infrastructure, unit cost |
| F11 | Premium | Free vs. proposed Premium explorer toggle without checkout or pricing | **Preview only** | Pricing research & payment provider validation |
| F12 | PWA | Responsive 360–1440px shell, manifest, F1 PNG icons, static-shell service worker, in-app install button + iOS guide, offline indicator | **Implemented (static-shell SW; device install test pending)** | Cross-device offline & security testing |
| F13 | Household expansion | Excluded | **Excluded (preserved)** | Future discovery post-MVP validation |
