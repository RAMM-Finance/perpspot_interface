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

  switch (reason.toLowerCase()) {
    case 'minswap':
      return 'Increase Slippage tolerance (settings)'
    case 'insufficientpremiumdeposit':
      return 'Insufficient Premium Deposit'
    case 'cantforceclose'.toLowerCase():
      return 'Cannot Force Close'
    case 'noPosition'.toLowerCase():
      return 'No Position Found'
    case 'insolventAMM'.toLowerCase():
      return 'Insolvent System'
    case 'insolventMarginFacility'.toLowerCase():
      return 'InsolventSystem'
    case 'noOrder'.toLowerCase():
      return 'No Order Found'
    case 'exceedMaxWithdrawablePremium'.toLowerCase():
      return 'Exceed Max Withdrawable Premium'
    case 'orderExpired'.toLowerCase():
      return 'Order Expired'
    case 'wrongExecution'.toLowerCase():
      return 'Wrong Execution'
    case 'orderOpen'.toLowerCase():
      return 'Order Open'
    case 'incorrectBorrow'.toLowerCase():
      return 'Incorrect Borrow'
    case 'notEnoughPremiumDeposit'.toLowerCase():
      return 'Not Enough Premium Deposit'
    case 'incorrectReduce'.toLowerCase():
      return 'Incorrect Reduce'
    case 'addReduceInvalidTick'.toLowerCase():
      return 'Add Reduce Invalid Tick'
    case 'wrongTokenRepay'.toLowerCase():
      return 'Wrong Token Repay'
    case 'wrongAmountRepay'.toLowerCase():
      return 'Wrong Amount Repay'
    case 'onlyFiller'.toLowerCase():
      return 'Only Filler'
    case 'invalidStartingPrice'.toLowerCase():
      return 'Invalid Starting Price'
    case 'roundedTicksOverlap'.toLowerCase():
      return 'Rounded Ticks Overlap'
    case 'insufficientBorrowLiquidity'.toLowerCase():
      return 'Insufficient Borrow Liquidity'
    case 'outOfBoundsPrice'.toLowerCase():
      return 'Out Of Bounds Price'
    default:
      return reason
  }
}
