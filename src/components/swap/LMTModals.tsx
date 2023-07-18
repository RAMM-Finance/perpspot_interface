import { Trans } from '@lingui/macro'
import { Trace } from '@uniswap/analytics'
import { InterfaceModalName } from '@uniswap/analytics-events'
import { ReduceLeverageModalFooter } from 'components/modalFooters/ReduceLeverageModalFooter'
import { useLiquidityManagerContract } from 'hooks/useContract'
import { useLimitlessPositionFromTokenId } from 'hooks/useV3Positions'
import { useCallback, useState } from 'react'
import { useTransactionAdder } from 'state/transactions/hooks'

import TransactionConfirmationModal, { ConfirmationModalContent } from '../TransactionConfirmationModal'
import { BorrowPremiumPositionDetails, ReduceBorrowDetails, ReduceLeveragePositionDetails } from './AdvancedSwapDetails'
import {
  AddPremiumBorrowModalFooter,
  AddPremiumLeverageModalFooter,
  BorrowReduceCollateralModalFooter,
  BorrowReduceDebtModalFooter,
} from './SwapModalFooter'

export default function ReducePositionModal({
  trader,
  isOpen,
  tokenId,
  leverageManagerAddress,
  onDismiss,
  onAcceptChanges,
  onConfirm,
}: {
  trader: string | undefined
  isOpen: boolean
  tokenId: string | undefined
  leverageManagerAddress: string | undefined
  onDismiss: () => void
  onAcceptChanges: () => void
  onConfirm: () => void
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)

  const { loading, error, position } = useLimitlessPositionFromTokenId(tokenId)
  const [txHash, setTxHash] = useState('')
  // const [positionData, setPositionData] = useState<TransactionPositionDetails>()
  const [attemptingTxn, setAttemptingTxn] = useState(false)

  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])

  const modalHeader = useCallback(() => {
    return <ReduceLeveragePositionDetails loading={loading} leverageTrade={position} />
  }, [position, loading])

  const modalBottom = useCallback(() => {
    return (
      <ReduceLeverageModalFooter
        leverageManagerAddress={leverageManagerAddress}
        tokenId={tokenId}
        trader={trader}
        setAttemptingTxn={setAttemptingTxn}
        setTxHash={setTxHash}
        // setPositionData={setPositionData}
      />
    )
  }, [leverageManagerAddress, tokenId, trader])

  // text to show while loading
  const pendingText = <Trans>Loading...</Trans>

  const confirmationContent = useCallback(
    () => (
      <ConfirmationModalContent
        title={<Trans>Reduce Position</Trans>}
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
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
      />
    </Trace>
  )
}

export function AddLeveragePremiumModal({
  trader,
  tokenId,
  isOpen,
  onDismiss,
  onAcceptChanges,
  onConfirm,
}: {
  trader: string | undefined
  isOpen: boolean
  tokenId: string | undefined
  leverageManagerAddress: string | undefined
  onDismiss: () => void
  onAcceptChanges: () => void
  onConfirm: () => void
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState('')

  // console.log("args: ", trader, isOpen, tokenId, leverageManagerAddress)
  const { error, loading, position } = useLimitlessPositionFromTokenId(tokenId)

  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])
  // console.log("postionState: ", position)

  const modalHeader = useCallback(() => {
    return <ReduceLeveragePositionDetails loading={loading} leverageTrade={position} />
  }, [position, loading])

  const modalBottom = useCallback(() => {
    return (
      <AddPremiumLeverageModalFooter
        tokenId={tokenId}
        trader={trader}
        setAttemptingTxn={setAttemptingTxn}
        setTxHash={setTxHash}
      />
    )
  }, [tokenId, trader, setAttemptingTxn, setTxHash])

  // text to show while loading
  const pendingText = <Trans>Loading...</Trans>

  const confirmationContent = useCallback(
    () => (
      <ConfirmationModalContent
        title={<Trans>Add Premium</Trans>}
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
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
      />
    </Trace>
  )
}

