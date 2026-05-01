# CapturePilot — Live Demo Cheat Sheet

## Before You Start
- [ ] Run **"Run App (Frontend + Backend)"** VS Code task
- [ ] Open **http://localhost:5173** — verify Dashboard loads with 4 active opps
- [ ] Have this doc open in a second window for copy-paste

---

## VOICEOVER SCRIPT — Full Run (~15 min)

### ACT 1 — Dashboard (~2 min)

**DO:** Open http://localhost:5173. Dashboard loads in Board view.

**SAY:** *"This is the capture pilot dashboard — active opportunities, organized by where they are in the capture process."*

**DO:** Sweep cursor across the 7 KPI stat cards left to right.

**SAY:** *"Active pursuits in the pipeline. How many are in proposal. Total pipeline value across all active opportunities. Expected value based on AI-analysis. Historical win rate. the how many are in pWin, which are the high confidence opportunities. And Needs Attention — pursuits that haven't been touched in over 30 days."*

**DO:** Point to the gate columns — Gate 0 through Gate 3. Point to the column header showing count badge and dollar total.

**SAY:** *"Down below, we have four gate columns, each representing a phase between Awareness and Proposal. Each column shows a count badge and the total contract value of everything in it. You can see at a glance where the weight of your pipeline sits."*

**DO:** Point to one card's colored left border, then another (different color).

**SAY:** *"Every card has a colored left border — green for high pWin, amber for medium, red for low.*

**DO:** Point to the bottom of a card — the freshness timestamp ("Xd ago").

**SAY:** *"Each card shows when it was last updated — so you can see at a glance what's been sitting too long."*

**DO:** Click **Table** toggle.

**SAY:** *"You also have the option to switch between views. Table view gives you the same opportunities in a flat list — easier to filter and compare."*

**DO:** Click **Board** to return.

**DO:** Scroll down past the board. Point to the Closed Opportunities card.

**SAY:** *"Below the board, closed deals — won, lost, no bid, withdrew. The full record stays in the system. That history feeds the AI's pattern recognition on every new pursuit."*

**DO:** Click the Closed Opportunities toggle to expand briefly, then collapse.

---

### ACT 2 — Existing Card Walkthrough (~2 min)

**DO:** Click **VA Benefits Platform Modernization**.

**SAY:** *"Let's look an exisiting pursuit."*

**DO:** Point to the animated pWin arc gauge in the top right.

**SAY:** *"The pWin gauge tells us the confidence level for this bid. This bid would a big with high confidence in winning..

**DO:** Point to the Gate progress bar below the header.

**SAY:** *"Below it, the gate progress bar has four stages, that match what we saw on the dashboard. This pursuit is at Gate 2 — Capture. You can see exactly where it sits in the capture lifecycle without reading a single field."*

**DO:** Point to Fit Assessment card — show the rating badge and bullet points.

**SAY:** *"the Fit assessment represents hpw the AI evaluated our company profile against this opportunity and returned a rating, a rationale, and the specific reasons why. Not generic. Specific to Apex's capabilities, vehicles, and set-asides."*

**DO:** Point to Gap Analysis card — show severity badges (HIGH/MED/LOW) and mitigations.

**SAY:** *"Gap analysis. Each gap gets a severity rating and a mitigation. The system tells you not just what's missing, but what to do about it."*

**DO:** Point to Recommendation card — show the action badge and the numbered next steps.

**SAY:** *"Recommendation was a Go with Five sequenced next steps "*

**DO:** Scroll to Proposed Capture Team.

**SAY:** *"Proposed Capture Team. The AI scored our 77-person directory — skills, experience, availability signals — and named who should lead this pursuit by role. Not just availability, fit."*

**DO:** Click **Invite Team by Email**.

**SAY:** *"One click. Opens your email client pre-addressed to every team member — subject line, opp name, kickoff message. No copying from a roster."*

**DO:** Close email client. Point to **Re-run Analysis** button.

**SAY:** *"Captures evolve. Relationships develop, gaps close, the RFP drops. Hit Re-run and the AI refreshes the score and team from the latest data — no re-entry required."*

**DO:** Click **Dashboard** in the navbar.

---

### ACT 3 — New Capture (~5 min)

**DO:** Click **+ New Capture**.

**SAY:** *"Now the intake flow. This is day one — no RFP, no solicitation, just early awareness."*

---

**► Zone 1 — Core capture details**

