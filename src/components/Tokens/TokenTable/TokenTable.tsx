import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { MouseoverTooltip } from 'components/Tooltip'
import { SupportedChainId } from 'constants/chains'
import { useLimweth } from 'hooks/useContract'
import { usePoolsData } from 'hooks/useLMTPools'
import { getDecimalAndUsdValueData } from 'hooks/useUSDPrice'
import useVaultBalance from 'hooks/useVaultBalance'
import { atom, useAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Info } from 'react-feather'
import { useAppPoolOHLC, usePoolKeyList, usePoolOHLCs, usePoolsAprUtilList } from 'state/application/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatDollar } from 'utils/formatNumbers'

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
      UtilRate={<LongLoadingBubble />}
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
  TOTAL_VALUE_LOCKED = 'TVL',
  VOLUME = 'Volume',
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
    <Trans>Total value locked (TVL) is the aggregate amount of the asset available in this liquidity pool.</Trans>
  ),
  [TokenSortMethod.VOLUME]: (
    <Trans>Volume is the amount of the asset that has been traded on Limitless during the selected time frame.</Trans>
  ),
  [TokenSortMethod.APR]: (
    <Trans>
      Estimated APR is the expected APR, based on the given trading volume and utilization rate, for providing liquidity between 70% and 130% of the current price, assuming a deposit of 1,000 USD.
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
      UtilRate={<HeaderCell category={TokenSortMethod.DAILY_LMT} />}
      sparkLine={null}
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

function useFilteredPairs() {
  const { poolList } = usePoolKeyList()
  const { poolList: aprList } = usePoolsAprUtilList()

  // const pinnedPools = usePinnedPools()
  const poolFilterString = useAtomValue(filterStringAtom)
  const sortAscending = useAtomValue(sortAscendingAtom)
  const sortMethod = useAtomValue(sortMethodAtom)
  const poolOHLCData = useAppPoolOHLC()
  const { result: poolTvlData } = usePoolsData()

  const { chainId } = useWeb3React()

  return useMemo(() => {
    if (poolList && poolList.length > 0 && chainId && poolOHLCData[chainId] && poolTvlData && aprList) {
      let list = [...poolList]
      if (sortMethod === TokenSortMethod.PRICE) {
        list = list.filter((pool) => {
          const id = getPoolId(pool.token0, pool.token1, pool.fee)
          return !!poolOHLCData[chainId][id]
        })
        if (sortAscending) {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            if (!poolOHLCData[chainId][aId] || !poolOHLCData[chainId][bId]) return 0

            const aPrice = poolOHLCData[chainId][aId]?.priceNow
            const bPrice = poolOHLCData[chainId][bId]?.priceNow
            return bPrice - aPrice
          })
        } else {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            if (!poolOHLCData[chainId][aId] || !poolOHLCData[chainId][bId]) return 0

            const aPrice = poolOHLCData[chainId][aId]?.priceNow
            const bPrice = poolOHLCData[chainId][bId]?.priceNow
            return aPrice - bPrice
          })
        }
      } else if (sortMethod === TokenSortMethod.PRICE_CHANGE) {
        if (sortAscending) {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            if (!poolOHLCData[chainId][aId] || !poolOHLCData[chainId][bId]) return 0
            const aDelta = poolOHLCData[chainId][aId]?.delta24h
            const bDelta = poolOHLCData[chainId][bId]?.delta24h
            return bDelta - aDelta
          })
        } else {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            if (!poolOHLCData[chainId][aId] || !poolOHLCData[chainId][bId]) return 0
            const aDelta = poolOHLCData[chainId][aId]?.delta24h
            const bDelta = poolOHLCData[chainId][bId]?.delta24h
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
            if (!poolTvlData[aId] || !poolTvlData[bId]) return 0
            const aVolume = poolTvlData[aId]?.volume
            const bVolume = poolTvlData[bId]?.volume
            return bVolume - aVolume
          })
        } else {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            if (!poolTvlData[aId] || !poolTvlData[bId]) return 0
            const aVolume = poolTvlData[aId]?.volume
            const bVolume = poolTvlData[bId]?.volume
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
  const { chainId } = useWeb3React()

  const poolOHLCs = usePoolOHLCs()

  const { result: vaultBal, loading: balanceLoading } = useVaultBalance()

  const { poolList: aprList } = usePoolsAprUtilList()

  const { result: poolTvlData, loading: poolsLoading } = usePoolsData()
  const loading = poolsLoading || balanceLoading

  const [limWethBal, setLimWethBal] = useState<number | null>(null)
  const limWeth = useLimweth()

  useEffect(() => {
    const getBalance = async (limWeth: any) => {
      const limWethBal = await limWeth?.tokenBalance()
      const decimals = await limWeth?.decimals()
      const tokenBalance = parseFloat(limWethBal.toString()) / 10 ** decimals
      const queryResult = await getDecimalAndUsdValueData(chainId, '0x4200000000000000000000000000000000000006')
      const price = parseFloat(queryResult?.lastPriceUSD) // BASE WETH PRICE
      setLimWethBal(price * tokenBalance)
    }
    if (chainId === SupportedChainId.BASE) {
      getBalance(limWeth)
    }
  }, [chainId, limWeth])

  const protocolTvl = useMemo(() => {
    if (poolTvlData && !balanceLoading) {
      if (chainId === SupportedChainId.BASE) {
        return {
          tvl:
            Object.values(poolTvlData).reduce((accum: number, pool: any) => accum + pool.totalValueLocked, 0) +
            Number(vaultBal) +
            Number(limWethBal || 0),
          volume: Object.values(poolTvlData).reduce((accum: number, pool: any) => accum + pool.volume, 0),
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

  // const dailyFeeAPRs = useDailyFeeAPR(sortedPools)
  // console.log("DAILY FEE APRS", JSON.stringify(dailyFeeAPRs))
  // console.log("POOL TVL DATA", JSON.stringify(poolTvlData))
  /* loading and error state */
  return (
    <>
      <PairInfoContainer>
        <TVLInfoContainer poolsInfo={protocolTvl} loading={loading} />
        <HowToDetails />
      </PairInfoContainer>
      <SearchBar />
      <GridContainer>
        <PHeaderRow />
        <TokenDataContainer>
          {!loading && poolTvlData && poolOHLCs && aprList ? (
            sortedPools.map((pool, i: number) => {
              const id = getPoolId(pool.token0, pool.token1, pool.fee)
              return (
                <PLoadedRow
                  key={getPoolId(pool.token0, pool.token1, pool.fee)}
                  tokenListIndex={i++}
                  tokenListLength={i++}
                  tokenA={pool.token0}
                  tokenB={pool.token1}
                  fee={pool.fee}
                  tvl={poolTvlData[id]?.totalValueLocked}
                  volume={poolTvlData[id]?.volume}
                  price={poolOHLCs[id]?.priceNow}
                  delta={poolOHLCs[id]?.delta24h}
                  apr={aprList[id]?.apr || 0}
                  utilTotal={aprList[id]?.utilTotal}
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
          {loading ? '-' : poolsInfo?.tvl ? formatDollar({ num: poolsInfo.tvl, digits: 0 }) : '0'}
        </ThemedText.HeadlineMedium>
      </TVLInfo>
      <TVLInfo first={false}>
        <ThemedText.SubHeader fontSize={14}>Volume</ThemedText.SubHeader>
        <ThemedText.HeadlineMedium color="textSecondary">
          {loading ? '-' : poolsInfo?.tvl ? formatDollar({ num: poolsInfo.volume + 175000, digits: 1 }) : '0'}
        </ThemedText.HeadlineMedium>
      </TVLInfo>
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
