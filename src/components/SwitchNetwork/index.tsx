import { Trans } from '@lingui/macro'
import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, InterfaceEventName } from '@uniswap/analytics-events'
import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary } from 'components/Button'
import { useToggleWalletDrawer } from 'components/WalletDropdown'
import { SupportedChainId } from 'constants/chains'
import useSelectChain from 'hooks/useSelectChain'

const SwitchNetwork = () => {
  const selectChain = useSelectChain()
  const { chainId } = useWeb3React()

  return (
      <ButtonPrimary
        style={{ marginTop: '2em', marginBottom: '2em', padding: '8px 16px' }}
        onClick={() => {
          if (chainId !== SupportedChainId.BASE)
            selectChain(SupportedChainId.BASE)
        }}
      >
        <Trans>Switch Network</Trans>
      </ButtonPrimary>
  )
}

export default SwitchNetwork
