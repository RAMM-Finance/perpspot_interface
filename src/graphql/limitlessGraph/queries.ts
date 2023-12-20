import {gql} from "@apollo/client"

export const POOL_STATS_QUERY = gql`
query poolHourDatas($startTime: Int!, $address: String!) {
  poolHourDatas(
    where: { pool: $address, periodStartUnix_gt: $startTime }
    orderBy: periodStartUnix
    orderDirection: desc
  ) {
    periodStartUnix
    token0Price
    token1Price
    volumeToken0
    volumeToken1
    high
    low
  }
}
`


export const AddOrderQuery = `
  query {
    orderAddeds {
      pool
      positionIsToken0
      trader
      isAdd
      deadline
      startOutput
      minOutput
      decayRate
      margin
      inputAmount
      blockTimestamp
    }
  }
`

export const PoolAddedQuery = `
  query {
    poolAddeds {
      id
      pool
      token0
      token1
      fee
      tickDiscretization
      blockTimestamp
    }
  }
`