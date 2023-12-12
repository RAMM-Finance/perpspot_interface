import { Trans } from '@lingui/macro'
import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, InterfaceEventName } from '@uniswap/analytics-events'
import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary } from 'components/Button'
import Achievements from 'components/Leaderboard/Achievements'
import LeaderboardTable from 'components/Leaderboard/LeaderboardTable'
import Points from 'components/Leaderboard/Points'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const PageWrapper = styled.div`
  padding-top: 2vh;
  display: flex;
  width: 100%;
`
const LeaderboardWrapper = styled.div`
  border: solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 10px;
  width: 60vw;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  height: 700px;
`
const AchievementsWrapper = styled.div`
  border: solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 10px;
  width: 20vw;
  margin-right: 0.25rem;
  margin-left: 0.25rem;
  padding: 5px;
  height: fit-content;
  padding-bottom: 20px;
`

const PointsWrapper = styled.div`
  border: solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 10px;
  width: 20vw;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  padding: 5px;
  padding-bottom: 20px;
  height: fit-content;
`

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50%;
  padding: 5px;
`
const Header = styled.div`
  padding-left: 20px;
  padding-top: 10px;
`

const LeaderboardPage = () => {
  const { account, chainId } = useWeb3React()
  const toggleWalletDrawer = useToggleWalletDrawer()
  const showConnectAWallet = Boolean(!account)

  return (
    <PageWrapper>
      <AchievementsWrapper>
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
      </AchievementsWrapper>
      <LeaderboardWrapper>
        <LeaderboardTable />
      </LeaderboardWrapper>
      <PointsWrapper>
        <ThemedText.SubHeader>
          <Header>Points</Header>
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
          <Points />
        )}
      </PointsWrapper>
    </PageWrapper>
  )
}

export default LeaderboardPage
