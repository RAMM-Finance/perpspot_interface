import { Trace } from '@uniswap/analytics'
import { InterfacePageName } from '@uniswap/analytics-events'
import { Currency, TradeType } from '@uniswap/sdk-core'
import { computePoolAddress, Pool } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { PoolDataChart } from 'components/ExchangeChart/PoolDataChart'
import Footer from 'components/Footer'
import Disclaimer from 'components/NavBar/Disclaimer'
import { Input as NumericalInput } from 'components/NumericalInput'
import LiquidityDistributionTable from 'components/swap/LiquidityDistributionTable'
import { SelectPool } from 'components/swap/PoolSelect'
import { PostionsContainer } from 'components/swap/PostionsContainer'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
// import _ from 'lodash'
// import { FakeTokens, FETH, FUSDC } from "constants/fake-tokens"
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { getFakeSymbol, isFakePair } from 'constants/fake-tokens'
import { useCurrency } from 'hooks/Tokens'
// import { useBestPool } from 'hooks/useBestPool'
import { usePoolsData } from 'hooks/useLMTPools'
import { useBulkBinData, useLeveragedLMTPositions, useLMTOrders } from 'hooks/useLMTV2Positions'
import { usePool } from 'hooks/usePools'
// import Widget from 'components/Widget'
// import { useSwapWidgetEnabled } from 'featureFlags/flags/swapWidget'
import JoinModal from 'pages/Join'
import React, { useMemo, useState } from 'react'
import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { InterfaceTrade } from 'state/routing/types'
import { TradeState } from 'state/routing/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { PageWrapper, SwapWrapper } from '../../components/swap/styleds'
// import { SwitchLocaleLink } from '../../components/SwitchLocaleLink'
import { useIsSwapUnsupported } from '../../hooks/useIsSwapUnsupported'
import { ActiveSwapTab, Field } from '../../state/swap/actions'
import { useSwapState } from '../../state/swap/hooks'
import { ResponsiveHeaderText } from '../RemoveLiquidity/styled'
import SwapTabContent from './swapModal'
import TradeTabContent from './tradeModal'

// const TradeTabContent = React.lazy(() => import('./tradeModal'))
// const SwapTabContent = React.lazy(() => import('./swapModal'))

// const BorrowTabContent = React.lazy(() => import('./borrowModal'));

export const StyledNumericalInput = styled(NumericalInput)`
  width: 45px;
  text-align: left;
  padding: 10px;
  height: 20px;
  line-height: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.textSecondary};
`

export const StyledBorrowNumericalInput = styled(NumericalInput)`
  width: 120px;
  text-align: left;
  padding: 10px;
`

export const ArrowContainer = styled.div`
  display: inline-block;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  rotate: -45deg;
  width: 100%;
  height: 100%;
`

export const LeverageInputSection = styled(ResponsiveHeaderText)`
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  padding-right: 14px;
  align-items: center;
  justify-content: space-around;
  position: relative;
  font-size: 12px;
`
export const InputHeader = styled.div`
  padding-left: 6px;
  padding-top: 3px;
`

export const SwapSection = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.backgroundSurface};
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;

  &:focus-within {
    border: 1px solid ${({ theme }) => theme.accentActive};
  }
`

export const InputLeverageSection = styled(SwapSection)`
  // border-top-left-radius: 0;
  // border-top-right-radius: 0;
  background-color: ${({ theme }) => theme.backgroundSurface};
  margin-bottom: 20px;
`

// border-bottom-left-radius: ${({ leverage }) => leverage && '0'};
// border-bottom-right-radius: ${({ leverage }) => leverage && '0'};
// border-bottom: ${({ leverage }) => leverage && 'none'};
// margin-bottom: ${({ leverage }) => (leverage ? '0' : '20px')};
// display: ${({ leverage }) => (leverage ? 'block' : 'none')};
export const InputSection = styled(SwapSection)`
  background-color: ${({ theme }) => theme.surface1};
  margin-bottom: 10px;
  padding: 10px;
  padding-top: 8px;
  padding-bottom: 8px;
  margin-top: 5px;
`

export const OutputSwapSection = styled(SwapSection)<{ showDetailsDropdown: boolean }>`
  padding: 10px;
  background-color: ${({ theme }) => theme.surface1};
`
export const LimitInputSection = styled(SwapSection)`
  padding: 15px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.surface1};
`

export const LeverageGaugeSection = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 16px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  padding-top: 8px;
  padding-bottom: 0px;
  &:focus-within {
    border: 1px solid ${({ theme }) => theme.accentActive};
  }
  border: 1px solid ${({ theme }) => theme.backgroundSurface};
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  &:focus-within {
    border: 1px solid transparent;
  }
`

export const DetailsSwapSection = styled(SwapSection)`
  border: none;
  width: 100%;
`

// const PositionsContainer = styled.div`
//   width: calc(100% - 315px);
//   background-color: ${({ theme }) => theme.backgroundSurface};
//   border: solid 1px ${({ theme }) => theme.backgroundOutline};
//   margin-bottom: 0.5rem;
//   margin-left: 0.25rem;
//   margin-right: 0.25rem;
//   height: calc(100vh - 582px);
//   min-height: 150px;
//   border-radius: 10px;
//   overflow-y: scroll;
//   ::-webkit-scrollbar {
//     display: none;
//   }
//   overflow-x: scroll;
//   ::-webkit-scrollbar {
//     display: none;
//   }
// `

// const StatsContainer = styled.div`
//   background-color: ${({ theme }) => theme.backgroundSurface};
//   border-radius: 10px;
//   /* max-width: 1200px; */
//   padding: 18px;
//   width: 100%;
//   margin-bottom: 25px;
//   margin-left: auto;
// `

