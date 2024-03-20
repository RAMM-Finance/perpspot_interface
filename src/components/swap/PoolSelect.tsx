import { Trans } from '@lingui/macro'
import Menu from '@mui/material/Menu'
import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { PoolStatsSection } from 'components/ExchangeChart/PoolStats'
import { TextWithLoadingPlaceholder } from 'components/modalFooters/common'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { useCurrency } from 'hooks/Tokens'
import { usePoolsData } from 'hooks/useLMTPools'
import { usePool } from 'hooks/usePools'
import { useAtomValue } from 'jotai/utils'
import { Row } from 'nft/components/Flex'
import { useCallback, useMemo, useState } from 'react'
import React from 'react'
import { ArrowDown, ArrowUp, ChevronDown, Star } from 'react-feather'
import { useAppPoolOHLC, useRawPoolKeyList } from 'state/application/hooks'
import { useMarginTradingActionHandlers } from 'state/marginTrading/hooks'
import {
  useAddPinnedPool,
  useCurrentInputCurrency,
  useCurrentOutputCurrency,
  useCurrentPool,
  usePinnedPools,
  useRemovePinnedPool,
  useSetCurrentPool,
} from 'state/user/hooks'
import styled, { keyframes, useTheme } from 'styled-components/macro'
import { BREAKPOINTS, ThemedText } from 'theme'
import { PoolKey } from 'types/lmtv2position'

import PoolSearchBar from './PoolSearchBar'
import {
  poolFilterStringAtom,
  poolSortAscendingAtom,
  PoolSortMethod,
  poolSortMethodAtom,
  useSetPoolSortMethod,
} from './state'
import { colors } from 'theme/colors'

const PoolListHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  width: 100%;
  justify-items: flex-start;
  align-items: center;
  margin-bottom: 0.4rem;
`

const PoolListContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  max-height: 30vh;
  overflow-y: auto;
  overscroll-behavior: none;
  scrollbar-width: none;
  display: absolute;
  // width: 30rem;
  /* border: solid 2px ${({ theme }) => theme.backgroundOutline}; */
  background-color: ${({ theme }) => theme.surface1};
  padding: 0.5rem;
  border-radius: 10px;
  gap: 0.25rem;
`

const ListWrapper = styled.div`
  width: 100%;
  overflow-y: auto;
  scrollbar-width: none;
  overscroll-behavior: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  max-width: 250px;
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

const ChevronIcon = styled(ChevronDown)<{ $rotated: boolean }>`
  @media screen and (max-width: ${BREAKPOINTS.md}px) {
    rotate: 180deg;
  }
  background-color: ${({ theme }) => theme.backgroundSurface};
  color: ${({ theme }) => theme.textSecondary};
  transition: transform 0.3s ease;
  transform: ${({ $rotated }) => ($rotated ? 'rotate(180deg)' : 'none')};
`

const MainWrapper = styled.div`
  display: grid;
  grid-template-columns: 0.35fr 1fr;
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.25rem;
  padding-bottom: 0.5rem;
  border: solid ${({ theme }) => theme.backgroundOutline};
  border-width: 1px 1px 0 1px;
  /* border-width: 1px; */
  /* border-radius: 10px; */
  background-color: ${({ theme }) => theme.backgroundSurface};
  /* margin-bottom: 0.7rem; */
  /* gap: 0.7rem; */
`

const PoolListHeader = styled.div`
  font-size: 15px;
  font-weight: 400;
  color: ${({ theme }) => theme.textTertiary};
  &:hover {
    cursor: pointer;
  }
`

const RowWrapper = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  justify-items: flex-start;
  align-items: center;
  padding: 0.5rem;
  :hover {
    background-color: ${({ theme }) => theme.backgroundInteractive};
  }
  cursor: pointer;
`

const PoolLabelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
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
  font-size: 14px;
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

