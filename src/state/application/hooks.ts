import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { sendAnalyticsEvent } from '@uniswap/analytics'
import { MoonpayEventName } from '@uniswap/analytics-events'
import Quoter from 'abis_v2/Quoter.json'
import { BigNumber as BN } from 'bignumber.js'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { DEFAULT_TXN_DISMISS_MS } from 'constants/misc'
import { Interface } from 'ethers/lib/utils'
import { useLmtQuoterContract } from 'hooks/useContract'
import { getPoolAddress } from 'hooks/usePoolsOHLC'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { PoolKey } from 'types/lmtv2position'
import { getPoolId } from 'utils/lmtSDK/LmtIds'
import { useChainId } from 'wagmi'

import { AppState } from '../types'
import {
  addPopup,
  ApplicationModal,
  PopupContent,
  removePopup,
  setBLScrollPosition,
  setFiatOnrampAvailability,
  setOpenModal,
  updateBlockNumber,
} from './reducer'

const quoterAbi = new Interface(Quoter.abi)

export function useModalIsOpen(modal: ApplicationModal): boolean {
  const openModal = useAppSelector((state: AppState) => state.application.openModal)
  return openModal === modal
}

/** @ref https://dashboard.moonpay.com/api_reference/client_side_api#ip_addresses */
interface MoonpayIPAddressesResponse {
  alpha3?: string
  isAllowed?: boolean
  isBuyAllowed?: boolean
  isSellAllowed?: boolean
}

async function getMoonpayAvailability(): Promise<boolean> {
  const moonpayPublishableKey = process.env.REACT_APP_MOONPAY_PUBLISHABLE_KEY
  if (!moonpayPublishableKey) {
    throw new Error('Must provide a publishable key for moonpay.')
  }
  const moonpayApiURI = process.env.REACT_APP_MOONPAY_API
  if (!moonpayApiURI) {
    throw new Error('Must provide an api endpoint for moonpay.')
  }
  const res = await fetch(`${moonpayApiURI}/v4/ip_address?apiKey=${moonpayPublishableKey}`)
  const data = await (res.json() as Promise<MoonpayIPAddressesResponse>)
  return data.isBuyAllowed ?? false
}

export interface PoolContractInfo {
  decimals0: number
  decimals1: number
  fee: number
  name0: string
  name1: string
  symbol0: string
  symbol1: string
  tick: number
  token0: string
  token1: string
  poolAddress: string
  category: string
}
export function usePoolKeyList(
  isDefaultPoolList?: boolean
): {
  poolList: PoolContractInfo[] | undefined
  poolMap: { [poolId: string]: PoolContractInfo } | undefined
} {
  const chainId = useChainId()
  const lmtQuoter = useLmtQuoterContract()

  const queryKey = useMemo(() => {
    if (!chainId || !lmtQuoter) return []
    return ['queryPoolKeys', chainId, lmtQuoter]
  }, [chainId, lmtQuoter])

  const queryFn = useCallback(async () => {
    if (chainId && lmtQuoter) {
      try {
        const poolKeys = await lmtQuoter.getPoolKeys()
        return poolKeys
      } catch (err) {
        console.log('poolKeyList:error', err)
      }
    }
    throw new Error('missing parameters')
  }, [chainId, lmtQuoter])

  const enabled = useMemo(() => {
    return Boolean(chainId && lmtQuoter)
  }, [chainId, lmtQuoter])

  const { data } = useQuery({
    queryKey,
    queryFn,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    refetchInterval: 60 * 1000,
    enabled,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })

  const poolList = useMemo(() => {
    if (data && chainId) {
      const _data = data.map((pool: any) => {
        let category = 'Meme'
        if (pool.symbol0 === 'SPEC' || pool.symbol1 === 'SPEC') {
          category = 'AI'
        }
        if (
          pool.symbol0 === 'IHF' ||
          pool.symbol1 === 'IHF' ||
          pool.symbol0 === 'NZT' ||
          pool.symbol1 === 'NZT' ||
          pool.symbol0 === 'ZRO' ||
          pool.symbol1 === 'ZRO' ||
          pool.symbol0 === 'AERO' ||
          pool.symbol1 === 'AERO'
        ) {
          category = 'DeFi'
        }
        if (pool.symbol0 === 'USDC' || pool.symbol1 === 'USDC') {
          category = ''
        }
        return {
          token0: pool.token0,
          token1: pool.token1,
          fee: pool.fee,
          tick: pool.tick,
          name0: pool.name0,
          name1: pool.name1,
          symbol0: pool.symbol0,
          symbol1: pool.symbol1,
          decimals0: pool.decimals0,
          decimals1: pool.decimals1,
          poolAddress: getPoolAddress(pool.token0, pool.token1, pool.fee, V3_CORE_FACTORY_ADDRESSES[chainId]),
          category,
        }
      })

      if (!isDefaultPoolList) {
        const symbolsToRemove = ['INT', 'BONKE', 'BSHIB', 'DJT', 'DAI'] // remove pools with these symbols

        const filteredResult = _data.filter(
          (pool: any) => !symbolsToRemove.includes(pool.symbol0) && !symbolsToRemove.includes(pool.symbol1)
        )
        return filteredResult
      } else {
        return _data
      }
    } else {
      return undefined
    }
  }, [data, chainId])

  const poolMap = useMemo(() => {
    if (poolList) {
      const newPoolMap = poolList.reduce(
        (prev, current) => {
          prev[getPoolId(current.token0, current.token1, current.fee)] = current
          return prev
        },
        {} as {
          [pool: string]: PoolContractInfo
        }
      )
      return newPoolMap
    }
    return undefined
  }, [poolList])

  return useMemo(() => {
    return { poolList, poolMap }
  }, [poolList, poolMap])
}

