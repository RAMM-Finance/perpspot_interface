import { Trans } from '@lingui/macro'
import Menu from '@mui/material/Menu'
import { Currency } from '@uniswap/sdk-core'
import { SmallButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { PoolStatsSection, StatsSkeleton } from 'components/ExchangeChart/PoolStats'
import { TextWithLoadingPlaceholder } from 'components/modalFooters/common'
import { unsupportedChain } from 'components/NavBar/ChainSelector'
import ZapModal from 'components/Tokens/TokenTable/ZapModal/ZapModal'
import { TokenStatus, TokenStatusKey } from 'constants/newOrHot'
import { useCurrency } from 'hooks/Tokens'
import { usePoolTVL } from 'hooks/usePoolLiquidity'
import { useEstimatedAPR, usePoolV2 } from 'hooks/usePools'
import { useAllPoolAndTokenPriceData, usePoolPriceData } from 'hooks/useUserPriceData'
import { useAtomValue } from 'jotai'
import { Row } from 'nft/components/Flex'
import { darken } from 'polished'
import { useCallback, useEffect, useMemo, useState } from 'react'
import React from 'react'
import { ChevronDown, ChevronUp, Star } from 'react-feather'
import { FixedSizeList as List } from 'react-window'
import { PoolContractInfo, usePoolKeyList, usePoolsAprUtilList } from 'state/application/hooks'
import { useAddPinnedPool, usePinnedPools, useRemovePinnedPool } from 'state/lists/hooks'
import { useMarginTradingActionHandlers } from 'state/marginTrading/hooks'
import { useCurrentPool, useSetCurrentPool } from 'state/user/hooks'
import styled, { keyframes, useTheme } from 'styled-components/macro'
import { BREAKPOINTS, ThemedText } from 'theme'
import { formatDollarAmount } from 'utils/formatNumbers'
import { getDefaultBaseQuote } from 'utils/getBaseQuote'
import { getPoolId } from 'utils/lmtSDK/LmtIds'
import { useChainId } from 'wagmi'

import { ReactComponent as SelectLoadingBar } from '../../assets/images/selectLoading.svg'
import ChainSelect from './ChainSelect'
import PairCategorySelector from './PoolCategorySelector'
import PoolSearchBar from './PoolSearchBar'
import {
  poolFilterByCategory,
  poolFilterStringAtom,
  poolSortAscendingAtom,
  PoolSortMethod,
  poolSortMethodAtom,
  useSetPoolSortMethod,
} from './state'

const PoolListHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1.7fr 1.1fr 0.7fr 1fr;
  width: 100%;
  justify-items: flex-start;
  align-items: center;
  margin-bottom: 0.4rem;
`

const PoolListContainer = styled(List)`
  // display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  // max-height: 60vh;
  // overflow-y: auto;
  // overscroll-behavior: none;
  // scrollbar-width: none;
  display: absolute;

  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 0.5rem;
  border-radius: 10px;
  gap: 0.25rem;
  // width: 100%;
`

// const PoolListContainer = styled.div`
//   // display: flex;
//   flex-direction: column;
//   align-items: flex-start;
//   justify-content: center;
//   height: 100%;
//   overflow-y: auto;
//   overscroll-behavior: none;
//   scrollbar-width: none;
//   display: absolute;
//   // width: 30rem;
//   // border: solid 2px ${({ theme }) => theme.backgroundOutline};
//   background-color: ${({ theme }) => theme.backgroundSurface};
//   padding: 0.5rem;
//   border-radius: 10px;
//   gap: 0.25rem;
//   width: 100%;
//   padding-bottom: 200px;
// `

const ListWrapper = styled.div`
  width: 100%;
  overflow-y: auto;
  scrollbar-width: none;
  overscroll-behavior: none;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  height: 550px;
`

const LabelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
`

const SelectPoolWrapper = styled.button`
  display: flex;
  flex-direction: row;
  // max-width: 250px;
  background-color: ${({ theme }) => theme.backgroundSurface};
  justify-content: space-evenly;
  align-items: center;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  width: max-content;
`

export const ChevronIcon = styled(ChevronDown)<{ $rotated: boolean }>`
  @media screen and (max-width: ${BREAKPOINTS.md}px) {
    rotate: 180deg;
  }
  background-color: ${({ theme }) => theme.backgroundSurface};
  color: ${({ theme }) => theme.textSecondary};
  transition: transform 0.3s ease;
  transform: ${({ $rotated }) => ($rotated ? 'rotate(180deg)' : 'none')};
  margin-left: 5px;
  max-width: 15px;
`

const MainWrapper = styled.div`
  display: grid;
  grid-template-columns: 0.3fr 0.1fr 1fr;
  align-items: center;
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.25rem;
  padding-bottom: 0.5rem;
  border: solid ${({ theme }) => theme.backgroundOutline};
  border-width: 1px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.backgroundSurface};
  margin-bottom: 0.7rem;
  gap: 0.7rem;
  @media only screen and (max-width: ${BREAKPOINTS.sm}px) {
    display: grid;
    grid-template-columns: auto auto;
    justify-content: start;
  }
