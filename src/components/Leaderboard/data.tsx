import { client } from 'graphql/limitlessGraph/limitlessClients'
import { AddQuery, ReduceQuery, IncreaseLiquidityQuery, DecreaseLiquidityQuery, CollectQuery} from 'graphql/limitlessGraph/queries'
import { useReferralContract, useDataProviderContract, useLmtNFTPositionManager, usePoolContract } from 'hooks/useContract'
import { ethers } from 'ethers'
import { useMemo, useState, useEffect } from 'react'
import { useLmtLpPositionsFromTokenIds } from 'hooks/useV3Positions'
import { BigNumber } from '@ethersproject/bignumber'
import { BigNumber as BN } from 'bignumber.js'
import { Currency, CurrencyAmount, Price, SupportedChainId, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { useCurrency } from 'hooks/Tokens'
import { useUSDPrice } from 'hooks/useUSDPrice'
import { gql } from "@apollo/client"
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'

interface AddPositionData{
  trader: string
}


type PricesMap = { [address: string]: number }
const usdValueData: PricesMap = {
  // feth
  "0x4E3F175b38098326a34F2C8B2D07AF5fFdfc6fA9": 2000,
  // fusdc 
  "0x569f3140FDc0f3B9Fc2E4919C35f35D39dd2B01A": 1,
};

export const usdValue = new Proxy<PricesMap>(usdValueData, {
  get: (target, address: string) => address in target ? target[address] : 0,
});
//usdValue[address] * amount = usdAmount


export function usePointsData() {
  const [uniqueTokenIds, setUniqueTokenIds] = useState<BigNumber[]>([])
  const [uniquePools, setUniquePools] = useState<any>([])
  const [uniqueTokens, setUniqueTokens] = useState<any>()
  const {account, chainId} = useWeb3React()
  const [addData, setAddData] = useState<any>()
  const [reduceData, setReduceData] = useState<any>()
  const [addLiqData, setAddLiqData] = useState<any>()
  const [decreaseLiqData, setDecreaseLiqData] = useState<any>()
  const [codeUsers, setCodeUsers] = useState<any>([])
  const [uniqueReferrers, setUniqueReferrers] = useState<any>([])
  const [collectData, setCollectData] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()
  const nfpm = useLmtNFTPositionManager()
  const dataProvider = useDataProviderContract()
  const referralContract = useReferralContract()
  
  useEffect(() => {
    if (!client || !AddQuery || loading || error || !referralContract ||!account) return
      const call = async () => {
        try {
          setLoading(true)
          const AddQueryData = await client.query(AddQuery, {}).toPromise()
          const ReduceQueryData = await client.query(ReduceQuery, {}).toPromise() 
          const AddLiqQueryData = await client.query(IncreaseLiquidityQuery, {}).toPromise()
          const CollectQueryData = await client.query(CollectQuery, {}).toPromise() 
          const DecreaseLiquidityData = await client.query(DecreaseLiquidityQuery, {}).toPromise()
          console.log('AddQuery', AddQueryData.data.marginPositionIncreaseds, AddLiqQueryData, CollectQueryData, DecreaseLiquidityData)
          

          const uniqueTokenIds = new Set<string>()
          const uniqueTraders = new Set<string>()

          AddLiqQueryData?.data?.increaseLiquidities.forEach((entry: any)=>{
            if(!uniqueTokenIds.has(entry.tokenId)){
              uniqueTokenIds.add(entry.tokenId)
            }

          })

          const pools = new Set<string>()
          AddQueryData?.data?.marginPositionIncreaseds.forEach((entry:any)=>{
            // const poolContract = usePoolContract(entry.pool)
            if(!pools.has(entry.pool)){
              pools.add(entry.pool)
            }
            if(!uniqueTraders.has(ethers.utils.getAddress(entry.trader))){
              uniqueTraders.add(ethers.utils.getAddress(entry.trader))
            }
          })

          const bigNumberTokenIds = Array.from(uniqueTokenIds).map(id => BigNumber.from(id))
          setUniqueTokenIds(bigNumberTokenIds)
          setUniqueReferrers(Array.from(uniqueTraders))
          setUniquePools(Array.from(pools))
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

  const [loaded, setLoaded] = useState(false)
  useEffect(()=>{
    const uniqueTokens_ = new Map<string, any>()
    const call = async () => {
      try{
        const tokens  = (await Promise.all(uniquePools.map(async (pool:any)=> {
          const token = await dataProvider?.getPoolkeys(pool)
          if(token){
            if(!uniqueTokens_.has(pool)){
              uniqueTokens_.set(pool, [token[0], token[1]])
            }
            return {pool: (token[0], token[1])}
          } 
          else return null
        }
      )))
      setUniqueTokens(uniqueTokens_)
      setLoaded(true)
      }catch(err){
        console.log('tokens fetching ', err)
      }
    }
    call()
  }, [uniquePools, dataProvider])

  const[codeUserPerReferrer, setCodeUserPerReferrer] = useState<any>()
  useEffect(()=>{
    const codesUsers: { [key: string]: any } = {}

    const call = async()=>{
      try{
        (await Promise.all(uniqueReferrers.map(async (referrer:any)=> {

          let codeUsers
          try{
            codeUsers = await referralContract?.getReferees(referrer)

          }catch(err){

          }
          if(codeUsers) {
            if(!codesUsers[referrer]) codesUsers[referrer] = []
            codeUsers.forEach((user:string)=>{
              codesUsers[referrer].push(user)
            })
          }
        }
      )))
        setCodeUserPerReferrer(codesUsers)
      }catch(err){
        console.log('codeusererr', err)
      }
    }
    call()
  }, [uniqueReferrers, referralContract])

  console.log('codeuserperreffer', codeUserPerReferrer)
  const addDataProcessed = addData?.map((entry:any)=>({
    token: entry.positionIsToken0? uniqueTokens?.get(entry.pool)?.[0]: uniqueTokens?.get(entry.pool)?.[1],
    trader: entry.trader,
    amount: entry.addedAmount
  }))
  const reduceDataProcessed = reduceData?.map((entry:any)=>({
    token: entry.positionIsToken0? uniqueTokens?.get(entry.pool)?.[0]: uniqueTokens?.get(entry.pool)?.[1],
    trader: entry.trader,
    amount: entry.reduceAmount
  }))
  const tradeProcessedByTrader: { [key: string]: any } = {}
  addDataProcessed?.forEach((entry:any)=>{
    const trader = ethers.utils.getAddress(entry.trader)
    if(!tradeProcessedByTrader[trader]){
      tradeProcessedByTrader[trader] = []
    }
    let newEntry = entry
    newEntry.amount = usdValue[entry.token] * entry.amount
    tradeProcessedByTrader[trader].push(newEntry)

  })
  reduceDataProcessed?.forEach((entry:any)=>{
    const trader = ethers.utils.getAddress(entry.trader)

    if(!tradeProcessedByTrader[trader]){
      tradeProcessedByTrader[trader] = []
    }
    let newEntry = entry
    newEntry.amount = usdValue[entry.token] * entry.amount

    tradeProcessedByTrader[trader].push(newEntry)
  })

  const { positions:lpPositions, loading: lpPositionsLoading } = useLmtLpPositionsFromTokenIds(uniqueTokenIds);
  console.log('Collects', addLiqData, collectData, lpPositions)

  const uniqueLps = new Set<string>()
  lpPositions?.forEach((entry: any)=>{
    if(!uniqueLps.has(ethers.utils.getAddress(entry.operator))){
      uniqueLps.add(ethers.utils.getAddress(entry.operator))
    }
  })
  const lpPositionsByUniqueLps: { [key: string]: any } = {}
  lpPositions?.forEach((entry: any)=>{
    const sameTokenIdCollects = collectData.filter((collect:any)=>{
      if(collect.tokenId == entry.tokenId.toString()){
        return true
      }
      return false
    })

    const sameTokenIdDecreases = decreaseLiqData.filter((decrease:any)=>{
      if(decrease.tokenId == entry.tokenId.toString()){
        return true
      }
      return false
    })


    var amount0Collected = 0
    var amount1Collected = 0 
    for (let i=0 ; i < sameTokenIdCollects.length; i++){
      amount0Collected = amount0Collected+ Number(sameTokenIdCollects[i].amount0)
      amount1Collected = amount1Collected+ Number(sameTokenIdCollects[i].amount1) 
    }
    for (let i=0 ; i < sameTokenIdDecreases.length; i++){
      amount0Collected = amount0Collected - Number(sameTokenIdDecreases[i].amount0)
      amount1Collected = amount1Collected - Number(sameTokenIdDecreases[i].amount1)
    }

    console.log('amounts collectedtotal', amount0Collected, amount1Collected)
    if(!lpPositionsByUniqueLps[ethers.utils.getAddress(entry.operator)]){
      lpPositionsByUniqueLps[ethers.utils.getAddress(entry.operator)] = []
    }

    // collectf
    lpPositionsByUniqueLps[ethers.utils.getAddress(entry.operator)].push({
      token0: entry.token0, 
      token1: entry.token1, 
      tokenId: entry.tokenId.toString(), 
      amount0Collected: usdValue[entry.token0]* amount0Collected, 
      amount1Collected: usdValue[entry.token1]* amount1Collected
    })
  })
  console.log('lpPositionsByUniqueLps', lpPositionsByUniqueLps)

  const refereeActivity = useMemo(()=>{
    if(!codeUserPerReferrer) return
    const result: { [key: string]: any } = {};

    Object.keys(codeUserPerReferrer).forEach((referrer:string)=>{
      const codeUsers = codeUserPerReferrer[referrer]
      var collectAmount = 0
      var tradeAmount = 0 
      codeUsers?.forEach((address: any)=>{
        lpPositionsByUniqueLps?.[address]?.forEach((position:any)=>{
          collectAmount +=  Number(position.amount0Collected) // TODO use position.token0 and get prices
          collectAmount +=  Number(position.amount1Collected) // TODO use position.token1 and get prices
        })
      })

      codeUsers?.forEach((address: any)=>{
        tradeProcessedByTrader?.[address]?.forEach((trade:any)=>{
          tradeAmount += Number(trade.amount) // TODO use trade.token and get prices 
        })
      })
      result[referrer] = {lpAmount: collectAmount, tradeVolume:tradeAmount }

    })

    return result
  }, [codeUsers,codeUserPerReferrer, lpPositionsByUniqueLps, tradeProcessedByTrader])

  ///[referee1: [trading volume,  ]]
  /// referrals: get everyone who used your code,
  /// get all trading volume and collected tokens for these addresses 
  /// get referral multiplier * scaling* tradingvolume + scaling * collectvolume 
  /// 
  // console.log('lppositions',  lpPositionsByUniqueLps,tradeProcessedByTrader)
  // console.log('gett', lpPositionsByUniqueLps?.[codeUsers[0]],
  //   tradeProcessedByTrader?.[codeUsers[0]] )


  const token = useCurrency("0x4E3F175b38098326a34F2C8B2D07AF5fFdfc6fA9")
  const { data: usdPrice } = useUSDPrice(token ? tryParseCurrencyAmount('1', token) : undefined)
  // console.log('token', token, usdPrice, tryParseCurrencyAmount('1', token?token:undefined))

  return useMemo(() => {
    return {
      tradeProcessedByTrader,
      lpPositionsByUniqueLps,
      refereeActivity
      // This includes loading, positions, etc.
      // loading,
      // error
    };
  }, [addData, addLiqData, reduceData, collectData, lpPositions, loading, error])
}