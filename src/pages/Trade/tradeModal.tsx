import { Trans } from '@lingui/macro'
import { Button } from '@mui/material'
import { Trace } from '@uniswap/analytics'
import { InterfaceSectionName } from '@uniswap/analytics-events'
import { formatNumberOrString, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import AnimatedDropdown from 'components/AnimatedDropdown'
import { BaseSwapPanel, MarginSelectPanel } from 'components/BaseSwapPanel/BaseSwapPanel'
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { GrayCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Icons/LoadingSpinner'
import { TextWithLoadingPlaceholder } from 'components/modalFooters/common'
import { Input as NumericalInput } from 'components/NumericalInput'
import { PremiumCurrencySelector } from 'components/PremiumCurrencySelector'
import PriceToggle from 'components/PriceToggle/PriceToggle'
import { RowBetween, RowFixed } from 'components/Row'
import DiscreteSliderMarks from 'components/Slider/MUISlider'
import { ConfirmAddLimitOrderModal } from 'components/swap/ConfirmAddLimitModal'
import { AddMarginPositionConfirmModal } from 'components/swap/ConfirmSwapModal'
import { AddLimitDetailsDropdown, LeverageDetailsDropdown } from 'components/swap/SwapDetailsDropdown'
import SwapHeader from 'components/swap/SwapHeader'
import { MouseoverTooltip } from 'components/Tooltip'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { LMT_MARGIN_FACILITY } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { useCurrency } from 'hooks/Tokens'
import { useAddLimitOrderCallback } from 'hooks/useAddLimitOrder'
import { useAddPositionCallback } from 'hooks/useAddPositionCallBack'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
// import { useBestPool } from 'hooks/useBestPool'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { PoolState, usePool } from 'hooks/usePools'
import { useUSDPriceBNV2 } from 'hooks/useUSDPrice'
import { useCurrencyBalances } from 'lib/hooks/useCurrencyBalance'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useCallback, useMemo, useState } from 'react'
import { Info } from 'react-feather'
import { MarginField } from 'state/marginTrading/actions'
import {
  AddLimitTrade,
  AddMarginTrade,
  useDerivedAddPositionInfo,
  useDerivedLimitAddPositionInfo,
  useMarginTradingActionHandlers,
  useMarginTradingState,
} from 'state/marginTrading/hooks'
import { LeverageTradeState, LimitTradeState } from 'state/routing/types'
import { Field } from 'state/swap/actions'
import { useSwapActionHandlers } from 'state/swap/hooks'
import { useCurrentInputCurrency, useCurrentOutputCurrency, useCurrentPool } from 'state/user/hooks'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { maxAmountSpend } from 'utils/maxAmountSpend'

// import { styled } from '@mui/system';
import {
  DetailsSwapSection,
  InputHeader,
  InputSection,
  LeverageGaugeSection,
  LeverageInputSection,
  OutputSwapSection,
  StyledNumericalInput,
} from '.'

const Wrapper = styled.div`
  padding: 0.75rem;
  padding-left: 1rem;
  padding-right: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  background-color: ${({ theme }) => theme.backgroundSurface};
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  width: 365px;
  ::-webkit-scrollbar {
    display: none;
  }
  ::-webkit-scrollbar-track {
    margin-top: 5px;
  }
`
const LimitInputWrapper = styled.div`
  margin-top: 5px;
`

export const Filter = styled.div`
  display: flex;
  align-items: start;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  width: fit-content;
`

export const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const LimitInputRow = styled.div`
  display: flex;
  margin-right: 0.25rem;
`
const OpacityHoverState = css`
  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }

  &:active {
    opacity: ${({ theme }) => theme.opacity.click};
  }

  transition: ${({
    theme: {
      transition: { duration, timing },
    },
  }) => `opacity ${duration.medium} ${timing.ease}`};
`

const StyledLeverageInput = styled(NumericalInput)`
  width: 4.2rem;
  text-align: right;
  padding-right: 5px;
  padding-left: 5px;
  height: 20px;
  line-height: 12px;
  font-size: 14px;
  border-radius: 10px;
`

export const PriceToggleSection = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.backgroundSurface};
  color: ${({ theme }) => theme.textSecondary};

  line-height: 20px;

  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
`

export const DynamicSection = styled(AutoColumn)<{ disabled?: boolean }>`
  opacity: ${({ disabled }) => (disabled ? '0.2' : '1')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'initial')};
`

const LimitInputPrice = styled(AutoColumn)`
  background-color: ${({ theme }) => theme.surface1};
  border-radius: 10px;
  margin-top: 10px;
  padding: 16px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  &:focus-within {
    border: 1px solid ${({ theme }) => theme.accentActive};
  }
