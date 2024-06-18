import { SupportedChainId } from 'constants/chains'
import { useCallback } from 'react'
import { useAppDispatch } from 'state/hooks'
import { useSwitchChain } from 'wagmi'

export default function useSelectChain() {
  const dispatch = useAppDispatch()
  // const { connector } = useWeb3React()
  // const getConnection = useGetConnection()
  const { switchChain } = useSwitchChain()

  return useCallback(
    async (targetChain: SupportedChainId) => {
      switchChain({ chainId: targetChain })
      // if (!connector) return

      // const connectionType = getConnection(connector).type

      // try {
      //   dispatch(updateConnectionError({ connectionType, error: undefined }))
      //   await switchChain(connector, targetChain)
      // } catch (error) {
      //   console.error('Failed to switch networks', error)

      //   dispatch(updateConnectionError({ connectionType, error: error.message }))
      //   dispatch(addPopup({ content: { failedSwitchNetwork: targetChain }, key: 'failed-network-switch' }))
      // }
    },
    [dispatch]
  )
}
