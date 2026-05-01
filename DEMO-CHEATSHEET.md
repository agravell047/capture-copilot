# CapturePilot — Demo Cheat Sheet

## Before You Start
- [ ] Run **"Run App (Frontend + Backend)"** VS Code task
- [ ] Open **http://localhost:5173** — Dashboard loads with active opps
- [ ] Open this file in a second window

---

## 1 — Dashboard

- KPI bar: Active pursuits · In Proposal · Pipeline value · Expected value · Win rate · High pWin · Needs Attention
- Gate columns (0–3) — count badge + column value total
- Card colored left border = pWin tier (green/amber/red)
- Bottom of each card: freshness timestamp
- **Board ↔ Table toggle** (top right of board)
- **Drag a card** to a different gate column to move it
- Scroll below board → **Closed Opportunities** (expand toggle)

---

## 2 — Existing Opportunity (VA card)

Click **VA Benefits Platform Modernization**

- Animated **pWin arc gauge** (top right of workspace)
- **Gate progress bar** (4 stages, current highlighted)
- Fit Assessment → rating + bullet rationale
- Gap Analysis → severity badges (HIGH/MED/LOW) + mitigations
- Recommendation → Go/No Go + numbered next steps
- Proposed Capture Team → click **📧 Invite Capture Team by Email**
- **Re-run Analysis** button — refreshes score + team, no re-entry

---

## 3 — New Capture (No Go scenario)

> Settings → Stage Demo: No Go → + New Capture

- All fields pre-filled — scroll through to show them
- Point to **Analysis Quality bar** (coaching as you fill)
- Expand each collapsible section — Evaluation, Relationships, Stakeholders auto-populated from agency, Notes, Similar Past Pursuits
- **RFP upload** — drop file here for AI extract + summary
- Click **Create & Analyze Opportunity**

**Result:** pWin ~52%, Recommendation: No Go, Possible Next Steps (not "Next Steps"), red border on recommendation badge

---

## 4 — New Capture (Strong GO scenario)

> Settings → Stage Demo: Strong GO → + New Capture

- Same flow — different data (VA IDIQ, SPRUCE, SDVOSB, Gate 2, deep relationships)
- Click **Create & Analyze Opportunity**

**Result:** pWin 70%+, Recommendation: Go, green fit, strong team proposal

---

## 5 — AI Analysis Walkthrough (either result)

| Section | What to point out |
|---|---|
| pWin gauge | Animates on load, color-coded |
| Gate bar | Where in lifecycle |
| Fit Assessment | "Conditional/Go/No Go" + which factors drove it |
| Gap Analysis | HIGH gaps + mitigations specific to this opp |
| Recommendation | Sequenced numbered steps |
| Proposed Team | Named from 77-person directory, per role |
| Feasibility Factors | Grid — Vehicle Fit, Set-Aside, Relationship, Timeline, Scope |
| Activity Log | Every update timestamped and used in next re-analysis |

---

## 6 — Close an Opportunity (detail page)

On any active opportunity's detail page:

1. Click **Close Opportunity** (header, top right)
2. **PostMortem modal opens**:
   - Select outcome: Won / Lost / No Bid / Withdrew
   - If Lost: select loss reason (price, technical, relationship, etc.)
   - Add lessons learned: pick tag category + write note → **Add**
   - Additional notes field
3. Click **Save & Close Opportunity** → outcome badge appears, form locks
4. **Delete option** — bottom of modal: permanently removes from system and AI context

---

## 7 — Portfolio Board — Close / Delete from card

On a kanban card (hover to reveal):
- **Close** → same PostMortem modal as above
- Closed opps also have **Delete** in the closed table (removes from AI context entirely)

Table view: same **Close** and **Delete** per row

---

## 8 — Settings

| Tab | What it controls |
|---|---|
| Company | NAICS, size, positioning — AI baseline for every analysis |
| Capabilities | Core/Supporting/Emerging tiers |
| Contacts | Relationship map — auto-populates Stakeholders on new capture |
| Team | 77-person directory — AI scores for every pursuit |
| AI Settings | Model, API key, standing prompt instructions |
| Company (bottom) | **Stage Demo** buttons (GO / No Go) |

---

## 9 — Under the Hood (optional)

F12 → Network → Fetch/XHR → `POST /api/opportunities` → Response  
_"Full structured payload — opportunity + company profile + team scored by relevance. Not a black box."_

---

## Recovery

| Problem | Fix |
|---|---|
| Page won't load | Restart "Run App" task · refresh |
| Analysis blank | Refresh — it saved, didn't render |
| API error | Built-in mock response fires automatically |
| Accidentally deleted something | Restart backend — data is in JSON files, check `backend/data/` |