export function usePoolsAprUtilList(): {
  poolList: { [poolId: string]: { apr: number; utilTotal: number } } | undefined
  loading: boolean
  error: any
} {
  const lmtQuoter = useLmtQuoterContract()
  const { result, loading, error } = useSingleCallResult(lmtQuoter, 'getAllAprUtil', ['1000'], {
    gasRequired: 10000000,
  })

  const list = useMemo(() => {
    if (result) {
      const poolList: { [poolId: string]: { apr: number; utilTotal: number } } = {}
      result[0].forEach((item: any) => {
        poolList[getPoolId(item.key.token0, item.key.token1, item.key.fee)] = {
          apr: new BN(item.apr.toString()).shiftedBy(-16).toNumber(),
          utilTotal: new BN(item.utilTotal.toString()).shiftedBy(-16).toNumber(),
        }
      })
      return poolList
    } else {
      return undefined
    }
  }, [result])

  return useMemo(() => {
    return {
      poolList: list,
      loading,
      error,
    }
  }, [list, loading, error])
}

export function useAppPoolOHLC() {
  return {} as any
  // return useAppSelector((state: AppState) => state.application.poolPriceData)
}

export function usePoolOHLCs():
  | {
      [poolId: string]: {
        pool: PoolKey
        priceNow: number
        price24hAgo: number
        delta24h: number
        high24: number
        low24: number
        token0IsBase: boolean
        invertedGecko: boolean
      }
    }
  | undefined {
  const chainId = useChainId()
  // const poolsOHLC = useAppSelector((state: AppState) => state.application.poolPriceData)
  return undefined as any
  // return useMemo(() => {
  //   if (!chainId) return undefined
  //   return poolsOHLC[chainId]
  // }, [chainId, poolsOHLC])
}

export function usePoolOHLC(
  tokenA: string | undefined | null,
  tokenB: string | undefined | null,
  fee: number | undefined
):
  | {
      pool: PoolKey
      priceNow: number
      price24hAgo: number
      delta24h: number
      high24: number
      low24: number
      token0IsBase: boolean
      invertedGecko: boolean
    }
  | undefined {
  const chainId = useChainId()
  return undefined as any
  // const poolOHLCs = useAppSelector((state: AppState) => state.application.poolPriceData)
  // // console.log('zeke:', poolOHLCs)
  // return useMemo(() => {
  //   if (!tokenA || !tokenB || !fee || !chainId) return undefined
  //   const poolId = getPoolId(tokenA, tokenB, fee)

  //   if (chainId && poolOHLCs[chainId] && poolOHLCs[chainId][poolId]) {
  //     return poolOHLCs[chainId][poolId]
  //   }

  //   return undefined
  // }, [chainId, tokenA, tokenB, fee, poolOHLCs])
}

