import { createSlice, nanoid } from '@reduxjs/toolkit'
import { SupportedChainId } from 'constants/chains'
import { DEFAULT_TXN_DISMISS_MS } from 'constants/misc'
import { PoolKey } from 'types/lmtv2position'

export type PopupContent =
  | {
      txn: {
        hash: string
      }
    }
  | {
      failedSwitchNetwork: SupportedChainId
    }

export enum ApplicationModal {
  UNIWALLET_CONNECT,
  ADDRESS_CLAIM,
  BLOCKED_ACCOUNT,
  CLAIM_POPUP,
  DELEGATE,
  EXECUTE,
  FEATURE_FLAGS,
  FIAT_ONRAMP,
  MENU,
  METAMASK_CONNECTION_ERROR,
  NETWORK_FILTER,
  NETWORK_SELECTOR,
  POOL_OVERVIEW_OPTIONS,
  PRIVACY_POLICY,
  QUEUE,
  SELF_CLAIM,
  SETTINGS,
  SHARE,
  TAX_SERVICE,
  TIME_SELECTOR,
  VOTE,
  WALLET,
  UNISWAP_NFT_AIRDROP_CLAIM,
}

type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

export interface ApplicationState {
  readonly chainId: number | null
  readonly fiatOnramp: { available: boolean; availabilityChecked: boolean }
  readonly openModal: ApplicationModal | null
  readonly popupList: PopupList
  readonly poolPriceData: {
    [chainId: number]: {
      [id: string]: {
        pool: PoolKey
        priceNow: number
        price24hAgo: number
        // decimal, multiply by 100% for percentage
        delta24h: number
        high24: number
        low24: number
        token0IsBase: boolean
        // the data is inverted when retrieved from the gecko API
        invertedGecko: boolean
      }
    }
  }
  readonly blockNumber: number | undefined
  readonly bLScrollPosition: number | undefined
}

const initialState: ApplicationState = {
  fiatOnramp: { available: false, availabilityChecked: false },
  chainId: null,
  openModal: null,
  popupList: [],
  poolPriceData: {},
  blockNumber: undefined,
  bLScrollPosition: undefined,
}

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setFiatOnrampAvailability(state, { payload: available }) {
      state.fiatOnramp = { available, availabilityChecked: true }
    },
    updateChainId(state, action) {
      const { chainId } = action.payload
      state.chainId = chainId
    },
    updateBlockNumber(state, action) {
      state.blockNumber = action.payload.blockNumber
    },
    setOpenModal(state, action) {
      state.openModal = action.payload
    },
    addPopup(state, { payload: { content, key, removeAfterMs = DEFAULT_TXN_DISMISS_MS } }) {
      state.popupList = (key ? state.popupList.filter((popup) => popup.key !== key) : state.popupList).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs,
        },
      ])
    },
    updatePoolPriceData(state, action) {
      state.poolPriceData[action.payload.chainId] = action.payload.poolsOHLC
    },
    setBLScrollPosition(state, action) {
      state.bLScrollPosition = action.payload
    },
    removePopup(state, { payload: { key } }) {
      state.popupList.forEach((p) => {
        if (p.key === key) {
          p.show = false
        }
      })
    },
  },
})

export const {
  updateChainId,
  setFiatOnrampAvailability,
  setOpenModal,
  addPopup,
  removePopup,
  updatePoolPriceData,
  updateBlockNumber,
  setBLScrollPosition,
} = applicationSlice.actions
export default applicationSlice.reducer
