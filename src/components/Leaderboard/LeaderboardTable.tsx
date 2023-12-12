import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

interface Leader {
  rank: number
  tradePoint: number
  lpPoint: number
  referralPoint: number
  totalPoint: number
  wallet: string
}

export default function LeaderboardTable() {
  const leaderInfo = [
    {
      rank: 1,
      tradePoint: 12231.24,
      lpPoint: 15231.23,
      referralPoint: 8231.19,
      totalPoint: 25245.41,
      wallet: '0x34314dcsxcd',
    },
    {
      rank: 2,
      tradePoint: 12231.24,
      lpPoint: 15231.23,
      referralPoint: 8231.19,
      totalPoint: 25245.41,
      wallet: '0x34314dcsxcd',
    },
    {
      rank: 3,
      tradePoint: 12231.24,
      lpPoint: 15231.23,
      referralPoint: 8231.19,
      totalPoint: 25245.41,
      wallet: '0x34314dcsxcd',
    },
    {
      rank: 4,
      tradePoint: 12231.24,
      lpPoint: 15231.23,
      referralPoint: 8231.19,
      totalPoint: 25245.41,
      wallet: '0x34314dcsxcd',
    },
    {
      rank: 5,
      tradePoint: 12231.24,
      lpPoint: 15231.23,
      referralPoint: 8231.19,
      totalPoint: 25245.41,
      wallet: '0x34314dcsxcd',
    },
    {
      rank: 6,
      tradePoint: 12231.24,
      lpPoint: 15231.23,
      referralPoint: 8231.19,
      totalPoint: 25245.41,
      wallet: '0x34314dcsxcd',
    },
  ]
  return (
    <>
      <LeaderboardHeader />
      {leaderInfo.map((userData) => {
        return (
          <>
            <LoadedCellWrapper>
              <LoadedCell>
                <ThemedText.BodyPrimary>{userData.rank}</ThemedText.BodyPrimary>
              </LoadedCell>
              <LoadedCell>
                <ThemedText.BodyPrimary>{userData.wallet}</ThemedText.BodyPrimary>
              </LoadedCell>
              <LoadedCell>
                <ThemedText.BodyPrimary>{userData.tradePoint}</ThemedText.BodyPrimary>
              </LoadedCell>
              <LoadedCell>
                <ThemedText.BodyPrimary>{userData.lpPoint}</ThemedText.BodyPrimary>
              </LoadedCell>
              <LoadedCell>
                <ThemedText.BodyPrimary>{userData.referralPoint}</ThemedText.BodyPrimary>
              </LoadedCell>
              <LoadedCell>
                <ThemedText.BodyPrimary>{userData.totalPoint}</ThemedText.BodyPrimary>
              </LoadedCell>
            </LoadedCellWrapper>
          </>
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
  grid-template-columns: 1.5fr 3fr 3fr 3fr 3fr 3fr;
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
  grid-template-columns: 1.5fr 3fr 3fr 3fr 3fr 3fr;
  border-bottom: solid ${({ theme }) => theme.backgroundOutline};
  padding: 10px;
`

function LeaderboardHeader() {
  return (
    <HeaderCellWrapper>
      <HeaderCell>
        <ThemedText.SubHeaderSmall fontSize={12}>Rank</ThemedText.SubHeaderSmall>
      </HeaderCell>
      <HeaderCell>
        <ThemedText.SubHeaderSmall fontSize={12}>User</ThemedText.SubHeaderSmall>
      </HeaderCell>
      <HeaderCell>
        <ThemedText.SubHeaderSmall fontSize={12}>Trade Point</ThemedText.SubHeaderSmall>
      </HeaderCell>
      <HeaderCell>
        <ThemedText.SubHeaderSmall fontSize={12}>LP Point</ThemedText.SubHeaderSmall>
      </HeaderCell>
      <HeaderCell>
        <ThemedText.SubHeaderSmall fontSize={12}>Referral Point</ThemedText.SubHeaderSmall>
      </HeaderCell>
      <HeaderCell>
        <ThemedText.SubHeaderSmall fontSize={12}>Total Point</ThemedText.SubHeaderSmall>
      </HeaderCell>
    </HeaderCellWrapper>
  )
}
