import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { cacheExchange, createClient, fetchExchange } from '@urql/core'
import { AddQuery, LiquidityProvidedQuery, LiquidityWithdrawnQuery, ReduceQuery, AddOrderQuery, CancelOrderQuery, ForceClosedQuery } from 'graphql/limitlessGraph/queries'

// import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

const APIURL = 'https://api.thegraph.com/subgraphs/name/jpark0315/limitless-subgraph'
const APIURL_BASE = 'https://api.studio.thegraph.com/query/71042/limitless-subgraph-base/version/latest'
// const APIURL = 'https://api.studio.thegraph.com/query//limitless-subgraph/'

export const client = createClient({
  url: APIURL,
  exchanges: [cacheExchange, fetchExchange],
})

export const clientBase = createClient({
  url: APIURL_BASE,
  exchanges: [cacheExchange, fetchExchange],
})

export async function fetchAllData(query: any, client: any) {
  let allResults: any[] = []
  let skip = 0;
  const first = 1000 // maximum limit

  while (true) {
    const result = await client.query(query, { first, skip }).toPromise()
    if (query === AddQuery) {
      if (!result.data || !result.data.marginPositionIncreaseds.length) {
        break
      }
      allResults = [...allResults, ...result.data.marginPositionIncreaseds]

    } else if (query === ReduceQuery) {
      if (!result.data || !result.data.marginPositionReduceds.length) {
        break
      }
      allResults = [...allResults, ...result.data.marginPositionReduceds]

    } else if (query === LiquidityProvidedQuery) {
      if (!result.data || !result.data.liquidityProvideds.length) {
        break
      }
      allResults = [...allResults, ...result.data.liquidityProvideds]

    } else if (query === LiquidityWithdrawnQuery) {
      if (!result.data || !result.data.liquidityWithdrawns.length) {
        break
      }
      allResults = [...allResults, ...result.data.liquidityWithdrawns]
    }

    // else if (query === LiquidityWithdrawnQuery) {
    //   if (!result.data || !result.data.liquidityWithdrawns.length) {
    //     break
    //   }
    //   allResults = [...allResults, ...result.data.liquidityWithdrawns]
    // }

    // else if (query === LiquidityWithdrawnQuery) {
    //   if (!result.data || !result.data.liquidityWithdrawns.length) {
    //     break
    //   }
    //   allResults = [...allResults, ...result.data.liquidityWithdrawns]
    // }

    // else if (query === LiquidityWithdrawnQuery) {
    //   if (!result.data || !result.data.liquidityWithdrawns.length) {
    //     break
    //   }
    //   allResults = [...allResults, ...result.data.liquidityWithdrawns]
    // }

    // if (query === AddQuery) {
    //   allResults = [...allResults, ...result.data.marginPositionIncreaseds]
    // } else if (query === ReduceQuery) {
    //   allResults = [...allResults, ...result.data.marginPositionReduceds]
    // }

    skip += first
  }

  return allResults
}

// const CHAIN_SUBGRAPH_URL: Record<number, string> = {
//   // [SupportedChainId.SEPOLIA]: 'https://api.studio.thegraph.com/query/40393/limitless-sepolia/version/latest',
// }

// const httpLink = new HttpLink({ uri: CHAIN_SUBGRAPH_URL[SupportedChainId.MAINNET] })

// This middleware will allow us to dynamically update the uri for the requests based off chainId
// For more information: https://www.apollographql.com/docs/react/networking/advanced-http-networking/
// const authMiddleware = new ApolloLink((operation, forward) => {
//   // add the authorization to the headers
//   const chainId = store.getState().application.chainId

//   operation.setContext(() => ({
//     uri:
//       chainId && CHAIN_SUBGRAPH_URL[chainId]
//         ? CHAIN_SUBGRAPH_URL[chainId]
//         : CHAIN_SUBGRAPH_URL[SupportedChainId.MAINNET],
//   }))

//   return forward(operation)
// })

export const limitlessClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'https://api.studio.thegraph.com/query/40393/limitless-sepolia/version/latest',
  //link: concat(authMiddleware, httpLink),
})

export function useLimitlessSubgraph(): ApolloClient<NormalizedCacheObject> {
  // const [activeNetwork] = useActiveNetworkVersion()
  // const { chainId } = useWeb3React()
  return limitlessClient
}
