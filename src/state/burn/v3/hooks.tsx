import { Trans } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { FeeAmount, Position } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { BigNumber } from 'ethers'
import { useToken } from 'hooks/Tokens'
import { useDataProviderContract } from 'hooks/useContract'
import { useNFPMV2 } from 'hooks/useContract'
import { useParsedBurnAmounts } from 'hooks/useParsedBurnAmounts'
import { useParsedBurnAmountsV1 } from 'hooks/useParsedBurnAmounts'
import { usePool, usePoolV2 } from 'hooks/usePools'
import { useLMTPositionFees } from 'hooks/useV3PositionFees'
import { useLMTV1PositionFees } from 'hooks/useV3PositionFees'
import { useSingleContractWithCallData } from 'lib/hooks/multicall'
import { ReactNode, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { PositionDetails, V2PositionDetails } from 'types/position'
import { DataProviderSDK } from 'utils/lmtSDK/DataProvider'
import { unwrappedToken } from 'utils/unwrappedToken'
import { useAccount } from 'wagmi'

import { AppState } from '../../types'
import { selectPercent } from './actions'

export function useBurnV3State(): AppState['burnV3'] {
  return useAppSelector((state) => state.burnV3)
}

// fetches the max amount of liquidity that can be withdrawn from a position
export function useMaxToWithdraw(position: V2PositionDetails | undefined): {
  data:
    | {
        amount0: BigNumber
        amount1: BigNumber
        percentage: number // max percentage that can be withdrawn
      }
    | undefined
  loading: boolean
  error: any
} {
  const nfpm = useNFPMV2()
  const queryKey = useMemo(() => {
    if (!position || !nfpm) return []
    return ['getMaxWithdrawable', [position.tokenId.toString()]]
  }, [nfpm, position])

  const call = useCallback(async () => {
    if (!position || !nfpm) throw new Error('Invalid position or NFPM')
    return nfpm.callStatic.getMaxWithdrawable(position.tokenId.toString())
  }, [nfpm, position])

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: call,
    enabled: queryKey.length > 0,
  })

  return useMemo(() => {
    if (!data || queryKey.length == 0) {
      return {
        data: undefined,
        loading: isLoading,
        error,
      }
    } else {
      return {
        data: {
          amount0: data[0],
          amount1: data[1],
          percentage: new BN(data[2].toString()).shiftedBy(-16).toNumber(),
        },
        loading: isLoading,
        error,
      }
    }
  }, [data, isLoading, error, queryKey])
}

