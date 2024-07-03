import { BigNumber } from '@ethersproject/bignumber'

// export interface PositionDetails {
//   nonce: BigNumber
//   tokenId: BigNumber
//   operator: string
//   token0: string
//   token1: string
//   fee: number
//   tickLower: number
//   tickUpper: number
//   liquidity: BigNumber
//   feeGrowthInside0LastX128: BigNumber
//   feeGrowthInside1LastX128: BigNumber
//   tokensOwed0: BigNumber
//   tokensOwed1: BigNumber
// }

export interface PositionDetails {
  tokenId: BigNumber,
  owner: string,
  token0: string,
  token1: string,
  fee: number,
  tickLower: number,
  tickUpper: number,
  tokensOwed0: BigNumber,
  tokensOwed1: BigNumber,
  bins: Bin[]
  liquidity: BigNumber
}

export interface Bin {
  feeGrowthInside0LastX128: BigNumber,
  feeGrowthInside1LastX128: BigNumber,
  liquidity: BigNumber
}

