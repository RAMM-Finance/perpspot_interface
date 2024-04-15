import { Currency, Percent, Token } from '@uniswap/sdk-core'
import { computePairAddress, Pair } from '@uniswap/v2-sdk'
import { useWeb3React } from '@web3-react/core'
import { L2_CHAIN_IDS } from 'constants/chains'
import { SupportedLocale } from 'constants/locales'
import { L2_DEADLINE_FROM_NOW } from 'constants/misc'
import JSBI from 'jsbi'
import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { PoolKey } from 'types/lmtv2position'
import { UserAddedToken } from 'types/tokens'

import { V2_FACTORY_ADDRESSES } from '../../constants/addresses'
import { BASES_TO_TRACK_LIQUIDITY_FOR, PINNED_PAIRS } from '../../constants/routing'
import { useCurrency, useDefaultActiveTokens } from '../../hooks/Tokens'
import { AppState } from '../types'
import {
  addSerializedPair,
  addSerializedToken,
  invertCurrentPoolPrice,
  setCurrentPool,
  setInputCurrency,
  updateHideClosedPositions,
  updateHideUniswapWalletBanner,
  updatePinnedPools,
  updateUserClientSideRouter,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserLimitDeadline,
  updateUserLocale,
  updateUserPremiumDepositPercent,
  updateUserSlippageTolerance,
  updateUserSlippedTickTolerance,
} from './reducer'
import { SerializedPair, SerializedToken } from './types'

export function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  }
}

export function deserializeToken(serializedToken: SerializedToken, Class: typeof Token = Token): Token {
  return new Class(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name
  )
}

export function useUserLocale(): SupportedLocale | null {
  return useAppSelector((state) => state.user.userLocale)
}

export function useUserLocaleManager(): [SupportedLocale | null, (newLocale: SupportedLocale) => void] {
  const dispatch = useAppDispatch()
  const locale = useUserLocale()

  const setLocale = useCallback(
    (newLocale: SupportedLocale) => {
      dispatch(updateUserLocale({ userLocale: newLocale }))
    },
    [dispatch]
  )

  return [locale, setLocale]
}

export function useIsExpertMode(): boolean {
  return useAppSelector((state) => state.user.userExpertMode)
}

export function useExpertModeManager(): [boolean, () => void] {
  const dispatch = useAppDispatch()
  const expertMode = useIsExpertMode()

  const toggleSetExpertMode = useCallback(() => {
    dispatch(updateUserExpertMode({ userExpertMode: !expertMode }))
  }, [expertMode, dispatch])

  return [expertMode, toggleSetExpertMode]
}

export function useCurrentPool():
  | {
      poolKey: PoolKey
      poolId: string
      inputInToken0: boolean
      token0Symbol: string
      token1Symbol: string
      token0IsBase: boolean
      invertPrice: boolean
    }
  | undefined {
  const { chainId } = useWeb3React()
  const currentPool = useAppSelector((state) => {
    if (chainId && state.user.currentPoolKeys[chainId]) {
      return state.user.currentPoolKeys[chainId]
    } else {
      return undefined
    }
  })

  return useMemo(() => {
    if (!currentPool) return undefined
    const { poolId, inputInToken0, token0IsBase, token0Symbol, token1Symbol, invertPrice } = currentPool
    const [token0, token1, fee] = poolId.split('-')
    return {
      poolKey: {
        token0,
        token1,
        fee: parseInt(fee),
      },
      poolId,
      inputInToken0,
      token0IsBase,
      token0Symbol,
      token1Symbol,
      invertPrice,
    }
  }, [currentPool])
}

export function useCurrentInputCurrency(): Currency | undefined | null {
  const currentPool = useCurrentPool()

  return useCurrency(currentPool?.inputInToken0 ? currentPool?.poolKey.token0 : currentPool?.poolKey.token1)
}

export function useCurrentOutputCurrency(): Currency | undefined | null {
  const currentPool = useCurrentPool()

  return useCurrency(currentPool?.inputInToken0 ? currentPool?.poolKey.token1 : currentPool?.poolKey.token0)
}

export function useSelectInputCurrency(): (inputInToken0: boolean | undefined) => void {
  const dispatch = useAppDispatch()
  const { chainId } = useWeb3React()
  return useCallback(
    (inputInToken0: boolean | undefined) => {
      chainId && dispatch(setInputCurrency({ inputInToken0, chainId }))
    },
    [dispatch, chainId]
  )
}