**DO:** Type `SSA Disability Claims Processing Modernization` in Opportunity Name. Point to the completeness bar moving.

**SAY:** *"Watch the Analysis Quality bar in the top right. The system is coaching you as you type — it knows what's missing and what would make the analysis sharper."*

**DO:** Select **Social Security Administration** from Agency dropdown. Set Contract Value to **$5M–$50M**.

**SAY:** *"Agency selected. The system already knows our contacts and relationships here — you'll see that reflected when we get to the Stakeholders section."*

**DO:** Click **Gate 1 — Qualify** on the gate picker.

**SAY:** *"Gate 1 — we've done a quick fit check and decided to invest resources in qualifying this one."*

**DO:** Paste the Description. Point to the completeness bar jumping.
```
Modernize SSA's Disability Case Management System — a 30-year-old COBOL/mainframe platform processing 2.8 million annual disability claims. Scope includes phased cloud migration to AWS GovCloud, legacy COBOL rewrite to Java/Spring microservices, integration with SSA's existing Numident and MBR databases, Section 508-compliant claimant portal redesign, DevSecOps pipeline implementation, and FedRAMP Moderate ATO preparation. Requires continuity-of-operations planning for 24/7 claims processing during migration.
```

**SAY:** *"Description is the biggest signal — 25 points. Watch the bar jump. And see the RFP upload option below? If the solicitation is already out, you drop the file here and the AI extracts and summarizes it instead."*

---

**► Zone 2 — Enrich the analysis**

**DO:** Set Vehicle to **OASIS+**, Set-Aside to **SDVOSB**.

**SAY:** *"Vehicle and set-aside — the AI uses these to assess competitive positioning. OASIS+ pre-qualifies us, SDVOSB narrows the competitive field."*

**DO:** Paste the Timeline field:
```
Sources Sought issued April 14, 2026; RFP anticipated September 2026; award expected Q1 2027. Five-year IDIQ base with two option years.
```

**SAY:** *"Timeline — Sources Sought issued, RFP anticipated September, award Q1 2027. The AI uses this to reason about urgency and whether Gate 1 is the right stage."*

---

**► Collapsible sections**

**DO:** Expand **Evaluation**. Type `Best Value`. Add the four criteria:
```
Technical approach and legacy modernization methodology (35%)
Past performance on comparable federal benefits systems (30%)
Management approach and key personnel (20%)
Price realism (15%)
```

**SAY:** *"Evaluation approach and weighted criteria. The AI maps our gaps and strengths directly to what will actually be scored on this deal."*

**DO:** Expand **Known Relationships**. Paste:
```
Marcus Webb attended the SSA IT Modernization Industry Day on April 9th and had a brief conversation with the program's Deputy CIO. No formal relationship yet — agency contact at SSA OIT identified but no direct outreach completed. Our OASIS+ vehicle PM at SSA confirmed Apex is registered and in good standing on the vehicle.
```

**SAY:** *"Known relationships — who we've met, what was said. This is the context that doesn't live in a database. The AI reads it."*

**DO:** Expand **Stakeholders**. Show that SSA contacts are already pre-loaded from the agency selection.

**SAY:** *"Stakeholders auto-populated from our contact database when we selected the agency. Anyone we already know at SSA is already here."*

**DO:** Expand **Internal Notes**. Paste:
```
OASIS+ vehicle aligns perfectly. SDVOSB set-aside confirmed via Sources Sought. Biggest risk is the absence of SSA past performance — we have strong CMS and VA comparable work but no direct SSA reference. Need to assess the competitive landscape and identify a teaming partner with SSA incumbent access before committing full capture resources.
```

**SAY:** *"Internal notes — our honest read on the opportunity. Gaps, risks, strategic considerations. The AI incorporates this into the analysis."*

**DO:** Expand **Similar Past Pursuits**. Pick one relevant past pursuit from the list.

**SAY:** *"Similar past pursuits. The AI learns from our history — past performance, win/loss patterns, team compositions that worked. Linking them here sharpens the analysis."*

---

**DO:** Point to the completeness bar — should be near or at 100%.

**SAY:** *"100% analysis quality. Every signal the AI can use is in the system. Now — Create."*

**DO:** Click **Create & Analyze Opportunity**.

**SAY:** *"Sending the full opportunity payload plus our company profile — capabilities, vehicles, team, past performance patterns. The AI knows Apex."*

---

