import { useWeb3React } from '@web3-react/core'
import LMTFAQ from 'components/FAQ/LMTFAQ'
import Footer from 'components/Footer'
import LeaderboardTable from 'components/Leaderboard/LeaderboardTable'
import Points from 'components/Leaderboard/Points'
import { SMALL_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components/macro'
import { BREAKPOINTS, ThemedText } from 'theme'

import banner from '../../components/Leaderboard/banner.png'

const PageWrapper = styled.div`
  padding-top: 2vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-width: 800px;
  margin: auto;
  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
    min-width: 360px;
  }
`
const LeaderboardWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 10px;
  width: 100%;
  margin-right: 0.125rem;
  margin-top: 0.125rem;
`
// Achievements
const AchievementsWrapper = styled.div`
  width: 100%;
`
const AchievementsBoxWrapper = styled.div`
  display: flex;
  gap: 20px;
  margin: 18px 0;
  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
    flex-direction: column;
    gap: 10px;
    height: 100%;
  }
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
  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
    width: 85%;
    height: 30px;
    gap: 0;
  }
`
const AchievementTitle = styled(ThemedText.HeadlineSmall)`
  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
    font-size: 16px !important;
  }
`

const AchievementDesc = styled(ThemedText.BodyPrimary)`
  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
    font-size: 12px !important;
  }
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
  margin-top: 30px;
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
  /* height: 82vh; */
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
  border-radius: 10px;
  padding: 7px 0;
  margin: auto;
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
  @media only screen and (max-width: ${BREAKPOINTS.xs}px) {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`
const Banner = styled.img`
  width: 100%;
  height: 450px;
  opacity: 0.6;
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

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}px) {
    position: static;
  }
`

const BannerText = styled.h1`
  font-size: 62px;
  letter-spacing: 4px;
  margin-bottom: 10px;
  white-space: nowrap;
  color: ${({ theme }) => theme.accentTextLightPrimary};
  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
    font-size: 36px;
  }
`

const BannerSubText = styled.h3`
  margin-top: 6px;
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.textSecondary};
  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
    font-size: 16px;
  }
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
  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
    font-size: 14px;
    width: 180px;
    padding: 10px;
  }
`

const BannerBtnWrapper = styled.div`
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
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

  // useEffect(() => {
  //   // if (!trader || loading || !blockNumber || (lastBlockNumber && lastBlockNumber + 2 > blockNumber)) return
  //   if (!client || !AddQuery || loading || error) return
  //   const call = async () => {
  //     try {
  //       setLoading(true)
  //       let addQueryData

  //       if (chainId === SupportedChainId.ARBITRUM_ONE)
  //         addQueryData = await client.query(AddQuery, {}).toPromise()
  //       else if (chainId === SupportedChainId.BASE)
  //         addQueryData = await clientBase.query(AddQuery, {}).toPromise()

  //       setAddData(addQueryData)
  //       setLoading(false)
  //     } catch (error) {
  //       console.log(error)
  //       setError(error)
  //       setLoading(false)
  //     }
  //   }
  //   call()
  // }, [])

  return (
    <>
      <Banner src={banner} alt="banner_backgroundImg" />
      <PageWrapper>
        <BannerWrapper>
          <BannerTextWrapper>
            <BannerText>LMT Season 1</BannerText>
            <BannerSubText>Points are updated everyday</BannerSubText>
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
                <AchievementTitle color="textSecondary">Trade your way up</AchievementTitle>
                <AchievementDesc lineHeight={1.5}>
                  The more you trade, the higher your trade LMT rewards are.
                </AchievementDesc>
              </AchievementsBox>
              <AchievementsBox>
                <AchievementTitle color="textSecondary">LP to earn yield + LMT</AchievementTitle>
                <AchievementDesc lineHeight={1.5}>
                  Earn LMT by holding LLP or collecting fees as an advanced LP <br />
                </AchievementDesc>
              </AchievementsBox>
              <AchievementsBox>
                <AchievementTitle color="textSecondary">Refer to earn</AchievementTitle>
                <AchievementDesc lineHeight={1.5}>
                  Refer others and earn a portion of your referees' LMT
                </AchievementDesc>
              </AchievementsBox>
            </AchievementsBoxWrapper>
          </AchievementsWrapper>
          <LeaderboardWrapper>
            <LeaderboardTable />
          </LeaderboardWrapper>
          <FaqWrapper>
            <LMTFAQ />
          </FaqWrapper>
        </Container>
      </PageWrapper>
      <Footer />
    </>
  )
}
