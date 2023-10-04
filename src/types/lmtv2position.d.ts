import { BigNumber as BN } from 'bignumber.js'

export interface BaseFacilityPositionDetails {
  positionId: number // id of the position
  poolKey: RawPoolKey
  isToken0: boolean
  owner: string
  totalDebtOutput: BN
  totalDebtInput: BN
  recentPremium: BN
  openTime: number
  repayTime: number
  isBorrow: boolean
  poolAddress: string
  premiumOwed: BN // how much premium is owed since last repayment
  premiumLeft: BN // how much premium is left in the deposit
}

export interface MarginPositionDetails extends BaseFacilityPositionDetails {
  totalPosition: BN
  margin: BN
}

export interface RawPoolKey {
  token0Address: string
  token1Address: string
  fee: number
}