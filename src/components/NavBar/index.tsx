import { Trans } from '@lingui/macro'
import { Menu } from '@mui/material'
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
import { useIsPoolsPage } from 'hooks/useIsPoolsPage'
import { Box } from 'nft/components/Box'
import { Row } from 'nft/components/Flex'
import { useIsMobile } from 'nft/hooks'
import { ReactNode, useCallback, useState } from 'react'
import { Menu as MenuIcon } from 'react-feather'
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
  z-index: 1000;
  overflow: visible;
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
  shift?: boolean
}

const MenuItem = ({ href, dataTestId, id, isActive, children, margin, external, font, noBorder }: MenuItemProps) => {
  return (
    <NavLink
      target={external ? '_blank' : ''}
      rel={external ? 'noopener noreferrer' : ''}
      to={href}
      className={isActive ? styles.activeMenuItem : styles.menuItem}
      id={id}
      style={{
        textDecoration: 'none',
        marginRight: '4px',
        fontSize: font ? '14px' : '16px',
        borderWidth: noBorder ? '0' : '2px',
      }}
      data-testid={dataTestId}
    >
      {children}
    </NavLink>
  )
}

const MenuItemDropDown = ({ href, dataTestId, id, isActive, children, margin, external, shift }: MenuItemProps) => {
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
      <MenuItem font={true} noBorder={true} href="/pools/advanced" isActive={pathname.startsWith('/pools/advanced')}>
        My LP Positions
      </MenuItem>
      <MenuItem font={true} noBorder={true} href="/pools/simple" isActive={pathname.startsWith('/pools/simple')}>
        Simple LP
      </MenuItem>
    </StyledMenu>
  )

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
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
        <ChevronIcon $rotated={isDropdownVisible} />

        {isDropdownVisible && !shift && dropdown}
      </NavLink>
      {isDropdownVisible && shift && (
        <div style={{ marginLeft: '10px', display: 'flex', flexDirection: 'column', alignContent: 'start' }}>
          <MenuItem
            font={true}
            noBorder={true}
            href="/pools/advanced"
            isActive={pathname.startsWith('/pools/advanced')}
          >
            My LP Positions
          </MenuItem>
          <MenuItem font={true} noBorder={true} href="/pools/simple" isActive={pathname.startsWith('/pools/simple')}>
            Simple LP
          </MenuItem>
        </div>
      )}
    </div>
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
  const { chainId: connectedChainId, account } = useWeb3React()
  const chainName = chainIdToBackendName(connectedChainId)
  const isPoolActive = useIsPoolsPage()
  const micrositeEnabled = useMGTMMicrositeEnabled()

  // const brp = useBRP()
  // useEffect(() => {
  //   const fetch = async () => {
  //     if (account && brp) {
  //       const users = await brp.getUsers()
  //       setAddresses(users)
  //     }
  //   }
  //   fetch()
  // }, [account, brp])

  const [addresses, setAddresses] = useState<string[]>([
    '0xfb3A08469e5bF09036cE102cc0BeddABC87730d4',
    '0xD0A0584Ca19068CdCc08b7834d8f8DF969D67bd5',
  ])

  return (
    <>
      <Tabs>
        <LogoSection>
          <NavLink to="/trade">
            <LogoText fill="#fff" width="150px" />
          </NavLink>
        </LogoSection>
        <MenuItem href="/trade" isActive={pathname.startsWith('/trade')}>
          <ThemedText.BodySecondary>Trade</ThemedText.BodySecondary>
        </MenuItem>
        <MenuItem href={`/tokens/${chainName.toLowerCase()}`} isActive={pathname.startsWith('/tokens')}>
          <ThemedText.BodySecondary>Pairs</ThemedText.BodySecondary>
        </MenuItem>
        {/* <MenuItem href="/swap" isActive={pathname.startsWith('/swap')}>
          <ThemedText.BodySecondary>Swap</ThemedText.BodySecondary>
        </MenuItem> */}
        <MenuItemDropDown href="/pools" dataTestId="pool-nav-link" isActive={isPoolActive}>
          <ThemedText.BodySecondary>Earn</ThemedText.BodySecondary>
        </MenuItemDropDown>
        {connectedChainId == SupportedChainId.BERA_ARTIO ? (
          <MenuItem href="/faucet" dataTestId="pool-nav-link" isActive={pathname.startsWith('/faucet')}>
            <ThemedText.BodySecondary>Faucets</ThemedText.BodySecondary>
          </MenuItem>
        ) : null}
        {account && addresses.includes(account) ? (
          <MenuItem href="/stats" dataTestId="pool-nav-link" isActive={pathname.startsWith('/stats')}>
            <ThemedText.BodySecondary>Stats</ThemedText.BodySecondary>
          </MenuItem>
        ) : null}
        <MenuItem href="/leaderboard" dataTestId="pool-nav-link" isActive={pathname.startsWith('/leaderboard')}>
          <ThemedText.BodySecondary>LMT</ThemedText.BodySecondary>
        </MenuItem>
        <MenuItem href="/referral" dataTestId="pool-nav-link" isActive={pathname.startsWith('/referral')}>
          <ThemedText.BodySecondary>Referral</ThemedText.BodySecondary>
        </MenuItem>
        <MenuItem href="/airdrop" isActive={pathname.startsWith('/airdrop') || pathname.startsWith('/loot')}>
          <ThemedText.BodySecondary>AirDrop</ThemedText.BodySecondary>
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

const DropdownWrapper = styled.div`
  margin-left: 0.25rem;
`
const StyledNavMenu = styled(Menu)`
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  animation: ${fadeIn} 0.5s;
  width: 10rem;
  & .MuiMenu-paper {
    border-radius: 10px;
    border: solid 1px ${({ theme }) => theme.backgroundOutline};
    background-color: ${({ theme }) => theme.backgroundSurface};
    width: 28rem;
    margin-top: 1rem;
  }
`

const DropdownItemsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 1rem;
`

const DropdownMenu = () => {
  const { pathname } = useLocation()
  const { chainId: connectedChainId, account } = useWeb3React()
  const chainName = chainIdToBackendName(connectedChainId)
  const isPoolActive = useIsPoolsPage()

  const [addresses, setAddresses] = useState<string[]>([
    '0xfb3A08469e5bF09036cE102cc0BeddABC87730d4',
    '0xD0A0584Ca19068CdCc08b7834d8f8DF969D67bd5',
  ])

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  // const handleInvert = useInvertCurrentBaseQuote()

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <DropdownWrapper>
      <MenuIcon aria-controls="simple-nav" aria-haspopup="true" onClick={handleClick} />
      {open && (
        <StyledNavMenu
          id="simple-nav"
          anchorEl={anchorEl}
          keepMounted
          open={open}
          onClose={handleClose}
          style={{ position: 'absolute' }}
          marginThreshold={0}
        >
          <DropdownItemsWrapper onClick={handleClose}>
            <MenuItem href="/trade" isActive={pathname.startsWith('/trade')}>
              <ThemedText.BodySecondary>Trade</ThemedText.BodySecondary>
            </MenuItem>
            <MenuItem href={`/tokens/${chainName.toLowerCase()}`} isActive={pathname.startsWith('/tokens')}>
              <ThemedText.BodySecondary>Pairs</ThemedText.BodySecondary>
            </MenuItem>
            {/* <MenuItem href="/swap" isActive={pathname.startsWith('/swap')}>
        <ThemedText.BodySecondary>Swap</ThemedText.BodySecondary>
      </MenuItem> */}
            <MenuItemDropDown shift={true} href="/pools" dataTestId="pool-nav-link" isActive={isPoolActive}>
              <ThemedText.BodySecondary>Earn</ThemedText.BodySecondary>
            </MenuItemDropDown>
            {connectedChainId == SupportedChainId.BERA_ARTIO ? (
              <MenuItem href="/faucet" dataTestId="pool-nav-link" isActive={pathname.startsWith('/faucet')}>
                <ThemedText.BodySecondary>Faucets</ThemedText.BodySecondary>
              </MenuItem>
            ) : null}
            {account && addresses.includes(account) ? (
              <MenuItem href="/stats" dataTestId="pool-nav-link" isActive={pathname.startsWith('/stats')}>
                <ThemedText.BodySecondary>Stats</ThemedText.BodySecondary>
              </MenuItem>
            ) : null}
            <MenuItem href="/leaderboard" dataTestId="pool-nav-link" isActive={pathname.startsWith('/leaderboard')}>
              <ThemedText.BodySecondary>LMT</ThemedText.BodySecondary>
            </MenuItem>
            <MenuItem href="/referral" dataTestId="pool-nav-link" isActive={pathname.startsWith('/referral')}>
              <ThemedText.BodySecondary>Referral</ThemedText.BodySecondary>
            </MenuItem>
            <MenuItem href="/airdrop" isActive={pathname.startsWith('/airdrop') || pathname.startsWith('/loot')}>
              <ThemedText.BodySecondary>AirDrop</ThemedText.BodySecondary>
            </MenuItem>
            <MenuItem external={true} href="https://limitless.gitbook.io/limitless/intro/why-limitless">
              <ThemedText.BodySecondary>Docs</ThemedText.BodySecondary>
            </MenuItem>
          </DropdownItemsWrapper>
        </StyledNavMenu>
      )}
    </DropdownWrapper>
  )
}

const Navbar = () => {
  const [showModal, setShowModal] = useState(false)
  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  // console.log('hght')

  const isMobile = useIsMobile()

  return (
    <>
      <Nav>
        <Box display="flex" height="2" flexWrap="nowrap">
          <Box className={styles.leftSideContainer}>
            {/* {!isNftPage && (
              <Box display={{ sm: 'flex', lg: 'none' }}>
                <ChainSelector leftAlign={true} />
              </Box>
            )} */}
            <Row display={{ sm: 'none', lg: 'flex' }}>
              <PageTabs />
            </Row>
            <Row display={{ sm: 'flex', lg: 'none' }}>
              <DropdownMenu />
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
              <Box display={{ sm: 'flex', lg: 'flex' }}>
                <ChainSelector />
              </Box>
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
