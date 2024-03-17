import { Trans } from '@lingui/macro'
import { Trace } from '@uniswap/analytics'
import { InterfaceModalName } from '@uniswap/analytics-events'
import { ReactNode, useCallback, useEffect } from 'react'
import { AddLimitTrade } from 'state/marginTrading/hooks'

import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../TransactionConfirmationModal'
import AddLimitModalFooter from './AddLimitFooter'
import { AddLimitModalHeader } from './AddLimitOrderHeader'

export function ConfirmAddLimitOrderModal({
  trade,
  originalTrade,
  onAcceptChanges,
  onConfirm,
  onDismiss,
  tradeErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  onCancel,
}: {
  isOpen: boolean
  trade: AddLimitTrade | undefined
  originalTrade: AddLimitTrade | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  onAcceptChanges: () => void
  onConfirm: () => void
  tradeErrorMessage: ReactNode | undefined
  onDismiss: () => void
  onCancel: () => void
}) {
  const onModalDismiss = useCallback(() => {
    // if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [onDismiss])

  useEffect(() => {
    if (tradeErrorMessage === 'User has rejected the transaction') {
      onCancel()
    }
  }, [onCancel, tradeErrorMessage])

  const modalHeader = useCallback(() => {
    return trade ? (
      <AddLimitModalHeader trade={trade} recipient={null} showAcceptChanges={false} onAcceptChanges={onAcceptChanges} />
    ) : null
  }, [onAcceptChanges, trade])

  const modalBottom = useCallback(() => {
    return trade ? (
      <AddLimitModalFooter
        onConfirm={onConfirm}
        errorMessage={tradeErrorMessage}
        trade={trade}
        hash={txHash}
        disabledConfirm={false}
      />
    ) : null
  }, [onConfirm, trade, txHash, tradeErrorMessage])

  // text to show while loading
  const pendingText = <Trans>Submitting limit order</Trans>

  const confirmationContent = useCallback(
    () =>
      tradeErrorMessage ? (
        <TransactionErrorContent onDismiss={onModalDismiss} message={tradeErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title={<Trans>Confirm Limit Order</Trans>}
          onDismiss={onModalDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onModalDismiss, modalBottom, modalHeader, tradeErrorMessage]
  )

  return (
    <Trace modal={InterfaceModalName.CONFIRM_SWAP}>
      <TransactionConfirmationModal
        isOpen={isOpen}
        onDismiss={onModalDismiss}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
      />
    </Trace>
  )
}
