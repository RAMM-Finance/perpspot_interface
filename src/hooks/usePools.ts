import { Interface } from '@ethersproject/abi'
import { defaultAbiCoder } from '@ethersproject/abi'
import { getCreate2Address } from '@ethersproject/address'
import { keccak256 } from '@ethersproject/solidity'
import { useQuery } from '@tanstack/react-query'
import { BigintIsh, Currency, Token } from '@uniswap/sdk-core'
import IUniswapV3PoolStateABI from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
// import { computePoolAddress } from '@uniswap/v3-sdk'
import { FeeAmount, Pool } from '@uniswap/v3-sdk'
import axios from 'axios'
import { BigNumber as BN } from 'bignumber.js'
import { SupportedChainId } from 'constants/chains'
import { utils } from 'ethers'
import { Pool24hVolumeQuery } from 'graphql/limitlessGraph/queries'
import { GRAPH_API_KEY } from 'graphql/limitlessGraph/uniswapClients'
import JSBI from 'jsbi'
import { useMultipleContractSingleData, useSingleContractMultipleData } from 'lib/hooks/multicall'
// import { IUniswapV3PoolStateInterface } from '../types/v3/IUniswapV3PoolState'
import { IUniswapV3PoolStateInterface } from 'LmtTypes/src/uniswap/interfaces/pool/IUniswapV3PoolState'
import { useCallback, useMemo } from 'react'
import { tryParseLmtTick } from 'state/mint/v3/utils'
import { useChainId } from 'wagmi'

import IUniswapV3PoolABI from '../abis_v2/UniswapV3Pool.json'
import {
  BORROW_INIT_CODE_HASH,
  LEVERAGE_INIT_CODE_HASH,
  LIQUITITY_INIT_CODE_HASH,
  POOL_INIT_CODE_HASH,
  V3_CORE_FACTORY_ADDRESSES,
} from '../constants/addresses'
import { useLmtPoolManagerContract } from './useContract'
import { getDecimalAndUsdValueData } from './useUSDPrice'
const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateABI.abi) as IUniswapV3PoolStateInterface
const POOL_INTERFACE_FOR_TICKSPACING = new Interface(IUniswapV3PoolABI.abi) as IUniswapV3PoolStateInterface
export const POOL_INIT_CODE_HASH_2 = '0x5c6020674693acf03a04dccd6eb9e56f715a9006cab47fc1a6708576f6feb640'
// Classes are expensive to instantiate, so this caches the recently instantiated pools.
// This avoids re-instantiating pools as the other pools in the same request are loaded.
class PoolCache {
  // Evict after 128 entries. Empirically, a swap uses 64 entries.
  private static MAX_ENTRIES = 128

  // These are FIFOs, using unshift/pop. This makes recent entries faster to find.
  private static pools: Pool[] = []
  private static addresses: { key: string; address: string }[] = []

  static getPoolAddress(
    factoryAddress: string,
    tokenA: Token,
    tokenB: Token,
    fee: FeeAmount,
    initCodeHashManualOverride?: string
  ): string {
    if (this.addresses.length > this.MAX_ENTRIES) {
      this.addresses = this.addresses.slice(0, this.MAX_ENTRIES / 2)
    }

    const { address: addressA } = tokenA
    const { address: addressB } = tokenB
    const key = `${factoryAddress}:${addressA}:${addressB}:${fee.toString()}`
    const found = this.addresses.find((address) => address.key === key)
    if (found) return found.address

    const address = {
      key,
      address: computePoolAddress({
        factoryAddress,
        tokenA,
        tokenB,
        fee,
        initCodeHashManualOverride,
      }),
    }
    this.addresses.unshift(address)
    return address.address
  }

  static getPool(
    tokenA: Token,
    tokenB: Token,
    fee: FeeAmount,
    sqrtPriceX96: BigintIsh,
    liquidity: BigintIsh,
    tick: number
  ): Pool {
    if (this.pools.length > this.MAX_ENTRIES) {
      this.pools = this.pools.slice(0, this.MAX_ENTRIES / 2)
    }

    const found = this.pools.find(
      (pool) =>
        pool.token0 === tokenA &&
        pool.token1 === tokenB &&
        pool.fee === fee &&
        JSBI.EQ(pool.sqrtRatioX96, sqrtPriceX96) &&
        JSBI.EQ(pool.liquidity, liquidity) &&
        pool.tickCurrent === tick
    )
    if (found) return found

    const pool = new Pool(tokenA, tokenB, fee, sqrtPriceX96, liquidity, tick)
    this.pools.unshift(pool)
    return pool
  }
}

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
  NOT_ADDED,
}

