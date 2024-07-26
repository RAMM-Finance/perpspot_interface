import Column from 'components/Column'
import { LoadingBubble } from 'components/Tokens/loading'
import { Row } from 'nft/components/Flex'
import { TBoxData } from 'pages/AirDropPage'
import styled, { keyframes } from 'styled-components/macro'
import { BREAKPOINTS, ThemedText } from 'theme'

import LockStatusBadge from '../Badge/LockStatusBadge'

const CardFadeOut = keyframes`
    from {
    opacity: 1;
    visibility: visible;
    display: block;
  }
  to {
    opacity: 0;
    visibility: hidden;
    display: none;
  }
`

const ItemImgContainer = styled.div<{ isDisabled?: boolean }>`
  position: relative;
  pointer-events: auto;
  &:hover {
    opacity: ${({ isDisabled, theme }) => (isDisabled ? theme.opacity.disabled : theme.opacity.enabled)};
  }
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'pointer')};
`

const StyledMediaContainer = styled(Row)`
  overflow: hidden;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`

const StyledMediaImg = styled.img<{
  // imageLoading: boolean
  $aspectRatio?: string
  $hidden?: boolean
}>`
  width: 100%;
  /* aspect-ratio: ${({ $aspectRatio }) => $aspectRatio}; */
  aspect-ratio: 16/9;
  transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} transform`};
  will-change: transform;
  object-fit: contain;
  visibility: ${({ $hidden }) => ($hidden ? 'hidden' : 'visible')};
`

const StyledDetailsRelativeContainer = styled.div`
  position: relative;
  height: 84px;
`

const StyledDetailsContainer = styled(Column)`
  position: absolute;
  width: 100%;
  padding: 16px 8px 0px;
  justify-content: space-between;
  gap: 8px;
  height: 84px;
  background: ${({ theme }) => theme.backgroundSurface};
  will-change: transform;
  transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} transform`};

  @media screen and (max-width: ${BREAKPOINTS.sm}px) {
    height: 112px;
    transform: translateY(-28px);
  }
`

const StyledInfoContainer = styled(Column)`
  gap: 4px;
  overflow: hidden;
  width: 100%;
  padding: 0px 8px;
  height: 48px;
`

const StyledPrimaryDetails = styled(Row)`
  width: 100%;
  justify-content: space-between;
  /* justify-items: center; */
  overflow: hidden;
  white-space: nowrap;
  gap: 8px;
`

const PrimaryInfoContainer = styled(ThemedText.BodyPrimary)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 600 !important;
  line-height: 20px;
`

const StyledActionButton = styled(ThemedText.BodySecondary)<{
  isDisabled: boolean
}>`
  position: absolute;
  display: flex;
  padding: 8px 0px;
  bottom: -32px;
  left: 8px;
  right: 8px;
  color: ${({ theme, isDisabled }) => (isDisabled ? theme.textPrimary : theme.accentTextLightPrimary)};
  background: ${({ theme, isDisabled }) => (isDisabled ? theme.backgroundInteractive : theme.accentAction)};
  transition: ${({ theme }) =>
    `${theme.transition.duration.medium} ${theme.transition.timing.ease} bottom, ${theme.transition.duration.medium} ${theme.transition.timing.ease} visibility`};
  will-change: transform;
  border-radius: 8px;
  justify-content: center;
  font-weight: 600 !important;
  line-height: 16px;
  visibility: hidden;
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'pointer')};

  @media screen and (max-width: ${BREAKPOINTS.sm}px) {
    visibility: visible;
    bottom: 8px;
  }

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

const StyledCardContainer = styled.div<{ isDisabled: boolean; shouldHide?: boolean }>`
  position: relative;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.backgroundSurface};
  overflow: hidden;
  box-shadow: 0px 0px 8px rgba(51, 53, 72, 0.04), 1px 2px 4px rgba(51, 53, 72, 0.12);
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  isolation: isolate;
  animation: ${({ shouldHide }) => (shouldHide ? CardFadeOut : 'none')} 0.5s forwards;

  :after {
    content: '';
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    border: 1px solid;
    border-radius: 12px;
    border-color: ${({ theme }) => theme.backgroundOutline};
    pointer-events: none;
    transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} border`};
    will-change: border;
  }

  :hover {
    ${StyledActionButton} {
      visibility: visible;
      bottom: 8px;
    }

    ${StyledDetailsContainer} {
      height: 112px;
      transform: translateY(-28px);
    }
    ${StyledMediaImg} {
      transform: scale(1.15);
    }
  }
