import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useCallback, useMemo } from 'react'

export function useGetPairDetails(poolAddress?: string) {
  const endpoint = 'https://api.dexscreener.com/latest/dex/search?q='

  const fetchData = useCallback(async () => {
    if (!poolAddress) {
      return undefined
    }
    const result = axios.get(endpoint + poolAddress, {
      headers: {
        Accept: 'application/json',
      },
    })
    const response = await result
    const relevantData = {
      poolAddress: response.data.pairs[0].pairAddress,
      network: response.data.pairs[0].chainId,
      fdv: response.data.pairs[0].fdv,
      volume24: response.data.pairs[0].volume.h24,
      liquidity: response.data.pairs[0].liquidity.usd,
      creationTime: response.data.pairs[0].pairCreatedAt,
    }
    return relevantData
  }, [poolAddress])

  const { data, error, isLoading } = useQuery({
    queryKey: [poolAddress],
    queryFn: fetchData,
    enabled: !!poolAddress,
    refetchInterval: 1000 * 10,
  })

  return useMemo(() => {
    return {
      pairData: data,
      loading: isLoading,
      error,
    }
  }, [data, error, isLoading])
}
