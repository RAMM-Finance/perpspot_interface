import { BigNumber } from '@ethersproject/bignumber'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import {
  BORROW_MANAGER_FACTORY_ADDRESSES,
  LEVERAGE_MANAGER_FACTORY_ADDRESSES,
  LIQUIDITY_MANAGER_FACTORY_ADDRESSES,
} from 'constants/addresses'
import { CallStateResult, useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { BorrowLMTPositionDetails, LeverageLMTPositionDetails, RawPoolKey } from 'types/lmtv2position'

import { useGlobalStorageContract } from './useContract'
import { computeBorrowManagerAddress, computeLeverageManagerAddress, computeLiquidityManagerAddress } from './usePools'

function convertToBN(num: BigNumber, decimals: number) {
  return new BN(num.toString()).shiftedBy(-decimals)
}

// fetches all leveraged LMT positions for a given account
export function useLeveragedLMTPositions(account: string | undefined): {
  loading: boolean
  error: any
  positions: LeverageLMTPositionDetails[] | undefined
} {
  const { chainId } = useWeb3React()
  const globalStorage = useGlobalStorageContract()

  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(globalStorage, 'balanceOf', [
    account ?? undefined,
  ])

  // console.log("limitless", balanceLoading, balanceResult)

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
    if (account && !someTokenIdsLoading) {
      return tokenIdResults
        .map(({ result }) => result)
        .filter((result): result is CallStateResult => !!result)
        .map((result) => BigNumber.from(result[0]))
    }
    return undefined
  }, [account, tokenIdResults, someTokenIdsLoading])

  const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : []), [tokenIds])
  //console.log("inputs: ", inputs)

  const results = useSingleContractMultipleData(globalStorage, 'getPositionFromId', inputs)
  // console.log("calldataResults: ", results)

  const loading = useMemo(() => results.some(({ loading }) => loading), [results])
  const error = useMemo(() => results.some(({ error }) => error), [results])

  const positions = useMemo(() => {
    if (!loading && !error && tokenIds) {
      const allPositions = results.map((call, i) => {
        const tokenId = tokenIds[i]
        const result = call.result as CallStateResult
        const key = result.key
        const position = result.position
        return {
          tokenId: tokenId.toString(),
          leverageManagerAddress: computeLeverageManagerAddress({
            factoryAddress: LEVERAGE_MANAGER_FACTORY_ADDRESSES[chainId ?? 11155111],
            tokenA: key.token0,
            tokenB: key.token1,
            fee: key.fee,
          }),
          borrowManagerAddress: computeBorrowManagerAddress({
            factoryAddress: BORROW_MANAGER_FACTORY_ADDRESSES[chainId ?? 11155111],
            tokenA: key.token0,
            tokenB: key.token1,
            fee: key.fee,
          }),
          liquidityManagerAddress: computeLiquidityManagerAddress({
            factoryAddress: LIQUIDITY_MANAGER_FACTORY_ADDRESSES[chainId ?? 11155111],
            tokenA: key.token0,
            tokenB: key.token1,
            fee: key.fee,
          }),
          token0Address: key.token0,
          token1Address: key.token1,
          poolFee: key.fee,
          isToken0: position.isToken0,
          owner: position.owner,
          totalDebtOutput: convertToBN(position.totalDebt, 18),
          totalDebtInput: convertToBN(position.totalDebtInput, 18),
          recentPremium: convertToBN(position.recentPremium, 18),
          unusedPremium: convertToBN(position.unusedPremium, 18),
          openTime: convertToBN(position.openTime, 18),
          repayTime: convertToBN(position.repayTime, 18),
          isBorrow: position.isBorrow,
          poolAddress: position.pool,
          totalPosition: convertToBN(position.totalPosition, 18),
          initialCollateral: convertToBN(position.initCollateral, 18),
        }
      })
      const activePositions = allPositions.filter((position) => {
        return Number(position.openTime) !== 0
      })
      return activePositions
    }
    return undefined
  }, [results, tokenIds, chainId, error, loading])

  return {
    loading,
    positions,
    error,
  }
}

// fetches all borrow LMT positions for a given account
export function useBorrowLMTPositions(account: string | undefined): {
  loading: boolean
  error: any
  positions: BorrowLMTPositionDetails[] | undefined
} {
  return [] as any
}

export function useLeverageLMTPositionFromKeys(
  account: string | undefined,
  isToken0: boolean | undefined,
  key: RawPoolKey | undefined
): { loading: boolean; error: any; position: LeverageLMTPositionDetails | undefined } {
  return [] as any
}

export function useBorrowLMTPositionFromKeys(
  account: string | undefined,
  isToken0: boolean | undefined,
  key: RawPoolKey | undefined
): { loading: boolean; error: any; position: BorrowLMTPositionDetails | undefined } {
  return [] as any
}
