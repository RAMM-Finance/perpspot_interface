import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { cacheExchange, createClient, fetchExchange } from '@urql/core'
import { SupportedChainId } from 'constants/chains'
import {
  AddCountQuery,
  AddQuery,
  AddVolumeQuery,
  ForceClosedCountQuery,
  ForceClosedQuery,
  ForceClosedQueryV2,
  LiquidityProvidedForPoolQuery,
  LiquidityProvidedQuery,
  LiquidityProvidedQueryV2,
  LiquidityWithdrawnForPoolQuery,
  LiquidityWithdrawnQuery,
  LiquidityWithdrawnQueryV2,
  NftTransferQuery,
  PremiumDepositedCountQuery,
  PremiumWithdrawnCountQuery,
  ReduceCountQuery,
  ReduceQuery,
  ReduceVolumeQuery,
  RegisterQueryV2,
} from 'graphql/limitlessGraph/queries'
import { useChainId } from 'wagmi'

// import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

const APIURL = 'https://api.studio.thegraph.com/query/71042/limitless-subgraph-arbitrum/version/latest' // 'https://api.thegraph.com/subgraphs/name/jpark0315/limitless-subgraph' // deprecated
const APIURL_BASE = 'https://api.studio.thegraph.com/query/71042/limitless-subgraph-base/version/latest'
// const APIURL = 'https://api.studio.thegraph.com/query//limitless-subgraph/'

export const clientArbitrum = createClient({
  url: APIURL,
  exchanges: [cacheExchange, fetchExchange],
})

export const clientBase = createClient({
  url: APIURL_BASE,
  exchanges: [cacheExchange, fetchExchange],
})

export async function fetchAllData(query: any, client: any, pool?: string) {
  const MAX_FETCHABLE_AMOUNT = 6000
  let allResults: any[] = []
  const first = 1000 // maximum limit
  let skip = 0

  let timestamp = 0
  let queryResultLength = MAX_FETCHABLE_AMOUNT

  while (queryResultLength === MAX_FETCHABLE_AMOUNT) {
    const promises = []
    for (let i = 0; i < 6; i++) {
      promises.push(client.query(query, { first, skip, blockTimestamp_gt: timestamp.toString(), pool }).toPromise())
      skip += first
    }
    queryResultLength = 0
    const results = await Promise.all(promises)

    for (const result of results) {
      let newData = null

      if (query === AddQuery || query === AddVolumeQuery || query === AddCountQuery) {
        newData = result.data?.marginPositionIncreaseds
      } else if (query === ReduceQuery || query === ReduceVolumeQuery || query === ReduceCountQuery) {
        newData = result.data?.marginPositionReduceds
      } else if (query === LiquidityProvidedQuery || query === LiquidityProvidedQueryV2 || query === LiquidityProvidedForPoolQuery) {
        newData = result.data?.liquidityProvideds
      } else if (query === LiquidityWithdrawnQuery || query === LiquidityWithdrawnQueryV2 || query === LiquidityWithdrawnForPoolQuery) {
        newData = result.data?.liquidityWithdrawns
      } else if (query === ForceClosedQuery || query === ForceClosedQueryV2 || query === ForceClosedCountQuery) {
        newData = result.data?.forceCloseds
      } else if (query === PremiumDepositedCountQuery) {
        newData = result.data?.premiumDepositeds
      } else if (query === PremiumWithdrawnCountQuery) {
        newData = result.data?.premiumWithdrawns
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
    if (queryResultLength === MAX_FETCHABLE_AMOUNT) {
      const uniqueTimestamps = Array.from(new Set(allResults.map((result) => result.blockTimestamp)))
      skip = 0
      timestamp = uniqueTimestamps[uniqueTimestamps.length - 2]
      allResults = allResults.filter(
        (result) => result.blockTimestamp !== uniqueTimestamps[uniqueTimestamps.length - 1]
      )
    } else {
      break
    }
  }

  return allResults
}

export const limitlessClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'https://api.studio.thegraph.com/query/40393/limitless-sepolia/version/latest',
})

export const V2BaseSubgraphClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'https://api.studio.thegraph.com/query/63403/lmt-v2-base/version/latest',
})

export const V2ArbitrumSubgraphClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'https://api.studio.thegraph.com/query/63403/lmt-v2-arbitrum/version/latest',
})

const v2SubgraphMap: { [chainId: number]: ApolloClient<NormalizedCacheObject> } = {
  [SupportedChainId.BASE]: V2BaseSubgraphClient,
  [SupportedChainId.ARBITRUM_ONE]: V2ArbitrumSubgraphClient,
}

export function useLmtV2Subgraph(): ApolloClient<NormalizedCacheObject> {
  const chainId = useChainId()
  return v2SubgraphMap[chainId]
}

export function useLimitlessSubgraph(): ApolloClient<NormalizedCacheObject> {
  // const [activeNetwork] = useActiveNetworkVersion()
  return limitlessClient
}
