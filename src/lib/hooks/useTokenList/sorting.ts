import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { TokenInfo } from '@uniswap/token-lists'
import { useMemo } from 'react'

// import { nativeOnChain } from 'constants/tokens'
// import { PortfolioTokenBalancePartsFragment } from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'
// import { SplitOptions, splitHiddenTokens } from 'utils/splitHiddenTokens'
// import { fromGraphQLChain } from 'graphql/data/util'
// import { SupportedChainId } from 'constants/chains'

/** Sorts currency amounts (descending). */
function balanceComparator(a?: CurrencyAmount<Currency>, b?: CurrencyAmount<Currency>) {
  if (a && b) {
    return a.greaterThan(b) ? -1 : a.equalTo(b) ? 0 : 1
  } else if (a?.greaterThan('0')) {
    return -1
  } else if (b?.greaterThan('0')) {
    return 1
  }
  return 0
}

type TokenBalances = { [tokenAddress: string]: CurrencyAmount<Token> | undefined }

/** Sorts tokens by currency amount (descending), then safety, then symbol (ascending). */
export function tokenComparator(balances: TokenBalances, a: Token, b: Token) {
  // Sorts by balances
  const balanceComparison = balanceComparator(balances[a.address], balances[b.address])
  if (balanceComparison !== 0) return balanceComparison

  // Sorts by symbol
  if (a.symbol && b.symbol) {
    return a.symbol.toLowerCase() < b.symbol.toLowerCase() ? -1 : 1
  }

  return -1
}

/** Given the results of the PortfolioTokenBalances query, returns a filtered list of tokens sorted by USD value. */
// export function getSortedPortfolioTokens(
//   portfolioTokenBalances: (PortfolioTokenBalancePartsFragment | undefined)[] | undefined,
//   balances: TokenBalances,
//   chainId: SupportedChainId | undefined,
//   splitOptions?: SplitOptions
// ): Token[] {
//   const validVisiblePortfolioTokens = splitHiddenTokens(portfolioTokenBalances ?? [], splitOptions)
//     .visibleTokens.map((tokenBalance) => {
//       const address = tokenBalance.token?.standard === 'ERC20' ? tokenBalance.token?.address?.toLowerCase() : 'ETH'
//       if (!tokenBalance?.token?.chain || !tokenBalance.token?.decimals || !address) {
//         return undefined
//       }

//       const tokenChainId = fromGraphQLChain(tokenBalance.token?.chain) ?? SupportedChainId.MAINNET
//       if (tokenChainId !== chainId) {
//         return undefined
//       }

//       if (address === 'ETH') {
//         return nativeOnChain(tokenChainId)
//       }

//       const portfolioToken = new Token(
//         tokenChainId,
//         address,
//         tokenBalance.token?.decimals,
//         tokenBalance.token?.symbol,
//         tokenBalance.token?.name
//       )

//       return portfolioToken
//     })
//     .filter((token) => !!token) as Token[]
//   return validVisiblePortfolioTokens.sort(tokenComparator.bind(null, balances))
// }

/** Sorts tokens by query, giving precedence to exact matches and partial matches. */
export function useSortTokensByQuery<T extends Token | TokenInfo>(query: string, tokens?: T[]): T[] {
  return useMemo(() => {
    if (!tokens) {
      return []
    }

    const matches = query
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0)

    if (matches.length > 1) {
      return tokens
    }

    const exactMatches: T[] = []
    const symbolSubtrings: T[] = []
    const rest: T[] = []

    // sort tokens by exact match -> subtring on symbol match -> rest
    const trimmedQuery = query.toLowerCase().trim()
    tokens.map((token) => {
      const symbol = token.symbol?.toLowerCase()
      if (symbol === matches[0]) {
        return exactMatches.push(token)
      } else if (symbol?.startsWith(trimmedQuery)) {
        return symbolSubtrings.push(token)
      } else {
        return rest.push(token)
      }
    })

    return [...exactMatches, ...symbolSubtrings, ...rest]
  }, [tokens, query])
}

// export function tokenQuerySortComparator<T extends Currency | TokenInfo>(query: string): (a: T, b: T) => number {
//   const trimmedQuery = query.toLowerCase().trim()

//   return (a: T, b: T) => {
//     const aSymbol = a.symbol?.toLowerCase()
//     const bSymbol = b.symbol?.toLowerCase()

//     // Check for exact matches
//     if (aSymbol === trimmedQuery && bSymbol !== trimmedQuery) {
//       return -1 // a comes first
//     }
//     if (bSymbol === trimmedQuery && aSymbol !== trimmedQuery) {
//       return 1 // b comes first
//     }

//     // Check for substring matches
//     const aStartsWith = aSymbol?.startsWith(trimmedQuery) ? 1 : 0
//     const bStartsWith = bSymbol?.startsWith(trimmedQuery) ? 1 : 0

//     if (aStartsWith !== bStartsWith) {
//       return bStartsWith - aStartsWith // The one with substring match comes first
//     }

//     // If none of the above conditions are met, maintain original order
//     return 0
//   }
// }
