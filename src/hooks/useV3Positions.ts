import { BigNumber } from '@ethersproject/bignumber'
import { CallStateResult, useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { PositionDetails } from 'types/position'

import { useGlobalStorageContract, useLeverageManagerContract, usePoolContract, useV3NFTPositionManagerContract } from './useContract'
import { LimitlessPositionDetails } from 'types/leveragePosition'
import { BigNumber as BN } from "bignumber.js"
import { Currency, Field } from '@uniswap/widgets'
import { useCurrency, useToken } from './Tokens'
import { FeeAmount } from '@uniswap/v3-sdk'
import { computeBorrowManagerAddress, computeLeverageManagerAddress, computeLiquidityManagerAddress, usePool } from './usePools'
import { BORROW_MANAGER_FACTORY_ADDRESSES, LEVERAGE_MANAGER_FACTORY_ADDRESSES, LIQUIDITY_MANAGER_FACTORY_ADDRESSES } from 'constants/addresses'
import { useWeb3React } from '@web3-react/core'
import _ from 'lodash'


interface UseV3PositionsResults {
  loading: boolean
  positions: PositionDetails[] | undefined
}

export function useLimitlessPositionFromKeys(account: string | undefined, manager: string | undefined, isToken0: boolean | undefined): {loading: boolean, position: LimitlessPositionDetails | undefined} {
  const { loading, positions } = useLimitlessPositions(account)
  const position = useMemo(() => {
    if (positions) {
      return positions.find(position => (position.leverageManagerAddress === manager || position.borrowManagerAddress === manager) && position.isToken0 === isToken0)
    }
    return undefined
  }
  , [positions, manager, isToken0])
  return {loading, position}
}

// hacked
export function useLimitlessPositions(account: string | undefined): {loading: boolean, positions: LimitlessPositionDetails[]} {
  const {chainId} = useWeb3React()
  const globalStorage = useGlobalStorageContract()

  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(globalStorage, 'balanceOf', [
    account ?? undefined,
  ])

  console.log("limitless", balanceLoading, balanceResult)

  // we don't expect any account balance to ever exceed the bounds of max safe int
  const accountBalance: number | undefined = balanceResult?.[0]?.toNumber()

  const tokenIdsArgs = useMemo(() => {
    if (accountBalance && account) {
      const tokenRequests = []
      for (let i = 0; i < accountBalance; i++) {
        tokenRequests.push([account, i])
      }
      return tokenRequests
    }
    return []
  }, [account, accountBalance])

  const tokenIdResults = useSingleContractMultipleData(globalStorage, 'tokenOfOwnerByIndex', tokenIdsArgs)
  const someTokenIdsLoading = useMemo(() => tokenIdResults.some(({ loading }) => loading), [tokenIdResults])

  const tokenIds = useMemo(() => {
    if (account) {
      return tokenIdResults
        .map(({ result }) => result)
        .filter((result): result is CallStateResult => !!result)
        .map((result) => BigNumber.from(result[0]))
    }
    return []
  }, [account, tokenIdResults])

  const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : []), [tokenIds])
  //console.log("inputs: ", inputs)
  
  const results = useSingleContractMultipleData(globalStorage, 'getPositionFromId', inputs)
  // console.log("calldataResults: ", results)

  const loading = useMemo(() => results.some(({ loading }) => loading), [results])
  const error = useMemo(() => results.some(({ error }) => error), [results])

  const positions = useMemo(() => {
    if (!loading && !error && tokenIds) {
      let allPositions =  _.map(results, (call, i ) => {
        const tokenId = tokenIds[i]
        const result = call.result as CallStateResult
        const key = result.key
        const position = result.position
        return {
          tokenId: tokenId.toString(),
          leverageManagerAddress: computeLeverageManagerAddress({
            factoryAddress: LEVERAGE_MANAGER_FACTORY_ADDRESSES[chainId ?? 80001],
            tokenA: key.token0,
            tokenB: key.token1,
            fee: (key.fee),
          }),
          borrowManagerAddress: computeBorrowManagerAddress({
            factoryAddress: BORROW_MANAGER_FACTORY_ADDRESSES[chainId ?? 80001],
            tokenA: key.token0,
            tokenB: key.token1,
            fee: (key.fee),
          }),
          liquidityManagerAddress: computeLiquidityManagerAddress({
            factoryAddress: LIQUIDITY_MANAGER_FACTORY_ADDRESSES[chainId ?? 80001],
            tokenA: key.token0,
            tokenB: key.token1,
            fee: (key.fee)
          }),
          isBorrow: position.isBorrow,
          token0Address: key.token0,
          token1Address: key.token1,
          poolFee: key.fee,
          totalPosition: convertBNToNum(position.totalPosition, 18),
          totalDebt: convertBNToNum(position.totalDebt, 18),
          totalDebtInput: convertBNToNum(position.totalDebtInput, 18),
          // creationPrice: convertBNToNum(position.creationPrice, 18),
          initialCollateral: convertBNToNum(position.initCollateral, 18),
          recentPremium: convertBNToNum(position.recentPremium, 18),
          unusedPremium: convertBNToNum(position.unusedPremium, 18),
          totalPremium: convertBNToNum(position.totalPremium, 18),
          isToken0: position.isToken0,
          openTime: position.openTime,
          repayTime: position.repayTime,
          // borrowInfo: position.borrowInfo.map((info: any) => ({ tick: info.tick, liquidity: convertBNToNum(info.liquidity, 18)})),
        }
      })

      let activePositions = _.filter(allPositions, (position) => {
        return Number(position.openTime) !== 0
      })
      return activePositions
    }
    return undefined
  }, [loading, error, results, tokenIds])
  return {
    loading: false,
    positions: positions ?? []
  }
}


