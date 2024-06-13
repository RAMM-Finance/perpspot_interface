import { NumberType } from '@uniswap/conedison/format'
import Card from 'components/Card'
import { LoadingRows } from 'components/Loader/styled'
import { useCurrency } from 'hooks/Tokens'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import moment from 'moment'
import { AddLimitTrade } from 'state/marginTrading/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { useChainId } from 'wagmi'

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
  const chainId = useChainId()
  const nativeCurrency = useNativeCurrency()
  const inputCurrency = useCurrency(trade?.inputCurrencyId)
  const outputCurrency = useCurrency(trade?.outputCurrencyId)

  return (
    <StyledCard>
      <AutoColumn gap="sm">
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
          description="Amount of interest to be initially escrowed and held for order to be filled"
          value={formatBNToString(trade?.additionalPremium, NumberType.SwapTradeAmount)}
          label="Interest Depositing"
          symbolAppend={inputCurrency?.symbol}
          syncing={syncing}
        />

        <Separator />
        <ValueLabel
          description="The amount added to your position when your order is filled"
          label="Added Position"
          syncing={syncing}
          value={
            trade ? `${formatBNToString(trade.minOutput, NumberType.SwapTradeAmount)} ${outputCurrency?.symbol}` : '-'
          }
        />
      </AutoColumn>
    </StyledCard>
  )
}
