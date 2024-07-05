import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { useLimweth } from './useContract'
import { getDecimalAndUsdValueData } from './useUSDPrice'
import { SupportedChainId } from 'constants/chains'
import { useChainId } from 'wagmi'

export const useLimwethTokenBalanceUSD = () => {
  const chainId = useChainId()
  const limWeth = useLimweth()
  console.log("LIMWETH", limWeth)

  const enabled = useMemo(() => {
    return Boolean(limWeth && chainId)
  }, [limWeth, chainId])

  const queryKey = useMemo(() => {
    if (!limWeth) return []
    return ['limweth tokenBalance', chainId]
  }, [limWeth, chainId])

  const getLimweth = useCallback(async () => {
    const [limWethBal, decimals, queryResult] = await Promise.all([
      limWeth?.tokenBalance(),
      limWeth?.decimals(),
      getDecimalAndUsdValueData(SupportedChainId.BASE, '0x4200000000000000000000000000000000000006'),
    ])
    console.log("LIMWETH BAL AND DEC", limWethBal, decimals, chainId)
    if (limWethBal !== undefined && decimals !== undefined) {
      const tokenBalance = parseFloat(limWethBal.toString()) / 10 ** decimals
      const price = parseFloat(queryResult?.lastPriceUSD) // BASE WETH PRICE
      console.log("PRICE ! ", price * tokenBalance)
      return price * tokenBalance
    } else 
      return 0
    
  }, [limWeth, chainId])

  const {
    data: result,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    enabled,
    queryFn: getLimweth,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // return useMemo(() => {
  //   if (!result) return undefined
  //   return result
  // }, [result, isLoading, error])

  return useMemo(() => {
    return {
      loading: isLoading,
      result,
      error,
    }
  }, [result, isLoading, chainId])
}
