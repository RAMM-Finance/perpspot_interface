import { Currency } from '@uniswap/sdk-core'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import Modal from 'components/Modal'
import Row from 'components/Row'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import modalBG from '../../../assets/images/pnlBG_1.jpg'
import { ReactComponent as Logo } from '../../../assets/svg/full_logo_black.svg'

const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 500px;
  gap: 0.5rem;
  padding: 2rem;
  border-radius: 7px;
  background-image: url(${modalBG});
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
`

const InfoTextWrapper = styled(Row)`
  /* margin-top: 5px; */
  width: 65%;
  justify-content: space-between;
`

const InfoLabel = styled(ThemedText.BodySecondary)`
  white-space: nowrap;
`
const InfoText = styled(ThemedText.StatMint)`
  white-space: nowrap;
  width: 30%;
`

interface IPositionInfoModalProps {
  showInfo: boolean
  handleCloseInfo: () => void
  outputCurrency: Currency | null | undefined
  inputCurrency: Currency | null | undefined
  pln: string
  pnlPercent: string
  currentPrice: string
  entryPrice: string
  leverageValue: number
}

const PositionInfoModal = ({
  showInfo,
  handleCloseInfo,
  outputCurrency,
  inputCurrency,
  currentPrice,
  entryPrice,
  leverageValue,
  pln,
  pnlPercent,
}: IPositionInfoModalProps) => {
  return (
    <Modal
      isOpen={showInfo}
      minHeight={48}
      maxHeight={480}
      maxWidth={480}
      width={68}
      $scrollOverlay={true}
      onDismiss={handleCloseInfo}
    >
      <ModalWrapper>
        <Logo fill="#fff" width="120px" />
        <Row marginTop="30px" gap="7px">
          <CurrencyLogo currency={outputCurrency} size="24px" />
          <ThemedText.BodySecondary fontSize={32} fontWeight={600}>
            {outputCurrency?.symbol}
          </ThemedText.BodySecondary>
          <ThemedText.BodySecondary fontSize={32} fontWeight={600}>
            /
          </ThemedText.BodySecondary>
          <CurrencyLogo currency={inputCurrency} size="24px" />
          <ThemedText.BodySecondary fontSize={32} fontWeight={600}>
            {inputCurrency?.symbol}
          </ThemedText.BodySecondary>
        </Row>
        <InfoLabel fontSize={16} marginTop="35px">
          PNL
        </InfoLabel>
        <DeltaText fontSize="32px" fontWeight={600} delta={Number(pln)} isNoWrap={true}>
          {pln} {inputCurrency?.symbol}
        </DeltaText>
        <DeltaText fontSize="34px" fontWeight={600} delta={Number(pln)}>
          {`${Number(pln) > 0 ? '+' : Number(pln) < 0 ? '-' : ''}${pnlPercent}`}
        </DeltaText>
        <InfoTextWrapper marginTop="35px">
          <InfoLabel fontSize={16}>Entry Price</InfoLabel>
          <InfoText>{entryPrice}</InfoText>
        </InfoTextWrapper>
        <InfoTextWrapper>
          <InfoLabel fontSize={16}>Current Price</InfoLabel>
          <InfoText>{currentPrice}</InfoText>
        </InfoTextWrapper>
        <InfoTextWrapper>
          <InfoLabel fontSize={16}>Leverage</InfoLabel>
          <InfoText>{leverageValue}x</InfoText>
        </InfoTextWrapper>
      </ModalWrapper>
    </Modal>
  )
}

export default PositionInfoModal
