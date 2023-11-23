import { Currency } from '@uniswap/sdk-core'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { ToggleElement, ToggleWrapper } from 'components/Toggle/MultiToggle'

// the order of displayed base currencies from left to right is always in sort order
// currencyA is treated as the preferred base currency
export default function PriceToggle({
  currencyA,
  currencyB,
  handlePriceToggle,
}: {
  currencyA: Currency
  currencyB: Currency
  handlePriceToggle: () => void
}) {
  const tokenA = currencyA?.wrapped
  const tokenB = currencyB?.wrapped

  const isSorted = tokenA && tokenB && tokenA.sortsBefore(tokenB)

  return tokenA && tokenB ? (
    <div style={{ width: 'fit-content', display: 'flex', alignItems: 'center' }} onClick={handlePriceToggle}>
      <ToggleWrapper width="fit-content">
        <ToggleElement isActive={isSorted}>
          <CurrencyLogo currency={isSorted ? currencyA : currencyB} size="15px" />
        </ToggleElement>
        <ToggleElement isActive={!isSorted}>
          <CurrencyLogo currency={isSorted ? currencyB : currencyA} size="15px" />
        </ToggleElement>
      </ToggleWrapper>
    </div>
  ) : null
}
