import { useWeb3React } from '@web3-react/core'
import Footer from 'components/Footer'
import LeaderboardTable from 'components/Leaderboard/LeaderboardTable'
import Points from 'components/Leaderboard/Points'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { client } from 'graphql/limitlessGraph/limitlessClients'
import { AddQuery } from 'graphql/limitlessGraph/queries'
import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'react-feather'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import bannerIBG from '../../components/Leaderboard/bannerIBG.png'

const PageWrapper = styled.div`
  padding-top: 2vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-width: 800px;
  margin: auto;
`
const LeaderboardWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
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
// Achievements
const AchievementsWrapper = styled.div`
  width: 100%;
  height: 250px;
`
const AchievementsBoxWrapper = styled.div`
  display: flex;
  gap: 20px;
  margin: 18px 0;
`
const AchievementsBox = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  border: ${({ theme }) => `1px solid ${theme.accentAction}`};
  border-radius: 12px;
  height: 160px;
  padding: 16px;
  gap: 15px;
`

const PriceBox = styled.div`
  display: flex;
  justify-content: space-between;
`

const ReferralsWrapper = styled.div`
  // border: solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  margin-left: 0.125rem;
  margin-top: 0.125rem;
  width: 100%;
`

const FaqWrapper = styled.div`
  margin-top: 50px;
  margin-right: auto;
  margin-left: auto;
  width: 48%;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
`

const FaqElement = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  :hover {
    cursor: pointer;
    opacity: 75%;
  }
`

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 5px;
  width: 100%;
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
  margin-top: 15px;
  margin-bottom: 1rem;
  margin-left: 6%;
  // border: solid 1px ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  // background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 7px 0;
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

/* Banner */
const BannerWrapper = styled.div`
  position: relative;
  margin-top: 16px;
  height: 400px;
  margin: auto;
  width: 88%;
  border-radius: 12px;
  padding: 16px;
  background-position: center;
  background-size: cover;
  /* background-image: linear-gradient(to bottom, rgba(7, 7, 7, 0.5) 40%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0) 100%), url(${bannerIBG}); */
`
const BannerIBG = styled.img`
  width: 100%;
  height: 100%;
  opacity: 0.4;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  opacity: cover;
`

const BannerTextWrapper = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin-left: -5px;
`

const BannerText = styled.h1`
  font-size: 62px;
  letter-spacing: 4px;
  margin-bottom: 10px;
  white-space: nowrap;
  color: ${({ theme }) => theme.accentTextLightPrimary};
`

const BannerBtn = styled.button`
  background-color: ${({ theme }) => theme.accentActionSoft};
  color: ${({ theme }) => theme.accentTextLightPrimary};
  padding: 10px 20px;
  text-align: center;
  white-space: nowrap;
  border: none;
  cursor: pointer;
  width: 235px;
  font-size: 18px;
  border-radius: 12px;
  transition: 150ms ease background-color;
  &:hover {
    background-color: ${({ theme }) => theme.accentTextDarkPrimary};
  }
