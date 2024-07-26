import { Currency } from '@uniswap/sdk-core'
import { SmallButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import Modal from 'components/Modal'
import Row, { RowBetween, RowEnd } from 'components/Row'
import Toggle from 'components/Toggle'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { CopyText } from 'components/WalletDropdown/AuthenticatedHeader'
import { ethers } from 'ethers'
import { useReferralContract } from 'hooks/useContract'
import { useCurrentTokenPriceData } from 'hooks/useUserPriceData'
import { useEffect, useMemo, useState } from 'react'
import { Copy, Twitter } from 'react-feather'
import { TwitterShareButton } from 'react-share'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatDollarAmount } from 'utils/formatNumbers'
import { useAccount } from 'wagmi'

import modalBG from '../../../assets/images/pnlBG_1.jpg'
import { ReactComponent as Logo } from '../../../assets/svg/full_logo_black.svg'

const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 340px;
  gap: 0.5rem;
  padding: 1.5rem;
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

const PnlWrapper = styled(Row)`
  /* margin-top: 5px; */
  width: fit-content;
  justify-content: space-between;
  gap: 20px;
`

const InfoLabel = styled(ThemedText.BodySecondary)`
  white-space: nowrap;
`
const InfoText = styled(ThemedText.StatMint)`
  white-space: nowrap;
  width: 30%;
`
const Wrapper = styled.div`
  padding: 1rem;
  padding-bottom: 0rem;
  height: 340px;
`
const BottomWrapper = styled.div`
  padding: 2rem;
  padding-top: 1rem;
  padding-bottom: 0rem;
  display: flex;
  justify-content: space-between;
  width: 100%;
`

