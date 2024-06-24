import { Trans } from '@lingui/macro'
import axios from 'axios'
import { getAddress } from 'components/ExchangeChart/PoolStats'
import { MouseoverTooltip } from 'components/Tooltip'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { DefinedfiPairMetadataQuery } from 'graphql/limitlessGraph/queries'
import { useLimweth } from 'hooks/useContract'
import { usePoolsData } from 'hooks/useLMTPools'
import { getPoolAddress } from 'hooks/usePoolsOHLC'
import { getDecimalAndUsdValueData } from 'hooks/useUSDPrice'
import { useAllPoolAndTokenPriceData } from 'hooks/useUserPriceData'
import useVaultBalance from 'hooks/useVaultBalance'
import { atom, useAtom } from 'jotai'
import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Info } from 'react-feather'
import { usePoolKeyList, usePoolsAprUtilList } from 'state/application/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { definedfiEndpoint } from 'utils/definedfiUtils'
import { formatDollar } from 'utils/formatNumbers'
import { getPoolId } from 'utils/lmtSDK/LmtIds'
import { useChainId } from 'wagmi'

// import {useToken} from 'hooks/Tokens'
import { MAX_WIDTH_MEDIA_BREAKPOINT } from '../constants'
import { LoadingBubble } from '../loading'
import { filterStringAtom } from '../state'
import { HeaderCellWrapper, InfoIconContainer, PLoadedRow, TokenRow } from './PairsRow'
// import { HeaderRow, LoadingRow } from './TokenRow'
import SearchBar from './SearchBar'
// import { useDailyFeeAPR } from 'hooks/usePools'

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  // max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
  /* max-width: 1480px; */
  /* background-color: ${({ theme }) => theme.background}; */
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.05), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  margin-left: auto;
  margin-right: auto;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
`
const SmallLoadingBubble = styled(LoadingBubble)`
  width: 30%;
`
const MediumLoadingBubble = styled(LoadingBubble)`
  width: 65%;
`
const LongLoadingBubble = styled(LoadingBubble)`
  width: 90%;
`
const IconLoadingBubble = styled(LoadingBubble)`
  border-radius: 50%;
  width: 24px;
`

const TokenDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`
const PAGE_SIZE = 20
function LoadingRow(props: { first?: boolean; last?: boolean }) {
  return (
    <TokenRow
      header={false}
      loading={true}
      tokenInfo={
        <>
          <IconLoadingBubble />
          <SmallLoadingBubble />
        </>
      }
      price={<MediumLoadingBubble />}
      APR={<MediumLoadingBubble />}
      priceChange={<SmallLoadingBubble />}
      tvl={<SmallLoadingBubble />}
      volume={<SmallLoadingBubble />}
      dailyLMT={<LongLoadingBubble />}
      buttons={<></>}
      {...props}
    />
  )
}

const LoadingRows = ({ rowCount }: { rowCount: number }) => (
  <>
    {Array(rowCount)
      .fill(null)
      .map((_, index) => {
        return <LoadingRow key={index} first={index === 0} last={index === rowCount - 1} />
      })}
  </>
)

enum TokenSortMethod {
  PRICE = 'Price',
  TOTAL_VALUE_LOCKED = 'Recycled',
  VOLUME = 'Uniswap 24h Volume',
  APR = 'Est APR',
  DAILY_LMT = 'Daily LMT',
  PRICE_CHANGE = '24h Change',
}

const sortMethodAtom = atom<TokenSortMethod>(TokenSortMethod.PRICE)
const sortAscendingAtom = atom<boolean>(false)

/* keep track of sort category for token table */
function useSetSortMethod(newSortMethod: TokenSortMethod) {
  const [sortMethod, setSortMethod] = useAtom(sortMethodAtom)
  const [sortAscending, setSortAscending] = useAtom(sortAscendingAtom)

  return useCallback(() => {
    if (sortMethod === newSortMethod) {
      setSortAscending(!sortAscending)
    } else {
      setSortMethod(newSortMethod)
      setSortAscending(false)
    }
  }, [sortMethod, setSortMethod, setSortAscending, sortAscending, newSortMethod])
}

