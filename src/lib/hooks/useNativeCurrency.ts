import { NativeCurrency, Token } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import { nativeOnChain } from 'constants/tokens'
import { useMemo } from 'react'
import { useChainId } from 'wagmi'

export default function useNativeCurrency(_chainId?: number): NativeCurrency | Token {
  let chainId = useChainId()
  if (_chainId)
    chainId = _chainId
  return useMemo(
    () =>
      chainId
        ? nativeOnChain(chainId)
        : // display mainnet when not connected
          nativeOnChain(SupportedChainId.ARBITRUM_ONE),
    [chainId]
  )
}
