import { CurrencyAmount } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import JSBI from 'jsbi'


export interface LiquidityLoan {
  tick: number
  liquidity: BN
  premium: BN
  feeGrowthInside0LastX128: BN
  feeGrowthInside1LastX128: BN
  lastGrowth: BN
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
  premiumDeposit: BN
  premiumLeft: BN
  trader: string
  token0Decimals: number
  token1Decimals: number
  maxWithdrawablePremium: BN
  borrowInfo: LiquidityLoan[]
}

export interface MarginPositionDetails extends BaseFacilityPositionDetails {
  totalPosition: BN
  margin: BN
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
}

export interface RawPoolKey {
  token0Address: string
  token1Address: string
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