// import { SupportedChainId } from '@looksrare/sdk'
import { Currency } from '@uniswap/sdk-core'
import { BigNumber as BN } from 'bignumber.js'
import { DATA_PROVIDER_ADDRESSES } from 'constants/addresses'
import { useMemo } from 'react'
import { TraderPositionKey } from 'types/lmtv2position'
import { DataProviderSDK } from 'utils/lmtSDK/DataProvider'

import { useContractCall } from './useContractCall'

const DEFAULT_MAX_LEVERAGE = '120'

// export function useMaxLeverage(
//   positionKey: TraderPositionKey | undefined,
//   margin: BN | undefined, // formatted to raw amount
//   inputCurrency: Currency | undefined,
//   slippage: Percent | undefined,
//   startingLeverage = DEFAULT_MAX_LEVERAGE
// ): { loading: boolean; error?: any; result?: BN } {
//   const { chainId } = useWeb3React()
//   const dataProvider = useDataProviderContract()

//   // const [loading, setLoading] = useState(false)
//   // const [error, setError] = useState<any>()
//   // const [result, setResult] = useState<any>()
//   // const [lastBlockNumber, setBlockNumber] = useState<number | undefined>(undefined)
//   const blockNumber = useBlockNumber()
//   const [result, setResult] = useState<BN>()
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<any>()
//   const [lastBlockNumber, setBlockNumber] = useState<number | undefined>(undefined)
//   const [lastParams, setLastParams] = useState<{
//     margin?: BN
//     slippage?: Percent
//     positionKey?: TraderPositionKey
//   }>({})

//   useEffect(() => {
//     if (loading) {
//       return
//     }

//     if (!blockNumber || !margin || !slippage || !positionKey || !dataProvider || !inputCurrency) {
//       setResult(undefined)
//       setError(undefined)
//       return
//     }

//     if (margin.isZero()) {
//       setResult(undefined)
//       setError(undefined)
//       return
//     }

//     if (
//       lastBlockNumber &&
//       lastBlockNumber + 1 > blockNumber &&
//       lastParams.margin === margin &&
//       lastParams.slippage === slippage &&
//       lastParams.positionKey === positionKey
//     ) {
//       return
//     }

//     const call = async () => {
//       try {
//         setLoading(true)

//         const poolKey = {
//           token0: positionKey.poolKey.token0Address,
//           token1: positionKey.poolKey.token1Address,
//           fee: positionKey.poolKey.fee,
//         }

//         const result = await dataProvider.callStatic.findMaxLeverageWithEstimatedSlippage(
//           poolKey,
//           margin.shiftedBy(inputCurrency.decimals).toFixed(0),
//           positionKey.isToken0,
//           new BN(999).shiftedBy(15).toFixed(0),
//           startingLeverage
//         )

//         setResult(new BN(result.toString()))
//         setLoading(false)
//         setError(undefined)
//         setBlockNumber(blockNumber)
//         setLastParams({
//           margin,
//           slippage,
//           positionKey,
//         })
//       } catch (error) {
//         console.log('maxLeverage error', error)
//         setResult(undefined)
//         setLoading(false)
//         setError(error)
//         setBlockNumber(blockNumber)
//         setLastParams({
//           margin: undefined,
//           slippage: undefined,
//           positionKey: undefined,
//         })
//       }
//     }

//     call()
//   }, [
//     margin,
//     positionKey,
//     inputCurrency,
//     slippage,
//     startingLeverage,
//     blockNumber,
//     dataProvider,
//     loading,
//     lastBlockNumber,
//     lastParams,
//   ])

//   return useMemo(() => {
//     return {
//       loading,
//       error,
//       result,
//     }
//   }, [loading, error, result])
// }

// struct MaxLeverageParams {
//   PoolKey poolKey;
//   bool isToken0;
//   uint256 margin; // wad
//   uint256 startingLeverage; // wad
//   uint256 stepSize; // wad
// }

