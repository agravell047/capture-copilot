import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// CapturePilot Live Demo Walkthrough
// Runs the exact flow described in DEMO.md using the exact field values.
// Run headed so the audience can watch:
//   npx playwright test capturepilot-demo.spec.js --headed --project chromium
// ─────────────────────────────────────────────────────────────────────────────

const PAUSE = 1200;  // ms between steps — feels natural when watched
const LONG  = 2500;  // pause after big actions (submit, page load)

test.describe('CapturePilot Demo Walkthrough', () => {

  // ── ACT 1: Pipeline view ──────────────────────────────────────────────────
  test('ACT 1 — Pipeline view and VA detail', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(LONG);

    // Should land on the Pipeline / portfolio page
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await page.waitForTimeout(PAUSE);

    // Switch to Table view
    const tableBtn = page.locator('button').filter({ hasText: /^Table$/ });
    if (await tableBtn.isVisible()) {
      await tableBtn.click();
      await page.waitForTimeout(PAUSE);
    }

    // Switch back to Board view
    const boardBtn = page.locator('button').filter({ hasText: /^Board$/ });
    if (await boardBtn.isVisible()) {
      await boardBtn.click();
      await page.waitForTimeout(PAUSE);
    }

    // Click into VA Benefits Platform Modernization
    await page.locator('text=VA Benefits Platform Modernization').first().click();
    await page.waitForTimeout(LONG);

    // Verify detail page loaded
    await expect(page.locator('h2').filter({ hasText: 'VA Benefits Platform Modernization' })).toBeVisible();
    await page.waitForTimeout(PAUSE);

    // Scroll through the analysis sections
    await page.locator('text=Fit Assessment').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(PAUSE);
    await page.locator('text=Gap Analysis').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(PAUSE);
    await page.locator('text=Recommendation').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(PAUSE);

    // Proposed team card
    await page.locator('text=Proposed Capture Team').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(LONG);

    // Verify the team card is present
    await expect(page.locator('.proposed-team-card')).toBeVisible();
    await expect(page.locator('.proposed-team-list .proposed-team-member').first()).toBeVisible();
    await page.waitForTimeout(PAUSE);

    // Activity Log
    await page.locator('text=Activity Log').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(PAUSE);

    // Go back to Pipeline
    await page.locator('button').filter({ hasText: /Back to P/i }).first().click();
    await page.waitForTimeout(LONG);
  });

  // ── ACT 2 + 3: New Capture — SSA data — AI Result ────────────────────────
  test('ACT 2+3 — New capture and AI analysis', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(LONG);

    // Navigate to New Capture via navbar
    await page.locator('button.nav-button-cta').filter({ hasText: '+ New Capture' }).click();
    await page.waitForTimeout(LONG);

    await expect(page.locator('h1, h2').filter({ hasText: /New Capture|Opportunity/i }).first()).toBeVisible();
    await page.waitForTimeout(PAUSE);

    // ── Opportunity Name ──
    await page.locator('#opportunityName').fill('SSA Disability Claims Processing Modernization');
    await page.waitForTimeout(PAUSE);

    // ── Agency ──
    await page.locator('#agency').selectOption('Social Security Administration');
    await page.waitForTimeout(PAUSE);

    // ── Contract Value ──
    await page.locator('#contractValue').selectOption('5-50M');
    await page.waitForTimeout(PAUSE);

    // ── Vehicle ──
    await page.locator('#vehicle').selectOption('OASIS+');
    await page.waitForTimeout(PAUSE);

    // ── Set-Aside ──
    await page.locator('#setAside').selectOption('SDVOSB');
    await page.waitForTimeout(PAUSE);

    // ── Gate ──  click the Gate 1 card
    const gate1Card = page.locator('.gate-card').filter({ hasText: /Gate 1|Qualify/i });
    await gate1Card.click();
    await page.waitForTimeout(PAUSE);

    // ── Timeline ──
    const timelineField = page.locator('#timeline');
    await timelineField.fill(
      'Sources Sought issued April 14, 2026; RFP anticipated September 2026; award expected Q1 2027. Five-year IDIQ base with two option years.'
    );
    await page.waitForTimeout(PAUSE);

    // ── Description ──
    const descField = page.locator('#description');
    await descField.fill(
      "Modernize SSA's Disability Case Management System — a 30-year-old COBOL/mainframe platform processing 2.8 million annual disability claims. " +
      'Scope includes phased cloud migration to AWS GovCloud, legacy COBOL rewrite to Java/Spring microservices, integration with SSA\'s existing ' +
      'Numident and MBR databases, Section 508-compliant claimant portal redesign, DevSecOps pipeline implementation, and FedRAMP Moderate ATO preparation. ' +
      'Requires continuity-of-operations planning for 24/7 claims processing during migration.'
    );
    await page.waitForTimeout(PAUSE);

    // ── Known Relationships ──
    const relField = page.locator('#knownRelationships');
    if (await relField.isVisible()) {
      await relField.fill(
        'Marcus Webb attended the SSA IT Modernization Industry Day on April 9th and had a brief conversation with the program\'s Deputy CIO. ' +
        'No formal relationship yet — agency contact at SSA OIT identified but no direct outreach completed. ' +
        'Our OASIS+ vehicle PM at SSA confirmed Apex is registered and in good standing on the vehicle.'
      );
      await page.waitForTimeout(PAUSE);
    } else {
      // Field may be inside a collapsible section
      const relToggle = page.locator('button, summary').filter({ hasText: /relationship|access/i }).first();
      if (await relToggle.isVisible()) {
        await relToggle.click();
        await page.waitForTimeout(PAUSE);
        await page.locator('#knownRelationships').fill(
          'Marcus Webb attended the SSA IT Modernization Industry Day on April 9th and had a brief conversation with the program\'s Deputy CIO. ' +
          'No formal relationship yet — agency contact at SSA OIT identified but no direct outreach completed. ' +
          'Our OASIS+ vehicle PM at SSA confirmed Apex is registered and in good standing on the vehicle.'
        );
        await page.waitForTimeout(PAUSE);
      }
    }

    // ── Internal Notes ──
    const notesField = page.locator('#notes');
    if (await notesField.isVisible()) {
      await notesField.fill(
        'OASIS+ vehicle aligns perfectly. SDVOSB set-aside confirmed via Sources Sought. ' +
        'Biggest risk is the absence of SSA past performance — we have strong CMS and VA comparable work but no direct SSA reference. ' +
        'Need to assess the competitive landscape and identify a teaming partner with SSA incumbent access before committing full capture resources.'
      );
      await page.waitForTimeout(PAUSE);
    }

    // ── Evaluation section ──
    const evalToggle = page.locator('button').filter({ hasText: /Evaluation/i }).first();
    if (await evalToggle.isVisible()) {
      await evalToggle.click();
      await page.waitForTimeout(PAUSE);
    }

    const evalTypeSelect = page.locator('#evaluationType');
    if (await evalTypeSelect.isVisible()) {
      await evalTypeSelect.selectOption({ label: /Best Value/i });
      await page.waitForTimeout(PAUSE);
    }

    // Add evaluation criteria
    const criteriaInput = page.locator('input[placeholder*="criterion"], input[placeholder*="criteria"]').first();
    if (await criteriaInput.isVisible()) {
      const criteria = [
        'Technical approach and legacy modernization methodology (35%)',
        'Past performance on comparable federal benefits systems (30%)',
        'Management approach and key personnel (20%)',
        'Price realism (15%)'
      ];
      for (const c of criteria) {
        await criteriaInput.fill(c);
        await page.waitForTimeout(400);
        const addBtn = page.locator('button').filter({ hasText: /Add Criterion|Add/i }).first();
        await addBtn.click();
        await page.waitForTimeout(400);
      }
    }

    await page.waitForTimeout(PAUSE);

    // ── The callout pause before submitting ──
    // (In a real demo you'd narrate here — the test just pauses)
    await page.waitForTimeout(LONG);

    // ── Submit ──
    await page.locator('button[type="submit"]').filter({ hasText: /Create & Analyze/i }).click();

    // Wait for AI result (mock is fast but UI needs to render)
    await page.waitForTimeout(LONG * 2);

    // ── ACT 3: Verify AI result ──
    await expect(page.locator('.pwin-badge')).toBeVisible();
    await page.waitForTimeout(PAUSE);

    // pWin should be 52
    const pwinEl = page.locator('.pwin-value');
    await expect(pwinEl).toContainText('52');
    await page.waitForTimeout(PAUSE);

    // Fit rating
    await page.locator('.fit-rating').scrollIntoViewIfNeeded();
    await page.waitForTimeout(PAUSE);

    // Gap Analysis
    await page.locator('text=Gap Analysis').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(PAUSE);
    await expect(page.locator('.gap-list .gap-high').first()).toBeVisible();
    await page.waitForTimeout(PAUSE);

    // Recommendation
    await page.locator('text=Recommendation').first().scrollIntoViewIfNeeded();
    await expect(page.locator('.recommendation-action').filter({ hasText: /Go/i })).toBeVisible();
    await page.waitForTimeout(PAUSE);

    // Proposed Capture Team
    await page.locator('text=Proposed Capture Team').scrollIntoViewIfNeeded();
    await page.waitForTimeout(LONG);
    await expect(page.locator('.proposed-team-card')).toBeVisible();
    await expect(page.locator('.proposed-team-list .proposed-team-member')).toHaveCount(6);
    await page.waitForTimeout(PAUSE);

    // Invite button present
    await expect(page.locator('button.email-blast-btn')).toBeVisible();
    await page.waitForTimeout(PAUSE);

    // Activity Log
    await page.locator('text=Activity Log').scrollIntoViewIfNeeded();
    await page.waitForTimeout(LONG);
  });

  // ── ACT 5: Settings ───────────────────────────────────────────────────────
  test('ACT 5 — Settings page walkthrough', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(LONG);

    // Navigate to Settings
    await page.locator('button.nav-button').filter({ hasText: 'Settings' }).click();
    await page.waitForTimeout(LONG);

    // Company tab (should be default)
    await expect(page.locator('.settings-tab.active, .tab-active').first()).toBeVisible();
    await page.waitForTimeout(PAUSE);

    // Capabilities tab
    await page.locator('.settings-tab').filter({ hasText: /Capabilities/i }).click();
    await page.waitForTimeout(PAUSE);
    await expect(page.locator('text=core, text=Core').first().or(page.locator('.tier-core').first())).toBeVisible();
    await page.waitForTimeout(LONG);

    // Team tab
    await page.locator('.settings-tab').filter({ hasText: /Team/i }).click();
    await page.waitForTimeout(PAUSE);
    await expect(page.locator('.team-member').first()).toBeVisible();
    await page.waitForTimeout(PAUSE);

    // Show the add-person form by clicking the button
    await page.locator('button').filter({ hasText: '+ Add Team Member' }).click();
    await page.waitForTimeout(PAUSE);
    await page.locator('input[placeholder="Jane Doe"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(PAUSE);

    // Show CSV format section
    const csvDetails = page.locator('details').filter({ hasText: /CSV format/i });
    if (await csvDetails.isVisible()) {
      await csvDetails.locator('summary').click();
      await page.waitForTimeout(PAUSE);
      await csvDetails.scrollIntoViewIfNeeded();
      await page.waitForTimeout(LONG);
    }

    // Contacts tab
    await page.locator('.settings-tab').filter({ hasText: /Contacts/i }).click();
    await page.waitForTimeout(LONG);

    // AI Settings tab
    await page.locator('.settings-tab').filter({ hasText: /AI/i }).click();
    await page.waitForTimeout(LONG);

    // ── Keep browser open so presenter can talk ──
    // The test idles here — close the terminal or press Ctrl+C when done
    await page.waitForTimeout(300_000); // 5 minutes
  });
});
