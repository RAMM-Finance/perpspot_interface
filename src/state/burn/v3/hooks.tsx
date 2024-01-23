import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { FeeAmount, Position } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { DATA_PROVIDER_ADDRESSES } from 'constants/addresses'
import { BigNumber } from 'ethers'
import { useToken } from 'hooks/Tokens'
import { useContractCall } from 'hooks/useContractCall'
import { useParsedBurnAmounts } from 'hooks/useParsedBurnAmounts'
import { usePool } from 'hooks/usePools'
import { useLMTPositionFees, useV3PositionFees } from 'hooks/useV3PositionFees'
import { ReactNode, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { PositionDetails } from 'types/position'
import { DataProviderSDK } from 'utils/lmtSDK/DataProvider'
import { unwrappedToken } from 'utils/unwrappedToken'

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
  const { account } = useWeb3React()
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
export function useMaxLiquidityToWithdraw(
  position: PositionDetails | undefined,
  currency0: string | undefined,
  currency1: string | undefined,
  fee: FeeAmount | undefined
): BigNumber | undefined {
  // if liquidity in bin >= liquidity in position + MIN_LIQ then return liquidity in position
  // if liquidity in bin < liquidity in position + MIN_LIQ then return liquidity in bin - MIN_LIQ,
  // get all liquidities in bin + all borrowed liquidities
  const calldata = useMemo(() => {
    if (!position || !currency0 || !currency1 || !fee) return undefined

    const poolKey = {
      token0: currency0,
      token1: currency1,
      fee,
    }
    return DataProviderSDK.INTERFACE.encodeFunctionData('getMaxWithdrawable', [
      poolKey,
      position.tickLower,
      position.tickUpper,
    ])
  }, [position, currency0, currency1, fee])

  const { result, error, loading } = useContractCall(DATA_PROVIDER_ADDRESSES, calldata, false, 1)

  return useMemo(() => {
    if (!result || !position || loading || error) return undefined

    const maxLiquidity = DataProviderSDK.INTERFACE.decodeFunctionResult('getMaxWithdrawable', result)[0]
    return maxLiquidity.lt(position.liquidity) ? maxLiquidity : position.liquidity
  }, [result, position, error, loading])
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
  maxLiquidityToWithdraw?: BigNumber
} {
  const { account } = useWeb3React()
  const { percent } = useBurnV3State()

  const token0 = useToken(position?.token0)
  const token1 = useToken(position?.token1)

  const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, position?.fee)

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

  // const discountedAmount0 = positionSDK
  //   ? liquidityPercentage.multiply(positionSDK.amount0.quotient).quotient
  //   : undefined
  // const discountedAmount1 = positionSDK
  //   ? liquidityPercentage.multiply(positionSDK.amount1.quotient).quotient
  //   : undefined
  const maxLiquidityToWithdraw = useMaxLiquidityToWithdraw(position, token0?.address, token1?.address, position?.fee)
  // console.log('maxLiquidityToWithdraw', maxLiquidityToWithdraw?.toString(), position?.liquidity.toString())
  const { result: parsedLiquidity } = useParsedBurnAmounts(
    position?.tokenId.toString(),
    maxLiquidityToWithdraw,
    token0 ?? undefined,
    token1 ?? undefined,
    liquidityPercentage
  )

  const liquidityValue0 = parsedLiquidity ? parsedLiquidity.amount0 : undefined
  const liquidityValue1 = parsedLiquidity ? parsedLiquidity.amount1 : undefined

  // const liquidityValue0 =
  //   token0 && discountedAmount0
  //     ? CurrencyAmount.fromRawAmount(asWETH ? token0 : unwrappedToken(token0), discountedAmount0)
  //     : undefined
  // const liquidityValue1 =
  //   token1 && discountedAmount1
  //     ? CurrencyAmount.fromRawAmount(asWETH ? token1 : unwrappedToken(token1), discountedAmount1)
  //     : undefined

  const [feeValue0, feeValue1] = useLMTPositionFees(pool ?? undefined, position?.tokenId, asWETH)

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