`

const BannerBtnWrapper = styled.div`
  margin-top: 15px;
  display: flex;
  gap: 25px;
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

  return (
    <>
      <PageWrapper>
        <BannerWrapper>
          <BannerIBG src={bannerIBG} alt="banner_backgroundImg" />
          <BannerTextWrapper>
            <BannerText>LMT Season 1</BannerText>
            <BannerBtnWrapper>
              <NavLink to="/referral">
                <BannerBtn>Join Points Program</BannerBtn>
              </NavLink>
              <NavLink to="https://limitless.gitbook.io/limitless/tokenomics-and-roadmap/lmt">
                <BannerBtn>Find out more</BannerBtn>
              </NavLink>
            </BannerBtnWrapper>
          </BannerTextWrapper>
        </BannerWrapper>
        <PointsWrapper>
          <Points />
        </PointsWrapper>
        <Container>
          <AchievementsWrapper>
            {/*<ThemedText.SubHeader>Active Achievements</ThemedText.SubHeader>*/}
            <AchievementsBoxWrapper>
              <AchievementsBox>
                <ThemedText.HeadlineSmall color="textSecondary">Trade your way up</ThemedText.HeadlineSmall>
                <ThemedText.BodyPrimary lineHeight={1.5}>
                  The more you trade, the higher your trade LMT rewards are. 
                </ThemedText.BodyPrimary>
                {/*<PriceBox>
                  <ThemedText.PriceSmall color="textSecondary" fontWeight={300} display="flex">
                    +4pts /
                    <ThemedText.PriceSmall fontWeight={300} color="textTertiary" marginLeft="4px">
                      dollar
                    </ThemedText.PriceSmall>
                  </ThemedText.PriceSmall>
                  <ThemedText.PriceSmall color="textSecondary" fontWeight={600} letterSpacing={1}>
                    perday
                  </ThemedText.PriceSmall>
                </PriceBox>*/}
              </AchievementsBox>
              <AchievementsBox>
                <ThemedText.HeadlineSmall color="textSecondary">LP to earn yield + LMT</ThemedText.HeadlineSmall>
                <ThemedText.BodyPrimary lineHeight={1.5}>
                  Earn LMT by holding LLP or collecting fees as an advanced LP <br /> 
                </ThemedText.BodyPrimary>
                {/*<PriceBox>
                  <ThemedText.PriceSmall color="textSecondary" fontWeight={300} display="flex">
                    +4pts /
                    <ThemedText.PriceSmall fontWeight={300} color="textTertiary" marginLeft="4px">
                      dollar
                    </ThemedText.PriceSmall>
                  </ThemedText.PriceSmall>
                  <ThemedText.PriceSmall color="textSecondary" fontWeight={600} letterSpacing={1}>
                    perday
                  </ThemedText.PriceSmall>
                </PriceBox>*/}
              </AchievementsBox>
              <AchievementsBox>
                <ThemedText.HeadlineSmall color="textSecondary">Refer to earn</ThemedText.HeadlineSmall>
                <ThemedText.BodyPrimary lineHeight={1.5}>
                  Refer others and earn a portion of your referees' LMT
                </ThemedText.BodyPrimary>
                {/*<PriceBox>
                  <ThemedText.PriceSmall color="textSecondary" fontWeight={300} display="flex">
                    +4pts /
                    <ThemedText.PriceSmall fontWeight={300} color="textTertiary" marginLeft="4px">
                      dollar
                    </ThemedText.PriceSmall>
                  </ThemedText.PriceSmall>
                  <ThemedText.PriceSmall color="textSecondary" fontWeight={600} letterSpacing={1}>
                    perday
                  </ThemedText.PriceSmall>
                </PriceBox>*/}
              </AchievementsBox>
            </AchievementsBoxWrapper>
          </AchievementsWrapper>
          {/*<FilterWrapper>
            <Filter>
              <Selector onClick={() => setLeaderboard(true)} active={leaderboard}>
                <StyledSelectorText active={leaderboard}>Leaderboard</StyledSelectorText>
              </Selector>
              <Selector onClick={() => setLeaderboard(false)} active={!leaderboard}>
                <StyledSelectorText active={!leaderboard}>Referrals</StyledSelectorText>
              </Selector>
            </Filter>
          </FilterWrapper>*/}
          <LeaderboardWrapper>
            <LeaderboardTable />
          </LeaderboardWrapper> 
          {/*leaderboard ? (
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
          )*/}
          <FaqWrapper>
            <FaqElement>
              <a
                href="https://limitless.gitbook.io/limitless/tokenomics-and-roadmap/lmt"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ThemedText.BodySecondary fontSize={15} fontWeight={800}>
                  Earning LMT
                </ThemedText.BodySecondary>
              </a>
              <ArrowUpRight size="20" />
            </FaqElement>{' '}
            <ThemedText.BodyPrimary fontSize={15} fontWeight={800}>
              Read our LMT documentation to better understand how to earn LMT.
            </ThemedText.BodyPrimary>
          </FaqWrapper>
        </Container>
      </PageWrapper>
      <Footer />
    </>
  )
}
