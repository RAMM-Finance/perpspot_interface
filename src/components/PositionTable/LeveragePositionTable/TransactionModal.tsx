import { Trans } from '@lingui/macro'
import { Trace } from '@uniswap/analytics'
import { InterfaceModalName } from '@uniswap/analytics-events'
import { Currency } from '@uniswap/sdk-core'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from 'components/TransactionConfirmationModal'
import { ReactNode, useCallback } from 'react'
// import TransactionConfirmationModal, {
//   ConfirmationModalContent,
//   TransactionErrorContent,
// } from '../TransactionConfirmationModal'

export default function ConfirmModifyPositionModal({
  onDismiss,
  errorMessage,
  isOpen,
  header,
  bottom,
  attemptingTxn,
  txHash,
  pendingText,
  currencyToAdd,
  title,
}: {
  isOpen: boolean
  header: ReactNode | undefined
  bottom: ReactNode | undefined
  pendingText: ReactNode
  attemptingTxn: boolean
  txHash: string | undefined
  currencyToAdd: Currency | undefined
  recipient: string | null
  errorMessage: ReactNode | undefined
  title: string
  onDismiss: () => void
}) {
  const onModalDismiss = useCallback(() => {
    onDismiss()
  }, [onDismiss])

  const modalHeader = useCallback(() => {
    return header ? header : null
  }, [header])

  const modalBottom = useCallback(() => {
    return bottom ? bottom : null
  }, [bottom])

  const confirmationContent = useCallback(
    () =>
      errorMessage ? (
        <TransactionErrorContent onDismiss={onModalDismiss} message={errorMessage} />
      ) : (
        <ConfirmationModalContent
          title={<Trans>{title}</Trans>}
          onDismiss={onModalDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onModalDismiss, modalBottom, modalHeader, errorMessage, title]
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
        currencyToAdd={currencyToAdd}
      />
    </Trace>
  )
}