export function usePools(
  poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][]
): [PoolState, Pool | null, number | null][] {
  const chainId = useChainId()
  const poolManager = useLmtPoolManagerContract()

  const poolTokens: ([Token, Token, FeeAmount] | undefined)[] = useMemo(() => {
    if (!chainId) return new Array(poolKeys.length)
    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = currencyA.wrapped
        const tokenB = currencyB.wrapped
        if (tokenA.equals(tokenB)) return undefined

        return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, feeAmount] : [tokenB, tokenA, feeAmount]
      }
      return undefined
    })
  }, [chainId, poolKeys])

  const poolAddresses: (string | undefined)[] = useMemo(() => {
    const v3CoreFactoryAddress = chainId && V3_CORE_FACTORY_ADDRESSES[chainId]
    if (!v3CoreFactoryAddress) return new Array(poolTokens.length)
    return poolTokens.map(
      (value) =>
        value &&
        PoolCache.getPoolAddress(
          v3CoreFactoryAddress,
          ...value,
          SupportedChainId.BERA_ARTIO == chainId
            ? '0x5c6020674693acf03a04dccd6eb9e56f715a9006cab47fc1a6708576f6feb640'
            : undefined
        )
    )
  }, [chainId, poolTokens])

  const slot0s = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'slot0')
  const liquidities = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'liquidity')
  const tickSpacings = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE_FOR_TICKSPACING, 'tickSpacing')

  const filteredAddresses = poolAddresses.filter((item) => item !== '')
  const poolParams = useSingleContractMultipleData(
    poolManager,
    'PoolParams',
    filteredAddresses.map((address) => [address])
    // poolAddresses.map((address) => [address])
  )

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const tokens = poolTokens[index]

      if (!tokens) return [PoolState.INVALID, null, null]
      const [token0, token1, fee] = tokens

      if (!slot0s[index]) return [PoolState.INVALID, null, null]

      const { result: slot0, loading: slot0Loading, valid: slot0Valid } = slot0s[index]

      if (!liquidities[index]) return [PoolState.INVALID, null, null]
      const { result: liquidity, loading: liquidityLoading, valid: liquidityValid } = liquidities[index]

      if (!tickSpacings[index]) return [PoolState.INVALID, null, null]
      const { result: tickSpacing, loading: tickSpacingLoading, valid: tickSpacingValid } = tickSpacings[index]

      if (!poolParams[index]) return [PoolState.INVALID, null, null]

      const { result: poolParam, loading: addedPoolLoading, valid: addedPoolValid } = poolParams[index]

      if (!tokens || !slot0Valid || !liquidityValid || !addedPoolValid || !tickSpacingValid)
        return [PoolState.INVALID, null, null]

      if (!poolParam) return [PoolState.NOT_ADDED, null, null]

      if (!poolParam.maxSearchRight || poolParam.maxSearchRight.eq(0)) return [PoolState.NOT_ADDED, null, null]

      if (slot0Loading || liquidityLoading || tickSpacingLoading || addedPoolLoading)
        return [PoolState.LOADING, null, null]

      if (!slot0 || !liquidity || !tickSpacing) return [PoolState.NOT_EXISTS, null, null]

      if (!slot0.sqrtPriceX96 || slot0.sqrtPriceX96.eq(0)) return [PoolState.NOT_EXISTS, null, null]

      try {
        const pool = PoolCache.getPool(token0, token1, fee, slot0.sqrtPriceX96, liquidity[0], slot0.tick)

        return [PoolState.EXISTS, pool, tickSpacing[0]]
      } catch (error) {
        console.error('Error when constructing the pool', error)
        return [PoolState.NOT_EXISTS, null, null]
      }
    })
  }, [liquidities, poolKeys, slot0s, poolTokens, poolParams, tickSpacings])
}

export function usePool(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined
): [PoolState, Pool | null, number | null] {
  const poolKey: [Currency | undefined, Currency | undefined, FeeAmount | undefined] = useMemo(
    () => [currencyA, currencyB, feeAmount],
    [currencyA, currencyB, feeAmount]
  )

  return usePools([poolKey])[0]
}

