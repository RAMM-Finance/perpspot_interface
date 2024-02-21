import { useWeb3React } from '@web3-react/core'
import { useVaultContract } from 'hooks/useContract'
import { useEffect, useState } from 'react'
import styled from 'styled-components/macro'

import { ReactComponent as LimitlessLogo } from '../../assets/svg/Limitless_Logo_Black.svg'
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
  const vaultContract = useVaultContract()
  const { account, provider } = useWeb3React()
  const [llpPrice, setLlpPrice] = useState<number>(0)
  const [llpBalance, setLlpBalance] = useState<number>(0)

  useEffect(() => {
    // getllpPrice
    if (!provider || !vaultContract) return

    const call = async () => {
      try {
        const price: any = await vaultContract.previewRedeem(`${1e18}`)
        setLlpPrice(() => Number(price) / 1e18)
      } catch (error) {
        console.log('codebyowners err')
      }
    }

    call()
  }, [provider, vaultContract])

  useEffect(() => {
    // getBalance
    if (!account || !provider || !vaultContract) return

    const call = async () => {
      try {
        const balance = await vaultContract.balanceOf(account)
        console.log('balance', balance.toString())
        setLlpBalance(() => Number(balance) / 1e18)
      } catch (error) {
        console.log('codebyowners err')
      }
    }
    call()
  }, [account, provider, vaultContract])

  const WETH_SRC =
    'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/arbitrum/assets/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png'
  const WBTC_SRC =
    'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/arbitrum/assets/0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f/logo.png'
  const USDC_SRC =
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
  const savingsCollateral = [
    {
      asset: {
        isIcon: false,
        icon: <LimitlessLogo style={{ marginRight: '16px' }} width={22} fill="#fff" />,
        title: 'LLP',
        desc: 'No data',
      },
      apy: '+4.75%',
      composition: { isIcon: true, src: [WETH_SRC, WBTC_SRC, USDC_SRC] },
      value: llpBalance * llpPrice,
      price: llpPrice,
      actions: 'saving',
    },
  ]

  const tokenCollateral = [
    {
      asset: { icon: dollarIcon, title: 'USDC' },
      balance: '0.00%',
      composition: '0.00%',
      value: 0.0000,
      price: 0.99,
      actions: 'token',
    },
    {
      asset: { icon: dollarIcon, title: 'USDT' },
      balance: '0.00%',
      composition: '0.00%',
      value: 0.0000,
      price: 0.99,
      actions: 'token',
    },
    {
      asset: { icon: dollarIcon, title: 'ETH' },
      balance: '0.00%',
      composition: '0.00%',
      value:0.0000,
      price: 0.99,
      actions: 'token',
    },
    {
      asset: { icon: dollarIcon, title: 'BTC' },
      balance: '0.00%',
      composition: '0.00%',
      value: 0.0000,
      price: 0.99,
      actions: 'token',
    },
  ]

  return (
    <TabWrapper>
      <TabTitle title="Portfolio Overview" />
      <PoolDetailBox>No Data</PoolDetailBox>

      <CollateralWrapper>
        {/* Saving Collateral */}
        <SubTitle>LLP Savings</SubTitle>
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
