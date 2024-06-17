import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useTokenBalancesWithLoadingIndicator } from 'lib/hooks/useCurrencyBalance'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'

import { useDefaultActiveTokens } from '../../hooks/Tokens'

export {
  default as useCurrencyBalance,
  useCurrencyBalances,
  useNativeCurrencyBalances,
  useTokenBalance,
  useTokenBalances,
  useTokenBalancesWithLoadingIndicator,
} from 'lib/hooks/useCurrencyBalance'

// mimics useAllBalances
export function useAllTokenBalances(): [{ [tokenAddress: string]: CurrencyAmount<Token> | undefined }, boolean] {
  const account = useAccount().address
  const allTokens = useDefaultActiveTokens()
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens])
  const [balances, balancesIsLoading] = useTokenBalancesWithLoadingIndicator(account ?? undefined, allTokensArray)
  return [balances ?? {}, balancesIsLoading]
}