### ACT 4 — AI Result Walkthrough (~3 min)

**DO:** Let the pWin gauge animate on load.

**SAY:** *"52% — Medium. Conservative at Gate 1 with no existing SSA relationship and no SSA past performance. That's honest. Compare to the VA pursuit at 76% — that's a mature Gate 2 with incumbent access. Different stage, different score. The system doesn't inflate."*

**DO:** Point to the Gate progress bar — Gate 1 highlighted.

**DO:** Point to Opportunity Snapshot card, scroll through the metadata.

**SAY:** *"Everything we entered is structured and queryable. Vehicle, set-aside, timeline, relationships — stored, versioned, used in every future re-analysis."*

**DO:** Point to Fit Assessment.

**SAY:** *"Fit: Good. OASIS+ pre-qualified, SDVOSB narrows the competitive field, COBOL modernization is a core Apex capability."*

**DO:** Point to Gap Analysis — show severity badges.

**SAY:** *"Two high gaps — no SSA past performance, no established buyer relationship. Both flagged with mitigations. Recommendation: pursue a teaming partner with SSA incumbent access before committing full capture resources. That's not a guess — that's what the notes said, reflected back as a structured action."*

**DO:** Point to Recommendation — show the numbered next steps.

**SAY:** *"Five sequenced next steps. Specific. Actionable. Ready to assign."*

**DO:** Scroll to Proposed Capture Team.

**SAY:** *"AI-proposed team — scored from 77 people based on skills and experience relevant to this scope. Names, roles, rationale per person."*

**DO:** Scroll to Feasibility Factors — point to the grid.

**SAY:** *"Feasibility factors — a structured breakdown of the dimensions the AI evaluated: technical fit, competitive positioning, relationship access, vehicle alignment."*

**DO:** Scroll to Activity Log.

**SAY:** *"Every update to this pursuit is timestamped here. As the capture matures — new intel, relationship changes, field updates — each entry is stored and used in the next re-analysis. The AI's understanding of this opportunity grows with every update."*

---

### ACT 5 — Under the Hood (~1 min)

**DO:** Press F12 → Network → Fetch/XHR → find `POST /api/opportunities` → click → Preview/Response tab.

**SAY:** *"Full structured payload — opportunity data plus the entire company context: capabilities, team directory scored by relevance, past performance patterns. Nothing is hidden. The AI reasons from this input entirely. No black box."*

**DO:** Close DevTools.

---

### ACT 6 — Settings (~2 min)

**DO:** Click **Settings** in the navbar.

**DO:** Click **Company** tab.

**SAY:** *"Company identity — NAICS codes, size standard, positioning statement. This is the AI's baseline context for every single analysis. Change your positioning here and every future analysis reflects it."*

**DO:** Click **Capabilities** tab.

**SAY:** *"Core, Supporting, and Emerging capability tiers. The AI maps these to opportunity requirements when it builds the fit assessment. What you put here is what the AI leads with on every deal."*

**DO:** Click **Contacts** tab.

**SAY:** *"Our relationship map — who we know at each agency, relationship strength, last touch date. When you create a new capture and pick an agency, contacts auto-populate from this list."*

**DO:** Click **Team** tab.

**SAY:** *"77 people in the directory — skills, experience, roles. The AI scores the entire directory for each pursuit and proposes the right people. Add a new hire here and they're eligible for team proposals on the next analysis."*

**DO:** Click **AI Settings** tab.

**SAY:** *"Model configuration and standing prompt instructions. Any instruction you add here applies to every analysis — company-wide tone, evaluation priorities, anything you want the AI to always consider."*

---

### Closing Line

**SAY:** *"Blank form to AI analysis — pWin score, gap analysis with mitigations, sequenced next steps, proposed capture team — in under ten minutes. Every entry is stored, versioned, and used to sharpen the next analysis as the capture matures. The AI gets smarter about this pursuit every time you update it. That's CapturePilot."*

---

## ACT 1 — Dashboard (~2 min)

1. Point out Board view — gate columns, pWin badges, **colored left border per pWin tier** (green=high, amber=medium, red=low)
2. Point out **summary stat cards** at the top _(icon + colored accent — pursuits, high pWin, expected value, needs attention)_
   - _"Pipeline health at a glance — before you even look at a single card."_
3. Point out **freshness timestamps** on each card _(bottom of card — "Xd ago")_
   - _"Every card shows when the capture was last touched. If it's going stale, the system tells you."_
