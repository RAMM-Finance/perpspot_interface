import {BigNumber as BN} from 'bignumber.js'

export interface LMTPositionDetails {
  token0Address: string
  token1Address: string
  fee: number
  isToken0: boolean
  owner: string
  totalDebtOutput: BN
  totalDebtInput: BN
  recentPremium: BN
  openTime: BN
  repayTime: BN
  isBorrow: boolean
  poolAddress: string
  // TODO show borrow info
}

export interface LeverageLMTPositionDetails extends LMTPositionDetails {
  totalPosition: BN
  initialCollateral: BN // margin
}

export interface BorrowLMTPositionDetails extends LMTPositionDetails {
  initalCollateral: BN
}

export interface RawPoolKey {
  token0: string
  token1: string
  fee: number
}