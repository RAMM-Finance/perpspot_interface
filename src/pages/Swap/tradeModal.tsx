import { Trans } from '@lingui/macro'
import { Trace, TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, InterfaceSectionName, SwapEventName } from '@uniswap/analytics-events'
import { formatCurrencyAmount, formatNumberOrString, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import AnimatedDropdown from 'components/AnimatedDropdown'
import { BaseSwapPanel } from 'components/BaseSwapPanel/BaseSwapPanel'
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { GrayCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Icons/LoadingSpinner'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { RowBetween, RowFixed } from 'components/Row'
import DiscreteSliderMarks from 'components/Slider/MUISlider'
import { LeverageConfirmModal } from 'components/swap/ConfirmSwapModal'
import { LeverageDetailsDropdown } from 'components/swap/SwapDetailsDropdown'
import SwapHeader from 'components/swap/SwapHeader'
import { MouseoverTooltip } from 'components/Tooltip'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { LMT_MARGIN_FACILITY } from 'constants/addresses'
import { isSupportedChain, SupportedChainId } from 'constants/chains'
import { useAddPositionCallback } from 'hooks/useAddPositionCallBack'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useUSDPrice } from 'hooks/useUSDPrice'
import JSBI from 'jsbi'
import { useCallback, useMemo, useState } from 'react'
import { Info, Maximize2 } from 'react-feather'
import { MarginField } from 'state/marginTrading/actions'
import {
  AddMarginTrade,
  useDerivedAddPositionInfo,
  useMarginTradingActionHandlers,
  useMarginTradingState,
} from 'state/marginTrading/hooks'
import { LeverageTradeState } from 'state/routing/types'
import { Field } from 'state/swap/actions'
import { useBestPool, useDerivedSwapInfo, useSwapActionHandlers } from 'state/swap/hooks'
import styled, { css } from 'styled-components/macro'
import { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import { ArrowWrapper } from '../../components/swap/styleds'
import {
  ArrowContainer,
  DetailsSwapSection,
  InputHeader,
  InputSection,
  LeverageGaugeSection,
  LeverageInputSection,
  LimitInputSection,
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
const LimitInputWrapper = styled.div`
  margin-top: 5px;
`

const Filter = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  width: fit-content;
`

const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`
const LimitInputRow = styled.div`
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

const StyledSelectorText = styled(ThemedText.BodySmall)<{ active: boolean }>`
  color: ${({ theme, active }) => (active ? theme.textSecondary : theme.textPrimary)};
`

const Selector = styled.div<{ active: boolean }>`
  padding: 6px 8px;
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

  const {
    [MarginField.MARGIN]: margin,
    [MarginField.LEVERAGE_FACTOR]: leverageFactor,
    isLimitOrder,
    startingPrice,
  } = useMarginTradingState()

  const pool = useBestPool(currencies[Field.INPUT] ?? undefined, currencies[Field.OUTPUT] ?? undefined)

  const {
    trade,
    preTradeInfo,
    state: tradeState,
    inputError,
    existingPosition,
    allowedSlippage,
    allowedSlippedTick,
    contractError,
  } = useDerivedAddPositionInfo(
    margin ?? undefined,
    leverageFactor ?? undefined,
    pool,
    currencies[Field.INPUT]?.wrapped.address,
    currencies[Field.OUTPUT]?.wrapped.address
  )
  // console.log(
  //   'trade: ',
  //   existingPosition?.premiumOwed.toString(),
  //   preTradeInfo?.premiumDeposit.toExact(),
  //   preTradeInfo?.premiumNecessary.toExact(),
  //   preTradeInfo?.approvalAmount.toExact()
  // )

  const { onLeverageFactorChange, onMarginChange, onChangeTradeType, onPriceInput } = useMarginTradingActionHandlers()

  // allowance / approval
  const [facilityApprovalState, approveMarginFacility] = useApproveCallback(
    preTradeInfo?.approvalAmount,
    LMT_MARGIN_FACILITY[chainId ?? SupportedChainId.SEPOLIA]
  )

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

  const lmtIsValid = useMemo(() => !inputError, [inputError])

  const handleConfirmDismiss = useCallback(() => {
    setTradeState((currentState) => ({
      ...currentState,
      showConfirm: false,
      tradeErrorMessage: undefined,
      txHash: undefined,
      attemptingTxn: false,
    }))
    if (txHash) {
      onUserInput(Field.INPUT, '')
      // onBorrowChange('')
      onMarginChange('')
      onLeverageFactorChange('')
    }
  }, [onUserInput, onMarginChange, onLeverageFactorChange, txHash])

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

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection]
  )

  const stablecoinPriceImpact = useMemo(
    () =>
      tradeIsLoading || !trade
        ? undefined
        : computeFiatValuePriceImpact(fiatValueTradeInput.data, fiatValueTradeOutput.data),
    [fiatValueTradeInput, fiatValueTradeOutput, tradeIsLoading, trade]
  )

  const [debouncedLeverageFactor, onDebouncedLeverageFactor] = useDebouncedChangeHandler(
    leverageFactor ?? '',
    onLeverageFactorChange
  )

  // const [sliderLeverageFactor, debouncedLeverageFactor] = useDebouncedChangeHandler(
  //   leverageFactor ?? '',
  //   onLeverageFactorChange
  // )

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && trade?.margin.greaterThan(JSBI.BigInt(0))
  )

  const { callback: addPositionCallback } = useAddPositionCallback(trade, allowedSlippage, allowedSlippedTick)

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

  const updateLeverageAllowance = useCallback(async () => {
    try {
      await approveMarginFacility()
    } catch (err) {
      console.log('approveLeverageManager err: ', err)
    }
  }, [approveMarginFacility])

  //       address pool,
  //       bool positionIsToken0,
  //       bool isAdd,
  //       uint256 deadline, -> deadline parameter?
  //       uint256 startOutput, -> can be caluclated from user
  //       uint256 minOutput, -> can be caluclated from slippage + start output
  //       uint256 inputAmount, -> margin
  //       uint256 decayRate,
  //       uint256 margin

  const deadline = useTransactionDeadline()

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
      <SwapHeader allowedSlippage={allowedSlippage} autoSlippedTick={allowedSlippedTick} />
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
      <div style={{ display: 'relative' }}>
        <InputSection>
          <InputHeader>
            <ThemedText.BodySecondary fontWeight={400}>
              <Trans>Deposit Collateral</Trans>
            </ThemedText.BodySecondary>
          </InputHeader>
          <Trace section={InterfaceSectionName.CURRENCY_INPUT_PANEL}>
            <BaseSwapPanel
              value={formattedMargin}
              showMaxButton={showMaxButton}
              currency={currencies[Field.INPUT] ?? null}
              onUserInput={handleMarginInput}
              onMax={handleMaxInput}
              fiatValue={fiatValueTradeMargin}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT] ?? null}
              showCommonBases={true}
              id={InterfaceSectionName.CURRENCY_INPUT_PANEL}
              loading={false}
              premium={preTradeInfo?.premiumNecessary}
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
              <ThemedText.BodySecondary fontWeight={400}>
                <Trans>Position Size</Trans>
              </ThemedText.BodySecondary>
            </InputHeader>
            <Trace section={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}>
              <BaseSwapPanel
                value={
                  tradeState !== LeverageTradeState.VALID || !trade
                    ? '-'
                    : formatCurrencyAmount(trade.swapOutput, NumberType.SwapTradeAmount)
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
                loading={tradeIsLoading}
                disabled={true}
              />
            </Trace>
          </OutputSwapSection>
          <LimitInputWrapper>
            <AnimatedDropdown open={isLimitOrder}>
              <LimitInputSection>
                <ThemedText.BodySecondary fontWeight={400}>
                  <Trans>Limit</Trans>
                </ThemedText.BodySecondary>
                <LimitInputRow>
                  <StyledNumericalInput
                    onUserInput={onPriceInput}
                    value={startingPrice ?? ''}
                    placeholder="0"
                    className="limit-amount-input"
                  ></StyledNumericalInput>
                  <RowFixed>
                    <CurrencyLogo currency={currencies[Field.INPUT] ?? null} size="15px" />
                    <TokenName className="pair-name-container">{currencies[Field.INPUT]?.symbol}</TokenName>
                  </RowFixed>
                </LimitInputRow>
              </LimitInputSection>
            </AnimatedDropdown>
          </LimitInputWrapper>
          <LeverageGaugeSection>
            <AutoColumn gap="md">
              <RowBetween>
                <ThemedText.DeprecatedMain fontWeight={400}>
                  <Trans>Leverage</Trans>
                </ThemedText.DeprecatedMain>
                <RowBetween style={{ flexWrap: 'nowrap', justifyContent: 'end' }}>
                  <LeverageInputSection>
                    <StyledNumericalInput
                      className="token-amount-input"
                      value={debouncedLeverageFactor ?? ''}
                      placeholder="1"
                      onUserInput={(str: string) => {
                        const isInteger = /^\d+$/.test(str)
                        if (str === '') {
                          onDebouncedLeverageFactor('')
                        } else if (isInteger) {
                          const intValue = parseInt(str, 10)
                          if (intValue >= 1 && intValue <= 500) {
                            onDebouncedLeverageFactor(str)
                          }
                        }
                      }}
                      disabled={false}
                    />
                    <span
                      style={{
                        position: 'relative',
                        top: '57%',
                        right: '11.5px',
                        transform: 'translateY(-50%)',
                        fontSize: '12px',
                        opacity: '0.5',
                        color: '#999',
                      }}
                    >
                      x
                    </span>
                  </LeverageInputSection>
                </RowBetween>
              </RowBetween>

              <>
                <DiscreteSliderMarks
                  initialValue={debouncedLeverageFactor === '' ? 10 : parseInt(debouncedLeverageFactor, 10)}
                  onChange={(val) => onDebouncedLeverageFactor(val.toString())}
                />
              </>
            </AutoColumn>
          </LeverageGaugeSection>
          <DetailsSwapSection>
            <LeverageDetailsDropdown
              trade={trade}
              preTradeInfo={preTradeInfo}
              existingPosition={existingPosition}
              loading={tradeIsLoading}
              allowedSlippage={trade?.allowedSlippage ?? new Percent(0)}
            />
          </DetailsSwapSection>
        </div>
        {/* {showPriceImpactWarning && <PriceImpactWarning priceImpact={largerPriceImpact} />} */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {swapIsUnsupported ? (
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
          ) : lmtIsValid && facilityApprovalState !== ApprovalState.APPROVED ? (
            <ButtonPrimary
              onClick={updateLeverageAllowance}
              style={{ gap: 14 }}
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
              disabled={!!inputError || !lmtIsValid || tradeIsLoading || invalidTrade}
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
          )}
          {/* {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null} */}
        </div>
      </div>
    </Wrapper>
  )
}

export default TradeTabContent
