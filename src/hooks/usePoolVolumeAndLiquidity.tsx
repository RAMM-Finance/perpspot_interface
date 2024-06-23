import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { BigNumber as BN } from 'bignumber.js'
import { DefinedfiPairMetadataQuery } from 'graphql/limitlessGraph/queries'
import { useCallback, useMemo } from 'react'
import { useChainId } from 'wagmi'

const apiKeyV3 = process.env.REACT_APP_DEFINEDFI_KEY

export default function usePoolVolumeAndLiquidity(poolAddress?: string): {
  data: { volume: BN; liquidity: BN } | undefined
  loading: boolean
  error: any
} {
  const chainId = useChainId()

  const enabled = useMemo(() => {
    return Boolean(chainId && poolAddress)
  }, [chainId, poolAddress])

  const fetchData = useCallback(async () => {
    if (!chainId || !poolAddress) throw new Error('missing')
    const query: string = DefinedfiPairMetadataQuery(poolAddress, chainId)
    const response = await axios.post(
      'https://graph.defined.fi/graphql',
      {
        query,
      },
      {
        headers: {
          Accept: 'application/json',
          Authorization: apiKeyV3,
        },
      }
    )
    const liq = response?.data?.data?.pairMetadata?.liquidity
    const vol = response?.data?.data?.pairMetadata?.volume24
    return {
      liq,
      vol,
    }
  }, [chainId, poolAddress])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['pool', 'volume-liquidity', poolAddress],
    queryFn: fetchData,
    refetchOnMount: false,
    enabled,
  })

  return useMemo(() => {
    if (data) {
      return {
        data: {
          volume: new BN(data.vol),
          liquidity: new BN(data.liq),
        },
        loading: isLoading,
        error: isError,
      }
    }
    return {
      data: undefined,
      loading: isLoading,
      error: isError,
    }
  }, [data, isLoading, isError])
}
