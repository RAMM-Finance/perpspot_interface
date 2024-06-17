import { NativeCurrency, Token } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import { nativeOnChain } from 'constants/tokens'
import { useMemo } from 'react'
import { useChainId } from 'wagmi'

export default function useNativeCurrency(): NativeCurrency | Token {
  const chainId = useChainId()
  return useMemo(
    () =>
      chainId
        ? nativeOnChain(chainId)
        : // display mainnet when not connected
          nativeOnChain(SupportedChainId.ARBITRUM_ONE),
    [chainId]
  )
}
