import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Trans } from '@lingui/macro'
import { Button } from '@mui/material'
import { Percent, Price } from '@uniswap/sdk-core'
import { Pool, priceToClosestTick } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import AnimatedDropdown from 'components/AnimatedDropdown'
import CurrencyInputPanel from 'components/BaseSwapPanel'
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
  TextWithLoadingPlaceholder,
  TransactionDetails,
} from 'components/modalFooters/common'
import { RowStart } from 'components/Row'
import { RowBetween, RowFixed } from 'components/Row'
import { LmtSettingsTab } from 'components/Settings'
import { PercentSlider } from 'components/Slider/MUISlider'
import { TruncatedText } from 'components/swap/styleds'
import { ToggleElement, ToggleWrapper } from 'components/Toggle/MultiToggle'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { MouseoverTooltip } from 'components/Tooltip'
import { ethers } from 'ethers'
import { useCurrency } from 'hooks/Tokens'
import { useMarginFacilityContract } from 'hooks/useContract'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import { useMarginLMTPositionFromPositionId } from 'hooks/useLMTV2Positions'
import { usePool } from 'hooks/usePools'
import JSBI from 'jsbi'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { StyledNumericalInput } from 'pages/Swap'
import { DynamicSection } from 'pages/Swap/tradeModal'
import { PriceToggleSection } from 'pages/Swap/tradeModal'
import { LimitInputPrice, LimitInputRow, LimitInputWrapper } from 'pages/Swap/tradeModal'
import { Filter, FilterWrapper, Selector, StyledSelectorText } from 'pages/Swap/tradeModal'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useMarginTradingActionHandlers, useMarginTradingState } from 'state/marginTrading/hooks'
import { Field } from 'state/swap/actions'
import { useDerivedSwapInfo } from 'state/swap/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import { useUserSlippageTolerance, useUserSlippedTickTolerance } from 'state/user/hooks'
import { useTheme } from 'styled-components/macro'
import styled from 'styled-components/macro'
import { HideSmall, ThemedText } from 'theme'
import { MarginPositionDetails, TraderPositionKey } from 'types/lmtv2position'

import { BaseFooter } from './DepositPremiumContent'
import ConfirmModifyPositionModal from './TransactionModal'

interface DerivedReducePositionInfo {
  PnL: BN
  returnedAmount: BN
  premium: BN
  profitFee: BN
}

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
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

enum DerivedInfoState {
  LOADING,
  VALID,
  INVALID,
  SYNCING, // syncing means already loaded valid info, but updating to newest info
}

