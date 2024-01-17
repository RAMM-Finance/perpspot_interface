import { sendAnalyticsEvent, Trace } from '@uniswap/analytics'
import { InterfacePageName, SwapEventName } from '@uniswap/analytics-events'
import { Currency, Token, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { PoolStatsSection } from 'components/ExchangeChart/PoolStats'
import { Input as NumericalInput } from 'components/NumericalInput'
import { PoolDetailsSection } from 'components/swap/PoolDetailsSection'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
// import _ from 'lodash'
// import { FakeTokens, FETH, FUSDC } from "constants/fake-tokens"
import { TabContent } from 'components/Tabs'
import { TokenNameCell } from 'components/Tokens/TokenDetails/Skeleton'
import { useBestPool } from 'hooks/useBestPool'
import { usePoolsData } from 'hooks/useLMTPools'
import { useLeveragedLMTPositions, useLMTOrders } from 'hooks/useLMTV2Positions'
// import Widget from 'components/Widget'
// import { useSwapWidgetEnabled } from 'featureFlags/flags/swapWidget'
import { formatSwapQuoteReceivedEventProperties } from 'lib/utils/analytics'
import { Row } from 'nft/components/Flex'
import JoinModal from 'pages/Join'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { InterfaceTrade } from 'state/routing/types'
import { TradeState } from 'state/routing/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { PoolSelector } from '../../components/swap/PoolSelector'
import { PageWrapper, SwapWrapper } from '../../components/swap/styleds'
// import { SwitchLocaleLink } from '../../components/SwitchLocaleLink'
import { TOKEN_SHORTHANDS } from '../../constants/tokens'
import { useCurrency, useDefaultActiveTokens } from '../../hooks/Tokens'
import { useIsSwapUnsupported } from '../../hooks/useIsSwapUnsupported'
import useWrapCallback from '../../hooks/useWrapCallback'
import { ActiveSwapTab, Field } from '../../state/swap/actions'
import { useDefaultsFromURLSearch, useDerivedSwapInfo, useSwapState } from '../../state/swap/hooks'
import { supportedChainId } from '../../utils/supportedChainId'
import { ResponsiveHeaderText } from '../RemoveLiquidity/styled'
import SwapTabContent from './swapModal'
import TradeTabContent from './tradeModal'

// const TradeTabContent = React.lazy(() => import('./tradeModal'))
// const SwapTabContent = React.lazy(() => import('./swapModal'))

// const BorrowTabContent = React.lazy(() => import('./borrowModal'));

const TableHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
  background-color: ${({ theme }) => theme.backgroundSurface};
`

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
  padding: 16px;
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
  padding: 0px;
  margin-top: 4px;
  margin-bottom: 8px;
  width: 100%;
`

const PositionsContainer = styled.div`
  width: calc(100% - 315px);
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
  margin-bottom: 0.5rem;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  height: calc(100vh - 582px);
  min-height: 150px;
  border-radius: 10px;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
  overflow-x: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
`

const StatsContainer = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 10px;
  /* max-width: 1200px; */
  padding: 18px;
  width: 100%;
  margin-bottom: 25px;
  margin-left: auto;
`

const RightContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: flex-start;
  align-content: center;
`

const ActivityWrapper = styled.section`
  overflow: hidden;

  background-color: ${({ theme }) => theme.backgroundSurface};
`
const ActivityInnerWarpper = styled.div`
  padding: 20px 30px;
  max-height: 390px;
  overflow-y: auto;

  ::-webkit-scrollbar {
    background-color: transparent;
    width: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.background};
    border: none;
  }
  ::-webkit-scrollbar-track {
    background-color: transparent;
  }
`

const SwapHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  grid-column: span 2;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  margin-left: 0.25rem;
  margin-right: 0.25rem;

  border: solid ${({ theme }) => theme.backgroundOutline};
  border-width: 1px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.backgroundSurface};
`

const MainWrapper = styled.article`
  width: 100%;
  height: 1200px;
  display: flex;
