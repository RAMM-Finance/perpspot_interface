import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { Currency, Price } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import { AutoColumn } from 'components/Column'
import { StyledCard, TextWithLoadingPlaceholder } from 'components/modalFooters/common'
import { RowBetween, RowFixed } from 'components/Row'
import { ValueLabel } from 'components/swap/AdvancedSwapDetails'
import { LmtTradePrice } from 'components/swap/TradePrice'
import { MouseoverTooltip } from 'components/Tooltip'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import moment from 'moment'
// import { GenieAsset, Trait } from 'nft/types'
import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Separator, ThemedText } from 'theme'
import { MarginLimitOrder } from 'types/lmtv2position'
import { TokenBN } from 'utils/lmtSDK/internalConstants'

const Underlined = styled.div`
  text-decoration: ${({ theme }) => `underline dashed ${theme.textTertiary}`};
`

function PriceValueLabel({
  label,
  price,
  loading,
  description,
  labelSize = '12px',
  valueSize = '12px',
}: {
  label: string
  price: Price<Currency, Currency>
  loading: boolean
  description: string
  labelSize?: string
  valueSize?: string
}) {
  const [invertedPrice, setInverted] = useState(false)
  return (
    <RowBetween>
      <RowFixed>
        <MouseoverTooltip text={<Trans>{description}</Trans>}>
          <ThemedText.BodySmall fontSize={labelSize} color="textPrimary">
            <Trans>{label}</Trans>
          </ThemedText.BodySmall>
        </MouseoverTooltip>
      </RowFixed>
      <TextWithLoadingPlaceholder syncing={loading} width={65} height="14px">
        {price ? (
          <Underlined>
            <LmtTradePrice
              setShowInverted={setInverted}
              price={price}
              valueFontSize={valueSize}
              showInverted={invertedPrice}
            />
          </Underlined>
        ) : (
          <ThemedText.BodySmall textAlign="right" color="textSecondary">
            -
          </ThemedText.BodySmall>
        )}
      </TextWithLoadingPlaceholder>
    </RowBetween>
  )
}

const DetailsWrapper = styled(StyledCard)`
  background-color: ${({ theme }) => theme.surface1};
  margin-top: 1rem;
  margin-bottom: 1rem;
`

/**
 *
 * reduce limit order: trigger price, mark price, current output, minimum output, reduce amount
 */
const ExistingReduceOrderDetails = ({
  order,
  pool,
  inputCurrency,
  outputCurrency,
  loading,
  estimatedPnL,
}: {
  order: MarginLimitOrder
  estimatedPnL?: TokenBN
  loading: boolean
  pool: Pool
  inputCurrency: Currency
  outputCurrency: Currency
}) => {
  // const [baseCurrencyIsInputToken, setBaseCurrencyIsInputToken] = useState(false)

  // input / output
  const triggerPrice = useMemo(() => {
    return new Price(
      outputCurrency,
      inputCurrency,
      order.inputAmount.shiftedBy(18).toFixed(0),
      order.currentOutput.shiftedBy(18).toFixed(0)
    )
  }, [order, inputCurrency, outputCurrency])
  // const baseCurrency = baseCurrencyIsInputToken ? inputCurrency : outputCurrency
  // const quoteCurrency = baseCurrencyIsInputToken ? outputCurrency : inputCurrency

  // input / output
  const markPrice = useMemo(() => {
    const inputIsToken0 = inputCurrency.wrapped.sortsBefore(outputCurrency.wrapped)
    if (inputIsToken0) {
      return pool.token1Price
    } else {
      return pool.token0Price
    }
  }, [pool, inputCurrency, outputCurrency])

  const remainingTime = useMemo(() => {
    const duration = order.auctionDeadline - Date.now() / 1000
    const durationInSeconds = duration

    // Create a Moment duration
    const durationMoment = moment.duration(durationInSeconds, 'seconds')

    // Extract hours and minutes
    const hours = durationMoment.hours()
    const minutes = durationMoment.minutes()

    // Format the string
    const formattedDuration = hours + ' h ' + minutes + ' m'
    return formattedDuration
  }, [order])

  return (
    <DetailsWrapper>
      <AutoColumn gap="md">
        <ValueLabel
          label="Position Reduce Amount"
          description={`Amount of ${outputCurrency.symbol} removed from the active position`}
          value={formatBNToString(order.inputAmount, NumberType.SwapTradeAmount)}
          syncing={loading}
          symbolAppend={outputCurrency.symbol}
          labelSize="14px"
          valueSize="14px"
        />
        <ValueLabel
          label="Time Left"
          description="Time remaining before limit order expires"
          value={remainingTime}
          syncing={loading}
          labelSize="14px"
          valueSize="14px"
        />
        <ValueLabel
          label="Estimated PnL"
          description="Estimated returns for this order"
          value={formatBNToString(estimatedPnL, NumberType.SwapTradeAmount)}
          syncing={loading}
          delta={true}
          symbolAppend={inputCurrency.symbol}
          labelSize="14px"
          valueSize="14px"
        />
        <Separator />
        <PriceValueLabel
          label="Trigger Price"
          price={triggerPrice}
          description="Initial execution price of the limit order"
          loading={loading}
          labelSize="14px"
          valueSize="14px"
        />
        <PriceValueLabel
          label="Mark Price"
          price={markPrice}
          description="Current execution price of the limit order"
          loading={loading}
          labelSize="14px"
          valueSize="14px"
        />
      </AutoColumn>
    </DetailsWrapper>
  )
}

export default ExistingReduceOrderDetails
