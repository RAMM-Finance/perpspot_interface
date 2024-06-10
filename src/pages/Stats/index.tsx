import styled from 'styled-components/macro'
import { BREAKPOINTS, ThemedText } from 'theme'
import { SMALL_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import TVLChart from 'components/Charts/TVLChart'
import VolumeChart from 'components/Charts/VolumeChart'
import FeeChart from 'components/Charts/FeeChart'
import TradeChart from 'components/Charts/TradeChart'
import UniqueUsersChart from 'components/Charts/UniqueUsersChart'
import { useEffect, useMemo, useState } from 'react'
import useVaultBalance from 'hooks/useVaultBalance'
import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from 'constants/chains'
import { getDecimalAndUsdValueData } from 'hooks/useUSDPrice'
import { useBRP, useLimweth } from 'hooks/useContract'
import { formatDollar } from 'utils/formatNumbers'
import { useStatsData } from 'hooks/useStatsData'
import { TvlByDay, VolumeByDay, UniqueUsers } from 'hooks/useStatsData'

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

interface StyledTVLChartProps {
  tvlByDay: TvlByDay[] | undefined
}

interface StyledVolumeChartProps {
  volumeByDay: VolumeByDay[] | undefined
}

interface StyledUniqueUsersChartProps {
  volumeByDay: UniqueUsers[] | undefined
}


const StyledTVLChart = styled(TVLChart)<StyledTVLChartProps>`
  flex: 1 0 50%;
  box-sizing: border-box;
  height: 400px;
`

const StyledVolumeChart = styled(VolumeChart)<StyledVolumeChartProps>`
  flex: 1 0 50%;
  box-sizing: border-box;
  height: 400px;
`

const StyledTradeChart = styled(TradeChart)<StyledVolumeChartProps>`
  flex: 1 0 50%;
  box-sizing: border-box;
  height: 400px;
`

const StyledUniqueUsersChart = styled(UniqueUsersChart)<StyledUniqueUsersChartProps>`
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

  const pool = 100000000

  const { chainId } = useWeb3React()

  const { result: statsData, loading: statsLoading } = useStatsData()
  const { result: vaultBal, loading: balanceLoading } = useVaultBalance()

  const [limWethBal, setLimWethBal] = useState<number | null>(null)
  const limWeth = useLimweth()

  const [totalUsers, setTotalUsers] = useState<number | null>(null)
  const brp = useBRP()
  
  useEffect(() => {
    const fetch = async () => {
      if (brp) {
        const users = await brp.getUsers()
        setTotalUsers(users.length)
      }  
    }
    fetch()
  }, [brp])


  useEffect(() => {
    const getBalance = async (limWeth: any) => {
      const [limWethBal, decimals, queryResult] = await Promise.all([
        limWeth?.tokenBalance(),
        limWeth?.decimals(),
        getDecimalAndUsdValueData(chainId, '0x4200000000000000000000000000000000000006')
      ])

      const tokenBalance = parseFloat(limWethBal.toString()) / 10 ** decimals
      const price = parseFloat(queryResult?.lastPriceUSD) // BASE WETH PRICE
      setLimWethBal(price * tokenBalance)
    }
    if (chainId === SupportedChainId.BASE) {
      getBalance(limWeth)
    }
  }, [chainId, limWeth])

  const poolsInfo = useMemo(() => {
    if (statsData && statsData.totalTvl && statsData.totalVolume && !balanceLoading) {
      if (chainId === SupportedChainId.BASE) {
        return {
          tvl:
            statsData.totalTvl +
            Number(vaultBal) +
            Number(limWethBal || 0),
          volume: statsData.totalVolume
        }
      } else {
        return {
          tvl:
            statsData.totalTvl +
            Number(vaultBal),
          volume: statsData.totalVolume
        }
      }
    } else {
      return null
    }
  }, [chainId, statsData, vaultBal, balanceLoading, limWethBal])

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
                <StatTitle color="textSecondary">TVL</StatTitle>
                <StatDesc lineHeight={1.5}>
                {!poolsInfo || !poolsInfo?.tvl ? '-' : poolsInfo?.tvl ? formatDollar({ num: poolsInfo.tvl, digits: 0 }) : '0'}
                </StatDesc>
                {/* <StatDelta>
                {`${volumeDelta > 0 ? '+' : ''}${volumeDelta.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
                </StatDelta> */}
              </StatsBox>
              <StatsBox>
                <StatTitle color="textSecondary">Total Volumes</StatTitle>
                <StatDesc lineHeight={1.5}>
                {!poolsInfo || !poolsInfo?.volume ? '-' : poolsInfo?.volume ? formatDollar({ num: poolsInfo.volume + 175000, digits: 0 }) : '0'}
                </StatDesc>
                {/* <StatDelta>
                {`${feesDelta > 0 ? '+' : ''}${feesDelta.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
                </StatDelta> */}
              </StatsBox>
              <StatsBox>
                <StatTitle color="textSecondary">Fee</StatTitle>
                <StatDesc lineHeight={1.5}>
                {pool.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </StatDesc>
                {/* <StatDelta>
                {`${poolDelta > 0 ? '+' : ''}${poolDelta.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
                </StatDelta> */}
              </StatsBox>
              <StatsBox>
                <StatTitle color="textSecondary">Total Users</StatTitle>
                <StatDesc lineHeight={1.5}>
                {!totalUsers ? '-' : totalUsers.toLocaleString()}
                </StatDesc>
                {/* <StatDelta>
                {`${usersDelta > 0 ? '+' : ''}${usersDelta.toLocaleString('en-US')}`}
                </StatDelta> */}
              </StatsBox>
              {/* <StatsBox>
                <StatTitle color="textSecondary">Open Interest</StatTitle>
                <StatDesc lineHeight={1.5}>
                {openInterest.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </StatDesc>
                <StatDelta>
                {`${interestDelta > 0 ? '+' : ''}${interestDelta.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
                </StatDelta>
              </StatsBox> */}
            </StatsBoxWrapper>
          </StatsWrapper>
          <ChartWrapper>
            {/* <StyledTVLChart
              tvlByDay={statsData?.tvlByDay} 
            /> */}
            <StyledVolumeChart
              volumeByDay={statsData?.volumeByDay}
            />
            <StyledTradeChart
              volumeByDay={statsData?.volumeByDay}
            />
            <StyledUniqueUsersChart
              uniqueUsers={statsData?.uniqueUsers}
            />
            {/* <StyledFeeChart /> */}
          </ChartWrapper>
        </Container>
      </PageWrapper>
    </>
  )
}
