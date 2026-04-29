import { useState, useEffect, useRef } from 'react'
import './CompanyProfile.css'
import { listContacts, createContact, updateContact, deleteContact } from './api/contacts'

const vehicleOptions = [
  'GSA MAS',
  'SPRUCE IDIQ',
  'OASIS+',
  'T4NG2',
  'Alliant 2',
  '8(a) STARS III',
  'SEWP',
  'Other'
]

const setAsideOptions = [
  'SDVOSB',
  '8(a)',
  'WOSB',
  'HUBZone',
  'Small Business',
  'Other'
]

const relationshipAgencyOptions = [
  'Department of Defense',
  'Department of Veterans Affairs',
  'Centers for Medicare & Medicaid Services (CMS)',
  'Other'
]

const parseCsvLine = (line) => {
  const cells = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]

    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"'
        i++
        continue
      }
      if (ch === '"') {
        inQuotes = false
        continue
      }
      current += ch
      continue
    }

    if (ch === '"') {
      inQuotes = true
      continue
    }

    if (ch === ',') {
      cells.push(current.trim())
      current = ''
      continue
    }

    current += ch
  }

  cells.push(current.trim())
  return cells
}

const parseCsv = (text) => {
  const lines = String(text || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase())
  const rows = lines.slice(1).map((line) => parseCsvLine(line))
  return { headers, rows }
}

