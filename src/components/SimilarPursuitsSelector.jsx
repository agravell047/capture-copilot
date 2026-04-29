import { useEffect, useState } from 'react'
import { getSimilarPastPursuits, listPastPerformance, saveSimilarPursuits } from '../api/opportunities'
import './SimilarPursuitsSelector.css'

const OUTCOME_LABEL = {
  won: 'Won',
  lost: 'Lost',
  no_bid: 'No Bid',
  withdrew: 'Withdrew'
}

const OUTCOME_CLASS = {
  won: 'outcome--won',
  lost: 'outcome--lost',
  no_bid: 'outcome--no-bid',
  withdrew: 'outcome--withdrew'
}

const LESSON_TAG_LABEL = {
  pricing: 'Pricing',
  capability_gap: 'Capability Gap',
  relationship: 'Relationship',
  timeline: 'Timeline',
  proposal_quality: 'Proposal Quality',
  scope_mismatch: 'Scope Mismatch'
}

function SimilarPursuitsSelector({ opportunity, onSelectionChange }) {
  const hasId = Boolean(opportunity?.id)
  const [suggestions, setSuggestions] = useState([])
  const [allRecords, setAllRecords] = useState([])
  const [selected, setSelected] = useState([]) // array of pp record IDs
  // Start in browse-all mode when there is no ID yet (create flow)
  const [showAll, setShowAll] = useState(!hasId)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Initialize selected from opportunity's existing similarPursuits
  useEffect(() => {
    if (Array.isArray(opportunity?.similarPursuits)) {
      setSelected(opportunity.similarPursuits.slice(0, 3))
    }
  }, [opportunity?.id])

  // Load records — always load all; load suggestions only when we have an id
  useEffect(() => {
    setLoading(true)
    const fetches = hasId
      ? [getSimilarPastPursuits(opportunity.id).catch(() => []), listPastPerformance().catch(() => [])]
      : [Promise.resolve([]), listPastPerformance().catch(() => [])]
    Promise.all(fetches).then(([sugg, all]) => {
      setSuggestions(sugg)
      setAllRecords(all)
    }).finally(() => setLoading(false))
  }, [opportunity?.id])

  const toggle = (id) => {
    setSelected((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 3 ? prev : [...prev, id]
      // In create mode, propagate immediately — no separate save step
      if (!hasId && onSelectionChange) onSelectionChange(next)
      return next
    })
    setSaved(false)
  }

  const handleSave = async () => {
    if (!opportunity?.id) return
    setSaving(true)
    try {
      await saveSimilarPursuits(opportunity.id, selected)
      setSaved(true)
      if (onSelectionChange) onSelectionChange(selected)
    } catch {
      // silent — non-critical
    } finally {
      setSaving(false)
    }
  }

  // Merge suggestions + manually selected from allRecords so the user can see them
  const displayPool = showAll ? allRecords : suggestions
  const selectedRecords = allRecords.filter((r) => selected.includes(r.id))
  // Ensure selected are always visible even if not in current pool
  const poolIds = new Set(displayPool.map((r) => r.id))
  const extraSelected = selectedRecords.filter((r) => !poolIds.has(r.id))
  const visibleRecords = [...extraSelected, ...displayPool]

  if (loading) {
    return (
      <div className="sps-container">
        <p className="sps-loading">Loading similar past pursuits…</p>
      </div>
    )
  }

  if (allRecords.length === 0) {
    return (
      <div className="sps-container sps-empty">
        <p>No past performance records yet. Close your first opportunity to start building history.</p>
      </div>
    )
  }

  return (
    <div className="sps-container">
      <div className="sps-header">
        <div>
          <p className="sps-description">
            Select up to 3 past pursuits to reference in AI analysis. The AI will use their outcomes and lessons to ground its recommendations.
          </p>
          <p className="sps-count">{selected.length}/3 selected</p>
        </div>
        <div className="sps-header-actions">
          {hasId && selected.length > 0 && (
            <button
              type="button"
              className={`btn btn-secondary btn-sm${saved ? ' btn-saved' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Selection'}
            </button>
          )}
          {hasId && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? 'Show Suggestions' : `Browse All (${allRecords.length})`}
            </button>
          )}
        </div>
      </div>

      {visibleRecords.length === 0 && (
        <p className="sps-empty-msg">No similar past pursuits found. Try "Browse All" to pick manually.</p>
      )}

      <ul className="sps-list">
        {visibleRecords.map((record) => {
          const isSelected = selected.includes(record.id)
          const isDisabled = !isSelected && selected.length >= 3
          return (
            <li key={record.id} className={`sps-item${isSelected ? ' selected' : ''}${isDisabled ? ' disabled' : ''}`}>
              <button
                type="button"
                className="sps-item-btn"
                onClick={() => toggle(record.id)}
                disabled={isDisabled}
                aria-pressed={isSelected}
              >
                <div className="sps-item-top">
                  <span className="sps-item-name">{record.opportunityName}</span>
                  <span className={`sps-outcome ${OUTCOME_CLASS[record.outcome] || ''}`}>
                    {OUTCOME_LABEL[record.outcome] || record.outcome}
                  </span>
                </div>
                <div className="sps-item-meta">
                  {record.agency && <span>{record.agency}</span>}
                  {record.vehicle && <span>{record.vehicle}</span>}
                  {record.setAside && record.setAside !== 'None' && <span>{record.setAside}</span>}
                  {record.lossReason && <span className="sps-loss-reason">Loss: {record.lossReason.replace('_', ' ')}</span>}
                </div>
                {record.lessonsLearned && record.lessonsLearned.length > 0 && (
                  <ul className="sps-lessons">
                    {record.lessonsLearned.slice(0, 2).map((l, i) => (
                      <li key={i}><strong>{LESSON_TAG_LABEL[l.tag] || l.tag}:</strong> {l.note}</li>
                    ))}
                  </ul>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default SimilarPursuitsSelector
