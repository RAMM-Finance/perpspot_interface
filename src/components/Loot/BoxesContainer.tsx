import { Column, Row } from 'nft/components/Flex'
import { TBoxData } from 'pages/Loot'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'

import { CardContainer, LoadingCardContainer } from './CardContainer'

const AddBoxActionButton = styled(ThemedText.BodySecondary)<{
  isDisabled: boolean
}>`
  display: flex;
  padding: 8px 0px;
  width: 40vh;
  height: 35px;
  color: ${({ theme, isDisabled }) => (isDisabled ? theme.textPrimary : theme.accentTextLightPrimary)};
  background: ${({ theme, isDisabled }) => (isDisabled ? theme.backgroundInteractive : theme.accentAction)};
  transition: ${({ theme }) =>
    `${theme.transition.duration.medium} ${theme.transition.timing.ease} bottom, ${theme.transition.duration.medium} ${theme.transition.timing.ease} visibility`};
  will-change: transform;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  font-weight: 600 !important;
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
  handleAddBox: () => void
  handleClaimBoxes: (passcode: number| null) => void
  passcode: number | null
  loading: boolean
  hiddenCards: number[]
  handleShowModal: (modalData: TBoxData) => void
  account?: string
  isInsufficient: boolean
  isInConcatenatedAddresses: boolean
  isClaimed: boolean
  isFirstBoxUnlocked: boolean
}

const BoxesContainer = ({
  itemDatas,
  handleUnlockBox,
  handleAddBox,
  handleClaimBoxes,
  passcode,
  loading,
  hiddenCards,
  handleShowModal,
  account,
  isInsufficient,
  isInConcatenatedAddresses,
  isClaimed,
  isFirstBoxUnlocked
}: IBoxesContainerProps) => {
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
            isInsufficient={isInsufficient && !(isInConcatenatedAddresses && !isClaimed)}
            isFirstBoxUnlocked={isFirstBoxUnlocked}
            handleUnlockBox={handleUnlockBox}
            // handleAddBox={handleAddBox}
            shouldHide={hiddenCards.includes(index)}
            index={index}
            handleShowModal={handleShowModal}
          />
        ))}
      </InfiniteScrollWrapper>
      {!itemDatas || !account
        ? null
        : itemDatas.length === 0 && (
            <Column gap="18">
              <ThemedText.BodySecondary fontSize="18px" width="100%">
                No Treasure Boxes
              </ThemedText.BodySecondary>
              <AddBoxActionButton
                isDisabled={isInsufficient && !(isInConcatenatedAddresses && !isClaimed)}
                fontSize="18px"
                onClick={() => {
                  if (isInsufficient && !(isInConcatenatedAddresses && !isClaimed)) return
                  if (isInConcatenatedAddresses && !isClaimed) {
                    handleClaimBoxes(passcode)
                  } else {
                    handleAddBox()
                  }
                }}
              >
                {isInsufficient  && !(isInConcatenatedAddresses && !isClaimed)
                ? 'Insufficient LMT'
                : isInConcatenatedAddresses && !isClaimed
                ? 'Claim Boxes'
                : 'Add Box'}
              </AddBoxActionButton>
            </Column>
          )}
    </BoxesDisplaySection>
  )
}

export default BoxesContainer
