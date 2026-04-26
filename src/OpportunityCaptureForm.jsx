import { useEffect, useState } from 'react'
import { createOpportunity, getOpportunity, ingestRfp, patchOpportunity } from './api/opportunities'
import OpportunityWorkspace from './components/OpportunityWorkspace'
import './OpportunityCaptureForm.css'

const initialFormData = {
  opportunityName: '',
  agency: '',
  customAgency: '',
  contractValue: '<5M',
  vehicle: '',
  customVehicle: '',
  setAside: 'None',
  gate: 0,
  timeline: '',
  description: '',
  rfpText: '',
  rfpFileName: '',
  rfpSummary: null,
  rfpId: '',
  knownRelationships: '',
  notes: '',
  evaluationType: '',
  evaluationNotes: '',
  evaluationCriteria: [],
  stakeholders: [],
  evidence: []
}

const agencyOptions = [
  'Department of Defense',
  'Department of Veterans Affairs',
  'Centers for Medicare & Medicaid Services (CMS)',
  'Other'
]

const vehicleOptions = [
  'GSA MAS',
  'SPRUCE IDIQ',
  'Other'
]

const buildFormStateFromOpportunity = (opportunity) => {
  const evaluation = opportunity.evaluation || {}
  const isOtherAgency = opportunity.agency && !agencyOptions.includes(opportunity.agency)
  const isOtherVehicle = opportunity.vehicle && !vehicleOptions.includes(opportunity.vehicle)
  const rfp = opportunity.rfp || {}

  return {
    ...initialFormData,
    opportunityName: opportunity.opportunityName || opportunity.name || '',
    agency: isOtherAgency ? 'Other' : opportunity.agency || '',
    customAgency: isOtherAgency ? opportunity.agency : '',
    contractValue: opportunity.contractValue || '<5M',
    vehicle: isOtherVehicle ? 'Other' : opportunity.vehicle || '',
    customVehicle: isOtherVehicle ? opportunity.vehicle : '',
    setAside: opportunity.setAside || 'None',
    gate: Number.isFinite(Number(opportunity.gate)) ? opportunity.gate : 0,
    timeline: opportunity.timeline || '',
    description: opportunity.description || '',
    rfpText: '',
    rfpFileName: rfp.filename || '',
    rfpSummary: rfp.summary || null,
    rfpId: rfp.id || '',
    knownRelationships: opportunity.knownRelationships || '',
    notes: opportunity.notes || '',
    evaluationType: evaluation.type || '',
    evaluationNotes: evaluation.notes || '',
    evaluationCriteria: evaluation.criteria || [],
    stakeholders: opportunity.stakeholders || [],
    evidence: opportunity.evidence || []
  }
}

