const API_BASE = 'http://localhost:3001/api'

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })

  return parseResponse(response)
}

export const deleteOpportunity = (opportunityId) =>
  request(`/opportunities/${opportunityId}`, { method: 'DELETE' })

export const listOpportunities = () => request('/opportunities')

export const getOpportunity = (opportunityId) => request(`/opportunities/${opportunityId}`)

export const createOpportunity = (payload) =>
  request('/opportunities', {
    method: 'POST',
    body: JSON.stringify(payload)
  })

export const updateOpportunity = (opportunityId, payload) =>
  request(`/opportunities/${opportunityId}/update`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })

export const reanalyzeOpportunity = (opportunityId) =>
  request(`/opportunities/${opportunityId}/reanalyze`, {
    method: 'POST'
  })

export const patchOpportunity = (opportunityId, payload) =>
  request(`/opportunities/${opportunityId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })

export const updateCompanyContext = (payload) =>
  request('/company-context', {
    method: 'POST',
    body: JSON.stringify(payload)
  })

export const getCompanyContext = () => request('/company-context')

export const extractRfpText = async (file) => {
  const body = new FormData()
  body.append('file', file)

  const response = await fetch(`${API_BASE}/rfp/extract`, {
    method: 'POST',
    body
  })

  return parseResponse(response)
}

export const ingestRfp = async (file) => {
  const body = new FormData()
  body.append('file', file)

  const response = await fetch(`${API_BASE}/rfp/ingest`, {
    method: 'POST',
    body
  })

  return parseResponse(response)
}

// ── Past Performance ──────────────────────────────────────────────────────────

export const getPastPerformanceMeta = () => request('/past-performance/meta')

export const listPastPerformance = () => request('/past-performance')

export const getSimilarPastPursuits = (opportunityId) =>
  request(`/opportunities/${opportunityId}/similar-past`)

export const saveSimilarPursuits = (opportunityId, similarPursuits) =>
  request(`/opportunities/${opportunityId}/similar-pursuits`, {
    method: 'PATCH',
    body: JSON.stringify({ similarPursuits })
  })

export const closeOpportunity = (opportunityId, payload) =>
  request(`/opportunities/${opportunityId}/close`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
