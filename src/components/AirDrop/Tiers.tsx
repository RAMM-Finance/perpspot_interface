import { SmallButtonPrimary } from 'components/Button'
import { useStoredData } from 'components/Leaderboard/data'
import { addresses } from 'components/Leaderboard/LeaderboardTable'
import { RowStart } from 'components/Row'
import { SupportedChainId } from 'constants/chains'
import useSelectChain from 'hooks/useSelectChain'
import useSyncChainQuery from 'hooks/useSyncChainQuery'
import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { useAccount, useChainId } from 'wagmi'

import Tier1 from '../../assets/airdrop/arb_airdrop/Tier_1.png'
import Tier2 from '../../assets/airdrop/arb_airdrop/Tier_2.png'
import Tier3 from '../../assets/airdrop/arb_airdrop/Tier_3.png'
import Tier4 from '../../assets/airdrop/arb_airdrop/Tier_4.png'
import Tier5 from '../../assets/airdrop/arb_airdrop/Tier_5.png'
import Tier6 from '../../assets/airdrop/arb_airdrop/Tier_6.png'
import Tier7 from '../../assets/airdrop/arb_airdrop/Tier_7.png'
import Tier8 from '../../assets/airdrop/arb_airdrop/Tier_8.png'
import Tier9 from '../../assets/airdrop/arb_airdrop/Tier_9.png'
import Tier10 from '../../assets/airdrop/arb_airdrop/Tier_10.png'

const PointsEarnedWrapper = styled.div<{ blur?: boolean }>`
  width: fit-content;
  display: flex;
  justify-content: center;
  gap: 60px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  filter: ${({ blur }) => (blur ? 'blur(8px)' : 'none')};
  -webkit-filter: ${({ blur }) => (blur ? 'blur(8px)' : 'none')};
`

const PointWrapper = styled.div`
  display: flex;
  gap: 10px;
  padding: 20px;
  width: 250px;
  border-right: 1px solid ${({ theme }) => theme.backgroundOutline};
  &:nth-child(4, 8) {
    border-right: none;
  }
`

const TierWrapper = styled.div`
  width: 100%;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const TierLogoSectionWrapper = styled.div<{ blur?: boolean }>`
  padding: 50px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 80px;
  filter: ${({ blur }) => (blur ? 'blur(8px)' : 'none')};
  -webkit-filter: ${({ blur }) => (blur ? 'blur(8px)' : 'none')};
`

const TierLogoWrapper = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: ${({ active }) => (active ? '1' : '.4')};
`

const TierLogo = styled.img<{ active?: boolean }>`
  width: 100px;
  transition: 0.3s;
  :hover {
    background: ${({ active }) => (active ? 'radial-gradient(white, transparent 75%)' : 'none')};
  }
`

const TierIncorrectChain = styled.div<{ active?: boolean }>`
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 50%;
  display: ${({ active }) => (active ? 'flex' : 'none')};
`

