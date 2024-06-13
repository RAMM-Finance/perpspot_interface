import { getWalletMeta } from '@uniswap/conedison/provider/meta'
import { useWeb3React } from '@web3-react/core'
import { sendEvent } from 'components/analytics'
import { AutoColumn } from 'components/Column'
import { AutoRow } from 'components/Row'
import { useWalletDrawer } from 'components/WalletDropdown'
import IconButton from 'components/WalletDropdown/IconButton'
import { Connection, ConnectionType, getConnections, networkConnection } from 'connection'
import { useGetConnection } from 'connection'
import { ErrorCode } from 'connection/utils'
import { isSupportedChain } from 'constants/chains'
import { useMgtmEnabled } from 'featureFlags/flags/mgtm'
import useSelectChain from 'hooks/useSelectChain'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Settings } from 'react-feather'
import { useAppDispatch } from 'state/hooks'
import { updateSelectedWallet } from 'state/user/reducer'
import { useConnectedWallets } from 'state/wallets/hooks'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { flexColumnNoWrap } from 'theme/styles'
import { useAccount, useChainId, useConnect } from 'wagmi'

import ConnectionErrorView from './ConnectionErrorView'
import Option, { WagmiOption } from './Option'
import PrivacyPolicyNotice from './PrivacyPolicyNotice'

const Wrapper = styled.div`
  ${flexColumnNoWrap};
  background-color: ${({ theme }) => theme.backgroundSurface};
  width: 100%;
  padding: 14px 16px 16px;
  flex: 1;
`

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 2px;
  border-radius: 12px;
  overflow: hidden;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    grid-template-columns: 1fr;
  `};
`

const PrivacyPolicyWrapper = styled.div`
  padding: 0 4px;
`

function didUserReject(connection: Connection, error: any): boolean {
  return (
    error?.code === ErrorCode.USER_REJECTED_REQUEST ||
    (connection.type === ConnectionType.WALLET_CONNECT && error?.toString?.() === ErrorCode.WC_MODAL_CLOSED) ||
    (connection.type === ConnectionType.COINBASE_WALLET && error?.toString?.() === ErrorCode.CB_REJECTED_REQUEST)
  )
}

export default function WalletModal({ openSettings }: { openSettings: () => void }) {
  const dispatch = useAppDispatch()
  const { connector, account, chainId, provider } = useWeb3React()
  const [drawerOpen, toggleWalletDrawer] = useWalletDrawer()

  const [connectedWallets, addWalletToConnectedWallets] = useConnectedWallets()
  const [lastActiveWalletAddress, setLastActiveWalletAddress] = useState<string | undefined>(account)
  const [pendingConnection, setPendingConnection] = useState<Connection | undefined>()
  const [pendingError, setPendingError] = useState<any>()

  const connections = getConnections()
  const getConnection = useGetConnection()

  useEffect(() => {
    // Clean up errors when the dropdown closes
    return () => setPendingError(undefined)
  }, [setPendingError])

  const openOptions = useCallback(() => {
    if (pendingConnection) {
      setPendingError(undefined)
      setPendingConnection(undefined)
    }
  }, [pendingConnection, setPendingError])

  // Keep the network connector in sync with any active user connector to prevent chain-switching on wallet disconnection.
  useEffect(() => {
    if (chainId && isSupportedChain(chainId) && connector !== networkConnection.connector) {
      networkConnection.connector.activate(chainId)
    }
  }, [chainId, connector])

  // When new wallet is successfully set by the user, trigger logging of Amplitude analytics event.
  useEffect(() => {
    if (account && account !== lastActiveWalletAddress) {
      const walletName = getConnection(connector).getName()
      const peerWalletAgent = provider ? getWalletMeta(provider)?.agent : undefined
      const isReconnect =
        connectedWallets.filter((wallet) => wallet.account === account && wallet.walletType === walletName).length > 0
      // sendAnalyticsEventAndUserInfo(account, walletName, chainId, isReconnect, peerWalletAgent)
      if (!isReconnect) addWalletToConnectedWallets({ account, walletType: walletName })
    }
    setLastActiveWalletAddress(account)
  }, [
    connectedWallets,
    addWalletToConnectedWallets,
    lastActiveWalletAddress,
    account,
    connector,
    chainId,
    provider,
    getConnection,
  ])

  // Used to track the state of the drawer in async function
  const drawerOpenRef = useRef(drawerOpen)
  drawerOpenRef.current = drawerOpen

  const selectChain = useSelectChain()
  const targetChainId = 42161
  const tryActivation = useCallback(
    async (connection: Connection) => {
      // Skips wallet connection if the connection should override the default behavior, i.e. install metamask or launch coinbase app
      if (connection.overrideActivate?.()) return

      // log selected wallet
      sendEvent({
        category: 'Wallet',
        action: 'Change Wallet',
        label: connection.type,
      })

      try {
        setPendingConnection(connection)
        setPendingError(undefined)
        console.log('windowme', window.ethereum?.isMetaMask)
        await connection.connector.activate()

        dispatch(updateSelectedWallet({ wallet: connection.type }))
        if (drawerOpenRef.current) toggleWalletDrawer()
      } catch (error) {
        if (didUserReject(connection, error)) {
          setPendingConnection(undefined)
        } // Prevents showing error caused by MetaMask being prompted twice
        else if (error?.code !== ErrorCode.MM_ALREADY_PENDING) {
          console.debug(`web3-react connection error: ${error}`)
          setPendingError(error.message)
        }
      }
    },
    [dispatch, setPendingError, toggleWalletDrawer]
  )

  const mgtmEnabled = useMgtmEnabled()

  return (
    <Wrapper data-testid="wallet-modal">
      <AutoRow justify="space-between" width="100%" marginBottom="16px">
        <ThemedText.SubHeader fontWeight={500}>Connect a wallet</ThemedText.SubHeader>
        <IconButton Icon={Settings} onClick={openSettings} data-testid="wallet-settings" />
      </AutoRow>
      {pendingError ? (
        pendingConnection && (
          <ConnectionErrorView openOptions={openOptions} retryActivation={() => tryActivation(pendingConnection)} />
        )
      ) : (
        <AutoColumn gap="16px">
          <OptionGrid data-testid="option-grid">
            {connections.map((connection) => {
              return connection.shouldDisplay() && !(connection.type === ConnectionType.UNIWALLET) ? (
                <Option
                  key={connection.getName()}
                  connection={connection}
                  activate={() => tryActivation(connection)}
                  pendingConnectionType={pendingConnection?.type}
                />
              ) : null
            })}
          </OptionGrid>
          <PrivacyPolicyWrapper>
            <PrivacyPolicyNotice />
          </PrivacyPolicyWrapper>
        </AutoColumn>
      )}
    </Wrapper>
  )
}

