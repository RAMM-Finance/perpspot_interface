import { Chain } from 'graphql/data/Token'
import { chainIdToBackendName } from 'graphql/data/util'
import { useEffect, useRef } from 'react'
import { useChainId } from 'wagmi'

export const useOnGlobalChainSwitch = (callback: (chain: Chain) => void) => {
  const connectedChainId = useChainId()
  const globalChainName = chainIdToBackendName(connectedChainId)
  const prevGlobalChainRef = useRef(globalChainName)
  useEffect(() => {
    if (prevGlobalChainRef.current !== globalChainName) {
      callback(globalChainName)
    }
    prevGlobalChainRef.current = globalChainName
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalChainName])
}
