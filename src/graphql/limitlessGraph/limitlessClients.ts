import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { cacheExchange, createClient, fetchExchange } from '@urql/core'
import {
  AddQuery,
  AddVolumeQuery,
  ForceClosedQuery,
  ForceClosedQueryV2,
  LiquidityProvidedQuery,
  LiquidityProvidedQueryV2,
  LiquidityWithdrawnQuery,
  LiquidityWithdrawnQueryV2,
  NftTransferQuery,
  ReduceQuery,
  ReduceVolumeQuery,
  RegisterQueryV2,
} from 'graphql/limitlessGraph/queries'

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
  const first = 1000 // maximum limit
  let skip = 0

  
  let timestamp = 0
  let queryResultLength = 6000
  
  while (queryResultLength === 6000) {
    const promises = []
    for (let i = 0; i < 6; i++) {
      promises.push(client.query(query, { first, skip, blockTimestamp_gt: timestamp.toString() }).toPromise())
      skip += first
    }
    queryResultLength = 0
    const results = await Promise.all(promises)
  
    for (const result of results) {
      let newData = null
      
      if (query === AddQuery || query === AddVolumeQuery) {
        newData = result.data?.marginPositionIncreaseds
      } else if (query === ReduceQuery || query === ReduceVolumeQuery) {
        newData = result.data?.marginPositionReduceds
      } else if (query === LiquidityProvidedQuery || query === LiquidityProvidedQueryV2) {
        newData = result.data?.liquidityProvideds
      } else if (query === LiquidityWithdrawnQuery || query === LiquidityWithdrawnQueryV2) {
        newData = result.data?.liquidityWithdrawns
      } else if (query === ForceClosedQuery || query === ForceClosedQueryV2) {
        newData = result.data?.forceCloseds
      } else if (query === NftTransferQuery) {
        newData = result.data?.transfers
      } else if (query === RegisterQueryV2) {
        newData = result.data?.registerCodes
      }

      if (newData && newData.length) {
        queryResultLength += newData.length
        allResults.push(...newData)
      }
    }
    if (queryResultLength === 6000) {
      const uniqueTimestamps = Array.from(new Set(allResults.map(result => result.blockTimestamp)))
      skip = 0
      timestamp = uniqueTimestamps[uniqueTimestamps.length - 2]
      allResults = allResults.filter(result => result.blockTimestamp !== uniqueTimestamps[uniqueTimestamps.length - 1])
    } else {
      break
    }
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
  return limitlessClient
}
