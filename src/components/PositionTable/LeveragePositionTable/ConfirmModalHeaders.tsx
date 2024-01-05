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

import {
  DecreasePositionDetails,
  DecreasePositionLimitDetails,
  DerivedLimitReducePositionInfo,
  DerivedReducePositionInfo,
} from './DecreasePositionContent'

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
        return new Price(
          inputCurrency,
          outputCurrency,
          order.inputAmount.shiftedBy(18).toFixed(0),
          order.currentOutput.shiftedBy(18).toFixed(0)
        )
      } else {
        return new Price(
          outputCurrency,
          inputCurrency,
          order.inputAmount.shiftedBy(18).toFixed(0),
          order.currentOutput.shiftedBy(18).toFixed(0)
        )
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
    <AutoColumn gap="4px" style={{ marginTop: '1rem' }}>
      <LightCard padding="0.75rem 1rem">
        <AutoColumn style={{ paddingBottom: '10px' }} gap="sm">
          <RowBetween>
            <ThemedText.DeprecatedMain fontSize={16}>Margin</ThemedText.DeprecatedMain>
          </RowBetween>
          <RowBetween align="flex-end">
            <RowFixed gap="0px">
              <TruncatedText fontSize={13} fontWeight={500}>
                {formatBNToString(order.margin, NumberType.SwapTradeAmount)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <CurrencyLogo currency={inputCurrency} size="15px" style={{ marginRight: '4px' }} />
              <Text fontSize={13} fontWeight={500}>
                {inputCurrency?.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <FiatValue fiatValue={fiatValueMargin} />
          </RowBetween>
        </AutoColumn>
        <AutoColumn style={{ paddingBottom: '10px' }} gap="sm">
          <RowBetween>
            <ThemedText.DeprecatedMain fontSize={16}>Added Position</ThemedText.DeprecatedMain>
          </RowBetween>
          <RowBetween align="flex-end">
            <RowFixed gap="0px">
              <TruncatedText fontSize={13} fontWeight={500}>
                {formatBNToString(order.currentOutput, NumberType.SwapTradeAmount)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <CurrencyLogo currency={outputCurrency} size="15px" style={{ marginRight: '4px' }} />
              <Text fontSize={13} fontWeight={500}>
                {outputCurrency?.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <FiatValue fiatValue={fiatValueCurrentOutput} />
          </RowBetween>
        </AutoColumn>
        <AutoColumn style={{ paddingBottom: '10px' }} gap="sm">
          <RowBetween>
            <ThemedText.DeprecatedMain fontSize={16}>Added Debt</ThemedText.DeprecatedMain>
          </RowBetween>
          <RowBetween align="flex-end">
            <RowFixed gap="0px">
              <TruncatedText fontSize={13} fontWeight={500}>
                {formatBNToString(order.inputAmount.minus(order.margin), NumberType.SwapTradeAmount)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <CurrencyLogo currency={inputCurrency} size="15px" style={{ marginRight: '4px' }} />
              <Text fontSize={13} fontWeight={500}>
                {inputCurrency?.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <FiatValue fiatValue={fiatValueBorrowAmount} />
          </RowBetween>
        </AutoColumn>
      </LightCard>
      {triggerPrice && (
        <RowBetween style={{ marginTop: '0.25rem', padding: '0 1rem' }}>
          <TradePrice price={triggerPrice} />
        </RowBetween>
      )}
    </AutoColumn>
  ) : (
    <AutoColumn gap="4px" style={{ marginTop: '1rem' }}>
      <LightCard padding="0.75rem 1rem">
        <AutoColumn style={{ paddingBottom: '10px' }} gap="sm">
          <RowBetween>
            <ThemedText.DeprecatedMain fontSize={16}>Position Reduce Amount</ThemedText.DeprecatedMain>
          </RowBetween>
          <RowBetween align="flex-end">
            <RowFixed gap="0px">
              <TruncatedText fontSize={13} fontWeight={500}>
                {formatBNToString(order.inputAmount, NumberType.SwapTradeAmount)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <CurrencyLogo currency={outputCurrency} size="15px" style={{ marginRight: '4px' }} />
              <Text fontSize={13} fontWeight={500}>
                {outputCurrency?.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <FiatValue fiatValue={fiatValueInputAmount} />
          </RowBetween>
        </AutoColumn>
        <AutoColumn style={{ paddingBottom: '10px' }} gap="sm">
          <RowBetween>
            <ThemedText.DeprecatedMain fontSize={16}>Debt Reduce Amount</ThemedText.DeprecatedMain>
          </RowBetween>
          <RowBetween align="flex-end">
            <RowFixed gap="0px">
              <TruncatedText fontSize={13} fontWeight={500}>
                {formatBNToString(order.currentOutput, NumberType.SwapTradeAmount)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <CurrencyLogo currency={inputCurrency} size="15px" style={{ marginRight: '4px' }} />
              <Text fontSize={13} fontWeight={500}>
                {inputCurrency?.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <FiatValue fiatValue={fiatValueCurrentOutput} />
          </RowBetween>
        </AutoColumn>
      </LightCard>
      {triggerPrice && (
        <RowBetween style={{ marginTop: '0.25rem', padding: '0 1rem' }}>
          <TradePrice price={triggerPrice} />
        </RowBetween>
      )}
    </AutoColumn>
  )
}

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
    if (inputCurrency) {
      return {
        PnL: BnToCurrencyAmount(txnInfo.PnL, inputCurrency),
        margin: BnToCurrencyAmount(txnInfo.margin, inputCurrency),
        totalPosition: BnToCurrencyAmount(txnInfo.totalPosition, inputCurrency),
        totalDebtInput: BnToCurrencyAmount(txnInfo.totalDebtInput, inputCurrency),
        reduceAmount: BnToCurrencyAmount(txnInfo.reduceAmount, inputCurrency),
      }
    } else {
      return undefined
    }
  }, [txnInfo, inputCurrency])
  const fiatValueReduceAmount = useUSDPrice(trade?.reduceAmount)
  const fiatValuePnL = useUSDPrice(trade?.PnL)
  const fiatValueTotalPosition = useUSDPrice(trade?.totalPosition)
  // margin, total position, total input/output debt reduction + their fiat values

  return (
    <AutoColumn gap="4px" style={{ marginTop: '1rem' }}>
      <LightCard padding="0.75rem 1rem">
        <AutoColumn gap="md">
          <RowBetween align="center">
            <RowFixed gap="0px">
              <TruncatedText fontSize={16} fontWeight={500} color={theme.textSecondary}>
                {formatBNToString(txnInfo.reduceAmount, NumberType.SwapTradeAmount)}
              </TruncatedText>
            </RowFixed>
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
          <RowBetween>
            <FiatValue fiatValue={fiatValueReduceAmount} />
          </RowBetween>
        </AutoColumn>
        <AutoColumn gap="sm">
          <RowBetween align="center">
            <RowFixed gap="0px">
              <TruncatedText fontSize={16} fontWeight={500} color={theme.textSecondary}>
                {formatBNToString(txnInfo.totalPosition, NumberType.SwapTradeAmount)}
              </TruncatedText>
            </RowFixed>
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
          <RowBetween>
            <FiatValue fiatValue={fiatValueTotalPosition} />
          </RowBetween>
        </AutoColumn>
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
}: {
  txnInfo: DerivedLimitReducePositionInfo
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
      <LightCard padding="0.75rem 1rem">
        <AutoColumn gap="md">
          <RowBetween align="center">
            <RowFixed gap="0px">
              <TruncatedText fontSize={16} fontWeight={500} color={theme.textSecondary}>
                {formatBNToString(txnInfo.positionReduceAmount, NumberType.SwapTradeAmount)}
              </TruncatedText>
            </RowFixed>
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
          <RowBetween>
            <FiatValue fiatValue={fiatValueReduceAmount} />
          </RowBetween>
        </AutoColumn>
        <AutoColumn gap="sm">
          <RowBetween align="center">
            <RowFixed gap="0px">
              <TruncatedText fontSize={16} fontWeight={500} color={theme.textSecondary}>
                {formatBNToString(txnInfo.newTotalPosition, NumberType.SwapTradeAmount)}
              </TruncatedText>
            </RowFixed>
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
          <RowBetween>
            <FiatValue fiatValue={fiatValueTotalPosition} />
          </RowBetween>
        </AutoColumn>
      </LightCard>
      {/* <RowBetween style={{ marginTop: '0.25rem', padding: '0 1rem' }}>
        <TradePrice price={txnInfo.startingTriggerPrice} />
      </RowBetween> */}

      <DecreasePositionLimitDetails txnInfo={txnInfo} inputCurrency={inputCurrency} loading={false} />

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

// export function ConfirmLimitReducePositionHeader({
//   txnInfo,
//   inputCurrency,
//   outputCurrency,
//   showAcceptChanges,
//   onAcceptChanges,
// }: {
//   txnInfo: DerivedLimitReducePositionInfo
//   inputCurrency: Currency | undefined
//   outputCurrency: Currency | undefined
//   showAcceptChanges: boolean
//   onAcceptChanges: () => void
// }) {
//   const theme = useTheme()

//   const trade = useMemo(() => {
//     if (inputCurrency) {
//       return {
//         // PnL: BnToCurrencyAmount(txnInfo.PnL, inputCurrency),
//         margin: BnToCurrencyAmount(txnInfo.margin, inputCurrency),
//         totalPosition: BnToCurrencyAmount(txnInfo.totalPosition, inputCurrency),
//         totalDebtInput: BnToCurrencyAmount(txnInfo.totalDebtInput, inputCurrency),
//       }
//     } else {
//       return undefined
//     }
//   }, [txnInfo, inputCurrency])
//   const fiatValueMargin = useUSDPrice(trade?.margin)
//   // const fiatValuePnL = useUSDPrice(trade?.PnL)
//   const fiatValueTotalPosition = useUSDPrice(trade?.totalPosition)
//   // margin, total position, total input/output debt reduction + their fiat values

//   return (
//     <AutoColumn gap="4px" style={{ marginTop: '1rem' }}>
//       <LightCard padding="0.75rem 1rem">
//         <AutoColumn style={{ paddingBottom: '10px' }} gap="sm">
//           <RowBetween>
//             <ThemedText.DeprecatedMain fontSize={16}>New Margin</ThemedText.DeprecatedMain>
//           </RowBetween>
//           <RowBetween align="flex-end">
//             <RowFixed gap="0px">
//               <TruncatedText fontSize={13} fontWeight={500}>
//                 {formatBNToString(txnInfo.margin, NumberType.SwapTradeAmount)}
//               </TruncatedText>
//             </RowFixed>
//             <RowFixed gap="0px">
//               <CurrencyLogo currency={inputCurrency} size="15px" style={{ marginRight: '4px' }} />
//               <Text fontSize={13} fontWeight={500}>
//                 {inputCurrency?.symbol}
//               </Text>
//             </RowFixed>
//           </RowBetween>
//           <RowBetween>
//             <FiatValue fiatValue={fiatValueMargin} />
//           </RowBetween>
//         </AutoColumn>
//         <AutoColumn style={{ paddingBottom: '10px' }} gap="sm">
//           <RowBetween>
//             <ThemedText.DeprecatedMain fontSize={16}>New Total Position</ThemedText.DeprecatedMain>
//           </RowBetween>
//           <RowBetween align="flex-end">
//             <RowFixed gap="0px">
//               <TruncatedText fontSize={13} fontWeight={500}>
//                 {formatBNToString(txnInfo.totalPosition, NumberType.SwapTradeAmount)}
//               </TruncatedText>
//             </RowFixed>
//             <RowFixed gap="0px">
//               <CurrencyLogo currency={inputCurrency} size="15px" style={{ marginRight: '4px' }} />
//               <Text fontSize={13} fontWeight={500}>
//                 {outputCurrency?.symbol}
//               </Text>
//             </RowFixed>
//           </RowBetween>
//           <RowBetween>
//             <FiatValue fiatValue={fiatValueTotalPosition} />
//           </RowBetween>
//         </AutoColumn>
//       </LightCard>
//       {/* <RowBetween style={{ marginTop: '0.25rem', padding: '0 1rem' }}>
//         <TradePrice price={trade.executionPrice} />
//       </RowBetween> */}
//       {showAcceptChanges ? (
//         <SwapShowAcceptChanges justify="flex-start" gap="0px">
//           <RowBetween>
//             <RowFixed>
//               <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
//               <ThemedText.DeprecatedMain color={theme.textSecondary}>
//                 <Trans>Price Updated</Trans>
//               </ThemedText.DeprecatedMain>
//             </RowFixed>
//             <ButtonPrimary
//               style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '12px' }}
//               onClick={onAcceptChanges}
//             >
//               <Trans>Accept</Trans>
//             </ButtonPrimary>
//           </RowBetween>
//         </SwapShowAcceptChanges>
//       ) : null}

//       {/* <AutoColumn justify="flex-start" gap="sm" style={{ padding: '.75rem 1rem' }}>
//         <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
//           <Trans>
//             New position is estimated. Your position will be reduced by at least{' '}
//             <b>
//               {formatBNToString(txnInfo.minimumOutput, NumberType.SwapTradeAmount)} {inputCurrency?.symbol}
//             </b>{' '}
//             or the transaction will revert.
//           </Trans>
//         </ThemedText.DeprecatedItalic>
//       </AutoColumn> */}
//       {/* {recipient !== null ? (
//         <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
//           <ThemedText.DeprecatedMain>
//             <Trans>
//               Output will be sent to{' '}
//               <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
//             </Trans>
//           </ThemedText.DeprecatedMain>
//         </AutoColumn>
//       ) : null} */}
//     </AutoColumn>
//   )
// }