4. Click **Table** toggle → _"Same data, different lens"_ → click **Board** back
5. Click **VA Benefits Platform Modernization**
   - Point out the **pWin arc gauge** — animated fill, color-coded High/Med/Low
   - Point out the **Gate progress bar** — shows exactly where in the capture lifecycle they are
   - Point out: **pWin 76% High** · Fit Rating · **Recommendation: Go**
   - Scroll to **Proposed Capture Team** → point out names + roles the AI selected
   - Scroll to **Gap Analysis** → point out mitigations
   - Scroll to **Activity Log**
5. Click **Dashboard** in navbar

---

## ACT 2 — New Capture (~5 min)

Click **+ New Capture** (top right)

| Field | Value |
|---|---|
| Opportunity Name | `SSA Disability Claims Processing Modernization` |
| Agency | `Social Security Administration` |
| Contract Value | `$5M – $50M` |
| Vehicle | `OASIS+` |
| Set-Aside | `SDVOSB` |
| Gate | **Gate 1 — Qualify** |

**Timeline** _(paste)_
```
Sources Sought issued April 14, 2026; RFP anticipated September 2026; award expected Q1 2027. Five-year IDIQ base with two option years.
```

**Description** _(paste)_
```
Modernize SSA's Disability Case Management System — a 30-year-old COBOL/mainframe platform processing 2.8 million annual disability claims. Scope includes phased cloud migration to AWS GovCloud, legacy COBOL rewrite to Java/Spring microservices, integration with SSA's existing Numident and MBR databases, Section 508-compliant claimant portal redesign, DevSecOps pipeline implementation, and FedRAMP Moderate ATO preparation. Requires continuity-of-operations planning for 24/7 claims processing during migration.
```

**Known Relationships** _(paste)_
```
Marcus Webb attended the SSA IT Modernization Industry Day on April 9th and had a brief conversation with the program's Deputy CIO. No formal relationship yet — agency contact at SSA OIT identified but no direct outreach completed. Our OASIS+ vehicle PM at SSA confirmed Apex is registered and in good standing on the vehicle.
```

**Internal Notes** _(paste)_
```
OASIS+ vehicle aligns perfectly. SDVOSB set-aside confirmed via Sources Sought. Biggest risk is the absence of SSA past performance — we have strong CMS and VA comparable work but no direct SSA reference. Need to assess the competitive landscape and identify a teaming partner with SSA incumbent access before committing full capture resources.
```

**Evaluation** _(expand section · type Best Value · add criteria one at a time)_
```
Technical approach and legacy modernization methodology (35%)
Past performance on comparable federal benefits systems (30%)
Management approach and key personnel (20%)
Price realism (15%)
```

> _"Before I hit Create — no RFP, no solicitation. Day one of awareness. The AI gets our opportunity data PLUS our full company profile: capabilities, vehicles, team, past performance patterns. It knows Apex."_

> **Completeness meter moment:** As you paste each field, point to the **Analysis quality** bar climbing in real time.
> _"The system is coaching you as you type — it knows what's missing and what would make the analysis sharper. Not a static form. An active AI assistant."_
>
> The bar scores 8 signals — every section of the form counts:
> - **Name + Agency** (20 pts) — fires the moment you type
> - **Description** (25 pts) — any text, or upload an RFP
> - **Timeline** (15 pts)
> - **Vehicle** (10 pts)
> - **Relationships / Notes / Evidence** (15 pts) — any of the three
> - **Similar Past Pursuits** (10 pts) — expand that section and pick one
> - **Evaluation** (5 pts) — type, notes, or criteria — anything in the section
>
> Fill everything and it hits 100%. During the demo, paste Description + Timeline first (40 pts jump), then Known Relationships (another 15), then pick a past pursuit — judges see it move three times before you even submit.

Click **Create & Analyze Opportunity**

---

## ACT 3 — AI Result (~3 min)

Walk top to bottom:

| Section | What to say |
|---|---|
| **pWin arc gauge** | "Animated arc — fills on load. Green/amber/red based on score. Not a number buried in a table." |
| **Gate progress bar** | "Gate 1 — Qualify. Four-step lifecycle tracker. Judges can see instantly where each pursuit stands." |
| **pWin 52% Medium** | "Conservative at Gate 1 — honest 52 beats a fake 75. Compare to VA at 76% — that's a mature Gate 2 pursuit with existing relationships. Different stage, different score." |
| **Fit: Good** | "OASIS+ pre-qual, SDVOSB narrows field, COBOL is our core capability" |
| **Gaps (2 High, 1 Med)** | "SSA past performance + buyer relationship = zero. AI flagged both with mitigations" |
| **Recommendation: Go** | "5 sequenced next steps — not generic, specific to this pursuit" |
| **Proposed Capture Team** | "AI scored our 77-person directory and named who should lead this — by role, not just availability" |

