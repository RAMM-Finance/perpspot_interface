import { BinData } from 'hooks/useLMTV2Positions'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatDollarAmount } from 'utils/formatNumbers'

const LiquidityDistributionTable = ({ currentPrice, bin }: { currentPrice: number; bin: BinData[] | undefined }) => {
  return (
    <>
      <Title>
        <ThemedText.BodyPrimary>Borrowable Liquidity</ThemedText.BodyPrimary>
      </Title>
      <LDHeaderRow>
        <LDHeaderCellIn>Price (fETH)</LDHeaderCellIn>
        <LDHeaderCellOut>Amount (fUSDC)</LDHeaderCellOut>
      </LDHeaderRow>
      {bin &&
        bin
          .filter((y) => Number(y.price) / 1e18 < currentPrice && Number(y.token1Liquidity) / 1e18 > 0)
          .map((x) => (
            <LDDataRow spread={(Number(x.price) / 1e18 / 100 / currentPrice) * 32.5} key={Number(x.price) / 1e18}>
              <LDDataCellIn>{(Number(x.price) / 1e18).toFixed(2)}</LDDataCellIn>
              <LDDataCellOut>{formatDollarAmount(Number(x.token1Liquidity) / 1e18)}</LDDataCellOut>
            </LDDataRow>
          ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
        <p>{currentPrice.toFixed(2)}</p>
        <p>{currentPrice.toFixed(2)}</p>
      </div>
      {bin &&
        bin
          .filter((y) => Number(y.price) / 1e18 > currentPrice && Number(y.token0Liquidity) / 1e18 > 0)
          .map((x) => (
            <LDDataRowNeg spread={(Number(x.price) / 1e18 / 100 / currentPrice) * 32.5} key={Number(x.price) / 1e18}>
              <LDDataCellInNeg>{(Number(x.price) / 1e18).toFixed(2)}</LDDataCellInNeg>
              <LDDataCellOutNeg>{formatDollarAmount(Number(x.token0Liquidity) / 1e18)}</LDDataCellOutNeg>
            </LDDataRowNeg>
          ))}
    </>
  )
}

export default LiquidityDistributionTable

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