export function useSetBLSScrollPosition(position: number | undefined): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setBLScrollPosition(position)), [dispatch, position])
}

export function useFiatOnrampAvailability(shouldCheck: boolean, callback?: () => void) {
  const dispatch = useAppDispatch()
  const { available, availabilityChecked } = useAppSelector((state: AppState) => state.application.fiatOnramp)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function checkAvailability() {
      setError(null)
      setLoading(true)
      try {
        const result = await getMoonpayAvailability()
        sendAnalyticsEvent(MoonpayEventName.MOONPAY_GEOCHECK_COMPLETED, { success: result })
        if (stale) return
        dispatch(setFiatOnrampAvailability(result))
        if (result && callback) {
          callback()
        }
      } catch (e) {
        console.error('Error checking onramp availability', e.toString())
        if (stale) return
        setError('Error, try again later.')
        dispatch(setFiatOnrampAvailability(false))
      } finally {
        if (!stale) setLoading(false)
      }
    }

    if (!availabilityChecked && shouldCheck) {
      checkAvailability()
    }

    let stale = false
    return () => {
      stale = true
    }
  }, [availabilityChecked, callback, dispatch, shouldCheck])

  return { available, availabilityChecked, loading, error }
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const isOpen = useModalIsOpen(modal)
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(isOpen ? null : modal)), [dispatch, modal, isOpen])
}

export function useUpdateBlockNumber(): (blockNumber: number) => void {
  const dispatch = useAppDispatch()
  return useCallback((blockNumber: number) => dispatch(updateBlockNumber({ blockNumber })), [dispatch])
}

export function useCloseModal(): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(null)), [dispatch])
}

export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}

export function useToggleUniwalletModal(): () => void {
  return useToggleModal(ApplicationModal.UNIWALLET_CONNECT)
}

export function useToggleSettingsMenu(): () => void {
  return useToggleModal(ApplicationModal.SETTINGS)
}

export function useShowClaimPopup(): boolean {
  return useModalIsOpen(ApplicationModal.CLAIM_POPUP)
}

export function useToggleShowClaimPopup(): () => void {
  return useToggleModal(ApplicationModal.CLAIM_POPUP)
}

export function useToggleSelfClaimModal(): () => void {
  return useToggleModal(ApplicationModal.SELF_CLAIM)
}

export function useToggleDelegateModal(): () => void {
  return useToggleModal(ApplicationModal.DELEGATE)
}

export function useToggleVoteModal(): () => void {
  return useToggleModal(ApplicationModal.VOTE)
}

export function useToggleQueueModal(): () => void {
  return useToggleModal(ApplicationModal.QUEUE)
}

export function useToggleExecuteModal(): () => void {
  return useToggleModal(ApplicationModal.EXECUTE)
}

export function useTogglePrivacyPolicy(): () => void {
  return useToggleModal(ApplicationModal.PRIVACY_POLICY)
}

export function useToggleFeatureFlags(): () => void {
  return useToggleModal(ApplicationModal.FEATURE_FLAGS)
}

// returns a function that allows adding a popup
export function useAddPopup(): (content: PopupContent, key?: string, removeAfterMs?: number) => void {
  const dispatch = useAppDispatch()

  return useCallback(
    (content: PopupContent, key?: string, removeAfterMs?: number) => {
      dispatch(addPopup({ content, key, removeAfterMs: removeAfterMs ?? DEFAULT_TXN_DISMISS_MS }))
    },
    [dispatch]
  )
}

// returns a function that allows removing a popup via its key
export function useRemovePopup(): (key: string) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }))
    },
    [dispatch]
  )
}

// get the list of active popups
export function useActivePopups(): AppState['application']['popupList'] {
  const list = useAppSelector((state: AppState) => state.application.popupList)
  return useMemo(() => list.filter((item) => item.show), [list])
}
