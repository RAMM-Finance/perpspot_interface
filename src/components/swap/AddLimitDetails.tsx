import { NumberType } from '@uniswap/conedison/format'
import { useWeb3React } from '@web3-react/core'
import Card from 'components/Card'
import { LoadingRows } from 'components/Loader/styled'
import { useCurrency } from 'hooks/Tokens'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import moment from 'moment'
import { AddLimitTrade } from 'state/marginTrading/hooks'
import styled, { useTheme } from 'styled-components/macro'

// import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { Separator, ThemedText } from '../../theme'
import { AutoColumn } from '../Column'
import { ValueLabel } from './AdvancedSwapDetails'
const StyledCard = styled(Card)`
  padding: 0;
`
export function formatDuration(seconds: any) {
  const duration = moment.duration(seconds, 'seconds')
  const hours = duration.hours()
  const minutes = duration.minutes()

  let formattedString = ''
  if (hours > 0) {
    formattedString += `${hours} h `
  }
  if (minutes > 0 || hours === 0) {
    formattedString += `${minutes} m`
  }

  return formattedString.trim()
}

interface AdvancedAddLimitDetails {
  trade?: AddLimitTrade
  // allowedSlippage: Percent
  syncing?: boolean
  hideInfoTooltips?: boolean
}

const StyledText = styled(ThemedText.DeprecatedBlack)`
  display: flex;
  flex-direction: row;
`

function TextWithLoadingPlaceholder({
  syncing,
  width,
  children,
}: {
  syncing: boolean
  width: number
  children: JSX.Element
}) {
  return syncing ? (
    <LoadingRows>
      <div style={{ height: '15px', width: `${width}px` }} />
    </LoadingRows>
  ) : (
    children
  )
}

export function AdvancedAddLimitDetails({
  trade,
  // allowedSlippage,
  syncing = false,
  hideInfoTooltips = false,
}: AdvancedAddLimitDetails) {
  const theme = useTheme()
  const { chainId } = useWeb3React()
  const nativeCurrency = useNativeCurrency()
  const inputCurrency = useCurrency(trade?.inputCurrencyId)
  const outputCurrency = useCurrency(trade?.outputCurrencyId)

  // const { expectedOutputAmount, priceImpact } = useMemo(() => {
  //   return {
  //     expectedOutputAmount: trade?.outputAmount,
  //     priceImpact: trade ? computeRealizedPriceImpact(trade) : undefined,
  //   }
  // }, [trade])
  // console.log('limit order',trade)

  return (
    <StyledCard>
      <AutoColumn gap="sm">
        {/* <ValueLabel
          description="Amount of margin you are submitting"
          value={formatBNToString(trade?.margin, NumberType.SwapTradeAmount)}
          label="Margin"
          symbolAppend={inputCurrency ? inputCurrency.symbol : '-'}
          syncing={syncing}
        /> */}
        <ValueLabel
          description="Borrow Amount when order is filled"
          value={formatBNToString(trade?.inputAmount.minus(trade?.margin), NumberType.SwapTradeAmount)}
          label="Borrowing"
          symbolAppend={inputCurrency ? inputCurrency.symbol : '-'}
          syncing={syncing}
        />
        <ValueLabel
          description="Order will be not filled after this time"
          value={trade ? `${formatDuration(Number(trade?.duration))}` : '-'}
          label="Valid For"
          syncing={syncing}
        />
        <ValueLabel
          description="Amount of premiums to be initially escrowed and held for order to be filled"
          value={formatBNToString(trade?.additionalPremium, NumberType.SwapTradeAmount)}
          label="Premium Depositing"
          symbolAppend={inputCurrency?.symbol}
          syncing={syncing}
        />
        {/*<MouseoverValueLabel
          description="Order Price"
          value={formatBNToString(trade?.limitPrice, NumberType.SwapTradeAmount)}
          label={
            <Trans>
              <ThemedText.BodySmall>Order Price</ThemedText.BodySmall>
            </Trans>
          }
          appendSymbol={inputCurrency ? inputCurrency.symbol : '-'}
        />*/}
        <Separator />
        <ValueLabel
          description="The amount added to your position when your order is filled"
          label="Added Position"
          syncing={syncing}
          value={
            trade ? `${formatBNToString(trade.minOutput, NumberType.SwapTradeAmount)} ${outputCurrency?.symbol}` : '-'
          }
        />
        {/* <RowBetween>
          <RowFixed style={{ marginRight: '20px' }}>
            <MouseoverTooltip
              text={
                <Trans>
                  The minimum amount you are guaranteed to receive. If the price slips any further, your transaction
                  will revert.
                </Trans>
              }
              disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.textTertiary}>
                {trade.tradeType === TradeType.EXACT_INPUT ? (
                  <Trans>Minimum received</Trans>
                ) : (
                  <Trans>Maximum sent</Trans>
                )}{' '}
                <Trans>after slippage</Trans> ({allowedSlippage.toFixed(2)}%)
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={syncing} width={70}>
            <ThemedText.DeprecatedBlack textAlign="right" fontSize={14} color={theme.textTertiary}>
              <TruncatedText>
                {trade.tradeType === TradeType.EXACT_INPUT
                  ? `${trade.minimumAmountOut(allowedSlippage).toSignificant(6)} ${trade.outputAmount.currency.symbol}`
                  : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol}`}
              </TruncatedText>
            </ThemedText.DeprecatedBlack>
          </TextWithLoadingPlaceholder>
        </RowBetween> */}
        {/* {!trade?.gasUseEstimateUSD || !chainId || !SUPPORTED_GAS_ESTIMATE_CHAIN_IDS.includes(chainId) ? null : (
          <RowBetween>
            <MouseoverTooltip
              text={
                <Trans>
                  The fee paid to miners who process your transaction. This must be paid in {nativeCurrency.symbol}.
                </Trans>
              }
              disableHover={hideInfoTooltips}
            >
              <ThemedText.DeprecatedSubHeader color={theme.textTertiary}>
                <Trans>Network Fee</Trans>
              </ThemedText.DeprecatedSubHeader>
            </MouseoverTooltip>
            <TextWithLoadingPlaceholder syncing={syncing} width={50}>
              <ThemedText.DeprecatedBlack textAlign="right" fontSize={14} color={theme.textTertiary}>
                ~${trade.gasUseEstimateUSD.toFixed(2)}
              </ThemedText.DeprecatedBlack>
            </TextWithLoadingPlaceholder>
          </RowBetween>
        )} */}
      </AutoColumn>
    </StyledCard>
  )
}