const HEADER_DESCRIPTIONS: Record<TokenSortMethod, ReactNode | undefined> = {
  [TokenSortMethod.PRICE]: undefined,
  // [TokenSortMethod.PERCENT_CHANGE]: undefined,
  [TokenSortMethod.TOTAL_VALUE_LOCKED]: (
    <Trans>The amount of recycled liquidity from the uniswap liquidity pool.</Trans>
  ),
  [TokenSortMethod.VOLUME]: (
    <Trans>Volume is the amount of the asset that has been traded on Uniswap during the time frame.</Trans>
  ),
  [TokenSortMethod.APR]: (
    <Trans>
      Estimated APR is the expected APR, based on the given trading volume and utilization rate, for providing liquidity
      between 80% and 120% of the current price, assuming a deposit of 1,000 USD. Basic Fee Formula (L = liquidity):
      (L_you / L_others) * (24h_swap_volume * pool_fee_rate)
    </Trans>
  ),
  [TokenSortMethod.DAILY_LMT]: <Trans>Daily LMT emitted per USD value provided.</Trans>,
  [TokenSortMethod.PRICE_CHANGE]: <Trans>24H Change in Price</Trans>,
}

// price, TVL, volume, util rate, expected apr

/* Get singular header cell for header row */
function HeaderCell({
  category,
}: {
  category: TokenSortMethod // TODO: change this to make it work for trans
}) {
  const theme = useTheme()
  const sortAscending = useAtomValue(sortAscendingAtom)
  const handleSortCategory = useSetSortMethod(category)
  const sortMethod = useAtomValue(sortMethodAtom)
  const description = HEADER_DESCRIPTIONS[category]

  return (
    <HeaderCellWrapper onClick={handleSortCategory}>
      {sortMethod === category && (
        <>
          {sortAscending ? (
            <ChevronUp size={12} strokeWidth={1.8} color={theme.accentActive} />
          ) : (
            <ChevronDown size={12} strokeWidth={1.8} color={theme.accentActive} />
          )}
        </>
      )}
      {category}
      {description && (
        <MouseoverTooltip text={description} placement="right">
          <InfoIconContainer>
            <Info size={14} />
          </InfoIconContainer>
        </MouseoverTooltip>
      )}
    </HeaderCellWrapper>
  )
}

function PHeaderRow() {
  return (
    <TokenRow
      header={true}
      listNumber=""
      tokenInfo={<div style={{ marginLeft: '30px' }}>Pair</div>}
      price={<HeaderCell category={TokenSortMethod.PRICE} />}
      priceChange={<HeaderCell category={TokenSortMethod.PRICE_CHANGE} />}
      tvl={<HeaderCell category={TokenSortMethod.TOTAL_VALUE_LOCKED} />}
      volume={<HeaderCell category={TokenSortMethod.VOLUME} />}
      APR={<HeaderCell category={TokenSortMethod.APR} />}
      dailyLMT={<HeaderCell category={TokenSortMethod.DAILY_LMT} />}
      sparkLine={null}
      buttons={null}
    />
  )
}

function checkFilterString(pool: any, str: string[]): boolean {
  return str.every((x: string) => {
    x = x.trim().toLowerCase()

    const symbol0 = pool.symbol0.toLowerCase()
    const symbol1 = pool.symbol1.toLowerCase()
    const fee = pool.fee.toString()
    return fee.includes(x) || symbol0.includes(x) || symbol1.includes(x)
  })
}

