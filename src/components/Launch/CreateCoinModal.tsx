import { SmallButtonPrimary } from 'components/Button'
import { LightCard } from 'components/Card'
import Column from 'components/Column'
import Modal from 'components/Modal'
import { useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

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

const ModalActionButton = styled(ThemedText.BodySecondary)`
  width: 45%;
  height: 35px;
  display: flex;
  align-items: center;
  padding: 8px 0px;
  color: ${({ theme }) => theme.accentTextLightPrimary};
  background: ${({ theme }) => theme.accentAction};
  transition: ${({ theme }) =>
    `${theme.transition.duration.medium} ${theme.transition.timing.ease} bottom, ${theme.transition.duration.medium} ${theme.transition.timing.ease} visibility`};
  will-change: transform;
  border-radius: 8px;
  justify-content: center;
  white-space: nowrap;
  font-weight: 600 !important;
  font-size: 18px !important;
  line-height: 16px;

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
`

const StyledMediaImg = styled.img<{
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

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
    width: 70%;
  }
`

const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
  padding: 2rem;
  border-radius: 20px;
`

const ModalTopWrapper = styled.div`
  display: flex;
  gap: 2rem;
  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
    flex-wrap: wrap;
  }
`

const ModalDescriptWrapper = styled(Column)<{ marginTop?: number }>`
  margin-top: ${({ marginTop }) => marginTop && `${marginTop}px`};
  padding: 0.5rem;
  width: 100%;
  align-self: start;
`
const ModalInputWrapper = styled.div`
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`

const Input = styled.input<{ large?: boolean }>`
  margin-bottom: 10px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.surface1};
  border-radius: 10px;
  height: ${({ large }) => (large ? '90px' : '30px')};
  line-height: 25px;
  &:focus {
    outline: 1px solid ${({ theme }) => theme.accentActive};
  }
  color: white;
  padding-left: 5px;
`
const InputContainer = styled.div`
  display: flex;
  gap: 5px;
  flex-direction: column;
  width: 100%;
`

const ModalHeader = styled.div``

interface IBoxModalProps {
  isOpen: boolean
  handleCloseModal: () => void
}

const CreateCoinModal = ({ isOpen, handleCloseModal }: IBoxModalProps) => {
  interface CoinDetails {
    name: string
    ticker: string
    description: string
  }
  const [coinDetails, setCoinDetails] = useState<CoinDetails>({ name: '', ticker: '', description: '' })
  return (
    <Modal
      isOpen={isOpen}
      minHeight={55}
      maxHeight={750}
      maxWidth={500}
      width={68}
      $scrollOverlay={true}
      onDismiss={() => handleCloseModal()}
    >
      <ModalWrapper>
        <ModalHeader>
          <ThemedText.DeprecatedMediumHeader>Coin Details</ThemedText.DeprecatedMediumHeader>
        </ModalHeader>
        <ModalInputWrapper>
          <InputContainer>
            <ThemedText.BodyPrimary style={{ marginLeft: '10px' }}>Name</ThemedText.BodyPrimary>
            <Input onChange={(e) => setCoinDetails({ ...coinDetails, name: e.target.value })} />
          </InputContainer>
          <InputContainer>
            <ThemedText.BodyPrimary style={{ marginLeft: '10px' }}>Ticker</ThemedText.BodyPrimary>
            <Input onChange={(e) => setCoinDetails({ ...coinDetails, ticker: e.target.value })} />
          </InputContainer>
          <InputContainer>
            <ThemedText.BodyPrimary style={{ marginLeft: '10px' }}>Description</ThemedText.BodyPrimary>
            <Input onChange={(e) => setCoinDetails({ ...coinDetails, description: e.target.value })} large={true} />
          </InputContainer>
          <InputContainer>
            <ThemedText.BodyPrimary style={{ marginLeft: '10px' }}>Image</ThemedText.BodyPrimary>
            <Input type="file" />
          </InputContainer>
          <SmallButtonPrimary>Create Coin</SmallButtonPrimary>
          <ThemedText.BodySmall>Cost to deploy:</ThemedText.BodySmall>
        </ModalInputWrapper>
      </ModalWrapper>
    </Modal>
  )
}

export default CreateCoinModal
