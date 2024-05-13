import { defaultAbiCoder } from '@ethersproject/abi'
import { getCreate2Address } from '@ethersproject/address'
import { keccak256 } from '@ethersproject/solidity'
import { POOL_INIT_CODE_HASH, TickMath } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import axios from 'axios'
import { BigNumber as BN } from 'bignumber.js'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { switchChainAddress } from 'constants/fake-tokens'
import JSBI from 'jsbi'
import { useCallback, useMemo } from 'react'
import { useQuery } from 'react-query'
import { PoolKey, RawPoolKey } from 'types/lmtv2position'
import { formatOhlcEndpoint } from 'utils/geckoUtils'
import { getDefaultBaseQuote } from 'utils/getBaseQuote'
import { Q192 } from 'utils/lmtSDK/internalConstants'

interface HydratedPool {
  pool: RawPoolKey
  priceNow: number
  price24hAgo: number
  delta24h: number // decimal, multiply by 100% for percentage
  high24: number
  low24: number
  token0IsBase: boolean
  // the price data is inverted on retrieving the data from the gecko API
  invertedGecko: boolean
}

export const CHAIN_TO_NETWORK_ID: { [chainId: number]: string } = {
  [SupportedChainId.ARBITRUM_ONE]: 'arbitrum',
  [SupportedChainId.BASE]: 'base',
}

export const getPoolAddress = (tokenA: string, tokenB: string, fee: number, factoryAddress: string) => {
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

const tickToBN = (tick: number, decimals0: number, decimals1: number): BN => {
  const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick)
  const ratioX192 = JSBI.multiply(sqrtRatioX96, sqrtRatioX96)
  const price = new BN(ratioX192.toString()).div(Q192.toString())

  return price.shiftedBy(decimals0 - decimals1)
}

export function usePoolsOHLC(list: any[] | undefined): {
  poolsOHLC: Record<string, HydratedPool> | undefined
  loading: boolean
  error: any
} {
  // const quoter = useLmtQuoterContract()
  // const poolKeys = useSingleCallResult(quoter, 'getPoolKeys')

  // const list = useMemo(() => {
  //   if (poolKeys.error || !poolKeys.result) return []
  //   return poolKeys.result[0]
  // }, [poolKeys])

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

      const endpoint = formatOhlcEndpoint(poolAddress.toLocaleLowerCase(), 'token', 'base', adjustedChainId, 1, 'day')

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

    const parsed: Record<string, HydratedPool> = {}
    for (let i = 0; i < responses.length; i++) {
      if (responses[i].status !== 200) continue
      const data = responses[i].data.data.attributes.ohlcv_list
      const high24 = data[0][2]
      const low24 = data[0][3]
      const price24hAgo = data[0][1]
      const priceNow = data[0][4]
      const delta24h = (priceNow - price24hAgo) / price24hAgo

      const { token0, token1, fee, tick, decimals0, decimals1 } = list[i]

      const token0Price = tickToBN(tick, decimals0, decimals1)
      const token1Price = new BN(1).div(token0Price)

      const d0 = token0Price.minus(priceNow).abs()
      const d1 = token1Price.minus(priceNow).abs()

      const token0IsBase = d0.lt(d1)
      const [base, quote, inputInToken0] = getDefaultBaseQuote(token0, token1, chainId)
      const defaultBaseIsToken0 = base.toLowerCase() === token0.toLowerCase()

      const invert = token0IsBase !== defaultBaseIsToken0

      parsed[getPoolId(token0, token1, fee)] = {
        high24: invert ? 1 / low24 : high24,
        low24: invert ? 1 / high24 : low24,
        price24hAgo: invert ? 1 / price24hAgo : price24hAgo,
        priceNow: invert ? 1 / priceNow : priceNow,
        delta24h: invert ? (1 / priceNow - 1 / price24hAgo) / (1 / price24hAgo) : delta24h,
        pool: {
          token0,
          token1,
          fee,
        },
        token0IsBase: defaultBaseIsToken0,
        invertedGecko: invert,
      }
    }

    return parsed
  }, [list, chainId])

  const queryKey = useMemo(() => {
    return ['poolsOHLC', list?.length, chainId]
  }, [list, chainId])

  const { data, error, isLoading } = useQuery(queryKey, fetchData, {
    enabled: list && chainId ? list.length > 0 : false,
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
