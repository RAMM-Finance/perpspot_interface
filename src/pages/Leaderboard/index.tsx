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
import { Filter, FilterWrapper, Selector, StyledSelectorText } from 'pages/Swap/tradeModal'
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
  width: 70%;
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
  border: solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 10px;
  margin-left: 0.125rem;
  margin-top: 0.125rem;
  width: 70%;
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
  height: 85vh;
  align-items: start;
  padding-left: 20%;
  padding-top: 5px;
`
const PointsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  grid-column: span 2;
  margin-bottom: 0.25rem;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 7px;
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
          <Filter onClick={() => setLeaderboard(!leaderboard)}>
            <Selector active={leaderboard}>
              <StyledSelectorText lineHeight="20px" active={leaderboard}>
                Leaderboard
              </StyledSelectorText>
            </Selector>
            <Selector active={!leaderboard}>
              <StyledSelectorText lineHeight="20px" active={!leaderboard}>
                Referrals
              </StyledSelectorText>
            </Selector>
          </Filter>
        </FilterWrapper>
        {leaderboard ? (
          <LeaderboardWrapper>
            <LeaderboardTable />
          </LeaderboardWrapper>
        ) : (
          <ReferralsWrapper>
            <ThemedText.SubHeader>
              <Header>Referrals</Header>
            </ThemedText.SubHeader>
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
