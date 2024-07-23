import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { Price, Token } from '@uniswap/sdk-core'
import { Position } from '@uniswap/v3-sdk'
import RangeBadge from 'components/Badge/RangeBadge'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import HoverInlineText from 'components/HoverInlineText'
import Loader from 'components/Icons/LoadingSpinner'
import { LoadingBubble } from 'components/Tokens/loading'
import { MouseoverTooltip } from 'components/Tooltip'
import { useToken } from 'hooks/Tokens'
import { useRateAndUtil } from 'hooks/useLMTV2Positions'
import { useEstimatedAPR, usePool, usePoolV2 } from 'hooks/usePools'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'
import { HideSmall, MEDIA_WIDTHS, ThemedText } from 'theme'
import { unwrappedToken } from 'utils/unwrappedToken'
import { hasURL } from 'utils/urlChecks'
import { useChainId } from 'wagmi'

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

const DoubleArrow = styled.button`
  font-size: 22px;
  margin: 0 6px;
  color: ${({ theme }) => theme.textSecondary};
  border: none;
  background: transparent;
  cursor: pointer;
  &:focus {
    outline: none;
  }
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

export interface V2PositionListItemProps {
  token0: string
  token1: string
  tokenId: BigNumber
  fee: number
  liquidity: BigNumber

  tickLower: number
  tickUpper: number
  usdPriceData?: {
    [token: string]: {
      usdPrice: number
    }
  }
  itemLink: string
}

export function getPriceOrderingFromPositionForUI(position?: Position): {
  // price?: Price<Token, Token>
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
  tickLower,
  liquidity,
  tickUpper,
  usdPriceData,
  itemLink,
}: V2PositionListItemProps) {
  // const [priceValue, setPrice] = useState<number | undefined>()

  const [isInverted, setIsInverted] = useState(false)

  const token0 = useToken(token0Address)
  const token1 = useToken(token1Address)

  const currency0 = token0 ? unwrappedToken(token0) : undefined
  const currency1 = token1 ? unwrappedToken(token1) : undefined

  // construct Position from details returned
  const [, pool, tickSpacing] = usePool(currency0 ?? undefined, currency1 ?? undefined, feeAmount)
  // console.log("USE POOL V1 POOL TICK", pool, tickSpacing)
  const chainId = useChainId()

  const position = useMemo(() => {
    if (pool && tickLower && tickUpper && liquidity) {
      return new Position({ pool, tickLower, tickUpper, liquidity: liquidity.toString() })
    }
    return undefined
  }, [pool, tickLower, tickUpper])

  const token0PriceUSD = useMemo(() => {
    if (token0Address && usdPriceData && usdPriceData[token0Address.toLowerCase()]) {
      return usdPriceData[token0Address.toLowerCase()].usdPrice
    }
    return undefined
  }, [token0Address, usdPriceData])

  const token1PriceUSD = useMemo(() => {
    if (token1Address && usdPriceData && usdPriceData[token1Address.toLowerCase()]) {
      return usdPriceData[token1Address.toLowerCase()].usdPrice
    }
    return undefined
  }, [token1Address, usdPriceData])

  const { depositAmount } = useMemo(() => {
    if (position && token0PriceUSD && token1PriceUSD) {
      // position.pool.token0.
      const amount0 = position.amount0
      const amount1 = position.amount1

      const deposit0 = Number(amount0.toSignificant(10)) * token0PriceUSD
      const deposit1 = Number(amount1.toSignificant(10)) * token1PriceUSD

      return {
        depositAmount: deposit0 + deposit1,
      }
    } else
      return {
        depositAmount: null,
      }
  }, [position, token0PriceUSD, token1PriceUSD])

  // prices
  const { priceLower, priceUpper, quote, base } = getPriceOrderingFromPositionForUI(position)

  const currencyQuote = quote && unwrappedToken(quote)
  const currencyBase = base && unwrappedToken(base)

  const priceValue = useMemo(() => {
    if (
      chainId &&
      currencyBase?.wrapped?.address &&
      currencyQuote?.wrapped?.address &&
      usdPriceData &&
      usdPriceData[currencyBase.wrapped.address.toLowerCase()] &&
      usdPriceData[currencyQuote.wrapped.address.toLowerCase()]
    ) {
      const currencyBasePriceUSD = usdPriceData[currencyQuote.wrapped.address.toLowerCase()].usdPrice
      const currencyQuotePriceUSD = usdPriceData[currencyBase.wrapped.address.toLowerCase()].usdPrice

      return currencyBasePriceUSD / currencyQuotePriceUSD
    }
    return undefined
  }, [currencyBase, currencyQuote, chainId, usdPriceData])

  // check if price is within range
  const outOfRange: boolean = pool ? pool.tickCurrent < tickLower || pool.tickCurrent >= tickUpper : false

  const removed = liquidity?.eq(0)

  const shouldHidePosition = hasURL(token0?.symbol) || hasURL(token1?.symbol)

  const { result: data } = useRateAndUtil(
    pool?.token0.address,
    pool?.token1.address,
    pool?.fee,
    position?.tickLower,
    position?.tickUpper
  )

  //   const [priceLowerValue, setPriceLower] = useState<Price<Token, Token> | undefined>()
  // const [priceUpperValue, setPriceUpper] = useState<Price<Token, Token> | undefined>()
  const priceLowerValue = isInverted ? priceUpper?.invert() : priceLower
  const priceUpperValue = isInverted ? priceLower?.invert() : priceUpper

  // useEffect(() => {
  //   if (priceLower && priceUpper) {
  //     const invertedPriceLower = priceUpper.invert()
  //     const invertedPriceUpper = priceLower.invert()

  //     if (isInverted) {
  //       setPriceLower(invertedPriceLower)
  //       setPriceUpper(invertedPriceUpper)
  //     } else {
  //       setPriceLower(priceLower)
  //       setPriceUpper(priceUpper)
  //     }
  //   }
  // }, [position, isInverted])

  if (shouldHidePosition) {
    return null
  }

  const handleInvertClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation()
      event.preventDefault()

      if (priceLower && priceUpper) {
        // const invertedPriceLower = priceUpper.invert()
        // const invertedPriceUpper = priceLower.invert()

        // if (!isInverted) {
        //   // setPrice(invertedPrice)
        //   setPriceLower(invertedPriceLower)
        //   setPriceUpper(invertedPriceUpper)
        // } else {
        //   // setPrice(price)
        //   setPriceLower(priceLower)
        //   setPriceUpper(priceUpper)
        // }
        setIsInverted(!isInverted)
      }
    },
    [priceLower, priceUpper, isInverted, setIsInverted]
  )
  // console.log("currencyBase", currencyBase)
  // console.log("currencyQuote", currencyQuote)
  // console.log("pool", pool)
  // console.log("tickSpacing", tickSpacing)
  // console.log("priceValue", priceValue)
  // console.log("depositAmount", depositAmount ?? 0)
  // console.log("priceLower", priceLower && priceValue ? Number(priceLower.toSignificant(10)) / priceValue : 0)
  // console.log("priceUpper", priceUpper && priceValue ? Number(priceUpper.toSignificant(10)) / priceValue : 0)
  // console.log("usdPriceData", usdPriceData)
  // console.log("--------------")

  const { apr: estimatedAPR } = useEstimatedAPR(
    currencyBase,
    currencyQuote,
    pool,
    tickSpacing,
    priceValue,
    depositAmount ?? 0,
    priceLower && priceValue ? Number(priceLower.toSignificant(10)) / priceValue : 0,
    priceUpper && priceValue ? Number(priceUpper.toSignificant(10)) / priceValue : 0,
    usdPriceData
  )
  // console.log("APR", estimatedAPR)
  return (
    <LinkRow to={itemLink}>
      {currencyQuote?.symbol && currencyBase?.symbol && priceLower && priceUpper ? (
        <>
          <PrimaryPositionIdData>
            <DoubleCurrencyLogo currency0={currencyBase} currency1={currencyQuote} size={18} margin />
            <ThemedText.SubHeader color="textSecondary">
              {currencyQuote?.symbol}/{currencyBase?.symbol}
            </ThemedText.SubHeader>
          </PrimaryPositionIdData>
          <RangeLineItem>
            <RangeText>
              <ExtentsText>
                <Trans>Min: </Trans>
              </ExtentsText>
              <Trans>
                <span>{priceLowerValue?.toSignificant(10)}</span>{' '}
                <HoverInlineText text={isInverted ? currencyBase?.symbol : currencyQuote?.symbol} /> per{' '}
                <HoverInlineText text={isInverted ? currencyQuote?.symbol : currencyBase?.symbol ?? ''} />
              </Trans>
            </RangeText>{' '}
            <MouseoverTooltip text={<Trans>Inverted</Trans>}>
              <DoubleArrow onClick={(e) => handleInvertClick(e)}>↔</DoubleArrow>{' '}
            </MouseoverTooltip>
            <RangeText>
              <ExtentsText>
                <Trans>Max: </Trans>
              </ExtentsText>
              <Trans>
                <span>{priceUpperValue?.toSignificant(10)}</span>{' '}
                <HoverInlineText text={isInverted ? currencyBase?.symbol : currencyQuote?.symbol} /> per{' '}
                <HoverInlineText maxCharacters={10} text={isInverted ? currencyQuote?.symbol : currencyBase?.symbol} />
              </Trans>
            </RangeText>
          </RangeLineItem>
          <RangeLineItem>
            <HideSmall>Estimated APR:</HideSmall>
            {data?.apr !== undefined && estimatedAPR !== undefined ? (
              <RangeText>
                <Trans>
                  <span>{formatBNToString(data?.apr.plus(estimatedAPR), NumberType.TokenNonTx) + '%'}</span>
                </Trans>
              </RangeText>
            ) : (
              <LoadingBubble width="60px" height="18px" />
            )}
          </RangeLineItem>
        </>
      ) : (
        <Loader />
      )}
      <RangeBadge removed={removed} inRange={!outOfRange} />
    </LinkRow>
  )
}