export function AddBorrowPremiumModal({
  trader,
  tokenId,
  isOpen,
  onDismiss,
  onAcceptChanges,
  onConfirm,
}: {
  trader: string | undefined
  isOpen: boolean
  tokenId: string | undefined
  onDismiss: () => void
  onAcceptChanges: () => void
  onConfirm: () => void
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState('')

  const { loading, error, position } = useLimitlessPositionFromTokenId(tokenId)
  const liquidityManagerAddress = position?.liquidityManagerAddress
  const liquidityManager = useLiquidityManagerContract(liquidityManagerAddress, true)
  const addTransaction = useTransactionAdder()

  // const handleAddPremium = useCallback(() => {
  //   if (liquidityManager) {
  //     setAttemptingTxn(true)
  //     liquidityManager
  //       .payPremium(trader, true, position?.isToken0)
  //       .then((hash: any) => {
  //         addTransaction(hash, {
  //           type: TransactionType.PREMIUM_BORROW,
  //         })
  //         setAttemptingTxn(false)
  //         setTxHash(hash)
  //         console.log('add premium hash: ', hash)
  //       })
  //       .catch((err: any) => {
  //         setAttemptingTxn(false)
  //         console.log('error adding premium: ', err)
  //       })
  //   }
  // }, [])

  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])
  // console.log("postionState: ", position)

  const modalHeader = useCallback(() => {
    return <BorrowPremiumPositionDetails loading={loading} position={position} />
  }, [position, loading])

  const modalBottom = useCallback(() => {
    return (
      <AddPremiumBorrowModalFooter
        tokenId={tokenId}
        trader={trader}
        setTxHash={setTxHash}
        setAttemptingTxn={setAttemptingTxn}
        // handleAddPremium={handleAddPremium}
      />
    )
  }, [tokenId, trader])

  // text to show while loading
  const pendingText = <Trans>Loading...</Trans>

  const confirmationContent = useCallback(
    () => (
      <ConfirmationModalContent
        title={<Trans>Add Premium</Trans>}
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
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
      />
    </Trace>
  )
}

// reduceBorrowPosition(bool borrowBelow, bool reduceCollateral, bool getCollateralBack, uint256 reduceAmount)

export function ReduceBorrowCollateralModal({
  trader,
  isOpen,
  tokenId,
  onDismiss,
  onAcceptChanges,
  onConfirm,
}: {
  trader: string | undefined
  isOpen: boolean
  tokenId: string | undefined
  onDismiss: () => void
  onAcceptChanges: () => void
  onConfirm: () => void
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)

  const { loading, error, position } = useLimitlessPositionFromTokenId(tokenId)
  const [txHash, setTxHash] = useState('')
  const [attemptingTxn, setAttemptingTxn] = useState(false)

  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])

  const modalHeader = useCallback(() => {
    return <ReduceBorrowDetails loading={loading} position={position} />
  }, [position, loading])

  const modalBottom = useCallback(() => {
    return (
      <BorrowReduceCollateralModalFooter
        tokenId={tokenId}
        trader={trader}
        setAttemptingTxn={setAttemptingTxn}
        setTxHash={setTxHash}
      />
    )
  }, [tokenId, trader, setAttemptingTxn, setTxHash])

  // text to show while loading
  const pendingText = <Trans>Loading...</Trans>

  const confirmationContent = useCallback(
    () => (
      <ConfirmationModalContent
        title={<Trans>Reduce Collateral</Trans>}
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
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
      />
    </Trace>
  )
}

export function ReduceBorrowDebtModal({
  trader,
  isOpen,
  tokenId,
  onDismiss,
  onAcceptChanges,
  onConfirm,
}: {
  trader: string | undefined
  isOpen: boolean
  tokenId: string | undefined
  onDismiss: () => void
  onAcceptChanges: () => void
  onConfirm: () => void
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)

  const { loading, error, position } = useLimitlessPositionFromTokenId(tokenId)
  const [txHash, setTxHash] = useState('')
  const [attemptingTxn, setAttemptingTxn] = useState(false)

  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])

  const modalHeader = useCallback(() => {
    return <ReduceBorrowDetails loading={loading} position={position} />
  }, [position, loading])

  const modalBottom = useCallback(() => {
    return (
      <BorrowReduceDebtModalFooter
        tokenId={tokenId}
        trader={trader}
        setAttemptingTxn={setAttemptingTxn}
        setTxHash={setTxHash}
      />
    )
  }, [tokenId, trader, setAttemptingTxn, setTxHash])

  // text to show while loading
  const pendingText = <Trans>Loading...</Trans>

  const confirmationContent = useCallback(
    () => (
      <ConfirmationModalContent
        title={<Trans>Reduce Debt</Trans>}
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
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
      />
    </Trace>
  )
}