function OpportunityCaptureForm({ editingOpportunityId, onOpportunityCreated, onViewPortfolio }) {
  const [formData, setFormData] = useState(initialFormData)
  const [evaluationCriteriaDraft, setEvaluationCriteriaDraft] = useState('')
  const [stakeholderDraft, setStakeholderDraft] = useState({
    name: '',
    role: '',
    office: '',
    relationshipStrength: 'moderate',
    lastTouch: '',
    nextTouch: '',
    notes: ''
  })
  const [evidenceDraft, setEvidenceDraft] = useState({
    source: 'SAM.gov',
    url: '',
    note: ''
  })
  const [useUploadedRfp, setUseUploadedRfp] = useState(false)
  const [rfpUploading, setRfpUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingOpportunity, setLoadingOpportunity] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [collapsedSections, setCollapsedSections] = useState({
    evaluation: true,
    knownRelationships: true,
    stakeholders: true,
    evidence: true,
    internalNotes: true
  })

  useEffect(() => {
    setCollapsedSections((current) => ({
      ...current,
      evaluation: !(formData.evaluationType || formData.evaluationCriteria.length || formData.evaluationNotes),
      knownRelationships: !formData.knownRelationships,
      stakeholders: !formData.stakeholders.length,
      evidence: !formData.evidence.length,
      internalNotes: !formData.notes
    }))
  }, [])

  useEffect(() => {
    let ignore = false

    const loadOpportunityForEdit = async () => {
      if (!editingOpportunityId) {
        setFormData(initialFormData)
        setUseUploadedRfp(false)
        setError('')
        setResult(null)
        setLoadingOpportunity(false)
        return
      }

      setLoadingOpportunity(true)
      setError('')

      try {
        const opportunity = await getOpportunity(editingOpportunityId)

        if (ignore) return

        const loadedFormData = buildFormStateFromOpportunity(opportunity)
        setFormData(loadedFormData)
        setUseUploadedRfp(Boolean(loadedFormData.rfpSummary))
        setCollapsedSections({
          evaluation: !(loadedFormData.evaluationType || loadedFormData.evaluationCriteria.length || loadedFormData.evaluationNotes),
          knownRelationships: !loadedFormData.knownRelationships,
          stakeholders: !loadedFormData.stakeholders.length,
          evidence: !loadedFormData.evidence.length,
          internalNotes: !loadedFormData.notes
        })
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message)
        }
      } finally {
        if (!ignore) {
          setLoadingOpportunity(false)
        }
      }
    }

    loadOpportunityForEdit()

    return () => {
      ignore = true
    }
  }, [editingOpportunityId])

  const normalizedAgency = formData.agency === 'Other'
    ? formData.customAgency.trim()
    : formData.agency.trim()
  const normalizedVehicle = formData.vehicle === 'Other'
    ? formData.customVehicle.trim()
    : formData.vehicle.trim()

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const addEvaluationCriterion = () => {
    const trimmed = evaluationCriteriaDraft.trim()
    if (!trimmed) return
    setFormData((prev) => ({
      ...prev,
      evaluationCriteria: [...(prev.evaluationCriteria || []), trimmed].slice(0, 12)
    }))
    setEvaluationCriteriaDraft('')
  }

  const removeEvaluationCriterion = (index) => {
    setFormData((prev) => ({
      ...prev,
      evaluationCriteria: (prev.evaluationCriteria || []).filter((_, idx) => idx !== index)
    }))
  }

  const addStakeholder = () => {
    const name = stakeholderDraft.name.trim()
    if (!name) return

    setFormData((prev) => ({
      ...prev,
      stakeholders: [
        ...(prev.stakeholders || []),
        {
          name,
          role: stakeholderDraft.role.trim(),
          office: stakeholderDraft.office.trim(),
          relationshipStrength: stakeholderDraft.relationshipStrength,
          lastTouch: stakeholderDraft.lastTouch,
          nextTouch: stakeholderDraft.nextTouch,
          notes: stakeholderDraft.notes.trim()
        }
      ].slice(0, 12)
    }))

    setStakeholderDraft({
      name: '',
      role: '',
      office: '',
      relationshipStrength: 'moderate',
      lastTouch: '',
      nextTouch: '',
      notes: ''
    })
  }

  const removeStakeholder = (index) => {
    setFormData((prev) => ({
      ...prev,
      stakeholders: (prev.stakeholders || []).filter((_, idx) => idx !== index)
    }))
  }

  const addEvidence = () => {
    const url = evidenceDraft.url.trim()
    const note = evidenceDraft.note.trim()
    if (!url && !note) return

    setFormData((prev) => ({
      ...prev,
      evidence: [
        ...(prev.evidence || []),
        {
          source: evidenceDraft.source,
          url,
          note
        }
      ].slice(0, 12)
    }))

    setEvidenceDraft((prev) => ({ ...prev, url: '', note: '' }))
  }

  const removeEvidence = (index) => {
    setFormData((prev) => ({
      ...prev,
      evidence: (prev.evidence || []).filter((_, idx) => idx !== index)
    }))
  }

  const handleRfpFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError('')
      setRfpUploading(true)

      const ingested = await ingestRfp(file)
      const rfp = ingested.rfp || {}

      setFormData((prev) => ({
        ...prev,
        rfpText: '', // we don't keep raw text client-side once summarized
        rfpFileName: rfp.filename || file.name,
        rfpSummary: rfp.summary || null,
        rfpId: rfp.id || ''
      }))
      setUseUploadedRfp(true)
    } catch (uploadError) {
      setError(uploadError.message)
      event.target.value = ''
    } finally {
      setRfpUploading(false)
    }
  }

  const clearRfpUpload = () => {
    setFormData((prev) => ({
      ...prev,
      rfpText: '',
      rfpFileName: '',
      rfpSummary: null,
      rfpId: ''
    }))
    setUseUploadedRfp(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const effectiveDescription = useUploadedRfp
      ? (formData.rfpSummary?.overview || 'RFP uploaded (summary available).')
      : formData.description

    if (!formData.opportunityName.trim() || !normalizedAgency || !effectiveDescription.trim()) {
      setError('Opportunity name, agency, and an opportunity description (or RFP upload) are required')
      setLoading(false)
      return
    }

    try {
      const payload = {
        ...formData,
        agency: normalizedAgency,
        vehicle: normalizedVehicle,
        description: effectiveDescription,
        gate: Number.isFinite(Number(formData.gate)) ? Number(formData.gate) : 0,
        evaluation: {
          type: formData.evaluationType,
          criteria: formData.evaluationCriteria || [],
          notes: formData.evaluationNotes
        },
        rfp: useUploadedRfp && formData.rfpSummary
          ? {
            id: formData.rfpId || undefined,
            filename: formData.rfpFileName || undefined,
            summary: formData.rfpSummary
          }
          : undefined,
        evaluationType: undefined,
        evaluationNotes: undefined,
        evaluationCriteria: undefined,
        customAgency: undefined,
        customVehicle: undefined,
        rfpText: undefined,
        rfpFileName: undefined,
        rfpSummary: undefined,
        rfpId: undefined
      }

      const data = editingOpportunityId
        ? await patchOpportunity(editingOpportunityId, payload)
        : await createOpportunity(payload)

      setResult(data)
      onOpportunityCreated?.(data)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setUseUploadedRfp(false)
    setError('')
    setResult(null)
  }

  if (editingOpportunityId && loadingOpportunity) {
    return (
      <div className="opportunity-form-container">
        <div className="detail-empty">
          <h2>Loading opportunity for edit...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="opportunity-form-container">
      <div className="form-section">
        <h1>{editingOpportunityId ? 'Edit Capture' : 'New Capture'}</h1>
        <p className="subtitle">
          {editingOpportunityId
            ? 'Update the opportunity capture and refresh its analysis.'
            : 'Create a new opportunity, run the initial analysis, and drop it into the portfolio.'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="opportunityName">Opportunity Name *</label>
            <input
              type="text"
              id="opportunityName"
              name="opportunityName"
              value={formData.opportunityName}
              onChange={handleChange}
              placeholder="e.g., DoD Cloud Migration Platform"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="agency">Agency *</label>
              <select
                id="agency"
                name="agency"
                value={formData.agency}
                onChange={handleChange}
                required
              >
                <option value="">Select an agency</option>
                {agencyOptions.map((agencyOption) => (
                  <option key={agencyOption} value={agencyOption}>
                    {agencyOption}
                  </option>
                ))}
              </select>
              {formData.agency === 'Other' && (
                <input
                  type="text"
                  id="customAgency"
                  name="customAgency"
                  value={formData.customAgency}
                  onChange={handleChange}
                  placeholder="Enter agency name"
                  required
                />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="contractValue">Contract Value</label>
              <select
                id="contractValue"
                name="contractValue"
                value={formData.contractValue}
                onChange={handleChange}
              >
                <option value="<5M">&lt; $5M</option>
                <option value="5-50M">$5M - $50M</option>
                <option value="50-200M">$50M - $200M</option>
                <option value="200M+">$200M+</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicle">Vehicle/Contract Type</label>
              <select
                id="vehicle"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
              >
                <option value="">Select contract type</option>
                {vehicleOptions.map((vehicleOption) => (
                  <option key={vehicleOption} value={vehicleOption}>
                    {vehicleOption}
                  </option>
                ))}
              </select>
              {formData.vehicle === 'Other' && (
                <input
                  type="text"
                  id="customVehicle"
                  name="customVehicle"
                  value={formData.customVehicle}
                  onChange={handleChange}
                  placeholder="Enter contract type"
                />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="setAside">Set-Aside Type</label>
              <select
                id="setAside"
                name="setAside"
                value={formData.setAside}
                onChange={handleChange}
              >
                <option value="None">None</option>
                <option value="SDVOSB">SDVOSB</option>
                <option value="8(a)">8(a)</option>
                <option value="WOSB">WOSB</option>
                <option value="HUBZone">HUBZone</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="gate">Capture Gate</label>
            <select id="gate" name="gate" value={formData.gate} onChange={handleChange}>
              <option value={0}>Gate 0 - Identified</option>
              <option value={1}>Gate 1 - Qualified</option>
              <option value={2}>Gate 2 - Capture</option>
              <option value={3}>Gate 3 - Proposal</option>
            </select>
            <p className="field-help">
              Start broad at Gate 0. As you learn more, move the gate forward and add stakeholders/evidence.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="timeline">Timeline / Key Dates</label>
            <input
              type="text"
              id="timeline"
              name="timeline"
              value={formData.timeline}
              onChange={handleChange}
              placeholder="e.g., RFP Q3 2024, Proposal due 30 days"
            />
          </div>

          <div className="form-section-divider" />

          <div className="form-group">
            <label htmlFor="description">Opportunity Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={
                useUploadedRfp && formData.rfpFileName
                  ? `Using uploaded RFP: ${formData.rfpFileName}`
                  : 'Describe the opportunity, scope, and key requirements...'
              }
              rows="6"
              disabled={useUploadedRfp && Boolean(formData.rfpSummary)}
              required={!useUploadedRfp}
            />

            <div className="rfp-upload-row">
              <div className="rfp-upload-left">
                <span className="rfp-upload-label">Or upload the RFP (PDF, DOCX, TXT)</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                  onChange={handleRfpFileChange}
                  disabled={rfpUploading || loading}
                />
                <p className="field-help">
                  {formData.rfpFileName
                    ? `Attached: ${formData.rfpFileName} (a structured summary will be used for analysis).`
                    : 'Upload the RFP and we will extract + summarize it for analysis.'}
                </p>
                {rfpUploading && <p className="field-help">Extracting + summarizing...</p>}
              </div>

              {formData.rfpFileName && (
                <div className="rfp-upload-actions">
                  <label className="rfp-upload-toggle">
                    <input
                      type="checkbox"
                      checked={useUploadedRfp}
                      onChange={(e) => setUseUploadedRfp(e.target.checked)}
                    />
                    Use upload
                  </label>
                  <button type="button" className="btn btn-secondary rfp-clear" onClick={clearRfpUpload}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={`collapsible-section ${collapsedSections.evaluation ? 'collapsed' : ''}`}>
            <button
              type="button"
              className="collapsible-header"
              onClick={() => toggleSection('evaluation')}
            >
              <div>
                <h2>Evaluation</h2>
                <span className="optional-label">Optional</span>
              </div>
              <span className="collapse-indicator">
                {collapsedSections.evaluation ? '+' : '−'}
              </span>
            </button>
            <div className="collapsible-body">
              <div className="form-group">
                <label htmlFor="evaluationType">Evaluation Type (Optional)</label>
                <select
                  id="evaluationType"
                  name="evaluationType"
                  value={formData.evaluationType}
                  onChange={handleChange}
                >
                  <option value="">Unknown</option>
                  <option value="Written Technical Approach">Written Technical Approach</option>
                  <option value="Orals Presentation">Orals Presentation</option>
                  <option value="Case Study">Case Study</option>
                  <option value="Challenge / Technical Exercise">Challenge / Technical Exercise</option>
                  <option value="Best Value Tradeoff">Best Value Tradeoff</option>
                  <option value="Lowest Price Technically Acceptable (LPTA)">Lowest Price Technically Acceptable (LPTA)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Evaluation Criteria (Optional)</label>
                {formData.evaluationCriteria.length > 0 && (
                  <div className="tag-list">
                    {formData.evaluationCriteria.map((criterion, idx) => (
                      <span key={`${criterion}-${idx}`} className="tag">
                        {criterion}
                        <button type="button" className="tag-remove" onClick={() => removeEvaluationCriterion(idx)}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="inline-add">
                  <input
                    type="text"
                    value={evaluationCriteriaDraft}
                    onChange={(e) => setEvaluationCriteriaDraft(e.target.value)}
                    placeholder="e.g., technical approach, past performance, price"
                  />
                  <button type="button" className="btn btn-secondary" onClick={addEvaluationCriterion}>
                    Add
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="evaluationNotes">Evaluation Notes (Optional)</label>
                <textarea
                  id="evaluationNotes"
                  name="evaluationNotes"
                  value={formData.evaluationNotes}
                  onChange={handleChange}
                  placeholder="Any known weights, what they care about, or how the winner will be selected..."
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className={`collapsible-section ${collapsedSections.knownRelationships ? 'collapsed' : ''}`}>
            <button
              type="button"
              className="collapsible-header"
              onClick={() => toggleSection('knownRelationships')}
            >
              <div>
                <h2>Known Relationships / Access Signals</h2>
                <span className="optional-label">Optional</span>
              </div>
              <span className="collapse-indicator">
                {collapsedSections.knownRelationships ? '+' : '−'}
              </span>
            </button>
            <div className="collapsible-body">
              <div className="form-group">
                <label htmlFor="knownRelationships">Known Relationships / Access Signals (Optional)</label>
                <p className="field-help">
                  Capture real access signals like an incumbent partner, program office contact, contracting touchpoint,
                  end-user champion, prior performance with this buyer, or simply note that nothing is known yet.
                </p>
                <textarea
                  id="knownRelationships"
                  name="knownRelationships"
                  value={formData.knownRelationships}
                  onChange={handleChange}
                  placeholder={'Examples:\n- Met the program lead at industry day\n- Current teammate has incumbent access\n- No direct contracting office relationship yet'}
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className={`collapsible-section ${collapsedSections.stakeholders ? 'collapsed' : ''}`}>
            <button
              type="button"
              className="collapsible-header"
              onClick={() => toggleSection('stakeholders')}
            >
              <div>
                <h2>Stakeholders</h2>
                <span className="optional-label">Optional</span>
              </div>
              <span className="collapse-indicator">
                {collapsedSections.stakeholders ? '+' : '−'}
              </span>
            </button>
            <div className="collapsible-body">
              <div className="form-group">
                <label>Stakeholders (Optional)</label>
                <p className="field-help">
                  Track who matters and how strong the relationship is. This becomes input for "who should we talk to next?"
                </p>

            {formData.stakeholders.length > 0 && (
              <div className="table-wrap">
                <table className="mini-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role / Office</th>
                      <th>Strength</th>
                      <th>Next Touch</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {formData.stakeholders.map((person, idx) => (
                      <tr key={`${person.name}-${idx}`}>
                        <td>{person.name}</td>
                        <td>{[person.role, person.office].filter(Boolean).join(' • ')}</td>
                        <td className="mono">{person.relationshipStrength}</td>
                        <td className="mono">{person.nextTouch || '—'}</td>
                        <td>
                          <button type="button" className="btn btn-secondary btn-compact" onClick={() => removeStakeholder(idx)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="stakeholder-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={stakeholderDraft.name}
                    onChange={(e) => setStakeholderDraft((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Jane Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Relationship Strength</label>
                  <select
                    value={stakeholderDraft.relationshipStrength}
                    onChange={(e) => setStakeholderDraft((prev) => ({ ...prev, relationshipStrength: e.target.value }))}
                  >
                    <option value="weak">Weak</option>
                    <option value="moderate">Moderate</option>
                    <option value="strong">Strong</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    value={stakeholderDraft.role}
                    onChange={(e) => setStakeholderDraft((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g., Program Manager"
                  />
                </div>
                <div className="form-group">
                  <label>Office</label>
                  <input
                    type="text"
                    value={stakeholderDraft.office}
                    onChange={(e) => setStakeholderDraft((prev) => ({ ...prev, office: e.target.value }))}
                    placeholder="e.g., VA OIT"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Last Touch</label>
                  <input
                    type="date"
                    value={stakeholderDraft.lastTouch}
                    onChange={(e) => setStakeholderDraft((prev) => ({ ...prev, lastTouch: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Next Touch</label>
                  <input
                    type="date"
                    value={stakeholderDraft.nextTouch}
                    onChange={(e) => setStakeholderDraft((prev) => ({ ...prev, nextTouch: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={stakeholderDraft.notes}
                  onChange={(e) => setStakeholderDraft((prev) => ({ ...prev, notes: e.target.value }))}
                  rows="2"
                  placeholder="What matters, what they care about, context from interactions..."
                />
              </div>

              <button type="button" className="btn btn-secondary" onClick={addStakeholder}>
                Add Stakeholder
              </button>
            </div>
          </div>
        </div>
      </div>

          <div className={`collapsible-section ${collapsedSections.evidence ? 'collapsed' : ''}`}>
            <button
              type="button"
              className="collapsible-header"
              onClick={() => toggleSection('evidence')}
            >
              <div>
                <h2>Sources / Evidence</h2>
                <span className="optional-label">Optional</span>
              </div>
              <span className="collapse-indicator">
                {collapsedSections.evidence ? '+' : '−'}
              </span>
            </button>
            <div className="collapsible-body">
              <div className="form-group">
                <label>Sources / Evidence (Optional)</label>
                <p className="field-help">
                  Drop links and one-line takeaways. Keep it lightweight: the goal is “why we believe this,” not a research dump.
                </p>

                {formData.evidence.length > 0 && (
                  <ul className="evidence-list">
                    {formData.evidence.map((item, idx) => (
                      <li key={`${item.url || item.note}-${idx}`} className="evidence-item">
                        <div className="evidence-meta">
                          <span className="evidence-source">{item.source || 'Other'}</span>
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noreferrer">
                              {item.url}
                            </a>
                          )}
                        </div>
                        {item.note && <div className="evidence-note">{item.note}</div>}
                        <button type="button" className="btn btn-secondary btn-compact" onClick={() => removeEvidence(idx)}>
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Source</label>
                    <select
                      value={evidenceDraft.source}
                      onChange={(e) => setEvidenceDraft((prev) => ({ ...prev, source: e.target.value }))}
                    >
                      <option value="SAM.gov">SAM.gov</option>
                      <option value="GSA eBuy">GSA eBuy</option>
                      <option value="ATOMS">ATOMS</option>
                      <option value="Agency forecast">Agency forecast</option>
                      <option value="GovTribe">GovTribe</option>
                      <option value="USASpending">USASpending</option>
                      <option value="OrangeSlices">OrangeSlices</option>
                      <option value="Word-of-mouth">Word-of-mouth</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>URL</label>
                    <input
                      type="url"
                      value={evidenceDraft.url}
                      onChange={(e) => setEvidenceDraft((prev) => ({ ...prev, url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Takeaway</label>
                  <input
                    type="text"
                    value={evidenceDraft.note}
                    onChange={(e) => setEvidenceDraft((prev) => ({ ...prev, note: e.target.value }))}
                    placeholder="1-line takeaway (why it matters)"
                  />
                </div>

                <button type="button" className="btn btn-secondary" onClick={addEvidence}>
                  Add Evidence
                </button>
              </div>
            </div>
          </div>

          <div className={`collapsible-section ${collapsedSections.internalNotes ? 'collapsed' : ''}`}>
            <button
              type="button"
              className="collapsible-header"
              onClick={() => toggleSection('internalNotes')}
            >
              <div>
                <h2>Internal Notes</h2>
                <span className="optional-label">Optional</span>
              </div>
              <span className="collapse-indicator">
                {collapsedSections.internalNotes ? '+' : '−'}
              </span>
            </button>
            <div className="collapsible-body">
              <div className="form-group">
                <label htmlFor="notes">Internal Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional context for the team..."
                  rows="3"
                />
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading
                ? editingOpportunityId
                  ? 'Saving Changes...'
                  : 'Creating Opportunity...'
                : editingOpportunityId
                  ? 'Save Changes & Reanalyze' 
                  : 'Create & Analyze Opportunity'}
            </button>
            <button type="button" onClick={handleReset} className="btn btn-secondary">
              Clear
            </button>
          </div>
        </form>
      </div>

      {!onOpportunityCreated && result && (
        <OpportunityWorkspace opportunity={result} onOpportunityChange={setResult} />
      )}
    </div>
  )
}

export default OpportunityCaptureForm
