import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import AboutModal from 'components/About/AboutModal'
import { SmallButtonPrimary } from 'components/Button'
import Modal from 'components/Modal'
import NewBadge from 'components/WalletModal/NewBadge'
import Web3Status from 'components/Web3Status'
import { useMGTMMicrositeEnabled } from 'featureFlags/flags/mgtm'
import { chainIdToBackendName } from 'graphql/data/util'
import { useIsNftPage } from 'hooks/useIsNftPage'
import { useIsPoolsPage } from 'hooks/useIsPoolsPage'
import { useAtomValue } from 'jotai/utils'
import { Box } from 'nft/components/Box'
import { Row } from 'nft/components/Flex'
import { useProfilePageState } from 'nft/hooks'
import { ReactNode, useCallback, useState } from 'react'
import { NavLink, NavLinkProps, useLocation, useNavigate } from 'react-router-dom'
import { shouldDisableNFTRoutesAtom } from 'state/application/atoms'
import styled from 'styled-components/macro'

import { ReactComponent as LogoText } from '../../assets/svg/full_logo_black.svg'
import { ReactComponent as Logo } from '../../assets/svg/Limitless_Logo_Black.svg'
// import { Bag } from './Bag'
import { ChainSelector } from './ChainSelector'
import * as styles from './style.css'
import { SupportedChainId } from 'constants/chains'

const Nav = styled.nav`
  /* padding: 10px 12px; */
  border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};
  width: 100%;
  z-index: 0;
  background-color: ${({ theme }) => theme.navbarBackground}; // Use theme value
  &:hover {
    font-weight: bold;
  }
  position: initial;
`

interface MenuItemProps {
  href: string
  id?: NavLinkProps['id']
  isActive?: boolean
  children: ReactNode
  dataTestId?: string
  margin?: string
  external?: boolean
}

const MenuItem = ({ href, dataTestId, id, isActive, children, margin, external }: MenuItemProps) => {
  return (
    <NavLink
      target={external ? '_blank' : ''}
      rel={external ? 'noopener noreferrer' : ''}
      to={href}
      className={isActive ? styles.activeMenuItem : styles.menuItem}
      id={id}
      style={{ textDecoration: 'none', marginRight: '4px', fontSize: '16px' }}
      data-testid={dataTestId}
    >
      {children}
    </NavLink>
  )
}

const LogoSection = styled.div`
  padding-left: 1vw;
  margin-right: 2vw;
  padding-top: 0.65vh;
`
const Tabs = styled.div`
  display: flex;
  align-items: center;
`

export const PageTabs = () => {
  const { pathname } = useLocation()
  const { chainId: connectedChainId } = useWeb3React()
  const chainName = chainIdToBackendName(connectedChainId)
  const isPoolActive = useIsPoolsPage()
  const isNftPage = useIsNftPage()
  const micrositeEnabled = useMGTMMicrositeEnabled()

  const shouldDisableNFTRoutes = useAtomValue(shouldDisableNFTRoutesAtom)

  return (
    <>
      <Tabs>
        <LogoSection>
          <NavLink to="/swap">
            <LogoText fill="#fff" width="150px" />
          </NavLink>
        </LogoSection>
        <MenuItem href="/swap" isActive={pathname.startsWith('/swap')}>
          <Trans>Trade</Trans>
        </MenuItem>
        <MenuItem href={`/tokens/${chainName.toLowerCase()}`} isActive={pathname.startsWith('/tokens')}>
          <Trans>Pairs</Trans>
        </MenuItem>
        <MenuItem href="/pools" dataTestId="pool-nav-link" isActive={isPoolActive}>
          <Trans>Earn</Trans>
        </MenuItem>
        {connectedChainId == SupportedChainId.BERA_ARTIO ? (
        <MenuItem href="/faucet" dataTestId="pool-nav-link" isActive={pathname.startsWith('/faucet')}>
          <Trans>Faucets</Trans>
        </MenuItem>
        ) : null}
        <MenuItem href="/leaderboard" dataTestId="pool-nav-link" isActive={pathname.startsWith('/leaderboard')}>
          <Trans>LMT</Trans>
        </MenuItem>
        <MenuItem href="/referral" dataTestId="pool-nav-link" isActive={pathname.startsWith('/referral')}>
          <Trans>Referral</Trans>
        </MenuItem>
        <MenuItem external={true} href="https://limitless.gitbook.io/limitless/intro/why-limitless">
          <Trans>Docs</Trans>
        </MenuItem>
      </Tabs>
      <Box display={{ sm: 'flex', lg: 'none', xxl: 'flex' }} width="full"></Box>
      {micrositeEnabled && (
        <Box display={{ sm: 'none', xxxl: 'flex' }}>
          <MenuItem href="/wallet" isActive={pathname.startsWith('/wallet')}>
            <Trans>Wallet</Trans>
            <NewBadge />
          </MenuItem>
        </Box>
      )}
      {/*<Box marginY={{ sm: '4', md: 'unset' }}>
        <MenuDropdown />
      </Box>*/}
    </>
  )
}

const Navbar = ({ blur }: { blur: boolean }) => {
  const isNftPage = useIsNftPage()
  const sellPageState = useProfilePageState((state) => state.state)
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  return (
    <>
      {/* {blur && <Blur />} */}
      <Nav>
        <Box display="flex" height="2" flexWrap="nowrap">
          <Box className={styles.leftSideContainer}>
            {/*<Box className={styles.logoContainer}>
              <UniIcon
              width="48"
              height="48"
              data-testid="uniswap-logo"
              className={styles.logo}
              onClick={() => {
                navigate({
                  pathname: '/',
                  search: '?intro=true',
                })
              }}
              />
            </Box>*/}
            {!isNftPage && (
              <Box display={{ sm: 'flex', lg: 'none' }}>
                <ChainSelector leftAlign={true} />
              </Box>
            )}
            <Row display={{ sm: 'none', lg: 'flex' }}>
              <PageTabs />
            </Row>
          </Box>
          <Box className={styles.searchContainer}>{/* <SearchBar /> */}</Box>
          <Box className={styles.rightSideContainer} style={{ paddingRight: '10px' }}>
            <Row gap="12">
              <Box position="relative" display={{ sm: 'flex', navSearchInputVisible: 'none' }}>
                {/* <SearchBar /> */}
              </Box>
              {/* {isNftPage && sellPageState !== ProfilePageStateType.LISTING && <Bag />} */}
              <SmallButtonPrimary
                onClick={() => setShowModal(!showModal)}
                className={styles.blueButton}
                style={{ display: ' flex', gap: '5px', background: '#0ecc83', color: '#0a0f19' }}
              >
                <Logo fill="#0a0f19" width="12px" />
                <Trans> What is Limitless?</Trans>
              </SmallButtonPrimary>
              {!isNftPage && (
                <Box display={{ sm: 'none', lg: 'flex' }}>
                  <ChainSelector />
                </Box>
              )}
              <Web3Status />
            </Row>
          </Box>
        </Box>
        <Modal maxWidth={700} isOpen={showModal} onDismiss={handleCloseModal}>
          <AboutModal />
        </Modal>
      </Nav>
    </>
  )
}

export default Navbar
