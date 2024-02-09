import { Trans } from '@lingui/macro'
// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import { formatNumber, formatPriceImpact, NumberType } from '@uniswap/conedison/format'
import { Percent } from '@uniswap/sdk-core'
import { LoadingBubble } from 'components/Tokens/loading'
import { MouseoverTooltip } from 'components/Tooltip'
import { useMemo } from 'react'
import styled, { useTheme } from 'styled-components/macro'

import { ThemedText } from '../../theme'
import { warningSeverity } from '../../utils/prices'

const FiatLoadingBubble = styled(LoadingBubble)`
  border-radius: 4px;
  width: 4rem;
  height: 1rem;
`

export function FiatValue({
  fiatValue,
  priceImpact,
  height,
  llp,
}: {
  fiatValue?: { data?: number; isLoading: boolean }
  priceImpact?: Percent
  height?: string
  llp?: boolean
}) {
  const theme = useTheme()
  const priceImpactColor = useMemo(() => {
    if (!priceImpact) return undefined
    if (priceImpact.lessThan('0')) return theme.accentSuccess
    const severity = warningSeverity(priceImpact)
    if (severity < 1) return theme.textTertiary
    if (severity < 3) return theme.deprecated_yellow1
    return theme.accentFailure
  }, [priceImpact, theme.accentSuccess, theme.accentFailure, theme.textTertiary, theme.deprecated_yellow1])

  return (
    <ThemedText.DeprecatedBody fontSize={12} color={theme.textSecondary}>
      {fiatValue?.isLoading ? (
        <FiatLoadingBubble height={height} />
      ) : (
        <div>
          {fiatValue?.data ? formatNumber(fiatValue.data, NumberType.FiatTokenPrice) : undefined}
          {priceImpact && (
            <span style={{ color: priceImpactColor }}>
              {' '}
              <MouseoverTooltip
                text={
                  llp
                    ? t`1% fees apply when moving away from target weight`
                    : t`Slippage+total fees relative to total trade input`
                }
              >
                (<Trans>{formatPriceImpact(priceImpact)}</Trans>)
              </MouseoverTooltip>
            </span>
          )}
        </div>
      )}
    </ThemedText.DeprecatedBody>
  )
}