function useUniswapVolumes() {
  const { poolList } = usePoolKeyList()
  const chainId = useChainId()
  const poolInfo = useMemo(() => {
    if (!poolList || !chainId) return null
    return poolList.map((pool) => {
      return {
        poolId: getPoolId(pool.token0, pool.token1, pool.fee),
        poolAddress: getAddress(pool.token0, pool.token1, pool.fee, chainId),
      }
    })
  }, [chainId, poolList])

  const [volumes24h, setVolumes24h] = useState<any>()

  useEffect(() => {
    const fetchData = async () => {
      const apiKeyV3 = process.env.REACT_APP_DEFINEDFI_KEY
      if (chainId && poolInfo && poolInfo.length > 0) {
        const promises = poolInfo.map((poolData: any) => {
          const query: string = DefinedfiPairMetadataQuery(poolData.poolAddress, chainId)
          return axios.post(
            definedfiEndpoint,
            {
              query,
            },
            {
              headers: {
                Accept: 'application/json',
                Authorization: apiKeyV3,
              },
            }
          )
        })
        const promiseResults = await Promise.all(promises)
        const volume24hObject = promiseResults.reduce((acc: { [key: string]: number }, item, index) => {
          acc[poolInfo[index].poolId] = parseFloat(item.data.data.pairMetadata.volume24)
          return acc
        }, {})
        setVolumes24h(volume24hObject)
      }
    }
    fetchData()
  }, [chainId, poolInfo])

  return useMemo(() => {
    if (chainId && volumes24h) return volumes24h
    else return null
  }, [chainId, volumes24h])
}

