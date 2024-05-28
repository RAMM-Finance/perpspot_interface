import styled from 'styled-components/macro'
import { BREAKPOINTS, ThemedText } from 'theme'
import { SMALL_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import VolumeChart from 'components/Charts/VolumeChart'
import FeeChart from 'components/Charts/FeeChart'

const PageWrapper = styled.div`
  padding-top: 2vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
`

const BannerWrapper = styled.div`
  position: relative;
  margin: 10px;
  height: 100px;
  width: 100%;
  border-radius: 12px;
  padding: 10px;
  @media only screen and (max-width: ${BREAKPOINTS.xs}px) {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
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
  font-size: 28px;
  letter-spacing: 4px;
  margin-bottom: 10px;
  white-space: nowrap;
  color: ${({ theme }) => theme.accentTextLightPrimary};
  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
    font-size: 14px;
  }
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

const StatsWrapper = styled.div`
  width: 100%;
`
const StatsBoxWrapper = styled.div`
  display: flex;
  gap: 20px;
  margin: 18px 0;
  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
    flex-direction: column;
    gap: 10px;
    height: 100%;
  }
`
const StatsBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  flex-direction: column;
  border: ${({ theme }) => `1px solid ${theme.accentAction}`};
  border-radius: 12px;
  height: 130px;
  padding: 16px;
  // gap: 7.5px;
  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
    width: 85%;
    height: 30px;
    gap: 0;
  }
`

const StatTitle = styled(ThemedText.BodyPrimary)`
  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
    font-size: 12px !important;
  }
`

const StatDesc = styled(ThemedText.HeadlineSmall)`
  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
    font-size: 16px !important;
  }
`

const StatDelta = styled(ThemedText.Caption)`
  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
  font-size: 8px !important;
}
`

const ChartWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
`

const StyledVolumeChart = styled(VolumeChart)`
  flex: 1 0 50%;
  box-sizing: border-box;
  height: 400px;
`

const StyledFeeChart = styled(FeeChart)`
  flex: 1 0 50%;
  box-sizing: border-box;
  height: 400px;
`


export default function StatsPage() {

  const totalVolume = 1000000
  const totalFees = 10000
  const pool = 100000000
  const totalUsers = 1000
  const openInterest = 100000

  const volumeDelta = 4000
  const feesDelta = 200
  const poolDelta = -30000
  const usersDelta = 30
  const interestDelta = -2200


  return (
    <>
      <PageWrapper>
        <BannerWrapper>
        <BannerTextWrapper>
          <BannerText>
            Limitless Analytics
          </BannerText>
        </BannerTextWrapper>
        </BannerWrapper>
        <Container>
          <StatsWrapper>
            {/*<ThemedText.SubHeader>Active Stats</ThemedText.SubHeader>*/}
            <StatsBoxWrapper>
              <StatsBox>
                <StatTitle color="textSecondary">Total Volume</StatTitle>
                <StatDesc lineHeight={1.5}>
                  {totalVolume.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </StatDesc>
                <StatDelta>
                {`${volumeDelta > 0 ? '+' : ''}${volumeDelta.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
                </StatDelta>
              </StatsBox>
              <StatsBox>
                <StatTitle color="textSecondary">Total Fees</StatTitle>
                <StatDesc lineHeight={1.5}>
                {totalFees.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </StatDesc>
                <StatDelta>
                {`${feesDelta > 0 ? '+' : ''}${feesDelta.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
                </StatDelta>
              </StatsBox>
              <StatsBox>
                <StatTitle color="textSecondary">Pool</StatTitle>
                <StatDesc lineHeight={1.5}>
                {pool.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </StatDesc>
                <StatDelta>
                {`${poolDelta > 0 ? '+' : ''}${poolDelta.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
                </StatDelta>
              </StatsBox>
              <StatsBox>
                <StatTitle color="textSecondary">Total Users</StatTitle>
                <StatDesc lineHeight={1.5}>
                {totalUsers.toLocaleString()}
                </StatDesc>
                <StatDelta>
                {`${usersDelta > 0 ? '+' : ''}${usersDelta.toLocaleString('en-US')}`}
                </StatDelta>
              </StatsBox>
              <StatsBox>
                <StatTitle color="textSecondary">Open Interest</StatTitle>
                <StatDesc lineHeight={1.5}>
                {openInterest.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </StatDesc>
                <StatDelta>
                {`${interestDelta > 0 ? '+' : ''}${interestDelta.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
                </StatDelta>
              </StatsBox>
            </StatsBoxWrapper>
          </StatsWrapper>
          <ChartWrapper>
            <StyledVolumeChart />
            <StyledFeeChart />
          </ChartWrapper>
        </Container>
      </PageWrapper>
    </>
  )
}
