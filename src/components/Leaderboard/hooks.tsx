import { useWeb3React } from '@web3-react/core'
import { useBRP, useReferralContract } from 'hooks/useContract'
import { useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'

export const useRefereeLimwethDeposit = (): {referredCount: number, refereesLimwethDeposit: number | undefined} => {
  const referralContract = useReferralContract()
  const account = useAccount().address
  const {
    result: refereesResult,
    loading: refereesLoading,
    error: refereesError,
  } = useSingleCallResult(referralContract, 'getReferees', [account])
  
  const referees = refereesResult ? refereesResult[0] : []
  
  console.log("referees", referees)
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

  return useMemo(() => {
    const tradePoints = tradePointsCallStates.reduce((points, callState) => {
      if (callState.loading || callState.error || !callState.result) return points
      return points + parseFloat(callState.result[0].toString())
    }, 0)
    const lpPoints = lpPointsCallStates.reduce((points, callState) => {
      if (callState.loading || callState.error || !callState.result) return points
      return points + parseFloat(callState.result[0].toString())
    }, 0)
    const lastPoints = lastPointsCallStates.reduce((points, callState) => {
      if (callState.loading || callState.error || !callState.result) return points
      return points + parseFloat(callState.result[0].toString())
    }, 0)

    return {
      referredCount: referees.length,
      refereesLimwethDeposit: tradePoints + lpPoints + lastPoints
    }
  }, [tradePointsCallStates, lpPointsCallStates, lastPointsCallStates])
}

export const useLastClaimedPoints = (): string | undefined => {
  const BRP = useBRP()
  const { account } = useWeb3React()
  const { result, loading, error } = useSingleCallResult(BRP, 'lastClaimedPoints', [account])

  return useMemo(() => {
    if (!result || loading || !error) {
      return undefined
    }

    return result[0].toString()
  }, [result, loading, error])
}
