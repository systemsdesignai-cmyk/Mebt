# MEBT — Document index v1.2

Prototype MVP baseline updated following comprehensive audit, targeted refinements, and automated verification.

- `README.md` — Setup/build/verification commands, architecture overview, feature-to-screen traceability matrix, executed test summary, and known limitations.
- `PROJECT_STATE.md` (v1.2) — Current MVP prototype checkpoint, completed scope & refinements, and open production gates.
- `DECISIONS.md` (v1.2) — Approved constraints, adopted prototype defaults, user-requested UX enhancements, and documented deviations.
- `FEATURE_REGISTER.md` (v1.2) — Traceability of `F01–F13` with explicit implementation status taxonomy vs. production gates.
- `scripts/verifyMvp.ts` — Executable automated verification suite covering deterministic workflow rules, exclusions, i18n parity, input sanitisation, and PWA/security invariants.
- `src/theme/designTokens.ts` — Centralised F1 design tokens mirroring `src/index.css`.
- `public/assets/aistudio/PROTOTYPE_PRD_6be8ac50.md` — Original v1.0 prototype requirements baseline.
- `public/assets/aistudio/DESIGN_SPEC_16309da3.md` — Original v1.0 UI/UX and F1 design specification.
- `public/assets/aistudio/VALIDATION_PLAN_b5e01d4a.md` — Customer interview and usability testing plan.
- `public/assets/aistudio/F1_reference_34a72d42.png` — Approved F1 visual concept reference (implemented as clean vector SVG in `src/components/MebtLogo.tsx` and `public/icon.svg`).

No production backend architecture, verified legal knowledge base, or payment provider integration is included at this checkpoint.
