import { Interface } from '@ethersproject/abi'
import { defaultAbiCoder } from '@ethersproject/abi'
import { getCreate2Address } from '@ethersproject/address'
import { keccak256 } from '@ethersproject/solidity'
import { BigintIsh, Currency, Token } from '@uniswap/sdk-core'
import { abi as IUniswapV3PoolStateABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
// import { computePoolAddress } from '@uniswap/v3-sdk'
import { FeeAmount, Pool } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { SupportedChainId } from 'constants/chains'
import { utils } from 'ethers'
import JSBI from 'jsbi'
import { useMultipleContractSingleData, useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'

import {
  BORROW_INIT_CODE_HASH,
  LEVERAGE_INIT_CODE_HASH,
  LIQUITITY_INIT_CODE_HASH,
  POOL_INIT_CODE_HASH,
  V3_CORE_FACTORY_ADDRESSES,
} from '../constants/addresses'
import { IUniswapV3PoolStateInterface } from '../types/v3/IUniswapV3PoolState'
import { useLmtPoolManagerContract } from './useContract'
import { convertToBN } from './useV3Positions'

const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateABI) as IUniswapV3PoolStateInterface

// Classes are expensive to instantiate, so this caches the recently instantiated pools.
// This avoids re-instantiating pools as the other pools in the same request are loaded.
class PoolCache {
  // Evict after 128 entries. Empirically, a swap uses 64 entries.
  private static MAX_ENTRIES = 128

  // These are FIFOs, using unshift/pop. This makes recent entries faster to find.
  private static pools: Pool[] = []
  private static addresses: { key: string; address: string }[] = []

  static getPoolAddress(factoryAddress: string, tokenA: Token, tokenB: Token, fee: FeeAmount): string {
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
): [PoolState, Pool | null][] {
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

    return poolTokens.map((value) => value && PoolCache.getPoolAddress(v3CoreFactoryAddress, ...value))
  }, [chainId, poolTokens])

  const slot0s = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'slot0')
  const liquidities = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'liquidity')
  const poolParams = useSingleContractMultipleData(
    poolManager,
    'PoolParams',
    poolAddresses.map((address) => [address])
  )
  // console.log('poolAddresses', poolKeys[0], poolTokens, poolAddresses, 
  //   slot0s[0], liquidities[0], poolParams)

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const tokens = poolTokens[index]

      // console.log('poolKey', _key, slot0s[index], liquidities[index], poolParams[index])
      if (!tokens) return [PoolState.INVALID, null]
      const [token0, token1, fee] = tokens

      if (!slot0s[index]) return [PoolState.INVALID, null]
      const { result: slot0, loading: slot0Loading, valid: slot0Valid } = slot0s[index]

      if (!liquidities[index]) return [PoolState.INVALID, null]
      const { result: liquidity, loading: liquidityLoading, valid: liquidityValid } = liquidities[index]

      if (!poolParams[index]) return [PoolState.INVALID, null]

      const { result: poolParam, loading: addedPoolLoading, valid: addedPoolValid } = poolParams[index]

      if (!tokens || !slot0Valid || !liquidityValid || !addedPoolValid) return [PoolState.INVALID, null]
      if (!poolParam) return [PoolState.NOT_ADDED, null]
        // console.log('2')
      if (!poolParam.maxSearchRight || poolParam.maxSearchRight.eq(0)) return [PoolState.NOT_ADDED, null]

      if (slot0Loading || liquidityLoading || addedPoolLoading) return [PoolState.LOADING, null]
        // console.log('4')

      if (!slot0 || !liquidity) return [PoolState.NOT_EXISTS, null]
        // console.log('5')

      if (!slot0.sqrtPriceX96 || slot0.sqrtPriceX96.eq(0)) return [PoolState.NOT_EXISTS, null]
        // console.log('6')

      try {
        const pool = PoolCache.getPool(token0, token1, fee, slot0.sqrtPriceX96, liquidity[0], slot0.tick)
        return [PoolState.EXISTS, pool]
      } catch (error) {
        console.error('Error when constructing the pool', error)
        return [PoolState.NOT_EXISTS, null]
      }
    })
  }, [liquidities, poolKeys, slot0s, poolTokens, poolParams])
}

export function usePool(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined
): [PoolState, Pool | null] {
  const poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount]
  )
  return usePools(poolKeys)[0]
}

export interface PoolParams {
  minimumPremiumDeposit: BN
}

// struct PoolParam {
//   URateParam uParam;
//   uint256 maxURate;
//   uint256 maxSearchRight;
//   uint256 maxSearchLeft;
//   uint16 poolId; // pool id, represent index in the list of added pools (_poolList)
//   // AuctionParam auctionParams;
//   uint256 MIN_PREMIUM_DEPOSIT; // how much premiums should be deposited when trades are opened
// }
export function usePoolParams(pool: Pool | undefined): PoolParams | undefined {
  // getParams
  const poolManager = useLmtPoolManagerContract()
  const { chainId } = useWeb3React()

  const poolAddress = useMemo(() => {
    if (!pool) return undefined
    return PoolCache.getPoolAddress(
      V3_CORE_FACTORY_ADDRESSES[chainId ?? SupportedChainId.SEPOLIA],
      pool.token0,
      pool.token1,
      pool.fee
    )
  }, [chainId, pool])
  const { loading, error, result } = useSingleCallResult(poolManager, 'PoolParams', [poolAddress])

  return useMemo(() => {
    if (!result || loading || error) {
      return undefined
    } else {
      // console.log('huh',result.MIN_PREMIUM_DEPOSIT)

      return {
        minimumPremiumDeposit: convertToBN(result.MIN_PREMIUM_DEPOSIT, 18),
      }
    }
  }, [result, loading, error])
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
      keccak256(['bytes'], [defaultAbiCoder.encode(['address', 'address', 'uint24'], [tokenA, tokenB, fee])]),
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