`

interface ICardContainerProps {
  id: string
  img: string
  info: string
  isLocked: boolean
  isInsufficient: boolean
  isFirstBoxUnlocked: boolean
  // handleAddBox: () => void
  handleUnlockBox: (index: number) => void
  shouldHide?: boolean
  index: number
  handleShowModal: (modalData: TBoxData) => void
}

export const CardContainer = ({
  id,
  img,
  info,
  isLocked,
  isInsufficient,
  isFirstBoxUnlocked,
  // handleAddBox,
  handleUnlockBox,
  shouldHide,
  index,
  handleShowModal,
}: ICardContainerProps) => {
  // console.log(shouldHide,'index')
  return (
    <StyledCardContainer
      isDisabled={isLocked}
      shouldHide={shouldHide}
      onClick={() =>
        handleShowModal({
          id,
          img,
          info,
          isLocked,
          // isInsufficient,
          index,
        })
      }
    >
      <ItemImgContainer isDisabled={isLocked}>
        <StyledMediaContainer>
          <StyledMediaImg src={img} />
        </StyledMediaContainer>
      </ItemImgContainer>
      <StyledDetailsRelativeContainer>
        <StyledDetailsContainer>
          <StyledInfoContainer>
            <Row gap="8" justifyContent="space-between">
              <StyledPrimaryDetails>
                <PrimaryInfoContainer>{info} </PrimaryInfoContainer>
              </StyledPrimaryDetails>
            </Row>
            <Row justifyContent="space-between">
              <Row whiteSpace="nowrap" overflow="hidden">
                <LockStatusBadge isLocked={isLocked} />
              </Row>
            </Row>
          </StyledInfoContainer>
        </StyledDetailsContainer>
      </StyledDetailsRelativeContainer>
      <StyledActionButton
        isDisabled={!isFirstBoxUnlocked && index === 0 ? false : (isLocked || isInsufficient)}
        onClick={(e) => {
          e.stopPropagation()
          if (!isFirstBoxUnlocked)
            handleUnlockBox(index)  
          else {
            isLocked || isInsufficient ? undefined : handleUnlockBox(index)
          }
        }}
      >
        {!isFirstBoxUnlocked && index === 0 ? 'Unlock' : isLocked ? 'Locked' : isInsufficient ? 'Insufficient LMT' : 'Unlock'}
        {/* {isLocked ? 'Locked' : isInsufficient ? 'Insufficient LMT' : 'Unlock'} */}
      </StyledActionButton>
    </StyledCardContainer>
  )
}

export const LoadingCardContainer = () => {
  return (
    <StyledCardContainer isDisabled={true}>
      <ItemImgContainer isDisabled={true}>
        <StyledMediaContainer>
          <LoadingBubble width="1500px" height="180px" />
        </StyledMediaContainer>
      </ItemImgContainer>
      <StyledDetailsRelativeContainer>
        <StyledDetailsContainer>
          <StyledInfoContainer>
            <Row gap="8" justifyContent="space-between">
              <StyledPrimaryDetails>
                <PrimaryInfoContainer>
                  <LoadingBubble width="120px" height="18px" />
                </PrimaryInfoContainer>
              </StyledPrimaryDetails>
            </Row>
            <Row justifyContent="space-between">
              <Row whiteSpace="nowrap" overflow="hidden">
                <LoadingBubble width="65px" height="16px" margin="3px 0" />
              </Row>
            </Row>
          </StyledInfoContainer>
        </StyledDetailsContainer>
      </StyledDetailsRelativeContainer>
      <StyledActionButton isDisabled={true}>Loading...</StyledActionButton>
    </StyledCardContainer>
  )
}
