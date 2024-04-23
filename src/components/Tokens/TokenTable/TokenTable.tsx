import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { MouseoverTooltip } from 'components/Tooltip'
import { usePoolsData } from 'hooks/useLMTPools'
import useVaultBalance from 'hooks/useVaultBalance'
import { atom, useAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { ReactNode, useCallback, useMemo, useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Info } from 'react-feather'
import { usePoolKeyList, usePoolOHLCs, usePoolsAprUtilList } from 'state/application/hooks'
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
import { useLimweth } from 'hooks/useContract'
import { SupportedChainId } from 'constants/chains'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { NumberType } from '@uniswap/conedison/format'
import { getDecimalAndUsdValueData } from 'hooks/useUSDPrice'

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

// function LoadingTokenTable({ rowCount = PAGE_SIZE }: { rowCount?: number }) {
//   return (
//     <TokenDataContainer>
//       <LoadingRows rowCount={rowCount} />
//     </TokenDataContainer>
//   )
// }
enum TokenSortMethod {
  PRICE = 'Price',
  TOTAL_VALUE_LOCKED = 'TVL',
  VOLUME = 'Volume',
  APR = 'Est APR',
  URate = 'Util Rate',
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
      Estimated APR is the expected APR, with the given volume and utilization rate, the return as an LP for providing
      liquidity between 90% and 110% of current price
    </Trans>
  ),
  [TokenSortMethod.URate]: (
    <Trans>
      Utilization rate is the averaged utilization rate across all ticks of the pool. The higher it is, the higher the
      APR.
    </Trans>
  ),
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
      tokenInfo={<Trans>Pair</Trans>}
      price={<HeaderCell category={TokenSortMethod.PRICE} />}
      priceChange={<HeaderCell category={TokenSortMethod.PRICE_CHANGE} />}
      tvl={<HeaderCell category={TokenSortMethod.TOTAL_VALUE_LOCKED} />}
      volume={<HeaderCell category={TokenSortMethod.VOLUME} />}
      APR={<HeaderCell category={TokenSortMethod.APR} />}
      UtilRate={<HeaderCell category={TokenSortMethod.URate} />}
      sparkLine={null}
    />
  )
}

export default function TokenTable() {
  const { chainId } = useWeb3React()
  const sortAscending = useAtom(sortAscendingAtom)
  const sortMethod = useAtom(sortMethodAtom)

  const poolOHLCs = usePoolOHLCs()

  const { result: vaultBal, loading: balanceLoading } = useVaultBalance()

  const { poolList } = usePoolKeyList()
  const { poolList: aprList } = usePoolsAprUtilList()

  const { result: poolTvlData, loading: poolsLoading } = usePoolsData()
  const loading = poolsLoading || balanceLoading

  const [limWethBal, setLimWethBal] = useState<number | null>(null)
  const limWeth = useLimweth()

  useEffect(() => {
    const getBalance = async (limWeth: any) => {
      const limWethBal = await limWeth?.tokenBalance()
      const decimals = await limWeth?.decimals()
      const tokenBalance = parseFloat(limWethBal.toString()) / (10 ** decimals)
      const price = (await getDecimalAndUsdValueData(chainId, "0x4200000000000000000000000000000000000006"))?.lastPriceUSD // BASE WETH PRICE
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

  const filterString = useAtomValue(filterStringAtom)
  const filteredPools = useMemo(() => {
    if (!poolList || !filterString) return poolList
    return poolList.filter((pool) => {
      return (
        pool.token0.toLowerCase().includes(filterString.toLowerCase()) ||
        pool.token1.toLowerCase().includes(filterString.toLowerCase()) ||
        pool.symbol0.toLowerCase().includes(filterString.toLowerCase()) ||
        pool.symbol1.toLowerCase().includes(filterString.toLowerCase()) ||
        pool.name0.toLowerCase().includes(filterString.toLowerCase()) ||
        pool.name1.toLowerCase().includes(filterString.toLowerCase())
      )
    })
  }, [poolList, filterString])

  const sortedPools = useMemo(() => {
    if (!poolTvlData || !filteredPools || filteredPools.length === 0 || !poolOHLCs || loading || !aprList) return []

    return filteredPools.sort((a, b) => {
      const aId = getPoolId(a.token0, a.token1, a.fee)
      const bId = getPoolId(b.token0, b.token1, b.fee)
      
      if (sortMethod[0] === TokenSortMethod.PRICE) {
        if (poolOHLCs[aId]?.priceNow === undefined || poolOHLCs[bId]?.priceNow === undefined) return 0
        if (!sortAscending[0]) {
          return poolOHLCs[aId].priceNow > poolOHLCs[bId].priceNow ? 1 : -1
        } else {
          return poolOHLCs[aId].priceNow > poolOHLCs[bId].priceNow ? -1 : 1
        }
      } else if (sortMethod[0] === TokenSortMethod.TOTAL_VALUE_LOCKED) {
        if (poolTvlData[aId] === undefined || poolTvlData[bId] === undefined) return 0
        return !sortAscending[0]
          ? poolTvlData[aId].totalValueLocked - poolTvlData[bId].totalValueLocked
          : poolTvlData[bId].totalValueLocked - poolTvlData[aId].totalValueLocked
      } else if (sortMethod[0] === TokenSortMethod.VOLUME) {
        if (poolTvlData[aId] === undefined || poolTvlData[bId] === undefined) return 0
        return !sortAscending[0]
          ? poolTvlData[aId].volume - poolTvlData[bId].volume
          : poolTvlData[bId].volume - poolTvlData[aId].volume
      } else if (sortMethod[0] === TokenSortMethod.APR) {
        if (aprList[aId] === undefined || aprList[bId] === undefined) return 0
        return !sortAscending[0] ? aprList[aId].apr - aprList[bId].apr : aprList[bId].apr - aprList[aId].apr
      } else if (sortMethod[0] === TokenSortMethod.URate) {
        if (aprList[aId] === undefined || aprList[bId] === undefined) return 0
        return !sortAscending[0]
          ? aprList[aId].utilTotal - aprList[bId].utilTotal
          : aprList[bId].utilTotal - aprList[aId].utilTotal
      } else if (sortMethod[0] === TokenSortMethod.PRICE_CHANGE) {
        if (poolOHLCs[aId].delta24h === undefined || poolOHLCs[bId].delta24h === undefined) return 0
        return !sortAscending[0]
          ? poolOHLCs[aId].delta24h - poolOHLCs[bId].delta24h
          : poolOHLCs[bId].delta24h - poolOHLCs[aId].delta24h
      }
      return 0
    })
  }, [poolTvlData, sortAscending, sortMethod, poolOHLCs, filteredPools, loading, aprList])

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
                  apr={aprList[id]?.apr}
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

function TVLInfoContainer({ poolsInfo, loading }: { poolsInfo?: any, loading?: boolean }) {
  return (
    <TVLInfoWrapper>
      <TVLInfo first={true}>
        <ThemedText.SubHeader fontSize={14}>TVL</ThemedText.SubHeader>
        <ThemedText.HeadlineMedium color="textSecondary">
          {loading ? '-' : (poolsInfo?.tvl ? formatDollar({ num: poolsInfo.tvl, digits: 0 }) : '0')}
        </ThemedText.HeadlineMedium>
      </TVLInfo>
      <TVLInfo first={false}>
        <ThemedText.SubHeader fontSize={14}>Volume</ThemedText.SubHeader>
        <ThemedText.HeadlineMedium color="textSecondary">
          {loading ? '-' : (poolsInfo?.tvl ? formatDollar({ num: poolsInfo.volume + 175000, digits: 1 }) : '0')}
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
