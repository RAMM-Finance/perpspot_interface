import { useBRP, useReferralContract } from 'hooks/useContract'
import { useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'

export const useRefereeLimwethDeposit = (): {
  referees: string[]
  refereeActivity: any
  loading: boolean
  referredCount: number
  refereesLimwethDeposit: number | undefined
} => {
  const referralContract = useReferralContract()
  const account = useAccount().address
  const {
    result: refereesResult,
    loading: refereesLoading,
    error: refereesError,
  } = useSingleCallResult(referralContract, 'getReferees', [account])

  const referees = refereesResult ? refereesResult[0] : []

  console.log('referees by referer', referees)
  const BRP = useBRP()

  const tradePointsCallStates = useSingleContractMultipleData(
    BRP,
    'lastRecordedTradePoints',
    referees.map((i: string) => [i])
  )

  const lpPointsCallStates = useSingleContractMultipleData(
    BRP,
    'lastRecordedLpPoints',
    referees.map((i: string) => [i])
  )

  const lastPointsCallStates = useSingleContractMultipleData(
    BRP,
    'lastRecordedPoints',
    referees.map((i: string) => [i])
  )

  // console.log('zeke:lastRecordedTradePoints', tradePointsCallStates)
  console.log('fe', tradePointsCallStates, lpPointsCallStates, lastPointsCallStates)
  return useMemo(() => {
    let loading = true
    const tradePoints = tradePointsCallStates.reduce((points, callState) => {
      if (callState.loading || callState.error || !callState.result) {
        loading = true
        return points
      }
      loading = false
      return points + parseFloat(callState.result[0].toString())
    }, 0)
    const lpPoints = lpPointsCallStates.reduce((points, callState) => {
      if (callState.loading || callState.error || !callState.result) {
        loading = true
        return points
      }
      loading = false
      return points + parseFloat(callState.result[0].toString())
    }, 0)
    const lastPoints = lastPointsCallStates.reduce((points, callState) => {
      if (callState.loading || callState.error || !callState.result) {
        loading = true
        return points
      }
      loading = false
      return points + parseFloat(callState.result[0].toString())
    }, 0)

    const pointsTable: { [key: string]: any } = {}
    let index = 0
    referees.forEach((referee: any) => {
      pointsTable[referee] = {
        tradePoints: tradePointsCallStates?.[index]?.result?.[0].toString() || 0,
        lpPoints: lpPointsCallStates?.[index]?.result?.[0].toString() || 0, // Use 0 if lpDataByAddress does not have the address
        referralPoints: lastPointsCallStates?.[index]?.result?.[0].toString() || 0,
      }
      index += 1
    })
    if (tradePointsCallStates.length === 0
      && lpPointsCallStates.length === 0
      && lastPointsCallStates.length === 0
    ) {
      loading = false
    }
    return {
      referees,
      refereeActivity: pointsTable,
      loading,
      referredCount: referees.length,
      refereesLimwethDeposit: tradePoints + lpPoints + lastPoints,
    }
  }, [tradePointsCallStates, lpPointsCallStates, lastPointsCallStates])
}

export const useLastClaimedPoints = (): string | undefined => {
  const BRP = useBRP()
  const account = useAccount().address
  const { result, loading, error } = useSingleCallResult(BRP, 'lastClaimedPoints', [account])

  return useMemo(() => {
    if (!result || loading || !error) {
      return undefined
    }

    return result[0].toString()
  }, [result, loading, error])
}