function useDerivedReducePositionInfo(
  reduceAmount: string,
  positionKey: TraderPositionKey,
  position: MarginPositionDetails | undefined,
  allowedSlippedTick: Percent,
  allowedSlippage: Percent,
  setState: (state: DerivedInfoState) => void
): {
  txnInfo: DerivedReducePositionInfo | undefined
  inputError: ReactNode | undefined
} {
  const marginFacility = useMarginFacilityContract()
  const inputCurrency = useCurrency(
    position?.isToken0 ? positionKey.poolKey.token1Address : positionKey.poolKey.token0Address
  )
  const outputCurrency = useCurrency(
    position?.isToken0 ? positionKey.poolKey.token0Address : positionKey.poolKey.token1Address
  )

  const [txnInfo, setTxnInfo] = useState<DerivedReducePositionInfo>()
  const [contractError, setContractError] = useState<React.ReactNode>()
  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)

  useEffect(() => {
    const lagged = async () => {
      if (
        !marginFacility ||
        !position ||
        Number(reduceAmount) <= 0 ||
        !reduceAmount ||
        !pool ||
        !inputCurrency ||
        !outputCurrency
      ) {
        setState(DerivedInfoState.INVALID)
        setTxnInfo(undefined)
        return
      }

      setState(DerivedInfoState.LOADING)

      try {
        const reducePercent = new BN(reduceAmount).div(position.totalPosition).shiftedBy(18).toFixed(0)
        const { slippedTickMin, slippedTickMax } = getSlippedTicks(pool, allowedSlippedTick)
        const price = !position.isToken0 ? pool.token1Price.toFixed(18) : pool.token0Price.toFixed(18)

        const minOutput = new BN(100)
          .minus(new BN(allowedSlippage.toFixed(18)))
          .div(100)
          .times(reduceAmount)
          .times(price)

        //   struct ReduceReturn {
        //     int256 amount0;
        //     int256 amount1;
        //     int256 PnL;
        //     uint256 returnedAmount;
        //     uint256 repaidDebt0;
        //     uint256 repaidDebt1;
        //     uint256 premium;
        //     uint256 profitFee;
        // }
        const reduceParam = {
          positionIsToken0: position.isToken0,
          reducePercentage: reducePercent,
          minOutput: minOutput.shiftedBy(outputCurrency.decimals).toFixed(0),
          trader: position.trader,
          executionOption: 1,
          executionData: ethers.constants.HashZero,
          slippedTickMin,
          slippedTickMax,
          reduceAmount: 0,
        }

        const result = await marginFacility.callStatic.reducePosition(
          {
            token0: positionKey.poolKey.token0Address,
            token1: positionKey.poolKey.token1Address,
            fee: positionKey.poolKey.fee,
          },
          reduceParam
        )

        const info: DerivedReducePositionInfo = {
          PnL: new BN(result.PnL.toString()).shiftedBy(-inputCurrency.decimals),
          returnedAmount: new BN(result.returnedAmount.toString()).shiftedBy(-outputCurrency.decimals),
          premium: new BN(result.premium.toString()).shiftedBy(-inputCurrency.decimals),
          profitFee: new BN(result.profitFee.toString()).shiftedBy(-inputCurrency.decimals),
        }

        setTxnInfo(info)
        setState(DerivedInfoState.VALID)
        setContractError(undefined)
      } catch (err) {
        console.log('reduce error', err)
        setState(DerivedInfoState.INVALID)
        setContractError(err)
        setTxnInfo(undefined)
      }
    }

    lagged()
  }, [
    setState,
    pool,
    marginFacility,
    reduceAmount,
    position,
    positionKey,
    inputCurrency,
    outputCurrency,
    allowedSlippage,
    allowedSlippedTick,
  ])

  const inputError = useMemo(() => {
    let error: React.ReactNode | undefined

    if (reduceAmount === '') {
      error = <Trans>Enter an amount</Trans>
    }

    return error
  }, [reduceAmount])

  return useMemo(() => {
    return {
      txnInfo,
      inputError,
    }
  }, [txnInfo, inputError])
}

