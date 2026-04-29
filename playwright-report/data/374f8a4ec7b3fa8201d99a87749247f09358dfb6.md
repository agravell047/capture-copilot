# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: capturepilot-demo.spec.js >> CapturePilot Demo Walkthrough >> ACT 5 — Settings page walkthrough
- Location: tests\capturepilot-demo.spec.js:245:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForTimeout: Test timeout of 30000ms exceeded.
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
        - heading "Settings" [level=2] [ref=e15]
        - paragraph [ref=e16]: Company context that shapes every opportunity analysis.
      - generic [ref=e17]:
        - button "Company" [ref=e18] [cursor=pointer]
        - button "Capabilities & Gaps" [ref=e19] [cursor=pointer]
        - button "Vehicles & Set-Asides" [ref=e20] [cursor=pointer]
        - button "Team" [active] [ref=e21] [cursor=pointer]
        - button "Contacts" [ref=e22] [cursor=pointer]
        - button "AI Settings" [ref=e23] [cursor=pointer]
      - generic [ref=e24]:
        - generic [ref=e25]:
          - heading "Team Directory" [level=3] [ref=e26]
          - paragraph [ref=e27]: Add people and skills so the AI can name who should lead or support each pursuit. Skills are capped at 5 per person.
        - textbox "Search 77 people by name, role, or skill…" [ref=e29]
        - generic [ref=e30]:
          - generic [ref=e31]:
            - generic [ref=e32]:
              - generic [ref=e33]:
                - generic [ref=e34]: Rachel Torres
                - generic [ref=e35]: Chief Executive Officer
                - generic [ref=e36]: 18y
              - generic [ref=e37]:
                - generic [ref=e38]: executive leadership
                - generic [ref=e39]: federal capture strategy
                - generic [ref=e40]: P&L management
                - generic [ref=e41]: SDVOSB compliance
                - generic [ref=e42]: stakeholder engagement
            - generic [ref=e43]:
              - button "Edit" [ref=e44] [cursor=pointer]
              - button "Remove" [ref=e45] [cursor=pointer]
          - generic [ref=e46]:
            - generic [ref=e47]:
              - generic [ref=e48]:
                - generic [ref=e49]: James Okafor
                - generic [ref=e50]: VP of Capture & Business Development
                - generic [ref=e51]: 14y
              - generic [ref=e52]:
                - generic [ref=e53]: capture management
                - generic [ref=e54]: proposal strategy
                - generic [ref=e55]: federal BD
                - generic [ref=e56]: pipeline development
                - generic [ref=e57]: VA and CMS relationships
            - generic [ref=e58]:
              - button "Edit" [ref=e59] [cursor=pointer]
              - button "Remove" [ref=e60] [cursor=pointer]
          - generic [ref=e61]:
            - generic [ref=e62]:
              - generic [ref=e63]:
                - generic [ref=e64]: Priya Nair
                - generic [ref=e65]: Chief Technology Officer
                - generic [ref=e66]: 16y
              - generic [ref=e67]:
                - generic [ref=e68]: cloud architecture
                - generic [ref=e69]: AWS GovCloud
                - generic [ref=e70]: Azure Government
                - generic [ref=e71]: FedRAMP
                - generic [ref=e72]: zero-trust
            - generic [ref=e73]:
              - button "Edit" [ref=e74] [cursor=pointer]
              - button "Remove" [ref=e75] [cursor=pointer]
          - generic [ref=e76]:
            - generic [ref=e77]:
              - generic [ref=e78]:
                - generic [ref=e79]: Marcus Webb
                - generic [ref=e80]: Director of Program Delivery
                - generic [ref=e81]: 12y
              - generic [ref=e82]:
                - generic [ref=e83]: agile delivery
                - generic [ref=e84]: program management
                - generic [ref=e85]: SAFe
                - generic [ref=e86]: risk management
                - generic [ref=e87]: federal CPARS reporting
            - generic [ref=e88]:
              - button "Edit" [ref=e89] [cursor=pointer]
              - button "Remove" [ref=e90] [cursor=pointer]
          - generic [ref=e91]:
            - generic [ref=e92]:
              - generic [ref=e93]:
                - generic [ref=e94]: Sofia Reyes
                - generic [ref=e95]: Lead Proposal Manager
                - generic [ref=e96]: 9y
              - generic [ref=e97]:
                - generic [ref=e98]: proposal writing
                - generic [ref=e99]: color reviews
                - generic [ref=e100]: volume management
                - generic [ref=e101]: compliance matrices
                - generic [ref=e102]: APMP certified
            - generic [ref=e103]:
              - button "Edit" [ref=e104] [cursor=pointer]
              - button "Remove" [ref=e105] [cursor=pointer]
          - generic [ref=e106]:
            - generic [ref=e107]:
              - generic [ref=e108]:
                - generic [ref=e109]: Tyler Brooks
                - generic [ref=e110]: Senior DevOps Engineer
                - generic [ref=e111]: 8y
              - generic [ref=e112]:
                - generic [ref=e113]: CI/CD pipelines
                - generic [ref=e114]: Jenkins
                - generic [ref=e115]: GitHub Actions
                - generic [ref=e116]: Kubernetes
                - generic [ref=e117]: Terraform
            - generic [ref=e118]:
              - button "Edit" [ref=e119] [cursor=pointer]
              - button "Remove" [ref=e120] [cursor=pointer]
          - generic [ref=e121]:
            - generic [ref=e122]:
              - generic [ref=e123]:
                - generic [ref=e124]: Jordan Kim
                - generic [ref=e125]: DevOps Engineer
                - generic [ref=e126]: 5y
              - generic [ref=e127]:
                - generic [ref=e128]: Docker
                - generic [ref=e129]: Kubernetes
                - generic [ref=e130]: AWS GovCloud
                - generic [ref=e131]: Helm
                - generic [ref=e132]: monitoring
            - generic [ref=e133]:
              - button "Edit" [ref=e134] [cursor=pointer]
              - button "Remove" [ref=e135] [cursor=pointer]
          - generic [ref=e136]:
            - generic [ref=e137]:
              - generic [ref=e138]:
                - generic [ref=e139]: Alicia Fontaine
                - generic [ref=e140]: DevSecOps Lead
                - generic [ref=e141]: 10y
              - generic [ref=e142]:
                - generic [ref=e143]: DevSecOps
                - generic [ref=e144]: SAST/DAST
                - generic [ref=e145]: SonarQube
                - generic [ref=e146]: Anchore
                - generic [ref=e147]: ATO pipeline automation
            - generic [ref=e148]:
              - button "Edit" [ref=e149] [cursor=pointer]
              - button "Remove" [ref=e150] [cursor=pointer]
          - generic [ref=e151]:
            - generic [ref=e152]:
              - generic [ref=e153]:
                - generic [ref=e154]: Derek Osei
                - generic [ref=e155]: DevOps Engineer
                - generic [ref=e156]: 6y
              - generic [ref=e157]:
                - generic [ref=e158]: Terraform
                - generic [ref=e159]: Ansible
                - generic [ref=e160]: AWS
                - generic [ref=e161]: infrastructure-as-code
                - generic [ref=e162]: VA BCMS contract
            - generic [ref=e163]:
              - button "Edit" [ref=e164] [cursor=pointer]
              - button "Remove" [ref=e165] [cursor=pointer]
          - generic [ref=e166]:
            - generic [ref=e167]:
              - generic [ref=e168]:
                - generic [ref=e169]: Megan Walsh
                - generic [ref=e170]: Platform Engineer
                - generic [ref=e171]: 7y
              - generic [ref=e172]:
                - generic [ref=e173]: Kubernetes
                - generic [ref=e174]: OpenShift
                - generic [ref=e175]: GitOps
                - generic [ref=e176]: ArgoCD
                - generic [ref=e177]: service mesh
            - generic [ref=e178]:
              - button "Edit" [ref=e179] [cursor=pointer]
              - button "Remove" [ref=e180] [cursor=pointer]
        - generic [ref=e181]:
          - button "← Prev" [disabled] [ref=e182]
          - generic [ref=e183]: Page 1 of 8 · 77 people
          - button "Next →" [ref=e184] [cursor=pointer]
        - button "+ Add Team Member" [ref=e185] [cursor=pointer]
        - generic [ref=e186]:
          - generic [ref=e188]:
            - text: Import CSV
            - button "Import CSV" [ref=e189]
          - group [ref=e190]:
            - generic "CSV format" [ref=e191] [cursor=pointer]
        - button "Save" [ref=e193] [cursor=pointer]
