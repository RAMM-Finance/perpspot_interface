import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from 'constants/chains'
import useDebounce from 'hooks/useDebounce'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { useLeveragedLMTPositions } from 'hooks/useLMTV2Positions'
import { usePoolsOHLC } from 'hooks/usePoolsOHLC'
import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { useMarginTradingActionHandlers } from 'state/marginTrading/hooks'
import { setCurrentPool } from 'state/user/reducer'
import { PoolKey } from 'types/lmtv2position'
import { getPoolId } from 'utils/lmtSDK/LmtIds'
import { supportedChainId } from 'utils/supportedChainId'
import { useAccount, useChainId } from 'wagmi'
import { useEthersProvider } from 'wagmi-lib/adapters'

import { useCloseModal, usePoolKeyList } from './hooks'
import { updateChainId, updatePoolPriceData } from './reducer'

const DEFAULT_POOLS: {
  [chainId: number]: {
    poolKey: PoolKey
    poolId: string
    inputInToken0: boolean
    token0IsBase: boolean
    token0Symbol: string
    token1Symbol: string
    invertPrice: boolean
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
    token0IsBase: false,
    token0Symbol: 'WETH',
    token1Symbol: 'ARB',
    invertPrice: true,
  },
  [SupportedChainId.BERA_ARTIO]: {
    poolKey: {
      token0: '0x174652b085C32361121D519D788AbF0D9ad1C355',
      token1: '0x35B4c60a4677EcadaF2fe13fe3678efF724be16b',
      fee: 500,
    },
    poolId: getPoolId('0x174652b085C32361121D519D788AbF0D9ad1C355', '0x35B4c60a4677EcadaF2fe13fe3678efF724be16b', 500),
    inputInToken0: true,
    token0IsBase: false,
    token0Symbol: 'USDC',
    token1Symbol: 'WETH',
    invertPrice: false,
  },
  [SupportedChainId.LINEA]: {
    poolKey: {
      token0: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
      token1: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
      fee: 500,
    },
    poolId: getPoolId('0x176211869cA2b568f2A7D4EE941E073a821EE1ff', '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', 500),
    inputInToken0: false,
    token0IsBase: false,
    token0Symbol: 'USDC',
    token1Symbol: 'WETH',
    invertPrice: false,
  },
  [SupportedChainId.BASE]: {
    poolKey: {
      token0: '0x4200000000000000000000000000000000000006',
      token1: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      fee: 500,
    },
    poolId: getPoolId('0x4200000000000000000000000000000000000006', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 500),
    inputInToken0: false,
    token0IsBase: true,
    token0Symbol: 'WETH',
    token1Symbol: 'USDC',
    invertPrice: false,
  },
}
const PRELOAD_UPDATE_INTERVAL = 1500
const UPDATE_INTERVAL = 1500
export default function Updater(): null {
  const account = useAccount().address
  const chainId = useChainId()
  const provider = useEthersProvider({ chainId })
  const dispatch = useAppDispatch()
  const windowVisible = useIsWindowVisible()

  const [activeChainId, setActiveChainId] = useState(chainId)
  const { onSetLeveragePositions } = useMarginTradingActionHandlers()

  // constantly update the old positions
  // preloading for leverage positions
  // if preloaded and has been
  // const positions = useLeveragePositions()
  const { positions: rawPositions, loading } = useLeveragedLMTPositions(account)

  // useEffect(() => {
  //   rawPositions &&
  //     onSetLeveragePositions(
  //       rawPositions.map((i) => {
  //         return {
  //           position: i,
  //           lastUpdated: Date.now(),
  //           preloaded: true,
  //         }
  //       })
  //     )
  // }, [rawPositions, onSetLeveragePositions])

  // useEffect(() => {
  //   if (chainId) {
  //     onSetLeveragePositions([])
  //   }
  // }, [chainId, onSetLeveragePositions])

  useEffect(() => {
    if (rawPositions) {
      let changed = false
      let newPositions: {
        position: MarginPositionDetails
        lastUpdated: number
        preloaded: boolean
      }[] = []

  //     const updateInterval = (position: { lastUpdated: number }, interval: number) =>
  //       Date.now() - position.lastUpdated >= interval

  //     rawPositions.forEach((raw) => {
  //       const stored = positions.find(
  //         (j) =>
  //           getLeveragePositionId(j.position.poolKey, j.position.isToken0, j.position.trader) ===
  //           getLeveragePositionId(raw.poolKey, raw.isToken0, raw.trader)
  //       )

  //       if (stored) {
  //         const shouldUpdate = stored.preloaded
  //           ? updateInterval(stored, PRELOAD_UPDATE_INTERVAL)
  //           : updateInterval(stored, UPDATE_INTERVAL)

  //         if (shouldUpdate) {
  //           changed = true
  //           newPositions.push({ position: raw, preloaded: false, lastUpdated: Date.now() })
  //         } else {
  //           newPositions.push(stored)
  //         }
  //       } else {
  //         changed = true
  //         newPositions.push({ position: raw, preloaded: false, lastUpdated: Date.now() })
  //       }
  //     })

  //     // remove all positions not in rawPositions if not preloaded
  //     positions.forEach((stored) => {
  //       const inRawPositions = rawPositions.some(
  //         (p) =>
  //           getLeveragePositionId(p.poolKey, p.isToken0, p.trader) ===
  //           getLeveragePositionId(stored.position.poolKey, stored.position.isToken0, stored.position.trader)
  //       )

  //       if (!stored.preloaded && !inRawPositions) {
  //         changed = true
  //         newPositions = newPositions.filter(
  //           (p) =>
  //             getLeveragePositionId(p.position.poolKey, p.position.isToken0, p.position.trader) !==
  //             getLeveragePositionId(stored.position.poolKey, stored.position.isToken0, stored.position.trader)
  //         )
  //       }
  //     })

  //     // let changed = false
  //     // let newPositions: { position: MarginPositionDetails; lastUpdated: number; preloaded: boolean }[] = []

  //     // rawPositions.forEach((raw) => {
  //     //   const stored = positions.find((j) => {
  //     //     return (
  //     //       getLeveragePositionId(j.position.poolKey, j.position.isToken0, j.position.trader) ===
  //     //       getLeveragePositionId(raw.poolKey, raw.isToken0, raw.trader)
  //     //     )
  //     //   })

  //     //   if (stored) {
  //     //     // if preloaded then check to remove or update
  //     //     const preloaded = stored.preloaded

  //     //     if (preloaded) {
  //     //       if (stored.lastUpdated + PRELOAD_UPDATE_INTERVAL < Date.now()) {
  //     //         // if preloaded and last updated more than 2 seconds ago then update
  //     //         changed = true
  //     //         newPositions.push({
  //     //           position: raw,
  //     //           preloaded: false,
  //     //           lastUpdated: Date.now(),
  //     //         })
  //     //       } else {
  //     //         // if preloaded and last updated less than 2 seconds ago then keep
  //     //         newPositions.push(stored)
  //     //       }
  //     //     } else {
  //     //       // if not preloaded then check if need update based on interval
  //     //       if (stored.lastUpdated + UPDATE_INTERVAL < Date.now()) {
  //     //         changed = true
  //     //         newPositions.push({
  //     //           position: stored.position,
  //     //           preloaded: false,
  //     //           lastUpdated: Date.now(),
  //     //         })
  //     //       } else {
  //     //         newPositions.push(stored)
  //     //       }
  //     //     }
  //     //   } else {
  //     //     changed = true
  //     //     newPositions.push({
  //     //       position: raw,
  //     //       preloaded: false,
  //     //       lastUpdated: Date.now(),
  //     //     })
  //     //   }
  //     // })

  //     // // remove all positions not in raw if not preloaded
  //     // positions.forEach((stored) => {
  //     //   const inRawPositions = rawPositions.find((p) => {
  //     //     return (
  //     //       getLeveragePositionId(p.poolKey, p.isToken0, p.trader) ===
  //     //       getLeveragePositionId(stored.position.poolKey, stored.position.isToken0, stored.position.trader)
  //     //     )
  //     //   })

  //     //   if (!stored.preloaded && !inRawPositions) {
  //     //     // remove from newPositions
  //     //     changed = true
  //     //     newPositions = newPositions.filter((p) => {
  //     //       return (
  //     //         getLeveragePositionId(p.position.poolKey, p.position.isToken0, p.position.trader) !==
  //     //         getLeveragePositionId(stored.position.poolKey, stored.position.isToken0, stored.position.trader)
  //     //       )
  //     //     })
  //     //   }
  //     // })

  //     if (changed) {
  //       console.log('zeke:positions', newPositions, positions, rawPositions)
  //       onSetLeveragePositions(newPositions)
  //     }
  //   }
  //   // if (positions.length > 0 && rawPositions) {
  //   //   positions.filter()
  //   // }
  //   // // if a position is preloaded + last updated more than 2 seconds ago + not found in the raw positions then remove it
  //   // if (rawPositions && positions.length > 0) {
  //   //   const _newPositions = positions
  //   //     .filter((i) => {
  //   //       if (
  //   //         i.preloaded &&
  //   //         i.lastUpdated + 3000 < Date.now() &&
  //   //         rawPositions.find(
  //   //           (p) =>
  //   //             getLeveragePositionId(p.poolKey, p.isToken0, p.trader) ===
  //   //             getLeveragePositionId(i.position.poolKey, i.position.isToken0, i.position.trader)
  //   //         ) === undefined
  //   //       ) {
  //   //         return false
  //   //       }
  //   //       return true
  //   //     })
  //   //     .map((p) => p.position)
  //   //   if (positions.length !== _newPositions.length) {
  //   //     onSetLeveragePositions(_newPositions)
  //   //   }
  //   // }
  // }, [positions, rawPositions, onSetLeveragePositions])

  const closeModal = useCloseModal()
  const previousAccountValue = useRef(account)
  const { poolList } = usePoolKeyList()
  const { poolsOHLC } = usePoolsOHLC(poolList)

  useEffect(() => {
    if (poolsOHLC && chainId) {
      dispatch(updatePoolPriceData({ poolsOHLC, chainId }))
    }
  }, [poolsOHLC, dispatch, chainId])

  useEffect(() => {
    if (account && account !== previousAccountValue.current) {
      previousAccountValue.current = account
      closeModal()
    }
  }, [account, closeModal])

  const currentPools = useAppSelector((state) => state.user.currentPoolKeys)

  // set default pool for current chain
  useEffect(() => {
    if (
      chainId &&
      (!currentPools[chainId] ||
        !currentPools[chainId]?.poolId ||
        !currentPools[chainId]?.token0Symbol ||
        !currentPools[chainId]?.token1Symbol) &&
      ALL_SUPPORTED_CHAIN_IDS.includes(chainId)
    ) {
      const { poolId, inputInToken0, token0IsBase, token0Symbol, token1Symbol, invertPrice } = DEFAULT_POOLS[chainId]
      dispatch(
        setCurrentPool({ chainId, poolId, inputInToken0, token0IsBase, token0Symbol, token1Symbol, invertPrice })
      )
    }
  }, [dispatch, chainId, currentPools])

  useEffect(() => {
    if (provider && chainId && windowVisible) {
      if (activeChainId && activeChainId !== chainId && ALL_SUPPORTED_CHAIN_IDS.includes(chainId)) {
        setActiveChainId(chainId)
        const { poolId, inputInToken0, token0IsBase, token1Symbol, token0Symbol, invertPrice } = DEFAULT_POOLS[chainId]

        dispatch(
          setCurrentPool({ chainId, poolId, inputInToken0, token0IsBase, token0Symbol, token1Symbol, invertPrice })
        )
      }
    }
  }, [dispatch, chainId, provider, windowVisible, activeChainId])

  const debouncedChainId = useDebounce(activeChainId, 100)

  useEffect(() => {
    const chainId = debouncedChainId ? supportedChainId(debouncedChainId) ?? null : null
    dispatch(updateChainId({ chainId }))
  }, [dispatch, debouncedChainId])

  return null
}
