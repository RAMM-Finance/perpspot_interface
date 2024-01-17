import { Currency } from '@uniswap/sdk-core'
import { LoadingBubble } from 'components/Tokens/loading'
import { BinData } from 'hooks/useLMTV2Positions'
import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatDollar } from 'utils/formatNumbers'

const LiquidityDistributionTable = ({
  token0,
  token1,
  currentPrice,
  bin,
}: {
  token0: Currency | undefined
  token1: Currency | undefined
  currentPrice: number
  bin: BinData[] | undefined
}) => {
  token0 && token1 && console.log(token0, token1)
  const [liqNum, priceNum] = useMemo(() => {
    if (token0 && token1) {
      if (token0?.wrapped.symbol === 'wBTC' && token1?.wrapped.symbol === 'WETH') {
        return [28, 10]
      } else if (token0?.wrapped.symbol === 'WETH' && token1?.wrapped.symbol === 'USDC') {
        return [6, -12]
      } else if (token0?.wrapped.symbol === 'wBTC' && token1?.wrapped.symbol === 'USDC') {
        return [16, -2]
      } else {
        return [0, 0]
      }
    } else {
      return [undefined, undefined]
    }
  }, [token0, token1])

  return (
    <>
      <Title>
        <ThemedText.BodySecondary>Borrowable Liquidity</ThemedText.BodySecondary>
      </Title>
      <LDHeaderRow>
        <LDHeaderCellIn>
          Price ({token1?.symbol}/{token0?.symbol})
        </LDHeaderCellIn>
        <LDHeaderCellOut>Amount ({token0?.symbol})</LDHeaderCellOut>
      </LDHeaderRow>
      {bin &&
        token0 &&
        token1 &&
        bin
          .filter(
            (y) =>
              Number(y.price) / Number(`1e${token1?.wrapped.decimals}`) > currentPrice / Number(`1e${priceNum}`) &&
              Number(y.token0Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
          )
          .filter(
            (z) =>
              !(
                Number(z.token0Liquidity) / Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) > 0 &&
                Number(z.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
              )
          )
          .map((x) => (
            <LDDataRowNeg
              // spread={(Number(x.token0Liquidity) / Number(`1e${liqNum}`) / 100 / currentPrice) * 32.5}
              spread={75 / 100}
              key={Number(x.price) / Number(`1e${liqNum}`)}
            >
              <LDDataCellInNeg>{(Number(x.price) / Number(`1e${liqNum}`)).toFixed(2)}</LDDataCellInNeg>
              <LDDataCellOutNeg>
                {formatDollar({
                  num: (Number(x.token0Liquidity) - Number(x.token0Borrowed)) / Number(`1e${token0?.wrapped.decimals}`),
                  dollarSign: false,
                })}
              </LDDataCellOutNeg>
            </LDDataRowNeg>
          ))
          .reverse()}
      <PriceWrapper>
        <ThemedText.BodyPrimary>{(currentPrice / Number(`1e${priceNum}`)).toFixed(2)}</ThemedText.BodyPrimary>
        <ThemedText.BodyPrimary>{(currentPrice / Number(`1e${priceNum}`)).toFixed(2)}</ThemedText.BodyPrimary>
      </PriceWrapper>
      <LDHeaderRow>
        <LDHeaderCellIn>
          Price ({token1?.symbol}/{token0?.symbol})
        </LDHeaderCellIn>
        <LDHeaderCellOut>Amount ({token1?.symbol})</LDHeaderCellOut>
      </LDHeaderRow>
      {bin &&
        token0 &&
        token1 &&
        bin
          .filter(
            (y) =>
              Number(y.price) / Number(`1e${token1?.wrapped.decimals}`) < currentPrice &&
              Number(y.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
          )
          .filter(
            (z) =>
              !(
                Number(z.token0Liquidity) / Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`) > 0 &&
                Number(z.token1Liquidity) / Number(`1e${token1?.wrapped.decimals}`) > 0
              )
          )
          .map((x) => (
            <LDDataRow
              spread={(Number(x.token1Liquidity) / Number(`1e${liqNum}`) / 100 / currentPrice) * 32.5}
              key={Number(x.price) / Number(`1e${liqNum}`)}
            >
              <LDDataCellIn>{(Number(x.price) / Number(`1e${liqNum}`)).toFixed(2)}</LDDataCellIn>
              <LDDataCellOut>
                {formatDollar({
                  num: (Number(x.token1Liquidity) - Number(x.token1Borrowed)) / Number(`1e${token1?.wrapped.decimals}`),
                  dollarSign: false,
                })}
              </LDDataCellOut>
            </LDDataRow>
          ))
          .reverse()}
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
`

const LDHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr;
  padding-bottom: 1rem;
`
const LDHeaderCellIn = styled.div`
  font-size: 0.75rem;
`
const LDHeaderCellOut = styled.div`
  font-size: 0.75rem;
  text-align: end;
`
interface SpreadProps {
  spread: number
}

const LDDataRow = styled.div<SpreadProps>`
  display: grid;
  grid-template-columns: 2fr 2fr;
  background-image: linear-gradient(to right, transparent ${(props) => props.spread}px, rgba(0, 118, 27, 0.47));
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
  background-image: linear-gradient(to right, transparent ${(props) => props.spread}px, rgba(131, 0, 0, 0.47));
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
