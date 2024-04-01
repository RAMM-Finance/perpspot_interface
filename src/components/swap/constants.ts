import { USDC_ARBITRUM } from 'constants/tokens'

// List of tokens that require existing allowance to be reset before approving the new amount (mainnet only).
// See the `approve` function here: https://etherscan.io/address/0xdAC17F958D2ee523a2206206994597C13D831ec7#code
export const RESET_APPROVAL_TOKENS = [USDC_ARBITRUM]

export enum SwapTab {
  Swap = 'swap',
  Limit = 'limit',
  Send = 'send',
}

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}
