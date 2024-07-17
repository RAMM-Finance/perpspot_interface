import { Trans } from '@lingui/macro'
import { Currency } from '@uniswap/sdk-core'
import { Position } from '@uniswap/v3-sdk'
import RangeBadge from 'components/Badge/RangeBadge'
import { FiatValue } from 'components/BaseSwapPanel/FiatValue'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { Break } from 'components/earn/styled'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import RateToggle from 'components/RateToggle'
import { RowBetween, RowEnd, RowFixed } from 'components/Row'
import JSBI from 'jsbi'
import { DarkCardOutline } from 'pages/LP/PositionPage'
import { ReactNode, useCallback, useState } from 'react'
import { Bound } from 'state/mint/v3/actions'
import { useTheme } from 'styled-components/macro'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatTickPrice } from 'utils/formatTickPrice'
import { LmtLpPosition } from 'utils/lmtSDK/LpPosition'
import { unwrappedToken } from 'utils/unwrappedToken'

const PositionPreviewWrapper = styled.div``
export const PositionPreview = ({
  position,
  title,
  inRange,
  baseCurrencyDefault,
  ticksAtLimit,
  fiatA,
  fiatB,
}: {
  position: Position | LmtLpPosition
  title?: ReactNode
  inRange: boolean
  baseCurrencyDefault?: Currency | undefined
  ticksAtLimit: { [bound: string]: boolean | undefined }
  fiatA?: { data?: number; isLoading: boolean }
  fiatB?: { data?: number; isLoading: boolean }
}) => {
  const theme = useTheme()

  const currency0 = unwrappedToken(position.pool.token0)
  const currency1 = unwrappedToken(position.pool.token1)

  // track which currency should be base
  const [baseCurrency, setBaseCurrency] = useState(
    baseCurrencyDefault
      ? baseCurrencyDefault === currency0
        ? currency0
        : baseCurrencyDefault === currency1
        ? currency1
        : currency0
      : currency0
  )

  const sorted = baseCurrency === currency0
  const quoteCurrency = sorted ? currency1 : currency0

  const price = sorted ? position.pool.priceOf(position.pool.token0) : position.pool.priceOf(position.pool.token1)

  const priceLower = sorted ? position.token0PriceLower : position.token0PriceUpper.invert()
  const priceUpper = sorted ? position.token0PriceUpper : position.token0PriceLower.invert()

  const handleRateChange = useCallback(() => {
    setBaseCurrency(quoteCurrency)
  }, [quoteCurrency])

  const removed = position?.liquidity && JSBI.equal(position?.liquidity, JSBI.BigInt(0))

  return (
    <AutoColumn gap="md" style={{ marginTop: '0.5rem', padding: '2rem' }}>
      <RowBetween style={{ marginBottom: '0.5rem' }}>
        <RowFixed>
          <DoubleCurrencyLogo
            currency0={currency0 ?? undefined}
            currency1={currency1 ?? undefined}
            size={14}
            margin={true}
          />
          <ThemedText.DeprecatedLabel ml="8px" fontSize="14px">
            {currency0?.symbol} / {currency1?.symbol}
          </ThemedText.DeprecatedLabel>
        </RowFixed>
        <RangeBadge removed={removed} inRange={inRange} />
      </RowBetween>

      <DarkCardOutline>
        <AutoColumn gap="md">
          <RowBetween>
            <RowFixed>
              <CurrencyLogo size="15px" currency={currency0} />
              <ThemedText.BodySmall ml="6px" fontWeight={600}>
                {currency0?.symbol}
              </ThemedText.BodySmall>
            </RowFixed>
            <RowEnd gap="15px">
              <ThemedText.BodySmall color="textSecondary">{position.amount0.toSignificant(4)}</ThemedText.BodySmall>
              <FiatValue parenthesis={true} fiatValue={fiatA} />
            </RowEnd>
          </RowBetween>
          <Break />
          <RowBetween>
            <RowFixed>
              <CurrencyLogo size="15px" currency={currency1} />
              <ThemedText.BodySmall ml="6px" fontWeight={600}>
                {currency1?.symbol}
              </ThemedText.BodySmall>
            </RowFixed>
            <RowEnd gap="15px">
              <ThemedText.BodySmall color="textSecondary">{position.amount1.toSignificant(4)}</ThemedText.BodySmall>
              <FiatValue parenthesis={true} fiatValue={fiatB} />
            </RowEnd>
          </RowBetween>
          {/*<Break />*/}
          {/*<RowBetween>
            <ThemedText.DeprecatedLabel>
              <Trans>Fee Tier</Trans>
            </ThemedText.DeprecatedLabel>
            <ThemedText.DeprecatedLabel>
              <Trans>{position?.pool?.fee / 10000}%</Trans>
            </ThemedText.DeprecatedLabel>
          </RowBetween>*/}
        </AutoColumn>
      </DarkCardOutline>
      <RowBetween>
        {title ? <ThemedText.DeprecatedMain>{title}</ThemedText.DeprecatedMain> : <div />}
        <RateToggle
          currencyA={sorted ? currency0 : currency1}
          currencyB={sorted ? currency1 : currency0}
          handleRateToggle={handleRateChange}
        />
      </RowBetween>

      <DarkCardOutline padding="12px ">
        <AutoColumn gap="4px" justify="center">
          <ThemedText.BodySmall>
            <Trans>Current Price</Trans>
          </ThemedText.BodySmall>
          <ThemedText.DeprecatedMediumHeader fontSize="16px">{`${price.toSignificant(
            5
          )} `}</ThemedText.DeprecatedMediumHeader>
          <ThemedText.DeprecatedMain textAlign="center" fontSize="12px">
            <Trans>
              {quoteCurrency.symbol} per {baseCurrency.symbol}
            </Trans>
          </ThemedText.DeprecatedMain>
        </AutoColumn>
      </DarkCardOutline>

      <AutoColumn gap="md">
        <RowBetween>
          <DarkCardOutline width="48%" padding="8px">
            <AutoColumn gap="4px" justify="center">
              <ThemedText.BodySmall>
                <Trans>Min Price</Trans>
              </ThemedText.BodySmall>
              <ThemedText.BodySecondary textAlign="center">
                {formatTickPrice({
                  price: priceLower,
                  atLimit: ticksAtLimit,
                  direction: Bound.LOWER,
                })}
              </ThemedText.BodySecondary>
              <ThemedText.BodySmall color="textSecondary">
                <Trans>
                  {quoteCurrency.symbol} per {baseCurrency.symbol}
                </Trans>
              </ThemedText.BodySmall>
              <ThemedText.DeprecatedSmall textAlign="center" color={theme.textTertiary} style={{ marginTop: '4px' }}>
                <Trans>Your position will be 100% composed of {baseCurrency?.symbol} at this price</Trans>
              </ThemedText.DeprecatedSmall>
            </AutoColumn>
          </DarkCardOutline>

          <DarkCardOutline width="48%" padding="8px">
            <AutoColumn gap="4px" justify="center">
              <ThemedText.BodySmall>
                <Trans>Max Price</Trans>
              </ThemedText.BodySmall>
              <ThemedText.BodySecondary textAlign="center">
                {formatTickPrice({
                  price: priceUpper,
                  atLimit: ticksAtLimit,
                  direction: Bound.UPPER,
                })}
              </ThemedText.BodySecondary>
              <ThemedText.BodySmall color="textSecondary">
                <Trans>
                  {quoteCurrency.symbol} per {baseCurrency.symbol}
                </Trans>
              </ThemedText.BodySmall>
              <ThemedText.DeprecatedSmall textAlign="center" color={theme.textTertiary} style={{ marginTop: '4px' }}>
                <Trans>Your position will be 100% composed of {quoteCurrency?.symbol} at this price</Trans>
              </ThemedText.DeprecatedSmall>
            </AutoColumn>
          </DarkCardOutline>
        </RowBetween>
        {/*<LightCard padding="12px ">
          <AutoColumn gap="4px" justify="center">
            <ThemedText.DeprecatedMain fontSize="12px">
              <Trans>Current price</Trans>
            </ThemedText.DeprecatedMain>
            <ThemedText.DeprecatedMediumHeader>{`${price.toSignificant(5)} `}</ThemedText.DeprecatedMediumHeader>
            <ThemedText.DeprecatedMain textAlign="center" fontSize="12px">
              <Trans>
                {quoteCurrency.symbol} per {baseCurrency.symbol}
              </Trans>
            </ThemedText.DeprecatedMain>
          </AutoColumn>
        </LightCard> */}
      </AutoColumn>
    </AutoColumn>
  )
}
