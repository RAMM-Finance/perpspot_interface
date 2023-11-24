import { Trans } from '@lingui/macro'
import { Trace } from '@uniswap/analytics'
import { InterfaceModalName } from '@uniswap/analytics-events'
import { ReactNode, useCallback } from 'react'
import { AddLimitTrade, PreTradeInfo } from 'state/marginTrading/hooks'

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
  // allowedSlippage,
  onConfirm,
  onDismiss,
  tradeErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  preTradeInfo,
}: // existingPosition,
// swapQuoteReceivedDate,
// fiatValueInput,
// fiatValueOutput,
{
  isOpen: boolean
  trade: AddLimitTrade | undefined
  originalTrade: AddLimitTrade | undefined
  preTradeInfo: PreTradeInfo | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  // allowedSlippage: Percent
  onAcceptChanges: () => void
  onConfirm: () => void
  tradeErrorMessage: ReactNode | undefined
  onDismiss: () => void
}) {
  const onModalDismiss = useCallback(() => {
    // if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [onDismiss])

  const modalHeader = useCallback(() => {
    return trade && preTradeInfo ? (
      <AddLimitModalHeader
        trade={trade}
        preTradeInfo={preTradeInfo}
        // existingPosition={existingPosition}
        recipient={null}
        // allowedSlippage={allowedSlippage}
        showAcceptChanges={false}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null
  }, [onAcceptChanges, trade, preTradeInfo])

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
