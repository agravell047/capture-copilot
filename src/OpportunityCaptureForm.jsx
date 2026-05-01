import React, { useEffect, useRef, useState } from 'react'
import { createOpportunity, getOpportunity, ingestRfp, patchOpportunity } from './api/opportunities'
import { listContacts } from './api/contacts'
import OpportunityWorkspace from './components/OpportunityWorkspace'
import SimilarPursuitsSelector from './components/SimilarPursuitsSelector'
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
  evidence: [],
  similarPursuits: []
}

const agencyOptions = [
  // Civilian
  'Centers for Medicare & Medicaid Services (CMS)',
  'Department of Homeland Security',
  'Department of Justice',
  'Department of State',
  'Department of the Treasury',
  'Department of Transportation',
  'Department of Veterans Affairs',
  'Environmental Protection Agency',
  'General Services Administration',
  'Health & Human Services',
  'Social Security Administration',
  // Defense
  'Department of Defense',
  'Defense Information Systems Agency (DISA)',
  'Defense Logistics Agency (DLA)',
  'U.S. Air Force',
  'U.S. Army',
  'U.S. Navy / Marine Corps',
  'Other'
]

const DEMO_FORM_DATA = {
  opportunityName: 'SSA Disability Claims Processing Modernization',
  agency: 'Social Security Administration',
  contractValue: '5-50M',
  vehicle: 'OASIS+',
  setAside: 'SDVOSB',
  gate: 1,
  description: "Modernize SSA's Disability Case Management System \u2014 a 30-year-old COBOL/mainframe platform processing 2.8 million annual disability claims. Scope includes phased cloud migration to AWS GovCloud, legacy COBOL rewrite to Java/Spring microservices, integration with SSA's existing Numident and MBR databases, Section 508-compliant claimant portal redesign, DevSecOps pipeline implementation, and FedRAMP Moderate ATO preparation. Requires continuity-of-operations planning for 24/7 claims processing during migration.",
  timeline: 'Sources Sought issued April 14, 2026; RFP anticipated September 2026; award expected Q1 2027. Five-year IDIQ base with two option years.',
  knownRelationships: "Marcus Webb attended the SSA IT Modernization Industry Day on April 9th and had a brief conversation with the program's Deputy CIO. No formal relationship yet \u2014 agency contact at SSA OIT identified but no direct outreach completed. Our OASIS+ vehicle PM at SSA confirmed Apex is registered and in good standing on the vehicle.",
  notes: 'OASIS+ vehicle aligns perfectly. SDVOSB set-aside confirmed via Sources Sought. Biggest risk is the absence of SSA past performance \u2014 we have strong CMS and VA comparable work but no direct SSA reference. Need to assess the competitive landscape and identify a teaming partner with SSA incumbent access before committing full capture resources.',
  evaluationType: 'Best Value Tradeoff',
  evaluationCriteria: [
    'Technical approach and legacy modernization methodology (35%)',
    'Past performance on comparable federal benefits systems (30%)',
    'Management approach and key personnel (20%)',
    'Price realism (15%)',
  ],
  stakeholders: [
    {
      contactId: 'contact-angela-kim',
      id: 'contact-angela-kim',
      name: 'Angela Kim',
      role: 'Director, Digital Services',
      office: 'SSA OCIO',
      relationshipStrength: 'strong',
      lastTouch: '2026-03-22',
      nextTouch: '2026-05-12',
      notes: '',
    },
  ],
  similarPursuits: ['pp-001-va-vba-modernization', 'pp-002-cms-platform'],
}

const DEMO_COLLAPSED_SECTIONS = {
  evaluation: false,
  knownRelationships: false,
  stakeholders: false,
  evidence: true,
  internalNotes: false,
  similarPursuits: false,
}

const vehicleOptions = [
  'GSA MAS',
  'OASIS+',
  'CIO-SP3',
  'CIO-SP4',
  'SEWP V',
  'NASA SEWP',
  'Seaport NxG',
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
    evidence: opportunity.evidence || [],
    similarPursuits: opportunity.similarPursuits || []
  }
}

