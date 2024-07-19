import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { useLimweth } from './useContract'
import { getDecimalAndUsdValueData } from './useUSDPrice'
import { SupportedChainId } from 'constants/chains'
import { useChainId } from 'wagmi'

export const useLimwethTokenBalanceUSD = () => {
  // const chainId = useChainId()
  const arbLimWeth = useLimweth(false, SupportedChainId.ARBITRUM_ONE)// useArbLimweth()
  const baseLimWeth = useLimweth(false, SupportedChainId.BASE)

  const enabled = useMemo(() => {
    return Boolean(arbLimWeth && baseLimWeth)
  }, [arbLimWeth, baseLimWeth])

  const queryKey = useMemo(() => {
    if (!arbLimWeth || !baseLimWeth) return []
    return ['limweth tokenBalance', arbLimWeth.address, baseLimWeth.address]
  }, [arbLimWeth, baseLimWeth])

  const getLimweth = useCallback(async () => {
    const [arbLimWethBal, baseLimWethBal, decimals, queryResult] = await Promise.all([
      arbLimWeth?.tokenBalance(),
      baseLimWeth?.tokenBalance(),
      baseLimWeth?.decimals(),
      getDecimalAndUsdValueData(SupportedChainId.BASE, '0x4200000000000000000000000000000000000006'),
    ])
    if (arbLimWethBal !== undefined && baseLimWethBal !== undefined && decimals !== undefined) {

      const tokenBalance = (parseFloat(arbLimWethBal.toString()) + parseFloat(baseLimWethBal.toString())) / 10 ** decimals
      const price = parseFloat(queryResult?.lastPriceUSD) // BASE WETH PRICE
      return price * tokenBalance
    } else 
      return 0
    
  }, [arbLimWeth, baseLimWeth])

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
  }, [result, isLoading])
}
