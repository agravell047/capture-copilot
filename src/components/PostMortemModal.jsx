import { useState } from 'react'
import { closeOpportunity, getPastPerformanceMeta } from '../api/opportunities'
import { useEffect } from 'react'
import './PostMortemModal.css'

const OUTCOME_LABELS = {
  won: 'Won',
  lost: 'Lost',
  no_bid: 'No Bid',
  withdrew: 'Withdrew'
}

const LOSS_REASON_LABELS = {
  price: 'Price / Cost',
  technical: 'Technical Approach',
  past_performance: 'Past Performance',
  relationship: 'Relationship / Incumbency',
  scope_mismatch: 'Scope Mismatch',
  timeline: 'Timeline / Capacity',
  other: 'Other'
}

function PostMortemModal({ opportunity, onClose, onSaved }) {
  const [meta, setMeta] = useState({ outcomes: [], lossReasons: [], lessonTags: [] })
  const [outcome, setOutcome] = useState('')
  const [lossReason, setLossReason] = useState('')
  const [lessons, setLessons] = useState([]) // [{ tag, note }]
  const [lessonDraft, setLessonDraft] = useState({ tag: '', note: '' })
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getPastPerformanceMeta()
      .then(setMeta)
      .catch(() => {})
  }, [])

  const addLesson = () => {
    if (!lessonDraft.tag || !lessonDraft.note.trim()) return
    setLessons((prev) => [...prev, { tag: lessonDraft.tag, note: lessonDraft.note.trim() }])
    setLessonDraft({ tag: '', note: '' })
  }

  const removeLesson = (index) => {
    setLessons((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!outcome) {
      setError('Please select an outcome.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const result = await closeOpportunity(opportunity.id, {
        outcome,
        lossReason: outcome === 'lost' ? lossReason : null,
        lessonsLearned: lessons,
        notes
      })
      onSaved(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const showLossReason = outcome === 'lost'

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="postmortem-title">
      <div className="modal-panel">
        <div className="modal-header">
          <h2 id="postmortem-title">Close Opportunity</h2>
          <p className="modal-subtitle">
            Record the outcome and lessons learned for <strong>{opportunity.opportunityName || opportunity.name}</strong>.
            This data will inform future AI recommendations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Outcome */}
          <div className="form-group">
            <label className="form-label required">Outcome</label>
            <div className="outcome-options">
              {meta.outcomes.map((o) => (
                <button
                  key={o}
                  type="button"
                  className={`outcome-btn outcome-btn--${o}${outcome === o ? ' selected' : ''}`}
                  onClick={() => { setOutcome(o); if (o !== 'lost') setLossReason('') }}
                >
                  {OUTCOME_LABELS[o] || o}
                </button>
              ))}
            </div>
          </div>

          {/* Loss reason (only when lost) */}
          {showLossReason && (
            <div className="form-group">
              <label className="form-label" htmlFor="lossReason">Primary Loss Reason</label>
              <select
                id="lossReason"
                className="form-control"
                value={lossReason}
                onChange={(e) => setLossReason(e.target.value)}
              >
                <option value="">— Select reason —</option>
                {meta.lossReasons.map((r) => (
                  <option key={r} value={r}>{LOSS_REASON_LABELS[r] || r}</option>
                ))}
              </select>
            </div>
          )}

          {/* Lessons learned */}
          <div className="form-group">
            <label className="form-label">Lessons Learned</label>
            <p className="form-hint">Tag each lesson so the AI can detect patterns across pursuits.</p>

            {lessons.length > 0 && (
              <ul className="lesson-list">
                {lessons.map((l, i) => (
                  <li key={i} className="lesson-item">
                    <span className="lesson-tag">{l.tag}</span>
                    <span className="lesson-note">{l.note}</span>
                    <button type="button" className="lesson-remove" onClick={() => removeLesson(i)} aria-label="Remove lesson">×</button>
                  </li>
                ))}
              </ul>
            )}

            <div className="lesson-draft">
              <select
                className="form-control lesson-draft-tag"
                value={lessonDraft.tag}
                onChange={(e) => setLessonDraft((p) => ({ ...p, tag: e.target.value }))}
              >
                <option value="">— Category —</option>
                {meta.lessonTags.map((t) => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
              <input
                type="text"
                className="form-control lesson-draft-note"
                placeholder="What happened? What should change?"
                value={lessonDraft.note}
                onChange={(e) => setLessonDraft((p) => ({ ...p, note: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLesson() } }}
              />
              <button type="button" className="btn btn-secondary" onClick={addLesson}>Add</button>
            </div>
          </div>

          {/* General notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="ppNotes">Additional Notes</label>
            <textarea
              id="ppNotes"
              className="form-control"
              rows={3}
              placeholder="Debrief highlights, context, or anything else worth noting..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving || !outcome}>
              {saving ? 'Saving…' : 'Save & Close Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PostMortemModal