export function useInvertCurrentBaseQuote(): (invertPrice: boolean) => void {
  const dispatch = useAppDispatch()
  const { chainId } = useWeb3React()
  return useCallback(
    (invertPrice: boolean) => {
      chainId && dispatch(invertCurrentPoolPrice({ chainId, invertPrice }))
    },
    [dispatch, chainId]
  )
}

export function useSetCurrentPool(): (
  poolId: string,
  inputInToken0: boolean,
  token0IsBase: boolean, // indicates default base token
  token0Symbol: string,
  token1Symbol: string,
  invertPrice: boolean // invert price data for displays
) => void {
  const dispatch = useAppDispatch()
  const { chainId } = useWeb3React()
  return useCallback(
    (
      poolId: string,
      inputInToken0: boolean,
      token0IsBase: boolean,
      token0Symbol: string,
      token1Symbol: string,
      invertPrice: boolean
    ) => {
      chainId &&
        dispatch(
          setCurrentPool({ poolId, inputInToken0, chainId, token0IsBase, token0Symbol, token1Symbol, invertPrice })
        )
    },
    [dispatch, chainId]
  )
}

export function useClientSideRouter(): [boolean, (userClientSideRouter: boolean) => void] {
  const dispatch = useAppDispatch()

  const clientSideRouter = useAppSelector((state) => Boolean(state.user.userClientSideRouter))

  const setClientSideRouter = useCallback(
    (newClientSideRouter: boolean) => {
      dispatch(updateUserClientSideRouter({ userClientSideRouter: newClientSideRouter }))
    },
    [dispatch]
  )

  return [clientSideRouter, setClientSideRouter]
}

/**
 * Return the user's slippage tolerance, from the redux store, and a function to update the slippage tolerance
 */
export function useUserSlippageTolerance(): [Percent | 'auto', (slippageTolerance: Percent | 'auto') => void] {
  const userSlippageToleranceRaw = useAppSelector((state) => {
    return state.user.userSlippageTolerance
  })
  const userSlippageTolerance = useMemo(
    () => (userSlippageToleranceRaw === 'auto' ? 'auto' : new Percent(userSlippageToleranceRaw, 10_000)),
    [userSlippageToleranceRaw]
  )

  const dispatch = useAppDispatch()
  const setUserSlippageTolerance = useCallback(
    (userSlippageTolerance: Percent | 'auto') => {
      let value: 'auto' | number
      try {
        value =
          userSlippageTolerance === 'auto' ? 'auto' : JSBI.toNumber(userSlippageTolerance.multiply(10_000).quotient)
      } catch (error) {
        value = 'auto'
      }
      dispatch(
        updateUserSlippageTolerance({
          userSlippageTolerance: value,
        })
      )
    },
    [dispatch]
  )

  return useMemo(
    () => [userSlippageTolerance, setUserSlippageTolerance],
    [setUserSlippageTolerance, userSlippageTolerance]
  )
}

export function useUserPremiumDepositPercent(): [Percent | 'auto', (premiumTolerance: Percent | 'auto') => void] {
  const userPremiumDepositPercentRaw = useAppSelector((state) => {
    return state.user.userPremiumDepositPercent
  })
  const userPremiumDepositPercent = useMemo(
    () => (userPremiumDepositPercentRaw === 'auto' ? 'auto' : new Percent(userPremiumDepositPercentRaw, 10_000)),
    [userPremiumDepositPercentRaw]
  )

  const dispatch = useAppDispatch()
  const setUserPremiumDepositPercent = useCallback(
    (userPremiumDepositPercent: Percent | 'auto') => {
      let value: 'auto' | number
      try {
        value =
          userPremiumDepositPercent === 'auto'
            ? 'auto'
            : JSBI.toNumber(userPremiumDepositPercent.multiply(10_000).quotient)
      } catch (error) {
        value = 'auto'
      }
      dispatch(
        updateUserPremiumDepositPercent({
          userPremiumDepositPercent: value,
        })
      )
    },
    [dispatch]
  )

  return useMemo(
    () => [userPremiumDepositPercent, setUserPremiumDepositPercent],
    [setUserPremiumDepositPercent, userPremiumDepositPercent]
  )
}

export function useAddPinnedPool(): (poolKey: PoolKey) => void {
  const dispatch = useAppDispatch()
  const { chainId } = useWeb3React()
  return useCallback(
    (poolKey: PoolKey) => {
      chainId && dispatch(updatePinnedPools({ add: true, poolKey, index: 0, chainId }))
    },
    [dispatch, chainId]
  )
}