// export function usePoolTest(
//   currencyA: Currency | undefined,
//   currencyB: Currency | undefined,
//   feeAmount: FeeAmount | undefined
// ): [PoolState, Pool | null, number | null] {
//   const poolKey: [Currency | undefined, Currency | undefined, FeeAmount | undefined] = useMemo(
//     () => [currencyA, currencyB, feeAmount],
//     [currencyA, currencyB, feeAmount]
//   )

//   // const chainId = useChainId()

//   // const poolToken: [Token, Token, FeeAmount] | undefined = useMemo(() => {
//   //   if (!chainId) return undefined
//   //   if (currencyA && currencyB && feeAmount) {
//   //     const tokenA = currencyA.wrapped
//   //     const tokenB = currencyB.wrapped
//   //     if (tokenA.equals(tokenB)) return undefined

//   //     return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, feeAmount] : [tokenB, tokenA, feeAmount]
//   //   }
//   //   return undefined
//   // }, [chainId, poolKey])

//   // const poolAddress: string | undefined = useMemo(() => {
//   //   const v3CoreFactoryAddress = chainId && V3_CORE_FACTORY_ADDRESSES[chainId]
//   //   if (!v3CoreFactoryAddress) return undefined
//   //   return (
//   //     poolToken &&
//   //     PoolCache.getPoolAddress(
//   //       v3CoreFactoryAddress,
//   //       ...poolToken,
//   //       SupportedChainId.BERA_ARTIO == chainId
//   //         ? '0x5c6020674693acf03a04dccd6eb9e56f715a9006cab47fc1a6708576f6feb640'
//   //         : undefined
//   //     )
//   //   )
//   // }, [chainId, poolToken])

//   // const slot0Calldata = POOL_STATE_INTERFACE.encodeFunctionData('slot0')
//   // const liqCalldata = POOL_STATE_INTERFACE.encodeFunctionData('liquidity')
//   // const tickSpacingCalldata = POOL_INTERFACE_FOR_TICKSPACING.encodeFunctionData('tickSpacing')
//   // const poolParamsCalldata = useMemo(() => {
//   //   if (!poolAddress) return undefined
//   //   return PoolManagerSDK.INTERFACE.encodeFunctionData('PoolParams', [poolAddress])
//   // }, [poolAddress])

//   // const {
//   //   result: slot0,
//   //   error: slot0Error,
//   //   loading: slot0Loading,
//   // } = useContractCallV2(poolAddress, slot0Calldata, ['slot0'], false, true, (data: string) => {
//   //   return POOL_STATE_INTERFACE.decodeFunctionResult('slot0', data)
//   // })

//   // if (currencyB && currencyB?.symbol === 'SKI') {
//   //   // 0x0eA13439f0818BD0598C002D9337374a78D5FE47
//   //   console.log('zeke:', slot0, poolAddress)
//   // }

//   // const {
//   //   result: liquidity,
//   //   error: liqError,
//   //   loading: liqLoading,
//   // } = useContractCallV2(poolAddress, liqCalldata, ['liquidity'], false, true, (data: string) => {
//   //   return POOL_STATE_INTERFACE.decodeFunctionResult('liquidity', data)
//   // })

//   // const {
//   //   result: tickSpacing,
//   //   error: tickSpacingError,
//   //   loading: tickSpacingLoading,
//   // } = useContractCallV2(poolAddress, tickSpacingCalldata, ['tickSpacing'], false, true, (data: string) => {
//   //   return POOL_INTERFACE_FOR_TICKSPACING.decodeFunctionResult('tickSpacing', data)
//   // })

//   // const {
//   //   result: poolParam,
//   //   error: poolParamsError,
//   //   loading: poolParamsLoading,
//   // } = useContractCallV2(LMT_POOL_MANAGER, poolParamsCalldata, ['poolParams'], false, true, (data: string) => {
//   //   return PoolManagerSDK.INTERFACE.decodeFunctionResult('PoolParams', data)
//   // })

//   // return useMemo(() => {
//   //   const token = poolToken

//   //   if (!poolToken) return [PoolState.INVALID, null, null]
//   //   const [token0, token1, fee] = poolToken

