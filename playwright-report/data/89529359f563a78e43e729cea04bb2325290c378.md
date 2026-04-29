# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: capturepilot-demo.spec.js >> CapturePilot Demo Walkthrough >> ACT 2+3 — New capture and AI analysis
- Location: tests\capturepilot-demo.spec.js:73:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.gate-card').filter({ hasText: /Gate 1|Qualify/i })

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
    - generic [ref=e14]:
      - heading "New Capture" [level=1] [ref=e15]
      - paragraph [ref=e16]: Create a new capture, run the initial analysis, and drop it into the pipeline.
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]:
            - generic [ref=e20]: Core capture details
            - generic [ref=e21]: Required fields — the AI uses everything you provide.
          - generic [ref=e22]:
            - generic [ref=e23]: Opportunity Name *
            - textbox "Opportunity Name *" [active] [ref=e24]:
              - /placeholder: e.g., DoD Cloud Migration Platform
              - text: SSA Disability Claims Processing Modernization
          - generic [ref=e25]:
            - generic [ref=e26]:
              - generic [ref=e27]: Agency *
              - combobox "Agency *" [ref=e28]:
                - option "Select an agency"
                - option "Centers for Medicare & Medicaid Services (CMS)"
                - option "Department of Homeland Security"
                - option "Department of Justice"
                - option "Department of State"
                - option "Department of the Treasury"
                - option "Department of Transportation"
                - option "Department of Veterans Affairs"
                - option "Environmental Protection Agency"
                - option "General Services Administration"
                - option "Health & Human Services"
                - option "Social Security Administration" [selected]
                - option "Department of Defense"
                - option "Defense Information Systems Agency (DISA)"
                - option "Defense Logistics Agency (DLA)"
                - option "U.S. Air Force"
                - option "U.S. Army"
                - option "U.S. Navy / Marine Corps"
                - option "Other"
            - generic [ref=e29]:
              - generic [ref=e30]: Contract Value
              - combobox "Contract Value" [ref=e31]:
                - option "< $5M"
                - option "$5M - $50M" [selected]
                - option "$50M - $200M"
                - option "$200M+"
          - generic [ref=e32]:
            - generic [ref=e33]: Capture Gate
            - generic [ref=e34]:
              - button "Gate 0 Awareness Just discovered — quick fit check only" [ref=e35] [cursor=pointer]:
                - generic [ref=e36]: Gate 0
                - generic [ref=e37]: Awareness
                - generic [ref=e38]: Just discovered — quick fit check only
              - button "Gate 1 Qualify Deciding whether to invest resources" [ref=e39] [cursor=pointer]:
                - generic [ref=e40]: Gate 1
                - generic [ref=e41]: Qualify
                - generic [ref=e42]: Deciding whether to invest resources
              - button "Gate 2 Capture Actively shaping and pursuing to win" [ref=e43] [cursor=pointer]:
                - generic [ref=e44]: Gate 2
                - generic [ref=e45]: Capture
                - generic [ref=e46]: Actively shaping and pursuing to win
              - button "Gate 3 Proposal RFP out or imminent — writing to win" [ref=e47] [cursor=pointer]:
                - generic [ref=e48]: Gate 3
                - generic [ref=e49]: Proposal
                - generic [ref=e50]: RFP out or imminent — writing to win
          - generic [ref=e51]:
            - generic [ref=e52]:
              - text: Description *
              - generic [ref=e53]: most influential field
            - textbox "Description * most influential field" [ref=e54]:
              - /placeholder: Describe the scope, requirements, and anything you know about what they're looking for. More detail = better AI analysis.
            - generic [ref=e55]:
              - generic [ref=e56]: Have the RFP? Upload it instead (PDF, DOCX, TXT)
              - button "Choose File" [ref=e57]
        - generic [ref=e59]: Enrich the analysis optional — add what you know
        - generic [ref=e60]:
          - generic [ref=e61]:
            - generic [ref=e62]:
              - generic [ref=e63]: Vehicle / Contract Type
              - combobox "Vehicle / Contract Type" [ref=e64]:
                - option "Unknown / TBD"
                - option "GSA MAS"
                - option "OASIS+" [selected]
                - option "CIO-SP3"
                - option "CIO-SP4"
                - option "SEWP V"
                - option "NASA SEWP"
                - option "Seaport NxG"
                - option "SPRUCE IDIQ"
                - option "Other"
            - generic [ref=e65]:
              - generic [ref=e66]: Set-Aside Type
              - combobox "Set-Aside Type" [ref=e67]:
                - option "Full & Open (Unrestricted)"
                - option "Small Business"
                - option "SDVOSB" [selected]
                - option "8(a)"
                - option "WOSB"
                - option "HUBZone"
                - option "VOSB"
          - generic [ref=e68]:
            - generic [ref=e69]: Timeline / Key Dates
            - textbox "Timeline / Key Dates" [ref=e70]:
              - /placeholder: e.g., RFP expected Q3 2026, proposals due 30 days after
        - button "Evaluation Optional How will the winner be scored? LPTA vs. Best Value changes pricing strategy completely. +" [ref=e72] [cursor=pointer]:
          - generic [ref=e73]:
            - generic [ref=e74]:
              - heading "Evaluation" [level=2] [ref=e75]
              - generic [ref=e76]: Optional
            - paragraph [ref=e77]: How will the winner be scored? LPTA vs. Best Value changes pricing strategy completely.
          - generic [ref=e78]: +
        - button "Known Relationships / Access Signals Optional Incumbent presence, prior engagement, or insider intel that shapes your competitive position. +" [ref=e80] [cursor=pointer]:
          - generic [ref=e81]:
            - generic [ref=e82]:
              - heading "Known Relationships / Access Signals" [level=2] [ref=e83]
              - generic [ref=e84]: Optional
            - paragraph [ref=e85]: Incumbent presence, prior engagement, or insider intel that shapes your competitive position.
          - generic [ref=e86]: +
        - button "Stakeholders Optional Agency contacts involved in this pursuit — the AI uses these to assess relationship strength. +" [ref=e88] [cursor=pointer]:
          - generic [ref=e89]:
            - generic [ref=e90]:
              - heading "Stakeholders" [level=2] [ref=e91]
              - generic [ref=e92]: Optional
            - paragraph [ref=e93]: Agency contacts involved in this pursuit — the AI uses these to assess relationship strength.
          - generic [ref=e94]: +
        - button "Sources / Evidence Optional SAM.gov notices, industry day notes, or intel that corroborates what you entered above. +" [ref=e96] [cursor=pointer]:
          - generic [ref=e97]:
            - generic [ref=e98]:
              - heading "Sources / Evidence" [level=2] [ref=e99]
              - generic [ref=e100]: Optional
            - paragraph [ref=e101]: SAM.gov notices, industry day notes, or intel that corroborates what you entered above.
          - generic [ref=e102]: +
        - button "Internal Notes Optional Private context for your team — strategy hunches, red flags, or decisions already made. +" [ref=e104] [cursor=pointer]:
          - generic [ref=e105]:
            - generic [ref=e106]:
              - heading "Internal Notes" [level=2] [ref=e107]
              - generic [ref=e108]: Optional
            - paragraph [ref=e109]: Private context for your team — strategy hunches, red flags, or decisions already made.
          - generic [ref=e110]: +
        - generic [ref=e111]:
          - button "Similar Past Pursuits Optional Link past bids you won or lost — the AI draws explicit lessons from them. +" [ref=e112] [cursor=pointer]:
            - generic [ref=e113]:
              - generic [ref=e114]:
                - heading "Similar Past Pursuits" [level=2] [ref=e115]
                - generic [ref=e116]: Optional
              - paragraph [ref=e117]: Link past bids you won or lost — the AI draws explicit lessons from them.
            - generic [ref=e118]: +
          - text: · · · · · · ·
        - generic [ref=e119]:
          - button "Create & Analyze Opportunity" [ref=e120] [cursor=pointer]
          - button "Clear" [ref=e121] [cursor=pointer]
