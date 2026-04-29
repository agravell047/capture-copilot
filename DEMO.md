# CapturePilot — Live Demo Cheat Sheet

## Before You Start
- [ ] Run **"Run App (Frontend + Backend)"** VS Code task
- [ ] Open **http://localhost:5173** — verify Dashboard loads with 4 active opps
- [ ] Have this doc open in a second window for copy-paste

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
