import { Interface } from '@ethersproject/abi'
import { defaultAbiCoder } from '@ethersproject/abi'
import { getCreate2Address } from '@ethersproject/address'
import { keccak256 } from '@ethersproject/solidity'
import { BigintIsh, Currency, Token } from '@uniswap/sdk-core'
import { abi as IUniswapV3PoolStateABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { abi as IUniswapV3PoolABI } from '../abis_v2/UniswapV3Pool.json'
// import { computePoolAddress } from '@uniswap/v3-sdk'
import { FeeAmount, Pool } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { SupportedChainId } from 'constants/chains'
import { utils } from 'ethers'
import JSBI from 'jsbi'
import { useMultipleContractSingleData, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useEffect, useMemo, useState } from 'react'

import {
  BORROW_INIT_CODE_HASH,
  LEVERAGE_INIT_CODE_HASH,
  LIQUITITY_INIT_CODE_HASH,
  POOL_INIT_CODE_HASH,
  V3_CORE_FACTORY_ADDRESSES,
} from '../constants/addresses'
import { IUniswapV3PoolStateInterface } from '../types/v3/IUniswapV3PoolState'
import { useLmtPoolManagerContract } from './useContract'
import axios from 'axios'
import { Pool24hVolumeQuery } from 'graphql/limitlessGraph/queries'
import { supportedChainId } from 'utils/supportedChainId'
import { Nullish } from '@uniswap/conedison/types'
import { query } from 'firebase/firestore'
import { getDecimalAndUsdValueData } from './useUSDPrice'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { useCurrency } from './Tokens'
const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateABI) as IUniswapV3PoolStateInterface
const POOL_INTERFACE_FOR_TICKSPACING = new Interface(IUniswapV3PoolABI) as IUniswapV3PoolStateInterface
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
  const { chainId } = useWeb3React()
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

  // console.log("POOL ADDRESSES", poolAddresses)
  const slot0s = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'slot0')
  const liquidities = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'liquidity')
  const tickSpacings = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE_FOR_TICKSPACING, 'tickSpacing')

  const filteredAddresses = poolAddresses.filter((item) => item !== '')
  // console.log('poolManager', JSON.stringify(poolManager))
  // console.log('filteredAddr', JSON.stringify(filteredAddresses))
  const poolParams = useSingleContractMultipleData(
    poolManager,
    'PoolParams',
    filteredAddresses.map((address) => [address])
    // poolAddresses.map((address) => [address])
  )

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const tokens = poolTokens[index]
      // console.log('22', tokens)

      // console.log('poolKey', _key, slot0s[index], liquidities[index], poolParams[index])
      if (!tokens) return [PoolState.INVALID, null, null]
      const [token0, token1, fee] = tokens
      // console.log('23')

      if (!slot0s[index]) return [PoolState.INVALID, null, null]
      const { result: slot0, loading: slot0Loading, valid: slot0Valid } = slot0s[index]
      // console.log('24')

      if (!liquidities[index]) return [PoolState.INVALID, null, null]
      const { result: liquidity, loading: liquidityLoading, valid: liquidityValid } = liquidities[index]
      // console.log('25')

      if (!tickSpacings[index]) return [PoolState.INVALID, null, null]
      const { result: tickSpacing, loading: tickSpacingLoading, valid: tickSpacingValid } = tickSpacings[index]

      if (!poolParams[index]) return [PoolState.INVALID, null, null]
      // console.log('26', poolParams[index])

      const { result: poolParam, loading: addedPoolLoading, valid: addedPoolValid } = poolParams[index]
      // console.log('conditions', tokens, slot0Valid, liquidityValid, addedPoolValid)
      if (!tokens || !slot0Valid || !liquidityValid || !addedPoolValid || !tickSpacingValid) return [PoolState.INVALID, null, null]
      // console.log('poolParam', poolParam)
      if (!poolParam) return [PoolState.NOT_ADDED, null, null]
      // console.log('2')
      if (!poolParam.maxSearchRight || poolParam.maxSearchRight.eq(0)) return [PoolState.NOT_ADDED, null, null]

      if (slot0Loading || liquidityLoading || tickSpacingLoading || addedPoolLoading) return [PoolState.LOADING, null, null]
      // console.log('4')

      if (!slot0 || !liquidity || !tickSpacing) return [PoolState.NOT_EXISTS, null, null]
      // console.log('5')

      if (!slot0.sqrtPriceX96 || slot0.sqrtPriceX96.eq(0)) return [PoolState.NOT_EXISTS, null, null]
      // console.log('6')

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
  const poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount]
  )

  return usePools(poolKeys)[0]
}

