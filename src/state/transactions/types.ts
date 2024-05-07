import { TradeType } from '@uniswap/sdk-core'

export interface SerializableTransactionReceipt {
  to: string
  from: string
  contractAddress: string
  transactionIndex: number
  blockHash: string
  transactionHash: string
  blockNumber: number
  status?: number
}

/**
 * Be careful adding to this enum, always assign a unique value (typescript will not prevent duplicate values).
 * These values is persisted in state and if you change the value it will cause errors
 */
export enum TransactionType {
  APPROVAL = 0,
  SWAP,
  DEPOSIT_LIQUIDITY_STAKING,
  WITHDRAW_LIQUIDITY_STAKING,
  CLAIM,
  DELEGATE,
  WRAP,
  CREATE_V3_POOL,
  ADD_LIQUIDITY_V3_POOL,
  ADD_LIQUIDITY_V2_POOL,
  MIGRATE_LIQUIDITY_V3,
  COLLECT_FEES,
  REMOVE_LIQUIDITY_V3,
  SUBMIT_PROPOSAL,
  QUEUE,
  EXECUTE,
  BUY,
  SEND,
  RECEIVE,
  MINT,
  BURN,
  BORROW,
  REPAY,
  DEPLOY,
  CANCEL,

  // limitless actions
  ADD_LEVERAGE,
  REDUCE_LEVERAGE,
  PREMIUM_DEPOSIT,
  PREMIUM_WITHDRAW,
  ADD_LMT_LIQUIDITY,
  REMOVE_LMT_LIQUIDITY,
  ADD_LIMIT_ORDER,
  REDUCE_LIMIT_ORDER,
  CREATE_REFERRAL,
  USE_REFERRAL,
  CANCEL_LIMIT_ORDER,
  MINT_LLP,
  REDEEM_LLP,
  MINT_limWETH,
  REDEEM_limWETH,
  UNLOCK_Box,
  ADD_Box,
  ZAP_AND_MINT,
}

interface BaseTransactionInfo {
  type: TransactionType
}

export interface QueueTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.QUEUE
  governorAddress: string
  proposalId: number
}

export interface ExecuteTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.EXECUTE
  governorAddress: string
  proposalId: number
}

export interface DelegateTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.DELEGATE
  delegatee: string
}

export interface ApproveTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.APPROVAL
  tokenAddress: string
  spender: string
}

interface BaseSwapTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.SWAP
  tradeType: TradeType
  inputCurrencyId: string
  outputCurrencyId: string
}

export interface ExactInputSwapTransactionInfo extends BaseSwapTransactionInfo {
  tradeType: TradeType.EXACT_INPUT
  inputCurrencyAmountRaw: string
  expectedOutputCurrencyAmountRaw: string
  minimumOutputCurrencyAmountRaw: string
}
export interface ExactOutputSwapTransactionInfo extends BaseSwapTransactionInfo {
  tradeType: TradeType.EXACT_OUTPUT
  outputCurrencyAmountRaw: string
  expectedInputCurrencyAmountRaw: string
  maximumInputCurrencyAmountRaw: string
}

interface DepositLiquidityStakingTransactionInfo {
  type: TransactionType.DEPOSIT_LIQUIDITY_STAKING
  token0Address: string
  token1Address: string
}

interface WithdrawLiquidityStakingTransactionInfo {
  type: TransactionType.WITHDRAW_LIQUIDITY_STAKING
  token0Address: string
  token1Address: string
}

export interface WrapTransactionInfo {
  type: TransactionType.WRAP
  unwrapped: boolean
  currencyAmountRaw: string
  chainId?: number
}

export interface ClaimTransactionInfo {
  type: TransactionType.CLAIM
  recipient: string
  uniAmountRaw?: string
}

export interface CreateV3PoolTransactionInfo {
  type: TransactionType.CREATE_V3_POOL
  baseCurrencyId: string
  quoteCurrencyId: string
}

export interface AddLiquidityV3PoolTransactionInfo {
  type: TransactionType.ADD_LIQUIDITY_V3_POOL
  createPool: boolean
  baseCurrencyId: string
  quoteCurrencyId: string
  feeAmount: number
  expectedAmountBaseRaw: string
  expectedAmountQuoteRaw: string
}

export interface AddLmtLiquidityTransactionInfo {
  type: TransactionType.ADD_LMT_LIQUIDITY
  baseCurrencyId: string
  quoteCurrencyId: string
  expectedAmountBaseRaw: string
  expectedAmountQuoteRaw: string
}

export interface AddLiquidityV2PoolTransactionInfo {
  type: TransactionType.ADD_LIQUIDITY_V2_POOL
  baseCurrencyId: string
  quoteCurrencyId: string
  expectedAmountBaseRaw: string
  expectedAmountQuoteRaw: string
}

export interface MigrateV2LiquidityToV3TransactionInfo {
  type: TransactionType.MIGRATE_LIQUIDITY_V3
  baseCurrencyId: string
  quoteCurrencyId: string
  isFork: boolean
}

export interface CollectFeesTransactionInfo {
  type: TransactionType.COLLECT_FEES
  currencyId0: string
  currencyId1: string
  expectedCurrencyOwed0: string
  expectedCurrencyOwed1: string
}

