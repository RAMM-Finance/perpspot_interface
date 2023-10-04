import {BigNumber} from 'ethers'

export interface BaseFacilityPositionDetails {
  poolKey: RawPoolKey
  isToken0: boolean
  owner: string
  totalDebtOutput: BigNumber
  totalDebtInput: BigNumber
  recentPremium: BigNumber
  openTime: number
  repayTime: number
  isBorrow: boolean
  poolAddress: string
}

export interface MarginPositionDetails extends LMTPositionDetails {
  totalPosition: BigNumber
  margin: BigNumber // margin
}

export interface RawPoolKey {
  token0Address: string
  token1Address: string
  fee: number
}