# MEBT — Decision log v1.1

| Decision | Rationale | Status |
|---|---|---|
| Household administration, legal first | Focus initial value | Approved |
| Rule-based, AI-ready | Avoid inference costs | Approved |
| PWA first | Accessible distribution | Approved |
| Three languages and low-literacy UX | Accessibility | Approved |
| Phone/email/Google and guest | Flexible access | Approved |
| Free/premium | Accessible entry (emergency & rights always free) | Approved in principle |
| Research all nine categories then deepen | Focus investment | Approved |
| Prototype and interviews in parallel | Test demand early | Approved |
| MEBT, F1, blue/gold, hybrid UX | Cultural trust and usability | Approved |
| AI Studio, GitHub, later coding agent | Speed then engineering | Approved |
| React/TypeScript/Vite, local fictional state | Portable prototype (implemented in v1.1 with `storageAdapter.ts`) | Implemented (Proposed default adopted) |
| Five tabs, typography, validation targets | Working defaults (Home, Cases, Rights, Vault, Profile + desktop sidebar; Manrope/Inter/Noto Sans Ethiopic) | Implemented (Proposed default adopted) |
| Native static-shell service worker (`public/sw.js`) + `manifest.webmanifest` | Avoids Vite 8 plugin peer conflicts while guaranteeing strictly static-shell caching (zero sensitive record caching) | Implemented (Deviation documented) |
| Payments, pricing, backend, hosting | Need validation evidence first | Deferred |
