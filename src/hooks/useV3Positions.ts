import { BigNumber } from '@ethersproject/bignumber'
import { BigNumber as BN } from 'bignumber.js'
import { CallStateResult, useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { PositionDetails } from 'types/position'

import { useNFPMV2 } from './useContract'

interface UseV3PositionsResults {
  loading: boolean
  positions: PositionDetails[] | undefined
}

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

// function useV3PositionsFromTokenIds(tokenIds: BigNumber[] | undefined): UseV3PositionsResults {
//   const positionManager = useV3NFTPositionManagerContract()
//   const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : []), [tokenIds])
//   const results = useSingleContractMultipleData(positionManager, 'positions', inputs)

//   const loading = useMemo(() => results.some(({ loading }) => loading), [results])
//   const error = useMemo(() => results.some(({ error }) => error), [results])

//   const positions = useMemo(() => {
//     if (!loading && !error && tokenIds) {
//       return results.map((call, i) => {
//         const tokenId = tokenIds[i]
//         const result = call.result as CallStateResult
//         return {
//           tokenId,
//           fee: result.fee,
//           nonce: result.nonce,
//           operator: result.operator,
//           tickLower: result.tickLower,
//           tickUpper: result.tickUpper,
//           token0: result.token0,
//           token1: result.token1,
//           tokensOwed0: result.tokensOwed0,
//           tokensOwed1: result.tokensOwed1,
//         }
//       })
//     }
//     return undefined
//   }, [loading, error, results, tokenIds])

//   return {
//     loading,
//     positions: positions?.map((position, i) => ({ ...position, tokenId: inputs[i][0] })),
//   }
// }

interface UseV3PositionResults {
  loading: boolean
  position: PositionDetails | undefined
  // maxWithdrawable?: BigNumber
  error?: any
}

export function useLmtLpPositionFromTokenId(tokenId: BigNumber | undefined): UseV3PositionResults {
  const position = useLmtLpPositionsFromTokenIds(tokenId ? [tokenId] : undefined)

  return useMemo(() => {
    return {
      position: position.positions?.[0],
      loading: position.loading,
    }
  }, [position])
}

export function useLmtLpPositions(account: string | null | undefined): UseV3PositionsResults {
  const nfpm = useNFPMV2()

  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(nfpm, 'balanceOf', [
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

  const tokenIdResults = useSingleContractMultipleData(nfpm, 'tokenOfOwnerByIndex', tokenIdsArgs, {
    blocksPerFetch: 8,
  })

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
  const nfpm = useNFPMV2()
  const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : []), [tokenIds])
  const results = useSingleContractMultipleData(nfpm, 'positions', inputs)
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
          tickLower: result.tickLower,
          tickUpper: result.tickUpper,
          token0: result.token0,
          token1: result.token1,
          tokensOwed0: result.tokensOwed0,
          tokensOwed1: result.tokensOwed1,
          bins: result.bins,
          owner: result.owner,
          liquidity: result.bins.length > 0 ? result.bins[0].liquidity : BigNumber.from(0),
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
