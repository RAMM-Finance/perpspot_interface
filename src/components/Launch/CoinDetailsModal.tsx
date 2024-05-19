import { BaseSwapPanel } from 'components/BaseSwapPanel/BaseSwapPanel'
import { SmallButtonPrimary } from 'components/Button'
import { PoolDataChart } from 'components/ExchangeChart/PoolDataChart'
import Modal from 'components/Modal'
import { useCurrency } from 'hooks/Tokens'
import { CoinDetails } from 'pages/Launch'
import { useRef } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatDollarAmount } from 'utils/formatNumbers'

import ItemImg from '../../assets/images/newItem7.webp'

const ModalWrapper = styled.div`
  display: grid;
  grid-template-columns: 600px 300px;
  width: 100%;
  gap: 20px;
  padding: 2rem;
  border-radius: 20px;
  min-width: 1050px;
  max-height: 500px;
  overflow-y: scroll;
`

const ModalInputWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`
const HeaderSection = styled.div`
  display: flex;
  justify-content: start;
  width: fit-content;
  gap: 5px;
`

const StyledMediaImg = styled.img<{
  // imageLoading: boolean
  $aspectRatio?: string
  $hidden?: boolean
}>`
  width: 175px;
  /* aspect-ratio: ${({ $aspectRatio }) => $aspectRatio}; */
  aspect-ratio: 16/9;
  transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} transform`};
  will-change: transform;
  object-fit: contain;
  visibility: ${({ $hidden }) => ($hidden ? 'hidden' : 'visible')};
`

const ModalHeader = styled.div`
  width: fit-content;
  display: flex;
  justify-content: start;
  margin-left: 20px;
  gap: 20px;
`

interface CoinModalProps {
  isOpen: boolean
  handleCloseModal: () => void
  fakeCoin: CoinDetails | undefined
}

