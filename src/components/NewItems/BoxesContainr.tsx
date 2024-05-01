import { Row } from 'nft/components/Flex'
import { TBoxData } from 'pages/NewItemsList'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'

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

interface IBoxesContainerProps {
  itemDatas: TBoxData[]
  handleUnlockBox: (index: number) => void
  loading: boolean
  hiddenCards: number[]
  handleShowModal: (modalData: TBoxData) => void
}

const BoxesContainr = ({ itemDatas, handleUnlockBox, loading, hiddenCards, handleShowModal }: IBoxesContainerProps) => {
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
        {itemDatas.map(({ id, img, info, isLocked, index }) => (
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
      {!itemDatas ||
        (itemDatas.length === 0 && (
          <ThemedText.BodySecondary fontSize="18px" marginLeft="28%">
            No Treasure Boxes
          </ThemedText.BodySecondary>
        ))}
    </BoxesDisplaySection>
  )
}

export default BoxesContainr
