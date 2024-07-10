import { Trace } from '@uniswap/analytics'
import { InterfacePageName } from '@uniswap/analytics-events'
import { Currency, TradeType } from '@uniswap/sdk-core'
// import { computePoolAddress } from '@uniswap/v3-sdk'
import { PoolDataChart } from 'components/ExchangeChart/PoolDataChart'
import Footer from 'components/Footer'
import { Input as NumericalInput } from 'components/NumericalInput'
import { PinnedPools } from 'components/swap/PinnedPools'
import SelectPool, { PoolList } from 'components/swap/PoolSelect'
import { PostionsContainer } from 'components/swap/PostionsContainer'
import TokenInfo from 'components/swap/TokenInfo'
import TradeNavigation from 'components/swap/TradeNavigation'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { switchPoolAddress, UNSUPPORTED_GECKO_CHAINS } from 'constants/fake-tokens'
import { useCurrency } from 'hooks/Tokens'
import { useLeveragedLMTPositions, useLMTOrders } from 'hooks/useLMTV2Positions'
import { computePoolAddress, usePool, usePoolV2 } from 'hooks/usePools'
import { usePoolPriceData } from 'hooks/useUserPriceData'
import JoinModal from 'pages/Join'
import React, { useMemo, useRef } from 'react'
import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { usePinnedPools, useRemovePinnedPool } from 'state/lists/hooks'
import { useMarginTradingState } from 'state/marginTrading/hooks'
import { InterfaceTrade } from 'state/routing/types'
import { TradeState } from 'state/routing/types'
import { useCurrentInputCurrency, useCurrentOutputCurrency, useCurrentPool } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { BREAKPOINTS } from 'theme'
import { MarginPositionDetails } from 'types/lmtv2position'
import { useAccount, useChainId } from 'wagmi'

import { positionEntryPrice } from '../../components/PositionTable/LeveragePositionTable/TokenRow'
import { PageWrapper, SwapWrapper } from '../../components/swap/styleds'
// import { SwitchLocaleLink } from '../../components/SwitchLocaleLink'
import { useIsSwapUnsupported } from '../../hooks/useIsSwapUnsupported'
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
  &:focus-within {
    border: none;
  }
`

const SwapHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  width: 100%;
  margin-top: 0.5rem;
  grid-column: 2;
  grid-row: 3;
  @media only screen and (max-width: ${BREAKPOINTS.sm}px) {
    display: flex;
    flex-direction: column;
    margin-left: 0.25rem;
  }
`
const SelectPoolWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  grid-row: 2;
  grid-column: span 3;
  margin-top: 0.5rem;
`

const PoolListWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  grid-row: span 2;
  grid-column: 1;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 10px;
  margin-top: 0.75rem;
  @media only screen and (max-width: ${BREAKPOINTS.sm}px) {
    display: none;
  }
`
// grid-template-rows: ${({ pins }) => (pins ? '3vh 50vh 30vh' : '0 50vh 30vh')};
const MainWrapper = styled.article<{ pins?: boolean }>`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 22.5rem auto 0fr 365px;

  margin-top: 0.75rem;

  grid-column-gap: 0.25rem;
  grid-row-gap: 0.25rem;
  grid-template-rows: ${({ pins }) => (pins ? '3vh 5vh 50vh 30vh' : '0 5vh 50vh 30vh')};

  @media only screen and (max-width: 1265px) {
    grid-template-columns: 0px auto 0fr 365px;
    /* grid-column-gap: 0.75rem; */
  }

  @media only screen and (max-width: ${BREAKPOINTS.sm}px) {
    display: flex;
    width: 98%;
    flex-direction: column;
    margin-top: 0;
  }
`

export function getIsValidSwapQuote(
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined,
  tradeState: TradeState,
  swapInputError?: ReactNode
): boolean {
  return !!swapInputError && !!trade && (tradeState === TradeState.VALID || tradeState === TradeState.SYNCING)
}