```

# Test source

```ts
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
  43  |     await expect(page.locator('h2').filter({ hasText: 'VA Benefits Platform Modernization' })).toBeVisible();
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
> 106 |     await gate1Card.click();
      |                     ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  144 |           'Our OASIS+ vehicle PM at SSA confirmed Apex is registered and in good standing on the vehicle.'
  145 |         );
  146 |         await page.waitForTimeout(PAUSE);
  147 |       }
  148 |     }
  149 | 
  150 |     // ── Internal Notes ──
  151 |     const notesField = page.locator('#notes');
  152 |     if (await notesField.isVisible()) {
  153 |       await notesField.fill(
  154 |         'OASIS+ vehicle aligns perfectly. SDVOSB set-aside confirmed via Sources Sought. ' +
  155 |         'Biggest risk is the absence of SSA past performance — we have strong CMS and VA comparable work but no direct SSA reference. ' +
  156 |         'Need to assess the competitive landscape and identify a teaming partner with SSA incumbent access before committing full capture resources.'
  157 |       );
  158 |       await page.waitForTimeout(PAUSE);
  159 |     }
  160 | 
  161 |     // ── Evaluation section ──
  162 |     const evalToggle = page.locator('button').filter({ hasText: /Evaluation/i }).first();
  163 |     if (await evalToggle.isVisible()) {
  164 |       await evalToggle.click();
  165 |       await page.waitForTimeout(PAUSE);
  166 |     }
  167 | 
  168 |     const evalTypeSelect = page.locator('#evaluationType');
  169 |     if (await evalTypeSelect.isVisible()) {
  170 |       await evalTypeSelect.selectOption({ label: /Best Value/i });
  171 |       await page.waitForTimeout(PAUSE);
  172 |     }
  173 | 
  174 |     // Add evaluation criteria
  175 |     const criteriaInput = page.locator('input[placeholder*="criterion"], input[placeholder*="criteria"]').first();
  176 |     if (await criteriaInput.isVisible()) {
  177 |       const criteria = [
  178 |         'Technical approach and legacy modernization methodology (35%)',
  179 |         'Past performance on comparable federal benefits systems (30%)',
  180 |         'Management approach and key personnel (20%)',
  181 |         'Price realism (15%)'
  182 |       ];
  183 |       for (const c of criteria) {
  184 |         await criteriaInput.fill(c);
  185 |         await page.waitForTimeout(400);
  186 |         const addBtn = page.locator('button').filter({ hasText: /Add Criterion|Add/i }).first();
  187 |         await addBtn.click();
  188 |         await page.waitForTimeout(400);
  189 |       }
  190 |     }
  191 | 
  192 |     await page.waitForTimeout(PAUSE);
  193 | 
  194 |     // ── The callout pause before submitting ──
  195 |     // (In a real demo you'd narrate here — the test just pauses)
  196 |     await page.waitForTimeout(LONG);
  197 | 
  198 |     // ── Submit ──
  199 |     await page.locator('button').filter({ hasText: /Create & Analyze/i }).click();
  200 | 
  201 |     // Wait for AI result (mock is fast but UI needs to render)
  202 |     await page.waitForTimeout(LONG * 2);
  203 | 
  204 |     // ── ACT 3: Verify AI result ──
  205 |     await expect(page.locator('.pwin-badge')).toBeVisible();
  206 |     await page.waitForTimeout(PAUSE);
```