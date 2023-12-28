import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { Currency, Price } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import { AutoColumn } from 'components/Column'
import { OpacityHoverState } from 'components/Common'
import { LmtTradePrice } from 'components/swap/TradePrice'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import moment from 'moment'
// import { GenieAsset, Trait } from 'nft/types'
import { ReactNode, useMemo, useState } from 'react'
import styled from 'styled-components'
import { MarginLimitOrder } from 'types/lmtv2position'

const Grid = styled(AutoColumn)`
  // display: grid;
  // grid-template-columns: 1fr;
  // gap: 16px;
  margin-top: 15px;
  margin-bottom: 15px;
  background-color: ${({ theme }) => theme.surface1};
  padding: 0.5rem 1rem;
  width: 100%;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  // @media (max-width: 1080px) {
  //   grid-template-columns: 1fr 1fr 1fr;
  // }

  // @media (max-width: 420px) {
  //   grid-template-columns: 1fr 1fr;
  // }
`

const GridItemContainer = styled.div`
  // background-color: ${({ theme }) => theme.surface1};
  border-radius: 12px;
  cursor: pointer;
  text-decoration: none;
  // border: 1px solid ${({ theme }) => theme.backgroundOutline};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  // margin-right: 15px;
  // ${OpacityHoverState}
  min-width: 0;
`

const TraitType = styled.div`
  color: ${({ theme }) => theme.textPrimary};
  // font-weight: 535;
  font-size: 12px;
  line-height: 12px;
  white-space: nowrap;
  width: 100%;
`

const TraitValue = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  line-height: 24px;
  margin-top: 4px;
  // display: inline-block;

  // display: inline-block;
  // overflow: hidden;
  // text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`

const GridRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
`

const GridItem = ({ label, value }: { label: string; value: ReactNode }) => {
  return (
    <GridItemContainer>
      <TraitType>{label}</TraitType>
      <TraitValue>{value}</TraitValue>
    </GridItemContainer>
  )
}

/**
 *
 * reduce limit order: trigger price, mark price, current output, minimum output, reduce amount
 */
const ExistingReduceOrderDetails = ({
  order,
  pool,
  inputCurrency,
  outputCurrency,
}: {
  order: MarginLimitOrder
  pool: Pool
  inputCurrency: Currency
  outputCurrency: Currency
}) => {
  const [baseCurrencyIsInputToken, setBaseCurrencyIsInputToken] = useState(false)

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
    <Grid>
      <GridItem
        label="Trigger Price"
        value={
          <LmtTradePrice
            price={triggerPrice}
            showInverted={baseCurrencyIsInputToken}
            setShowInverted={() => setBaseCurrencyIsInputToken(!baseCurrencyIsInputToken)}
          />
        }
      />
      <GridItem
        label="Mark Price"
        value={
          <LmtTradePrice
            price={markPrice}
            showInverted={baseCurrencyIsInputToken}
            setShowInverted={() => setBaseCurrencyIsInputToken(!baseCurrencyIsInputToken)}
          />
        }
      />
      <GridItem
        label="Reduce Amount"
        value={
          <Trans>{`${formatBNToString(order.inputAmount, NumberType.SwapTradeAmount)} ${outputCurrency.symbol}`}</Trans>
        }
      />
      <GridItem label="Remaining Time" value={<Trans>{remainingTime}</Trans>} />
      <GridItem
        label="Decay Rate"
        value={<Trans>{`${formatBNToString(order.decayRate.times(100), NumberType.TokenNonTx)} %`}</Trans>}
      />
    </Grid>
  )
}

export default ExistingReduceOrderDetails
