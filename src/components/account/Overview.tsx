import styled from 'styled-components/macro'

import dollarIcon from '../About/images/aboutDollarDark.png'
import CollateralTable from './CollateralTable'
import Greeks from './Greeks'
import MarginHealth from './MarginHealth'
import Schedule from './Schedule'
import TabTitle from './TabTitle'

export const SubTitle = styled.h4`
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 10px;
  margin-top: 8px;
`

const TabWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const CollateralWrapper = styled.div`
  width: 100%;
  gap: 4px;
  display: flex;
  flex-direction: column;
`

const PoolDetailBox = styled.div`
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgb(21, 21, 27);
  padding: 16px;
  text-align: center;
  color: ${({ theme }) => theme.textTertiary};
  height: 240px;
  margin-bottom: 16px;
`

const MarginGreeksWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin: 16px 0;
`

const Overview = () => {
  const savingsCollateral = [
    {
      asset: { icon: dollarIcon, title: 'aeUSD', desc: 'No data'},
      apy: '+4.75%',
      composition: '0.00%',
      value: { dollar: '0.0000', percent: '+$0.0000' },
      actions: 'saving',
    },
  ]

  const tokenCollateral = [
    {
      asset: { icon: dollarIcon, title: 'USDC' },
      balance: '0.00%',
      composition: '0.00%',
      value: { dollar: '0.0000', percent: null },
      actions: 'token',
    },
    {
      asset: { icon: dollarIcon, title: 'USDT' },
      balance: '0.00%',
      composition: '0.00%',
      value: { dollar: '0.0000', percent: null },
      actions: 'token',
    },
    {
      asset: { icon: dollarIcon, title: 'ETH' },
      balance: '0.00%',
      composition: '0.00%',
      value: { dollar: '0.0000', percent: null },
      actions: 'token',
    },
    {
      asset: { icon: dollarIcon, title: 'BTC' },
      balance: '0.00%',
      composition: '0.00%',
      value: { dollar: '0.0000', percent: null },
      actions: 'token',
    },
  ]

  return (
    <TabWrapper>
      <TabTitle title="Portfolio Overview" />
      <PoolDetailBox>No Data</PoolDetailBox>

      <CollateralWrapper>
        {/* Saving Collateral */}
        <SubTitle>Aevo Savings Collateral</SubTitle>
        <CollateralTable collateral={savingsCollateral} />
        {/* Token Collateral */}
        <SubTitle>Token Collateral</SubTitle>
        <CollateralTable collateral={tokenCollateral} />
      </CollateralWrapper>

      <MarginGreeksWrapper>
        <MarginHealth />
        <Greeks />
      </MarginGreeksWrapper>
      {/* Schedule */}
      <Schedule />
    </TabWrapper>
  )
}

export default Overview
