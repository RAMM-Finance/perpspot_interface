import { Trans } from '@lingui/macro'
import { Trace, TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, InterfaceSectionName, SwapEventName } from '@uniswap/analytics-events'
import { formatCurrencyAmount, formatNumberOrString, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import CurrencyInputPanel from 'components/BaseSwapPanel'
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { GrayCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Icons/LoadingSpinner'
import { RowBetween } from 'components/Row'
import { LmtSettingsTab } from 'components/Settings'
import DiscreteSliderMarks from 'components/Slider/MUISlider'
import { LeverageConfirmModal } from 'components/swap/ConfirmSwapModal'
// import { ArrowWrapper } from '../../components/swap/styleds'
// import {
//   ArrowContainer,
//   DetailsSwapSection,
//   InputSection,
//   LeverageGaugeSection,
//   LeverageInputSection,
//   OutputSwapSection,
//   StyledNumericalInput,
// } from '.'
import { ArrowWrapper } from 'components/swap/styleds'
import { LeverageDetailsDropdown } from 'components/swap/SwapDetailsDropdown'
import { MouseoverTooltip } from 'components/Tooltip'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { LMT_MARGIN_FACILITY } from 'constants/addresses'
import { isSupportedChain, SupportedChainId } from 'constants/chains'
import { useCurrency } from 'hooks/Tokens'
import { useAddPositionCallback } from 'hooks/useAddPositionCallBack'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import { useMarginLMTPositionFromPositionId } from 'hooks/useLMTV2Positions'
import { usePool } from 'hooks/usePools'
import { useUSDPrice } from 'hooks/useUSDPrice'
import useCurrencyBalance from 'lib/hooks/useCurrencyBalance'
import {
  ArrowContainer,
  DetailsSwapSection,
  InputSection,
  LeverageGaugeSection,
  LeverageInputSection,
  OutputSwapSection,
  StyledNumericalInput,
} from 'pages/Swap'
import { useCallback, useMemo, useState } from 'react'
import { Info, Maximize2 } from 'react-feather'
import { AddMarginTrade, useDerivedAddPositionInfo } from 'state/marginTrading/hooks'
import { LeverageTradeState } from 'state/routing/types'
import styled, { css } from 'styled-components/macro'
import { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { TraderPositionKey } from 'types/lmtv2position'
import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'

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

const Filter = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  width: fit-content;
  margin-bottom: 0.5rem;
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
export const IncreasePositionContent = ({ positionKey }: { positionKey: TraderPositionKey }) => {
  const theme = useTheme()
  const { account, chainId } = useWeb3React()
  // const tab = useSelector((state: any) => state.swap.tab)

  // const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers()
  const [margin, setMargin] = useState<string>()
  const [leverageFactor, setLeverageFactor] = useState<string>()
  const { position, loading: positionLoading } = useMarginLMTPositionFromPositionId(positionKey)

  const inputCurrency = useCurrency(
    position?.isToken0 ? position?.poolKey?.token1Address : position?.poolKey.token0Address
  )
  const outputCurrency = useCurrency(
    position?.isToken0 ? position?.poolKey?.token0Address : position?.poolKey.token1Address
  )

  const maxInputAmount: CurrencyAmount<Currency> | undefined = useCurrencyBalance(account, inputCurrency ?? undefined)

  const [showSettings, setShowSettings] = useState(false)
  const onToggleSettings = useCallback(() => {
    setShowSettings((current) => !current)
  }, [setShowSettings])

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
  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey?.poolKey.fee)
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
    margin,
    leverageFactor,
    pool ?? undefined,
    inputCurrency?.wrapped.address,
    outputCurrency?.wrapped.address
  )

  // const { onLeverageFactorChange, onMarginChange, onChangeTradeType } = useMarginTradingActionHandlers()

  // allowance / approval
  const [facilityApprovalState, approveMarginFacility] = useApproveCallback(
    preTradeInfo?.approvalAmount,
    LMT_MARGIN_FACILITY[chainId ?? SupportedChainId.SEPOLIA]
  )

  // const { activeTab } = useSwapState()

  const toggleWalletDrawer = useToggleWalletDrawer()

  // const swapIsUnsupported = useIsSwapUnsupported(inputCurrency, currencies[Field.OUTPUT])

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
      setMargin('')
      setLeverageFactor('')
    }
  }, [txHash])

  // const handleAcceptChanges = useCallback(() => {
  //   setTradeState((currentState) => ({ ...currentState, tradeToConfirm: trade }))
  // }, [trade])

  const handleMarginInput = useCallback(
    (value: string) => {
      setMargin(value)
    },
    [setMargin]
  )

  const handleMaxInput = useCallback(() => {
    maxInputAmount && setMargin(maxInputAmount.toExact())
  }, [maxInputAmount, setMargin])

  const stablecoinPriceImpact = useMemo(
    () =>
      tradeIsLoading || !trade
        ? undefined
        : computeFiatValuePriceImpact(fiatValueTradeInput.data, fiatValueTradeOutput.data),
    [fiatValueTradeInput, fiatValueTradeOutput, tradeIsLoading, trade]
  )

  const [debouncedLeverageFactor, onDebouncedLeverageFactor] = useDebouncedChangeHandler(
    leverageFactor ?? '',
    setLeverageFactor
  )

  const [sliderLeverageFactor, setSliderLeverageFactor] = useDebouncedChangeHandler(
    leverageFactor ?? '',
    setLeverageFactor
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
      <LmtSettingsTab
        isOpen={showSettings}
        onToggle={onToggleSettings}
        allowedSlippage={allowedSlippage}
        autoSlippedTick={allowedSlippedTick}
      />
      <div style={{ display: 'relative' }}>
        <InputSection>
          <div style={{ fontWeight: 'bold' }}>
            <Trans>Additional Collateral</Trans>
          </div>
          <Trace section={InterfaceSectionName.CURRENCY_INPUT_PANEL}>
            <CurrencyInputPanel
              value={margin ?? ''}
              onUserInput={handleMarginInput}
              showMaxButton={true}
              onMax={handleMaxInput}
              id="margin-input-modal"
              currency={inputCurrency}
            />
          </Trace>
        </InputSection>
        <ArrowWrapper clickable={isSupportedChain(chainId)}>
          <TraceEvent
            events={[BrowserEvent.onClick]}
            name={SwapEventName.SWAP_TOKENS_REVERSED}
            element={InterfaceElementName.SWAP_TOKENS_REVERSE_ARROW_BUTTON}
          >
            <ArrowContainer color={theme.textPrimary}>
              <Maximize2 size="10" color={theme.textPrimary} />
            </ArrowContainer>
          </TraceEvent>
        </ArrowWrapper>
      </div>
      <div>
        <div>
          <OutputSwapSection showDetailsDropdown={false}>
            <Trans>Position Size</Trans>
            <Trace section={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}>
              <CurrencyInputPanel
                value={
                  tradeState !== LeverageTradeState.VALID || !trade
                    ? '-'
                    : formatCurrencyAmount(trade.swapOutput, NumberType.SwapTradeAmount)
                }
                onUserInput={() => 0}
                showMaxButton={false}
                hideBalance={true}
                id="margin-input-modal"
                currency={outputCurrency}
              />
            </Trace>
          </OutputSwapSection>
          <LeverageGaugeSection>
            <AutoColumn gap="md">
              <RowBetween>
                <div style={{ marginRight: '20px' }}>
                  <ThemedText.DeprecatedMain fontWeight={400}>
                    <Trans>Leverage</Trans>
                  </ThemedText.DeprecatedMain>
                </div>
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
                  initialValue={sliderLeverageFactor === '' ? 10 : parseInt(sliderLeverageFactor, 10)}
                  onChange={(val) => setSliderLeverageFactor(val.toString())}
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
          {!account ? (
            <ButtonLight
              style={{ fontSize: '14px', borderRadius: '10px' }}
              width="14"
              padding=".5rem"
              onClick={toggleWalletDrawer}
              fontWeight={600}
            >
              <Trans>Connect Wallet</Trans>
            </ButtonLight>
          ) : tradeNotFound && !tradeIsLoading ? (
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
