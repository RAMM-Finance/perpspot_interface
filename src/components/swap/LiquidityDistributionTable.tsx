import React from 'react'
import styled from 'styled-components/macro'

const LiquidityDistributionTable = () => {
  return (
    <>
      <LDHeaderRow>
        <LDHeaderCellIn>Price (fUSDC)</LDHeaderCellIn>
        <LDHeaderCellOut>Amount (fETH)</LDHeaderCellOut>
      </LDHeaderRow>
      <LDDataRow>
        <LDDataCellIn>1960</LDDataCellIn>
        <LDDataCellOut>1194.72</LDDataCellOut>
      </LDDataRow>
      <LDDataRow>
        <LDDataCellIn>1960</LDDataCellIn>
        <LDDataCellOut>1194.72</LDDataCellOut>
      </LDDataRow>
      <LDDataRow>
        <LDDataCellIn>1960</LDDataCellIn>
        <LDDataCellOut>1194.72</LDDataCellOut>
      </LDDataRow>
      <LDDataRow>
        <LDDataCellIn>1960</LDDataCellIn>
        <LDDataCellOut>1194.72</LDDataCellOut>
      </LDDataRow>
      <LDDataRow>
        <LDDataCellIn>1960</LDDataCellIn>
        <LDDataCellOut>1194.72</LDDataCellOut>
      </LDDataRow>
      <LDDataRow>
        <LDDataCellIn>1960</LDDataCellIn>
        <LDDataCellOut>1194.72</LDDataCellOut>
      </LDDataRow>
      <LDDataRow>
        <LDDataCellIn>1960</LDDataCellIn>
        <LDDataCellOut>1194.72</LDDataCellOut>
      </LDDataRow>
      <LDDataRow>
        <LDDataCellIn>1960</LDDataCellIn>
        <LDDataCellOut>1194.72</LDDataCellOut>
      </LDDataRow>
      <LDDataRow>
        <LDDataCellIn>1960</LDDataCellIn>
        <LDDataCellOut>1194.72</LDDataCellOut>
      </LDDataRow>
      <LDDataRow>
        <LDDataCellIn>1960</LDDataCellIn>
        <LDDataCellOut>1194.72</LDDataCellOut>
      </LDDataRow>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <p>1960</p>
        <p>1960</p>
      </div>
      <LDDataRowNeg>
        <LDDataCellInNeg>1960</LDDataCellInNeg>
        <LDDataCellOutNeg>1194.72</LDDataCellOutNeg>
      </LDDataRowNeg>
      <LDDataRowNeg>
        <LDDataCellInNeg>1960</LDDataCellInNeg>
        <LDDataCellOutNeg>1194.72</LDDataCellOutNeg>
      </LDDataRowNeg>
      <LDDataRowNeg>
        <LDDataCellInNeg>1960</LDDataCellInNeg>
        <LDDataCellOutNeg>1194.72</LDDataCellOutNeg>
      </LDDataRowNeg>
      <LDDataRowNeg>
        <LDDataCellInNeg>1960</LDDataCellInNeg>
        <LDDataCellOutNeg>1194.72</LDDataCellOutNeg>
      </LDDataRowNeg>
      <LDDataRowNeg>
        <LDDataCellInNeg>1960</LDDataCellInNeg>
        <LDDataCellOutNeg>1194.72</LDDataCellOutNeg>
      </LDDataRowNeg>
      <LDDataRowNeg>
        <LDDataCellInNeg>1960</LDDataCellInNeg>
        <LDDataCellOutNeg>1194.72</LDDataCellOutNeg>
      </LDDataRowNeg>
      <LDDataRowNeg>
        <LDDataCellInNeg>1960</LDDataCellInNeg>
        <LDDataCellOutNeg>1194.72</LDDataCellOutNeg>
      </LDDataRowNeg>
      <LDDataRowNeg>
        <LDDataCellInNeg>1960</LDDataCellInNeg>
        <LDDataCellOutNeg>1194.72</LDDataCellOutNeg>
      </LDDataRowNeg>
      <LDDataRowNeg>
        <LDDataCellInNeg>1960</LDDataCellInNeg>
        <LDDataCellOutNeg>1194.72</LDDataCellOutNeg>
      </LDDataRowNeg>
      <LDDataRowNeg>
        <LDDataCellInNeg>1960</LDDataCellInNeg>
        <LDDataCellOutNeg>1194.72</LDDataCellOutNeg>
      </LDDataRowNeg>
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

const LDDataRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr;
  background-image: linear-gradient(to right, transparent, rgba(0, 118, 27, 0.47));
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

const LDDataRowNeg = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr;
  background-image: linear-gradient(to right, transparent, rgba(131, 0, 0, 0.47));

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
