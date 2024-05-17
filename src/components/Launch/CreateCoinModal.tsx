import { SmallButtonPrimary } from 'components/Button'
import Modal from 'components/Modal'
import { useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
  padding: 2rem;
  border-radius: 20px;
`

const ModalInputWrapper = styled.div`
  width: 100%;
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
  width: 400px;
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
    image: FileList | undefined | null
  }
  const [coinDetails, setCoinDetails] = useState<CoinDetails>({
    name: '',
    ticker: '',
    description: '',
    image: null,
  })

  const [coinData, setCoinData] = useState<CoinDetails>({
    name: '',
    ticker: '',
    description: '',
    image: null,
  })

  function handleSubmit(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    setCoinData({
      ...coinData,
      name: coinDetails.name,
      ticker: coinDetails.ticker,
      description: coinDetails.description,
      image: coinDetails.image,
    })
  }

  console.log('coindata', coinData)
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
          <form id="form">
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
              <Input type="file" onChange={(e) => setCoinDetails({ ...coinDetails, image: e.target.files })} />
            </InputContainer>
          </form>
          <SmallButtonPrimary type="submit" onClick={(e) => handleSubmit}>
            Create Coin
          </SmallButtonPrimary>
          <ThemedText.BodySmall fontSize={13} fontWeight={900}>
            Cost to deploy:
          </ThemedText.BodySmall>
        </ModalInputWrapper>
      </ModalWrapper>
    </Modal>
  )
}

export default CreateCoinModal
