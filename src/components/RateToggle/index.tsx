import { Trans } from '@lingui/macro'
import { Currency } from '@uniswap/sdk-core'
import { DarkToggleWrapper, ToggleElement, ToggleWrapper } from 'components/Toggle/MultiToggle'

// the order of displayed base currencies from left to right is always in sort order
// currencyA is treated as the preferred base currency
export default function RateToggle({
  currencyA,
  currencyB,
  handleRateToggle,
}: {
  currencyA: Currency
  currencyB: Currency
  handleRateToggle: () => void
}) {
  const tokenA = currencyA?.wrapped
  const tokenB = currencyB?.wrapped

  const isSorted = tokenA && tokenB && tokenA.sortsBefore(tokenB)

  return tokenA && tokenB ? (
    <div style={{ width: 'fit-content', display: 'flex', alignItems: 'center' }} onClick={handleRateToggle}>
      <ToggleWrapper width="fit-content">
        <ToggleElement isActive={isSorted}>
          <Trans>
            {'Price in '}
            {isSorted ? currencyA.symbol : currencyB.symbol}
          </Trans>
        </ToggleElement>
        <ToggleElement isActive={!isSorted}>
          <Trans>
            {'Price in '}
            {isSorted ? currencyB.symbol : currencyA.symbol}
          </Trans>
        </ToggleElement>
      </ToggleWrapper>
    </div>
  ) : null
}

export function DarkRateToggle({
  currencyA,
  currencyB,
  handleRateToggle,
}: {
  currencyA: Currency
  currencyB: Currency
  handleRateToggle: () => void
}) {
  const tokenA = currencyA?.wrapped
  const tokenB = currencyB?.wrapped

  const isSorted = tokenA && tokenB && tokenA.sortsBefore(tokenB)

  return tokenA && tokenB ? (
    <div style={{ width: 'fit-content', display: 'flex', alignItems: 'center' }} onClick={handleRateToggle}>
      <DarkToggleWrapper width="fit-content">
        <ToggleElement isActive={!isSorted}>
          <Trans>
            {'Price in '}
            {isSorted ? currencyA.symbol : currencyB.symbol}
          </Trans>
        </ToggleElement>
        <ToggleElement isActive={isSorted}>
          <Trans>
            {'Price in '}
            {isSorted ? currencyB.symbol : currencyA.symbol}
          </Trans>
        </ToggleElement>
      </DarkToggleWrapper>
    </div>
  ) : null
}
