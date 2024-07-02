import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { Currency, Percent, Price, Token } from '@uniswap/sdk-core'
import { nearestUsableTick, Pool, TickMath } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { AnimatedDropSide } from 'components/AnimatedDropdown'
import { ZapOutputTokenPanel, ZapTokenPanel } from 'components/BaseSwapPanel/BaseSwapPanel'
import { BaseButton, SmallButtonPrimary } from 'components/Button'
import Column from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import HoverInlineText from 'components/HoverInlineText'
import Loader from 'components/Icons/LoadingSpinner'
import { LmtModal } from 'components/Modal'
import RateToggle from 'components/RateToggle'
import Row, { RowBetween, RowFixed } from 'components/Row'
import { LmtSettingsTab } from 'components/Settings'
import { ArrowWrapper } from 'components/swap/styleds'
import { MouseoverTooltip } from 'components/Tooltip'
import { LMT_NFT_POSITION_MANAGER } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { BigNumber } from 'ethers'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useContractCallV2 } from 'hooks/useContractCall'
import { PoolState, usePool } from 'hooks/usePools'
import { useUSDPriceBN } from 'hooks/useUSDPrice'
import JSBI from 'jsbi'
import useCurrencyBalance, { useCurrencyBalances } from 'lib/hooks/useCurrencyBalance'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useIsMobile } from 'nft/hooks'
import { ArrowContainer } from 'pages/Trade'
import { darken } from 'polished'
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Info } from 'react-feather'
import { BnToCurrencyAmount, parseBN } from 'state/marginTrading/hooks'
import { useTickDiscretization } from 'state/mint/v3/hooks'
import { tryParseLmtTick } from 'state/mint/v3/utils'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import { useUserSlippageTolerance } from 'state/user/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { BREAKPOINTS, ThemedText } from 'theme'
import { PoolKey } from 'types/lmtv2position'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { getTickToPrice } from 'utils/getTickToPrice'
import { getErrorMessage, parseContractError } from 'utils/lmtSDK/errors'
import { NonfungiblePositionManager } from 'utils/lmtSDK/NFTPositionManager'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useAccount, useChainId } from 'wagmi'
import { useEthersSigner } from 'wagmi-lib/adapters'
import { LoadingBubble } from 'components/Tokens/loading'
import { LiquidityRangeSelector } from './LiquidityRangeSelector'

const Wrapper = styled.div`
  padding: 20px;
  padding-top: 0px;
  margin: 10px;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.backgroundSurface};
`
const Header = styled.div`
  padding-top: 15px;
  padding-bottom: 15px;
  display: grid;
  grid-template-columns: 40px 120px 110px 110px 30px;
  align-items: center;
  @media only screen and (max-width: ${BREAKPOINTS.sm}px) {
    margin-left: 20px;
    grid-template-columns: 40px 80px 110px 110px 30px;
  }
`

const DetailsWrapper = styled.div`
  background-color: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  margin-top: 10px;
  margin-bottom: 10px;
  border-radius: 10px;
  padding: 20px;
`

const InputWrapper = styled.div`
  background-color: ${({ theme }) => theme.surface1};
  margin-bottom: 5px;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  color: ${({ theme }) => theme.textSecondary};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
`

const InputWrapper2 = styled.div`
  // background-color: ${({ theme }) => theme.surface1};
  margin-bottom: 5px;
  // padding: 15px;
  // border: 1px solid ${({ theme }) => theme.backgroundOutline};
  color: ${({ theme }) => theme.textSecondary};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
`
// const Button = styled(ButtonOutlined).attrs(() => ({
//   padding: '8px',
//   minHeight: '60px',
//   $borderRadius: '8px',
// }))`
//   color: ${({ theme }) => theme.textPrimary};
//   flex: 1;
//   border-color: ${({ theme }) => theme.backgroundInteractive};
// `
const RotatingArrow = styled(ChevronRight)<{ open?: boolean }>`
  transform: ${({ open }) => (open ? 'rotate(180deg)' : 'none')};
  transition: transform 0.1s linear;
  @media screen and (max-width: ${({ theme }) => theme.breakpoint.md}px) {
    display: none;
  }
`

const MobileRotatingArrow = styled(ChevronDown)<{ open?: boolean }>`
  display: none;
  transform: ${({ open }) => (open ? 'rotate(180deg)' : 'none')};
  transition: transform 0.1s linear;
  @media screen and (max-width: ${({ theme }) => theme.breakpoint.md}px) {
    display: block;
  }
`

const StyledHeaderRow = styled(RowBetween)<{ open: boolean }>`
  padding: 0;
  align-items: center;
  margin-bottom: 4px;
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
`

interface ZapModalProps {
  isOpen: boolean
  onClose: () => void
  apr: number | undefined
  tvl: number | undefined
  token0: Currency | undefined | null
  token1: Currency | undefined | null
  poolKey: PoolKey | undefined
}

