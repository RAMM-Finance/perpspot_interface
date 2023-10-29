import { Trans } from '@lingui/macro'
import { Trace } from '@uniswap/analytics'
import { InterfaceModalName } from '@uniswap/analytics-events'
import { Trade } from '@uniswap/router-sdk'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { useCurrency } from 'hooks/Tokens'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import { AddMarginTrade, PreTradeInfo } from 'state/marginTrading/hooks'
import { InterfaceTrade } from 'state/routing/types'
import { Field } from 'state/swap/actions'
import { BorrowCreationDetails, useSwapState } from 'state/swap/hooks'
import { MarginPositionDetails } from 'types/lmtv2position'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { marginTradeMeaningfullyDiffers, tradeMeaningfullyDiffers } from 'utils/tradeMeaningFullyDiffer'

import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../TransactionConfirmationModal'
import SwapModalFooter, { BorrowModalFooter, LeverageModalFooter } from './SwapModalFooter'
import SwapModalHeader, { BorrowModalHeader, LeverageModalHeader } from './SwapModalHeader'

export default function ConfirmSwapModal({
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  swapQuoteReceivedDate,
  fiatValueInput,
  fiatValueOutput,
}: {
  isOpen: boolean
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
  originalTrade: Trade<Currency, Currency, TradeType> | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  recipient: string | null
  allowedSlippage: Percent
  onAcceptChanges: () => void
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  onDismiss: () => void
  swapQuoteReceivedDate: Date | undefined
  fiatValueInput: { data?: number; isLoading: boolean }
  fiatValueOutput: { data?: number; isLoading: boolean }
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)
  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade]
  )

  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])

  const modalHeader = useCallback(() => {
    return trade ? (
      <SwapModalHeader
        trade={trade}
        shouldLogModalCloseEvent={shouldLogModalCloseEvent}
        setShouldLogModalCloseEvent={setShouldLogModalCloseEvent}
        allowedSlippage={allowedSlippage}
        recipient={recipient}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null
  }, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade, shouldLogModalCloseEvent])

  const modalBottom = useCallback(() => {
    return trade ? (
      <SwapModalFooter
        onConfirm={onConfirm}
        trade={trade}
        hash={txHash}
        allowedSlippage={allowedSlippage}
        disabledConfirm={showAcceptChanges}
        swapErrorMessage={swapErrorMessage}
        swapQuoteReceivedDate={swapQuoteReceivedDate}
        fiatValueInput={fiatValueInput}
        fiatValueOutput={fiatValueOutput}
      />
    ) : null
  }, [
    onConfirm,
    showAcceptChanges,
    swapErrorMessage,
    trade,
    allowedSlippage,
    txHash,
    swapQuoteReceivedDate,
    fiatValueInput,
    fiatValueOutput,
  ])

  // text to show while loading
  const pendingText = (
    <Trans>
      Swapping {trade?.inputAmount?.toSignificant(6)} {trade?.inputAmount?.currency?.symbol} for{' '}
      {trade?.outputAmount?.toSignificant(6)} {trade?.outputAmount?.currency?.symbol}
    </Trans>
  )

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onModalDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title={<Trans>Confirm Swap</Trans>}
          onDismiss={onModalDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onModalDismiss, modalBottom, modalHeader, swapErrorMessage]
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
        currencyToAdd={trade?.outputAmount.currency}
      />
    </Trace>
  )
}

