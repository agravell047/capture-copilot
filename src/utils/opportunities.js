export const formatTimestamp = (value) => {
  if (!value) {
    return 'Unknown time'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

export const formatUpdateType = (type = '') =>
  type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

export const getOpportunityName = (opportunity = {}) =>
  opportunity.name || opportunity.opportunityName || 'Untitled Opportunity'

export const getLatestAnalysis = (opportunity = {}) =>
  opportunity.latestAnalysis || opportunity

export const getRecommendationLabel = (opportunity = {}) =>
  getLatestAnalysis(opportunity)?.recommendation?.action || 'Pending'

export const getPwinScore = (opportunity = {}) =>
  getLatestAnalysis(opportunity)?.pWinScore?.score ?? null

export const estimateContractValue = (contractValue = '') => {
  switch (contractValue) {
    case '<5M':
      return 2_500_000
    case '5-50M':
      return 27_500_000
    case '50-200M':
      return 125_000_000
    case '200M+':
      return 250_000_000
    default:
      return 0
  }
}

export const formatUsdCompact = (value) => {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return '—'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(numeric)
}

export const formatContractValueBucket = (contractValue = '') => {
  switch (contractValue) {
    case '<5M':
      return '< $5M'
    case '5-50M':
      return '$5M - $50M'
    case '50-200M':
      return '$50M - $200M'
    case '200M+':
      return '$200M+'
    default:
      return contractValue || '—'
  }
}
