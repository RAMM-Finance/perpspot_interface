import { Interface } from '@ethersproject/abi'
import { Token } from '@uniswap/sdk-core'
import IUniswapV3PoolState from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { computePoolAddress, FeeAmount } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import StatsSection from 'components/swap/StatsSection'
import { POOL_INIT_CODE_HASH, V3_CORE_FACTORY_ADDRESSES as LIMITLESS_FACTORIES } from 'constants/addresses'
import { getFakePool, getFakeSymbol, isFakePair } from 'constants/fake-tokens'
import { LATEST_POOL_DAY_QUERY, LATEST_POOL_INFO_QUERY } from 'graphql/limitlessGraph/poolPriceData'
import { uniswapClient } from 'graphql/limitlessGraph/uniswapClients'
import { useCurrency } from 'hooks/Tokens'
import { useTokenContract } from 'hooks/useContract'
import { usePool } from 'hooks/usePools'
import moment from 'moment'
import { LanguageCode } from 'public/charting_library'
import { useEffect, useMemo } from 'react'
import { useState } from 'react'
import styled from 'styled-components/macro'

import useDatafeed from './useDataFeed'

const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolState.abi)

const StatsContainer = styled.div`
  margin-left: 5px;
  width: 100%;
`

// interface ChartContainerProps {
// 	symbol: ChartingLibraryWidgetOptions['symbol'];
// 	interval: ChartingLibraryWidgetOptions['interval'];

// 	// BEWARE: no trailing slash is expected in feed URL
// 	datafeedUrl: string;
// 	libraryPath: ChartingLibraryWidgetOptions['library_path'];
// 	chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'];
// 	chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'];
// 	clientId: ChartingLibraryWidgetOptions['client_id'];
// 	userId: ChartingLibraryWidgetOptions['user_id'];
// 	fullscreen: ChartingLibraryWidgetOptions['fullscreen'];
// 	autosize: ChartingLibraryWidgetOptions['autosize'];
// 	studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides'];
// 	container: ChartingLibraryWidgetOptions['container'];
// }

const getLanguageFromURL = (): LanguageCode | null => {
  const regex = new RegExp('[\\?&]lang=([^&#]*)')
  const results = regex.exec(location.search)
  return results === null ? null : (decodeURIComponent(results[1].replace(/\+/g, ' ')) as LanguageCode)
}

