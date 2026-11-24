/**
 * MEBT (መብት) — Automated MVP Verification Suite
 * Exercises deterministic rules, data boundaries, safety guarantees,
 * i18n completeness, and end-to-end journey state transitions.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { createEmptyDemoState, createInitialDemoState, DEMO_ACCOUNTS } from '../src/data/demoDataset';
import { PATHWAY_DEFINITIONS, getPathwayById } from '../src/data/pathways';
import { RIGHTS_LIBRARY_ENTRIES } from '../src/data/rightsLibrary';
import { ASSISTANCE_DIRECTORY } from '../src/data/assistanceDirectory';
import {
  BLOCKER_PRESETS,
  CASE_STATE_LABELS,
  CORRESPONDENCE_TEMPLATES,
  buildCaseReportText,
  buildCorrespondenceTemplate,
  computeActionRecommendations,
  deriveNextCaseState,
  getCaseProgress,
  getDocumentExpiryStatus,
  getMissingDocumentsForCases,
} from '../src/engine/workflowEngine';
import { DOC_STATUS_LABELS, SUPPORTED_LANGUAGES, translate } from '../src/i18n/translations';
import { sanitiseInput } from '../src/services/storageAdapter';
import { MEBT_TOKENS } from '../src/theme/designTokens';
import type { AdminCase, DocStatus, VaultDocument } from '../src/types/mebt';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    results.push({ name, passed: false, error: message });
    console.error(`  [FAIL] ${name}: ${message}`);
  }
}

console.log('\nRunning MEBT MVP Automated Verification Suite...\n');

// 1. Pathways & Scope Boundaries (§12, §22)
test('All 9 approved administrative pathways exist and exclude F13/employment rights', () => {
  assert.equal(PATHWAY_DEFINITIONS.length, 9);
  const ids = PATHWAY_DEFINITIONS.map((p) => p.id);
  for (const required of [
    'citizenship',
    'permanent_residence',
    'refugee_asylum',
    'complaints_followups',
    'identity_civil',
    'know_your_rights',
    'business_financial',
    'visas_permits',
    'emergency_protection',
  ]) {
    assert.ok(ids.includes(required as never), `Missing pathway ${required}`);
  }
  const deepCount = PATHWAY_DEFINITIONS.filter((p) => p.depth === 'deep_demo').length;
  assert.equal(deepCount, 3, 'Expected exactly 3 deep priority demo pathways');
  for (const p of PATHWAY_DEFINITIONS) {
    const text = `${p.title} ${p.summary}`.toLowerCase();
    assert.ok(!text.includes('employment rights'), `Excluded employment rights found in ${p.id}`);
  }
});

// 2. Rights Library (§15)
test('Rights library covers all 7 approved statuses, source/verification fields, audio scripts, and excludes employment rights', () => {
  const sevenStatuses: DocStatus[] = [
    'citizen',
    'permanent_resident',
    'refugee',
    'asylum_seeker',
    'visa_permit',
    'expired_doc',
    'undocumented_uncertain',
  ];
  assert.ok(RIGHTS_LIBRARY_ENTRIES.length >= 6);
  for (const st of sevenStatuses) {
    const matches = RIGHTS_LIBRARY_ENTRIES.filter((e) => e.applicableStatuses.includes(st));
    assert.ok(matches.length > 0, `No rights entries match status ${st}`);
  }
  for (const entry of RIGHTS_LIBRARY_ENTRIES) {
    assert.ok(entry.sourceLabel.length > 0, `Missing sourceLabel on ${entry.id}`);
    assert.equal(entry.verificationStatus, 'pending_verification');
    assert.ok(entry.verificationDate.length > 0);
    assert.ok(entry.audioScriptSummary.length > 0 && entry.audioDurationSec > 0);
    const body = `${entry.title} ${entry.plainSummary}`.toLowerCase();
    assert.ok(!body.includes('ccma') && !body.includes('unfair dismissal'), `Employment content found in ${entry.id}`);
  }
});

// 3. Assistance & Emergency Directory (§16)
test('Assistance directory covers all 5 categories with safe mock .invalid endpoints and free emergency protection', () => {
  const categories = new Set(ASSISTANCE_DIRECTORY.map((o) => o.category));
  for (const req of [
    'government_departments',
    'refugee_assistance',
    'legal_assistance',
    'complaint_institutions',
    'emergency_legal_protection',
  ]) {
    assert.ok(categories.has(req as never), `Missing assistance category ${req}`);
  }
  for (const org of ASSISTANCE_DIRECTORY) {
    assert.ok(org.mockEmail.endsWith('.invalid'), `Unsafe mock email: ${org.mockEmail}`);
    assert.ok(org.mockWebsite.endsWith('.invalid'), `Unsafe mock website: ${org.mockWebsite}`);
    assert.equal(org.verificationStatus, 'mock_pending_verification');
  }
  const emergency = ASSISTANCE_DIRECTORY.find((o) => o.category === 'emergency_legal_protection');
  assert.ok(emergency && emergency.isEmergencyFree);
});

// 4. Case State Machine (All 8 Organisational States) (§13)
test('Case state machine derives all 8 internal organisational states accurately', () => {
  assert.equal(Object.keys(CASE_STATE_LABELS).length, 8);
  const citPathway = getPathwayById('citizenship')!;
  const baseCase: AdminCase = {
    id: 'test-case-1',
    title: 'Citizenship Naturalisation Prep (Test)',
    pathwayId: 'citizenship',
    institutionLabel: citPathway.institutionExample,
    referenceLabel: 'DEMO-TEST-01',
    state: 'not_started',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
    checklist: citPathway.defaultChecklist.map((item, idx) => ({
      ...item,
      id: `item-${idx}`,
      completed: false,
    })),
    blockers: [],
    notes: [],
    followUps: [],
    correspondence: [],
    timeline: [],
  };

  // not_started
  assert.equal(deriveNextCaseState(baseCase), 'not_started');

  // preparing_information (1 item completed, prerequisites not all done)
  const step1Done: AdminCase = {
    ...baseCase,
    checklist: baseCase.checklist.map((i, idx) => (idx === 0 ? { ...i, completed: true } : i)),
  };
  assert.equal(deriveNextCaseState(step1Done), 'preparing_information');

  // ready_for_next_action (all prerequisites done, other items pending)
  const prereqsDone: AdminCase = {
    ...baseCase,
    checklist: baseCase.checklist.map((i) => (i.isPrerequisite ? { ...i, completed: true } : i)),
  };
  assert.equal(deriveNextCaseState(prereqsDone), 'ready_for_next_action');

  // blocked (active blocker overrides checklist progress)
  const blockedCase: AdminCase = {
    ...prereqsDone,
    blockers: [
      {
        id: 'b1',
        type: 'long_wait',
        title: 'Delayed response',
        details: 'Waiting 6 months',
        guidanceSteps: BLOCKER_PRESETS.long_wait.guidanceSteps,
        createdAt: new Date().toISOString(),
        resolved: false,
      },
    ],
  };
  assert.equal(deriveNextCaseState(blockedCase), 'blocked');

  // follow_up_scheduled (blocker resolved + pending follow-up)
  const followUpCase: AdminCase = {
    ...blockedCase,
    blockers: blockedCase.blockers.map((b) => ({ ...b, resolved: true })),
    followUps: [
      {
        id: 'fu1',
        title: 'Send polite follow-up',
        dueDate: '2026-12-10',
        planStatement: 'Follow up in writing',
        channel: 'email',
        completed: false,
      },
    ],
  };
  assert.equal(deriveNextCaseState(followUpCase), 'follow_up_scheduled');

  // action_recorded (all checklist items done, no pending follow-ups, no correspondence)
  const allDone: AdminCase = {
    ...baseCase,
    checklist: baseCase.checklist.map((i) => ({ ...i, completed: true })),
  };
  assert.equal(deriveNextCaseState(allDone), 'action_recorded');
  assert.equal(getCaseProgress(allDone).percent, 100);

  // awaiting_response (all checklist items done + correspondence saved)
  const awaitingCase: AdminCase = {
    ...allDone,
    correspondence: [
      {
        id: 'c1',
        templateType: 'application_followup',
        subject: 'Follow-up',
        recipientLabel: 'Office',
        body: 'Demo body',
        createdAt: new Date().toISOString(),
      },
    ],
  };
  assert.equal(deriveNextCaseState(awaitingCase), 'awaiting_response');

  // closed (manual closed preserved)
  assert.equal(deriveNextCaseState({ ...awaitingCase, state: 'closed' }), 'closed');
});

// 5. 6-Tier Deterministic Action Centre Engine (§10, §11)
test('Deterministic 6-tier Next Recommended Action engine prioritises, recalculates, postpones, and dismisses accurately', () => {
  const populated = createInitialDemoState(true);
  const recs = computeActionRecommendations(populated);
  assert.ok(recs.length >= 4, 'Expected multiple prioritised recommendations');
  assert.equal(recs[0].priorityRank, 1, 'Top recommendation should be priority 1 (urgent target date)');
  for (let i = 1; i < recs.length; i++) {
    assert.ok(recs[i].priorityRank >= recs[i - 1].priorityRank, 'Recommendations must be sorted by priorityRank');
  }

  // Dismissing top recommendation surfaces the next recommendation cleanly
  const dismissedTop = computeActionRecommendations({
    ...populated,
    dismissedRecommendationIds: [recs[0].id],
  });
  assert.notEqual(dismissedTop[0].id, recs[0].id);

  // Postponing a recommendation to a future date hides it
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 5);
  const postponed = computeActionRecommendations({
    ...populated,
    postponedRecommendations: { [recs[0].id]: futureDate.toISOString().slice(0, 10) },
  });
  assert.ok(!postponed.some((r) => r.id === recs[0].id));

  // Empty workspace surfaces Priority 6 getting-started + rights reading
  const empty = createEmptyDemoState();
  const emptyRecs = computeActionRecommendations(empty);
  assert.ok(emptyRecs.some((r) => r.id === 'rec-edu-start-case' && r.priorityRank === 6));
  assert.ok(emptyRecs.some((r) => r.id === 'rec-edu-rights' && r.priorityRank === 6));
});

// 6. Correspondence Studio & Case Report Generation (§14)
test('All 5 correspondence templates populate case metadata and case report exports cleanly', () => {
  assert.equal(CORRESPONDENCE_TEMPLATES.length, 5);
  const state = createInitialDemoState(true);
  const prCase = state.cases[0];
  for (const tpl of CORRESPONDENCE_TEMPLATES) {
    const built = buildCorrespondenceTemplate(tpl.type, prCase, state.user.displayName);
    assert.ok(built.subject.includes(prCase.referenceLabel));
    assert.ok(built.body.includes(state.user.displayName));
    assert.ok(built.body.includes('Fictional demonstration template'));
  }
  const report = buildCaseReportText(prCase, state.user.displayName);
  assert.ok(report.includes(prCase.title));
  assert.ok(report.includes(prCase.referenceLabel));
  assert.ok(report.includes('NOT an official government status check'));
});

// 7. Document Vault Expiry & Missing-Document Detection (§17)
test('Vault expiry engine detects expired, expiring_soon, valid, no_expiry, and missing case documents', () => {
  const offset = (d: number) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + d);
    return dt.toISOString().slice(0, 10);
  };
  const makeDoc = (expiryDate?: string): VaultDocument => ({
    id: 'd-test',
    title: 'Sample Doc',
    category: 'identity',
    fictionalRefCode: 'SAMPLE-1',
    holderName: 'Demo',
    issueDate: offset(-100),
    expiryDate,
    notes: '',
    sampleTemplate: 'permit_card',
    createdAt: new Date().toISOString(),
  });

  assert.equal(getDocumentExpiryStatus(makeDoc(offset(-3))).status, 'expired');
  assert.equal(getDocumentExpiryStatus(makeDoc(offset(10))).status, 'expiring_soon');
  assert.equal(getDocumentExpiryStatus(makeDoc(offset(90))).status, 'valid');
  assert.equal(getDocumentExpiryStatus(makeDoc(undefined)).status, 'no_expiry');

  const demo = createInitialDemoState(true);
  const missing = getMissingDocumentsForCases(demo.cases, demo.vaultDocuments);
  assert.ok(Array.isArray(missing));
  // Removing all vault documents increases missing-document indicators for uncompleted checklist steps
  const missingWhenEmpty = getMissingDocumentsForCases(demo.cases, []);
  assert.ok(missingWhenEmpty.length >= missing.length);
});

// 8. Multilingual Parity & Guest/Account Presets (§9, §19)
test('EN, AM, and TI dictionaries have complete key parity and valid demo/guest account presets', () => {
  assert.equal(SUPPORTED_LANGUAGES.length, 3);
  for (const lang of ['en', 'am', 'ti'] as const) {
    assert.equal(Object.keys(DOC_STATUS_LABELS[lang]).length, 8);
    for (const key of [
      'nav.home',
      'nav.cases',
      'nav.rights',
      'nav.vault',
      'nav.profile',
      'home.searchPlaceholder',
      'theme.dark',
      'theme.light',
      'onboarding.welcomeTitle',
      'vault.disclaimer',
      'notifications.noDelivery',
    ]) {
      const val = translate(lang, key);
      assert.ok(val && val !== key, `Missing ${lang} translation for ${key}`);
    }
  }
  assert.equal(DEMO_ACCOUNTS.guest.isGuest, true);
  assert.equal(DEMO_ACCOUNTS.phone.isGuest, false);
  assert.equal(DEMO_ACCOUNTS.email.isGuest, false);
  assert.equal(DEMO_ACCOUNTS.google.isGuest, false);
});

// 9. Input Sanitisation & Invalid Input Rejection (§24, §25)
test('sanitiseInput strips angle brackets & control characters and enforces max lengths', () => {
  assert.equal(sanitiseInput('<script>alert(1)</script>'), 'scriptalert(1)/script');
  assert.equal(sanitiseInput('<<<>>>'), '');
  assert.equal(sanitiseInput('   \u0000\u0007  '), '');
  assert.equal(sanitiseInput('a'.repeat(500), 100).length, 100);
});

// 10. Static Security, Design Tokens, PWA, and Zero-AI-API Audit (§4, §6, §17, §23, §24)
test('Codebase enforces zero AI APIs, zero real file pickers, F1 design tokens, and PWA manifest/icons', () => {
  assert.equal(MEBT_TOKENS.colors.light.primaryBlue, '#075DEB');
  assert.equal(MEBT_TOKENS.colors.light.accentAmber, '#FFB300');
  assert.equal(MEBT_TOKENS.colors.light.deepNavy, '#09234F');
  assert.equal(MEBT_TOKENS.accessibility.minTouchTargetPx, 44);

  const srcDir = path.resolve(process.cwd(), 'src');
  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((ent) => {
      const full = path.join(dir, ent.name);
      return ent.isDirectory() ? walk(full) : [full];
    });
  const srcFiles = walk(srcDir);
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    assert.ok(!content.includes('@google/genai'), `Forbidden @google/genai import in ${file}`);
    assert.ok(!content.includes('GEMINI_API_KEY'), `Forbidden GEMINI_API_KEY reference in ${file}`);
    assert.ok(!/type\s*=\s*["']file["']/.test(content), `Forbidden file upload input in ${file}`);
    assert.ok(!content.includes('window.alert('), `Forbidden window.alert in ${file}`);
  }

  // PWA assets & manifest check
  const manifestPath = path.resolve(process.cwd(), 'public/manifest.webmanifest');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.short_name, 'MEBT');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.theme_color, '#075DEB');
  assert.ok(manifest.icons.length >= 3);
  for (const icon of [
    'public/icon.svg',
    'public/apple-touch-icon.png',
    'public/pwa-192x192.png',
    'public/pwa-512x512.png',
    'public/pwa-maskable-512x512.png',
    'public/sw.js',
  ]) {
    assert.ok(fs.existsSync(path.resolve(process.cwd(), icon)), `Missing PWA asset: ${icon}`);
  }
});

const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;
console.log(`\nSummary: ${passed}/${results.length} passed, ${failed} failed.\n`);

if (failed > 0) {
  process.exit(1);
}