const PositionsWrapper = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
  border-radius: 10px;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  overflow-x: scroll;
  grid-row: 4;
  grid-column: 2;
  /* grid-area: 3 / 1 / auto / 3; */
  /* min-width: 740px; */
  ::-webkit-scrollbar {
    display: none;
  }

  /* @media (max-width: 1050px) {
    grid-column: 1 / 3;
     grid-area: 3 / 1 / auto / 2; 
  } */
  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
    // display: none;
  }
  @media only screen and (max-width: ${BREAKPOINTS.sm}px) {
    width: 100%;
    margin-left: 0.25rem;
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
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  overflow-x: scroll;
`

export default function Trade({ className }: { className?: string }) {
  const account = useAccount().address
  const chainId = useChainId()
  const { isSwap } = useMarginTradingState()

  const userPools = usePinnedPools()
  const removeUserPool = useRemovePinnedPool()

  const inputCurrency = useCurrentInputCurrency()
  const outputCurrency = useCurrentOutputCurrency()
  const currentPool = useCurrentPool()
  const poolKey = currentPool?.poolKey
  const token0 = useCurrency(poolKey?.token0)
  const token1 = useCurrency(poolKey?.token1)
  const [, pool] = usePoolV2(token0 ?? undefined, token1 ?? undefined, poolKey?.fee ?? undefined)

  const swapIsUnsupported = useIsSwapUnsupported(inputCurrency, outputCurrency)

  const { loading: leverageLoading, positions: leveragePositions } = useLeveragedLMTPositions(account)
  const { loading: orderLoading, Orders: limitOrders } = useLMTOrders(account)
  const location = useLocation()
  const { data: poolOHLC } = usePoolPriceData(pool?.token0.address, pool?.token1.address, pool?.fee)
  const chartSymbol = useMemo(() => {
    if (pool && poolOHLC && chainId && currentPool) {
      if (!poolOHLC) return null
      let poolAddress = computePoolAddress({
        factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
        tokenA: pool.token0,
        tokenB: pool.token1,
        fee: pool.fee,
      })
      if (UNSUPPORTED_GECKO_CHAINS.includes(chainId)) {
        poolAddress = switchPoolAddress(
          chainId,
          SupportedChainId.ARBITRUM_ONE,
          pool.token0.address,
          pool.token1.address,
          pool.fee
        )
      }

      const baseSymbol = currentPool.token0IsBase ? pool.token0.symbol : pool.token1.symbol
      const quoteSymbol = currentPool.token0IsBase ? pool.token1.symbol : pool.token0.symbol

      return JSON.stringify({
        poolAddress,
        baseSymbol,
        quoteSymbol,
        token0IsBase: currentPool.token0IsBase,
        chainId,
      })
    }
    return null
  }, [poolOHLC, pool, chainId, currentPool])

  const match = useMemo(() => {
    let currentPrice: number

    if (!leveragePositions || !poolKey || !poolOHLC || !chainId) {
      return []
    } else {
      currentPrice = poolOHLC.priceNow
      return leveragePositions
        .filter(
          (position: MarginPositionDetails) =>
            position.poolKey.token0.toLowerCase() === poolKey.token0.toLowerCase() &&
            position.poolKey.token1.toLowerCase() === poolKey.token1.toLowerCase() &&
            position.poolKey.fee === poolKey.fee
        )
        .map((matchedPosition: MarginPositionDetails) => {
          const postionEntryPrice = positionEntryPrice(matchedPosition).toNumber()

          if ((currentPrice < 1 && postionEntryPrice > 1) || (currentPrice > 1 && postionEntryPrice < 1)) {
            return 1 / postionEntryPrice
          }
          return postionEntryPrice
        })
    }
  }, [poolKey, poolOHLC, leveragePositions, chainId])

  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>

  const w = window.innerWidth > 1265

  const poolAddress = useMemo(() => {
    if (!pool) return undefined
    return computePoolAddress({
      factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
      tokenA: pool.token0,
      tokenB: pool.token1,
      fee: pool.fee,
    })
  }, [pool])

  return (
    <Trace page={InterfacePageName.SWAP_PAGE} shouldLogImpression>
      <PageWrapper>
        <MainWrapper pins={userPools && userPools.length > 0}>
          <PinWrapper>
            {userPools && userPools.length > 0 && (
              <PinnedPools pinnedPools={userPools} removePinnedPool={removeUserPool} />
            )}
          </PinWrapper>
          <SelectPoolWrapper>
            <SelectPool />
          </SelectPoolWrapper>
          <PoolListWrapper>
            <PoolList />
          </PoolListWrapper>
          <SwapHeaderWrapper>
            <PoolDataChart
              symbol={chartSymbol}
              chartContainerRef={chartContainerRef}
              entryPrices={match}
              token0IsBase={poolOHLC?.token0IsBase}
            />
          </SwapHeaderWrapper>
          <SwapWrapper chainId={chainId} className={className} id="swap-page">
            {!isSwap && <TradeTabContent />}
            {isSwap && <SwapTabContent />}
            <TokenInfo poolAddress={poolAddress} />
            <TradeNavigation />
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