// ContactPicker — loads global contacts and lets user toggle which ones are
// involved in this opportunity, with per-contact relationship strength override.
function ContactPicker({ selected, onChange, agency }) {
  const [allContacts, setAllContacts] = useState([])
  const [search, setSearch] = useState('')
  const selectedIds = new Set((selected || []).map((s) => s.contactId || s.id).filter(Boolean))

  useEffect(() => {
    listContacts().then(setAllContacts).catch(() => {})
  }, [])

  // Auto-select contacts whose agency matches the opportunity agency when agency changes
  const prevAgencyRef = useRef(agency)
  useEffect(() => {
    if (!agency || allContacts.length === 0) return
    if (prevAgencyRef.current === agency) return
    prevAgencyRef.current = agency
    const agencyLower = agency.toLowerCase()
    const matches = allContacts.filter((c) => c.agency && c.agency.toLowerCase().includes(agencyLower))
    if (matches.length === 0) return
    const currentIds = new Set((selected || []).map((s) => s.contactId || s.id))
    const toAdd = matches.filter((c) => !currentIds.has(c.id)).map(toEntry)
    if (toAdd.length > 0) onChange([...(selected || []), ...toAdd])
  }, [agency, allContacts])

  const toEntry = (contact) => ({
    contactId: contact.id,
    id: contact.id,
    name: contact.name,
    role: contact.title || '',
    office: contact.office || '',
    relationshipStrength: contact.relationshipStrength || 'moderate',
    lastTouch: contact.lastTouch || '',
    nextTouch: contact.nextTouch || '',
    notes: contact.notes || '',
  })

  const toggle = (contact) => {
    if (selectedIds.has(contact.id)) {
      onChange((selected || []).filter((s) => (s.contactId || s.id) !== contact.id))
    } else {
      onChange([...(selected || []), toEntry(contact)])
    }
  }

  const filtered = allContacts.filter((c) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return [c.name, c.agency, c.title, c.office].filter(Boolean).join(' ').toLowerCase().includes(q)
  })

  // Group contacts by agency for the "select all" headers
  const agencyGroups = filtered.reduce((acc, c) => {
    const key = c.agency || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  const toggleAgency = (agencyName, contacts) => {
    const agencyIds = new Set(contacts.map((c) => c.id))
    const allSelected = contacts.every((c) => selectedIds.has(c.id))
    if (allSelected) {
      onChange((selected || []).filter((s) => !agencyIds.has(s.contactId || s.id)))
    } else {
      const existing = (selected || []).filter((s) => !agencyIds.has(s.contactId || s.id))
      onChange([...existing, ...contacts.filter((c) => !selectedIds.has(c.id)).map(toEntry)])
    }
  }

  if (allContacts.length === 0) {
    return (
      <p className="field-help" style={{ marginTop: 0 }}>
        No contacts found. Add contacts in the <strong>Settings</strong> page first.
      </p>
    )
  }

  return (
    <div className="contact-picker">
      <input
        type="text"
        className="contact-picker-search"
        placeholder="Search contacts…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="contact-picker-list">
        {Object.entries(agencyGroups).map(([agencyName, contacts]) => {
          const allSelected = contacts.every((c) => selectedIds.has(c.id))
          const someSelected = !allSelected && contacts.some((c) => selectedIds.has(c.id))
          return (
            <div key={agencyName} className="contact-picker-agency-group">
              <div className="contact-picker-agency-header">
                <label className="contact-picker-agency-check">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected }}
                    onChange={() => toggleAgency(agencyName, contacts)}
                  />
                  <span className="contact-picker-agency-name">{agencyName}</span>
                  <span className="contact-picker-agency-count">{contacts.length}</span>
                </label>
              </div>
              {contacts.map((c) => (
                <div key={c.id} className={`contact-picker-item${selectedIds.has(c.id) ? ' selected' : ''}`}>
                  <label className="contact-picker-check">
                    <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggle(c)} />
                    <span>
                      <strong>{c.name}</strong>
                      {c.title && <span className="contact-picker-meta"> · {c.title}</span>}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )
        })}
        {filtered.length === 0 && <p className="field-help">No contacts match "{search}".</p>}
      </div>
    </div>
  )
}

function CaptureCompleteness({ formData }) {
  const descLen = formData.description?.trim().length || 0
  const hasRfp = Boolean(formData.rfpSummary)
  const signals = [
    { label: 'opportunity name', points: 10, met: formData.opportunityName?.trim().length > 0 },
    { label: 'agency', points: 10, met: (formData.agency === 'Other' ? formData.customAgency : formData.agency)?.trim().length > 0 },
    { label: 'description', points: 25, met: hasRfp || descLen > 0 },
    { label: 'timeline or key dates', points: 15, met: formData.timeline?.trim().length > 0 },
    { label: 'vehicle / contract type', points: 10, met: formData.vehicle?.trim().length > 0 },
    {
      label: 'known relationships or context (expand the Relationships section)',
      points: 15,
      met: formData.knownRelationships?.trim().length > 0 || formData.notes?.trim().length > 0 || (formData.evidence?.length || 0) > 0,
    },
    { label: 'related past pursuits (expand the Similar Pursuits section)', points: 10, met: (formData.similarPursuits?.length || 0) > 0 },
    { label: 'evaluation approach (expand the Evaluation section)', points: 5, met: (formData.evaluationCriteria?.length || 0) > 0 || formData.evaluationType?.trim().length > 0 || formData.evaluationNotes?.trim().length > 0 },
  ]
  const total = signals.reduce((s, x) => s + x.points, 0)
  const earned = signals.filter((x) => x.met).reduce((s, x) => s + x.points, 0)
  const pct = Math.round((earned / total) * 100)
  const missing = signals.filter((x) => !x.met)
  const topMissing = missing.sort((a, b) => b.points - a.points)[0]

  const color = pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#1c3044'

  return (
    <div className="capture-completeness">
      <div className="capture-completeness-header">
        <span className="capture-completeness-label">Analysis quality</span>
        <span className="capture-completeness-pct" style={{ color }}>{pct}%</span>
      </div>
      <div className="capture-completeness-track">
        <div
          className="capture-completeness-fill"
          style={{ width: `${pct}%`, background: color, transition: 'width 0.4s ease, background 0.3s' }}
        />
      </div>
      {topMissing && (
        <p className="capture-completeness-hint">
          Add <strong>{topMissing.label}</strong> to improve analysis accuracy
        </p>
      )}
    </div>
  )
}

function OpportunityCaptureForm({ editingOpportunityId, onOpportunityCreated, onViewPortfolio }) {
  const [formData, setFormData] = useState(() => {
    if (editingOpportunityId) return initialFormData
    if (localStorage.getItem('capturepilot_demo_prefill') === '1') return { ...initialFormData, ...DEMO_FORM_DATA }
    return initialFormData
  })
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
  const [loadedOpportunity, setLoadedOpportunity] = useState(null)
  const [collapsedSections, setCollapsedSections] = useState(() => {
    if (!editingOpportunityId && localStorage.getItem('capturepilot_demo_prefill') === '1') return DEMO_COLLAPSED_SECTIONS
    return { evaluation: true, knownRelationships: true, stakeholders: true, evidence: true, internalNotes: true, similarPursuits: true }
  })

  useEffect(() => {
    localStorage.removeItem('capturepilot_demo_prefill')
  }, [])

  useEffect(() => {
    let ignore = false

    const loadOpportunityForEdit = async () => {
      if (!editingOpportunityId) {
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
        setLoadedOpportunity(opportunity)
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

  const handleLoadDemoData = () => {
    setFormData({ ...initialFormData, ...DEMO_FORM_DATA })
    setCollapsedSections(DEMO_COLLAPSED_SECTIONS)
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
            : 'Create a new capture, run the initial analysis, and drop it into the pipeline.'}
        </p>

        <CaptureCompleteness formData={formData} />

        <form onSubmit={handleSubmit}>

          {/* ── Zone 1: Core — what the AI needs most ────────────────── */}
          <div className="form-zone form-zone-core">
            <div className="form-zone-header">
              <span className="form-zone-title">Core capture details</span>
              <span className="form-zone-hint">Required fields — the AI uses everything you provide.</span>
            </div>

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

            <div className="form-group">
              <label>Capture Gate</label>
              <div className="gate-picker">
                {[
                  { value: 0, label: 'Gate 0', sublabel: 'Awareness', desc: 'Just discovered — quick fit check only' },
                  { value: 1, label: 'Gate 1', sublabel: 'Qualify', desc: 'Deciding whether to invest resources' },
                  { value: 2, label: 'Gate 2', sublabel: 'Capture', desc: 'Actively shaping and pursuing to win' },
                  { value: 3, label: 'Gate 3', sublabel: 'Proposal', desc: 'RFP out or imminent — writing to win' },
                ].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    className={`gate-card${Number(formData.gate) === g.value ? ' selected' : ''}`}
                    onClick={() => setFormData((prev) => ({ ...prev, gate: g.value }))}
                  >
                    <span className="gate-card-label">{g.label}</span>
                    <span className="gate-card-sublabel">{g.sublabel}</span>
                    <span className="gate-card-desc">{g.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *
                <span className="field-ai-tip">most influential field</span>
              </label>

              {useUploadedRfp && formData.rfpFileName ? (
                <div className="rfp-active-banner">
                  <div className="rfp-active-info">
                    <strong>{formData.rfpFileName}</strong>
                    <span className="rfp-active-sub">RFP uploaded — AI will use the extracted summary as the primary source of truth.</span>
                  </div>
                  <button type="button" className="btn btn-secondary rfp-clear" onClick={clearRfpUpload}>
                    Remove
                  </button>
                </div>
              ) : (
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the scope, requirements, and anything you know about what they're looking for. More detail = better AI analysis."
                  rows="6"
                  required
                />
              )}

              {!useUploadedRfp && (
                <div className="rfp-upload-row">
                  <span className="rfp-upload-label">Have the RFP? Upload it instead (PDF, DOCX, TXT)</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                    onChange={handleRfpFileChange}
                    disabled={rfpUploading || loading}
                  />
                  {rfpUploading && <p className="field-help">Extracting + summarizing RFP…</p>}
                </div>
              )}
            </div>
          </div>

          {/* ── Zone 2: Enrichment — optional but valuable ───────────── */}
          <div className="form-zone-divider">
            <span>Enrich the analysis <span className="form-zone-divider-hint">optional — add what you know</span></span>
          </div>

          <div className="form-zone form-zone-enrich">

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vehicle">Vehicle / Contract Type</label>
                <select
                  id="vehicle"
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                >
                  <option value="">Unknown / TBD</option>
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
                  <option value="None">Full &amp; Open (Unrestricted)</option>
                  <option value="Small Business">Small Business</option>
                  <option value="SDVOSB">SDVOSB</option>
                  <option value="8(a)">8(a)</option>
                  <option value="WOSB">WOSB</option>
                  <option value="HUBZone">HUBZone</option>
                  <option value="VOSB">VOSB</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="timeline">Timeline / Key Dates</label>
              <input
                type="text"
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                placeholder="e.g., RFP expected Q3 2026, proposals due 30 days after"
              />
            </div>

          </div>

          <div className={`collapsible-section ${collapsedSections.evaluation ? 'collapsed' : ''}`}>
            <button
              type="button"
              className="collapsible-header"
              onClick={() => toggleSection('evaluation')}
            >
              <div>
                <div className="section-title-row"><h2>Evaluation</h2><span className="optional-label">Optional</span></div>
                <p className="section-hint">How will the winner be scored? LPTA vs. Best Value changes pricing strategy completely.</p>
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
                <div className="section-title-row"><h2>Known Relationships / Access Signals</h2><span className="optional-label">Optional</span></div>
                <p className="section-hint">Incumbent presence, prior engagement, or insider intel that shapes your competitive position.</p>
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
                <div className="section-title-row"><h2>Stakeholders</h2><span className="optional-label">Optional</span></div>
                <p className="section-hint">Agency contacts involved in this pursuit — the AI uses these to assess relationship strength.</p>
              </div>
              <span className="collapse-indicator">
                {collapsedSections.stakeholders ? '+' : '−'}
              </span>
            </button>
            <div className="collapsible-body">
              <div className="form-group">
                <p className="field-help">
                  Select contacts from your relationship book who are involved in this opportunity. Manage your contacts in the Company Profile.
                </p>
                <ContactPicker
                  selected={formData.stakeholders}
                  onChange={(stakeholders) => setFormData((prev) => ({ ...prev, stakeholders }))}
                  agency={formData.agency}
                />
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
                <div className="section-title-row"><h2>Sources / Evidence</h2><span className="optional-label">Optional</span></div>
                <p className="section-hint">SAM.gov notices, industry day notes, or intel that corroborates what you entered above.</p>
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
                <div className="section-title-row"><h2>Internal Notes</h2><span className="optional-label">Optional</span></div>
                <p className="section-hint">Private context for your team — strategy hunches, red flags, or decisions already made.</p>
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

          {/* Similar Past Pursuits — always shown; auto-suggest when editing, browse-all when creating */}
          <div className={`collapsible-section ${collapsedSections.similarPursuits ? 'collapsed' : ''}`}>
            <button
              type="button"
              className="collapsible-header"
              onClick={() => toggleSection('similarPursuits')}
            >
              <div>
                <div className="section-title-row"><h2>Similar Past Pursuits</h2><span className="optional-label">Optional</span></div>
                <p className="section-hint">Link past bids you won or lost — the AI draws explicit lessons from them.</p>
              </div>
              <span className="collapse-indicator">
                {collapsedSections.similarPursuits ? '+' : '−'}
              </span>
            </button>
            <div className="collapsible-body">
              <SimilarPursuitsSelector
                opportunity={loadedOpportunity || { similarPursuits: formData.similarPursuits || [] }}
                onSelectionChange={(ids) => setFormData((prev) => ({ ...prev, similarPursuits: ids }))}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  {editingOpportunityId ? 'Saving Changes…' : 'Analyzing…'}
                </>
              ) : editingOpportunityId
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