enum ZapDerivedInfoState {
  LOADING,
  VALID,
  INVALID,
  SYNCING, // syncing means already loaded valid info, but updating to newest info
}

interface ZapTxnInfo {
  token0Out: BN
  token1Out: BN
  token0Remainder: BN
  token1Remainder: BN
  liquidity: BN
  poolKey: PoolKey
  inputAmount: BN
  inputIsToken0: boolean
  lowerDelta: number
  upperDelta: number
  maxSlippageTick: number
}

interface DerivedZapInfo {
  txnInfo: ZapTxnInfo | undefined
  userError: ReactNode | undefined
  contractError: ReactNode | undefined
  tradeState: ZapDerivedInfoState
  allowedSlippage: Percent
  lowerTick: number | undefined
  upperTick: number | undefined
  lowerPrice: Price<Token, Token> | undefined
  upperPrice: Price<Token, Token> | undefined
  pricesAtLimit: {
    [bound in Bound]?: Price<Token, Token> | undefined
  }
  invertPrice: boolean
  ticksAtLimit: {
    [bound in Bound]: boolean
  }
}

const PresentButton = styled(BaseButton)<{ active: boolean }>`
  border-radius: 8px;
  padding: 6px;
  background-color: ${({ theme, active }) =>
    active ? darken(0.1, theme.accentActive) : darken(0.4, theme.accentActiveSoft)};
  &:hover {
    background-color: ${({ theme }) => darken(0.1, theme.accentActive)};
  }
  font-size: 14px;
  height: ${({ active }) => active && '60px'};
  min-height: 50px;
`

interface PresetsButtonsProps {
  btnName: string
  onSetRecommendedRange: () => void
  isRecommended?: boolean
  active: boolean
}

export function PresetsButtons({ btnName, onSetRecommendedRange, active }: PresetsButtonsProps) {
  return (
    <Row width="120px">
      <PresentButton onClick={onSetRecommendedRange} active={active}>
        <Trans>{btnName}</Trans>
      </PresentButton>
    </Row>
  )
}

const LiquiditySelectorWrapper = styled(Column)<{ open?: boolean }>`
  padding: 0px;
  padding-left: 0;
  margin-top: 25px;
  gap: 35px;
  opacity: ${(props) => (props.open ? '1' : '0')};
  transition: opacity 0.13s ease-in-out;
  background: ${({ theme }) => theme.backgroundSurface};
`

const PriceAndToggleWrapper = styled(Column)`
  flex-wrap: wrap;
  background-color: ${({ theme }) => theme.backgroundSurface};
  /* row-gap: 0.8rem; */
  /* margin-bottom: 1rem; */
`

enum Bound {
  LOWER = 'LOWER',
  UPPER = 'UPPER',
}

