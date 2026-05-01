import { useEffect, useRef, useState } from 'react'
import { listOpportunities, patchOpportunity } from '../api/opportunities'
import {
  formatTimestamp,
  formatContractValueBucket,
  getOpportunityName,
  getPwinScore,
  getRecommendationLabel
} from '../utils/opportunities'
import './OpportunityPortfolioPage.css'

const CLOSED_STATUSES = ['won', 'lost', 'no_bid', 'withdrew']

const GATES = [
  { key: '0', label: 'Gate 0', sublabel: 'Awareness' },
  { key: '1', label: 'Gate 1', sublabel: 'Qualify' },
  { key: '2', label: 'Gate 2', sublabel: 'Capture' },
  { key: '3', label: 'Gate 3', sublabel: 'Proposal' },
]

const VALUE_MIDPOINTS = {
  '<5M': 2.5,
  '5-50M': 27.5,
  '10-50M': 30,
  '50-200M': 125,
  '200M+': 300,
}

function formatMillions(m) {
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`
  if (m >= 1) return `$${Math.round(m)}M`
  return `$${Math.round(m * 1000)}K`
}

function pwinClass(score) {
  if (score === null || score === undefined) return 'pwin-null'
  if (score >= 70) return 'pwin-high'
  if (score >= 50) return 'pwin-med'
  return 'pwin-low'
}

const TABLE_COLS = [
  { key: 'name', label: 'Opportunity' },
  { key: 'agency', label: 'Agency' },
  { key: 'gate', label: 'Gate' },
  { key: 'pwin', label: 'pWin' },
  { key: 'value', label: 'Value' },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'updatedAt', label: 'Updated' },
]

function OpportunityPortfolioPage({ onCreateOpportunity, onOpenOpportunity }) {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('board')
  const [showClosed, setShowClosed] = useState(false)
  const [sortCol, setSortCol] = useState('updatedAt')
  const [sortDir, setSortDir] = useState('desc')
  const [dragOverGate, setDragOverGate] = useState(null)
  const dragId = useRef(null)

  const loadOpportunities = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listOpportunities()
      setOpportunities(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOpportunities() }, [])

  const archiveOpportunity = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Archive this opportunity?')) return
    try {
      await patchOpportunity(id, { status: 'archived' })
      await loadOpportunities()
    } catch (err) {
      setError(err.message)
    }
  }

  const changeGate = async (id, newGate) => {
    // Optimistic update — move the card instantly in local state, no loading flash
    setOpportunities((prev) =>
      prev.map((o) => o.id === id ? { ...o, gate: Number(newGate) } : o)
    )
    try {
      await patchOpportunity(id, { gate: newGate })
    } catch (err) {
      // Revert on failure
      setError(err.message)
      await loadOpportunities()
    }
  }

  const onDragStart = (e, id) => {
    dragId.current = id
    e.dataTransfer.effectAllowed = 'move'
    // slight delay so the card doesn't disappear before ghost renders
    setTimeout(() => e.target.classList.add('dragging'), 0)
  }

  const onDragEnd = (e) => {
    e.target.classList.remove('dragging')
    dragId.current = null
    setDragOverGate(null)
  }

  const onDragOver = (e, gateKey) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverGate(gateKey)
  }

  const onDrop = async (e, gateKey) => {
    e.preventDefault()
    setDragOverGate(null)
    const id = dragId.current
    if (!id) return
    // find the card's current gate and skip if same column
    const opp = opportunities.find((o) => o.id === id)
    if (!opp || String(opp.gate) === gateKey) return
    await changeGate(id, gateKey)
  }

  const activeOpps = opportunities.filter((o) => o.status === 'active')
  const closedOpps = opportunities.filter((o) => CLOSED_STATUSES.includes(o.status))
  const highPwinCount = activeOpps.filter((o) => (getPwinScore(o) || 0) >= 70).length
  const needsAttention = activeOpps.filter((o) => getRecommendationLabel(o) === 'Pass').length

  const weightedValue = activeOpps.reduce((sum, o) => {
    const mid = VALUE_MIDPOINTS[o.contractValue] || 0
    const pwin = getPwinScore(o)
    return sum + mid * (pwin !== null ? pwin / 100 : 0.5)
  }, 0)

  const totalPipeline = activeOpps.reduce((sum, o) => sum + (VALUE_MIDPOINTS[o.contractValue] || 0), 0)

  const wonCount = closedOpps.filter((o) => o.status === 'won').length
  const decidedCount = closedOpps.filter((o) => ['won', 'lost', 'no_bid', 'withdrew'].includes(o.status)).length
  const winRate = decidedCount > 0 ? Math.round((wonCount / decidedCount) * 100) : null

  const inProposal = activeOpps.filter((o) => String(o.gate) === '3').length

  const q = search.trim().toLowerCase()
  const matchesSearch = (o) => {
    if (!q) return true
    return [getOpportunityName(o), o.agency, o.vehicle, o.setAside, o.description]
      .filter(Boolean).join(' ').toLowerCase().includes(q)
  }

  const gateOpps = (gateKey) =>
    activeOpps
      .filter((o) => String(o.gate) === gateKey && matchesSearch(o))
      .sort((a, b) => (getPwinScore(b) || 0) - (getPwinScore(a) || 0))

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortCol(col); setSortDir('asc') }
  }

  const tableOpps = opportunities
    .filter((o) => o.status !== 'archived' && matchesSearch(o))
    .sort((a, b) => {
      let av, bv
      if (sortCol === 'name') { av = getOpportunityName(a); bv = getOpportunityName(b) }
      else if (sortCol === 'pwin') { av = getPwinScore(a) ?? -1; bv = getPwinScore(b) ?? -1 }
      else if (sortCol === 'gate') { av = Number(a.gate ?? 99); bv = Number(b.gate ?? 99) }
      else { av = a[sortCol] || ''; bv = b[sortCol] || '' }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const SortIcon = ({ col }) =>
    sortCol === col
      ? <span className="sort-icon active">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
      : <span className="sort-icon"> ⇅</span>

  return (
    <div className="portfolio-page">
      <div className="portfolio-header">
        <h2>Dashboard <span className="portfolio-subtitle">Active pursuits by gate stage — open any card to view AI analysis and update your capture.</span></h2>
      </div>

      <div className="portfolio-kpi-bar">
        <div className="summary-card summary-card-blue">
          <span className="summary-label">Active Pursuits</span>
          <strong>{activeOpps.length}</strong>
        </div>
        <div className="summary-card summary-card-indigo" title="Opportunities currently in Gate 3 (Proposal stage)">
          <span className="summary-label">In Proposal</span>
          <strong>{inProposal}</strong>
        </div>
        <div className="summary-card summary-card-slate" title="Sum of all active opportunity value midpoints before pWin weighting">
          <span className="summary-label">Total Pipeline</span>
          <strong>{totalPipeline > 0 ? formatMillions(totalPipeline) : '—'}</strong>
        </div>
        <div className="summary-card summary-card-purple" title="Sum of (contract value midpoint × pWin) across active opportunities — the dollar value you'd expect to win if scores hold">
          <span className="summary-label">Expected Value</span>
          <strong>{weightedValue > 0 ? formatMillions(weightedValue) : '—'}</strong>
        </div>
        <div className="summary-card summary-card-teal" title="Won ÷ (won + lost + no-bid + withdrew) across all closed opportunities">
          <span className="summary-label">Win Rate</span>
          <strong>{winRate !== null ? `${winRate}%` : '—'}</strong>
        </div>
        <div className="summary-card summary-card-green">
          <span className="summary-label">High pWin (70%+)</span>
          <strong>{highPwinCount}</strong>
        </div>
        <div className="summary-card summary-card-amber">
          <span className="summary-label">Needs Attention</span>
          <strong style={{ color: needsAttention > 0 ? '#b91c1c' : undefined }}>
            {needsAttention}
          </strong>
        </div>
      </div>

      <div className="portfolio-toolbar">

        <div className="toolbar-search">
          <input
            type="text"
            placeholder="Search by name, agency, vehicle…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="view-toggle">
          <button
            type="button"
            className={`view-toggle-btn${view === 'board' ? ' active' : ''}`}
            onClick={() => setView('board')}
          >
            ▦ Board
          </button>
          <button
            type="button"
            className={`view-toggle-btn${view === 'table' ? ' active' : ''}`}
            onClick={() => setView('table')}
          >
            ≡ Table
          </button>
        </div>
      </div>

      {/* Pipeline health warnings */}
      {activeOpps.length > 0 && (() => {
        const warnings = []
        const gate3Count = activeOpps.filter((o) => String(o.gate) === '3').length
        const gate2Count = activeOpps.filter((o) => String(o.gate) === '2').length
        const gate1Count = activeOpps.filter((o) => String(o.gate) === '1').length
        if (gate3Count === 0 && gate2Count === 0)
          warnings.push({ level: 'red', msg: 'No opportunities in Gate 2 or 3 — near-term revenue is at risk. Advance pursuits or add new captures.' })
        if (gate1Count + gate2Count + gate3Count === 0 && activeOpps.length > 0)
          warnings.push({ level: 'yellow', msg: 'All active pursuits are in Gate 0 — qualify or cull before investing more capture resources.' })
        if (needsAttention >= 2)
          warnings.push({ level: 'yellow', msg: `${needsAttention} opportunities have a Pass recommendation. Review and decide whether to cull them.` })
        if (warnings.length === 0) return null
        return (
          <div className="pipeline-warnings">
            {warnings.map((w, i) => (
              <div key={i} className={`pipeline-warning pipeline-warning-${w.level}`}>
                {w.msg}
              </div>
            ))}
          </div>
        )
      })()}


      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="page-loading">
          <div className="page-loading-spinner" />
          Loading…
        </div>
      ) : view === 'board' ? (
        <>
          <div className="kanban-board">
            {GATES.map((gate) => {
              const cards = gateOpps(gate.key)
              const gateValue = cards.reduce((s, o) => s + (VALUE_MIDPOINTS[o.contractValue] || 0), 0)
              return (
                <div
                  key={gate.key}
                  className={`kanban-column${dragOverGate === gate.key ? ' drop-target' : ''}`}
                  onDragOver={(e) => onDragOver(e, gate.key)}
                  onDragLeave={() => setDragOverGate(null)}
                  onDrop={(e) => onDrop(e, gate.key)}
                >
                  <div className="kanban-col-header">
                    <div>
                      <div className="kanban-gate-label">{gate.label}</div>
                      <div className="kanban-gate-sublabel">{gate.sublabel}</div>
                    </div>
                    <div className="kanban-col-meta">
                      <span className="kanban-count">{cards.length}</span>
                      {gateValue > 0 && (
                        <span className="kanban-col-value">{formatMillions(gateValue)}</span>
                      )}
                    </div>
                  </div>
                  <div className="kanban-cards">
                    {cards.length === 0 ? (
                      <div className="kanban-empty">No opportunities</div>
                    ) : (
                      cards.map((o) => {
                        const pwin = getPwinScore(o)
                        const rec = getRecommendationLabel(o)
                        const gateNum = Number(o.gate ?? 0)
                        const pwinIsEarly = gateNum < 2
                        return (
                          <div
                            key={o.id}
                            className={`kanban-card kanban-card-${pwin === null ? 'none' : pwinClass(pwin)}`}
                            draggable
                            onDragStart={(e) => onDragStart(e, o.id)}
                            onDragEnd={onDragEnd}
                            onClick={() => onOpenOpportunity(o.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && onOpenOpportunity(o.id)}
                          >
                            <div className="kanban-drag-handle" title="Drag to move gate">⠿</div>
                            <div className="kanban-card-name">{getOpportunityName(o)}</div>
                            <div className="kanban-card-agency">{o.agency}</div>
                            <div className="kanban-card-footer">
                              {pwin !== null ? (
                                <span
                                  className={`kanban-pwin ${pwinIsEarly ? 'pwin-early' : pwinClass(pwin)}`}
                                  title={pwinIsEarly ? 'Early estimate — pWin confidence increases at Gate 2+' : `pWin: ${pwin}%`}
                                >
                                  {pwinIsEarly ? `~${pwin}%` : `${pwin}%`}
                                </span>
                              ) : (
                                <span className="kanban-pwin pwin-null">—</span>
                              )}
                              <span className="kanban-card-value">
                                {formatContractValueBucket(o.contractValue)}
                              </span>
                              {rec === 'Pass' && (
                                <span className="kanban-attention" title="AI recommends Pass">⚠</span>
                              )}
                            </div>
                            {o.updatedAt && (() => {
                              const days = Math.floor((Date.now() - new Date(o.updatedAt).getTime()) / 86400000)
                              const label = days === 0 ? 'today' : days === 1 ? '1d ago' : `${days}d ago`
                              const stale = days >= 14
                              return (
                                <div className={`kanban-freshness${stale ? ' kanban-freshness-stale' : ''}`} title={`Last updated ${formatTimestamp(o.updatedAt)}`}>
                                  {stale ? '⚠ ' : ''}{label}
                                </div>
                              )
                            })()}
                            <div className="kanban-card-actions">
                              <button
                                type="button"
                                className="kanban-archive-btn"
                                onClick={(e) => archiveOpportunity(o.id, e)}
                                title="Archive"
                              >
                                Archive
                              </button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {closedOpps.length > 0 && (
            <div className="closed-section">
              <button
                type="button"
                className="closed-toggle"
                onClick={() => setShowClosed((v) => !v)}
              >
                {showClosed ? '▾' : '▸'} Closed Opportunities
                <span className="portfolio-tab-count" style={{ marginLeft: 8 }}>{closedOpps.length}</span>
              </button>
              {showClosed && (
                <table className="closed-table">
                  <thead>
                    <tr>
                      <th>Opportunity</th>
                      <th>Agency</th>
                      <th>Outcome</th>
                      <th>Value</th>
                      <th>Closed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closedOpps.map((o) => (
                      <tr
                        key={o.id}
                        className="closed-row"
                        onClick={() => onOpenOpportunity(o.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onOpenOpportunity(o.id)}
                      >
                        <td className="closed-name">{getOpportunityName(o)}</td>
                        <td>{o.agency}</td>
                        <td>
                          <span className={`portfolio-status portfolio-status-${o.status}`}>
                            {o.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{formatContractValueBucket(o.contractValue)}</td>
                        <td>{formatTimestamp(o.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="portfolio-table-wrap">
          <table className="portfolio-table">
            <thead>
              <tr>
                {TABLE_COLS.map((col) => (
                  <th key={col.key} className="sortable-th" onClick={() => handleSort(col.key)}>
                    {col.label}<SortIcon col={col.key} />
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {tableOpps.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                    No results
                  </td>
                </tr>
              ) : (
                tableOpps.map((o) => {
                  const pwin = getPwinScore(o)
                  const isClosed = CLOSED_STATUSES.includes(o.status)
                  return (
                    <tr
                      key={o.id}
                      className="portfolio-table-row"
                      onClick={() => onOpenOpportunity(o.id)}
                    >
                      <td className="table-name">
                        <span className={`portfolio-status portfolio-status-${o.status}`} style={{ marginRight: 8 }}>
                          {o.status.replace('_', ' ')}
                        </span>
                        {getOpportunityName(o)}
                      </td>
                      <td>{o.agency}</td>
                      <td>{isClosed ? '—' : `Gate ${o.gate ?? '?'}`}</td>
                      <td>
                        {isClosed ? (
                          <span style={{ textTransform: 'capitalize', color: '#6b7280' }}>
                            {o.status.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className={`kanban-pwin ${pwinClass(pwin)}`}>
                            {pwin !== null ? `${pwin}%` : '—'}
                          </span>
                        )}
                      </td>
                      <td>{formatContractValueBucket(o.contractValue)}</td>
                      <td>{o.vehicle || '—'}</td>
                      <td>{formatTimestamp(o.updatedAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: 12, whiteSpace: 'nowrap' }}
                          onClick={(e) => { e.stopPropagation(); onOpenOpportunity(o.id) }}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default OpportunityPortfolioPage
