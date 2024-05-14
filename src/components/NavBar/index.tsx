import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import AboutModal from 'components/About/AboutModal'
import { SmallButtonPrimary } from 'components/Button'
import Modal from 'components/Modal'
import { ChevronIcon } from 'components/swap/PoolSelect'
import NewBadge from 'components/WalletModal/NewBadge'
import Web3Status from 'components/Web3Status'
import { SupportedChainId } from 'constants/chains'
import { useMGTMMicrositeEnabled } from 'featureFlags/flags/mgtm'
import { chainIdToBackendName } from 'graphql/data/util'
import { useIsNftPage } from 'hooks/useIsNftPage'
import { useIsPoolsPage } from 'hooks/useIsPoolsPage'
import { Box } from 'nft/components/Box'
import { Row } from 'nft/components/Flex'
import { ReactNode, useCallback, useState } from 'react'
import { NavLink, NavLinkProps, useLocation } from 'react-router-dom'
import styled, { keyframes } from 'styled-components/macro'
import { ThemedText } from 'theme'

import { ReactComponent as LogoText } from '../../assets/svg/full_logo_black.svg'
import { ReactComponent as Logo } from '../../assets/svg/Limitless_Logo_Black.svg'
// import { Bag } from './Bag'
import { ChainSelector } from './ChainSelector'
import { NavDropdown } from './NavDropdown'
import * as styles from './style.css'

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

const fadeIn = keyframes`
  from { opacity: .25 }
  to { opacity: 1 }
`

const StyledMenu = styled(NavDropdown)`
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  background-color: ${({ theme }) => theme.navbarBackground};
  position: absolute;
  margin-top: 100px;
  padding: 5px;
  width: 200px;
  margin-left: -15px;
  animation: ${fadeIn} 0.5s;
`

interface MenuItemProps {
  href: string
  id?: NavLinkProps['id']
  isActive?: boolean
  children: ReactNode
  dataTestId?: string
  margin?: string
  external?: boolean
  font?: boolean
  noBorder?: boolean
}

const MenuItem = ({ href, dataTestId, id, isActive, children, margin, external, font, noBorder }: MenuItemProps) => {
  return (
    <NavLink
      target={external ? '_blank' : ''}
      rel={external ? 'noopener noreferrer' : ''}
      to={href}
      className={isActive ? styles.activeMenuItem : styles.menuItem}
      id={id}
      style={{ textDecoration: 'none', marginRight: '4px', fontSize: font ? '14px' : '16px', borderWidth: noBorder ? '0px' : '2px' }}
      data-testid={dataTestId}
    >
      {children}
    </NavLink>
  )
}

const MenuItemDropDown = ({ href, dataTestId, id, isActive, children, margin, external }: MenuItemProps) => {
  const { pathname } = useLocation()

  const [isDropdownVisible, setDropdownVisible] = useState(false)

  const handleMouseEnter = () => {
    setDropdownVisible(true)
  }

  const handleMouseLeave = () => {
    setDropdownVisible(false)
  }

  const dropdown = (
    <StyledMenu>
      <MenuItem font={true} href="/pools/advanced" isActive={pathname.startsWith('/pools/advanced')} noBorder={true}>
        My LP Positions
      </MenuItem>
      <MenuItem font={true} href="/pools/simple" isActive={pathname.startsWith('/pools/simple')} noBorder={true}>
        Simple LP
      </MenuItem>
    </StyledMenu>
  )

  return (
    <NavLink
      target={external ? '_blank' : ''}
      rel={external ? 'noopener noreferrer' : ''}
      to={href}
      className={isActive ? styles.activeMenuItem : styles.menuItem}
      id={id}
      style={{ textDecoration: 'none', marginRight: '4px', fontSize: '16px' }}
      data-testid={dataTestId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isDropdownVisible && dropdown}
      <ChevronIcon $rotated={isDropdownVisible} />
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
  const micrositeEnabled = useMGTMMicrositeEnabled()

  return (
    <>
      <Tabs>
        <LogoSection>
          <NavLink to="/trade">
            <LogoText fill="#fff" width="150px" />
          </NavLink>
        </LogoSection>
        <MenuItem href="/trade" isActive={pathname.startsWith('/trade')}>
          {/* <Trans>Trade</Trans> */}
          <ThemedText.BodySecondary>Trade</ThemedText.BodySecondary>
        </MenuItem>
        <MenuItem href={`/tokens/${chainName.toLowerCase()}`} isActive={pathname.startsWith('/tokens')}>
          <ThemedText.BodySecondary>Pairs</ThemedText.BodySecondary>
        </MenuItem>
        <MenuItem href="/swap" isActive={pathname.startsWith('/swap')}>
          <ThemedText.BodySecondary>Swap</ThemedText.BodySecondary>
        </MenuItem>
        <MenuItemDropDown href="/pools" dataTestId="pool-nav-link" isActive={isPoolActive}>
          <ThemedText.BodySecondary>Earn</ThemedText.BodySecondary>
        </MenuItemDropDown>
        {connectedChainId == SupportedChainId.BERA_ARTIO ? (
          <MenuItem href="/faucet" dataTestId="pool-nav-link" isActive={pathname.startsWith('/faucet')}>
            <ThemedText.BodySecondary>Faucets</ThemedText.BodySecondary>
          </MenuItem>
        ) : null}
        <MenuItem href="/leaderboard" dataTestId="pool-nav-link" isActive={pathname.startsWith('/leaderboard')}>
          <ThemedText.BodySecondary>LMT</ThemedText.BodySecondary>
        </MenuItem>
        <MenuItem href="/referral" dataTestId="pool-nav-link" isActive={pathname.startsWith('/referral')}>
          <ThemedText.BodySecondary>Referral</ThemedText.BodySecondary>
        </MenuItem>
        <MenuItem href="/loot" isActive={pathname.startsWith('/loot')}>
          <ThemedText.BodySecondary>Loot</ThemedText.BodySecondary>
        </MenuItem>
        <MenuItem external={true} href="https://limitless.gitbook.io/limitless/intro/why-limitless">
          <ThemedText.BodySecondary>Docs</ThemedText.BodySecondary>
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

const Navbar = () => {
  const isNftPage = useIsNftPage()
  const [showModal, setShowModal] = useState(false)
  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  // console.log('hght')

  return (
    <>
      <Nav>
        <Box display="flex" height="2" flexWrap="nowrap">
          <Box className={styles.leftSideContainer}>
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
                style={{ display: ' flex', gap: '5px', background: '#0ecc83', color: '#0a0f19', maxHeight: '35px' }}
              >
                <Logo fill="#0a0f19" width="12px" />
                <Trans>
                  <ThemedText.BodySmall fontWeight={900} color="#0a0f19">
                    What is Limitless?
                  </ThemedText.BodySmall>
                </Trans>
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