const ToggleWrapper = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`

interface IPositionInfoModalProps {
  showInfo: boolean
  handleCloseInfo: () => void
  outputCurrency: Currency | null | undefined
  inputCurrency: Currency | null | undefined
  pnl: string
  pnlPercent: string | undefined
  currentPrice: string
  entryPrice: string
  leverageValue: number
  marginInPosToken: boolean
}

const PositionInfoModal = ({
  showInfo,
  handleCloseInfo,
  outputCurrency,
  inputCurrency,
  currentPrice,
  entryPrice,
  leverageValue,
  pnl,
  pnlPercent,
  marginInPosToken,
}: IPositionInfoModalProps) => {
  const account = useAccount().address

  const [activeCodes, setActiveCodes] = useState<string>()
  const [pnlInUsd, setPnLInUsd] = useState<boolean>(false)

  const referralContract = useReferralContract()

  useEffect(() => {
    if (!account || !referralContract) return

    const call = async () => {
      try {
        const result = await referralContract.codesByOwners(account, 0)
        const decoded = ethers.utils.parseBytes32String(result)
        // const decoded = defaultAbiCoder.decode(['uint256'], result)
        setActiveCodes(decoded.toString())
      } catch (error) {
        setActiveCodes(undefined)
        console.log('codebyowners err')
      }
    }

    call()
  }, [account])

  const { data: usdPrice } = useCurrentTokenPriceData(
    marginInPosToken ? outputCurrency?.wrapped.address : inputCurrency?.wrapped.address
  )
  const inputInUsd = useMemo(() => {
    if (usdPrice) {
      return formatDollarAmount({ num: usdPrice.usdPrice * Number(pnl), long: true })
    }
    return undefined
  }, [usdPrice])

  const link = activeCodes ? `https://limitlessfi.app/join/${activeCodes}` : 'https://limitlessfi.app/'

  return (
    <Modal
      isOpen={showInfo}
      minHeight={48}
      maxHeight={400}
      maxWidth={420}
      width={68}
      $scrollOverlay={true}
      onDismiss={handleCloseInfo}
    >
      <Wrapper>
        <ModalWrapper>
          <RowBetween>
            <Logo fill="#fff" width="120px" />
            <ToggleWrapper>
              <ThemedText.BodySmall color="textSecondary" fontWeight={700}>
                Toggle USD:
              </ThemedText.BodySmall>
              <Toggle
                transform={0.8}
                id="pnl-usd-toggle"
                isActive={pnlInUsd}
                toggle={() => {
                  setPnLInUsd(!pnlInUsd)
                }}
                borderDark={true}
              />
            </ToggleWrapper>
          </RowBetween>

          <Row gap="7px" marginTop={'30px'}>
            <CurrencyLogo currency={inputCurrency} size="18px" />
            <ThemedText.BodySecondary fontSize={20} fontWeight={600}>
              {inputCurrency?.symbol}
            </ThemedText.BodySecondary>
            <ThemedText.BodySecondary fontSize={22} fontWeight={600}>
              /
            </ThemedText.BodySecondary>
            <CurrencyLogo currency={outputCurrency} size="18px" />
            <ThemedText.BodySecondary fontSize={22} fontWeight={600}>
              {outputCurrency?.symbol}
            </ThemedText.BodySecondary>
          </Row>
          <PnlWrapper>
            <InfoLabel fontSize={16}>PNL</InfoLabel>
            <DeltaText fontSize="16px" fontWeight={600} delta={Number(pnl)} isNoWrap={true}>
              {pnlInUsd ? inputInUsd : formatDollarAmount({ num: Number(pnl), long: true })}{' '}
              {pnlInUsd ? 'USD' : marginInPosToken ? outputCurrency?.symbol : inputCurrency?.symbol}
            </DeltaText>
            <DeltaText fontSize="16px" fontWeight={600} delta={Number(pnl)}>
              {`${Number(pnl) <= 0 ? '' : '+'} ${pnlPercent}`}
            </DeltaText>
          </PnlWrapper>
          <InfoTextWrapper marginTop="30px">
            <InfoLabel fontSize={14}>Entry Price</InfoLabel>
            <InfoText fontSize={14}>{formatDollarAmount({ num: Number(entryPrice), long: true })}</InfoText>
          </InfoTextWrapper>
          <InfoTextWrapper>
            <InfoLabel fontSize={14}>Current Price</InfoLabel>
            <InfoText fontSize={14}>{formatDollarAmount({ num: Number(currentPrice), long: true })}</InfoText>
          </InfoTextWrapper>
          <InfoTextWrapper>
            <InfoLabel fontSize={14}>Leverage</InfoLabel>
            <InfoText fontSize={14}>{leverageValue}x</InfoText>
          </InfoTextWrapper>
          <Row marginTop={'40px'}>
            <ThemedText.BodySecondary fontSize={14} fontWeight={600}>
              Liquidation free leverage trading only on Limitless.
            </ThemedText.BodySecondary>
          </Row>
        </ModalWrapper>
        {!activeCodes ? (
          <BottomWrapper>
            <TwitterShareButton url={`Liquidiation free leverage trading only with Limitless @limitlessdefi ${link}`}>
              <Button>
                Tweet
                <Twitter size={16} />
              </Button>
            </TwitterShareButton>
            <Button>
              <CopyText disableHover={true} toCopy={link}>
                Share
              </CopyText>
              <Copy size={16} />
            </Button>
            {/* <Button>
            Download
            <Download size={16} />
          </Button> */}
          </BottomWrapper>
        ) : (
          <AutoColumn gap="sm">
            <RowEnd>
              <ThemedText.BodySmall>{link}</ThemedText.BodySmall>
              <Button>
                <CopyText disableHover={true} toCopy={link}>
                  Refer
                </CopyText>
                <Copy size={16} />
              </Button>
            </RowEnd>
            <Row justify="center">
              <TwitterShareButton url={`Liquidiation free leverage trading only with Limitless @limitlessdefi ${link}`}>
                <Button>
                  Tweet
                  <Twitter size={16} />
                </Button>
              </TwitterShareButton>
            </Row>
            {/* <Button>
            Download
            <Download size={16} />
          </Button> */}
          </AutoColumn>
        )}
      </Wrapper>
    </Modal>
  )
}

const Button = styled(SmallButtonPrimary)`
  display: flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
`

export default PositionInfoModal