`

const PoolListHeader = styled.div`
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) => theme.textTertiary};
  &:hover {
    cursor: pointer;
  }
  display: flex;
  align-items: center;
  gap: 3px;
`

const fade = keyframes`
  0%{
  opacity: .5}
    50%{
  opacity: 1}
      100%{
  opacity: .5}
`

const RowWrapper = styled.div<{ active: boolean; highlight: boolean }>`
  display: grid;
  grid-template-columns: ${({ highlight }) => '1.7fr 1.1fr .7fr .7fr .3fr'};
  justify-items: flex-start;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
  border-radius: 10px;
  :hover {
    border-radius: 10px;
    background-color: ${({ theme }) => theme.backgroundInteractive};
  }
  cursor: pointer;
  border: ${({ active, theme }) => (active ? `2px solid ${theme.backgroundInteractive}` : 'none')};
`

const NewWrapper = styled.div<{ highlight: boolean }>`
  animation-name: ${({ highlight }) => (highlight ? fade : 'none')};
  animation-duration: ${({ highlight }) => (highlight ? '2s' : 'none')};
  animation-iteration-count: ${({ highlight }) => (highlight ? 'infinite' : 'none')};
`

const PoolLabelWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 5px;
`

const FeeWrapper = styled.div`
  border: solid 2px ${({ theme }) => theme.backgroundOutline};
  border-radius: 8px;
  padding: 3px;
`

export const HollowStar = () => {
  const theme = useTheme()
  return <Star color={theme.backgroundOutline} size={16} stroke="white" fill="none" />
}

export const FilledStar = () => {
  const theme = useTheme()
  return <Star color={theme.backgroundOutline} size={16} fill="white" />
}

const DeltaText = styled.span<{ delta: number | undefined }>`
  font-size: 11px;
  color: ${({ theme, delta }) =>
    delta !== undefined ? (Math.sign(delta) < 0 ? theme.accentFailure : theme.accentSuccess) : theme.textPrimary};
`

const Pin = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  margin-right: 0.5rem;
`
const PoolSelectLoading = styled(SelectLoadingBar)`
  height: 40px;
  margin: auto;
`

const EarnButton = styled(SmallButtonPrimary)`
  border-radius: 8px;
  width: 60px;
  padding: 6px;
  background-color: ${({ theme }) => darken(0.1, theme.accentActive)};
  &:hover {
    background-color: ${({ theme }) => darken(0.2, theme.accentActive)};
  }
  wrap: no-wrap;
`
const NewOrHotStatusText = styled(ThemedText.BodySmall)`
  color: ${({ theme }) => theme.newOrHot};
`

const NewOrHotWrapper = styled.div`
  margin-top: 10px;
`

const PoolListWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 5px;
  overflow-y: clip;
`

