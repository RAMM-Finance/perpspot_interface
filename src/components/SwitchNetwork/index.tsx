import { Trans } from '@lingui/macro'
import { ButtonPrimary } from 'components/Button'
import { SupportedChainId } from 'constants/chains'
import useSelectChain from 'hooks/useSelectChain'
import { useChainId } from 'wagmi'

const SwitchNetwork = () => {
  const selectChain = useSelectChain()
  const chainId = useChainId()

  return (
    <ButtonPrimary
      style={{ marginTop: '2em', marginBottom: '2em', padding: '8px 16px' }}
      onClick={() => {
        if (chainId !== SupportedChainId.BASE) selectChain(SupportedChainId.BASE)
      }}
    >
      <Trans>Switch Network</Trans>
    </ButtonPrimary>
  )
}

export default SwitchNetwork