// need to do approvals
const useDerivedZapInfo = (
  inputAmount: string,
  inputIsToken0: boolean,
  poolKey: PoolKey | undefined,
  token0: Currency | undefined,
  token1: Currency | undefined,
  inputApprovalState: ApprovalState,
  baseIsToken0: boolean,
  leftRangeTypedValue: string | boolean,
  rightRangeTypedValue: string | boolean
): DerivedZapInfo => {
  const parsedAmount = useMemo(() => {
    return parseBN(inputAmount)
  }, [inputAmount])

  const account = useAccount().address

  const inputCurrency = inputIsToken0 ? token0 : token1

  const relevantTokenBalances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [token0 ?? undefined, token1 ?? undefined], [token0, token1])
  )

  const [, pool] = usePool(token0, token1, poolKey?.fee)

  const invertPrice = !baseIsToken0

  const { tickDiscretization } = useTickDiscretization(poolKey?.token0, poolKey?.token1, poolKey?.fee)

  const tickSpaceLimits = useMemo(
    () => ({
      [Bound.LOWER]: tickDiscretization ? nearestUsableTick(TickMath.MIN_TICK, tickDiscretization) : undefined,
      [Bound.UPPER]: tickDiscretization ? nearestUsableTick(TickMath.MAX_TICK, tickDiscretization) : undefined,
    }),
    [tickDiscretization]
  )

  const pricesAtLimit = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0?.wrapped, token1?.wrapped, tickSpaceLimits.LOWER),
      [Bound.UPPER]: getTickToPrice(token0?.wrapped, token1?.wrapped, tickSpaceLimits.UPPER),
    }
  }, [token0, token1, tickSpaceLimits.LOWER, tickSpaceLimits.UPPER])

  const ticks = useMemo(() => {
    return {
      [Bound.LOWER]:
        (invertPrice && typeof rightRangeTypedValue === 'boolean') ||
        (!invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.LOWER]
          : invertPrice
          ? tryParseLmtTick(
              token1?.wrapped,
              token0?.wrapped,
              poolKey?.fee,
              rightRangeTypedValue.toString(),
              tickDiscretization,
              true
            )
          : tryParseLmtTick(
              token0?.wrapped,
              token1?.wrapped,
              poolKey?.fee,
              leftRangeTypedValue.toString(),
              tickDiscretization,
              true
            ),
      [Bound.UPPER]:
        (!invertPrice && typeof rightRangeTypedValue === 'boolean') ||
        (invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.UPPER]
          : invertPrice
          ? tryParseLmtTick(
              token1?.wrapped,
              token0?.wrapped,
              poolKey?.fee,
              leftRangeTypedValue.toString(),
              tickDiscretization
            )
          : tryParseLmtTick(
              token0?.wrapped,
              token1?.wrapped,
              poolKey?.fee,
              rightRangeTypedValue.toString(),
              tickDiscretization
            ),
    }
  }, [
    poolKey,
    invertPrice,
    leftRangeTypedValue,
    rightRangeTypedValue,
    token0,
    token1,
    tickSpaceLimits,
    tickDiscretization,
  ])

  const lowerTick = ticks[Bound.LOWER]
  const upperTick = ticks[Bound.UPPER]

  const userError: ReactNode | undefined = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <ThemedText.BodyPrimary fontWeight={500}>Connect Wallet</ThemedText.BodyPrimary>
    }

    if (!parsedAmount || parsedAmount.isZero()) {
      inputError = inputError ?? <ThemedText.BodyPrimary fontWeight={500}>Enter a margin amount</ThemedText.BodyPrimary>
    }

    // if (lowerTick === undefined || upperTick === undefined) {
    //   inputError = inputError ?? <ThemedText.BodyPrimary fontWeight={500}>Select a Range</ThemedText.BodyPrimary>
    // }

    const inputBalance = inputIsToken0 ? relevantTokenBalances[0] : relevantTokenBalances[1]
    if (inputBalance && parsedAmount && token0 && token1) {
      const parsedCurrencyAmount = BnToCurrencyAmount(parsedAmount, inputIsToken0 ? token0 : token1)
      if (parsedCurrencyAmount.greaterThan(inputBalance)) {
        inputError = inputError ?? (
          <ThemedText.BodyPrimary fontWeight={500}>Insufficient {inputBalance.currency.symbol}</ThemedText.BodyPrimary>
        )
      }
    }
    return inputError
  }, [parsedAmount, relevantTokenBalances, inputIsToken0, token0, token1, account])

  const [userSlippageTolerance] = useUserSlippageTolerance()

  const allowedSlippage = useMemo(() => {
    if (userSlippageTolerance === 'auto') return new Percent(JSBI.BigInt(3), JSBI.BigInt(100))
    else return userSlippageTolerance
  }, [userSlippageTolerance])

  const maxSlippageTick = useMemo(() => {
    const percent = parseFloat(allowedSlippage.toFixed(18))
    // 10 as 0.1%
    const tick = percent * 1000
    return tick
  }, [allowedSlippage])

  // specifies whether the lower and upper ticks is at the exteme bounds
  const ticksAtLimit = useMemo(
    () => ({
      [Bound.LOWER]: (poolKey?.fee && lowerTick === tickSpaceLimits.LOWER) ?? false,
      [Bound.UPPER]: (poolKey?.fee && upperTick === tickSpaceLimits.UPPER) ?? false,
    }),
    [tickSpaceLimits, lowerTick, upperTick, poolKey]
  )

  // always returns the price with 0 as base token
  const pricesAtTicks = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0?.wrapped, token1?.wrapped, ticks[Bound.LOWER]),
      [Bound.UPPER]: getTickToPrice(token0?.wrapped, token1?.wrapped, ticks[Bound.UPPER]),
    }
  }, [token0, token1, ticks])

  const queryEnabled = useMemo(() => {
    return !userError && inputApprovalState === ApprovalState.APPROVED
  }, [inputApprovalState, userError])

  const calldata = useMemo(() => {
    if (
      !parsedAmount ||
      !poolKey ||
      !account ||
      !queryEnabled ||
      !inputCurrency ||
      lowerTick === undefined ||
      upperTick === undefined ||
      !pool
    )
      return undefined
    const currentTick = pool.tickCurrent
    const lowerDelta = Math.abs(lowerTick - currentTick)
    const upperDelta = Math.abs(upperTick - currentTick)
    return NonfungiblePositionManager.INTERFACE.encodeFunctionData('zapAndMint', [
      {
        token0: poolKey.token0,
        token1: poolKey.token1,
        fee: poolKey.fee,
      },
      inputIsToken0 ? poolKey.token0 : poolKey.token1,
      parsedAmount.shiftedBy(inputCurrency.decimals).toFixed(0),
      lowerDelta,
      upperDelta,
      maxSlippageTick,
    ])
  }, [
    inputIsToken0,
    poolKey,
    inputCurrency,
    parsedAmount,
    account,
    queryEnabled,
    maxSlippageTick,
    upperTick,
    pool,
    lowerTick,
  ])

  const { result, error, loading } = useContractCallV2(
    LMT_NFT_POSITION_MANAGER,
    calldata,
    ['derivedZapInfo'],
    true,
    queryEnabled,
    (data: string) => {
      return NonfungiblePositionManager.INTERFACE.decodeFunctionResult('zapAndMint', data)
    }
  )

  const tradeState = useMemo(() => {
    if (loading) return ZapDerivedInfoState.LOADING
    if (error) return ZapDerivedInfoState.INVALID
    if (result) return ZapDerivedInfoState.VALID
    return ZapDerivedInfoState.INVALID
  }, [loading, error, result])

  const txnInfo: ZapTxnInfo | undefined = useMemo(() => {
    if (
      !result ||
      !token0 ||
      !token1 ||
      !poolKey ||
      !parsedAmount ||
      !result[0].amount0In ||
      !result[0].amount1In ||
      lowerTick === undefined ||
      upperTick === undefined ||
      !result[0].liquidity
    )
      return undefined
    return {
      token0Out: new BN(result[0].amount0In.toString()).shiftedBy(-token0.decimals),
      token1Out: new BN(result[0].amount1In.toString()).shiftedBy(-token1.decimals),
      liquidity: new BN(result[0].liquidity.toString()),
      poolKey,
      inputIsToken0,
      inputAmount: parsedAmount,
      lowerDelta: lowerTick,
      upperDelta: upperTick,
      maxSlippageTick,
      token0Remainder: new BN(result[0].token0Out.toString()).shiftedBy(-token0.decimals),
      token1Remainder: new BN(result[0].token1Out.toString()).shiftedBy(-token1.decimals),
    }
  }, [result, token0, token1, inputIsToken0, poolKey, parsedAmount, lowerTick, upperTick, maxSlippageTick])

  const contractError = useMemo(() => {
    let _error: ReactNode | undefined
    if (error) {
      _error = <Trans>{getErrorMessage(error)}</Trans>
    }

    return _error
  }, [error])

  return useMemo(() => {
    return {
      txnInfo,
      contractError,
      userError,
      tradeState,
      allowedSlippage,
      lowerPrice: pricesAtTicks[Bound.LOWER],
      upperPrice: pricesAtTicks[Bound.UPPER],
      lowerTick,
      upperTick,
      pricesAtLimit,
      invertPrice,
      ticksAtLimit,
    }
  }, [
    txnInfo,
    tradeState,
    contractError,
    userError,
    allowedSlippage,
    pricesAtTicks,
    lowerTick,
    upperTick,
    pricesAtLimit,
    invertPrice,
    ticksAtLimit,
  ])
}

