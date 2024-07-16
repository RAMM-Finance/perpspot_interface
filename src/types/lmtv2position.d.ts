import { CurrencyAmount } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import JSBI from 'jsbi'


export interface LiquidityLoan {
  tick: number
  liquidity: string
  premium: string
  feeGrowthInside0LastX128: string
  feeGrowthInside1LastX128: string
  lastGrowth: string
}

// export interface SerializableLiquidityLoan {
//   tick: number
//   liquidity: string
//   premium: string
//   feeGrowthInside0LastX128: string
//   feeGrowthInside1LastX128: string
//   lastGrowth: string
// }

export interface SerializableMarginPositionDetails {
  totalPosition: string
  margin: string
  marginInPosToken: boolean
  apr: string
  poolKey: PoolKey
  isToken0: boolean
  totalDebtOutput: string
  totalDebtInput: string
  openTime: number
  repayTime: number
  isBorrow: boolean
  premiumOwed: string // how much premium is owed since last repayment
  premiumDeposit: string // how much premium currently in deposit
  premiumLeft: string // premium deposit - premium owed
  trader: string
  token0Decimals: number
  token1Decimals: number
  maxWithdrawablePremium: string
  borrowInfo: SerializableBorrowInfo[]
}

export interface PoolKey {
  token0: string
  token1: string
  fee: FeeAmount
}

export interface BaseFacilityPositionDetails {
  poolKey: RawPoolKey
  isToken0: boolean
  totalDebtOutput: BN
  totalDebtInput: BN
  openTime: number
  repayTime: number
  isBorrow: boolean
  premiumOwed: BN // how much premium is owed since last repayment
  premiumDeposit: BN // how much premium currently in deposit
  premiumLeft: BN // premium deposit - premium owed
  trader: string
  token0Decimals: number
  token1Decimals: number
  maxWithdrawablePremium: BN
  borrowInfo: LiquidityLoan[]
  marginInPosToken: boolean
}

export interface MarginPositionDetails extends BaseFacilityPositionDetails {
  totalPosition: BN
  margin: BN
  marginInPosToken: boolean
  apr: BN
}


export interface MarginLimitOrder {
  key: RawPoolKey,
  isAdd: boolean, 
  positionIsToken0: boolean,
  auctionDeadline: number,
  auctionStartTime: number,
  startOutput: BN,
  minOutput: BN,
  inputAmount: BN,
  decayRate: BN,
  margin: BN
  currentOutput: BN
  marginInPosToken: boolean
}

export interface PoolInfo {
  token0: string
  token1: string
  fee: number
  symbol0: string
  symbol1: string
  name0: string
  name1: string
  decimals0: number
  decimals1: number
}

export interface RawPoolKey {
  token0: string
  token1: string
  fee: FeeAmount
}

export interface TraderPositionKey {
  poolKey: RawPoolKey
  isToken0: boolean
  isBorrow: boolean
  trader: string
}

export interface OrderPositionKey {
  poolKey: RawPoolKey
  trader: string
  isToken0: boolean
  isAdd: boolean
}