import { Trans } from '@lingui/macro'
import { sendAnalyticsEvent, Trace, TraceEvent } from '@uniswap/analytics'
import {
  BrowserEvent,
  InterfaceElementName,
  InterfaceEventName,
  InterfaceSectionName,
  SwapEventName,
} from '@uniswap/analytics-events'
import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import AddressInputPanel from 'components/AddressInputPanel'
import { sendEvent } from 'components/analytics'
import { BaseSwapPanel } from 'components/BaseSwapPanel/BaseSwapPanel'
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { GrayCard } from 'components/Card'
import Loader from 'components/Icons/LoadingSpinner'
import { AutoRow } from 'components/Row'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import ConfirmSwapModal from 'components/swap/ConfirmSwapModal'
import PriceImpactWarning from 'components/swap/PriceImpactWarning'
import SwapDetailsDropdown from 'components/swap/SwapDetailsDropdown'
import SwapHeader from 'components/swap/SwapHeader'
import { MouseoverTooltip } from 'components/Tooltip'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { ROUTER_ADDRESSES } from 'constants/addresses'
import { isSupportedChain } from 'constants/chains'
import useENSAddress from 'hooks/useENSAddress'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import usePermit2Allowance, { AllowanceState } from 'hooks/usePermit2Allowance'
import { useSwapCallback } from 'hooks/useSwapCallback'
import { useUSDPrice } from 'hooks/useUSDPrice'
import useWrapCallback, { WrapErrorText, WrapType } from 'hooks/useWrapCallback'
import JSBI from 'jsbi'
import { useCallback, useMemo, useState } from 'react'
import { ArrowDown, Info, Maximize2 } from 'react-feather'
import { useSelector } from 'react-redux'
import { Text } from 'rebass'
import { TradeState } from 'state/routing/types'
import { Field } from 'state/swap/actions'
import { useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import { useExpertModeManager } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { useTheme } from 'styled-components/macro'
import { LinkStyledButton, ThemedText } from 'theme'
import invariant from 'tiny-invariant'
import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
import { currencyAmountToPreciseFloat, formatTransactionAmount } from 'utils/formatNumbers'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { computeRealizedPriceImpact, warningSeverity } from 'utils/prices'

import { ArrowWrapper, SwapCallbackError } from '../../components/swap/styleds'
import { ArrowContainer, DetailsSwapSection, getIsValidSwapQuote, InputSection, OutputSwapSection } from '.'

const TRADE_STRING = 'SwapRouter'
const Wrapper = styled.div`
  padding: 1rem;
  padding-top: 0rem;
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

const SwapTabContent = () => {
  const theme = useTheme()
  const { account, chainId } = useWeb3React()
  const tab = useSelector((state: any) => state.swap.tab)

  const {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
    onLeverageFactorChange,
    // onLeverageChange,
    onPremiumChange,
    onSwitchSwapModalTab,
  } = useSwapActionHandlers()

  const [swapQuoteReceivedDate, setSwapQuoteReceivedDate] = useState<Date | undefined>()

  const {
    trade: { state: tradeState, trade },
    allowedSlippage,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo()

  const {
    independentField,
    typedValue,
    recipient,
    // leverageFactor,
    // leverage,
    // leverageManagerAddress,
    // activeTab,
    // ltv,
    // borrowManagerAddress,
    // premium,
  } = useSwapState()

  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash, showLeverageConfirm }, setSwapState] =
    useState<{
      showConfirm: boolean
      tradeToConfirm: Trade<Currency, Currency, TradeType> | undefined
      attemptingTxn: boolean
      swapErrorMessage: string | undefined
      txHash: string | undefined
      showLeverageConfirm: boolean
      // showBorrowConfirm: boolean
    }>({
      showConfirm: false,
      tradeToConfirm: undefined,
      attemptingTxn: false,
      swapErrorMessage: undefined,
      txHash: undefined,
      showLeverageConfirm: false,
      // showBorrowConfirm: false
    })

  const handleAcceptChanges = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade,
      swapErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm,
      showLeverageConfirm: false,
    })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const fiatValueTradeInput = useUSDPrice(trade?.inputAmount)
  const fiatValueTradeOutput = useUSDPrice(trade?.outputAmount)
  const swapFiatValues = useMemo(() => {
    return { amountIn: fiatValueTradeInput.data, amountOut: fiatValueTradeOutput.data }
  }, [fiatValueTradeInput, fiatValueTradeOutput])

  const maximumAmountIn = useMemo(() => {
    const maximumAmountIn = trade?.maximumAmountIn(allowedSlippage)
    return maximumAmountIn?.currency.isToken ? (maximumAmountIn as CurrencyAmount<Token>) : undefined
  }, [allowedSlippage, trade])

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount,
          }
        : {
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
          },
    [independentField, parsedAmount, showWrap, trade]
  )

  const allowance = usePermit2Allowance(
    maximumAmountIn ??
      (parsedAmounts[Field.INPUT]?.currency.isToken
        ? (parsedAmounts[Field.INPUT] as CurrencyAmount<Token>)
        : undefined),
    isSupportedChain(chainId) ? ROUTER_ADDRESSES[chainId] : undefined
  )

  const { callback: swapCallback } = useSwapCallback(
    trade, // simulated swap trade
    swapFiatValues,
    allowedSlippage,
    allowance.state === AllowanceState.ALLOWED ? allowance.permitSignature : undefined
  )

  const { address: recipientAddress } = useENSAddress(recipient)

  const [routeNotFound, routeIsLoading, routeIsSyncing] = useMemo(
    () => [!trade?.swaps, TradeState.LOADING === tradeState, TradeState.SYNCING === tradeState],
    [trade, tradeState]
  )

  const stablecoinPriceImpact = useMemo(
    () =>
      routeIsSyncing || !trade
        ? undefined
        : computeFiatValuePriceImpact(fiatValueTradeInput.data, fiatValueTradeOutput.data),
    [fiatValueTradeInput, fiatValueTradeOutput, routeIsSyncing, trade]
  )

  const maxInputAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(currencyBalances[Field.INPUT]),
    [currencyBalances]
  )

  const fiatValueInput = useUSDPrice(parsedAmounts[Field.INPUT])
  const fiatValueOutput = useUSDPrice(parsedAmounts[Field.OUTPUT])

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  const showDetailsDropdown = Boolean(
    !showWrap && userHasSpecifiedInputOutput && (trade || routeIsLoading || routeIsSyncing)
  )

  const handleSwap = useCallback(() => {
    if (!swapCallback) {
      return
    }
    if (stablecoinPriceImpact && !confirmPriceImpactWithoutFee(stablecoinPriceImpact)) {
      return
    }
    setSwapState({
      attemptingTxn: true,
      tradeToConfirm,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined,
      showLeverageConfirm,
    })
    swapCallback()
      .then((hash) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: hash,
          showLeverageConfirm,
        })
        sendEvent({
          category: 'Swap',
          action: 'transaction hash',
          label: hash,
        })
        sendEvent({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Swap w/o Send + recipient'
              : 'Swap w/ Send',
          label: [TRADE_STRING, trade?.inputAmount?.currency?.symbol, trade?.outputAmount?.currency?.symbol, 'MH'].join(
            '/'
          ),
        })
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
          showLeverageConfirm,
        })
      })
  }, [
    swapCallback,
    stablecoinPriceImpact,
    tradeToConfirm,
    showConfirm,
    recipient,
    recipientAddress,
    account,
    trade?.inputAmount?.currency?.symbol,
    trade?.outputAmount?.currency?.symbol,
    showLeverageConfirm,
  ])

  const { priceImpactSeverity, largerPriceImpact } = useMemo(() => {
    const marketPriceImpact = trade?.priceImpact ? computeRealizedPriceImpact(trade) : undefined
    const largerPriceImpact = largerPercentValue(marketPriceImpact, stablecoinPriceImpact)
    return { priceImpactSeverity: warningSeverity(largerPriceImpact), largerPriceImpact }
  }, [stablecoinPriceImpact, trade])

  // const {
  //   trade: leverageTrade,
  //   state: leverageState,
  //   inputError,
  //   allowedSlippage: leverageAllowedSlippage,
  //   contractError,
  // } = useDerivedLeverageCreationInfo()

  const [inputCurrency, outputCurrency] = useMemo(() => {
    return [currencies[Field.INPUT], currencies[Field.OUTPUT]]
  }, [currencies])

  // const { callback: leverageCallback } = useAddLeveragePositionCallback(
  //   leverageManagerAddress ?? undefined,
  //   trade,
  //   leverageTrade,
  //   leverageAllowedSlippage,
  //   leverageFactor ?? undefined
  // )

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : formatTransactionAmount(currencyAmountToPreciseFloat(parsedAmounts[dependentField])),
    }),
    [dependentField, independentField, parsedAmounts, showWrap, typedValue]
  )

  // const handleLeverageCreation = useCallback(() => {
  //   if (!leverageCallback) {
  //     return
  //   }
  //   setSwapState({
  //     attemptingTxn: true,
  //     tradeToConfirm,
  //     showConfirm,
  //     swapErrorMessage: undefined,
  //     txHash: undefined,
  //     showLeverageConfirm,
  //   })
  //   leverageCallback()
  //     .then((hash: any) => {
  //       setSwapState({
  //         attemptingTxn: false,
  //         tradeToConfirm,
  //         showConfirm,
  //         swapErrorMessage: undefined,
  //         txHash: hash,
  //         showLeverageConfirm,
  //       })
  //       sendEvent({
  //         category: 'Swap',
  //         action: 'transaction hash',
  //         label: hash,
  //       })
  //       sendEvent({
  //         category: 'Swap',
  //         action:
  //           recipient === null
  //             ? 'Swap w/o Send'
  //             : (recipientAddress ?? recipient) === account
  //             ? 'Swap w/o Send + recipient'
  //             : 'Swap w/ Send',
  //         label: [TRADE_STRING, inputCurrency?.symbol, outputCurrency?.symbol, 'MH'].join('/'),
  //       })
  //     })
  //     .catch((error: any) => {
  //       console.log('leverageCreationError: ', error)
  //       setSwapState({
  //         attemptingTxn: false,
  //         tradeToConfirm,
  //         showConfirm,
  //         swapErrorMessage: 'Failed creation', //error.message,
  //         txHash: undefined,
  //         showLeverageConfirm,
  //       })
  //     })
  // }, [
  //   leverageCallback,
  //   showLeverageConfirm,
  //   account,
  //   recipient,
  //   inputCurrency,
  //   outputCurrency,
  //   recipientAddress,
  //   showConfirm,
  //   tradeToConfirm,
  // ])

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({
      showConfirm: false,
      tradeToConfirm,
      attemptingTxn,
      swapErrorMessage,
      txHash,
      showLeverageConfirm: false,
    })
    if (txHash) {
      onUserInput(Field.INPUT, '')
      onLeverageFactorChange('1')
      // onLTVChange('')
      onPremiumChange(new BN(0))
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash, onLeverageFactorChange, onPremiumChange])

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

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact())
    sendEvent({
      category: 'Swap',
      action: 'Max',
    })
  }, [maxInputAmount, onUserInput])

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )
  const toggleWalletDrawer = useToggleWalletDrawer()
  const [isExpertMode] = useExpertModeManager()

  const isValid = !swapInputError
  // const lmtIsValid = !inputError

  const swapIsUnsupported = useIsSwapUnsupported(currencies[Field.INPUT], currencies[Field.OUTPUT])

  const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode
  const showPriceImpactWarning = largerPriceImpact && priceImpactSeverity > 3

  // const [debouncedLeverageFactor, onDebouncedLeverageFactor] = useDebouncedChangeHandler(
  //   leverageFactor ?? '1',
  //   onLeverageFactorChange
  // )
  // const [sliderLeverageFactor, setSliderLeverageFactor] = useDebouncedChangeHandler(
  //   leverageFactor ?? '1',
  //   onLeverageFactorChange
  // )

  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount))
  // const [lmtRouteNotFound, lmtRouteIsLoading] = useMemo(
  //   () => [leverageState === LeverageTradeState.NO_ROUTE_FOUND, leverageState === LeverageTradeState.LOADING],
  //   [leverageState]
  // )
  const isApprovalLoading = allowance.state === AllowanceState.REQUIRED && allowance.isApprovalLoading
  const [isAllowancePending, setIsAllowancePending] = useState(false)
  const updateAllowance = useCallback(async () => {
    invariant(allowance.state === AllowanceState.REQUIRED)
    setIsAllowancePending(true)
    try {
      await allowance.approveAndPermit()
      sendAnalyticsEvent(InterfaceEventName.APPROVE_TOKEN_TXN_SUBMITTED, {
        chain_id: chainId,
        token_symbol: maximumAmountIn?.currency.symbol,
        token_address: maximumAmountIn?.currency.address,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setIsAllowancePending(false)
    }
  }, [allowance, chainId, maximumAmountIn?.currency.address, maximumAmountIn?.currency.symbol])

  // const [leverageApproveAmount] = useMemo(() => {
  //   if (inputCurrency && parsedAmounts[Field.INPUT] && outputCurrency && premium) {
  //     return [
  //       CurrencyAmount.fromRawAmount(
  //         inputCurrency,
  //         new BN(parsedAmounts[Field.INPUT]?.toExact() ?? 0).plus(premium).shiftedBy(18).toFixed(0)
  //       ),
  //     ]
  //   } else {
  //     return [undefined]
  //   }
  // }, [inputCurrency, parsedAmounts, outputCurrency, premium])

  // const [leverageApprovalState, approveLeverageManager] = useApproveCallback(
  //   leverageApproveAmount,
  //   leverageManagerAddress ?? undefined
  // )
  // const updateLeverageAllowance = useCallback(async () => {
  //   try {
  //     await approveLeverageManager()
  //   } catch (err) {
  //     console.log('approveLeverageManager err: ', err)
  //   }
  // }, [approveLeverageManager])

  // console.log('swapmodal log', leverageTrade, showLeverageConfirm)

  return (
    <Wrapper>
      <SwapHeader allowedSlippage={allowedSlippage} />
      <ConfirmSwapModal
        isOpen={showConfirm}
        trade={trade}
        originalTrade={tradeToConfirm}
        onAcceptChanges={handleAcceptChanges}
        attemptingTxn={attemptingTxn}
        txHash={txHash}
        recipient={recipient}
        allowedSlippage={allowedSlippage}
        onConfirm={handleSwap}
        swapErrorMessage={swapErrorMessage}
        onDismiss={handleConfirmDismiss}
        swapQuoteReceivedDate={swapQuoteReceivedDate}
        fiatValueInput={fiatValueTradeInput}
        fiatValueOutput={fiatValueTradeOutput}
      />

      <div style={{ display: 'relative' }}>
        <InputSection>
          <Trace section={InterfaceSectionName.CURRENCY_INPUT_PANEL}>
            <BaseSwapPanel
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={showMaxButton}
              currency={currencies[Field.INPUT] ?? null}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              fiatValue={fiatValueInput}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT] ?? null}
              showCommonBases={true}
              id={InterfaceSectionName.CURRENCY_INPUT_PANEL}
              loading={independentField === Field.OUTPUT && routeIsSyncing}
              label="Input"
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
                onSwitchTokens(false)
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
          <OutputSwapSection showDetailsDropdown={showDetailsDropdown}>
            <Trace section={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}>
              <BaseSwapPanel
                value={formattedAmounts[Field.OUTPUT]}
                onUserInput={handleTypeOutput}
                showMaxButton={false}
                hideBalance={false}
                fiatValue={fiatValueOutput}
                priceImpact={stablecoinPriceImpact}
                currency={currencies[Field.OUTPUT] ?? null}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies[Field.INPUT] ?? null}
                showCommonBases={true}
                id={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}
                loading={independentField === Field.INPUT && routeIsSyncing}
                label="Recieve"
              />
            </Trace>

            {recipient !== null && !showWrap ? (
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
            ) : null}
          </OutputSwapSection>
          <DetailsSwapSection>
            <SwapDetailsDropdown
              trade={trade}
              syncing={routeIsSyncing}
              loading={routeIsLoading}
              allowedSlippage={allowedSlippage}
            />
          </DetailsSwapSection>
        </div>
        {showPriceImpactWarning && <PriceImpactWarning priceImpact={largerPriceImpact} />}
        <div>
          {swapIsUnsupported ? (
            <ButtonPrimary disabled={true}>
              <ThemedText.DeprecatedMain mb="4px">
                <Trans>Unsupported Asset</Trans>
              </ThemedText.DeprecatedMain>
            </ButtonPrimary>
          ) : !account ? (
            <TraceEvent
              events={[BrowserEvent.onClick]}
              name={InterfaceEventName.CONNECT_WALLET_BUTTON_CLICKED}
              properties={{
                received_swap_quote: getIsValidSwapQuote(trade, tradeState, swapInputError),
              }}
              element={InterfaceElementName.CONNECT_WALLET_BUTTON}
            >
              <ButtonLight onClick={toggleWalletDrawer} fontWeight={600}>
                <Trans>Connect Wallet</Trans>
              </ButtonLight>
            </TraceEvent>
          ) : showWrap ? (
            <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap} fontWeight={600}>
              {wrapInputError ? (
                <WrapErrorText wrapInputError={wrapInputError} />
              ) : wrapType === WrapType.WRAP ? (
                <Trans>Wrap</Trans>
              ) : wrapType === WrapType.UNWRAP ? (
                <Trans>Unwrap</Trans>
              ) : null}
            </ButtonPrimary>
          ) : routeNotFound && userHasSpecifiedInputOutput && !routeIsLoading && !routeIsSyncing ? (
            <GrayCard style={{ textAlign: 'center' }}>
              <ThemedText.DeprecatedMain mb="4px">
                <Trans>Insufficient liquidity for this trade.</Trans>
              </ThemedText.DeprecatedMain>
            </GrayCard>
          ) : isValid && allowance.state === AllowanceState.REQUIRED ? (
            <ButtonPrimary
              onClick={updateAllowance}
              disabled={isAllowancePending || isApprovalLoading}
              style={{ gap: 14 }}
            >
              {isAllowancePending ? (
                <>
                  <Loader size="20px" />
                  <Trans>Approve in your wallet</Trans>
                </>
              ) : isApprovalLoading ? (
                <>
                  <Loader size="20px" />
                  <Trans>Approval pending</Trans>
                </>
              ) : (
                <>
                  <div style={{ height: 20 }}>
                    <MouseoverTooltip text={<Trans>Permission is required for Limitless to trade each token.</Trans>}>
                      <Info size={20} />
                    </MouseoverTooltip>
                  </div>
                  <Trans>Approve use of {currencies[Field.INPUT]?.symbol}</Trans>
                </>
              )}
            </ButtonPrimary>
          ) : (
            <ButtonError
              onClick={() => {
                if (isExpertMode) {
                  handleSwap()
                } else {
                  setSwapState({
                    tradeToConfirm: trade,
                    attemptingTxn: false,
                    swapErrorMessage: undefined,
                    showConfirm: true,
                    txHash: undefined,
                    showLeverageConfirm: false,
                  })
                }
              }}
              id="swap-button"
              disabled={
                !isValid ||
                routeIsSyncing ||
                routeIsLoading ||
                priceImpactTooHigh ||
                allowance.state !== AllowanceState.ALLOWED
              }
              error={isValid && priceImpactSeverity > 2 && allowance.state === AllowanceState.ALLOWED}
            >
              <Text fontSize={20} fontWeight={600}>
                {swapInputError ? (
                  swapInputError
                ) : routeIsSyncing || routeIsLoading ? (
                  <Trans>Swap</Trans>
                ) : priceImpactTooHigh ? (
                  <Trans>Price Impact Too High</Trans>
                ) : priceImpactSeverity > 2 ? (
                  <Trans>Swap Anyway</Trans>
                ) : (
                  <Trans>Swap</Trans>
                )}
              </Text>
            </ButtonError>
          )}
          {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
        </div>
      </div>
    </Wrapper>
  )
}

export default SwapTabContent