export interface PoolParams {
  minimumPremiumDeposit: BN
}

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

// export function useDailyFeeAPR(pools: any): { [key: string]: { dailyFeeAPR: number } } | null {
  
//   const { chainId } = useWeb3React()
//   const [dailyFeeAPRs, setDailyFeeAPRs] = useState<{ [key: string]: { dailyFeeAPR: number } } | null>(null)
//   const timestamp = Math.floor(Date.now() / 1000) - (86400 * 7)

//   const token0 = useCurrency

//   let url = 'https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-'
//   let network

//   if (chainId === SupportedChainId.ARBITRUM_ONE) {
//     url += 'arbitrum'
//     network = 'arbitrum-one'
//   } else if (chainId === SupportedChainId.BASE) {
//     url += 'base'
//     network = 'base'
//   } else {
//     url += 'arbitrum'
//     network = 'arbitrum-one'
//   }

//   useEffect(() => {
//     if (!pools || pools.length === 0) return;
//     const fetchData = async (pools: any) => {
//       // for (let i = 0; i < pools.length; i++) {
//       //   const token00 = pools[i]?.token0
//       //   const token11 = pools[i]?.token1
//       //   let result = await axios.post(url, {
//       //     query: Pool24hVolumeQuery(token00, token11, timestamp),
//       //   })
//       //   console.log(`RESLT ${i}!!!`, token00, token11, result)
//       //   const dailySnapshots = result?.data?.data?.liquidityPoolDailySnapshots
//       //   if (dailySnapshots) {
//       //     const sum = dailySnapshots.reduce((acc: any, curr: any) => acc + Number(curr.dailyVolumeUSD), 0)
//       //     console.log("SUM", sum)
//       //   }
//       // }

//       const promises = pools.map((pool: any) => {
        
//         return axios.post(url, {
//           query: Pool24hVolumeQuery(pool.token0, pool.token1, timestamp),
//         }).then(async (res: any) => {
          
//           const weeklySnapshots = res?.data?.data?.liquidityPoolDailySnapshots

//           if (weeklySnapshots) {

//             // assuming that the user's liquidity share is 1% of total share
            
//             // let user24hSwapVolumeRate
//             let liqShare = 0.01

//             // if (chainId === SupportedChainId.ARBITRUM_ONE) {
//             //   liqShare = 0.000001
//             // } else if (chainId === SupportedChainId.BASE) {
//             //   liqShare = 0.000001
//             // } else {
//             //   liqShare = 0.000001
//             // }
//             // let user24hSwapVolume = swapVolume24h// * user24hSwapVolumeRate
            
            
//             const [token0Data, token1Data] = await Promise.all([
//               getDecimalAndUsdValueData(chainId, pool.token0),
//               getDecimalAndUsdValueData(chainId, pool.token1)
//             ]);
            
//             const token0Price = token0Data?.lastPriceUSD
//             const token1Price = token1Data?.lastPriceUSD

//             const token0Decimals = token0Data?.decimals
//             const token1Decimals = token1Data?.decimals

//             const swapVolume24h = (weeklySnapshots.reduce((acc: any, curr: any) => acc + Number(curr.dailyVolumeUSD), 0)) / (7 * token1Price)
           
//             const estimatedDailyFee = swapVolume24h * (pool.fee / 10000) * liqShare

//             // WETH/USDC ARB/USDC
//             const poolPrice = token0Price / token1Price
            
//             const dailyFeeAPR = (estimatedDailyFee / poolPrice) * 365 * 100
//             const poolId = getPoolId(pool.token0, pool.token1, pool.fee)
//             return { [poolId]: dailyFeeAPR }
//           }
//           return null
//         }).catch(err => {
//           console.error(err)
//         })
//       })
//       const results = await Promise.all(promises)

//       const dailyFeeAPRsObj = results.reduce((acc, curr) => {
//         const key = Object.keys(curr)[0]
//         return { ...acc, [key] : {dailyFeeAPR: curr[key]}}
//       }, {})

//       setDailyFeeAPRs(dailyFeeAPRsObj)
//     }
//     if (pools) {
//       fetchData(pools)
//     }
//   }, [pools])
//   if (dailyFeeAPRs) {
//     return dailyFeeAPRs
//   }
//   return null
// }