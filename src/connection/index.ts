import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { GnosisSafe } from '@web3-react/gnosis-safe'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Actions, Connector, Provider } from '@web3-react/types'
import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'
import COINBASE_ICON_URL from 'assets/images/coinbaseWalletIcon.svg'
import GNOSIS_ICON_URL from 'assets/images/gnosis.png'
import METAMASK_ICON_URL from 'assets/images/metamask.svg'
import UNIWALLET_ICON_URL from 'assets/images/uniwallet.svg'
import WALLET_CONNECT_ICON_URL from 'assets/images/walletConnectIcon.svg'
import INJECTED_LIGHT_ICON_URL from 'assets/svg/browser-wallet-light.svg'
import UNISWAP_LOGO_URL from 'assets/svg/logo.svg'
import { SupportedChainId } from 'constants/chains'
import { useCallback } from 'react'
import { isMobile, isNonIOSPhone } from 'utils/userAgent'

import { RPC_URLS } from '../constants/networks'
import { RPC_PROVIDERS } from '../constants/providers'
import detectEthereumProvider from './detectEthereumProvider'
import { getIsBitgetWallet, getIsCoinbaseWallet, getIsInjected, getIsMetaMaskWallet } from './utils'
import { UniwalletConnect } from './WalletConnect'

type BitKeepProvider = Provider & { isBitKeep?: boolean; isConnected?: () => boolean; providers?: BitKeepProvider[] }

export class NoBitKeepError extends Error {
  public constructor() {
    super('BitKeep not installed')
    this.name = NoBitKeepError.name
    Object.setPrototypeOf(this, NoBitKeepError.prototype)
  }
}

function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16)
}

/**
 * @param options - Options to pass to `./detect-provider`
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface BitKeepConstructorArgs {
  actions: Actions
  options?: Parameters<typeof detectEthereumProvider>[0]
  onError?: (error: Error) => void
}

// export class BitKeep extends Connector {
//   /** {@inheritdoc Connector.provider} */
//   public declare provider: BitKeepProvider | undefined

//   private readonly options?: Parameters<typeof detectEthereumProvider>[0]
//   private eagerConnection?: Promise<void>

//   constructor({ actions, options, onError }: BitKeepConstructorArgs) {
//     super(actions, onError)
//     this.options = options
//   }

//   private async isomorphicInitialize(): Promise<void> {
//     if (this.eagerConnection) return

//     return (this.eagerConnection = detectEthereumProvider().then(async (provider: any) => {
//       // const provider = await m.default(this.options)
//       if (provider) {
//         this.provider = provider as unknown as BitKeepProvider
//         if (this.provider.providers?.length) {
//           this.provider = this.provider.providers.find((p) => p.isBitKeep) ?? this.provider.providers[0]
//         }

//         this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
//           this.actions.update({ chainId: parseChainId(chainId) })
//         })

//         this.provider.on('disconnect', (error: ProviderRpcError): void => {
//           this.actions.resetState()
//           this.onError?.(error)
//         })

//         this.provider.on('chainChanged', (chainId: string): void => {
//           this.actions.update({ chainId: parseChainId(chainId) })
//         })

//         this.provider.on('accountsChanged', (accounts: string[]): void => {
//           if (accounts.length === 0) {
//             // handle this edge case by disconnecting
//             this.actions.resetState()
//           } else {
//             this.actions.update({ accounts })
//           }
//         })
//       }
//     }))
//   }

//   /** {@inheritdoc Connector.connectEagerly} */
//   public async connectEagerly(): Promise<void> {
//     const cancelActivation = this.actions.startActivation()
//     await this.isomorphicInitialize()
//     if (!this.provider) return cancelActivation()

//     return Promise.all([
//       this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
//       this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
//     ])
//       .then(([chainId, accounts]) => {
//         if (accounts.length) {
//           this.actions.update({ chainId: parseChainId(chainId), accounts })
//         } else {
//           throw new Error('No accounts returned')
//         }
//       })
//       .catch((error) => {
//         console.debug('Could not connect eagerly', error)
//         // we should be able to use `cancelActivation` here, but on mobile, metamask emits a 'connect'
//         // event, meaning that chainId is updated, and cancelActivation doesn't work because an intermediary
//         // update has occurred, so we reset state instead
//         this.actions.resetState()
//       })
//   }

//   /**
//    * Initiates a connection.
//    *
//    * @param desiredChainIdOrChainParameters - If defined, indicates the desired chain to connect to. If the user is
//    * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
//    * to the chain, if one of two conditions is met: either they already have it added in their extension, or the
//    * argument is of type AddEthereumChainParameter, in which case the user will be prompted to add the chain with the
//    * specified parameters first, before being prompted to switch.
//    */
//   public async activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void> {
//     let cancelActivation: () => void
//     if (!this.provider?.isConnected?.()) cancelActivation = this.actions.startActivation()
//     return this.isomorphicInitialize()
//       .then(async () => {
//         if (!this.provider) throw new NoBitKeepError()

