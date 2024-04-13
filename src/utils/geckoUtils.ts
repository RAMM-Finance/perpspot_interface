import { CHAIN_TO_NETWORK_ID } from 'hooks/usePoolsOHLC'

const geckoEndpoint = 'https://pro-api.coingecko.com/api/v3/onchain'

export const formatOhlcEndpoint = (
  address: string,
  currency: string,
  token: string,
  chainId: number,
  limit: number,
  timeframe: string
) => {
  const network = CHAIN_TO_NETWORK_ID[chainId]
  return `${geckoEndpoint}/networks/${network}/pools/${address}/ohlcv/${timeframe}?limit=${limit}&currency=${currency}&token=${token.toLowerCase()}`
}

export const formatFetchBarEndpoint = (
  address: string,
  timeframe: 'day' | 'hour' | 'minute',
  aggregate: string,
  before_timestamp: number,
  limit: number,
  currency: string,
  token: 'base' | 'quote',
  chainId: number
) => {
  const network = CHAIN_TO_NETWORK_ID[chainId] ?? 'arbitrum'
  return `${geckoEndpoint}/networks/${network}/pools/${address}/ohlcv/${timeframe}?aggregate=${aggregate}&before_timestamp=${before_timestamp}&limit=${limit}&currency=${currency}&token=${token}`
}

export const formatFetchLiveBarEndpoint = (
  address: string,
  timeframe: 'day' | 'hour' | 'minute',
  aggregate: string,
  currency: string,
  token: 'base' | 'quote',
  chainId: number
) => {
  const network = CHAIN_TO_NETWORK_ID[chainId] ?? 'arbitrum'
  return `${geckoEndpoint}/networks/${network}/pools/${address}/ohlcv/${timeframe}?aggregate=${aggregate}&currency=${currency}&token=${token}&limit=1`
}
