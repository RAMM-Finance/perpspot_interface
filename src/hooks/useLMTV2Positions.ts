import { MarginPositionDetails, RawPoolKey } from 'types/lmtv2position'
import { BigNumber as BN } from 'bignumber.js'
// fetches all leveraged LMT positions for a given account
export function useLeveragedLMTPositions(account: string | undefined): fetchedLMTPositions {
  const loading = false
  const error = false
  const position_1 : MarginPositionDetails = {
    positionId: 1,
    poolKey: {
      token0Address:"0x569f3140FDc0f3B9Fc2E4919C35f35D39dd2B01A",
      token1Address:"0x4E3F175b38098326a34F2C8B2D07AF5fFdfc6fA9",
      fee: 500
    },
    isToken0: true,
    owner: "0xDEADBEEF",
    totalDebtOutput: new BN(100),
    totalDebtInput: new BN(10),
    recentPremium: new BN(1),
    openTime: 10000,
    repayTime: 90000,
    isBorrow: false,
    poolAddress: "0xDEADBEEF",
    premiumOwed: new BN(10), // how much premium is owed since last repayment
    premiumLeft: new BN(30), // how much premium is left in the deposit
    totalPosition: new BN(1776),
    margin: new BN(177)
  }

  const position_2 : MarginPositionDetails = {
    positionId: 2,
    poolKey: {
      token0Address:"0x569f3140FDc0f3B9Fc2E4919C35f35D39dd2B01A",
      token1Address:"0x4E3F175b38098326a34F2C8B2D07AF5fFdfc6fA9",
      fee: 500
    },
    isToken0: true,
    owner: "0xDEADBEEF",
    totalDebtOutput: new BN(100),
    totalDebtInput: new BN(10),
    recentPremium: new BN(1),
    openTime: 10000,
    repayTime: 90000,
    isBorrow: false,
    poolAddress: "0xDEADBEEF",
    premiumOwed: new BN(10), // how much premium is owed since last repayment
    premiumLeft: new BN(30), // how much premium is left in the deposit
    totalPosition: new BN(1337),
    margin: new BN(123)
  }

  const positions : MarginPositionDetails[] = [
    position_1,
    position_2
  ]
  
  return {
    leverageLoading: loading,
    error,
    leveragePositions: positions
  }
}

// fetches all borrow LMT positions for a given account
// export function useBorrowLMTPositions(account: string | undefined): {
//   loading: boolean
//   error: any
//   positions: BorrowLMTPositionDetails[] | undefined
// } {
//   return [] as any
// }

export function useLeverageLMTPositionFromKeys(
  account: string | undefined,
  isToken0: boolean | undefined,
  key: RawPoolKey | undefined
): { loading: boolean; error: any; position: MarginPositionDetails | undefined } {
  return [] as any
}

// export function useBorrowLMTPositionFromKeys(
//   account: string | undefined,
//   isToken0: boolean | undefined,
//   key: RawPoolKey | undefined
// ): { loading: boolean; error: any; position: BorrowLMTPositionDetails | undefined } {
//   return [] as any
// }


type fetchedLMTPositions = {
  leverageLoading: boolean
  error: any
  leveragePositions: MarginPositionDetails[] | undefined
}