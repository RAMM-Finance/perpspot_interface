import { client } from 'graphql/limitlessGraph/limitlessClients'
import { AddQuery, ReduceQuery, IncreaseLiquidityQuery, DecreaseLiquidityQuery} from 'graphql/limitlessGraph/queries'
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
  const [uniqueTokenIds, setUniqueTokenIds] = useState<BigNumber[]>([]);
  const {chainId} = useWeb3React()
  const [addData, setAddData] = useState<any>()
  const [addLiqData, setAddLiqData] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()
  const nfpm = useLmtNFTPositionManager()
  // which tokens(address), by how much 
  useEffect(() => {
    // if (!trader || loading || !blockNumber || (lastBlockNumber && lastBlockNumber + 2 > blockNumber)) return
    if (!client || !AddQuery || loading || error) return
    const call = async () => {
      try {
        setLoading(true)

        const AddQueryData = await client.query(AddQuery, {}).toPromise()
        const AddLiqQueryData = await client.query(IncreaseLiquidityQuery, {}).toPromise()
        console.log('AddQuery', AddQueryData.data.marginPositionIncreaseds, 
        	AddLiqQueryData)
        
		const uniqueTokenIds = new Set<string>(); 
		AddLiqQueryData?.data?.increaseLiquidities.forEach((entry: any)=>{
			if(!uniqueTokenIds.has(entry.tokenId)){
				uniqueTokenIds.add(entry.tokenId)
			}
		})
		const bigNumberTokenIds = Array.from(uniqueTokenIds).map(id => BigNumber.from(id))
        setUniqueTokenIds(bigNumberTokenIds)

        setAddData(AddQueryData.data.marginPositionIncreaseds)
        setAddLiqData(AddLiqQueryData.data.increaseLiquidities)

        setLoading(false)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }
    call()
  }, [])

  const { positions:lpPositions, loading: lpPositionsLoading } = useLmtLpPositionsFromTokenIds(uniqueTokenIds);

  const token = useCurrency("0x4E3F175b38098326a34F2C8B2D07AF5fFdfc6fA9")
  const { data: usdPrice } = useUSDPrice(token ? tryParseCurrencyAmount('1', token) : undefined)
  console.log('token', token, usdPrice, tryParseCurrencyAmount('1', token?token:undefined) )

  // for all, only 7 days window 

  // for both add and reduce: 
  // {trader1: [[token, amount], [token, amount],[token, amount]] , 
  	// trader2: [[token, amount], [token, amount],[token, amount]] }

  // for add liquidity: 
  // {lp1: [[token0, token1, amount0*time, amount1*time,]]}

// amountsum: 
// added 1,1, + 72 hours, minused 0.5, 0.5 + 96 hours
// -> 1,1 * 72 + 0.5,0.5* 96 = 72 + 48 = 120

// add->trader, token traded(address), amount 
// reduce-> trader, token traded, amount
// addliq-> lp, token0, token1, amount0, amount1
// reduceliq-> lp, token0, token1, amount0, amount1 

  return useMemo(() => {
    return {
      addData,
      addLiqData,
      lpPositions, // This includes loading, positions, etc.
      // loading,
      // error
    };
  }, [addData, addLiqData, lpPositions, loading, error])

}


