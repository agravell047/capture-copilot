import { useState, useEffect, useRef } from 'react'
import './CompanyProfile.css'

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
  const [context, setContext] = useState({
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
    baseUrl: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [newItem, setNewItem] = useState({
    vehicle: '',
    customVehicle: '',
    setAside: '',
    customSetAside: '',
    capability: '',
    knownGap: '',
    relationshipAgency: '',
    customRelationshipAgency: '',
    relationshipStrength: '',
    teamMemberName: '',
    teamMemberRole: '',
    teamMemberExperienceYears: '',
    teamMemberSkills: ''
  })

  useEffect(() => {
    if (!message) return
    setTimeout(() => messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }, [message])

  useEffect(() => {
    fetchCompanyContext()
    fetchAiSettings()
  }, [])

  const fetchCompanyContext = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/company-context')
      if (!response.ok) throw new Error('Failed to fetch company context')
      const data = await response.json()
      setContext(data)
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
        baseUrl: data.baseUrl || ''
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
        baseUrl: aiSettings.baseUrl
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
        baseUrl: data.baseUrl || prev.baseUrl
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

      const member = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        name,
        role,
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
      if (!newItem.capability || newItem.capability.trim() === '') return

      setContext({
        ...context,
        capabilities: [...context.capabilities, newItem.capability]
      })
      setNewItem({ ...newItem, capability: '' })
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

  const handleTeamCsvUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const { headers, rows } = parseCsv(text)

      const idx = (name) => headers.indexOf(name)
      const nameIdx = idx('name')
      const roleIdx = idx('role')
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
        const experienceYearsRaw = expIdx !== -1 ? String(row[expIdx] || '').trim() : ''
        const experienceYears = Number.isFinite(Number(experienceYearsRaw)) ? Number(experienceYearsRaw) : 0
        const skillsRaw = skillsIdx !== -1 ? String(row[skillsIdx] || '').trim() : ''

        // Prefer semicolon or pipe separators to avoid CSV comma conflicts, but accept commas too.
        const skills = skillsRaw
          .split(/[;|]/)
          .flatMap((segment) => segment.split(','))
          .map((skill) => skill.trim())
          .filter(Boolean)

        imported.push({
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
          name,
          role,
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

  return (
    <div className="company-profile">
      <h2>Settings</h2>
      <p className="subtitle">Manage the company context and AI settings that shape every opportunity analysis.</p>

      {message && (
        <div
          ref={messageRef}
          className={`message ${message.includes('Error') ? 'error' : 'success'}`}
        >
          {message}
        </div>
      )}

      <div className="settings-intro">
        <h3>Company Profile</h3>
        <p>These details are fed into every opportunity analysis.</p>
      </div>

      {/* Vehicles */}
      <div className="profile-section">
        <h3>Contract Vehicles</h3>
        <p className="section-help">Use standard vehicle names where possible so the analysis stays consistent.</p>
        <div className="items-list">
          {context.vehicles.map((vehicle, idx) => (
            <div key={idx} className="item-tag">
              {vehicle}
              <button onClick={() => removeItem('vehicles', idx)}>×</button>
            </div>
          ))}
        </div>
        <div className="add-item">
          <select
            value={newItem.vehicle}
            onChange={(e) => setNewItem({ ...newItem, vehicle: e.target.value })}
          >
            <option value="">Select contract vehicle</option>
            {vehicleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {newItem.vehicle === 'Other' && (
            <input
              type="text"
              placeholder="Enter contract vehicle"
              value={newItem.customVehicle}
              onChange={(e) => setNewItem({ ...newItem, customVehicle: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && addItem('vehicle')}
            />
          )}
          <button onClick={() => addItem('vehicle')}>Add Vehicle</button>
        </div>
      </div>

      {/* Set-Aside Designations */}
      <div className="profile-section">
        <h3>Set-Aside Designations</h3>
        <p className="section-help">Choose the designations your company currently holds.</p>
        <div className="items-list">
          {context.setAside.map((designation, idx) => (
            <div key={idx} className="item-tag">
              {designation}
              <button onClick={() => removeItem('setAside', idx)}>×</button>
            </div>
          ))}
        </div>
        <div className="add-item">
          <select
            value={newItem.setAside}
            onChange={(e) => setNewItem({ ...newItem, setAside: e.target.value })}
          >
            <option value="">Select set-aside</option>
            {setAsideOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {newItem.setAside === 'Other' && (
            <input
              type="text"
              placeholder="Enter set-aside"
              value={newItem.customSetAside}
              onChange={(e) => setNewItem({ ...newItem, customSetAside: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && addItem('setAside')}
            />
          )}
          <button onClick={() => addItem('setAside')}>Add Set-Aside</button>
        </div>
      </div>

      {/* Core Capabilities */}
      <div className="profile-section">
        <h3>Core Capabilities</h3>
        <div className="items-list">
          {context.capabilities.map((capability, idx) => (
            <div key={idx} className="item-tag">
              {capability}
              <button onClick={() => removeItem('capabilities', idx)}>×</button>
            </div>
          ))}
        </div>
        <div className="add-item">
          <input
            type="text"
            placeholder="e.g., Cloud Infrastructure, Cybersecurity, Data Analytics"
            value={newItem.capability}
            onChange={(e) => setNewItem({ ...newItem, capability: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && addItem('capability')}
          />
          <button onClick={() => addItem('capability')}>Add Capability</button>
        </div>
      </div>

      {/* Team Directory */}
      <div className="profile-section">
        <h3>Team Directory</h3>
        <p className="section-help">
          Add people and skills so the AI can recommend who should support an RFP or proposal effort.
        </p>

        {(context.teamMembers || []).length > 0 ? (
          <div className="team-list">
            {context.teamMembers.map((member, idx) => (
              <div key={member.id || idx} className="team-member">
                <div className="team-member-main">
                  <div className="team-member-title">
                    <span className="team-member-name">{member.name}</span>
                    {member.role ? <span className="team-member-role">{member.role}</span> : null}
                    {member.experienceYears ? (
                      <span className="team-member-exp">{member.experienceYears}y</span>
                    ) : null}
                  </div>

                  {Array.isArray(member.skills) && member.skills.length > 0 ? (
                    <div className="team-skill-tags">
                      {member.skills.slice(0, 12).map((skill) => (
                        <span key={skill} className="team-skill-tag">{skill}</span>
                      ))}
                      {member.skills.length > 12 ? <span className="team-skill-more">+{member.skills.length - 12} more</span> : null}
                    </div>
                  ) : (
                    <p className="empty">No skills listed</p>
                  )}
                </div>

                <button onClick={() => removeTeamMember(idx)} className="team-remove">Remove</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty">No team members added yet.</p>
        )}

        <div className="add-item team-add">
          <input
            type="text"
            placeholder="Name"
            value={newItem.teamMemberName}
            onChange={(e) => setNewItem({ ...newItem, teamMemberName: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && addItem('teamMember')}
          />
          <input
            type="text"
            placeholder="Role (optional)"
            value={newItem.teamMemberRole}
            onChange={(e) => setNewItem({ ...newItem, teamMemberRole: e.target.value })}
          />
          <input
            type="number"
            min="0"
            placeholder="Years"
            value={newItem.teamMemberExperienceYears}
            onChange={(e) => setNewItem({ ...newItem, teamMemberExperienceYears: e.target.value })}
          />
          <input
            type="text"
            placeholder="Skills (comma-separated)"
            value={newItem.teamMemberSkills}
            onChange={(e) => setNewItem({ ...newItem, teamMemberSkills: e.target.value })}
          />
          <button onClick={() => addItem('teamMember')}>Add Person</button>
        </div>

        <div className="team-import">
          <div className="team-import-row">
            <label className="team-import-label">
              Import CSV
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleTeamCsvUpload}
              />
            </label>
          </div>
          <details className="team-import-details">
            <summary>CSV format</summary>
            <pre>
name,role,experienceYears,skills
Jane Doe,Capture Manager,8,"VA; DoD; win strategy"
John Smith,Solutions Architect,12,"cloud modernization; zero trust; DevSecOps"
            </pre>
            <p className="field-help">
              Required: <strong>name</strong>. Recommended: role, experienceYears, skills. Use semicolons in the skills cell.
            </p>
          </details>
        </div>
      </div>

      {/* Key Relationships */}
      <div className="profile-section">
        <h3>Key Relationships</h3>
        <p className="section-help">Use agency-level relationship signals here; specific opportunity access can still live on the opportunity itself.</p>
        <div className="relationships-list">
          {context.relationships.map((rel, idx) => (
            <div key={idx} className="relationship-item">
              <span className="agency">{rel.agency}</span>
              <select
                value={rel.strength}
                onChange={(e) => updateRelationship(idx, 'strength', e.target.value)}
                className="strength-select"
              >
                <option value="weak">Weak</option>
                <option value="moderate">Moderate</option>
                <option value="strong">Strong</option>
              </select>
              <button onClick={() => removeItem('relationships', idx)}>Remove</button>
            </div>
          ))}
        </div>
        <div className="add-item">
          <select
            value={newItem.relationshipAgency}
            onChange={(e) => setNewItem({ ...newItem, relationshipAgency: e.target.value })}
          >
            <option value="">Select agency</option>
            {relationshipAgencyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {newItem.relationshipAgency === 'Other' && (
            <input
              type="text"
              placeholder="Enter agency name"
              value={newItem.customRelationshipAgency}
              onChange={(e) => setNewItem({ ...newItem, customRelationshipAgency: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && addItem('relationship')}
            />
          )}
          <select
            value={newItem.relationshipStrength}
            onChange={(e) => setNewItem({ ...newItem, relationshipStrength: e.target.value })}
            className="strength-select"
          >
            <option value="">Strength (default: Moderate)</option>
            <option value="weak">Weak</option>
            <option value="moderate">Moderate</option>
            <option value="strong">Strong</option>
          </select>
          <button onClick={() => addItem('relationship')}>Add Relationship</button>
        </div>
      </div>

      {/* Known Gaps */}
      <div className="profile-section">
        <h3>Known Gaps to Address</h3>
        <div className="items-list">
          {context.knownGaps.map((gap, idx) => (
            <div key={idx} className="item-tag">
              {gap}
              <button onClick={() => removeItem('knownGaps', idx)}>×</button>
            </div>
          ))}
        </div>
        <div className="add-item">
          <input
            type="text"
            placeholder="e.g., FedRAMP certification, CMMC level 3"
            value={newItem.knownGap}
            onChange={(e) => setNewItem({ ...newItem, knownGap: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && addItem('knownGap')}
          />
          <button onClick={() => addItem('knownGap')}>Add Gap</button>
        </div>
      </div>

      {/* Save Button */}
      <div className="profile-actions">
        <button className="save-button" onClick={saveCompanyContext} disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      <div className="profile-section ai-settings-section">
        <h3>AI Settings</h3>
        <p className="section-help">
          Configure the key/model used for analysis. Keys are stored locally on the backend and are never shown back in the UI.
        </p>

        <div className="settings-grid">
          <div className="settings-row">
            <div className="settings-field">
              <label>OpenAI API Key</label>
              <input
                type="password"
                value={aiSettings.openaiApiKey}
                onChange={(e) => setAiSettings((prev) => ({ ...prev, openaiApiKey: e.target.value }))}
                placeholder={aiSettings.hasOpenAiKey ? 'Key configured (enter to replace)' : 'Paste API key to enable real calls'}
              />
              <p className="field-help">
                Status: <strong>{aiSettings.hasOpenAiKey ? 'Configured' : 'Not configured (mock responses will be used)'}</strong>
              </p>
            </div>
          </div>

          <div className="settings-row settings-row-2">
            <div className="settings-field">
              <label>Model (Optional)</label>
              <input
                type="text"
                value={aiSettings.model}
                onChange={(e) => setAiSettings((prev) => ({ ...prev, model: e.target.value }))}
                placeholder="e.g., gpt-4o-mini"
              />
              <p className="field-help">Leave blank to use the backend default.</p>
            </div>

            <div className="settings-field">
              <label>Base URL (Optional)</label>
              <input
                type="text"
                value={aiSettings.baseUrl}
                onChange={(e) => setAiSettings((prev) => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://api.openai.com"
              />
              <p className="field-help">Only needed for proxies/gateways.</p>
            </div>
          </div>

          <div className="profile-actions settings-actions">
            <button className="save-button" onClick={saveAiSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyProfile
