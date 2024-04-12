import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { Price, Token } from '@uniswap/sdk-core'
import { Position } from '@uniswap/v3-sdk'
import RangeBadge from 'components/Badge/RangeBadge'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import HoverInlineText from 'components/HoverInlineText'
import Loader from 'components/Icons/LoadingSpinner'
import { useToken } from 'hooks/Tokens'
import useIsTickAtLimit from 'hooks/useIsTickAtLimit'
import { useRateAndUtil } from 'hooks/useLMTV2Positions'
import { usePool } from 'hooks/usePools'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { MouseEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'
import { HideSmall, MEDIA_WIDTHS, ThemedText } from 'theme'
import { unwrappedToken } from 'utils/unwrappedToken'
import { hasURL } from 'utils/urlChecks'

const LinkRow = styled(Link)`
  align-items: center;
  /* display: flex; */
  /* flex-direction: column; */
  /* justify-content: space-between; */
  /* display: grid; */
  /* grid-template-columns: 0.2fr 1fr 0.7fr 0.3fr; */
  cursor: pointer;
  user-select: none;
  color: ${({ theme }) => theme.textPrimary};
  padding: 16px;
  text-decoration: none;
  font-weight: 500;
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-top: solid 1px ${({ theme }) => theme.backgroundOutline};
  text-align: center;

  & > div:not(:first-child) {
    text-align: center;
  }
  :hover {
    background-color: ${({ theme }) => theme.hoverDefault};
  }

  /* @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToSmall}px) {
      flex-direction: row; 
  } */

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex-direction: column;
    row-gap: 8px;
  `};
`

const DataLineItem = styled.div`
  font-size: 14px;
`

const RangeLineItem = styled(DataLineItem)`
  display: flex;
  /* grid-template-columns: 300px 300px 150px 200px; */
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
  width: 100%;
  /* flex-wrap: wrap; */
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    justify-content: space-around;
  `};
`

const DoubleArrow = styled.span`
  font-size: 22px;
  margin: 0 6px;
  color: ${({ theme }) => theme.textSecondary};
`

const RangeText = styled(ThemedText.Caption)<{ color?: string }>`
  font-size: 14px !important;
  word-break: break-word;
  padding: 0.25rem 0.25rem;
  border-radius: 8px;
  color: ${({ color, theme }) => (color ? color : theme.accentTextLightSecondary)};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
      padding: 0.25rem 0;
  `};
`

const FeeTierText = styled(ThemedText.UtilityBadge)`
  font-size: 10px !important;
  margin-left: 14px !important;
`
const ExtentsText = styled(ThemedText.CellName)`
  color: ${({ theme }) => theme.textTertiary};
  display: inline-block;
  line-height: 16px;
  margin-right: 4px !important;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    margin-left: 0 !important;
 `};
`

const PrimaryPositionIdData = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  > * {
    margin-right: 8px;
  }
  margin-right: 6px;
`

interface PositionListItemProps {
  token0: string
  token1: string
  tokenId: BigNumber
  fee: number
  liquidity: BigNumber
  tickLower: number
  tickUpper: number
}

export function getPriceOrderingFromPositionForUI(position?: Position): {
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  quote?: Token
  base?: Token
} {
  if (!position) {
    return {}
  }

  const token0 = position.amount0.currency
  const token1 = position.amount1.currency

  // if token0 is a dollar-stable asset, set it as the quote token
  // const stables = [DAI, USDC_MAINNET, USDT]
  // if (stables.some((stable) => stable.equals(token0))) {
  //   return {
  //     priceLower: position.token0PriceUpper.invert(),
  //     priceUpper: position.token0PriceLower.invert(),
  //     quote: token0,
  //     base: token1,
  //   }
  // }

  // if token1 is an ETH-/BTC-stable asset, set it as the base token
  // const bases = [...Object.values(WRAPPED_NATIVE_CURRENCY), WBTC]
  // if (bases.some((base) => base && base.equals(token1))) {
  //   return {
  //     priceLower: position.token0PriceUpper.invert(),
  //     priceUpper: position.token0PriceLower.invert(),
  //     quote: token0,
  //     base: token1,
  //   }
  // }

  // if both prices are below 1, invert
  if (position.token0PriceUpper.lessThan(1)) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1,
    }
  }

  // otherwise, just return the default
  return {
    priceLower: position.token0PriceLower,
    priceUpper: position.token0PriceUpper,
    quote: token1,
    base: token0,
  }
}

export default function PositionListItem({
  token0: token0Address,
  token1: token1Address,
  tokenId,
  fee: feeAmount,
  liquidity,
  tickLower,
  tickUpper,
}: PositionListItemProps) {
  const [priceLowerValue, setPriceLower] = useState<Price<Token, Token> | undefined>()
  const [priceUpperValue, setPriceUpper] = useState<Price<Token, Token> | undefined>()
  const [isInverted, setIsInverted] = useState(false)

  function handleInvertClick(event: MouseEvent<HTMLSpanElement>) {
    event.stopPropagation()
    event.preventDefault()

    if (priceLower && priceUpper) {
      const invertedPriceLower = priceUpper.invert()
      const invertedPriceUpper = priceLower.invert()

      if (!isInverted) {
        setPriceLower(invertedPriceLower)
        setPriceUpper(invertedPriceUpper)
      } else {
        setPriceLower(priceLower)
        setPriceUpper(priceUpper)
      }
      setIsInverted(!isInverted)
    }
  }

  const token0 = useToken(token0Address)
  const token1 = useToken(token1Address)

  const currency0 = token0 ? unwrappedToken(token0) : undefined
  const currency1 = token1 ? unwrappedToken(token1) : undefined

  // construct Position from details returned
  const [, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined, feeAmount)

  const position = useMemo(() => {
    if (pool) {
      return new Position({ pool, liquidity: liquidity.toString(), tickLower, tickUpper })
    }
    return undefined
  }, [liquidity, pool, tickLower, tickUpper])

  const tickAtLimit = useIsTickAtLimit(feeAmount, tickLower, tickUpper)

  // prices
  const { priceLower, priceUpper, quote, base } = getPriceOrderingFromPositionForUI(position)

  const currencyQuote = quote && unwrappedToken(quote)
  const currencyBase = base && unwrappedToken(base)

  // check if price is within range
  const outOfRange: boolean = pool ? pool.tickCurrent < tickLower || pool.tickCurrent >= tickUpper : false

  const positionSummaryLink = '/pools/' + tokenId

  const removed = liquidity?.eq(0)

  const shouldHidePosition = hasURL(token0?.symbol) || hasURL(token1?.symbol)

  const { result: data, loading: rateLoading } = useRateAndUtil(
    pool?.token0.address,
    pool?.token1.address,
    pool?.fee,
    position?.tickLower,
    position?.tickUpper
  )
  useEffect(() => {
    if (priceLower && priceUpper) {
      setPriceLower(priceLower)
      setPriceUpper(priceUpper)
    }
  }, [position])

  if (shouldHidePosition) {
    return null
  }

  // const priceLowerValue = priceLower?.toSignificant(10);
  // const priceUpperValue  = priceUpper?.toSignificant(10);
  return (
    <LinkRow to={positionSummaryLink}>
      {/* <RowBetween> */}
      <PrimaryPositionIdData>
        <DoubleCurrencyLogo currency0={currencyBase} currency1={currencyQuote} size={18} margin />
        <ThemedText.SubHeader color="textSecondary">
          {currencyQuote?.symbol}&nbsp;/&nbsp;{currencyBase?.symbol}
        </ThemedText.SubHeader>
        {/* <FeeTierText>
            <Trans>{new Percent(feeAmount, 1_000_000).toSignificant()}%</Trans>
          </FeeTierText> */}
      </PrimaryPositionIdData>
      {priceLower && priceUpper ? (
        <RangeLineItem>
          <RangeText>
            <ExtentsText>
              <Trans>Min: </Trans>
            </ExtentsText>
            <Trans>
              <span>
                {/* {formatTickPrice({
                  price: priceLower,
                  atLimit: tickAtLimit,
                  direction: Bound.LOWER,
                })}{' '} */}
                {priceLowerValue?.toSignificant(10)}
              </span>
              <HoverInlineText text={isInverted ? currencyQuote?.symbol : currencyBase?.symbol} /> per{' '}
              <HoverInlineText text={isInverted ? currencyBase?.symbol : currencyQuote?.symbol ?? ''} />
            </Trans>
          </RangeText>{' '}
          {/* <LargeShow> */}
          <DoubleArrow>↔</DoubleArrow> {/* </LargeShow> */}
          {/* <SmallOnly>
            <DoubleArrow>↔</DoubleArrow>{' '}
          </SmallOnly> */}
          <RangeText>
            <ExtentsText>
              <Trans>Max: </Trans>
            </ExtentsText>
            <Trans>
              <span>
                {/* {formatTickPrice({
                  price: priceUpper,
                  atLimit: tickAtLimit,
                  direction: Bound.UPPER,
                })}{' '} */}
                {priceUpperValue?.toSignificant(10)}
              </span>
              <HoverInlineText text={isInverted ? currencyQuote?.symbol : currencyBase?.symbol} /> per{' '}
              <HoverInlineText maxCharacters={10} text={isInverted ? currencyBase?.symbol : currencyQuote?.symbol} />
            </Trans>
          </RangeText>
        </RangeLineItem>
      ) : (
        <Loader />
      )}
      {priceLower && priceUpper ? (
        <>
          {/*<RangeLineItem>
            Accumulated Fees:
            <RangeText>
              {/*<ExtentsText>
              <Trans>Min: </Trans>
            </ExtentsText> 
              <Trans>
                <span>-</span>
                <HoverInlineText text={currencyQuote?.symbol} /> +
              </Trans>
              <Trans>
                <span>-</span>
                <HoverInlineText text={currencyBase?.symbol} />
              </Trans>
            </RangeText>
          </RangeLineItem>*/}
          <RangeLineItem>
            <HideSmall>Estimated APR:</HideSmall>
            {/* <SmallOnly>
              <DoubleArrow>↔</DoubleArrow>{' '}
            </SmallOnly> */}
            <RangeText>
              {/*<ExtentsText>
                   <Trans>Max:</Trans>
                 </ExtentsText> */}
              <Trans>
                {/* <TextWithLoadingPlaceholder syncing={rateLoading}>

                </TextWithLoadingPlaceholder> */}
                <span>{formatBNToString(data?.apr, NumberType.TokenNonTx) + '%' + '+ swap fees'}</span>
                {/*<HoverInlineText text={currencyBase?.symbol} /> per{' '}
                   <HoverInlineText maxCharacters={10} text={currencyQuote?.symbol} /> */}
              </Trans>
            </RangeText>
          </RangeLineItem>
        </>
      ) : (
        <Loader />
      )}
      {/* </RowBetween> */}
      <RangeBadge removed={removed} inRange={!outOfRange} />
    </LinkRow>
  )
}
