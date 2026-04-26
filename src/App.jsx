import { useEffect, useState } from 'react'
import OpportunityCaptureForm from './OpportunityCaptureForm'
import CompanyProfile from './CompanyProfile'
import OpportunityPortfolioPage from './pages/OpportunityPortfolioPage'
import OpportunityDetailPage from './pages/OpportunityDetailPage'
import './App.css'

const normalizePath = (pathname) => {
  if (!pathname || pathname === '/') {
    return '/'
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

const getRouteState = (pathname) => {
  const normalizedPath = normalizePath(pathname)

  if (normalizedPath === '/opportunities') {
    return { page: 'portfolio' }
  }

  if (normalizedPath.startsWith('/opportunities/') && normalizedPath.endsWith('/edit')) {
    return {
      page: 'capture',
      editingOpportunityId: normalizedPath.replace('/opportunities/', '').replace('/edit', '')
    }
  }

  if (normalizedPath.startsWith('/opportunities/')) {
    return {
      page: 'detail',
      opportunityId: normalizedPath.replace('/opportunities/', '')
    }
  }

  if (normalizedPath === '/company-profile') {
    return { page: 'profile' }
  }

  return { page: 'capture' }
}

function App() {
  const [route, setRoute] = useState(() => getRouteState(window.location.pathname))

  const navigateTo = (path, { replace = false } = {}) => {
    const normalizedPath = normalizePath(path)

    if (replace) {
      window.history.replaceState({}, '', normalizedPath)
    } else if (window.location.pathname !== normalizedPath) {
      window.history.pushState({}, '', normalizedPath)
    }

    setRoute(getRouteState(normalizedPath))
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRouteState(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <button type="button" className="brand-button" onClick={() => navigateTo('/')}>
            Capture Copilot
          </button>
        </div>

        <div className="header-right">
          <div className="primary-nav">
            <button
              type="button"
              className={`nav-button ${route.page === 'capture' ? 'nav-button-active' : ''}`}
              onClick={() => navigateTo('/')}
            >
              New Capture
            </button>
            <button
              type="button"
              className={`nav-button ${route.page === 'portfolio' || route.page === 'detail' ? 'nav-button-active' : ''}`}
              onClick={() => navigateTo('/opportunities')}
            >
              Portfolio
            </button>
            <button
              type="button"
              className={`nav-button ${route.page === 'profile' ? 'nav-button-active' : ''}`}
              onClick={() => navigateTo('/company-profile')}
            >
              Settings
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {route.page === 'capture' && (
          <OpportunityCaptureForm
            editingOpportunityId={route.editingOpportunityId}
            onOpportunityCreated={(opportunity) => navigateTo(`/opportunities/${opportunity.id}`)}
          />
        )}

        {route.page === 'portfolio' && (
          <OpportunityPortfolioPage
            onCreateOpportunity={() => navigateTo('/')}
            onOpenOpportunity={(opportunityId) => navigateTo(`/opportunities/${opportunityId}`)}
          />
        )}

        {route.page === 'detail' && (
          <OpportunityDetailPage
            opportunityId={route.opportunityId}
            onBackToPortfolio={() => navigateTo('/opportunities')}
            onCreateOpportunity={() => navigateTo('/')}
            onEditOpportunity={() => navigateTo(`/opportunities/${route.opportunityId}/edit`)}
          />
        )}

        {route.page === 'profile' && <CompanyProfile />}
      </main>
    </div>
  )
}

export default App
