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

export const LiquidityProvidedQuery = `
  query($first: Int!, $skip: Int!) {
    liquidityProvideds(first: $first, skip: $skip, orderBy: blockTimestamp, orderDirection: desc) {
      pool
      recipient
      liquidity
      tickLower
      tickUpper
      blockTimestamp
    }
  }
`

export const LiquidityWithdrawnQuery = `
  query($first: Int!, $skip: Int!) {
    liquidityWithdrawns(first: $first, skip: $skip, orderBy: blockTimestamp, orderDirection: desc) {
      pool
      recipient
      liquidity
      tickLower
      tickUpper
      blockTimestamp
    }
  }
`

export const TokensDataFromUniswapQuery = (tokenIds: string[]) => {
  return `
    query ($id_in: [Bytes!] = []) {
      tokens(where: {id_in: ${JSON.stringify(tokenIds)}}) {
        id
        name
        symbol
        decimals
        lastPriceUSD
      }
    }
  `
}


export const TokenDataFromUniswapQuery = (tokenId: string) => {
  return `
  query { 
    token(id: \"${tokenId}\") { 
      id 
      name
      symbol
      decimals
      lastPriceUSD
      
    } 
  }
  `
}

export const AddOrderQuery = `
  query {
    orderAddeds(orderBy: blockTimestamp) {
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
      transactionHash
    }
  }
`
export const CancelOrderQuery = `
  query {
    orderCanceleds(orderBy: blockTimestamp)  {
      pool
      positionIsToken0
      trader
      isAdd
      blockTimestamp
      transactionHash
    }
  }
`

export const ForceClosedQuery = `
  query {
    forceCloseds(orderBy: blockTimestamp)  {
      pool
      positionIsToken0
      marginInPosToken
      margin
      trader
      forcedClosedAmount     
      rangeCondition 
      blockTimestamp
      blockNumber
      transactionHash
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

export const AddQuery = `
  query($first: Int!, $skip: Int!) {
    marginPositionIncreaseds(first: $first, skip: $skip, orderBy: blockTimestamp, orderDirection: desc)  {
      pool
      positionIsToken0
      marginInPosToken
      trader
      addedAmount    
      marginAmount
      borrowAmount
      filler
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`

export const ReduceQuery = `
  query($first: Int!, $skip: Int!) {
    marginPositionReduceds(first: $first, skip: $skip, orderBy: blockTimestamp, orderDirection: desc)  {
      pool
      positionIsToken0
      marginInPosToken
      trader
      reduceAmount      
      PnL
      filler
      amount0
      amount1
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`

export const AddVolumeQuery = `
  query($first: Int!, $skip: Int!) {
    marginPositionIncreaseds(first: $first, skip: $skip, orderBy: blockTimestamp, orderDirection: desc, where: {blockTimestamp_lte: 1716264730})  {
      pool
      positionIsToken0
      marginInPosToken
      trader
      addedAmount    
      marginAmount
      borrowAmount
      filler
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`

export const ReduceVolumeQuery = `
  query($first: Int!, $skip: Int!) {
    marginPositionReduceds(first: $first, skip: $skip, orderBy: blockTimestamp, orderDirection: desc, where: {blockTimestamp_lte: 1716264730})  {
      pool
      positionIsToken0
      marginInPosToken
      trader
      reduceAmount      
      PnL
      filler
      amount0
      amount1
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`

export const IncreaseLiquidityQuery = `
    query {
      increaseLiquidities(orderBy: blockTimestamp orderDirection: desc) {
      tokenId
      liquidity
      amount0
      amount1    
      blockNumber  
      blockTimestamp
    }
  }
`

export const DecreaseLiquidityQuery = `
    query {
      decreaseLiquidities(orderBy: blockTimestamp orderDirection: desc) {
      tokenId
      liquidity
      amount0
      amount1    
      blockNumber  
      blockTimestamp
    }
  }
`

export const CollectQuery = `
  query {
    collects(orderBy: blockTimestamp orderDirection: desc) {
      tokenId
      amount0
      amount1
      recipient
      blockNumber
      blockTimestamp
    }
  }
`


export const DepositVaultQuery = `
  query {
    deposits(orderBy: blockTimestamp orderDirection: desc) {
      caller
      owner
      assets
      shares 
      blockNumber
      blockTimestamp
    }
  }
`

export const WithdrawVaultQuery = `
  query {
    withdraws(orderBy: blockTimestamp orderDirection: desc) {
      caller
      owner
      assets
      shares 
      blockNumber
      blockTimestamp
    }
  }
`

export const RegisterQuery = `
  query {
    registerCodes {
      blockTimestamp
      account
    }
  }
`

export const Pool24hVolumeQuery = (poolAddress: string, timestamp: number) => {
  return `
  query {
      liquidityPool(id: "${poolAddress}") {
        dailySnapshots(
          where: {timestamp_gte: "${timestamp}"}
          orderBy: timestamp
          orderDirection: desc
        ) {
          dailyVolumeUSD
          timestamp
          pool {
            id
          }
        }
      }
    }
  `
}