`

const TabsWrapper = styled.div`
  display: flex;
`

const MissingHistoryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: ${({ theme }) => theme.textPrimary};
  font-size: 16px;
  font-weight: 500;
  border-radius: 0;
`

export function getIsValidSwapQuote(
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined,
  tradeState: TradeState,
  swapInputError?: ReactNode
): boolean {
  return !!swapInputError && !!trade && (tradeState === TradeState.VALID || tradeState === TradeState.SYNCING)
}

export default function Swap({ className }: { className?: string }) {
  const navigate = useNavigate()
  const { account, chainId, provider } = useWeb3React()

  const loadedUrlParams = useDefaultsFromURLSearch()
  const [newSwapQuoteNeedsLogging, setNewSwapQuoteNeedsLogging] = useState(true)
  const [fetchingSwapQuoteStartTime, setFetchingSwapQuoteStartTime] = useState<Date | undefined>()
  // const [swapHeight, setSwapHeight] = useState<number>()

  // /**
  //  * @parms swapWrapperREf SwapWrapper componenet height
  //  * @parms swapHeaderHeight : SwapHeaderWrapper component height
  //  */

  // const swapWrapperRef = useRef<HTMLElement>()
  // const swapHeaderRef = useRef<HTMLElement>()
  // const swapWrapperHeight = swapWrapperRef.current?.scrollHeight
  // const swapHeaderHeight = swapHeaderRef.current?.scrollHeight

  // const swapWidgetEnabled = useSwapWidgetEnabled()

  // const { onLeverageManagerAddress, onBorrowManagerAddress } = useSwapActionHandlers()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.[Field.INPUT]?.currencyId),
    useCurrency(loadedUrlParams?.[Field.OUTPUT]?.currencyId),
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c?.isToken ?? false) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )

  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useDefaultActiveTokens()
  const importTokensNotInDefault = useMemo(
    () =>
      urlLoadedTokens &&
      urlLoadedTokens
        .filter((token: Token) => {
          return !(token.address in defaultTokens)
        })
        .filter((token: Token) => {
          // Any token addresses that are loaded from the shorthands map do not need to show the import URL
          const supported = supportedChainId(chainId)
          if (!supported) return true
          return !Object.keys(TOKEN_SHORTHANDS).some((shorthand) => {
            const shorthandTokenAddress = TOKEN_SHORTHANDS[shorthand][supported]
            return shorthandTokenAddress && shorthandTokenAddress === token.address
          })
        }),
    [chainId, defaultTokens, urlLoadedTokens]
  )

  const {
    trade: { state: tradeState, trade },
    // allowedSlippage,
    // currencyBalances,
    // parsedAmount,
    currencies,
  } = useDerivedSwapInfo()

  const [inputCurrency, outputCurrency] = useMemo(() => {
    return [currencies[Field.INPUT], currencies[Field.OUTPUT]]
  }, [currencies])
  const [poolState, pool] = useBestPool(currencies.INPUT ?? undefined, currencies.OUTPUT ?? undefined)
  // const theme = useTheme()

  // toggle wallet when disconnected
  // const toggleWalletDrawer = useToggleWalletDrawer()

  // for expert mode
  // const [isExpertMode] = useExpertModeManager()

  // swap state
  const {
    // independentField,
    typedValue,
    // recipient,
    // leverageFactor,
    activeTab,
  } = useSwapState()

  // const isBorrowTab = ActiveSwapTab.BORROW == activeTab

  const {
    wrapType,
    // execute: onWrap,
    // inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)

  const inputIsToken0 = outputCurrency?.wrapped ? inputCurrency?.wrapped.sortsBefore(outputCurrency?.wrapped) : false

  const [routeNotFound, routeIsLoading, routeIsSyncing] = useMemo(
    () => [!trade?.swaps, TradeState.LOADING === tradeState, TradeState.SYNCING === tradeState],
    [trade, tradeState]
  )

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
    navigate('/swap/')
  }, [navigate])

  // errors
  const [swapQuoteReceivedDate, setSwapQuoteReceivedDate] = useState<Date | undefined>()
  // warnings on the greater of fiat value price impact and execution price impact

  const swapIsUnsupported = useIsSwapUnsupported(currencies[Field.INPUT], currencies[Field.OUTPUT])

  // Handle time based logging events and event properties.
  useEffect(() => {
    const now = new Date()
    // If a trade exists, and we need to log the receipt of this new swap quote:
    if (newSwapQuoteNeedsLogging && !!trade) {
      // Set the current datetime as the time of receipt of latest swap quote.
      setSwapQuoteReceivedDate(now)
      // Log swap quote.
      sendAnalyticsEvent(
        SwapEventName.SWAP_QUOTE_RECEIVED,
        formatSwapQuoteReceivedEventProperties(trade, trade.gasUseEstimateUSD ?? undefined, fetchingSwapQuoteStartTime)
      )
      // Latest swap quote has just been logged, so we don't need to log the current trade anymore
      // unless user inputs change again and a new trade is in the process of being generated.
      setNewSwapQuoteNeedsLogging(false)
      // New quote is not being fetched, so set start time of quote fetch to undefined.
      setFetchingSwapQuoteStartTime(undefined)
    }
    // If another swap quote is being loaded based on changed user inputs:
    if (routeIsLoading) {
      setNewSwapQuoteNeedsLogging(true)
      if (!fetchingSwapQuoteStartTime) setFetchingSwapQuoteStartTime(now)
    }
  }, [
    newSwapQuoteNeedsLogging,
    routeIsSyncing,
    routeIsLoading,
    fetchingSwapQuoteStartTime,
    trade,
    setSwapQuoteReceivedDate,
  ])

  const {
    loading: leverageLoading,
    positions: leveragePositions,
    error,
    syncing: leverageSyncing,
  } = useLeveragedLMTPositions(account)

  const { loading: orderLoading, Orders: limitOrders } = useLMTOrders(account)

  // const { result: binData } = useBulkBinData(pool?.token0?.address, pool?.token1?.address, pool?.fee, pool?.tickCurrent)

  // const currentPrice = Number(pool?.sqrtRatioX96) ** 2 / 2 ** 192

  const location = useLocation()
  const poolData = usePoolsData()

  return (
    <Trace page={InterfacePageName.SWAP_PAGE} shouldLogImpression>
      <>
        <PageWrapper>
          <SwapHeaderWrapper>
            <TokenNameCell>
              {inputCurrency && outputCurrency ? (
                <Row>
                  <PoolSelector largeWidth={false} />
                </Row>
              ) : (
                <ThemedText.BodyPrimary>Pair not found</ThemedText.BodyPrimary>
              )}
            </TokenNameCell>
            <PoolStatsSection poolData={poolData} chainId={chainId} pool={pool} />
          </SwapHeaderWrapper>
          <MainWrapper>
            <SwapWrapper chainId={chainId} className={className} id="swap-page">
              {(activeTab === ActiveSwapTab.LONG || activeTab === ActiveSwapTab.SHORT) && <TradeTabContent />}
              <TabContent id={ActiveSwapTab.SWAP} activeTab={activeTab}>
                <SwapTabContent />
              </TabContent>
            </SwapWrapper>
            <RightContainer>
              <PoolDetailsSection
                account={account}
                orders={limitOrders}
                loadingOrders={orderLoading}
                positions={leveragePositions}
                loadingPositions={leverageLoading}
                chainId={chainId}
                pool={pool}
                poolState={poolState}
              />
            </RightContainer>
          </MainWrapper>
          {location.pathname.substring(0, 6) === '/join/' ? <JoinModal /> : null}
        </PageWrapper>
        {!swapIsUnsupported ? null : (
          <UnsupportedCurrencyFooter
            show={swapIsUnsupported}
            currencies={[currencies[Field.INPUT], currencies[Field.OUTPUT]]}
          />
        )}
      </>
    </Trace>
  )
}
