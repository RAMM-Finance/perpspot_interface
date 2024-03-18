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

  useEffect(() => {
    if (provider && chainId && windowVisible) {
      setActiveChainId(chainId)
    }
  }, [dispatch, chainId, provider, windowVisible])

  const debouncedChainId = useDebounce(activeChainId, 100)

  useEffect(() => {
    const chainId = debouncedChainId ? supportedChainId(debouncedChainId) ?? null : null
    dispatch(updateChainId({ chainId }))
  }, [dispatch, debouncedChainId])

  const currentPool = useAppSelector((state) => {
    return state.user.currentPool
  })

  const setCurrentPool = useSetCurrentPool()

  useEffect(() => {
    if (!currentPool && chainId) {
      const { poolId, inputIsToken0 } = DEFAULT_POOLS[chainId]
      setCurrentPool(poolId, inputIsToken0)
    }
  }, [currentPool, chainId, setCurrentPool])

  return null
}
