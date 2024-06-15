import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useChainId } from 'wagmi'
import { useEthersProvider } from 'wagmi-lib/adapters'

const MISSING_PROVIDER = Symbol()
const BlockNumberContext = createContext<
  | {
      block?: number
      fastForward(block: number): void
    }
  | typeof MISSING_PROVIDER
>(MISSING_PROVIDER)

function useBlockNumberContext() {
  const blockNumber = useContext(BlockNumberContext)
  if (blockNumber === MISSING_PROVIDER) {
    throw new Error('BlockNumber hooks must be wrapped in a <BlockNumberProvider>')
  }
  return blockNumber
}

/** Requires that BlockUpdater be installed in the DOM tree. */
export default function useBlockNumber(): number | undefined {
  return useBlockNumberContext().block
}

export function useFastForwardBlockNumber(): (block: number) => void {
  return useBlockNumberContext().fastForward
}

export function BlockNumberProvider({ children }: { children: ReactNode }) {
  const activeChainId = useChainId()
  const [{ chainId, block }, setChainBlock] = useState<{
    chainId?: number
    block?: number
  }>({})
  const activeBlock = chainId === activeChainId ? block : undefined

  const onChainBlock = useCallback((chainId: number, block: number) => {
    setChainBlock((chainBlock) => {
      if (chainBlock.chainId === chainId) {
        if (!chainBlock.block || chainBlock.block < block) {
          return { chainId, block }
        }
      }
      return chainBlock
    })
  }, [])

  // Poll for block number on the active provider.
  const windowVisible = useIsWindowVisible()
  const provider = useEthersProvider({ chainId: activeChainId })

  useEffect(() => {
    if (provider && activeChainId && windowVisible) {
      setChainBlock((chainBlock) => {
        if (chainBlock.chainId !== activeChainId) {
          return { chainId: activeChainId }
        }
        // If chainId hasn't changed, don't invalidate the reference, as it will trigger re-fetching of still-valid data.
        return chainBlock
      })

      const onBlock = (block: number) => onChainBlock(activeChainId, block)
      provider.on('block', onBlock)
      return () => {
        provider.removeListener('block', onBlock)
      }
    }
    return
  }, [activeChainId, provider, windowVisible, onChainBlock])

  const value = useMemo(
    () => ({
      fastForward: (update: number) => {
        if (activeChainId) {
          onChainBlock(activeChainId, update)
        }
      },
      block: activeBlock,
    }),
    [activeBlock, activeChainId, onChainBlock]
  )

  return <BlockNumberContext.Provider value={value}>{children}</BlockNumberContext.Provider>
}
