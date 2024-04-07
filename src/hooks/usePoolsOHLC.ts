import { defaultAbiCoder } from '@ethersproject/abi'
import { getCreate2Address } from '@ethersproject/address'
import { keccak256 } from '@ethersproject/solidity'
import { POOL_INIT_CODE_HASH } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import axios from 'axios'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { switchChainAddress } from 'constants/fake-tokens'
import { useCallback, useMemo } from 'react'
import { useQuery } from 'react-query'
import { PoolKey, RawPoolKey } from 'types/lmtv2position'

interface HydratedPool {
  pool: RawPoolKey
  priceNow: number
  price24hAgo: number
  delta24h: number
  high24: number
  low24: number
  base?: string
  quote?: string
  token0IsBase?: boolean
}

const formatEndpoint = (address: string, currency: string, token: 'base' | 'quote') => {
  return `${endpoint}/networks/arbitrum/pools/${address}/ohlcv/day?limit=1&currency=${currency}&token=${token}`
}

const getPoolAddress = (tokenA: string, tokenB: string, fee: number, factoryAddress: string) => {
  const token0 = tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenA : tokenB
  const token1 = tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenB : tokenA
  return getCreate2Address(
    factoryAddress,
    keccak256(['bytes'], [defaultAbiCoder.encode(['address', 'address', 'uint24'], [token0, token1, fee])]),
    POOL_INIT_CODE_HASH
  )
}

function switchPoolChain(fromChainId: number, toChainId: number, pool: PoolKey): PoolKey {
  const tokenA = switchChainAddress(fromChainId, toChainId, pool.token0)
  const tokenB = switchChainAddress(fromChainId, toChainId, pool.token1)

  const token0 = tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenA : tokenB
  const token1 = tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenB : tokenA
  return {
    token0,
    token1,
    fee: pool.fee,
  }
}

const apiKey = process.env.REACT_APP_GECKO_API_KEY
const endpoint = 'https://pro-api.coingecko.com/api/v3/onchain'

export function usePoolsOHLC(list: { token0: string; token1: string; fee: number }[] | undefined): {
  poolsOHLC: Record<string, HydratedPool> | undefined
  loading: boolean
  error: any
} {
  const { chainId } = useWeb3React()

  const fetchData = useCallback(async () => {
    if (!list || !chainId || list.length === 0) throw new Error('No list or chainId')

    const results = []

    // fetch data
    for (let i = 0; i < list.length; i++) {
      let adjustedPool = list[i]
      let adjustedChainId = chainId
      if (chainId === SupportedChainId.BERA_ARTIO || chainId === SupportedChainId.LINEA) {
        adjustedPool = switchPoolChain(chainId, SupportedChainId.ARBITRUM_ONE, list[i] as PoolKey)
        adjustedChainId = SupportedChainId.ARBITRUM_ONE
      }

      const poolAddress = getPoolAddress(
        adjustedPool.token0,
        adjustedPool.token1,
        adjustedPool.fee,
        V3_CORE_FACTORY_ADDRESSES[adjustedChainId]
      )

      let denomination
      if (
        poolAddress === '0x2f5e87C9312fa29aed5c179E456625D79015299c' ||
        poolAddress === '0x0E4831319A50228B9e450861297aB92dee15B44F' ||
        poolAddress === '0xC6962004f452bE9203591991D15f6b388e09E8D0'
      ) {
        denomination = 'quote'
      } else {
        denomination = 'base'
      }

      const endpoint = formatEndpoint(poolAddress.toLocaleLowerCase(), 'token', denomination as 'base' | 'quote')

      results.push(
        axios.get(endpoint, {
          headers: {
            Accept: 'application/json',
            'x-cg-pro-api-key': apiKey,
          },
        })
      )
    }

    const responses = await Promise.all(results)

    // if any status is not 200, throw error
    for (let i = 0; i < responses.length; i++) {
      if (responses[i].status !== 200) throw new Error('Failed to fetch pool price data')
    }

    // parse data
    const parsed: Record<string, HydratedPool> = {}
    responses.forEach((res, i) => {
      const data = res.data.data.attributes.ohlcv_list
      const high24 = data[0][2]
      const low24 = data[0][3]
      const price24hAgo = data[0][1]
      const priceNow = data[0][4]
      const delta24h = (priceNow - price24hAgo) / price24hAgo
      const { token0, token1, fee } = list[i]
      let base = res?.data?.meta?.base?.address
      let quote = res?.data?.meta?.quote?.address
      const token0IsBase = base ? base?.toLowerCase() === token0.toLowerCase() : true

      if (chainId === SupportedChainId.BERA_ARTIO || chainId === SupportedChainId.LINEA) {
        base = switchChainAddress(SupportedChainId.ARBITRUM_ONE, chainId, base)
        quote = switchChainAddress(SupportedChainId.ARBITRUM_ONE, chainId, quote)
      }

      parsed[getPoolId(token0, token1, fee)] = {
        high24,
        low24,
        price24hAgo,
        priceNow,
        delta24h,
        pool: {
          token0,
          token1,
          fee,
        },
        base,
        quote,
        token0IsBase,
      }
    })
    return parsed
  }, [list, chainId])

  const queryKey = useMemo(() => {
    return ['poolsOHLC', list?.length]
  }, [list])

  const { data, error, isLoading } = useQuery(queryKey, fetchData, {
    enabled: list ? list.length > 0 : false,
    refetchInterval: 1000 * 10,
    keepPreviousData: true,
  })

  return useMemo(() => {
    return {
      poolsOHLC: data,
      loading: isLoading,
      error,
    }
  }, [data, isLoading, error])
}
