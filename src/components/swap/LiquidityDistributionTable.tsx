import { formatNumber, NumberType } from '@uniswap/conedison/format'
import styled from 'styled-components/macro'

const LiquidityDistributionTable = ({ currentPrice, bids }: { currentPrice: number; bids: number[][] }) => {
  return (
    <>
      <LDHeaderRow>
        <LDHeaderCellIn>Price (fETH)</LDHeaderCellIn>
        <LDHeaderCellOut>Amount (fUSDC)</LDHeaderCellOut>
      </LDHeaderRow>
      {bids
        .filter((bid) => bid[0] < currentPrice)
        .map((higherBid) => (
          <LDDataRow spread={(higherBid[1] / 100 / currentPrice) * 32.5} key={higherBid[0]}>
            <LDDataCellIn>{formatNumber(higherBid[0], NumberType.FiatTokenPrice)}</LDDataCellIn>
            <LDDataCellOut>{formatNumber(higherBid[1], NumberType.FiatTokenPrice)}</LDDataCellOut>
          </LDDataRow>
        ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
        <p>{currentPrice}</p>
        <p>{currentPrice}</p>
      </div>
      {bids
        .filter((bid) => bid[0] > currentPrice)
        .map((higherBid) => (
          <LDDataRowNeg spread={(higherBid[1] / 100 / currentPrice) * 32.5} key={higherBid[0]}>
            <LDDataCellInNeg>{formatNumber(higherBid[0], NumberType.FiatTokenPrice)}</LDDataCellInNeg>
            <LDDataCellOutNeg>{formatNumber(higherBid[1], NumberType.FiatTokenPrice)}</LDDataCellOutNeg>
          </LDDataRowNeg>
        ))}
    </>
  )
}

export default LiquidityDistributionTable

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

const LDDataRowNeg = styled.div<SpreadProps>`
  display: grid;
  grid-template-columns: 2fr 2fr;
  background-image: linear-gradient(to right, transparent ${(props) => props.spread}px, rgba(131, 0, 0, 0.47));

  padding: 0.2rem;
  border-radius: 5px;
  margin-bottom: 0.15rem;
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

function LiquidityTableRow() {}