const PoolSelectRow = ({ poolKey, handleClose }: { poolKey: PoolKey; handleClose: any }) => {
  const poolOHLCDatas = useAppPoolOHLC()
  const token0 = useCurrency(poolKey.token0)
  const token1 = useCurrency(poolKey.token1)
  const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, poolKey.fee)

  const id = `${pool?.token0.wrapped.address.toLowerCase()}-${pool?.token1.wrapped.address.toLowerCase()}-${pool?.fee}`
  const poolOHLCData = poolOHLCDatas[id]
  const delta = poolOHLCData?.delta24h

  // const { onPoolSelection } = useSwapActionHandlers()

  const baseQuoteSymbol = useMemo(() => {
    if (pool && poolOHLCDatas) {
      const id = getPoolId(pool.token0.address, pool.token1.address, pool.fee)
      if (poolOHLCDatas[id]) {
        const base = poolOHLCDatas[id]?.base
        // console.log('baseQuoteSymbol', poolOHLCDatas[id])
        if (!base) {
          const priceData = poolOHLCDatas[id]
          const token0Price = new BN(pool.token0Price.toFixed(18))
          const d1 = token0Price.minus(priceData.price24hAgo).abs()
          const d2 = new BN(1).div(token0Price).minus(priceData.price24hAgo).abs()
          if (d1.lt(d2)) {
            return `${pool.token0.symbol}/${pool.token1.symbol}`
          } else {
            return `${pool.token1.symbol}/${pool.token0.symbol}`
          }
        }
        if (base.toLowerCase() === pool.token0.address.toLowerCase()) {
          return `${pool.token0.symbol}/${pool.token1.symbol}`
        } else {
          return `${pool.token1.symbol}/${pool.token0.symbol}`
        }
      }
    }
    return null
  }, [poolOHLCDatas, pool])

  const addPinnedPool = useAddPinnedPool()
  const removePinnedPool = useRemovePinnedPool()
  const pinnedPools = usePinnedPools()

  const isPinned = useMemo(() => {
    return pinnedPools?.some((p) => {
      const _id = `${p.token0.toLowerCase()}-${p.token1.toLowerCase()}-${p.fee}`
      return _id === id
    })
  }, [id, pinnedPools])

  const handleClick = useCallback(
    (e: any) => {
      isPinned
        ? removePinnedPool({ token0: poolKey.token0, token1: poolKey.token1, fee: poolKey.fee })
        : addPinnedPool({ token0: poolKey.token0, token1: poolKey.token1, fee: poolKey.fee })
      e.stopPropagation()
    },
    [isPinned, removePinnedPool, addPinnedPool, poolKey.token0, poolKey.token1, poolKey.fee]
  )

  const { onMarginChange } = useMarginTradingActionHandlers()

  const currentPool = useCurrentPool()
  const poolId = currentPool?.poolId
  const setCurrentPool = useSetCurrentPool()

  const inputIsToken0 = useMemo(() => {
    if (pool && poolOHLCData) {
      const quote = poolOHLCData?.quote
      if (quote) {
        if (quote.toLowerCase() === pool.token0.address.toLowerCase()) {
          return true
        }
      }
    }
    return false
  }, [poolOHLCData, pool])

  const handleRowClick = useCallback(() => {
    if (token0 && token1 && poolId !== id) {
      onMarginChange('')
      setCurrentPool(id, inputIsToken0)
      handleClose()
    }
  }, [token0, token1, id, poolId, handleClose, inputIsToken0, setCurrentPool, onMarginChange])

  return (
    <RowWrapper onClick={handleRowClick}>
      <Row>
        <Pin onClick={handleClick}>{isPinned ? <FilledStar /> : <HollowStar />}</Pin>
        <PoolLabelWrapper>
          <ThemedText.LabelSmall>{baseQuoteSymbol}</ThemedText.LabelSmall>
          <ThemedText.BodyPrimary fontSize={12}>{pool?.fee ? `${pool?.fee / 10000}%` : ''}</ThemedText.BodyPrimary>
        </PoolLabelWrapper>
      </Row>
      <ThemedText.BodyPrimary fontSize={14}>
        {poolOHLCData?.priceNow ? formatBN(new BN(poolOHLCData.priceNow)) : ''}
      </ThemedText.BodyPrimary>
      <DeltaText delta={delta}>{delta !== undefined ? `${(delta * 100).toFixed(2)}%` : 'N/A'}</DeltaText>
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
  & .MuiMenu-paper {
    border-radius: 10px;
    border: solid 1px ${({ theme }) => theme.backgroundOutline};
    background-color: ${({ theme }) => theme.surface1};
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
      {title}
      {sortMethod === currentSortMethod && (
        <>
          {sortAscending ? (
            <ArrowUp size={20} strokeWidth={1.8} color={theme.accentActive} />
          ) : (
            <ArrowDown size={20} strokeWidth={1.8} color={theme.accentActive} />
          )}
        </>
      )}
    </PoolListHeader>
  )
}

function useFilteredKeys() {
  const sortMethod = useAtomValue(poolSortMethodAtom)
  const sortAscending = useAtomValue(poolSortAscendingAtom)
  const poolList = useRawPoolKeyList()
  // const pinnedPools = usePinnedPools()
  const poolFilterString = useAtomValue(poolFilterStringAtom)
  const poolOHLCData = useAppPoolOHLC()

  return useMemo(() => {
    if (poolList.length > 0) {
      const list = [...poolList]
      if (sortMethod === PoolSortMethod.PRICE) {
        if (sortAscending) {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            const aPrice = poolOHLCData[aId]?.priceNow
            const bPrice = poolOHLCData[bId]?.priceNow
            return bPrice - aPrice
          })
        } else {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            const aPrice = poolOHLCData[aId]?.priceNow
            const bPrice = poolOHLCData[bId]?.priceNow
            return aPrice - bPrice
          })
        }
      } else if (sortMethod === PoolSortMethod.DELTA) {
        if (sortAscending) {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            const aDelta = poolOHLCData[aId]?.delta24h
            const bDelta = poolOHLCData[bId]?.delta24h
            return bDelta - aDelta
          })
        } else {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            const aDelta = poolOHLCData[aId]?.delta24h
            const bDelta = poolOHLCData[bId]?.delta24h
            return aDelta - bDelta
          })
        }
      }

      if (poolFilterString && poolFilterString.trim().length > 0) {
        return list.filter((pool) => {
          const name0 = pool.name0.toLowerCase()
          const name1 = pool.name1.toLowerCase()
          const symbol0 = pool.symbol0.toLowerCase()
          const symbol1 = pool.symbol1.toLowerCase()
          const fee = pool.fee.toString()
          const filterString = poolFilterString.toLowerCase()

          return (
            name0.includes(filterString) ||
            name1.includes(filterString) ||
            fee.includes(filterString) ||
            symbol0.includes(filterString) ||
            symbol1.includes(filterString)
          )
        })
      }
      return list
    }

    return []
  }, [sortMethod, sortAscending, poolList, poolFilterString, poolOHLCData])
}