`

const PriceSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`

export const StyledSelectorText = styled(ThemedText.BodySmall)<{ active: boolean }>`
  color: ${({ theme, active }) => (active ? theme.textSecondary : theme.textPrimary)};
`

export const Selector = styled.div<{ active: boolean }>`
  padding: 5px 7px;
  border-radius: 10px;
  background: ${({ active, theme }) => (active ? theme.background : 'none')};
  cursor: pointer;

  ${OpacityHoverState}
`

const TradeTabContent = () => {
  // const theme = useTheme()
  const { account, chainId } = useWeb3React()
  const currentPool = useCurrentPool()
  const poolKey = currentPool?.poolKey
  const { onUserInput, onSetMarginInPosToken } = useSwapActionHandlers()
  const inputCurrency = useCurrentInputCurrency()
  const outputCurrency = useCurrentOutputCurrency()
  const relevantTokenBalances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [inputCurrency ?? undefined, outputCurrency ?? undefined], [inputCurrency, outputCurrency])
  )

  const currencyBalances = useMemo(
    () => ({
      [Field.INPUT]: relevantTokenBalances[0],
      [Field.OUTPUT]: relevantTokenBalances[1],
    }),
    [relevantTokenBalances]
  )

  // console.log('-------currencyBalances, currencies----------')
  const [{ showConfirm, attemptingTxn, txHash, tradeToConfirm, tradeErrorMessage }, setTradeState] = useState<{
    attemptingTxn: boolean
    txHash: string | undefined
    showConfirm: boolean
    tradeToConfirm: AddMarginTrade | undefined
    tradeErrorMessage: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    txHash: undefined,
    tradeErrorMessage: undefined,
  })

  const [
    {
      attemptingTxn: lmtAttemptingTxn,
      txHash: lmtTxHash,
      showConfirm: lmtShowConfirm,
      errorMessage: lmtErrorMessage,
      limitTradeConfirm,
    },
    setLimitState,
  ] = useState<{
    attemptingTxn: boolean
    txHash: string | undefined
    showConfirm: boolean
    limitTradeConfirm: AddLimitTrade | undefined
    errorMessage: string | undefined
  }>({
    showConfirm: false,
    limitTradeConfirm: undefined,
    attemptingTxn: false,
    txHash: undefined,
    errorMessage: undefined,
  })

  const {
    [MarginField.MARGIN]: margin,
    [MarginField.LEVERAGE_FACTOR]: leverageFactor,
    isLimitOrder,
    startingPrice,
    baseCurrencyIsInputToken,
    marginInPosToken,
    premiumInPosToken,
  } = useMarginTradingState()

  const token0 = useCurrency(poolKey?.token0 ?? undefined)
  const token1 = useCurrency(poolKey?.token1 ?? undefined)

  const {
    onLeverageFactorChange,
    onMarginChange,
    onChangeTradeType,
    onPriceInput,
    onPriceToggle,
    onPremiumCurrencyToggle,
  } = useMarginTradingActionHandlers()

  const handleSetMarginInPosToken = useCallback(() => {
    if (marginInPosToken) {
      onPremiumCurrencyToggle(false)
    }
    if (!marginInPosToken) {
      onPremiumCurrencyToggle(true)
    }
    onSetMarginInPosToken(!marginInPosToken)
    onLeverageFactorChange('')
    onMarginChange('')
  }, [onSetMarginInPosToken, marginInPosToken, onLeverageFactorChange, onMarginChange, onPremiumCurrencyToggle])

  const [poolState, pool] = usePool(token0 ?? undefined, token1 ?? undefined, poolKey?.fee ?? undefined)
  const poolNotFound = poolState !== PoolState.EXISTS
  const {
    trade,
    tradeApprovalInfo,
    state: tradeState,
    inputError,
    existingPosition,
    allowedSlippage,
    contractError,
    userPremiumPercent,
    maxLeverage,
    userHasSpecifiedInputOutput,
  } = useDerivedAddPositionInfo(
    margin ?? undefined,
    leverageFactor ?? undefined,
    pool ?? undefined,
    inputCurrency?.wrapped.address,
    outputCurrency?.wrapped.address
  )

  const {
    orderKey,
    contractError: limitContractError,
    inputError: limitInputError,
    state: limitTradeState,
    trade: limitTrade,
    userHasSpecifiedInputOutput: limitUserHasSpecifiedInputOutput,
  } = useDerivedLimitAddPositionInfo(
    margin ?? undefined,
    leverageFactor ?? undefined,
    startingPrice,
    baseCurrencyIsInputToken,
    pool ?? undefined,
    inputCurrency ?? undefined, // currencies[Field.INPUT] ?? undefined,
    outputCurrency ?? undefined,
    allowedSlippage
  )

  const { callback: addLimitCallback } = useAddLimitOrderCallback(limitTrade)

  // allowance / approval
  const [inputApprovalState, approveInputCurrency] = useApproveCallback(
    tradeApprovalInfo?.inputApprovalAmount,
    LMT_MARGIN_FACILITY[chainId ?? SupportedChainId.SEPOLIA]
  )

  const [outputApprovalState, approveOutputCurrency] = useApproveCallback(
    tradeApprovalInfo?.outputApprovalAmount,
    LMT_MARGIN_FACILITY[chainId ?? SupportedChainId.SEPOLIA]
  )

  const notApproved =
    marginInPosToken || premiumInPosToken
      ? inputApprovalState !== ApprovalState.APPROVED || outputApprovalState !== ApprovalState.APPROVED
      : inputApprovalState !== ApprovalState.APPROVED

  const noTradeInputError = useMemo(() => {
    return !inputError
  }, [inputError])

  const toggleWalletDrawer = useToggleWalletDrawer()
  const maxInputAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(marginInPosToken ? currencyBalances[Field.OUTPUT] : currencyBalances[Field.INPUT]),
    [currencyBalances, marginInPosToken]
  )

  const swapIsUnsupported = useIsSwapUnsupported(inputCurrency, outputCurrency)

  const fiatValueTradeMargin = useUSDPriceBNV2(
    trade?.margin,
    (marginInPosToken ? outputCurrency : inputCurrency) ?? undefined
  )

  const fiatValueTradeOutput = useUSDPriceBNV2(trade?.expectedAddedOutput, outputCurrency ?? undefined)

  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !trade?.margin?.isEqualTo(maxInputAmount.toExact()))

  const [formattedMargin, ,] = useMemo(() => {
    return [
      margin ? margin : '',
      margin && leverageFactor && Number(leverageFactor) > 1
        ? (Number(margin) * Number(leverageFactor)).toString()
        : '',
      leverageFactor ? formatNumberOrString(leverageFactor, NumberType.SwapTradeAmount) : '',
    ]
  }, [margin, leverageFactor])

  const [invalidTrade, tradeIsLoading, tradeNotFound] = useMemo(
    () => [
      tradeState === LeverageTradeState.INVALID,
      LeverageTradeState.LOADING === tradeState || LeverageTradeState.SYNCING === tradeState,
      tradeState === LeverageTradeState.NO_ROUTE_FOUND,
    ],
    [tradeState]
  )

  const lmtIsValid = useMemo(() => limitTradeState === LimitTradeState.VALID, [limitTradeState])
  const lmtIsLoading = useMemo(
    () => limitTradeState === LimitTradeState.LOADING || limitTradeState === LimitTradeState.SYNCING,
    [limitTradeState]
  )

  const handleCancel = useCallback(() => {
    setTradeState((currentState) => ({
      ...currentState,
      showConfirm: false,
      tradeErrorMessage: undefined,
      txHash: undefined,
      attemptingTxn: false,
    }))
    setLimitState((currentState) => ({
      ...currentState,
      showConfirm: false,
      errorMessage: undefined,
      txHash: undefined,
      attemptingTxn: false,
    }))
  }, [])

  const handleConfirmDismiss = useCallback(() => {
    setTradeState((currentState) => ({
      ...currentState,
      showConfirm: false,
      tradeErrorMessage: undefined,
      txHash: undefined,
      attemptingTxn: false,
    }))
    setLimitState((currentState) => ({
      ...currentState,
      showConfirm: false,
      errorMessage: undefined,
      txHash: undefined,
      attemptingTxn: false,
    }))
    if (txHash) {
      onUserInput(Field.INPUT, '')
      onMarginChange('')
      onLeverageFactorChange('')
      onPriceInput('')
    }

    if (lmtTxHash) {
      onUserInput(Field.INPUT, '')
      onMarginChange('')
      onLeverageFactorChange('')
      onPriceInput('')
    }
  }, [onUserInput, onMarginChange, onLeverageFactorChange, lmtTxHash, txHash, onPriceInput])

  const handleMarginInput = useCallback(
    (value: string) => {
      onMarginChange(value)
    },
    [onMarginChange]
  )

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onMarginChange(maxInputAmount.toExact())
  }, [maxInputAmount, onMarginChange])

  const [debouncedLeverageFactor, onDebouncedLeverageFactor] = useDebouncedChangeHandler(
    leverageFactor ?? '',
    onLeverageFactorChange
  )

  const [baseCurrency, quoteCurrency] = useMemo(() => {
    if (baseCurrencyIsInputToken) {
      return [inputCurrency, outputCurrency]
    } else {
      return [outputCurrency, inputCurrency]
    }
  }, [inputCurrency, outputCurrency, baseCurrencyIsInputToken])

  const { callback: addPositionCallback } = useAddPositionCallback(
    trade,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
    allowedSlippage
  )

  const handleAddPosition = useCallback(() => {
    if (!addPositionCallback) {
      return
    }
    setTradeState((currentState) => ({ ...currentState, attemptingTxn: true }))

    addPositionCallback()
      .then((hash) => {
        setTradeState((currentState) => ({ ...currentState, txHash: hash, attemptingTxn: false }))
      })
      .catch((error) => {
        setTradeState((currentState) => ({
          ...currentState,
          attemptingTxn: false,
          txHash: undefined,
          tradeErrorMessage: error.message,
        }))
      })
  }, [addPositionCallback])

  const handleAddLimit = useCallback(() => {
    if (!addLimitCallback) {
      return
    }
    setLimitState((currentState) => ({ ...currentState, attemptingTxn: true }))

    addLimitCallback()
      .then((hash) => {
        setLimitState((currentState) => ({ ...currentState, txHash: hash, attemptingTxn: false }))
      })
      .catch((error) => {
        setLimitState((currentState) => ({
          ...currentState,
          attemptingTxn: false,
          txHash: undefined,
          errorMessage: error.message,
        }))
      })
  }, [addLimitCallback])

  const updateInputAllowance = useCallback(async () => {
    try {
      await approveInputCurrency()
    } catch (err) {
      console.log('approveInputCurrency err: ', err)
    }
  }, [approveInputCurrency])

  const updateOutputAllowance = useCallback(async () => {
    try {
      await approveOutputCurrency()
    } catch (err) {
      console.log('approveOutputCurrency err: ', err)
    }
  }, [approveOutputCurrency])

  const currentPrice = useMemo(() => {
    if (pool && inputCurrency && outputCurrency) {
      const inputIsToken0 = inputCurrency.wrapped.sortsBefore(outputCurrency.wrapped)
      const baseIsToken0 = (baseCurrencyIsInputToken && inputIsToken0) || (!baseCurrencyIsInputToken && !inputIsToken0)
      if (baseIsToken0) {
        return formatBNToString(new BN(pool.token0Price.toFixed(18)), NumberType.FiatTokenPrice, true)
      } else {
        return formatBNToString(new BN(pool.token1Price.toFixed(18)), NumberType.FiatTokenPrice, true)
      }
    }
    return undefined
  }, [baseCurrencyIsInputToken, pool, inputCurrency, outputCurrency])

  const existingPositionOpen = existingPosition && existingPosition.openTime > 0

  return (
    <Wrapper>
      <AddMarginPositionConfirmModal
        isOpen={showConfirm}
        originalTrade={tradeToConfirm}
        trade={trade}
        tradeApprovalInfo={tradeApprovalInfo}
        onConfirm={handleAddPosition}
        onDismiss={handleConfirmDismiss}
        onAcceptChanges={() => {
          return
        }}
        onCancel={handleCancel}
        existingPosition={existingPosition}
        attemptingTxn={attemptingTxn}
        txHash={txHash}
        allowedSlippage={trade?.allowedSlippage ?? new Percent(0)}
        tradeErrorMessage={tradeErrorMessage ? <Trans>{tradeErrorMessage}</Trans> : undefined}
        outputCurrency={outputCurrency ?? undefined}
        inputCurrency={inputCurrency ?? undefined}
      />
      <ConfirmAddLimitOrderModal
        isOpen={lmtShowConfirm}
        trade={limitTrade}
        originalTrade={limitTradeConfirm}
        onConfirm={handleAddLimit}
        onDismiss={handleConfirmDismiss}
        onAcceptChanges={() => {
          return
        }}
        onCancel={handleCancel}
        attemptingTxn={lmtAttemptingTxn}
        txHash={lmtTxHash}
        tradeErrorMessage={lmtErrorMessage ? <Trans>{lmtErrorMessage}</Trans> : undefined}
      />
      <SwapHeader
        allowedSlippage={allowedSlippage}
        autoPremiumDepositPercent={userPremiumPercent}
        isLimitOrder={isLimitOrder}
      />
      <FilterWrapper>
        <Filter onClick={() => onChangeTradeType(!isLimitOrder)}>
          <Selector active={!isLimitOrder}>
            <StyledSelectorText lineHeight="20px" active={!isLimitOrder}>
              Market
            </StyledSelectorText>
          </Selector>
          <Selector active={isLimitOrder}>
            <StyledSelectorText lineHeight="20px" active={isLimitOrder}>
              Limit
            </StyledSelectorText>
          </Selector>
        </Filter>
        <PremiumCurrencySelector
          inputCurrency={inputCurrency}
          outputCurrency={outputCurrency}
          premiumInPosToken={premiumInPosToken}
          onPremiumCurrencyToggle={() => onPremiumCurrencyToggle(!premiumInPosToken)}
        />
      </FilterWrapper>
      <LimitInputWrapper>
        <AnimatedDropdown open={isLimitOrder}>
          <DynamicSection disabled={false}>
            <RowBetween gap="20px">
              {Boolean(baseCurrency && quoteCurrency) && (
                <PriceToggleSection>
                  <PriceToggle
                    currencyA={baseCurrency as Currency}
                    currencyB={quoteCurrency as Currency}
                    handlePriceToggle={() => {
                      onPriceToggle(!baseCurrencyIsInputToken)
                      if (startingPrice && startingPrice !== '') {
                        onPriceInput(new BN(1).div(new BN(startingPrice)).toFixed())
                      }
                    }}
                  />
                </PriceToggleSection>
              )}
              <PriceSection onClick={() => onPriceToggle(!baseCurrencyIsInputToken)}>
                <ThemedText.DeprecatedMain fontWeight={535} fontSize={12} color="text1">
                  Current Price
                </ThemedText.DeprecatedMain>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <ThemedText.DeprecatedBody fontWeight={535} fontSize={12} color="textSecondary">
                    {currentPrice ? `${currentPrice} ${quoteCurrency?.symbol} per ${baseCurrency?.symbol}` : '-'}
                  </ThemedText.DeprecatedBody>
                </div>
              </PriceSection>
            </RowBetween>
            <LimitInputPrice>
              <Trans>
                <ThemedText.BodySecondary>Limit Price </ThemedText.BodySecondary>{' '}
              </Trans>
              <LimitInputRow>
                <StyledNumericalInput
                  onUserInput={onPriceInput}
                  value={startingPrice ?? ''}
                  disabled={true}
                  placeholder="Coming Soon"
                  className="limit-amount-input"
                ></StyledNumericalInput>
                <RowFixed>
                  {baseCurrency && (
                    <Button
                      sx={{ textTransform: 'none' }}
                      onClick={() => {
                        onPriceToggle(!baseCurrencyIsInputToken)
                        if (startingPrice && startingPrice !== '') {
                          onPriceInput(new BN(1).div(new BN(startingPrice)).toFixed())
                        }
                      }}
                    >
                      <ThemedText.BodySmall>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {baseCurrency && (
                            <ThemedText.DeprecatedBody color="text2" fontSize={12}>
                              {quoteCurrency?.symbol} per {baseCurrency.symbol}
                            </ThemedText.DeprecatedBody>
                          )}
                        </div>
                      </ThemedText.BodySmall>
                    </Button>
                  )}
                </RowFixed>
              </LimitInputRow>
            </LimitInputPrice>
          </DynamicSection>
        </AnimatedDropdown>
      </LimitInputWrapper>
      <div style={{ display: 'relative' }}>
        <InputSection>
          {existingPosition && existingPositionOpen ? (
            <InputHeader style={{ marginBottom: '5px' }}>
              <ThemedText.BodySecondary fontWeight={400}>
                <Trans>Margin</Trans>
              </ThemedText.BodySecondary>
            </InputHeader>
          ) : (
            <InputHeader>
              <ThemedText.BodySecondary fontWeight={400}>
                <Trans>Margin</Trans>
              </ThemedText.BodySecondary>
            </InputHeader>
          )}
          <Trace section={InterfaceSectionName.CURRENCY_INPUT_PANEL}>
            <MarginSelectPanel
              value={formattedMargin}
              showMaxButton={showMaxButton}
              inputCurrency={inputCurrency ?? null}
              onUserInput={handleMarginInput}
              onMax={handleMaxInput}
              fiatValue={fiatValueTradeMargin}
              outputCurrency={outputCurrency ?? null}
              id={InterfaceSectionName.CURRENCY_INPUT_PANEL}
              loading={false}
              premium={tradeApprovalInfo?.additionalPremium}
              showPremium={false}
              existingPosition={existingPosition && existingPositionOpen}
              marginInPosToken={existingPositionOpen ? existingPosition?.marginInPosToken : marginInPosToken}
              onMarginTokenChange={handleSetMarginInPosToken}
            />
          </Trace>
        </InputSection>
        <OutputSwapSection showDetailsDropdown={false}>
          <InputHeader>
            <ThemedText.BodySecondary>
              <Trans>Long</Trans>
            </ThemedText.BodySecondary>
          </InputHeader>
          <Trace section={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}>
            <BaseSwapPanel
              value={
                !isLimitOrder
                  ? tradeState !== LeverageTradeState.VALID || !trade
                    ? '-'
                    : formatBNToString(trade.expectedAddedOutput, NumberType.SwapTradeAmount)
                  : limitTradeState !== LimitTradeState.VALID || !limitTrade
                  ? '-'
                  : formatBNToString(limitTrade.startOutput, NumberType.SwapTradeAmount)
              }
              onUserInput={() => 0}
              showMaxButton={false}
              hideBalance={false}
              fiatValue={fiatValueTradeOutput}
              currency={outputCurrency ?? null}
              otherCurrency={inputCurrency ?? null}
              showCommonBases={true}
              id={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}
              loading={tradeIsLoading}
              disabled={true}
              bothCurrencies={true}
            />
          </Trace>
        </OutputSwapSection>
      </div>
      <LeverageGaugeSection>
        <AutoColumn gap="md">
          <RowBetween>
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <ThemedText.DeprecatedMain fontWeight={400}>
                <Trans>Leverage</Trans>
              </ThemedText.DeprecatedMain>
              <MouseoverTooltip
                text={
                  <Trans>
                    Maximum leverage is dependent on current liquidity conditions. If you desire higher leverage, you
                    will need to lower your margin.
                  </Trans>
                }
              >
                <RowBetween width="max-content">
                  <ThemedText.DeprecatedBody marginRight="3px" fontWeight={400} fontSize={12} color="text2">
                    <Trans>Max:</Trans>
                  </ThemedText.DeprecatedBody>
                  <TextWithLoadingPlaceholder syncing={false} width={50}>
                    <ThemedText.BodySmall color="textSecondary" textAlign="right">
                      {maxLeverage ? `${formatBNToString(maxLeverage, NumberType.SwapTradeAmount)}` : '-'}
                    </ThemedText.BodySmall>
                  </TextWithLoadingPlaceholder>
                </RowBetween>
              </MouseoverTooltip>
            </div>
            <RowBetween style={{ flexWrap: 'nowrap', justifyContent: 'end' }}>
              <LeverageInputSection>
                <StyledLeverageInput
                  className="token-amount-input"
                  value={debouncedLeverageFactor ?? ''}
                  placeholder="1.5x"
                  onUserInput={(str: string) => {
                    if (str === '') {
                      onDebouncedLeverageFactor('')
                    } else if (!!str && Number(str) >= 0) {
                      if (Number(str) > 100) {
                        return
                      }
                      if (Number(str) >= 0) {
                        onDebouncedLeverageFactor(str)
                      }
                    }
                  }}
                  disabled={false}
                />
              </LeverageInputSection>
            </RowBetween>
          </RowBetween>

          <>
            <DiscreteSliderMarks
              max={parseInt(`${Number(formatBNToString(maxLeverage, NumberType.SwapTradeAmount))}`, 10)}
              initialValue={
                debouncedLeverageFactor === '' ? 0 : Math.round(Number(debouncedLeverageFactor) * 1000) / 1000
              }
              maxLeverage={maxLeverage ? `${formatBNToString(maxLeverage, NumberType.SwapTradeAmount)}` : null}
              onChange={(val) => onDebouncedLeverageFactor(val.toString())}
            />
          </>
        </AutoColumn>
      </LeverageGaugeSection>
      <DetailsSwapSection>
        {!isLimitOrder ? (
          <LeverageDetailsDropdown
            trade={trade}
            tradeApprovalInfo={tradeApprovalInfo}
            existingPosition={existingPosition}
            loading={tradeIsLoading}
            allowedSlippage={trade?.allowedSlippage ?? new Percent(0)}
          />
        ) : (
          <AddLimitDetailsDropdown trade={limitTrade} loading={false} />
        )}
      </DetailsSwapSection>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
        {!isLimitOrder &&
          (swapIsUnsupported ? (
            <ButtonPrimary disabled={true}>
              <ThemedText.DeprecatedMain mb="4px">
                <Trans>Unsupported Asset</Trans>
              </ThemedText.DeprecatedMain>
            </ButtonPrimary>
          ) : !account ? (
            <ButtonLight
              style={{ fontSize: '14px', borderRadius: '10px' }}
              width="100%"
              padding=".5rem"
              onClick={toggleWalletDrawer}
              fontWeight={600}
            >
              <Trans>Connect Wallet</Trans>
            </ButtonLight>
          ) : poolNotFound ? (
            <GrayCard style={{ textAlign: 'center' }}>
              <ThemedText.DeprecatedMain mb="4px">
                <Trans>Insufficient liquidity for this trade.</Trans>
              </ThemedText.DeprecatedMain>
            </GrayCard>
          ) : tradeNotFound && userHasSpecifiedInputOutput && !tradeIsLoading ? (
            <GrayCard style={{ textAlign: 'center' }}>
              <ThemedText.DeprecatedMain mb="4px">
                <Trans>Insufficient liquidity for this trade.</Trans>
              </ThemedText.DeprecatedMain>
            </GrayCard>
          ) : noTradeInputError && notApproved ? (
            <>
              <ButtonPrimary
                onClick={updateInputAllowance}
                style={{ fontSize: '14px', borderRadius: '10px' }}
                width="100%"
                padding=".5rem"
                disabled={inputApprovalState === ApprovalState.PENDING}
              >
                {inputApprovalState === ApprovalState.PENDING ? (
                  <>
                    <Loader size="20px" />
                    <Trans>Approval pending</Trans>
                  </>
                ) : (
                  <>
                    <MouseoverTooltip
                      text={
                        <Trans>
                          Permission is required for Limitless to use each token.{' '}
                          {tradeApprovalInfo && formattedMargin
                            ? `Allowance of ${
                                !marginInPosToken
                                  ? formatNumberOrString(
                                      Number(tradeApprovalInfo.additionalPremium.toExact()) + Number(formattedMargin),
                                      NumberType.SwapTradeAmount
                                    )
                                  : formatNumberOrString(
                                      Number(tradeApprovalInfo.additionalPremium.toExact()),
                                      NumberType.SwapTradeAmount
                                    )
                              } ${inputCurrency?.symbol} required.`
                            : null}
                        </Trans>
                      }
                    >
                      <RowBetween>
                        <Info size={20} />
                        <Trans>Approve use of {inputCurrency?.symbol}</Trans>
                      </RowBetween>
                    </MouseoverTooltip>
                  </>
                )}
              </ButtonPrimary>
              {marginInPosToken && (
                <ButtonPrimary
                  onClick={updateOutputAllowance}
                  style={{ fontSize: '14px', borderRadius: '10px' }}
                  width="100%"
                  padding=".5rem"
                  disabled={inputApprovalState === ApprovalState.PENDING}
                >
                  {inputApprovalState === ApprovalState.PENDING ? (
                    <>
                      <Loader size="20px" />
                      <Trans>Approval pending</Trans>
                    </>
                  ) : (
                    <>
                      <MouseoverTooltip
                        text={
                          <Trans>
                            Permission is required for Limitless to use each token.{' '}
                            {tradeApprovalInfo && formattedMargin
                              ? `Allowance of ${formatNumberOrString(
                                  Number(formattedMargin),
                                  NumberType.SwapTradeAmount
                                )} ${inputCurrency?.symbol} required.`
                              : null}
                          </Trans>
                        }
                      >
                        <RowBetween>
                          <Info size={20} />
                          <Trans>Approve use of {outputCurrency?.symbol}</Trans>
                        </RowBetween>
                      </MouseoverTooltip>
                    </>
                  )}
                </ButtonPrimary>
              )}
            </>
          ) : (
            <ButtonError
              style={{ fontSize: '14px', borderRadius: '10px' }}
              width="100%"
              padding=".25rem"
              onClick={() => {
                setTradeState((currentState) => ({ ...currentState, tradeToConfirm: trade, showConfirm: true }))
              }}
              id="leverage-button"
              disabled={!noTradeInputError || tradeIsLoading || invalidTrade}
            >
              <ThemedText.BodyPrimary fontWeight={600}>
                {inputError ? (
                  inputError
                ) : contractError ? (
                  contractError
                ) : invalidTrade ? (
                  <Trans>Invalid Trade</Trans>
                ) : tradeIsLoading ? (
                  <Trans>Execute</Trans>
                ) : (
                  <Trans>Execute</Trans>
                )}
              </ThemedText.BodyPrimary>
            </ButtonError>
          ))}
        {isLimitOrder &&
          (swapIsUnsupported ? (
            <ButtonPrimary disabled={true}>
              <ThemedText.DeprecatedMain mb="4px">
                <Trans>Unsupported Asset</Trans>
              </ThemedText.DeprecatedMain>
            </ButtonPrimary>
          ) : !account ? (
            <ButtonLight
              style={{ fontSize: '14px', borderRadius: '10px' }}
              width="100%"
              padding=".5rem"
              onClick={toggleWalletDrawer}
              fontWeight={600}
            >
              <Trans>Connect Wallet</Trans>
            </ButtonLight>
          ) : poolNotFound ? (
            <GrayCard style={{ textAlign: 'center' }}>
              <ThemedText.DeprecatedMain mb="4px">
                <Trans>Insufficient liquidity for this trade.</Trans>
              </ThemedText.DeprecatedMain>
            </GrayCard>
          ) : tradeNotFound && limitUserHasSpecifiedInputOutput && !tradeIsLoading ? (
            <GrayCard style={{ textAlign: 'center' }}>
              <ThemedText.DeprecatedMain mb="4px">
                <Trans>Insufficient liquidity for this trade.</Trans>
              </ThemedText.DeprecatedMain>
            </GrayCard>
          ) : !limitInputError && notApproved ? (
            <>
              <ButtonPrimary
                onClick={updateInputAllowance}
                style={{ fontSize: '14px', borderRadius: '10px' }}
                width="100%"
                padding=".5rem"
                disabled={inputApprovalState === ApprovalState.PENDING}
              >
                {inputApprovalState === ApprovalState.PENDING ? (
                  <>
                    <Loader size="20px" />
                    <Trans>Approval pending</Trans>
                  </>
                ) : (
                  <>
                    <MouseoverTooltip
                      text={
                        <Trans>
                          Permission is required for Limitless to use each token.{' '}
                          {tradeApprovalInfo && formattedMargin
                            ? `Allowance of ${
                                !marginInPosToken
                                  ? formatNumberOrString(
                                      Number(tradeApprovalInfo.additionalPremium.toExact()) + Number(formattedMargin),
                                      NumberType.SwapTradeAmount
                                    )
                                  : formatNumberOrString(
                                      Number(tradeApprovalInfo.additionalPremium.toExact()),
                                      NumberType.SwapTradeAmount
                                    )
                              } ${inputCurrency?.symbol} required.`
                            : null}
                        </Trans>
                      }
                    >
                      <RowBetween>
                        <Info size={20} />
                        <Trans>Approve use of {inputCurrency?.symbol}</Trans>
                      </RowBetween>
                    </MouseoverTooltip>
                  </>
                )}
              </ButtonPrimary>
              {marginInPosToken && (
                <ButtonPrimary
                  onClick={updateOutputAllowance}
                  style={{ fontSize: '14px', borderRadius: '10px' }}
                  width="100%"
                  padding=".5rem"
                  disabled={inputApprovalState === ApprovalState.PENDING}
                >
                  {inputApprovalState === ApprovalState.PENDING ? (
                    <>
                      <Loader size="20px" />
                      <Trans>Approval pending</Trans>
                    </>
                  ) : (
                    <>
                      <MouseoverTooltip
                        text={
                          <Trans>
                            Permission is required for Limitless to use each token.{' '}
                            {tradeApprovalInfo && formattedMargin
                              ? `Allowance of ${formatNumberOrString(
                                  Number(formattedMargin),
                                  NumberType.SwapTradeAmount
                                )} ${outputCurrency?.symbol} required.`
                              : null}
                          </Trans>
                        }
                      >
                        <RowBetween>
                          <Info size={20} />
                          <Trans>Approve use of {outputCurrency?.symbol}</Trans>
                        </RowBetween>
                      </MouseoverTooltip>
                    </>
                  )}
                </ButtonPrimary>
              )}
            </>
          ) : (
            <ButtonError
              style={{ fontSize: '14px', borderRadius: '10px' }}
              width="100%"
              padding="0.5rem"
              onClick={() => {
                setLimitState((currentState) => ({ ...currentState, showConfirm: true }))
              }}
              id="leverage-button"
              disabled={!!limitInputError || !lmtIsValid || lmtIsLoading || !!limitContractError}
            >
              <ThemedText.BodyPrimary fontWeight={600}>
                {limitInputError ? (
                  limitInputError
                ) : limitContractError ? (
                  limitContractError
                ) : limitTradeState === LimitTradeState.INVALID ? (
                  <Trans>Invalid Trade</Trans>
                ) : limitTradeState === LimitTradeState.LOADING ? (
                  <Trans>Place Order</Trans>
                ) : limitTradeState === LimitTradeState.EXISTING_ORDER ? (
                  <Trans>Existing Order</Trans>
                ) : (
                  <Trans>Place Order</Trans>
                )}
              </ThemedText.BodyPrimary>
            </ButtonError>
          ))}
      </div>
      {/* {showPriceImpactWarning && <PriceImpactWarning priceImpact={largerPriceImpact} /> */}
    </Wrapper>
  )
}

export default TradeTabContent
