import { Trans } from '@lingui/macro'
import { Button } from '@mui/material'
import { Trace, TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, InterfaceSectionName, SwapEventName } from '@uniswap/analytics-events'
import { formatCurrencyAmount, formatNumberOrString, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import AnimatedDropdown from 'components/AnimatedDropdown'
import { BaseSwapPanel } from 'components/BaseSwapPanel/BaseSwapPanel'
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { GrayCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import HoverInlineText from 'components/HoverInlineText'
import Loader from 'components/Icons/LoadingSpinner'
import { TextWithLoadingPlaceholder } from 'components/modalFooters/common'
import { Input as NumericalInput } from 'components/NumericalInput'
import PriceToggle from 'components/PriceToggle/PriceToggle'
import Row, { RowBetween, RowFixed } from 'components/Row'
import DiscreteSliderMarks from 'components/Slider/MUISlider'
import { ConfirmAddLimitOrderModal } from 'components/swap/ConfirmAddLimitModal'
import { LeverageConfirmModal } from 'components/swap/ConfirmSwapModal'
import { AddLimitDetailsDropdown, LeverageDetailsDropdown } from 'components/swap/SwapDetailsDropdown'
import SwapHeader from 'components/swap/SwapHeader'
import { MouseoverTooltip } from 'components/Tooltip'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { LMT_MARGIN_FACILITY } from 'constants/addresses'
import { isSupportedChain, SupportedChainId } from 'constants/chains'
import { useAddLimitOrderCallback } from 'hooks/useAddLimitOrder'
import { useAddPositionCallback } from 'hooks/useAddPositionCallBack'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useBestPool } from 'hooks/useBestPool'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { useMarginOrderPositionFromPositionId } from 'hooks/useLMTV2Positions'
import { useUSDPrice } from 'hooks/useUSDPrice'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useCallback, useMemo, useState } from 'react'
import { Info, Maximize2 } from 'react-feather'
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
import { useDerivedSwapInfo, useSwapActionHandlers } from 'state/swap/hooks'
import styled, { css } from 'styled-components/macro'
import { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
import { maxAmountSpend } from 'utils/maxAmountSpend'

// import { styled } from '@mui/system';
import { ArrowWrapper } from '../../components/swap/styleds'
import {
  ArrowContainer,
  DetailsSwapSection,
  InputHeader,
  InputSection,
  LeverageGaugeSection,
  LeverageInputSection,
  OutputSwapSection,
  StyledNumericalInput,
} from '.'

const TokenName = styled.span`
  color: ${({ theme }) => theme.textPrimary};
  font-size: 12px;
  font-weight: 600;
  margin-left: 0.25rem;
`
const Wrapper = styled.div`
  padding: 1rem;
  padding-top: 0rem;
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  height: calc(100vh - 125px);

  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
  ::-webkit-scrollbar-track {
    margin-top: 5px;
  }
`
export const LimitInputWrapper = styled.div`
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
  align-items: start;
  margin-bottom: 6px;
`
export const LimitInputRow = styled.div`
  padding-top: 10px;
  display: flex;
  margin-right: 0.25rem;
`
export const OpacityHoverState = css`
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
  width: 2.5rem;
  text-align: right;
  padding-right: 5px;
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

export const LimitInputPrice = styled(AutoColumn)`
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
  const theme = useTheme()
  const { account, chainId } = useWeb3React()
  // const tab = useSelector((state: any) => state.swap.tab)

  const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers()

  // const [swapQuoteReceivedDate, setSwapQuoteReceivedDate] = useState<Date | undefined>()

  const {
    // trade: { state: tradeState, trade },
    // allowedSlippage,
    currencyBalances,
    // parsedAmount,
    currencies,
    // leverage,
    // inputError: swapInputError,
  } = useDerivedSwapInfo()

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
  } = useMarginTradingState()

  const [, pool] = useBestPool(currencies[Field.INPUT] ?? undefined, currencies[Field.OUTPUT] ?? undefined)

  const {
    trade,
    preTradeInfo,
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
    pool,
    currencies[Field.INPUT]?.wrapped.address,
    currencies[Field.OUTPUT]?.wrapped.address
  )

  const {
    orderKey,
    contractError: limitContractError,
    inputError: limitInputError,
    preTradeInfo: limitPreTradeInfo,
    state: limitTradeState,
    trade: limitTrade,
    userHasSpecifiedInputOutput: limitUserHasSpecifiedInputOutput,
  } = useDerivedLimitAddPositionInfo(
    margin ?? undefined,
    leverageFactor ?? undefined,
    startingPrice,
    baseCurrencyIsInputToken,
    pool,
    currencies[Field.INPUT] ?? undefined,
    currencies[Field.OUTPUT] ?? undefined,
    allowedSlippage
  )

  const { callback: addLimitCallback } = useAddLimitOrderCallback(limitTrade)

  const { onLeverageFactorChange, onMarginChange, onChangeTradeType, onPriceInput, onPriceToggle } =
    useMarginTradingActionHandlers()

  // allowance / approval
  const [facilityApprovalState, approveMarginFacility] = useApproveCallback(
    preTradeInfo?.approvalAmount,
    LMT_MARGIN_FACILITY[chainId ?? SupportedChainId.SEPOLIA]
  )

  const noTradeInputError = useMemo(() => {
    return !inputError
  }, [inputError])

  // const { activeTab } = useSwapState()

  const toggleWalletDrawer = useToggleWalletDrawer()
  const maxInputAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(currencyBalances[Field.INPUT]),
    [currencyBalances]
  )

  const swapIsUnsupported = useIsSwapUnsupported(currencies[Field.INPUT], currencies[Field.OUTPUT])

  const fiatValueTradeMargin = useUSDPrice(trade?.margin)
  const fiatValueTradeInput = useUSDPrice(trade?.swapInput)
  const fiatValueTradeOutput = useUSDPrice(trade?.swapOutput)

  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !trade?.margin?.equalTo(maxInputAmount))

  const [formattedMargin, formattedPosition, formattedLeverageFactor] = useMemo(() => {
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
      LeverageTradeState.LOADING === tradeState,
      tradeState === LeverageTradeState.NO_ROUTE_FOUND,
    ],
    [tradeState]
  )

  const lmtIsValid = useMemo(() => limitTradeState === LimitTradeState.VALID, [limitTradeState])
  const lmtIsLoading = useMemo(() => limitTradeState === LimitTradeState.LOADING, [limitTradeState])

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

  // const handleAcceptChanges = useCallback(() => {
  //   setTradeState((currentState) => ({ ...currentState, tradeToConfirm: trade }))
  // }, [trade])

  const handleMarginInput = useCallback(
    (value: string) => {
      onMarginChange(value)
    },
    [onMarginChange]
  )

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onMarginChange(maxInputAmount.toExact())
  }, [maxInputAmount, onMarginChange])

  // const handleInputSelect = useCallback(
  //   (inputCurrency: Currency) => {
  //     onCurrencySelection(Field.INPUT, inputCurrency)
  //   },
  //   [onCurrencySelection]
  // )

  // const handleOutputSelect = useCallback(
  //   (outputCurrency: Currency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
  //   [onCurrencySelection]
  // )

  const stablecoinPriceImpact = useMemo(
    () =>
      !isLimitOrder
        ? tradeIsLoading || !trade
          ? undefined
          : computeFiatValuePriceImpact(fiatValueTradeInput.data, fiatValueTradeOutput.data)
        : lmtIsLoading || !limitTrade
        ? undefined
        : computeFiatValuePriceImpact(fiatValueTradeInput.data, fiatValueTradeOutput.data),
    [fiatValueTradeInput, fiatValueTradeOutput, tradeIsLoading, trade, lmtIsLoading, limitTrade, isLimitOrder]
  )

  const [debouncedLeverageFactor, onDebouncedLeverageFactor] = useDebouncedChangeHandler(
    leverageFactor ?? '',
    onLeverageFactorChange
  )

  const [baseCurrency, quoteCurrency] = useMemo(() => {
    if (baseCurrencyIsInputToken) {
      return [currencies[Field.INPUT], currencies[Field.OUTPUT]]
    } else {
      return [currencies[Field.OUTPUT], currencies[Field.INPUT]]
    }
  }, [currencies, baseCurrencyIsInputToken])

  const { callback: addPositionCallback } = useAddPositionCallback(trade, allowedSlippage)

  const existingLimitOrder = useMarginOrderPositionFromPositionId(orderKey)

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
        console.log('callback', error.message)
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
        console.log('callback', error.message)
        setLimitState((currentState) => ({
          ...currentState,
          attemptingTxn: false,
          txHash: undefined,
          errorMessage: error.message,
        }))
      })
  }, [addLimitCallback])

  const updateLeverageAllowance = useCallback(async () => {
    try {
      await approveMarginFacility()
    } catch (err) {
      console.log('approveLeverageManager err: ', err)
    }
  }, [approveMarginFacility])

  const currentPrice = useMemo(() => {
    const inputCurrency = currencies[Field.INPUT]?.wrapped
    const outputCurrency = currencies[Field.OUTPUT]?.wrapped
    if (pool && inputCurrency && outputCurrency) {
      const inputIsToken0 = inputCurrency.sortsBefore(outputCurrency)
      const baseIsToken0 = (baseCurrencyIsInputToken && inputIsToken0) || (!baseCurrencyIsInputToken && !inputIsToken0)
      if (baseIsToken0) {
        return formatBNToString(new BN(pool.token0Price.toFixed(18)), NumberType.FiatTokenPrice, true)
      } else {
        return formatBNToString(new BN(pool.token1Price.toFixed(18)), NumberType.FiatTokenPrice, true)
      }
    }
    return undefined
  }, [baseCurrencyIsInputToken, pool, currencies])

  // const deadline = useTransactionDeadline()
  // console.log('core', facilityApprovalState, trade, tradeState, inputError)
  return (
    <Wrapper>
      <LeverageConfirmModal
        isOpen={showConfirm}
        originalTrade={tradeToConfirm}
        trade={trade}
        preTradeInfo={preTradeInfo}
        onConfirm={handleAddPosition}
        onDismiss={handleConfirmDismiss}
        onAcceptChanges={() => {
          return
        }}
        existingPosition={existingPosition}
        attemptingTxn={attemptingTxn}
        txHash={txHash}
        allowedSlippage={trade?.allowedSlippage ?? new Percent(0)}
        tradeErrorMessage={tradeErrorMessage}
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
        attemptingTxn={lmtAttemptingTxn}
        txHash={lmtTxHash}
        tradeErrorMessage={lmtErrorMessage}
        preTradeInfo={preTradeInfo}
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
      </FilterWrapper>
      <LimitInputWrapper>
        <AnimatedDropdown open={isLimitOrder}>
          <DynamicSection disabled={false}>
            <Row gap="20px">
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
              <Row justify="flex-end" align="flex-start">
                <ThemedText.DeprecatedMain fontWeight={535} fontSize={14} color="text1" marginRight="10px">
                  Current Price:
                </ThemedText.DeprecatedMain>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                  <ThemedText.DeprecatedBody fontWeight={535} fontSize={14} color="textSecondary">
                    <HoverInlineText maxCharacters={20} text={currentPrice ?? '-'} />
                  </ThemedText.DeprecatedBody>
                  {baseCurrency && (
                    <ThemedText.DeprecatedBody color="text2" fontSize={10}>
                      {quoteCurrency?.symbol} per {baseCurrency.symbol}
                    </ThemedText.DeprecatedBody>
                  )}
                </div>
              </Row>
            </Row>

            <LimitInputPrice>
              <Trans>
                <ThemedText.BodySecondary>Limit Price </ThemedText.BodySecondary>{' '}
              </Trans>

              <LimitInputRow>
                <StyledNumericalInput
                  onUserInput={onPriceInput}
                  value={startingPrice ?? ''}
                  placeholder="0"
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
          <InputHeader>
            <ThemedText.BodySecondary fontWeight={400}>
              <Trans>Margin</Trans>
            </ThemedText.BodySecondary>
          </InputHeader>
          <Trace section={InterfaceSectionName.CURRENCY_INPUT_PANEL}>
            {/* <SwapCurrencyInputPanelV2
              value={formattedMargin}
              onUserInput={handleMarginInput}
              showMaxButton={showMaxButton}
              currency={currencies[Field.INPUT] ?? null}
              onMax={handleMaxInput}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT] ?? null}
              showCommonBases={true}
              id={InterfaceSectionName.CURRENCY_INPUT_PANEL}
              showCurrencyAmount={true}
              fiatValue={fiatValueTradeMargin}
              label="Margin"
            /> */}
            <BaseSwapPanel
              value={formattedMargin}
              showMaxButton={showMaxButton}
              currency={currencies[Field.INPUT] ?? null}
              onUserInput={handleMarginInput}
              onMax={handleMaxInput}
              fiatValue={fiatValueTradeMargin}
              otherCurrency={currencies[Field.OUTPUT] ?? null}
              showCommonBases={true}
              id={InterfaceSectionName.CURRENCY_INPUT_PANEL}
              loading={false}
              premium={preTradeInfo?.additionalPremium}
              showPremium={false}
            />
          </Trace>
        </InputSection>
        <ArrowWrapper clickable={isSupportedChain(chainId)}>
          <TraceEvent
            events={[BrowserEvent.onClick]}
            name={SwapEventName.SWAP_TOKENS_REVERSED}
            element={InterfaceElementName.SWAP_TOKENS_REVERSE_ARROW_BUTTON}
          >
            <ArrowContainer
              onClick={() => {
                onSwitchTokens(true)
              }}
              color={theme.textPrimary}
            >
              <Maximize2
                size="10"
                color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.textPrimary : theme.textTertiary}
              />
            </ArrowContainer>
          </TraceEvent>
        </ArrowWrapper>
      </div>
      <div>
        <div>
          <OutputSwapSection showDetailsDropdown={false}>
            <InputHeader>
              <ThemedText.BodySecondary>
                <Trans>Long</Trans>
              </ThemedText.BodySecondary>
            </InputHeader>
            <Trace section={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}>
              {/* <SwapCurrencyInputPanelV2
                value={
                  !isLimitOrder
                    ? tradeState !== LeverageTradeState.VALID || !trade
                      ? '-'
                      : formatCurrencyAmount(trade.swapOutput, NumberType.SwapTradeAmount)
                    : limitTradeState !== LimitTradeState.VALID || !limitTrade
                    ? '-'
                    : formatBNToString(limitTrade.startOutput, NumberType.SwapTradeAmount)
                }
                onUserInput={() => 0}
                showMaxButton={false}
                hideBalance={false}
                fiatValue={fiatValueTradeOutput}
                priceImpact={stablecoinPriceImpact}
                currency={currencies[Field.OUTPUT] ?? null}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies[Field.INPUT] ?? null}
                showCommonBases={true}
                id={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}
                loading={!isLimitOrder ? tradeIsLoading : lmtIsLoading}
                disabled={false}
                label="Long"
              /> */}
              <BaseSwapPanel
                value={
                  !isLimitOrder
                    ? tradeState !== LeverageTradeState.VALID || !trade
                      ? '-'
                      : formatCurrencyAmount(trade.swapOutput, NumberType.SwapTradeAmount)
                    : limitTradeState !== LimitTradeState.VALID || !limitTrade
                    ? '-'
                    : formatBNToString(limitTrade.startOutput, NumberType.SwapTradeAmount)
                }
                onUserInput={() => 0}
                showMaxButton={false}
                hideBalance={false}
                fiatValue={fiatValueTradeOutput}
                priceImpact={stablecoinPriceImpact}
                currency={currencies[Field.OUTPUT] ?? null}
                otherCurrency={currencies[Field.INPUT] ?? null}
                showCommonBases={true}
                id={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}
                loading={tradeIsLoading}
                disabled={true}
              />
            </Trace>
          </OutputSwapSection>
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
                  initialValue={
                    debouncedLeverageFactor === '' ? 0 : Math.round(Number(debouncedLeverageFactor) * 1000) / 1000
                  }
                  onChange={(val) => onDebouncedLeverageFactor(val.toString())}
                />
              </>
            </AutoColumn>
          </LeverageGaugeSection>
          <DetailsSwapSection>
            {!isLimitOrder ? (
              <LeverageDetailsDropdown
                trade={trade}
                preTradeInfo={preTradeInfo}
                existingPosition={existingPosition}
                loading={tradeIsLoading}
                allowedSlippage={trade?.allowedSlippage ?? new Percent(0)}
              />
            ) : (
              <AddLimitDetailsDropdown
                existingPosition={existingLimitOrder}
                trade={limitTrade}
                preTradeInfo={preTradeInfo}
                loading={false}
              />
            )}
          </DetailsSwapSection>
        </div>
        {/* {showPriceImpactWarning && <PriceImpactWarning priceImpact={largerPriceImpact} />} */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
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
                width="14"
                padding=".5rem"
                onClick={toggleWalletDrawer}
                fontWeight={600}
              >
                <Trans>Connect Wallet</Trans>
              </ButtonLight>
            ) : tradeNotFound && userHasSpecifiedInputOutput && !tradeIsLoading ? (
              <GrayCard style={{ textAlign: 'center' }}>
                <ThemedText.DeprecatedMain mb="4px">
                  <Trans>Insufficient liquidity for this trade.</Trans>
                </ThemedText.DeprecatedMain>
              </GrayCard>
            ) : noTradeInputError && facilityApprovalState !== ApprovalState.APPROVED ? (
              <ButtonPrimary
                onClick={updateLeverageAllowance}
                style={{ fontSize: '14px', borderRadius: '10px' }}
                width="14"
                padding=".5rem"
                disabled={facilityApprovalState === ApprovalState.PENDING}
              >
                {facilityApprovalState === ApprovalState.PENDING ? (
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
                          {preTradeInfo && formattedMargin
                            ? `Allowance of ${formatNumberOrString(
                                Number(preTradeInfo.additionalPremium.toExact()) + Number(formattedMargin),
                                NumberType.SwapTradeAmount
                              )} ${currencies[Field.INPUT]?.symbol} required.`
                            : null}
                        </Trans>
                      }
                    >
                      <RowBetween>
                        <Info size={20} />
                        <Trans>Approve use of {currencies[Field.INPUT]?.symbol}</Trans>
                      </RowBetween>
                    </MouseoverTooltip>
                  </>
                )}
              </ButtonPrimary>
            ) : (
              <ButtonError
                style={{ fontSize: '14px', borderRadius: '10px' }}
                width="14"
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
                width="14"
                padding=".5rem"
                onClick={toggleWalletDrawer}
                fontWeight={600}
              >
                <Trans>Connect Wallet</Trans>
              </ButtonLight>
            ) : tradeNotFound && limitUserHasSpecifiedInputOutput && !tradeIsLoading ? (
              <GrayCard style={{ textAlign: 'center' }}>
                <ThemedText.DeprecatedMain mb="4px">
                  <Trans>Insufficient liquidity for this trade.</Trans>
                </ThemedText.DeprecatedMain>
              </GrayCard>
            ) : !limitInputError && facilityApprovalState !== ApprovalState.APPROVED ? (
              <ButtonPrimary
                onClick={updateLeverageAllowance}
                style={{ fontSize: '14px', borderRadius: '10px' }}
                width="14"
                padding=".5rem"
                disabled={facilityApprovalState === ApprovalState.PENDING}
              >
                {facilityApprovalState === ApprovalState.PENDING ? (
                  <>
                    <Loader size="14px" />
                    <Trans>Approval pending</Trans>
                  </>
                ) : (
                  <>
                    <MouseoverTooltip
                      text={
                        <Trans>
                          Permission is required for Limitless to use each token.{' '}
                          {preTradeInfo && formattedMargin
                            ? `Allowance of ${formatNumberOrString(
                                Number(preTradeInfo.additionalPremium.toExact()) + Number(formattedMargin),
                                NumberType.SwapTradeAmount
                              )} ${currencies[Field.INPUT]?.symbol} required.`
                            : null}
                        </Trans>
                      }
                    >
                      <RowBetween>
                        <Info size={14} />
                        <Trans>Approve use of {currencies[Field.INPUT]?.symbol}</Trans>
                      </RowBetween>
                    </MouseoverTooltip>
                  </>
                )}
              </ButtonPrimary>
            ) : (
              <ButtonError
                style={{ fontSize: '14px', borderRadius: '10px' }}
                width="14"
                padding=".25rem"
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
      </div>
    </Wrapper>
  )
}

export default TradeTabContent
