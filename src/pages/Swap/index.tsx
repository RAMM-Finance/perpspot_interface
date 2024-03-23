import { Trace } from '@uniswap/analytics'
import { InterfacePageName } from '@uniswap/analytics-events'
import { Currency, TradeType } from '@uniswap/sdk-core'
// import { computePoolAddress } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { PoolDataChart } from 'components/ExchangeChart/PoolDataChart'
import Footer from 'components/Footer'
import Disclaimer from 'components/NavBar/Disclaimer'
import { Input as NumericalInput } from 'components/NumericalInput'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import LiquidityDistributionTable from 'components/swap/LiquidityDistributionTable'
import { SelectPool } from 'components/swap/PoolSelect'
import { PostionsContainer } from 'components/swap/PostionsContainer'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { useCurrency } from 'hooks/Tokens'
import { useBulkBinData, useLeveragedLMTPositions, useLMTOrders } from 'hooks/useLMTV2Positions'
import { computePoolAddress, usePool } from 'hooks/usePools'
import JoinModal from 'pages/Join'
import React, { useMemo, useState } from 'react'
import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppPoolOHLC } from 'state/application/hooks'
import { InterfaceTrade } from 'state/routing/types'
import { TradeState } from 'state/routing/types'
import { useCurrentInputCurrency, useCurrentOutputCurrency, useCurrentPool } from 'state/user/hooks'
import styled from 'styled-components/macro'

import { PageWrapper, SwapWrapper } from '../../components/swap/styleds'
// import { SwitchLocaleLink } from '../../components/SwitchLocaleLink'
import { useIsSwapUnsupported } from '../../hooks/useIsSwapUnsupported'
import { ActiveSwapTab } from '../../state/swap/actions'
import { useSwapState } from '../../state/swap/hooks'
import { ResponsiveHeaderText } from '../RemoveLiquidity/styled'
import SwapTabContent from './swapModal'
import TradeTabContent from './tradeModal'

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

const SwapSection = styled.div`
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

const SwapHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  grid-column: 1;
  grid-row: 2;
`

const MainWrapper = styled.article`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1.6fr 0.6fr 365px;

  margin-top: 0.75rem;
  grid-template-rows: 0 50vh 30vh;
  grid-column-gap: 0.75rem;

  @media only screen and (max-width: 1265px) {
    grid-template-columns: 1fr 0 360px;
    grid-column-gap: 0.5rem;
  }
`

export function getIsValidSwapQuote(
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined,
  tradeState: TradeState,
  swapInputError?: ReactNode
): boolean {
  return !!swapInputError && !!trade && (tradeState === TradeState.VALID || tradeState === TradeState.SYNCING)
}

// function getSymbol(pool: Pool | undefined, chainId: number | undefined): string | undefined {
//   if (!pool || !chainId) return undefined
//   const invertPrice = new BN(pool.token0Price.toFixed(18)).lt(1)
//   const baseSymbol = invertPrice ? pool.token1.symbol : pool.token0.symbol
//   const quoteSymbol = invertPrice ? pool.token0.symbol : pool.token1.symbol
//   if (isFakePair(chainId, pool.token0.address.toLowerCase(), pool.token1.address.toLowerCase())) {
//     return getFakeSymbol(chainId, pool.token0.address.toLowerCase(), pool.token1.address.toLowerCase())
//   }

//   return JSON.stringify({
//     poolAddress: computePoolAddress({
//       factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
//       tokenA: pool.token0,
//       tokenB: pool.token1,
//       fee: pool.fee,
//     }),
//     baseSymbol,
//     quoteSymbol,
//   })
// }

const PositionsWrapper = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
  margin-bottom: 0.5rem;
  margin-top: 0.75rem;
  border-radius: 10px;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  overflow-x: scroll;
  grid-row: 3;
  grid-area: 3 / 1 / auto / 3;
  /* min-width: 740px; */
  ::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 1050px) {
    grid-column: 1 / 3;
    /* grid-area: 3 / 1 / auto / 2; */
  }
`

const LiquidityDistibutionWrapper = styled.div`
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  margin-bottom: 0.5rem;
  width: 100%;
  min-width: 230px;
  border-radius: 10px;
  padding: 1rem;
  height: 100%;
  overflow: hidden;
  grid-column: 2;
  grid-row: 2 / 3;

  @media (max-width: 1265px) {
    display: none;
  }
`

const PinWrapper = styled.div`
  grid-column: 1 / 3;
  grid-row: 1;
  height: 100%;
