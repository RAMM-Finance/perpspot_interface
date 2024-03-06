import { Trans } from '@lingui/macro'
import { Currency, Price, Token } from '@uniswap/sdk-core'
import { AutoColumn } from 'components/Column'
import StepCounter from 'components/InputStepCounter/InputStepCounter'
import { RowBetween } from 'components/Row'
import { Bound } from 'state/mint/v3/actions'
import styled from 'styled-components/macro'

// currencyA is the base token
export default function RangeSelector({
  priceLower,
  priceUpper,
  onLeftRangeInput,
  onRightRangeInput,
  getDecrementLower,
  getIncrementLower,
  getDecrementUpper,
  getIncrementUpper,
  currencyA,
  currencyB,
  feeAmount,
  ticksAtLimit,
}: {
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  getDecrementLower: () => string
  getIncrementLower: () => string
  getDecrementUpper: () => string
  getIncrementUpper: () => string
  onLeftRangeInput: (typedValue: string) => void
  onRightRangeInput: (typedValue: string) => void
  currencyA?: Currency | null
  currencyB?: Currency | null
  feeAmount?: number
  ticksAtLimit: { [bound in Bound]?: boolean | undefined }
}) {
  const tokenA = (currencyA ?? undefined)?.wrapped
  const tokenB = (currencyB ?? undefined)?.wrapped
  const isSorted = tokenA && tokenB && tokenA.sortsBefore(tokenB)

  const leftPrice = isSorted ? priceLower : priceUpper?.invert()
  const rightPrice = isSorted ? priceUpper : priceLower?.invert()

  const StepCounterWrapper = styled(RowBetween)`
    @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
    }
  `
  return (
    <AutoColumn gap="md">
      <StepCounterWrapper>
        <StepCounter
          value={ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER] ? '0' : leftPrice?.toSignificant(6) ?? ''}
          onUserInput={onLeftRangeInput}
          width="48%"
          decrement={isSorted ? getDecrementLower : getIncrementUpper}
          increment={isSorted ? getIncrementLower : getDecrementUpper}
          decrementDisabled={ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]}
          incrementDisabled={ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]}
          feeAmount={feeAmount}
          label={leftPrice ? `${currencyB?.symbol}` : '-'}
          title={<Trans>Min Price</Trans>}
          tokenA={currencyA?.symbol}
          tokenB={currencyB?.symbol}
        />
        <StepCounter
          value={ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER] ? '∞' : rightPrice?.toSignificant(6) ?? ''}
          onUserInput={onRightRangeInput}
          width="48%"
          decrement={isSorted ? getDecrementUpper : getIncrementLower}
          increment={isSorted ? getIncrementUpper : getDecrementLower}
          incrementDisabled={ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]}
          decrementDisabled={ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]}
          feeAmount={feeAmount}
          label={rightPrice ? `${currencyB?.symbol}` : '-'}
          tokenA={currencyA?.symbol}
          tokenB={currencyB?.symbol}
          title={<Trans>Max Price</Trans>}
        />
      </StepCounterWrapper>
    </AutoColumn>
  )
}