```

# Test source

```ts
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
  207 | 
  208 |     // pWin should be 52
  209 |     const pwinEl = page.locator('.pwin-value');
  210 |     await expect(pwinEl).toContainText('52');
  211 |     await page.waitForTimeout(PAUSE);
  212 | 
  213 |     // Fit rating
  214 |     await page.locator('.fit-rating').scrollIntoViewIfNeeded();
  215 |     await page.waitForTimeout(PAUSE);
  216 | 
  217 |     // Gap Analysis
  218 |     await page.locator('text=Gap Analysis').first().scrollIntoViewIfNeeded();
  219 |     await page.waitForTimeout(PAUSE);
  220 |     await expect(page.locator('.gap-list .gap-high').first()).toBeVisible();
  221 |     await page.waitForTimeout(PAUSE);
  222 | 
  223 |     // Recommendation
  224 |     await page.locator('text=Recommendation').first().scrollIntoViewIfNeeded();
  225 |     await expect(page.locator('.recommendation-action').filter({ hasText: /Go/i })).toBeVisible();
  226 |     await page.waitForTimeout(PAUSE);
  227 | 
  228 |     // Proposed Capture Team
  229 |     await page.locator('text=Proposed Capture Team').scrollIntoViewIfNeeded();
  230 |     await page.waitForTimeout(LONG);
  231 |     await expect(page.locator('.proposed-team-card')).toBeVisible();
  232 |     await expect(page.locator('.proposed-team-list .proposed-team-member')).toHaveCount(6);
  233 |     await page.waitForTimeout(PAUSE);
  234 | 
  235 |     // Invite button present
  236 |     await expect(page.locator('button.email-blast-btn')).toBeVisible();
  237 |     await page.waitForTimeout(PAUSE);
  238 | 
  239 |     // Activity Log
  240 |     await page.locator('text=Activity Log').scrollIntoViewIfNeeded();
  241 |     await page.waitForTimeout(LONG);
  242 |   });
  243 | 
  244 |   // ── ACT 5: Settings ───────────────────────────────────────────────────────
  245 |   test('ACT 5 — Settings page walkthrough', async ({ page }) => {
  246 |     await page.goto('/');
  247 |     await page.waitForTimeout(LONG);
  248 | 
  249 |     // Navigate to Settings
  250 |     await page.locator('button.nav-button').filter({ hasText: 'Settings' }).click();
  251 |     await page.waitForTimeout(LONG);
  252 | 
  253 |     // Company tab (should be default)
  254 |     await expect(page.locator('.settings-tab.active, .tab-active').first()).toBeVisible();
  255 |     await page.waitForTimeout(PAUSE);
  256 | 
  257 |     // Capabilities tab
  258 |     await page.locator('.settings-tab').filter({ hasText: /Capabilities/i }).click();
  259 |     await page.waitForTimeout(PAUSE);
  260 |     await expect(page.locator('text=core, text=Core').first().or(page.locator('.tier-core').first())).toBeVisible();
  261 |     await page.waitForTimeout(LONG);
  262 | 
  263 |     // Team tab
  264 |     await page.locator('.settings-tab').filter({ hasText: /Team/i }).click();
  265 |     await page.waitForTimeout(PAUSE);
  266 |     await expect(page.locator('.team-member').first()).toBeVisible();
> 267 |     await page.waitForTimeout(PAUSE);
      |                ^ Error: page.waitForTimeout: Test timeout of 30000ms exceeded.
  268 | 
  269 |     // Show the add-person form by clicking the button
  270 |     await page.locator('button').filter({ hasText: '+ Add Team Member' }).click();
  271 |     await page.waitForTimeout(PAUSE);
  272 |     await page.locator('input[placeholder="Jane Doe"]').scrollIntoViewIfNeeded();
  273 |     await page.waitForTimeout(PAUSE);
  274 | 
  275 |     // Show CSV format section
  276 |     const csvDetails = page.locator('details').filter({ hasText: /CSV format/i });
  277 |     if (await csvDetails.isVisible()) {
  278 |       await csvDetails.locator('summary').click();
  279 |       await page.waitForTimeout(PAUSE);
  280 |       await csvDetails.scrollIntoViewIfNeeded();
  281 |       await page.waitForTimeout(LONG);
  282 |     }
  283 | 
  284 |     // Contacts tab
  285 |     await page.locator('.settings-tab').filter({ hasText: /Contacts/i }).click();
  286 |     await page.waitForTimeout(LONG);
  287 | 
  288 |     // AI Settings tab
  289 |     await page.locator('.settings-tab').filter({ hasText: /AI/i }).click();
  290 |     await page.waitForTimeout(LONG);
  291 |   });
  292 | });
  293 | 
```