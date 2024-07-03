import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'
import { MEDIA_WIDTHS, ThemedText } from 'theme'

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

// function PositionListItemV2({
//   token0: token0Address,
//   token1: token1Address,
//   tokenId,
//   fee: feeAmount,
//   liquidity,
//   tickLower,
//   tickUpper,
//   usdPriceData,
// }: PositionListItemProps) {
//   const [priceLowerValue, setPriceLower] = useState<Price<Token, Token> | undefined>()
//   const [priceUpperValue, setPriceUpper] = useState<Price<Token, Token> | undefined>()
//   const [isInverted, setIsInverted] = useState(false)

//   const token0 = useToken(token0Address)
//   const token1 = useToken(token1Address)

//   const currency0 = token0 ? unwrappedToken(token0) : undefined
//   const currency1 = token1 ? unwrappedToken(token1) : undefined

//   // construct Position from details returned
//   const [, pool, tickSpacing] = usePool(currency0 ?? undefined, currency1 ?? undefined, feeAmount)

//   const chainId = useChainId()

//   const position = useMemo(() => {
//     if (pool && tickLower && tickUpper) {
//       return new Position({ pool, liquidity: liquidity.toString(), tickLower, tickUpper })
//     }
//     return undefined
//   }, [liquidity, pool, tickLower, tickUpper])

//   const tickAtLimit = useIsTickAtLimit(feeAmount, tickLower, tickUpper)

//   // const [token0PriceUSD, setToken0PriceUSD] = useState<number>()
//   // const [token1PriceUSD, setToken1PriceUSD] = useState<number>()
//   const token1PriceUSD = useMemo(() => {
//     if (usdPriceData && token1Address) {
//       return usdPriceData[token1Address.toLowerCase()].usdPrice
//     }
//     return undefined
//   }, [token1Address, usdPriceData])

//   const token0PriceUSD = useMemo(() => {
//     if (usdPriceData && token0Address) {
//       return usdPriceData[token0Address.toLowerCase()].usdPrice
//     }
//     return undefined
//   }, [token0Address, usdPriceData])

//   const { depositAmount } = useMemo(() => {
//     if (position && token0PriceUSD && token1PriceUSD) {
//       // position.pool.token0.
//       const amount0 = position.amount0
//       const amount1 = position.amount1

//       const deposit0 = Number(amount0.toSignificant(10)) * token0PriceUSD
//       const deposit1 = Number(amount1.toSignificant(10)) * token1PriceUSD

//       return {
//         depositAmount: deposit0 + deposit1,
//       }
//     } else
//       return {
//         depositAmount: null,
//       }
//   }, [position, token0PriceUSD, token1PriceUSD])

//   // prices
//   const { priceLower, priceUpper, quote, base } = getPriceOrderingFromPositionForUI(position)

//   const currencyQuote = quote && unwrappedToken(quote)
//   const currencyBase = base && unwrappedToken(base)
//   const priceValue = useMemo(() => {
//     if (currencyBase?.wrapped?.address && currencyQuote?.wrapped?.address && usdPriceData) {
//       const currencyBasePriceUSD = usdPriceData[currencyBase?.wrapped?.address.toLowerCase()].usdPrice
//       const currencyQuotePriceUSD = usdPriceData[currencyQuote?.wrapped?.address.toLowerCase()].usdPrice
//       const price = currencyBasePriceUSD / currencyQuotePriceUSD
//       return price
//     }
//     return undefined
//     // const call = async () => {
//     //   if (currencyBase?.wrapped?.address && currencyQuote?.wrapped?.address) {
//     //     const currencyBasePriceUSD = usdPriceData?.find(
//     //       (res: any) => currencyBase.wrapped.address.toLowerCase() === res.address.toLowerCase()
//     //     )?.priceUsd
//     //     const currencyQuotePriceUSD = usdPriceData?.find(
//     //       (res: any) => currencyQuote.wrapped.address.toLowerCase() === res.address.toLowerCase()
//     //     )?.priceUsd
//     //     const price = currencyBasePriceUSD / currencyQuotePriceUSD
//     //     setPrice(price)
//     //   }
//     // }
//     // call()
//   }, [currencyBase, currencyQuote, chainId, usdPriceData])

//   // check if price is within range
//   const outOfRange: boolean = pool ? pool.tickCurrent < tickLower || pool.tickCurrent >= tickUpper : false

//   const positionSummaryLink = '/pools/' + tokenId

//   const removed = liquidity?.eq(0)

//   const shouldHidePosition = hasURL(token0?.symbol) || hasURL(token1?.symbol)

//   const { result: data } = useRateAndUtil(
//     pool?.token0.address,
//     pool?.token1.address,
//     pool?.fee,
//     position?.tickLower,
//     position?.tickUpper
//   )

//   useEffect(() => {
//     if (priceLower && priceUpper) {
//       const invertedPriceLower = priceUpper.invert()
//       const invertedPriceUpper = priceLower.invert()

//       if (isInverted) {
//         setPriceLower(invertedPriceLower)
//         setPriceUpper(invertedPriceUpper)
//       } else {
//         setPriceLower(priceLower)
//         setPriceUpper(priceUpper)
//       }
//     }
//   }, [position, isInverted])

//   if (shouldHidePosition) {
//     return null
//   }