//   //   if (!slot0) return [PoolState.INVALID, null, null]

//   //   if (!poolToken) return [PoolState.INVALID, null, null]

//   //   if (!poolParam) return [PoolState.NOT_ADDED, null, null]

//   //   if (!poolParam.maxSearchRight || poolParam.maxSearchRight.eq(0)) return [PoolState.NOT_ADDED, null, null]

//   //   if (!slot0 || !liquidity || !tickSpacing) return [PoolState.NOT_EXISTS, null, null]

//   //   if (!slot0.sqrtPriceX96 || slot0.sqrtPriceX96.eq(0)) return [PoolState.NOT_EXISTS, null, null]

//   //   try {
//   //     const pool = PoolCache.getPool(token0, token1, fee, slot0.sqrtPriceX96, liquidity[0], slot0.tick)

//   //     return [PoolState.EXISTS, pool, tickSpacing[0]]
//   //   } catch (error) {
//   //     console.error('Error when constructing the pool', error)
//   //     return [PoolState.NOT_EXISTS, null, null]
//   //   }
//   // }, [liquidity, slot0, poolToken, poolParam, tickSpacing])

//   return usePools([poolKey])[0]
// }

export function computePoolAddress({
  factoryAddress,
  tokenA,
  tokenB,
  fee,
  initCodeHashManualOverride,
}: {
  factoryAddress: string
  tokenA: Token | string
  tokenB: Token | string
  fee: FeeAmount
  initCodeHashManualOverride?: string
}): string {
  if (typeof tokenA === 'string' && typeof tokenB === 'string') {
    const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA]
    return getCreate2Address(
      factoryAddress,
      keccak256(['bytes'], [defaultAbiCoder.encode(['address', 'address', 'uint24'], [token0, token1, fee])]),
      initCodeHashManualOverride ?? POOL_INIT_CODE_HASH
    )
  } else if (tokenA instanceof Token && tokenB instanceof Token) {
    const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks
    return getCreate2Address(
      factoryAddress,
      keccak256(
        ['bytes'],
        [defaultAbiCoder.encode(['address', 'address', 'uint24'], [token0.address, token1.address, fee])]
      ),
      initCodeHashManualOverride ?? POOL_INIT_CODE_HASH
    )
  }
  return ''
}

export function computeOrderId(poolAddress: string, trader: string, isToken0: boolean, isAdd: boolean): string {
  return utils.solidityKeccak256(['address', 'address', 'bool', 'bool'], [poolAddress, trader, isToken0, isAdd])
}

// function getOrderId(address pool, address trader, bool positionIsToken0, bool isAdd)
// public
// pure
// returns (bytes32)
// {
// return keccak256(abi.encodePacked(pool, trader, positionIsToken0, isAdd));

export function computeBorrowManagerAddress({
  factoryAddress,
  tokenA,
  tokenB,
  fee,
  initCodeHashManualOverride,
}: {
  factoryAddress: string
  tokenA: string
  tokenB: string
  fee: FeeAmount
  initCodeHashManualOverride?: string
}): string {
  const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks
  return getCreate2Address(
    factoryAddress,
    keccak256(['bytes'], [defaultAbiCoder.encode(['address', 'address', 'uint24'], [token0, token1, fee])]),
    initCodeHashManualOverride ?? BORROW_INIT_CODE_HASH
  )
}

export function computeLeverageManagerAddress({
  factoryAddress,
  tokenA,
  tokenB,
  fee,
  initCodeHashManualOverride,
}: {
  factoryAddress: string
  tokenA: string
  tokenB: string
  fee: FeeAmount
  initCodeHashManualOverride?: string
}): string {
  const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks
  return getCreate2Address(
    factoryAddress,
    keccak256(['bytes'], [defaultAbiCoder.encode(['address', 'address', 'uint24'], [token0, token1, fee])]),
    initCodeHashManualOverride ?? LEVERAGE_INIT_CODE_HASH
  )
}

export function computeLiquidityManagerAddress({
  factoryAddress,
  tokenA,
  tokenB,
  fee,
  initCodeHashManualOverride,
}: {
  factoryAddress: string
  tokenA: string
  tokenB: string
  fee: FeeAmount
  initCodeHashManualOverride?: string
}): string {
  const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks
  return getCreate2Address(
    factoryAddress,
    keccak256(['bytes'], [defaultAbiCoder.encode(['address', 'address', 'uint24'], [token0, token1, fee])]),
    initCodeHashManualOverride ?? LIQUITITY_INIT_CODE_HASH
  )
}