export function convertBNToNum(num: BigNumber, decimals: number) {
  return new BN(num.toString()).shiftedBy(-decimals).toNumber()
}

export enum PositionState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID
}

export function useLimitlessPositionFromTokenId(tokenId: string | undefined): { loading: boolean, error: any, position: LimitlessPositionDetails | undefined} {
  const globalStorage = useGlobalStorageContract()
  const result = useSingleCallResult(globalStorage, 'getPositionFromId', [tokenId]);
  const loading = result.loading
  const error = result.error
  const { chainId } = useWeb3React()

  const position = useMemo(() => {
    if (!loading && !error && tokenId) {
      const state = result.result
      const key = state?.key
      const position = state?.position
      const _position = {
        tokenId,
        leverageManagerAddress: computeLeverageManagerAddress({
          factoryAddress: LEVERAGE_MANAGER_FACTORY_ADDRESSES[chainId ?? 80001],
          tokenA: key.token0,
          tokenB: key.token1,
          fee: (key.fee),
        }),
        borrowManagerAddress: computeBorrowManagerAddress({
          factoryAddress: BORROW_MANAGER_FACTORY_ADDRESSES[chainId ?? 80001],
          tokenA: key.token0,
          tokenB: key.token1,
          fee: (key.fee),
        }),
        liquidityManagerAddress: computeLiquidityManagerAddress({
          factoryAddress: LIQUIDITY_MANAGER_FACTORY_ADDRESSES[chainId ?? 80001],
          tokenA: key.token0,
          tokenB: key.token1,
          fee: (key.fee)
        }),
        token0Address: key.token0,
        token1Address: key.token1,
        poolFee: key.fee,
        totalPosition: convertBNToNum(position.totalPosition, 18),
        totalPositionRaw: position.isBorrow?position.totalDebtInput.toString(): position.totalPosition.toString(), 
        totalDebt: convertBNToNum(position.totalDebt, 18),
        totalDebtInput: convertBNToNum(position.totalDebtInput, 18),
        // creationPrice: convertBNToNum(position.creationPrice, 18),
        initialCollateral: convertBNToNum(position.initCollateral, 18),
        recentPremium: convertBNToNum(position.recentPremium, 18),
        totalPremium: convertBNToNum(position.totalPremium, 18),
        unusedPremium: convertBNToNum(position.unusedPremium, 18),
        isToken0: position.isToken0,
        openTime: position.openTime.toString(),
        repayTime: position.repayTime.toString(),
        isBorrow: position.isBorrow
        // borrowInfo: position.borrowInfo.map((info: any) => convertBNToNum(info, 18)),
      }
      return _position
    }
    return undefined
  },
     [
      loading,
      error,
      tokenId
    ])

  return {
    loading,
    error,
    position: position ?? undefined
  }
}