export default function DecreasePositionContent({ positionKey }: { positionKey: TraderPositionKey }) {
  // state inputs, derived, handlers for trade confirmation
  const [reduceAmount, setReduceAmount] = useState('')
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [showDetails, setShowDetails] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [tradeState, setTradeState] = useState<DerivedInfoState>(DerivedInfoState.INVALID)
  const { position } = useMarginLMTPositionFromPositionId(positionKey)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [showSettings, setShowSettings] = useState(false)
  const [isLimit, setIsLimit] = useState(false)
  const [limitToken, setLimitToken] = useState(false)
  const [limitPrice, setLimitPrice] = useState<string>('')

  const inputCurrency = useCurrency(
    position?.isToken0 ? position?.poolKey?.token1Address : position?.poolKey.token0Address
  )
  const outputCurrency = useCurrency(
    position?.isToken0 ? position?.poolKey?.token0Address : position?.poolKey.token1Address
  )

  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)

  const [userSlippageTolerance] = useUserSlippageTolerance()
  const [userSlippedTickTolerance] = useUserSlippedTickTolerance()

  const allowedSlippage = useMemo(() => {
    if (userSlippageTolerance === 'auto') return new Percent(JSBI.BigInt(3), JSBI.BigInt(100))
    else return userSlippageTolerance
  }, [userSlippageTolerance])

  const allowedSlippedTick = useMemo(() => {
    if (userSlippedTickTolerance === 'auto') return new Percent(JSBI.BigInt(3), JSBI.BigInt(100))
    else return userSlippedTickTolerance
  }, [userSlippedTickTolerance])

  const onToggle = useCallback(() => {
    setShowSettings(!showSettings)
  }, [showSettings])

  const { txnInfo, inputError } = useDerivedReducePositionInfo(
    reduceAmount,
    positionKey,
    position,
    allowedSlippedTick,
    allowedSlippage,
    setTradeState
  )

  const reductionPercent = useMemo(() => {
    return position?.totalPosition && reduceAmount !== ''
      ? formatBNToString(new BN(reduceAmount).div(position?.totalPosition).times(100))
      : '0'
  }, [position, reduceAmount])

  const marginFacility = useMarginFacilityContract(true)

  const addTransaction = useTransactionAdder()

  // callback
  const { account, provider, chainId } = useWeb3React()
  const callback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!provider) throw new Error('missing provider')
      if (!txnInfo) throw new Error('missing txn info')
      if (!marginFacility) throw new Error('missing marginFacility contract')
      if (!position) throw new Error('missing position')
      if (!pool || !outputCurrency || !inputCurrency) throw new Error('missing pool')
      if (tradeState !== DerivedInfoState.VALID) throw new Error('invalid trade state')

      // get reduce parameters
      const reducePercent = new BN(reduceAmount).div(position.totalPosition).shiftedBy(18).toFixed(0)
      const { slippedTickMin, slippedTickMax } = getSlippedTicks(pool, allowedSlippedTick)
      const price = !position.isToken0 ? pool.token1Price.toFixed(18) : pool.token0Price.toFixed(18)

      const minOutput = new BN(reduceAmount)
        .times(price)
        .times(new BN(1).minus(new BN(allowedSlippage.toFixed(18)).div(100)))

      //   struct ReduceReturn {
      //     int256 amount0;
      //     int256 amount1;
      //     int256 PnL;
      //     uint256 returnedAmount;
      //     uint256 repaidDebt0;
      //     uint256 repaidDebt1;
      //     uint256 premium;
      //     uint256 profitFee;
      // }

      const reduceParam = {
        positionIsToken0: position.isToken0,
        reducePercentage: reducePercent,
        minOutput: minOutput.shiftedBy(outputCurrency.decimals).toFixed(0),
        trader: position.trader,
        executionOption: 1,
        executionData: ethers.constants.HashZero,
        slippedTickMin,
        slippedTickMax,
        reduceAmount: 0,
      }
      const poolKey = {
        token0: positionKey.poolKey.token0Address,
        token1: positionKey.poolKey.token1Address,
        fee: positionKey.poolKey.fee,
      }
      const response: TransactionResponse = await marginFacility.reducePosition(poolKey, reduceParam)

      return response
    } catch (err) {
      console.log('reduce callback error', err)
      throw new Error('reduce callback error')
    }
  }, [
    account,
    inputCurrency,
    outputCurrency,
    pool,
    position,
    positionKey,
    txnInfo,
    tradeState,
    provider,
    chainId,
    marginFacility,
    reduceAmount,
    allowedSlippage,
    allowedSlippedTick,
  ])

  const handleReducePosition = useCallback(() => {
    if (!callback || !position || !txnInfo || !inputCurrency || !outputCurrency) {
      return
    }
    setAttemptingTxn(true)

    callback()
      .then((response) => {
        setAttemptingTxn(false)
        setTxHash(response?.hash)
        setErrorMessage(undefined)
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
        setAttemptingTxn(false)
        setTxHash(undefined)
        setErrorMessage(error.message)
        setReduceAmount('')
      })
  }, [
    callback,
    position,
    txnInfo,
    inputCurrency,
    outputCurrency,
    reduceAmount,
    addTransaction,
    setAttemptingTxn,
    setTxHash,
    setErrorMessage,
  ])

  const [debouncedReduceAmount, onDebouncedReduceAmount] = useDebouncedChangeHandler(
    reduceAmount ?? '',
    setReduceAmount
  )

  const theme = useTheme()

  const loading = useMemo(() => tradeState === DerivedInfoState.LOADING, [tradeState])

  const handleDismiss = useCallback(() => {
    setShowModal(false)
    setAttemptingTxn(false)
    setTxHash(undefined)
    setErrorMessage(undefined)
  }, [])
  const {
    // trade: { state: tradeState, trade },
    // allowedSlippage,
    currencyBalances,
    // parsedAmount,
    currencies,
    // leverage,
    // inputError: swapInputError,
  } = useDerivedSwapInfo()

  const { onChangeTradeType, onPriceToggle, onPriceInput } = useMarginTradingActionHandlers()

  const { baseCurrencyIsInputToken, startingPrice } = useMarginTradingState()

  const currentPrice = useMemo(() => {
    const inputCurrency = currencies[Field.INPUT]?.wrapped
    const outputCurrency = currencies[Field.OUTPUT]?.wrapped
    if (pool && inputCurrency && outputCurrency) {
      if (!limitToken) {
        return formatBNToString(new BN(pool.token0Price.toFixed(18)))
      } else {
        return formatBNToString(new BN(pool.token1Price.toFixed(18)))
      }
    }
    return undefined
  }, [limitToken, currencies, pool])

  return (
    <DarkCard style={{ paddingTop: '0px' }}>
      {showModal && (
        <ConfirmModifyPositionModal
          onDismiss={handleDismiss}
          isOpen={showModal}
          attemptingTxn={attemptingTxn}
          txHash={txHash}
          header={<Trans>Position Details here</Trans>}
          bottom={
            <BaseFooter
              errorMessage={<Trans>{errorMessage}</Trans>}
              onConfirm={handleReducePosition}
              confirmText="Confirm Reduce Position"
              disabledConfirm={!!inputError || !txnInfo}
            />
          }
          pendingText={<Trans>Reducing Position ...</Trans>}
          currencyToAdd={outputCurrency ?? undefined}
          recipient={account ?? null}
          errorMessage={errorMessage ? <Trans>{errorMessage}</Trans> : undefined}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '100px', alignItems: 'center' }}>
          <FilterWrapper>
            <Filter onClick={() => setIsLimit(!isLimit)}>
              <Selector active={!isLimit}>
                <StyledSelectorText lineHeight="20px" active={!isLimit}>
                  Market
                </StyledSelectorText>
              </Selector>
              <Selector active={isLimit}>
                <StyledSelectorText lineHeight="20px" active={isLimit}>
                  Limit
                </StyledSelectorText>
              </Selector>
            </Filter>
          </FilterWrapper>
          <ThemedText.BodySmall>Current Total Position:</ThemedText.BodySmall>
        </div>

        <LmtSettingsTab
          isOpen={showSettings}
          onToggle={onToggle}
          allowedSlippage={allowedSlippage}
          autoSlippedTick={allowedSlippedTick}
        />
      </div>
      <LimitInputWrapper style={{ width: '95%', marginLeft: '10px' }}>
        <AnimatedDropdown open={isLimit}>
          <DynamicSection justify="start" gap="md" disabled={false}>
            <RowStart>
              {Boolean(inputCurrency && outputCurrency) && (
                <PriceToggleSection>
                  <div
                    style={{ width: 'fit-content', display: 'flex', alignItems: 'center' }}
                    onClick={() => setLimitToken(() => !limitToken)}
                  >
                    <ToggleWrapper width="fit-content">
                      <ToggleElement isActive={!limitToken}>
                        <CurrencyLogo currency={outputCurrency} size="15px" />
                      </ToggleElement>
                      <ToggleElement isActive={limitToken}>
                        <CurrencyLogo currency={inputCurrency} size="15px" />
                      </ToggleElement>
                    </ToggleWrapper>
                  </div>
                </PriceToggleSection>
              )}
            </RowStart>
          </DynamicSection>
          <DynamicSection gap="md" disabled={false}>
            <LimitInputPrice>
              <Trans>
                <ThemedText.BodySecondary>Order Price </ThemedText.BodySecondary>{' '}
              </Trans>
              <div style={{ textAlign: 'end', gap: '5px' }}>
                <ThemedText.BodySmall>Current Price: {currentPrice}</ThemedText.BodySmall>
              </div>
              <LimitInputRow>
                <StyledNumericalInput
                  onUserInput={setLimitPrice}
                  value={limitPrice ?? ''}
                  placeholder="0"
                  className="limit-amount-input"
                ></StyledNumericalInput>
                <RowFixed>
                  {inputCurrency && (
                    <Button sx={{ textTransform: 'none' }} onClick={() => setLimitToken(() => !limitToken)}>
                      <ThemedText.BodySmall>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {!limitToken ? (
                            <>
                              <CurrencyLogo currency={inputCurrency} size="15px" />
                              {inputCurrency?.symbol} /
                              <CurrencyLogo currency={outputCurrency} size="15px" />
                              {outputCurrency?.symbol}
                            </>
                          ) : (
                            <>
                              <CurrencyLogo currency={outputCurrency} size="15px" />
                              {outputCurrency?.symbol} /
                              <CurrencyLogo currency={inputCurrency} size="15px" />
                              {inputCurrency?.symbol}
                            </>
                          )}
                        </div>
                      </ThemedText.BodySmall>
                    </Button>
                  )}
                </RowFixed>
              </LimitInputRow>
            </LimitInputPrice>
            {/* 
                {Boolean(currentPrice && baseCurrency && quoteCurrency) && (
                  <AutoColumn gap="2px" style={{ marginTop: '0.5rem' }}>
                    <Trans>
                      <ThemedText.DeprecatedMain fontWeight={535} fontSize={14} color="text1">
                        Current Price:
                      </ThemedText.DeprecatedMain>
                      <ThemedText.DeprecatedBody fontWeight={535} fontSize={20} color="text1">
                        {currentPrice && <HoverInlineText maxCharacters={20} text={currentPrice} />}
                      </ThemedText.DeprecatedBody>
                      {baseCurrency && (
                        <ThemedText.DeprecatedBody color="text2" fontSize={12}>
                          {quoteCurrency?.symbol} per {baseCurrency.symbol}
                        </ThemedText.DeprecatedBody>
                      )}
                    </Trans>
                  </AutoColumn>
                )} */}
          </DynamicSection>
        </AnimatedDropdown>
      </LimitInputWrapper>
      <AutoColumn style={{ marginTop: '10px', marginBottom: '10px' }}>
        <Trans>
          <ThemedText.BodyPrimary fontWeight={400}>Debt Reduce Amount </ThemedText.BodyPrimary>
        </Trans>
      </AutoColumn>
      <AutoColumn gap="10px" style={{ width: '95%', marginLeft: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <PercentSlider
            initialValue={
              position ? new BN(debouncedReduceAmount).div(position?.totalPosition).times(100).toNumber() : 0
            }
            onSlideChange={(val) =>
              position &&
              onDebouncedReduceAmount(new BN(val.toString()).div(100).times(position?.totalPosition).toString())
            }
            onInputChange={(val) =>
              position &&
              onDebouncedReduceAmount(new BN(val.toString()).div(100).times(position?.totalPosition).toString())
            }
          />
        </div>
        <CurrencyInputPanel
          value={reduceAmount}
          id="reduce-position-input"
          onUserInput={(str: string) => {
            if (position?.totalDebtInput) {
              if (str === '') {
                onDebouncedReduceAmount('')
              } else if (new BN(str).isGreaterThan(new BN(position?.totalPosition))) {
                return
              } else {
                setReduceAmount(str)
              }
            }
          }}
          showMaxButton={true}
          onMax={() => {
            setReduceAmount(position?.totalPosition ? position?.totalPosition.toString(10) : '')
          }}
          hideBalance={true}
          currency={outputCurrency}
        />
        <AutoColumn justify="center" style={{ width: '100%', marginTop: '5px' }}>
          <TransactionDetails>
            <Wrapper>
              <AutoColumn gap="sm" style={{ width: '100%', marginBottom: '-8px' }}>
                <StyledHeaderRow onClick={() => setShowDetails(!showDetails)} disabled={false} open={showDetails}>
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
                    {position ? (
                      loading ? (
                        <ThemedText.BodySmall>
                          <Trans>Fetching details...</Trans>
                        </ThemedText.BodySmall>
                      ) : isLimit ? (
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
                    <RotatingArrow stroke={theme.textTertiary} open={Boolean(showDetails)} />
                  </RowFixed>
                </StyledHeaderRow>
                <AnimatedDropdown open={showDetails}>
                  <AutoColumn gap="sm" style={{ padding: '0', paddingBottom: '8px' }}>
                    {!loading && !isLimit ? (
                      <StyledCard style={{ width: '100%' }}>
                        <AutoColumn gap="sm">
                          <RowBetween>
                            <RowFixed>
                              <MouseoverTooltip text={<Trans>Amount of Collateral Returned</Trans>}>
                                <ThemedText.BodySmall color="textPrimary">
                                  <Trans>Collateral Returned</Trans>
                                </ThemedText.BodySmall>
                              </MouseoverTooltip>
                            </RowFixed>
                            <TextWithLoadingPlaceholder syncing={loading} width={65}>
                              <ThemedText.BodySmall textAlign="right" color="textSecondary">
                                <TruncatedText>
                                  {txnInfo && `${Number(txnInfo?.returnedAmount)}  ${outputCurrency?.symbol}`}
                                </TruncatedText>
                              </ThemedText.BodySmall>
                            </TextWithLoadingPlaceholder>
                          </RowBetween>
                          <RowBetween>
                            <RowFixed>
                              <MouseoverTooltip text={<Trans>Profit and Loss</Trans>}>
                                <ThemedText.BodySmall color="textPrimary">
                                  <Trans>PnL</Trans>
                                </ThemedText.BodySmall>
                              </MouseoverTooltip>
                            </RowFixed>
                            <TextWithLoadingPlaceholder syncing={loading} width={65}>
                              <ThemedText.BodySmall textAlign="right">
                                <TruncatedText>
                                  <DeltaText delta={Number(txnInfo?.PnL)}>
                                    {txnInfo && `${Number(txnInfo?.PnL)}  ${inputCurrency?.symbol}`}
                                  </DeltaText>
                                </TruncatedText>
                              </ThemedText.BodySmall>
                            </TextWithLoadingPlaceholder>
                          </RowBetween>
                          <RowBetween>
                            <RowFixed>
                              <MouseoverTooltip
                                text={<Trans>The amount of premiums to be deducted from your premium deposit</Trans>}
                              >
                                <ThemedText.BodySmall color="textPrimary">
                                  <Trans>Premium Owed</Trans>
                                </ThemedText.BodySmall>
                              </MouseoverTooltip>
                            </RowFixed>
                            <TextWithLoadingPlaceholder syncing={loading} width={65}>
                              <ThemedText.BodySmall textAlign="right" color="textSecondary">
                                <TruncatedText>
                                  {txnInfo && `${Number(txnInfo?.premium)}  ${inputCurrency?.symbol}`}
                                </TruncatedText>
                              </ThemedText.BodySmall>
                            </TextWithLoadingPlaceholder>
                          </RowBetween>
                        </AutoColumn>
                      </StyledCard>
                    ) : (
                      <StyledCard style={{ width: '100%' }}>
                        <AutoColumn gap="sm">
                          <RowBetween>
                            <RowFixed>
                              <MouseoverTooltip text={<Trans>Amount of Collateral Returned</Trans>}>
                                <ThemedText.BodySmall color="textPrimary">
                                  <Trans>Limit Data 1</Trans>
                                </ThemedText.BodySmall>
                              </MouseoverTooltip>
                            </RowFixed>
                            <TextWithLoadingPlaceholder syncing={loading} width={65}>
                              <ThemedText.BodySmall textAlign="right" color="textSecondary">
                                <TruncatedText>
                                  {txnInfo && `${Number(txnInfo?.returnedAmount)}  ${outputCurrency?.symbol}`}
                                </TruncatedText>
                              </ThemedText.BodySmall>
                            </TextWithLoadingPlaceholder>
                          </RowBetween>
                          <RowBetween>
                            <RowFixed>
                              <MouseoverTooltip text={<Trans>Profit and Loss</Trans>}>
                                <ThemedText.BodySmall color="textPrimary">
                                  <Trans>Limit Data 2</Trans>
                                </ThemedText.BodySmall>
                              </MouseoverTooltip>
                            </RowFixed>
                            <TextWithLoadingPlaceholder syncing={loading} width={65}>
                              <ThemedText.BodySmall textAlign="right">
                                <TruncatedText>
                                  <DeltaText delta={Number(txnInfo?.PnL)}>
                                    {txnInfo && `${Number(txnInfo?.PnL)}  ${inputCurrency?.symbol}`}
                                  </DeltaText>
                                </TruncatedText>
                              </ThemedText.BodySmall>
                            </TextWithLoadingPlaceholder>
                          </RowBetween>
                          <RowBetween>
                            <RowFixed>
                              <MouseoverTooltip
                                text={<Trans>The amount of premiums to be deducted from your premium deposit</Trans>}
                              >
                                <ThemedText.BodySmall color="textPrimary">
                                  <Trans>Limit Data 3</Trans>
                                </ThemedText.BodySmall>
                              </MouseoverTooltip>
                            </RowFixed>
                            <TextWithLoadingPlaceholder syncing={loading} width={65}>
                              <ThemedText.BodySmall textAlign="right" color="textSecondary">
                                <TruncatedText>
                                  {txnInfo && `${Number(txnInfo?.premium)}  ${inputCurrency?.symbol}`}
                                </TruncatedText>
                              </ThemedText.BodySmall>
                            </TextWithLoadingPlaceholder>
                          </RowBetween>
                          <RowBetween>
                            <RowFixed>
                              <MouseoverTooltip
                                text={<Trans>The amount of premiums to be deducted from your premium deposit</Trans>}
                              >
                                <ThemedText.BodySmall color="textPrimary">
                                  <Trans>Limit Data 4</Trans>
                                </ThemedText.BodySmall>
                              </MouseoverTooltip>
                            </RowFixed>
                            <TextWithLoadingPlaceholder syncing={loading} width={65}>
                              <ThemedText.BodySmall textAlign="right" color="textSecondary">
                                <TruncatedText>
                                  {txnInfo && `${Number(txnInfo?.premium)}  ${inputCurrency?.symbol}`}
                                </TruncatedText>
                              </ThemedText.BodySmall>
                            </TextWithLoadingPlaceholder>
                          </RowBetween>
                        </AutoColumn>
                      </StyledCard>
                    )}
                  </AutoColumn>
                </AnimatedDropdown>
              </AutoColumn>
            </Wrapper>
          </TransactionDetails>
        </AutoColumn>
      </AutoColumn>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <ButtonError
          style={{
            fontSize: '12px',
            borderRadius: '10px',
            width: 'fit-content',
            height: '15px',
          }}
          padding=".25rem"
          onClick={() => handleReducePosition()}
          id="leverage-button"
          disabled={!!inputError || !txnInfo}
        >
          <ThemedText.BodySmall fontWeight={600}>
            {inputError ? (
              inputError
            ) : tradeState === DerivedInfoState.INVALID ? (
              <Trans>Invalid Trade</Trans>
            ) : isLimit ? (
              <Trans>Place Order</Trans>
            ) : (
              <Trans>Execute</Trans>
            )}
          </ThemedText.BodySmall>
        </ButtonError>
      </div>
    </DarkCard>
  )
}

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
