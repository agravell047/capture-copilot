# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: capturepilot-demo.spec.js >> CapturePilot Demo Walkthrough >> ACT 1 — Pipeline view and VA detail
- Location: tests\capturepilot-demo.spec.js:16:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h2').filter({ hasText: 'VA Benefits Platform Modernization' })
Expected: visible
Error: strict mode violation: locator('h2').filter({ hasText: 'VA Benefits Platform Modernization' }) resolved to 2 elements:
    1) <h2>VA Benefits Platform Modernization</h2> aka getByRole('heading', { name: 'VA Benefits Platform' }).first()
    2) <h2>VA Benefits Platform Modernization</h2> aka getByRole('heading', { name: 'VA Benefits Platform' }).nth(1)

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h2').filter({ hasText: 'VA Benefits Platform Modernization' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - button "CapturePilot" [ref=e6] [cursor=pointer]
    - generic [ref=e8]:
      - button "Pipeline" [ref=e9] [cursor=pointer]
      - button "Settings" [ref=e10] [cursor=pointer]
      - button "+ New Capture" [ref=e11] [cursor=pointer]
  - main [ref=e12]:
    - generic [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]:
          - heading "VA Benefits Platform Modernization" [level=2] [ref=e16]
          - paragraph [ref=e17]: Opportunity detail, analysis history, and evolving capture context.
        - generic [ref=e18]:
          - button "Back to Portfolio" [ref=e19] [cursor=pointer]
          - button "Close Opportunity" [ref=e20] [cursor=pointer]
          - button "Edit Opportunity" [ref=e21] [cursor=pointer]
      - generic [ref=e22]:
        - generic [ref=e23]:
          - generic [ref=e24]:
            - heading "VA Benefits Platform Modernization" [level=2] [ref=e25]
            - paragraph [ref=e26]: Department of Veterans Affairs
            - paragraph [ref=e27]: 50-200M • SPRUCE IDIQ • SDVOSB
            - paragraph [ref=e28]: "Last updated: Apr 25, 2026, 6:56 PM"
            - paragraph [ref=e29]: "Status: active"
          - generic [ref=e30]:
            - generic [ref=e31]:
              - generic [ref=e32]: 76%
              - generic [ref=e33]: pWin
            - button "Re-run Analysis" [ref=e34] [cursor=pointer]
        - generic [ref=e35]:
          - heading "Opportunity Snapshot" [level=3] [ref=e36]
          - generic [ref=e37]:
            - generic [ref=e38]:
              - term [ref=e39]: Gate
              - definition [ref=e40]: Gate 2
            - generic [ref=e41]:
              - term [ref=e42]: Agency
              - definition [ref=e43]: Department of Veterans Affairs
            - generic [ref=e44]:
              - term [ref=e45]: Vehicle
              - definition [ref=e46]: SPRUCE IDIQ
            - generic [ref=e47]:
              - term [ref=e48]: Set-Aside
              - definition [ref=e49]: SDVOSB
            - generic [ref=e50]:
              - term [ref=e51]: Timeline
              - definition [ref=e52]: Draft RFP expected May 15, 2026; final RFP June 10, 2026; proposals due July 2, 2026; award forecast Q4 2026.
            - generic [ref=e53]:
              - term [ref=e54]: Relationships
              - definition [ref=e55]: James Okafor met Program Director Erin James at the VA Industry Day on April 3rd and received a warm introduction from our teaming partner (CloudBridge Federal), who has an active task order with the VA IT Modernization office. Priya Nair has a standing working relationship with the Technical Authority, Michael Chen, from a prior CMS engagement. No direct contracting officer relationship confirmed — targeted outreach planned for May.
            - generic [ref=e56]:
              - term [ref=e57]: Evaluation
              - definition [ref=e58]: Best Value Tradeoff
        - generic [ref=e59]:
          - generic [ref=e60]:
            - heading "Stakeholders" [level=3] [ref=e61]
            - list [ref=e62]:
              - listitem [ref=e63]:
                - strong [ref=e64]: Erin James
                - text: "— Program Director (VA Benefits Delivery Office (BDO)) • moderate • next: 2026-05-02"
              - listitem [ref=e65]:
                - strong [ref=e66]: Michael Chen
                - text: "— Contracting Officer's Representative (COR) / Technical Authority (VA Office of Information & Technology (OIT)) • moderate • next: 2026-05-05"
              - listitem [ref=e67]:
                - strong [ref=e68]: Sandra Patel
                - text: "— Contracting Officer (VA Network Contracting Office 4 (NCO-4)) • weak • next: 2026-05-15"
          - generic [ref=e69]:
            - heading "Sources / Evidence" [level=3] [ref=e70]
            - list [ref=e71]:
              - listitem [ref=e72]:
                - strong [ref=e73]: VA Industry Day Briefing — April 3, 2026
                - text: —
                - link "https://sam.gov/opp/va-bcms-modernization-industry-day" [ref=e74] [cursor=pointer]:
                  - /url: https://sam.gov/opp/va-bcms-modernization-industry-day
                - text: — Program Director Erin James emphasized cloud security, veteran UX, and implementation risk as the top three evaluation discriminators. She explicitly called out failed migrations at peer agencies as a cautionary benchmark.
              - listitem [ref=e75]:
                - strong [ref=e76]: CloudBridge Federal — Teaming Letter of Intent
                - text: —
                - link "https://internal.apexfederal.com/partnerships/cloudbridge-loi-2026" [ref=e77] [cursor=pointer]:
                  - /url: https://internal.apexfederal.com/partnerships/cloudbridge-loi-2026
                - text: — CloudBridge Federal confirmed intent to team as subcontractor. They hold FedRAMP Moderate authorization, an active VA BCMS task order (expires Sept 2026), and a TS facility clearance. Their inclusion closes our two largest proposal risks.
              - listitem [ref=e78]:
                - strong [ref=e79]: "SAM.gov Pre-Solicitation Notice #VA-2026-BCMS-001"
                - text: —
                - link "https://sam.gov/opp/va-bcms-2026-presolicitation" [ref=e80] [cursor=pointer]:
                  - /url: https://sam.gov/opp/va-bcms-2026-presolicitation
                - text: — Pre-solicitation confirms SPRUCE IDIQ vehicle, SDVOSB set-aside, 5-year base with two 1-year options. PWS mentions ATO, Section 508, and DevSecOps as mandatory components.
          - generic [ref=e81]:
            - heading "Description" [level=3] [ref=e82]
            - paragraph [ref=e83]: Modernize and migrate the VA Benefits Case Management System (BCMS) to a FedRAMP-authorized cloud environment. Scope includes re-platforming a Java/COBOL monolith to a microservices architecture on AWS GovCloud, full data migration for 6.2M active veteran records, implementation of a DevSecOps pipeline, ATO preparation and continuous monitoring, ransomware resilience and backup architecture, Section 508-compliant veteran-facing portal, and change management/training for 4,200 VA staff across 57 regional offices.
          - generic [ref=e84]:
            - heading "Internal Notes" [level=3] [ref=e85]
            - paragraph [ref=e86]: Apex is SDVOSB and positioned to lead as prime. Pursuing teaming with CloudBridge Federal (FedRAMP Moderate authorized, active VA incumbent) to cover authorization risk. FedRAMP Moderate ATO under our own UEI is 60% complete, targeting provisional authorization by August 2026. Compressed proposal timeline is the primary execution risk — Sofia is already building the compliance matrix. Incumbent (DataCore Systems) has an expiring task order; buyer signaled intent to compete fully.
        - generic [ref=e87]:
          - generic [ref=e88]:
            - heading "Fit Assessment" [level=3] [ref=e89]
            - generic [ref=e90]:
              - generic [ref=e91]: Strong
              - paragraph [ref=e92]: Apex is SDVOSB-eligible prime on an SDVOSB-set-aside contract, holds a teaming agreement that closes the FedRAMP gap, has direct relationships with two of three key stakeholders, and the scope maps precisely to our cloud modernization, DevSecOps, and ATO delivery capabilities.
              - heading "Why" [level=4] [ref=e93]
              - list [ref=e94]:
                - listitem [ref=e95]: SDVOSB prime eligibility confirmed — set-aside is a direct qualifier.
                - listitem [ref=e96]: Teaming agreement with CloudBridge Federal closes the FedRAMP Moderate authorization gap and brings incumbent-adjacent credibility.
                - listitem [ref=e97]: CTO Priya Nair has an existing working relationship with the Technical Authority from a prior CMS engagement.
                - listitem [ref=e98]: Program Director relationship is active and advancing — white paper request signals genuine buyer interest.
                - listitem [ref=e99]: Scope covers all eight listed PWS components, with no capability gaps requiring new hires or unfamiliar tooling.
              - heading "Strengths" [level=4] [ref=e100]
              - list [ref=e101]:
                - listitem [ref=e102]: Prime-eligible SDVOSB with confirmed set-aside alignment
                - listitem [ref=e103]: Teaming partner closes FedRAMP and ATO risk on Day 1
                - listitem [ref=e104]: Active, advancing relationships with Program Director and Technical Authority
                - listitem [ref=e105]: Proven cloud migration and DevSecOps delivery on comparable federal programs
                - listitem [ref=e106]: Incumbent task order expires — open competitive landscape
          - generic [ref=e107]:
            - heading "Gap Analysis" [level=3] [ref=e108]
            - paragraph [ref=e109]: Severity shows estimated impact on win probability (higher = bigger risk to winning).
            - list [ref=e110]:
              - listitem [ref=e111]:
                - 'generic "Severity: medium. Higher means a larger negative impact on win probability." [ref=e113]': MEDIUM
                - generic [ref=e114]:
                  - paragraph [ref=e115]: Contracting Officer Relationship
                  - paragraph [ref=e116]: No direct relationship with Contracting Officer Sandra Patel at NCO-4. Outreach is planned but not yet executed.
                  - paragraph [ref=e117]: "Mitigation: James is pursuing a warm introduction through our VA OAMP PCO contact. First touch targeted for May 15 — ahead of draft RFP release."
              - listitem [ref=e118]:
                - 'generic "Severity: medium. Higher means a larger negative impact on win probability." [ref=e120]': MEDIUM
                - generic [ref=e121]:
                  - paragraph [ref=e122]: Proposal Timeline
                  - paragraph [ref=e123]: Draft RFP to proposal submission window is approximately 7 weeks. Complex technical volume and past performance write-ups require early resourcing.
                  - paragraph [ref=e124]: "Mitigation: Sofia has begun compliance matrix and volume shells. Kickoff proposal team meeting scheduled for May 1."
              - listitem [ref=e125]:
                - 'generic "Severity: low. Higher means a larger negative impact on win probability." [ref=e127]': LOW
                - generic [ref=e128]:
                  - paragraph [ref=e129]: Own FedRAMP ATO
                  - paragraph [ref=e130]: Apex standalone FedRAMP Moderate ATO is 60% complete and may not reach provisional authorization before proposals are due.
                  - paragraph [ref=e131]: "Mitigation: CloudBridge Federal authorization will be cited as the primary compliance path. Apex ATO progress documented as supplemental evidence of commitment."
          - generic [ref=e132]:
            - heading "Recommendation" [level=3] [ref=e133]
            - generic [ref=e134]:
              - generic [ref=e135]: Go
              - paragraph [ref=e136]: Proceed as SDVOSB prime with full capture investment. The combination of set-aside fit, teaming closure, advancing stakeholder relationships, and scope alignment makes this a top-tier pipeline opportunity.
              - heading "Next Steps" [level=4] [ref=e137]
              - list [ref=e138]:
                - listitem [ref=e139]: Finalize and deliver white paper on phased migration approach to Erin James by May 1.
                - listitem [ref=e140]: Secure CO introduction through VA OAMP PCO contact before May 15.
                - listitem [ref=e141]: "Lock key personnel commitments (PM: Marcus Webb, CTO: Priya Nair) and prepare bios."
                - listitem [ref=e142]: Kick off proposal team with Sofia on May 1 — begin technical volume shell and past performance write-ups.
                - listitem [ref=e143]: Formalize CloudBridge teaming agreement (move from LOI to signed NDA + teaming agreement) by April 30.
        - generic [ref=e144]:
          - generic [ref=e145]:
            - generic [ref=e146]:
              - heading "Proposed Capture Team" [level=3] [ref=e147]
              - paragraph [ref=e148]: Recommended by the AI based on skills, experience, and opportunity fit. Names and emails are resolved locally — they were never sent to the AI.
            - button "Invite Team by Email" [ref=e149] [cursor=pointer]
          - list [ref=e150]:
            - listitem [ref=e151]:
              - generic [ref=e152]:
                - strong [ref=e153]: James Okafor
                - generic [ref=e154]: Capture Lead
                - generic [ref=e155]: VP of Capture & Business Development
              - paragraph [ref=e156]: James Okafor drives the capture strategy and owns the buyer relationship with VA BDO.
            - listitem [ref=e157]:
              - generic [ref=e158]:
                - strong [ref=e159]: Priya Nair
                - generic [ref=e160]: Technical Volume Lead
                - generic [ref=e161]: Chief Technology Officer
              - paragraph [ref=e162]: Priya Nair's FedRAMP, AWS GovCloud, and DevSecOps expertise anchors the technical approach for this cloud migration.
            - listitem [ref=e163]:
              - generic [ref=e164]:
                - strong [ref=e165]: Marcus Webb
                - generic [ref=e166]: Program Manager
                - generic [ref=e167]: Director of Program Delivery
              - paragraph [ref=e168]: Marcus Webb has the VA relationship via CloudBridge teaming contact and federal CPARS reporting background needed for delivery.
            - listitem [ref=e169]:
              - generic [ref=e170]:
                - strong [ref=e171]: Sofia Reyes
                - generic [ref=e172]: Proposal Manager
                - generic [ref=e173]: Lead Proposal Manager
              - paragraph [ref=e174]: Sofia Reyes owns the compliance matrix and color reviews — critical for this compressed proposal timeline.
            - listitem [ref=e175]:
              - generic [ref=e176]:
                - strong [ref=e177]: Patrick O'Brien
                - generic [ref=e178]: Key Personnel — Legacy Migration Lead
                - generic [ref=e179]: Senior Software Engineer
              - paragraph [ref=e180]: Patrick O'Brien's COBOL modernization and Java migration background directly addresses the Java/COBOL monolith re-platforming core requirement.
            - listitem [ref=e181]:
              - generic [ref=e182]:
                - strong [ref=e183]: Alicia Fontaine
                - generic [ref=e184]: Key Personnel — DevSecOps Lead
                - generic [ref=e185]: DevSecOps Lead
              - paragraph [ref=e186]: Alicia Fontaine's ATO pipeline automation and SAST/DAST credentials are directly responsive to the FedRAMP Moderate and DevSecOps mandatory PWS components.
            - listitem [ref=e187]:
              - generic [ref=e188]:
                - strong [ref=e189]: Aisha Obi
                - generic [ref=e190]: Key Personnel — UX Lead
                - generic [ref=e191]: Lead UX Designer
              - paragraph [ref=e192]: Aisha Obi's veteran-facing UX and Section 508 expertise are directly relevant to the veteran portal redesign scope.
        - generic [ref=e193]:
          - heading "Feasibility Factors" [level=3] [ref=e194]
          - generic [ref=e195]:
            - generic [ref=e196]:
              - generic [ref=e197]: Vehicle Fit
              - generic [ref=e198]: Strong
            - generic [ref=e199]:
              - generic [ref=e200]: Set-Aside Alignment
              - generic [ref=e201]: Strong
            - generic [ref=e202]:
              - generic [ref=e203]: Relationship Coverage
              - generic [ref=e204]: Moderate
            - generic [ref=e205]:
              - generic [ref=e206]: Timeline Feasibility
              - generic [ref=e207]: Manageable
            - generic [ref=e208]:
              - generic [ref=e209]: Scope Alignment
              - generic [ref=e210]: Strong
            - generic [ref=e211]:
              - generic [ref=e212]: Teaming Strength
              - generic [ref=e213]: Strong
        - generic [ref=e214]:
          - generic [ref=e216]:
            - heading "Activity Log / Updates" [level=3] [ref=e217]
            - paragraph [ref=e218]: Context changes are stored with the opportunity and used in each re-analysis.
          - list [ref=e221]:
            - listitem [ref=e222]:
              - generic [ref=e223]:
                - generic [ref=e224]: Note
                - generic [ref=e225]: Apr 3, 2026, 2:00 PM
              - paragraph [ref=e226]: Attended VA BCMS Industry Day. Erin James confirmed SDVOSB set-aside and SPRUCE IDIQ vehicle. CloudBridge Federal also attended — connected afterward and explored teaming. Strong alignment on scope and gaps.
            - listitem [ref=e227]:
              - generic [ref=e228]:
                - generic [ref=e229]: Note
                - generic [ref=e230]: Apr 11, 2026, 10:00 AM
              - paragraph [ref=e231]: Submitted formal RFI response highlighting our phased migration methodology and SDVOSB prime posture. Erin James requested a one-pager on our DevSecOps pipeline — forwarded to Priya to draft.
            - listitem [ref=e232]:
              - generic [ref=e233]:
                - generic [ref=e234]: Note
                - generic [ref=e235]: Apr 18, 2026, 6:30 AM
              - paragraph [ref=e236]: Signed LOI with CloudBridge Federal. They will contribute FedRAMP Moderate authorization, ATO documentation artifacts, and 2 FTEs (cybersecurity lead + systems architect) as named subcontractor personnel.
            - listitem [ref=e237]:
              - generic [ref=e238]:
                - generic [ref=e239]: Field Update
                - generic [ref=e240]: Apr 20, 2026, 6:30 AM
              - paragraph [ref=e241]: Updated gate from 1 to 2 — opportunity cleared go/no-go review. Approved for full capture investment.
              - paragraph [ref=e242]:
                - text: "Field:"
                - strong [ref=e243]: gate
                - text: "-> 2"
            - listitem [ref=e244]:
              - generic [ref=e245]:
                - generic [ref=e246]: Note
                - generic [ref=e247]: Apr 22, 2026, 12:00 PM
              - paragraph [ref=e248]: Technical call with Michael Chen completed. Priya presented zero-trust reference architecture. Chen requested our CI/CD toolchain brief and ATO evidence package. Follow-up scheduled May 5.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // ─────────────────────────────────────────────────────────────────────────────
  4   | // CapturePilot Live Demo Walkthrough
  5   | // Runs the exact flow described in DEMO.md using the exact field values.
  6   | // Run headed so the audience can watch:
  7   | //   npx playwright test capturepilot-demo.spec.js --headed --project chromium
  8   | // ─────────────────────────────────────────────────────────────────────────────
  9   | 
  10  | const PAUSE = 900;   // ms between steps — feels natural when watched
  11  | const LONG  = 1800;  // pause after big actions (submit, page load)
  12  | 
  13  | test.describe('CapturePilot Demo Walkthrough', () => {
  14  | 
  15  |   // ── ACT 1: Pipeline view ──────────────────────────────────────────────────
  16  |   test('ACT 1 — Pipeline view and VA detail', async ({ page }) => {
  17  |     await page.goto('/');
  18  |     await page.waitForTimeout(LONG);
  19  | 
  20  |     // Should land on the Pipeline / portfolio page
  21  |     await expect(page.locator('h1, h2').first()).toBeVisible();
  22  |     await page.waitForTimeout(PAUSE);
  23  | 
  24  |     // Switch to Table view
  25  |     const tableBtn = page.locator('button').filter({ hasText: /^Table$/ });
  26  |     if (await tableBtn.isVisible()) {
  27  |       await tableBtn.click();
  28  |       await page.waitForTimeout(PAUSE);
  29  |     }
  30  | 
  31  |     // Switch back to Board view
  32  |     const boardBtn = page.locator('button').filter({ hasText: /^Board$/ });
  33  |     if (await boardBtn.isVisible()) {
  34  |       await boardBtn.click();
  35  |       await page.waitForTimeout(PAUSE);
  36  |     }
  37  | 
  38  |     // Click into VA Benefits Platform Modernization
  39  |     await page.locator('text=VA Benefits Platform Modernization').first().click();
  40  |     await page.waitForTimeout(LONG);
  41  | 
  42  |     // Verify detail page loaded
> 43  |     await expect(page.locator('h2').filter({ hasText: 'VA Benefits Platform Modernization' })).toBeVisible();
      |                                                                                                ^ Error: expect(locator).toBeVisible() failed
  44  |     await page.waitForTimeout(PAUSE);
  45  | 
  46  |     // Scroll through the analysis sections
  47  |     await page.locator('text=Fit Assessment').first().scrollIntoViewIfNeeded();
  48  |     await page.waitForTimeout(PAUSE);
  49  |     await page.locator('text=Gap Analysis').first().scrollIntoViewIfNeeded();
  50  |     await page.waitForTimeout(PAUSE);
  51  |     await page.locator('text=Recommendation').first().scrollIntoViewIfNeeded();
  52  |     await page.waitForTimeout(PAUSE);
  53  | 
  54  |     // Proposed team card
  55  |     await page.locator('text=Proposed Capture Team').first().scrollIntoViewIfNeeded();
  56  |     await page.waitForTimeout(LONG);
  57  | 
  58  |     // Verify the team card is present
  59  |     await expect(page.locator('.proposed-team-card')).toBeVisible();
  60  |     await expect(page.locator('.proposed-team-list .proposed-team-member').first()).toBeVisible();
  61  |     await page.waitForTimeout(PAUSE);
  62  | 
  63  |     // Activity Log
  64  |     await page.locator('text=Activity Log').first().scrollIntoViewIfNeeded();
  65  |     await page.waitForTimeout(PAUSE);
  66  | 
  67  |     // Go back to Pipeline
  68  |     await page.locator('button').filter({ hasText: 'Back to Portfolio' }).click();
  69  |     await page.waitForTimeout(LONG);
  70  |   });
  71  | 
  72  |   // ── ACT 2 + 3: New Capture — SSA data — AI Result ────────────────────────
  73  |   test('ACT 2+3 — New capture and AI analysis', async ({ page }) => {
  74  |     await page.goto('/');
  75  |     await page.waitForTimeout(LONG);
  76  | 
  77  |     // Navigate to New Capture via navbar
  78  |     await page.locator('button.nav-button-cta').filter({ hasText: '+ New Capture' }).click();
  79  |     await page.waitForTimeout(LONG);
  80  | 
  81  |     await expect(page.locator('h1, h2').filter({ hasText: /New Capture|Opportunity/i }).first()).toBeVisible();
  82  |     await page.waitForTimeout(PAUSE);
  83  | 
  84  |     // ── Opportunity Name ──
  85  |     await page.locator('#opportunityName').fill('SSA Disability Claims Processing Modernization');
  86  |     await page.waitForTimeout(PAUSE);
  87  | 
  88  |     // ── Agency ──
  89  |     await page.locator('#agency').selectOption('Social Security Administration');
  90  |     await page.waitForTimeout(PAUSE);
  91  | 
  92  |     // ── Contract Value ──
  93  |     await page.locator('#contractValue').selectOption('5-50M');
  94  |     await page.waitForTimeout(PAUSE);
  95  | 
  96  |     // ── Vehicle ──
  97  |     await page.locator('#vehicle').selectOption('OASIS+');
  98  |     await page.waitForTimeout(PAUSE);
  99  | 
  100 |     // ── Set-Aside ──
  101 |     await page.locator('#setAside').selectOption('SDVOSB');
  102 |     await page.waitForTimeout(PAUSE);
  103 | 
  104 |     // ── Gate ──  click the Gate 1 card
  105 |     const gate1Card = page.locator('.gate-card').filter({ hasText: /Gate 1|Qualify/i });
  106 |     await gate1Card.click();
  107 |     await page.waitForTimeout(PAUSE);
  108 | 
  109 |     // ── Timeline ──
  110 |     const timelineField = page.locator('#timeline');
  111 |     await timelineField.fill(
  112 |       'Sources Sought issued April 14, 2026; RFP anticipated September 2026; award expected Q1 2027. Five-year IDIQ base with two option years.'
  113 |     );
  114 |     await page.waitForTimeout(PAUSE);
  115 | 
  116 |     // ── Description ──
  117 |     const descField = page.locator('#description');
  118 |     await descField.fill(
  119 |       "Modernize SSA's Disability Case Management System — a 30-year-old COBOL/mainframe platform processing 2.8 million annual disability claims. " +
  120 |       'Scope includes phased cloud migration to AWS GovCloud, legacy COBOL rewrite to Java/Spring microservices, integration with SSA\'s existing ' +
  121 |       'Numident and MBR databases, Section 508-compliant claimant portal redesign, DevSecOps pipeline implementation, and FedRAMP Moderate ATO preparation. ' +
  122 |       'Requires continuity-of-operations planning for 24/7 claims processing during migration.'
  123 |     );
  124 |     await page.waitForTimeout(PAUSE);
  125 | 
  126 |     // ── Known Relationships ──
  127 |     const relField = page.locator('#knownRelationships');
  128 |     if (await relField.isVisible()) {
  129 |       await relField.fill(
  130 |         'Marcus Webb attended the SSA IT Modernization Industry Day on April 9th and had a brief conversation with the program\'s Deputy CIO. ' +
  131 |         'No formal relationship yet — agency contact at SSA OIT identified but no direct outreach completed. ' +
  132 |         'Our OASIS+ vehicle PM at SSA confirmed Apex is registered and in good standing on the vehicle.'
  133 |       );
  134 |       await page.waitForTimeout(PAUSE);
  135 |     } else {
  136 |       // Field may be inside a collapsible section
  137 |       const relToggle = page.locator('button, summary').filter({ hasText: /relationship|access/i }).first();
  138 |       if (await relToggle.isVisible()) {
  139 |         await relToggle.click();
  140 |         await page.waitForTimeout(PAUSE);
  141 |         await page.locator('#knownRelationships').fill(
  142 |           'Marcus Webb attended the SSA IT Modernization Industry Day on April 9th and had a brief conversation with the program\'s Deputy CIO. ' +
  143 |           'No formal relationship yet — agency contact at SSA OIT identified but no direct outreach completed. ' +
```