export function WalletModalV2({ openSettings }: { openSettings: () => void }) {
  const dispatch = useAppDispatch()
  const { connectors, connect, isPending, isSuccess, isError, data } = useConnect()

  const account = useAccount()?.address
  const chainId = useChainId()
  /**
   * how pending? how error?
   */

  const [drawerOpen, toggleWalletDrawer] = useWalletDrawer()

  console.log('zeke:connectors', data, isPending, isSuccess, account)

  // const [connectedWallets, addWalletToConnectedWallets] = useConnectedWallets()
  // const [lastActiveWalletAddress, setLastActiveWalletAddress] = useState<string | undefined>(account)
  // const [pendingConnection, setPendingConnection] = useState<Connection | undefined>()
  // const [pendingError, setPendingError] = useState<any>()

  // useEffect(() => {
  //   // Clean up errors when the dropdown closes
  //   return () => setPendingError(undefined)
  // }, [setPendingError])

  // const openOptions = useCallback(() => {
  //   if (isPending) {
  //     setPendingError(undefined)
  //     setPendingConnection(undefined)
  //   }
  // }, [pendingConnection, setPendingError])

  // Used to track the state of the drawer in async function
  const drawerOpenRef = useRef(drawerOpen)
  drawerOpenRef.current = drawerOpen

  return (
    <Wrapper data-testid="wallet-modal">
      <AutoRow justify="space-between" width="100%" marginBottom="16px">
        <ThemedText.SubHeader fontWeight={500}>Connect a wallet</ThemedText.SubHeader>
        <IconButton Icon={Settings} onClick={openSettings} data-testid="wallet-settings" />
      </AutoRow>
      {isError ? (
        <></>
      ) : (
        //  <ConnectionErrorView openOptions={openOptions} retryActivation={() => connect({ connector })} />
        <AutoColumn gap="16px">
          <OptionGrid data-testid="option-grid">
            {connectors.map((connector) => {
              return (
                <WagmiOption
                  connector={connector}
                  isLoading={isPending}
                  activate={() => {
                    connect({ connector })
                  }}
                />
              )
            })}
            {/* {connectors.map((connection) => {
              return (
                <Option
                  key={connection.getName()}
                  connection={connection}
                  activate={() => tryActivation(connection)}
                  pendingConnectionType={pendingConnection?.type}
                />
              )
            }
            )} */}
          </OptionGrid>
          <PrivacyPolicyWrapper>
            <PrivacyPolicyNotice />
          </PrivacyPolicyWrapper>
        </AutoColumn>
      )}
    </Wrapper>
  )
}
