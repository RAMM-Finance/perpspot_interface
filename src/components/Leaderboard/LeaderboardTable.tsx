import { useWeb3React } from '@web3-react/core'
import { LoadingBubble } from 'components/Tokens/loading'
import { MouseoverTooltip } from 'components/Tooltip'
import { useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatDollar } from 'utils/formatNumbers'

import { CollectMultipler, referralDivisor, usePointsData, useStoredData } from './data'
interface Leader {
  rank: number
  tradePoint: number
  lpPoint: number
  referralPoint: number
  totalPoint: number
  wallet: string
}

export const addresses = [
  '0x69f8D754C5f4F73aad00f3C22EaFB77Aa57Ff1BC',
  '0x5cA5eF79e980C012f68C5554d75604c93c2592E3',
  '0xdf84bD25527c156e158499110FFD745282Cb6557',
  '0xD0A0584Ca19068CdCc08b7834d8f8DF969D67bd5',
  '0xEF7F2e81EA14538858d962df34eB1bFDa83da395',
  '0x15175D508dD136A6d8cf0B0eDeC191cCcbfEF8cA',
  '0xFdbBfB0Fe2986672af97Eca0e797D76A0bbF35c9',
  '0x3Df2daca4e08afE5a46B8847c4a5799AfA09176C',
  '0x1a4Fdf8aE9c82b979a0fED2b9665d1E22A4D71C0',
  '0xa6F473548CB679d60Cebf7C00e9b37816f0b1E17',
  '0xBC02E19F1272216b3D2EDDf1b4Ef30eEA1B170eB',
  '0xDDA207de733004A3b8d9a06FA2d394880a4a756a',
  '0x5e46f0D1B3e1Cf21d584FB557F98eb3EA4A19059',
  '0x55eB0BE8F67Ad11CD137A49C3646090dE0544B37',
  '0x6799e4fb8bEc9eaB7496c98B4668DDef146Ef6E0',
  '0x5C87aA10cd753Ebf828AD352aef786e289065A57',
  '0x5d47e5D242a8F66a6286b0a2353868875F5d6068',
  '0x64dA461ECbAa3FEC3625F21b74a8c74394d501c9',
  '0xFC9e9FB8D4d5da640Ce492AFa6DE7e62b31f14d8',
  '0x861a2b7d36F21B8873AdAE86AeB5A02C03f6C022',
  '0xECa622A39c03Ab4cB191BC09c9Cc0DaDb216EaDD',
  '0x32a59b87352e980dD6aB1bAF462696D28e63525D',
  '0x115d0d8822efc9607c52B04628098b48970B993b',
  '0x420f5A4a8EA8905f9E00DBf4c7a13f568B183feA',
  '0xb957DccaA1CCFB1eB78B495B499801D591d8a403',
  '0xF7764A9B664a3905192d95Aa43201033258871C6',
  '0x0cD16F3F840852b17dB7f47C270BBd1a9D082BF3',
  '0x489D69939b4Aca357f630055e351A81F1Fbb7Fb6',
  '0x6756506A5c263710E5CDb392140DF1f958835e38',
  '0xb92505a3364B7C7E333c05B44cE1E55377fC43cA',
  '0x03894d4ac41Dd6C4c2f524eD4417C90fA46972c6',
  '0x6ED0B92553d2be567d0b1245aE4e66cBd1ADe51f',
  '0x0C5567DDB9eEA6A66365D55Bc5302567B288b978',
  '0x3A0AEa3511918412CFE2B779E8C8Ac0E378580Db',
  '0x5A4B09693CcaA2c3218592D0bAFa7788A01F4600',
  '0xA576c23C77E4bc1c33aAFbC53E4d030d904F8Db3',
  '0xCD129EED8079258CFA9aBB2C653BB736b2277419',
  '0xF3b7dfDE0C8184adA828E7F7F3Cb02472C40105B',
  '0xaB888291F4127352B655fd476F64AC2ebfb8fe76',
  '0xc1fA63BD4189a9C49A30010B6a3aB11194A95842',
  '0x815AC0CCf85bAB38B1953a008f80bb028bFc317A',
  '0xC74AB274E594fdC1b5dBD32479F5A25ab7FD8f66',
  '0x014C3331E2dc950F08dC4A3a2c20Ac337B4c8447',
  '0xF9107317B0fF77eD5b7ADea15e50514A3564002B',
  '0x3D1d397ACD3b0989d9e633d6DBF7E6F8F5c03a2D',
  '0x83Efb352523f4A347A0e70d5a58238454Af9089d',
  '0x510E0eCFD1171A43e1819Fd9d242F7ec5d4a9Ec1',
  '0xE9A1fCde88e9f09cb38818a855738F226c14Fef7',
  '0xFc44c7C652a174c1F6b43dCA5B9E86A443B9ae8A',
  '0xF3Bdf46dD9036EaE38373BB4b98C144e3F3b67c2',
  '0x3e3672B23eB22946A31263d2D178bF0fB1f4BBFD',
  '0x43A996fa50d2f378d707aCA9dDCDE1C30CB68f63',
  '0xcb5Ba544094015adeDa55724f811C5ecF3904bb7',
  '0xD690B90480010DCd01e13a26835D67D1c71FDAE8',
  '0x10A6F39225c50a53045863CbaCc863DD45600302',
  '0xD8e51fc9A41C19bcA7646dC054F03c40BC5ec6a8',
  '0xFE49F9193ef934f403455016A191e208dc2374E8',
  '0xD2a7D8EC1466Cb3C531EAC23819cA9Fc249F35D8',
  '0x9e60aa0c7B3bAE800f725C20088330cDB05D7487',
  '0x43f08aaAc525B75263982b1171EF32495eFA2ec0',
  '0x5fc026Ab7F7C6ac62c62e4382F7FF3d37e2C2a75',
  '0xCb45B819E881fA7a5946B6b8f92A5576faa5a3Bb',
  '0xd16E596d6F9556e0fC79A15DD26c22349912B4dA',
  '0x5455d09d5a5B962eEdD8C0C9451eabe8cD0e61FF',
  '0x368c633BF3989653922b2DeBeF8cAC04Ae0BfDfB',
  '0x401cC3136E4927301Aea787739518A4CBf2fF984',
  '0x95e46c08d802a24aC2357217FFdceBa17FcCa082',
  '0x4F02Bbe7Fc56c412B24E59fDd79e2DfA4C6B6048',
]
export default function LeaderboardTable() {
  const { chainId } = useWeb3React()

  const tradePoints = usePointsData()
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
    const uniqueUsers = [...new Set(flattenedUsers)].filter(
      (user) => user !== '0x0000000000000000000000000000000000000000'
    )
    return uniqueUsers
  }

  function createUserDataObj(usersArr: any, obj: any) {
    const usersArrLP = usersArr.map((user: string) => {
      if (Object.keys(obj.lpPositionsByUniqueLps).find((lpUser) => lpUser === user)) {
        return {
          trader: user,
          lpPoints:
            obj.lpPositionsByUniqueLps[user].reduce(
              (accum: number, tok: any) =>
                accum + (tok.amount0Collected * CollectMultipler + tok.amount1Collected * CollectMultipler),
              0
            ) + (obj.timeWeightedDeposits[user] ? obj.timeWeightedDeposits[user].timeWeighted : 0),
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
          rPoints:
            obj.refereeActivity[rpUser.trader].lpAmount / referralDivisor +
            obj.refereeActivity[rpUser.trader].tradeVolume / referralDivisor,
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

  // const usersArr = useMemo(() => {
  //   return extractUsers(tradePoints)
  // }, [tradePoints])

  // const userData = useMemo(() => {
  //   return createUserDataObj(usersArr, tradePoints)
  // }, [usersArr, tradePoints, chainId])

  const userData = useMemo(() => {
    const extUsers = extractUsers(tradePoints)
    return createUserDataObj(extUsers, tradePoints)
  }, [tradePoints])

  console.log('userData', userData)

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
            Trade LMT
          </ThemedText.SubHeaderSmall>
        </HeaderCell>
        <HeaderCell>
          <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
            LP LMT
          </ThemedText.SubHeaderSmall>
        </HeaderCell>
        <HeaderCell>
          <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
            Referral LMT
          </ThemedText.SubHeaderSmall>
        </HeaderCell>
        <HeaderCell>
          <ThemedText.SubHeaderSmall color="textPrimary" fontSize={12}>
            Total LMT
          </ThemedText.SubHeaderSmall>
        </HeaderCell>
      </HeaderCellWrapper>
    )
  }

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 8)}...${wallet.slice(wallet.length - 8, wallet.length)}`
  }

  const prevData = useStoredData(addresses)

  const [loading, setLoading] = useState(true)

  const combinedData = useMemo(() => {
    if (!prevData || !chainId) {
      setLoading(true)
      return undefined
    // } else if (prevData && chainId !== 8453) {
    //   setLoading(false)
    //   return prevData
    } else {
      setLoading(false)
      return prevData
        .filter((obj: any, index: any) => {
          return index === prevData.findIndex((o: any) => obj.trader === o.trader)
        })
        .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
        .map((user: any, index: number) => {
          return {
            ...user,
            rank: index + 1,
          }
        })
    }
  }, [prevData, chainId])
  // const combinedData = useMemo(()=>{
  //   if(!prevData || !userData) return

  //   return combineAndSumData(prevData, userData);

  // }, [prevData, userData])

  // console.log('userdata', combinedData)
  // const users: string[] = [];
  // const lpPoints: number[] = [];
  // const rPoints: number[] = [];
  // const tPoints: number[] = [];

  // combinedData?.forEach((data, index) => {
  //     users[index] = data.trader;
  //     lpPoints[index] = Math.round(data.lpPoints);
  //     // For rPoints and tPoints, assuming you want to round them to the nearest whole number
  //     rPoints[index] = Math.round(data.rPoints);
  //     tPoints[index] = Math.round(data.tPoints);
  // });

  // // Output the arrays (or do whatever is needed with them)
  // console.log('userdata', users, lpPoints, rPoints, tPoints);

  return (
    <>
      <LeaderboardHeader />

      {loading ? (
        <LoadingRow />
      ) : (
        combinedData?.map((user: any) => {
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
        })
      )}
    </>
  )
}

function LoadingRow() {
  return (
    <>
      <LoadedCellWrapper>
        <IconLoadingBubble />
        <LongLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
      </LoadedCellWrapper>
      <LoadedCellWrapper>
        <IconLoadingBubble />
        <LongLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
      </LoadedCellWrapper>
      <LoadedCellWrapper>
        <IconLoadingBubble />
        <LongLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
      </LoadedCellWrapper>
      <LoadedCellWrapper>
        <IconLoadingBubble />
        <LongLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
      </LoadedCellWrapper>
      <LoadedCellWrapper>
        <IconLoadingBubble />
        <LongLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
        <MediumLoadingBubble />
      </LoadedCellWrapper>
    </>
  )
}

const MediumLoadingBubble = styled(LoadingBubble)`
  width: 65%;
`
const LongLoadingBubble = styled(LoadingBubble)`
  width: 90%;
`
const IconLoadingBubble = styled(LoadingBubble)`
  border-radius: 50%;
  width: 24px;
`

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
