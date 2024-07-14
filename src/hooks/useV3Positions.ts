import { BigNumber } from '@ethersproject/bignumber'
import { BigNumber as BN } from 'bignumber.js'
import { LMT_QUOTER } from 'constants/addresses'
import { CallStateResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { PositionDetails, V2PositionDetails } from 'types/position'
import { LmtQuoterSDK } from 'utils/lmtSDK/LmtQuoter'

import { useLmtNFTPositionManager, useNFPMV2 } from './useContract'
import { useContractCallV2 } from './useContractCall'

interface V2PositionResults {
  loading: boolean
  positions: V2PositionDetails[] | undefined
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

interface V2PositionResult {
  loading: boolean
  position: V2PositionDetails | undefined
  // maxWithdrawable?: BigNumber
  error?: any
}

export function useLmtV2LpPositionFromTokenId(tokenId: BigNumber | undefined): V2PositionResult {
  const position = useLmtV2LpPositionsFromTokenIds(tokenId ? [tokenId] : undefined)

  return useMemo(() => {
    return {
      position: position.positions?.[0],
      loading: position.loading,
    }
  }, [position])
}

export function useLmtV2LpPositions(account: string | null | undefined): V2PositionResults {
  // const quoter = useLmtQuoterContract()

  const calldata = useMemo(() => {
    if (account) {
      return LmtQuoterSDK.INTERFACE.encodeFunctionData('getLpPositions', [account])
    }
    return undefined
  }, [account])

  const { result, loading, error } = useContractCallV2(LMT_QUOTER, calldata, ['getLpPositions'])

  return useMemo(() => {
    if (!result) {
      return {
        loading,
        positions: undefined,
      }
    }
    const parsed = LmtQuoterSDK.INTERFACE.decodeFunctionResult('getLpPositions', result)[0]
    return {
      loading,
      positions: parsed.map((i: any) => {
        return {
          tokenId: i[0],
          owner: i[1],
          token0: i[2],
          token1: i[3],
          fee: i[4],
          tickLower: i[5],
          tickUpper: i[6],
          bins: i[7],
          tokensOwed0: i[8],
          tokensOwed1: i[9],
          liquidity: i[7].length > 0 ? i[7][0][0] : BigNumber.from(0),
        }
      }),
    }
  }, [loading, result, error])
}

export function useLmtV2LpPositionsFromTokenIds(tokenIds: BigNumber[] | undefined): V2PositionResults {
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
          bins: result[6],
          owner: result.owner,
          liquidity: result[6].length > 0 ? result[6][0][0] : BigNumber.from(0),
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

// V1
interface V1PositionsResults {
  loading: boolean
  positions: PositionDetails[] | undefined
}

export function useLmtV1LpPositions(account: string | null | undefined): V1PositionsResults {
  // const quoter = useLmtQuoterContract()

  const calldata = useMemo(() => {
    if (account) {
      return LmtQuoterSDK.INTERFACE.encodeFunctionData('getV1LpPositions', [account])
    }
    return undefined
  }, [account])

  const { result, loading, error } = useContractCallV2(LMT_QUOTER, calldata, ['getV1LpPositions'])

  return useMemo(() => {
    if (!result) {
      return {
        loading,
        positions: undefined,
      }
    }
    const parsed = LmtQuoterSDK.INTERFACE.decodeFunctionResult('getV1LpPositions', result)[0]
    return {
      loading,
      positions: parsed.map((i: any) => {
        return {
          nonce: BigNumber.from(0),
          tokenId: i[0],
          owner: i[1],
          token0: i[2],
          token1: i[3],
          fee: i[4],
          tickLower: i[5],
          tickUpper: i[6],
          liquidity: i[7],
          feeGrowthInside0LastX128: i[8],
          feeGrowthInside1LastX128: i[9],
          tokensOwed0: i[10],
          tokensOwed1: i[11],
        }
      }),
    }
  }, [loading, result, error])
}

export function useLmtV1LpPositionsFromTokenIds(tokenIds: BigNumber[] | undefined): V1PositionsResults {
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
          operator: result.owner, //result.operator,
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

export function useLmtV1LpPositionFromTokenId(tokenId: BigNumber | undefined): {
  loading: boolean
  position: PositionDetails | undefined
  // maxWithdrawable?: BigNumber
  error?: any
} {
  const position = useLmtV1LpPositionsFromTokenIds(tokenId ? [tokenId] : undefined)

  return useMemo(() => {
    return {
      position: position.positions?.[0],
      loading: position.loading,
    }
  }, [position])
}
