import { createSlice } from '@reduxjs/toolkit'
import { ConnectionType } from 'connection'
import { SupportedLocale } from 'constants/locales'
import { PoolKey } from 'types/lmtv2position'

import { DEFAULT_DEADLINE_FROM_NOW, DEFAULT_LIMIT_DEADLINE_FROM_NOW } from '../../constants/misc'
import { updateVersion } from '../global/actions'
import { SerializedPair, SerializedToken } from './types'

const currentTimestamp = () => new Date().getTime()

export interface UserState {
  selectedWallet?: ConnectionType

  // the timestamp of the last updateVersion action
  lastUpdateVersionTimestamp?: number

  userLocale: SupportedLocale | null

  userExpertMode: boolean

  userClientSideRouter: boolean // whether routes should be calculated with the client side router only

  // hides closed (inactive) positions across the app
  userHideClosedPositions: boolean

  // user defined slippage tolerance in bips, used in all txns
  userSlippageTolerance: number | 'auto'
  userSlippageToleranceHasBeenMigratedToAuto: boolean // temporary flag for migration status

  // user defined slipped tick tolerance in bips, used in all txns
  userSlippedTickTolerance: number | 'auto'

  // user defined premium deposited before txn, asa percentage of totalDebtInput
  userPremiumDepositPercent: number | 'auto'

  // minutes
  userLimitDeadline: number

  // deadline set by user in minutes, used in all txns
  userDeadline: number

  tokens: {
    [chainId: number]: {
      [address: string]: SerializedToken
    }
  }
  pairs: {
    [chainId: number]: {
      [key: string]: SerializedPair
    }
  }
  pinnedKeys: {
    [chainId: number]: PoolKey[]
  }
  currentPoolKeys: {
    [chainId: number]: {
      poolId: string
      inputInToken0: boolean
    }
  }
  timestamp: number
  URLWarningVisible: boolean
  hideUniswapWalletBanner: boolean
  showSurveyPopup: boolean | undefined
}

function pairKey(token0Address: string, token1Address: string) {
  return `${token0Address};${token1Address}`
}