const CoinDetailsModal = ({ isOpen, handleCloseModal, fakeCoin }: CoinModalProps) => {
  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>
  const weth = useCurrency('0x4200000000000000000000000000000000000006')

  return (
    <Modal
      isOpen={isOpen}
      minHeight={55}
      maxHeight={600}
      maxWidth={1040}
      width={68}
      $scrollOverlay={true}
      onDismiss={() => handleCloseModal()}
    >
      <ModalWrapper>
        <LeftSection>
          <ModalHeader>
            <HeaderSection>
              <ThemedText.BodySmall>Name:</ThemedText.BodySmall>
              <ThemedText.BodySmall fontWeight={900} color="textSecondary">
                {fakeCoin?.name}
              </ThemedText.BodySmall>
            </HeaderSection>
            <HeaderSection>
              <ThemedText.BodySmall>Ticker:</ThemedText.BodySmall>
              <ThemedText.BodySmall fontWeight={900} color="textSecondary">
                {fakeCoin?.ticker}
              </ThemedText.BodySmall>
            </HeaderSection>
            <HeaderSection>
              <ThemedText.BodySmall color="accentSuccess">Market Cap:</ThemedText.BodySmall>
              <ThemedText.BodySmall color="accentSuccess" fontWeight={900}>
                {formatDollarAmount({ num: fakeCoin?.marketCap, long: true })}
              </ThemedText.BodySmall>
            </HeaderSection>
            <HeaderSection>
              <ThemedText.BodySmall color="accentSuccess">Virtual Liquidity:</ThemedText.BodySmall>
              <ThemedText.BodySmall color="accentSuccess" fontWeight={900}>
                $23,169
              </ThemedText.BodySmall>
            </HeaderSection>
          </ModalHeader>
          <PoolDataChart chartContainerRef={chartContainerRef} />
          <ThemedText.BodyPrimary
            color="accentActive"
            style={{ marginLeft: '10px', marginTop: '20px', marginBottom: '10px' }}
          >
            Thread:
          </ThemedText.BodyPrimary>
          <RepliesWrapper>
            <ReplyWrapper>
              <div style={{ display: 'flex', gap: '5px' }}>
                <ThemedText.BodySmall color="accentActive" fontSize={10}>
                  0x19321e81e9414055635e8A71f042e67cdB50649C:
                </ThemedText.BodySmall>
                <ThemedText.BodySmall color="accentActive" fontSize={10}>
                  (5/18/2024, 6:20PM)
                </ThemedText.BodySmall>
              </div>
              <ThemedText.BodySmall color="textSecondary">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit unde modi, corrupti laboriosam ut
                dolor voluptatum assumenda fugit atque ab laudantium
              </ThemedText.BodySmall>
            </ReplyWrapper>
            <ReplyWrapper>
              <div style={{ display: 'flex', gap: '5px' }}>
                <ThemedText.BodySmall color="accentActive" fontSize={10}>
                  0x19321e81e9414055635e8A71f042e67cdB50649C:
                </ThemedText.BodySmall>
                <ThemedText.BodySmall color="accentActive" fontSize={10}>
                  (5/18/2024, 6:20PM)
                </ThemedText.BodySmall>
              </div>
              <ThemedText.BodySmall color="textSecondary">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit unde modi, corrupti laboriosam ut
                dolor voluptatum assumenda fugit atque ab laudantium
              </ThemedText.BodySmall>
            </ReplyWrapper>
            <ReplyWrapper>
              <div style={{ display: 'flex', gap: '5px' }}>
                <ThemedText.BodySmall color="accentActive" fontSize={10}>
                  0x19321e81e9414055635e8A71f042e67cdB50649C:
                </ThemedText.BodySmall>
                <ThemedText.BodySmall color="accentActive" fontSize={10}>
                  (5/18/2024, 6:20PM)
                </ThemedText.BodySmall>
              </div>
              <ThemedText.BodySmall color="textSecondary">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit unde modi, corrupti laboriosam ut
                dolor voluptatum assumenda fugit atque ab laudantium
              </ThemedText.BodySmall>
            </ReplyWrapper>
            <ReplyWrapper>
              <div style={{ display: 'flex', gap: '5px' }}>
                <ThemedText.BodySmall color="accentActive" fontSize={10}>
                  0x19321e81e9414055635e8A71f042e67cdB50649C:
                </ThemedText.BodySmall>
                <ThemedText.BodySmall color="accentActive" fontSize={10}>
                  (5/18/2024, 6:20PM)
                </ThemedText.BodySmall>
              </div>
              <ThemedText.BodySmall color="textSecondary">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit unde modi, corrupti laboriosam ut
                dolor voluptatum assumenda fugit atque ab laudantium
              </ThemedText.BodySmall>
            </ReplyWrapper>
            <ReplyWrapper>
              <div style={{ display: 'flex', gap: '5px' }}>
                <ThemedText.BodySmall color="accentActive" fontSize={10}>
                  0x19321e81e9414055635e8A71f042e67cdB50649C:
                </ThemedText.BodySmall>
                <ThemedText.BodySmall color="accentActive" fontSize={10}>
                  (5/18/2024, 6:20PM)
                </ThemedText.BodySmall>
              </div>
              <ThemedText.BodySmall color="textSecondary">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit unde modi, corrupti laboriosam ut
                dolor voluptatum assumenda fugit atque ab laudantium
              </ThemedText.BodySmall>
            </ReplyWrapper>
          </RepliesWrapper>
        </LeftSection>
        <RightSection>
          <TradeSection>
            <SelectorWrapper>
              <Selector active={true}>Buy</Selector>
              <Selector active={false}>Sell</Selector>
            </SelectorWrapper>
            <SwitchButtonWrapper>
              <PresetButtons>Switch to ${fakeCoin?.ticker}</PresetButtons>
              <PresetButtons>Set max slippage</PresetButtons>
            </SwitchButtonWrapper>
            <InputWrapper>
              <BaseSwapPanel
                value=""
                onUserInput={() => ''}
                showMaxButton={true}
                fiatValue={{ data: 1, isLoading: false }}
                id="newtoken"
                currency={weth}
              />
            </InputWrapper>
            <PresetButtonsWrapper>
              <PresetButtons>rest</PresetButtons>
              <PresetButtons>1 WETH</PresetButtons>
              <PresetButtons> 5 WETH</PresetButtons>
              <PresetButtons> 10 WETH</PresetButtons>
            </PresetButtonsWrapper>
            <TradeButton>Place Trade</TradeButton>
          </TradeSection>
          <TokenDetailsWrapper>
            <StyledMediaImg src={typeof fakeCoin?.image === 'string' ? fakeCoin.image : ItemImg} />
            <InfoText>
              <ThemedText.BodySecondary
                fontSize={10}
                fontWeight={900}
              >{`${fakeCoin?.name} (ticker: ${fakeCoin?.ticker})`}</ThemedText.BodySecondary>
              <ThemedText.BodySmall fontSize={10}>{fakeCoin?.description}</ThemedText.BodySmall>
            </InfoText>
          </TokenDetailsWrapper>
          <ThemedText.BodyPrimary style={{ marginTop: '20px' }} fontWeight={900}>
            Holder Distribution
          </ThemedText.BodyPrimary>
          <HolderWrapper>
            <HolderRow>
              <ThemedText.BodySmall>1. 0xxasd....343eDD</ThemedText.BodySmall>
              <ThemedText.BodySmall>94.2%</ThemedText.BodySmall>
            </HolderRow>
            <HolderRow>
              <ThemedText.BodySmall>2. 0x23sd....343eFF</ThemedText.BodySmall>
              <ThemedText.BodySmall>3.2%</ThemedText.BodySmall>
            </HolderRow>
            <HolderRow>
              <ThemedText.BodySmall>3. 0x531d....343eDA</ThemedText.BodySmall>
              <ThemedText.BodySmall>1.2%</ThemedText.BodySmall>
            </HolderRow>
            <HolderRow>
              <ThemedText.BodySmall>4. 0xx64....343eFC</ThemedText.BodySmall>
              <ThemedText.BodySmall>.2%</ThemedText.BodySmall>
            </HolderRow>
          </HolderWrapper>
        </RightSection>
      </ModalWrapper>
    </Modal>
  )
}

