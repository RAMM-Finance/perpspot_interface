// import { t } from '@lingui/macro'
import { TransactionStatus } from 'graphql/data/__generated__/types-and-hooks'
import { TransactionType } from 'state/transactions/types'

// use even number because rows are in groups of 2
export const DEFAULT_NFT_QUERY_AMOUNT = 26

const TransactionTitleTable: { [key in TransactionType]: { [state in TransactionStatus]: string } } = {
  [TransactionType.SWAP]: {
    [TransactionStatus.Pending]: `Swapping`,
    [TransactionStatus.Confirmed]: `Swapped`,
    [TransactionStatus.Failed]: `Swap failed`,
  },
  [TransactionType.WRAP]: {
    [TransactionStatus.Pending]: `Wrapping`,
    [TransactionStatus.Confirmed]: `Wrapped`,
    [TransactionStatus.Failed]: `Wrap failed`,
  },
  [TransactionType.ADD_LIQUIDITY_V3_POOL]: {
    [TransactionStatus.Pending]: `Adding liquidity`,
    [TransactionStatus.Confirmed]: `Added liquidity`,
    [TransactionStatus.Failed]: `Add liquidity failed`,
  },
  [TransactionType.REMOVE_LIQUIDITY_V3]: {
    [TransactionStatus.Pending]: `Removing liquidity`,
    [TransactionStatus.Confirmed]: `Removed liquidity`,
    [TransactionStatus.Failed]: `Remove liquidity failed`,
  },
  [TransactionType.CREATE_V3_POOL]: {
    [TransactionStatus.Pending]: `Creating pool`,
    [TransactionStatus.Confirmed]: `Created pool`,
    [TransactionStatus.Failed]: `Create pool failed`,
  },
  [TransactionType.COLLECT_FEES]: {
    [TransactionStatus.Pending]: `Collecting fees`,
    [TransactionStatus.Confirmed]: `Collected fees`,
    [TransactionStatus.Failed]: `Collect fees failed`,
  },
  [TransactionType.APPROVAL]: {
    [TransactionStatus.Pending]: `Approving`,
    [TransactionStatus.Confirmed]: `Approved`,
    [TransactionStatus.Failed]:`Approval failed`,
  },
  [TransactionType.CLAIM]: {
    [TransactionStatus.Pending]: `Claiming`,
    [TransactionStatus.Confirmed]: `Claimed`,
    [TransactionStatus.Failed]: `Claim failed`,
  },
  [TransactionType.BUY]: {
    [TransactionStatus.Pending]: `Buying`,
    [TransactionStatus.Confirmed]: `Bought`,
    [TransactionStatus.Failed]: `Buy failed`,
  },
  [TransactionType.SEND]: {
    [TransactionStatus.Pending]: `Sending`,
    [TransactionStatus.Confirmed]: `Sent`,
    [TransactionStatus.Failed]: `Send failed`,
  },
  [TransactionType.RECEIVE]: {
    [TransactionStatus.Pending]: `Receiving`,
    [TransactionStatus.Confirmed]: `Received`,
    [TransactionStatus.Failed]: `Receive failed`,
  },
  [TransactionType.MINT]: {
    [TransactionStatus.Pending]: `Minting`,
    [TransactionStatus.Confirmed]: `Minted`,
    [TransactionStatus.Failed]: `Mint failed`,
  },
  [TransactionType.BURN]: {
    [TransactionStatus.Pending]: `Burning`,
    [TransactionStatus.Confirmed]: `Burned`,
    [TransactionStatus.Failed]: `Burn failed`,
  },
  // [TransactionType.VOTE]: {
  //   [TransactionStatus.Pending]: t`Voting`,
  //   [TransactionStatus.Confirmed]: t`Voted`,
  //   [TransactionStatus.Failed]: t`Vote failed`,
  // },
  [TransactionType.QUEUE]: {
    [TransactionStatus.Pending]: `Queuing`,
    [TransactionStatus.Confirmed]:`Queued`,
    [TransactionStatus.Failed]: `Queue failed`,
  },
  [TransactionType.EXECUTE]: {
    [TransactionStatus.Pending]: `Executing`,
    [TransactionStatus.Confirmed]: `Executed`,
    [TransactionStatus.Failed]: `Execute failed`,
  },
  [TransactionType.BORROW]: {
    [TransactionStatus.Pending]: `Borrowing`,
    [TransactionStatus.Confirmed]: `Borrowed`,
    [TransactionStatus.Failed]: `Borrow failed`,
  },
  [TransactionType.REPAY]: {
    [TransactionStatus.Pending]: `Repaying`,
    [TransactionStatus.Confirmed]: `Repaid`,
    [TransactionStatus.Failed]: `Repay failed`,
  },
  [TransactionType.DEPLOY]: {
    [TransactionStatus.Pending]: `Deploying`,
    [TransactionStatus.Confirmed]: `Deployed`,
    [TransactionStatus.Failed]: `Deploy failed`,
  },
  [TransactionType.CANCEL]: {
    [TransactionStatus.Pending]: `Cancelling`,
    [TransactionStatus.Confirmed]: `Cancelled`,
    [TransactionStatus.Failed]: `Cancel failed`,
  },
  [TransactionType.DELEGATE]: {
    [TransactionStatus.Pending]: `Delegating`,
    [TransactionStatus.Confirmed]: `Delegated`,
    [TransactionStatus.Failed]: `Delegate failed`,
  },

  [TransactionType.DEPOSIT_LIQUIDITY_STAKING]: {
    [TransactionStatus.Pending]: `Depositing`,
    [TransactionStatus.Confirmed]: `Deposited`,
    [TransactionStatus.Failed]: `Deposit failed`,
  },
  [TransactionType.WITHDRAW_LIQUIDITY_STAKING]: {
    [TransactionStatus.Pending]: `Withdrawing`,
    [TransactionStatus.Confirmed]: `Withdrew`,
    [TransactionStatus.Failed]: `Withdraw failed`,
  },
  [TransactionType.ADD_LIQUIDITY_V2_POOL]: {
    [TransactionStatus.Pending]: `Adding V2 liquidity`,
    [TransactionStatus.Confirmed]: `Added V2 liquidity`,
    [TransactionStatus.Failed]: `Add V2 liquidity failed`,
  },
  [TransactionType.MIGRATE_LIQUIDITY_V3]: {
    [TransactionStatus.Pending]: `Migrating liquidity`,
    [TransactionStatus.Confirmed]: `Migrated liquidity`,
    [TransactionStatus.Failed]: `Migrate liquidity failed`,
  },
  [TransactionType.SUBMIT_PROPOSAL]: {
    [TransactionStatus.Pending]: `Submitting proposal`,
    [TransactionStatus.Confirmed]: `Submitted proposal`,
    [TransactionStatus.Failed]: `Submit proposal failed`,
  },
  [TransactionType.REDUCE_LEVERAGE]: {
    [TransactionStatus.Pending]: `Decreasing leverage`,
    [TransactionStatus.Confirmed]: `Decreased leverage`,
    [TransactionStatus.Failed]: `Decrease leverage failed`,
  },
  [TransactionType.ADD_LEVERAGE]: {
    [TransactionStatus.Pending]: `Increasing Leverage Position`,
    [TransactionStatus.Confirmed]: `Increased Leverage Position`,
    [TransactionStatus.Failed]: `Leverage Creation Failed`,
  },
  [TransactionType.ADD_LMT_LIQUIDITY]: {
    [TransactionStatus.Pending]: `Adding LMT Liquidity`,
    [TransactionStatus.Confirmed]: `Added LMT Liquidity`,
    [TransactionStatus.Failed]: `Add LMT Liquidity failed`,
  },
  [TransactionType.REMOVE_LMT_LIQUIDITY]: {
    [TransactionStatus.Pending]: `Removing LMT Liquidity`,
    [TransactionStatus.Confirmed]: `Removed LMT Liquidity`,
    [TransactionStatus.Failed]: `Remove LMT Liquidity failed`,
  },
  [TransactionType.ADD_LIMIT_ORDER]: {
    [TransactionStatus.Pending]: `Adding Limit Order`,
    [TransactionStatus.Confirmed]: `Added Limit Order`,
    [TransactionStatus.Failed]: `Add Limit Order failed`,
  },
  // [TransactionType.CANCEL_LIMIT_ORDER]: {
  //   [TransactionStatus.Pending]: t`Removing Limit Order`,
  //   [TransactionStatus.Confirmed]: t`Removed Limit Order`,
  //   [TransactionStatus.Failed]: t`Remove Limit Order failed`,
  // },
  [TransactionType.PREMIUM_DEPOSIT]: {
    [TransactionStatus.Pending]: `Depositing Premium`,
    [TransactionStatus.Confirmed]: `Deposited Premium`,
    [TransactionStatus.Failed]: `Deposit Premium failed`,
  },
  [TransactionType.PREMIUM_WITHDRAW]: {
    [TransactionStatus.Pending]: `Withdrawing Premium`,
    [TransactionStatus.Confirmed]: `Withdrew Premium`,
    [TransactionStatus.Failed]: `Withdraw Premium failed`,
  },
  [TransactionType.REDUCE_LIMIT_ORDER]: {
    [TransactionStatus.Pending]: `Reducing Limit Order`,
    [TransactionStatus.Confirmed]: `Reduced Limit Order`,
    [TransactionStatus.Failed]: `Reduce Limit Order failed`,
  },
  [TransactionType.CREATE_REFERRAL]: {
    [TransactionStatus.Pending]: `Creating Referral Code`,
    [TransactionStatus.Confirmed]: `Created Referral Code`,
    [TransactionStatus.Failed]: `Creating Referral Code failed`,
  },
  [TransactionType.USE_REFERRAL]: {
    [TransactionStatus.Pending]: `Using Referral Code`,
    [TransactionStatus.Confirmed]: `Using Referral Code`,
    [TransactionStatus.Failed]: `Using Referral Code failed`,
  },
  [TransactionType.CANCEL_LIMIT_ORDER]: {
    [TransactionStatus.Pending]: `Cancelling Limit Order`,
    [TransactionStatus.Confirmed]: `Cancelled Limit Order`,
    [TransactionStatus.Failed]: `Cancel Limit Order failed`,
  },
  [TransactionType.MINT_LLP]: {
    [TransactionStatus.Pending]: `Minting LLP`,
    [TransactionStatus.Confirmed]:`Minted LLP`,
    [TransactionStatus.Failed]: `Minting LLP failed`,
  },
  [TransactionType.REDEEM_LLP]: {
    [TransactionStatus.Pending]: `Redeeming LLP`,
    [TransactionStatus.Confirmed]: `Redeemed LLP`,
    [TransactionStatus.Failed]:`Redeeming LLP failed`,
  },
  [TransactionType.MINT_limWETH]: {
    [TransactionStatus.Pending]: `Minting limWETH`,
    [TransactionStatus.Confirmed]: `Minted limWETH`,
    [TransactionStatus.Failed]: `Minting limWETH failed`,
  },
  [TransactionType.REDEEM_limWETH]: {
    [TransactionStatus.Pending]: `Redeeming limWETH`,
    [TransactionStatus.Confirmed]: `Redeemed limWETH`,
    [TransactionStatus.Failed]: `Redeeming limWETH failed`,
  },
  [TransactionType.UNLOCK_Box]: {
    [TransactionStatus.Pending]: `Unlocking Box`,
    [TransactionStatus.Confirmed]: `Successfully unlocked box`,
    [TransactionStatus.Failed]: `Unlock Box failed`,
  },
  [TransactionType.ADD_Box]: {
    [TransactionStatus.Pending]: `Adding Box`,
    [TransactionStatus.Confirmed]: `Successfully added box`,
    [TransactionStatus.Failed]: `Failed to add box`,
  },
  [TransactionType.CLAIM_BOXES]: {
    [TransactionStatus.Pending]: `Claiming Boxes`,
    [TransactionStatus.Confirmed]: `Successfuly claimed boxes`,
    [TransactionStatus.Failed]: `Failed to claim boxes`,
  },
  [TransactionType.ZAP_AND_MINT]: {
    [TransactionStatus.Pending]: `Zapping`,
    [TransactionStatus.Confirmed]: `Successfully zapped`,
    [TransactionStatus.Failed]: `Zap and Mint failed`,
  },
}

const AlternateTransactionTitleTable: { [key in TransactionType]?: { [state in TransactionStatus]: string } } = {
  [TransactionType.WRAP]: {
    [TransactionStatus.Pending]: `Unwrapping`,
    [TransactionStatus.Confirmed]: `Unwrapped`,
    [TransactionStatus.Failed]: `Unwrap failed`,
  },
}

export function getActivityTitle(type: TransactionType, status: TransactionStatus, alternate?: boolean) {
  if (alternate) {
    const alternateTitle = AlternateTransactionTitleTable[type]
    if (alternateTitle !== undefined) return alternateTitle[status]
  }
  return TransactionTitleTable[type][status]
}