const getPoolTicks = async (
  poolAddress: string,
  tickLower: number,
  tickUpper: number,
  page: number,
  chainId: number | undefined
) => {
  let url = `https://gateway-arbitrum.network.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/FQ6JYszEKApsBpAmiHesRsd9Ygc6mzmpNRANeVQFYoVX`
  if (chainId === SupportedChainId.BASE) {
    url = `https://gateway-arbitrum.network.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/FUbEPQw1oMghy39fwWBFY5fE6MXPXZQtjncQy2cXdrNS`
  }

  const query = `{
    ticks(first: 1000, skip: ${
      page * 1000
    }, where: { pool: "${poolAddress}" index_gte: "${tickLower}" index_lte: "${tickUpper}" }, orderBy: liquidityGross) {
      liquidityGross
      index
    }
  }`

  const { data } = await axios({
    url,
    method: 'post',
    data: {
      query,
    },
  })

  return data?.data?.ticks
}

const getAvgTradingVolume = async (poolAddress: string, chainId: number | undefined) => {
  const days = 7
  const timestamp = Math.floor(Date.now() / 1000) - 86400 * days
  const url = `https://gateway-arbitrum.network.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/FUbEPQw1oMghy39fwWBFY5fE6MXPXZQtjncQy2cXdrNS`

  const data = await axios({
    url,
    method: 'post',
    data: {
      query: Pool24hVolumeQuery(poolAddress, timestamp),
    },
  })

  const volumes = data?.data?.data?.liquidityPool.dailySnapshots.map((ele: any) => Number(ele.dailyVolumeUSD))

  const volume24h = volumes.reduce((acc: number, curr: number) => acc + curr, 0) / 7

  return volume24h
}

const getLiquidityFromTick = (poolTicks: any[]) => {
  let liquidity = new BN(0)

  for (let i = 0; i < poolTicks.length; i++) {
    liquidity = liquidity.plus(new BN(poolTicks[i].liquidityGross))
  }

  return liquidity
}

const initPair = async (poolAddress: string, tickLower: number, tickUpper: number, chainId: number | undefined) => {
  const [poolTicks0, poolTicks1, poolTicks2, volume24h] = await Promise.all([
    getPoolTicks(poolAddress, tickLower, tickUpper, 0, chainId),
    getPoolTicks(poolAddress, tickLower, tickUpper, 1, chainId),
    getPoolTicks(poolAddress, tickLower, tickUpper, 2, chainId),
    getAvgTradingVolume(poolAddress, chainId),
  ])

  const poolTicks = [...poolTicks0, ...poolTicks1, ...poolTicks2]

  return { poolTicks, volume24h }
}

const aprDataPreperation = async (
  fee: number,
  tickLower: number,
  tickUpper: number,
  poolAddress: string,
  chainId: number | undefined
) => {
  const { poolTicks, volume24h } = await initPair(poolAddress, tickLower, tickUpper, chainId)
  const liquidityGross = getLiquidityFromTick(poolTicks)

  return {
    poolTicks,
    volume24h,
    liquidityGross,
  }
}

const getTokenAmountsFromDepositAmounts = (
  p: number,
  pl: number,
  pu: number,
  token0PriceUSD: number,
  token1PriceUSD: number,
  depositAmountUSD: number
): { deltaX: number; deltaY: number } => {
  const deltaL =
    depositAmountUSD /
    ((Math.sqrt(p) - Math.sqrt(pl)) * token1PriceUSD + (1 / Math.sqrt(p) - 1 / Math.sqrt(pu)) * token0PriceUSD)

  let deltaY = deltaL * (Math.sqrt(p) - Math.sqrt(pl))

  if (deltaY * token1PriceUSD < 0) deltaY = 0
  if (deltaY * token1PriceUSD > depositAmountUSD) deltaY = depositAmountUSD / token1PriceUSD

  let deltaX = deltaL * (1 / Math.sqrt(p) - 1 / Math.sqrt(pu))

  if (deltaX * token0PriceUSD < 0) deltaX = 0
  if (deltaX * token0PriceUSD > depositAmountUSD) deltaX = depositAmountUSD / token0PriceUSD

  return { deltaX, deltaY }
}

