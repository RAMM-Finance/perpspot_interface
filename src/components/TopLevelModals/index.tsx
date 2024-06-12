import { useWeb3React } from '@web3-react/core'
import UniswapWalletBanner from 'components/Banner/UniswapWalletBanner'
import AddressClaimModal from 'components/claim/AddressClaimModal'
import ConnectedAccountBlocked from 'components/ConnectedAccountBlocked'
import FiatOnrampModal from 'components/FiatOnrampModal'
import UniwalletModal from 'components/WalletDropdown/UniwalletModal'
import useAccountRiskCheck from 'hooks/useAccountRiskCheck'
import { lazy } from 'react'
import { useModalIsOpen, useToggleModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { useAccount } from 'wagmi'

const TransactionCompleteModal = lazy(() => import('nft/components/collection/TransactionCompleteModal'))

export default function TopLevelModals() {
  const addressClaimOpen = useModalIsOpen(ApplicationModal.ADDRESS_CLAIM)
  const addressClaimToggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
  const blockedAccountModalOpen = useModalIsOpen(ApplicationModal.BLOCKED_ACCOUNT)
  const account = useAccount().address
  useAccountRiskCheck(account)
  const accountBlocked = Boolean(blockedAccountModalOpen && account)

  return (
    <>
      <AddressClaimModal isOpen={addressClaimOpen} onDismiss={addressClaimToggle} />
      <ConnectedAccountBlocked account={account} isOpen={accountBlocked} />
      <UniwalletModal />
      <UniswapWalletBanner />
      <TransactionCompleteModal />
      <FiatOnrampModal />
    </>
  )
}
