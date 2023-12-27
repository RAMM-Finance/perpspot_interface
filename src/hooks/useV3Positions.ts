import { BigNumber } from '@ethersproject/bignumber'
import { BigNumber as BN } from 'bignumber.js'
import { CallStateResult, useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { useEffect, useMemo, useState } from 'react'
import { PositionDetails } from 'types/position'

import { useDataProviderContract, useLmtNFTPositionManager, useV3NFTPositionManagerContract } from './useContract'

interface UseV3PositionsResults {
  loading: boolean
  positions: PositionDetails[] | undefined
}

// export function useLimitlessPositionFromKeys(
//   account: string | undefined,
//   manager: string | undefined,
//   isToken0: boolean | undefined,
//   isBorrow: boolean
// ): { loading: boolean; position: LimitlessPositionDetails | undefined } {
//   const { loading, positions } = useLimitlessPositions(account)
//   // console.log("positions", positions)
//   const position = useMemo(() => {
//     if (positions) {
//       return positions.find(
//         (position) =>
//           (isBorrow
//             ? position.isBorrow && position.borrowManagerAddress === manager
//             : !position.isBorrow && position.leverageManagerAddress === manager) && position.isToken0 === isToken0
//       )
//     }
//     return undefined
//   }, [positions, manager, isToken0, isBorrow])
//   return { loading, position }
// }

// hacked
// export function useLimitlessPositions(account: string | undefined): {
//   loading: boolean
//   positions: LimitlessPositionDetails[] | undefined
// } {
//   const { chainId } = useWeb3React()
//   const globalStorage = useGlobalStorageContract()

//   const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(globalStorage, 'balanceOf', [
//     account ?? undefined,
//   ])

//   // console.log("limitless", balanceLoading, balanceResult)

//   // we don't expect any account balance to ever exceed the bounds of max safe int
//   const accountBalance: number | undefined = balanceResult?.[0]?.toNumber()

//   const tokenIdsArgs = useMemo(() => {
//     if (accountBalance && account) {
//       const tokenRequests = []
//       for (let i = 0; i < accountBalance; i++) {
//         tokenRequests.push([account, i])
//       }
//       return tokenRequests
//     }
//     return []
//   }, [account, accountBalance])

//   const tokenIdResults = useSingleContractMultipleData(globalStorage, 'tokenOfOwnerByIndex', tokenIdsArgs)
//   const someTokenIdsLoading = useMemo(() => tokenIdResults.some(({ loading }) => loading), [tokenIdResults])

//   const tokenIds = useMemo(() => {
//     if (account && !someTokenIdsLoading) {
//       return tokenIdResults
//         .map(({ result }) => result)
//         .filter((result): result is CallStateResult => !!result)
//         .map((result) => BigNumber.from(result[0]))
//     }
//     return undefined
//   }, [account, tokenIdResults, someTokenIdsLoading])

//   const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : []), [tokenIds])
//   //console.log("inputs: ", inputs)

//   const results = useSingleContractMultipleData(globalStorage, 'getPositionFromId', inputs)
//   // console.log("calldataResults: ", results)

//   const loading = useMemo(() => results.some(({ loading }) => loading), [results])
//   const error = useMemo(() => results.some(({ error }) => error), [results])

//   const positions = useMemo(() => {
//     if (!loading && !error && tokenIds) {
//       const allPositions = results.map((call, i) => {
//         const tokenId = tokenIds[i]
//         const result = call.result as CallStateResult
//         const key = result.key
//         const position = result.position
//         return {
//           tokenId: tokenId.toString(),
//           leverageManagerAddress: computeLeverageManagerAddress({
//             factoryAddress: LEVERAGE_MANAGER_FACTORY_ADDRESSES[chainId ?? 11155111],
//             tokenA: key.token0,
//             tokenB: key.token1,
//             fee: key.fee,
//           }),
//           borrowManagerAddress: computeBorrowManagerAddress({
//             factoryAddress: BORROW_MANAGER_FACTORY_ADDRESSES[chainId ?? 11155111],
//             tokenA: key.token0,
//             tokenB: key.token1,
//             fee: key.fee,
//           }),
//           liquidityManagerAddress: computeLiquidityManagerAddress({
//             factoryAddress: LIQUIDITY_MANAGER_FACTORY_ADDRESSES[chainId ?? 11155111],
//             tokenA: key.token0,
//             tokenB: key.token1,
//             fee: key.fee,
//           }),
//           isBorrow: position.isBorrow,
//           token0Address: key.token0,
//           token1Address: key.token1,
//           poolFee: key.fee,
//           totalPosition: convertToBN(position.totalPosition, 18),
//           totalDebt: convertToBN(position.totalDebt, 18),
//           totalDebtInput: convertToBN(position.totalDebtInput, 18),
//           // creationPrice: convertBNToNum(position.creationPrice, 18),
//           initialCollateral: convertToBN(position.initCollateral, 18),
//           recentPremium: convertToBN(position.recentPremium, 18),
//           unusedPremium: convertToBN(position.unusedPremium, 18),
//           totalPremium: convertToBN(position.totalPremium, 18),
//           isToken0: position.isToken0,
//           openTime: position.openTime,
//           repayTime: position.repayTime,
//           // borrowInfo: position.borrowInfo.map((info: any) => ({ tick: info.tick, liquidity: convertBNToNum(info.liquidity, 18)})),
//         }
//       })

//       const activePositions = allPositions.filter((position) => {
//         return Number(position.openTime) !== 0
//       })
//       return activePositions
//     }
//     return undefined
//   }, [results, tokenIds, chainId, error, loading])

//   return {
//     loading,
//     positions,
//   }
// }

export function convertBNToNum(num: BigNumber, decimals: number) {
  return new BN(num.toString()).shiftedBy(-decimals).toNumber()
}

export function convertToBN(num: BigNumber, decimals: number) {
  return new BN(num.toString()).shiftedBy(-decimals)
}

export enum PositionState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

// export function useLimitlessPositionFromTokenId(tokenId: string | undefined): {
//   loading: boolean
//   error: any
//   position: LimitlessPositionDetails | undefined
// } {
//   const globalStorage = useGlobalStorageContract()
//   const result = useSingleCallResult(globalStorage, 'getPositionFromId', [tokenId])
//   const loading = result.loading
//   const error = result.error
//   const { chainId } = useWeb3React()

//   const position = useMemo(() => {
//     if (!loading && !error && tokenId) {
//       const state = result.result
//       const key = state?.key
//       const position = state?.position
//       const _position = {
//         tokenId,
//         leverageManagerAddress: computeLeverageManagerAddress({
//           factoryAddress: LEVERAGE_MANAGER_FACTORY_ADDRESSES[chainId ?? 11155111],
//           tokenA: key.token0,
//           tokenB: key.token1,
//           fee: key.fee,
//         }),
//         borrowManagerAddress: computeBorrowManagerAddress({
//           factoryAddress: BORROW_MANAGER_FACTORY_ADDRESSES[chainId ?? 11155111],
//           tokenA: key.token0,
//           tokenB: key.token1,
//           fee: key.fee,
//         }),
//         liquidityManagerAddress: computeLiquidityManagerAddress({
//           factoryAddress: LIQUIDITY_MANAGER_FACTORY_ADDRESSES[chainId ?? 11155111],
//           tokenA: key.token0,
//           tokenB: key.token1,
//           fee: key.fee,
//         }),
//         token0Address: key.token0,
//         token1Address: key.token1,
//         poolFee: key.fee,
//         totalPosition: convertToBN(position.totalPosition, 18),
//         totalPositionNumber: convertBNToNum(position.totalPosition, 18),
//         totalPositionRaw: position.isBorrow ? position.totalDebtInput.toString() : position.totalPosition.toString(),
//         totalDebt: convertToBN(position.totalDebt, 18),
//         totalDebtNumber: convertBNToNum(position.totalDebt, 18),
//         totalDebtInput: convertToBN(position.totalDebtInput, 18),
//         totalDebtInputNumber: convertBNToNum(position.totalDebtInput, 18),
//         // creationPrice: convertBNToNum(position.creationPrice, 18),
//         initialCollateral: convertToBN(position.initCollateral, 18),
//         initialCollateralNumber: convertBNToNum(position.initCollateral, 18),
//         recentPremium: convertToBN(position.recentPremium, 18),
//         recentPremiumNumber: convertBNToNum(position.recentPremium, 18),
//         totalPremium: convertToBN(position.totalPremium, 18),
//         totalPremiumNumber: convertBNToNum(position.totalPremium, 18),
//         unusedPremium: convertToBN(position.unusedPremium, 18),
//         unusedPremiumNumber: convertBNToNum(position.unusedPremium, 18),
//         isToken0: position.isToken0,
//         openTime: position.openTime,
//         repayTime: position.repayTime,
//         isBorrow: position.isBorrow,
//         // borrowInfo: position.borrowInfo.map((info: any) => convertBNToNum(info, 18)),
//       }
//       return _position
//     }
//     return undefined
//   }, [loading, error, tokenId, chainId, result])

//   return {
//     loading,
//     error,
//     position: position ?? undefined,
//   }
// }

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
  maxWithdrawable?: BigNumber
}

