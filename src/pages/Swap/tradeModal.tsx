import { Trans } from '@lingui/macro'
import { Trace, TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, InterfaceSectionName, SwapEventName } from '@uniswap/analytics-events'
import { formatCurrencyAmount, formatNumberOrString, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BaseSwapPanel } from 'components/BaseSwapPanel/BaseSwapPanel'
import LeverageDebtInputPanel from 'components/BaseSwapPanel/leveragedOutputPanel'
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { GrayCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Icons/LoadingSpinner'
import { AutoRow, RowBetween } from 'components/Row'
import DiscreteSliderMarks from 'components/Slider/MUISlider'
import { LeverageConfirmModal } from 'components/swap/ConfirmSwapModal'
import { LeverageDetailsDropdown } from 'components/swap/SwapDetailsDropdown'
import { MouseoverTooltip } from 'components/Tooltip'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { LMT_MARGIN_FACILITY } from 'constants/addresses'
import { isSupportedChain, SupportedChainId } from 'constants/chains'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { useUSDPrice } from 'hooks/useUSDPrice'
import JSBI from 'jsbi'
import { useCallback, useMemo, useState } from 'react'
import { Info, Maximize2 } from 'react-feather'
import { Text } from 'rebass'
import { MarginField } from 'state/marginTrading/actions'
import {
  MarginTrade,
  useDerivedAddPositionInfo,
  useMarginTradingActionHandlers,
  useMarginTradingState,
} from 'state/marginTrading/hooks'
import { LeverageTradeState } from 'state/routing/types'
import { Field } from 'state/swap/actions'
import { useDerivedSwapInfo, useSwapActionHandlers } from 'state/swap/hooks'
import styled from 'styled-components/macro'
import { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import { ArrowWrapper } from '../../components/swap/styleds'
import { SmallMaxButton } from '../RemoveLiquidity/styled'
import {
  ArrowContainer,
  DetailsSwapSection,
  InputSection,
  LeverageGaugeSection,
  LeverageInputSection,
  OutputSwapSection,
  StyledNumericalInput,
} from '.'

const TRADE_STRING = 'SwapRouter'
const Wrapper = styled.div`
  padding: 1rem;
  background-color: ${({ theme }) => theme.backgroundSurface};
`

function largerPercentValue(a?: Percent, b?: Percent) {
  if (a && b) {
    return a.greaterThan(b) ? a : b
  } else if (a) {
    return a
  } else if (b) {
    return b
  }
  return undefined
}

const TradeTabContent = () => {
  const theme = useTheme()
  const { account, chainId } = useWeb3React()
  // const tab = useSelector((state: any) => state.swap.tab)

  const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers()

  const [swapQuoteReceivedDate, setSwapQuoteReceivedDate] = useState<Date | undefined>()

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
    tradeToConfirm: MarginTrade | undefined
    tradeErrorMessage: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    txHash: undefined,
    tradeErrorMessage: undefined,
  })

  const {
    trade: trade,
    state: tradeState,
    inputError,
    approvalAmount,
    premiumDeposit,
    premiumNecessary,
    allowedSlippage,
    additionalPremium,
  } = useDerivedAddPositionInfo()

  // const { callback: marginTradeCallback } = useAddMarginPositionCallback(trade)

  const {
    [MarginField.MARGIN]: margin,
    [MarginField.LEVERAGE_FACTOR]: leverageFactor,
    // [MarginField.BORROW]: borrowAmount,
    // lockedField: lockedMarginField,
  } = useMarginTradingState()

  const {
    // onCurrencySelection,
    // onSwitchTokens,
    // onUserInput,
    // onChangeRecipient,
    onLeverageFactorChange,
    onMarginChange,
    // onBorrowChange,
    // onLockChange,
  } = useMarginTradingActionHandlers()

  // allowance / approval
  const [facilityApprovalState, approveMarginFacility] = useApproveCallback(
    approvalAmount,
    LMT_MARGIN_FACILITY[chainId ?? SupportedChainId.SEPOLIA]
  )

  // const { activeTab } = useSwapState()

  const toggleWalletDrawer = useToggleWalletDrawer()
  const maxInputAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(currencyBalances[Field.INPUT]),
    [currencyBalances]
  )

  const swapIsUnsupported = useIsSwapUnsupported(currencies[Field.INPUT], currencies[Field.OUTPUT])

  const fiatValueTradeMargin = useUSDPrice(trade?.marginAmount)
  const fiatValueTradeInput = useUSDPrice(trade?.marginAmount.add(trade?.borrowAmount))
  const fiatValueTradeOutput = useUSDPrice(trade?.outputAmount)

  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !trade?.marginAmount?.equalTo(maxInputAmount))

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
    setTradeState((currentState) => ({ ...currentState, showConfirm: false }))
    if (txHash) {
      onUserInput(Field.INPUT, '')
      // onBorrowChange('')
      onMarginChange('')
      onLeverageFactorChange('')
    }
  }, [onUserInput, onMarginChange, onLeverageFactorChange, txHash])

  const handleAcceptChanges = useCallback(() => {
    setTradeState((currentState) => ({ ...currentState, tradeToConfirm: trade }))
  }, [trade])

  // const handleTrade = useCallback(() => {
  //   if (!marginTradeCallback) {
  //     return
  //   }
  //   setTradeState((currentState) => ({ ...currentState, attemptingTxn: true }))
  //   marginTradeCallback()
  //     .then((hash) => {
  //       setTradeState((currentState) => ({ ...currentState, attemptingTxn: false, txHash: hash }))
  //     })
  //     .catch((error) => {
  //       setTradeState((currentState) => ({
  //         ...currentState,
  //         attemptingTxn: false,
  //         txHash: undefined,
  //         tradeErrorMessage: error.message,
  //       }))
  //     })
  // }, [marginTradeCallback])

  const handleMarginInput = useCallback(
    (value: string) => {
      onMarginChange(value)
    },
    [onMarginChange]
  )

  // const handleLeverageInput = useCallback(
  //   (value: string) => {
  //     onLeverageFactorChange(value)
  //     margin && onBorrowChange(String((Number(value) - 1) * Number(margin)))
  //   },
  //   [onLeverageFactorChange, onBorrowChange, margin]
  // )

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

  // const showDetailsDropdown = Boolean(trade || tradeIsLoading)

  const [debouncedLeverageFactor, onDebouncedLeverageFactor] = useDebouncedChangeHandler(
    leverageFactor ?? '',
    onLeverageFactorChange
  )

  const [sliderLeverageFactor, setSliderLeverageFactor] = useDebouncedChangeHandler(
    leverageFactor ?? '',
    onLeverageFactorChange
  )

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && trade?.marginAmount.greaterThan(JSBI.BigInt(0))
  )

  const updateLeverageAllowance = useCallback(async () => {
    try {
      await approveMarginFacility()
    } catch (err) {
      console.log('approveLeverageManager err: ', err)
    }
  }, [approveMarginFacility])

  // console.log('trade', premiumDeposit?.toFixed(), premiumNecessary?.toFixed(), approvalAmount?.toFixed(), trade)

  return (
    <Wrapper>
      <LeverageConfirmModal
        isOpen={showConfirm}
        originalTrade={tradeToConfirm}
        trade={trade}
        onConfirm={() => 0}
        onDismiss={handleConfirmDismiss}
        onAcceptChanges={() => {
          return
        }}
        attemptingTxn={attemptingTxn}
        txHash={txHash}
        premiumDeposit={premiumDeposit}
        premiumNecessary={premiumNecessary}
        allowedSlippage={allowedSlippage}
        tradeErrorMessage={tradeErrorMessage}
      />

      <div style={{ display: 'relative' }}>
        <InputSection>
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
              premium={premiumNecessary}
              showPremium={false}
              label="Collateral"
            />
          </Trace>
        </InputSection>

        <InputSection>
          <Trace section={InterfaceSectionName.CURRENCY_INPUT_PANEL}>
            <LeverageDebtInputPanel
              value={formattedPosition}
              currency={currencies[Field.INPUT] ?? null}
              id={InterfaceSectionName.CURRENCY_INPUT_PANEL}
              loading={false}
              parsedAmount={formattedMargin}
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
                size="16"
                color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.textPrimary : theme.textTertiary}
              />
            </ArrowContainer>
          </TraceEvent>
        </ArrowWrapper>
      </div>
      <div>
        <div>
          <OutputSwapSection showDetailsDropdown={false}>
            <Trace section={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}>
              <BaseSwapPanel
                value={
                  tradeState !== LeverageTradeState.VALID || !trade
                    ? '-'
                    : formatCurrencyAmount(trade.outputAmount, NumberType.SwapTradeAmount)
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
                label="Recieve"
                disabled={true}
              />
            </Trace>

            {/* {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.textSecondary} />
                  </ArrowWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    <Trans>- Remove recipient</Trans>
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null} */}
          </OutputSwapSection>
          <LeverageGaugeSection>
            <AutoColumn gap="md">
              <RowBetween>
                <div style={{ marginRight: '20px' }}>
                  <ThemedText.DeprecatedMain fontWeight={400}>
                    <Trans>Leverage</Trans>
                  </ThemedText.DeprecatedMain>
                </div>
                <RowBetween style={{ flexWrap: 'nowrap' }}>
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
                        position: 'absolute',
                        top: '57%',
                        right: '11.5px',
                        transform: 'translateY(-50%)',
                        fontSize: '20px',
                        opacity: '0.5',
                        color: '#999',
                      }}
                    >
                      x
                    </span>
                  </LeverageInputSection>
                  <AutoRow gap="4px" justify="flex-end">
                    <SmallMaxButton onClick={() => onLeverageFactorChange('10')} width="20%">
                      <Trans>10</Trans>
                    </SmallMaxButton>
                    <SmallMaxButton onClick={() => onLeverageFactorChange('100')} width="20%">
                      <Trans>100</Trans>
                    </SmallMaxButton>
                    <SmallMaxButton onClick={() => onLeverageFactorChange('500')} width="20%">
                      <Trans>500</Trans>
                    </SmallMaxButton>
                  </AutoRow>
                </RowBetween>
              </RowBetween>

              <>
                <DiscreteSliderMarks
                  initialValue={sliderLeverageFactor === '' ? 10 : parseInt(sliderLeverageFactor, 10)}
                  onChange={(val) => setSliderLeverageFactor(val.toString())}
                />
              </>
            </AutoColumn>
          </LeverageGaugeSection>
          <DetailsSwapSection>
            <LeverageDetailsDropdown
              trade={trade}
              premiumDeposit={premiumDeposit}
              premiumNecessary={premiumNecessary}
              loading={tradeIsLoading}
              allowedSlippage={allowedSlippage}
            />
          </DetailsSwapSection>
        </div>
        {/* {showPriceImpactWarning && <PriceImpactWarning priceImpact={largerPriceImpact} />} */}
        <div>
          {swapIsUnsupported ? (
            <ButtonPrimary disabled={true}>
              <ThemedText.DeprecatedMain mb="4px">
                <Trans>Unsupported Asset</Trans>
              </ThemedText.DeprecatedMain>
            </ButtonPrimary>
          ) : !account ? (
            <ButtonLight onClick={toggleWalletDrawer} fontWeight={600}>
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
                        {additionalPremium && trade?.marginAmount
                          ? `Allowance of ${formatCurrencyAmount(
                              trade?.marginAmount?.add(additionalPremium),
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
              onClick={() => {
                setTradeState((currentState) => ({ ...currentState, tradeToConfirm: trade, showConfirm: true }))
              }}
              id="leverage-button"
              disabled={!!inputError || !lmtIsValid || tradeIsLoading || invalidTrade}
            >
              <Text fontSize={20} fontWeight={600}>
                {inputError ? (
                  inputError
                ) : invalidTrade ? (
                  <Trans>Invalid Trade</Trans>
                ) : tradeIsLoading ? (
                  <Trans>Leverage</Trans>
                ) : (
                  <Trans>Leverage</Trans>
                )}
              </Text>
            </ButtonError>
          )}
          {/* {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null} */}
        </div>
      </div>
    </Wrapper>
  )
}

export default TradeTabContent