export default CoinDetailsModal

const HolderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 350px;
`

const HolderRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`

const RepliesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`
const ReplyWrapper = styled.div`
  background: ${({ theme }) => `${theme.backgroundOutline}`};
  padding: 10px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`
const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const PresetButtons = styled(SmallButtonPrimary)`
  font-size: 10px;
  padding: 5px;
  height: 18px;
  border-radius: 5px;
`

const SwitchButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`

const PresetButtonsWrapper = styled.div`
  display: flex;
  gap: 5px;
`

const InfoText = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
`

const TokenDetailsWrapper = styled.div`
  display: flex;
  gap: 5px;
  width: 350px;
`

const InputWrapper = styled.div`
  padding: 10px;
  border: 1px solid ${({ theme }) => `${theme.backgroundOutline}`};
  border-radius: 5px;
`

const TradeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 350px;
  background: ${({ theme }) => `${theme.backgroundOutline}`};
  padding: 10px;
  border-radius: 8px;
`

const SelectorWrapper = styled.div`
  display: flex;
  gap: 10px;
`

const Selector = styled(SmallButtonPrimary)<{ active: boolean }>`
  width: 160px;
  border-radius: 5px;
  background-color: ${({ active, theme }) => (active ? `${theme.accentActive}` : `${theme.accentAction}`)};
`

const TradeButton = styled(SmallButtonPrimary)`
  width: 330px;
  border-radius: 5px;
  background-color: ${({ theme }) => `${theme.accentActive}`};
`
