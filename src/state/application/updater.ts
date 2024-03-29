import { useWeb3React } from '@web3-react/core'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { SupportedChainId } from 'constants/chains'
import useDebounce from 'hooks/useDebounce'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { usePoolsOHLC } from 'hooks/usePoolsOHLC'
import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { useSetCurrentPool } from 'state/user/hooks'
import { PoolKey } from 'types/lmtv2position'
import { supportedChainId } from 'utils/supportedChainId'

import { useCloseModal, usePoolKeyList } from './hooks'
import { updateChainId, updatePoolList, updatePoolPriceData } from './reducer'

const DEFAULT_POOLS: {
  [chainId: number]: {
    poolKey: PoolKey
    poolId: string
    inputIsToken0: boolean
  }
} = {
  [SupportedChainId.ARBITRUM_ONE]: {
    poolKey: {
      token0: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      token1: '0x912CE59144191C1204E64559FE8253a0e49E6548',
      fee: 500,
    },
    poolId: getPoolId('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', '0x912CE59144191C1204E64559FE8253a0e49E6548', 500),
    inputIsToken0: true,
  },
  [SupportedChainId.LINEA]: {
    poolKey: {
      token0: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
      token1: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
      fee: 500,
    },
    poolId: getPoolId('0x176211869cA2b568f2A7D4EE941E073a821EE1ff', '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', 500),
    inputIsToken0: false,
  },
}

export default function Updater(): null {
  const { account, chainId, provider } = useWeb3React()
  const dispatch = useAppDispatch()
  const windowVisible = useIsWindowVisible()

  const [activeChainId, setActiveChainId] = useState(chainId)

  const closeModal = useCloseModal()
  const previousAccountValue = useRef(account)
  const { keyList: poolList } = usePoolKeyList()
  const { poolsOHLC } = usePoolsOHLC(poolList)

  useEffect(() => {
    if (poolList && poolList.length > 0) {
      dispatch(updatePoolList(poolList))
    }
  }, [poolList, dispatch])

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

  const currentPool = useAppSelector((state) => {
    return state.user.currentPool
  })

  const setCurrentPool = useSetCurrentPool()

  // set default pool
  useEffect(() => {
    if (!currentPool && chainId) {
      const { poolId, inputIsToken0 } = DEFAULT_POOLS[chainId]
      setCurrentPool(poolId, inputIsToken0)
    }
  }, [currentPool, chainId, setCurrentPool])

  useEffect(() => {
    if (provider && chainId && windowVisible) {
      if (activeChainId !== chainId) {
        setActiveChainId(chainId)
        const { poolId, inputIsToken0 } = DEFAULT_POOLS[chainId]
        setCurrentPool(poolId, inputIsToken0)
      }
    }
  }, [dispatch, chainId, provider, windowVisible, activeChainId, setCurrentPool])

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
