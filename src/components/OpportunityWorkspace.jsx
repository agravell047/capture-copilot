import { useEffect, useRef, useState } from 'react'
import { reanalyzeOpportunity, updateOpportunity } from '../api/opportunities'
import {
  formatTimestamp,
  formatUpdateType,
  getLatestAnalysis,
  getOpportunityName
} from '../utils/opportunities'
import '../OpportunityCaptureForm.css'

const initialUpdateForm = {
  type: 'note',
  content: '',
  field: '',
  newValue: '',
  customNewValue: ''
}

const UPDATE_FIELD_OPTIONS = [
  { value: 'opportunityName', label: 'Opportunity Name' },
  { value: 'agency', label: 'Agency' },
  { value: 'contractValue', label: 'Contract Value' },
  { value: 'vehicle', label: 'Vehicle / Contract Type' },
  { value: 'setAside', label: 'Set-Aside Type' },
  { value: 'timeline', label: 'Timeline / Key Dates' },
  { value: 'description', label: 'Opportunity Description' },
  { value: 'knownRelationships', label: 'Known Relationships / Access Signals' },
  { value: 'notes', label: 'Internal Notes' }
]

const UPDATE_SELECT_CUSTOM_VALUE = '__custom__'

const AGENCY_OPTIONS = [
  'Department of Defense',
  'Department of Veterans Affairs',
  'Centers for Medicare & Medicaid Services (CMS)'
]

const VEHICLE_OPTIONS = [
  'GSA MAS',
  'SPRUCE IDIQ'
]

const CONTRACT_VALUE_OPTIONS = [
  { value: '<5M', label: '< $5M' },
  { value: '5-50M', label: '$5M - $50M' },
  { value: '50-200M', label: '$50M - $200M' },
  { value: '200M+', label: '$200M+' }
]

const SET_ASIDE_OPTIONS = [
  'None',
  'SDVOSB',
  '8(a)',
  'WOSB',
  'HUBZone'
]

function PwinGauge({ score, tier }) {
  const radius = 42
  const stroke = 8
  const circumference = Math.PI * radius // half-circle arc length
  const offset = circumference - (score / 100) * circumference
  const colorMap = { high: '#16a34a', medium: '#d97706', low: '#dc2626' }
  const color = colorMap[tier] || '#dc2626'
  return (
    <div className="pwin-gauge-wrap">
      <svg width="110" height="62" viewBox="0 0 110 62">
        {/* track */}
        <path
          d="M 9 58 A 42 42 0 0 1 101 58"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* fill — animates via CSS; hidden at 0 to avoid cap dot artifact */}
        {score > 0 && (
          <path
            d="M 9 58 A 42 42 0 0 1 101 58"
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }}
          />
        )}
      </svg>
      <div className="pwin-gauge-label">
        <span className="pwin-gauge-score" style={{ color }}>{score}%</span>
        <span className="pwin-gauge-text">pWin</span>
      </div>
    </div>
  )
}

const GATE_STEPS = [
  { key: '0', label: 'Awareness' },
  { key: '1', label: 'Qualify' },
  { key: '2', label: 'Capture' },
  { key: '3', label: 'Proposal' },
]

function GateProgressBar({ gate }) {
  const current = Number(gate ?? 0)
  const items = []
  GATE_STEPS.forEach((step, i) => {
    items.push(
      <div key={`step-${i}`} className={`gate-step${i <= current ? ' gate-step-done' : ''}${i === current ? ' gate-step-current' : ''}`}>
        <div className="gate-step-dot" />
        <div className="gate-step-label">{step.label}</div>
      </div>
    )
    if (i < GATE_STEPS.length - 1) {
      items.push(
        <div key={`conn-${i}`} className={`gate-connector${i < current ? ' gate-connector-done' : ''}`} />
      )
    }
  })
  return <div className="gate-progress-bar">{items}</div>
}

