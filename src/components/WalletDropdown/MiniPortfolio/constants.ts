import { t } from '@lingui/macro'
import { TransactionStatus } from 'graphql/data/__generated__/types-and-hooks'
import { TransactionType } from 'state/transactions/types'

// use even number because rows are in groups of 2
export const DEFAULT_NFT_QUERY_AMOUNT = 26

const TransactionTitleTable: { [key in TransactionType]: { [state in TransactionStatus]: string } } = {
  [TransactionType.SWAP]: {
    [TransactionStatus.Pending]: t`Swapping`,
    [TransactionStatus.Confirmed]: t`Swapped`,
    [TransactionStatus.Failed]: t`Swap failed`,
  },
  [TransactionType.WRAP]: {
    [TransactionStatus.Pending]: t`Wrapping`,
    [TransactionStatus.Confirmed]: t`Wrapped`,
    [TransactionStatus.Failed]: t`Wrap failed`,
  },
  [TransactionType.ADD_LIQUIDITY_V3_POOL]: {
    [TransactionStatus.Pending]: t`Adding liquidity`,
    [TransactionStatus.Confirmed]: t`Added liquidity`,
    [TransactionStatus.Failed]: t`Add liquidity failed`,
  },
  [TransactionType.REMOVE_LIQUIDITY_V3]: {
    [TransactionStatus.Pending]: t`Removing liquidity`,
    [TransactionStatus.Confirmed]: t`Removed liquidity`,
    [TransactionStatus.Failed]: t`Remove liquidity failed`,
  },
  [TransactionType.CREATE_V3_POOL]: {
    [TransactionStatus.Pending]: t`Creating pool`,
    [TransactionStatus.Confirmed]: t`Created pool`,
    [TransactionStatus.Failed]: t`Create pool failed`,
  },
  [TransactionType.COLLECT_FEES]: {
    [TransactionStatus.Pending]: t`Collecting fees`,
    [TransactionStatus.Confirmed]: t`Collected fees`,
    [TransactionStatus.Failed]: t`Collect fees failed`,
  },
  [TransactionType.APPROVAL]: {
    [TransactionStatus.Pending]: t`Approving`,
    [TransactionStatus.Confirmed]: t`Approved`,
    [TransactionStatus.Failed]: t`Approval failed`,
  },
  [TransactionType.CLAIM]: {
    [TransactionStatus.Pending]: t`Claiming`,
    [TransactionStatus.Confirmed]: t`Claimed`,
    [TransactionStatus.Failed]: t`Claim failed`,
  },
  [TransactionType.BUY]: {
    [TransactionStatus.Pending]: t`Buying`,
    [TransactionStatus.Confirmed]: t`Bought`,
    [TransactionStatus.Failed]: t`Buy failed`,
  },
  [TransactionType.SEND]: {
    [TransactionStatus.Pending]: t`Sending`,
    [TransactionStatus.Confirmed]: t`Sent`,
    [TransactionStatus.Failed]: t`Send failed`,
  },
  [TransactionType.RECEIVE]: {
    [TransactionStatus.Pending]: t`Receiving`,
    [TransactionStatus.Confirmed]: t`Received`,
    [TransactionStatus.Failed]: t`Receive failed`,
  },
  [TransactionType.MINT]: {
    [TransactionStatus.Pending]: t`Minting`,
    [TransactionStatus.Confirmed]: t`Minted`,
    [TransactionStatus.Failed]: t`Mint failed`,
  },
  [TransactionType.BURN]: {
    [TransactionStatus.Pending]: t`Burning`,
    [TransactionStatus.Confirmed]: t`Burned`,
    [TransactionStatus.Failed]: t`Burn failed`,
  },
  [TransactionType.VOTE]: {
    [TransactionStatus.Pending]: t`Voting`,
    [TransactionStatus.Confirmed]: t`Voted`,
    [TransactionStatus.Failed]: t`Vote failed`,
  },
  [TransactionType.QUEUE]: {
    [TransactionStatus.Pending]: t`Queuing`,
    [TransactionStatus.Confirmed]: t`Queued`,
    [TransactionStatus.Failed]: t`Queue failed`,
  },
  [TransactionType.EXECUTE]: {
    [TransactionStatus.Pending]: t`Executing`,
    [TransactionStatus.Confirmed]: t`Executed`,
    [TransactionStatus.Failed]: t`Execute failed`,
  },
  [TransactionType.BORROW]: {
    [TransactionStatus.Pending]: t`Borrowing`,
    [TransactionStatus.Confirmed]: t`Borrowed`,
    [TransactionStatus.Failed]: t`Borrow failed`,
  },
  [TransactionType.REPAY]: {
    [TransactionStatus.Pending]: t`Repaying`,
    [TransactionStatus.Confirmed]: t`Repaid`,
    [TransactionStatus.Failed]: t`Repay failed`,
  },
  [TransactionType.DEPLOY]: {
    [TransactionStatus.Pending]: t`Deploying`,
    [TransactionStatus.Confirmed]: t`Deployed`,
    [TransactionStatus.Failed]: t`Deploy failed`,
  },
  [TransactionType.CANCEL]: {
    [TransactionStatus.Pending]: t`Cancelling`,
    [TransactionStatus.Confirmed]: t`Cancelled`,
    [TransactionStatus.Failed]: t`Cancel failed`,
  },
  [TransactionType.DELEGATE]: {
    [TransactionStatus.Pending]: t`Delegating`,
    [TransactionStatus.Confirmed]: t`Delegated`,
    [TransactionStatus.Failed]: t`Delegate failed`,
  },

  [TransactionType.DEPOSIT_LIQUIDITY_STAKING]: {
    [TransactionStatus.Pending]: t`Depositing`,
    [TransactionStatus.Confirmed]: t`Deposited`,
    [TransactionStatus.Failed]: t`Deposit failed`,
  },
  [TransactionType.WITHDRAW_LIQUIDITY_STAKING]: {
    [TransactionStatus.Pending]: t`Withdrawing`,
    [TransactionStatus.Confirmed]: t`Withdrew`,
    [TransactionStatus.Failed]: t`Withdraw failed`,
  },
  [TransactionType.ADD_LIQUIDITY_V2_POOL]: {
    [TransactionStatus.Pending]: t`Adding V2 liquidity`,
    [TransactionStatus.Confirmed]: t`Added V2 liquidity`,
    [TransactionStatus.Failed]: t`Add V2 liquidity failed`,
  },
  [TransactionType.MIGRATE_LIQUIDITY_V3]: {
    [TransactionStatus.Pending]: t`Migrating liquidity`,
    [TransactionStatus.Confirmed]: t`Migrated liquidity`,
    [TransactionStatus.Failed]: t`Migrate liquidity failed`,
  },
  [TransactionType.SUBMIT_PROPOSAL]: {
    [TransactionStatus.Pending]: t`Submitting proposal`,
    [TransactionStatus.Confirmed]: t`Submitted proposal`,
    [TransactionStatus.Failed]: t`Submit proposal failed`,
  },
  [TransactionType.REDUCE_LEVERAGE]: {
    [TransactionStatus.Pending]: t`Decreasing leverage`,
    [TransactionStatus.Confirmed]: t`Decreased leverage`,
    [TransactionStatus.Failed]: t`Decrease leverage failed`,
  },
  [TransactionType.ADD_LEVERAGE]: {
    [TransactionStatus.Pending]: t`Increasing Leverage Position`,
    [TransactionStatus.Confirmed]: t`Increased Leverage Position`,
    [TransactionStatus.Failed]: t`Leverage Creation Failed`,
  },
  [TransactionType.ADD_LMT_LIQUIDITY]: {
    [TransactionStatus.Pending]: t`Adding LMT Liquidity`,
    [TransactionStatus.Confirmed]: t`Added LMT Liquidity`,
    [TransactionStatus.Failed]: t`Add LMT Liquidity failed`,
  },
  [TransactionType.REMOVE_LMT_LIQUIDITY]: {
    [TransactionStatus.Pending]: t`Removing LMT Liquidity`,
    [TransactionStatus.Confirmed]: t`Removed LMT Liquidity`,
    [TransactionStatus.Failed]: t`Remove LMT Liquidity failed`,
  },
  [TransactionType.ADD_LIMIT_ORDER]: {
    [TransactionStatus.Pending]: t`Adding Limit Order`,
    [TransactionStatus.Confirmed]: t`Added Limit Order`,
    [TransactionStatus.Failed]: t`Add Limit Order failed`,
  },
  [TransactionType.CANCEL_LIMIT_ORDER]: {
    [TransactionStatus.Pending]: t`Removing Limit Order`,
    [TransactionStatus.Confirmed]: t`Removed Limit Order`,
    [TransactionStatus.Failed]: t`Remove Limit Order failed`,
  },
  [TransactionType.PREMIUM_DEPOSIT]: {
    [TransactionStatus.Pending]: t`Depositing Premium`,
    [TransactionStatus.Confirmed]: t`Deposited Premium`,
    [TransactionStatus.Failed]: t`Deposit Premium failed`,
  },
  [TransactionType.PREMIUM_WITHDRAW]: {
    [TransactionStatus.Pending]: t`Withdrawing Premium`,
    [TransactionStatus.Confirmed]: t`Withdrew Premium`,
    [TransactionStatus.Failed]: t`Withdraw Premium failed`,
  },
  [TransactionType.REDUCE_LIMIT_ORDER]: {
    [TransactionStatus.Pending]: t`Reducing Limit Order`,
    [TransactionStatus.Confirmed]: t`Reduced Limit Order`,
    [TransactionStatus.Failed]: t`Reduce Limit Order failed`,
  },
  [TransactionType.CREATE_REFERRAL]: {
    [TransactionStatus.Pending]: t`Creating Referral Code`,
    [TransactionStatus.Confirmed]: t`Created Referral Code`,
    [TransactionStatus.Failed]: t`Creating Referral Code failed`,
  },
  [TransactionType.USE_REFERRAL]: {
    [TransactionStatus.Pending]: t`Using Referral Code`,
    [TransactionStatus.Confirmed]: t`Using Referral Code`,
    [TransactionStatus.Failed]: t`Using Referral Code failed`,
  },
  [TransactionType.CANCEL_LIMIT_ORDER]: {
    [TransactionStatus.Pending]: t`Cancelling Limit Order`,
    [TransactionStatus.Confirmed]: t`Cancelled Limit Order`,
    [TransactionStatus.Failed]: t`Cancel Limit Order failed`,
  },
  [TransactionType.MINT_LLP]: {
    [TransactionStatus.Pending]: t`Minting LLP`,
    [TransactionStatus.Confirmed]: t`Minted LLP`,
    [TransactionStatus.Failed]: t`Minting LLP failed`,
  },
  [TransactionType.REDEEM_LLP]: {
    [TransactionStatus.Pending]: t`Redeeming LLP`,
    [TransactionStatus.Confirmed]: t`Redeemed LLP`,
    [TransactionStatus.Failed]: t`Redeeming LLP failed`,
  },
}

const AlternateTransactionTitleTable: { [key in TransactionType]?: { [state in TransactionStatus]: string } } = {
  [TransactionType.WRAP]: {
    [TransactionStatus.Pending]: t`Unwrapping`,
    [TransactionStatus.Confirmed]: t`Unwrapped`,
    [TransactionStatus.Failed]: t`Unwrap failed`,
  },
}

export function getActivityTitle(type: TransactionType, status: TransactionStatus, alternate?: boolean) {
  if (alternate) {
    const alternateTitle = AlternateTransactionTitleTable[type]
    if (alternateTitle !== undefined) return alternateTitle[status]
  }
  return TransactionTitleTable[type][status]
}
