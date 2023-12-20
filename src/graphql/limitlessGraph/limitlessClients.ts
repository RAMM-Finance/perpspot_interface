import { ApolloClient, ApolloLink, concat, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { SupportedChainId } from 'constants/chains'

import store from '../../state/index'
import { useWeb3React } from '@web3-react/core'
import { createClient, cacheExchange, fetchExchange } from '@urql/core'

// import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

const APIURL = 'https://api.thegraph.com/subgraphs/name/jpark0315/limitless-subgraph'
// const APIURL = 'https://api.studio.thegraph.com/query//limitless-subgraph/'


export const client = createClient({
  url: APIURL,
  exchanges: [cacheExchange, fetchExchange],

})



const CHAIN_SUBGRAPH_URL: Record<number, string> = {
  [SupportedChainId.SEPOLIA]: 'https://api.studio.thegraph.com/query/40393/limitless-sepolia/version/latest',
}

const httpLink = new HttpLink({ uri: CHAIN_SUBGRAPH_URL[SupportedChainId.MAINNET] })

// This middleware will allow us to dynamically update the uri for the requests based off chainId
// For more information: https://www.apollographql.com/docs/react/networking/advanced-http-networking/
const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  const chainId = store.getState().application.chainId

  operation.setContext(() => ({
    uri:
      chainId && CHAIN_SUBGRAPH_URL[chainId]
        ? CHAIN_SUBGRAPH_URL[chainId]
        : CHAIN_SUBGRAPH_URL[SupportedChainId.MAINNET],
  }))

  return forward(operation)
})

export const limitlessClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'https://api.studio.thegraph.com/query/40393/limitless-sepolia/version/latest'
  //link: concat(authMiddleware, httpLink),
})

export function useLimitlessSubgraph(): ApolloClient<NormalizedCacheObject> {
  // const [activeNetwork] = useActiveNetworkVersion()
  const { chainId } = useWeb3React()
  switch (chainId) {
    case SupportedChainId.MAINNET://SupportedNetwork.ETHEREUM:
    case SupportedChainId.ARBITRUM_ONE://SupportedNetwork.ARBITRUM:
    case SupportedChainId.OPTIMISM://SupportedNetwork.OPTIMISM:
    case SupportedChainId.POLYGON:// SupportedNetwork.POLYGON:

    case SupportedChainId.CELO:// SupportedNetwork.CELO:

    case SupportedChainId.BNB://SupportedNetwork.BNB:

    default:
      return limitlessClient
  }
}