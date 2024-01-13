import { Trans } from '@lingui/macro'
import { Button } from '@mui/material'
import { NumberType } from '@uniswap/conedison/format'
import { Currency, Percent, Price } from '@uniswap/sdk-core'
import { Pool, priceToClosestTick } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import AnimatedDropdown from 'components/AnimatedDropdown'
import SwapCurrencyInputPanelV2 from 'components/BaseSwapPanel/CurrencyInputPanel'
import { ButtonError } from 'components/Button'
import { DarkCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import {
  RotatingArrow,
  Spinner,
  StyledCard,
  StyledInfoIcon,
  StyledPolling,
  StyledPollingDot,
  TransactionDetails,
} from 'components/modalFooters/common'
import Row from 'components/Row'
import { RowBetween, RowFixed } from 'components/Row'
import { LmtSettingsTab } from 'components/Settings'
import { PercentSlider } from 'components/Slider/MUISlider'
import Toggle from 'components/Toggle'
import { ToggleElement, ToggleWrapper } from 'components/Toggle/MultiToggle'
import { BorrowedLiquidityRange, useBorrowedLiquidityRange } from 'hooks/useBorrowedLiquidityRange'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import { useMarginOrderPositionFromPositionId } from 'hooks/useLMTV2Positions'
import { usePool } from 'hooks/usePools'
import { useUSDPrice } from 'hooks/useUSDPrice'
import JSBI from 'jsbi'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { DynamicSection } from 'pages/Swap/tradeModal'
import { PriceToggleSection } from 'pages/Swap/tradeModal'
import { Filter, FilterWrapper, Selector, StyledSelectorText } from 'pages/Swap/tradeModal'
import { useCallback, useMemo, useState } from 'react'
import { AlertTriangle } from 'react-feather'
import { parseBN } from 'state/marginTrading/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { useTheme } from 'styled-components/macro'
import styled from 'styled-components/macro'
import { HideSmall, ThemedText } from 'theme'
import { MarginPositionDetails, OrderPositionKey, TraderPositionKey } from 'types/lmtv2position'
import { TokenBN } from 'utils/lmtSDK/internalConstants'

import { ConfirmLimitReducePositionHeader, ConfirmReducePositionHeader } from '../ConfirmModalHeaders'
import { BaseFooter } from '../DepositPremiumContent'
import { AlteredPositionProperties } from '../LeveragePositionModal'
import ConfirmModifyPositionModal from '../TransactionModal'
import { ExistingReduceOrderSection } from './CancelLimitOrder'
import DecreasePositionLimitDetails from './DecreaseLimitPositionDetails'
import { useReduceLimitOrderCallback, useReducePositionCallback } from './DecreasePositionCallbacks'
import { DecreasePositionDetails } from './DecreasePositionDetails'
import { useDerivedReduceLimitPositionInfo, useDerivedReducePositionInfo } from './hooks'

export interface DerivedReducePositionInfo {
  PnL: BN
  returnedAmount: BN
  premium: BN
  profitFee: BN
  reduceAmount: TokenBN
  // newPosition: MarginPositionDetails
  minimumOutput: BN
  executionPrice: Price<Currency, Currency>
  amount0: BN
  amount1: BN
  margin: BN
  totalPosition: BN
  totalDebtInput: BN
  totalDebtOutput: BN
  withdrawnPremium: TokenBN
}

export interface DerivedLimitReducePositionInfo {
  margin: BN
  newTotalPosition: TokenBN
  // totalDebtInput: BN
  // totalDebtOutput: BN

  // orderLifetime: number
  positionReduceAmount: BN
  startingDebtReduceAmount: BN
  minimumDebtReduceAmount: BN
  startingTriggerPrice: Price<Currency, Currency> // input / output
  estimatedPnL: TokenBN
}

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
`

const CloseText = styled(ThemedText.LabelSmall)<{ isActive: boolean }>`
  color: ${({ theme, isActive }) => (isActive ? theme.textSecondary : theme.textPrimary)};
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`

const StyledHeaderRow = styled(RowBetween)<{ disabled: boolean; open: boolean }>`
  padding: 0;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
`

const StyledBGCard = styled(StyledCard)`
  background: ${({ theme }) => theme.surface1};
`

export enum DerivedInfoState {
  LOADING,
  VALID,
  INVALID,
  SYNCING, // syncing means already loaded valid info, but updating to newest info
}

const InputSection = styled.div`
  background-color: ${({ theme }) => theme.surface1};
  margin-bottom: 10px;
  padding: 10px;
  margin-top: 5px;
  &:focus-within {
    border: 1px solid ${({ theme }) => theme.accentActive};
  }
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  color: ${({ theme }) => theme.textSecondary};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Hr = styled.hr`
  background-color: ${({ theme }) => theme.backgroundOutline};
  border: none;
  height: 0.5px;
  width: 90%;
`

const ShowInRangeNote = styled(AutoColumn)`
  background-color: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  color: ${({ theme }) => theme.textPrimary};
  padding: 0.5rem;
  border-radius: 12px;
  margin-top: 8px;
  margin-bottom: 10px;
  margin-right: 8px;
`

const LabelText = styled.div<{ color: string }>`
  align-items: center;
  color: ${({ color }) => color};
  display: flex;
  flex-direction: row;
`

const InRangeLimitReduceWarning = () => {
  const theme = useTheme()
  return (
    <ShowInRangeNote justify="flex-start" gap="0px">
      <RowBetween>
        <RowFixed>
          <LabelText color={theme.accentWarning}>
            <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
          </LabelText>
          <ThemedText.DeprecatedMain fontSize={14} color={theme.textSecondary}>
            <Trans>Position liquidity in range, must be reduced with a limit order</Trans>
          </ThemedText.DeprecatedMain>
        </RowFixed>
      </RowBetween>
    </ShowInRangeNote>
  )
}

const BelowRangeLimitReduceNote = () => {
  const theme = useTheme()
  return (
    <ShowInRangeNote justify="flex-start" gap="0px">
      <RowBetween>
        <RowFixed>
          <LabelText color={theme.accentWarning}>
            <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
          </LabelText>
          <ThemedText.DeprecatedMain fontSize={14} color={theme.textSecondary}>
            <Trans>Position does not need limit order for reduction</Trans>
          </ThemedText.DeprecatedMain>
        </RowFixed>
      </RowBetween>
    </ShowInRangeNote>
  )
}

const PriceSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`

export default function DecreasePositionContent({
  positionKey,
  onPositionChange,
  positionData,
  inputCurrency,
  outputCurrency,
}: {
  positionKey: TraderPositionKey
  onPositionChange: (newPosition: AlteredPositionProperties) => void
  positionData: {
    position: MarginPositionDetails | undefined
    loading: boolean
  }
  inputCurrency?: Currency
  outputCurrency?: Currency
}) {
  const { position: existingPosition, loading: positionLoading } = positionData
  // state inputs, derived, handlers for trade confirmation
  const [reduceAmount, setReduceAmount] = useState('')
  const [currentState, setCurrentState] = useState<{
    showModal: boolean
    showLimitModal: boolean
    showDetails: boolean
    attemptingTxn: boolean
    attemptingLimitTxn: boolean
    txHash: string | undefined
    limitTxHash: string | undefined
    errorMessage: string | undefined
    limitErrorMessage: string | undefined
    isLimit: boolean
    originalTrade: DerivedReducePositionInfo | undefined
    originalLimitTrade: DerivedLimitReducePositionInfo | undefined
    limitAvailable: boolean
  }>({
    showModal: false,
    showLimitModal: false,
    showDetails: true,
    attemptingTxn: false,
    attemptingLimitTxn: false,
    txHash: undefined,
    limitTxHash: undefined,
    errorMessage: undefined,
    limitErrorMessage: undefined,
    isLimit: false,
    originalTrade: undefined,
    originalLimitTrade: undefined,
    limitAvailable: true,
  })

  const orderKey: OrderPositionKey = useMemo(() => {
    return {
      poolKey: positionKey.poolKey,
      trader: positionKey.trader,
      isToken0: positionKey.isToken0,
      isAdd: false,
    }
  }, [positionKey])
  const [tradeState, setTradeState] = useState<DerivedInfoState>(DerivedInfoState.INVALID)
  const [lmtTradeState, setLmtTradeState] = useState<DerivedInfoState>(DerivedInfoState.INVALID)

  const {
    position: orderPosition,
    loading: orderLoading,
    syncing: orderSyncing,
  } = useMarginOrderPositionFromPositionId(orderKey)

  const existingOrderBool = useMemo(() => {
    if (!orderPosition || !existingPosition) return undefined
    if (orderPosition.auctionStartTime > 0) {
      const reducePercent = orderPosition.inputAmount.div(existingPosition.totalPosition)
      onPositionChange({
        totalPosition: existingPosition.totalPosition.minus(orderPosition.inputAmount),
        margin: existingPosition.margin.times(new BN(1).minus(reducePercent)),
        totalDebtInput: existingPosition.totalDebtInput.times(new BN(1).minus(reducePercent)),
        totalDebtOutput: existingPosition.totalDebtOutput.times(new BN(1).minus(reducePercent)),
      })
      return true
    } else return false
  }, [orderPosition, existingPosition, onPositionChange])

  const [showSettings, setShowSettings] = useState(false)
  const [baseCurrencyIsInput, setBaseCurrencyIsInput] = useState(false)
  const [limitPrice, setLimitPrice] = useState<string>('')

  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)

  const [userSlippageTolerance] = useUserSlippageTolerance()
  // const [userSlippedTickTolerance] = useUserSlippedTickTolerance()

  const allowedSlippage = useMemo(() => {
    if (userSlippageTolerance === 'auto') return new Percent(JSBI.BigInt(3), JSBI.BigInt(100))
    else return userSlippageTolerance
  }, [userSlippageTolerance])

  const borrowLiquidityRange = useBorrowedLiquidityRange(existingPosition, pool ?? undefined)
  const inRange = useMemo(() => {
    if (
      (positionKey.isToken0 && borrowLiquidityRange === BorrowedLiquidityRange.BELOW_RANGE) ||
      (!positionKey.isToken0 && borrowLiquidityRange === BorrowedLiquidityRange.ABOVE_RANGE)
    ) {
      setCurrentState((prev) => ({ ...prev, isLimit: false, limitAvailable: false }))
    } else if (borrowLiquidityRange === BorrowedLiquidityRange.IN_RANGE) {
      setCurrentState((prev) => ({ ...prev, isLimit: true }))
    } else {
      setCurrentState((prev) => ({ ...prev, limitAvailable: true }))
    }
    return borrowLiquidityRange === BorrowedLiquidityRange.IN_RANGE
  }, [borrowLiquidityRange, positionKey.isToken0])

  const onToggle = useCallback(() => {
    setShowSettings(!showSettings)
  }, [showSettings])

  const [closePosition, setClosePosition] = useState(false)

  const { txnInfo, inputError, contractError } = useDerivedReducePositionInfo(
    currentState.isLimit,
    reduceAmount,
    positionKey,
    existingPosition,
    closePosition,
    allowedSlippage,
    setTradeState,
    onPositionChange,
    inRange,
    existingOrderBool,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  )

  const {
    inputError: lmtInputError,
    txnInfo: lmtTxnInfo,
    contractError: lmtContractError,
  } = useDerivedReduceLimitPositionInfo(
    currentState.isLimit,
    reduceAmount,
    limitPrice,
    orderKey,
    baseCurrencyIsInput,
    setLmtTradeState,
    onPositionChange,
    existingPosition,
    pool ?? undefined,
    existingOrderBool,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  )

  // const marginFacility = useMarginFacilityContract(true)

  const addTransaction = useTransactionAdder()

  // callback
  const { account } = useWeb3React()
  const parsedReduceAmount = useMemo(() => parseBN(reduceAmount), [reduceAmount])
  const parsedLimitPrice = useMemo(() => parseBN(limitPrice), [limitPrice])
  const { callback: limitCallback } = useReduceLimitOrderCallback(
    parsedReduceAmount,
    positionKey,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
    parsedLimitPrice,
    baseCurrencyIsInput,
    lmtTradeState
  )

  const callback = useReducePositionCallback(
    positionKey,
    parsedReduceAmount,
    existingPosition,
    closePosition,
    pool ?? undefined,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
    tradeState,
    allowedSlippage
  )

  const handleReducePosition = useCallback(() => {
    if (!callback || !txnInfo || !inputCurrency || !outputCurrency) {
      return
    }

    setCurrentState((prev) => ({ ...prev, attemptingTxn: true }))

    callback()
      .then((response) => {
        // setAttemptingTxn(false)
        setCurrentState((prev) => ({ ...prev, attemptingTxn: false, txHash: response?.hash, errorMessage: undefined }))
        // setTxHash(response?.hash)
        // setErrorMessage(undefined)
        addTransaction(response, {
          type: TransactionType.REDUCE_LEVERAGE,
          reduceAmount: Number(reduceAmount),
          inputCurrencyId: inputCurrency.wrapped.address,
          outputCurrencyId: outputCurrency.wrapped.address,
          pnl: Number(txnInfo.PnL),
          timestamp: new Date().getTime().toString(),
        })
      })
      .catch((error) => {
        console.error(error)
        setCurrentState((prev) => ({
          ...prev,
          errorMessage: error.message,
          attemptingTxn: false,
        }))
      })
  }, [callback, txnInfo, inputCurrency, outputCurrency, reduceAmount, addTransaction])

  const handleReduceLimitPosition = useCallback(() => {
    if (!limitCallback || !inputCurrency || !outputCurrency) {
      return
    }
    setCurrentState((prev) => ({ ...prev, attemptingLimitTxn: true }))
    limitCallback()
      .then((response) => {
        setCurrentState((prev) => ({
          ...prev,
          attemptingLimitTxn: false,
          limitTxHash: response?.hash,
          limitErrorMessage: undefined,
        }))
        addTransaction(response, {
          type: TransactionType.REDUCE_LIMIT_ORDER,
          inputCurrencyId: inputCurrency.wrapped.address,
          outputCurrencyId: outputCurrency.wrapped.address,
        })
        setReduceAmount('')
        setLimitPrice('')
      })
      .catch((err) => {
        console.log('limit error', err)
        setCurrentState((prev) => ({
          ...prev,
          attemptingLimitTxn: false,
          limitTxHash: undefined,
          limitErrorMessage: err.message,
        }))
        setReduceAmount('')
        setLimitPrice('')
      })
  }, [limitCallback, inputCurrency, outputCurrency, addTransaction])

  const [debouncedReduceAmount, onDebouncedReduceAmount] = useDebouncedChangeHandler(
    reduceAmount ?? '',
    setReduceAmount
  )

  const theme = useTheme()

  const loading = useMemo(() => tradeState === DerivedInfoState.LOADING, [tradeState])

  const handleDismiss = useCallback(() => {
    if (currentState.txHash) {
      setReduceAmount('')
    }
    setCurrentState((prev) => ({
      ...prev,
      showModal: false,
      attemptingTxn: false,
      txHash: undefined,
      errorMessage: undefined,
      originalTrade: undefined,
    }))
  }, [currentState])

  const handleDismissLimit = useCallback(() => {
    if (currentState.limitTxHash) {
      setReduceAmount('')
      setLimitPrice('')
    }
    setCurrentState((prev) => ({
      ...prev,
      showLimitModal: false,
      attemptingLimitTxn: false,
      limitTxHash: undefined,
      limitErrorMessage: undefined,
    }))
  }, [currentState])

  const currentPrice = useMemo(() => {
    if (pool && inputCurrency && outputCurrency) {
      const inputIsToken0 = inputCurrency.wrapped.sortsBefore(outputCurrency.wrapped)
      const baseIsToken0 = (baseCurrencyIsInput && inputIsToken0) || (!baseCurrencyIsInput && !inputIsToken0)
      if (baseIsToken0) {
        return formatBNToString(new BN(pool.token0Price.toFixed(18)), NumberType.FiatTokenPrice, true)
      } else {
        return formatBNToString(new BN(pool.token1Price.toFixed(18)), NumberType.FiatTokenPrice, true)
      }
    }
    return undefined
  }, [baseCurrencyIsInput, inputCurrency, pool, outputCurrency])

  const [baseCurrency, quoteCurrency] = useMemo(() => {
    return baseCurrencyIsInput ? [inputCurrency, outputCurrency] : [outputCurrency, inputCurrency]
  }, [baseCurrencyIsInput, inputCurrency, outputCurrency])

  const fiatValueReduceAmount = useUSDPrice(tryParseCurrencyAmount(reduceAmount, outputCurrency ?? undefined))

  if (existingOrderBool && pool && inputCurrency && outputCurrency && orderPosition && existingPosition) {
    return (
      <DarkCard width="390px" margin="0" padding="0" style={{ paddingRight: '1rem', paddingLeft: '1rem' }}>
        <ExistingReduceOrderSection
          pool={pool}
          inputCurrency={inputCurrency}
          outputCurrency={outputCurrency}
          order={orderPosition}
          loading={orderSyncing}
          orderKey={orderKey}
          position={existingPosition}
        />
      </DarkCard>
    )
  }

  return (
    <DarkCard width="390px" margin="0" padding="0" style={{ paddingRight: '1rem', paddingLeft: '1rem' }}>
      {currentState.showModal && (
        <ConfirmModifyPositionModal
          onDismiss={handleDismiss}
          isOpen={currentState.showModal}
          attemptingTxn={currentState.attemptingTxn}
          txHash={currentState.txHash}
          header={
            txnInfo ? (
              <ConfirmReducePositionHeader
                txnInfo={txnInfo}
                inputCurrency={inputCurrency ?? undefined}
                outputCurrency={outputCurrency ?? undefined}
                removePremium={closePosition}
                allowedSlippage={allowedSlippage}
                existingPosition={existingPosition}
                showAcceptChanges={false}
                onAcceptChanges={() => {}}
              />
            ) : null
          }
          bottom={
            <BaseFooter
              errorMessage={currentState.errorMessage ? <Trans>{currentState.errorMessage}</Trans> : undefined}
              onConfirm={handleReducePosition}
              confirmText="Confirm Reduce Position"
              disabledConfirm={!!inputError || !txnInfo}
            />
          }
          title="Confirm Reduce Position"
          pendingText={<Trans>Reducing Position ...</Trans>}
          currencyToAdd={outputCurrency ?? undefined}
          recipient={account ?? null}
          errorMessage={currentState.errorMessage ? <Trans>{currentState.errorMessage}</Trans> : undefined}
        />
      )}
      {currentState.showLimitModal && (
        <ConfirmModifyPositionModal
          onDismiss={handleDismissLimit}
          title="Confirm Reduce Limit Order"
          isOpen={currentState.showLimitModal}
          txHash={currentState.limitTxHash}
          attemptingTxn={currentState.attemptingLimitTxn}
          header={
            lmtTxnInfo ? (
              <ConfirmLimitReducePositionHeader
                txnInfo={lmtTxnInfo}
                inputCurrency={inputCurrency ?? undefined}
                showAcceptChanges={false}
                onAcceptChanges={() => {}}
                outputCurrency={outputCurrency ?? undefined}
                existingPosition={existingPosition}
              />
            ) : null
          }
          bottom={
            <BaseFooter
              errorMessage={currentState.limitErrorMessage ? <Trans>{currentState.limitErrorMessage}</Trans> : null}
              onConfirm={handleReduceLimitPosition}
              confirmText="Confirm Reduce Limit Order"
              disabledConfirm={!!lmtInputError || lmtTradeState !== DerivedInfoState.VALID}
            />
          }
          pendingText={<Trans>Submitting Limit Order ...</Trans>}
          currencyToAdd={outputCurrency ?? undefined}
          recipient={account ?? null}
          errorMessage={currentState.limitErrorMessage ? <Trans>{currentState.limitErrorMessage}</Trans> : undefined}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '100px', alignItems: 'center' }}>
          {inRange ? (
            <InRangeLimitReduceWarning />
          ) : currentState.limitAvailable ? (
            <FilterWrapper>
              <Filter onClick={() => setCurrentState((prev) => ({ ...prev, isLimit: !prev.isLimit }))}>
                <Selector active={!currentState.isLimit}>
                  <StyledSelectorText lineHeight="20px" active={!currentState.isLimit}>
                    Market
                  </StyledSelectorText>
                </Selector>
                <Selector active={currentState.isLimit}>
                  <StyledSelectorText lineHeight="20px" active={currentState.isLimit}>
                    Limit
                  </StyledSelectorText>
                </Selector>
              </Filter>
            </FilterWrapper>
          ) : (
            <BelowRangeLimitReduceNote />
          )}
        </div>

        <LmtSettingsTab
          isOpen={showSettings}
          onToggle={onToggle}
          allowedSlippage={allowedSlippage}
          isLimitOrder={currentState.isLimit}
        />
      </div>
      <div style={{ alignItems: 'flex-start' }}>
        <AnimatedDropdown open={currentState.isLimit}>
          <AutoColumn style={{ marginBottom: '10px' }}>
            <DynamicSection justify="start" gap="md" disabled={false}>
              <RowBetween>
                {Boolean(inputCurrency && outputCurrency) && (
                  <PriceToggleSection>
                    <div
                      style={{ width: 'fit-content', display: 'flex', alignItems: 'center' }}
                      onClick={() => setBaseCurrencyIsInput(() => !baseCurrencyIsInput)}
                    >
                      <ToggleWrapper width="fit-content">
                        <ToggleElement isActive={!baseCurrencyIsInput}>
                          <CurrencyLogo currency={outputCurrency} size="15px" />
                        </ToggleElement>
                        <ToggleElement isActive={baseCurrencyIsInput}>
                          <CurrencyLogo currency={inputCurrency} size="15px" />
                        </ToggleElement>
                      </ToggleWrapper>
                    </div>
                  </PriceToggleSection>
                )}
                <PriceSection onClick={() => setBaseCurrencyIsInput(() => !baseCurrencyIsInput)}>
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
            </DynamicSection>
          </AutoColumn>

          <DynamicSection gap="md" disabled={false}>
            <InputSection>
              <SwapCurrencyInputPanelV2
                value={limitPrice}
                onUserInput={(str: string) => {
                  setLimitPrice(str)
                }}
                showMaxButton={false}
                hideBalance={true}
                // fiatValue={fiatValueReduceAmount}
                // currency={outputCurrency}
                label="Limit price"
                id="limit-reduce-position-input"
                isPrice={
                  <Button
                    sx={{ textTransform: 'none' }}
                    style={{ display: 'flex', gap: '5px' }}
                    onClick={() => {
                      setBaseCurrencyIsInput(() => !baseCurrencyIsInput)
                      const val = parseBN(limitPrice)
                      if (val && !val?.isZero()) {
                        setLimitPrice(formatBNToString(new BN(1).div(val), NumberType.SwapTradeAmount))
                      }
                    }}
                  >
                    {quoteCurrency && <CurrencyLogo currency={quoteCurrency} size="15px" />}
                    <ThemedText.DeprecatedBody fontSize={14}>{quoteCurrency?.symbol} per </ThemedText.DeprecatedBody>
                    {baseCurrency && <CurrencyLogo currency={baseCurrency} size="15px" />}
                    <ThemedText.DeprecatedBody fontSize={14}>{baseCurrency?.symbol}</ThemedText.DeprecatedBody>
                  </Button>
                }
              />
            </InputSection>
          </DynamicSection>
        </AnimatedDropdown>
        <InputSection>
          <SwapCurrencyInputPanelV2
            value={reduceAmount}
            onUserInput={(str: string) => {
              if (closePosition) {
                setClosePosition(false)
              }
              if (existingPosition?.totalDebtInput) {
                if (str === '') {
                  onDebouncedReduceAmount('')
                } else if (new BN(str).isGreaterThan(new BN(existingPosition?.totalPosition))) {
                  return
                } else {
                  setReduceAmount(str)
                }
              }
            }}
            showMaxButton={false}
            hideBalance={true}
            fiatValue={fiatValueReduceAmount}
            currency={outputCurrency}
            label="Reduce Amount"
            id="reduce-position-input"
          />
        </InputSection>
        <PercentSlider
          initialValue={
            parseBN(debouncedReduceAmount) && existingPosition
              ? new BN(debouncedReduceAmount).div(existingPosition?.totalPosition).times(100).toFixed(1)
              : ''
          }
          onSlideChange={(val) => {
            if (val > 100 || val < 0) return
            existingPosition &&
              onDebouncedReduceAmount(new BN(val).div(100).times(existingPosition?.totalPosition).toString())
          }}
          onInputChange={(val) => {
            const valBN = parseBN(val)
            if (!valBN) {
              onDebouncedReduceAmount('')
            } else if (existingPosition) {
              if (valBN.isGreaterThan(new BN(100)) || valBN.isLessThan(new BN(0))) return
              setReduceAmount(new BN(val).div(100).times(existingPosition.totalPosition).toString())
            }
          }}
        />
        <Row gap="5px">
          <Toggle
            id="toggle-local-routing-button"
            isActive={closePosition}
            toggle={() => {
              if (closePosition) {
                setClosePosition(false)
                setReduceAmount('')
              } else {
                setClosePosition(true)
                existingPosition && setReduceAmount(existingPosition?.totalPosition.toString())
              }
            }}
          />
          <CloseText isActive={closePosition}>Close Position</CloseText>
        </Row>
        <AutoColumn justify="center" style={{ width: '100%', marginTop: '10px' }}>
          <TransactionDetails>
            <Wrapper>
              <AutoColumn gap="sm" style={{ width: '100%', marginBottom: '-8px' }}>
                <StyledHeaderRow
                  onClick={() => setCurrentState((prev) => ({ ...prev, showDetails: !prev.showDetails }))}
                  disabled={false}
                  open={currentState.showDetails}
                >
                  <RowFixed style={{ position: 'relative' }}>
                    {loading ? (
                      <StyledPolling>
                        <StyledPollingDot>
                          <Spinner />
                        </StyledPollingDot>
                      </StyledPolling>
                    ) : (
                      <HideSmall>
                        <StyledInfoIcon color={theme.deprecated_bg3} />
                      </HideSmall>
                    )}
                    {existingPosition ? (
                      loading ? (
                        <ThemedText.BodySmall>
                          <Trans>Finding Best Price...</Trans>
                        </ThemedText.BodySmall>
                      ) : currentState.isLimit ? (
                        <LoadingOpacityContainer $loading={loading}>
                          <ThemedText.BodySmall>Order Details </ThemedText.BodySmall>
                        </LoadingOpacityContainer>
                      ) : (
                        <LoadingOpacityContainer $loading={loading}>
                          <ThemedText.BodySmall>Trade Details </ThemedText.BodySmall>
                        </LoadingOpacityContainer>
                      )
                    ) : null}
                  </RowFixed>
                  <RowFixed>
                    <RotatingArrow stroke={theme.textTertiary} open={Boolean(currentState.showDetails)} />
                  </RowFixed>
                </StyledHeaderRow>
                {/* <Button onClick={() => setLoading(!testLoading)}>Click</Button> */}
                <AnimatedDropdown open={currentState.showDetails}>
                  <AutoColumn gap="sm" style={{ padding: '0', paddingBottom: '8px' }}>
                    {!currentState.isLimit ? (
                      <DecreasePositionDetails
                        txnInfo={txnInfo}
                        inputCurrency={inputCurrency ?? undefined}
                        loading={loading}
                        existingPosition={existingPosition}
                        allowedSlippage={allowedSlippage}
                        removePremium={closePosition}
                      />
                    ) : (
                      <DecreasePositionLimitDetails
                        txnInfo={lmtTxnInfo}
                        loading={loading}
                        inputCurrency={inputCurrency ?? undefined}
                        existingPosition={existingPosition}
                      />
                    )}
                  </AutoColumn>
                </AnimatedDropdown>
              </AutoColumn>
            </Wrapper>
          </TransactionDetails>
        </AutoColumn>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <ButtonError
          style={{
            fontSize: '12px',
            borderRadius: '10px',
            width: 'fit-content',
            height: '15px',
          }}
          padding=".25rem"
          onClick={() => {
            if (!currentState.isLimit) {
              setCurrentState((prev) => ({ ...prev, showModal: true, originalTrade: txnInfo }))
            } else {
              setCurrentState((prev) => ({ ...prev, showLimitModal: true, originalLimitTrade: lmtTxnInfo }))
            }
          }}
          id="leverage-button"
          disabled={
            !currentState.isLimit
              ? !!inputError || !txnInfo
              : !!lmtInputError || lmtTradeState !== DerivedInfoState.VALID
          }
        >
          <ThemedText.BodySmall fontWeight={600}>
            {!currentState.isLimit ? (
              inputError ? (
                inputError
              ) : contractError ? (
                contractError
              ) : tradeState === DerivedInfoState.INVALID ? (
                <Trans>Invalid Trade</Trans>
              ) : (
                <Trans>Execute</Trans>
              )
            ) : lmtInputError ? (
              lmtInputError
            ) : lmtContractError ? (
              lmtContractError
            ) : lmtTradeState === DerivedInfoState.INVALID ? (
              <Trans>Invalid Order</Trans>
            ) : (
              <Trans>Execute</Trans>
            )}
          </ThemedText.BodySmall>
        </ButtonError>
      </div>
    </DarkCard>
  )
}

const Underlined = styled.div`
  text-decoration: ${({ theme }) => `underline dashed ${theme.textTertiary}`};
`
export function getSlippedTicks(
  pool: Pool,
  slippedTickTolerance: Percent
): { slippedTickMin: number; slippedTickMax: number } {
  const pullUp = JSBI.BigInt(10_000 + Math.floor(Number(slippedTickTolerance.toFixed(18)) * 100))

  const pullDown = JSBI.BigInt(10_000 - Math.floor(Number(slippedTickTolerance.toFixed(18)) * 100))

  const minPrice = new Price(
    pool.token0,
    pool.token1,
    JSBI.multiply(pool.token0Price.denominator, JSBI.BigInt(10_000)),
    JSBI.multiply(pool.token0Price.numerator, pullDown)
  )

  const maxPrice = new Price(
    pool.token0,
    pool.token1,
    JSBI.multiply(pool.token0Price.denominator, JSBI.BigInt(10_000)),
    JSBI.multiply(pool.token0Price.numerator, pullUp)
  )

  // get slipped min/max tick
  const slippedTickMax = priceToClosestTick(maxPrice)
  const slippedTickMin = priceToClosestTick(minPrice)

  return {
    slippedTickMax,
    slippedTickMin,
  }
}
