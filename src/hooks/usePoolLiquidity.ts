import { gql } from '@apollo/client'
import { useQuery } from '@tanstack/react-query'
import { V3_CORE_FACTORY_ADDRESSES } from '@uniswap/sdk-core'
import { BigNumber as BN } from 'bignumber.js'
import { useLmtV2Subgraph } from 'graphql/limitlessGraph/limitlessClients'
import { useCallback, useMemo } from 'react'
import { useChainId } from 'wagmi'

import { computePoolAddress } from './usePools'
import { useAllPoolAndTokenPriceData } from './useUserPriceData'

const poolTokenAmountsQuery = gql`
  query poolLiquidity($address: String!) {
    pool(id: $address) {
      token0Above
      token1Below
    }
  }
`

export const usePoolTokenAmounts = (
  token0?: string,
  token1?: string,
  fee?: number
): {
  loading: boolean
  error: any
  data: [token0Above: BN, token1Below: BN] | undefined
} => {
  const client = useLmtV2Subgraph()
  const chainId = useChainId()
  const address = useMemo(() => {
    if (!token0 || !token1 || !fee) {
      return undefined
    } else {
      return computePoolAddress({
        factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
        tokenA: token0,
        tokenB: token1,
        fee,
      })
    }
  }, [token0, token1, fee])
  const queryKey = useMemo(() => {
    return address ? [address] : []
  }, [address])

  const simulate = useCallback(async () => {
    if (!client || !address) {
      throw new Error('missing params')
    }
    const result = (
      await client.query({
        query: poolTokenAmountsQuery,
        variables: { address: address.toLowerCase() },
      })
    ).data

    return result
  }, [address, client])

  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: simulate,
    refetchInterval: 4000,
    enabled: queryKey.length > 0,
    refetchOnMount: false,
  })

  return useMemo(() => {
    return {
      loading: isLoading,
      error,
      data: data ? [new BN(data.pool.token0Above), new BN(data.pool.token1Below)] : undefined,
    }
  }, [data, isLoading, error])
}

export const usePoolTVL = (
  token0?: string,
  token1?: string,
  fee?: number
): {
  loading: boolean
  tvl: BN | undefined
} => {
  const { data: tokenAmounts, loading: tokenLoading } = usePoolTokenAmounts(token0, token1, fee)
  const chainId = useChainId()
  const { tokens, loading } = useAllPoolAndTokenPriceData(chainId)
  const token0Usd = useMemo(() => {
    return tokens && token0 ? tokens[token0.toLowerCase()]?.usdPrice : undefined
  }, [tokens, token0])
  const token1Usd = useMemo(() => {
    return tokens && token1 ? tokens[token1.toLowerCase()]?.usdPrice : undefined
  }, [tokens, token1])

  return useMemo(() => {
    return {
      loading: loading || tokenLoading,
      tvl:
        token0Usd && token1Usd && tokenAmounts
          ? tokenAmounts[0].times(token0Usd).plus(tokenAmounts[1].times(token1Usd))
          : undefined,
    }
  }, [token0Usd, token1Usd, tokenAmounts])
}
