import { sendAnalyticsEvent } from '@uniswap/analytics'
import { MoonpayEventName } from '@uniswap/analytics-events'
import Quoter from 'abis_v2/Quoter.json'
import { BigNumber as BN } from 'bignumber.js'
import { LMT_QUOTER, V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { DEFAULT_TXN_DISMISS_MS } from 'constants/misc'
import { Interface } from 'ethers/lib/utils'
import { useLmtQuoterContract } from 'hooks/useContract'
import { useContractCallV2 } from 'hooks/useContractCall'
import { getPoolAddress } from 'hooks/usePoolsOHLC'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { PoolKey } from 'types/lmtv2position'
import { getPoolId } from 'utils/lmtSDK/LmtIds'
import { LmtQuoterSDK } from 'utils/lmtSDK/LmtQuoter'
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
  chainId: number,
  isDefaultPoolList?: boolean
): {
  poolList: PoolContractInfo[] | undefined
  poolMap: { [poolId: string]: PoolContractInfo } | undefined
} {
  // const chainId = useChainId()
  const arbLmtQuoter = useLmtQuoterContract(false, SupportedChainId.ARBITRUM_ONE)
  const baseLmtQuoter = useLmtQuoterContract(false, SupportedChainId.BASE)

  // const queryKey = useMemo(() => {
  //   if (!chainId || !arbLmtQuoter || !baseLmtQuoter) return []
  //   return ['queryPoolKeys', chainId, arbLmtQuoter, baseLmtQuoter]
  // }, [chainId, arbLmtQuoter, baseLmtQuoter])

  // const enabled = useMemo(() => {
  //   return Boolean(arbLmtQuoter && baseLmtQuoter)
  // }, [arbLmtQuoter, baseLmtQuoter])

  const calldata = useMemo(() => {
    return LmtQuoterSDK.INTERFACE.encodeFunctionData('getPoolKeys', [])
  }, [chainId, arbLmtQuoter, baseLmtQuoter])

  const { result: arbResults } = useContractCallV2(
    SupportedChainId.ARBITRUM_ONE,
    LMT_QUOTER,
    calldata,
    ['getPoolKeys'],
    false,
    true,
    (data) => {
      return LmtQuoterSDK.INTERFACE.decodeFunctionResult('getPoolKeys', data)
    }
  )
  const { result: baseResults } = useContractCallV2(
    SupportedChainId.BASE,
    LMT_QUOTER,
    calldata,
    ['getPoolKeys'],
    false,
    true,
    (data) => {
      return LmtQuoterSDK.INTERFACE.decodeFunctionResult('getPoolKeys', data)
    }
  )

  // console.log("ARB POOL KEYS", arbResults)
  // console.log("BASE POOL KEYS", baseResults)

  // const queryFn = useCallback(async () => {
  //   if (chainId && arbLmtQuoter && baseLmtQuoter) {
  //     try {

  //       let poolKeys: any
  //       if (chainId === SupportedChainId.ARBITRUM_ONE) {
  //         poolKeys = await arbLmtQuoter.getPoolKeys()
  //       } else if (chainId === SupportedChainId.BASE) {
  //         poolKeys = await baseLmtQuoter.getPoolKeys()
  //       } else {
  //         poolKeys = undefined
  //       }
  //       // const poolKeys = await Promise.all([
  //       //   arbLmtQuoter.getPoolKeys(),
  //       //   baseLmtQuoter.getPoolKeys()
  //       // ])
  //       return poolKeys //(chainId === SupportedChainId.ARBITRUM_ONE) ? poolKeys[0] : (chainId === SupportedChainId.BASE) ? poolKeys[1] : undefined
  //     } catch (err) {
  //       console.log('poolKeyList:error', err)
  //     }
  //   }
  //   throw new Error('missing parameters')
  // }, [chainId, arbLmtQuoter, baseLmtQuoter])

  // const { data } = useQuery({
  //   queryKey,
  //   queryFn,
  //   refetchOnMount: false,
  //   // refetchOnReconnect: true,
  //   // refetchOnWindowFocus: true,
  //   // refetchIntervalInBackground: false,
  //   refetchInterval: 60 * 1000,
  //   enabled,
  //   staleTime: Infinity,
  //   placeholderData: keepPreviousData,
  // })

  const data = useMemo(() => {
    if (!arbResults || !baseResults || !chainId) return undefined
    let poolKeys: any
    if (chainId === SupportedChainId.ARBITRUM_ONE) {
      poolKeys = arbResults[0]
    } else if (chainId === SupportedChainId.BASE) {
      poolKeys = baseResults[0]
    } else {
      poolKeys = undefined
    }
    return poolKeys
  }, [chainId, arbResults, baseResults])

  const poolList = useMemo(() => {
    if (data && chainId) {
      const _data = data.map((pool: any) => {
        let category = 'New'
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
        if ((pool.symbol0 === 'USDC' || pool.symbol1 === 'USDC') && chainId === SupportedChainId.BASE) {
          category = ''
        }
        if (
          pool.symbol0 === 'PRIME' ||
          pool.symbol1 === 'PRIME' ||
          pool.symbol0 === 'CIRCLE' ||
          pool.symbol1 === 'CIRCLE' ||
          pool.symbol0 === 'BWB' ||
          pool.symbol1 === 'BWB' ||
          pool.symbol0 === 'BTCB' ||
          pool.symbol1 === 'BTCB' ||
          pool.symbol0 === 'WOLF' ||
          pool.symbol1 === 'WOLF' ||
          pool.symbol0 === 'PEPE' ||
          pool.symbol1 === 'PEPE' ||
          pool.symbol0 === 'OKAYEG' ||
          pool.symbol1 === 'OKAYEG' ||
          pool.symbol0 === 'BUILD' ||
          pool.symbol1 === 'BUILD' ||
          pool.symbol0 === 'MOCHI' ||
          pool.symbol1 === 'MOCHI' ||
          pool.symbol0 === 'coin' ||
          pool.symbol1 === 'coin' ||
          pool.symbol0 === 'COSMIC' ||
          pool.symbol1 === 'COSMIC' ||
          pool.symbol0 === 'TOSHI' ||
          pool.symbol1 === 'TOSHI' ||
          pool.symbol0 === 'WEWE' ||
          pool.symbol1 === 'WEWE' ||
          pool.symbol0 === 'Boshi' ||
          pool.symbol1 === 'Boshi' ||
          pool.symbol0 === 'KEYCAT' ||
          pool.symbol1 === 'KEYCAT' ||
          pool.symbol0 === 'NORMUS' ||
          pool.symbol1 === 'NORMUS' ||
          pool.symbol0 === 'CARLO' ||
          pool.symbol1 === 'CARLO' ||
          pool.symbol0 === 'SKI' ||
          pool.symbol1 === 'SKI' ||
          pool.symbol0 === 'DEGEN' ||
          pool.symbol1 === 'DEGEN' ||
          pool.symbol0 === 'NORMIE' ||
          pool.symbol1 === 'NORMIE' ||
          pool.symbol0 === '$mfer' ||
          pool.symbol1 === '$mfer' ||
          pool.symbol0 === 'VOID' ||
          pool.symbol1 === 'VOID' ||
          pool.symbol0 === 'ANDY' ||
          pool.symbol1 === 'ANDY' ||
          pool.symbol0 === 'SHOG' ||
          pool.symbol1 === 'SHOG' ||
          pool.symbol0 === 'BENJI' ||
          pool.symbol1 === 'BENJI' ||
          pool.symbol0 === 'SKOP' ||
          pool.symbol1 === 'SKOP' ||
          pool.symbol0 === 'BRETT' ||
          pool.symbol1 === 'BRETT' ||
          pool.symbol0 === 'HIGHER' ||
          pool.symbol1 === 'HIGHER' ||
          pool.symbol0 === 'GROOVE' ||
          pool.symbol1 === 'GROOVE' ||
          pool.symbol0 === 'CHOMP' ||
          pool.symbol1 === 'CHOMP' ||
          pool.symbol0 === 'BOOMER' ||
          pool.symbol1 === 'BOOMER'
        ) {
          category = 'Meme'
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
        const symbolsToRemove = ['INT', 'BONKE', 'BSHIB', 'DJT', 'DAI', 'LDO', 'STG', 'XPET'] // remove pools with these symbols

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
        (prev: any, current: any) => {
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

export function usePoolsAprUtilList(_chainId?: number): {
  poolList: { [poolId: string]: { apr: number; utilTotal: number } } | undefined
  loading: boolean
  error: any
} {
  let chainId = useChainId()
  if (_chainId) {
    chainId = _chainId
  }

  const lmtQuoter = useLmtQuoterContract()

  const arbLmtQuoter = useLmtQuoterContract(false, SupportedChainId.ARBITRUM_ONE)
  const baseLmtQuoter = useLmtQuoterContract(false, SupportedChainId.BASE)
  const { result, loading, error } = useSingleCallResult(lmtQuoter, 'getAllAprUtil', ['1000'], {
    gasRequired: 10000000,
  })

  const calldata = useMemo(() => {
    return LmtQuoterSDK.INTERFACE.encodeFunctionData('getAllAprUtil', ['1000'])
  }, [arbLmtQuoter, baseLmtQuoter])

  const { result: arbResults } = useContractCallV2(
    SupportedChainId.ARBITRUM_ONE,
    LMT_QUOTER,
    calldata,
    ['getAllAprUtil'],
    false,
    true,
    (data) => {
      return LmtQuoterSDK.INTERFACE.decodeFunctionResult('getAllAprUtil', data)
    }
  )

  const { result: baseResults } = useContractCallV2(
    SupportedChainId.BASE,
    LMT_QUOTER,
    calldata,
    ['getAllAprUtil'],
    false,
    true,
    (data) => {
      return LmtQuoterSDK.INTERFACE.decodeFunctionResult('getAllAprUtil', data)
    }
  )

  const list = useMemo(() => {
    if (arbResults && baseResults) {
      let result
      if (chainId === SupportedChainId.ARBITRUM_ONE) {
        result = arbResults
      } else if (chainId === SupportedChainId.BASE) {
        result = baseResults
      } else {
        return undefined
      }
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
  }, [chainId, arbResults, baseResults])

  return useMemo(() => {
    return {
      poolList: list,
      loading,
      error,
    }
  }, [chainId, list, loading, error])
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
