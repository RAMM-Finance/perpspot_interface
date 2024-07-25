import { TransactionResponse } from '@ethersproject/abstract-provider'
// import { ConnectButton } from '@rainbow-me/rainbowkit'
import BoxModal from 'components/AirDrop/BoxModal'
import { StateLabelText } from 'components/AirDrop/InfoItemStats'
import Column from 'components/Column'
import { FaqWrapper } from 'components/FAQ'
import LootFAQ from 'components/FAQ/LootFAQ'
import { useStoredData } from 'components/Leaderboard/data'
import { RowStart } from 'components/Row'
import { MOBILE_MEDIA_BREAKPOINT, SMALL_MEDIA_BREAKPOINT, XLARGE_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import { SupportedChainId } from 'constants/chains'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useBRP } from 'hooks/useContract'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { Row } from 'nft/components/Flex'
import { BannerBtn, BannerBtnWrapper, BannerSubText, BannerText, BannerTextWrapper } from 'pages/Leaderboard'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
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
import ItemImg from '../../assets/images/newItem7.webp'
import ItemImg2 from '../../assets/images/newItem8.webp'
import ItemImg3 from '../../assets/images/newItem9.webp'
import ItemImg4 from '../../assets/images/newItem10.webp'
import banner from '../../components/AirDrop/banner_air.png'
import InfoDescriptionSection from '../../components/AirDrop/InfoDescription'
import { addresses } from '../../components/Leaderboard/LeaderboardTable'
import { firestore } from '../../firebaseConfig'

const CollectionContainer = styled(Column)`
  width: 100%;
  align-self: start;
  will-change: width;
`

const CollectionDisplaySection = styled(Column)`
  width: 100%;
  padding: 1rem;
  align-items: flex-start;
`

const BannerWrapper = styled.div`
  height: 400px;
  max-width: 100%;
  position: relative;
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.sm}px) {
    margin-top: 16px;
    margin-left: 20px;
    margin-right: 20px;
    height: 400px;
  }
`
const Banner = styled.img`
  width: 90vw;
  height: 400px;
  opacity: 0.6;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  object-fit: cover;
  margin-left: 5vw;
`

const CollectionDescriptionSection = styled(Column)`
  position: relative;
  justify-content: center;
  border-bottom: 1px solid;
  margin-left: 3rem;
  margin-right: 3rem;

  border-color: ${({ theme }) => theme.backgroundInteractive};
  @media screen and (min-width: ${XLARGE_MEDIA_BREAKPOINT}) {
    padding-left: 48px;
    padding-right: 48px;
  }

  @media screen and (max-width: ${XLARGE_MEDIA_BREAKPOINT}) {
    padding-left: 26px;
    padding-right: 26px;
  }

  @media screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    padding-left: 20px;
    padding-right: 20px;
  }

  @media screen and (max-width: ${MOBILE_MEDIA_BREAKPOINT}) {
    padding-left: 16px;
    padding-right: 16px;
  }
`

export type TBoxData = {
  id: string
  img: string
  info: string
  isLocked: boolean
  index: number
}

export type TBRPData = {
  totalBoxes: number
  totalUnlockableBoxes: number
  lmtRequiredPerUnlock: string
  totalLMT: string
  NZTRageRow: number
  NZTRageHigh: number
  pointForUnlocks: number
}

