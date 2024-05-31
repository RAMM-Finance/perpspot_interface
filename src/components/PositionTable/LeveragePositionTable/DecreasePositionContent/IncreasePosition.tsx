import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
<<<<<<< HEAD
import { Currency, Percent, Price } from '@uniswap/sdk-core'
=======
import { Currency, Percent } from '@uniswap/sdk-core'
>>>>>>> 8eeaeaf2b (updates)
import { useWeb3React } from '@web3-react/core'
import BigNumber, { BigNumber as BN } from 'bignumber.js'
import SwapCurrencyInputPanelV2 from 'components/BaseSwapPanel/CurrencyInputPanel'
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { DarkCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { TextWithLoadingPlaceholder } from 'components/modalFooters/common'
import { RowBetween } from 'components/Row'
import DiscreteSliderMarks from 'components/Slider/MUISlider'
import { AddMarginPositionConfirmModal } from 'components/swap/ConfirmSwapModal'
import { LeverageDetailsDropdown } from 'components/swap/SwapDetailsDropdown'
import { MouseoverTooltip } from 'components/Tooltip'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { addDoc, collection } from 'firebase/firestore'
import { firestore } from 'firebaseConfig'
import { useAddPositionCallback } from 'hooks/useAddPositionCallBack'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { PoolState, usePool } from 'hooks/usePools'
import { useUSDPriceBNV2 } from 'hooks/useUSDPrice'
import useCurrencyBalance from 'lib/hooks/useCurrencyBalance'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { DetailsSwapSection, LeverageGaugeSection, LeverageInputSection } from 'pages/Trade'
import { StyledLeverageInput } from 'pages/Trade/tradeModal'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AddMarginTrade, useDerivedAddPositionInfo } from 'state/marginTrading/hooks'
import { LeverageTradeState } from 'state/routing/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { MarginPositionDetails, TraderPositionKey } from 'types/lmtv2position'

