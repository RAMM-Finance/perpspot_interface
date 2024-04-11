import { Trans } from '@lingui/macro'
import { formatNumber, NumberType } from '@uniswap/conedison/format'
import { Currency, Price, Token } from '@uniswap/sdk-core'
import { ReversedArrowsIcon } from 'nft/components/icons'
import { useCallback, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatTransactionAmount, priceToPreciseFloat } from 'utils/formatNumbers'

interface TradePriceProps {
  price: Price<Currency, Currency> | Price<Token, Token>
}

interface LmtTradePriceProps {
  setShowInverted: (inverted: boolean) => void
  showInverted: boolean
  price: Price<Currency, Currency> | Price<Token, Token>
  labelFontSize?: string
  valueFontSize?: string
}

const StyledPriceContainer = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  grid-template-columns: 1fr auto;
  grid-gap: 0.25rem;
  display: flex;
  flex-direction: row;
  text-align: left;
  flex-wrap: wrap;
  padding: 8px 0;
  user-select: text;
`
const LmtStyledPriceContainer = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  grid-template-columns: 1fr auto;
  grid-gap: 0.25rem;
  display: flex;
  flex-direction: row;
  text-align: left;
  flex-wrap: wrap;
  user-select: text;
`

export default function TradePrice({ price }: TradePriceProps) {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  // const { data: usdPrice } = useUSDPrice(tryParseCurrencyAmount('1', showInverted ? baseCurrency : quoteCurrency))
  let usdPrice
  let formattedPrice: string
  try {
    formattedPrice = showInverted
      ? formatTransactionAmount(priceToPreciseFloat(price))
      : formatTransactionAmount(priceToPreciseFloat(price.invert()))
  } catch (error) {
    formattedPrice = '0'
  }

  const label = showInverted ? `${price.quoteCurrency?.symbol}` : `${price.baseCurrency?.symbol} `
  const labelInverted = showInverted ? `${price.baseCurrency?.symbol} ` : `${price.quoteCurrency?.symbol}`
  const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted])

  const text = `${'1 ' + labelInverted + ' = ' + formattedPrice ?? '-'} ${label}`

  return (
    <StyledPriceContainer
      onClick={(e) => {
        e.stopPropagation() // dont want this click to affect dropdowns / hovers
        flipPrice()
      }}
      title={text}
    >
      <ThemedText.BodySmall fontSize={13}>{text}</ThemedText.BodySmall>{' '}
      {usdPrice && (
        <ThemedText.DeprecatedDarkGray>
          <Trans>({formatNumber(usdPrice, NumberType.FiatTokenPrice)})</Trans>
        </ThemedText.DeprecatedDarkGray>
      )}
      <ReversedArrowsIcon />
    </StyledPriceContainer>
  )
}

export function LmtTradePrice({
  price,
  showInverted,
  setShowInverted,
  labelFontSize,
  valueFontSize,
}: LmtTradePriceProps) {
  // const { baseCurrency, quoteCurrency } = price
  // const { data: usdPrice } = useUSDPrice(tryParseCurrencyAmount('1', showInverted ? baseCurrency : quoteCurrency))
  let usdPrice
  let formattedPrice: string
  try {
    formattedPrice = showInverted
      ? formatTransactionAmount(priceToPreciseFloat(price))
      : formatTransactionAmount(priceToPreciseFloat(price.invert()))
  } catch (error) {
    formattedPrice = '0'
  }

  const label = showInverted ? `${price.quoteCurrency?.symbol}` : `${price.baseCurrency?.symbol} `
  const labelInverted = showInverted ? `${price.baseCurrency?.symbol} ` : `${price.quoteCurrency?.symbol}`
  const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted])

  const text = `${'1 ' + labelInverted + ' = ' + formattedPrice ?? '-'} ${label}`

  return (
    <LmtStyledPriceContainer
      onClick={(e) => {
        e.stopPropagation() // dont want this click to affect dropdowns / hovers
        flipPrice()
      }}
      title={text}
    >
      <ThemedText.LabelSmall fontSize={labelFontSize} fontWeight={400}>
        {text}
      </ThemedText.LabelSmall>{' '}
      {usdPrice && (
        <ThemedText.DeprecatedDarkGray fontSize={valueFontSize}>
          <Trans>({formatNumber(usdPrice, NumberType.FiatTokenPrice)})</Trans>
        </ThemedText.DeprecatedDarkGray>
      )}
    </LmtStyledPriceContainer>
  )
}
