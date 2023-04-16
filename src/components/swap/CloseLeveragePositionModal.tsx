import { Trans } from '@lingui/macro'
import { Trace } from '@uniswap/analytics'
import { InterfaceModalName } from '@uniswap/analytics-events'
import { Trade } from '@uniswap/router-sdk'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { tradeMeaningfullyDiffers } from 'utils/tradeMeaningFullyDiffer'

import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../TransactionConfirmationModal'
import SwapModalFooter, { LeverageModalFooter } from './SwapModalFooter'
import SwapModalHeader, { LeverageModalHeader } from './SwapModalHeader'
import { LeverageTrade } from 'state/swap/hooks'
import { useLeveragePosition } from 'hooks/useV3Positions'

export default function ClosePositionModal({
  trader,
  isOpen,
  tokenId,
  leverageManagerAddress,
  onDismiss,
  onAcceptChanges,
  onConfirm
}: {
  trader: string | undefined,
  isOpen: boolean,
  tokenId: string | undefined,
  leverageManagerAddress: string | undefined,
  onDismiss: () => void
  onAcceptChanges: () => void
  onConfirm: () => void
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)

  const [positionState, position] = useLeveragePosition(leverageManagerAddress, trader, tokenId)


  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])

  const modalHeader = useCallback(() => {
    return (<div>

    </div>
    )
  }, [onAcceptChanges, shouldLogModalCloseEvent])

  const modalBottom = useCallback(() => {
    return (<div></div>)
  }, [
    onConfirm
  ])

  // text to show while loading
  const pendingText = (
    <Trans>
      text here
    </Trans>
  )

  const confirmationContent = useCallback(
    () =>
      (
        <ConfirmationModalContent
          title={<Trans>Close Position</Trans>}
          onDismiss={onModalDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onModalDismiss, modalBottom, modalHeader]
  )

  return (
    <Trace modal={InterfaceModalName.CONFIRM_SWAP}>
      <TransactionConfirmationModal
        isOpen={isOpen}
        onDismiss={onModalDismiss}
        attemptingTxn={false}
        hash={""}
        content={confirmationContent}
        pendingText={pendingText}
        currencyToAdd={undefined}
      />
    </Trace>
  )
}