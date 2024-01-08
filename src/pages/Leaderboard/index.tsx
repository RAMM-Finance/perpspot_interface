import { Trans } from '@lingui/macro'
import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, InterfaceEventName } from '@uniswap/analytics-events'
import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary } from 'components/Button'
import LeaderboardTable from 'components/Leaderboard/LeaderboardTable'
import Points from 'components/Leaderboard/Points'
import Referrals from 'components/Leaderboard/Referrals'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { client } from 'graphql/limitlessGraph/limitlessClients'
import { AddQuery } from 'graphql/limitlessGraph/queries'
import { useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const PageWrapper = styled.div`
  padding-top: 2vh;
  display: flex;
  flex-direction: column;
  width: 100%;
`
const LeaderboardWrapper = styled.div`
  border: solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 10px;
  width: 100%;
  margin-right: 0.125rem;
  margin-top: 0.125rem;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
`
const AchievementsWrapper = styled.div`
  // border: solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 10px;
  width: 100%;
  padding: 5px;
  height: 250px;
  padding-bottom: 20px;
`
const ReferralsWrapper = styled.div`
  // border: solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  margin-left: 0.125rem;
  margin-top: 0.125rem;
  width: 100%;
`

// const PointsWrapper = styled.div`
//   display: flex;
//   // border: solid ${({ theme }) => theme.backgroundOutline};
//   background-color: ${({ theme }) => theme.backgroundSurface};
//   border-radius: 10px;
//   width: 100%;
//   margin-left: 0.25rem;
//   margin-right: 0.25rem;
//   margin-bottom: 0.125rem;
//   padding: 5px;
//   height: fit-content;
// `

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 5px;
  width: 100%;
`
const Header = styled.div`
  padding-left: 20px;
  padding-top: 10px;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 82vh;
  width: 92.5%;
  align-items: start;
  padding-left: 7.5%;
  padding-top: 5px;
`
const PointsWrapper = styled.div`
  display: flex;
  justify-content: start;
  width: 90%;
  grid-column: span 2;
  margin-bottom: 1rem;
  margin-left: 7.5%;
  // border: solid 1px ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 7px;
`

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

export default function LeaderboardPage() {
  const { account, chainId } = useWeb3React()
  const toggleWalletDrawer = useToggleWalletDrawer()
  const showConnectAWallet = Boolean(!account)
  const [leaderboard, setLeaderboard] = useState<boolean>(true)

  const [addData, setAddData] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()

  useEffect(() => {
    // if (!trader || loading || !blockNumber || (lastBlockNumber && lastBlockNumber + 2 > blockNumber)) return
    if (!client || !AddQuery || loading || error) return
    const call = async () => {
      try {
        setLoading(true)

        const addQueryData = await client.query(AddQuery, {}).toPromise()

        setAddData(addQueryData)
        setLoading(false)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }
    call()
  }, [])
  console.log('data', addData?.data)

  return (
    <PageWrapper>
      <PointsWrapper>
        <Points />
      </PointsWrapper>
      <Container>
        <FilterWrapper>
          <Filter>
            <Selector onClick={() => setLeaderboard(true)} active={leaderboard}>
              <StyledSelectorText active={leaderboard}>Leaderboard</StyledSelectorText>
            </Selector>
            <Selector onClick={() => setLeaderboard(false)} active={!leaderboard}>
              <StyledSelectorText active={!leaderboard}>Referrals</StyledSelectorText>
            </Selector>
          </Filter>
        </FilterWrapper>
        {leaderboard ? (
          <LeaderboardWrapper>
            <LeaderboardTable />
          </LeaderboardWrapper>
        ) : (
          <ReferralsWrapper>
            {showConnectAWallet ? (
              <ErrorContainer style={{ paddingTop: '50px' }}>
                <TraceEvent
                  events={[BrowserEvent.onClick]}
                  name={InterfaceEventName.CONNECT_WALLET_BUTTON_CLICKED}
                  properties={{ received_swap_quote: false }}
                  element={InterfaceElementName.CONNECT_WALLET_BUTTON}
                >
                  <ButtonPrimary
                    style={{ width: '8vw', padding: '8px 8px', borderRadius: '10px' }}
                    onClick={toggleWalletDrawer}
                  >
                    <Trans>
                      <ThemedText.BodyPrimary fontWeight={800}>Connect wallet to view</ThemedText.BodyPrimary>{' '}
                    </Trans>
                  </ButtonPrimary>
                </TraceEvent>
              </ErrorContainer>
            ) : (
              <Referrals />
            )}
          </ReferralsWrapper>
        )}

        {/* <AchievementsWrapper>
          <ThemedText.SubHeader>
            <Header>Achievements</Header>
          </ThemedText.SubHeader>
          {showConnectAWallet ? (
            <ErrorContainer>
              <TraceEvent
                events={[BrowserEvent.onClick]}
                name={InterfaceEventName.CONNECT_WALLET_BUTTON_CLICKED}
                properties={{ received_swap_quote: false }}
                element={InterfaceElementName.CONNECT_WALLET_BUTTON}
              >
                <ButtonPrimary
                  style={{ width: '8vw', padding: '8px 8px', borderRadius: '10px' }}
                  onClick={toggleWalletDrawer}
                >
                  <Trans>
                    <ThemedText.BodyPrimary fontWeight={800}>Connect wallet to view</ThemedText.BodyPrimary>{' '}
                  </Trans>
                </ButtonPrimary>
              </TraceEvent>
            </ErrorContainer>
          ) : (
            <Achievements />
          )}
        </AchievementsWrapper> */}
      </Container>
    </PageWrapper>
  )
}
