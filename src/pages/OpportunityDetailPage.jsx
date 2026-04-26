import { useEffect, useState } from 'react'
import { getOpportunity } from '../api/opportunities'
import OpportunityWorkspace from '../components/OpportunityWorkspace'
import { getOpportunityName } from '../utils/opportunities'
import './OpportunityDetailPage.css'
import '../OpportunityCaptureForm.css'

function OpportunityDetailPage({ opportunityId, onBackToPortfolio, onCreateOpportunity, onEditOpportunity }) {
  const [opportunity, setOpportunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    const loadOpportunity = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getOpportunity(opportunityId)

        if (!ignore) {
          setOpportunity(data)
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    if (opportunityId) {
      loadOpportunity()
    } else {
      setLoading(false)
      setError('Opportunity ID is missing')
    }

    return () => {
      ignore = true
    }
  }, [opportunityId])

  if (loading) {
    return (
      <div className="detail-page">
        <div className="detail-empty">Loading opportunity...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="detail-page">
        <div className="detail-empty">
          <h2>Unable to load opportunity</h2>
          <p>{error}</p>
          <div className="detail-empty-actions">
            <button type="button" className="btn btn-secondary" onClick={onBackToPortfolio}>
              Back to Portfolio
            </button>
            <button type="button" className="btn btn-primary" onClick={onCreateOpportunity}>
              Create Opportunity
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div>
          <h2>{getOpportunityName(opportunity)}</h2>
          <p className="detail-subtitle">Opportunity detail, analysis history, and evolving capture context.</p>
        </div>

        <div className="detail-actions">
          <button type="button" className="btn btn-secondary" onClick={onBackToPortfolio}>
            Back to Portfolio
          </button>
          <button type="button" className="btn btn-primary" onClick={onEditOpportunity}>
            Edit Opportunity
          </button>
        </div>
      </div>

      <OpportunityWorkspace opportunity={opportunity} onOpportunityChange={setOpportunity} showUpdateForm={false} />
    </div>
  )
}

export default OpportunityDetailPage