const useZapCallback = (
  txnInfo: ZapTxnInfo | undefined,
  tradeState: ZapDerivedInfoState,
  token0: Currency | undefined,
  token1: Currency | undefined,
  pool: Pool | undefined,
  lowerTick: number | undefined,
  upperTick: number | undefined
) => {
  const account = useAccount().address
  const chainId = useChainId()
  const signer = useEthersSigner({ chainId })

  return useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('no account')
      if (!signer) throw new Error('no provider')
      if (!chainId) throw new Error('no chainId')
      if (tradeState !== ZapDerivedInfoState.VALID) throw new Error('invalid trade')
      if (!txnInfo || !token0 || !token1) throw new Error('no txnInfo')
      if (!pool) throw new Error('no pool')
      if (lowerTick === undefined || upperTick === undefined) throw new Error('no ticks')

      const currentTick = pool.tickCurrent

      const lowerDelta = Math.abs(lowerTick - currentTick)
      const upperDelta = Math.abs(upperTick - currentTick)
      const calldata = NonfungiblePositionManager.INTERFACE.encodeFunctionData('zapAndMint', [
        txnInfo.poolKey,
        txnInfo.inputIsToken0 ? txnInfo.poolKey.token0 : txnInfo.poolKey.token1,
        txnInfo.inputAmount.shiftedBy(txnInfo.inputIsToken0 ? token0.decimals : token1.decimals).toFixed(0),
        lowerDelta,
        upperDelta,
        txnInfo.maxSlippageTick,
      ])

      const tx = {
        from: account,
        to: LMT_NFT_POSITION_MANAGER[chainId],
        data: calldata,
      }

      let gasEstimate: BigNumber

      try {
        gasEstimate = await signer.estimateGas(tx)
      } catch (gasError) {
        throw Error('cannot estimate gas')
      }

      const gasLimit = calculateGasMargin(gasEstimate)
      const response = await signer.sendTransaction({ ...tx, gasLimit }).then((response) => {
        return response
      })
      return response
    } catch (err) {
      throw new Error(getErrorMessage(parseContractError(err)))
    }
  }, [account, chainId, signer, txnInfo, token0, token1, tradeState, lowerTick, upperTick, pool])
}

