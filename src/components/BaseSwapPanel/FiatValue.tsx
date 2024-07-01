// eslint-disable-next-line no-restricted-imports
import { formatNumber, NumberType } from '@uniswap/conedison/format'
import { Percent } from '@uniswap/sdk-core'
import { LoadingBubble } from 'components/Tokens/loading'
import styled, { useTheme } from 'styled-components/macro'

import { ThemedText } from '../../theme'

const FiatLoadingBubble = styled(LoadingBubble)`
  border-radius: 4px;
  width: 4rem;
  height: 1rem;
`

export function FiatValue({
  fiatValue,
  // priceImpact,
  height,
}: {
  fiatValue?: { data?: number; isLoading: boolean }
  priceImpact?: Percent
  height?: string
}) {
  const theme = useTheme()

  return (
    <ThemedText.DeprecatedBody fontSize={12} color={theme.textSecondary}>
      {fiatValue?.isLoading ? (
        <FiatLoadingBubble height={height} />
      ) : (
        <div>{fiatValue?.data ? formatNumber(fiatValue.data, NumberType.FiatTokenPrice) : undefined}</div>
      )}
    </ThemedText.DeprecatedBody>
  )
}
