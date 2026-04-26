import { useEffect, useState } from 'react'
import { listOpportunities, patchOpportunity } from '../api/opportunities'
import {
  formatTimestamp,
  formatContractValueBucket,
  getOpportunityName,
  getPwinScore,
  getRecommendationLabel
} from '../utils/opportunities'
import './OpportunityPortfolioPage.css'
import '../OpportunityCaptureForm.css'

function OpportunityPortfolioPage({ onCreateOpportunity, onOpenOpportunity }) {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOpportunities = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await listOpportunities()
      setOpportunities(data)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOpportunities()
  }, [])

  const archiveOpportunity = async (opportunityId) => {
    if (!window.confirm('Archive this opportunity?')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      await patchOpportunity(opportunityId, { status: 'archived' })
      await loadOpportunities()
    } catch (archiveError) {
      setError(archiveError.message)
    } finally {
      setLoading(false)
    }
  }

  const activeOpportunities = opportunities.filter((opportunity) => opportunity.status !== 'archived')
  const highPwinThreshold = 70
  const highPwinCount = activeOpportunities.filter((opportunity) => (getPwinScore(opportunity) || 0) >= highPwinThreshold).length

  return (
    <div className="portfolio-page">
      <div className="portfolio-header">
        <div>
          <h2>Opportunity Portfolio</h2>
          <p className="portfolio-subtitle">
            Track active pursuits, review current AI recommendations, and open each opportunity as it evolves.
          </p>
          <p className="portfolio-help">
            <strong>pWin</strong> = Probability of Win (AI estimate). “High pWin” uses the threshold shown.
          </p>
        </div>

        <div className="portfolio-actions">
          <button type="button" className="btn btn-primary" onClick={onCreateOpportunity}>
            New Opportunity
          </button>
        </div>
      </div>

      <div className="portfolio-summary">
        <div className="summary-card">
          <span className="summary-label">Active Opportunities</span>
          <strong>{activeOpportunities.length}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label" title="pWin = Probability of Win (AI-estimated). High pWin uses the threshold shown.">
            High pWin ({highPwinThreshold}%+)
          </span>
          <strong>{highPwinCount}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">Needs Attention</span>
          <strong>
            {activeOpportunities.filter((opportunity) => getRecommendationLabel(opportunity) === 'Pass').length}
          </strong>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="portfolio-empty">Loading opportunities...</div>
      ) : activeOpportunities.length === 0 ? (
        <div className="portfolio-empty">
          <h3>No active opportunities</h3>
          <p>Archived opportunities are hidden from the portfolio until reactivated. Add a new opportunity to get started.</p>
          <button type="button" className="btn btn-primary" onClick={onCreateOpportunity}>
            Create Opportunity
          </button>
        </div>
      ) : (
        <div className="portfolio-grid">
          {activeOpportunities.map((opportunity) => {
            const pWin = getPwinScore(opportunity)
            const recommendation = getRecommendationLabel(opportunity)

            return (
              <article key={opportunity.id} className="portfolio-card">
                <div className="portfolio-card-top">
                  <div>
                    <h3>{getOpportunityName(opportunity)}</h3>
                    <p className="portfolio-agency">{opportunity.agency}</p>
                  </div>
                  <span className={`portfolio-status portfolio-status-${opportunity.status}`}>{opportunity.status}</span>
                </div>

                <div className="portfolio-metrics">
                  <div className="portfolio-metric">
                    <span className="portfolio-metric-label" title="pWin = Probability of Win (AI-estimated).">
                      pWin
                    </span>
                    <strong>{pWin !== null ? `${pWin}%` : 'Pending'}</strong>
                  </div>
                  <div className="portfolio-metric">
                    <span className="portfolio-metric-label">Recommendation</span>
                    <strong>{recommendation}</strong>
                  </div>
                </div>

                <dl className="portfolio-details">
                  <div>
                    <dt>Value</dt>
                    <dd>{formatContractValueBucket(opportunity.contractValue)}</dd>
                  </div>
                  <div>
                    <dt>Vehicle</dt>
                    <dd>{opportunity.vehicle || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt>Set-Aside</dt>
                    <dd>{opportunity.setAside || 'None'}</dd>
                  </div>
                  <div>
                    <dt>Last Updated</dt>
                    <dd>{formatTimestamp(opportunity.updatedAt)}</dd>
                  </div>
                </dl>

                <div className="portfolio-card-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => onOpenOpportunity(opportunity.id)}
                  >
                    View Opportunity
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => archiveOpportunity(opportunity.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OpportunityPortfolioPage