const calcLiquidityX96 = (
  p: number,
  pl: number,
  pu: number,
  deltaX: number,
  deltaY: number,
  token0Decimals: number,
  token1Decimals: number
): number => {
  const q96 = 2 ** 96
  const price_to_sqrtp = (p: number) => Math.sqrt(p) * q96

  const liquidity0 = (amount: number, pa: number, pb: number) => {
    if (pa > pb) {
      const tmp = pa
      pa = pb
      pb = tmp
    }
    return (amount * (pa * pb)) / q96 / (pb - pa)
  }

  const liquidity1 = (amount: number, pa: number, pb: number) => {
    if (pa > pb) {
      const tmp = pa
      pa = pb
      pb = tmp
    }
    return (amount * q96) / (pb - pa)
  }

  const decimal0: number = 10 ** token0Decimals
  const decimal1: number = 10 ** token1Decimals

  const amount_0: number = deltaX * decimal0
  const amount_1: number = deltaY * decimal1

  const sqrtp_low: number = price_to_sqrtp(pl)
  const sqrtp_cur: number = price_to_sqrtp(p)
  const sqrtp_upp: number = price_to_sqrtp(pu)

  const liq0 = liquidity0(amount_0, sqrtp_cur, sqrtp_upp)
  const liq1 = liquidity1(amount_1, sqrtp_cur, sqrtp_low)

  const liq = Math.min(liq0, liq1)
  return liq
}

const getEstimateFee = (
  liquidityDelta: number,
  liquidityGross: BN,
  volume24h: number,
  feeTierPercentage: number
): number => {
  const liquidityPercentage: number = liquidityDelta / (liquidityGross.toNumber() + liquidityDelta) //0.01 //
  return feeTierPercentage * volume24h * liquidityPercentage
}

const feeAprEstimation = (position: Position, liquidityGross: BN, volume24h: number): any => {
  const p: number = position.currentPrice
  const pl: number = position.lower
  const pu: number = position.upper
  const { deltaX, deltaY } = getTokenAmountsFromDepositAmounts(
    p,
    pl,
    pu,
    position.token0PriceUSD,
    position.token1PriceUSD,
    position.amount
  )
  const liquidityDelta: number = calcLiquidityX96(
    p,
    pl,
    pu,
    deltaX,
    deltaY,
    position.token0Decimals,
    position.token1Decimals
  )

  const feeTierPercentage: number = Number(position.fee) / 10000 / 100

  const liqGross = liquidityGross

  const estimatedFee: number =
    p >= pl && p <= pu ? getEstimateFee(liquidityDelta, liqGross, volume24h, feeTierPercentage) : 0

  return {
    estimatedFee,
    token0: { amount: deltaX, priceUSD: deltaX * position.token0PriceUSD },
    token1: { amount: deltaY, priceUSD: deltaY * position.token1PriceUSD },
  }
}

const estimateAPR = (
  position: Position,
  // poolTicks: any[],
  liquidityGross: BN,
  volume24h: number
): any => {
  const est_result = feeAprEstimation(position, liquidityGross, volume24h)

  const fee_est = est_result.estimatedFee
  const apy = ((fee_est * 365) / position.amount) * 100
  const dailyIncome = fee_est

  return { apy, dailyIncome }
}

interface Position {
  currentPrice: number
  token0PriceUSD: number
  token1PriceUSD: number
  token0Decimals: number
  token1Decimals: number
  lower: number
  upper: number
  amount: number
  fee: number
}