function useFilteredPairs() {
  const { poolList } = usePoolKeyList()
  const { poolList: aprList } = usePoolsAprUtilList()

  // const pinnedPools = usePinnedPools()
  const poolFilterString = useAtomValue(filterStringAtom)
  const sortAscending = useAtomValue(sortAscendingAtom)
  const sortMethod = useAtomValue(sortMethodAtom)
  const { pools: poolOHLCData } = useAllPoolAndTokenPriceData()
  const { result: poolTvlData } = usePoolsData()
  const volumes24h = useUniswapVolumes()

  const chainId = useChainId()

  return useMemo(() => {
    if (poolList && poolList.length > 0 && chainId && poolOHLCData && poolTvlData && volumes24h && aprList) {
      let list = [...poolList]
      if (sortMethod === TokenSortMethod.PRICE) {
        list = list.filter((pool) => {
          const id = getPoolAddress(
            pool.token0,
            pool.token1,
            pool.fee,
            V3_CORE_FACTORY_ADDRESSES[chainId]
          ).toLowerCase()
          return !!poolOHLCData[id]
        })
        if (sortAscending) {
          list.sort((a, b) => {
            const aId = getPoolAddress(a.token0, a.token1, a.fee, V3_CORE_FACTORY_ADDRESSES[chainId]).toLowerCase()
            const bId = getPoolAddress(b.token0, b.token1, b.fee, V3_CORE_FACTORY_ADDRESSES[chainId]).toLowerCase()
            if (!poolOHLCData[aId] || !poolOHLCData[bId]) return 0

            const aPrice = poolOHLCData[aId]?.priceNow
            const bPrice = poolOHLCData[bId]?.priceNow
            return bPrice - aPrice
          })
        } else {
          list.sort((a, b) => {
            const aId = getPoolAddress(a.token0, a.token1, a.fee, V3_CORE_FACTORY_ADDRESSES[chainId]).toLowerCase()
            const bId = getPoolAddress(b.token0, b.token1, b.fee, V3_CORE_FACTORY_ADDRESSES[chainId]).toLowerCase()
            if (!poolOHLCData[aId] || !poolOHLCData[bId]) return 0

            const aPrice = poolOHLCData[aId]?.priceNow
            const bPrice = poolOHLCData[bId]?.priceNow
            return aPrice - bPrice
          })
        }
      } else if (sortMethod === TokenSortMethod.PRICE_CHANGE) {
        if (sortAscending) {
          list.sort((a, b) => {
            const aId = getPoolAddress(a.token0, a.token1, a.fee, V3_CORE_FACTORY_ADDRESSES[chainId]).toLowerCase()
            const bId = getPoolAddress(b.token0, b.token1, b.fee, V3_CORE_FACTORY_ADDRESSES[chainId]).toLowerCase()
            if (!poolOHLCData[aId] || !poolOHLCData[bId]) return 0
            const aDelta = poolOHLCData[aId]?.delta24h
            const bDelta = poolOHLCData[bId]?.delta24h
            return bDelta - aDelta
          })
        } else {
          list.sort((a, b) => {
            const aId = getPoolAddress(a.token0, a.token1, a.fee, V3_CORE_FACTORY_ADDRESSES[chainId]).toLowerCase()
            const bId = getPoolAddress(b.token0, b.token1, b.fee, V3_CORE_FACTORY_ADDRESSES[chainId]).toLowerCase()
            if (!poolOHLCData[aId] || !poolOHLCData[bId]) return 0
            const aDelta = poolOHLCData[aId]?.delta24h
            const bDelta = poolOHLCData[bId]?.delta24h
            return aDelta - bDelta
          })
        }
      } else if (sortMethod === TokenSortMethod.TOTAL_VALUE_LOCKED) {
        if (sortAscending) {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            if (!poolTvlData[aId] || !poolTvlData[bId]) return 0
            const aTvl = poolTvlData[aId]?.totalValueLocked
            const bTvl = poolTvlData[bId]?.totalValueLocked
            return bTvl - aTvl
          })
        } else {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            if (!poolTvlData[aId] || !poolTvlData[bId]) return 0
            const aTvl = poolTvlData[aId]?.totalValueLocked
            const bTvl = poolTvlData[bId]?.totalValueLocked
            return aTvl - bTvl
          })
        }
      } else if (sortMethod === TokenSortMethod.DAILY_LMT) {
        if (sortAscending) {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            if (!aprList[aId] || !aprList[bId]) return 0
            const aUtil = aprList[aId]?.utilTotal
            const bUtil = aprList[bId]?.utilTotal
            return bUtil - aUtil
          })
        } else {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            if (!aprList[aId] || !aprList[bId]) return 0
            const aUtil = aprList[aId]?.utilTotal
            const bUtil = aprList[bId]?.utilTotal
            return aUtil - bUtil
          })
        }
      } else if (sortMethod === TokenSortMethod.APR) {
        if (sortAscending) {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            if (!aprList[aId] || !aprList[bId]) return 0
            const aApr = aprList[aId]?.apr
            const bApr = aprList[bId]?.apr
            return bApr - aApr
          })
        } else {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            if (!aprList[aId] || !aprList[bId]) return 0
            const aApr = aprList[aId]?.apr
            const bApr = aprList[bId]?.apr
            return aApr - bApr
          })
        }
      } else if (sortMethod === TokenSortMethod.VOLUME) {
        if (sortAscending) {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            if (!volumes24h[aId] || !volumes24h[bId]) return 0
            const aVolume = volumes24h[aId]
            const bVolume = volumes24h[bId]
            return bVolume - aVolume
          })
        } else {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            if (!volumes24h[aId] || !volumes24h[bId]) return 0
            const aVolume = volumes24h[aId]
            const bVolume = volumes24h[bId]
            return aVolume - bVolume
          })
        }
      }

      if (poolFilterString && poolFilterString.trim().length > 0) {
        const str = poolFilterString.trim().toLowerCase()

        // if delimiter
        if (str.split('/').length > 1 || str.split(',').length > 1) {
          const delimiters = ['/', ',']
          let maxLength = 0
          let maxDelimiter = ''
          delimiters.forEach((delimiter) => {
            const length = str.split(delimiter).length

            if (length > maxLength) {
              maxLength = length
              maxDelimiter = delimiter
            }
          })
          let arr = str.split(maxDelimiter)

          arr = arr.filter((x) => x.trim().length > 0 && x !== maxDelimiter)

          return list.filter((pool) => {
            return checkFilterString(pool, arr)
          })
        }

        return list.filter((pool) => {
          const symbol0 = pool.symbol0.toLowerCase()
          const symbol1 = pool.symbol1.toLowerCase()
          const fee = pool.fee.toString()
          return fee.includes(str) || symbol0.includes(str) || symbol1.includes(str)
        })
      }
      return list
    }

    return []
  }, [sortMethod, sortAscending, poolList, poolFilterString, poolOHLCData, chainId, poolTvlData, aprList])
}

