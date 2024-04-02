import { ARB, NATIVE_CHAIN_ID, WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import gql from 'graphql-tag'
import { useMemo } from 'react'
import invariant from 'tiny-invariant'
import { Chain, SearchTokensQuery, Token, useSearchTokensQuery } from './__generated__/types-and-hooks'
import { chainIdToBackendName } from './util'
import { useTokenSearchQuery } from 'graphql/limitlessGraph/poolPriceData'
import { BACKEND_CHAIN_NAMES } from './util'

const ARB_ADDRESS = ARB.address.toLowerCase()

gql`
  query SearchTokens($searchQuery: String!) {
    searchTokens(searchQuery: $searchQuery) {
      id
      decimals
      name
      chain
      standard
      address
      symbol
      market(currency: USD) {
        id
        price {
          id
          value
          currency
        }
        pricePercentChange(duration: DAY) {
          id
          value
        }
        volume24H: volume(duration: DAY) {
          id
          value
          currency
        }
      }
      project {
        id
        logoUrl
        safetyLevel
      }
    }
  }
`


export type SearchToken = NonNullable<NonNullable<SearchTokensQuery['searchTokens']>[number]>

function isMoreRevelantToken(current: SearchToken, existing: SearchToken | undefined, searchChain: Chain) {
  if (!existing) return true

  // Always priotize natives, and if both tokens are native, prefer native on current chain (i.e. Matic on Polygon over Matic on Mainnet )
  if (current.standard === NATIVE_CHAIN_ID && (existing.standard !== NATIVE_CHAIN_ID || current.chain === searchChain)) return true

  // Prefer tokens on the searched chain, otherwise prefer mainnet tokens
  return current.chain === searchChain || (existing.chain !== searchChain && current.chain === Chain.Ethereum)
}

function dedupeCrosschainTokens(current: SearchToken, existing: SearchToken | undefined, searchChain: Chain) {
  if (!existing) return current
  invariant(current.project?.id === existing.project?.id, 'Cannot dedupe tokens within different tokenProjects')

  // Special case: always prefer Arbitrum ARB over Mainnet ARB
  if (current.address?.toLowerCase() === ARB_ADDRESS) return current
  if (existing.address?.toLowerCase() === ARB_ADDRESS) return existing

  // Always prioritize natives, and if both tokens are native, prefer native on current chain (i.e. Matic on Polygon over Matic on Mainnet )
  if (current.standard === NATIVE_CHAIN_ID && (existing.standard !== NATIVE_CHAIN_ID || current.chain === searchChain))
    return current

  // Prefer tokens on the searched chain, otherwise prefer mainnet tokens
  if (current.chain === searchChain || (existing.chain !== searchChain && current.chain === Chain.Ethereum))
    return current

  return existing
}


// Places natives first, wrapped native on current chain next, then sorts by volume
function searchTokenSortFunction(
  searchChain: Chain,
  wrappedNativeAddress: string | undefined,
  a: SearchToken,
  b: SearchToken
) {
  if (a.standard === NATIVE_CHAIN_ID) {
    if (b.standard === NATIVE_CHAIN_ID) {
      if (a.chain === searchChain) return -1
      else if (b.chain === searchChain) return 1
      else return 0
    } else return -1
  } else if (b.standard === NATIVE_CHAIN_ID) return 1
  else if (wrappedNativeAddress && a.address === wrappedNativeAddress) return -1
  else if (wrappedNativeAddress && b.address === wrappedNativeAddress) return 1
  else return (b.market?.volume24H?.value ?? 0) - (a.market?.volume24H?.value ?? 0)
}

export function useSearchTokensForSwapPage(searchQuery: string | undefined, chainId: number) {
  const { data, loading, error } = useSearchTokensQuery({
    variables: {
      searchQuery: searchQuery ?? '',
    },
    skip: !searchQuery,
  })

  const sortedTokens = useMemo(() => {
    const searchChain = chainIdToBackendName(chainId)
    // Stores results, allowing overwriting cross-chain tokens w/ more 'relevant token'
    const selectionMap: { [projectId: string]: SearchToken } = {}
    const filteredTokens = data?.searchTokens?.filter(
      (token): token is Token =>
        token !== undefined && (BACKEND_CHAIN_NAMES as ReadonlyArray<Chain>).includes(token.chain)
    )
    filteredTokens?.forEach((token) => {
      if (token.project?.id) {
        const existing = selectionMap[token.project.id]
        selectionMap[token.project.id] = dedupeCrosschainTokens(token, existing, searchChain)
      }
    })
    return Object.values(selectionMap).sort(
      searchTokenSortFunction.bind(null, searchChain, WRAPPED_NATIVE_CURRENCY[chainId]?.address)
    )
  }, [data, chainId])

  return {
    data: sortedTokens,
    loading,
    error,
  }
}


export function useSearchTokens(searchQuery: string, chainId: number) {
  // const { data, loading, error } = useSearchTokensQuery({
  //   variables: {
  //     searchQuery,
  //   },
  //   skip: !searchQuery,
  // })

  const {data, loading, error} = useTokenSearchQuery(searchQuery)
// console.log('searchQuery', data)

  // const sortedTokens = useMemo(() => {
  //   const searchChain = chainIdToBackendName(chainId)
  //   // Stores results, allowing overwriting cross-chain tokens w/ more 'relevant token'
  //   const selectionMap: { [projectId: string]: SearchToken } = {};
  //   (data as any)?.tokenSearch?.forEach((token: any) => {
  //     if (token.project?.id) {
  //       const existing = selectionMap[token.project.id]
  //       if (isMoreRevelantToken(token, existing, searchChain)) selectionMap[token.project.id] = token
  //     }
  //   })
  //   return Object.values(selectionMap).sort(
  //     searchTokenSortFunction.bind(null, searchChain, WRAPPED_NATIVE_CURRENCY[chainId]?.address)
  //   )
  // }, [data, chainId])


  return {
    data: (data as any)?.tokenSearch,
    // data: data,
    loading,
    error,
  }
}