export function useRemovePinnedPool(): (poolKey: PoolKey) => void {
  const dispatch = useAppDispatch()
  const { chainId } = useWeb3React()
  return useCallback(
    (poolKey: PoolKey) => {
      chainId && dispatch(updatePinnedPools({ add: false, poolKey, chainId }))
    },
    [dispatch, chainId]
  )
}

export function usePinnedPools(): PoolKey[] {
  const { chainId } = useWeb3React()
  return useAppSelector((state) => {
    if (chainId && state.user.pinnedKeys[chainId]) {
      return state.user.pinnedKeys[chainId]
    } else {
      return []
    }
  })
}

export function useUserSlippedTickTolerance(): [Percent | 'auto', (slippageTolerance: Percent | 'auto') => void] {
  const userSlippedTickToleranceRaw = useAppSelector((state) => {
    return state.user.userSlippedTickTolerance
  })

  const userSlippedTickTolerance = useMemo(
    () => (userSlippedTickToleranceRaw === 'auto' ? 'auto' : new Percent(userSlippedTickToleranceRaw, 10_000)),
    [userSlippedTickToleranceRaw]
  )

  const dispatch = useAppDispatch()
  const setUserSlippedTickTolerance = useCallback(
    (userSlippedTickTolerance: Percent | 'auto') => {
      let value: 'auto' | number
      try {
        value =
          userSlippedTickTolerance === 'auto'
            ? 'auto'
            : JSBI.toNumber(userSlippedTickTolerance.multiply(10_000).quotient)
      } catch (error) {
        value = 'auto'
      }
      dispatch(
        updateUserSlippedTickTolerance({
          userSlippedTickTolerance: value,
        })
      )
    },
    [dispatch]
  )

  return useMemo(
    () => [userSlippedTickTolerance, setUserSlippedTickTolerance],
    [setUserSlippedTickTolerance, userSlippedTickTolerance]
  )
}

export function useUserHideClosedPositions(): [boolean, (newHideClosedPositions: boolean) => void] {
  const dispatch = useAppDispatch()

  const hideClosedPositions = useAppSelector((state) => state.user.userHideClosedPositions)

  const setHideClosedPositions = useCallback(
    (newHideClosedPositions: boolean) => {
      dispatch(updateHideClosedPositions({ userHideClosedPositions: newHideClosedPositions }))
    },
    [dispatch]
  )

  return [hideClosedPositions, setHideClosedPositions]
}

/**
 * Same as above but replaces the auto with a default value
 * @param defaultSlippageTolerance the default value to replace auto with
 */
export function useUserSlippageToleranceWithDefault(defaultSlippageTolerance: Percent): Percent {
  const allowedSlippage = useUserSlippageTolerance()[0]
  return useMemo(
    () => (allowedSlippage === 'auto' ? defaultSlippageTolerance : allowedSlippage),
    [allowedSlippage, defaultSlippageTolerance]
  )
}

export function useUserTransactionTTL(): [number, (slippage: number) => void] {
  const { chainId } = useWeb3React()
  const dispatch = useAppDispatch()
  const userDeadline = useAppSelector((state) => state.user.userDeadline)
  const onL2 = Boolean(chainId && L2_CHAIN_IDS.includes(chainId))
  const deadline = onL2 ? L2_DEADLINE_FROM_NOW : userDeadline

  const setUserDeadline = useCallback(
    (userDeadline: number) => {
      dispatch(updateUserDeadline({ userDeadline }))
    },
    [dispatch]
  )

  return [deadline, setUserDeadline]
}

export function useUserLimitOrderTransactionTTL(): [number, (deadline: number) => void] {
  const { chainId } = useWeb3React()
  const dispatch = useAppDispatch()
  const userDeadline = useAppSelector((state) => state.user.userLimitDeadline)
  const onL2 = Boolean(chainId && L2_CHAIN_IDS.includes(chainId))
  const deadline = onL2 ? L2_DEADLINE_FROM_NOW : userDeadline

  const setUserDeadline = useCallback(
    (userLimitDeadline: number) => {
      dispatch(updateUserLimitDeadline({ userLimitDeadline }))
    },
    [dispatch]
  )

  return [deadline, setUserDeadline]
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (token: Token) => {
      console.log('dispatching...')
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }))
    },
    [dispatch]
  )
}