const PoolSelectRow = ({
  fee,
  handlePinClick,
  handleRowClick,
  isPinned,
  isActive,
  priceNow,
  delta24h,
  baseQuoteSymbol,
  token0Symbol,
  token1Symbol,
  highlight,
  style,
  volume,
}: {
  handlePinClick: (e: any) => void
  isPinned: boolean
  handleRowClick: (e: any) => void
  isActive: boolean
  priceNow: number
  delta24h: number
  baseQuoteSymbol: string
  token0Symbol: string
  token1Symbol: string
  fee: number
  highlight: boolean
  style: any
  volume: number
}) => {
  return (
    <RowWrapper onClick={handleRowClick} highlight={highlight} active={isActive} style={style}>
      <Row>
        <Pin onClick={handlePinClick}>{isPinned ? <FilledStar /> : <HollowStar />}</Pin>
        <PoolLabelWrapper>
          <ThemedText.LabelSmall fontSize={11}>{baseQuoteSymbol}</ThemedText.LabelSmall>
          {/* <FeeWrapper>
            <ThemedText.BodyPrimary fontSize={10}>{fee ? `${fee / 10000}%` : ''}</ThemedText.BodyPrimary>
          </FeeWrapper> */}
          {token0Symbol && token1Symbol && (
            <NewOrHotStatusText
              fontWeight={600}
              paddingBottom={
                TokenStatus[token0Symbol as TokenStatusKey] === '🔥' ||
                TokenStatus[token1Symbol as TokenStatusKey] === '🔥'
                  ? '10px'
                  : '2px'
              }
              fontSize={
                TokenStatus[token0Symbol as TokenStatusKey] === '🔥' ||
                TokenStatus[token1Symbol as TokenStatusKey] === '🔥'
                  ? undefined
                  : '14px'
              }
            >
              {TokenStatus[token0Symbol as TokenStatusKey] || TokenStatus[token1Symbol as TokenStatusKey]}
            </NewOrHotStatusText>
          )}
        </PoolLabelWrapper>
      </Row>

      <ThemedText.BodyPrimary fontSize={11}>
        {priceNow ? formatDollarAmount({ num: priceNow, long: true }) : ''}
      </ThemedText.BodyPrimary>
      <DeltaText delta={delta24h}>{delta24h !== undefined ? `${delta24h.toFixed(2)}%` : 'N/A'}</DeltaText>
      <ThemedText.BodyPrimary fontSize={11}>{volume ? formatDollarAmount({ num: volume }) : ''}</ThemedText.BodyPrimary>
      {/* {highlight && (
        <NewWrapper highlight={highlight}>
          {' '}
          <ThemedText.BodySmall color="accentActive">New</ThemedText.BodySmall>
        </NewWrapper>
      )} */}
    </RowWrapper>
  )
}

const fadeIn = keyframes`
  from { opacity: .25 }
  to { opacity: 1 }
`

const StyledMenu = styled(Menu)`
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  animation: ${fadeIn} 0.5s;
  width: 27rem;
  & .MuiMenu-paper {
    border-radius: 10px;
    border: solid 1px ${({ theme }) => theme.backgroundOutline};
    background-color: ${({ theme }) => theme.backgroundSurface};
    width: 26rem;
    margin-top: 1rem;
  }
  @media only screen and (max-width: ${BREAKPOINTS.sm}px) {
    width: 26.5rem;
  }
`

function HeaderWrapper({ sortMethod, title }: { sortMethod: PoolSortMethod; title: React.ReactNode }) {
  const currentSortMethod = useAtomValue(poolSortMethodAtom)
  const sortAscending = useAtomValue(poolSortAscendingAtom)
  const theme = useTheme()
  const setPoolMethod = useSetPoolSortMethod(sortMethod)
  return (
    <PoolListHeader
      onClick={() => {
        setPoolMethod()
      }}
    >
      <div>{title}</div>
      {sortMethod === currentSortMethod && (
        <>
          {sortAscending ? (
            <ChevronUp size={16} strokeWidth={1.8} color={theme.accentActive} />
          ) : (
            <ChevronDown size={16} strokeWidth={1.8} color={theme.accentActive} />
          )}
        </>
      )}
    </PoolListHeader>
  )
}