export default function TokenTable() {
  const chainId = useChainId()

  // const poolOHLCs = usePoolOHLCs()
  const { pools: poolOHLCs, tokens: usdPriceData } = useAllPoolAndTokenPriceData()

  const { result: vaultBal, loading: balanceLoading } = useVaultBalance()

  const { poolList: aprList } = usePoolsAprUtilList()

  const { result: poolTvlData } = usePoolsData()

  const [limWethBal, setLimWethBal] = useState<number | null>(null)
  const limWeth = useLimweth()

  useEffect(() => {
    const getBalance = async (limWeth: any) => {
      const [limWethBal, decimals, queryResult] = await Promise.all([
        limWeth?.tokenBalance(),
        limWeth?.decimals(),
        getDecimalAndUsdValueData(chainId, '0x4200000000000000000000000000000000000006'),
      ])

      const tokenBalance = parseFloat(limWethBal.toString()) / 10 ** decimals
      const price = parseFloat(queryResult?.lastPriceUSD) // BASE WETH PRICE
      setLimWethBal(price * tokenBalance)
    }
    if (chainId === SupportedChainId.BASE && limWeth) {
      getBalance(limWeth)
    }
  }, [chainId, limWeth])

  const protocolTvl = useMemo(() => {
    if (poolTvlData && !balanceLoading) {
      if (chainId === SupportedChainId.BASE) {
        if (limWethBal) {
          return {
            tvl:
              Object.values(poolTvlData).reduce((accum: number, pool: any) => accum + pool.totalValueLocked, 0) +
              Number(vaultBal) +
              Number(limWethBal || 0),
            volume: Object.values(poolTvlData).reduce((accum: number, pool: any) => accum + pool.volume, 0),
          }
        } else {
          return {
            tvl: undefined,
            volume: Object.values(poolTvlData).reduce((accum: number, pool: any) => accum + pool.volume, 0),
          }
        }
      } else {
        return {
          tvl:
            Object.values(poolTvlData).reduce((accum: number, pool: any) => accum + pool.totalValueLocked, 0) +
            Number(vaultBal),
          volume: Object.values(poolTvlData).reduce((accum: number, pool: any) => accum + pool.volume, 0),
        }
      }
    } else {
      return null
    }
  }, [chainId, poolTvlData, vaultBal, balanceLoading, limWethBal])

  const sortedPools = useFilteredPairs()

  // const volumes24h = useUniswapVolumes()

  // console.log('zeke:tables')

  const loading = !poolTvlData || !poolOHLCs

  // console.log('loading:', loading);
  // console.log('poolTvlData:', poolTvlData);
  // console.log('poolOHLCs:', poolOHLCs);
  // console.log('aprList:', aprList);
  // console.log('volume24h', volumes24h)
  /* loading and error state */
  return (
    <>
      <PairInfoContainer>
        <TVLInfoContainer poolsInfo={protocolTvl} />
        <HowToDetails />
      </PairInfoContainer>
      <SearchBar />
      <GridContainer>
        <PHeaderRow />
        <TokenDataContainer>
          {!loading && poolTvlData && poolOHLCs && aprList ? (
            sortedPools.map((pool, i: number) => {
              const poolAddress = getPoolAddress(
                pool.token0,
                pool.token1,
                pool.fee,
                V3_CORE_FACTORY_ADDRESSES[chainId]
              ).toLowerCase()
              const id = getPoolId(pool.token0, pool.token1, pool.fee)

              return (
                <PLoadedRow
                  key={id}
                  tokenListIndex={i}
                  tokenListLength={i}
                  tokenA={pool.token0}
                  tokenB={pool.token1}
                  fee={pool.fee}
                  tvl={poolTvlData[id]?.totalValueLocked}
                  volume={poolOHLCs[poolAddress]?.volumeUsd24h}
                  price={poolOHLCs[poolAddress]?.priceNow}
                  poolOHLC={poolOHLCs[poolAddress]}
                  usdPriceData={usdPriceData}
                  delta={poolOHLCs[poolAddress]?.delta24h}
                  apr={aprList[id]?.apr || 0}
                  dailyLMT={aprList[id]?.utilTotal}
                  poolKey={{
                    token0: pool.token0,
                    token1: pool.token1,
                    fee: pool.fee,
                  }}
                />
              )
            })
          ) : (
            <LoadingRows rowCount={PAGE_SIZE} />
          )}
        </TokenDataContainer>
      </GridContainer>
    </>
  )
}

