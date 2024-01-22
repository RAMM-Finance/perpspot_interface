import { Currency } from '@uniswap/sdk-core'
import { SmallButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { LoadingBubble } from 'components/Tokens/loading'
import { BinData } from 'hooks/useLMTV2Positions'
import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatDollar } from 'utils/formatNumbers'

const LiquidityDistributionTable = ({
  token0,
  token1,
  currentPrice,
  bin,
  fee,
}: {
  token0: Currency | undefined
  token1: Currency | undefined
  currentPrice: number
  bin: BinData[] | undefined
  fee?: number
}) => {
  const navigate = useNavigate()
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

  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (bin) {
      ref.current?.scrollTo({ top: 500 })
    }
  }, [bin])

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
        <LDHeaderCellIn>
          Price ({token1?.symbol}/{token0?.symbol})
        </LDHeaderCellIn>
        <LDHeaderCellOut>Amount ({token0?.symbol})</LDHeaderCellOut>
      </LDHeaderRow>
      <Wrapper ref={ref}>
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
            {bin &&
              token0 &&
              token1 &&
              bin
                .filter(
                  (y) =>
                    Number(y.price) / 1e18 > currentPrice &&
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
                    // spread={(Number(x.token0Liquidity) / Number(`1e${liqNum}`) / 100 / currentPrice) * 32.5}
                    spread={75 / 100}
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
          {token0 && token1 && (
            <ThemedText.BodyPrimary>
              {(currentPrice / Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`)).toFixed(2)}
            </ThemedText.BodyPrimary>
          )}
          {token0 && token1 && (
            <ThemedText.BodyPrimary>
              {(currentPrice / Number(`1e${token1?.wrapped.decimals - token0?.wrapped.decimals}`)).toFixed(2)}
            </ThemedText.BodyPrimary>
          )}
        </PriceWrapper>

        {/* <PositiveWrapper> */}
        <LDHeaderRow>
          <LDHeaderCellIn>
            Price ({token1?.symbol}/{token0?.symbol})
          </LDHeaderCellIn>
          <LDHeaderCellOut>Amount ({token1?.symbol})</LDHeaderCellOut>
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
            {bin &&
              token0 &&
              token1 &&
              bin
                .filter(
                  (y) =>
                    Number(y.price) / 1e18 < currentPrice &&
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
                    spread={(Number(x.token1Liquidity) / Number(`1e${liqNum}`) / 100) * 32.5}
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
        {/* </PositiveWrapper> */}
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