function useFilteredKeys() {
  const sortMethod = useAtomValue(poolSortMethodAtom)
  const sortAscending = useAtomValue(poolSortAscendingAtom)
  const chainId = useChainId()
  const { poolList } = usePoolKeyList(chainId)
  const poolFilterString = useAtomValue(poolFilterStringAtom)

  const { pools: poolOHLCData } = useAllPoolAndTokenPriceData(chainId)

  const categoryFilter = useAtomValue(poolFilterByCategory)

  const sortedAndFilteredPools = useMemo(() => {
    if (!poolList || poolList.length === 0 || !chainId || !poolOHLCData) return []

    const filteredList = [...poolList]

    // Sorting pools based on sort method and direction
    const getSortValue = (pool: any, key: 'priceNow' | 'delta24h' | 'volumeUsd24h') => {
      const id = getPoolId(pool.token0, pool.token1, pool.fee)
      const data = poolOHLCData[id]
      return data?.[key]
    }

    if (sortMethod === PoolSortMethod.PRICE) {
      filteredList.sort((a, b) => {
        const aPrice = getSortValue(a, 'priceNow')
        const bPrice = getSortValue(b, 'priceNow')
        if (aPrice === undefined && bPrice !== undefined) {
          return 1
        } else if (aPrice !== undefined && bPrice === undefined) {
          return -1
        } else if (aPrice === undefined && bPrice === undefined) {
          return 0
        }
        return sortAscending ? aPrice - bPrice : bPrice - aPrice
      })
    } else if (sortMethod === PoolSortMethod.DELTA) {
      filteredList.sort((a, b) => {
        const aDelta = getSortValue(a, 'delta24h')
        const bDelta = getSortValue(b, 'delta24h')

        if (aDelta === undefined && bDelta !== undefined) {
          return 1
        } else if (aDelta !== undefined && bDelta === undefined) {
          return -1
        } else if (aDelta === undefined && bDelta === undefined) {
          return 0
        }
        return sortAscending ? aDelta - bDelta : bDelta - aDelta
      })
    } else if (sortMethod === PoolSortMethod.VOLUME) {
      filteredList.sort((a, b) => {
        const aVolume = getSortValue(a, 'volumeUsd24h')
        const bVolume = getSortValue(b, 'volumeUsd24h')

        if (aVolume === undefined && bVolume !== undefined) {
          return 1
        } else if (aVolume !== undefined && bVolume === undefined) {
          return -1
        } else if (aVolume === undefined && bVolume === undefined) {
          return 0
        }
        return sortAscending ? aVolume - bVolume : bVolume - aVolume
      })
    }

    // Filtering based on the search string
    if (poolFilterString && poolFilterString.trim().length > 0) {
      const str = poolFilterString.trim().toLowerCase()
      const delimiters = ['/', ',']
      const delimiter = delimiters.find((d) => str.includes(d))
      const filterValues = delimiter
        ? str
            .split(delimiter)
            .map((s) => s.trim())
            .filter(Boolean)
        : [str]

      return filteredList.filter((pool) => {
        const symbol0 = pool.symbol0.toLowerCase()
        const symbol1 = pool.symbol1.toLowerCase()
        const fee = pool.fee.toString()
        return filterValues.every((filter) => {
          return symbol0.includes(filter) || symbol1.includes(filter) || fee.includes(filter)
        })
      })
    }

    // Filter based on category
    if (categoryFilter) {
      return filteredList.filter((pool) => pool.category === categoryFilter)
    }

    return filteredList
  }, [sortMethod, sortAscending, poolList, poolFilterString, poolOHLCData, chainId, categoryFilter])

  return sortedAndFilteredPools
}

