import { createMulticall, ListenerOptions } from '@uniswap/redux-multicall'
import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from 'constants/chains'
import { useInterfaceMulticall } from 'hooks/useContract'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { useMemo } from 'react'
// import { createMulticall, ListenerOptions } from 'redux-multicall'

const multicall = createMulticall()

export default multicall

function getBlocksPerFetchForChainId(chainId: number | undefined): number {
  switch (chainId) {
    case SupportedChainId.ARBITRUM_ONE:
    case SupportedChainId.BERA_ARTIO:
      // case SupportedChainId.OPTIMISM:
      return 15

    case SupportedChainId.LINEA:
      return 30
    case SupportedChainId.BASE:
      return 6
    default:
      return 1
  }
}

export function MulticallUpdater() {
  const { chainId } = useWeb3React()
  const latestBlockNumber = useBlockNumber()

  const contract = useInterfaceMulticall()

  const listenerOptions: ListenerOptions = useMemo(
    () => ({
      blocksPerFetch: getBlocksPerFetchForChainId(chainId),
    }),
    [chainId]
  )

  return (
    <multicall.Updater
      chainId={chainId}
      latestBlockNumber={latestBlockNumber ?? undefined}
      contract={contract}
      listenerOptions={listenerOptions}
      isDebug={true}
    />
  )
}
