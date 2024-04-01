import { useWeb3React } from '@web3-react/core'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { SupportedChainId } from 'constants/chains'
import { useLmtQuoterContract } from 'hooks/useContract'
import useDebounce from 'hooks/useDebounce'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { usePoolsOHLC } from 'hooks/usePoolsOHLC'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setCurrentPool } from 'state/user/reducer'
import { PoolKey } from 'types/lmtv2position'
import { supportedChainId } from 'utils/supportedChainId'

import { useCloseModal } from './hooks'
import { updateChainId, updatePoolPriceData } from './reducer'

const DEFAULT_POOLS: {
  [chainId: number]: {
    poolKey: PoolKey
    poolId: string
    inputInToken0: boolean
  }
} = {
  [SupportedChainId.ARBITRUM_ONE]: {
    poolKey: {
      token0: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      token1: '0x912CE59144191C1204E64559FE8253a0e49E6548',
      fee: 500,
    },
    poolId: getPoolId('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', '0x912CE59144191C1204E64559FE8253a0e49E6548', 500),
    inputInToken0: true,
  },
  [SupportedChainId.BERA_ARTIO]: {
    poolKey: {
      token0: '0x174652b085C32361121D519D788AbF0D9ad1C355',
      token1: '0x35B4c60a4677EcadaF2fe13fe3678efF724be16b',
      fee: 500,
    },
    poolId: getPoolId('0x174652b085C32361121D519D788AbF0D9ad1C355', '0x35B4c60a4677EcadaF2fe13fe3678efF724be16b', 500),
    inputInToken0: true,
  },
  [SupportedChainId.LINEA]: {
    poolKey: {
      token0: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
      token1: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
      fee: 500,
    },
    poolId: getPoolId('0x176211869cA2b568f2A7D4EE941E073a821EE1ff', '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', 500),
    inputInToken0: false,
  },
}

export default function Updater(): null {
  const { account, chainId, provider } = useWeb3React()
  const dispatch = useAppDispatch()
  const windowVisible = useIsWindowVisible()

  const [activeChainId, setActiveChainId] = useState(chainId)

  const closeModal = useCloseModal()
  const previousAccountValue = useRef(account)

  // fetch pool list for current chain
  const lmtQuoter = useLmtQuoterContract()
  const { result, loading, error } = useSingleCallResult(lmtQuoter, 'getPoolKeys', [])
  const poolList = useMemo(() => {
    if (result) {
      return result[0]
    } else {
      return undefined
    }
  }, [result])
  const { poolsOHLC } = usePoolsOHLC(poolList)

  useEffect(() => {
    if (poolsOHLC) {
      dispatch(updatePoolPriceData(poolsOHLC))
    }
  }, [poolsOHLC, dispatch])

  useEffect(() => {
    if (account && account !== previousAccountValue.current) {
      previousAccountValue.current = account
      closeModal()
    }
  }, [account, closeModal])

  const currentPools = useAppSelector((state) => state.user.poolLists)
  // const userState = useAppSelector((state) => state.user)

  // set default pool for current chain
  useEffect(() => {
    if (chainId && !currentPools[chainId]) {
      const { poolId, inputInToken0 } = DEFAULT_POOLS[chainId]
      dispatch(setCurrentPool({ chainId, poolId, inputInToken0 }))
    }
  }, [dispatch, chainId, currentPools])

  useEffect(() => {
    if (provider && chainId && windowVisible) {
      if (activeChainId !== chainId) {
        setActiveChainId(chainId)
        const { poolId, inputInToken0 } = DEFAULT_POOLS[chainId]
        setCurrentPool({ chainId, poolId, inputInToken0 })
      }
    }
  }, [dispatch, chainId, provider, windowVisible, activeChainId])

  const debouncedChainId = useDebounce(activeChainId, 100)

  useEffect(() => {
    const chainId = debouncedChainId ? supportedChainId(debouncedChainId) ?? null : null
    dispatch(updateChainId({ chainId }))
  }, [dispatch, debouncedChainId])

  // useEffect(() => {
  //   let stale = false

  //   if (provider && activeChainId && windowVisible) {
  //     // If chainId hasn't changed, don't clear the block. This prevents re-fetching still valid data.

  //     provider
  //       .getBlockNumber()
  //       .then((_block) => {
  //         if (!stale) onBlock(_block)
  //       })
  //       .catch((error) => {
  //         console.error(`Failed to get block number for chainId ${activeChainId}`, error)
  //       })

  //     provider.on('block', onBlock)
  //     return () => {
  //       stale = true
  //       provider.removeListener('block', onBlock)
  //     }
  //   }

  //   return void 0
  // }, [activeChainId, provider, onBlock, windowVisible])
  return null
}
