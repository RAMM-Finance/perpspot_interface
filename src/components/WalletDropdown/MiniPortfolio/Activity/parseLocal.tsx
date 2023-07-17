import { t } from '@lingui/macro'
import { formatCurrencyAmount, formatNumber, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { nativeOnChain } from '@uniswap/smart-order-router'
import { useWeb3React } from '@web3-react/core'
import { Descriptor } from 'components/Popups/TransactionPopup'
import { SupportedChainId } from 'constants/chains'
import { FakeTokensMapSepolia } from 'constants/fake-tokens'
import { TransactionPartsFragment, TransactionStatus } from 'graphql/data/__generated__/types-and-hooks'
import { formatSymbol } from 'lib/utils/formatSymbol'
import { useMemo } from 'react'
import { TokenAddressMap, useCombinedActiveList } from 'state/lists/hooks'
import { useMultichainTransactions } from 'state/transactions/hooks'
import {
  AddBorrowPositionTransactionInfo,
  AddBorrowPremiumTransactionInfo,
  AddLeveragePremiumTransactionInfo,
  AddLeverageTransactionInfo,
  AddLiquidityV2PoolTransactionInfo,
  AddLiquidityV3PoolTransactionInfo,
  ApproveTransactionInfo,
  CollectFeesTransactionInfo,
  CreateV3PoolTransactionInfo,
  ExactInputSwapTransactionInfo,
  ExactOutputSwapTransactionInfo,
  MigrateV2LiquidityToV3TransactionInfo,
  ReduceBorrowCollateralTransactionInfo,
  ReduceBorrowDebtTransactionInfo,
  ReduceLeveragePositionTransactionInfo,
  RemoveLiquidityV3TransactionInfo,
  TransactionDetails,
  TransactionType,
  WrapTransactionInfo,
} from 'state/transactions/types'

import { getActivityTitle } from '../constants'
import { Activity, ActivityMap } from './types'

function getCurrency(currencyId: string, chainId: SupportedChainId, tokens?: TokenAddressMap): Currency | undefined {
  if (SupportedChainId.SEPOLIA === chainId) return FakeTokensMapSepolia[currencyId]
  if (tokens) {
    return currencyId === 'ETH' ? nativeOnChain(chainId) : tokens[chainId]?.[currencyId]?.token
  }
  return undefined
}

function buildCurrencyDescriptor(
  currencyA: Currency | undefined,
  amtA: string,
  currencyB: Currency | undefined,
  amtB: string,
  delimiter = t`for`
) {
  const formattedA = currencyA ? formatCurrencyAmount(CurrencyAmount.fromRawAmount(currencyA, amtA)) : t`Unknown`
  const symbolA = currencyA?.symbol ?? ''
  const formattedB = currencyB ? formatCurrencyAmount(CurrencyAmount.fromRawAmount(currencyB, amtB)) : t`Unknown`
  const symbolB = currencyB?.symbol ?? ''
  return [formattedA, symbolA, delimiter, formattedB, symbolB].filter(Boolean).join(' ')
}

function parseSwap(
  swap: ExactInputSwapTransactionInfo | ExactOutputSwapTransactionInfo,
  chainId: SupportedChainId,
  tokens: TokenAddressMap
): Partial<Activity> {
  const tokenIn = getCurrency(swap.inputCurrencyId, chainId, tokens)
  const tokenOut = getCurrency(swap.outputCurrencyId, chainId, tokens)
  const [inputRaw, outputRaw] =
    swap.tradeType === TradeType.EXACT_INPUT
      ? [swap.inputCurrencyAmountRaw, swap.expectedOutputCurrencyAmountRaw]
      : [swap.expectedInputCurrencyAmountRaw, swap.outputCurrencyAmountRaw]

  return {
    descriptor: buildCurrencyDescriptor(tokenIn, inputRaw, tokenOut, outputRaw),
    currencies: [tokenIn, tokenOut],
  }
}

const MAX_SIG_FIGS = 5

function parseAddLeverage(
  info: AddLeverageTransactionInfo,
  chainId: SupportedChainId,
  tokens: TokenAddressMap
): Partial<Activity> {
  const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)

  const paidAmount = formatNumber(info.inputAmount, NumberType.SwapTradeAmount)

  const addedPosition = formatNumber(info.expectedAddedPosition, NumberType.SwapTradeAmount)

  const descriptor = (
    <Descriptor color="textSecondary">
      {`${tokenOut?.symbol}/${tokenIn?.symbol}, +${addedPosition} ${formatSymbol(tokenOut?.symbol)}`}
    </Descriptor>
  )

  return {
    descriptor,
    currencies: [tokenIn, tokenOut],
  }
}

