import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, SharedEventName } from '@uniswap/analytics-events'
import { formatNumber, NumberType } from '@uniswap/conedison/format'
import { Position } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import Row from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { EmptyWalletModule } from 'nft/components/profile/view/EmptyWalletContent'
import React, { useCallback, useMemo, useState, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components/macro'
import { HideSmall, ThemedText, MEDIA_WIDTHS } from 'theme'
import { switchChain } from 'utils/switchChain'
import { hasURL } from 'utils/urlChecks'
import { ExpandoRow } from '../ExpandoRow'
import { PortfolioLogo } from '../PortfolioLogo'
import PortfolioRow, { PortfolioSkeleton, PortfolioTabWrapper } from '../PortfolioRow'
import { PositionInfo } from './cache'
import { useFeeValues } from './hooks'
import useMultiChainPositions from './useMultiChainPositions'
import { useLmtLpPositions } from 'hooks/useV3Positions'
import { PositionDetails } from 'types/position'
import { useUserHideClosedPositions } from 'state/user/hooks'
import { PositionListItemProps, getPriceOrderingFromPositionForUI } from 'components/PositionListItem'
import { Fraction, Price, Token } from '@uniswap/sdk-core'
import { useToken } from 'hooks/Tokens'
import { unwrappedToken } from 'utils/unwrappedToken'
import { useEstimatedAPR, usePool } from 'hooks/usePools'
import useIsTickAtLimit from 'hooks/useIsTickAtLimit'
import { useEffect } from 'react'
import { getDecimalAndUsdValueData, getMultipleUsdPriceData } from 'hooks/useUSDPrice'
import { useRateAndUtil } from 'hooks/useLMTV2Positions'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { Link } from 'react-router-dom'
import HoverInlineText from 'components/HoverInlineText'
import Loader from 'components/Icons/LoadingSpinner'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import RangeBadge from 'components/Badge/RangeBadge'
import { SupportedChainId } from 'constants/chains'

export default function Pools({ account }: { account: string }) {

  const { chainId } = useWeb3React()

  // const { positions, loading } = useMultiChainPositions(account)

  // const [showClosed, toggleShowClosed] = useReducer((showClosed) => !showClosed, false)

  // const [openPositions, closedPositions] = useMemo(() => {
  //   const openPositions: PositionInfo[] = []
  //   const closedPositions: PositionInfo[] = []
  //   positions?.forEach((position) => (position.closed ? closedPositions : openPositions).push(position))
  //   return [openPositions, closedPositions]
  // }, [positions])

  const toggleWalletDrawer = useToggleWalletDrawer()

  const [userHideClosedPositions, setUserHideClosedPositions] = useUserHideClosedPositions()
  const { positions: lmtPositions, loading: lmtPositionsLoading } = useLmtLpPositions(account)

  const [openPositions, closedPositions] = useMemo(() => {
    return lmtPositions?.reduce<[PositionDetails[], PositionDetails[]]>(
      (acc, p) => {
        acc[p.liquidity?.isZero() ? 1 : 0].push(p)
        return acc
      },
      [[], []]
    ) ?? [[], []]
  }, [lmtPositions])

  const filteredPositions = useMemo(() => {
    return [...openPositions, ...(userHideClosedPositions ? [] : closedPositions)]
  }, [closedPositions, openPositions, userHideClosedPositions])

  console.log("filteredPositions", filteredPositions)

  const uniqueTokens = useMemo(() => {
    const tokens = filteredPositions.flatMap(position => [position.token0, position.token1]);
    const uniqueTokensSet = new Set(tokens);
    return Array.from(uniqueTokensSet);
  }, [filteredPositions])

  console.log("uniqueTokens", uniqueTokens)
  const [usdPriceData, setUsdPriceData] = useState<any[]>([])
  useEffect(() => {
    const getPrices = async () => {
      if (uniqueTokens.length > 0 && chainId) {
        const res = await getMultipleUsdPriceData(chainId, uniqueTokens)
        console.log("PRICEEEEE", res)
        setUsdPriceData(res)
      }
    }
    getPrices()  
  }, [uniqueTokens, chainId])

  if (!filteredPositions) {
    return <PortfolioSkeleton />
  }

  if (filteredPositions?.length === 0) {
    return <EmptyWalletModule type="pool" onNavigateClick={toggleWalletDrawer} />
  }

  // if (!positions || loading) {
  //   return <PortfolioSkeleton />
  // }

  // if (positions?.length === 0) {
  //   return <EmptyWalletModule type="pool" onNavigateClick={toggleWalletDrawer} />
  // }

  const PositionListItemV2Memo = React.memo(PositionListItemV2)

  
  
  return (
    <PortfolioTabWrapper>
    {filteredPositions.map(p => (
      <PositionListItemV2Memo key={p.tokenId.toString()} 
        token0={p.token0} 
        token1={p.token1} 
        tokenId={p.tokenId} 
        fee={p.fee} 
        liquidity={p.liquidity} 
        tickLower={p.tickLower} 
        tickUpper={p.tickUpper} 
        usdPriceData={usdPriceData}
      />
    ))}
  </PortfolioTabWrapper>
  )
}

// export default function Pools({ account }: { account: string }) {
//   const toggleWalletDrawer = useToggleWalletDrawer()
//   const [userHideClosedPositions, setUserHideClosedPositions] = useUserHideClosedPositions()
//   const { positions: lmtPositions, loading: lmtPositionsLoading } = useLmtLpPositions(account)

//   const [openPositions, closedPositions] = useMemo(() => {
//     return lmtPositions?.reduce<[PositionDetails[], PositionDetails[]]>(
//       (acc, p) => {
//         acc[p.liquidity?.isZero() ? 1 : 0].push(p)
//         return acc
//       },
//       [[], []]
//     ) ?? [[], []]
//   }, [lmtPositions])

//   const filteredPositions = useMemo(() => {
//     return [...openPositions, ...(userHideClosedPositions ? [] : closedPositions)]
//   }, [closedPositions, openPositions, userHideClosedPositions])

//   if (loading) return <PortfolioSkeleton />
//   if (filteredPositions.length === 0) return <EmptyWalletModule type="pool" onNavigateClick={toggleWalletDrawer} />

//   console.log("POOLS RERENDERING")
//   return (
//     <PortfolioTabWrapper>
//       {filteredPositions.map(p => (
//         <PositionListItemV2 key={p.tokenId.toString()} {...p} />
//       ))}
//     </PortfolioTabWrapper>
//   )
// }

const ActiveDot = styled.span<{ closed: boolean; outOfRange: boolean }>`
  background-color: ${({ theme, closed, outOfRange }) =>
    closed ? theme.textSecondary : outOfRange ? theme.accentWarning : theme.accentSuccess};
  border-radius: 50%;
  height: 8px;
  width: 8px;
  margin-left: 4px;
  margin-top: 1px;
`

function calculcateLiquidityValue(price0: number | undefined, price1: number | undefined, position: Position) {
  if (!price0 || !price1) return undefined

  const value0 = parseFloat(position.amount0.toExact()) * price0
  const value1 = parseFloat(position.amount1.toExact()) * price1
  return value0 + value1
} 
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

const PrimaryPositionIdData = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  > * {
    margin-right: 8px;
  }
  margin-right: 6px;
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

const ExtentsText = styled(ThemedText.CellName)`
  color: ${({ theme }) => theme.textTertiary};
  display: inline-block;
  line-height: 16px;
  margin-right: 4px !important;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    margin-left: 0 !important;
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

function PositionListItemV2({ 
  token0: token0Address,
  token1: token1Address,
  tokenId,
  fee: feeAmount,
  liquidity,
  tickLower,
  tickUpper,
  usdPriceData
}: PositionListItemProps) {
  const [priceValue, setPrice] = useState<number | undefined>() 
  const [priceLowerValue, setPriceLower] = useState<Price<Token, Token> | undefined>()
  const [priceUpperValue, setPriceUpper] = useState<Price<Token, Token> | undefined>()
  const [isInverted, setIsInverted] = useState(false)
  
  const token0 = useToken(token0Address)
  const token1 = useToken(token1Address)

  const currency0 = token0 ? unwrappedToken(token0) : undefined
  const currency1 = token1 ? unwrappedToken(token1) : undefined

  // construct Position from details returned
  const [, pool, tickSpacing] = usePool(currency0 ?? undefined, currency1 ?? undefined, feeAmount)

  const { chainId } = useWeb3React()

  const position = useMemo(() => {
    if (pool && tickLower && tickUpper) {
      return new Position({ pool, liquidity: liquidity.toString(), tickLower, tickUpper })
    }
    return undefined
  }, [liquidity, pool, tickLower, tickUpper])

  const tickAtLimit = useIsTickAtLimit(feeAmount, tickLower, tickUpper)

  const [token0PriceUSD, setToken0PriceUSD] = useState<number>()
  const [token1PriceUSD, setToken1PriceUSD] = useState<number>()

  useEffect(() => {
    const call = async () => {
      if (position) {
        const token0 = position.pool.token0.address
        const token1 = position.pool.token1.address
        // const token0Price = 1//Number((await getDecimalAndUsdValueData(chainId, token0)).lastPriceUSD)
        const token0Price = usdPriceData?.find((res: any) => token0.toLowerCase() === res.address.toLowerCase())?.priceUsd
        const token1Price = usdPriceData?.find((res: any) => token1.toLowerCase() === res.address.toLowerCase())?.priceUsd
        // const token1Price = 1//Number((await getDecimalAndUsdValueData(chainId, token1)).lastPriceUSD)
        setToken0PriceUSD(token0Price)
        setToken1PriceUSD(token1Price)
      }
    }
    call()
  }, [position])

  const { depositAmount } = useMemo(() => {
    if (position && token0PriceUSD && token1PriceUSD) {
      // position.pool.token0.
      const amount0 = position.amount0
      const amount1 = position.amount1
      
      const deposit0 = Number(amount0.toSignificant(10)) * token0PriceUSD
      const deposit1 = Number(amount1.toSignificant(10)) * token1PriceUSD

      return {
        depositAmount: deposit0 + deposit1 
      }

    } else 
      return {
        depositAmount: null
      }
  
  }, [position, token0PriceUSD, token1PriceUSD])

  // prices
  const { 
    priceLower, 
    priceUpper, 
    quote, 
    base } = getPriceOrderingFromPositionForUI(position)

  const currencyQuote = quote && unwrappedToken(quote)
  const currencyBase = base && unwrappedToken(base)
  useEffect(() => {
    const call = async () => {
      if (currencyBase?.wrapped?.address && currencyQuote?.wrapped?.address) {

        const currencyBasePriceUSD = usdPriceData?.find((res: any) => currencyBase.wrapped.address.toLowerCase() === res.address.toLowerCase())?.priceUsd
        const currencyQuotePriceUSD = usdPriceData?.find((res: any) => currencyQuote.wrapped.address.toLowerCase() === res.address.toLowerCase())?.priceUsd
        // const currencyBasePriceUSD = 1 //Number((await getDecimalAndUsdValueData(chainId, currencyBase.wrapped.address)).lastPriceUSD)
        // const currencyQuotePriceUSD = 1 //Number((await getDecimalAndUsdValueData(chainId, currencyQuote.wrapped.address)).lastPriceUSD)
        
        const price = currencyBasePriceUSD / currencyQuotePriceUSD
        setPrice(price)
      }
    }
    call()
  }, [currencyBase, currencyQuote, chainId])

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
      
      const invertedPriceLower = priceUpper.invert()
      const invertedPriceUpper = priceLower.invert()
      
      if (isInverted) {
        setPriceLower(invertedPriceLower)
        setPriceUpper(invertedPriceUpper)
      } else {
        setPriceLower(priceLower)
        setPriceUpper(priceUpper)
      }
      
    }
  }, [position, isInverted])

  if (shouldHidePosition) {
    return null
  }

  function handleInvertClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.stopPropagation()
    event.preventDefault()

    if (priceLower && priceUpper) {
      const invertedPriceLower = priceUpper.invert()
      const invertedPriceUpper = priceLower.invert()
      
      if (!isInverted) {
        // setPrice(invertedPrice)
        setPriceLower(invertedPriceLower)
        setPriceUpper(invertedPriceUpper)
      } else {
        // setPrice(price)
        setPriceLower(priceLower)
        setPriceUpper(priceUpper)
      }
      setIsInverted(!isInverted)
    }
  }

  const estimatedAPR = 
  useEstimatedAPR(
    currencyBase, 
    currencyQuote, 
    pool, 
    tickSpacing, 
    priceValue,
    depositAmount ?? 0, 
    (priceLower && priceValue) ? (Number(priceLower.toSignificant(10)) / (priceValue)) : 0,
    (priceUpper && priceValue) ? (Number(priceUpper.toSignificant(10)) / (priceValue)) : 0,
    usdPriceData
  )

  return (
    <LinkRow to={positionSummaryLink}>
      {/* <RowBetween> */}
      <PrimaryPositionIdData>
        <DoubleCurrencyLogo currency0={currencyBase} currency1={currencyQuote} size={18} margin />
        <ThemedText.SubHeader color="textSecondary">
          {currencyQuote?.symbol}/{currencyBase?.symbol}
        </ThemedText.SubHeader>
      </PrimaryPositionIdData>
      {priceLower && priceUpper ? (
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
          {/* <LargeShow> */}
          <MouseoverTooltip
            text={
              <Trans>
                Inverted
              </Trans>
            }>
            <DoubleArrow onClick={(e) => handleInvertClick(e)} >↔</DoubleArrow>{' '}  
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
      ) : (
        <Loader />
      )}
      {priceLower && priceUpper && data?.apr.plus(estimatedAPR).gt(0) ? (
        <>
          <RangeLineItem>
            <HideSmall>Estimated APR:</HideSmall>
            <RangeText>
              <Trans>
                <span>{formatBNToString(data?.apr.plus(estimatedAPR), NumberType.TokenNonTx) + '%'}</span>
              </Trans>
            </RangeText>
          </RangeLineItem>
        </>
      ) : priceLower && priceUpper ? null : (
        <Loader />
      )}
      <RangeBadge removed={removed} inRange={!outOfRange} />
    </LinkRow>
  )
  // return (
  //   <PortfolioRow
  //   onClick={onClick}
  //   left={<PortfolioLogo chainId={chainId} currencies={[pool.token0, pool.token1]} />}
  //   title={
  //     <Row>
  //       <ThemedText.SubHeaderSmall>
  //         {pool.token0.symbol}/{pool.token1?.symbol}
  //       </ThemedText.SubHeaderSmall>
  //     </Row>
  //   }
  //   descriptor={<ThemedText.SubHeaderSmall minWidth="75px">{`${pool.fee / 10000}%`}</ThemedText.SubHeaderSmall>}
  //   right={
  //     <>
  //       <MouseoverTooltip
  //         placement="left"
  //         text={
  //           <div style={{ padding: '4px 0px' }}>
  //             <ThemedText.Caption>{`${formatNumber(
  //               liquidityValue,
  //               NumberType.PortfolioBalance
  //             )} (liquidity) + ${formatNumber(feeValue, NumberType.PortfolioBalance)} (fees)`}</ThemedText.Caption>
  //           </div>
  //         }
  //       >
  //         <ThemedText.SubHeaderSmall>
  //           {formatNumber((liquidityValue ?? 0) + (feeValue ?? 0), NumberType.PortfolioBalance)}
  //         </ThemedText.SubHeaderSmall>
  //       </MouseoverTooltip>

  //       <Row>
  //         <ThemedText.Caption>{closed ? t`Closed` : inRange ? t`In range` : t`Out of range`}</ThemedText.Caption>
  //         <ActiveDot closed={closed} outOfRange={!inRange} />
  //       </Row>
  //     </>
  //   }
  // />
  // )
}

function PositionListItem({ positionInfo }: { positionInfo: PositionInfo }) {
  const { chainId, position, pool, details, inRange, closed } = positionInfo

  const { priceA, priceB, fees: feeValue } = useFeeValues(positionInfo)
  const liquidityValue = calculcateLiquidityValue(priceA, priceB, position)

  const navigate = useNavigate()
  const toggleWalletDrawer = useToggleWalletDrawer()
  const { chainId: walletChainId, connector } = useWeb3React()
  const onClick = useCallback(async () => {
    if (walletChainId !== chainId) await switchChain(connector, chainId)
    toggleWalletDrawer()
    navigate('/pool/' + details.tokenId)
  }, [walletChainId, chainId, connector, toggleWalletDrawer, navigate, details.tokenId])
  const analyticsEventProperties = useMemo(
    () => ({
      chain_id: chainId,
      pool_token_0_symbol: pool.token0.symbol,
      pool_token_1_symbol: pool.token1.symbol,
      pool_token_0_address: pool.token0.address,
      pool_token_1_address: pool.token1.address,
    }),
    [chainId, pool.token0.address, pool.token0.symbol, pool.token1.address, pool.token1.symbol]
  )

  const shouldHidePosition = hasURL(pool.token0.symbol) || hasURL(pool.token1.symbol)

  if (shouldHidePosition) {
    return null
  }

  return (
    <TraceEvent
      events={[BrowserEvent.onClick]}
      name={SharedEventName.ELEMENT_CLICKED}
      element={InterfaceElementName.MINI_PORTFOLIO_POOLS_ROW}
      properties={analyticsEventProperties}
    >
      <PortfolioRow
        onClick={onClick}
        left={<PortfolioLogo chainId={chainId} currencies={[pool.token0, pool.token1]} />}
        title={
          <Row>
            <ThemedText.SubHeaderSmall>
              {pool.token0.symbol}/{pool.token1?.symbol}
            </ThemedText.SubHeaderSmall>
          </Row>
        }
        descriptor={<ThemedText.SubHeaderSmall minWidth="75px">{`${pool.fee / 10000}%`}</ThemedText.SubHeaderSmall>}
        right={
          <>
            <MouseoverTooltip
              placement="left"
              text={
                <div style={{ padding: '4px 0px' }}>
                  <ThemedText.Caption>{`${formatNumber(
                    liquidityValue,
                    NumberType.PortfolioBalance
                  )} (liquidity) + ${formatNumber(feeValue, NumberType.PortfolioBalance)} (fees)`}</ThemedText.Caption>
                </div>
              }
            >
              <ThemedText.SubHeaderSmall>
                {formatNumber((liquidityValue ?? 0) + (feeValue ?? 0), NumberType.PortfolioBalance)}
              </ThemedText.SubHeaderSmall>
            </MouseoverTooltip>

            <Row>
              <ThemedText.Caption>{closed ? t`Closed` : inRange ? t`In range` : t`Out of range`}</ThemedText.Caption>
              <ActiveDot closed={closed} outOfRange={!inRange} />
            </Row>
          </>
        }
      />
    </TraceEvent>
  )
}