//{ loading: boolean; error: any; result: BN | undefined }
export function useMaxLeverage(
  positionKey?: TraderPositionKey,
  margin?: BN, // formatted to raw amount
  inputCurrency?: Currency,
  startingLeverage = 120,
  stepSize = 5
) {
  const calldata = useMemo(() => {
    if (!positionKey || margin?.isZero() || !margin || !inputCurrency) return undefined
    const params = [
      {
        poolKey: {
          token0: positionKey.poolKey.token0Address,
          token1: positionKey.poolKey.token1Address,
          fee: positionKey.poolKey.fee,
        },
        isToken0: positionKey.isToken0,
        margin: margin.shiftedBy(inputCurrency.decimals).toFixed(0),
        startingLeverage: new BN(startingLeverage).shiftedBy(18).toFixed(0),
        stepSize: new BN(stepSize).shiftedBy(18).toFixed(0),
      },
    ]
    return DataProviderSDK.INTERFACE.encodeFunctionData('computeMaxLeverage', params)
  }, [positionKey, margin, inputCurrency, startingLeverage, stepSize])
  console.log('contractcall7')
  const { result, loading, error } = useContractCall(DATA_PROVIDER_ADDRESSES, calldata, false, 0)
  return useMemo(() => {
    return {
      loading,
      error,
      result: result
        ? new BN(DataProviderSDK.INTERFACE.decodeFunctionResult('computeMaxLeverage', result).toString()).shiftedBy(-18)
        : undefined,
    }
  }, [loading, error, result])

  // console.log(
  //   'MX:Call',
  //   await provider?.call({
  //     to: '0x7FaCb714F3023Ff0A67F2F92c05eA10fe1D9301C',
  //     data: DataProviderSDK.INTERFACE.encodeFunctionData('computeMaxLeverage', [
  //       {
  //         poolKey: {
  //           token0: positionKey.poolKey.token0Address,
  //           token1: positionKey.poolKey.token1Address,
  //           fee: positionKey.poolKey.fee,
  //         },
  //         isToken0: positionKey.isToken0,
  //         margin: margin.shiftedBy(inputCurrency.decimals).toFixed(0),
  //         startingLeverage: new BN(startingLeverage).shiftedBy(18).toFixed(0),
  //         stepSize: new BN(stepSize).shiftedBy(18).toFixed(0),
  //       },
  //     ]),
  //   })
  // )

  // const [result, setResult] = useState<BN>()
  // const [loading, setLoading] = useState(false)
  // const [error, setError] = useState<DecodedError>()
  // const [lastBlockNumber, setBlockNumber] = useState<number>()
  // const blockNumber = useBlockNumber()
  // const { provider } = useWeb3React()
  // const [lastParams, setLastParams] = useState<{
  //   margin: BN
  //   positionKey: TraderPositionKey
  // }>()

  // const dataProvider = useDataProviderContract()
  // useEffect(() => {
  //   if (loading) {
  //     return
  //   }

  //   if (!margin || !inputCurrency || !positionKey || !dataProvider || !blockNumber || margin.isZero()) {
  //     setResult(undefined)
  //     setError(undefined)
  //     setBlockNumber(undefined)
  //     setLastParams(undefined)
  //     return
  //   }

  //   if (
  //     lastBlockNumber &&
  //     lastBlockNumber === blockNumber &&
  //     lastParams?.margin === margin &&
  //     lastParams?.positionKey === positionKey
  //   ) {
  //     return
  //   }

  //   if (lastBlockNumber && lastBlockNumber === blockNumber && error) {
  //     return
  //   }

  //   const call = async () => {

  //     try {
  //       setLoading(true)
  //       setBlockNumber(blockNumber)
  //       const result = await dataProvider.callStatic.computeMaxLeverage({
  //         poolKey: {
  //           token0: positionKey.poolKey.token0Address,
  //           token1: positionKey.poolKey.token1Address,
  //           fee: positionKey.poolKey.fee,
  //         },
  //         isToken0: positionKey.isToken0,
  //         margin: margin.shiftedBy(inputCurrency.decimals).toFixed(0),
  //         startingLeverage: new BN(startingLeverage).shiftedBy(18).toFixed(0),
  //         stepSize: new BN(stepSize).shiftedBy(18).toFixed(0),
  //       })
  //       console.log('MX:result', result)

  //       setResult(new BN(result.toString()).shiftedBy(-18))
  //       setLoading(false)
  //       setLastParams({
  //         margin,
  //         positionKey,
  //       })
  //       setError(undefined)
  //     } catch (err) {
  //       console.log('MX:err', err)
  //       setResult(undefined)
  //       setLoading(false)
  //       setLastParams(undefined)
  //       setError(decodeError(err))
  //     }
  //   }

  //   call()
  // }, [
  //   margin,
  //   positionKey,
  //   inputCurrency,
  //   startingLeverage,
  //   stepSize,
  //   blockNumber,
  //   dataProvider,
  //   loading,
  //   lastBlockNumber,
  //   lastParams,
  //   error,
  // ])

  // return useMemo(() => {
  //   return {
  //     loading,
  //     error,
  //     result,
  //   }
  // }, [loading, error, result])
}
// export async function computeMaxLeverage(
//   positionKey?: TraderPositionKey,
//   margin?: BN, // formatted to raw amount
//   feePercent?: BN,
//   inputCurrency?: Currency,
//   pool?: Pool,
//   provider?: Provider,
//   chainId?: number,
//   startingLeverage = 120,
//   stepSize = 5
// ) {
//   if (!positionKey || !margin || !inputCurrency || !provider || !feePercent || !pool || !chainId) {
//     return undefined
//   }
//   let lev = startingLeverage
//   const inputIsToken0 = !positionKey.isToken0
//   const swapRoute = new Route(
//     [pool],
//     inputIsToken0 ? pool.token0 : pool.token1,
//     inputIsToken0 ? pool.token1 : pool.token0
//   )
//   while (lev > 0) {
//     try {
//       const borrowAmount = margin.times(lev).minus(margin)
//       const feeAmount = borrowAmount.plus(margin).times(feePercent)
//       const postFeeMargin = margin.minus(feeAmount)
//       const totalInputAmount = borrowAmount.plus(postFeeMargin)

//       const simulatedOutput = await getOutputQuote(
//         BnToCurrencyAmount(totalInputAmount, inputCurrency),
//         swapRoute,
//         provider,
//         chainId
//       )

//       if (!simulatedOutput) {
//         return undefined
//       }

//       const calldata = DataProviderSDK.findTicks(
//         positionKey.poolKey,
//         postFeeMargin.shiftedBy(inputCurrency.decimals).toFixed(0),
//         borrowAmount.shiftedBy(inputCurrency.decimals).toFixed(0),
//         positionKey.isToken0,
//         simulatedOutput.toString(),
//         pool.sqrtRatioX96.toString()
//       )

//       const quoteCallReturnData = await provider.call({
//         to: DATA_PROVIDER_ADDRESSES[chainId ?? SupportedChainId.SEPOLIA],
//         data: calldata,
//       })
//       const [avgPrice] = DataProviderSDK.decodeFindTicks(quoteCallReturnData)
//       if (new BN(avgPrice.toString()).gt(0)) {
//         return lev
//       }
//     } catch (err) {
//       console.log('err', err)
//     }
//     lev -= stepSize
//   }
//   return undefined
// }