export function useV3PositionFromTokenId(tokenId: BigNumber | undefined): UseV3PositionResults {
  const position = useV3PositionsFromTokenIds(tokenId ? [tokenId] : undefined)
  return {
    loading: position.loading,
    position: position.positions?.[0],
  }
}

export function useLmtLpPositionFromTokenId(tokenId: BigNumber | undefined): UseV3PositionResults {
  const position = useLmtLpPositionsFromTokenIds(tokenId ? [tokenId] : undefined)
  const dataProvider = useDataProviderContract()
  const blockNumber = useBlockNumber()
  const [lastBlockNumber, setBlockNumber] = useState<number | undefined>(undefined)

  const [data, setData] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()

  useEffect(() => {
    if (loading || !blockNumber || (lastBlockNumber && lastBlockNumber + 2 > blockNumber)) return

    const call = async () => {
      try {
        setLoading(true)
        const result = await dataProvider?.getMaxWithdrawable(
          {
            token0: position.positions?.[0]?.token0 as string,
            token1: position.positions?.[0]?.token1 as string,
            fee: position.positions?.[0]?.fee as number,
          },
          position.positions?.[0]?.tickLower as number,
          position.positions?.[0]?.tickUpper as number
        )
        setData(result)
        setLoading(false)
        setBlockNumber(blockNumber)
      } catch (error) {
        setError(error)
        setLoading(false)
        console.log('maxWithdrawableerr', error)
      }
    }
    call()
  }, [dataProvider, loading, lastBlockNumber, blockNumber, position.positions])

  return useMemo(() => {
    if (!data || !position) {
      return {
        loading: position.loading,
        position: position.positions?.[0],
        maxWithdrawable: data,
      }
    } else {
      return {
        loading: position.loading,
        position: position.positions?.[0],
        maxWithdrawable: data,
      }
    }
  }, [position.loading, error, data, tokenId])
}

export function useV3Positions(account: string | null | undefined): UseV3PositionsResults {
  const positionManager = useV3NFTPositionManagerContract()

  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(positionManager, 'balanceOf', [
    account ?? undefined,
  ])

  // console.log('balanceResult', balanceLoading, balanceResult)

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

export function useLmtLpPositions(account: string | null | undefined): UseV3PositionsResults {
  const positionManager = useLmtNFTPositionManager()

  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(positionManager, 'balanceOf', [
    account ?? undefined,
  ])

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
  const { positions, loading: positionsLoading } = useLmtLpPositionsFromTokenIds(tokenIds)

  return {
    loading: someTokenIdsLoading || balanceLoading || positionsLoading,
    positions,
  }
}

export function useLmtLpPositionsFromTokenIds(tokenIds: BigNumber[] | undefined): UseV3PositionsResults {
  const positionManager = useLmtNFTPositionManager()
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
          nonce: BigNumber.from(0), // result.nonce,
          operator: '', //result.operator,
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
