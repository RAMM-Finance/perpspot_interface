import { useWeb3React } from '@web3-react/core'
import { SmallButtonPrimary } from 'components/Button'
import { PoolDataChart } from 'components/ExchangeChart/PoolDataChart'
import Modal from 'components/Modal'
import { CoinDetails } from 'pages/Launch'
import { Dispatch, SetStateAction, useRef, useState } from 'react'
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

interface CreateCoinModalProps {
  isOpen: boolean
  handleCloseModal: () => void
  fakeCoins: CoinDetails[] 
  setFakeCoins: Dispatch<SetStateAction<CoinDetails[]>>
}

const CreateCoinModal = ({ isOpen, handleCloseModal, fakeCoins, setFakeCoins }: CreateCoinModalProps) => {

  const {account: user} = useWeb3React()
  const [coinDetails, setCoinDetails] = useState<CoinDetails>({
    name: '',
    account: '',
    ticker: '',
    description: '',
    image: undefined,
    replies: 0,
    marketCap: 0
  })


  function handleSubmit(e:any) {
    e.preventDefault()
    setFakeCoins([...fakeCoins, {...coinDetails, account:user}])
  }


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
              <Input type='text' onChange={(e) => setCoinDetails({ ...coinDetails, name: e.target.value })} />
            </InputContainer>
            <InputContainer>
              <ThemedText.BodyPrimary style={{ marginLeft: '10px' }}>Ticker</ThemedText.BodyPrimary>
              <Input type='text' onChange={(e) => setCoinDetails({ ...coinDetails, ticker: e.target.value })} />
            </InputContainer>
            <InputContainer>
              <ThemedText.BodyPrimary style={{ marginLeft: '10px' }}>Description</ThemedText.BodyPrimary>
              <Input type='textBox' onChange={(e) => setCoinDetails({ ...coinDetails, description: e.target.value })} large={true} />
            </InputContainer>
            <InputContainer>
              <ThemedText.BodyPrimary style={{ marginLeft: '10px' }}>Image</ThemedText.BodyPrimary>
              <Input type="file" onChange={(e) => setCoinDetails({ ...coinDetails, image: (e.target.files  ? URL.createObjectURL(e.target.files[0]) : undefined )})} />
            </InputContainer>
          </form>
          <SmallButtonPrimary form='form' type="submit" onClick={(e)=>handleSubmit(e)}>
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
