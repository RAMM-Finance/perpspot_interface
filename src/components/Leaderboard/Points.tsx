import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import affiliate from './affiliate-marketing.png'
import coin from './coin.png'
import { usePointsData , CollectMultipler,referralDivisor, useStoredData} from './data'
import {combineAndSumData, addresses} from "./LeaderboardTable"
import star from './star_616489.png'

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  width: 100%;
  @media only screen and (max-width: 800px) {
    margin: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    row-gap: 1.5rem;
    column-gap: 2.5rem;
    & > * {
      flex-basis: auto; 
      min-width: 200px;
      max-width: 250px;
    }
  }`
const Point = styled.div`
  display: flex;
  justify-content: start;
  padding: 0 1rem;
  align-items: center;
  gap: 10px;
  // border-left: 1px solid ${({ theme }) => theme.backgroundOutline};
`

const Value = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: start;
`

export default function Points() {
  const tradePoints = usePointsData()
  const { account } = useWeb3React()

  function extractUsers(obj: any) {
    const allUserObjects = Object.values(obj)
    const allUsersArrays = allUserObjects.map((point: any) => {
      if (point === null || point === undefined) {
        return
      } else {
        return Object.keys(point)
      }
    })
    const flattenedUsers = allUsersArrays.flat(1)
    const uniqueUsers = [...new Set(flattenedUsers)]
    return uniqueUsers
  }

  function createUserDataObj(usersArr: any, obj: any) {
    const usersArrLP = usersArr.map((user: string) => {
      if (Object.keys(obj.lpPositionsByUniqueLps).find((lpUser) => lpUser === user)
       
         ) {
        return {
          trader: user,
          lpPoints: obj.lpPositionsByUniqueLps[user].reduce(
            (accum: number, tok: any) => accum + (tok.amount0Collected * CollectMultipler+ tok.amount1Collected* CollectMultipler),
            0
          )+ (obj.timeWeightedDeposits[user] ? obj.timeWeightedDeposits[user].timeWeighted : 0),
        }
      } else {
        return {
          trader: user,
          lpPoints: 0,
        }
      }
    })

    const usersArrRP = usersArrLP.map((rpUser: any) => {
      if (obj.refereeActivity && Object.keys(obj.refereeActivity).find((rUser) => rUser === rpUser.trader)) {
        return {
          ...rpUser,
          rPoints: obj.refereeActivity[rpUser.trader].lpAmount/referralDivisor + obj.refereeActivity[rpUser.trader].tradeVolume/referralDivisor,
        }
      } else {
        return {
          ...rpUser,
          rPoints: 0,
        }
      }
    })

    const usersArrTP = usersArrRP.map((tpUser: any) => {
      if (Object.keys(obj.tradeProcessedByTrader).find((tUser) => tUser === tpUser.trader)) {
        return {
          ...tpUser,
          tPoints: obj.tradeProcessedByTrader[tpUser.trader].reduce((accum: number, tok: any) => accum + tok.amount, 0),
        }
      } else {
        return {
          ...tpUser,
          tPoints: 0,
        }
      }
    })

    const usersArrTotal = usersArrTP.map((totalUser: any) => {
      return {
        ...totalUser,
        totalPoints: totalUser.lpPoints + totalUser.rPoints + totalUser.tPoints,
      }
    })

    const sortedArr = usersArrTotal.sort((a: any, b: any) => b.totalPoints - a.totalPoints)
    const sortedArrRanked = sortedArr.map((user: any, index: number) => {
      return {
        ...user,
        rank: index + 1,
      }
    })

    return sortedArrRanked
  }

  const usersArr = useMemo(() => {
    return extractUsers(tradePoints)
  }, [tradePoints])

  const usersData = useMemo(() => {
    return createUserDataObj(usersArr, tradePoints)
  }, [usersArr])

  const prevData = useStoredData(addresses)

  const combinedData = useMemo(()=>{
    if(!prevData || !usersData) return 

    return combineAndSumData(prevData, usersData);

  }, [prevData, usersData])


  const userData = useMemo(() => {
    if(!combinedData ) return 
    return combinedData.find((user: any) => user.trader === account)
  }, [combinedData])

  console.log('randkfadfaddata', prevData, combinedData)

  return (
    <Wrapper>
      <Point style={{ border: 'none' }}>
        <img src={star} width={30} />
        <Value>
          <ThemedText.BodySecondary fontWeight={900}>
            {userData ? usersData.findIndex((user: any) => user.trader === account) : '-'}
          </ThemedText.BodySecondary>
          <ThemedText.BodySmall fontWeight={300}>My Rank</ThemedText.BodySmall>
        </Value>
      </Point>
      <Point>
        <img src={affiliate} width={30} />
        <Value>
          <ThemedText.BodySecondary fontWeight={900}>{userData ? userData?.totalPoints : 0}</ThemedText.BodySecondary>
          <ThemedText.BodySmall fontWeight={300}>Total LMT</ThemedText.BodySmall>
        </Value>
      </Point>

      <Point>
        <img src={coin} width={30} />
        <Value>
          <ThemedText.BodySecondary fontWeight={900}>{userData ? userData?.tPoints : 0}</ThemedText.BodySecondary>
          <ThemedText.BodySmall fontWeight={300}>Trade LMT</ThemedText.BodySmall>
        </Value>
      </Point>
      <Point>
        <img src={star} width={30} />
        <Value>
          <ThemedText.BodySecondary fontWeight={900}>{userData ? userData?.lpPoints : 0}</ThemedText.BodySecondary>
          <ThemedText.BodySmall fontWeight={300}>LP LMT</ThemedText.BodySmall>
        </Value>
      </Point>
      <Point>
        <img src={affiliate} width={30} />
        <Value>
          <ThemedText.BodySecondary fontWeight={900}>{userData ? userData?.rPoints : 0}</ThemedText.BodySecondary>
          <ThemedText.BodySmall fontWeight={300}>Referral LMT</ThemedText.BodySmall>
        </Value>
      </Point>
    </Wrapper>
  )
}