const PairInfoContainer = styled.div`
  display: flex;
  margin-left: auto;
  margin-right: auto;
  // max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
  padding-bottom: 1.2rem;
  padding-top: 1rem;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 1.2rem;
`

interface TVLInfoProps {
  first: boolean
}

const TVLInfo = styled.div<TVLInfoProps>`
  width: 12rem;
  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 0.75rem;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  border-right: ${({ first, theme }) => (first ? `1px solid ${theme.backgroundOutline}` : 'none')};
`
const HowTo = styled.div`
  width: 40rem;
  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 0.75rem;
  border-radius: 10px;
  font-size: 0.8rem;
  /* margin-left: 1rem; */
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
`

const TVLInfoWrapper = styled.div`
  display: flex;
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  height: 7rem;
  /* width: 20rem; */
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.backgroundSurface};
  @media screen and (max-width: ${({ theme }) => theme.breakpoint.sm}px) {
    width: 20rem;
  }
`

function TVLInfoContainer({ poolsInfo, loading }: { poolsInfo?: any; loading?: boolean }) {
  return (
    <TVLInfoWrapper>
      <TVLInfo first={true}>
        <ThemedText.SubHeader fontSize={14}>TVL</ThemedText.SubHeader>
        <ThemedText.HeadlineMedium color="textSecondary">
          {!poolsInfo || !poolsInfo?.tvl
            ? '-'
            : poolsInfo?.tvl
            ? formatDollar({ num: poolsInfo.tvl + 430000, digits: 0 })
            : '0'}
        </ThemedText.HeadlineMedium>
      </TVLInfo>
      {/*<TVLInfo first={false}>
        <ThemedText.SubHeader fontSize={14}>Volume</ThemedText.SubHeader>
        <ThemedText.HeadlineMedium color="textSecondary">
          {!poolsInfo || !poolsInfo?.tvl
            ? '-'
            : poolsInfo?.tvl
            ? formatDollar({ num: poolsInfo.volume + 175000, digits: 1 })
            : '0'}
        </ThemedText.HeadlineMedium>
      </TVLInfo>*/}
    </TVLInfoWrapper>
  )
}

function HowToDetails() {
  return (
    <HowTo>
      <ThemedText.HeadlineSmall>How It Works</ThemedText.HeadlineSmall>
      <p>
        Liquidity Providers (LPs) earn swap fees from Uniswap when the position is in range, and also earn additional
        premiums for out-of-range capital being lent out to traders.
      </p>
      <p>
        LPs in individual pools therefore always earns at least Uniswap swap fees. LPs can create a new LP Position,
        which will automatically provide liquidity to Uniswap.
      </p>
    </HowTo>
  )
}