export interface RemoveLiquidityV3TransactionInfo {
  type: TransactionType.REMOVE_LIQUIDITY_V3
  baseCurrencyId: string
  quoteCurrencyId: string
  expectedAmountBaseRaw: string
  expectedAmountQuoteRaw: string
}

export interface RemoveLmtLiquidityTransactionInfo {
  type: TransactionType.REMOVE_LMT_LIQUIDITY
  baseCurrencyId: string
  quoteCurrencyId: string
  expectedAmountBaseRaw: string
  expectedAmountQuoteRaw: string
}

interface SubmitProposalTransactionInfo {
  type: TransactionType.SUBMIT_PROPOSAL
}

// LIMITLESS INFO

export interface ReduceLeveragePositionTransactionInfo {
  type: TransactionType.REDUCE_LEVERAGE
  reduceAmount: number
  inputCurrencyId: string
  outputCurrencyId: string
  pnl: number
  timestamp: string
}

export interface AddLimitOrderTransactionInfo {
  type: TransactionType.ADD_LIMIT_ORDER
  inputCurrencyId: string
  outputCurrencyId: string
  margin: string
  startingPrice: string
}

export interface ReduceLimitOrderTransactionInfo {
  type: TransactionType.REDUCE_LIMIT_ORDER
  inputCurrencyId: string
  outputCurrencyId: string
}

export interface CancelLimitOrderTransactionInfo {
  type: TransactionType.CANCEL_LIMIT_ORDER
  inputCurrencyId: string
  outputCurrencyId: string
}

export interface CancelLimitOrderTransactionInfo {
  type: TransactionType.CANCEL_LIMIT_ORDER
  inputCurrencyId: string
  outputCurrencyId: string
  isAdd: boolean
}

export interface CreateReferralCodeTransactionInfo {
  type: TransactionType.CREATE_REFERRAL
  inputCurrencyId: string
  outputCurrencyId: string
}
export interface UseReferralCodeTransactionInfo {
  type: TransactionType.USE_REFERRAL
  inputCurrencyId: string
  outputCurrencyId: string
}

export interface PremiumDepositTransactionInfo {
  type: TransactionType.PREMIUM_DEPOSIT
  inputCurrencyId: string
  outputCurrencyId: string
  amount: string
}

export interface PremiumWithdrawTransactionInfo {
  type: TransactionType.PREMIUM_WITHDRAW
  inputCurrencyId: string
  outputCurrencyId: string
  amount: string
}

export interface AddLeverageTransactionInfo {
  type: TransactionType.ADD_LEVERAGE
  margin: string
  inputCurrencyId: string
  outputCurrencyId: string
  expectedAddedPosition: string
}

export interface MintLLPInfo {
  type: TransactionType.MINT_LLP
  inputCurrencyId: string
  outputCurrencyId: string
}

export interface RedeemLLPInfo {
  type: TransactionType.REDEEM_LLP
  inputCurrencyId: string
  outputCurrencyId: string
}

export interface MintlimWETHInfo {
  type: TransactionType.MINT_limWETH
  inputCurrencyId: string
  outputCurrencyId: string
}

export interface RedeemlimWETHInfo {
  type: TransactionType.REDEEM_limWETH
  inputCurrencyId: string
  outputCurrencyId: string
}

export interface UnlockBoxInfo {
  type: TransactionType.UNLOCK_Box
  inputCurrencyId: string
  outputCurrencyId: string
}

export interface AddBoxInfo {
  type: TransactionType.ADD_Box
  inputCurrencyId: string
  outputCurrencyId: string
}

export interface ZapAndMintInfo {
  type: TransactionType.ZAP_AND_MINT
  inputCurrencyId: string
  outputCurrencyId: string
}

export type TransactionInfo =
  | ApproveTransactionInfo
  | ExactOutputSwapTransactionInfo
  | ExactInputSwapTransactionInfo
  | ClaimTransactionInfo
  | QueueTransactionInfo
  | ExecuteTransactionInfo
  | DelegateTransactionInfo
  | DepositLiquidityStakingTransactionInfo
  | WithdrawLiquidityStakingTransactionInfo
  | WrapTransactionInfo
  | CreateV3PoolTransactionInfo
  | AddLiquidityV3PoolTransactionInfo
  | AddLiquidityV2PoolTransactionInfo
  | MigrateV2LiquidityToV3TransactionInfo
  | CollectFeesTransactionInfo
  | RemoveLiquidityV3TransactionInfo
  | RemoveLmtLiquidityTransactionInfo
  | SubmitProposalTransactionInfo
  | ReduceLeveragePositionTransactionInfo
  | AddLeverageTransactionInfo
  | AddLmtLiquidityTransactionInfo
  | AddLimitOrderTransactionInfo
  | ReduceLimitOrderTransactionInfo
  | CreateReferralCodeTransactionInfo
  | UseReferralCodeTransactionInfo
  | CancelLimitOrderTransactionInfo
  | PremiumDepositTransactionInfo
  | PremiumWithdrawTransactionInfo
  | MintLLPInfo
  | RedeemLLPInfo
  | MintlimWETHInfo
  | RedeemlimWETHInfo
  | UnlockBoxInfo
  | AddBoxInfo
  | ZapAndMintInfo

export interface TransactionDetails {
  hash: string
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
  info: TransactionInfo
}
