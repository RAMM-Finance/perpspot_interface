import { Trans } from '@lingui/macro'
// import { ConnectButton } from '@rainbow-me/rainbowkit'
import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceEventName } from '@uniswap/analytics-events'
import { useWeb3React } from '@web3-react/core'
import Loader from 'components/Icons/LoadingSpinner'
import { IconWrapper } from 'components/Identicon/StatusIcon'
import WalletDropdown, { useWalletDrawer } from 'components/WalletDropdown'
import PrefetchBalancesWrapper from 'components/WalletDropdown/PrefetchBalancesWrapper'
import { useGetConnection } from 'connection'
import { Portal } from 'nft/components/common/Portal'
import { darken } from 'polished'
import { useCallback, useMemo } from 'react'
import { AlertTriangle } from 'react-feather'
import { useAppSelector } from 'state/hooks'
import styled from 'styled-components/macro'
import { colors } from 'theme/colors'
import { flexRowNoWrap } from 'theme/styles'

import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/types'
import { shortenAddress } from '../../utils'
import { ButtonSecondary } from '../Button'
import StatusIcon from '../Identicon/StatusIcon'
import { RowBetween } from '../Row'

// https://stackoverflow.com/a/31617326
const FULL_BORDER_RADIUS = 9999

const Web3StatusGeneric = styled(ButtonSecondary)`
  ${flexRowNoWrap};
  width: 100%;
  align-items: center;
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
  margin-right: 2px;
  margin-left: 2px;
  :focus {
    outline: none;
  }
`
const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.accentFailure};
  border: 1px solid ${({ theme }) => theme.accentFailure};
  color: ${({ theme }) => theme.white};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.accentFailure)};
  }
`

const Web3StatusConnectWrapper = styled.div<{ faded?: boolean }>`
  ${flexRowNoWrap};
  align-items: center;
  // background-color: ${({ theme }) => theme.accentActionSoft};
  border-radius: 10px;
  border: none;
  color: ${({ theme }) => theme.accentAction};
  :hover {
    color: ${({ theme }) => theme.accentActionSoft};
    stroke: ${({ theme }) => theme.accentActionSoft};
  }

  transition: ${({
    theme: {
      transition: { duration, timing },
    },
  }) => `${duration.fast} color ${timing.in}`};
`

const Web3StatusConnected = styled(Web3StatusGeneric)<{
  pending?: boolean
  isClaimAvailable?: boolean
}>`
  background-color: ${({ pending, theme }) => (pending ? theme.accentActive : theme.deprecated_bg1)};
  border: 1px solid ${({ pending, theme }) => (pending ? theme.accentActive : theme.deprecated_bg1)};
  color: ${({ pending, theme }) => (pending ? theme.white : theme.textPrimary)};
  font-weight: 500;
  padding: 6px 6px;
  border: ${({ isClaimAvailable }) => isClaimAvailable && `1px solid ${colors.purple300}`};
  :hover,
  :focus {
    border: 1px solid ${({ theme }) => darken(0.05, theme.deprecated_bg3)};

    :focus {
      border: 1px solid
        ${({ pending, theme }) =>
          pending ? darken(0.1, theme.accentAction) : darken(0.1, theme.backgroundInteractive)};
    }
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
    width: ${({ pending }) => !pending && '36px'};

    ${IconWrapper} {
      margin-right: 0;
    }
  }
`

const AddressAndChevronContainer = styled.div`
  display: flex;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.navSearchInputVisible}px`}) {
    display: none;
  }
`

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 12px;
  width: fit-content;
  font-weight: 500;
`

const NetworkIcon = styled(AlertTriangle)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

const StyledConnectButton = styled.button`
  background-color: #4c82fb;
  border: none;
  border-top-left-radius: ${FULL_BORDER_RADIUS}px;
  border-bottom-left-radius: ${FULL_BORDER_RADIUS}px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  padding: 7.25px 7px;
  color: white;
`

function Web3StatusInner() {
  const { account, connector, chainId, ENSName } = useWeb3React()
  const getConnection = useGetConnection()
  const connection = getConnection(connector)
  const [, toggleWalletDrawer] = useWalletDrawer()
  const handleWalletDropdownClick = useCallback(() => {
    toggleWalletDrawer()
  }, [toggleWalletDrawer])

  const error = useAppSelector((state) => state.connection.errorByConnectionType[getConnection(connector).type])

  const allTransactions = useAllTransactions()
  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)

  const hasPendingTransactions = !!pending.length

  if (!chainId) {
    return null
  } else if (error) {
    return (
      <Web3StatusError onClick={handleWalletDropdownClick}>
        <NetworkIcon />
        <Text>
          <Trans>Error</Trans>
        </Text>
      </Web3StatusError>
    )
  } else if (account) {
    return (
      <TraceEvent
        events={[BrowserEvent.onClick]}
        name={InterfaceEventName.MINI_PORTFOLIO_TOGGLED}
        properties={{ type: 'open' }}
      >
        <Web3StatusConnected
          data-testid="web3-status-connected"
          onClick={handleWalletDropdownClick}
          pending={hasPendingTransactions}
          isClaimAvailable={false}
        >
          {!hasPendingTransactions && <StatusIcon size={18} connection={connection} showMiniIcons={false} />}
          {hasPendingTransactions ? (
            <RowBetween>
              <Text>
                <Trans>{pending?.length} Transacting</Trans>
              </Text>{' '}
              <Loader stroke="white" />
            </RowBetween>
          ) : (
            <AddressAndChevronContainer>
              <Text>{ENSName || shortenAddress(account)}</Text>
            </AddressAndChevronContainer>
          )}
        </Web3StatusConnected>
      </TraceEvent>
    )
  } else {
    return (
      <></>
      // <ConnectButton />
      // <Web3StatusConnectWrapper
      //   tabIndex={0}
      //   faded={!account}
      //   onKeyPress={(e) => e.key === 'Enter' && handleWalletDropdownClick()}
      //   onClick={handleWalletDropdownClick}
      // >
      //   {/* <StyledConnectButton tabIndex={-1} data-testid="navbar-connect-wallet">
      //     <Trans>Connect Wallet</Trans>
      //   </StyledConnectButton> */}
      // </Web3StatusConnectWrapper>
    )
  }
}

// eslint-disable-next-line import/no-unused-modules
export default function Web3Status() {
  return (
    <PrefetchBalancesWrapper>
      <Web3StatusInner />
      <Portal>
        <WalletDropdown />
      </Portal>
    </PrefetchBalancesWrapper>
  )
}
