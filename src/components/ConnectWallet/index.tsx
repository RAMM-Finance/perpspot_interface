import { Trans } from '@lingui/macro'
import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, InterfaceEventName } from '@uniswap/analytics-events'
import { ButtonPrimary } from 'components/Button'
import { useToggleWalletDrawer } from 'components/WalletDropdown'

const ConnectWallet = () => {
  const toggleWalletDrawer = useToggleWalletDrawer()

  return (
    <TraceEvent
      events={[BrowserEvent.onClick]}
      name={InterfaceEventName.CONNECT_WALLET_BUTTON_CLICKED}
      properties={{ received_swap_quote: false }}
      element={InterfaceElementName.CONNECT_WALLET_BUTTON}
    >
      <ButtonPrimary
        style={{ marginTop: '2em', marginBottom: '2em', padding: '8px 16px' }}
        onClick={toggleWalletDrawer}
      >
        <Trans>Connect</Trans>
      </ButtonPrimary>
    </TraceEvent>
  )
}

export default ConnectWallet