// const RightContainer = styled.div`
//   display: flex;
//   width: 100%;
//   min-width: calc(100% - 420px);
//   flex-direction: column;
//   justify-content: flex-start;
//   align-content: center;
// `

// const ActivityWrapper = styled.section`
//   overflow: hidden;

//   background-color: ${({ theme }) => theme.backgroundSurface};
// `
// const ActivityInnerWarpper = styled.div`
//   padding: 20px 30px;
//   max-height: 390px;
//   overflow-y: auto;

//   ::-webkit-scrollbar {
//     background-color: transparent;
//     width: 10px;
//   }

//   ::-webkit-scrollbar-thumb {
//     background-color: ${({ theme }) => theme.background};
//     border: none;
//   }
//   ::-webkit-scrollbar-track {
//     background-color: transparent;
//   }
// `

const SwapHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
`

const MainWrapper = styled.article`
  width: 100%;
  display: grid;
  grid-template-columns: 1.7fr 0.6fr 0.7fr;
  grid-template-rows: 65vh 35vh;
  grid-gap: 0.5rem;
  margin-top: 0.7rem;
`

export function getIsValidSwapQuote(
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined,
  tradeState: TradeState,
  swapInputError?: ReactNode
): boolean {
  return !!swapInputError && !!trade && (tradeState === TradeState.VALID || tradeState === TradeState.SYNCING)
}

function getSymbol(pool: Pool | undefined, chainId: number | undefined): string | undefined {
  if (!pool || !chainId) return undefined
  const invertPrice = new BN(pool.token0Price.toFixed(18)).lt(1)
  const baseSymbol = invertPrice ? pool.token1.symbol : pool.token0.symbol
  const quoteSymbol = invertPrice ? pool.token0.symbol : pool.token1.symbol
  if (isFakePair(chainId, pool.token0.address.toLowerCase(), pool.token1.address.toLowerCase())) {
    return getFakeSymbol(chainId, pool.token0.address.toLowerCase(), pool.token1.address.toLowerCase())
  }

  return JSON.stringify({
    poolAddress: computePoolAddress({
      factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
      tokenA: pool.token0,
      tokenB: pool.token1,
      fee: pool.fee,
    }),
    baseSymbol,
    quoteSymbol,
  })
}

const PositionsWrapper = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
  margin-bottom: 0.5rem;
  min-height: 30vh;
  // height: 100%;
  border-radius: 10px;
  overflow-y: scroll;
  grid-column: 1/3;
  grid-row: 2;
  ::-webkit-scrollbar {
    display: none;
  }
  overflow-x: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
`

const LiquidityDistibutionWrapper = styled.div`
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  margin-bottom: 0.5rem;
  width: 100%;
  border-radius: 10px;
  padding: 1rem;
  height: 100%;
  overflow: hidden;
`

export default function Swap({ className }: { className?: string }) {
  const [warning, setWarning] = useState(localStorage.getItem('warning') === 'true')

  const { account, chainId, provider } = useWeb3React()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },

    activeTab,
    poolFee,
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const [poolState, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, poolFee ?? undefined)

  const swapIsUnsupported = useIsSwapUnsupported(inputCurrency, outputCurrency)

  const {
    loading: leverageLoading,
    positions: leveragePositions,
    error,
    syncing: leverageSyncing,
  } = useLeveragedLMTPositions(account)

  const { loading: orderLoading, Orders: limitOrders } = useLMTOrders(account)

  const location = useLocation()
  const { result: poolData } = usePoolsData()

  const chartSymbol = useMemo(() => getSymbol(pool ?? undefined, chainId), [pool, chainId])
  const { result: binData } = useBulkBinData(pool ?? undefined)

  return (
    <Trace page={InterfacePageName.SWAP_PAGE} shouldLogImpression>
      <>
        <PageWrapper>
          {warning ? null : <Disclaimer setWarning={setWarning} />}

          <MainWrapper>
            <SwapHeaderWrapper>
              {inputCurrency && outputCurrency ? (
                <SelectPool />
              ) : (
                <ThemedText.BodyPrimary>Pair not found</ThemedText.BodyPrimary>
              )}
              {chartSymbol && chainId && <PoolDataChart symbol={chartSymbol} chainId={chainId} />}
            </SwapHeaderWrapper>

            <LiquidityDistibutionWrapper>
              <LiquidityDistributionTable
                bin={binData}
                address0={pool?.token0.address}
                address1={pool?.token1?.address}
                fee={pool?.fee}
                chainId={chainId}
              />
            </LiquidityDistibutionWrapper>
            <SwapWrapper chainId={chainId} className={className} id="swap-page">
              {(activeTab === ActiveSwapTab.LONG || activeTab === ActiveSwapTab.SHORT) && <TradeTabContent />}
              {activeTab === ActiveSwapTab.SWAP && <SwapTabContent />}
            </SwapWrapper>
            <PositionsWrapper>
              <PostionsContainer
                account={account}
                orders={limitOrders}
                loadingOrders={orderLoading}
                positions={leveragePositions}
                loadingPositions={leverageLoading}
              />
            </PositionsWrapper>
          </MainWrapper>
          {location.pathname.substring(0, 6) === '/join/' ? <JoinModal /> : null}
          <Footer />
        </PageWrapper>
        {!swapIsUnsupported ? null : (
          <UnsupportedCurrencyFooter show={swapIsUnsupported} currencies={[inputCurrency, outputCurrency]} />
        )}
      </>
    </Trace>
  )
}
