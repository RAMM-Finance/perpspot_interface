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
  query {
    liquidityProvideds {
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
  query {
    liquidityWithdrawns {
      pool
      recipient
      liquidity
      tickLower
      tickUpper
      blockTimestamp
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

export const AddQuery = `
  query {
    marginPositionIncreaseds {
      pool
      positionIsToken0
      trader
      addedAmount      
      blockTimestamp
    }
  }
`
export const ReduceQuery = `
  query {
    marginPositionReduceds {
      pool
      positionIsToken0
      trader
      reduceAmount      
      blockTimestamp
    }
  }
`

export const IncreaseLiquidityQuery = `
  query {
    increaseLiquidities {
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
    decreaseLiquidities {
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
    collects {
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
    deposits {
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
    withdraws {
      caller
      owner
      assets
      shares 
      blockNumber
      blockTimestamp
    }
  }
`