export function useUserAddedTokensOnChain(chainId: number | undefined | null): Token[] {
  const serializedTokensMap = useAppSelector(({ user: { tokens } }) => tokens)

  return useMemo(() => {
    if (!chainId) return []
    const tokenMap: Token[] = serializedTokensMap?.[chainId]
      ? Object.values(serializedTokensMap[chainId]).map((value) => deserializeToken(value, UserAddedToken))
      : []
    return tokenMap
  }, [serializedTokensMap, chainId])
}

export function useUserAddedTokens(): Token[] {
  return useUserAddedTokensOnChain(useWeb3React().chainId)
}

function serializePair(pair: Pair): SerializedPair {
  return {
    token0: serializeToken(pair.token0),
    token1: serializeToken(pair.token1),
  }
}

export function usePairAdder(): (pair: Pair) => void {
  const dispatch = useAppDispatch()

  return useCallback(
    (pair: Pair) => {
      dispatch(addSerializedPair({ serializedPair: serializePair(pair) }))
    },
    [dispatch]
  )
}

export function useURLWarningVisible(): boolean {
  return useAppSelector((state: AppState) => state.user.URLWarningVisible)
}

export function useHideUniswapWalletBanner(): [boolean, () => void] {
  const dispatch = useAppDispatch()
  const hideUniswapWalletBanner = useAppSelector((state) => state.user.hideUniswapWalletBanner)

  const toggleHideUniswapWalletBanner = useCallback(() => {
    dispatch(updateHideUniswapWalletBanner({ hideUniswapWalletBanner: true }))
  }, [dispatch])

  return [hideUniswapWalletBanner, toggleHideUniswapWalletBanner]
}

/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
export function toV2LiquidityToken([tokenA, tokenB]: [Token, Token]): Token {
  if (tokenA.chainId !== tokenB.chainId) throw new Error('Not matching chain IDs')
  if (tokenA.equals(tokenB)) throw new Error('Tokens cannot be equal')
  if (!V2_FACTORY_ADDRESSES[tokenA.chainId]) throw new Error('No V2 factory address on this chain')

  return new Token(
    tokenA.chainId,
    computePairAddress({ factoryAddress: V2_FACTORY_ADDRESSES[tokenA.chainId], tokenA, tokenB }),
    18,
    'UNI-V2',
    'Uniswap V2'
  )
}

/**
 * Returns all the pairs of tokens that are tracked by the user for the current chain ID.
 */
export function useTrackedTokenPairs(): [Token, Token][] {
  const { chainId } = useWeb3React()
  const tokens = useDefaultActiveTokens()

  // pinned pairs
  const pinnedPairs = useMemo(() => (chainId ? PINNED_PAIRS[chainId] ?? [] : []), [chainId])

  // pairs for every token against every base
  const generatedPairs: [Token, Token][] = useMemo(
    () =>
      chainId
        ? Object.keys(tokens).flatMap((tokenAddress) => {
            const token = tokens[tokenAddress]
            // for each token on the current chain,
            return (
              // loop though all bases on the current chain
              (BASES_TO_TRACK_LIQUIDITY_FOR[chainId] ?? [])
                // to construct pairs of the given token with each base
                .map((base) => {
                  if (base.address === token.address) {
                    return null
                  } else {
                    return [base, token]
                  }
                })
                .filter((p): p is [Token, Token] => p !== null)
            )
          })
        : [],
    [tokens, chainId]
  )

  // pairs saved by users
  const savedSerializedPairs = useAppSelector(({ user: { pairs } }) => pairs)

  const userPairs: [Token, Token][] = useMemo(() => {
    if (!chainId || !savedSerializedPairs) return []
    const forChain = savedSerializedPairs[chainId]
    if (!forChain) return []

    return Object.keys(forChain).map((pairId) => {
      return [deserializeToken(forChain[pairId].token0), deserializeToken(forChain[pairId].token1)]
    })
  }, [savedSerializedPairs, chainId])

  const combinedList = useMemo(
    () => userPairs.concat(generatedPairs).concat(pinnedPairs),
    [generatedPairs, pinnedPairs, userPairs]
  )

  return useMemo(() => {
    // dedupes pairs of tokens in the combined list
    const keyed = combinedList.reduce<{ [key: string]: [Token, Token] }>((memo, [tokenA, tokenB]) => {
      const sorted = tokenA.sortsBefore(tokenB)
      const key = sorted ? `${tokenA.address}:${tokenB.address}` : `${tokenB.address}:${tokenA.address}`
      if (memo[key]) return memo
      memo[key] = sorted ? [tokenA, tokenB] : [tokenB, tokenA]
      return memo
    }, {})

    return Object.keys(keyed).map((key) => keyed[key])
  }, [combinedList])
}
