import { client } from 'graphql/limitlessGraph/limitlessClients'
import { AddQuery, ReduceQuery, IncreaseLiquidityQuery, DecreaseLiquidityQuery, CollectQuery} from 'graphql/limitlessGraph/queries'
import { useReferralContract, useDataProviderContract,useLmtNFTPositionManager, usePoolContract } from 'hooks/useContract'
import { ethers } from 'ethers'
import { useMemo, useState,useEffect } from 'react'
import{ useLmtLpPositionsFromTokenIds} from 'hooks/useV3Positions' 
import { BigNumber } from '@ethersproject/bignumber'
import { BigNumber as BN } from 'bignumber.js'
import { Currency, CurrencyAmount, Price, SupportedChainId, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { useCurrency } from 'hooks/Tokens'
import {useUSDPrice} from 'hooks/useUSDPrice'
import {gql} from "@apollo/client"
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'





interface AddPositionData{
    trader: string

}

export function usePointsData() {
    const [uniqueTokenIds, setUniqueTokenIds] = useState<BigNumber[]>([])
    const [uniquePools, setUniquePools] = useState<any>([])
    const [uniqueTokens, setUniqueTokens] = useState<any>()
    const {chainId} = useWeb3React()
    const [addData, setAddData] = useState<any>()
    const [reduceData, setReduceData] = useState<any>()

    const [addLiqData, setAddLiqData] = useState<any>()
    const [collectData, setCollectData] = useState<any>()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<any>()
    const nfpm = useLmtNFTPositionManager()
    const dataProvider = useDataProviderContract()
    const referralContract = useReferralContract()
    
    useEffect(() => {

        if (!client || !AddQuery || loading || error) return
            const call = async () => {
                try {
                    setLoading(true)

                    const AddQueryData = await client.query(AddQuery, {}).toPromise()
                    const ReduceQueryData = await client.query(ReduceQuery, {}).toPromise() 
                    const AddLiqQueryData = await client.query(IncreaseLiquidityQuery, {}).toPromise()
                    const CollectQueryData = await client.query(CollectQuery, {}).toPromise() 

                    console.log('AddQuery', AddQueryData.data.marginPositionIncreaseds, 
                        AddLiqQueryData, CollectQueryData)
                    
                    const uniqueTokenIds = new Set<string>()
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
                    })

                    const bigNumberTokenIds = Array.from(uniqueTokenIds).map(id => BigNumber.from(id))
                    setUniqueTokenIds(bigNumberTokenIds)
                    setUniquePools(Array.from(pools))
                    setAddData(AddQueryData.data.marginPositionIncreaseds)
                    setReduceData(ReduceQueryData.data.marginPositionReduceds)
                    setAddLiqData(AddLiqQueryData.data.increaseLiquidities)
                    setCollectData(CollectQueryData.data.collects)
                    setLoading(false)
                } catch (error) {
                    setError(error)
                    setLoading(false)
                }
            }
            call()
        }, [])



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

    const addDataProcessed = addData?.map((entry:any)=>({
        token: entry.positionIsToken0? uniqueTokens?.get(entry.pool)?.[1]: uniqueTokens?.get(entry.pool)?.[0] ,
        trader: entry.trader, 
        amount: entry.addedAmount
    }))
    const reduceDataProcessed = reduceData?.map((entry:any)=>({
        token: entry.positionIsToken0? uniqueTokens?.get(entry.pool)?.[0]: uniqueTokens?.get(entry.pool)?.[1] ,
        trader: entry.trader, 
        amount: entry.reduceAmount
    }))
    const tradeProcessedByTrader: { [key: string]: any } = {}
    addDataProcessed?.forEach((entry:any)=>{
        if(!tradeProcessedByTrader[entry.trader]){
            tradeProcessedByTrader[entry.trader] = []
        }
        tradeProcessedByTrader[entry.trader].push(entry)
    })
    reduceDataProcessed?.forEach((entry:any)=>{
        if(!tradeProcessedByTrader[entry.trader]){
            tradeProcessedByTrader[entry.trader] = []
        }
        tradeProcessedByTrader[entry.trader].push(entry)
    })


    
    const { positions:lpPositions, loading: lpPositionsLoading } = useLmtLpPositionsFromTokenIds(uniqueTokenIds);
    console.log('Collects', addLiqData, collectData, lpPositions)


    const uniqueLps = new Set<string>()
    lpPositions?.forEach((entry: any)=>{
        if(!uniqueLps.has(entry.operator)){
            uniqueLps.add(entry.operator)
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

        var amount0Collected = 0
        var amount1Collected = 0 
        for (let i=0 ; i < sameTokenIdCollects.length; i++){
            amount0Collected = amount0Collected+ Number(sameTokenIdCollects[i].amount0)
            amount1Collected = amount1Collected+ Number(sameTokenIdCollects[i].amount1) 
        }

        if(!lpPositionsByUniqueLps[entry.operator]){
            lpPositionsByUniqueLps[entry.operator] = []
        }
 
        // collectf
        lpPositionsByUniqueLps[entry.operator].push({
            token0: entry.token0, 
            token1: entry.token1, 
            tokenId: entry.tokenId.toString(), 
            amount0Collected: amount0Collected, 
            amount1Collected: amount1Collected
        })
    })

    console.log('lppositions', lpPositionsByUniqueLps)

    

    const token = useCurrency("0x4E3F175b38098326a34F2C8B2D07AF5fFdfc6fA9")
    const { data: usdPrice } = useUSDPrice(token ? tryParseCurrencyAmount('1', token) : undefined)
    console.log('token', token, usdPrice, tryParseCurrencyAmount('1', token?token:undefined) )






    return useMemo(() => {
        return {
            tradeProcessedByTrader,
            lpPositionsByUniqueLps,
             // This includes loading, positions, etc.
            // loading,
            // error
        };
    }, [addData, addLiqData, reduceData, collectData, lpPositions, loading, error])

}