const Tiers = () => {
  const chainId = useChainId()
  const account = useAccount().address
  const prevData = useStoredData(addresses)
  const isArb = SupportedChainId.ARBITRUM_ONE === chainId

  function SelectTier(numOfUsers: number, index: number) {
    const tier1 = numOfUsers
    const tier2 = Math.round(numOfUsers * 0.5)
    const tier3 = numOfUsers - Math.round(numOfUsers * 0.6)
    const tier4 = numOfUsers - Math.round(numOfUsers * 0.7)
    const tier5 = numOfUsers - Math.round(numOfUsers * 0.8)
    const tier6 = numOfUsers - Math.round(numOfUsers * 0.85)
    const tier7 = numOfUsers - Math.round(numOfUsers * 0.9)
    const tier8 = numOfUsers - Math.round(numOfUsers * 0.94)
    const tier9 = numOfUsers - Math.round(numOfUsers * 0.97)
    const tier10 = numOfUsers - Math.round(numOfUsers * 0.99)

    if (index <= tier1 && index > tier2) {
      return 1
    } else if (index <= tier2 && index > tier3) {
      return 2
    } else if (index <= tier3 && index > tier4) {
      return 3
    } else if (index <= tier4 && index > tier5) {
      return 4
    } else if (index <= tier5 && index > tier6) {
      return 5
    } else if (index <= tier6 && index > tier7) {
      return 6
    } else if (index <= tier7 && index > tier8) {
      return 7
    } else if (index <= tier8 && index > tier9) {
      return 8
    } else if (index <= tier9 && index > tier10) {
      return 9
    } else if (index <= tier10) {
      return 10
    } else {
      return 0
    }
  }

  const userData = useMemo(() => {
    if (!prevData || !chainId || !account) {
      return undefined
      // } else if (prevData && chainId !== 8453) {
      //   setLoading(false)
      //   return prevData
    } else {
      const totalUsers = prevData.length

      return prevData
        .filter((obj: any, index: any) => {
          return index === prevData.findIndex((o: any) => obj.trader === o.trader)
        })
        .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
        .map((user: any, index: number) => {
          const finalTier = SelectTier(totalUsers, index)
          return {
            ...user,
            rank: index + 1,
            tier: finalTier,
          }
        })
        .find((user: any) => user.trader === account)
    }
  }, [prevData, chainId, account])

  const tiers = [Tier1, Tier2, Tier3, Tier4, Tier5, Tier6, Tier7, Tier8, Tier9, Tier10]

  const userTier = useMemo(() => {
    if (!userData) return 0
    if (userData.totalPoints < 1000) {
      return 1
    }
    if (userData.totalPoints > 1000 && userData.totalPoints < 17000) {
      return Number(userData.totalPoints.toString().substring(0, 1))
    } else {
      return 10
    }
  }, [userData])

  const selectChain = useSelectChain()
  useSyncChainQuery()

  const onSelectChain = useCallback(
    async (targetChainId: SupportedChainId) => {
      await selectChain(targetChainId)
    },
    [selectChain]
  )

  function TopPercentage(tier: number | undefined) {
    if (!tier) return 0
    else if (tier === 1) {
      return 100
    } else if (tier === 2) {
      return 50
    } else if (tier === 3) {
      return 40
    } else if (tier === 4) {
      return 30
    } else if (tier === 5) {
      return 20
    } else if (tier === 6) {
      return 15
    } else if (tier === 7) {
      return 10
    } else if (tier === 8) {
      return 6
    } else if (tier === 9) {
      return 3
    } else if (tier === 10) {
      return 1
    } else {
      return 0
    }
  }

  return (
    <TierWrapper>
      <TierIncorrectChain active={!isArb}>
        <ThemedText.BodySecondary>Tier system only available on Arbitrum</ThemedText.BodySecondary>
        <SmallButtonPrimary onClick={() => onSelectChain(SupportedChainId.ARBITRUM_ONE)}>Switch</SmallButtonPrimary>
      </TierIncorrectChain>
      <RowStart marginLeft={'5rem'}>
        <ThemedText.MediumHeader fontSize={16} fontWeight={700}>
          Tier: {userData?.tier}
        </ThemedText.MediumHeader>
        <ThemedText.MediumHeader fontSize={16} fontWeight={700}>
          LMT Rank: {userData?.rank}
        </ThemedText.MediumHeader>
        {/* <ThemedText.MediumHeader fontSize={16} fontWeight={700}>
          Total LMT: {userData?.totalPoints}
        </ThemedText.MediumHeader> */}
        <ThemedText.MediumHeader fontSize={16} fontWeight={700}>
          My Percentage: Top {TopPercentage(userData?.tier)} %
        </ThemedText.MediumHeader>
      </RowStart>
      <TierLogoSectionWrapper blur={!isArb}>
        {tiers.map((tier, index) => (
          <TierLogoWrapper active={isArb ? index + 1 <= userData?.tier : isArb}>
            <TierLogo active={isArb ? index + 1 <= userData?.tier : isArb} src={tier} />
            <ThemedText.BodySecondary>Tier: {index + 1}</ThemedText.BodySecondary>
          </TierLogoWrapper>
        ))}
      </TierLogoSectionWrapper>
      {/* <PointsEarnedWrapper blur={!isArb}>
        <PointWrapper>
          <StateLabelText color="stateLabel" fontSize="14px" marginTop="7px">
            Adding Position(per $):
          </StateLabelText>
        </PointWrapper>
        <PointWrapper>
          <StateLabelText color="stateLabel" fontSize="14px" marginTop="7px">
            Open Interest(per $):
          </StateLabelText>
        </PointWrapper>
        <PointWrapper>
          <StateLabelText color="stateLabel" fontSize="14px" marginTop="7px">
            limWETH(per $ per day):
          </StateLabelText>
        </PointWrapper>
        <PointWrapper>
          <StateLabelText color="stateLabel" fontSize="14px" marginTop="7px">
            Advanced LP(per $ per day):
          </StateLabelText>
        </PointWrapper>
      </PointsEarnedWrapper>
      <PointsEarnedWrapper blur={!isArb}>
        <PointWrapper>
          <ThemedText.SubHeader color="textSecondary">10 points</ThemedText.SubHeader>
        </PointWrapper>
        <PointWrapper>
          <ThemedText.SubHeader color="textSecondary">15 points</ThemedText.SubHeader>
        </PointWrapper>
        <PointWrapper>
          <ThemedText.SubHeader color="textSecondary">5 points</ThemedText.SubHeader>
        </PointWrapper>
        <PointWrapper>
          <ThemedText.SubHeader color="textSecondary">100 points</ThemedText.SubHeader>
        </PointWrapper>
      </PointsEarnedWrapper> */}
    </TierWrapper>
  )
}

export default Tiers
