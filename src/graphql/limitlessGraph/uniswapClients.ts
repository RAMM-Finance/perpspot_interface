import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from 'constants/chains'

export const healthClient = new ApolloClient({
  uri: 'https://api.thegraph.com/index-node/graphql',
  cache: new InMemoryCache(),
})

export const blockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const uniswapClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const arbitrumClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-minimal',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

export const arbitrumBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-one-blocks',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

export const optimismClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const bscClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-bsc',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const bscBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/wombat-exchange/bnb-chain-block',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

export const optimismBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uni-testing-subgraph',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

export const polygonClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const polygonBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/polygon-blocks',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

export const celoClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const celoBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/jesse-sawa/celo-blocks',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

export function useUniswapSubgraph(): ApolloClient<NormalizedCacheObject> {
  // const [activeNetwork] = useActiveNetworkVersion()
  const { chainId } = useWeb3React()
  switch (chainId) {
    case SupportedChainId.MAINNET: //SupportedNetwork.ETHEREUM:
      return uniswapClient
    case SupportedChainId.ARBITRUM_ONE: //SupportedNetwork.ARBITRUM:
      return arbitrumClient
    case SupportedChainId.OPTIMISM: //SupportedNetwork.OPTIMISM:
      return optimismClient
    case SupportedChainId.POLYGON: // SupportedNetwork.POLYGON:
      return polygonClient
    case SupportedChainId.CELO: // SupportedNetwork.CELO:
      return celoClient
    case SupportedChainId.BNB: //SupportedNetwork.BNB:
      return bscClient
    default:
      return uniswapClient
  }
}

export function getUniswapSubgraph(chainId: number): ApolloClient<NormalizedCacheObject> {
  switch (chainId) {
    case SupportedChainId.MAINNET: //SupportedNetwork.ETHEREUM:
      return uniswapClient
    case SupportedChainId.ARBITRUM_ONE: //SupportedNetwork.ARBITRUM:
      return arbitrumClient
    case SupportedChainId.OPTIMISM: //SupportedNetwork.OPTIMISM:
      return optimismClient
    case SupportedChainId.POLYGON: // SupportedNetwork.POLYGON:
      return polygonClient
    case SupportedChainId.CELO: // SupportedNetwork.CELO:
      return celoClient
    case SupportedChainId.BNB: //SupportedNetwork.BNB:
      return bscClient
    default:
      return uniswapClient
  }
}

const arbitrumApiKey = process.env.REACT_APP_API_KEY

export function getCustomApiSubgraph(chainId: number): ApolloClient<NormalizedCacheObject> {
  console.log('custom api subgraph')
  switch (chainId) {
    case SupportedChainId.ARBITRUM_ONE:
      if (arbitrumApiKey) {
        return customArbitrumClient
      } else {
        return arbitrumClient
      }
    default:
      return getUniswapSubgraph(chainId)
  }
}

export const customArbitrumClient = new ApolloClient({
  uri: arbitrumApiKey
    ? `https://gateway-arbitrum.network.thegraph.com/api/${arbitrumApiKey}/subgraphs/id/FbCGRftH4a3yZugY7TnbYgPJVEv2LvMT6oF1fxPe9aJM`
    : 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-minimal',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

export function getUniswapUri(chainId?: number): string {
  switch (chainId) {
    case SupportedChainId.MAINNET: //SupportedNetwork.ETHEREUM:
      return 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'
    case SupportedChainId.ARBITRUM_ONE: //SupportedNetwork.ARBITRUM:
      return 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-minimal'
    case SupportedChainId.OPTIMISM: //SupportedNetwork.OPTIMISM:
      return 'https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis'
    case SupportedChainId.POLYGON: // SupportedNetwork.POLYGON:
      return 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon'
    case SupportedChainId.CELO: // SupportedNetwork.CELO:
      return 'https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo'
    case SupportedChainId.BNB: //SupportedNetwork.BNB:
      return 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-bsc'
    default:
      return 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'
  }
}
