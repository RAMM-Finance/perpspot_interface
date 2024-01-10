import { Trans } from '@lingui/macro'
import { Trace, TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, InterfaceEventName, InterfacePageName } from '@uniswap/analytics-events'
import { useWeb3React } from '@web3-react/core'
import { ButtonGray, ButtonPrimary, ButtonText } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { Menu } from 'components/Menu'
import SimplePool from 'components/PoolSimple'
import PositionList from 'components/PositionList'
import { RowBetween, RowFixed } from 'components/Row'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { isSupportedChain } from 'constants/chains'
import { useLmtLpPositions } from 'hooks/useV3Positions'
import { useMemo } from 'react'
import { useState } from 'react'
import { AlertTriangle, Inbox } from 'react-feather'
import { Link } from 'react-router-dom'
import { useUserHideClosedPositions } from 'state/user/hooks'
import styled, { css, useTheme } from 'styled-components/macro'
import { HideSmall, ThemedText } from 'theme'
import { PositionDetails } from 'types/position'

import { LoadingRows } from './styleds'

const Filter = styled.div`
  display: flex;
  align-items: end;
  width: fit-content;
  gap: 10px;
`

const FilterWrapper = styled.div`
  display: flex;
  margin-bottom: 6px;
`

const StyledSelectorText = styled.div<{ active: boolean }>`
  font-size: 16px;
  color: ${({ theme, active }) => (active ? theme.textSecondary : theme.textPrimary)};
  font-weight: ${({ active }) => (active ? '600' : '300')};
`

const Selector = styled.div<{ active: boolean }>`
  font-color: ${({ active, theme }) => (active ? theme.background : 'none')};
  border-radius: 10px;
  padding: 8px;
  background-color: ${({ active, theme }) => (active ? theme.accentActiveSoft : 'none')};
  cursor: pointer;
  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }
`

const PageWrapper = styled(AutoColumn)`
  padding: 68px 8px 0px;
  max-width: 1200px;
  width: 100%;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    max-width: 800px;
  `};

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    max-width: 500px;
  `};

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 48px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: 20px;
  }
`
const TitleRow = styled(RowBetween)`
  color: ${({ theme }) => theme.textSecondary};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
  `};
`
const ButtonRow = styled(RowFixed)`
  & > *:not(:last-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    flex-direction: row-reverse;
  `};
`
const PoolMenu = styled(Menu)`
  margin-left: 0;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex: 1 1 auto;
    width: 49%;
    right: 0px;
  `};

  a {
    width: 100%;
  }
`
const PoolMenuItem = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-weight: 500;
`
const MoreOptionsButton = styled(ButtonGray)`
  border-radius: 12px;
  flex: 1 1 auto;
  padding: 6px 8px;
  width: 100%;
  background-color: ${({ theme }) => theme.backgroundSurface};
  margin-right: 8px;
`

const MoreOptionsText = styled(ThemedText.DeprecatedBody)`
  align-items: center;
  display: flex;
`

const ErrorContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  max-width: 300px;
  min-height: 25vh;
`

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`

const NetworkIcon = styled(AlertTriangle)`
  ${IconStyle}
`

const InboxIcon = styled(Inbox)`
  ${IconStyle}
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  margin-right: 10px;
  margin-left: 10px;
  border-radius: 12px;
  font-size: 16px;
  padding: 6px 8px;
  width: fit-content;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex: 1 1 auto;
    width: 100%;
  `};
