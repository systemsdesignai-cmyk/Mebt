# MEBT — Project state v1.2

**Checkpoint:** Interactive fictional-data MVP prototype audited, refined, and verified via automated deterministic test suite (`10/10` passing), TypeScript type-checking, and Vite production build; physical device PWA testing and customer usability interviews remain open.

## Completed in Prototype v1.2
- Built React 19 + TypeScript + Vite 8 + Tailwind CSS v4 mobile-first PWA prototype with faithful F1 brand identity (`#075DEB` royal blue, `#FFB300` amber, `#09234F` navy, `#F5F8FF` ice white), centralised design tokens (`src/theme/designTokens.ts`), full Dark/Light mode support, and `Manrope` / `Inter` / `Noto Sans Ethiopic` typography.
- Implemented all 8 approved core journeys and `F01–F12` prototype scope while verifying `F13` (household expansion) and employment rights remain strictly excluded.
- Added unified top-of-Home Search Bar with scope filtering (`All`, `Active cases`, `Documents`, `Legal rights`) and 1-tap deep-linking to cases, Vault previews, and expanded Rights entries.
- Refined cross-screen synchronisation & edge cases: fixed React 19 checklist toast closure bug, added direct Vault document deep-linking from Home Action Centre and Notification Centre, synced expiry notifications on Vault document edits, enforced Guest read-only guards inside `CaseDetailView`, and tightened `sanitiseInput` validation across forms.
- Executed `scripts/verifyMvp.ts` confirming all 10 deterministic/safety/i18n/PWA assertions pass with zero AI API usage, zero real file pickers, zero real external transmission, and local-only persistence (`mebt_demo_state_v1`).

## Next Steps
- Run manual responsive QA across 360px–1440px viewports and physical Android/iOS browsers for standalone PWA installation and offline shell verification.
- Conduct voluntary customer interviews and usability sessions per `VALIDATION_PLAN.md` (30 interviews / 20 usability tests target) using fictional demo workflows only.
- Track task completion time, comprehension, and defects before committing to backend, legal verification, or payment investment.

## Still Open / Deferred
- Qualified South African legal verification of workflows, rights entries, and correspondence templates.
- Native-speaker review of Amharic (`አማርኛ`) and Tigrinya (`ትግርኛ`) translations and production voice recordings.
- Trademark check, production backend architecture, real authentication, encrypted document storage, POPIA compliance review, partner directory verification, hosting, pricing, and payment provider (Shop2Shop candidate).
