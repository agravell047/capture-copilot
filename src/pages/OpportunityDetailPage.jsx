import { useEffect, useState } from 'react'
import { getOpportunity, deleteOpportunity } from '../api/opportunities'
import OpportunityWorkspace from '../components/OpportunityWorkspace'
import PostMortemModal from '../components/PostMortemModal'
import { getOpportunityName } from '../utils/opportunities'
import './OpportunityDetailPage.css'
import '../OpportunityCaptureForm.css'

function OpportunityDetailPage({ opportunityId, onBackToPortfolio, onCreateOpportunity, onEditOpportunity, onOpportunityDeleted }) {
  const [opportunity, setOpportunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPostMortem, setShowPostMortem] = useState(false)

  const isClosed = opportunity && ['won', 'lost', 'no_bid', 'withdrew'].includes(opportunity.status)

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
              Back to Dashboard
            </button>
            <button type="button" className="btn btn-primary" onClick={onCreateOpportunity}>
              New Capture
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
            Back to Dashboard
          </button>
          {!isClosed && (
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setShowPostMortem(true)}>
                Close Opportunity
              </button>
              <button type="button" className="btn btn-primary" onClick={onEditOpportunity}>
                Edit Opportunity
              </button>
            </>
          )}
          {isClosed && (
            <span className={`outcome-badge outcome-badge--${opportunity.status}`}>
              {opportunity.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
          )}
        </div>
      </div>

      <OpportunityWorkspace opportunity={opportunity} onOpportunityChange={setOpportunity} showUpdateForm={!isClosed} />

      {showPostMortem && (
        <PostMortemModal
          opportunity={opportunity}
          onClose={() => setShowPostMortem(false)}
          onSaved={({ opportunity: updated }) => {
            setOpportunity(updated)
            setShowPostMortem(false)
          }}
          onDelete={async (id) => {
            await deleteOpportunity(id)
            if (onOpportunityDeleted) onOpportunityDeleted()
            else onBackToPortfolio()
          }}
        />
      )}
    </div>
  )
}

export default OpportunityDetailPage