function parseReduceLeverage(
  info: ReduceLeveragePositionTransactionInfo,
  chainId: SupportedChainId,
  tokens: TokenAddressMap
): Partial<Activity> {
  const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)

  const reduceAmount = formatNumber(-info.reduceAmount, NumberType.SwapTradeAmount)

  const PnL = formatNumber(info.pnl, NumberType.SwapTradeAmount)

  const descriptor = `${tokenOut?.symbol}/${tokenIn?.symbol}, ${reduceAmount} ${tokenOut?.symbol}, PnL of ${PnL} ${tokenIn?.symbol}`

  return {
    descriptor,
    currencies: [tokenIn, tokenOut],
  }
}

function parseAddBorrow(
  info: AddBorrowPositionTransactionInfo,
  chainId: SupportedChainId,
  tokens: TokenAddressMap
): Partial<Activity> {
  const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)

  const formattedCollateralAmount = formatNumber(info.collateralAmount, NumberType.SwapTradeAmount)

  const formattedBorrowAmount = formatNumber(info.borrowedAmount, NumberType.SwapTradeAmount)

  const descriptor = `${tokenOut?.symbol}/${tokenIn?.symbol}, +${formattedBorrowAmount} ${tokenOut?.symbol}`

  return {
    descriptor,
    currencies: [tokenIn, tokenOut],
  }
}

function parseReduceBorrowDebt(
  info: ReduceBorrowDebtTransactionInfo,
  chainId: SupportedChainId,
  tokens: TokenAddressMap
): Partial<Activity> {
  const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)

  const reduceAmount = formatNumber(-info.reduceAmount, NumberType.SwapTradeAmount)
  const returnedAmount = formatNumber(info.expectedReturnedAmount, NumberType.SwapTradeAmount)
  // console.log('stuff', info.newTotalPosition, newTotalPosition)

  const descriptor = `${tokenOut?.symbol}/${tokenIn?.symbol}, ${reduceAmount} ${tokenOut?.symbol}${
    info.recieveCollateral ? `, received ${returnedAmount} ${tokenIn?.symbol}` : ''
  }`

  return {
    descriptor,
    currencies: [tokenIn, tokenOut],
  }
}

function parseReduceBorrowCollateral(
  info: ReduceBorrowCollateralTransactionInfo,
  chainId: SupportedChainId,
  tokens: TokenAddressMap
): Partial<Activity> {
  const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)

  const reduceAmount = formatNumber(-info.reduceAmount, NumberType.SwapTradeAmount)
  // const returnedAmount = formatNumber(info.expectedReturnedAmount, NumberType.SwapTradeAmount)

  const descriptor = `${tokenOut?.symbol}/${tokenIn?.symbol}, ${reduceAmount} ${tokenIn?.symbol}${
    info.recieveCollateral ? `, received ${info.expectedReturnedAmount} ${tokenIn?.symbol}` : ''
  }`

  return {
    descriptor,
    currencies: [tokenIn, tokenOut],
  }
}