const MainWrapper = styled.div`
  display: flex;
  height: 520px;
  width: 100%;
  padding 10px;
    background: ${({ theme }) => theme.backgroundSurface};

  @media screen and (max-width: ${({ theme }) => theme.breakpoint.md}px) {
    height: 100%;
  }
  @media screen and (max-width: ${({ theme }) => theme.breakpoint.sm}px) {
    height: 500px;
    width: 98%;
    flex-direction: column;
    margin-left:.25rem;
  }
`

enum RANGE {
  SMALL,
  MEDIUM,
  LARGE,
  AUTO,
}

const ZapModal = (props: ZapModalProps) => {
  const { isOpen, onClose, apr, tvl, token0, token1, poolKey } = props
  
  const [inputIsToken0, setInputIsToken0] = useState(true)
  const [inputAmount, setInputAmount] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [baseIsToken0, setBaseIsToken0] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [leftRangeTypedValue, setLeftRangeTypedValue] = useState<string | boolean>('')
  const [rightRangeTypedValue, setRightRangeTypedValue] = useState<string | boolean>('')
  const [isInitialRender, setIsInitialRender] = useState(true)

  const baseCurrency = baseIsToken0 ? token0 : token1
  const quoteCurrency = baseIsToken0 ? token1 : token0

  const theme = useTheme()
  const rangeValues = {
    [RANGE.SMALL]: { min: 0.9, max: 1.1 },
    [RANGE.MEDIUM]: { min: 0.8, max: 1.2 },
    [RANGE.LARGE]: { min: 0.7, max: 1.3 },
    [RANGE.AUTO]: { min: 0, max: 0 },
  }

  const [poolState, pool] = usePool(token0 ?? undefined, token1 ?? undefined, poolKey?.fee)
  const token0Price = useMemo(() => {
    if (!pool) return undefined
    return new BN(pool.token0Price.toFixed(18))
  }, [pool])
  const noLiquidity = poolState === PoolState.NOT_EXISTS

  const onToggle = useCallback(() => {
    setShowSettings(!showSettings)
  }, [showSettings])
  const account = useAccount().address

  const inputCurrency = useMemo(() => {
    if (!token0 || !token1) return undefined
    if (inputIsToken0) {
      return token0
    } else {
      return token1
    }
  }, [token0, token1, inputIsToken0])

  const parsedAmount = useMemo(() => {
    return parseBN(inputAmount)
  }, [inputAmount])

  const chainId = useChainId()

  const [inputApprovalState, approveInputCurrency] = useApproveCallback(
    parsedAmount && inputCurrency ? BnToCurrencyAmount(parsedAmount, inputCurrency) : undefined,
    LMT_NFT_POSITION_MANAGER[chainId ?? SupportedChainId.ARBITRUM_ONE]
  )

  const [range, setRange] = useState<RANGE>(RANGE.LARGE)

  const {
    txnInfo,
    userError,
    contractError,
    tradeState,
    allowedSlippage,
    lowerTick,
    upperTick,
    upperPrice,
    lowerPrice,
    pricesAtLimit,
    invertPrice,
    ticksAtLimit,
  } = useDerivedZapInfo(
    inputAmount,
    inputIsToken0,
    poolKey,
    token0 ?? undefined,
    token1 ?? undefined,
    inputApprovalState,
    baseIsToken0,
    leftRangeTypedValue,
    rightRangeTypedValue
  )

  const handleSetRecommendedRange = useCallback(
    (leftRange: any, rightRange: any, _range: RANGE) => {
      const minPrice = pricesAtLimit[Bound.LOWER]
      if (minPrice && token0Price) {
        setLeftRangeTypedValue(
          ((invertPrice ? new BN(1).div(token0Price).toNumber() : token0Price.toNumber()) * leftRange)
            .toFixed(12)
            .toString()
        )
      }
      const maxPrice = pricesAtLimit[Bound.UPPER]
      if (maxPrice && token0Price) {
        setRightRangeTypedValue(
          ((invertPrice ? new BN(1).div(token0Price).toNumber() : token0Price.toNumber()) * rightRange)
            .toFixed(12)
            .toString()
        )
      }

      setRange(_range)
    },
    [pricesAtLimit, invertPrice, token0Price]
  )

  const callback = useZapCallback(
    txnInfo,
    tradeState,
    token0 ?? undefined,
    token1 ?? undefined,
    pool ?? undefined,
    lowerTick,
    upperTick
  )

  const addTransaction = useTransactionAdder()

  const inputAmountFiat = useUSDPriceBN(parsedAmount, inputCurrency)
  const token0OutputFiat = useUSDPriceBN(txnInfo?.token0Out, token0 ?? undefined)
  const token1OutputFiat = useUSDPriceBN(txnInfo?.token1Out, token1 ?? undefined)
  const token0RemainderFiat = useUSDPriceBN(txnInfo?.token0Remainder, token0 ?? undefined)
  const token1RemainderFiat = useUSDPriceBN(txnInfo?.token1Remainder, token1 ?? undefined)

  const inputNotApproved = inputApprovalState !== ApprovalState.APPROVED
  const invalidTrade = tradeState === ZapDerivedInfoState.INVALID
  const loadingTrade = tradeState === ZapDerivedInfoState.LOADING

  const handleZap = useCallback(() => {
    if (!callback) return

    callback()
      .then((response) => {
        addTransaction(response, {
          type: TransactionType.ZAP_AND_MINT,
          inputCurrencyId: token0?.wrapped.address ?? '',
          outputCurrencyId: token1?.wrapped.address ?? '',
          mintAmount: formatBNToString(txnInfo?.token0Out, NumberType.SwapTradeAmount),
          returnAmount: formatBNToString(txnInfo?.token0Remainder, NumberType.SwapTradeAmount),
        })
        setLeftRangeTypedValue('')
        setRightRangeTypedValue('')
        setInputAmount('')
        setShowSettings(false)
        setInputAmount('')
        setBaseIsToken0(true)
        onClose()
        setIsInitialRender(true)
      })
      .catch((error) => {
        console.error(error)
        setIsInitialRender(true)
      })
  }, [callback, token0, token1, addTransaction, onClose, txnInfo])

  useEffect(() => {
    if (inputAmount && isInitialRender) {
      handleSetRecommendedRange(rangeValues[RANGE.LARGE].min, rangeValues[RANGE.LARGE].max, RANGE.LARGE)
      setIsInitialRender(false)
      // console.log('useEffect', inputAmount,)
    }
  }, [inputAmount])
  // console.log('zapmodal wethMint: ',formatBNToString(txnInfo?.token0Out, NumberType.SwapTradeAmount),
  // 'wethOut: ', formatBNToString(txnInfo?.token0Remainder, NumberType.SwapTradeAmount))

  const maxInputCurrency = useCurrencyBalance(account ?? undefined, inputCurrency ?? undefined)
  const maxInputBalnace = maxAmountSpend(maxInputCurrency ?? undefined)
  const isMobile = useIsMobile()

  const LiquidtySelctorSection = (
    <LiquiditySelectorWrapper open={showDetails}>
      {!noLiquidity && (
        <Column style={{ background: `${theme.backgroundSurface}` }} gap="sm">
          <PriceAndToggleWrapper>
            {baseCurrency && quoteCurrency ? (
              <RateToggle
                currencyA={baseCurrency}
                currencyB={quoteCurrency}
                handleRateToggle={() => {
                  setBaseIsToken0(!baseIsToken0)
                  setLeftRangeTypedValue((invertPrice ? lowerPrice : upperPrice?.invert())?.toSignificant(6) ?? '')
                  setRightRangeTypedValue((invertPrice ? upperPrice : lowerPrice?.invert())?.toSignificant(6) ?? '')
                }}
              />
            ) : null}
            <ThemedText.BodySecondary marginTop="12px" marginBottom="8px">
              <Trans>Select Price Range</Trans>
            </ThemedText.BodySecondary>
            {token0Price && token0 && token1 && !noLiquidity && (
              <Trans>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'start',
                    alignItems: 'end',
                    gap: '5px',
                  }}
                >
                  <ThemedText.DeprecatedMain fontWeight={500} textAlign="start" fontSize={14} color="text">
                    Current Price:
                  </ThemedText.DeprecatedMain>
                  <ThemedText.DeprecatedBody fontWeight={500} textAlign="start" fontSize={14} color="textSecondary">
                    <HoverInlineText
                      maxCharacters={20}
                      text={
                        baseIsToken0
                          ? formatBNToString(token0Price, NumberType.FiatTokenPrice, true)
                          : formatBNToString(new BN(1).div(token0Price), NumberType.FiatTokenPrice, true)
                      }
                    />
                  </ThemedText.DeprecatedBody>
                  <ThemedText.DeprecatedBody textAlign="start" color="textSecondary" fontSize={11}>
                    {quoteCurrency?.symbol} per {baseCurrency?.symbol}
                  </ThemedText.DeprecatedBody>
                </div>
              </Trans>
            )}
          </PriceAndToggleWrapper>
          <Row style={{ background: `${theme.backgroundSurface}` }} gap="10px" marginTop="15px">
            <PresetsButtons
              btnName="-10% ~ +10% narrow"
              onSetRecommendedRange={() =>
                handleSetRecommendedRange(rangeValues[RANGE.SMALL].min, rangeValues[RANGE.SMALL].max, RANGE.SMALL)
              }
              active={range === RANGE.SMALL}
            />
            <PresetsButtons
              btnName="-20% ~ +20% middle"
              onSetRecommendedRange={() =>
                handleSetRecommendedRange(rangeValues[RANGE.MEDIUM].min, rangeValues[RANGE.MEDIUM].max, RANGE.MEDIUM)
              }
              active={range === RANGE.MEDIUM}
            />
            <PresetsButtons
              btnName="-30% ~ +30% wide"
              onSetRecommendedRange={() =>
                handleSetRecommendedRange(rangeValues[RANGE.LARGE].min, rangeValues[RANGE.LARGE].max, RANGE.LARGE)
              }
              active={range === RANGE.LARGE}
            />
          </Row>
        </Column>
      )}
      <LiquidityRangeSelector
        pool={pool}
        tickLower={lowerTick}
        tickUpper={upperTick}
        baseCurrency={baseCurrency ?? undefined}
        quoteCurrency={quoteCurrency ?? undefined}
        poolKey={poolKey}
        priceLower={lowerPrice}
        priceUpper={upperPrice}
        inverted={invertPrice}
      />
      {/* <LiquidityChartRangeInput
    currencyA={baseCurrency ?? undefined}
    currencyB={quoteCurrency ?? undefined}
    feeAmount={poolKey?.fee}
    ticksAtLimit={ticksAtLimit}
    price={
      token0Price ? (invertPrice ? new BN(1).div(token0Price).toNumber() : token0Price.toNumber()) : undefined
    }
    priceLower={lowerPrice}
    priceUpper={upperPrice}
    onLeftRangeInput={setLeftRangeTypedValue}
    onRightRangeInput={setRightRangeTypedValue}
    interactive={true}
  /> */}
    </LiquiditySelectorWrapper>
  )

  return (
    <LmtModal isOpen={isOpen} maxHeight={750} maxWidth={460} $scrollOverlay={true} onDismiss={() => onClose()}>
      <MainWrapper>
        <Wrapper>
          <Header>
            <DoubleCurrencyLogo size={26} currency0={token1} currency1={token0} />
            <ThemedText.SubHeader>
              {token0?.symbol}-{token1?.symbol}
            </ThemedText.SubHeader>
            <ThemedText.DeprecatedLabel fontSize={14} fontWeight={400}>
              APR: {apr ? apr?.toPrecision(4) + '%' : <LoadingBubble width="50px" height="12px" />}
            </ThemedText.DeprecatedLabel>
            <ThemedText.DeprecatedLabel fontSize={14} fontWeight={400}>
              TVL: {tvl ? '$' + tvl?.toFixed(2) : <LoadingBubble width="50px" height="12px" />}
            </ThemedText.DeprecatedLabel>
            <LmtSettingsTab
              isOpen={showSettings}
              onToggle={onToggle}
              allowedSlippage={allowedSlippage}
              isLimitOrder={false}
            />
          </Header>
          <InputWrapper>
            <ZapTokenPanel
              value={inputAmount}
              onUserInput={(val: string) => setInputAmount(val)}
              onMax={() => {
                setInputAmount(maxInputBalnace?.toExact() ?? '')
              }}
              showMaxButton={true}
              fiatValue={inputAmountFiat}
              id="1"
              currency={inputCurrency}
              otherCurrency={inputIsToken0 ? token1 : token0}
              onInputTokenChange={(currency: Currency) => {
                if (currency.wrapped.address.toLowerCase() === token0?.wrapped.address.toLowerCase()) {
                  setInputIsToken0(true)
                } else {
                  setInputIsToken0(false)
                }
              }}
            />
          </InputWrapper>
          <ArrowWrapper clickable={false}>
            <ArrowContainer style={{ rotate: '0deg' }} color="white">
              <ChevronDown size="11" />
            </ArrowContainer>
          </ArrowWrapper>
          <DetailsWrapper>
            <ThemedText.BodySecondary style={{ marginBottom: '5px' }}>Minted Amounts</ThemedText.BodySecondary>
            <InputWrapper2>
              <ZapOutputTokenPanel
                value={txnInfo?.token0Out ? formatBNToString(txnInfo.token0Out, NumberType.SwapTradeAmount) : '-'}
                onUserInput={(val: string) => {}}
                showMaxButton={false}
                fiatValue={token0OutputFiat}
                id="2"
                currency={token0}
                disabled={true}
                hideBalance={true}
              />
            </InputWrapper2>
            <InputWrapper2>
              <ZapOutputTokenPanel
                value={txnInfo?.token1Out ? formatBNToString(txnInfo.token1Out, NumberType.SwapTradeAmount) : '-'}
                onUserInput={(val: string) => {}}
                showMaxButton={false}
                fiatValue={token1OutputFiat}
                currency={token1}
                id="3"
                disabled={true}
                hideBalance={true}
              />
            </InputWrapper2>
            <ThemedText.BodySecondary style={{ marginBottom: '5px' }}>Returned Amount</ThemedText.BodySecondary>
            <InputWrapper2>
              {/* <ValueLabel /> */}
              <ZapOutputTokenPanel
                value={
                  txnInfo?.token0Remainder ? formatBNToString(txnInfo.token0Remainder, NumberType.SwapTradeAmount) : '-'
                }
                onUserInput={(val: string) => {}}
                showMaxButton={false}
                fiatValue={token0RemainderFiat}
                id="4"
                currency={token0}
                disabled={true}
                hideBalance={true}
              />
            </InputWrapper2>
            <InputWrapper2>
              <ZapOutputTokenPanel
                value={
                  txnInfo?.token1Remainder ? formatBNToString(txnInfo.token1Remainder, NumberType.SwapTradeAmount) : '-'
                }
                onUserInput={(val: string) => {}}
                showMaxButton={false}
                fiatValue={token1RemainderFiat}
                currency={token1}
                id="5"
                disabled={true}
                hideBalance={true}
              />
            </InputWrapper2>
          </DetailsWrapper>
          <StyledHeaderRow onClick={() => setShowDetails(!showDetails)} open={showDetails}>
            <RowFixed style={{ position: 'relative' }}>
              <Info size={14} />
              <ThemedText.BodySecondary fontSize={14} fontWeight={500} marginLeft="5px">
                Range Details{' '}
              </ThemedText.BodySecondary>
            </RowFixed>
            <RowFixed>
              <RotatingArrow stroke={theme.textTertiary} open={Boolean(showDetails)} />
              <MobileRotatingArrow stroke={theme.textTertiary} open={Boolean(showDetails)} />
            </RowFixed>
          </StyledHeaderRow>
          <RowFixed style={{ marginBottom: '10px' }}>
            <ThemedText.BodySecondary fontSize={11} fontWeight={500} marginLeft="5px">
              Limitless charges no fees for zapping. Fees are only paid for swaps in dexes + slippage
            </ThemedText.BodySecondary>
          </RowFixed>
          {/* {!noLiquidity && (
            <AnimatedDropdown open={showDetails}>
              <PriceAndToggle
                baseCurrency={baseCurrency}
                quoteCurrency={quoteCurrency}
                baseIsToken0={baseIsToken0}
                token0Price={token0Price}
                token0={token0}
                token1={token1}
                noLiquidity={noLiquidity}
                invertPrice={invertPrice}
                lowerPrice={lowerPrice}
                upperPrice={upperPrice}
                range={range}
                setBaseIsToken0={setBaseIsToken0}
                setLeftRangeTypedValue={setLeftRangeTypedValue}
                setRightRangeTypedValue={setRightRangeTypedValue}
                handleSetRecommendedRange={handleSetRecommendedRange}
              />
            </AnimatedDropdown>
          )} */}
          {!noLiquidity && isMobile && showDetails && <>{LiquidtySelctorSection}</>}
          {!account ? (
            <SmallButtonPrimary padding="16px">
              <ThemedText.BodyPrimary fontWeight={500}>Connect Wallet</ThemedText.BodyPrimary>
            </SmallButtonPrimary>
          ) : !userError && inputNotApproved ? (
            <SmallButtonPrimary
              onClick={approveInputCurrency}
              disabled={inputApprovalState === ApprovalState.PENDING}
              padding="16px"
            >
              {inputApprovalState === ApprovalState.PENDING ? (
                <>
                  <Loader size="20px" />
                  <ThemedText.BodyPrimary fontWeight={500}>Approval pending</ThemedText.BodyPrimary>
                </>
              ) : (
                <>
                  <MouseoverTooltip
                    text={
                      <ThemedText.BodyPrimary fontWeight={500}>
                        Permission is required for Limitless to use each token.{' '}
                        {inputCurrency ? `Allowance of ${inputAmount} ${inputCurrency?.symbol} required.` : null}
                      </ThemedText.BodyPrimary>
                    }
                  >
                    <RowBetween>
                      <Info size={20} />{' '}
                      <ThemedText.BodyPrimary fontWeight={500}>
                        {' '}
                        Approve use of {inputCurrency?.symbol}
                      </ThemedText.BodyPrimary>
                    </RowBetween>
                  </MouseoverTooltip>
                </>
              )}
            </SmallButtonPrimary>
          ) : (
            <SmallButtonPrimary onClick={handleZap} disabled={invalidTrade || !txnInfo} padding="16px">
              {userError ? (
                userError
              ) : contractError ? (
                contractError
              ) : invalidTrade ? (
                <ThemedText.BodyPrimary fontWeight={500}>Invalid Trade</ThemedText.BodyPrimary>
              ) : loadingTrade ? (
                <>
                  <Loader size="20px" />
                  <ThemedText.BodyPrimary fontWeight={500}>Finding Best Price ...</ThemedText.BodyPrimary>
                </>
              ) : (
                <MouseoverTooltip text="Limitless charges no fees for zapping. Fees are only paid for swaps in dexes + slippage">
                  <ThemedText.BodyPrimary fontWeight={500}>Execute</ThemedText.BodyPrimary>
                </MouseoverTooltip>
              )}
            </SmallButtonPrimary>
          )}
        </Wrapper>
        {!isMobile && <AnimatedDropSide open={showDetails}>{LiquidtySelctorSection}</AnimatedDropSide>}
      </MainWrapper>
    </LmtModal>
  )
}

export default ZapModal
