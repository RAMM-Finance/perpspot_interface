import { Trans } from '@lingui/macro'
import { SwapPriceUpdateUserResponse } from '@uniswap/analytics-events'
import { NumberType } from '@uniswap/conedison/format'
import { Currency, Price, TradeType } from '@uniswap/sdk-core'
import { BigNumber as BN } from 'bignumber.js'
import { UnderlineText } from 'components/PositionTable/BorrowPositionTable/TokenRow'
import { useCurrency } from 'hooks/Tokens'
import { useUSDPriceBN } from 'hooks/useUSDPrice'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useMemo } from 'react'
import { AlertTriangle, ArrowDown } from 'react-feather'
import { Text } from 'rebass'
import { AddLimitTrade, PreTradeInfo } from 'state/marginTrading/hooks'
import { InterfaceTrade } from 'state/routing/types'
import styled, { useTheme } from 'styled-components/macro'

import { ThemedText } from '../../theme'
import { isAddress, shortenAddress } from '../../utils'
import { FiatValue } from '../BaseSwapPanel/FiatValue'
import { ButtonPrimary } from '../Button'
import Card from '../Card'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../Logo/CurrencyLogo'
import { RowBetween, RowFixed } from '../Row'
import TradePrice from '../swap/TradePrice'
import { AdvancedAddLimitDetails } from './AddLimitDetails'
import { SwapShowAcceptChanges, TruncatedText } from './styleds'

const LightCard = styled(Card)`
  background-color: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
`

const ArrowWrapper = styled.div`
  padding: 4px;
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
  border: 2px solid;
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

export function AddLimitModalHeader({
  trade,
  preTradeInfo,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
}: {
  trade: AddLimitTrade
  preTradeInfo: PreTradeInfo
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const theme = useTheme()
  const inputCurrency = useCurrency(trade.inputCurrencyId)
  const outputCurrency = useCurrency(trade.outputCurrencyId)

  const fiatValueMargin = useUSDPriceBN(trade.margin)
  const fiatValueTotalInput = useUSDPriceBN(trade.inputAmount)
  const fiatValueStartOutput = useUSDPriceBN(trade.startOutput)
  // output / input
  const limitPrice = useMemo(() => {
    if (inputCurrency && outputCurrency) {
      const decimalInput = inputCurrency.decimals
      const decimalOutput = outputCurrency.decimals
      const decimalDiff = decimalInput > decimalOutput ? decimalInput - decimalOutput : decimalOutput - decimalInput
      if (trade.limitPrice.isGreaterThan(1)) {
        return new Price(
          outputCurrency,
          inputCurrency,
          trade.limitPrice.shiftedBy(decimalDiff).toFixed(0),
          new BN(1).shiftedBy(0).toFixed(0)
        )
      } else {
        return new Price(
          outputCurrency,
          inputCurrency,
          new BN(1).shiftedBy(0).toFixed(0),
          new BN(1).div(trade.limitPrice).shiftedBy(decimalDiff).toFixed(0)
        )
      }
    }
    return undefined
  }, [inputCurrency, outputCurrency, trade.limitPrice])

  return (
    <AutoColumn gap="4px" style={{ marginTop: '1rem' }}>
      <LightCard padding="0.75rem 1rem">
        <AutoColumn gap="md">
          <RowBetween align="center">
            <RowFixed gap="0px">
              <TruncatedText fontSize={13} fontWeight={500} color={theme.textSecondary}>
                {formatBNToString(trade.margin, NumberType.SwapTradeAmount)} (+{' '}
                {formatBNToString(trade.additionalPremium, NumberType.SwapTradeAmount)})
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <Text fontSize={13} fontWeight={300} marginRight="6px">
                Margin + Premium
              </Text>
              <CurrencyLogo currency={inputCurrency} size="15px" style={{ marginRight: '4px' }} />
              <Text fontSize={13} fontWeight={500}>
                {inputCurrency?.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <FiatValue fiatValue={fiatValueTotalInput} />
          </RowBetween>
        </AutoColumn>
      </LightCard>
      <ArrowWrapper>
        <ArrowDown size="12" color={theme.textPrimary} />
      </ArrowWrapper>
      <LightCard padding="0.75rem 1rem" style={{ marginBottom: '0.25rem' }}>
        <AutoColumn gap="md">
          <RowBetween align="center">
            <RowFixed gap="0px">
              <TruncatedText fontSize={13} fontWeight={500} color={theme.textSecondary}>
                {formatBNToString(trade.startOutput, NumberType.SwapTradeAmount)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <Text fontSize={13} fontWeight={300} marginRight="6px">
                Desired Output
              </Text>
              <CurrencyLogo currency={outputCurrency} size="15px" style={{ marginRight: '4px' }} />
              <Text fontSize={13} fontWeight={500}>
                {outputCurrency?.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <FiatValue fiatValue={fiatValueStartOutput} />
          </RowBetween>
        </AutoColumn>
      </LightCard>
      <RowBetween style={{ marginTop: '0.25rem', padding: '0 1rem' }}>
        <ThemedText.DeprecatedMain fontSize={14}>Order Price</ThemedText.DeprecatedMain>
        <UnderlineText>{limitPrice && <TradePrice price={limitPrice} />}</UnderlineText>
      </RowBetween>
      <LightCard style={{ padding: '.75rem', marginTop: '0.5rem' }}>
        <AdvancedAddLimitDetails trade={trade} syncing={false} />
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
        <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
          <Trans>
            Output is estimated, you will receive at least{' '}
            <b>
              {formatBNToString(trade.minOutput, NumberType.SwapTradeAmount)} {outputCurrency?.symbol}
            </b>{' '}
            or the order will not be filled.
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
