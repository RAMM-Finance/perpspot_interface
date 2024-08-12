import { getDefaultConfig, WalletList } from '@rainbow-me/rainbowkit'
import {
  bitgetWallet,
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  safeWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { http } from 'viem'
import { arbitrum, base } from 'wagmi/chains'

//
//

const WALLET_CONNECT_PROJECT_ID = 'ce44ab4fe2db956b3f2a376a5e71bb44'
const APP_NAME = 'LIMITLESS'

const popularWalletList: WalletList = [
  {
    // Group name with standard name is localized by rainbow kit
    groupName: 'Popular',
    wallets: [
      rabbyWallet,
      metaMaskWallet,
      walletConnectWallet,
      // This wallet will automatically hide itself from the list when the fallback is not necessary or if there is no injected wallet available.
      injectedWallet,
      // The Safe option will only appear in the Safe Wallet browser environment.
      safeWallet,
      bitgetWallet,
    ],
  },
]
const ALCHEMY_KEY = process.env.REACT_APP_ALCHEMY_KEY
if (typeof ALCHEMY_KEY === 'undefined') {
  throw new Error(`REACT_APP_ALCHEMY_KEY must be a defined environment variable`)
}

export const rainbowKitConfig = getDefaultConfig({
  appName: APP_NAME,
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [base, arbitrum],
  transports: {
    [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`),
    [arbitrum.id]: http(`https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`),
  },
  wallets: [...popularWalletList],
})
