import { sendAnalyticsEvent, Trace } from '@uniswap/analytics'
import { InterfacePageName, SwapEventName } from '@uniswap/analytics-events'
import { Currency, Token, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { default as BorrowSearchBar } from 'components/BorrowPositionTable/SearchBar'
import BorrowPositionsTable from 'components/BorrowPositionTable/TokenTable'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { PoolDataSection } from 'components/ExchangeChart'
import { PoolDataChart } from 'components/ExchangeChart/PoolDataChart'
import { default as LeverageSearchBar } from 'components/LeveragePositionTable/SearchBar'
import LeveragePositionsTable from 'components/LeveragePositionTable/TokenTable'
import { Input as NumericalInput } from 'components/NumericalInput'
import { TokenSelector } from 'components/swap/TokenSelector'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
// import _ from 'lodash'
// import { FakeTokens, FETH, FUSDC } from "constants/fake-tokens"
import { TabContent, TabNavItem } from 'components/Tabs'
import { TokenNameCell } from 'components/Tokens/TokenDetails/Skeleton'
import TokenSafetyModal from 'components/TokenSafety/TokenSafetyModal'
import { ActivityTab } from 'components/WalletDropdown/MiniPortfolio/Activity/ActivityTab'
import { BORROW_MANAGER_FACTORY_ADDRESSES, LEVERAGE_MANAGER_FACTORY_ADDRESSES } from 'constants/addresses'
// import Widget from 'components/Widget'
// import { useSwapWidgetEnabled } from 'featureFlags/flags/swapWidget'
import { computeBorrowManagerAddress, computeLeverageManagerAddress } from 'hooks/usePools'
import { useLimitlessPositions } from 'hooks/useV3Positions'
import { formatSwapQuoteReceivedEventProperties } from 'lib/utils/analytics'
import { Row } from 'nft/components/Flex'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { InterfaceTrade } from 'state/routing/types'
import { TradeState } from 'state/routing/types'
import styled from 'styled-components/macro'

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
  useBestPoolAddress,
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks'
import { ThemedText } from '../../theme'
import { supportedChainId } from '../../utils/supportedChainId'
import { ResponsiveHeaderText } from '../RemoveLiquidity/styled'
import BorrowTabContent from './borrowModal'

const TradeTabContent = React.lazy(() => import('./swapModal'))

// const BorrowTabContent = React.lazy(() => import('./borrowModal'));

const TableHeader = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
`

export const StyledNumericalInput = styled(NumericalInput)`
  width: 100px;
  text-align: left;
  padding: 10px;
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
`

const SwapSection = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 16px;
  padding: 16px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;

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
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background-color: ${({ theme }) => theme.backgroundSurface};
  margin-bottom: 20px;
`

export const InputSection = styled(SwapSection)<{ leverage: boolean }>`
  border-bottom-left-radius: ${({ leverage }) => leverage && '0'};
  border-bottom-right-radius: ${({ leverage }) => leverage && '0'};
  margin-bottom: ${({ leverage }) => (leverage ? '0' : '20px')};
  background-color: ${({ theme }) => theme.backgroundSurface};

  ::after {
    content: '';
    margin-top: 30px;
    background-color: ${({ theme }) => theme.backgroundSurface};
    display: ${({ leverage }) => (leverage ? 'block' : 'none')};
    height: 0.1em;
  }
`

export const OutputSwapSection = styled(SwapSection)<{ showDetailsDropdown: boolean }>`
  border: 1px solid ${({ theme }) => theme.backgroundSurface};
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  // margin-bottom: 20px;
`
export const LeverageGaugeSection = styled(SwapSection)<{ showDetailsDropdown: boolean }>`
  border: 1px solid ${({ theme }) => theme.backgroundSurface};
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
`

export const DetailsSwapSection = styled(SwapSection)`
  padding: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
`

const PositionsContainer = styled.div`
  // background-color: ${({ theme }) => theme.backgroundSurface};
  /* max-width: 1200px; */
  width: 100%;
  padding: 12px;
  margin-left: auto;
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
  max-width: 1260px;
  min-width: 560px;
  border-top: 1px solid ${({ theme }) => theme.backgroundOutline};
`

const ActivityWrapper = styled.main`
  max-height: 240px;
  overflow: hidden;

  background-color: ${({ theme }) => theme.backgroundSurface};
`
const ActivityInnerWarpper = styled.div`
  padding: 20px 30px;
  overflow-y: auto;
  max-height: 240px;

  ::-webkit-scrollbar {
    background-color: transparent;
    width: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #131a2a;
    border-radius: 32px;
  }
  ::-webkit-scrollbar-track {
    background-color: transparent;
  }
`

const SwapHeaderWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  grid-column: span 2;
  margin: 0.25rem 0;
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
    // recipient,
    // leverageFactor,
    leverage,
    leverageManagerAddress,
    activeTab,
    // ltv,
    borrowManagerAddress,
    premium,
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

  const poolAddress = useBestPoolAddress(currencies[Field.INPUT] ?? undefined, currencies[Field.OUTPUT] ?? undefined)

  useEffect(() => {
    // declare the data fetching function
    if (pool && account && provider && inputCurrency && outputCurrency) {
      onLeverageManagerAddress(
        computeLeverageManagerAddress({
          factoryAddress: LEVERAGE_MANAGER_FACTORY_ADDRESSES[chainId ?? 11155111],
          tokenA: inputCurrency?.wrapped.address ?? '',
          tokenB: outputCurrency?.wrapped.address ?? '',
          fee: pool.fee,
        })
      )
      onBorrowManagerAddress(
        computeBorrowManagerAddress({
          factoryAddress: BORROW_MANAGER_FACTORY_ADDRESSES[chainId ?? 11155111],
          tokenA: inputCurrency?.wrapped.address ?? '',
          tokenB: outputCurrency?.wrapped.address ?? '',
          fee: pool.fee,
        })
      )
    }
  }, [
    poolAddress,
    account,
    trade,
    currencies,
    provider,
    onBorrowManagerAddress,
    onLeverageManagerAddress,
    inputCurrency,
    outputCurrency,
    chainId,
    pool,
  ])

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

  const { loading: limitlessPositionsLoading, positions: limitlessPositions } = useLimitlessPositions(account)

  const leveragePositions = useMemo(() => {
    return limitlessPositions && !limitlessPositionsLoading
      ? limitlessPositions.filter((position) => {
          return !position.isBorrow
        })
      : undefined
  }, [limitlessPositionsLoading, limitlessPositions])
  const borrowPositions = useMemo(() => {
    return limitlessPositions && !limitlessPositionsLoading
      ? limitlessPositions.filter((position) => {
          return position.isBorrow
        })
      : undefined
  }, [limitlessPositionsLoading, limitlessPositions])

  const [activePositionTable, setActiveTable] = useState(1)

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
                  <TokenSelector isInput={false} />
                  <TokenSelector isInput={true} />
                </Row>
              ) : (
                <ThemedText.LargeHeader>Pair not found</ThemedText.LargeHeader>
              )}

              {/* {inputApprovalState !== ApprovalState.APPROVED && (
                  <SmallMaxButton onClick={() => inputApprove()} width="10%">
                    <Trans>
                      <WarningIcon size="1.25em" />
                      Approve {inputCurrency?.symbol}
                    </Trans>
                  </SmallMaxButton>
                )}
                {outputApprovalState !== ApprovalState.APPROVED && (
                  <SmallMaxButton onClick={() => outputApprove()} width="10%">
                    <Trans>
                      <WarningIcon size="1.25em" /> Approve {outputCurrency?.symbol}
                    </Trans>
                  </SmallMaxButton>
                )} */}
            </TokenNameCell>
            <PoolDataSection
              chainId={chainId ?? 11155111}
              token0={inputIsToken0 ? inputCurrency?.wrapped : outputCurrency?.wrapped}
              token1={inputIsToken0 ? outputCurrency?.wrapped : inputCurrency?.wrapped}
              fee={pool?.fee}
            />
          </SwapHeaderWrapper>
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
                <LeveragePositionsTable positions={leveragePositions} loading={limitlessPositionsLoading} />
              </TabContent>
              <TabContent id={2} activeTab={activePositionTable}>
                <BorrowPositionsTable positions={borrowPositions} loading={limitlessPositionsLoading} />
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
            <TabContent id={ActiveSwapTab.TRADE} activeTab={activeTab}>
              <TradeTabContent />
            </TabContent>
            <TabContent id={ActiveSwapTab.BORROW} activeTab={activeTab}>
              <BorrowTabContent />
            </TabContent>
          </SwapWrapper>
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