export function useEstimatedAPR(
  token0: Currency | null | undefined,
  token1: Currency | null | undefined,
  pool: Pool | null,
  tickSpacing: number | null,
  price: number | undefined,
  amountUSD: number,
  token0Range?: number,
  token1Range?: number,
  usdPriceData?: {
    [token: string]: {
      usdPrice: number
    }
  }
): number {
  const chainId = useChainId()

  const fetchData = useCallback(async () => {
    // when querying multiple est apr, usdPriceData is needed in order to avoid massive api call
    // for single data, use getDecimalAndUsdPriceData in this function
    if (
      token0 &&
      token1 &&
      pool &&
      tickSpacing &&
      amountUSD &&
      token0.wrapped.address &&
      token1.wrapped.address // &&
      // usdPriceData &&
      // usdPriceData[token1.wrapped.address.toLowerCase()] &&
      // usdPriceData[token0.wrapped.address.toLowerCase()]
    ) {
      const amount = amountUSD
      let token0PriceUSD: number
      let token1PriceUSD: number
      let token0Decimals: number
      let token1Decimals: number
      if (usdPriceData) {
        token0PriceUSD = usdPriceData[token0.wrapped.address.toLowerCase()].usdPrice
        token1PriceUSD = usdPriceData[token1.wrapped.address.toLowerCase()].usdPrice

        token0Decimals = token0?.wrapped.decimals
        token1Decimals = token1?.wrapped.decimals
      } else {
        const [token0Res, token1Res] = await Promise.all([
          getDecimalAndUsdValueData(chainId, token0?.wrapped.address),
          getDecimalAndUsdValueData(chainId, token1?.wrapped.address),
        ])

        token0PriceUSD = parseFloat(token0Res.lastPriceUSD)
        token1PriceUSD = parseFloat(token1Res.lastPriceUSD)
        token0Decimals = token0Res.decimals
        token1Decimals = token1Res.decimals
      }
      if (!price) return

      let lowerPrice = price
      let upperPrice = price

      if (!token0Range || !token1Range) {
        lowerPrice = lowerPrice * 0.8
        upperPrice = upperPrice * 1.2
      } else {
        lowerPrice = lowerPrice * token0Range
        upperPrice = upperPrice * token1Range
      }

      if (lowerPrice > upperPrice) [lowerPrice, upperPrice] = [upperPrice, lowerPrice]

      let lowerTick = tryParseLmtTick(token0.wrapped, token1.wrapped, pool.fee, lowerPrice.toString(), tickSpacing)
      let upperTick = tryParseLmtTick(token0.wrapped, token1.wrapped, pool.fee, upperPrice.toString(), tickSpacing)

      if (lowerTick && upperTick) {
        if (lowerTick > upperTick) [lowerTick, upperTick] = [upperTick, lowerTick]

        const position: Position = {
          currentPrice: price,
          token0PriceUSD,
          token1PriceUSD,
          token0Decimals,
          token1Decimals,
          lower: lowerPrice,
          upper: upperPrice,
          amount,
          fee: parseInt(pool.fee.toString()),
        }

        const v3CoreFactoryAddress = chainId && V3_CORE_FACTORY_ADDRESSES[chainId]
        if (v3CoreFactoryAddress && lowerTick && upperTick) {
          const poolAddress = computePoolAddress({
            factoryAddress: v3CoreFactoryAddress,
            tokenA: token0.wrapped,
            tokenB: token1.wrapped,
            fee: pool.fee,
          })

          const { volume24h, liquidityGross } = await aprDataPreperation(
            pool.fee,
            lowerTick,
            upperTick,
            poolAddress,
            chainId
          )

          try {
            const { apy } = estimateAPR(position, liquidityGross, volume24h)
            return apy
          } catch (err) {
            console.error(
              err,
              'POSITION' + position,
              // 'POOLTICKS' + poolTicks,
              'LIQUIDITY GROSS' + liquidityGross.toNumber(),
              'volume' + volume24h,
              token0.symbol,
              token1.symbol,
              'POOLADDRESS' + poolAddress
            )
          }
        }
      }
    }
    return 0
  }, [token0, token1, pool, tickSpacing, amountUSD, token0Range, token1Range, usdPriceData])

  const enabled = useMemo(() => {
    return Boolean(
      token0 && token1 && pool && tickSpacing && amountUSD && token0.wrapped.address && token1.wrapped.address //&&
      // usdPriceData &&
      // usdPriceData[token0.wrapped.address.toLowerCase()] &&
      // usdPriceData[token1.wrapped.address.toLowerCase()]
    )
  }, [token0, token1, pool, tickSpacing, amountUSD, token0Range, token1Range, usdPriceData])

  const queryKey = useMemo(() => {
    if (enabled) {
      return [
        'apr',
        pool?.fee,
        token0?.wrapped.address,
        token1?.wrapped.address,
        amountUSD,
        token0Range ?? 'defaultToken0Range',
        token1Range ?? 'defaultToken1Range',
        usdPriceData ? 'hasUsdPriceData' : 'noData',
      ]
    }
    return []
  }, [enabled, amountUSD, token0Range, token1Range, usdPriceData])

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: fetchData,
    enabled,
    refetchOnMount: false,
    staleTime: 25 * 1000,
  })

  // const [estimatedAPR, setEstimatedAPR] = useState<number>(0)
  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (token0 && token1 && pool && tickSpacing && token0.wrapped.address && token1.wrapped.address && usdPriceData) {
  //       const amount = amountUSD
  //       let token0PriceUSD: number
  //       let token1PriceUSD: number
  //       let token0Decimals: number
  //       let token1Decimals: number
  //       if (usdPriceData) {
  //         token0PriceUSD = usdPriceData[token0.wrapped.address.toLowerCase()].usdPrice
  //         token1PriceUSD = usdPriceData[token1.wrapped.address.toLowerCase()].usdPrice

  //         token0Decimals = token0?.wrapped.decimals
  //         token1Decimals = token1?.wrapped.decimals
  //       } else {
  //         const [token0Res, token1Res] = await Promise.all([
  //           getDecimalAndUsdValueData(chainId, token0?.wrapped.address),
  //           getDecimalAndUsdValueData(chainId, token1?.wrapped.address),
  //         ])

  //         token0PriceUSD = parseFloat(token0Res.lastPriceUSD)
  //         token1PriceUSD = parseFloat(token1Res.lastPriceUSD)
  //         token0Decimals = token0Res.decimals
  //         token1Decimals = token1Res.decimals
  //       }
  //       if (!price) return

  //       let lowerPrice = price
  //       let upperPrice = price

  //       if (!token0Range || !token1Range) {
  //         lowerPrice = lowerPrice * 0.8
  //         upperPrice = upperPrice * 1.2
  //       } else {
  //         lowerPrice = lowerPrice * token0Range
  //         upperPrice = upperPrice * token1Range
  //       }

  //       if (lowerPrice > upperPrice) [lowerPrice, upperPrice] = [upperPrice, lowerPrice]

  //       let lowerTick = tryParseLmtTick(token0.wrapped, token1.wrapped, pool.fee, lowerPrice.toString(), tickSpacing)
  //       let upperTick = tryParseLmtTick(token0.wrapped, token1.wrapped, pool.fee, upperPrice.toString(), tickSpacing)

  //       if (lowerTick && upperTick) {
  //         if (lowerTick > upperTick) [lowerTick, upperTick] = [upperTick, lowerTick]

  //         const position: Position = {
  //           currentPrice: price,
  //           token0PriceUSD,
  //           token1PriceUSD,
  //           token0Decimals,
  //           token1Decimals,
  //           lower: lowerPrice,
  //           upper: upperPrice,
  //           amount,
  //           fee: parseInt(pool.fee.toString()),
  //         }

  //         const v3CoreFactoryAddress = chainId && V3_CORE_FACTORY_ADDRESSES[chainId]
  //         if (v3CoreFactoryAddress && lowerTick && upperTick) {
  //           const poolAddress = computePoolAddress({
  //             factoryAddress: v3CoreFactoryAddress,
  //             tokenA: token0.wrapped,
  //             tokenB: token1.wrapped,
  //             fee: pool.fee,
  //           })

  //           const { volume24h, liquidityGross } = await aprDataPreperation(
  //             pool.fee,
  //             lowerTick,
  //             upperTick,
  //             poolAddress,
  //             chainId
  //           )

  //           try {
  //             const { apy } = estimateAPR(position, liquidityGross, volume24h)
  //             setEstimatedAPR(apy)
  //           } catch (err) {
  //             console.error(
  //               err,
  //               'POSITION' + position,
  //               // 'POOLTICKS' + poolTicks,
  //               'LIQUIDITY GROSS' + liquidityGross.toNumber(),
  //               'volume' + volume24h,
  //               token0.symbol,
  //               token1.symbol,
  //               'POOLADDRESS' + poolAddress
  //             )
  //           }
  //         }
  //       }
  //     }
  //   }
  //   fetchData()
  // }, [token0, token1, pool, tickSpacing, price, amountUSD, token0Range, token1Range])

  return useMemo(() => {
    if (isError) return 0
    return data
  }, [data, isLoading, isError])
}