const AirDropPage = () => {
  const account = useAccount().address
  const chainId = useChainId()
  // const account = '0x127f723220aed8b7c89e56988c559cd6d1aa60b1'

  const blockNumber = useBlockNumber()

  const itemImages = [ItemImg, ItemImg2, ItemImg3, ItemImg4]

  const brp = useBRP()

  const [brpData, setBRPData] = useState<TBRPData>({
    totalBoxes: 0,
    totalUnlockableBoxes: 0,
    lmtRequiredPerUnlock: '0',
    totalLMT: '0',
    NZTRageRow: 0,
    NZTRageHigh: 0,
    pointForUnlocks: 0,
  })

  const [itemDatas, setItemDatas] = useState<TBoxData[]>([])

  const [showModal, setShowModal] = useState(false)
  const [isInsufficient, setIsInsufficient] = useState(true)

  const [curModalData, setCurModalData] = useState<TBoxData>({
    id: '',
    img: '',
    info: '',
    isLocked: false,
    index: 0,
  })

  const [loading, setLoading] = useState(true)

  const [hiddenCards, setHiddenCards] = useState<number[]>([])
  const addTransaction = useTransactionAdder()

  const [isFirstBoxUnlocked, setIsFirstBoxUnlocked] = useState<boolean>(true)

  const unlockBoxCallback = useCallback(async (): Promise<TransactionResponse> => {
    if (!brp || !account) {
      throw new Error('BRP or account not available')
    }

    try {
      const gasLimit = 1000000
      const tx = await brp.unlockBox({
        gasLimit,
        from: account,
      })

      return tx as TransactionResponse
    } catch (error) {
      console.error(error, 'BRP instance is not available')
      throw error
    }
  }, [brp, account])

  const addBoxCallback = useCallback(async (): Promise<TransactionResponse> => {
    if (!brp || !account) {
      throw new Error('BRP or account not available')
    }

    try {
      const gasLimit = 1000000
      const tx = await brp.addBox({
        gasLimit,
        from: account,
      })

      return tx as TransactionResponse
    } catch (error) {
      console.error(error, 'BRP instance is not available')
      throw error
    }
  }, [brp, account])

  const claimBoxesCallback = useCallback(
    async (passcode: number): Promise<TransactionResponse> => {
      if (!brp || !account) {
        throw new Error('BRP or account not available')
      }

      try {
        const gasLimit = 1000000
        const tx = await brp.claimBoxes(passcode, {
          from: account,
        })

        // const { result: reserve1, loading: loading1 } = useSingleCallResult(brp, 'claimBoxes', [
        //   account ?? undefined,
        // ])

        return tx as TransactionResponse
      } catch (error) {
        console.error(error, 'BRP instance is not available')
        throw error
      }
    },
    [brp, account]
  )

  const handleUnlockBox = useCallback(
    async (index?: number) => {
      try {
        const response = await unlockBoxCallback()
        addTransaction(response, {
          type: TransactionType.UNLOCK_Box,
          inputCurrencyId: '',
          outputCurrencyId: '',
        })

        if (account) {
          const docRefFirstBox = doc(firestore, 'firstbox-checker', account)
          await setDoc(docRefFirstBox, {
            account,
            isFirstBoxUnlocked: true,
          })
          setIsFirstBoxUnlocked(true)
        }

        if (index !== undefined && index > -1) setHiddenCards((prevState) => [...prevState, index])
      } catch (error) {
        console.error(error, 'BRP instance is not available')
      }
    },
    [addTransaction, unlockBoxCallback]
  )

  const handleAddBox = useCallback(async () => {
    try {
      const response = await addBoxCallback()
      addTransaction(response, {
        type: TransactionType.ADD_Box,
        inputCurrencyId: '',
        outputCurrencyId: '',
      })
    } catch (error) {
      console.error(error, 'BRP instance is not available')
    }
  }, [addBoxCallback, addTransaction])

  const handleClaimBoxes = useCallback(
    async (passcode: number | null) => {
      try {
        if (passcode === null) throw new Error('Passcode is null')
        const res = await claimBoxesCallback(passcode)
        addTransaction(res, {
          type: TransactionType.CLAIM_BOXES,
          inputCurrencyId: '',
          outputCurrencyId: '',
        })
      } catch (error) {
        console.error('BRP.claimBoxes failed', error)
      }
    },
    [claimBoxesCallback, addTransaction]
  )

  const [isInConcatenatedAddresses, setIsInConcatenatedAddresses] = useState<boolean>(false)
  const [passcode, setPasscode] = useState<number | null>(null)

  useEffect(() => {
    if (!account) return
    const call = async () => {
      const docRef = doc(firestore, 'concatenated_addresses_v2', account.toLowerCase())
      // const docRef2 = doc(firestore, 'concatenated_addresses_v2', '0x3e6b87FF2168d15794A865D09A6716415e7DbeCf'.toLowerCase())
      const docSnap = await getDoc(docRef)
      // const docSnap2 = await getDoc(docRef2)

      if (docSnap.exists()) {
        setIsInConcatenatedAddresses(true)
        const code = docSnap.data().Passcode
        console.log('CODE!!', code)
        setPasscode(code)
      } else {
        setIsInConcatenatedAddresses(false)
      }

      const docRefFirstBox = doc(firestore, 'firstbox-checker', account)
      const docSnapFirstBox = await getDoc(docRefFirstBox)
      if (docSnapFirstBox.exists()) {
        const isUnlocked = docSnapFirstBox.data().isFirstBoxUnlocked
        setIsFirstBoxUnlocked(isUnlocked)
      } else {
        await setDoc(docRefFirstBox, {
          account,
          isFirstBoxUnlocked: false,
        })
        setIsFirstBoxUnlocked(false)
      }
    }
    call()
  }, [account])

  const [isClaimed, setIsClaimed] = useState<boolean>(false)

  useEffect(() => {
    if (!brp || !account || !blockNumber) return setLoading(false)
    const call = async () => {
      try {
        const freeBoxUsed = await brp.freeBoxUsed(account)

        const totalBoxes = await brp.numBoxes(account)

        const totalUnlockableBoxes = await brp.claimableBoxes(account)
        const lmtRequiredPerUnlock = await brp.pointPerUnlocks()

        const lastRecordedTradePoints = await brp.lastRecordedTradePoints(account)
        const lastRecordedLpPoints = await brp.lastRecordedLpPoints(account)
        const lastRecordedPoints = await brp.lastRecordedPoints(account)

        const NZTRageRow = await brp.rangeLow()
        const NZTRageHigh = await brp.rangeHigh()

        const pointsUsedForUnlocks = await brp.pointsUsedForUnlocks(account)

        let numTotalBoxes = totalBoxes?.toNumber()
        if (!freeBoxUsed && numTotalBoxes === 0) {
          numTotalBoxes = 0
        }
        const totalLMTPoint = lastRecordedTradePoints.add(lastRecordedLpPoints).add(lastRecordedPoints)
        const totalLMTString = totalLMTPoint?.toString()

        const numtotalUnlockableBoxes = totalUnlockableBoxes[0]?.toNumber()
        const numPointsUsedForUnlocks = pointsUsedForUnlocks?.toNumber()
        // console.log('poinstUsedForNewBoxes', numPointsUsedForUnlocks, pointsUsedForUnlocks)

        const isClaimed: boolean = await brp.claimed(account)

        const isInsufficient = numPointsUsedForUnlocks > totalLMTPoint.toNumber()

        const lockedBoxes = Array(numTotalBoxes)
          .fill(true)
          .map((_, index) => index + 1 > numtotalUnlockableBoxes)
        const newData = Array.from({ length: numTotalBoxes }, (_, index) => {
          const imgNumber = index % itemImages.length
          return {
            id: `#${index + 1}`,
            img: itemImages[imgNumber],
            info: `Box ${index + 1}`,
            isLocked: lockedBoxes[index],
            index,
          }
        })
        setIsClaimed(isClaimed)
        setBRPData({
          totalBoxes: numTotalBoxes,
          totalUnlockableBoxes: numtotalUnlockableBoxes,
          lmtRequiredPerUnlock: lmtRequiredPerUnlock?.toString(),
          totalLMT: totalLMTString,
          NZTRageHigh: NZTRageHigh?.toNumber(),
          NZTRageRow: NZTRageRow?.toNumber(),
          pointForUnlocks: numPointsUsedForUnlocks,
        })
        setIsInsufficient(isInsufficient)
        setItemDatas(newData)
        setHiddenCards([])
        setLoading(false)
      } catch (error) {
        setHiddenCards([])
        setItemDatas([])
        setLoading(false)
        console.log(error, 'get brp data error')
      }
    }
    call()
  }, [brp, account, blockNumber])
  const handleShowModal = useCallback((modalData: TBoxData) => {
    setShowModal(true)
    setCurModalData(modalData)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setCurModalData({
      id: '',
      img: '',
      info: '',
      isLocked: false,
      index: 0,
    })
  }, [])

  const showConnectAWallet = Boolean(!account)

  const prevData = useStoredData(addresses)

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

  return (
    <>
      <BoxModal
        isOpen={showModal}
        handleCloseModal={handleCloseModal}
        handleUnlockBox={handleUnlockBox}
        isInsufficient={isInsufficient}
        modalData={curModalData}
        brpData={brpData}
      />
      <Banner src={banner} alt="banner_backgroundImg" />
      <BannerWrapper>
        <BannerTextWrapper>
          <BannerText>Use and Unlock</BannerText>
          <BannerSubText>Redeem rewards as you use Limitless</BannerSubText>
          <BannerBtnWrapper>
            <NavLink target="_blank" to="https://limitless.gitbook.io/limitless/incentives-and-tokenomics/use-and-loot">
              <BannerBtn>Find out more</BannerBtn>
            </NavLink>
          </BannerBtnWrapper>
        </BannerTextWrapper>
      </BannerWrapper>
      <CampaignWrapper>
        <RowStart marginLeft={'5rem'}>
          <ThemedText.MediumHeader fontSize={16} fontWeight={700}>
            Campaigns
          </ThemedText.MediumHeader>
        </RowStart>
        <CollectionContainer>
          <CollectionDescriptionSection>
            <Row gap="16" flexWrap="wrap">
              <InfoDescriptionSection description="NZT Campaign Ended" brpData={brpData} loading={loading} />
            </Row>
          </CollectionDescriptionSection>
          {!showConnectAWallet && chainId !== SupportedChainId.BASE && (
            <CollectionDisplaySection>
              {/* <PointWarning
              isInsufficient={isInsufficient}
              isInConcatenatedAddresses={isInConcatenatedAddresses}
              isClaimed={isClaimed}
              point={brpData?.pointForUnlocks}
              isNoBoxes={itemDatas.length < 1}
            />
            <BoxesContainer
              itemDatas={itemDatas}
              handleUnlockBox={handleUnlockBox}
              handleAddBox={handleAddBox}
              handleClaimBoxes={handleClaimBoxes}
              passcode={passcode}
              loading={loading}
              hiddenCards={hiddenCards}
              handleShowModal={handleShowModal}
              account={account}
              isInsufficient={isInsufficient}
              isInConcatenatedAddresses={isInConcatenatedAddresses}
              isClaimed={isClaimed}
              isFirstBoxUnlocked={isFirstBoxUnlocked}
            /> */}
            </CollectionDisplaySection>
          )}
        </CollectionContainer>
      </CampaignWrapper>
      {chainId === SupportedChainId.ARBITRUM_ONE && (
        <TierWrapper>
          <RowStart marginLeft={'5rem'}>
            <ThemedText.MediumHeader fontSize={16} fontWeight={700}>
              Tier: 2
            </ThemedText.MediumHeader>
            <ThemedText.MediumHeader fontSize={16} fontWeight={700}>
              LMT Rank: {userData?.rank}
            </ThemedText.MediumHeader>
          </RowStart>
          <TierLogoSectionWrapper>
            {tiers.map((tier, index) => (
              <TierLogoWrapper active={index + 1 <= 2}>
                <TierLogo src={tier} />
                <ThemedText.BodySecondary>Tier: {index + 1}</ThemedText.BodySecondary>
              </TierLogoWrapper>
            ))}
          </TierLogoSectionWrapper>
          <PointsEarnedWrapper>
            <PointWrapper>
              <ThemedText.SubHeader color="textSecondary">Adding Position(per $):</ThemedText.SubHeader>
            </PointWrapper>
            <PointWrapper>
              <ThemedText.SubHeader color="textSecondary">Open Interest(per $):</ThemedText.SubHeader>
            </PointWrapper>
            <PointWrapper>
              <ThemedText.SubHeader color="textSecondary">limWETH(per $ per day):</ThemedText.SubHeader>
            </PointWrapper>
            <PointWrapper>
              <ThemedText.SubHeader color="textSecondary">Advanced LP(per $ per day):</ThemedText.SubHeader>
            </PointWrapper>
          </PointsEarnedWrapper>
          <PointsEarnedWrapper>
            <PointWrapper>
              <StateLabelText>10 points</StateLabelText>
            </PointWrapper>
            <PointWrapper>
              <StateLabelText>15 points</StateLabelText>
            </PointWrapper>
            <PointWrapper>
              <StateLabelText>5 points</StateLabelText>
            </PointWrapper>
            <PointWrapper>
              <StateLabelText>100 points</StateLabelText>
            </PointWrapper>
          </PointsEarnedWrapper>
        </TierWrapper>
      )}

      <FaqWrapper>
        <LootFAQ />
      </FaqWrapper>
    </>
  )
}

export default AirDropPage

const PointsEarnedWrapper = styled.div`
  width: fit-content;
  margin-left: 5rem;
  display: flex;
  gap: 60px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
`

const PointWrapper = styled.div`
  display: flex;
  gap: 10px;
  padding: 20px;
  width: 350px;
  border-right: 1px solid ${({ theme }) => theme.backgroundOutline};
  &:nth-child(4, 8) {
    border-right: none;
  }
`

const TierWrapper = styled.div`
  width: 100%;
`

const CampaignWrapper = styled.div`
  width: 100%;
`

const TierLogoSectionWrapper = styled.div`
  padding: 50px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 80px;
`

const TierLogoWrapper = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: ${({ active }) => (active ? '1' : '.5')};
`

const TierLogo = styled.img`
  width: 100px;
  transition: 0.3s;
  :hover {
    background: radial-gradient(white, transparent 75%);
  }
`
