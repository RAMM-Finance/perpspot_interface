import { Trans } from '@lingui/macro'
import { sendAnalyticsEvent } from '@uniswap/analytics'
import { SwapEventName, SwapPriceUpdateUserResponse } from '@uniswap/analytics-events'
import { formatCurrencyAmount, NumberType } from '@uniswap/conedison/format'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { useUSDPrice } from 'hooks/useUSDPrice'
import { getPriceUpdateBasisPoints } from 'lib/utils/analytics'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowDown } from 'react-feather'
import { Text } from 'rebass'
import { AddMarginTrade, PreTradeInfo } from 'state/marginTrading/hooks'
import { InterfaceTrade } from 'state/routing/types'
import { BorrowCreationDetails } from 'state/swap/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { MarginPositionDetails } from 'types/lmtv2position'

import { ThemedText } from '../../theme'
import { isAddress, shortenAddress } from '../../utils'
import { computeFiatValuePriceImpact } from '../../utils/computeFiatValuePriceImpact'
import { FiatValue } from '../BaseSwapPanel/FiatValue'
import { ButtonPrimary } from '../Button'
import { LightCard } from '../Card'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../Logo/CurrencyLogo'
import { RowBetween, RowFixed } from '../Row'
import TradePrice from '../swap/TradePrice'
import { AdvancedBorrowSwapDetails, AdvancedMarginTradeDetails, AdvancedSwapDetails } from './AdvancedSwapDetails'
import { SwapShowAcceptChanges, TruncatedText } from './styleds'

const ArrowWrapper = styled.div`
  padding: 4px;
  border-radius: 12px;
  height: 40px;
  width: 40px;
  position: relative;
  margin-top: -18px;
  margin-bottom: -18px;
  left: calc(50% - 16px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: 4px solid;
  border-color: ${({ theme }) => theme.backgroundModule};
  z-index: 2;
`

const formatAnalyticsEventProperties = (
  trade: InterfaceTrade<Currency, Currency, TradeType>,
  priceUpdate: number | undefined,
  response: SwapPriceUpdateUserResponse
) => ({
  chain_id:
    trade.inputAmount.currency.chainId === trade.outputAmount.currency.chainId
      ? trade.inputAmount.currency.chainId
      : undefined,
  response,
  token_in_symbol: trade.inputAmount.currency.symbol,
  token_out_symbol: trade.outputAmount.currency.symbol,
  price_update_basis_points: priceUpdate,
})

export default function SwapModalHeader({
  trade,
  shouldLogModalCloseEvent,
  setShouldLogModalCloseEvent,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
}: {
  trade: InterfaceTrade<Currency, Currency, TradeType>
  shouldLogModalCloseEvent: boolean
  setShouldLogModalCloseEvent: (shouldLog: boolean) => void
  allowedSlippage: Percent
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const theme = useTheme()

  const [lastExecutionPrice, setLastExecutionPrice] = useState(trade.executionPrice)
  const [priceUpdate, setPriceUpdate] = useState<number | undefined>()

  const fiatValueInput = useUSDPrice(trade.inputAmount)
  const fiatValueOutput = useUSDPrice(trade.outputAmount)

  useEffect(() => {
    if (!trade.executionPrice.equalTo(lastExecutionPrice)) {
      setPriceUpdate(getPriceUpdateBasisPoints(lastExecutionPrice, trade.executionPrice))
      setLastExecutionPrice(trade.executionPrice)
    }
  }, [lastExecutionPrice, setLastExecutionPrice, trade.executionPrice])

  useEffect(() => {
    if (shouldLogModalCloseEvent && showAcceptChanges)
      sendAnalyticsEvent(
        SwapEventName.SWAP_PRICE_UPDATE_ACKNOWLEDGED,
        formatAnalyticsEventProperties(trade, priceUpdate, SwapPriceUpdateUserResponse.REJECTED)
      )
    setShouldLogModalCloseEvent(false)
  }, [shouldLogModalCloseEvent, showAcceptChanges, setShouldLogModalCloseEvent, trade, priceUpdate])

  return (
    <AutoColumn gap="4px" style={{ marginTop: '1rem' }}>
      <LightCard padding="0.75rem 1rem">
        <AutoColumn gap="sm">
          <RowBetween align="center">
            <RowFixed gap="0px">
              <TruncatedText
                fontSize={24}
                fontWeight={500}
                color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? theme.accentAction : ''}
              >
                {trade.inputAmount.toSignificant(6)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <CurrencyLogo currency={trade.inputAmount.currency} size="20px" style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {trade.inputAmount.currency.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <FiatValue fiatValue={fiatValueInput} />
          </RowBetween>
        </AutoColumn>
      </LightCard>
      <ArrowWrapper>
        <ArrowDown size="16" color={theme.textPrimary} />
      </ArrowWrapper>
      <LightCard padding="0.75rem 1rem" style={{ marginBottom: '0.25rem' }}>
        <AutoColumn gap="sm">
          <RowBetween align="flex-end">
            <RowFixed gap="0px">
              <TruncatedText fontSize={24} fontWeight={500}>
                {trade.outputAmount.toSignificant(6)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <CurrencyLogo currency={trade.outputAmount.currency} size="20px" style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {trade.outputAmount.currency.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <ThemedText.DeprecatedBody fontSize={14} color={theme.textTertiary}>
              <FiatValue
                fiatValue={fiatValueOutput}
                priceImpact={computeFiatValuePriceImpact(fiatValueInput.data, fiatValueOutput.data)}
              />
            </ThemedText.DeprecatedBody>
          </RowBetween>
        </AutoColumn>
      </LightCard>
      <RowBetween style={{ marginTop: '0.25rem', padding: '0 1rem' }}>
        <TradePrice price={trade.executionPrice} />
      </RowBetween>
      <LightCard style={{ padding: '.75rem', marginTop: '0.5rem' }}>
        <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} />
      </LightCard>
      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap="0px">
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
              <ThemedText.DeprecatedMain color={theme.textSecondary}>
                <Trans>Price Updated</Trans>
              </ThemedText.DeprecatedMain>
            </RowFixed>
            <ButtonPrimary
              style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '12px' }}
              onClick={onAcceptChanges}
            >
              <Trans>Accept</Trans>
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}

      <AutoColumn justify="flex-start" gap="sm" style={{ padding: '.75rem 1rem' }}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
            <Trans>
              Output is estimated. You will receive at least{' '}
              <b>
                {trade.minimumAmountOut(allowedSlippage).toSignificant(6)} {trade.outputAmount.currency.symbol}
              </b>{' '}
              or the transaction will revert.
            </Trans>
          </ThemedText.DeprecatedItalic>
        ) : (
          <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
            <Trans>
              Input is estimated. You will sell at most{' '}
              <b>
                {trade.maximumAmountIn(allowedSlippage).toSignificant(6)} {trade.inputAmount.currency.symbol}
              </b>{' '}
              or the transaction will revert.
            </Trans>
          </ThemedText.DeprecatedItalic>
        )}
      </AutoColumn>
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <ThemedText.DeprecatedMain>
            <Trans>
              Output will be sent to{' '}
              <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
            </Trans>
          </ThemedText.DeprecatedMain>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  )
}

export function LeverageCloseModalHeader({
  trade,
  shouldLogModalCloseEvent,
  setShouldLogModalCloseEvent,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
}: {
  trade: InterfaceTrade<Currency, Currency, TradeType>
  shouldLogModalCloseEvent: boolean
  setShouldLogModalCloseEvent: (shouldLog: boolean) => void
  allowedSlippage: Percent
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const theme = useTheme()

  const [lastExecutionPrice, setLastExecutionPrice] = useState(trade.executionPrice)
  const [priceUpdate, setPriceUpdate] = useState<number | undefined>()

  const fiatValueInput = useUSDPrice(trade.inputAmount)
  const fiatValueOutput = useUSDPrice(trade.outputAmount)

  useEffect(() => {
    if (!trade.executionPrice.equalTo(lastExecutionPrice)) {
      setPriceUpdate(getPriceUpdateBasisPoints(lastExecutionPrice, trade.executionPrice))
      setLastExecutionPrice(trade.executionPrice)
    }
  }, [lastExecutionPrice, setLastExecutionPrice, trade.executionPrice])

  useEffect(() => {
    if (shouldLogModalCloseEvent && showAcceptChanges)
      sendAnalyticsEvent(
        SwapEventName.SWAP_PRICE_UPDATE_ACKNOWLEDGED,
        formatAnalyticsEventProperties(trade, priceUpdate, SwapPriceUpdateUserResponse.REJECTED)
      )
    setShouldLogModalCloseEvent(false)
  }, [shouldLogModalCloseEvent, showAcceptChanges, setShouldLogModalCloseEvent, trade, priceUpdate])

  return (
    <AutoColumn gap="4px" style={{ marginTop: '1rem' }}>
      <LightCard padding="0.75rem 1rem">
        <AutoColumn gap="sm">
          <RowBetween align="center">
            <RowFixed gap="0px">
              <TruncatedText
                fontSize={24}
                fontWeight={500}
                color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? theme.accentAction : ''}
              >
                {trade.inputAmount.toSignificant(6)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <CurrencyLogo currency={trade.inputAmount.currency} size="20px" style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {trade.inputAmount.currency.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <FiatValue fiatValue={fiatValueInput} />
          </RowBetween>
        </AutoColumn>
      </LightCard>
      <ArrowWrapper>
        <ArrowDown size="16" color={theme.textPrimary} />
      </ArrowWrapper>
      <LightCard padding="0.75rem 1rem" style={{ marginBottom: '0.25rem' }}>
        <AutoColumn gap="sm">
          <RowBetween align="flex-end">
            <RowFixed gap="0px">
              <TruncatedText fontSize={24} fontWeight={500}>
                {trade.outputAmount.toSignificant(6)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <CurrencyLogo currency={trade.outputAmount.currency} size="20px" style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {trade.outputAmount.currency.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <ThemedText.DeprecatedBody fontSize={14} color={theme.textTertiary}>
              <FiatValue
                fiatValue={fiatValueOutput}
                priceImpact={computeFiatValuePriceImpact(fiatValueInput.data, fiatValueOutput.data)}
              />
            </ThemedText.DeprecatedBody>
          </RowBetween>
        </AutoColumn>
      </LightCard>
      <RowBetween style={{ marginTop: '0.25rem', padding: '0 1rem' }}>
        <TradePrice price={trade.executionPrice} />
      </RowBetween>
      <LightCard style={{ padding: '.75rem', marginTop: '0.5rem' }}>
        <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} />
      </LightCard>
      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap="0px">
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
              <ThemedText.DeprecatedMain color={theme.textSecondary}>
                <Trans>Price Updated</Trans>
              </ThemedText.DeprecatedMain>
            </RowFixed>
            <ButtonPrimary
              style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '12px' }}
              onClick={onAcceptChanges}
            >
              <Trans>Accept</Trans>
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}

      <AutoColumn justify="flex-start" gap="sm" style={{ padding: '.75rem 1rem' }}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
            <Trans>
              Output is estimated. You will receive at least{' '}
              <b>
                {trade.minimumAmountOut(allowedSlippage).toSignificant(6)} {trade.outputAmount.currency.symbol}
              </b>{' '}
              or the transaction will revert.
            </Trans>
          </ThemedText.DeprecatedItalic>
        ) : (
          <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
            <Trans>
              Input is estimated. You will sell at most{' '}
              <b>
                {trade.maximumAmountIn(allowedSlippage).toSignificant(6)} {trade.inputAmount.currency.symbol}
              </b>{' '}
              or the transaction will revert.
            </Trans>
          </ThemedText.DeprecatedItalic>
        )}
      </AutoColumn>
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <ThemedText.DeprecatedMain>
            <Trans>
              Output will be sent to{' '}
              <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
            </Trans>
          </ThemedText.DeprecatedMain>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  )
}

export function LeverageModalHeader({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
  preTradeInfo,
  existingPosition,
}: {
  trade: AddMarginTrade // InterfaceTrade<Currency, Currency, TradeType>
  preTradeInfo: PreTradeInfo
  existingPosition: MarginPositionDetails
  allowedSlippage: Percent
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const theme = useTheme()

  const [lastExecutionPrice, setLastExecutionPrice] = useState(trade.executionPrice)
  // const [priceUpdate, setPriceUpdate] = useState<number | undefined>()

  const fiatValueInput = useUSDPrice(
    trade?.margin && preTradeInfo?.premiumNecessary ? trade?.margin?.add(preTradeInfo?.premiumNecessary) : undefined
  )
  const fiatValueTotalInput = useUSDPrice(
    trade?.margin && trade?.borrowAmount ? trade?.margin?.add(trade?.borrowAmount) : undefined
  )
  const fiatValueTotalOutput = useUSDPrice(trade?.swapOutput)

  return (
    <AutoColumn gap="4px" style={{ marginTop: '1rem' }}>
      <LightCard padding="0.75rem 1rem">
        <AutoColumn gap="sm">
          <RowBetween align="center">
            <RowFixed gap="0px">
              <TruncatedText fontSize={24} fontWeight={500} color={theme.textSecondary}>
                {formatCurrencyAmount(trade.margin, NumberType.SwapTradeAmount)} (+{' '}
                {formatCurrencyAmount(preTradeInfo.premiumNecessary, NumberType.SwapTradeAmount)})
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <Text fontSize={12} fontWeight={300} marginRight="2px">
                Payment
              </Text>
              <CurrencyLogo currency={trade?.margin?.currency} size="20px" style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {trade?.margin?.currency.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <FiatValue fiatValue={fiatValueInput} />
          </RowBetween>
        </AutoColumn>
      </LightCard>
      <ArrowWrapper>
        <ArrowDown size="16" color={theme.textPrimary} />
      </ArrowWrapper>
      <LightCard padding="0.75rem 1rem" style={{ marginBottom: '0.25rem' }}>
        <AutoColumn gap="sm">
          <RowBetween align="flex-end">
            <RowFixed gap="0px">
              <TruncatedText fontSize={24} fontWeight={500} color={theme.textSecondary}>
                {formatCurrencyAmount(
                  trade?.borrowAmount && trade?.margin ? trade.borrowAmount.add(trade.margin) : null,
                  NumberType.SwapTradeAmount
                )}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <Text fontSize={12} fontWeight={300} marginRight="2px">
                Total Input
              </Text>
              <CurrencyLogo currency={trade.margin?.currency} size="20px" style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {trade.margin?.currency.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <ThemedText.DeprecatedBody fontSize={14} color={theme.textTertiary}>
              <FiatValue
                fiatValue={fiatValueTotalInput}
                priceImpact={computeFiatValuePriceImpact(fiatValueInput.data, fiatValueTotalInput.data)}
              />
            </ThemedText.DeprecatedBody>
          </RowBetween>
        </AutoColumn>
        <AutoColumn gap="sm">
          <RowBetween align="flex-end">
            <RowFixed gap="0px">
              <TruncatedText fontSize={24} fontWeight={500} color={theme.textSecondary}>
                {formatCurrencyAmount(trade.swapOutput, NumberType.SwapTradeAmount)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <Text fontSize={12} fontWeight={300} marginRight="2px">
                Total Output
              </Text>
              <CurrencyLogo currency={trade.swapOutput?.currency} size="20px" style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {trade.swapOutput?.currency.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <ThemedText.DeprecatedBody fontSize={14} color={theme.textTertiary}>
              <FiatValue
                fiatValue={fiatValueTotalOutput}
                priceImpact={computeFiatValuePriceImpact(fiatValueInput.data, fiatValueTotalOutput.data)}
              />
            </ThemedText.DeprecatedBody>
          </RowBetween>
        </AutoColumn>
      </LightCard>
      <RowBetween style={{ marginTop: '0.25rem', padding: '0 1rem' }}>
        <TradePrice price={trade?.executionPrice} />
      </RowBetween>
      <LightCard style={{ padding: '.75rem', marginTop: '0.5rem' }}>
        <AdvancedMarginTradeDetails
          trade={trade}
          allowedSlippage={allowedSlippage}
          existingPosition={existingPosition}
          preTradeInfo={preTradeInfo}
        />
      </LightCard>
      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap="0px">
          <RowBetween>
            <RowFixed>
              <AlertTriangle color={theme.textSecondary} size={20} style={{ marginRight: '8px', minWidth: 24 }} />
              <Text color={theme.textSecondary}>
                <Trans>Price Updated</Trans>
              </Text>
            </RowFixed>
            <ButtonPrimary
              style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '12px' }}
              onClick={onAcceptChanges}
            >
              <Trans>Accept</Trans>
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}

      <AutoColumn justify="flex-start" gap="sm" style={{ padding: '.75rem 1rem' }}>
        <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
          <Trans>
            Output is estimated. You will receive at least{' '}
            <b>
              {formatCurrencyAmount(trade.swapOutput, NumberType.SwapTradeAmount)} {trade.swapOutput.currency.symbol}
            </b>{' '}
            or the transaction will revert.
          </Trans>
        </ThemedText.DeprecatedItalic>
      </AutoColumn>
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <ThemedText.DeprecatedMain>
            <Trans>
              Output will be sent to{' '}
              <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
            </Trans>
          </ThemedText.DeprecatedMain>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  )
}

export function BorrowModalHeader({
  trade,
  inputCurrency,
  outputCurrency,
  recipient,
}: {
  trade?: BorrowCreationDetails
  inputCurrency?: Currency
  outputCurrency?: Currency
  recipient: string | null
}) {
  const theme = useTheme()
  return (
    <AutoColumn gap="4px" style={{ marginTop: '1rem' }}>
      <LightCard padding="0.75rem 1rem">
        <AutoColumn gap="sm">
          <RowBetween align="center">
            <RowFixed gap="0px">
              <TruncatedText fontSize={24} fontWeight={500}>
                {formatBNToString(trade?.collateralAmount)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <Text fontSize={12} fontWeight={300} marginRight="2px">
                Total Collateral
              </Text>
              <CurrencyLogo currency={inputCurrency} size="20px" style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {inputCurrency?.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
        </AutoColumn>
        <AutoColumn gap="sm">
          <RowBetween align="flex-end">
            <RowFixed gap="0px">
              <TruncatedText fontSize={24} fontWeight={500}>
                {trade?.borrowedAmount && trade?.quotedPremium ? `${formatBNToString(trade.quotedPremium)}` : '-'}
              </TruncatedText>
            </RowFixed>
            <AutoColumn gap="sm">
              <RowBetween align="flex-end">
                <RowFixed gap="0px">
                  <Text fontSize={12} fontWeight={300} marginRight="2px">
                    Premium
                  </Text>
                  <CurrencyLogo currency={outputCurrency} size="20px" style={{ marginRight: '12px' }} />
                  <Text fontSize={20} fontWeight={500}>
                    {outputCurrency?.symbol}
                  </Text>
                </RowFixed>
              </RowBetween>
            </AutoColumn>
          </RowBetween>
        </AutoColumn>
      </LightCard>
      <ArrowWrapper>
        <ArrowDown size="16" color={theme.textPrimary} />
      </ArrowWrapper>
      <LightCard padding="0.75rem 1rem" style={{ marginBottom: '0.25rem' }}>
        <AutoColumn gap="sm">
          <RowBetween align="flex-end">
            <RowFixed gap="0px">
              <TruncatedText fontSize={24} fontWeight={500}>
                {trade?.borrowedAmount && trade?.quotedPremium ? `${formatBNToString(trade.borrowedAmount)}` : '-'}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <Text fontSize={12} fontWeight={300} marginRight="2px">
                Total Borrowed
              </Text>
              <CurrencyLogo currency={outputCurrency} size="20px" style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {outputCurrency?.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
        </AutoColumn>
      </LightCard>
      <LightCard style={{ padding: '.75rem', marginTop: '0.5rem' }}>
        <AdvancedBorrowSwapDetails borrowTrade={trade} syncing={false} />
      </LightCard>
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <ThemedText.DeprecatedMain>
            <Trans>
              Output will be sent to{' '}
              <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
            </Trans>
          </ThemedText.DeprecatedMain>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  )
}
