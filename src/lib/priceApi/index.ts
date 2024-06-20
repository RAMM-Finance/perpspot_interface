export function getTanTokenQueryKey(address: string, chainId: number) {
  return ['token', address.toLowerCase(), chainId]
}

export function getTanPoolQueryKey(address: string, chainId: number) {
  return ['pool', address.toLowerCase(), chainId]
}

/**
 *
 *
 * ideal
 * poollist all OHLC data
 * all token data, custom set the queryclient data, like modify the cache itself so that data is shared
 */