//         return Promise.all([
//           this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
//           this.provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
//         ]).then(([chainId, accounts]) => {
//           const receivedChainId = parseChainId(chainId)
//           const desiredChainId =
//             typeof desiredChainIdOrChainParameters === 'number'
//               ? desiredChainIdOrChainParameters
//               : desiredChainIdOrChainParameters?.chainId

//           // if there's no desired chain, or it's equal to the received, update
//           if (!desiredChainId || receivedChainId === desiredChainId)
//             return this.actions.update({ chainId: receivedChainId, accounts })

//           const desiredChainIdHex = `0x${desiredChainId.toString(16)}`

//           // if we're here, we can try to switch networks
//           // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//           return this.provider!.request({
//             method: 'wallet_switchEthereumChain',
//             params: [{ chainId: desiredChainIdHex }],
//           })
//             .catch((error: ProviderRpcError) => {
//               if (error.code === 4902 && typeof desiredChainIdOrChainParameters !== 'number') {
//                 // if we're here, we can try to add a new network
//                 // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//                 return this.provider!.request({
//                   method: 'wallet_addEthereumChain',
//                   params: [{ ...desiredChainIdOrChainParameters, chainId: desiredChainIdHex }],
//                 })
//               }

//               throw error
//             })
//             .then(() => this.activate(desiredChainId))
//         })
//       })
//       .catch((error) => {
//         cancelActivation?.()
//         throw error
//       })
//   }

//   public async watchAsset({ address, symbol, decimals, image }: WatchAssetParameters): Promise<true> {
//     if (!this.provider) throw new Error('No provider')

//     return this.provider
//       .request({
//         method: 'wallet_watchAsset',
//         params: {
//           type: 'ERC20', // Initially only supports ERC20, but eventually more!
//           options: {
//             address, // The address that the token is at.
//             symbol, // A ticker symbol or shorthand, up to 5 chars.
//             decimals, // The number of decimals in the token
//             image, // A string url of the token logo
//           },
//         },
//       })
//       .then((success: any) => {
//         if (!success) throw new Error('Rejected')
//         return true
//       })
//   }
// }

export enum ConnectionType {
  UNIWALLET = 'UNIWALLET',
  INJECTED = 'INJECTED',
  COINBASE_WALLET = 'COINBASE_WALLET',
  BITGET_WALLET = 'BITGET_WALLET',
  WALLET_CONNECT = 'WALLET_CONNECT',
  NETWORK = 'NETWORK',
  GNOSIS_SAFE = 'GNOSIS_SAFE',
}

export interface Connection {
  getName(): string
  connector: Connector
  hooks: Web3ReactHooks
  type: ConnectionType
  // TODO(WEB-3130): add darkmode check for icons
  getIcon?(): string
  shouldDisplay(): boolean
  overrideActivate?: () => boolean
  isNew?: boolean
}

function onError(error: Error) {
  console.debug(`web3-react error: ${error}`)
}

const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: RPC_PROVIDERS, defaultChainId: SupportedChainId.BASE })
)

export const networkConnection: Connection = {
  getName: () => 'Network',
  connector: web3Network,
  hooks: web3NetworkHooks,
  type: ConnectionType.NETWORK,
  shouldDisplay: () => false,
}

const getIsCoinbaseWalletBrowser = () => isMobile && getIsCoinbaseWallet()
const getIsMetaMaskBrowser = () => isMobile && getIsMetaMaskWallet()
const getIsInjectedMobileBrowser = () => getIsCoinbaseWalletBrowser() || getIsMetaMaskBrowser()
const getIsBitgetWalletBrowser = () => getIsBitgetWallet()

// const getShouldAdvertiseMetaMask = () =>
//   !getIsMetaMaskWallet() && !isMobile && (!getIsInjected() || getIsCoinbaseWallet())
const getShouldAdvertiseMetaMask = () => !getIsMetaMaskWallet() && !isMobile && !getIsInjected()

const getShouldAdvertiseBitgetWallet = () => !getIsBitgetWallet()

const getIsGenericInjector = () => getIsInjected() && !getIsMetaMaskWallet() && !getIsCoinbaseWallet()

const [web3Injected, web3InjectedHooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions, onError }))
const injectedConnection: Connection = {
  // TODO(WEB-3131) re-add "Install MetaMask" string when no injector is present
  getName: () => (getIsGenericInjector() ? 'Browser Wallet' : 'MetaMask'),
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  getIcon: () => (getIsGenericInjector() ? INJECTED_LIGHT_ICON_URL : METAMASK_ICON_URL),
  shouldDisplay: () => getIsMetaMaskWallet() || getShouldAdvertiseMetaMask() || getIsGenericInjector(),
  // If on non-injected, non-mobile browser, prompt user to install Metamask
  overrideActivate: () => {
    if (getShouldAdvertiseMetaMask()) {
      window.open('https://metamask.io/', 'inst_metamask')
      return true
    }
    return false
  },
}