function OpportunityWorkspace({
  opportunity,
  onOpportunityChange,
  showUpdateForm = true
}) {
  const updateFormRef = useRef(null)
  const [updateForm, setUpdateForm] = useState(initialUpdateForm)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateMessage, setUpdateMessage] = useState('')
  const [reanalyzeLoading, setReanalyzeLoading] = useState(false)

  if (!opportunity) {
    return null
  }

  const latestAnalysis = getLatestAnalysis(opportunity)
  const updates = Array.isArray(opportunity.updates) ? opportunity.updates : []
  const isFieldUpdate = updateForm.type === 'field_update'
  const selectedField = isFieldUpdate ? updateForm.field.trim() : ''
  const currentFieldValue = selectedField ? (opportunity[selectedField] ?? '') : ''

  useEffect(() => {
    setUpdateForm(initialUpdateForm)
    setUpdateMessage('')
  }, [opportunity.id])

  const handleUpdateChange = (event) => {
    const { name, value } = event.target
    setUpdateForm((prev) => {
      if (name === 'type') {
        return {
          ...prev,
          type: value,
          content: '',
          field: '',
          newValue: '',
          customNewValue: ''
        }
      }

      if (name === 'field') {
        return {
          ...prev,
          field: value,
          newValue: '',
          customNewValue: ''
        }
      }

      if (name === 'newValue' && prev.newValue !== value) {
        return {
          ...prev,
          newValue: value,
          customNewValue: value === UPDATE_SELECT_CUSTOM_VALUE ? prev.customNewValue : ''
        }
      }

      return {
        ...prev,
        [name]: value
      }
    })
  }

  const handleAddUpdate = async (event) => {
    event.preventDefault()

    setUpdateLoading(true)
    setUpdateMessage('')

    if (!updateForm.content.trim() && !isFieldUpdate) {
      setUpdateMessage('Update details are required')
      setUpdateLoading(false)
      return
    }

    const effectiveNewValue = updateForm.newValue === UPDATE_SELECT_CUSTOM_VALUE
      ? updateForm.customNewValue.trim()
      : updateForm.newValue.trim()

    if (isFieldUpdate && (!updateForm.field.trim() || !effectiveNewValue)) {
      setUpdateMessage('Field updates require both a field name and a new value')
      setUpdateLoading(false)
      return
    }

    try {
      const updatedOpportunity = await updateOpportunity(opportunity.id, {
        type: updateForm.type,
        content: updateForm.content.trim(),
        field: updateForm.field.trim() || undefined,
        newValue: effectiveNewValue || undefined
      })

      onOpportunityChange?.(updatedOpportunity)
      setUpdateForm(initialUpdateForm)
      setUpdateMessage(
        updatedOpportunity.analysisError
          ? `Update saved, but re-analysis failed: ${updatedOpportunity.analysisError}`
          : 'Update saved and analysis refreshed.'
      )
    } catch (error) {
      setUpdateMessage(error.message)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleReanalyze = async () => {
    setReanalyzeLoading(true)
    setUpdateMessage('')

    try {
      const refreshedOpportunity = await reanalyzeOpportunity(opportunity.id)
      onOpportunityChange?.(refreshedOpportunity)
      setUpdateMessage('Analysis refreshed.')
    } catch (error) {
      setUpdateMessage(error.message)
    } finally {
      setReanalyzeLoading(false)
    }
  }

  const handleScrollToUpdateForm = () => {
    if (!showUpdateForm) return
    // Let layout settle in case content just expanded/loaded.
    setTimeout(() => updateFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  return (
    <div className="results-section">
      <div className="opportunity-header">
        <div className="header-info">
          <h2>{getOpportunityName(opportunity)}</h2>
          <p className="agency-info">{opportunity.agency}</p>
          <p className="meta-info">
            {opportunity.contractValue} • {opportunity.vehicle || 'Vehicle TBD'} • {opportunity.setAside}
          </p>
          <p className="meta-info">Last updated: {formatTimestamp(opportunity.updatedAt)}</p>
          <p className="meta-info">Status: {opportunity.status}</p>
        </div>

        <div className="opportunity-header-actions">
          <PwinGauge score={latestAnalysis.pWinScore?.score || 0} tier={latestAnalysis.pWinScore?.tier || 'low'} />

          <button
            type="button"
            className="btn btn-secondary workspace-action"
            onClick={handleReanalyze}
            disabled={reanalyzeLoading}
          >
            {reanalyzeLoading ? '⟳ Refreshing…' : '⟳ Re-run Analysis'}
          </button>
        </div>
      </div>

      <GateProgressBar gate={opportunity.gate} />

      <div className="result-card opportunity-snapshot-card">
        <h3>Opportunity Snapshot</h3>
        <dl className="profile-list">
          <div className="profile-row">
            <dt>Gate</dt>
            <dd>{(() => {
              const g = Number.isFinite(Number(opportunity.gate)) ? Number(opportunity.gate) : 0
              const names = ['Awareness', 'Qualify', 'Capture', 'Proposal']
              return `Gate ${g} — ${names[g] ?? ''}` 
            })()}</dd>
          </div>
          <div className="profile-row">
            <dt>Agency</dt>
            <dd>{opportunity.agency || 'Not specified'}</dd>
          </div>
          <div className="profile-row">
            <dt>Vehicle</dt>
            <dd>{opportunity.vehicle || 'Not specified'}</dd>
          </div>
          <div className="profile-row">
            <dt>Set-Aside</dt>
            <dd>{opportunity.setAside || 'None'}</dd>
          </div>
          <div className="profile-row">
            <dt>Timeline</dt>
            <dd>{opportunity.timeline || 'Not specified'}</dd>
          </div>
          <div className="profile-row">
            <dt>Relationships</dt>
            <dd>{opportunity.knownRelationships || 'None documented'}</dd>
          </div>
          <div className="profile-row">
            <dt>Evaluation</dt>
            <dd>{opportunity.evaluation?.type ? opportunity.evaluation.type : 'Unknown'}</dd>
          </div>
        </dl>
      </div>

      <div className="opportunity-profile-grid">
        <div className="result-card">
          <h3>Stakeholders</h3>
          {Array.isArray(opportunity.stakeholders) && opportunity.stakeholders.length > 0 ? (
            <ul className="simple-list">
              {opportunity.stakeholders.slice(0, 12).map((person) => (
                <li key={person.id || person.name}>
                  <strong>{person.name}</strong>
                  {person.role ? ` — ${person.role}` : ''}
                  {person.office ? ` (${person.office})` : ''}
                  {person.relationshipStrength ? ` • ${person.relationshipStrength}` : ''}
                  {person.nextTouch ? ` • next: ${person.nextTouch}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">No stakeholders documented</p>
          )}
        </div>

        <div className="result-card">
          <h3>Sources / Evidence</h3>
          {Array.isArray(opportunity.evidence) && opportunity.evidence.length > 0 ? (
            <ul className="simple-list">
              {opportunity.evidence.slice(0, 12).map((item) => (
                <li key={item.id || item.url || item.note}>
                  <strong>{item.source || 'Other'}</strong>
                  {item.url ? (
                    <>
                      {' — '}
                      <a href={item.url} target="_blank" rel="noreferrer" title={item.url}>
                        Link →
                      </a>
                    </>
                  ) : null}
                  {item.note ? ` — ${item.note}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">No evidence logged</p>
          )}
        </div>

        {opportunity.rfp?.summary && (
          <div className="result-card">
            <h3>RFP Summary</h3>
            <p className="profile-copy">{opportunity.rfp.summary.overview || 'No overview available.'}</p>
            {Array.isArray(opportunity.rfp.summary.requirements) && opportunity.rfp.summary.requirements.length > 0 && (
              <>
                <h4>Key Requirements</h4>
                <ul>
                  {opportunity.rfp.summary.requirements.slice(0, 6).map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <div className="result-card">
          <h3>Description</h3>
          <p className="profile-copy">{opportunity.description || 'No description provided.'}</p>
        </div>

        <div className="result-card">
          <h3>Internal Notes</h3>
          <p className="profile-copy">{opportunity.notes || 'No internal notes captured.'}</p>
        </div>
      </div>

      <div className="results-grid">
        <div className="result-card">
          <h3>Fit Assessment</h3>
          {latestAnalysis.fitAssessment ? (
            <div className="fit-content">
              <div className={`fit-rating fit-${latestAnalysis.fitAssessment.rating?.toLowerCase()}`}>
                {latestAnalysis.fitAssessment.rating}
              </div>
              <p className="fit-rationale">{latestAnalysis.fitAssessment.rationale}</p>
              {Array.isArray(latestAnalysis.fitAssessment.details) && latestAnalysis.fitAssessment.details.length > 0 && (
                <>
                  <h4>Why</h4>
                  <ul>
                    {latestAnalysis.fitAssessment.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </>
              )}
              {latestAnalysis.fitAssessment.strengths && (
                <>
                  <h4>Strengths</h4>
                  <ul>
                    {latestAnalysis.fitAssessment.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : (
            <p className="empty">No fit assessment available</p>
          )}
        </div>

        <div className="result-card">
          <h3>Gap Analysis</h3>
          <p className="card-help">Severity shows estimated impact on win probability (higher = bigger risk to winning).</p>
          {latestAnalysis.gaps && latestAnalysis.gaps.length > 0 ? (
            <ul className="gap-list">
              {latestAnalysis.gaps.map((gap, index) => (
                <li key={index} className={`gap-${gap.severity?.toLowerCase()}`}>
                  <span className={`gap-severity gap-severity-${gap.severity?.toLowerCase()}`}>
                    <span
                      title={`Severity: ${gap.severity}. Higher means a larger negative impact on win probability.`}
                    >
                      {String(gap.severity || '').toUpperCase()}
                    </span>
                  </span>
                  <div>
                    <p className="gap-area">{gap.area}</p>
                    <p className="gap-detail">{gap.detail}</p>
                    {gap.mitigation && <p className="gap-mitigation">Mitigation: {gap.mitigation}</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">No significant gaps identified</p>
          )}
        </div>

        <div className="result-card">
          <h3>Recommendation</h3>
          {latestAnalysis.recommendation ? (
            <div className="recommendation-content">
              <div className={`recommendation-action recommendation-${latestAnalysis.recommendation.action?.toLowerCase().replace(/\s+/g, '-')}`}>
                {latestAnalysis.recommendation.action}
              </div>
              <p>{latestAnalysis.recommendation.rationale}</p>
              {latestAnalysis.recommendation.nextSteps && (
                <>
                  <h4>{latestAnalysis.recommendation.action === 'Pass' ? 'Possible Next Steps' : 'Next Steps'}</h4>
                  <ol>
                    {latestAnalysis.recommendation.nextSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          ) : (
            <p className="empty">No recommendation available</p>
          )}
        </div>
      </div>

      {Array.isArray(latestAnalysis.proposedTeam) && latestAnalysis.proposedTeam.length > 0 && (
        <div className="result-card proposed-team-card">
          <div className="proposed-team-header">
            <div>
              <h3>Proposed Capture Team</h3>
              <p className="card-help">Recommended by the AI based on skills, experience, and opportunity fit. Names and emails are resolved locally — they were never sent to the AI.</p>
            </div>
            <button
              type="button"
              className="btn btn-primary email-blast-btn"
              onClick={() => {
                const to = latestAnalysis.proposedTeam.map((m) => m.email).filter(Boolean).join(',');
                const subject = encodeURIComponent(`Capture Team — ${latestAnalysis.opportunityName || 'New Opportunity'}`);
                const body = encodeURIComponent(
                  `Hi team,\n\nYou have been identified as a proposed team member for the following capture opportunity:\n\n` +
                  `Opportunity: ${latestAnalysis.opportunityName || 'TBD'}\n\n` +
                  latestAnalysis.proposedTeam.map((m) => `• ${m.name} — ${m.proposedRole}`).join('\n') +
                  `\n\nPlease confirm your availability and interest.\n\nThanks`
                );
                window.open(`mailto:${to}?subject=${subject}&body=${body}`);
              }}
            >
              Invite Team by Email
            </button>
          </div>
          <ul className="proposed-team-list">
            {latestAnalysis.proposedTeam.map((member) => (
              <li key={member.id} className="proposed-team-member">
                <div className="proposed-team-info">
                  <strong>{member.name}</strong>
                  <span className="proposed-role-badge">{member.proposedRole}</span>
                  <span className="proposed-team-title">{member.role}</span>
                </div>
                <p className="proposed-team-rationale">{member.rationale}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {latestAnalysis.feasibilityFactors && (
        <div className="feasibility-section">
          <h3>Feasibility Factors</h3>
          <p className="feasibility-subtitle">Could we win this? — vehicle access, alignment, and execution readiness, independent of whether we <em>should</em> pursue it.</p>
          <div className="factors-grid">
            {Object.entries(latestAnalysis.feasibilityFactors).map(([key, value]) => (
              <div key={key} className="factor">
                <span className="factor-name">{key}</span>
                <span className={`factor-value factor-${value?.toLowerCase()}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="updates-section">
        <div className="updates-header">
          <div>
            <h3>Activity Log / Updates</h3>
            <p className="subtitle updates-subtitle">
              Context changes are stored with the opportunity and used in each re-analysis.
            </p>
          </div>
        </div>

        <div className="updates-layout updates-layout-full">
          <div className="updates-feed">
            {updates.length > 0 ? (
              <ul className="updates-list">
                {updates.map((update) => (
                  <li key={update.id} className="update-item">
                    <div className="update-meta">
                      <span className={`update-type update-type-${update.type}`}>{formatUpdateType(update.type)}</span>
                      <span className="update-timestamp">{formatTimestamp(update.timestamp)}</span>
                    </div>
                    <p className="update-content">{update.content}</p>
                    {update.field && (
                      <p className="update-field-detail">
                        Field: <strong>{update.field}</strong>
                        {update.newValue !== undefined ? ` -> ${String(update.newValue)}` : ''}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty">No updates yet. Add new context to evolve the analysis over time.</p>
            )}
          </div>

          {false && (
            <div className="update-form-card" ref={updateFormRef}>
              <h3>Add Update</h3>

              <form onSubmit={handleAddUpdate} className="update-form">
                <div className="form-group">
                  <label htmlFor="updateType">Update Type</label>
                  <select
                    id="updateType"
                    name="type"
                    value={updateForm.type}
                    onChange={handleUpdateChange}
                  >
                    <option value="note">Note</option>
                    <option value="relationship">Relationship</option>
                    <option value="risk">Risk</option>
                    <option value="capability">Capability</option>
                    <option value="field_update">Field Update</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="updateContent">{isFieldUpdate ? 'Notes (Optional)' : 'Details'}</label>
                  <textarea
                    id="updateContent"
                    name="content"
                    value={updateForm.content}
                    onChange={handleUpdateChange}
                    placeholder={
                      isFieldUpdate
                        ? 'Optional: why is this changing? (The system will auto-generate a summary if you leave this blank.)'
                        : 'Add the new note, relationship, risk, or capability (who/what/when and why it matters)...'
                    }
                    rows="4"
                  />
                </div>

                {isFieldUpdate && (
                  <>
                    <p className="card-help">
                      Field Updates change the opportunity snapshot and trigger re-analysis automatically.
                    </p>

                    <div className="form-group">
                      <label htmlFor="updateFieldSelect">Field to Update *</label>
                      <select
                        id="updateFieldSelect"
                        name="field"
                        value={updateForm.field}
                        onChange={handleUpdateChange}
                      >
                        <option value="">Select a field</option>
                        {UPDATE_FIELD_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {selectedField && (
                        <p className="field-help">
                          Current value: <strong>{String(currentFieldValue || '—')}</strong>
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="updateValue">New Value *</label>

                      {selectedField === 'contractValue' ? (
                        <select
                          id="updateValue"
                          name="newValue"
                          value={updateForm.newValue}
                          onChange={handleUpdateChange}
                        >
                          <option value="">Select contract value</option>
                          {CONTRACT_VALUE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : selectedField === 'setAside' ? (
                        <select
                          id="updateValue"
                          name="newValue"
                          value={updateForm.newValue}
                          onChange={handleUpdateChange}
                        >
                          <option value="">Select set-aside</option>
                          {SET_ASIDE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : selectedField === 'agency' ? (
                        <select
                          id="updateValue"
                          name="newValue"
                          value={updateForm.newValue}
                          onChange={handleUpdateChange}
                        >
                          <option value="">Select an agency</option>
                          {AGENCY_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                          <option value={UPDATE_SELECT_CUSTOM_VALUE}>Custom...</option>
                        </select>
                      ) : selectedField === 'vehicle' ? (
                        <select
                          id="updateValue"
                          name="newValue"
                          value={updateForm.newValue}
                          onChange={handleUpdateChange}
                        >
                          <option value="">Select contract type</option>
                          {VEHICLE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                          <option value={UPDATE_SELECT_CUSTOM_VALUE}>Custom...</option>
                        </select>
                      ) : ['description', 'notes', 'knownRelationships'].includes(selectedField) ? (
                        <textarea
                          id="updateValue"
                          name="newValue"
                          value={updateForm.newValue}
                          onChange={handleUpdateChange}
                          placeholder="Enter the updated value"
                          rows="3"
                        />
                      ) : (
                        <input
                          type="text"
                          id="updateValue"
                          name="newValue"
                          value={updateForm.newValue}
                          onChange={handleUpdateChange}
                          placeholder="Enter the updated value"
                        />
                      )}

                      {updateForm.newValue === UPDATE_SELECT_CUSTOM_VALUE && (
                        <input
                          type="text"
                          className="custom-new-value"
                          value={updateForm.customNewValue}
                          onChange={(e) => setUpdateForm((prev) => ({ ...prev, customNewValue: e.target.value }))}
                          placeholder="Enter custom value"
                        />
                      )}
                    </div>
                  </>
                )}

                {updateMessage && (
                  <div className={updateMessage.includes('failed') || updateMessage.includes('require') ? 'error-message' : 'info-message'}>
                    {updateMessage}
                  </div>
                )}

                <div className="form-actions update-actions">
                  <button type="submit" disabled={updateLoading} className="btn btn-primary">
                    {updateLoading ? 'Saving Update...' : 'Add Update'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OpportunityWorkspace
