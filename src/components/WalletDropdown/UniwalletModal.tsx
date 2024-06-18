import { Trans } from '@lingui/macro'
import { sendAnalyticsEvent } from '@uniswap/analytics'
import Modal from 'components/Modal'
import { RowBetween } from 'components/Row'
import { useCallback, useEffect } from 'react'
import { useModalIsOpen, useToggleUniwalletModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import styled, { useTheme } from 'styled-components/macro'
import { CloseIcon, ThemedText } from 'theme'
import { useAccount } from 'wagmi'

const UniwalletConnectWrapper = styled(RowBetween)`
  display: flex;
  flex-direction: column;
  padding: 20px 16px 16px;
`
const HeaderRow = styled(RowBetween)`
  display: flex;
`
const QRCodeWrapper = styled(RowBetween)`
  aspect-ratio: 1;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.white};
  margin: 24px 32px 20px;
  padding: 10px;
`
const Divider = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};
  width: 100%;
`

export default function UniwalletModal() {
  const open = useModalIsOpen(ApplicationModal.UNIWALLET_CONNECT)
  const toggle = useToggleUniwalletModal()

  // const [uri, setUri] = useState<string>()
  // useEffect(() => {
  //   ;(uniwalletConnectConnection.connector as WalletConnect).events.addListener(
  //     UniwalletConnect.UNI_URI_AVAILABLE,
  //     (uri) => {
  //       uri && setUri(uri)
  //       toggle()
  //     }
  //   )
  // }, [toggle])

  const account = useAccount().address
  useEffect(() => {
    if (open) {
      sendAnalyticsEvent('Uniswap wallet modal opened', { userConnected: !!account })
      if (account) {
        toggle()
      }
    }
  }, [account, open, toggle])

  const onClose = useCallback(() => {
    // uniwalletConnectConnection.connector.deactivate?.()
    toggle()
  }, [toggle])

  const theme = useTheme()
  return (
    <Modal isOpen={open} onDismiss={onClose}>
      <UniwalletConnectWrapper>
        <HeaderRow>
          <ThemedText.SubHeader>
            <Trans>Scan with Limitless Wallet</Trans>
          </ThemedText.SubHeader>
          <CloseIcon onClick={onClose} />
        </HeaderRow>
        <QRCodeWrapper>
          {/* {uri && (
            <QRCodeSVG
              value={uri}
              width="100%"
              height="100%"
              level="M"
              fgColor={theme.darkMode ? theme.backgroundSurface : theme.black}
              imageSettings={{
                src: uniPng,
                height: 27,
                width: 27,
                excavate: false,
              }}
            />
          )} */}
        </QRCodeWrapper>
        <Divider />
        {/*<InfoSection onClose={onClose} /> */}
      </UniwalletConnectWrapper>
    </Modal>
  )
}

const InfoSectionWrapper = styled(RowBetween)`
  display: flex;
  flex-direction: row;
  padding-top: 20px;
  gap: 20px;
`
