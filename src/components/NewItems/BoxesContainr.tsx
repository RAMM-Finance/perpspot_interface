import { Row } from 'nft/components/Flex'
import { useEffect, useState } from 'react'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'

import ItemImg from '../../assets/images/newItem.png'
import ItemImg2 from '../../assets/images/newItem2.webp'
import ItemImg3 from '../../assets/images/newItem3.webp'
import ItemImg4 from '../../assets/images/newItem4.webp'
import ItemImg5 from '../../assets/images/newItem5.webp'
import ItemImg6 from '../../assets/images/newItem6.webp'
import { CardContainer, LoadingCardContainer } from './CardContainer'

const InfiniteScrollWrapperCss = css`
  margin: 0 16px;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(calc(50% - 8px), 1fr));

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.sm}px) {
    gap: 8px;
    margin: 0 20px;
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    grid-template-columns: repeat(auto-fill, minmax(calc(33.33333% - 8px), 1fr));
    gap: 12px;
    margin: 0 26px;
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.lg}px) {
    gap: 16px;
    margin: 0 48px;
    grid-template-columns: repeat(auto-fill, minmax(calc(33.33333% - 12px), 1fr));
  }

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.xl}px) {
    gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(calc(25% - 16px), 1fr));
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.xxl}px) {
    gap: 22px;
    grid-template-columns: repeat(auto-fill, minmax(calc(20% - 16px), 1fr));
  }

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.xxxl}px) {
    grid-template-columns: repeat(auto-fill, minmax(calc(20% - 50px), 1fr));
  }
`

const InfiniteScrollWrapper = styled.div`
  ${InfiniteScrollWrapperCss}
`

const BoxesDisplaySection = styled(Row)`
  width: 100%;
  padding: 1rem;
  align-items: flex-start;
  position: relative;
`

export type TBRPData = {
  totalBoxes: number
  totalUnlockableBoxes: number
  lmtRequiredPerUnlock: string
  totalLMT: string
}

interface IBoxesContainerProps {
  brpData: TBRPData
  handleUnlockBox: (index: number) => void
  loading: boolean
  hiddenCards: number[]
  handleShowModal: (isShowModal: boolean) => void
}

interface BoxData {
  id: string
  img: string
  info: string
  isLocked: boolean
}

const BoxesContainr = ({ brpData, handleUnlockBox, loading, hiddenCards, handleShowModal }: IBoxesContainerProps) => {
  const { totalBoxes, totalUnlockableBoxes } = brpData
  const itemImages = [ItemImg, ItemImg2, ItemImg3, ItemImg4, ItemImg5, ItemImg6]

  const [itemData, setItemData] = useState<BoxData[]>([])

  useEffect(() => {
    // Generate an array of booleans to represent whether each box is locked or not
    const lockedBoxes = Array(totalBoxes)
      .fill(true)
      .map((_, index) => index + 1 > totalUnlockableBoxes)

    const newData = Array.from({ length: totalBoxes }, (_, index) => {
      // const isLocked = index + 1 <= totalUnlockableBoxes;
      const randomImgNumber = Math.floor(Math.random() * 6)
      return {
        id: `#${index + 1}`,
        img: itemImages[randomImgNumber],
        info: `Limitless test ${index + 1}`,
        isLocked: lockedBoxes[index],
      }
    })

    setItemData(newData)
  }, [totalBoxes, totalUnlockableBoxes, itemImages.length])

  // console.log('BoxesContainr', lockedBoxes, totalBoxes, totalUnlockableBoxes)
  if (loading) {
    return (
      <BoxesDisplaySection>
        <InfiniteScrollWrapper>
          <LoadingCardContainer />
          <LoadingCardContainer />
          <LoadingCardContainer />
          <LoadingCardContainer />
          <LoadingCardContainer />
          <LoadingCardContainer />
        </InfiniteScrollWrapper>
      </BoxesDisplaySection>
    )
  }

  return (
    <BoxesDisplaySection>
      <InfiniteScrollWrapper>
        {itemData.map(({ id, img, info, isLocked }, index) => (
          <CardContainer
            id={id}
            key={id}
            img={img}
            info={info}
            isLocked={isLocked}
            handleUnlockBox={handleUnlockBox}
            shouldHide={hiddenCards.includes(index)}
            index={index}
            handleShowModal={handleShowModal}
          />
        ))}
      </InfiniteScrollWrapper>
      {!itemData ||
        (itemData.length === 0 && (
          <ThemedText.BodySecondary fontSize="18px" marginLeft="28%">
            No Treasure Boxes
          </ThemedText.BodySecondary>
        ))}
    </BoxesDisplaySection>
  )
}

export default BoxesContainr
