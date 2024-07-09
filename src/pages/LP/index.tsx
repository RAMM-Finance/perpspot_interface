import { Trans } from '@lingui/macro'
import { Trace } from '@uniswap/analytics'
import { InterfacePageName } from '@uniswap/analytics-events'
import { ButtonGray, ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import ConnectWallet from 'components/ConnectWallet'
import Footer from 'components/Footer'
import { Menu } from 'components/Menu'
import SimplePool from 'components/PoolSimple'
import V2PositionList, { V1PositionList } from 'components/PositionList/V2'
import { RowBetween, RowFixed } from 'components/Row'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { isSupportedChain } from 'constants/chains'
import { useRebalanceCallback } from 'hooks/useRebalanceCallback'
import { useLmtV1LpPositions, useLmtV2LpPositions } from 'hooks/useV3Positions'
import { useEffect, useMemo } from 'react'
import { useState } from 'react'
import { AlertTriangle } from 'react-feather'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useUserHideClosedPositions } from 'state/user/hooks'
import styled, { css, useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { PositionDetails, V2PositionDetails } from 'types/position'
import { useAccount, useChainId } from 'wagmi'

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

const PageWrapper = styled.div`
  padding: 30px 8px 0px;
  max-width: 1200px;
  width: 100%;
  height: 100%;
  margin-bottom: 20px;
  /* min-width: ${({ theme }) => `${theme.breakpoint.sm}px`}; */
  margin: auto;
  /* ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    max-width: 500px;
  `};  */

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

const MainContentWrapper = styled.main`
  position: relative;
  width: 100%;
  /* min-height: 300px; */
  min-width: 500px;
  margin: auto;
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
`

export function PositionsLoadingPlaceholder() {
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

export default function LpPositions() {
  const account = useAccount().address
  const chainId = useChainId()

  // const toggleWalletDrawer = useToggleWalletDrawer()
  const location = useLocation()
  const navigate = useNavigate()
  const isAdvanced = location.pathname.substring(0, 15) === '/pools/advanced'
  const isSimple = location.pathname.substring(0, 15) === '/pools/simple'
  const [advanced, setAdvanced] = useState<any>(() => {
    const localData = localStorage.getItem('data')
    return localData ? !!localData : false
  })

  useEffect(() => {
    if (isAdvanced) setAdvanced(true)
    if (isSimple) setAdvanced(false)
    return
  }, [isAdvanced, isSimple, navigate])

  const theme = useTheme()
  const [userHideClosedPositions, setUserHideClosedPositions] = useUserHideClosedPositions()

  const { positions: v2Positions, loading: v2Loading } = useLmtV2LpPositions(account)
  const { positions: v1Positions, loading: v1Loading } = useLmtV1LpPositions(account)
  // console.log('zeke:1', v2Loading, v1Loading, v2Positions, v1Positions)

  const [openV2Positions, closedV2Positions] = v2Positions?.reduce<[V2PositionDetails[], V2PositionDetails[]]>(
    (acc, p) => {
      acc[p.fee === 0 ? 1 : 0].push(p)
      return acc
    },
    [[], []]
  ) ?? [[], []]
  const [openV1Positions, closedV1Positions] = v1Positions?.reduce<[PositionDetails[], PositionDetails[]]>(
    (acc, p) => {
      acc[p.fee === 0 ? 1 : 0].push(p)
      return acc
    },
    [[], []]
  ) ?? [[], []]

  const filteredV1Positions = useMemo(
    () => [...openV1Positions, ...(userHideClosedPositions ? [] : closedV1Positions)],
    [closedV1Positions, openV1Positions, userHideClosedPositions]
  )

  const filteredV2Positions = useMemo(
    () => [...openV2Positions, ...(userHideClosedPositions ? [] : closedV2Positions)],
    [closedV2Positions, openV2Positions, userHideClosedPositions]
  )

  const rebalance = useRebalanceCallback()

  if (!isSupportedChain(chainId)) {
    return <WrongNetworkCard />
  }

  const showConnectAWallet = Boolean(!account)

  return (
    <>
      <Trace page={InterfacePageName.POOL_PAGE} shouldLogImpression>
        <PageWrapper>
          <FilterWrapper>
            <Filter>
              <Selector
                onClick={() => {
                  setAdvanced(false)
                  localStorage.removeItem('data')
                  navigate('/pools/simple')
                }}
                active={!advanced}
              >
                <StyledSelectorText active={!advanced}>Simple</StyledSelectorText>
              </Selector>
              <Selector
                onClick={() => {
                  localStorage.setItem('data', 'advanced')
                  setAdvanced(true)
                  navigate('/pools/advanced')
                }}
                active={advanced}
              >
                <StyledSelectorText active={advanced}>Advanced</StyledSelectorText>
              </Selector>
              {account?.toLowerCase() === '0xD0A0584Ca19068CdCc08b7834d8f8DF969D67bd5'.toLowerCase() && (
                <Selector
                  onClick={() => {
                    rebalance()
                  }}
                  active={advanced}
                >
                  <StyledSelectorText active={false}>Rebalance</StyledSelectorText>
                </Selector>
              )}
            </Filter>
          </FilterWrapper>
          <AutoColumn gap="lg" justify="center">
            <AutoColumn gap="lg" style={{ width: '100%', marginTop: '20px' }}>
              {!advanced && <SimplePool />}
              {/* {advanced && (v1Loading || v2Loading) && (
                <MainContentWrapper>
                  <PositionsLoadingPlaceholder />
                </MainContentWrapper>
              )} */}
              {advanced && filteredV2Positions && filteredV2Positions.length > 0 && (
                <MainContentWrapper>
                  <V2PositionList v2positions={filteredV2Positions} loading={v2Loading} />
                </MainContentWrapper>
              )}
              {advanced && filteredV1Positions && filteredV1Positions.length > 0 && (
                <MainContentWrapper>
                  <V1PositionList positions={filteredV1Positions} />
                </MainContentWrapper>
              )}
              {advanced && filteredV2Positions && filteredV2Positions.length === 0 && (
                <MainContentWrapper>
                  <ErrorContainer>
                    <ButtonPrimary
                      style={{
                        marginBottom: '30px',
                        marginTop: '30px',
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
                      to="/add/v2"
                    >
                      <Trans>Add New V2 Position</Trans>
                    </ButtonPrimary>
                    <ThemedText.DeprecatedBody color={theme.textTertiary} textAlign="center">
                      {/*<InboxIcon strokeWidth={1} style={{ marginTop: '2em' }} /> */}
                      <div>
                        <Trans>Your liquidity positions will appear here.</Trans>
                      </div>
                    </ThemedText.DeprecatedBody>
                    \{showConnectAWallet && <ConnectWallet />}
                  </ErrorContainer>
                </MainContentWrapper>
              )}
            </AutoColumn>
          </AutoColumn>
        </PageWrapper>
      </Trace>
      <Footer />
    </>
  )
}
