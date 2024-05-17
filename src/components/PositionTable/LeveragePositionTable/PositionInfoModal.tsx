import { Currency } from '@uniswap/sdk-core'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import Modal from 'components/Modal'
import Row from 'components/Row'
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
  padding-right: 3rem;
  border-radius: 7px;
  background-image: url(${modalBG});
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
`

const InfoTextWrapper = styled(Row)`
  width: 65%;
  justify-content: space-between;
`
interface IPositionInfoModalProps {
  showInfo: boolean
  handleCloseInfo: () => void
  outputCurrency: Currency | null | undefined
  inputCurrency: Currency | null | undefined
  pln: string
  currentPrice: string
  entryPrice: string
}

const PositionInfoModal = ({
  showInfo,
  handleCloseInfo,
  outputCurrency,
  inputCurrency,
  currentPrice,
  entryPrice,
  pln,
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
        <ThemedText.BodySecondary fontSize={18} marginTop="35px">
          PNL
        </ThemedText.BodySecondary>
        <ThemedText.BodySecondary fontSize={32} fontWeight={600} marginTop="5px" color="accentTextMint">
          {pln}
        </ThemedText.BodySecondary>
        <InfoTextWrapper marginTop="40px">
          <ThemedText.BodySecondary fontSize={18}>Entry Price</ThemedText.BodySecondary>
          <ThemedText.BodySecondary fontSize={18} fontWeight={600} color="accentTextMint">
            {entryPrice}
          </ThemedText.BodySecondary>
        </InfoTextWrapper>
        <InfoTextWrapper>
          <ThemedText.BodySecondary fontSize={18}>Current Price</ThemedText.BodySecondary>
          <ThemedText.BodySecondary fontSize={18} fontWeight={600} color="accentTextMint">
            {currentPrice}
          </ThemedText.BodySecondary>
        </InfoTextWrapper>
      </ModalWrapper>
    </Modal>
  )
}

export default PositionInfoModal