const [web3GnosisSafe, web3GnosisSafeHooks] = initializeConnector<GnosisSafe>((actions) => new GnosisSafe({ actions }))
export const gnosisSafeConnection: Connection = {
  getName: () => 'Gnosis Safe',
  connector: web3GnosisSafe,
  hooks: web3GnosisSafeHooks,
  type: ConnectionType.GNOSIS_SAFE,
  getIcon: () => GNOSIS_ICON_URL,
  shouldDisplay: () => false,
}

const projId = '411059a378ea4b8b5a8a6e4fc5f06337'
const [web3WalletConnect, web3WalletConnectHooks] = initializeConnector<WalletConnectV2>(
  (actions) =>
    new WalletConnectV2({
      actions,
      options: {
        projectId: projId,
        chains: [SupportedChainId.BASE],
        optionalChains: [SupportedChainId.ARBITRUM_ONE],
        showQrModal: true,
        metadata: {
          name: 'limitless',
          description: 'limitless',
          url: 'https://limitless.fi',
          icons: ['limitless'],
        },
      },
    })
)

export const walletConnectConnection: Connection = {
  getName: () => 'WalletConnect',
  connector: web3WalletConnect,
  hooks: web3WalletConnectHooks,
  type: ConnectionType.WALLET_CONNECT,
  getIcon: () => WALLET_CONNECT_ICON_URL,
  shouldDisplay: () => !getIsInjectedMobileBrowser(),
}

const [web3UniwalletConnect, web3UniwalletConnectHooks] = initializeConnector<UniwalletConnect>(
  (actions) => new UniwalletConnect({ actions, onError })
)
export const uniwalletConnectConnection: Connection = {
  getName: () => 'Uniswap Wallet',
  connector: web3UniwalletConnect,
  hooks: web3UniwalletConnectHooks,
  type: ConnectionType.UNIWALLET,
  getIcon: () => UNIWALLET_ICON_URL,
  shouldDisplay: () => Boolean(!getIsInjectedMobileBrowser() && !isNonIOSPhone),
  isNew: true,
}

const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        url: RPC_URLS[SupportedChainId.BASE][0],
        appName: 'Uniswap',
        appLogoUrl: UNISWAP_LOGO_URL,
        reloadOnDisconnect: false,
      },
      onError,
    })
)

const coinbaseWalletConnection: Connection = {
  getName: () => 'Coinbase Wallet',
  connector: web3CoinbaseWallet,
  hooks: web3CoinbaseWalletHooks,
  type: ConnectionType.COINBASE_WALLET,
  getIcon: () => COINBASE_ICON_URL,
  shouldDisplay: () =>
    Boolean((isMobile && !getIsInjectedMobileBrowser()) || !isMobile || getIsCoinbaseWalletBrowser()),
  // If on a mobile browser that isn't the coinbase wallet browser, deeplink to the coinbase wallet app
  overrideActivate: () => {
    if (!window?.walletLinkExtension?.isCoinbaseWallet) {
      // if (isMobile && !getIsInjectedMobileBrowser()) {
      window.open('https://go.cb-w.com/mtUDhEZPy1', 'cbwallet')
      return true
    }
    return false
  },
}

// const [bitgetWallet, bitgetWalletHooks] = initializeConnector<BitKeep>((actions) => new BitKeep({ actions, onError }))

// const bitgetWalletConnection: Connection = {
//   getName: () => 'Bitget Wallet',
//   connector: bitgetWallet,
//   hooks: bitgetWalletHooks,
//   type: ConnectionType.BITGET_WALLET,
//   getIcon: () => BITGET_ICON_URL,
//   shouldDisplay: () => true, //Boolean(getIsBitgetWalletBrowser()),
//   overrideActivate: () => {
//     if (getShouldAdvertiseBitgetWallet()) {
//       window.open('https://web3.bitget.com/en/wallet-download?type=2')
//       return true
//     }
//     return false
//   },
// }

export function getConnections() {
  return [
    uniwalletConnectConnection,
    injectedConnection,
    walletConnectConnection,
    coinbaseWalletConnection,
    // bitgetWalletConnection,
    gnosisSafeConnection,
    networkConnection,
  ]
}

export function useGetConnection() {
  return useCallback((c: Connector | ConnectionType) => {
    if (c instanceof Connector) {
      const connection = getConnections().find((connection) => connection.connector === c)
      if (!connection) {
        throw Error('unsupported connector')
      }
      return connection
    } else {
      switch (c) {
        case ConnectionType.INJECTED:
          return injectedConnection
        case ConnectionType.COINBASE_WALLET:
          return coinbaseWalletConnection
        case ConnectionType.WALLET_CONNECT:
          return walletConnectConnection
        case ConnectionType.UNIWALLET:
          return uniwalletConnectConnection
        case ConnectionType.NETWORK:
          return networkConnection
        case ConnectionType.GNOSIS_SAFE:
          return gnosisSafeConnection
        case ConnectionType.BITGET_WALLET:
          return gnosisSafeConnection
      }
    }
  }, [])
}