`
interface PoolItem {
  token0: string | undefined
  token1: string | undefined
  fee: number | undefined
}

function adjustTokensForChain(
  chainId: number | undefined,
  pool: PoolItem
): { adjustedChainId: number | undefined; adjustedPool: any } {
  // Check for specific condition and adjust if necessary
  if (
    chainId === 80085 &&
    pool.token0 === '0x174652b085C32361121D519D788AbF0D9ad1C355' &&
    pool.token1 === '0x35B4c60a4677EcadaF2fe13fe3678efF724be16b' &&
    pool.fee === 500
  ) {
    return {
      adjustedChainId: 42161,
      adjustedPool: {
        token0: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        token1: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        fee: 500,
      },
    }
  }

  return { adjustedChainId: chainId, adjustedPool: pool }
}

export default function Swap({ className }: { className?: string }) {
  const [warning, setWarning] = useState(localStorage.getItem('warning') === 'true')

  const { account, chainId } = useWeb3React()
  const { activeTab } = useSwapState()

  const inputCurrency = useCurrentInputCurrency()
  const outputCurrency = useCurrentOutputCurrency()
  const currentPool = useCurrentPool()
  const poolKey = currentPool?.poolKey
  const token0 = useCurrency(poolKey?.token0)
  const token1 = useCurrency(poolKey?.token1)

  const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, poolKey?.fee ?? undefined)

  const { adjustedChainId, adjustedPool } = adjustTokensForChain(chainId, {
    token0: pool?.token0.address,
    token1: pool?.token1.address,
    fee: pool?.fee,
  })

  const swapIsUnsupported = useIsSwapUnsupported(inputCurrency, outputCurrency)

  const { loading: leverageLoading, positions: leveragePositions } = useLeveragedLMTPositions(account)

  const { loading: orderLoading, Orders: limitOrders } = useLMTOrders(account)

  const location = useLocation()
  const poolsOHLC = useAppPoolOHLC()
  // const poolKeyList = useRawPoolKeyList()
  const chartSymbol = useMemo(() => {
    if (pool && poolsOHLC && chainId) {
      const id = getPoolId(adjustedPool.token0, adjustedPool.token1, adjustedPool.fee)

      // const id = getPoolId(pool.token0.address, pool.token1.address, pool.fee)
      if (!poolsOHLC[id]) return null

      const base = poolsOHLC[id]?.base
      if (!base) {
        const token0Price = new BN(pool.token0Price.toFixed(18))
        const d1 = token0Price.minus(poolsOHLC[id].price24hAgo).abs()
        const d2 = new BN(1).div(token0Price).minus(poolsOHLC[id].price24hAgo).abs()
        return JSON.stringify({
          poolAddress: computePoolAddress({
            factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId == 80085 ? 42161 : chainId],
            tokenA: adjustedPool.token0,
            tokenB: adjustedPool.token1,
            fee: adjustedPool.fee,
          }),
          baseSymbol: d2.lt(d1) ? pool.token1.symbol : pool.token0.symbol,
          quoteSymbol: d2.lt(d1) ? pool.token0.symbol : pool.token1.symbol,
          token0IsBase: d1.lt(d2),
        })
      }
      const invert = base.toLowerCase() === pool.token1.address.toLowerCase()
      return JSON.stringify({
        poolAddress: computePoolAddress({
          factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId == 80085 ? 42161 : chainId],
          tokenA: adjustedPool.token0,
          tokenB: adjustedPool.token1,
          fee: adjustedPool.fee,
        }),
        baseSymbol: invert ? pool.token1.symbol : pool.token0.symbol,
        quoteSymbol: invert ? pool.token0.symbol : pool.token1.symbol,
        token0IsBase: !invert,
      })
    }
    return null
  }, [poolsOHLC, pool, chainId, adjustedPool])

  const { result: binData } = useBulkBinData(pool ?? undefined)

  return (
    <Trace page={InterfacePageName.SWAP_PAGE} shouldLogImpression>
      <PageWrapper>
        {warning ? null : <Disclaimer setWarning={setWarning} />}
        <MainWrapper>
          {/* <PinWrapper>
            <PinnedPools />
          </PinWrapper> */}
          <SwapHeaderWrapper>
            <SelectPool />
            {/*inputCurrency && outputCurrency ? (
              <SelectPool />
            ) : (
              <ThemedText.BodyPrimary>Pair not found</ThemedText.BodyPrimary>
            )*/}
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
    </Trace>
  )
}