export const PoolDataSection = ({
  chainId,
  token0,
  token1,
  fee,
}: {
  chainId: number
  token0: Token | undefined
  token1: Token | undefined
  fee: FeeAmount | undefined
}) => {
  // const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  const { datafeed } = useDatafeed({ chainId })
  // const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);
  const [chartReady, setChartReady] = useState(false)
  const [chartDataLoading, setChartDataLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(moment.now())
  const [, pool] = usePool(token0, token1, fee)

  useEffect(() => {
    // if longer than 1 seconds w/o update, reload
    if (lastUpdate < moment.now() - 5000 * 1) {
      setLastUpdate(moment.now())
    }
  })

  const uniswapPoolAddress = useMemo(() => {
    if (chainId && token0 && token1) {
      // console.log('getFakePool', getFakePool(token0.address.toLowerCase(), token1.address.toLowerCase()))
      if (isFakePair(chainId, token0.address.toLowerCase(), token1.address.toLowerCase())) {
        return getFakePool(chainId, token0.address.toLowerCase(), token1.address.toLowerCase())
      }

      // return computePoolAddress({
      // 	factoryAddress: UNISWAP_FACTORIES[1],
      // 	tokenA: token0,
      // 	tokenB: token1,
      // 	fee,
      // 	initCodeHashManualOverride: UNISWAP_POOL_INIT_CODE_HASH
      // }).toLowerCase()
    }
    return undefined
  }, [chainId, token0, token1])

  // console.log("uniswapPoolAddress", uniswapPoolAddress)

  const limitlessPoolAddress = useMemo(() => {
    if (chainId && token0 && token1 && fee) {
      return computePoolAddress({
        factoryAddress: LIMITLESS_FACTORIES[chainId],
        tokenA: token0,
        tokenB: token1,
        fee,
        initCodeHashManualOverride: POOL_INIT_CODE_HASH,
      }).toLowerCase()
    }
    return undefined
  }, [chainId, token0, token1, fee])

  // const uniswapPoolContract = useContract(uniswapPoolAddress, POOL_STATE_INTERFACE)

  const [uniswapPoolExists, setUniswapPoolExists] = useState(false)
  const [uniswapToken0Price, setUniswapToken0Price] = useState<number | undefined>()
  const currency0 = useCurrency(token0?.address)
  const currency1 = useCurrency(token1?.address)
  const [poolState, limitlessPool] = usePool(currency0 ?? undefined, currency1 ?? undefined, fee)
  const [symbol, setSymbol] = useState('missing pool')
  const [stats, setStats] = useState<{
    price: number
    delta: number
    // token0Volume: number | null,
    // token1Volume: number | null,
    high24h: number
    low24h: number
    invertPrice: boolean
    token1Reserve: number
    token0Reserve: number
  }>()


  const token0Contract = useTokenContract(token0?.address)
  const token1Contract = useTokenContract(token1?.address)

  useEffect(() => {
    if (token0 && token1) {
      // fetch data and process it
      // console.log("lmt: ", uniswapPoolAddress)
      const fetch = async () => {
        try {
          if (uniswapPoolAddress && token0Contract && token1Contract && limitlessPoolAddress) {
            const result = await uniswapClient.query({
              query: LATEST_POOL_DAY_QUERY,
              variables: {
                address: uniswapPoolAddress,
              },
              fetchPolicy: 'network-only',
            })

            const token1Reserve = await token1Contract.callStatic.balanceOf(limitlessPoolAddress)
            const token0Reserve = await token0Contract.callStatic.balanceOf(limitlessPoolAddress)
            const lmtInvertPrice = token1Reserve.gt(token0Reserve)

            const priceQuery = await uniswapClient.query({
              query: LATEST_POOL_INFO_QUERY,
              variables: {
                address: uniswapPoolAddress,
              },
              fetchPolicy: 'network-only',
            })

            // console.log("priceQuery", priceQuery, result)

            if (!result.error && !result.loading && !priceQuery.error && !priceQuery.loading) {
              const data = result.data.poolDayDatas

              let price = priceQuery.data.pool.token0Price

              const invertPrice = price < 1
              const { high, low, open } = data[0]
              let delta
              let price24hHigh
              let price24hLow
              if (invertPrice) {
                price = 1 / price
                const price24hAgo = 1 / open
                delta = ((Number(price) - Number(price24hAgo)) / Number(price24hAgo)) * 100
                price24hHigh = 1 / Number(low) // Math.max(...data.map((item: any) => 1 / Number(item.high)))
                price24hLow = 1 / Number(high) // Math.min(...data.map((item: any) => 1 / Number(item.low)))
              } else {
                delta = ((Number(price) - Number(open)) / Number(open)) * 100
                price24hHigh = Number(high)
                price24hLow = Number(low)
              }

              setStats({
                price: Number(price),
                delta,
                high24h: price24hHigh,
                low24h: price24hLow,
                invertPrice,
                token0Reserve: new BN(token0Reserve.toString()).shiftedBy(-18).toNumber(),
                token1Reserve: new BN(token1Reserve.toString()).shiftedBy(-18).toNumber(),
              })
            }
          }
        } catch (err) {
          console.log('stats section error: ', err)
          setStats(undefined)
        }
      }

      fetch()
    }
  }, [
    lastUpdate,
    uniswapPoolAddress,
    uniswapPoolExists,
    pool,
    limitlessPoolAddress,
    token0Contract,
    token1Contract,
    token0,
    token1,
  ])

  useEffect(() => {
    if (token0 && token1 && isFakePair(chainId, token0?.address.toLowerCase(), token1?.address.toLowerCase())) {
      setSymbol(getFakeSymbol(chainId, token0.address.toLowerCase(), token1.address.toLowerCase()) as string)
    } else if (uniswapPoolExists && uniswapToken0Price && uniswapPoolAddress) {
      const token0IsBase = uniswapToken0Price > 1
      setSymbol(
        JSON.stringify({
          poolAddress: uniswapPoolAddress,
          baseSymbol: token0IsBase ? token0?.symbol : token1?.symbol,
          quoteSymbol: token0IsBase ? token1?.symbol : token0?.symbol,
          invertPrice: !token0IsBase,
          useUniswapSubgraph: true,
        })
      )
    } else if (!uniswapPoolExists && limitlessPoolAddress && limitlessPool) {
      const token0IsBase = limitlessPool.token0Price.greaterThan(1)
      setSymbol(
        JSON.stringify({
          poolAddress: limitlessPoolAddress,
          baseSymbol: token0IsBase ? token0?.symbol : token1?.symbol,
          quoteSymbol: token0IsBase ? token1?.symbol : token0?.symbol,
          invertPrice: !token0IsBase,
          useUniswapSubgraph: false,
        })
      )
    } else {
      setSymbol('missing pool')
    }
  }, [
    token0,
    token1,
    chainId,
    limitlessPool,
    limitlessPoolAddress,
    uniswapPoolAddress,
    uniswapPoolExists,
    uniswapToken0Price,
  ])

  return (
    <>
      <StatsSection
        address={uniswapPoolAddress ?? ''}
        chainId={chainId}
        token0Symbol={token0?.symbol}
        token1Symbol={token1?.symbol}
        stats={stats}
      />
    </>
  )
}