> **Invite moment:** Scroll down to Proposed Capture Team → click **📧 Invite Capture Team by Email**
> _"One click — it opens your email client pre-loaded with every team member's address, the opp name, and a kickoff message. No more copy-pasting from a roster."_

> **Re-run moment:** Click **⟳ Re-run Analysis** (top right of detail page)
> _"Capture data changes. Relationships develop, gaps close. Hit re-run and the AI refreshes the score and team — no re-entry required."_

---

## ACT 4 — Under the Hood (~2 min)

F12 → **Network** → **Fetch/XHR** → find `POST /api/opportunities` → click → **Response**

> _"Full payload: opportunity + company context + team scored by relevance to this scope. Nothing hidden. The AI reasons entirely from this structured input."_

---

## ACT 5 — Settings (~2 min)

Click **Settings** in navbar. Walk each tab:

| Tab | One-liner |
|---|---|
| **Company** | "Apex's identity — NAICS, size, positioning. The AI's starting context." |
| **Capabilities** | "Core / Supporting / Emerging tiers — what we lead with on every deal." |
| **Contacts** | "Our relationship map — who we know, strength, last touch." |
| **Team** | "77 people. AI scores and proposes the right ones per pursuit." |
| **AI Settings** | "Swap models, add standing prompt instructions that apply to every analysis." |

---

## Closing Line
> _"Full capture intake — blank form to AI analysis with pWin, gaps, and next steps — in under 10 minutes. Every entry is stored, versioned, and used to sharpen the next analysis as the capture matures. That's CapturePilot."_

---

## If Something Breaks

| Problem | Fix |
|---|---|
| Page won't load | Restart "Run App" task, refresh |
| Analysis is blank | Refresh — it saved, just didn't render |
| AI errors | Fine — mock response is built in, no API key needed |

---

## Quick Copy-Paste Inputs (ACT 2 — New Capture)

> **Tip:** The form has a **Load Demo Data** button at the top — click it and everything below auto-fills instantly. Use this section only as a fallback.

**Opportunity Name**
```
SSA Disability Claims Processing Modernization
```

**Agency:** `Social Security Administration` — **Contract Value:** `$5M – $50M` — **Vehicle:** `OASIS+` — **Set-Aside:** `SDVOSB` — **Gate:** `Gate 1 — Qualify`

**Description**
```
Modernize SSA's Disability Case Management System — a 30-year-old COBOL/mainframe platform processing 2.8 million annual disability claims. Scope includes phased cloud migration to AWS GovCloud, legacy COBOL rewrite to Java/Spring microservices, integration with SSA's existing Numident and MBR databases, Section 508-compliant claimant portal redesign, DevSecOps pipeline implementation, and FedRAMP Moderate ATO preparation. Requires continuity-of-operations planning for 24/7 claims processing during migration.
```

**Timeline**
```
Sources Sought issued April 14, 2026; RFP anticipated September 2026; award expected Q1 2027. Five-year IDIQ base with two option years.
```

**Known Relationships**
```
Marcus Webb attended the SSA IT Modernization Industry Day on April 9th and had a brief conversation with the program's Deputy CIO. No formal relationship yet — agency contact at SSA OIT identified but no direct outreach completed. Our OASIS+ vehicle PM at SSA confirmed Apex is registered and in good standing on the vehicle.
```

**Internal Notes**
```
OASIS+ vehicle aligns perfectly. SDVOSB set-aside confirmed via Sources Sought. Biggest risk is the absence of SSA past performance — we have strong CMS and VA comparable work but no direct SSA reference. Need to assess the competitive landscape and identify a teaming partner with SSA incumbent access before committing full capture resources.
```

**Evaluation Type:** `Best Value`

**Evaluation Criteria** _(add one at a time)_
```
Technical approach and legacy modernization methodology (35%)
```
```
Past performance on comparable federal benefits systems (30%)
```
```
Management approach and key personnel (20%)
```
```
Price realism (15%)
```
