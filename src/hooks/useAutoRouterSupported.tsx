import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'
import { useChainId } from 'wagmi'

export default function useAutoRouterSupported(): boolean {
  const chainId = useChainId()
  return isSupportedChainId(chainId)
}
