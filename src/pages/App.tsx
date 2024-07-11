import { getDeviceId, sendAnalyticsEvent, Trace, user } from '@uniswap/analytics'
import { CustomUserProperties, getBrowser, InterfacePageName, SharedEventName } from '@uniswap/analytics-events'
import Loader from 'components/Icons/LoadingSpinner'
import TopLevelModals from 'components/TopLevelModals'
import { useFeatureFlagsIsLoaded } from 'featureFlags'
import { useMGTMMicrositeEnabled } from 'featureFlags/flags/mgtm'
import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'
import { useAtom } from 'jotai'
import { useBag } from 'nft/hooks/useBag'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom'
import { shouldDisableNFTRoutesAtom } from 'state/application/atoms'
import { StatsigProvider, StatsigUser } from 'statsig-react'
import styled from 'styled-components/macro'
import { SpinnerSVG } from 'theme/components'
import { useIsDarkMode } from 'theme/components/ThemeToggle'
import { flexRowNoWrap } from 'theme/styles'
import { Z_INDEX } from 'theme/zIndex'
import { STATSIG_DUMMY_KEY } from 'tracing'
import { getEnvName } from 'utils/env'
import { useAccount } from 'wagmi'
import { getCLS, getFCP, getFID, getLCP, Metric } from 'web-vitals'

import { useAnalyticsReporter } from '../components/analytics'
import ErrorBoundary from '../components/ErrorBoundary'
import NavBar from '../components/NavBar'
import Polling from '../components/Polling'
import Popups from '../components/Popups'
import { useIsExpertMode } from '../state/user/hooks'
import DarkModeQueryParamReader from '../theme/components/DarkModeQueryParamReader'
import { RedirectDuplicateTokenIds, RedirectDuplicateTokenIdsV1 } from './AddLiquidity/redirects'
import { usePoolsTVLandVolume } from 'hooks/useLMTPools'
import { useAllPoolAndTokenPriceData } from 'hooks/useUserPriceData'
import { usePoolsAprUtilList } from 'state/application/hooks'

const AddLiquidity = lazy(() => import('./AddLiquidity'))
const NotFound = lazy(() => import('./NotFound'))
const ReferralPage = lazy(() => import('./Referral'))
const RemoveLiquidity = lazy(() => import('./RemoveLiquidity'))
const RedirectPathToSwapOnly = lazy(() => import('./Trade/redirects'))
const TokenDetails = lazy(() => import('./TokenDetails'))
const Wallet = lazy(() => import('./Wallet'))
const Trade = lazy(() => import('./Trade'))
const Swap = lazy(() => import('./Swap'))
const Tokens = lazy(() => import('./Tokens'))
const Pool = lazy(() => import('./LP'))
const FaucetsPage = lazy(() => import('./Faucet'))
const StatsPage = lazy(() => import('./Stats'))
const LeaderBoardPage = lazy(() => import('./Leaderboard'))
const AirDropPage = lazy(() => import('./AirDrop'))
const PositionPage = lazy(() => import('./LP/PositionPage'))
const V1PositionPage = lazy(() => import('./LP/PositionPageV1'))
const RemoveV1Liquidity = lazy(() => import('./RemoveLiquidity/V1'))

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  padding: ${({ theme }) => theme.navHeight}px 0 0 0;
  align-items: center;
  // background-color: ${({ theme }) => theme.mainBackground};
  flex: 1;
`

const MobileBottomBar = styled.div`
  z-index: ${Z_INDEX.sticky};
  position: fixed;
  display: flex;
  bottom: 0;
  right: 0;
  left: 0;
  width: 100vw;
  justify-content: space-between;
  padding: 4px 8px;
  height: ${({ theme }) => theme.mobileBottomBarHeight}px;
  background: ${({ theme }) => theme.backgroundSurface};
  border-top: 1px solid ${({ theme }) => theme.backgroundOutline};

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    display: none;
  }
`

const HeaderWrapper = styled.div<{ transparent?: boolean }>`
  ${flexRowNoWrap};
  background-color: ${({ theme }) => theme.backgroundBackdrop};
  width: 100%;
  margin-bottom: 1vh;
  justify-content: space-between;
  position: fixed;
  top: 0;
  z-index: ${Z_INDEX.dropdown};
