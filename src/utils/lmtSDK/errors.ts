import { t } from '@lingui/macro'
import ErrorJson from 'abis_v2/Errors.json'
import { decodeError } from 'utils/ethersErrorHandler'
import { DecodedError } from 'utils/ethersErrorHandler/types'

export function parseContractError(error: any): DecodedError {
  return decodeError(error, ErrorJson.abi)
}

export class GasEstimationError extends Error {
  constructor() {
    super(t`Your transaction is expected to fail.`)
  }
}

export function getErrorMessage(err: DecodedError): string {
  const { error: reason } = err

  switch (reason) {
    case 'insufficientPremiumDeposit':
      return 'Insufficient Premium Deposit'
    case 'cantForceClose':
      return 'Cannot Force Close'
    case 'noPosition':
      return 'No Position Found'
    case 'insolventAMM':
      return 'Insolvent System'
    case 'insolventMarginFacility':
      return 'InsolventSystem'
    case 'noOrder':
      return 'No Order Found'
    case 'exceedMaxWithdrawablePremium':
      return 'Exceed Max Withdrawable Premium'
    case 'orderExpired':
      return 'Order Expired'
    case 'wrongExecution':
      return 'Wrong Execution'
    case 'orderOpen':
      return 'Order Open'
    case 'incorrectBorrow':
      return 'Incorrect Borrow'
    case 'notEnoughPremiumDeposit':
      return 'Not Enough Premium Deposit'
    case 'incorrectReduce':
      return 'Incorrect Reduce'
    case 'addReduceInvalidTick':
      return 'Add Reduce Invalid Tick'
    case 'wrongTokenRepay':
      return 'Wrong Token Repay'
    case 'wrongAmountRepay':
      return 'Wrong Amount Repay'
    case 'onlyFiller':
      return 'Only Filler'
    case 'invalidStartingPrice':
      return 'Invalid Starting Price'
    case 'roundedTicksOverlap':
      return 'Rounded Ticks Overlap'
    case 'insufficientBorrowLiquidity':
      return 'Insufficient Borrow Liquidity'
    case 'outOfBoundsPrice':
      return 'Out Of Bounds Price'
    default:
      return reason
  }
}