export function useMaxV1LiquidityToWithdraw(
  position: PositionDetails | undefined,
  currency0: string | undefined,
  currency1: string | undefined,
  fee: FeeAmount | undefined
): {
  data: BigNumber | undefined
  loading: boolean
  error: any
} {
  // if liquidity in bin >= liquidity in position + MIN_LIQ then return liquidity in position
  // if liquidity in bin < liquidity in position + MIN_LIQ then return liquidity in bin - MIN_LIQ,
  // get all liquidities in bin + all borrowed liquidities
  const calldata = useMemo(() => {
    if (!position || !currency0 || !currency1 || !fee) return []

    const poolKey = {
      token0: currency0,
      token1: currency1,
      fee,
    }
    return [
      DataProviderSDK.INTERFACE.encodeFunctionData('getMaxWithdrawable', [
        poolKey,
        position.tickLower,
        position.tickUpper,
      ]),
    ]
  }, [position, currency0, currency1, fee])

  const dataProvider = useDataProviderContract()
  const callStates = useSingleContractWithCallData(dataProvider, calldata, {
    gasRequired: 10_000_000,
  })

  return useMemo(() => {
    if (callStates.length === 0 || !position || !callStates[0].result)
      return {
        data: undefined,
        loading: false,
        error: undefined,
      }

    const maxLiquidity = callStates[0]?.result[0] as BigNumber
    return {
      data: maxLiquidity.lt(position.liquidity) ? maxLiquidity : position.liquidity,
      loading: callStates[0].loading,
      error: callStates[0].error,
    }
  }, [position, callStates])
}
export function useDerivedV1LmtBurnInfo(
  position?: PositionDetails,
  loading?: boolean,

  asWETH = false
): {
  position?: Position
  liquidityPercentage?: Percent
  liquidityValue0?: CurrencyAmount<Currency>
  liquidityValue1?: CurrencyAmount<Currency>
  feeValue0?: CurrencyAmount<Currency>
  feeValue1?: CurrencyAmount<Currency>
  outOfRange: boolean
  error?: ReactNode
  maxLiquidityToWithdraw?: BigNumber
} {
  const account = useAccount().address
  const { percent } = useBurnV3State()

  const token0 = useToken(position?.token0)
  const token1 = useToken(position?.token1)

  const [, pool] = usePoolV2(token0 ?? undefined, token1 ?? undefined, position?.fee)

  const positionSDK = useMemo(
    () =>
      !loading &&
      pool &&
      position?.liquidity &&
      typeof position?.tickLower === 'number' &&
      typeof position?.tickUpper === 'number'
        ? new Position({
            pool,
            liquidity: position.liquidity.toString(),
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
          })
        : undefined,
    [pool, position, loading]
  )

  const liquidityPercentage = new Percent(percent, 100)
  const { data: maxLiquidityToWithdraw } = useMaxV1LiquidityToWithdraw(
    position,
    token0?.address,
    token1?.address,
    position?.fee
  )

  const { result: parsedLiquidity } = useParsedBurnAmountsV1(
    position?.tokenId.toString(),
    maxLiquidityToWithdraw,
    token0 ?? undefined,
    token1 ?? undefined,
    liquidityPercentage
  )

  const liquidityValue0 = parsedLiquidity ? parsedLiquidity.amount0 : undefined
  const liquidityValue1 = parsedLiquidity ? parsedLiquidity.amount1 : undefined

  const [feeValue0, feeValue1] = useLMTV1PositionFees(pool ?? undefined, position?.tokenId, asWETH)

  const outOfRange =
    pool && position ? pool.tickCurrent < position.tickLower || pool.tickCurrent > position.tickUpper : false

  let error: ReactNode | undefined
  if (!account) {
    error = <Trans>Connect Wallet</Trans>
  }
  if (percent === 0) {
    error = error ?? <Trans>Enter a percent</Trans>
  }
  if (maxLiquidityToWithdraw?.isZero()) {
    error = error ?? <Trans>Unable to withdraw</Trans>
  }
  return {
    position: positionSDK,
    liquidityPercentage,
    liquidityValue0,
    liquidityValue1,
    feeValue0,
    feeValue1,
    outOfRange,
    error,
    maxLiquidityToWithdraw,
  }
}
export function useDerivedLmtBurnInfo(
  position?: V2PositionDetails,
  loading?: boolean,
  asWETH = false
): {
  position?: Position
  liquidityPercentage?: Percent
  liquidityValue0?: CurrencyAmount<Currency>
  liquidityValue1?: CurrencyAmount<Currency>
  feeValue0?: CurrencyAmount<Currency>
  feeValue1?: CurrencyAmount<Currency>
  outOfRange: boolean
  error?: ReactNode
  maxAmount0?: CurrencyAmount<Currency>
  maxAmount1?: CurrencyAmount<Currency>
  maxPercentage?: number
} {
  const account = useAccount().address
  const { percent } = useBurnV3State()

  const token0 = useToken(position?.token0)
  const token1 = useToken(position?.token1)

  const [, pool] = usePoolV2(token0 ?? undefined, token1 ?? undefined, position?.fee)

  const positionSDK = useMemo(
    () =>
      !loading &&
      pool &&
      position?.bins &&
      typeof position?.tickLower === 'number' &&
      typeof position?.tickUpper === 'number'
        ? new Position({
            pool,
            liquidity: position.liquidity.toString(),
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
          })
        : undefined,
    [pool, position, loading]
  )

  const liquidityPercentage = new Percent(percent, 100)
  const { data: maxToWithdraw } = useMaxToWithdraw(position)

  const parsedLiquidity = useParsedBurnAmounts(
    position?.tokenId.toString(),
    maxToWithdraw?.percentage, // should use max percent that one can withdraw
    token0 ?? undefined,
    token1 ?? undefined,
    liquidityPercentage
  )

  const liquidityValue0 = parsedLiquidity ? parsedLiquidity.amount0 : undefined
  const liquidityValue1 = parsedLiquidity ? parsedLiquidity.amount1 : undefined

  const [feeValue0, feeValue1] = useLMTPositionFees(pool ?? undefined, position?.tokenId, asWETH)

  const [maxAmount0, maxAmount1, percentage] = useMemo(() => {
    if (token0 && token1 && maxToWithdraw) {
      return [
        CurrencyAmount.fromRawAmount(asWETH ? token0 : unwrappedToken(token0), maxToWithdraw.amount0.toString()),
        CurrencyAmount.fromRawAmount(asWETH ? token1 : unwrappedToken(token1), maxToWithdraw.amount1.toString()),
        maxToWithdraw.percentage,
      ]
    }
    return [undefined, undefined, undefined]
  }, [token0, token1, maxToWithdraw])

  const outOfRange =
    pool && position ? pool.tickCurrent < position.tickLower || pool.tickCurrent > position.tickUpper : false

  let error: ReactNode | undefined
  if (!account) {
    error = <Trans>Connect Wallet</Trans>
  }
  if (percent === 0) {
    error = error ?? <Trans>Enter a percent</Trans>
  }
  if (maxToWithdraw?.percentage === 0) {
    error = error ?? <Trans>Unable to withdraw</Trans>
  }
  return {
    position: positionSDK,
    liquidityPercentage,
    liquidityValue0,
    liquidityValue1,
    feeValue0,
    feeValue1,
    outOfRange,
    error,
    maxAmount0,
    maxAmount1,
    maxPercentage: percentage,
  }
}

export function useBurnV3ActionHandlers(): {
  onPercentSelect: (percent: number) => void
} {
  const dispatch = useAppDispatch()

  const onPercentSelect = useCallback(
    (percent: number) => {
      dispatch(selectPercent({ percent }))
    },
    [dispatch]
  )

  return {
    onPercentSelect,
  }
}
