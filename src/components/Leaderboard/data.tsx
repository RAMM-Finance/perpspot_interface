import { BigNumber } from '@ethersproject/bignumber'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { client } from 'graphql/limitlessGraph/limitlessClients'
import {
  AddQuery,
  CollectQuery,
  DecreaseLiquidityQuery,
  IncreaseLiquidityQuery,
  ReduceQuery,
} from 'graphql/limitlessGraph/queries'
import {
  tokenDecimal,
  usdValue,
  useDataProviderContract,
  useLmtNFTPositionManager,
  useReferralContract,
} from 'hooks/useContract'
import { useLmtLpPositionsFromTokenIds } from 'hooks/useV3Positions'
import { useEffect, useMemo, useState } from 'react'

interface AddPositionData {
  trader: string
}

export function usePointsData() {
  const [uniqueTokenIds, setUniqueTokenIds] = useState<BigNumber[]>([])
  const [uniquePools, setUniquePools] = useState<any>([])
  const [uniqueTokens, setUniqueTokens] = useState<any>()
  const { account, chainId } = useWeb3React()
  const [addData, setAddData] = useState<any>()
  const [reduceData, setReduceData] = useState<any>()
  const [addLiqData, setAddLiqData] = useState<any>()
  const [decreaseLiqData, setDecreaseLiqData] = useState<any>()
  const [codeUsers, setCodeUsers] = useState<any>([])
  const [uniqueReferrers, setUniqueReferrers] = useState<any>([])
  const [collectData, setCollectData] = useState<any>()
  const [codeUserPerReferrer, setCodeUserPerReferrer] = useState<any>()
  const [referralMultipliers, setReferralMultipliers] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()
  const nfpm = useLmtNFTPositionManager()
  const dataProvider = useDataProviderContract()
  const referralContract = useReferralContract()

  const { positions: lpPositions, loading: lpPositionsLoading } = useLmtLpPositionsFromTokenIds(uniqueTokenIds)

  const uniqueLps = new Set<string>()
  lpPositions?.forEach((entry: any) => {
    if (!uniqueLps.has(ethers.utils.getAddress(entry.operator))) {
      uniqueLps.add(ethers.utils.getAddress(entry.operator))
    }
  })

  useEffect(() => {
    if (!client || !AddQuery || loading || error || !referralContract || !account) return
    const call = async () => {
      try {
        setLoading(true)
        const AddQueryData = await client.query(AddQuery, {}).toPromise()
        const ReduceQueryData = await client.query(ReduceQuery, {}).toPromise()
        const AddLiqQueryData = await client.query(IncreaseLiquidityQuery, {}).toPromise()
        const CollectQueryData = await client.query(CollectQuery, {}).toPromise()
        const DecreaseLiquidityData = await client.query(DecreaseLiquidityQuery, {}).toPromise()
        console.log(
          'AddQuery',
          AddQueryData.data.marginPositionIncreaseds,
          AddLiqQueryData,
          CollectQueryData,
          DecreaseLiquidityData
        )

        const uniqueTokenIds = new Set<string>()
        const uniqueTraders = new Set<string>()

        AddLiqQueryData?.data?.increaseLiquidities.forEach((entry: any) => {
          if (!uniqueTokenIds.has(entry.tokenId)) {
            uniqueTokenIds.add(entry.tokenId)
          }
        })

        const pools = new Set<string>()
        AddQueryData?.data?.marginPositionIncreaseds.forEach((entry: any) => {
          // const poolContract = usePoolContract(entry.pool)
          if (!pools.has(entry.pool)) {
            pools.add(entry.pool)
          }
          if (!uniqueTraders.has(ethers.utils.getAddress(entry.trader))) {
            uniqueTraders.add(ethers.utils.getAddress(entry.trader))
          }
        })

        let codeUsers
        try {
          codeUsers = await referralContract?.getReferees(account)
        } catch (err) {}

        const uniquePools = Array.from(pools)
        const uniqueTokens_ = new Map<string, any>()
        try {
          const tokens = await Promise.all(
            Array.from(pools).map(async (pool: any) => {
              const token = await dataProvider?.getPoolkeys(pool)
              if (token) {
                if (!uniqueTokens_.has(pool)) {
                  uniqueTokens_.set(pool, [token[0], token[1]])
                }
                return { pool: (token[0], token[1]) }
              } else return null
            })
          )
          setUniqueTokens(uniqueTokens_)
        } catch (err) {
          console.log('tokens fetching ', err)
        }

        const codesUsers: { [key: string]: any } = {}
        const referralMultipliers: { [key: string]: any } = {}

        const uniqueReferrers = Array.from(uniqueTraders).concat(['0xD0A0584Ca19068CdCc08b7834d8f8DF969D67bd5'])
        try {
          await Promise.all(
            uniqueReferrers.map(async (referrer: any) => {
              let codeUsers
              let referralMultiplier
              try {
                codeUsers = await referralContract?.getReferees(referrer)
                referralMultiplier = await referralContract?.referralMultipliers(referrer)
              } catch (err) {}
              if (codeUsers) {
                if (!codesUsers[referrer]) codesUsers[referrer] = []
                codeUsers.forEach((user: string) => {
                  codesUsers[referrer].push(user)
                })
              }
              if (referralMultiplier) {
                referralMultipliers[referrer] = referralMultiplier.toNumber() + 1
              }
            })
          )
          setCodeUserPerReferrer(codesUsers)
          setReferralMultipliers(referralMultipliers)
        } catch (err) {
          console.log('codeusererr', err)
        }

        setCodeUsers(codeUsers)
        const bigNumberTokenIds = Array.from(uniqueTokenIds).map((id) => BigNumber.from(id))
        setUniqueTokenIds(bigNumberTokenIds)
        setUniqueReferrers(uniqueReferrers)
        setUniquePools(uniquePools)
        setAddData(AddQueryData.data.marginPositionIncreaseds)
        setReduceData(ReduceQueryData.data.marginPositionReduceds)
        setAddLiqData(AddLiqQueryData.data.increaseLiquidities)
        setDecreaseLiqData(DecreaseLiquidityData.data.decreaseLiquidities)
        setCollectData(CollectQueryData.data.collects)
        setLoading(false)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }
    call()
  }, [account, referralContract])

  const PointsData = useMemo(() => {
    const addDataProcessed = addData?.map((entry: any) => ({
      token: entry.positionIsToken0 ? uniqueTokens?.get(entry.pool)?.[0] : uniqueTokens?.get(entry.pool)?.[1],
      trader: entry.trader,
      amount: entry.addedAmount,
    }))
    const reduceDataProcessed = reduceData?.map((entry: any) => ({
      token: entry.positionIsToken0 ? uniqueTokens?.get(entry.pool)?.[0] : uniqueTokens?.get(entry.pool)?.[1],
      trader: entry.trader,
      amount: entry.reduceAmount,
    }))

    const tradeProcessedByTrader: { [key: string]: any } = {}

    addDataProcessed?.forEach((entry: any) => {
      const trader = ethers.utils.getAddress(entry.trader)
      if (!tradeProcessedByTrader[trader]) {
        tradeProcessedByTrader[trader] = []
      }
      const newEntry = entry
      newEntry.amount = (usdValue[entry.token] * entry.amount) / 10 ** tokenDecimal[entry.token]
      tradeProcessedByTrader[trader].push(newEntry)
    })
    reduceDataProcessed?.forEach((entry: any) => {
      const trader = ethers.utils.getAddress(entry.trader)

      if (!tradeProcessedByTrader[trader]) {
        tradeProcessedByTrader[trader] = []
      }
      const newEntry = entry
      newEntry.amount = (usdValue[entry.token] * entry.amount) / 10 ** tokenDecimal[entry.token]

      tradeProcessedByTrader[trader].push(newEntry)
    })

    const lpPositionsByUniqueLps: { [key: string]: any } = {}
    lpPositions?.forEach((entry: any) => {
      const sameTokenIdCollects = collectData.filter((collect: any) => {
        if (collect.tokenId == entry.tokenId.toString()) {
          return true
        }
        return false
      })

      const sameTokenIdDecreases = decreaseLiqData.filter((decrease: any) => {
        if (decrease.tokenId == entry.tokenId.toString()) {
          return true
        }
        return false
      })

      let amount0Collected = 0
      let amount1Collected = 0
      for (let i = 0; i < sameTokenIdCollects.length; i++) {
        amount0Collected = amount0Collected + Number(sameTokenIdCollects[i].amount0)
        amount1Collected = amount1Collected + Number(sameTokenIdCollects[i].amount1)
      }
      for (let i = 0; i < sameTokenIdDecreases.length; i++) {
        amount0Collected = amount0Collected - Number(sameTokenIdDecreases[i].amount0)
        amount1Collected = amount1Collected - Number(sameTokenIdDecreases[i].amount1)
      }

      const lpAddress = ethers.utils.getAddress(entry.operator)
      if (!lpPositionsByUniqueLps[lpAddress]) {
        lpPositionsByUniqueLps[lpAddress] = []
      }

      lpPositionsByUniqueLps[lpAddress].push({
        token0: entry.token0,
        token1: entry.token1,
        tokenId: entry.tokenId.toString(),
        amount0Collected: (usdValue[entry.token0] * amount0Collected) / 10 ** tokenDecimal[entry.token0],
        amount1Collected: (usdValue[entry.token1] * amount1Collected) / 10 ** tokenDecimal[entry.token1],
      })
    })

    return {
      tradeProcessedByTrader,
      lpPositionsByUniqueLps,
    }
  }, [
    account,
    uniqueLps,
    uniqueTokens,
    addData,
    reduceData,
    addLiqData,
    lpPositions,
    decreaseLiqData,
    collectData,
    codeUsers,
    codeUserPerReferrer,
    referralMultipliers,
  ])

  const tradeProcessedByTrader = PointsData.tradeProcessedByTrader
  const lpPositionsByUniqueLps = PointsData.lpPositionsByUniqueLps

  const refereeActivity = useMemo(() => {
    if (!codeUserPerReferrer) return
    const result: { [key: string]: any } = {}
    uniqueReferrers.forEach((referrer: string) => {
      const codeUsers = codeUserPerReferrer[referrer]
      let collectAmount = 0
      let tradeAmount = 0
      codeUsers?.forEach((address: any) => {
        lpPositionsByUniqueLps?.[address]?.forEach((position: any) => {
          collectAmount += Number(position.amount0Collected) // TODO use position.token0 and get prices
          collectAmount += Number(position.amount1Collected) // TODO use position.token1 and get prices
        })
      })

      codeUsers?.forEach((address: any) => {
        tradeProcessedByTrader?.[address]?.forEach((trade: any) => {
          tradeAmount += Number(trade.amount) // TODO use trade.token and get prices
        })
      })
      result[referrer] = {
        lpAmount: collectAmount,
        tradeVolume: tradeAmount,
        usersReferred: codeUsers && codeUsers.length,
        point: referralMultipliers[referrer] * (tradeAmount + collectAmount),
        tier: referralMultipliers[referrer],
      }
    })

    return result
  }, [account, codeUsers, uniqueReferrers, lpPositionsByUniqueLps, tradeProcessedByTrader])

  console.log(
    'codeusers',
    codeUsers,
    referralMultipliers,
    refereeActivity?.['0xD0A0584Ca19068CdCc08b7834d8f8DF969D67bd5']
  )
  return useMemo(() => {
    return {
      tradeProcessedByTrader,
      lpPositionsByUniqueLps,
      refereeActivity,
    }
  }, [account, addData, addLiqData, reduceData, collectData, lpPositions, loading, error])
}