const DropdownMenu = () => {
  const addPinnedPool = useAddPinnedPool()
  const removePinnedPool = useRemovePinnedPool()
  const pinnedPools = usePinnedPools()
  const filteredKeys = useFilteredKeys()
  const chainId = useChainId()
  const { poolList } = usePoolKeyList(chainId)
  const poolMap = useMemo(() => {
    if (poolList) {
      return poolList.reduce(
        (prev, current) => {
          prev[getPoolId(current.token0, current.token1, current.fee)] = current
          return prev
        },
        {} as {
          [pool: string]: PoolContractInfo
        }
      )
    }
    return undefined
  }, [poolList])

  const {
    onPremiumCurrencyToggle,
    onMarginChange,
    onLeverageFactorChange,
    onSetMarginInPosToken,
    onSetIsSwap,
    onEstimatedDurationChange,
  } = useMarginTradingActionHandlers()

  const handlePinClick = useCallback(
    (poolId: string) => {
      if (pinnedPools.some((p) => getPoolId(p.token0, p.token1, p.fee) === poolId)) {
        removePinnedPool({
          token0: poolId.split('-')[0],
          token1: poolId.split('-')[1],
          fee: parseInt(poolId.split('-')[2]),
        })
      } else {
        addPinnedPool({
          token0: poolId.split('-')[0],
          token1: poolId.split('-')[1],
          fee: parseInt(poolId.split('-')[2]),
        })
      }
    },
    [pinnedPools]
  )

  const setCurrentPool = useSetCurrentPool()
  const currentPool = useCurrentPool()
  const currentPoolId = currentPool?.poolId

  const poolOHLCData = useAllPoolAndTokenPriceData(chainId).pools

  const handleRowClick = useCallback(
    (poolId: string, token0Symbol: string, token1Symbol: string) => {
      if (poolId !== currentPoolId && poolMap && poolMap[poolId] && chainId && poolOHLCData) {
        if (!poolOHLCData[poolId]) return
        const { token0IsBase } = poolOHLCData[poolId]
        localStorage.removeItem('defaultInputToken')
        onMarginChange('')
        onSetIsSwap(false)
        onPremiumCurrencyToggle(false)
        onSetMarginInPosToken(false)
        onLeverageFactorChange('')
        onEstimatedDurationChange('')
        setCurrentPool(poolId, !token0IsBase, token0IsBase, token0Symbol, token1Symbol)
      }
    },
    [
      onSetIsSwap,
      setCurrentPool,
      onMarginChange,
      onPremiumCurrencyToggle,
      onSetMarginInPosToken,
      poolOHLCData,
      chainId,
      onLeverageFactorChange,
      onEstimatedDurationChange,
      currentPoolId,
      poolMap,
    ]
  )

  const NZTaddress = '0x71dbf0BfC49D9C7088D160eC3b8Bb0979556Ea96'.toLowerCase()

  const list = useMemo(() => {
    if (filteredKeys.length === 0) return []
    if (chainId && poolList && poolList?.length > 0 && poolMap && poolOHLCData) {
      return filteredKeys.sort((poolKey) =>
        poolKey.token0.toLowerCase() === NZTaddress || poolKey.token1.toLowerCase() === NZTaddress ? -1 : 1
      )
    }
    return []
  }, [
    chainId,
    poolList,
    poolMap,
    poolOHLCData,
    filteredKeys,
    currentPoolId,
    handlePinClick,
    handleRowClick,
    pinnedPools,
  ])

  const getRow = useCallback(
    ({ index, style }: { index: number; style: any }) => {
      if (list[index] && poolMap && poolOHLCData) {
        const id = getPoolId(list[index].token0, list[index].token1, list[index].fee)
        if (!poolMap[id] || !poolOHLCData[id]) return null
        const { symbol0, symbol1 } = poolMap[id]
        const { priceNow, delta24h, token0IsBase, volumeUsd24h } = poolOHLCData[id]
        const baseQuoteSymbol = token0IsBase ? `${symbol0}/${symbol1}` : `${symbol1}/${symbol0}`
        const isPinned = !!pinnedPools.find((p) => getPoolId(p.token0, p.token1, p.fee) === id)
        return (
          <PoolSelectRow
            style={style}
            fee={list[index].fee}
            handlePinClick={(e: any) => {
              e.stopPropagation()
              handlePinClick(id)
            }}
            handleRowClick={() => {
              handleRowClick(id, symbol0, symbol1)
            }}
            isPinned={isPinned}
            isActive={currentPoolId === id}
            key={id}
            priceNow={priceNow}
            delta24h={delta24h}
            baseQuoteSymbol={baseQuoteSymbol}
            token0Symbol={symbol0}
            token1Symbol={symbol1}
            volume={volumeUsd24h}
            highlight={
              list[index].token0.toLowerCase() === NZTaddress || list[index].token1.toLowerCase() === NZTaddress
            }
          />
        )
      }
      return null
    },
    [list, currentPoolId, pinnedPools]
  )

  return (
    <List
      overscanCount={7}
      height={820}
      itemCount={list?.length + 10}
      itemSize={50}
      width="100%"
      style={{ overscrollBehavior: 'none' }}
    >
      {getRow}
    </List>
  )
}

