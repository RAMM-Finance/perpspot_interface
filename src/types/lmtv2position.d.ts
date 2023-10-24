import { FeeAmount } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'

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
}

export interface MarginPositionDetails extends BaseFacilityPositionDetails {
  totalPosition: BN
  margin: BN
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