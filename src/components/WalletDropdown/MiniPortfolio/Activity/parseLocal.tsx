import { t } from '@lingui/macro'
import { formatCurrencyAmount, formatNumber, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { Descriptor } from 'components/Popups/TransactionPopup'
import { SupportedChainId } from 'constants/chains'
import { nativeOnChain } from 'constants/tokens'
import { TransactionPartsFragment, TransactionStatus } from 'graphql/data/__generated__/types-and-hooks'
import { formatSymbol } from 'lib/utils/formatSymbol'
import { useMemo } from 'react'
import { TokenAddressMap, useCombinedActiveList } from 'state/lists/hooks'
import { useMultichainTransactions } from 'state/transactions/hooks'
import {
  AddLeverageTransactionInfo,
  AddLimitOrderTransactionInfo,
  AddLiquidityV2PoolTransactionInfo,
  AddLiquidityV3PoolTransactionInfo,
  ApproveTransactionInfo,
  CancelLimitOrderTransactionInfo,
  CollectFeesTransactionInfo,
  CreateV3PoolTransactionInfo,
  ExactInputSwapTransactionInfo,
  ExactOutputSwapTransactionInfo,
  MigrateV2LiquidityToV3TransactionInfo,
  PremiumDepositTransactionInfo,
  PremiumWithdrawTransactionInfo,
  ReduceLeveragePositionTransactionInfo,
  ReduceLimitOrderTransactionInfo,
  RemoveLiquidityV3TransactionInfo,
  TransactionDetails,
  TransactionType,
  WrapTransactionInfo,
  ZapAndMintInfo,
} from 'state/transactions/types'
import { useChainId } from 'wagmi'

import { getActivityTitle } from '../constants'
import { Activity, ActivityMap } from './types'
import { useDefaultActiveTokens } from 'hooks/Tokens'

export function getCurrency(
  currencyId: string,
  chainId: SupportedChainId,
  tokens?: TokenAddressMap
): Currency | undefined {
  // if (SupportedChainId.SEPOLIA === chainId) return FakeTokensMapSepolia[currencyId]
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
  tokens: {
    [address: string]: Token;
  }
): Partial<Activity> {

  const tokenIn = tokens[swap.inputCurrencyId]
  const tokenOut = tokens[swap.outputCurrencyId]
  // const tokenIn = getCurrency(swap.inputCurrencyId, chainId, tokens)
  // const tokenOut = getCurrency(swap.outputCurrencyId, chainId, tokens)
  const [inputRaw, outputRaw] =
    swap.tradeType === TradeType.EXACT_INPUT
      ? [swap.inputCurrencyAmountRaw, swap.expectedOutputCurrencyAmountRaw]
      : [swap.expectedInputCurrencyAmountRaw, swap.outputCurrencyAmountRaw]

  return {
    descriptor: buildCurrencyDescriptor(tokenIn, inputRaw, tokenOut, outputRaw),
    currencies: [tokenIn, tokenOut],
  }
}

function parseAddLeverage(
  info: AddLeverageTransactionInfo,
  chainId: SupportedChainId,
  tokens: {
    [address: string]: Token;
  }
): Partial<Activity> {
  // const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  // const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)
  const tokenIn = tokens[info.inputCurrencyId]
  const tokenOut = tokens[info.outputCurrencyId]

  const paidAmount = info.margin

  const addedPosition = info.expectedAddedPosition

  const descriptor = (
    <Descriptor color="textSecondary">
      {`Deposited ${paidAmount} ${formatSymbol(
        info.marginInPosToken ? tokenOut?.symbol : tokenIn?.symbol
      )}, Received ${addedPosition} ${formatSymbol(tokenOut?.symbol)}`}
    </Descriptor>
  )

  return {
    descriptor,
    currencies: [tokenIn, tokenOut],
  }
}

function parsePremiumDeposit(
  info: PremiumDepositTransactionInfo,
  chainId: SupportedChainId,
  tokens: {
    [address: string]: Token;
  }
): Partial<Activity> {
  
  const tokenIn = tokens[info.inputCurrencyId]
  const tokenOut = tokens[info.outputCurrencyId]
  // const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  // const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)

  const descriptor = `Deposited ${info.amount} into ${tokenOut?.symbol}/${tokenIn?.symbol} Position`

  return {
    descriptor,
    currencies: [tokenIn, tokenOut],
  }
}

function parsePremiumWithdraw(
  info: PremiumWithdrawTransactionInfo,
  chainId: SupportedChainId,
  tokens: {
    [address: string]: Token;
  }
): Partial<Activity> {
  
  const tokenIn = tokens[info.inputCurrencyId]
  const tokenOut = tokens[info.outputCurrencyId]
  // const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  // const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)

  const descriptor = `Withdrew ${info.amount} from ${tokenOut?.symbol}/${tokenIn?.symbol} Position`

  return {
    descriptor,
    currencies: [tokenIn, tokenOut],
  }
}

function parseAddLimitOrder(
  info: AddLimitOrderTransactionInfo,
  chainId: SupportedChainId,
  tokens: {
    [address: string]: Token;
  }
): Partial<Activity> {
  
  const tokenIn = tokens[info.inputCurrencyId]
  const tokenOut = tokens[info.outputCurrencyId]
  // const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  // const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)

  const descriptor = `Add Limit Order Created for ${tokenOut?.symbol}/${tokenIn?.symbol} Position`

  return {
    descriptor,
    currencies: [tokenIn, tokenOut],
  }
}

function parseReduceLimitOrder(
  info: ReduceLimitOrderTransactionInfo,
  chainId: SupportedChainId,
  tokens: {
    [address: string]: Token;
  }
): Partial<Activity> {
  
  const tokenIn = tokens[info.inputCurrencyId]
  const tokenOut = tokens[info.outputCurrencyId]
  // const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  // const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)

  const descriptor = `Reduce Limit Order Created for ${tokenOut?.symbol}/${tokenIn?.symbol} Position`

  return {
    descriptor,
    currencies: [tokenIn, tokenOut],
  }
}

function parseCancelLimitOrder(
  info: CancelLimitOrderTransactionInfo,
  chainId: SupportedChainId,
  tokens: {
    [address: string]: Token;
  }
): Partial<Activity> {
  const tokenIn = tokens[info.inputCurrencyId]
  const tokenOut = tokens[info.outputCurrencyId]
  // const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  // const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)

  const descriptor = `Cancel ${info.isAdd ? 'Add' : 'Remove'} Limit Order Created for ${tokenOut?.symbol}/${
    tokenIn?.symbol
  } Position`

  return {
    descriptor,
    currencies: [tokenIn, tokenOut],
  }
}

function parseMintLLP(
  info: CancelLimitOrderTransactionInfo,
  chainId: SupportedChainId,
  tokens: TokenAddressMap
): Partial<Activity> {
  // const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  // const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)

  const descriptor = `Cancel LLP Mint`

  return {
    descriptor,
    currencies: [],
  }
}

function parseRedeemLLP(
  info: CancelLimitOrderTransactionInfo,
  chainId: SupportedChainId,
  tokens: TokenAddressMap
): Partial<Activity> {
  // const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  // const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)

  const descriptor = `Cancel LLP Redeem`

  return {
    descriptor,
    currencies: [],
  }
}
function parseReduceLeverage(
  info: ReduceLeveragePositionTransactionInfo,
  chainId: SupportedChainId,
  tokens: {
    [address: string]: Token;
  }
): Partial<Activity> {
  // const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  // const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)
  const tokenIn = tokens[info.inputCurrencyId]
  const tokenOut = tokens[info.outputCurrencyId]
  const reduceAmount = formatNumber(-info.reduceAmount, NumberType.SwapTradeAmount)

  const PnL = formatNumber(info.pnl, NumberType.SwapTradeAmount)

  const descriptor = `Reduced Position by ${reduceAmount} ${tokenOut?.symbol}, PnL of ${PnL} ${
    info.marginInPosToken ? tokenOut?.symbol : tokenIn?.symbol
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
  tokens: {
    [address: string]: Token;
  }
): Partial<Activity> {
  // TODO: Add 'amount' approved to ApproveTransactionInfo so we can distinguish between revoke and approve
  const currency = tokens[approval.tokenAddress]
  // const currency = getCurrency(approval.tokenAddress, chainId, tokens)
  console.log('CURRENCY', currency)
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
function parseLP(
  lp: GenericLPInfo, 
  chainId: SupportedChainId, 
  tokens: {
    [address: string]: Token;
  }): Partial<Activity> {
  
  const baseCurrency = tokens[lp.baseCurrencyId]
  const quoteCurrency = tokens[lp.quoteCurrencyId]
  
  // const baseCurrency = getCurrency(lp.baseCurrencyId, chainId, tokens)
  // const quoteCurrency = getCurrency(lp.quoteCurrencyId, chainId, tokens)
  const [baseRaw, quoteRaw] = [lp.expectedAmountBaseRaw, lp.expectedAmountQuoteRaw]
  const descriptor = buildCurrencyDescriptor(baseCurrency, baseRaw, quoteCurrency, quoteRaw, t`and`)

  return { descriptor, currencies: [baseCurrency, quoteCurrency] }
}

function parseCollectFees(
  collect: CollectFeesTransactionInfo,
  chainId: SupportedChainId,
  tokens: {
    [address: string]: Token;
  }): Partial<Activity> {
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
  tokens: {
    [address: string]: Token;
  }): Partial<Activity> {
  const baseCurrency = tokens[lp.baseCurrencyId]
  const quoteCurrency = tokens[lp.quoteCurrencyId]

  // const baseCurrency = getCurrency(lp.baseCurrencyId, chainId, tokens)
  const baseSymbol = baseCurrency?.symbol ?? t`Unknown`
  // const quoteCurrency = getCurrency(lp.baseCurrencyId, chainId, tokens)
  const quoteSymbol = quoteCurrency?.symbol ?? t`Unknown`
  const descriptor = t`${baseSymbol} and ${quoteSymbol}`

  return { descriptor, currencies: [baseCurrency, quoteCurrency] }
}

function parseZapOrder(
  info: ZapAndMintInfo, 
  chainId: SupportedChainId, 
  tokens: {
    [address: string]: Token;
  }): Partial<Activity> {
  
  const tokenIn = tokens[info.inputCurrencyId]
  const tokenOut = tokens[info.outputCurrencyId]
  // const tokenIn = getCurrency(info.inputCurrencyId, chainId, tokens)
  // const tokenOut = getCurrency(info.outputCurrencyId, chainId, tokens)
  // console.log('parseZapOrder', tokenIn?.symbol)
  const descriptor = (
    <Descriptor marginTop="5px" color="textSecondary">
      Minted Amount: {info.mintAmount} {tokenIn?.symbol}, <br /> Returned Amount: {info.returnAmount} {tokenIn?.symbol}
    </Descriptor>
  )

  return {
    descriptor,
    currencies: [tokenIn, tokenOut],
  }
}

export function parseLocalActivity(
  details: TransactionDetails,
  chainId: SupportedChainId,
  tokens: {
    [address: string]: Token;
  }
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
  } else if (info.type === TransactionType.REDUCE_LEVERAGE) {
    additionalFields = parseReduceLeverage(info, chainId, tokens)
  } else if (info.type === TransactionType.PREMIUM_DEPOSIT) {
    additionalFields = parsePremiumDeposit(info, chainId, tokens)
  } else if (info.type === TransactionType.PREMIUM_WITHDRAW) {
    additionalFields = parsePremiumWithdraw(info, chainId, tokens)
  } else if (info.type === TransactionType.ADD_LIMIT_ORDER) {
    additionalFields = parseAddLimitOrder(info, chainId, tokens)
  } else if (info.type === TransactionType.REDUCE_LIMIT_ORDER) {
    additionalFields = parseReduceLimitOrder(info, chainId, tokens)
  } else if (info.type === TransactionType.CANCEL_LIMIT_ORDER) {
    additionalFields = parseCancelLimitOrder(info, chainId, tokens)
  } else if (info.type === TransactionType.ZAP_AND_MINT) {
    additionalFields = parseZapOrder(info, chainId, tokens)
  }

  return { ...defaultFields, ...additionalFields }
}

export function useLocalActivities(): ActivityMap | undefined {
  const allTransactions = useMultichainTransactions()
  const chainId = useChainId()
  const tokens = useDefaultActiveTokens()
  // const tokens = useCombinedActiveList()

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