function SelectPool() {
  const chainId = useChainId()

  const currentPool = useCurrentPool()
  const poolKey = currentPool?.poolKey
  const poolId = currentPool?.poolId
  const { tvl, loading } = usePoolTVL(poolKey?.token0, poolKey?.token1, poolKey?.fee)

  const token0 = useCurrency(poolKey?.token0 ?? null)
  const token1 = useCurrency(poolKey?.token1 ?? null)

  const [, pool, tickSpacing] = usePoolV2(token0 ?? undefined, token1 ?? undefined, poolKey?.fee ?? undefined)

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const { data: poolOHLC } = usePoolPriceData(
    currentPool?.poolKey.token0,
    currentPool?.poolKey.token1,
    currentPool?.poolKey.fee
  )

  const baseQuoteSymbol = useMemo(() => {
    if (currentPool && poolOHLC) {
      const base = poolOHLC.token0IsBase ? currentPool.token0Symbol : currentPool.token1Symbol
      const quote = poolOHLC.token0IsBase ? currentPool.token1Symbol : currentPool.token0Symbol
      return `${base}/${quote}`
    } else if (token0 && token1 && poolOHLC) {
      const base = poolOHLC.token0IsBase ? token0.symbol : token1.symbol
      const quote = poolOHLC.token0IsBase ? token1.symbol : token0.symbol
      return `${base}/${quote}`
    } else if (token0 && token1 && chainId) {
      const [base] = getDefaultBaseQuote(token0.wrapped.address, token1.wrapped.address, chainId)
      const token0IsBase = base.toLowerCase() === token0.wrapped.address.toLowerCase()
      return token0IsBase ? `${token0.symbol}/${token1.symbol}` : `${token1.symbol}/${token0.symbol}`
    }
    return null
  }, [currentPool, poolOHLC])

  const [baseAddress, quoteAddress] = useMemo(() => {
    if (currentPool && poolOHLC) {
      const base = poolOHLC.token0IsBase ? currentPool.poolKey.token0 : currentPool.poolKey.token1
      const quote = poolOHLC.token0IsBase ? currentPool.poolKey.token1 : currentPool.poolKey.token0
      return [base, quote]
    }
    return [null, null]
  }, [currentPool, poolOHLC])

  const baseCurrency = useCurrency(baseAddress)
  const quoteCurrency = useCurrency(quoteAddress)

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const [showModal, setShowModal] = useState(false)
  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  const handleZap = useCallback(
    (e: any) => {
      e.stopPropagation()
      setShowModal(true)
    },
    [setShowModal]
  )

  const { poolList: aprPoolList } = usePoolsAprUtilList()
  const apr = useMemo(() => {
    if (!aprPoolList || !poolId) return undefined
    else {
      return aprPoolList[poolId]['apr']
    }
  }, [aprPoolList, poolId])

  const [price] = useMemo(() => {
    if (poolOHLC) {
      return [poolOHLC.priceNow]
    }
    return [undefined]
  }, [poolOHLC])

  const depositAmountUSD = 1000
  const priceInverted = poolOHLC?.token0IsBase ? price : price ? 1 / price : 0

  const { apr: estimatedAPR } = useEstimatedAPR(token0, token1, pool, tickSpacing, priceInverted, depositAmountUSD)

  if (chainId && unsupportedChain(chainId)) {
    return (
      <MainWrapper>
        <SelectPoolWrapper aria-controls="simple-menu" aria-haspopup="true" onClick={() => {}}>
          <>
            <LabelWrapper>
              <Row gap="10">
                <AutoColumn justify="flex-start">
                  <TextWithLoadingPlaceholder width={50} syncing={false}>
                    <Row gap="6">
                      <ThemedText.HeadlineSmall fontSize={20}>Select Pair</ThemedText.HeadlineSmall>
                    </Row>
                  </TextWithLoadingPlaceholder>
                </AutoColumn>
              </Row>
            </LabelWrapper>
            <ChevronIcon $rotated={false} size={30} />
          </>
        </SelectPoolWrapper>
        <StatsSkeleton />
      </MainWrapper>
    )
  }

  const enableDropdown = window.innerWidth > 1265

  useEffect(() => {
    setAnchorEl(null)
  }, [enableDropdown])

  return (
    <>
      {showModal && (
        <ZapModal
          isOpen={showModal}
          onClose={handleCloseModal}
          apr={apr !== undefined && estimatedAPR !== undefined ? apr + estimatedAPR : undefined}
          tvl={tvl?.toNumber()}
          token0={token0}
          token1={token1}
          poolKey={poolKey}
        />
      )}
      <MainWrapper>
        <SelectPoolWrapper
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={!enableDropdown ? handleClick : () => {}}
        >
          {baseQuoteSymbol ? (
            <>
              <LabelWrapper>
                <Row gap="10">
                  {baseCurrency && quoteCurrency && (
                    <DoubleCurrencyLogo
                      currency0={baseCurrency as Currency}
                      currency1={quoteCurrency as Currency}
                      size={22}
                    />
                  )}
                  <AutoColumn justify="flex-start">
                    <TextWithLoadingPlaceholder width={50} syncing={!baseQuoteSymbol}>
                      <Row gap="6">
                        <ThemedText.HeadlineSmall fontSize={20}>
                          {baseQuoteSymbol ? `${baseQuoteSymbol}` : ''}
                        </ThemedText.HeadlineSmall>
                        <ThemedText.BodySmall fontSize="14px">
                          ({poolKey?.fee ? poolKey.fee / 10000 : 0}%)
                        </ThemedText.BodySmall>
                        {token0?.symbol && token1?.symbol && (
                          <NewOrHotStatusText
                            fontWeight={600}
                            paddingBottom={
                              TokenStatus[token0.symbol as TokenStatusKey] === '🔥' ||
                              TokenStatus[token1.symbol as TokenStatusKey] === '🔥'
                                ? '10px'
                                : '5px'
                            }
                            fontSize={
                              TokenStatus[token0.symbol as TokenStatusKey] === '🔥' ||
                              TokenStatus[token1.symbol as TokenStatusKey] === '🔥'
                                ? undefined
                                : '14px'
                            }
                          >
                            {TokenStatus[token0.symbol as TokenStatusKey] ||
                              TokenStatus[token1.symbol as TokenStatusKey]}
                          </NewOrHotStatusText>
                        )}
                      </Row>
                    </TextWithLoadingPlaceholder>
                  </AutoColumn>
                </Row>
              </LabelWrapper>
              {!enableDropdown && <ChevronIcon $rotated={open} size={30} />}
            </>
          ) : (
            <PoolSelectLoading />
          )}
        </SelectPoolWrapper>
        <EarnButton onClick={handleZap}>Zap In</EarnButton>
        <PoolStatsSection chainId={chainId} address0={poolKey?.token0} address1={poolKey?.token1} fee={poolKey?.fee} />
        {open && (
          <StyledMenu
            id="pool-select-menu"
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={handleClose}
            style={{ position: 'absolute' }}
            marginThreshold={0}
          >
            <PoolSearchBar />
            <ChainSelect />
            <PairCategorySelector />
            <PoolListHeaderRow>
              <PoolListHeader style={{ marginLeft: '40px' }}>Pairs</PoolListHeader>
              <HeaderWrapper title={<Trans>Price</Trans>} sortMethod={PoolSortMethod.PRICE} />
              <HeaderWrapper title={<Trans>24h</Trans>} sortMethod={PoolSortMethod.DELTA} />
              <HeaderWrapper title={<Trans>Volume</Trans>} sortMethod={PoolSortMethod.VOLUME} />
            </PoolListHeaderRow>
            <DropdownMenu />
          </StyledMenu>
        )}
      </MainWrapper>
    </>
  )
}

export function PoolList() {
  return (
    <PoolListWrapper>
      <PoolSearchBar />
      <ChainSelect />
      <PairCategorySelector />
      <PoolListHeaderRow style={{ marginBottom: '.1rem' }}>
        <PoolListHeader style={{ marginLeft: '40px' }}>Pairs</PoolListHeader>
        <HeaderWrapper title={<Trans>Price</Trans>} sortMethod={PoolSortMethod.PRICE} />
        <HeaderWrapper title={<Trans>24h</Trans>} sortMethod={PoolSortMethod.DELTA} />
        <HeaderWrapper title={<Trans>Volume</Trans>} sortMethod={PoolSortMethod.VOLUME} />
      </PoolListHeaderRow>
      <DropdownMenu />
    </PoolListWrapper>
  )
}

export default React.memo(SelectPool)
