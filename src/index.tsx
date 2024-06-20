/// <reference types="@welldone-software/why-did-you-render" />
import './wdyr'
import '@reach/dialog/styles.css'
import 'inter-ui'
import 'polyfills'
import 'tracing'
import '@rainbow-me/rainbowkit/styles.css'

import { ApolloProvider } from '@apollo/client'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient as TanQueryClient, QueryClientProvider as TanQueryClientProvider } from '@tanstack/react-query'
import { FeatureFlagsProvider } from 'featureFlags'
import { apolloClient } from 'graphql/data/apollo'
import { BlockNumberProvider } from 'lib/hooks/useBlockNumber'
import { MulticallUpdater } from 'lib/state/multicall'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { SystemThemeUpdater } from 'theme/components/ThemeToggle'
import { WagmiProvider } from 'wagmi'
// import wagmiConfig from './wagmi-lib/config'
import { rainbowKitConfig } from 'wagmi-lib/rainbowKitConfig'

import { LanguageProvider } from './i18n'
import App from './pages/App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import ListsUpdater from './state/lists/updater'
import LogsUpdater from './state/logs/updater'
import TransactionUpdater from './state/transactions/updater'
import ThemeProvider, { ThemedGlobalStyle } from './theme'
import RadialGradientByChainUpdater from './theme/components/RadialGradientByChainUpdater'

if (window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

function Updaters() {
  return (
    <>
      <RadialGradientByChainUpdater />
      <ListsUpdater />
      <SystemThemeUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
      <LogsUpdater />
    </>
  )
}

const queryClient = new QueryClient()
const tanQueryClient = new TanQueryClient()

const container = document.getElementById('root') as HTMLElement

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <WagmiProvider config={rainbowKitConfig}>
        <TanQueryClientProvider client={tanQueryClient}>
          <RainbowKitProvider modalSize="compact">
            <QueryClientProvider client={queryClient}>
              <FeatureFlagsProvider>
                <HashRouter>
                  <LanguageProvider>
                    <ApolloProvider client={apolloClient}>
                      <BlockNumberProvider>
                        <Updaters />
                        <ThemeProvider>
                          <ThemedGlobalStyle />
                          <App />
                        </ThemeProvider>
                      </BlockNumberProvider>
                    </ApolloProvider>
                  </LanguageProvider>
                </HashRouter>
                <ReactQueryDevtools initialIsOpen={false} />
              </FeatureFlagsProvider>
            </QueryClientProvider>
          </RainbowKitProvider>
        </TanQueryClientProvider>
      </WagmiProvider>
    </Provider>
  </StrictMode>
)
console.log('PROCESS SERVICe', process.env.REACT_APP_SERVICE_WORKER)
if (process.env.REACT_APP_SERVICE_WORKER !== 'false') {
  serviceWorkerRegistration.register()
}
