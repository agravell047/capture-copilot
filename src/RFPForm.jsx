import { useState } from 'react'
import './RFPForm.css'

function RFPForm() {
  const [title, setTitle] = useState('')
  const [agency, setAgency] = useState('')
  const [rfpText, setRfpText] = useState('')
  const [constraints, setConstraints] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    if (!title.trim() || !agency.trim() || !rfpText.trim()) {
      setError('Title, agency, and RFP text are required')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:3001/api/analyze-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfpText })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to analyze RFP')
      }

      const data = await response.json()
      setResult({
        title,
        agency,
        constraints,
        ...data
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setTitle('')
    setAgency('')
    setRfpText('')
    setConstraints('')
    setError('')
    setResult(null)
  }

  return (
    <div className="rfp-form-container">
      <div className="form-section">
        <h1>Federal RFP Analysis</h1>
        <p className="subtitle">Submit an RFP for automated analysis</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">RFP Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Cloud Services for Defense Department"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="agency">Agency *</label>
              <input
                type="text"
                id="agency"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                placeholder="e.g., Department of Defense"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="constraints">Constraints (Optional)</label>
              <input
                type="text"
                id="constraints"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g., Budget limit, timeline"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="rfpText">RFP Text *</label>
            <textarea
              id="rfpText"
              value={rfpText}
              onChange={(e) => setRfpText(e.target.value)}
              placeholder="Paste the full RFP text here..."
              rows="10"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Analyzing...' : 'Analyze RFP'}
            </button>
            <button type="button" onClick={handleReset} className="btn btn-secondary">
              Clear
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="results-section">
          <h2>Analysis Results</h2>

          <div className="result-header">
            <div>
              <h3>{result.title}</h3>
              <p className="agency">{result.agency}</p>
              {result.constraints && <p className="constraints">Constraints: {result.constraints}</p>}
            </div>
          </div>

          <div className="results-grid">
            <div className="result-card">
              <h3>Requirements ({result.requirements?.length || 0})</h3>
              {result.requirements && result.requirements.length > 0 ? (
                <ul className="result-list">
                  {result.requirements.map((req, idx) => (
                    <li key={idx}>
                      <span className={`priority priority-${req.priority}`}>{req.priority}</span>
                      <p>{req.text}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty">No requirements extracted</p>
              )}
            </div>

            <div className="result-card">
              <h3>Evaluation Criteria ({result.evaluationCriteria?.length || 0})</h3>
              {result.evaluationCriteria && result.evaluationCriteria.length > 0 ? (
                <ul className="result-list">
                  {result.evaluationCriteria.map((crit, idx) => (
                    <li key={idx}>
                      <span className={`weight weight-${crit.weight}`}>{crit.weight}</span>
                      <p>{crit.text}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty">No evaluation criteria extracted</p>
              )}
            </div>

            <div className="result-card">
              <h3>Risks ({result.risks?.length || 0})</h3>
              {result.risks && result.risks.length > 0 ? (
                <ul className="result-list">
                  {result.risks.map((risk, idx) => (
                    <li key={idx}>
                      <span className={`severity severity-${risk.severity}`}>{risk.severity}</span>
                      <p>{risk.text}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty">No risks identified</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RFPForm