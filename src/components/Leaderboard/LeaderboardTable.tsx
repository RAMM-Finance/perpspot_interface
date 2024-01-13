import { MouseoverTooltip } from 'components/Tooltip'
import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatDollar } from 'utils/formatNumbers'
import { usePointsData , CollectMultipler, VaultDivisor} from './data'
interface Leader {
  rank: number
  tradePoint: number
  lpPoint: number
  referralPoint: number
  totalPoint: number
  wallet: string
}

export default function LeaderboardTable() {
  const tradePoints = usePointsData()
  console.log('tradepoints', tradePoints)
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
      if (Object.keys(obj.lpPositionsByUniqueLps).find((lpUser) => lpUser === user)) {
        return {
          trader: user,
          lpPoints: obj.lpPositionsByUniqueLps[user].reduce(
            (accum: number, tok: any) => accum + (tok.amount0Collected*CollectMultipler + tok.amount1Collected*CollectMultipler),
            0
          ) + (obj.timeWeightedDeposits[user]? obj.timeWeightedDeposits[user].timeWeighted: 0),
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
          rPoints: obj.refereeActivity[rpUser.trader].lpAmount + obj.refereeActivity[rpUser.trader].tradeVolume,
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

  const userData = useMemo(() => {
    return createUserDataObj(usersArr, tradePoints)
  }, [usersArr, tradePoints])

  function LeaderboardHeader() {
    return (
      <HeaderCellWrapper>
        <HeaderCell>
          <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
            Rank
          </ThemedText.SubHeaderSmall>
        </HeaderCell>
        <HeaderCell>
          <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
            User
          </ThemedText.SubHeaderSmall>
        </HeaderCell>
        <HeaderCell>
          <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
            Trade Point
          </ThemedText.SubHeaderSmall>
        </HeaderCell>
        <HeaderCell>
          <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
            LP Point
          </ThemedText.SubHeaderSmall>
        </HeaderCell>
        <HeaderCell>
          <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
            Referral Point
          </ThemedText.SubHeaderSmall>
        </HeaderCell>
        <HeaderCell>
          <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
            Total Point
          </ThemedText.SubHeaderSmall>
        </HeaderCell>
      </HeaderCellWrapper>
    )
  }

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 8)}...${wallet.slice(wallet.length - 8, wallet.length)}`
  }
  return (
    <>
      <LeaderboardHeader />

      {userData.map((user: any) => {
        return (
          <LoadedCellWrapper key={user.trader}>
            <LoadedCell>
              <ThemedText.BodySecondary>{user.rank}</ThemedText.BodySecondary>
            </LoadedCell>
            <LoadedCell>
              <MouseoverTooltip text={user.trader}>
                <ThemedText.BodySecondary>{user.trader && formatWallet(user.trader)}</ThemedText.BodySecondary>
              </MouseoverTooltip>
            </LoadedCell>
            <LoadedCell>
              <ThemedText.BodySecondary>
                {formatDollar({ num: user.tPoints, dollarSign: false })}
              </ThemedText.BodySecondary>
            </LoadedCell>
            <LoadedCell>
              <ThemedText.BodySecondary>
                {formatDollar({ num: user.lpPoints, dollarSign: false })}
              </ThemedText.BodySecondary>
            </LoadedCell>
            <LoadedCell>
              <ThemedText.BodySecondary>
                {formatDollar({ num: user.rPoints, dollarSign: false })}
              </ThemedText.BodySecondary>
            </LoadedCell>
            <LoadedCell>
              <ThemedText.BodySecondary>
                {formatDollar({ num: user.totalPoints, dollarSign: false })}
              </ThemedText.BodySecondary>
            </LoadedCell>
          </LoadedCellWrapper>
        )
      })}
    </>
  )
}

const LoadedCell = styled.div`
  padding-bottom: 10px;
`

const LoadedCellWrapper = styled.div`
  display: grid;
  grid-template-columns: 0.75fr 3fr 3fr 3fr 3fr 3fr;
  padding: 10px;
  border-radius: 10px;
  :hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  justify-content: center;
`

const HeaderCell = styled.div``
const HeaderCellWrapper = styled.div`
  display: grid;
  grid-template-columns: 0.75fr 3fr 3fr 3fr 3fr 3fr;
  border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};
  padding: 10px;
`
