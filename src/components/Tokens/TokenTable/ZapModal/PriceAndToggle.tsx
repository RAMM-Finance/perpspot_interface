import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { Currency, Price, Token } from '@uniswap/sdk-core'
import { BigNumber as BN } from 'bignumber.js'
import Column from 'components/Column'
import HoverInlineText from 'components/HoverInlineText'
import RateToggle from 'components/RateToggle'
import Row from 'components/Row'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { PresetsButtons } from './ZapModal'

const PriceAndToggleWrapper = styled(Column)`
  flex-wrap: wrap;
`

const MobileToggleWrapper = styled(Column)`
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    display: none;
  }
`

enum RANGE {
  SMALL,
  MEDIUM,
  LARGE,
  AUTO,
}

const rangeValues = {
  [RANGE.SMALL]: { min: 0.9, max: 1.1 },
  [RANGE.MEDIUM]: { min: 0.8, max: 1.2 },
  [RANGE.LARGE]: { min: 0.7, max: 1.3 },
  [RANGE.AUTO]: { min: 0, max: 0 },
}

interface IPriceAndToggleProps {
  baseCurrency: Currency | null | undefined
  quoteCurrency: Currency | null | undefined
  baseIsToken0: boolean
  token0Price: BN | undefined
  token0: Currency | undefined | null
  token1: Currency | undefined | null
  noLiquidity: boolean
  invertPrice: boolean
  lowerPrice: Price<Token, Token> | undefined
  upperPrice: Price<Token, Token> | undefined
  range: RANGE
  setBaseIsToken0: React.Dispatch<React.SetStateAction<boolean>>
  setLeftRangeTypedValue: React.Dispatch<React.SetStateAction<string | boolean>>
  setRightRangeTypedValue: React.Dispatch<React.SetStateAction<string | boolean>>
  handleSetRecommendedRange: (leftRange: any, rightRange: any, _range: RANGE) => void
}

const PriceAndToggle = ({
  baseCurrency,
  quoteCurrency,
  baseIsToken0,
  token0Price,
  token0,
  token1,
  noLiquidity,
  invertPrice,
  lowerPrice,
  upperPrice,
  range,
  setBaseIsToken0,
  setLeftRangeTypedValue,
  setRightRangeTypedValue,
  handleSetRecommendedRange,
}: IPriceAndToggleProps) => {
  return (
    <MobileToggleWrapper gap="sm">
      <PriceAndToggleWrapper>
        {baseCurrency && quoteCurrency ? (
          <RateToggle
            currencyA={baseCurrency}
            currencyB={quoteCurrency}
            handleRateToggle={() => {
              setBaseIsToken0(!baseIsToken0)
              setLeftRangeTypedValue((invertPrice ? lowerPrice : upperPrice?.invert())?.toSignificant(6) ?? '')
              setRightRangeTypedValue((invertPrice ? upperPrice : lowerPrice?.invert())?.toSignificant(6) ?? '')
            }}
          />
        ) : null}
        <ThemedText.BodySecondary marginTop="12px" marginBottom="8px">
          <Trans>Select Price Range</Trans>
        </ThemedText.BodySecondary>
        {token0Price && token0 && token1 && !noLiquidity && (
          <Trans>
            <div
              style={{
                display: 'flex',
                justifyContent: 'start',
                alignItems: 'end',
                gap: '5px',
              }}
            >
              <ThemedText.DeprecatedMain fontWeight={500} textAlign="start" fontSize={14} color="text">
                Current Price:
              </ThemedText.DeprecatedMain>
              <ThemedText.DeprecatedBody fontWeight={500} textAlign="start" fontSize={14} color="textSecondary">
                <HoverInlineText
                  maxCharacters={20}
                  text={
                    baseIsToken0
                      ? formatBNToString(token0Price, NumberType.FiatTokenPrice, true)
                      : formatBNToString(new BN(1).div(token0Price), NumberType.FiatTokenPrice, true)
                  }
                />
              </ThemedText.DeprecatedBody>
              <ThemedText.DeprecatedBody textAlign="start" color="textSecondary" fontSize={11}>
                {quoteCurrency?.symbol} per {baseCurrency?.symbol}
              </ThemedText.DeprecatedBody>
            </div>
          </Trans>
        )}
      </PriceAndToggleWrapper>
      <Row gap="15px" marginBottom="15px">
        <PresetsButtons
          btnName="-10% ~ +10% narrow"
          onSetRecommendedRange={() =>
            handleSetRecommendedRange(rangeValues[RANGE.SMALL].min, rangeValues[RANGE.SMALL].max, RANGE.SMALL)
          }
          active={range === RANGE.SMALL}
        />
        <PresetsButtons
          btnName="-20% ~ +20% middle"
          onSetRecommendedRange={() =>
            handleSetRecommendedRange(rangeValues[RANGE.MEDIUM].min, rangeValues[RANGE.MEDIUM].max, RANGE.MEDIUM)
          }
          active={range === RANGE.MEDIUM}
        />
        <PresetsButtons
          btnName="-30% ~ +30% wide"
          onSetRecommendedRange={() =>
            handleSetRecommendedRange(rangeValues[RANGE.LARGE].min, rangeValues[RANGE.LARGE].max, RANGE.LARGE)
          }
          active={range === RANGE.LARGE}
        />
      </Row>
    </MobileToggleWrapper>
  )
}

export default PriceAndToggle
