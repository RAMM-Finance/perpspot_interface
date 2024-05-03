import { TransactionResponse } from '@ethersproject/abstract-provider'
import { useWeb3React } from '@web3-react/core'
import Column from 'components/Column'
import FAQBox, { FaqWrapper } from 'components/FAQ'
import BoxModal from 'components/NewItems/BoxModal'
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
import BoxesContainer from '../../components/NewItems/BoxesContainer'
import InfoDescriptionSection from '../../components/NewItems/InfoDescription'

const CollectionContainer = styled(Column)`
  width: 100%;
  align-self: start;
  will-change: width;
`

const CollectionDisplaySection = styled(Row)`
  width: 100%;
  padding: 1rem;
  align-items: flex-start;
  position: relative;
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
}

const NewItemsListPage = () => {
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
  })

  const [itemDatas, setItemDatas] = useState<TBoxData[]>([])

  const [showModal, setShowModal] = useState(false)

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

  const handleUnlockBox = useCallback(
    async (index: number) => {
      if (brp && account) {
        try {
          const response = await unlockBoxCallback()
          addTransaction(response, {
            type: TransactionType.UNLOCK_Box,
            inputCurrencyId: '',
            outputCurrencyId: '',
          })
          setHiddenCards((prevState) => [...prevState, index])
          setLoading(false)
        } catch (error) {
          setLoading(false)
          console.error(error, 'BRP instance is not available')
        }
      }
    },
    [brp, account, unlockBoxCallback, addTransaction, setHiddenCards]
  )

  const handleAddBox = useCallback(async () => {
    if (brp && account) {
      try {
        setLoading(true)
        const response = await addBoxCallback()
        // console.log('addboxcallback', response)
        addTransaction(response, {
          type: TransactionType.ADD_Box,
          inputCurrencyId: '',
          outputCurrencyId: '',
        })
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.error(error, 'BRP instance is not available')
      }
    }
  }, [brp, account, addBoxCallback, addTransaction])

  useEffect(() => {
    if (brp && account && blockNumber) {
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

          let numTotalBoxes = totalBoxes?.toNumber()
          if (!freeBoxUsed && numTotalBoxes === 0) {
            numTotalBoxes = 1
          }
          const totalLMTPoint = lastRecordedTradePoints.add(lastRecordedLpPoints).add(lastRecordedPoints)
          const totalLMTString = totalLMTPoint?.toString()

          const numtotalUnlockableBoxes = totalUnlockableBoxes[0]?.toNumber()

          const lockedBoxes = Array(numTotalBoxes)
            .fill(true)
            .map((_, index) => index + 1 > numtotalUnlockableBoxes)
          const newData = Array.from({ length: numTotalBoxes }, (_, index) => {
            const imgNumber = index % itemImages.length
            return {
              id: `#${index + 1}`,
              img: itemImages[imgNumber],
              info: `Limitless test ${index + 1}`,
              isLocked: lockedBoxes[index],
              index,
            }
          })
          // console.log('blockNumber', numTotalBoxes, numtotalUnlockableBoxes, lmtRequiredPerUnlock, totalLMTString)
          // console.log('blockNumber', numTotalBoxes, freeBoxUsed)
          setBRPData({
            totalBoxes: numTotalBoxes,
            totalUnlockableBoxes: numtotalUnlockableBoxes,
            lmtRequiredPerUnlock: lmtRequiredPerUnlock?.toString(),
            totalLMT: totalLMTString,
            NZTRageHigh: NZTRageHigh?.toNumber(),
            NZTRageRow: NZTRageRow?.toNumber(),
          })
          setItemDatas(newData)
          setHiddenCards([])
          setLoading(false)
        } catch (error) {
          setBRPData({
            totalBoxes: 0,
            totalUnlockableBoxes: 0,
            lmtRequiredPerUnlock: '0',
            totalLMT: '0',
            NZTRageRow: 0,
            NZTRageHigh: 0,
          })
          setHiddenCards([])
          setItemDatas([])
          setLoading(false)
          console.log(error, 'get brp data error')
        }
      }
      call()
    }
  }, [brp, account, blockNumber, handleUnlockBox, setHiddenCards])

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
  console.log('itemDatas', itemDatas)

  return (
    <>
      <BoxModal
        isOpen={showModal}
        hnadleColoseModal={handleCloseModal}
        handleUnlockBox={handleUnlockBox}
        modalData={curModalData}
        brpData={brpData}
      />
      <CollectionContainer>
        <BannerWrapper>
          <Banner src={banner} />
        </BannerWrapper>
        <CollectionDescriptionSection>
          <Row gap="16">
            <InfoDescriptionSection
              title="Use and Unlock "
              description="Earn LMT and unlock treasure boxes"
              brpData={brpData}
              loading={loading}
            />
          </Row>
        </CollectionDescriptionSection>
        <CollectionDisplaySection>
          {/* <InfiniteScroll
          next={() => {console.log("")}}
          hasMore={false}
          loader={false}
          dataLength={20}
          style={{ overflow: 'unset', height: '100%' }}
          > */}
          <BoxesContainer
            itemDatas={itemDatas}
            handleUnlockBox={handleUnlockBox}
            handleAddBox={handleAddBox}
            loading={loading}
            hiddenCards={hiddenCards}
            handleShowModal={handleShowModal}
            account={account}
          />
          {/* </InfiniteScroll> */}
        </CollectionDisplaySection>
        <FaqWrapper>
          <FAQBox />
        </FaqWrapper>
      </CollectionContainer>
    </>
  )
}

export default NewItemsListPage
