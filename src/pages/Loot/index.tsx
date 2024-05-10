import { TransactionResponse } from '@ethersproject/abstract-provider'
import { useWeb3React } from '@web3-react/core'
import Column from 'components/Column'
import { FaqWrapper } from 'components/FAQ'
import LootFAQ from 'components/FAQ/LootFAQ'
import BoxModal from 'components/Loot/BoxModal'
import PointWarning from 'components/Loot/PointWarning'
import { MOBILE_MEDIA_BREAKPOINT, SMALL_MEDIA_BREAKPOINT, XLARGE_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import { useBRP } from 'hooks/useContract'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { Row } from 'nft/components/Flex'
import { useCallback, useEffect, useState } from 'react'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import styled from 'styled-components/macro'

import ItemImg from '../../assets/images/newItem7.webp'
import ItemImg2 from '../../assets/images/newItem8.webp'
import ItemImg3 from '../../assets/images/newItem9.webp'
import ItemImg4 from '../../assets/images/newItem10.webp'
import banner from '../../components/Leaderboard/banner.png'
import BoxesContainer from '../../components/Loot/BoxesContainer'
import InfoDescriptionSection from '../../components/Loot/InfoDescription'

import { firestore } from '../../firebaseConfig'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import ConnectWallet from 'components/ConnectWallet'

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
  height: 100px;
  max-width: 100%;
  position: relative;
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.sm}px) {
    margin-top: 16px;
    margin-left: 20px;
    margin-right: 20px;
    height: 288px;
  }
`
const Banner = styled.div<{ src: string }>`
  height: 100%;
  width: 100%;
  background-image: url(${({ src }) => src});
  background-position-y: center;
  background-size: cover;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.sm}px) {
    border-radius: 16px;
  }
`

const CollectionDescriptionSection = styled(Column)`
  position: relative;
  justify-content: center;
  border-bottom: 1px solid;
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

const LootPage = () => {
  const { account } = useWeb3React()
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

  const claimBoxesCallback = useCallback(async (passcode: number): Promise<TransactionResponse> => {
    if (!brp || !account) {
      throw new Error('BRP or account not available')
    }

    try {
      const gasLimit = 1000000
      const tx = await brp.claimBoxes(passcode, {
        from: account,
      });

      return tx as TransactionResponse
    } catch (error) {
      console.error(error, 'BRP instance is not available')
      throw error
    }
  }, [brp, account])

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
          const docRefFirstBox = doc(firestore, 'firstbox-checker', account);
          await setDoc(docRefFirstBox, {
            account: account,
            isFirstBoxUnlocked: true
          });
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

  const handleClaimBoxes = useCallback(async (passcode: number | null) => {
    if (passcode === null) return
    try {
      const res = await claimBoxesCallback(passcode)
      addTransaction(res, {
        type: TransactionType.CLAIM_BOXES,
        inputCurrencyId: '',
        outputCurrencyId: '',
      })
    } catch (error) {
      console.error('BRP.claimBoxes failed', error)
    }
  }, [claimBoxesCallback, addTransaction])

  const [isInConcatenatedAddresses, setIsInConcatenatedAddresses] = useState<boolean>(false)
  const [passcode, setPasscode] = useState<number | null>(null)


  useEffect(() => {
    if (!account) return
    const call = async () => {
      const docRef = doc(firestore, 'concatenated_addresses', account)

      const docSnap = await getDoc(docRef)
      console.log("IS this account VALID?", account, docSnap.exists())
      // const docRef1 = doc(firestore, 'concatenated_addresses', '0x817A10B23332573e1D1f1D04Aa24aCe7e72318ba')
      // const docSnap1 = await getDoc(docRef1)

      // const docRef2 = doc(firestore, 'concatenated_addresses', '0x2E6FFc4E321e3cD0f299661feCE9dC0Bc23B3403')
      // const docSnap2 = await getDoc(docRef2)

      // const docRef3 = doc(firestore, 'concatenated_addresses', '0x64dA461ECbAa3FEC3625F21b74a8c74394d501c9')
      // const docSnap3 = await getDoc(docRef3)

      // const docRef4 = doc(firestore, 'concatenated_addresses', '0x034cA3706D5894e135c045F9b6b91Fa7a6C1aa4d')
      // const docSnap4 = await getDoc(docRef4)

      if (docSnap.exists()) {
        setIsInConcatenatedAddresses(true)
        const code = docSnap.data().Passcode
        console.log("DATA", docSnap.data())
        setPasscode(code)
      } else {
        setIsInConcatenatedAddresses(false)
      }

      const docRefFirstBox = doc(firestore, 'firstbox-checker', account)
      const docSnapFirstBox = await getDoc(docRefFirstBox)
      if (docSnapFirstBox.exists()) {
        const isUnlocked = docSnapFirstBox.data().isFirstBoxUnlocked
        console.log("IS FIRST BOX UNLOCKED", isUnlocked)
        setIsFirstBoxUnlocked(isUnlocked)
      } else {
        await setDoc(docRefFirstBox, {
          account: account,
          isFirstBoxUnlocked: false
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
        // setItemDatas([])
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
      <CollectionContainer>
        <BannerWrapper>
          <Banner src={banner} />
        </BannerWrapper>
        <CollectionDescriptionSection>
          <Row gap="16" flexWrap="wrap">
            <InfoDescriptionSection
              title="Use and Unlock "
              description="Earn LMT and unlock treasure boxes"
              brpData={brpData}
              loading={loading}
            />
          </Row>
        </CollectionDescriptionSection>
        {showConnectAWallet ?
          <Row margin="auto">
            <ConnectWallet/>
          </Row>
          : 
          <CollectionDisplaySection>
            <PointWarning isInsufficient={isInsufficient} isInConcatenatedAddresses={isInConcatenatedAddresses} isClaimed={isClaimed} point={brpData?.pointForUnlocks} isNoBoxes={itemDatas.length < 1} />
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
            />
          </CollectionDisplaySection>
          }
        <FaqWrapper>
          <LootFAQ />
        </FaqWrapper>
      </CollectionContainer>
    </>
  )
}

export default LootPage
