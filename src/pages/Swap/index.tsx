import { sendAnalyticsEvent, Trace } from '@uniswap/analytics'
import { InterfacePageName, SwapEventName } from '@uniswap/analytics-events'
import { Currency, Token, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { PoolDataSection } from 'components/ExchangeChart'
import { PoolDataChart } from 'components/ExchangeChart/PoolDataChart'
import { Input as NumericalInput } from 'components/NumericalInput'
import { default as BorrowSearchBar } from 'components/PositionTable/BorrowPositionTable/SearchBar'
import { default as LeverageSearchBar } from 'components/PositionTable/LeveragePositionTable/SearchBar'
import LeveragePositionsTable from 'components/PositionTable/LeveragePositionTable/TokenTable'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
// import _ from 'lodash'
// import { FakeTokens, FETH, FUSDC } from "constants/fake-tokens"
import { TabContent, TabNavItem } from 'components/Tabs'
import { TokenNameCell } from 'components/Tokens/TokenDetails/Skeleton'
import TokenSafetyModal from 'components/TokenSafety/TokenSafetyModal'
import { ActivityTab } from 'components/WalletDropdown/MiniPortfolio/Activity/ActivityTab'
import { useLeveragedLMTPositions } from 'hooks/useLMTV2Positions'
// import Widget from 'components/Widget'
// import { useSwapWidgetEnabled } from 'featureFlags/flags/swapWidget'
import { formatSwapQuoteReceivedEventProperties } from 'lib/utils/analytics'
import { Row } from 'nft/components/Flex'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { InterfaceTrade } from 'state/routing/types'
import { TradeState } from 'state/routing/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { PoolSelector } from '../../components/swap/PoolSelector'
import { PageWrapper, SwapWrapper } from '../../components/swap/styleds'
import SwapHeader from '../../components/swap/SwapHeader'
// import { SwitchLocaleLink } from '../../components/SwitchLocaleLink'
import { TOKEN_SHORTHANDS } from '../../constants/tokens'
import { useCurrency, useDefaultActiveTokens } from '../../hooks/Tokens'
import { useIsSwapUnsupported } from '../../hooks/useIsSwapUnsupported'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { ActiveSwapTab, Field } from '../../state/swap/actions'
import {
  useBestPool,
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks'
import { supportedChainId } from '../../utils/supportedChainId'
import { ResponsiveHeaderText } from '../RemoveLiquidity/styled'
import BorrowTabContent from './borrowModal'

const TradeTabContent = React.lazy(() => import('./tradeModal'))
const SwapTabContent = React.lazy(() => import('./swapModal'))

// const BorrowTabContent = React.lazy(() => import('./borrowModal'));

const TableHeader = styled.div`
  border: solid ${({ theme }) => theme.backgroundOutline};
  border-width: 0 0 1px 0;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
  background-color: ${({ theme }) => theme.backgroundSurface};
`

export const StyledNumericalInput = styled(NumericalInput)`
  width: 100px;
  text-align: left;
  padding: 10px;
  height: 40px;
  line-height: 40px;
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
  border-radius: 12px;
  padding-right: 14px;
  align-items: center;
  justify-content: space-around;
  position: relative;
`

const SwapSection = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 16px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;

  &:before {
    box-sizing: border-box;
    background-size: 100%;
    border-radius: inherit;

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    pointer-events: none;
    content: '';
    // border: 1px solid ${({ theme }) => theme.backgroundSurface};
  }

  // &:hover:before {
  //   border-color: ${({ theme }) => theme.stateOverlayHover};
  // }

  // &:focus-within:before {
  //   border-color: ${({ theme }) => theme.stateOverlayPressed};
  // }
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
//     display: ${({ leverage }) => (leverage ? 'block' : 'none')};
export const InputSection = styled(SwapSection)`
  background-color: ${({ theme }) => theme.backgroundSurface};
  margin-bottom: 10px;

  /* ::after {
    content: '';
    margin-top: 30px;
    background-color: ${({ theme }) => theme.backgroundSurface};

    height: 0.1em;
  } */
`

export const OutputSwapSection = styled(SwapSection)<{ showDetailsDropdown: boolean }>`
  /* border: 1px solid ${({ theme }) => theme.backgroundSurface}; */
  background-color: ${({ theme }) => theme.backgroundSurface};
`
export const LeverageGaugeSection = styled(SwapSection)`
  border: 1px solid ${({ theme }) => theme.backgroundSurface};
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
`

export const DetailsSwapSection = styled(SwapSection)`
  border: none;
  margin-bottom: 20px;
`

const PositionsContainer = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: solid ${({ theme }) => theme.backgroundOutline};
  border-width: 1px 0 0 1px;
  margin-left: auto;
  height: 100%;
`

const StatsContainer = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 32px;
  /* max-width: 1200px; */
  padding: 18px;
  width: 100%;
  margin-bottom: 25px;
  margin-left: auto;
`

const LeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-content: center;
  margin-right: 5px;
  width: 80%;
  min-width: 540px;
  border: solid ${({ theme }) => theme.backgroundOutline};
  border-width: 1px 1px 1px 0;
  border-radius: 10px;
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
    background-color: #131a2a;
    border: none;
  }
  ::-webkit-scrollbar-track {
    background-color: transparent;
  }
`

const SwapHeaderWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  grid-column: span 2;
  margin: 0.25rem 0;
  padding: 8px 10px;
  border: solid ${({ theme }) => theme.backgroundOutline};
  border-width: 0 0 1px 0;
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

  const { onLeverageManagerAddress, onBorrowManagerAddress } = useSwapActionHandlers()

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
    allowedSlippage,
    // currencyBalances,
    parsedAmount,
    currencies,
  } = useDerivedSwapInfo()

  const [inputCurrency, outputCurrency] = useMemo(() => {
    return [currencies[Field.INPUT], currencies[Field.OUTPUT]]
  }, [currencies])
  const pool = useBestPool(currencies.INPUT ?? undefined, currencies.OUTPUT ?? undefined)

  // const theme = useTheme()

  // toggle wallet when disconnected
  // const toggleWalletDrawer = useToggleWalletDrawer()

  // for expert mode
  // const [isExpertMode] = useExpertModeManager()

  // swap state
  const {
    independentField,
    typedValue,
    recipient,
    // leverageFactor,
    activeTab,
  } = useSwapState()

  const isBorrowTab = ActiveSwapTab.BORROW == activeTab

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  // const { address: recipientAddress } = useENSAddress(recipient)

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount,
          }
        : {
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
          },
    [independentField, parsedAmount, showWrap, trade]
  )

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

  // const poolAddress = useBestPoolAddress(currencies[Field.INPUT] ?? undefined, currencies[Field.OUTPUT] ?? undefined)

  // useEffect(() => {
  //   // declare the data fetching function
  //   if (pool && account && provider && inputCurrency && outputCurrency) {
  //     onLeverageManagerAddress(
  //       computeLeverageManagerAddress({
  //         factoryAddress: LEVERAGE_MANAGER_FACTORY_ADDRESSES[chainId ?? 11155111],
  //         tokenA: inputCurrency?.wrapped.address ?? '',
  //         tokenB: outputCurrency?.wrapped.address ?? '',
  //         fee: pool.fee,
  //       })
  //     )
  //     onBorrowManagerAddress(
  //       computeBorrowManagerAddress({
  //         factoryAddress: BORROW_MANAGER_FACTORY_ADDRESSES[chainId ?? 11155111],
  //         tokenA: inputCurrency?.wrapped.address ?? '',
  //         tokenB: outputCurrency?.wrapped.address ?? '',
  //         fee: pool.fee,
  //       })
  //     )
  //   }
  // }, [
  //   poolAddress,
  //   account,
  //   trade,
  //   currencies,
  //   provider,
  //   onBorrowManagerAddress,
  //   onLeverageManagerAddress,
  //   inputCurrency,
  //   outputCurrency,
  //   chainId,
  //   pool,
  // ])

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

  // useEffect(() => {
  //   if (swapHeaderHeight && swapWrapperHeight) {
  //     setSwapHeight(swapWrapperHeight - swapHeaderHeight + 12)
  //     // swapWrapperHeight - swapHeaderHeight + margin;
  //   }
  // }, [swapHeaderHeight, swapWrapperHeight])

  const { loading: leverageLoading, positions: leveragePositions } = useLeveragedLMTPositions(account)
  // const { borrowLoading: borrowPositionsLoading, borrowPositions: borrowPositions } = useBorrowLMTPositions(account)

  const [activePositionTable, setActiveTable] = useState(1)
  // const selectedTab = useSelector((state: any) => state.swap.tab)

  return (
    <Trace page={InterfacePageName.SWAP_PAGE} shouldLogImpression>
      <>
        <TokenSafetyModal
          isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
          tokenAddress={importTokensNotInDefault[0]?.address}
          secondTokenAddress={importTokensNotInDefault[1]?.address}
          onContinue={handleConfirmTokenWarning}
          onCancel={handleDismissTokenWarning}
          showCancel={true}
        />
        <PageWrapper>
          <SwapHeaderWrapper>
            <TokenNameCell>
              {inputCurrency && outputCurrency && (
                <DoubleCurrencyLogo
                  currency0={inputCurrency as Currency}
                  currency1={outputCurrency as Currency}
                  size={30}
                  margin
                />
              )}
              {inputCurrency && outputCurrency ? (
                <Row>
                  {/* <TokenSelector isInput={true} />
                  <TokenSelector isInput={false} /> */}
                  <PoolSelector />
                </Row>
              ) : (
                <ThemedText.HeadlineSmall>Pair not found</ThemedText.HeadlineSmall>
              )}
            </TokenNameCell>
            <PoolDataSection
              chainId={chainId ?? 11155111}
              token0={inputIsToken0 ? inputCurrency?.wrapped : outputCurrency?.wrapped}
              token1={inputIsToken0 ? outputCurrency?.wrapped : inputCurrency?.wrapped}
              fee={pool?.fee}
            />
          </SwapHeaderWrapper>
          <MainWrapper>
            <LeftContainer>
              <PoolDataChart
                chainId={chainId ?? 11155111}
                token0={inputIsToken0 ? inputCurrency?.wrapped : outputCurrency?.wrapped}
                token1={inputIsToken0 ? outputCurrency?.wrapped : inputCurrency?.wrapped}
                fee={pool?.fee}
              />
              <PositionsContainer>
                <TableHeader>
                  <TabsWrapper>
                    <TabNavItem id={1} activeTab={activePositionTable} setActiveTab={setActiveTable} first={true}>
                      Leverage Positions
                    </TabNavItem>
                    <TabNavItem id={2} activeTab={activePositionTable} setActiveTab={setActiveTable}>
                      Borrow Positions
                    </TabNavItem>
                    <TabNavItem id={3} activeTab={activePositionTable} setActiveTab={setActiveTable} last={true}>
                      History
                    </TabNavItem>
                  </TabsWrapper>

                  {activePositionTable === 1 && <LeverageSearchBar />}
                  {activePositionTable === 2 && <BorrowSearchBar />}
                </TableHeader>

                <TabContent id={1} activeTab={activePositionTable}>
                  {/* TODO */}
                  <LeveragePositionsTable positions={leveragePositions} loading={false} />
                </TabContent>
                <TabContent id={2} activeTab={activePositionTable}>
                  {/* TODO */}
                  {/* <BorrowPositionsTable positions={borrowPositions} loading={borrowPositionsLoading} /> */}
                </TabContent>

                <TabContent id={3} activeTab={activePositionTable}>
                  {!account ? (
                    <ActivityWrapper>
                      <MissingHistoryWrapper>None</MissingHistoryWrapper>
                    </ActivityWrapper>
                  ) : (
                    <ActivityWrapper>
                      <ActivityInnerWarpper>
                        <ActivityTab account={account} />
                      </ActivityInnerWarpper>
                    </ActivityWrapper>
                  )}
                </TabContent>
              </PositionsContainer>
            </LeftContainer>
            <SwapWrapper chainId={chainId} className={className} id="swap-page">
              <SwapHeader allowedSlippage={allowedSlippage} activeTab={activeTab} />
              {/* <LimitWrapper>
                <LimitContent tab={selectedTab} currency0={inputCurrency as Token} />
              </LimitWrapper> */}
              {(activeTab === ActiveSwapTab.LONG || activeTab === ActiveSwapTab.SHORT) && <TradeTabContent />}
              <TabContent id={ActiveSwapTab.BORROW} activeTab={activeTab}>
                <BorrowTabContent />
              </TabContent>
              <TabContent id={ActiveSwapTab.SWAP} activeTab={activeTab}>
                <SwapTabContent />
              </TabContent>
            </SwapWrapper>
          </MainWrapper>
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

const MainWrapper = styled.article`
  width: 100%;
  height: 100%;
  display: flex;
`