function parseWrap(wrap: WrapTransactionInfo, chainId: SupportedChainId, status: TransactionStatus): Partial<Activity> {
  const native = nativeOnChain(chainId)
  const wrapped = native.wrapped
  const [input, output] = wrap.unwrapped ? [wrapped, native] : [native, wrapped]

  const descriptor = buildCurrencyDescriptor(input, wrap.currencyAmountRaw, output, wrap.currencyAmountRaw)
  const title = getActivityTitle(TransactionType.WRAP, status, wrap.unwrapped)
  const currencies = wrap.unwrapped ? [wrapped, native] : [native, wrapped]

  return { title, descriptor, currencies }
}

function parseApproval(
  approval: ApproveTransactionInfo,
  chainId: SupportedChainId,
  tokens: TokenAddressMap
): Partial<Activity> {
  // TODO: Add 'amount' approved to ApproveTransactionInfo so we can distinguish between revoke and approve
  const currency = getCurrency(approval.tokenAddress, chainId, tokens)
  const descriptor = currency?.symbol ?? currency?.name ?? t`Unknown`
  return {
    descriptor,
    currencies: [currency],
  }
}

type GenericLPInfo = Omit<
  AddLiquidityV3PoolTransactionInfo | RemoveLiquidityV3TransactionInfo | AddLiquidityV2PoolTransactionInfo,
  'type'
>
function parseLP(lp: GenericLPInfo, chainId: SupportedChainId, tokens: TokenAddressMap): Partial<Activity> {
  const baseCurrency = getCurrency(lp.baseCurrencyId, chainId, tokens)
  const quoteCurrency = getCurrency(lp.quoteCurrencyId, chainId, tokens)
  const [baseRaw, quoteRaw] = [lp.expectedAmountBaseRaw, lp.expectedAmountQuoteRaw]
  const descriptor = buildCurrencyDescriptor(baseCurrency, baseRaw, quoteCurrency, quoteRaw, t`and`)

  return { descriptor, currencies: [baseCurrency, quoteCurrency] }
}

function parseCollectFees(
  collect: CollectFeesTransactionInfo,
  chainId: SupportedChainId,
  tokens: TokenAddressMap
): Partial<Activity> {
  // Adapts CollectFeesTransactionInfo to generic LP type
  const {
    currencyId0: baseCurrencyId,
    currencyId1: quoteCurrencyId,
    expectedCurrencyOwed0: expectedAmountBaseRaw,
    expectedCurrencyOwed1: expectedAmountQuoteRaw,
  } = collect
  return parseLP({ baseCurrencyId, quoteCurrencyId, expectedAmountBaseRaw, expectedAmountQuoteRaw }, chainId, tokens)
}

function parseMigrateCreateV3(
  lp: MigrateV2LiquidityToV3TransactionInfo | CreateV3PoolTransactionInfo,
  chainId: SupportedChainId,
  tokens: TokenAddressMap
): Partial<Activity> {
  const baseCurrency = getCurrency(lp.baseCurrencyId, chainId, tokens)
  const baseSymbol = baseCurrency?.symbol ?? t`Unknown`
  const quoteCurrency = getCurrency(lp.baseCurrencyId, chainId, tokens)
  const quoteSymbol = quoteCurrency?.symbol ?? t`Unknown`
  const descriptor = t`${baseSymbol} and ${quoteSymbol}`

  return { descriptor, currencies: [baseCurrency, quoteCurrency] }
}

function parsePremiumLeverage(
  info: AddLeveragePremiumTransactionInfo,
  chainId: SupportedChainId,
  tokens: TokenAddressMap
) {
  const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)

  const descriptor = `${tokenOut?.symbol}/${tokenIn?.symbol} premium payment`

  return {
    descriptor,
    currencies: [tokenIn, tokenOut],
  }
}

function parsePremiumBorrow(info: AddBorrowPremiumTransactionInfo, chainId: SupportedChainId, tokens: TokenAddressMap) {
  const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)

  const descriptor = `${tokenOut?.symbol}/${tokenIn?.symbol} premium payment`

  return {
    descriptor,
    currencies: [tokenIn, tokenOut],
  }
}