`

function getCurrentPageFromLocation(locationPathname: string): InterfacePageName | undefined {
  switch (true) {
    case locationPathname.startsWith('/swap'):
      return InterfacePageName.SWAP_PAGE
    case locationPathname.startsWith('/vote'):
      return InterfacePageName.VOTE_PAGE
    case locationPathname.startsWith('/pools'):
    case locationPathname.startsWith('/pool'):
      return InterfacePageName.POOL_PAGE
    case locationPathname.startsWith('/tokens'):
      return InterfacePageName.TOKENS_PAGE
    default:
      return undefined
  }
}

// this is the same svg defined in assets/images/blue-loader.svg
// it is defined here because the remote asset may not have had time to load when this file is executing
const LazyLoadSpinner = () => (
  <SpinnerSVG width="94" height="94" viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M92 47C92 22.1472 71.8528 2 47 2C22.1472 2 2 22.1472 2 47C2 71.8528 22.1472 92 47 92"
      stroke="#2172E5"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SpinnerSVG>
)

export default function App() {
  const isLoaded = useFeatureFlagsIsLoaded()
  const [shouldDisableNFTRoutes, setShouldDisableNFTRoutes] = useAtom(shouldDisableNFTRoutesAtom)

  const { pathname } = useLocation()
  const currentPage = getCurrentPageFromLocation(pathname)
  const isDarkMode = useIsDarkMode()
  const isExpertMode = useIsExpertMode()
  const [scrolledState, setScrolledState] = useState(false)

  useAnalyticsReporter()

  useEffect(() => {
    window.scrollTo(0, 0)
    setScrolledState(false)
  }, [pathname])

  const [searchParams] = useSearchParams()
  useEffect(() => {
    if (searchParams.get('disableNFTs') === 'true') {
      setShouldDisableNFTRoutes(true)
    } else if (searchParams.get('disableNFTs') === 'false') {
      setShouldDisableNFTRoutes(false)
    }
  }, [searchParams, setShouldDisableNFTRoutes])

  useEffect(() => {
    // User properties *must* be set before sending corresponding event properties,
    // so that the event contains the correct and up-to-date user properties.
    user.set(CustomUserProperties.USER_AGENT, navigator.userAgent)
    user.set(CustomUserProperties.BROWSER, getBrowser())
    user.set(CustomUserProperties.SCREEN_RESOLUTION_HEIGHT, window.screen.height)
    user.set(CustomUserProperties.SCREEN_RESOLUTION_WIDTH, window.screen.width)

    sendAnalyticsEvent(SharedEventName.APP_LOADED)
    getCLS(({ delta }: Metric) => sendAnalyticsEvent(SharedEventName.WEB_VITALS, { cumulative_layout_shift: delta }))
    getFCP(({ delta }: Metric) => sendAnalyticsEvent(SharedEventName.WEB_VITALS, { first_contentful_paint_ms: delta }))
    getFID(({ delta }: Metric) => sendAnalyticsEvent(SharedEventName.WEB_VITALS, { first_input_delay_ms: delta }))
    getLCP(({ delta }: Metric) =>
      sendAnalyticsEvent(SharedEventName.WEB_VITALS, { largest_contentful_paint_ms: delta })
    )
  }, [])

  useEffect(() => {
    user.set(CustomUserProperties.DARK_MODE, isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    user.set(CustomUserProperties.EXPERT_MODE, isExpertMode)
  }, [isExpertMode])

  useEffect(() => {
    const scrollListener = () => {
      setScrolledState(window.scrollY > 0)
    }
    window.addEventListener('scroll', scrollListener)
    return () => window.removeEventListener('scroll', scrollListener)
  }, [])

  const isBagExpanded = useBag((state) => state.bagExpanded)
  const isOnWalletPage = useLocation().pathname === '/wallet'
  const micrositeEnabled = useMGTMMicrositeEnabled()
  const isHeaderTransparent = (!scrolledState && !isBagExpanded) || isOnWalletPage

  const account = useAccount().address
  const statsigUser: StatsigUser = useMemo(
    () => ({
      userID: getDeviceId(),
      customIDs: { address: account ?? '' },
    }),
    [account]
  )
  // pre-call hooks for data preloading when user refreshed the page somewhere
  const { result: _tvlAndVolume } = usePoolsTVLandVolume()
  const { pools: _poolOHLCs, tokens: _usdPriceData } = useAllPoolAndTokenPriceData()
  const { poolList: _aprList } = usePoolsAprUtilList()

  return (
    <ErrorBoundary>
      <DarkModeQueryParamReader />
      <ApeModeQueryParamReader />
      <Trace page={currentPage}>
        <StatsigProvider
          user={statsigUser}
          // TODO: replace with proxy and cycle key
          sdkKey={STATSIG_DUMMY_KEY}
          waitForInitialization={false}
          options={{
            environment: { tier: getEnvName() },
            api: process.env.REACT_APP_STATSIG_PROXY_URL,
          }}
        >
          <HeaderWrapper transparent={isHeaderTransparent}>
            <NavBar />
          </HeaderWrapper>
          <BodyWrapper>
            <Popups />
            <Polling />
            <TopLevelModals />
            <Suspense fallback={<Loader />}>
              {isLoaded ? (
                <Routes>
                  <Route path="/" element={<Trade />} />
                  <Route path="tokens" element={<Tokens />}>
                    <Route path=":chainName" />
                  </Route>
                  <Route path="tokens/:chainName/:tokenAddress" element={<TokenDetails />} />
                  <Route path="create-proposal" element={<Navigate to="/vote/create-proposal" replace />} />
                  {micrositeEnabled && <Route path="wallet" element={<Wallet />} />}
                  <Route path="send" element={<RedirectPathToSwapOnly />} />
                  <Route path="trade" element={<Trade />} />
                  <Route path="swap" element={<Swap />} />
                  <Route path="faucet" element={<FaucetsPage />} />
                  <Route path="stats" element={<StatsPage />} />
                  <Route path="leaderboard" element={<LeaderBoardPage />} />
                  <Route path="airdrop" element={<AirDropPage />} />
                  <Route path="loot" element={<AirDropPage />} />
                  <Route path="pool" element={<Pool />} />
                  <Route path="lp/v2/:tokenId" element={<PositionPage />} />
                  <Route path="lp/v1/:tokenId" element={<V1PositionPage />} />
                  <Route path="join" element={<Navigate to="/trade" />} />
                  <Route path="join/:id" element={<Trade />} />
                  <Route path="pools" element={<Pool />} />
                  <Route path="pools/advanced" element={<Pool />} />
                  <Route path="pools/simple" element={<Pool />} />
                  <Route path="referral" element={<ReferralPage />} />
                  <Route path="add/v2" element={<RedirectDuplicateTokenIds />}>
                    {/* this is workaround since react-router-dom v6 doesn't support optional parameters any more */}
                    <Route path=":currencyIdA" />
                    <Route path=":currencyIdA/:currencyIdB" />
                    <Route path=":currencyIdA/:currencyIdB/:feeAmount" />
                    <Route path=":currencyIdA/:currencyIdB/:feeAmount/:tokenId" />
                  </Route>
                  <Route path="add/v1" element={<RedirectDuplicateTokenIdsV1 />}>
                    {/* this is workaround since react-router-dom v6 doesn't support optional parameters any more */}
                    <Route path=":currencyIdA" />
                    <Route path=":currencyIdA/:currencyIdB" />
                    <Route path=":currencyIdA/:currencyIdB/:feeAmount/:tokenId" />
                  </Route>
                  <Route path="remove/v2/:tokenId" element={<RemoveLiquidity />} />
                  <Route path="remove/v1/:tokenId" element={<RemoveV1Liquidity />} />

                  {/* <Route path="migrate/v2" element={<MigrateV2 />} /> */}
                  <Route path="*" element={<Navigate to="/not-found" replace />} />
                  <Route path="/not-found" element={<NotFound />} />
                </Routes>
              ) : (
                <Loader />
              )}
            </Suspense>
          </BodyWrapper>
        </StatsigProvider>
      </Trace>
    </ErrorBoundary>
  )
}
