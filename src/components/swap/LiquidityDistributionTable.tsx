import { NumberType } from '@uniswap/conedison/format'
import { computePoolAddress } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { SmallButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { LoadingBubble } from 'components/Tokens/loading'
import { getInvertPrice, V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { useCurrency } from 'hooks/Tokens'
import { BinData } from 'hooks/useLMTV2Positions'
import { usePool } from 'hooks/usePools'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const LiquidityDistributionTable = ({
  address0,
  address1,
  fee,
  chainId,
  bin,
}: {
  address0: string | undefined
  address1: string | undefined
  fee: number | undefined
  chainId?: number
  bin: BinData[] | undefined
}) => {
  const navigate = useNavigate()

  const token0 = useCurrency(address0)
  const token1 = useCurrency(address1)
  const [, pool] = usePool(token1 ?? undefined, token0 ?? undefined, fee)

  const poolAddress = useMemo(() => {
    if (!pool || !chainId) return null
    return computePoolAddress({
      factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
      tokenA: pool.token0,
      tokenB: pool.token1,
      fee: pool.fee,
    })
  }, [chainId, pool])

  // const token0Decimals = token0?.wrapped.decimals
  // const token1Decimals = token1?.wrapped.decimals
  // const { provider } = useWeb3React()
  // const { data: token0Price } = useQuery(
  //   ['currentPrice', poolAddress, token0Decimals, token1Decimals],
  //   async () => {
  //     if (!poolAddress) throw new Error('No pool address')
  //     if (!token1Decimals) throw new Error('No token1 decimals')
  //     if (!token0Decimals) throw new Error('No token0 decimals')
  //     if (!provider) throw new Error('No provider')
  //     try {
  //       return await getToken0Price(poolAddress, token0Decimals, token1Decimals, provider)
  //     } catch (err) {
  //       throw new Error('failed to fetch token0 price')
  //     }
  //   },
  //   {
  //     keepPreviousData: true,
  //     refetchInterval: 1000 * 20,
  //   }
  // )

  // console.log('tooes', token0, token1)
  const [currentPrice, inverse] = useMemo(() => {
    if (!pool || !token0 || !token1 || !chainId) return [undefined, false]

    const invertPrice = getInvertPrice(token0.wrapped.address, token1.wrapped.address, chainId)
    const token0Price = new BN(pool.token0Price.toFixed(18))
    if (invertPrice) {
      return [new BN(1).div(token0Price), true]
    } else {
      return [token0Price, false]
    }
  }, [pool, token1, token0, chainId])

  //spread logic
  // const negMax = useMemo(() => {
  //   if (bin && currentPrice && token0 && token1) {
  //     return Math.max(
  //       ...bin
  //         .filter(
  //           (y) =>
  //             Number(y.price) / 1e18 >
  //               currentPrice.toNumber() * Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) &&
  //             Number(y.token0Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
  //         )
  //         .filter(
  //           (z) =>
  //             !(
  //               Number(z.token0Liquidity) / Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) > 0 &&
  //               Number(z.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
  //             )
  //         )
  //         .filter(
  //           (a) =>
  //             formatDollar({
  //               num: (Number(a.token0Liquidity) - Number(a.token0Borrowed)) / Number(`1e${token0?.wrapped.decimals}`),
  //               dollarSign: false,
  //             }) !== '0.00'
  //         )
  //         .map((x) => (Number(x.token0Liquidity) - Number(x.token0Borrowed)) / Number(`1e${token0?.wrapped.decimals}`))
  //     )
  //   } else return 0
  // }, [bin, currentPrice, token0, token1])

  const token0Price = useMemo(() => {
    if (pool?.token0.wrapped.symbol === 'wBTC' && pool?.token1?.wrapped.symbol === 'WETH')
      return pool?.token0Price ? new BN(1).div(pool.token0Price.toFixed(18)) : undefined
    return pool?.token0Price ? new BN(pool.token0Price.toFixed(18)) : undefined
  }, [pool])

  const liqNum = useMemo(() => {
    if (token0?.wrapped.symbol === 'wBTC' && token1?.wrapped.symbol === 'WETH') {
      return -10
    } else if (token0?.wrapped.symbol === 'WETH' && token1?.wrapped.symbol === 'USDC') {
      return -12
    } else if (token0?.wrapped.symbol === 'wBTC' && token1?.wrapped.symbol === 'USDC') {
      return -2
    } else {
      return 0
    }
  }, [token0?.wrapped.symbol, token1?.wrapped.symbol])

  const negMax = useMemo(() => {
    if (!bin || !token0Price) return 0

    const processed = bin
      .filter((item) => item.price.gt(token0Price) && item.token0Liquidity.gt(0))
      .filter((item) => !(item.token0Liquidity.gt(0) && item.token1Liquidity.gt(0)))
    return Math.max(...processed.map((x) => x.token0Liquidity.toNumber() - x.token0Borrowed.toNumber()))
  }, [bin, token0Price])

  const posMax = useMemo(() => {
    if (!bin || !token0Price) return 0
    const processed = bin
      .filter((item) => item.price.lt(token0Price) && item.token1Liquidity.gt(0))
      .filter((item) => !(item.token0Liquidity.gt(0) && item.token1Liquidity.gt(0)))
    return Math.max(...processed.map((x) => x.token1Liquidity.toNumber() - x.token1Borrowed.toNumber()))
  }, [bin, token0Price])

  const binsAbove = useMemo(() => {
    if (!bin || !currentPrice) return []
    if (
      (token0?.symbol === 'wBTC' && token1?.symbol === 'USDC') ||
      (token0?.symbol === 'STG' && token1?.symbol === 'WETH')
    ) {
      return bin
        .filter((i) => i.price.toNumber() < currentPrice.toNumber() && i.token0Liquidity.gt(0))
        .filter((i) => i.token1Liquidity.gt(0) && i.token0Liquidity.gt(0))
        .filter((i) => i.token0Liquidity.minus(i.token0Borrowed).gt(0))
    }
    if (token0?.symbol === 'wBTC' && token1?.symbol === 'WETH') {
      return bin
        .filter((i) => i.price.gt(currentPrice) && i.token0Liquidity.gt(0))
        .filter((i) => !(i.token1Liquidity.gt(0) && i.token0Liquidity.gt(0)))
        .filter((i) => i.token0Liquidity.minus(i.token0Borrowed).gt(0.00004))
    }
    if (token0?.symbol === 'WETH' && token1?.symbol === 'USDC') {
      return bin
        .filter((i) => i.price.toNumber() < 1 / currentPrice.toNumber() && i.token0Liquidity.gt(0))
        .filter((i) => !(i.token1Liquidity.gt(0) && i.token0Liquidity.gt(0)))
        .filter((i) => i.token0Liquidity.minus(i.token0Borrowed).gt(0))
    }
    if (token0?.symbol === 'WETH' && token1?.symbol === 'ARB') {
      return bin
        .filter((i) => i.price.toNumber() > currentPrice.toNumber() && i.token1Liquidity.gt(0))
        .filter((i) => !(i.token1Liquidity.gt(0) && i.token0Liquidity.gt(0)))
        .filter((i) => i.token1Liquidity.minus(i.token1Borrowed).gt(0))
    }
    return bin
      .filter((i) => i.price.gt(currentPrice) && i.token0Liquidity.gt(0))
      .filter((i) => !(i.token1Liquidity.gt(0) && i.token0Liquidity.gt(0)))
      .filter((i) => i.token0Liquidity.minus(i.token0Borrowed).gt(0))
  }, [bin, currentPrice, token0?.symbol, token1?.symbol])

  const binsBelow = useMemo(() => {
    if (!bin || !currentPrice) return []
    if (
      (token0?.symbol === 'wBTC' && token1?.symbol === 'WETH') ||
      (token0?.symbol === 'WETH' && token1?.symbol === 'LINK') ||
      (token0?.symbol === 'WETH' && token1?.symbol === 'GMX')
    ) {
      return bin
        .filter((i) => i.price.toNumber() > currentPrice.toNumber() && i.token1Liquidity.gt(0))
        .filter((i) => !(i.token0Liquidity.gt(0) && i.token1Liquidity.gt(0)))
        .filter((i) => i.token1Liquidity.minus(i.token1Borrowed).gt(0.00000001))
    }
    if (
      (token0?.symbol === 'WETH' && token1?.symbol === 'USDC') ||
      (token0?.symbol === 'MAGIC' && token1?.symbol === 'WETH')
    ) {
      return bin
        .filter((i) => i.price.lt(currentPrice) && i.token1Liquidity.gt(0))
        .filter((i) => !(i.token0Liquidity.gt(0) && i.token1Liquidity.gt(0)))
        .filter((i) => i.token1Liquidity.minus(i.token1Borrowed).gt(0))
    }
    if (token0?.symbol === 'WETH' && token1?.symbol === 'ARB') {
      return bin
        .filter((i) => i.price.toNumber() > currentPrice.toNumber() && i.token0Liquidity.gt(0))
        .filter((i) => !(i.token1Liquidity.gt(0) && i.token0Liquidity.gt(0)))
        .filter((i) => i.token0Liquidity.minus(i.token0Borrowed).gt(0))
    }
    return bin
      .filter((i) => i.price.lt(currentPrice) && i.token1Liquidity.gt(0))
      .filter((i) => !(i.token0Liquidity.gt(0) && i.token1Liquidity.gt(0)))
      .filter((i) => i.token1Liquidity.minus(i.token1Borrowed).gt(0))
  }, [bin, currentPrice, token0?.symbol, token1?.symbol])

  const ref = useRef<HTMLInputElement>(null)
  const upperRef = useRef<HTMLInputElement>(null)
  const lowerRef = useRef<HTMLInputElement>(null)

  const startHeight = useMemo(() => {
    if (!upperRef.current?.offsetHeight || !ref.current?.offsetHeight || !lowerRef.current?.offsetHeight || !bin) {
      localStorage.removeItem('scroll')
      return 0
    }
    if (
      upperRef.current.offsetHeight > ref.current.offsetHeight &&
      lowerRef.current.offsetHeight > ref.current.offsetHeight
    )
      return upperRef.current.offsetHeight - ref.current.offsetHeight / 2

    if (
      upperRef.current.offsetHeight > ref.current.offsetHeight &&
      lowerRef.current.offsetHeight > ref.current.offsetHeight
    )
      return upperRef.current.offsetHeight * 0.5

    if (upperRef.current.offsetHeight > ref.current.offsetHeight) return upperRef.current.offsetHeight
    localStorage.removeItem('scroll')
    return 0
  }, [bin])

  const localData = localStorage.getItem('scroll') === null

  const [scrollPosition, setScrollPosition] = useState(() => {
    return localData ? startHeight : parseInt(JSON.parse(localStorage.getItem('scroll') || '{}'), 10)
  })

  useEffect(() => {
    if (startHeight) {
      setScrollPosition(() => {
        return localData ? startHeight : parseInt(JSON.parse(localStorage.getItem('scroll') || '{}'), 10)
      })
      if (bin) {
        ref.current?.scrollTo({ top: scrollPosition })
      }
    }
  }, [bin, startHeight, scrollPosition, localData])

  const handleScroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    const position = scrollTop
    localStorage.setItem('scroll', JSON.stringify(position))
    setScrollPosition(position)
  }

  const baseQuoteSymbol = inverse ? `${token1?.symbol} / ${token0?.symbol}` : `${token0?.symbol} / ${token1?.symbol}`

  const aboveAmountSymbol = !inverse ? token0?.symbol : token1?.symbol
  const belowAmountSymbol = inverse ? token0?.symbol : token1?.symbol

  const loading = !bin || !currentPrice || !token0 || !token1 || !token0Price
  return (
    <>
      <Title>
        <ThemedText.BodySecondary>Borrowable Liquidity</ThemedText.BodySecondary>
        <SmallButtonPrimary
          onClick={() => navigate('/add/' + token0?.wrapped.address + '/' + token1?.wrapped.address + '/' + `${fee}`)}
          style={{ height: '25px', borderRadius: '8px' }}
        >
          Earn
        </SmallButtonPrimary>
      </Title>
      {/* <NegativeWrapper> */}
      <LDHeaderRow>
        <LDHeaderCellIn>Price ({baseQuoteSymbol})</LDHeaderCellIn>
        <LDHeaderCellOut>Amount ({aboveAmountSymbol})</LDHeaderCellOut>
      </LDHeaderRow>
      <Wrapper onScroll={handleScroll} ref={ref}>
        {loading ? (
          <AutoColumn gap="3px">
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
          </AutoColumn>
        ) : token1.symbol === 'ARB' ? (
          <NegativeData ref={upperRef}>
            {binsAbove.map((bin) => {
              return (
                <LDDataRowNeg
                  spread={((Number(bin.token0Liquidity) - Number(bin.token0Borrowed)) / negMax) * 100}
                  key={Number(bin.price)}
                >
                  <LDDataCellIn>
                    {formatBNToString(new BN(1).div(bin.price), NumberType.FiatTokenPrice, true, liqNum)}
                  </LDDataCellIn>
                  <LDDataCellOut>
                    {formatBNToString(bin.token1Liquidity.minus(bin.token1Borrowed), NumberType.TokenTx)}
                  </LDDataCellOut>
                </LDDataRowNeg>
              )
            })}
          </NegativeData>
        ) : (
          <NegativeData ref={upperRef}>
            {inverse
              ? binsBelow.map((bin) => {
                  return (
                    <LDDataRowNeg
                      spread={bin.token1Liquidity.minus(bin.token1Borrowed).div(posMax).times(100).toNumber()}
                      key={bin.price.toString()}
                    >
                      <LDDataCellIn>
                        {formatBNToString(new BN(1).div(bin.price), NumberType.FiatTokenPrice, true, liqNum)}
                      </LDDataCellIn>
                      <LDDataCellOut>
                        {formatBNToString(bin.token1Liquidity.minus(bin.token1Borrowed), NumberType.TokenTx)}
                      </LDDataCellOut>
                    </LDDataRowNeg>
                  )
                })
              : binsAbove
                  .map((bin) => {
                    return (
                      <LDDataRowNeg
                        spread={((Number(bin.token0Liquidity) - Number(bin.token0Borrowed)) / negMax) * 100}
                        key={Number(bin.price)}
                      >
                        <LDDataCellIn>
                          {formatBNToString(bin.price, NumberType.FiatTokenPrice, true, liqNum)}
                        </LDDataCellIn>
                        <LDDataCellOut>
                          {formatBNToString(bin.token0Liquidity.minus(bin.token0Borrowed), NumberType.TokenTx)}
                        </LDDataCellOut>
                      </LDDataRowNeg>
                    )
                  })
                  .reverse()}
          </NegativeData>
        )}

        <PriceWrapper>
          {token0 && token1 && <ThemedText.BodyPrimary>{formatBNToString(currentPrice)}</ThemedText.BodyPrimary>}
          {token0 && token1 && <ThemedText.BodyPrimary>{formatBNToString(currentPrice)}</ThemedText.BodyPrimary>}
        </PriceWrapper>
        <LDHeaderRow>
          <LDHeaderCellIn>Price ({baseQuoteSymbol})</LDHeaderCellIn>
          <LDHeaderCellOut>Amount ({belowAmountSymbol})</LDHeaderCellOut>
        </LDHeaderRow>
        {!bin ? (
          <AutoColumn gap="3px">
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
          </AutoColumn>
        ) : token1?.symbol === 'ARB' ? (
          <PositiveData ref={lowerRef}>
            {binsBelow.map((bin) => {
              return (
                <LDDataRow
                  spread={((Number(bin.token0Liquidity) - Number(bin.token0Borrowed)) / negMax) * 100}
                  key={Number(bin.price)}
                >
                  <LDDataCellIn>
                    {formatBNToString(new BN(1).div(bin.price), NumberType.FiatTokenPrice, true, liqNum)}
                  </LDDataCellIn>
                  <LDDataCellOut>
                    {formatBNToString(bin.token0Liquidity.minus(bin.token0Borrowed), NumberType.TokenTx)}
                  </LDDataCellOut>
                </LDDataRow>
              )
            })}
          </PositiveData>
        ) : (
          <PositiveData ref={lowerRef}>
            {inverse && token1?.symbol !== 'ARB'
              ? binsAbove.map((bin) => {
                  return (
                    <LDDataRow
                      spread={bin.token0Liquidity.minus(bin.token0Borrowed).div(negMax).times(100).toNumber()}
                      key={bin.price.toString()}
                    >
                      <LDDataCellInNeg>
                        {formatBNToString(new BN(1).div(bin.price), NumberType.FiatTokenPrice, true, liqNum)}
                      </LDDataCellInNeg>
                      <LDDataCellOutNeg>
                        {formatBNToString(bin.token0Liquidity.minus(bin.token0Borrowed), NumberType.TokenTx)}
                      </LDDataCellOutNeg>
                    </LDDataRow>
                  )
                })
              : binsBelow
                  .map((bin) => {
                    return (
                      <LDDataRow
                        spread={((Number(bin.token1Liquidity) - Number(bin.token1Borrowed)) / posMax) * 100}
                        key={Number(bin.price)}
                      >
                        <LDDataCellInNeg>
                          {formatBNToString(bin.price, NumberType.FiatTokenPrice, true, liqNum)}
                        </LDDataCellInNeg>
                        <LDDataCellOutNeg>
                          {formatBNToString(bin.token1Liquidity.minus(bin.token1Borrowed), NumberType.TokenTx)}
                        </LDDataCellOutNeg>
                      </LDDataRow>
                    )
                  })
                  .reverse()}
          </PositiveData>
        )}
      </Wrapper>
    </>
  )
}

export const LiquidityDistributionLoading = () => {
  return (
    <>
      <Title>
        <ThemedText.BodySecondary>Borrowable Liquidity</ThemedText.BodySecondary>
      </Title>
      <Bubble />
    </>
  )
}

const Bubble = styled(LoadingBubble)`
  width: 100%;
  height: 100%;
`

export default LiquidityDistributionTable

const PriceWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 7px;
`

const Title = styled.div`
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  width: 100%;
`

const LDHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr;
  position: sticky;
  background: ${({ theme }) => theme.backgroundSurface};
  top: 0;
`
const LDHeaderCellIn = styled.div`
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
`
const LDHeaderCellOut = styled.div`
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  text-align: end;
`
interface SpreadProps {
  spread: number
}

const LDDataRow = styled.div<SpreadProps>`
  display: grid;
  grid-template-columns: 2fr 2fr;
  background-image: linear-gradient(to right, transparent ${(props) => 100 - props.spread}px, rgba(0, 118, 27, 0.47));
  padding: 0.2rem;
  border-radius: 5px;
  margin-bottom: 0.15rem;
  :hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
`
const LDDataCellIn = styled.div`
  padding-left: 0.5rem;
  font-size: 0.75rem;
  color: white;
`

const LDDataCellOut = styled.div`
  padding-right: 0.5rem;

  font-size: 0.75rem;
  color: white;
  text-align: end;
`

const LDDataRowNeg = styled(LDDataRow)<SpreadProps>`
  background-image: linear-gradient(to right, transparent ${(props) => 100 - props.spread}px, rgba(131, 0, 0, 0.47));
`

const LDDataCellInNeg = styled.div`
  padding-left: 0.5rem;
  font-size: 0.75rem;
  color: white;
`

const LDDataCellOutNeg = styled.div`
  padding-right: 0.5rem;
  font-size: 0.75rem;
  color: white;
  text-align: end;
`

const LoadingRow = () => {
  return <LoadingSquare />
}
const LoadingSquare = styled(LoadingBubble)`
  width: 100%;
  height: 22px;

  border: none;
  border-radius: 5px;
  color: ${({ theme }) => theme.textPrimary};

  display: grid;
  grid-template-columns: 3fr 1fr 1fr;
  line-height: 10px;
  align-items: center;

  text-align: left;
  transition: ${({ theme }) => theme.transition.duration.medium} ${({ theme }) => theme.transition.timing.ease}
    background-color;
  width: 100%;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    width: 100%;
  }
`

const NegativeData = styled.div`
  // overflow-y: scroll;
  // max-height: 300px;
  // ::-webkit-scrollbar {
  //   display: none;
  // }
`

const PositiveData = styled.div`
  margin-bottom: 50px;
  // overflow-y: scroll;
  //   max-height: 300px
  //   margin-top: 1rem;
  //   ::-webkit-scrollbar {
  //     display: none;
  //   }
`

// const NegativeWrapper = styled.div`
//   height: fit-content;
// `

// const PositiveWrapper = styled.div`
//   height: fit-content;
// `

const Wrapper = styled.div`
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
  height: 93%;
`

// {inverse
//   ? bin &&
//     currentPrice &&
//     token0 &&
//     token1 &&
//     posMax &&
//     ((token0?.symbol === 'wBTC' && token1?.symbol === 'WETH') ||
//       (token0?.symbol === 'WETH' && token1?.symbol === 'LINK') ||
//       (token0?.symbol === 'WETH' && token1?.symbol === 'GMX') ||
//       (token0?.symbol === 'WETH' && token1?.symbol === 'ARB'))
//     ? bin
//         .filter(
//           (y) =>
//             Number(y.price) / 1e18 >
//               currentPrice.toNumber() *
//                 Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) &&
//             Number(y.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
//         )
//         .filter(
//           (z) =>
//             !(
//               Number(z.token0Liquidity) /
//                 Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) >
//                 0 && Number(z.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
//             )
//         )
//         .filter(
//           (a) =>
//             formatDollar({
//               num:
//                 (Number(a.token1Liquidity) - Number(a.token1Borrowed)) /
//                 Number(`1e${token1?.wrapped.decimals}`),
//               dollarSign: false,
//             }) !== '0.00'
//         )
//         .map((x) => (
//           <LDDataRow
//             spread={
//               ((Number(x.token1Liquidity) - Number(x.token1Borrowed)) /
//                 Number(`1e${token1?.wrapped.decimals}`) /
//                 posMax) *
//               100
//             }
//             key={Number(x.price) / Number(`1e${liqNum}`)}
//           >
//             <LDDataCellIn>{(1 / (Number(x.price) / Number(`1e${liqNum}`))).toFixed(6)}</LDDataCellIn>
//             <LDDataCellOut>
//               {formatDollar({
//                 num:
//                   (Number(x.token1Liquidity) - Number(x.token1Borrowed)) /
//                   Number(`1e${token1?.wrapped.decimals}`),
//                 dollarSign: false,
//               })}
//             </LDDataCellOut>
//           </LDDataRow>
//         ))
//     : bin &&
//       currentPrice &&
//       token0 &&
//       token1 &&
//       negMax &&
//       bin
//         .filter(
//           (y) =>
//             Number(y.price) / 1e18 > currentPrice.toNumber() &&
//             Number(y.token0Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
//         )
//         .filter(
//           (z) =>
//             !(
//               Number(z.token0Liquidity) /
//                 Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) >
//                 0 && Number(z.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
//             )
//         )
//         .filter(
//           (a) =>
//             formatDollar({
//               num:
//                 (Number(a.token0Liquidity) - Number(a.token0Borrowed)) /
//                 Number(`1e${token0?.wrapped.decimals}`),
//               dollarSign: false,
//             }) !== '0.00'
//         )
//         .map((x) => (
//           <LDDataRow
//             spread={
//               ((Number(x.token0Liquidity) - Number(x.token0Borrowed)) /
//                 Number(`1e${token0?.wrapped.decimals}`) /
//                 negMax) *
//               100
//             }
//             // spread={75 / 100}
//             key={Number(x.price) / Number(`1e${liqNum}`)}
//           >
//             <LDDataCellInNeg>
//               {token0?.symbol === 'wBTC' && token1?.symbol === 'WETH'
//                 ? (1 / (Number(x.price) / Number(`1e${liqNum}`))).toFixed(6)
//                 : (Number(x.price) / Number(`1e${liqNum}`)).toFixed(6)}
//             </LDDataCellInNeg>
//             <LDDataCellOutNeg>
//               {formatDollar({
//                 num:
//                   (Number(x.token0Liquidity) - Number(x.token0Borrowed)) /
//                   Number(`1e${token0?.wrapped.decimals}`),
//                 dollarSign: false,
//               })}
//             </LDDataCellOutNeg>
//           </LDDataRow>
//         ))
//         .reverse()
//   : bin &&
//     currentPrice &&
//     token0 &&
//     token1 &&
//     negMax &&
//     bin
//       .filter(
//         (y) =>
//           Number(y.price) / 1e18 >
//             currentPrice.toNumber() * Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) &&
//           Number(y.token0Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
//       )
//       .filter(
//         (z) =>
//           !(
//             Number(z.token0Liquidity) / Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) >
//               0 && Number(z.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
//           )
//       )
//       .filter(
//         (a) =>
//           formatDollar({
//             num:
//               (Number(a.token0Liquidity) - Number(a.token0Borrowed)) /
//               Number(`1e${token0?.wrapped.decimals}`),
//             dollarSign: false,
//           }) !== '0.00'
//       )
//       .map((x) => (
//         <LDDataRowNeg
//           spread={
//             ((Number(x.token0Liquidity) - Number(x.token0Borrowed)) /
//               Number(`1e${token0?.wrapped.decimals}`) /
//               negMax) *
//             100
//           }
//           // spread={75 / 100}
//           key={Number(x.price) / Number(`1e${liqNum}`)}
//         >
//           <LDDataCellInNeg>{(Number(x.price) / Number(`1e${liqNum}`)).toFixed(2)}</LDDataCellInNeg>
//           <LDDataCellOutNeg>
//             {formatDollar({
//               num:
//                 (Number(x.token0Liquidity) - Number(x.token0Borrowed)) /
//                 Number(`1e${token0?.wrapped.decimals}`),
//               dollarSign: false,
//             })}
//           </LDDataCellOutNeg>
//         </LDDataRowNeg>
//       ))
//       .reverse()}