export function parseLocalActivity(
  details: TransactionDetails,
  chainId: SupportedChainId,
  tokens: TokenAddressMap
): Activity | undefined {
  const status = !details.receipt
    ? TransactionStatus.Pending
    : details.receipt.status === 1 || details.receipt?.status === undefined
    ? TransactionStatus.Confirmed
    : TransactionStatus.Failed

  const receipt: TransactionPartsFragment | undefined = details.receipt
    ? {
        id: details.receipt.transactionHash,
        ...details.receipt,
        ...details,
        status,
      }
    : undefined

  const defaultFields = {
    hash: details.hash,
    chainId,
    title: getActivityTitle(details.info.type, status),
    status,
    timestamp: (details.confirmedTime ?? details.addedTime) / 1000,
    receipt,
  }

  let additionalFields: Partial<Activity> = {}
  const info = details.info
  if (info.type === TransactionType.SWAP) {
    additionalFields = parseSwap(info, chainId, tokens)
  } else if (info.type === TransactionType.APPROVAL) {
    additionalFields = parseApproval(info, chainId, tokens)
  } else if (info.type === TransactionType.WRAP) {
    additionalFields = parseWrap(info, chainId, status)
  } else if (
    info.type === TransactionType.ADD_LIQUIDITY_V3_POOL ||
    info.type === TransactionType.REMOVE_LIQUIDITY_V3 ||
    info.type === TransactionType.ADD_LIQUIDITY_V2_POOL
  ) {
    additionalFields = parseLP(info, chainId, tokens)
  } else if (info.type === TransactionType.COLLECT_FEES) {
    additionalFields = parseCollectFees(info, chainId, tokens)
  } else if (info.type === TransactionType.MIGRATE_LIQUIDITY_V3 || info.type === TransactionType.CREATE_V3_POOL) {
    additionalFields = parseMigrateCreateV3(info, chainId, tokens)
  } else if (info.type === TransactionType.ADD_LEVERAGE) {
    additionalFields = parseAddLeverage(info, chainId, tokens)
  } else if (info.type === TransactionType.ADD_BORROW) {
    additionalFields = parseAddBorrow(info, chainId, tokens)
  } else if (info.type === TransactionType.REDUCE_LEVERAGE) {
    additionalFields = parseReduceLeverage(info, chainId, tokens)
  } else if (info.type === TransactionType.REDUCE_BORROW_DEBT) {
    additionalFields = parseReduceBorrowDebt(info, chainId, tokens)
  } else if (info.type === TransactionType.REDUCE_BORROW_COLLATERAL) {
    additionalFields = parseReduceBorrowCollateral(info, chainId, tokens)
  } else if (info.type === TransactionType.PREMIUM_BORROW) {
    additionalFields = parsePremiumBorrow(info, chainId, tokens)
  } else if (info.type === TransactionType.PREMIUM_LEVERAGE) {
    additionalFields = parsePremiumLeverage(info, chainId, tokens)
  }

  return { ...defaultFields, ...additionalFields }
}

export function useLocalActivities(): ActivityMap | undefined {
  const allTransactions = useMultichainTransactions()
  const { chainId } = useWeb3React()
  const tokens = useCombinedActiveList()

  return useMemo(
    () =>
      chainId
        ? allTransactions.reduce((acc: { [hash: string]: Activity }, [transaction, chainId]) => {
            if (transaction.info.type === TransactionType.APPROVAL) return acc
            try {
              const localActivity = parseLocalActivity(transaction, chainId, tokens)
              if (localActivity) acc[localActivity.hash] = localActivity
            } catch (error) {
              console.error('Failed to parse local activity', transaction)
            }
            return acc
          }, {})
        : undefined,
    [allTransactions, chainId, tokens]
  )
}
