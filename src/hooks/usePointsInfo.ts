import { BigNumber } from '@ethersproject/bignumber'
import { BigNumber as BN } from 'bignumber.js'
import { CallStateResult, useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import {useEffect, useMemo , useState} from 'react'
import { PositionDetails } from 'types/position'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { ethers } from 'ethers'

import { useReferralContract, 
  useDataProviderContract, useLmtNFTPositionManager, useV3NFTPositionManagerContract } from './useContract'
import { useWeb3React } from '@web3-react/core'
interface UseV3PositionsResults {
  loading: boolean
  positions: PositionDetails[] | undefined
}

export function convertBNToNum(num: BigNumber, decimals: number) {
  return new BN(num.toString()).shiftedBy(-decimals).toNumber()
}

export function convertToBN(num: BigNumber, decimals: number) {
  return new BN(num.toString()).shiftedBy(-decimals)
}

export enum PositionState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function useUsingCode( ) {
  const { account, provider } = useWeb3React()

  const referralContract = useReferralContract() 

  const [codeUsing, setCodeUsing] = useState(false)

  useEffect(() => {
    if (!account ||!provider ||!referralContract) return
    const call = async () => {
      try {
        const result = await referralContract.userReferralCodes(account)
        setCodeUsing(result != ethers.constants.HashZero)
      } catch (error) {
        console.log('codeowner err')
      }
    }
    call()
  }, [account, referralContract])

  return codeUsing
}

// export function useLimitlessPositionFromTokenId(tokenId: string | undefined): {
//   loading: boolean
//   error: any
//   position: LimitlessPositionDetails | undefined
// } {
//   const globalStorage = useGlobalStorageContract()
//   const result = useSingleCallResult(globalStorage, 'getPositionFromId', [tokenId])
//   const loading = result.loading
//   const error = result.error
//   const { chainId } = useWeb3React()

//   const position = useMemo(() => {
//     if (!loading && !error && tokenId) {
//       const state = result.result
//       const key = state?.key
//       const position = state?.position
//       const _position = {
//         tokenId,
//         leverageManagerAddress: computeLeverageManagerAddress({
//           factoryAddress: LEVERAGE_MANAGER_FACTORY_ADDRESSES[chainId ?? 11155111],
//           tokenA: key.token0,
//           tokenB: key.token1,
//           fee: key.fee,
//         }),
//         borrowManagerAddress: computeBorrowManagerAddress({
//           factoryAddress: BORROW_MANAGER_FACTORY_ADDRESSES[chainId ?? 11155111],
//           tokenA: key.token0,
//           tokenB: key.token1,
//           fee: key.fee,
//         }),
//         liquidityManagerAddress: computeLiquidityManagerAddress({
//           factoryAddress: LIQUIDITY_MANAGER_FACTORY_ADDRESSES[chainId ?? 11155111],
//           tokenA: key.token0,
//           tokenB: key.token1,
//           fee: key.fee,
//         }),
//         token0Address: key.token0,
//         token1Address: key.token1,
//         poolFee: key.fee,
//         totalPosition: convertToBN(position.totalPosition, 18),
//         totalPositionNumber: convertBNToNum(position.totalPosition, 18),
//         totalPositionRaw: position.isBorrow ? position.totalDebtInput.toString() : position.totalPosition.toString(),
//         totalDebt: convertToBN(position.totalDebt, 18),
//         totalDebtNumber: convertBNToNum(position.totalDebt, 18),
//         totalDebtInput: convertToBN(position.totalDebtInput, 18),
//         totalDebtInputNumber: convertBNToNum(position.totalDebtInput, 18),
//         // creationPrice: convertBNToNum(position.creationPrice, 18),
//         initialCollateral: convertToBN(position.initCollateral, 18),
//         initialCollateralNumber: convertBNToNum(position.initCollateral, 18),
//         recentPremium: convertToBN(position.recentPremium, 18),
//         recentPremiumNumber: convertBNToNum(position.recentPremium, 18),
//         totalPremium: convertToBN(position.totalPremium, 18),
//         totalPremiumNumber: convertBNToNum(position.totalPremium, 18),
//         unusedPremium: convertToBN(position.unusedPremium, 18),
//         unusedPremiumNumber: convertBNToNum(position.unusedPremium, 18),
//         isToken0: position.isToken0,
//         openTime: position.openTime,
//         repayTime: position.repayTime,
//         isBorrow: position.isBorrow,
//         // borrowInfo: position.borrowInfo.map((info: any) => convertBNToNum(info, 18)),
//       }
//       return _position
//     }
//     return undefined
//   }, [loading, error, tokenId, chainId, result])

//   return {
//     loading,
//     error,
//     position: position ?? undefined,
//   }
// }

// function useV3PositionsFromTokenIds(tokenIds: BigNumber[] | undefined): UseV3PositionsResults {
//   const positionManager = useV3NFTPositionManagerContract()
//   const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : []), [tokenIds])
//   const results = useSingleContractMultipleData(positionManager, 'positions', inputs)

//   const loading = useMemo(() => results.some(({ loading }) => loading), [results])
//   const error = useMemo(() => results.some(({ error }) => error), [results])

//   const positions = useMemo(() => {
//     if (!loading && !error && tokenIds) {
//       return results.map((call, i) => {
//         const tokenId = tokenIds[i]
//         const result = call.result as CallStateResult
//         return {
//           tokenId,
//           fee: result.fee,
//           feeGrowthInside0LastX128: result.feeGrowthInside0LastX128,
//           feeGrowthInside1LastX128: result.feeGrowthInside1LastX128,
//           liquidity: result.liquidity,
//           nonce: result.nonce,
//           operator: result.operator,
//           tickLower: result.tickLower,
//           tickUpper: result.tickUpper,
//           token0: result.token0,
//           token1: result.token1,
//           tokensOwed0: result.tokensOwed0,
//           tokensOwed1: result.tokensOwed1,
//         }
//       })
//     }
//     return undefined
//   }, [loading, error, results, tokenIds])

//   return {
//     loading,
//     positions: positions?.map((position, i) => ({ ...position, tokenId: inputs[i][0] })),
//   }
// }

// interface UseV3PositionResults {
//   loading: boolean
//   position: PositionDetails | undefined
//   maxWithdrawable?: BigNumber
// }

// export function useV3PositionFromTokenId(tokenId: BigNumber | undefined): UseV3PositionResults {
//   const position = useV3PositionsFromTokenIds(tokenId ? [tokenId] : undefined)
//   return {
//     loading: position.loading,
//     position: position.positions?.[0],
//   }
// }


// export function useLmtLpPositionFromTokenId(tokenId: BigNumber | undefined): UseV3PositionResults {
//   const position = useLmtLpPositionsFromTokenIds(tokenId ? [tokenId] : undefined)
//   const dataProvider = useDataProviderContract()
//   const blockNumber = useBlockNumber()
//    const [lastBlockNumber, setBlockNumber] = useState<number | undefined>(undefined)

//   const [data, setData] = useState<any>();
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<any>()

//   useEffect(()=>{
//     if ( loading || !blockNumber || (lastBlockNumber && lastBlockNumber + 2 > blockNumber)) return

//     const call = async()=>{
//       try{
//         setLoading(true)
//         const result = await dataProvider?.getMaxWithdrawable(
//           {
//             token0: position.positions?.[0]?.token0 as string, 
//             token1: position.positions?.[0]?.token1 as string, 
//             fee: position.positions?.[0]?.fee as number ,
//           }, 
//           position.positions?.[0]?.tickLower as number, 
//           position.positions?.[0]?.tickUpper as number, 
//         )
//         setData(result)
//         setLoading(false)
//         setBlockNumber(blockNumber)

//       } catch(error){
//         setError(error)
//         setLoading(false)
//         console.log('maxWithdrawableerr', error)
//       }
//     }
//     call()

//   }, [dataProvider, loading, lastBlockNumber,blockNumber, position.positions, ])


//   return useMemo(() =>{
//     if(!data || !position){
//       return{
//         loading: position.loading, 
//         position: position.positions?.[0], 
//         maxWithdrawable: data
//       }
//     }else{
//       return {
//         loading: position.loading,
//         position: position.positions?.[0],
//         maxWithdrawable: data
//       }
//     }

//   }, [ position.loading, error, data,  tokenId ])
// }

// export function useV3Positions(account: string | null | undefined): UseV3PositionsResults {
//   const positionManager = useV3NFTPositionManagerContract()

//   const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(positionManager, 'balanceOf', [
//     account ?? undefined,
//   ])

//   // console.log('balanceResult', balanceLoading, balanceResult)

//   // we don't expect any account balance to ever exceed the bounds of max safe int
//   const accountBalance: number | undefined = balanceResult?.[0]?.toNumber()

//   const tokenIdsArgs = useMemo(() => {
//     if (accountBalance && account) {
//       const tokenRequests = []
//       for (let i = 0; i < accountBalance; i++) {
//         tokenRequests.push([account, i])
//       }
//       return tokenRequests
//     }
//     return []
//   }, [account, accountBalance])

//   const tokenIdResults = useSingleContractMultipleData(positionManager, 'tokenOfOwnerByIndex', tokenIdsArgs)
//   const someTokenIdsLoading = useMemo(() => tokenIdResults.some(({ loading }) => loading), [tokenIdResults])

//   const tokenIds = useMemo(() => {
//     if (account) {
//       return tokenIdResults
//         .map(({ result }) => result)
//         .filter((result): result is CallStateResult => !!result)
//         .map((result) => BigNumber.from(result[0]))
//     }
//     return []
//   }, [account, tokenIdResults])

//   const { positions, loading: positionsLoading } = useV3PositionsFromTokenIds(tokenIds)

//   return {
//     loading: someTokenIdsLoading || balanceLoading || positionsLoading,
//     positions,
//   }
// }

// export function useLmtLpPositions(account: string | null | undefined): UseV3PositionsResults {
//   const positionManager = useLmtNFTPositionManager()

//   const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(positionManager, 'balanceOf', [
//     account ?? undefined,
//   ])

//   // we don't expect any account balance to ever exceed the bounds of max safe int
//   const accountBalance: number | undefined = balanceResult?.[0]?.toNumber()

//   const tokenIdsArgs = useMemo(() => {
//     if (accountBalance && account) {
//       const tokenRequests = []
//       for (let i = 0; i < accountBalance; i++) {
//         tokenRequests.push([account, i])
//       }
//       return tokenRequests
//     }
//     return []
//   }, [account, accountBalance])

//   const tokenIdResults = useSingleContractMultipleData(positionManager, 'tokenOfOwnerByIndex', tokenIdsArgs)

//   const someTokenIdsLoading = useMemo(() => tokenIdResults.some(({ loading }) => loading), [tokenIdResults])

//   const tokenIds = useMemo(() => {
//     if (account) {
//       return tokenIdResults
//         .map(({ result }) => result)
//         .filter((result): result is CallStateResult => !!result)
//         .map((result) => BigNumber.from(result[0]))
//     }
//     return []
//   }, [account, tokenIdResults])
//   const { positions, loading: positionsLoading } = useLmtLpPositionsFromTokenIds(tokenIds)

//   return {
//     loading: someTokenIdsLoading || balanceLoading || positionsLoading,
//     positions,
//   }
// }

// export function useLmtLpPositionsFromTokenIds(tokenIds: BigNumber[] | undefined): UseV3PositionsResults {
//   const positionManager = useLmtNFTPositionManager()
//   const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : []), [tokenIds])
//   const results = useSingleContractMultipleData(positionManager, 'positions', inputs)

//   const loading = useMemo(() => results.some(({ loading }) => loading), [results])
//   const error = useMemo(() => results.some(({ error }) => error), [results])

//   const positions = useMemo(() => {
//     if (!loading && !error && tokenIds) {
//       return results.map((call, i) => {
//         const tokenId = tokenIds[i]
//         const result = call.result as CallStateResult
//         return {
//           tokenId,
//           fee: result.fee,
//           feeGrowthInside0LastX128: result.feeGrowthInside0LastX128,
//           feeGrowthInside1LastX128: result.feeGrowthInside1LastX128,
//           liquidity: result.liquidity,
//           nonce: BigNumber.from(0), // result.nonce,
//           operator: '', //result.operator,
//           tickLower: result.tickLower,
//           tickUpper: result.tickUpper,
//           token0: result.token0,
//           token1: result.token1,
//           tokensOwed0: result.tokensOwed0,
//           tokensOwed1: result.tokensOwed1,
//         }
//       })
//     }
//     return undefined
//   }, [loading, error, results, tokenIds])

//   return {
//     loading,
//     positions: positions?.map((position, i) => ({ ...position, tokenId: inputs[i][0] })),
//   }
// }