export function LeverageConfirmModal({
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  tradeErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  preTradeInfo,
  existingPosition,
}: // swapQuoteReceivedDate,
// fiatValueInput,
// fiatValueOutput,
{
  isOpen: boolean
  trade: AddMarginTrade | undefined
  originalTrade: AddMarginTrade | undefined
  preTradeInfo: PreTradeInfo | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  allowedSlippage: Percent
  onAcceptChanges: () => void
  onConfirm: () => void
  tradeErrorMessage: ReactNode | undefined
  onDismiss: () => void
  existingPosition: MarginPositionDetails | undefined

  // swapQuoteReceivedDate: Date | undefined
  // fiatValueInput: { data?: number; isLoading: boolean }
  // fiatValueOutput: { data?: number; isLoading: boolean }
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)
  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && marginTradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade]
  )

  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])

  const modalHeader = useCallback(() => {
    return trade && preTradeInfo && existingPosition ? (
      <LeverageModalHeader
        trade={trade}
        preTradeInfo={preTradeInfo}
        existingPosition={existingPosition}
        recipient={null}
        allowedSlippage={allowedSlippage}
        showAcceptChanges={false}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null
  }, [allowedSlippage, onAcceptChanges, trade, preTradeInfo, existingPosition])

  const modalBottom = useCallback(() => {
    return trade ? (
      <LeverageModalFooter
        onConfirm={onConfirm}
        tradeErrorMessage={tradeErrorMessage}
        trade={trade}
        hash={txHash}
        allowedSlippage={allowedSlippage}
        disabledConfirm={false}
      />
    ) : null
  }, [allowedSlippage, onConfirm, trade, txHash, tradeErrorMessage])

  // text to show while loading
  const pendingText = (
    <Trans>
      Borrowing {trade?.borrowAmount?.toExact()} {trade?.margin?.currency?.symbol} and Recieving{' '}
      {formatCurrencyAmount(trade?.swapOutput, 18)} {trade?.swapOutput?.currency?.symbol}
    </Trans>
  )

  const confirmationContent = useCallback(
    () =>
      tradeErrorMessage ? (
        <TransactionErrorContent onDismiss={onModalDismiss} message={tradeErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title={
            <Trans>
              Confirm x
              {trade?.margin && trade?.borrowAmount
                ? formatCurrencyAmount(trade.margin.add(trade?.borrowAmount).divide(trade.margin), 4)
                : '-'}{' '}
              Leverage Position
            </Trans>
          }
          onDismiss={onModalDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onModalDismiss, modalBottom, modalHeader, trade, tradeErrorMessage]
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
        currencyToAdd={trade?.swapOutput?.currency}
      />
    </Trace>
  )
}

export function BorrowConfirmModal({
  borrowTrade,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  errorMessage,
  isOpen,
  attemptingTxn,
  txHash,
}: // fiatValueInput,
// fiatValueOutput,
{
  borrowTrade?: BorrowCreationDetails
  isOpen: boolean
  attemptingTxn: boolean
  txHash: string | undefined
  recipient: string | null
  allowedSlippage: Percent
  onConfirm: () => void
  errorMessage: ReactNode | undefined
  onDismiss: () => void
  // fiatValueInput: { data?: number; isLoading: boolean }
  // fiatValueOutput: { data?: number; isLoading: boolean }
}) {
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    ltv,
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const onModalDismiss = useCallback(() => {
    onDismiss()
  }, [isOpen, onDismiss])

  const modalHeader = useCallback(() => {
    return (
      <BorrowModalHeader
        trade={borrowTrade}
        inputCurrency={inputCurrency ?? undefined}
        outputCurrency={outputCurrency ?? undefined}
        recipient={recipient}
      />
    )
  }, [borrowTrade, allowedSlippage, recipient])

  const modalBottom = useCallback(() => {
    return (
      <BorrowModalFooter
        borrowTrade={borrowTrade}
        onConfirm={onConfirm}
        errorMessage={errorMessage}
        disabledConfirm={false}
      />
    )
  }, [
    onConfirm,
    allowedSlippage,
    txHash,
    borrowTrade,
    // fiatValueInput,
    // fiatValueOutput,
  ])

  // text to show while loading
  const pendingText = (
    <Trans>
      Recieving {formatBNToString(borrowTrade?.borrowedAmount)} {outputCurrency?.symbol}
    </Trans>
  )

  const confirmationContent = useCallback(
    () =>
      errorMessage ? (
        <TransactionErrorContent onDismiss={onModalDismiss} message={errorMessage} />
      ) : (
        <ConfirmationModalContent
          title={<Trans>Confirm {ltv}% LTV Borrow Position</Trans>}
          onDismiss={onModalDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onModalDismiss, modalBottom, modalHeader, errorMessage]
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
        currencyToAdd={outputCurrency ?? undefined}
      />
    </Trace>
  )
}