`

const MainContentWrapper = styled.main`
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
`

function PositionsLoadingPlaceholder() {
  return (
    <LoadingRows>
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </LoadingRows>
  )
}

function WrongNetworkCard() {
  const theme = useTheme()

  return (
    <>
      <PageWrapper>
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <TitleRow padding="0">
              <ThemedText.LargeHeader>
                <Trans>Liquidity Positions</Trans>
              </ThemedText.LargeHeader>
            </TitleRow>

            <MainContentWrapper>
              <ErrorContainer>
                <ThemedText.DeprecatedBody color={theme.textTertiary} textAlign="center">
                  <NetworkIcon strokeWidth={1.2} />
                  <div data-testid="pools-unsupported-err">
                    <Trans>Your connected network is unsupported.</Trans>
                  </div>
                </ThemedText.DeprecatedBody>
              </ErrorContainer>
            </MainContentWrapper>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  )
}

export default function Pool() {
  const { account, chainId } = useWeb3React()
  const toggleWalletDrawer = useToggleWalletDrawer()
  const [advanced, setAdvanced] = useState<boolean>(false)

  const theme = useTheme()
  const [userHideClosedPositions, setUserHideClosedPositions] = useUserHideClosedPositions()

  // const { positions, loading: positionsLoading } = useV3Positions(account)
  const { positions: lmtPositions, loading: lmtPositionsLoading } = useLmtLpPositions(account)

  const [openPositions, closedPositions] = lmtPositions?.reduce<[PositionDetails[], PositionDetails[]]>(
    (acc, p) => {
      acc[p.liquidity?.isZero() ? 1 : 0].push(p)
      return acc
    },
    [[], []]
  ) ?? [[], []]

  const filteredPositions = useMemo(
    () => [...openPositions, ...(userHideClosedPositions ? [] : closedPositions)],
    [closedPositions, openPositions, userHideClosedPositions]
  )

  if (!isSupportedChain(chainId)) {
    return <WrongNetworkCard />
  }

  const showConnectAWallet = Boolean(!account)
  // const showV2Features = Boolean(V2_FACTORY_ADDRESSES[chainId]) //Potentially needed later

  return (
    <Trace page={InterfacePageName.POOL_PAGE} shouldLogImpression>
      <PageWrapper>
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <TitleRow padding="0">
              {/* <ThemedText.LargeHeader>
                <Trans>Liquidity Positions</Trans>
              </ThemedText.LargeHeader>
              <ButtonRow>
                <ButtonPrimary
                  style={{
                    marginLeft: '20px',
                    padding: '.5rem',
                    width: 'fit-content',
                    fontSize: '0.8rem',
                    borderRadius: '10px',
                    height: '30px',
                    lineHeight: '1',
                  }}
                  data-cy="join-pool-button"
                  id="join-pool-button"
                  as={Link}
                  to="/add/"
                >
                  <Trans>Add New Position</Trans>
                </ButtonPrimary>
                <ButtonPrimary
                  style={{
                    marginLeft: '20px',
                    padding: '.5rem',
                    width: 'fit-content',
                    fontSize: '0.8rem',
                    borderRadius: '10px',
                    height: '30px',
                    lineHeight: '1',
                  }}
                >
                  <Trans>Import Uniswap Position</Trans>
                </ButtonPrimary>
              </ButtonRow> */}
              <FilterWrapper>
                <Filter>
                  <Selector onClick={() => setAdvanced(false)} active={!advanced}>
                    <StyledSelectorText active={!advanced}>Simple</StyledSelectorText>
                  </Selector>
                  <Selector onClick={() => setAdvanced(true)} active={advanced}>
                    <StyledSelectorText active={advanced}>Advanced</StyledSelectorText>
                  </Selector>
                </Filter>
              </FilterWrapper>
            </TitleRow>

            <MainContentWrapper>
              {!advanced && <SimplePool />}
              {advanced && lmtPositionsLoading && <PositionsLoadingPlaceholder />}
              {advanced &&
                !lmtPositionsLoading &&
                filteredPositions &&
                closedPositions &&
                filteredPositions.length > 0 && (
                  <PositionList
                    positions={filteredPositions}
                    setUserHideClosedPositions={setUserHideClosedPositions}
                    userHideClosedPositions={userHideClosedPositions}
                  />
                )}
              {advanced &&
                !lmtPositionsLoading &&
                filteredPositions &&
                closedPositions &&
                filteredPositions.length === 0 && (
                  <ErrorContainer>
                    <ButtonPrimary
                      style={{
                        marginLeft: '20px',
                        marginBottom: '30px',
                        padding: '.5rem',
                        width: 'fit-content',
                        fontSize: '0.8rem',
                        borderRadius: '10px',
                        height: '30px',
                        lineHeight: '1',
                      }}
                      data-cy="join-pool-button"
                      id="join-pool-button"
                      as={Link}
                      to="/add/"
                    >
                      <Trans>Add New Position</Trans>
                    </ButtonPrimary>
                    <ThemedText.DeprecatedBody color={theme.textTertiary} textAlign="center">
                      {/*<InboxIcon strokeWidth={1} style={{ marginTop: '2em' }} /> */}
                      <div>
                        <Trans>Your liquidity positions will appear here.</Trans>
                      </div>
                    </ThemedText.DeprecatedBody>
                    {!showConnectAWallet && closedPositions.length > 0 && (
                      <ButtonText
                        style={{ marginTop: '.5rem' }}
                        onClick={() => setUserHideClosedPositions(!userHideClosedPositions)}
                      >
                        <Trans>Show closed positions</Trans>
                      </ButtonText>
                    )}
                    {showConnectAWallet && (
                      <TraceEvent
                        events={[BrowserEvent.onClick]}
                        name={InterfaceEventName.CONNECT_WALLET_BUTTON_CLICKED}
                        properties={{ received_swap_quote: false }}
                        element={InterfaceElementName.CONNECT_WALLET_BUTTON}
                      >
                        <ButtonPrimary
                          style={{ marginTop: '2em', marginBottom: '2em', padding: '8px 16px' }}
                          onClick={toggleWalletDrawer}
                        >
                          <Trans>Connect a wallet</Trans>
                        </ButtonPrimary>
                      </TraceEvent>
                    )}
                  </ErrorContainer>
                )}
            </MainContentWrapper>
            <HideSmall>{/*<CTACards /> */}</HideSmall>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
      {/*<SwitchLocaleLink /> */}
    </Trace>
  )
}
