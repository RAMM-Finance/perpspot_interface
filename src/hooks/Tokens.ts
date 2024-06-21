import { Currency, Token } from '@uniswap/sdk-core'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { getDefaultTokensMap } from 'constants/fake-tokens'
import { DEFAULT_INACTIVE_LIST_URLS, DEFAULT_LIST_OF_LISTS } from 'constants/lists'
import { useCurrencyFromMap, useTokenFromMapOrNetwork } from 'lib/hooks/useCurrency'
import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'
import { useMemo } from 'react'
import { usePoolKeyList } from 'state/application/hooks'
import { isL2ChainId } from 'utils/chains'
import { useChainId } from 'wagmi'

import { useAllLists, useCombinedTokenMapFromUrls } from '../state/lists/hooks'
import { WrappedTokenInfo } from '../state/lists/wrappedTokenInfo'
import { useUserAddedTokens, useUserAddedTokensOnChain } from '../state/user/hooks'
import { TokenAddressMap, useUnsupportedTokenList } from './../state/lists/hooks'

// reduce token map into standard address <-> Token mapping, optionally include user added tokens
function useTokensFromMap(tokenMap: TokenAddressMap): { [address: string]: Token } {
  const chainId = useChainId()
  return useMemo(() => {
    if (!chainId) return {}

    // reduce to just tokens
    return Object.keys(tokenMap[chainId] ?? {}).reduce<{ [address: string]: Token }>((newMap, address) => {
      newMap[address] = tokenMap[chainId][address].token
      return newMap
    }, {})
  }, [chainId, tokenMap])
}

export function useAllTokensMultichain(): TokenAddressMap {
  return useCombinedTokenMapFromUrls(DEFAULT_LIST_OF_LISTS)
}

// Returns all tokens from the default list + user added tokens
export function useDefaultActiveTokens(): { [address: string]: Token } {
  const chainId = useChainId()
  const isDefaultPoolList = true
  const tokenList = usePoolKeyList(isDefaultPoolList)

  const additionalTokens = getDefaultTokensMap(chainId ?? SupportedChainId.BASE)

  return useMemo(() => {
    let activeTokens = { ...additionalTokens }

    if (!tokenList.loading && chainId) {
      const tokensFromPool = tokenList.poolList?.reduce((acc, pool) => {
        let token
        if (pool.symbol1 !== 'WETH') {
          token = new Token(chainId, pool.token1, pool.decimals1, pool.symbol1, pool.name1)
          return { ...acc, [pool.token1]: token }
        } else {
          token = new Token(chainId, pool.token0, pool.decimals0, pool.symbol0, pool.name0)
          return { ...acc, [pool.token0]: token }
        }
      }, {})

      activeTokens = { ...activeTokens, ...tokensFromPool }
    }

    return activeTokens
  }, [chainId, tokenList, additionalTokens])
}

type BridgeInfo = Record<
  SupportedChainId,
  {
    tokenAddress: string
    originBridgeAddress: string
    destBridgeAddress: string
  }
>

export function useUnsupportedTokens(): { [address: string]: Token } {
  const chainId = useChainId()
  const listsByUrl = useAllLists()
  const unsupportedTokensMap = useUnsupportedTokenList()
  const unsupportedTokens = useTokensFromMap(unsupportedTokensMap)

  // checks the default L2 lists to see if `bridgeInfo` has an L1 address value that is unsupported
  const l2InferredBlockedTokens: typeof unsupportedTokens = useMemo(() => {
    if (!chainId || !isL2ChainId(chainId)) {
      return {}
    }

    if (!listsByUrl) {
      return {}
    }

    const listUrl = getChainInfo(chainId).defaultListUrl

    const { current: list } = listsByUrl[listUrl]
    if (!list) {
      return {}
    }

    const unsupportedSet = new Set(Object.keys(unsupportedTokens))

    return list.tokens.reduce((acc, tokenInfo) => {
      // const bridgeInfo = tokenInfo.extensions?.bridgeInfo as unknown as BridgeInfo
      // if (
      //   bridgeInfo &&
      //   bridgeInfo[SupportedChainId.MAINNET] &&
      //   bridgeInfo[SupportedChainId.MAINNET].tokenAddress &&
      //   unsupportedSet.has(bridgeInfo[SupportedChainId.MAINNET].tokenAddress)
      // ) {
      //   const address = bridgeInfo[SupportedChainId.MAINNET].tokenAddress
      //   // don't rely on decimals--it's possible that a token could be bridged w/ different decimals on the L2
      //   return { ...acc, [address]: new Token(SupportedChainId.MAINNET, address, tokenInfo.decimals) }
      // }
      return acc
    }, {})
  }, [chainId, listsByUrl, unsupportedTokens])

  return { ...unsupportedTokens, ...l2InferredBlockedTokens }
}

export function useSearchInactiveTokenLists(search: string | undefined, minResults = 10): WrappedTokenInfo[] {
  const lists = useAllLists()
  const inactiveUrls = DEFAULT_INACTIVE_LIST_URLS
  const chainId = useChainId()
  const activeTokens = useDefaultActiveTokens()
  return useMemo(() => {
    if (!search || search.trim().length === 0) return []
    const tokenFilter = getTokenFilter(search)
    const result: WrappedTokenInfo[] = []
    const addressSet: { [address: string]: true } = {}
    for (const url of inactiveUrls) {
      const list = lists[url]?.current
      if (!list) continue
      for (const tokenInfo of list.tokens) {
        if (tokenInfo.chainId === chainId && tokenFilter(tokenInfo)) {
          try {
            const wrapped: WrappedTokenInfo = new WrappedTokenInfo(tokenInfo, list)
            if (!(wrapped.address in activeTokens) && !addressSet[wrapped.address]) {
              addressSet[wrapped.address] = true
              result.push(wrapped)
              if (result.length >= minResults) return result
            }
          } catch {
            continue
          }
        }
      }
    }
    return result
  }, [activeTokens, chainId, inactiveUrls, lists, minResults, search])
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(currency: Currency | undefined | null): boolean {
  const userAddedTokens = useUserAddedTokens()

  if (!currency) {
    return false
  }

  return !!userAddedTokens.find((token) => currency.equals(token))
}

// Check if currency on specific chain is included in custom list from user storage
export function useIsUserAddedTokenOnChain(
  address: string | undefined | null,
  chain: number | undefined | null
): boolean {
  const userAddedTokens = useUserAddedTokensOnChain(chain)

  if (!address || !chain) {
    return false
  }

  return !!userAddedTokens.find((token) => token.address === address)
}

// undefined if invalid or does not exist
// null if loading or null was passed
// otherwise returns the token
export function useToken(tokenAddress?: string | null): Token | null | undefined {
  const tokens = useDefaultActiveTokens()

  return useTokenFromMapOrNetwork(tokens, tokenAddress)
}

export function useCurrency(currencyId?: string | null): Currency | null | undefined {
  const tokens = useDefaultActiveTokens()
  
  return useCurrencyFromMap(tokens, currencyId)
}