function CompanyProfile() {
  const messageRef = useRef(null)
  const csvInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState('identity')
  const [context, setContext] = useState({
    identity: { name: '', founded: '', hq: '', size: '', naics: [], positioning: '' },
    vehicles: [],
    setAside: [],
    capabilities: [],
    relationships: [],
    knownGaps: [],
    teamMembers: []
  })
  const [aiSettings, setAiSettings] = useState({
    hasOpenAiKey: false,
    openaiApiKey: '',
    model: '',
    baseUrl: '',
    systemPromptSuffix: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [newItem, setNewItem] = useState({
    vehicle: '',
    customVehicle: '',
    setAside: '',
    customSetAside: '',
    capabilityLabel: '',
    capabilityTier: 'core',
    knownGap: '',
    teamMemberName: '',
    teamMemberRole: '',
    teamMemberEmail: '',
    teamMemberExperienceYears: '',
    teamMemberSkills: ''
  })
  const [teamSearch, setTeamSearch] = useState('')
  const [teamPage, setTeamPage] = useState(1)
  const TEAM_PAGE_SIZE = 10
  const BLANK_TEAM_MEMBER = { name: '', role: '', email: '', experienceYears: '', skills: '' }
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [editingTeamMember, setEditingTeamMember] = useState(null) // id of member being edited
  const [teamDraft, setTeamDraft] = useState(BLANK_TEAM_MEMBER)
  const [contactsCsvInputRef] = useState(() => ({ current: null }))

  // Contacts (global relationship book)
  const [contacts, setContacts] = useState([])
  const [contactSearch, setContactSearch] = useState('')
  const [contactSaving, setContactSaving] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const BLANK_CONTACT = { name: '', title: '', agency: '', office: '', email: '', phone: '', relationshipStrength: 'moderate', lastTouch: '', nextTouch: '', notes: '' }
  const [contactDraft, setContactDraft] = useState(BLANK_CONTACT)
  const [showContactForm, setShowContactForm] = useState(false)

  useEffect(() => {
    if (!message) return
    setTimeout(() => messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }, [message])

  useEffect(() => {
    fetchCompanyContext()
    fetchAiSettings()
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const data = await listContacts()
      setContacts(data)
    } catch (err) {
      console.warn('Error fetching contacts:', err)
    }
  }

  const saveContactDraft = async () => {
    if (!contactDraft.name.trim()) return
    setContactSaving(true)
    try {
      if (editingContact) {
        const updated = await updateContact(editingContact, contactDraft)
        setContacts((prev) => prev.map((c) => (c.id === editingContact ? updated : c)))
      } else {
        const created = await createContact(contactDraft)
        setContacts((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      }
      setContactDraft(BLANK_CONTACT)
      setEditingContact(null)
      setShowContactForm(false)
    } catch (err) {
      console.error('Error saving contact:', err)
    } finally {
      setContactSaving(false)
    }
  }

  const startEditContact = (contact) => {
    setEditingContact(contact.id)
    setContactDraft({
      name: contact.name || '',
      title: contact.title || '',
      agency: contact.agency || '',
      office: contact.office || '',
      email: contact.email || '',
      phone: contact.phone || '',
      relationshipStrength: contact.relationshipStrength || 'moderate',
      lastTouch: contact.lastTouch || '',
      nextTouch: contact.nextTouch || '',
      notes: contact.notes || '',
    })
    setShowContactForm(true)
  }

  const removeContact = async (id) => {
    if (!window.confirm('Remove this contact?')) return
    try {
      await deleteContact(id)
      setContacts((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error('Error deleting contact:', err)
    }
  }

  const fetchCompanyContext = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/company-context')
      if (!response.ok) throw new Error('Failed to fetch company context')
      const data = await response.json()
      // Normalise capabilities: support both legacy strings and new {label, tier} objects
      const caps = (data.capabilities || []).map((c) =>
        typeof c === 'string' ? { label: c, tier: 'core' } : c
      )
      setContext({
        identity: data.identity || { name: '', founded: '', hq: '', size: '', naics: [], positioning: '' },
        vehicles: data.vehicles || [],
        setAside: data.setAside || [],
        capabilities: caps,
        relationships: data.relationships || [],
        knownGaps: data.knownGaps || [],
        teamMembers: data.teamMembers || [],
      })
    } catch (error) {
      console.error('Error fetching company context:', error)
      setMessage('Error loading company profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchAiSettings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()
      setAiSettings((prev) => ({
        ...prev,
        hasOpenAiKey: Boolean(data.hasOpenAiKey),
        model: data.model || '',
        baseUrl: data.baseUrl || '',
        systemPromptSuffix: data.systemPromptSuffix || ''
      }))
    } catch (error) {
      console.warn('Error fetching settings:', error)
    }
  }

  const saveCompanyContext = async () => {
    try {
      setSaving(true)
      const response = await fetch('http://localhost:3001/api/company-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context)
      })
      if (!response.ok) throw new Error('Failed to save company context')
      const data = await response.json()
      setContext(data)
      setMessage('Company profile saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving company context:', error)
      setMessage('Error saving company profile')
    } finally {
      setSaving(false)
    }
  }

  const saveAiSettings = async () => {
    try {
      setSaving(true)
      const payload = {
        model: aiSettings.model,
        baseUrl: aiSettings.baseUrl,
        systemPromptSuffix: aiSettings.systemPromptSuffix
      }

      if (aiSettings.openaiApiKey.trim()) {
        payload.openaiApiKey = aiSettings.openaiApiKey.trim()
      }

      const response = await fetch('http://localhost:3001/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const detail = await response.json().catch(() => null)
        throw new Error(detail?.error || 'Failed to save settings')
      }

      const data = await response.json()
      setAiSettings((prev) => ({
        ...prev,
        hasOpenAiKey: Boolean(data.hasOpenAiKey),
        openaiApiKey: '',
        model: data.model || prev.model,
        baseUrl: data.baseUrl || prev.baseUrl,
        systemPromptSuffix: data.systemPromptSuffix !== undefined ? data.systemPromptSuffix : prev.systemPromptSuffix
      }))

      setMessage('Settings saved. New analyses will use the configured key/model.')
      setTimeout(() => setMessage(''), 4000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage(`Error saving settings: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const addItem = (type) => {
    if (type === 'teamMember') {
      const name = String(newItem.teamMemberName || '').trim()
      if (!name) return

      const role = String(newItem.teamMemberRole || '').trim()
      const experienceYears = Number(newItem.teamMemberExperienceYears)
      const normalizedExperience = Number.isFinite(experienceYears) ? experienceYears : 0
      const skills = String(newItem.teamMemberSkills || '')
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)

      const email = String(newItem.teamMemberEmail || '').trim()

      const member = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        name,
        role,
        email,
        experienceYears: normalizedExperience,
        skills
      }

      setContext({
        ...context,
        teamMembers: [...(context.teamMembers || []), member]
      })

      setNewItem({
        ...newItem,
        teamMemberName: '',
        teamMemberRole: '',
        teamMemberEmail: '',
        teamMemberExperienceYears: '',
        teamMemberSkills: ''
      })
      return
    }

    if (type === 'relationship') {
      const agency = newItem.relationshipAgency === 'Other'
        ? newItem.customRelationshipAgency.trim()
        : newItem.relationshipAgency.trim()

      if (!agency) return

      const strength = newItem.relationshipStrength || 'moderate'

      setContext({
        ...context,
        relationships: [
          ...context.relationships,
          { agency, strength }
        ]
      })
      setNewItem({
        ...newItem,
        relationshipAgency: '',
        customRelationshipAgency: '',
        relationshipStrength: ''
      })
      return
    }

    if (type === 'vehicle') {
      const vehicle = newItem.vehicle === 'Other'
        ? newItem.customVehicle.trim()
        : newItem.vehicle.trim()

      if (!vehicle) return

      setContext({
        ...context,
        vehicles: [...context.vehicles, vehicle]
      })
      setNewItem({ ...newItem, vehicle: '', customVehicle: '' })
      return
    }

    if (type === 'setAside') {
      const designation = newItem.setAside === 'Other'
        ? newItem.customSetAside.trim()
        : newItem.setAside.trim()

      if (!designation) return

      setContext({
        ...context,
        setAside: [...context.setAside, designation]
      })
      setNewItem({ ...newItem, setAside: '', customSetAside: '' })
      return
    }

    if (type === 'capability') {
      if (!newItem.capabilityLabel || newItem.capabilityLabel.trim() === '') return
      const tier = newItem.capabilityTier || 'core'
      const tierCount = context.capabilities.filter((c) => c.tier === tier).length
      if (tierCount >= 5) return

      setContext({
        ...context,
        capabilities: [...context.capabilities, { label: newItem.capabilityLabel.trim(), tier }]
      })
      setNewItem({ ...newItem, capabilityLabel: '', capabilityTier: 'core' })
      return
    }

    if (type === 'knownGap') {
      if (!newItem.knownGap || newItem.knownGap.trim() === '') return

      setContext({
        ...context,
        knownGaps: [...context.knownGaps, newItem.knownGap]
      })
      setNewItem({ ...newItem, knownGap: '' })
    }
  }

  const removeItem = (type, index) => {
    setContext({
      ...context,
      [type]: context[type].filter((_, i) => i !== index)
    })
  }

  const updateRelationship = (index, field, value) => {
    const updated = [...context.relationships]
    updated[index] = { ...updated[index], [field]: value }
    setContext({ ...context, relationships: updated })
  }

  const removeTeamMember = (index) => {
    setContext({
      ...context,
      teamMembers: (context.teamMembers || []).filter((_, idx) => idx !== index)
    })
  }

  const BLANK_TEAM_MEMBER_CONST = { name: '', role: '', email: '', experienceYears: '', skills: '' }

  const saveTeamDraft = () => {
    const name = teamDraft.name.trim()
    if (!name) return
    const role = teamDraft.role.trim()
    const email = teamDraft.email.trim()
    const experienceYears = Number.isFinite(Number(teamDraft.experienceYears)) ? Number(teamDraft.experienceYears) : 0
    const skills = String(teamDraft.skills || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5)
    if (editingTeamMember) {
      setContext((prev) => ({
        ...prev,
        teamMembers: (prev.teamMembers || []).map((m) =>
          m.id === editingTeamMember ? { ...m, name, role, email, experienceYears, skills } : m
        )
      }))
    } else {
      const member = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        name, role, email, experienceYears, skills
      }
      setContext((prev) => ({ ...prev, teamMembers: [...(prev.teamMembers || []), member] }))
    }
    setTeamDraft(BLANK_TEAM_MEMBER_CONST)
    setEditingTeamMember(null)
    setShowTeamForm(false)
  }

  const startEditTeamMember = (member) => {
    setEditingTeamMember(member.id)
    setTeamDraft({
      name: member.name || '',
      role: member.role || '',
      email: member.email || '',
      experienceYears: member.experienceYears != null ? String(member.experienceYears) : '',
      skills: Array.isArray(member.skills) ? member.skills.slice(0, 5).join(', ') : ''
    })
    setShowTeamForm(true)
  }

  const handleTeamCsvUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const { headers, rows } = parseCsv(text)

      const idx = (name) => headers.indexOf(name)
      const nameIdx = idx('name')
      const roleIdx = idx('role')
      const emailIdx = idx('email')
      const expIdx = idx('experienceyears')
      const skillsIdx = idx('skills')

      if (nameIdx === -1) {
        throw new Error('CSV must include a "name" column header.')
      }

      const imported = []

      for (const row of rows) {
        const name = String(row[nameIdx] || '').trim()
        if (!name) continue

        const role = roleIdx !== -1 ? String(row[roleIdx] || '').trim() : ''
        const email = emailIdx !== -1 ? String(row[emailIdx] || '').trim() : ''
        const experienceYearsRaw = expIdx !== -1 ? String(row[expIdx] || '').trim() : ''
        const experienceYears = Number.isFinite(Number(experienceYearsRaw)) ? Number(experienceYearsRaw) : 0
        const skillsRaw = skillsIdx !== -1 ? String(row[skillsIdx] || '').trim() : ''

        // Prefer semicolon or pipe separators to avoid CSV comma conflicts, but accept commas too.
        const skills = skillsRaw
          .split(/[;|]/)
          .flatMap((segment) => segment.split(','))
          .map((skill) => skill.trim())
          .filter(Boolean)
          .slice(0, 5)

        imported.push({
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
          name,
          role,
          email,
          experienceYears,
          skills
        })
      }

      if (imported.length === 0) {
        throw new Error('No valid rows found. Ensure each row has at least a name.')
      }

      setContext((prev) => ({
        ...prev,
        teamMembers: [...(prev.teamMembers || []), ...imported]
      }))

      setMessage(`Imported ${imported.length} team member(s). Remember to Save Profile.`)
      setTimeout(() => messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
      setTimeout(() => setMessage(''), 3500)
    } catch (error) {
      setMessage(`Error importing CSV: ${error.message}`)
      setTimeout(() => messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
    } finally {
      if (csvInputRef.current) {
        csvInputRef.current.value = ''
      }
    }
  }

  if (loading) {
    return <div className="company-profile"><p>Loading company profile...</p></div>
  }

  const TABS = [
    { id: 'identity', label: 'Company' },
    { id: 'capabilities', label: 'Capabilities & Gaps' },
    { id: 'vehicles', label: 'Vehicles & Set-Asides' },
    { id: 'team', label: 'Team' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'ai', label: 'AI Settings' },
  ]

  const capTierLabel = { core: 'Core', supporting: 'Supporting', emerging: 'Emerging' }
  const capTierClass = { core: 'tier-core', supporting: 'tier-supporting', emerging: 'tier-emerging' }

  return (
    <div className="company-profile">
      <div className="settings-page-header">
        <h2>Settings</h2>
        <p className="subtitle">Company context that shapes every opportunity analysis.</p>
      </div>

      {message && (
        <div ref={messageRef} className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="settings-tabs">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`settings-tab${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Company Identity ─────────────────────────────── */}
      {activeTab === 'identity' && (
        <div className="profile-section tab-panel">
          <div className="section-header">
            <h3>Company Identity</h3>
            <p className="section-help">Who you are — fed into every AI analysis so it understands your position in the market.</p>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" value={context.identity?.name || ''} onChange={(e) => setContext((p) => ({ ...p, identity: { ...p.identity, name: e.target.value } }))} placeholder="Apex Federal Solutions" />
            </div>
            <div className="form-group">
              <label>Headquarters</label>
              <input type="text" value={context.identity?.hq || ''} onChange={(e) => setContext((p) => ({ ...p, identity: { ...p.identity, hq: e.target.value } }))} placeholder="Reston, VA" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Approximate Size</label>
              <input type="text" value={context.identity?.size || ''} onChange={(e) => setContext((p) => ({ ...p, identity: { ...p.identity, size: e.target.value } }))} placeholder="~120 employees" />
            </div>
            <div className="form-group">
              <label>Year Founded</label>
              <input type="text" value={context.identity?.founded || ''} onChange={(e) => setContext((p) => ({ ...p, identity: { ...p.identity, founded: e.target.value } }))} placeholder="2014" />
            </div>
          </div>
          <div className="form-group">
            <label>Primary NAICS Codes</label>
            <input type="text" value={(context.identity?.naics || []).join(', ')} onChange={(e) => setContext((p) => ({ ...p, identity: { ...p.identity, naics: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } }))} placeholder="541511, 541512, 541519" />
            <p className="field-help">Comma-separated. Used by the AI to assess set-aside and size eligibility.</p>
          </div>
          <div className="form-group">
            <label>Market Positioning <span className="field-ai-tip-sm">most influential</span></label>
            <textarea rows="3" value={context.identity?.positioning || ''} onChange={(e) => setContext((p) => ({ ...p, identity: { ...p.identity, positioning: e.target.value } }))} placeholder="One or two sentences: what you're known for and where you win. e.g., 'SDVOSB technology modernization firm specializing in federal health IT, benefits platforms, and DevSecOps delivery at VA and CMS.'" />
            <p className="field-help">This is the single sentence the AI reads to understand your market position. Be specific — not a tagline.</p>
          </div>
          <div className="profile-actions">
            <button className="save-button" onClick={saveCompanyContext} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      )}

      {/* ── Capabilities & Gaps ──────────────────────────── */}
      {activeTab === 'capabilities' && (
        <div className="profile-section tab-panel">
          <div className="section-header">
            <h3>Capabilities</h3>
            <p className="section-help">Tag each capability with a tier — the AI understands what you lead with vs. what you support.</p>
          </div>
          {['core', 'supporting', 'emerging'].map((tier) => {
            const tierCaps = context.capabilities.filter((c) => c.tier === tier)
            const atCap = tierCaps.length >= 5
            return (
              <div key={tier} className="capability-tier-group">
                <div className="capability-tier-header">
                  <div className={`capability-tier-label ${capTierClass[tier]}`}>{capTierLabel[tier]}</div>
                  <span className={`capability-tier-count ${atCap ? 'at-cap' : ''}`}>{tierCaps.length}/5</span>
                </div>
                <div className="capability-list">
                  {tierCaps.length === 0 && <span className="empty-inline">None yet</span>}
                  {tierCaps.map((cap) => {
                    const realIdx = context.capabilities.indexOf(cap)
                    return (
                      <div key={realIdx} className="capability-row">
                        <span className="capability-row-text">{cap.label}</span>
                        <button onClick={() => removeItem('capabilities', realIdx)}>×</button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          <div className="add-item capability-add">
            <input
              type="text"
              placeholder="Short phrase, e.g. Zero-trust architecture"
              value={newItem.capabilityLabel}
              onChange={(e) => setNewItem({ ...newItem, capabilityLabel: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && addItem('capability')}
            />
            <select value={newItem.capabilityTier} onChange={(e) => setNewItem({ ...newItem, capabilityTier: e.target.value })}>
              <option value="core">Core</option>
              <option value="supporting">Supporting</option>
              <option value="emerging">Emerging</option>
            </select>
            {(() => {
              const tierCaps = context.capabilities.filter((c) => c.tier === newItem.capabilityTier)
              const atCap = tierCaps.length >= 5
              return (
                <button onClick={() => addItem('capability')} disabled={atCap} title={atCap ? `${newItem.capabilityTier} tier is full (5/5) — remove one to add another` : undefined}>
                  Add
                </button>
              )
            })()}
          </div>
          <p className="capability-cap-hint">Max 5 per tier — keep labels concise (a phrase, not a sentence). The AI reads all of them.</p>

          <div className="section-divider" />

          <div className="section-header" style={{ marginTop: 0 }}>
            <h3>Known Gaps</h3>
            <p className="section-help">Certifications, vehicles, or capabilities you lack — the AI factors these into risk assessments.</p>
          </div>
          <div className="capability-list">
            {context.knownGaps.map((gap, idx) => (
              <div key={idx} className="capability-row">
                <span className="capability-row-text">{gap}</span>
                <button onClick={() => removeItem('knownGaps', idx)}>×</button>
              </div>
            ))}
            {context.knownGaps.length === 0 && <span className="empty-inline">None yet</span>}
          </div>
          <div className="add-item">
            <input type="text" placeholder="e.g., No CMMC Level 2 certification" value={newItem.knownGap} onChange={(e) => setNewItem({ ...newItem, knownGap: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addItem('knownGap')} />
            <button onClick={() => addItem('knownGap')}>Add</button>
          </div>
          <div className="profile-actions">
            <button className="save-button" onClick={saveCompanyContext} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      )}

      {/* ── Vehicles & Set-Asides ────────────────────────── */}
      {activeTab === 'vehicles' && (
        <div className="profile-section tab-panel">
          <div className="section-header">
            <h3>Contract Vehicles</h3>
            <p className="section-help">Vehicles your company holds or can access. The AI uses these to assess whether an opportunity is reachable.</p>
          </div>
          <div className="items-list">
            {context.vehicles.map((v, idx) => <div key={idx} className="item-tag">{v}<button onClick={() => removeItem('vehicles', idx)}>×</button></div>)}
          </div>
          <div className="add-item">
            <select value={newItem.vehicle} onChange={(e) => setNewItem({ ...newItem, vehicle: e.target.value })}>
              <option value="">Select vehicle</option>
              {vehicleOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {newItem.vehicle === 'Other' && <input type="text" placeholder="Enter vehicle" value={newItem.customVehicle} onChange={(e) => setNewItem({ ...newItem, customVehicle: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addItem('vehicle')} />}
            <button onClick={() => addItem('vehicle')}>Add</button>
          </div>

          <div className="section-divider" />

          <div className="section-header" style={{ marginTop: 0 }}>
            <h3>Set-Aside Designations</h3>
            <p className="section-help">Certifications your company currently holds.</p>
          </div>
          <div className="items-list">
            {context.setAside.map((d, idx) => <div key={idx} className="item-tag">{d}<button onClick={() => removeItem('setAside', idx)}>×</button></div>)}
          </div>
          <div className="add-item">
            <select value={newItem.setAside} onChange={(e) => setNewItem({ ...newItem, setAside: e.target.value })}>
              <option value="">Select set-aside</option>
              {setAsideOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {newItem.setAside === 'Other' && <input type="text" placeholder="Enter set-aside" value={newItem.customSetAside} onChange={(e) => setNewItem({ ...newItem, customSetAside: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addItem('setAside')} />}
            <button onClick={() => addItem('setAside')}>Add</button>
          </div>
          <div className="profile-actions">
            <button className="save-button" onClick={saveCompanyContext} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      )}

      {/* ── Team ─────────────────────────────────────────── */}
      {activeTab === 'team' && (
        <div className="profile-section tab-panel">
          <div className="section-header">
            <h3>Team Directory</h3>
            <p className="section-help">Add people and skills so the AI can name who should lead or support each pursuit. Skills are capped at 5 per person.</p>
          </div>
          <div className="team-search-bar">
            <input type="text" placeholder={`Search ${(context.teamMembers || []).length} people by name, role, or skill…`} value={teamSearch} onChange={(e) => { setTeamSearch(e.target.value); setTeamPage(1) }} />
            {teamSearch.trim() && <span className="team-search-count">{(() => { const q = teamSearch.trim().toLowerCase(); return (context.teamMembers || []).filter((m) => m.name?.toLowerCase().includes(q) || m.role?.toLowerCase().includes(q) || (Array.isArray(m.skills) && m.skills.some((s) => s.toLowerCase().includes(q)))).length })()  } result{(() => { const q = teamSearch.trim().toLowerCase(); return (context.teamMembers || []).filter((m) => m.name?.toLowerCase().includes(q) || m.role?.toLowerCase().includes(q) || (Array.isArray(m.skills) && m.skills.some((s) => s.toLowerCase().includes(q)))).length })() !== 1 ? 's' : ''}</span>}
          </div>
          {(context.teamMembers || []).length > 0 ? (
            (() => {
              const q = teamSearch.trim().toLowerCase()
              const filtered = q ? context.teamMembers.filter((m) => m.name?.toLowerCase().includes(q) || m.role?.toLowerCase().includes(q) || (Array.isArray(m.skills) && m.skills.some((s) => s.toLowerCase().includes(q)))) : context.teamMembers
              const totalPages = Math.ceil(filtered.length / TEAM_PAGE_SIZE)
              const page = Math.min(teamPage, totalPages || 1)
              const pageMembers = filtered.slice((page - 1) * TEAM_PAGE_SIZE, page * TEAM_PAGE_SIZE)
              return (
                <>
                  <div className="team-list">
                    {pageMembers.length === 0 ? <p className="empty">No people match "{teamSearch}".</p> : pageMembers.map((member) => {
                      const idx = context.teamMembers.indexOf(member)
                      return (
                        <div key={member.id || idx} className="team-member">
                          <div className="team-member-main">
                            <div className="team-member-title">
                              <span className="team-member-name">{member.name}</span>
                              {member.role && <span className="team-member-role">{member.role}</span>}
                              {member.experienceYears ? <span className="team-member-exp">{member.experienceYears}y</span> : null}
                            </div>
                            {member.email && <div className="contact-meta">{member.email}</div>}
                            {Array.isArray(member.skills) && member.skills.length > 0 && (
                              <div className="team-skill-tags">
                                {member.skills.slice(0, 5).map((skill) => <span key={skill} className="team-skill-tag">{skill}</span>)}
                              </div>
                            )}
                          </div>
                          <div className="contact-card-actions">
                            <button type="button" className="contact-edit-btn" onClick={() => startEditTeamMember(member)}>Edit</button>
                            <button type="button" className="team-remove" onClick={() => removeTeamMember(idx)}>Remove</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {totalPages > 1 && (
                    <div className="team-pagination">
                      <button className="team-page-btn" onClick={() => setTeamPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>← Prev</button>
                      <span className="team-page-info">Page {page} of {totalPages} · {filtered.length} people</span>
                      <button className="team-page-btn" onClick={() => setTeamPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next →</button>
                    </div>
                  )}
                </>
              )
            })()
          ) : <p className="empty">No team members added yet.</p>}

          {!showTeamForm && (
            <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => { setTeamDraft({ name: '', role: '', email: '', experienceYears: '', skills: '' }); setEditingTeamMember(null); setShowTeamForm(true) }}>+ Add Team Member</button>
          )}
          {showTeamForm && (
            <div className="stakeholder-form contact-form-inline" style={{ marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '15px' }}>{editingTeamMember ? 'Edit Team Member' : 'New Team Member'}</h4>
              <div className="form-row">
                <div className="form-group"><label>Name *</label><input type="text" value={teamDraft.name} onChange={(e) => setTeamDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Jane Doe" /></div>
                <div className="form-group"><label>Role</label><input type="text" value={teamDraft.role} onChange={(e) => setTeamDraft((p) => ({ ...p, role: e.target.value }))} placeholder="Solutions Architect" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Email</label><input type="email" value={teamDraft.email} onChange={(e) => setTeamDraft((p) => ({ ...p, email: e.target.value }))} placeholder="jane.doe@company.com" /></div>
                <div className="form-group"><label>Years Experience</label><input type="number" min="0" value={teamDraft.experienceYears} onChange={(e) => setTeamDraft((p) => ({ ...p, experienceYears: e.target.value }))} placeholder="8" /></div>
              </div>
              <div className="form-group"><label>Skills <span className="field-ai-tip-sm">max 5, comma-separated</span></label><input type="text" value={teamDraft.skills} onChange={(e) => setTeamDraft((p) => ({ ...p, skills: e.target.value }))} placeholder="cloud migration, AWS GovCloud, DevSecOps" /></div>
              <div className="contact-form-actions">
                <button type="button" className="btn btn-primary" onClick={saveTeamDraft} disabled={!teamDraft.name.trim()}>{editingTeamMember ? 'Update' : 'Save'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowTeamForm(false); setEditingTeamMember(null) }}>Cancel</button>
              </div>
            </div>
          )}

          <div className="team-import" style={{ marginTop: '1.5rem' }}>
            <div className="team-import-row">
              <label className="team-import-label">Import CSV<input ref={csvInputRef} type="file" accept=".csv,text/csv" onChange={handleTeamCsvUpload} /></label>
            </div>
            <details className="team-import-details">
              <summary>CSV format</summary>
              <pre>name,role,email,experienceYears,skills
Jane Doe,Capture Manager,jane.doe@company.com,8,"VA; DoD; win strategy; cloud; agile"
John Smith,Solutions Architect,jsmith@company.com,12,"cloud modernization; zero trust; DevSecOps; AWS; FedRAMP"</pre>
              <p className="field-help">Required: <strong>name</strong>. Use semicolons in the skills cell. Max 5 skills per person. Email is used for the proposal team invite feature.</p>
            </details>
          </div>
          <div className="profile-actions">
            <button className="save-button" onClick={saveCompanyContext} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      )}

      {/* ── Contacts ─────────────────────────────────────── */}
      {activeTab === 'contacts' && (
        <div className="profile-section tab-panel">
          <div className="section-header">
            <h3>Known Contacts</h3>
            <p className="section-help">Your company's relationship book — agency contacts, PMs, COs, and technical authorities. Pick from here when creating an opportunity.</p>
          </div>
          <div className="team-search-bar">
            <input type="text" placeholder="Search by name, agency, or title…" value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} />
          </div>
          {(() => {
            const q = contactSearch.trim().toLowerCase()
            const filtered = contacts.filter((c) => !q || [c.name, c.agency, c.title, c.office].filter(Boolean).join(' ').toLowerCase().includes(q))
            return filtered.length > 0 ? (
              <div className="team-list">
                {filtered.map((c) => (
                  <div key={c.id} className="team-member">
                    <div className="team-member-main">
                      <div className="team-member-title">
                        <span className="team-member-name">{c.name}</span>
                        {c.agency && <span className="team-member-role">{c.agency}</span>}
                        {c.relationshipStrength && (
                          <span className={`contact-strength-badge strength-${c.relationshipStrength}`}>{c.relationshipStrength}</span>
                        )}
                      </div>
                      <div className="contact-meta">
                        {[c.title, c.office].filter(Boolean).join(' · ')}
                        {c.lastTouch && <span className="contact-last-touch"> · {c.lastTouch}</span>}
                      </div>
                    </div>
                    <div className="contact-card-actions">
                      <button type="button" className="contact-edit-btn" onClick={() => startEditContact(c)}>Edit</button>
                      <button type="button" className="team-remove" onClick={() => removeContact(c.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null
          })()}
          {!showContactForm && (
            <button type="button" className="btn btn-primary" onClick={() => { setContactDraft(BLANK_CONTACT); setEditingContact(null); setShowContactForm(true) }}>+ Add Contact</button>
          )}
          {showContactForm && (
            <div className="stakeholder-form contact-form-inline">
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '15px' }}>{editingContact ? 'Edit Contact' : 'New Contact'}</h4>
              <div className="form-row">
                <div className="form-group"><label>Name *</label><input type="text" value={contactDraft.name} onChange={(e) => setContactDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Jane Doe" /></div>
                <div className="form-group"><label>Relationship Strength</label><select value={contactDraft.relationshipStrength} onChange={(e) => setContactDraft((p) => ({ ...p, relationshipStrength: e.target.value }))}><option value="weak">Weak</option><option value="moderate">Moderate</option><option value="strong">Strong</option></select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Title / Role</label><input type="text" value={contactDraft.title} onChange={(e) => setContactDraft((p) => ({ ...p, title: e.target.value }))} placeholder="Program Manager" /></div>
                <div className="form-group"><label>Office</label><input type="text" value={contactDraft.office} onChange={(e) => setContactDraft((p) => ({ ...p, office: e.target.value }))} placeholder="VA OIT" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Agency</label><input type="text" value={contactDraft.agency} onChange={(e) => setContactDraft((p) => ({ ...p, agency: e.target.value }))} placeholder="Department of Veterans Affairs" /></div>
                <div className="form-group"><label>Email</label><input type="email" value={contactDraft.email} onChange={(e) => setContactDraft((p) => ({ ...p, email: e.target.value }))} placeholder="jane.doe@va.gov" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Last Touch</label><input type="date" value={contactDraft.lastTouch} onChange={(e) => setContactDraft((p) => ({ ...p, lastTouch: e.target.value }))} /></div>
                <div className="form-group"><label>Next Touch</label><input type="date" value={contactDraft.nextTouch} onChange={(e) => setContactDraft((p) => ({ ...p, nextTouch: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label>Notes</label><textarea value={contactDraft.notes} onChange={(e) => setContactDraft((p) => ({ ...p, notes: e.target.value }))} rows="2" placeholder="What matters to them, context from interactions…" /></div>
              <div className="contact-form-actions">
                <button type="button" className="btn btn-primary" onClick={saveContactDraft} disabled={contactSaving || !contactDraft.name.trim()}>{contactSaving ? 'Saving…' : editingContact ? 'Update Contact' : 'Save Contact'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowContactForm(false); setEditingContact(null); setContactDraft(BLANK_CONTACT) }}>Cancel</button>
              </div>
            </div>
          )}

          <div className="team-import" style={{ marginTop: '1.5rem' }}>
            <details className="team-import-details">
              <summary>Import CSV</summary>
              <pre>name,title,agency,office,email,relationshipStrength,notes
Jane Doe,Contracting Officer,Department of Veterans Affairs,VA OIT,jane.doe@va.gov,moderate,Met at Industry Day
John Smith,Program Manager,DHS,CSOC,jsmith@dhs.gov,strong,Active relationship from prior task order</pre>
              <p className="field-help">Required: <strong>name</strong>. relationshipStrength: weak | moderate | strong.</p>
            </details>
          </div>
        </div>
      )}

      {/* ── AI Settings ──────────────────────────────────── */}
      {activeTab === 'ai' && (
        <div className="profile-section tab-panel ai-settings-section">
          <div className="section-header">
            <h3>AI Settings</h3>
            <p className="section-help">Configure the key and model used for analysis. Keys are stored locally and never shown back in the UI.</p>
          </div>
          <div className="settings-grid">
            <div className="settings-row">
              <div className="settings-field">
                <label>OpenAI API Key</label>
                <input type="password" value={aiSettings.openaiApiKey} onChange={(e) => setAiSettings((prev) => ({ ...prev, openaiApiKey: e.target.value }))} placeholder={aiSettings.hasOpenAiKey ? 'Key configured (enter to replace)' : 'Paste API key to enable real calls'} />
                <p className="field-help">Status: <strong>{aiSettings.hasOpenAiKey ? 'Configured' : 'Not configured (mock responses will be used)'}</strong></p>
              </div>
            </div>
            <div className="settings-row settings-row-2">
              <div className="settings-field">
                <label>Model (Optional)</label>
                <input type="text" value={aiSettings.model} onChange={(e) => setAiSettings((prev) => ({ ...prev, model: e.target.value }))} placeholder="e.g., gpt-4o-mini" />
                <p className="field-help">Leave blank to use the backend default.</p>
              </div>
              <div className="settings-field">
                <label>Base URL (Optional)</label>
                <input type="text" value={aiSettings.baseUrl} onChange={(e) => setAiSettings((prev) => ({ ...prev, baseUrl: e.target.value }))} placeholder="https://api.openai.com" />
                <p className="field-help">Only needed for proxies/gateways.</p>
              </div>
            </div>
            <div className="settings-row">
              <div className="settings-field">
                <label>System Prompt Additions (Optional)</label>
                <textarea
                  value={aiSettings.systemPromptSuffix}
                  onChange={(e) => setAiSettings((prev) => ({ ...prev, systemPromptSuffix: e.target.value }))}
                  placeholder="Add extra instructions that will be appended to every analysis prompt. For example: 'Always flag if the incumbent is unknown.' or 'Our target win rate is 40% — be conservative with pWin scores.'"
                />
                <p className="field-help">Appended after the gate-specific instructions. Use this to set house rules, scoring calibration, or emphasis. Leave blank to use defaults.</p>
              </div>
            </div>
            <div className="profile-actions settings-actions">
              <button className="save-button" onClick={saveAiSettings} disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompanyProfile
