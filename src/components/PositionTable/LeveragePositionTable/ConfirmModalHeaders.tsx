import { Trans } from '@lingui/macro'
import { SwapPriceUpdateUserResponse } from '@uniswap/analytics-events'
import { NumberType } from '@uniswap/conedison/format'
import { Currency, Percent, Price, TradeType } from '@uniswap/sdk-core'
import { FiatValue } from 'components/BaseSwapPanel/FiatValue'
import { ButtonPrimary } from 'components/Button'
import Card from 'components/Card'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { RowBetween, RowFixed } from 'components/Row'
import { SwapShowAcceptChanges, TruncatedText } from 'components/swap/styleds'
import TradePrice from 'components/swap/TradePrice'
import { useUSDPrice } from 'hooks/useUSDPrice'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useMemo } from 'react'
import { AlertTriangle } from 'react-feather'
import { Text } from 'rebass'
import { BnToCurrencyAmount } from 'state/marginTrading/hooks'
import { InterfaceTrade } from 'state/routing/types'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { MarginLimitOrder, MarginPositionDetails } from 'types/lmtv2position'

import { DerivedLimitReducePositionInfo, DerivedReducePositionInfo } from './DecreasePositionContent'
import DecreasePositionLimitDetails from './DecreasePositionContent/DecreaseLimitPositionDetails'
import { DecreasePositionDetails } from './DecreasePositionContent/DecreasePositionDetails'
const LightCard = styled(Card)`
  background-color: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
`

const ArrowWrapper = styled.div`
  padding: 2px;
  border-radius: 12px;
  height: 30px;
  width: 30px;
  position: relative;
  margin-top: -18px;
  margin-bottom: -18px;
  left: calc(50% - 16px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: 1px solid;
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

export function ConfirmCancelOrderHeader({
  order,
  inputCurrency,
  outputCurrency,
}: {
  order: MarginLimitOrder
  inputCurrency: Currency | undefined
  outputCurrency: Currency | undefined
}) {
  const theme = useTheme()

  const trade = useMemo(() => {
    if (inputCurrency && outputCurrency) {
      if (order.isAdd) {
        return {
          borrowAmount: BnToCurrencyAmount(order.inputAmount.minus(order.margin), inputCurrency),
          currentOutput: BnToCurrencyAmount(order.currentOutput, outputCurrency),
          margin: BnToCurrencyAmount(order.margin, inputCurrency),
        }
      } else {
        return {
          inputAmount: BnToCurrencyAmount(order.inputAmount, outputCurrency),
          currentOutput: BnToCurrencyAmount(order.currentOutput, inputCurrency),
        }
      }
    } else {
      return undefined
    }
  }, [order, inputCurrency, outputCurrency])

  const triggerPrice = useMemo(() => {
    if (inputCurrency && outputCurrency) {
      if (order.isAdd) {
        return new Price({
          baseAmount: BnToCurrencyAmount(order.currentOutput, outputCurrency),
          quoteAmount: BnToCurrencyAmount(order.inputAmount, inputCurrency),
        })
      } else {
        return new Price({
          baseAmount: BnToCurrencyAmount(order.inputAmount, outputCurrency),
          quoteAmount: BnToCurrencyAmount(order.currentOutput, inputCurrency),
        })
      }
    }
    return undefined
  }, [order, inputCurrency, outputCurrency])

  const fiatValueBorrowAmount = useUSDPrice(trade?.borrowAmount)
  const fiatValueInputAmount = useUSDPrice(trade?.inputAmount)
  const fiatValueCurrentOutput = useUSDPrice(trade?.currentOutput)
  const fiatValueMargin = useUSDPrice(trade?.margin)

  // margin, total position, total input/output debt reduction + their fiat values

  return order.isAdd ? (
    <LightCard padding="0.75rem 1rem">
      <AutoColumn gap="md">
        <ValueWrapper>
          <RowBetween align="flex-end">
            <ThemedText.DeprecatedMain fontSize={16}>Added Collateral</ThemedText.DeprecatedMain>
            <RowFixed>
              <TruncatedText fontSize={13} fontWeight={500}>
                {formatBNToString(order.margin, NumberType.SwapTradeAmount)}
              </TruncatedText>
              <RowFixed>
                <CurrencyLogo currency={inputCurrency} size="15px" style={{ marginLeft: '5px', marginRight: '5px' }} />
                <Text fontSize={13} fontWeight={500}>
                  {inputCurrency?.symbol}
                </Text>
              </RowFixed>
            </RowFixed>
          </RowBetween>
          <FiatValue fiatValue={fiatValueMargin} />
        </ValueWrapper>
        <ValueWrapper>
          <RowBetween align="flex-end">
            <ThemedText.DeprecatedMain fontSize={16}>Added Position</ThemedText.DeprecatedMain>
            <RowFixed>
              <TruncatedText fontSize={13} fontWeight={500}>
                {formatBNToString(order.currentOutput, NumberType.SwapTradeAmount)}
              </TruncatedText>
              <RowFixed>
                <CurrencyLogo currency={outputCurrency} size="15px" style={{ marginLeft: '5px', marginRight: '5px' }} />
                <Text fontSize={13} fontWeight={500}>
                  {outputCurrency?.symbol}
                </Text>
              </RowFixed>
            </RowFixed>
          </RowBetween>
          <FiatValue fiatValue={fiatValueCurrentOutput} />
        </ValueWrapper>
        <ValueWrapper>
          <RowBetween align="flex-end">
            <ThemedText.DeprecatedMain fontSize={16}>Added Debt</ThemedText.DeprecatedMain>
            <RowFixed>
              <TruncatedText fontSize={13} fontWeight={500}>
                {formatBNToString(order.inputAmount.minus(order.margin), NumberType.SwapTradeAmount)}
              </TruncatedText>
              <RowFixed>
                <CurrencyLogo currency={inputCurrency} size="15px" style={{ marginLeft: '5px', marginRight: '5px' }} />
                <Text fontSize={13} fontWeight={500}>
                  {inputCurrency?.symbol}
                </Text>
              </RowFixed>
            </RowFixed>
          </RowBetween>
          <FiatValue fiatValue={fiatValueBorrowAmount} />
        </ValueWrapper>
        {triggerPrice && (
          <RowBetween>
            <ThemedText.DeprecatedMain fontSize={16}>Trigger Price</ThemedText.DeprecatedMain>
            <Underlined>
              <TradePrice price={triggerPrice} />
            </Underlined>
          </RowBetween>
        )}
      </AutoColumn>
    </LightCard>
  ) : (
    <LightCard padding="0.75rem 1rem" marginTop="1rem">
      <AutoColumn gap="md">
        <ValueWrapper>
          <RowBetween align="flex-end">
            <ThemedText.DeprecatedMain fontSize={16}>Position Reduce Amount</ThemedText.DeprecatedMain>
            <RowFixed>
              <TruncatedText fontSize={13} fontWeight={500}>
                {formatBNToString(order.inputAmount, NumberType.SwapTradeAmount)}
              </TruncatedText>
              <RowFixed>
                <CurrencyLogo currency={outputCurrency} size="15px" style={{ marginLeft: '5px', marginRight: '5px' }} />
                <Text fontSize={13} fontWeight={500}>
                  {outputCurrency?.symbol}
                </Text>
              </RowFixed>
            </RowFixed>
          </RowBetween>
          <FiatValue fiatValue={fiatValueInputAmount} />
        </ValueWrapper>
        <ValueWrapper>
          <RowBetween align="flex-end">
            <ThemedText.DeprecatedMain fontSize={16}>Debt Reduce Amount</ThemedText.DeprecatedMain>
            <RowFixed>
              <TruncatedText fontSize={13} fontWeight={500}>
                {formatBNToString(order.currentOutput, NumberType.SwapTradeAmount)}
              </TruncatedText>
              <RowFixed>
                <CurrencyLogo currency={inputCurrency} size="15px" style={{ marginLeft: '5px', marginRight: '5px' }} />
                <Text fontSize={13} fontWeight={500}>
                  {inputCurrency?.symbol}
                </Text>
              </RowFixed>
            </RowFixed>
          </RowBetween>
          <FiatValue fiatValue={fiatValueCurrentOutput} />
        </ValueWrapper>
        {triggerPrice && (
          <RowBetween>
            <ThemedText.DeprecatedMain>Trigger Price</ThemedText.DeprecatedMain>
            <Underlined>
              <TradePrice price={triggerPrice} />
            </Underlined>
          </RowBetween>
        )}
      </AutoColumn>
    </LightCard>
  )
}

const Underlined = styled.div`
  text-decoration: ${({ theme }) => `underline dashed ${theme.textTertiary}`};
`

const Wrapper = styled(AutoColumn)`
  gap: 0.5rem;
`

const ValueWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

export function ConfirmReducePositionHeader({
  txnInfo,
  inputCurrency,
  outputCurrency,
  showAcceptChanges,
  onAcceptChanges,
  existingPosition,
  allowedSlippage,
  removePremium,
}: {
  txnInfo: DerivedReducePositionInfo
  inputCurrency: Currency | undefined
  outputCurrency: Currency | undefined
  showAcceptChanges: boolean
  onAcceptChanges: () => void
  existingPosition: MarginPositionDetails | undefined
  allowedSlippage: Percent
  removePremium: boolean
}) {
  const theme = useTheme()

  const trade = useMemo(() => {
    if (inputCurrency && outputCurrency) {
      return {
        PnL: BnToCurrencyAmount(txnInfo.PnL, inputCurrency),
        margin: BnToCurrencyAmount(txnInfo.margin, inputCurrency),
        totalPosition: BnToCurrencyAmount(txnInfo.totalPosition, outputCurrency),
        totalDebtInput: BnToCurrencyAmount(txnInfo.totalDebtInput, inputCurrency),
        reduceAmount: BnToCurrencyAmount(txnInfo.reduceAmount, outputCurrency),
      }
    } else {
      return undefined
    }
  }, [txnInfo, inputCurrency, outputCurrency])
  const fiatValueReduceAmount = useUSDPrice(trade?.reduceAmount)
  // const fiatValuePnL = useUSDPrice(trade?.PnL)
  const fiatValueTotalPosition = useUSDPrice(trade?.totalPosition)
  // margin, total position, total input/output debt reduction + their fiat values
  return (
    <AutoColumn gap="4px" style={{ marginTop: '1rem' }}>
      <LightCard padding="0.75rem 1rem">
        <Wrapper>
          <AutoColumn gap="md">
            <RowBetween align="flex-start">
              <AutoColumn>
                <TruncatedText fontSize={16} fontWeight={500} color={theme.textSecondary}>
                  {formatBNToString(txnInfo.reduceAmount, NumberType.SwapTradeAmount)}
                </TruncatedText>
                <FiatValue fiatValue={fiatValueReduceAmount} />
              </AutoColumn>
              <RowFixed gap="0px">
                <Text fontSize={16} fontWeight={300} marginRight="6px">
                  Position Reduce Amount
                </Text>
                <CurrencyLogo currency={outputCurrency} size="15px" style={{ marginRight: '4px' }} />
                <Text fontSize={16} fontWeight={500}>
                  {outputCurrency?.symbol}
                </Text>
              </RowFixed>
            </RowBetween>
          </AutoColumn>
          <AutoColumn gap="md">
            <RowBetween align="flex-start">
              <AutoColumn>
                <TruncatedText fontSize={16} fontWeight={500} color={theme.textSecondary}>
                  {formatBNToString(txnInfo.totalPosition, NumberType.SwapTradeAmount)}
                </TruncatedText>
                <FiatValue fiatValue={fiatValueTotalPosition} />
              </AutoColumn>
              <RowFixed gap="0px">
                <Text fontSize={16} fontWeight={300} marginRight="6px">
                  New Total Position
                </Text>
                <CurrencyLogo currency={outputCurrency} size="15px" style={{ marginRight: '4px' }} />
                <Text fontSize={16} fontWeight={500}>
                  {outputCurrency?.symbol}
                </Text>
              </RowFixed>
            </RowBetween>
          </AutoColumn>
        </Wrapper>
      </LightCard>
      <RowBetween style={{ marginTop: '0.25rem', padding: '0 1rem' }}>
        <TradePrice price={txnInfo.executionPrice} />
      </RowBetween>
      <DecreasePositionDetails
        txnInfo={txnInfo}
        inputCurrency={inputCurrency}
        loading={false}
        existingPosition={existingPosition}
        allowedSlippage={allowedSlippage}
        removePremium={removePremium}
      />

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
        <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
          <Trans>
            New position is estimated. Your position will be reduced by at least{' '}
            <b>
              {formatBNToString(txnInfo.minimumOutput, NumberType.SwapTradeAmount)} {inputCurrency?.symbol}
            </b>{' '}
            or the transaction will revert.
          </Trans>
        </ThemedText.DeprecatedItalic>
      </AutoColumn>
      {/* {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <ThemedText.DeprecatedMain>
            <Trans>
              Output will be sent to{' '}
              <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
            </Trans>
          </ThemedText.DeprecatedMain>
        </AutoColumn>
      ) : null} */}
    </AutoColumn>
  )
}

export function ConfirmLimitReducePositionHeader({
  txnInfo,
  inputCurrency,
  outputCurrency,
  showAcceptChanges,
  onAcceptChanges,
  existingPosition,
}: {
  txnInfo: DerivedLimitReducePositionInfo
  existingPosition: MarginPositionDetails | undefined
  inputCurrency: Currency | undefined
  outputCurrency: Currency | undefined
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const theme = useTheme()

  const trade = useMemo(() => {
    if (inputCurrency) {
      return {
        reduceAmount: BnToCurrencyAmount(txnInfo.positionReduceAmount, inputCurrency),
        newTotalPosition: BnToCurrencyAmount(txnInfo.newTotalPosition, inputCurrency),
      }
    } else {
      return undefined
    }
  }, [txnInfo, inputCurrency])
  const fiatValueReduceAmount = useUSDPrice(trade?.reduceAmount)
  const fiatValueTotalPosition = useUSDPrice(trade?.newTotalPosition)
  // margin, total position, total input/output debt reduction + their fiat values

  return (
    <AutoColumn gap="4px" style={{ marginTop: '1rem' }}>
      <LightCard padding="0.75rem 1rem" style={{ marginBottom: '1rem' }}>
        <Wrapper>
          <AutoColumn gap="md">
            <RowBetween align="flex-start">
              <AutoColumn>
                <TruncatedText fontSize={16} fontWeight={500} color={theme.textSecondary}>
                  {formatBNToString(txnInfo.positionReduceAmount, NumberType.SwapTradeAmount)}
                </TruncatedText>
                <FiatValue fiatValue={fiatValueReduceAmount} height="12px" />
              </AutoColumn>
              <RowFixed gap="0px">
                <Text fontSize={16} fontWeight={300} marginRight="6px">
                  Position Reduce Amount
                </Text>
                <CurrencyLogo currency={outputCurrency} size="15px" style={{ marginRight: '4px' }} />
                <Text fontSize={16} fontWeight={500}>
                  {outputCurrency?.symbol}
                </Text>
              </RowFixed>
            </RowBetween>
          </AutoColumn>
          <AutoColumn gap="md">
            <RowBetween align="flex-start">
              <AutoColumn>
                <TruncatedText fontSize={16} fontWeight={500} color={theme.textSecondary}>
                  {formatBNToString(txnInfo.newTotalPosition, NumberType.SwapTradeAmount)}
                </TruncatedText>
                <FiatValue fiatValue={fiatValueTotalPosition} height="12px" />
              </AutoColumn>
              <RowFixed gap="0px">
                <Text fontSize={16} fontWeight={300} marginRight="6px">
                  New Total Position
                </Text>
                <CurrencyLogo currency={outputCurrency} size="15px" style={{ marginRight: '4px' }} />
                <Text fontSize={16} fontWeight={500}>
                  {outputCurrency?.symbol}
                </Text>
              </RowFixed>
            </RowBetween>
          </AutoColumn>
        </Wrapper>
      </LightCard>
      <DecreasePositionLimitDetails
        txnInfo={txnInfo}
        inputCurrency={inputCurrency}
        loading={false}
        existingPosition={existingPosition}
      />
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
        <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
          <Trans>
            New position is estimated. Your position will be reduced by at least{' '}
            <b>
              {formatBNToString(txnInfo.minimumDebtReduceAmount, NumberType.SwapTradeAmount)} {inputCurrency?.symbol}
            </b>{' '}
            or the transaction will revert.
          </Trans>
        </ThemedText.DeprecatedItalic>
      </AutoColumn>
      {/* {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <ThemedText.DeprecatedMain>
            <Trans>
              Output will be sent to{' '}
              <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
            </Trans>
          </ThemedText.DeprecatedMain>
        </AutoColumn>
      ) : null} */}
    </AutoColumn>
  )
}
