import { MarginPositionDetails, RawPoolKey } from 'types/lmtv2position'

// fetches all leveraged LMT positions for a given account
export function useLeveragedLMTPositions(account: string | undefined): {
  loading: boolean
  error: any
  positions: MarginPositionDetails[] | undefined
} {
  return [] as any
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
