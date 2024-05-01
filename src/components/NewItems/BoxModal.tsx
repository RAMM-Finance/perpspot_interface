import { LightCard } from 'components/Card'
import Column from 'components/Column'
import Modal from 'components/Modal'
import { Row } from 'nft/components/Flex'
import { TBoxData, TBRPData } from 'pages/NewItemsList'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { InfoDescription } from './InfoDescription'
import { ModalItemStats } from './InfoItemStats'

const ModalInfoWrapper = styled(LightCard)`
  position: relative;
  display: flex;
  flex-direction: column;
  border: none;
  border-radius: 0px;
  width: 100%;
  border-bottom: 3px solid ${({ theme }) => theme.searchOutline};
  justify-content: flex-start;
  background: ${({ theme }) => theme.backgroundSurface};
  padding: 0.75rem;
`

const ModalActionButton = styled(ThemedText.BodySecondary)<{
  isDisabled: boolean
}>`
  width: 45%;
  height: 35px;
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

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    width: 75%;
  }
`

const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* flex-wrap: wrap; */
  width: 100%;
  gap: 0.5rem;
  padding: 2rem;
  border-radius: 20px;
`

const ModalTopWrapper = styled.div`
  display: flex;
  gap: 2rem;
  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    flex-wrap: wrap;
  }
`

const ModalDescriptWrapper = styled(Column)<{ marginTop?: number }>`
  margin-top: ${({ marginTop }) => marginTop && `${marginTop}px`};
  padding: 0.5rem;
  width: 100%;
  align-self: start;
`

interface IBoxModalProps {
  brpData: TBRPData
  modalData: TBoxData
  isOpen: boolean
  hnadleColoseModal: () => void
  handleUnlockBox: (index: number) => void
}

const BoxModal = ({ isOpen, hnadleColoseModal, modalData, handleUnlockBox, brpData }: IBoxModalProps) => {
  const { info, img, isLocked, index } = modalData
  // console.log('brpData', brpData)
  return (
    <Modal
      isOpen={isOpen}
      minHeight={55}
      maxHeight={750}
      maxWidth={1200}
      width={68}
      $scrollOverlay={true}
      onDismiss={() => hnadleColoseModal()}
    >
      <ModalWrapper>
        <ModalTopWrapper>
          <StyledMediaImg src={img} />
          <ModalDescriptWrapper marginTop={10}>
            <Row justifyContent="space-between" gap="8" width="full" alignItems="flex-start">
              <ThemedText.HeadlineMedium color="textSecondary">{info}</ThemedText.HeadlineMedium>
              <ModalActionButton isDisabled={isLocked} onClick={() => (isLocked ? undefined : handleUnlockBox(index))}>
                {isLocked ? 'Locked' : 'Unlock'}
              </ModalActionButton>
            </Row>
            <ModalDescriptWrapper gap="md">
              <InfoDescription description="How to get this Box" />
              <InfoDescription
                description="Description Section will be updated" 
                fontSize={12}
                color="textPrimary"
              />
            </ModalDescriptWrapper>
          </ModalDescriptWrapper>
        </ModalTopWrapper>
        <ModalInfoWrapper>
          <ModalItemStats brpData={brpData}/>
        </ModalInfoWrapper>
      </ModalWrapper>
    </Modal>
  )
}

export default BoxModal
