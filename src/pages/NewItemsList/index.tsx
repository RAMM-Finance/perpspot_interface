import { TransactionResponse } from '@ethersproject/abstract-provider'
import { useWeb3React } from '@web3-react/core'
import { LightCard } from 'components/Card'
import Column from 'components/Column'
import FAQBox, { FaqWrapper } from 'components/FAQ'
import Modal from 'components/Modal'
import { ModalItemStats } from 'components/NewItems/InfoItemStats'
import { MOBILE_MEDIA_BREAKPOINT, SMALL_MEDIA_BREAKPOINT, XLARGE_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import { useBRP } from 'hooks/useContract'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { Row } from 'nft/components/Flex'
import { useCallback, useEffect, useState } from 'react'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import ItemImg from '../../assets/images/newItem.png'
import banner from '../../components/Leaderboard/banner.png'
import BoxesContainr, { TBRPData } from '../../components/NewItems/BoxesContainr'
import InfoDescriptionSection from '../../components/NewItems/InfoDescription'

const StyledMediaImg = styled.img<{
  // imageLoading: boolean
  $aspectRatio?: string
  $hidden?: boolean
}>`
  width: 40%;
  height: 50%;
  /* aspect-ratio: ${({ $aspectRatio }) => $aspectRatio}; */
  aspect-ratio: 16/9;
  transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} transform`};
  will-change: transform;
  object-fit: contain;
  border-radius: 12px;
`

const ModalWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 0.5rem;
  // height: 100%;
  padding: 2rem;
  border-radius: 20px;
`
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

export const ModalActionButton = styled(ThemedText.BodySecondary)<{
  isDisabled: boolean
}>`
  position: absolute;
  width: 180px;
  top: -15px;
  right: 20px;
  height: 45px;
  display: flex;
  align-items: center;
  padding: 8px 0px;
  color: ${({ theme, isDisabled }) => (isDisabled ? theme.textPrimary : theme.accentTextLightPrimary)};
  background: ${({ theme, isDisabled }) => (isDisabled ? theme.backgroundInteractive : theme.accentAction)};
  transition: ${({ theme }) =>
    `${theme.transition.duration.medium} ${theme.transition.timing.ease} bottom, ${theme.transition.duration.medium} ${theme.transition.timing.ease} visibility`};
  will-change: transform;
  border-radius: 8px;
  justify-content: center;
  font-weight: 600 !important;
  font-size: 18px !important;
  line-height: 16px;
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'pointer')};

  &:before {
    background-size: 100%;
    border-radius: inherit;

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    content: '';
  }

  &:hover:before {
    background-color: ${({ theme, isDisabled }) => !isDisabled && theme.stateOverlayHover};
  }

  &:active:before {
    background-color: ${({ theme, isDisabled }) => !isDisabled && theme.stateOverlayPressed};
  }
`

const ModalInfoWrapper = styled(LightCard)`
  position: relative;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  border: none;
  border-radius: 0px;
  width: 100%;
  border-bottom: 3px solid ${({ theme }) => theme.searchOutline};
  justify-content: flex-start;
  background: ${({ theme }) => theme.backgroundSurface};
  padding: 0.75rem;
`

const NewItemsListPage = () => {
  const { account } = useWeb3React()
  const blockNumber = useBlockNumber()

  const brp = useBRP()
  const [brpData, setBRPData] = useState<TBRPData>({
    totalBoxes: 0,
    totalUnlockableBoxes: 0,
    lmtRequiredPerUnlock: '0',
    totalLMT: '0',
  })
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(true)

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

  useEffect(() => {
    if (brp && account && blockNumber) {
      if (!brpData) setLoading(true)
      console.log('blockNumber', blockNumber)
      const call = async () => {
        try {
          const totalBoxes = await brp.numBoxes(account)
          const totalUnlockableBoxes = await brp.claimableBoxes(account)
          const lmtRequiredPerUnlock = await brp.pointPerUnlocks()

          const lastRecordedTradePoints = await brp.lastRecordedTradePoints(account)
          const lastRecordedLpPoints = await brp.lastRecordedLpPoints(account)
          const lastRecordedPoints = await brp.lastRecordedPoints(account)

          const totalLMTPoint = lastRecordedTradePoints.add(lastRecordedLpPoints).add(lastRecordedPoints)
          const totalLMTString = totalLMTPoint.toString()

          // console.log('total value call',  lastRecordedTradePoints.toString(), lastRecordedLpPoints.toString(), lastRecordedPoints.toString())
          // console.log('blockNumber', totalBoxes.toNumber(), totalUnlockableBoxes[0].toNumber, lmtRequiredPerUnlock)
          setBRPData({
            totalBoxes: totalBoxes.toNumber(),
            totalUnlockableBoxes: totalUnlockableBoxes[0]?.toNumber(),
            lmtRequiredPerUnlock: lmtRequiredPerUnlock.toString(),
            totalLMT: totalLMTString,
          })
          setHiddenCards([])
          // console.log('get Totalboxes', brpData, hiddenCards, totalBoxes)
          setLoading(false)
        } catch (error) {
          setBRPData({
            totalBoxes: 0,
            totalUnlockableBoxes: 0,
            lmtRequiredPerUnlock: '0',
            totalLMT: '0',
          })
          setHiddenCards([])
          setLoading(false)
          console.log(error, 'get brp data error')
        }
      }
      call()
    }
  }, [brp, account, handleUnlockBox, setHiddenCards, blockNumber])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  return (
    <>
      {/* <Modal
        isOpen={showModal}
        minHeight={55}
        maxHeight={750}
        maxWidth={1200}
        $scrollOverlay={true}
        onDismiss={() => handleCloseModal()}
      >
        <ModalWrapper>
          <StyledMediaImg src={ItemImg} />
          <ModalInfoWrapper>
            <ModalActionButton isDisabled={false}>Unlock</ModalActionButton>
            <ThemedText.LargeHeader color="textSecondary">TreasureBox</ThemedText.LargeHeader>
            <ModalItemStats />
          </ModalInfoWrapper>
        </ModalWrapper>
      </Modal> */}
      <CollectionContainer>
        {/* Banner, Info title description section */}
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
          <BoxesContainr
            brpData={brpData}
            handleUnlockBox={handleUnlockBox}
            loading={loading}
            hiddenCards={hiddenCards}
            handleShowModal={setShowModal}
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