export const initialState: UserState = {
  selectedWallet: undefined,
  userExpertMode: false,
  userLocale: null,
  userClientSideRouter: false,
  userHideClosedPositions: false,
  userSlippageTolerance: 'auto',
  userSlippedTickTolerance: 'auto',
  userPremiumDepositPercent: 'auto',
  userLimitDeadline: DEFAULT_LIMIT_DEADLINE_FROM_NOW,
  userSlippageToleranceHasBeenMigratedToAuto: true,
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  tokens: {},
  pairs: {},
  pinnedKeys: {},
  currentPoolKeys: {},
  timestamp: currentTimestamp(),
  URLWarningVisible: true,
  hideUniswapWalletBanner: false,
  showSurveyPopup: undefined,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateSelectedWallet(state, { payload: { wallet } }) {
      state.selectedWallet = wallet
    },
    updateUserExpertMode(state, action) {
      state.userExpertMode = action.payload.userExpertMode
      state.timestamp = currentTimestamp()
    },
    updateUserLocale(state, action) {
      state.userLocale = action.payload.userLocale
      state.timestamp = currentTimestamp()
    },
    updateUserSlippageTolerance(state, action) {
      state.userSlippageTolerance = action.payload.userSlippageTolerance
      state.timestamp = currentTimestamp()
    },
    updateUserSlippedTickTolerance(state, action) {
      state.userSlippedTickTolerance = action.payload.userSlippedTickTolerance
      state.timestamp = currentTimestamp()
    },
    updatePinnedPools(state, action) {
      if (action.payload.add) {
        state.pinnedKeys[action.payload.chainId].push(action.payload.poolKey)
      } else {
        const id2 = `${action.payload.poolKey.token0.toLowerCase()}-${action.payload.poolKey.token1.toLowerCase()}-${
          action.payload.poolKey.fee
        }`
        const index = state.pinnedKeys[action.payload.chainId].findIndex((i) => {
          const { token0, token1, fee } = i
          const id = `${token0.toLowerCase()}-${token1.toLowerCase()}-${fee}`
          return id === id2
        })
        if (index >= 0) {
          state.pinnedKeys[action.payload.chainId].splice(index, 1)
        }
      }
    },
    setPinnedPools(state, action) {
      state.pinnedKeys[action.payload.chainId] = action.payload.pinnedPools
    },
    setInputCurrency(state, action) {
      if (state.currentPoolKeys[action.payload.chainId]) {
        state.currentPoolKeys[action.payload.chainId].inputInToken0 = action.payload.inputInToken0
      }
    },
    setCurrentPool(state, action) {
      state.currentPoolKeys[action.payload.chainId] = {
        poolId: action.payload.poolId,
        inputInToken0: action.payload.inputInToken0,
      }
    },
    updateUserPremiumDepositPercent(state, action) {
      state.userPremiumDepositPercent = action.payload.userPremiumDepositPercent
      state.timestamp = currentTimestamp()
    },
    updateUserDeadline(state, action) {
      state.userDeadline = action.payload.userDeadline
      state.timestamp = currentTimestamp()
    },
    updateUserLimitDeadline(state, action) {
      state.userLimitDeadline = action.payload.userLimitDeadline
      state.timestamp = currentTimestamp()
    },
    updateUserClientSideRouter(state, action) {
      state.userClientSideRouter = action.payload.userClientSideRouter
    },
    updateHideClosedPositions(state, action) {
      state.userHideClosedPositions = action.payload.userHideClosedPositions
    },
    updateHideUniswapWalletBanner(state, action) {
      state.hideUniswapWalletBanner = action.payload.hideUniswapWalletBanner
    },
    addSerializedToken(state, { payload: { serializedToken } }) {
      if (!state.tokens) {
        state.tokens = {}
      }
      state.tokens[serializedToken.chainId] = state.tokens[serializedToken.chainId] || {}
      state.tokens[serializedToken.chainId][serializedToken.address] = serializedToken
      state.timestamp = currentTimestamp()
    },
    addSerializedPair(state, { payload: { serializedPair } }) {
      if (
        serializedPair.token0.chainId === serializedPair.token1.chainId &&
        serializedPair.token0.address !== serializedPair.token1.address
      ) {
        const chainId = serializedPair.token0.chainId
        state.pairs[chainId] = state.pairs[chainId] || {}
        state.pairs[chainId][pairKey(serializedPair.token0.address, serializedPair.token1.address)] = serializedPair
      }
      state.timestamp = currentTimestamp()
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateVersion, (state) => {
      // slippage isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard

      if (
        typeof state.userSlippageTolerance !== 'number' ||
        !Number.isInteger(state.userSlippageTolerance) ||
        state.userSlippageTolerance < 0 ||
        state.userSlippageTolerance > 5000
      ) {
        state.userSlippageTolerance = 'auto'
      } else {
        if (
          !state.userSlippageToleranceHasBeenMigratedToAuto &&
          [10, 50, 100].indexOf(state.userSlippageTolerance) !== -1
        ) {
          state.userSlippageTolerance = 'auto'
          state.userSlippageToleranceHasBeenMigratedToAuto = true
        }
      }

      if (!state.userLimitDeadline) {
        state.userLimitDeadline = DEFAULT_LIMIT_DEADLINE_FROM_NOW
      }

      if (!state.currentPoolKeys || typeof state.currentPoolKeys !== 'object') {
        state.currentPoolKeys = {}
      }

      if (!state.pinnedKeys || typeof state.pinnedKeys !== 'object') {
        state.pinnedKeys = {}
      }

      if (!state.userSlippedTickTolerance) {
        state.userSlippedTickTolerance = 'auto'
      }

      if (!state.userPremiumDepositPercent) {
        state.userPremiumDepositPercent = 'auto'
      }

      // deadline isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (
        typeof state.userDeadline !== 'number' ||
        !Number.isInteger(state.userDeadline) ||
        state.userDeadline < 60 ||
        state.userDeadline > 180 * 60
      ) {
        state.userDeadline = DEFAULT_DEADLINE_FROM_NOW
        state.userLimitDeadline = DEFAULT_LIMIT_DEADLINE_FROM_NOW
      }

      state.lastUpdateVersionTimestamp = currentTimestamp()
    })
  },
})

export const {
  addSerializedPair,
  addSerializedToken,
  updateSelectedWallet,
  updateHideClosedPositions,
  updateUserClientSideRouter,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserLocale,
  updateUserSlippageTolerance,
  updateHideUniswapWalletBanner,
  updateUserPremiumDepositPercent,
  updateUserSlippedTickTolerance,
  updateUserLimitDeadline,
  updatePinnedPools,
  setPinnedPools,
  setCurrentPool,
  setInputCurrency,
} = userSlice.actions
export default userSlice.reducer
