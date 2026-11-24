# MEBT — Decision log v1.2

| Decision | Rationale | Status |
|---|---|---|
| Household administration, legal first | Focus initial value | Approved |
| Rule-based, AI-ready | Avoid inference costs | Approved |
| PWA first | Accessible distribution | Approved |
| Three languages and low-literacy UX | Accessibility | Approved |
| Phone/email/Google and guest | Flexible access (read-only Guest mode enforced across case/vault edits) | Approved & implemented |
| Free/premium | Accessible entry (emergency & rights always free) | Approved in principle |
| Research all nine categories then deepen | Focus investment | Approved |
| Prototype and interviews in parallel | Test demand early | Approved |
| MEBT, F1, blue/gold, hybrid UX | Cultural trust and usability | Approved |
| AI Studio, GitHub, later coding agent | Speed then engineering | Approved |
| React/TypeScript/Vite, local fictional state | Portable prototype (`storageAdapter.ts` + `sanitiseInput`) | Implemented (Proposed default adopted) |
| Five tabs, typography, centralised design tokens | Working defaults (Home, Cases, Rights, Vault, Profile + desktop sidebar; `src/theme/designTokens.ts`) | Implemented (Proposed default adopted) |
| Unified Home Search Bar & Dark/Light Mode toggle | Explicitly requested UX enhancement preserving F1 brand palette, high-contrast accessibility, and calm layout hierarchy | Implemented (User-requested enhancement) |
| Native static-shell service worker (`public/sw.js`) + `manifest.webmanifest` | Avoids Vite 8 plugin peer conflicts while guaranteeing strictly static-shell caching (zero sensitive record caching) | Implemented (Deviation documented) |
| Automated deterministic verification suite (`scripts/verifyMvp.ts`) | Verifies rule engine, 8-state machine, exclusions, i18n parity, sanitisation, and zero-AI/zero-upload invariants on every update | Implemented (Engineering QA standard) |
| Payments, pricing, backend, hosting | Need validation evidence first | Deferred |
