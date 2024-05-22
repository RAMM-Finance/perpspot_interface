import { createSlice } from '@reduxjs/toolkit'
import { ConnectionType } from 'connection'
import { SupportedLocale } from 'constants/locales'

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

  // favorites: {
  //   [chainId: number]: string[]
  // }

  // userPools: string[] // each item is chainId-poolId

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
  // pinnedKeys: {
  //   [chainId: number]: PoolKey[]
  // }
  currentPoolKeys: {
    [chainId: number]: {
      poolId: string
      inputInToken0: boolean
      token0IsBase: boolean // indicates default base token
      token0Symbol: string
      token1Symbol: string
      // invert the price data for displays
      // invertPrice: boolean
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
  // pinnedKeys: {},
  // favorites: {},
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
    updateCurrentBaseCurrency(state, action) {
      if (state.currentPoolKeys[action.payload.chainId]) {
        state.currentPoolKeys[action.payload.chainId].token0IsBase = action.payload.token0IsBase
      }
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
        token0IsBase: action.payload.token0IsBase,
        token0Symbol: action.payload.token0Symbol,
        token1Symbol: action.payload.token1Symbol,
        // invertPrice: action.payload.invertPrice,
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

      // if (!state.userPools) {
      //   state.userPools = []
      // }

      // localStorage.removeItem('userPools')

      // remove on launch
      // state.currentPoolKeys = {}
      if (!state.currentPoolKeys || typeof state.currentPoolKeys !== 'object') {
        state.currentPoolKeys = {}
      }

      // if (!state.pinnedKeys || typeof state.pinnedKeys !== 'object') {
      //   state.pinnedKeys = {}
      // }

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
  // updatePinnedPools,
  // setPinnedPools,
  setCurrentPool,
  setInputCurrency,
  // invertCurrentPoolPrice,
} = userSlice.actions
export default userSlice.reducer