function useV3PositionsFromTokenIds(tokenIds: BigNumber[] | undefined): UseV3PositionsResults {
  const positionManager = useV3NFTPositionManagerContract()
  const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : []), [tokenIds])
  const results = useSingleContractMultipleData(positionManager, 'positions', inputs)

  const loading = useMemo(() => results.some(({ loading }) => loading), [results])
  const error = useMemo(() => results.some(({ error }) => error), [results])

  const positions = useMemo(() => {
    if (!loading && !error && tokenIds) {
      return results.map((call, i) => {
        const tokenId = tokenIds[i]
        const result = call.result as CallStateResult
        return {
          tokenId,
          fee: result.fee,
          feeGrowthInside0LastX128: result.feeGrowthInside0LastX128,
          feeGrowthInside1LastX128: result.feeGrowthInside1LastX128,
          liquidity: result.liquidity,
          nonce: result.nonce,
          operator: result.operator,
          tickLower: result.tickLower,
          tickUpper: result.tickUpper,
          token0: result.token0,
          token1: result.token1,
          tokensOwed0: result.tokensOwed0,
          tokensOwed1: result.tokensOwed1,
        }
      })
    }
    return undefined
  }, [loading, error, results, tokenIds])

  return {
    loading,
    positions: positions?.map((position, i) => ({ ...position, tokenId: inputs[i][0] })),
  }
}

interface UseV3PositionResults {
  loading: boolean
  position: PositionDetails | undefined
}


export function useV3PositionFromTokenId(tokenId: BigNumber | undefined): UseV3PositionResults {
  const position = useV3PositionsFromTokenIds(tokenId ? [tokenId] : undefined)
  return {
    loading: position.loading,
    position: position.positions?.[0],
  }
}

export function useV3Positions(account: string | null | undefined): UseV3PositionsResults {
  const positionManager = useV3NFTPositionManagerContract()

  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(positionManager, 'balanceOf', [
    account ?? undefined,
  ])

  console.log('balanceResult', balanceLoading, balanceResult)

  // we don't expect any account balance to ever exceed the bounds of max safe int
  const accountBalance: number | undefined = balanceResult?.[0]?.toNumber()

  const tokenIdsArgs = useMemo(() => {
    if (accountBalance && account) {
      const tokenRequests = []
      for (let i = 0; i < accountBalance; i++) {
        tokenRequests.push([account, i])
      }
      return tokenRequests
    }
    return []
  }, [account, accountBalance])

  const tokenIdResults = useSingleContractMultipleData(positionManager, 'tokenOfOwnerByIndex', tokenIdsArgs)
  const someTokenIdsLoading = useMemo(() => tokenIdResults.some(({ loading }) => loading), [tokenIdResults])

  const tokenIds = useMemo(() => {
    if (account) {
      return tokenIdResults
        .map(({ result }) => result)
        .filter((result): result is CallStateResult => !!result)
        .map((result) => BigNumber.from(result[0]))
    }
    return []
  }, [account, tokenIdResults])

  const { positions, loading: positionsLoading } = useV3PositionsFromTokenIds(tokenIds)

  return {
    loading: someTokenIdsLoading || balanceLoading || positionsLoading,
    positions,
  }
}
