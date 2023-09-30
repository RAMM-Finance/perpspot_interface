import {BigNumber as BN} from 'bignumber.js'
import { FeeAmount } from '@uniswap/v3-sdk'


export interface LMTPositionDetails {
  leverageManagerAddress: string | undefined
  borrowManagerAddress: string | undefined
  liquidityManagerAddress: string | undefined
  tokenId: string
  token0Address: string
  token1Address: string
  poolFee: FeeAmount | undefined
  isToken0: boolean
  owner: string
  totalDebtOutput: BN
  totalDebtInput: BN
  recentPremium: BN
  unusedPremium: BN
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