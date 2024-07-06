import { Trans } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { Position } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { BigNumber } from 'ethers'
import { useToken } from 'hooks/Tokens'
import { useNFPMV2 } from 'hooks/useContract'
import { useParsedBurnAmounts } from 'hooks/useParsedBurnAmounts'
import { usePool } from 'hooks/usePools'
import { useLMTPositionFees, useV3PositionFees } from 'hooks/useV3PositionFees'
import { ReactNode, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { PositionDetails } from 'types/position'
import { unwrappedToken } from 'utils/unwrappedToken'
import { useAccount } from 'wagmi'

import { AppState } from '../../types'
import { selectPercent } from './actions'

export function useBurnV3State(): AppState['burnV3'] {
  return useAppSelector((state) => state.burnV3)
}

export function useDerivedV3BurnInfo(
  position?: PositionDetails,
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
} {
  const account = useAccount().address
  const { percent } = useBurnV3State()

  const token0 = useToken(position?.token0)
  const token1 = useToken(position?.token1)

  const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, position?.fee)

  const positionSDK = useMemo(
    () =>
      pool && position?.liquidity && typeof position?.tickLower === 'number' && typeof position?.tickUpper === 'number'
        ? new Position({
            pool,
            liquidity: position.liquidity.toString(),
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
          })
        : undefined,
    [pool, position]
  )

  const liquidityPercentage = new Percent(percent, 100)

  const discountedAmount0 = positionSDK
    ? liquidityPercentage.multiply(positionSDK.amount0.quotient).quotient
    : undefined
  const discountedAmount1 = positionSDK
    ? liquidityPercentage.multiply(positionSDK.amount1.quotient).quotient
    : undefined

  const liquidityValue0 =
    token0 && discountedAmount0
      ? CurrencyAmount.fromRawAmount(asWETH ? token0 : unwrappedToken(token0), discountedAmount0)
      : undefined
  const liquidityValue1 =
    token1 && discountedAmount1
      ? CurrencyAmount.fromRawAmount(asWETH ? token1 : unwrappedToken(token1), discountedAmount1)
      : undefined

  const [feeValue0, feeValue1] = useV3PositionFees(pool ?? undefined, position?.tokenId, asWETH)
  // console.log('feesearnedwtf', feeValue0, feeValue0?.toString(), feeValue1?.toString())
  const outOfRange =
    pool && position ? pool.tickCurrent < position.tickLower || pool.tickCurrent > position.tickUpper : false

  let error: ReactNode | undefined
  if (!account) {
    error = <Trans>Connect Wallet</Trans>
  }
  if (percent === 0) {
    error = error ?? <Trans>Enter a percent</Trans>
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
  }
}

// fetches the max amount of liquidity that can be withdrawn from a position
export function useMaxToWithdraw(position: PositionDetails | undefined): {
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

export function useDerivedLmtBurnInfo(
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
  maxAmount0?: CurrencyAmount<Currency>
  maxAmount1?: CurrencyAmount<Currency>
  maxPercentage?: number
} {
  const account = useAccount().address
  const { percent } = useBurnV3State()

  const token0 = useToken(position?.token0)
  const token1 = useToken(position?.token1)

  const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, position?.fee)

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
