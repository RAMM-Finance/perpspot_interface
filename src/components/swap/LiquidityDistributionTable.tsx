import { computePoolAddress } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { AutoColumn } from 'components/Column'
import { LoadingBubble } from 'components/Tokens/loading'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { useCurrency } from 'hooks/Tokens'
import { BinData } from 'hooks/useLMTV2Positions'
import { usePool } from 'hooks/usePools'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatDollar } from 'utils/formatNumbers'

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
  // const [inverse, setInverse] = useState(false)
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
  // const bin = undefined as any
  const priceData = undefined as any
  // const { data: priceData, loading: priceLoading } = useLatestPoolPriceData(poolAddress ?? undefined)

  console.log('tooes', token0, token1)
  const [currentPrice, inverse] = useMemo(() => {
    if (!pool) return [undefined, false]
    const token0Price = new BN(pool.token0Price.toFixed(18))
    if (token0?.symbol === 'wBTC' && token1?.symbol === 'WETH') {
      return [new BN(1).div(token0Price), true]
    } else if (token0Price.lt(1)) {
      return [token0Price, true]
    } else {
      return [token0Price, false]
    }
  }, [pool])

  console.log(formatBNToString(currentPrice), inverse)
  // const currentPrice = useMemo(() => {
  //   if (!priceData) {
  //     if (!pool || !token0 || !token1) return undefined
  //     let price = new BN(Number(pool.token0Price.quotient.toString()))
  //     if (price.toString() == '0') price = new BN(Number(pool.token1Price.quotient.toString()))
  //     if (token0?.wrapped.symbol === 'wBTC' && token1?.wrapped.symbol === 'WETH') {
  //       setInverse(true)
  //       // return price.div( new BN( 10** (token1?.wrapped.decimals - token0?.wrapped.decimals)))
  //       return new BN(1).div(price.div(new BN(10 ** (token1?.wrapped.decimals - token0?.wrapped.decimals))))
  //     } else if (token0?.wrapped.symbol === 'WETH' && token1?.wrapped.symbol === 'USDC') {
  //       setInverse(true)

  //       return new BN(1).div(price.div(new BN(10 ** (token0?.wrapped.decimals - token1?.wrapped.decimals))))
  //     } else if (token0?.wrapped.symbol === 'wBTC' && token1?.wrapped.symbol === 'USDC') {
  //       return price.div(new BN(10 ** (token1?.wrapped.decimals - token0?.wrapped.decimals)))
  //     } else if (token0?.wrapped.symbol === 'WETH' && token1?.wrapped.symbol === 'ARB') {
  //       setInverse(false)
  //       return price
  //     } else if (token0?.wrapped.symbol === 'LDO' && token1?.wrapped.symbol === 'WETH') {
  //       return price
  //     } else if (token0?.wrapped.symbol === 'WETH' && token1?.wrapped.symbol === 'GMX') {
  //       setInverse(true)
  //       return new BN(1).div(price.div(new BN(10 ** (token0?.wrapped.decimals - token1?.wrapped.decimals))))
  //     } else {
  //       return new BN(1).div(price.div(new BN(10 ** (token1?.wrapped.decimals - token0?.wrapped.decimals))))
  //     }
  //   }
  //   return undefined
  // }, [priceData, pool, token0, token1])

  //spread logic
  const negMax = useMemo(() => {
    if (bin && currentPrice && token0 && token1) {
      return Math.max(
        ...bin
          .filter(
            (y) =>
              Number(y.price) / 1e18 >
                currentPrice.toNumber() * Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) &&
              Number(y.token0Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
          )
          .filter(
            (z) =>
              !(
                Number(z.token0Liquidity) / Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) > 0 &&
                Number(z.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
              )
          )
          .filter(
            (a) =>
              formatDollar({
                num: (Number(a.token0Liquidity) - Number(a.token0Borrowed)) / Number(`1e${token0?.wrapped.decimals}`),
                dollarSign: false,
              }) !== '0.00'
          )
          .map((x) => (Number(x.token0Liquidity) - Number(x.token0Borrowed)) / Number(`1e${token0?.wrapped.decimals}`))
      )
    } else return 0
  }, [bin, currentPrice, token0, token1])

  const posMax = useMemo(() => {
    if (bin && currentPrice && token0 && token1) {
      return Math.max(
        ...bin
          .filter(
            (y) =>
              Number(y.price) / 1e18 <
                currentPrice.toNumber() * Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) &&
              Number(y.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
          )
          .filter(
            (z) =>
              !(
                Number(z.token0Liquidity) / Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) > 0 &&
                Number(z.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
              )
          )
          .filter(
            (a) =>
              formatDollar({
                num: (Number(a.token1Liquidity) - Number(a.token1Borrowed)) / Number(`1e${token1?.wrapped.decimals}`),
                dollarSign: false,
              }) !== '0.00'
          )
          .map((x) => (Number(x.token1Liquidity) - Number(x.token1Borrowed)) / Number(`1e${token1?.wrapped.decimals}`))
      )
    } else return 0
  }, [bin, currentPrice, token0, token1])

  const liqNum = useMemo(() => {
    if (token0 && token1) {
      if (token0?.wrapped.symbol === 'wBTC' && token1?.wrapped.symbol === 'WETH') {
        return 28
      } else if (token0?.wrapped.symbol === 'WETH' && token1?.wrapped.symbol === 'USDC') {
        return 6
      } else if (token0?.wrapped.symbol === 'wBTC' && token1?.wrapped.symbol === 'USDC') {
        return 16
      } else {
        return 18
      }
    } else {
      return [undefined, undefined]
    }
  }, [token0, token1])

  const ref = useRef<HTMLInputElement>(null)

  const [scrollPosition, setScrollPosition] = useState(400)

  useEffect(() => {
    if (bin) {
      ref.current?.scrollTo({ top: scrollPosition })
    }
  }, [bin, scrollPosition])

  const handleScroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    const position = scrollTop
    setScrollPosition(position)
  }

  return (
    <>
      <Title>
        <ThemedText.BodySecondary>Borrowable Liquidity</ThemedText.BodySecondary>
        {/*<SmallButtonPrimary
          onClick={() => navigate('/add/' + token0?.wrapped.address + '/' + token1?.wrapped.address + '/' + `${fee}`)}
          style={{ height: '25px', borderRadius: '8px' }}
        >
          Earn
        </SmallButtonPrimary>*/}
      </Title>
      {/* <NegativeWrapper> */}
      <LDHeaderRow>
        <LDHeaderCellIn>
          Price ({token1?.symbol}/{token0?.symbol})
        </LDHeaderCellIn>
        <LDHeaderCellOut>Amount ({!inverse ? token1?.symbol : token0?.symbol})</LDHeaderCellOut>
      </LDHeaderRow>
      <Wrapper onScroll={handleScroll} ref={ref}>
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
        ) : (
          <NegativeData>
            {inverse
              ? bin &&
                currentPrice &&
                token0 &&
                token1 &&
                posMax &&
                token0?.symbol === 'wBTC' &&
                token1?.symbol === 'WETH'
                ? bin
                    .filter(
                      (y) =>
                        Number(y.price) / 1e18 >
                          currentPrice.toNumber() *
                            Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) &&
                        Number(y.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
                    )
                    .filter(
                      (z) =>
                        !(
                          Number(z.token0Liquidity) /
                            Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) >
                            0 && Number(z.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
                        )
                    )
                    .filter(
                      (a) =>
                        formatDollar({
                          num:
                            (Number(a.token1Liquidity) - Number(a.token1Borrowed)) /
                            Number(`1e${token1?.wrapped.decimals}`),
                          dollarSign: false,
                        }) !== '0.00'
                    )
                    .map((x) => (
                      <LDDataRow
                        spread={
                          ((Number(x.token1Liquidity) - Number(x.token1Borrowed)) /
                            Number(`1e${token1?.wrapped.decimals}`) /
                            posMax) *
                          100
                        }
                        key={Number(x.price) / Number(`1e${liqNum}`)}
                      >
                        <LDDataCellIn>{(1 / (Number(x.price) / Number(`1e${liqNum}`))).toFixed(6)}</LDDataCellIn>
                        <LDDataCellOut>
                          {formatDollar({
                            num:
                              (Number(x.token1Liquidity) - Number(x.token1Borrowed)) /
                              Number(`1e${token1?.wrapped.decimals}`),
                            dollarSign: false,
                          })}
                        </LDDataCellOut>
                      </LDDataRow>
                    ))
                : bin &&
                  currentPrice &&
                  token0 &&
                  token1 &&
                  negMax &&
                  bin
                    .filter(
                      (y) =>
                        Number(y.price) / 1e18 > currentPrice.toNumber() &&
                        Number(y.token0Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
                    )
                    .filter(
                      (z) =>
                        !(
                          Number(z.token0Liquidity) /
                            Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) >
                            0 && Number(z.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
                        )
                    )
                    .filter(
                      (a) =>
                        formatDollar({
                          num:
                            (Number(a.token0Liquidity) - Number(a.token0Borrowed)) /
                            Number(`1e${token0?.wrapped.decimals}`),
                          dollarSign: false,
                        }) !== '0.00'
                    )
                    .map((x) => (
                      <LDDataRow
                        spread={
                          ((Number(x.token0Liquidity) - Number(x.token0Borrowed)) /
                            Number(`1e${token0?.wrapped.decimals}`) /
                            negMax) *
                          100
                        }
                        // spread={75 / 100}
                        key={Number(x.price) / Number(`1e${liqNum}`)}
                      >
                        <LDDataCellInNeg>
                          {token0?.symbol === 'wBTC' && token1?.symbol === 'WETH'
                            ? (1 / (Number(x.price) / Number(`1e${liqNum}`))).toFixed(6)
                            : (Number(x.price) / Number(`1e${liqNum}`)).toFixed(6)}
                        </LDDataCellInNeg>
                        <LDDataCellOutNeg>
                          {formatDollar({
                            num:
                              (Number(x.token0Liquidity) - Number(x.token0Borrowed)) /
                              Number(`1e${token0?.wrapped.decimals}`),
                            dollarSign: false,
                          })}
                        </LDDataCellOutNeg>
                      </LDDataRow>
                    ))
                    .reverse()
              : bin &&
                currentPrice &&
                token0 &&
                token1 &&
                negMax &&
                bin
                  .filter(
                    (y) =>
                      Number(y.price) / 1e18 >
                        currentPrice.toNumber() * Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) &&
                      Number(y.token0Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
                  )
                  .filter(
                    (z) =>
                      !(
                        Number(z.token0Liquidity) / Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) >
                          0 && Number(z.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
                      )
                  )
                  .filter(
                    (a) =>
                      formatDollar({
                        num:
                          (Number(a.token0Liquidity) - Number(a.token0Borrowed)) /
                          Number(`1e${token0?.wrapped.decimals}`),
                        dollarSign: false,
                      }) !== '0.00'
                  )
                  .map((x) => (
                    <LDDataRowNeg
                      spread={
                        ((Number(x.token0Liquidity) - Number(x.token0Borrowed)) /
                          Number(`1e${token0?.wrapped.decimals}`) /
                          negMax) *
                        100
                      }
                      // spread={75 / 100}
                      key={Number(x.price) / Number(`1e${liqNum}`)}
                    >
                      <LDDataCellInNeg>{(Number(x.price) / Number(`1e${liqNum}`)).toFixed(2)}</LDDataCellInNeg>
                      <LDDataCellOutNeg>
                        {formatDollar({
                          num:
                            (Number(x.token0Liquidity) - Number(x.token0Borrowed)) /
                            Number(`1e${token0?.wrapped.decimals}`),
                          dollarSign: false,
                        })}
                      </LDDataCellOutNeg>
                    </LDDataRowNeg>
                  ))
                  .reverse()}
          </NegativeData>
        )}
        {/* </NegativeWrapper> */}

        <PriceWrapper>
          {token0 && token1 && <ThemedText.BodyPrimary>{formatBNToString(currentPrice)}</ThemedText.BodyPrimary>}
          {token0 && token1 && <ThemedText.BodyPrimary>{formatBNToString(currentPrice)}</ThemedText.BodyPrimary>}
        </PriceWrapper>
        <LDHeaderRow>
          <LDHeaderCellIn>
            Price ({token1?.symbol}/{token0?.symbol})
          </LDHeaderCellIn>
          <LDHeaderCellOut>Amount ({!inverse ? token0?.symbol : token1?.symbol})</LDHeaderCellOut>
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
        ) : (
          <PositiveData>
            {inverse
              ? bin &&
                currentPrice &&
                token0 &&
                token1 &&
                negMax &&
                token0?.symbol === 'wBTC' &&
                token1?.symbol === 'WETH'
                ? bin
                    .filter(
                      (y) =>
                        Number(y.price) / 1e18 >
                          currentPrice.toNumber() *
                            Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) &&
                        Number(y.token0Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
                    )
                    .filter(
                      (z) =>
                        !(
                          Number(z.token0Liquidity) /
                            Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) >
                            0 && Number(z.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
                        )
                    )
                    .filter(
                      (a) =>
                        formatDollar({
                          num:
                            (Number(a.token0Liquidity) - Number(a.token0Borrowed)) /
                            Number(`1e${token0?.wrapped.decimals}`),
                          dollarSign: false,
                        }) !== '0.00'
                    )
                    .map((x) => (
                      <LDDataRowNeg
                        spread={
                          ((Number(x.token0Liquidity) - Number(x.token0Borrowed)) /
                            Number(`1e${token0?.wrapped.decimals}`) /
                            negMax) *
                          100
                        }
                        // spread={75 / 100}
                        key={Number(x.price) / Number(`1e${liqNum}`)}
                      >
                        <LDDataCellInNeg>{(1 / (Number(x.price) / Number(`1e${liqNum}`))).toFixed(6)}</LDDataCellInNeg>
                        <LDDataCellOutNeg>
                          {formatDollar({
                            num:
                              (Number(x.token0Liquidity) - Number(x.token0Borrowed)) /
                              Number(`1e${token0?.wrapped.decimals}`),
                            dollarSign: false,
                          })}
                        </LDDataCellOutNeg>
                      </LDDataRowNeg>
                    ))
                : bin &&
                  currentPrice &&
                  token0 &&
                  token1 &&
                  negMax &&
                  bin
                    .filter(
                      (y) =>
                        Number(y.price) / 1e18 < currentPrice.toNumber() &&
                        Number(y.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
                    )
                    .filter(
                      (z) =>
                        !(
                          Number(z.token0Liquidity) /
                            Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) >
                            0 && Number(z.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
                        )
                    )
                    .filter(
                      (a) =>
                        formatDollar({
                          num:
                            (Number(a.token1Liquidity) - Number(a.token1Borrowed)) /
                            Number(`1e${token1?.wrapped.decimals}`),
                          dollarSign: false,
                        }) !== '0.00'
                    )
                    .map((x) => (
                      <LDDataRowNeg
                        spread={
                          ((Number(x.token1Liquidity) - Number(x.token1Borrowed)) /
                            Number(`1e${token1?.wrapped.decimals}`) /
                            posMax) *
                          100
                        }
                        key={Number(x.price) / Number(`1e${liqNum}`)}
                      >
                        <LDDataCellIn>{(Number(x.price) / Number(`1e${liqNum}`)).toFixed(6)}</LDDataCellIn>
                        <LDDataCellOut>
                          {formatDollar({
                            num:
                              (Number(x.token1Liquidity) - Number(x.token1Borrowed)) /
                              Number(`1e${token1?.wrapped.decimals}`),
                            dollarSign: false,
                          })}
                        </LDDataCellOut>
                      </LDDataRowNeg>
                    ))
                    .reverse()
              : bin &&
                currentPrice &&
                token0 &&
                token1 &&
                posMax &&
                bin
                  .filter(
                    (y) =>
                      Number(y.price) / 1e18 <
                        currentPrice.toNumber() * Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) &&
                      Number(y.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
                  )
                  .filter(
                    (z) =>
                      !(
                        Number(z.token0Liquidity) / Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) >
                          0 && Number(z.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
                      )
                  )
                  .filter(
                    (a) =>
                      formatDollar({
                        num:
                          (Number(a.token1Liquidity) - Number(a.token1Borrowed)) /
                          Number(`1e${token1?.wrapped.decimals}`),
                        dollarSign: false,
                      }) !== '0.00'
                  )
                  .map((x) => (
                    <LDDataRow
                      spread={
                        ((Number(x.token1Liquidity) - Number(x.token1Borrowed)) /
                          Number(`1e${token1?.wrapped.decimals}`) /
                          posMax) *
                        100
                      }
                      key={Number(x.price) / Number(`1e${liqNum}`)}
                    >
                      <LDDataCellIn>{(Number(x.price) / Number(`1e${liqNum}`)).toFixed(2)}</LDDataCellIn>
                      <LDDataCellOut>
                        {formatDollar({
                          num:
                            (Number(x.token1Liquidity) - Number(x.token1Borrowed)) /
                            Number(`1e${token1?.wrapped.decimals}`),
                          dollarSign: false,
                        })}
                      </LDDataCellOut>
                    </LDDataRow>
                  ))
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
  top: 0;
`
const LDHeaderCellIn = styled.div`
  margin-bottom: 1rem;
  font-size: 0.75rem;
`
const LDHeaderCellOut = styled.div`
  margin-bottom: 1rem;
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
