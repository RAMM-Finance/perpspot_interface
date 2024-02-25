import { useWeb3React } from '@web3-react/core'
import useDebounce from 'hooks/useDebounce'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { usePoolsOHLC } from 'hooks/usePoolsOHLC'
import { useEffect, useRef, useState } from 'react'
import { useAppDispatch } from 'state/hooks'
import { supportedChainId } from 'utils/supportedChainId'

import { useCloseModal, usePoolKeyList } from './hooks'
import { updateChainId, updatePoolList, updatePoolPriceData } from './reducer'

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

  return null
}
