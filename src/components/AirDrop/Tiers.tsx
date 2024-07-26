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
import Tier11 from '../../assets/airdrop/arb_airdrop/Tier_11.png'
import Tier12 from '../../assets/airdrop/arb_airdrop/Tier_12.png'
import Tier13 from '../../assets/airdrop/arb_airdrop/Tier_13.png'
import Tier14 from '../../assets/airdrop/arb_airdrop/Tier_14.png'
import Tier15 from '../../assets/airdrop/arb_airdrop/Tier_15.png'
import Tier16 from '../../assets/airdrop/arb_airdrop/Tier_16.png'
import Tier17 from '../../assets/airdrop/arb_airdrop/Tier_17.png'
import { StateLabelText } from './InfoItemStats'

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

  const userData = useMemo(() => {
    if (!prevData || !chainId || !account) {
      return undefined
      // } else if (prevData && chainId !== 8453) {
      //   setLoading(false)
      //   return prevData
    } else {
      return prevData
        .filter((obj: any, index: any) => {
          return index === prevData.findIndex((o: any) => obj.trader === o.trader)
        })
        .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
        .map((user: any, index: number) => {
          return {
            ...user,
            rank: index + 1,
          }
        })
        .find((user: any) => user.trader === account)
    }
  }, [prevData, chainId, account])
  const tiers = [
    Tier1,
    Tier2,
    Tier3,
    Tier4,
    Tier5,
    Tier6,
    Tier7,
    Tier8,
    Tier9,
    Tier10,
    Tier11,
    Tier12,
    Tier13,
    Tier14,
    Tier15,
    Tier16,
    Tier17,
  ]

  const selectChain = useSelectChain()
  useSyncChainQuery()

  const onSelectChain = useCallback(
    async (targetChainId: SupportedChainId) => {
      await selectChain(targetChainId)
    },
    [selectChain]
  )
  return (
    <TierWrapper>
      <TierIncorrectChain active={!isArb}>
        <ThemedText.BodySecondary>Tier system only available on Arbitrum</ThemedText.BodySecondary>
        <SmallButtonPrimary onClick={() => onSelectChain(SupportedChainId.ARBITRUM_ONE)}>Switch</SmallButtonPrimary>
      </TierIncorrectChain>
      <RowStart marginLeft={'5rem'}>
        <ThemedText.MediumHeader fontSize={16} fontWeight={700}>
          Tier: 2
        </ThemedText.MediumHeader>
        <ThemedText.MediumHeader fontSize={16} fontWeight={700}>
          LMT Rank: {userData?.rank}
        </ThemedText.MediumHeader>
      </RowStart>
      <TierLogoSectionWrapper blur={!isArb}>
        {tiers.map((tier, index) => (
          <TierLogoWrapper active={isArb ? index + 1 <= 2 : isArb}>
            <TierLogo active={isArb ? index + 1 <= 2 : isArb} src={tier} />
            <ThemedText.BodySecondary>Tier: {index + 1}</ThemedText.BodySecondary>
          </TierLogoWrapper>
        ))}
      </TierLogoSectionWrapper>
      <PointsEarnedWrapper blur={!isArb}>
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
      </PointsEarnedWrapper>
    </TierWrapper>
  )
}

export default Tiers