//   function handleInvertClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
//     event.stopPropagation()
//     event.preventDefault()

//     if (priceLower && priceUpper) {
//       const invertedPriceLower = priceUpper.invert()
//       const invertedPriceUpper = priceLower.invert()

//       if (!isInverted) {
//         // setPrice(invertedPrice)
//         setPriceLower(invertedPriceLower)
//         setPriceUpper(invertedPriceUpper)
//       } else {
//         // setPrice(price)
//         setPriceLower(priceLower)
//         setPriceUpper(priceUpper)
//       }
//       setIsInverted(!isInverted)
//     }
//   }

//   const estimatedAPR = useEstimatedAPR(
//     currencyBase,
//     currencyQuote,
//     pool,
//     tickSpacing,
//     priceValue,
//     depositAmount ?? 0,
//     priceLower && priceValue ? Number(priceLower.toSignificant(10)) / priceValue : 0,
//     priceUpper && priceValue ? Number(priceUpper.toSignificant(10)) / priceValue : 0,
//     usdPriceData
//   )

//   return (
//     <LinkRow to={positionSummaryLink}>
//       {/* <RowBetween> */}
//       <PrimaryPositionIdData>
//         <DoubleCurrencyLogo currency0={currencyBase} currency1={currencyQuote} size={18} margin />
//         <ThemedText.SubHeader color="textSecondary">
//           {currencyQuote?.symbol}/{currencyBase?.symbol}
//         </ThemedText.SubHeader>
//       </PrimaryPositionIdData>
//       {priceLower && priceUpper ? (
//         <RangeLineItem>
//           <RangeText>
//             <ExtentsText>
//               <Trans>Min: </Trans>
//             </ExtentsText>
//             <Trans>
//               <span>{priceLowerValue?.toSignificant(10)}</span>{' '}
//               <HoverInlineText text={isInverted ? currencyBase?.symbol : currencyQuote?.symbol} /> per{' '}
//               <HoverInlineText text={isInverted ? currencyQuote?.symbol : currencyBase?.symbol ?? ''} />
//             </Trans>
//           </RangeText>{' '}
//           {/* <LargeShow> */}
//           <MouseoverTooltip text={<Trans>Inverted</Trans>}>
//             <DoubleArrow onClick={(e) => handleInvertClick(e)}>↔</DoubleArrow>{' '}
//           </MouseoverTooltip>
//           <RangeText>
//             <ExtentsText>
//               <Trans>Max: </Trans>
//             </ExtentsText>
//             <Trans>
//               <span>{priceUpperValue?.toSignificant(10)}</span>{' '}
//               <HoverInlineText text={isInverted ? currencyBase?.symbol : currencyQuote?.symbol} /> per{' '}
//               <HoverInlineText maxCharacters={10} text={isInverted ? currencyQuote?.symbol : currencyBase?.symbol} />
//             </Trans>
//           </RangeText>
//         </RangeLineItem>
//       ) : (
//         <Loader />
//       )}
//       {priceLower && priceUpper && data?.apr.plus(estimatedAPR).gt(0) ? (
//         <>
//           <RangeLineItem>
//             <HideSmall>Estimated APR:</HideSmall>
//             <RangeText>
//               <Trans>
//                 <span>{formatBNToString(data?.apr.plus(estimatedAPR), NumberType.TokenNonTx) + '%'}</span>
//               </Trans>
//             </RangeText>
//           </RangeLineItem>
//         </>
//       ) : priceLower && priceUpper ? null : (
//         <Loader />
//       )}
//       <RangeBadge removed={removed} inRange={!outOfRange} />
//     </LinkRow>
//   )
//   // return (
//   //   <PortfolioRow
//   //   onClick={onClick}
//   //   left={<PortfolioLogo chainId={chainId} currencies={[pool.token0, pool.token1]} />}
//   //   title={
//   //     <Row>
//   //       <ThemedText.SubHeaderSmall>
//   //         {pool.token0.symbol}/{pool.token1?.symbol}
//   //       </ThemedText.SubHeaderSmall>
//   //     </Row>
//   //   }
//   //   descriptor={<ThemedText.SubHeaderSmall minWidth="75px">{`${pool.fee / 10000}%`}</ThemedText.SubHeaderSmall>}
//   //   right={
//   //     <>
//   //       <MouseoverTooltip
//   //         placement="left"
//   //         text={
//   //           <div style={{ padding: '4px 0px' }}>
//   //             <ThemedText.Caption>{`${formatNumber(
//   //               liquidityValue,
//   //               NumberType.PortfolioBalance
//   //             )} (liquidity) + ${formatNumber(feeValue, NumberType.PortfolioBalance)} (fees)`}</ThemedText.Caption>
//   //           </div>
//   //         }
//   //       >
//   //         <ThemedText.SubHeaderSmall>
//   //           {formatNumber((liquidityValue ?? 0) + (feeValue ?? 0), NumberType.PortfolioBalance)}
//   //         </ThemedText.SubHeaderSmall>
//   //       </MouseoverTooltip>

//   //       <Row>
//   //         <ThemedText.Caption>{closed ? t`Closed` : inRange ? t`In range` : t`Out of range`}</ThemedText.Caption>
//   //         <ActiveDot closed={closed} outOfRange={!inRange} />
//   //       </Row>
//   //     </>
//   //   }
//   // />
//   // )
// }