export function SelectPool() {
  const { chainId } = useWeb3React()

  const outputCurrency = useCurrentOutputCurrency()
  const inputCurrency = useCurrentInputCurrency()
  const currentPool = useCurrentPool()
  const poolKey = currentPool?.poolKey

  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, poolKey?.fee ?? undefined)

  const { result: poolData } = usePoolsData()
  const PoolsOHLC = useAppPoolOHLC()

  const baseQuoteSymbol = useMemo(() => {
    if (pool && PoolsOHLC) {
      const id = getPoolId(pool.token0.address, pool.token1.address, pool.fee)
      const base = PoolsOHLC[id]?.base

      if (!base) {
        const token0Price = new BN(pool.token0Price.toFixed(18))
        const priceData = PoolsOHLC[id]
        if (!priceData) return `${pool.token0.symbol}/${pool.token1.symbol}`
        const d1 = token0Price.minus(priceData.price24hAgo).abs()
        const d2 = new BN(1).div(token0Price).minus(priceData.price24hAgo).abs()
        if (d1.lt(d2)) {
          return `${pool.token0.symbol}/${pool.token1.symbol}`
        } else {
          return `${pool.token1.symbol}/${pool.token0.symbol}`
        }
      }

      if (base.toLowerCase() === pool.token0.address.toLowerCase()) {
        return `${pool.token0.symbol}/${pool.token1.symbol}`
      } else {
        return `${pool.token1.symbol}/${pool.token0.symbol}`
      }
    }
    return null
  }, [PoolsOHLC, pool])

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const filteredKeys = useFilteredKeys()

  return (
    <MainWrapper>
      <SelectPoolWrapper aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
        <LabelWrapper>
          <Row gap="10">
            <DoubleCurrencyLogo
              currency0={inputCurrency as Currency}
              currency1={outputCurrency as Currency}
              size={25}
            />
            <AutoColumn justify="flex-start">
              <TextWithLoadingPlaceholder width={50} syncing={!baseQuoteSymbol}>
                <ThemedText.HeadlineSmall fontSize={20} color="textTertiary">
                  {baseQuoteSymbol ? `${baseQuoteSymbol}` : ''}
                </ThemedText.HeadlineSmall>
              </TextWithLoadingPlaceholder>
              <ThemedText.BodySmall fontSize="16px" fontWeight={700} color="lavenderGray">({poolKey?.fee ? poolKey.fee / 10000 : 0}%)</ThemedText.BodySmall>
            </AutoColumn>
          </Row>
        </LabelWrapper>
        <ChevronIcon $rotated={open} />
      </SelectPoolWrapper>
      <PoolStatsSection
        poolData={poolData}
        chainId={chainId}
        address0={pool?.token0.address}
        address1={pool?.token1.address}
        fee={pool?.fee}
      />
      <StyledMenu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        style={{ position: 'absolute' }}
      >
        <PoolSearchBar />
        <PoolListContainer>
          <PoolListHeaderRow>
            <PoolListHeader style={{ marginLeft: '10px' }}>Pairs</PoolListHeader>
            <HeaderWrapper title={<Trans>Price</Trans>} sortMethod={PoolSortMethod.PRICE} />
            <HeaderWrapper title={<Trans>24h</Trans>} sortMethod={PoolSortMethod.DELTA} />
          </PoolListHeaderRow>
          {filteredKeys.length === 0 ? null : (
            <ListWrapper>
              {filteredKeys.map((poolKey) => {
                const id = `${poolKey.token0.toLowerCase()}-${poolKey.token1.toLowerCase()}-${poolKey.fee}`
                return <PoolSelectRow key={id} poolKey={poolKey} handleClose={handleClose} />
              })}
            </ListWrapper>
          )}
        </PoolListContainer>
      </StyledMenu>
    </MainWrapper>
  )
}

const formatBN = (n: BN) => {
  if (n.lt(0.0001)) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 7, minimumFractionDigits: 5 }).format(n.toNumber())
  } else if (n.lt(1)) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 6, minimumFractionDigits: 3 }).format(n.toNumber())
  } else {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(n.toNumber())
  }
}