import { AlteredPositionProperties } from '../LeveragePositionModal'
<<<<<<< HEAD
import { getPoolId, positionEntryPrice } from '../TokenRow'
=======
import { getPoolId } from '../TokenRow'
>>>>>>> 8eeaeaf2b (updates)

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
<<<<<<< HEAD
const OutputSection = styled.div`
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
=======
>>>>>>> 8eeaeaf2b (updates)

const IncreasePosition = ({
  marginInPosToken,
  positionKey,
  onPositionChange,
  positionData,
  inputCurrency,
  outputCurrency,
  onClose,
}: {
  marginInPosToken: boolean
  positionKey: TraderPositionKey
  onPositionChange: (newPosition: AlteredPositionProperties) => void
  positionData: {
    position: MarginPositionDetails | undefined
    loading: boolean
  }
  inputCurrency?: Currency
  outputCurrency?: Currency
  onClose: () => void
}) => {
  const { account } = useWeb3React()
  const [increaseAmount, setIncreaseAmount] = useState<string>('')
  const [leverageFactor, setLeverageFactor] = useState<string>('')
  const [fiatValueForVolume, setFiatValueForVolume] = useState<number | undefined>(undefined)
  const [poolIdForVolume, setPoolIdForVolume] = useState<string>('')
  const [poolState, pool] = usePool(
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
    positionKey.poolKey?.fee ?? undefined
  )
  const poolNotFound = poolState !== PoolState.EXISTS

  const marginCurrency = useMemo(() => {
    if (!inputCurrency || !outputCurrency) return undefined
    return marginInPosToken ? outputCurrency : inputCurrency
  }, [marginInPosToken, inputCurrency, outputCurrency])

  const swapIsUnsupported = useIsSwapUnsupported(inputCurrency, outputCurrency)
  const toggleWalletDrawer = useToggleWalletDrawer()

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

  const marginBalance = useCurrencyBalance(account, marginCurrency ?? undefined)

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
    parsedMargin,
  } = useDerivedAddPositionInfo(
    increaseAmount ?? undefined,
    leverageFactor ?? undefined,
    pool ?? undefined,
    inputCurrency?.wrapped.address,
    outputCurrency?.wrapped.address
  )

  const [invalidTrade, tradeIsLoading, tradeNotFound] = useMemo(
    () => [
      tradeState === LeverageTradeState.INVALID,
      LeverageTradeState.LOADING === tradeState || LeverageTradeState.SYNCING === tradeState,
      tradeState === LeverageTradeState.NO_ROUTE_FOUND,
    ],
    [tradeState]
  )

  const noTradeInputError = useMemo(() => {
    return !inputError
  }, [inputError])

  function fixedToEightDecimals(amount: string): BigNumber | undefined {
    if (!amount || isNaN(Number(increaseAmount))) return undefined
    return new BigNumber(amount)
  }

  const marginFiatAmount = useUSDPriceBNV2(fixedToEightDecimals(increaseAmount), marginCurrency ?? undefined)
<<<<<<< HEAD
  const outputFiatAmount = useUSDPriceBNV2(trade?.expectedAddedOutput, outputCurrency ?? undefined)
=======
>>>>>>> 8eeaeaf2b (updates)

  const [debouncedLeverageFactor, onDebouncedLeverageFactor] = useDebouncedChangeHandler(
    leverageFactor ?? '',
    setLeverageFactor
  )

<<<<<<< HEAD
  const [entryPrice, , ,] = useMemo(() => {
    if (pool && existingPosition) {
      const _entryPrice = positionEntryPrice(existingPosition)
      const _currentPrice = existingPosition.isToken0
        ? new BN(pool.token0Price.toFixed(18))
        : new BN(pool.token1Price.toFixed(18))

      return [
        _entryPrice,
        _currentPrice,
        existingPosition.isToken0 ? pool.token1 : pool.token0,
        existingPosition.isToken0 ? pool.token0 : pool.token1,
      ]
    } else {
      return [undefined, undefined, undefined]
    }
  }, [pool, existingPosition])

  function lmtFormatPrice(price: Price<Currency, Currency> | undefined, entryPrice: BN | undefined): BN | undefined {
    if (price && entryPrice) {
      if (entryPrice.isGreaterThan(1)) {
        if (price.greaterThan(1)) {
          return new BN(1).div(price.toFixed(18))
        } else {
          return new BN(price.toFixed(18))
        }
      } else {
        return new BN(1).div(price.toFixed(18))
      }
    } else {
      return undefined
    }
  }

  const newExecutionPrice: BN | undefined = useMemo(() => {
    if (!trade) return undefined
    return lmtFormatPrice(trade.executionPrice, entryPrice)
  }, [trade, entryPrice])

  const newTotalPositionPrice = useMemo(() => {
    if (!trade || !newExecutionPrice || !entryPrice || !existingPosition) return undefined
    return existingPosition.totalPosition
      .times(entryPrice)
      .plus(trade.expectedAddedOutput.times(newExecutionPrice))
      .div(existingPosition.totalPosition.plus(trade.expectedAddedOutput))
  }, [trade, existingPosition, newExecutionPrice, entryPrice])

=======
>>>>>>> 8eeaeaf2b (updates)
  useEffect(() => {
    if (!trade || !existingPosition) {
      onPositionChange({})
      return
    }
    if (trade && marginFiatAmount && marginFiatAmount.data && leverageFactor && !isNaN(parseFloat(leverageFactor))) {
      setPoolIdForVolume(getPoolId(trade.pool.token0.address, trade.pool.token1.address, trade.pool.fee))
      setFiatValueForVolume(marginFiatAmount.data * parseFloat(leverageFactor))

      // window.alert(`MARGIN AND LEV: ${fiatValueTradeMargin.data}, LEVERAGE FACTOR: ${leverageFactor}, OUTPUT: ${fiatValueTradeMargin.data * parseFloat(leverageFactor)}`);
    }
  }, [trade, marginFiatAmount, leverageFactor, onPositionChange, existingPosition])

  useEffect(() => {
<<<<<<< HEAD
    if (!leverageFactor || !existingPosition || !trade || !tradeApprovalInfo || !newTotalPositionPrice) return
=======
    if (!leverageFactor || !existingPosition || !trade || !tradeApprovalInfo) return
>>>>>>> 8eeaeaf2b (updates)
    onPositionChange({
      totalPosition: existingPosition.totalPosition.plus(trade.expectedAddedOutput),
      margin: existingPosition.margin.plus(trade.margin),
      totalDebtInput: existingPosition.totalDebtInput.plus(new BN(tradeApprovalInfo?.additionalPremium.toExact())),
<<<<<<< HEAD
      executionPrice: newTotalPositionPrice,
    })
  }, [leverageFactor, onPositionChange, existingPosition, trade, tradeApprovalInfo, newTotalPositionPrice])
=======
    })
  }, [leverageFactor, onPositionChange, existingPosition, trade, tradeApprovalInfo])
>>>>>>> 8eeaeaf2b (updates)

  const { callback: addPositionCallback } = useAddPositionCallback(
    trade,
    inputCurrency || undefined,
    outputCurrency || undefined,
    allowedSlippage
  )

  const handleAddPosition = useCallback(() => {
    if (!addPositionCallback) {
      return
    }
    setTradeState((currentState) => ({ ...currentState, attemptingTxn: true }))

    addPositionCallback()
      .then(async (hash) => {
        setTradeState((currentState) => ({ ...currentState, txHash: hash, attemptingTxn: false }))

        const timestamp = Math.floor(Date.now() / 1000)
        const type = 'ADD'
        try {
          if (
            trade &&
            marginFiatAmount &&
            marginFiatAmount.data &&
            leverageFactor &&
            !isNaN(parseFloat(leverageFactor))
          ) {
            // let tokenAmount = trade.marginInInput.toNumber()

            const poolId = getPoolId(trade.pool.token0.address, trade.pool.token1.address, trade.pool.fee)
            // const priceUSD = result.lastPriceUSD

            const volume = marginFiatAmount.data * parseFloat(leverageFactor)
            // const volume = (parseFloat(priceUSD) * tokenAmount).toFixed(10)

            await addDoc(collection(firestore, 'volumes'), {
              poolId,
              // priceUSD: priceUSD,
              timestamp,
              type,
              volume,
              account,
            })
          } else {
            await addDoc(collection(firestore, 'volumes'), {
              poolId: poolIdForVolume,
              // priceUSD: priceUSD,
              timestamp,
              type,
              volume: fiatValueForVolume,
              account,
            })
          }
        } catch (error) {
          console.error('An error occurred:', error)
        }
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

  const handleCancel = useCallback(() => {
    setTradeState((currentState) => ({
      ...currentState,
      showConfirm: false,
      tradeErrorMessage: undefined,
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

    if (txHash) {
      setIncreaseAmount('')
    }
  }, [txHash, setIncreaseAmount])

  return (
    <DarkCard
      width="390px"
      margin="0"
      padding="0"
      style={{ paddingRight: '0.75rem', paddingLeft: '0.75rem', overflowY: 'scroll' }}
    >
      {showConfirm && (
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
      )}
      <InputSection>
        <SwapCurrencyInputPanelV2
          value={increaseAmount}
          fiatValue={marginFiatAmount}
          onUserInput={(str: string) => {
            if (marginBalance) {
              const balance = marginBalance.toExact()
              if (str === '') {
                setIncreaseAmount('')
              } else if (Number(str) > Number(balance)) {
                return
              } else {
                setIncreaseAmount(str)
              }
            }
          }}
          showFiat={true}
          showMaxButton={true}
          onMax={() => {
            marginBalance && setIncreaseAmount(marginBalance.toExact())
          }}
          currency={marginCurrency}
<<<<<<< HEAD
          label="Margin"
          id="increase-position-input"
        />
      </InputSection>
      <OutputSection>
        <SwapCurrencyInputPanelV2
          value={
            tradeState !== LeverageTradeState.VALID || !trade
              ? '-'
              : formatBNToString(trade.expectedAddedOutput, NumberType.SwapTradeAmount)
          }
          fiatValue={outputFiatAmount}
          onUserInput={() => 0}
          showFiat={true}
          showMaxButton={false}
          hideBalance={false}
          currency={outputCurrency}
          disabled={true}
          label="Added Position"
          id="increase-position-input"
        />
      </OutputSection>

=======
          label="Increase Total Position By"
          id="increase-position-input"
        />
      </InputSection>
>>>>>>> 8eeaeaf2b (updates)
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
                      if (Number(str) > 1000) {
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
        <LeverageDetailsDropdown
          trade={trade}
          tradeApprovalInfo={tradeApprovalInfo}
          existingPosition={existingPosition}
          loading={false}
          allowedSlippage={trade?.allowedSlippage ?? new Percent(0)}
        />
      </DetailsSwapSection>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
        {swapIsUnsupported ? (
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
          <ButtonLight
            style={{ fontSize: '14px', borderRadius: '10px' }}
            width="100%"
            padding=".5rem"
            onClick={() => {}}
            disabled={true}
            fontWeight={600}
          >
            <Trans>Insufficient liquidity for this trade.</Trans>
          </ButtonLight>
        ) : tradeNotFound && userHasSpecifiedInputOutput && !tradeIsLoading ? (
          <ButtonLight
            style={{ fontSize: '14px', borderRadius: '10px' }}
            width="100%"
            padding=".5rem"
            onClick={() => {}}
            disabled={true}
            fontWeight={600}
          >
            <Trans>Insufficient liquidity for this trade.</Trans>
          </ButtonLight>
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
        )}
      </div>
    </DarkCard>
  )
}

export default IncreasePosition
