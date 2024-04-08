import { Trans } from '@lingui/macro'
import Menu from '@mui/material/Menu'
import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { PoolStatsSection, StatsSkeleton } from 'components/ExchangeChart/PoolStats'
import { TextWithLoadingPlaceholder } from 'components/modalFooters/common'
import { unsupportedChain } from 'components/NavBar/ChainSelector'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { useCurrency } from 'hooks/Tokens'
import { usePoolsData } from 'hooks/useLMTPools'
import { usePool } from 'hooks/usePools'
import { useAtomValue } from 'jotai/utils'
import { Row } from 'nft/components/Flex'
import { useCallback, useMemo, useState } from 'react'
import React from 'react'
import { ArrowDown, ArrowUp, ChevronDown, Star } from 'react-feather'
import { useAppPoolOHLC, usePoolKeyList, usePoolOHLC } from 'state/application/hooks'
import { setBLScrollPosition } from 'state/application/reducer'
import { useAppDispatch } from 'state/hooks'
import { useMarginTradingActionHandlers } from 'state/marginTrading/hooks'
import { useSwapActionHandlers } from 'state/swap/hooks'
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

import { ReactComponent as SelectLoadingBar } from '../../assets/images/selectLoading.svg'
import PoolSearchBar from './PoolSearchBar'
import {
  poolFilterStringAtom,
  poolSortAscendingAtom,
  PoolSortMethod,
  poolSortMethodAtom,
  useSetPoolSortMethod,
} from './state'

const PoolListHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr;
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
  // border: solid 2px ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 0.5rem;
  border-radius: 10px;
  gap: 0.25rem;
  width: 100%;
`

const ListWrapper = styled.div`
  width: 100%;
  overflow-y: auto;
  scrollbar-width: none;
  overscroll-behavior: none;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
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
  margin-left: 5px;
  max-width: 15px;
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
  border-width: 1px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.backgroundSurface};
  margin-bottom: 0.7rem;
  gap: 0.7rem;
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

const RowWrapper = styled.div<{ active: boolean }>`
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr;
  justify-items: flex-start;
  align-items: center;
  padding: 0.5rem;
  border-radius: 10px;
  background-color: ${({ theme, active }) => (active ? theme.backgroundInteractive : 'none')};
  :hover {
    border-radius: 10px;
    background-color: ${({ theme }) => theme.backgroundInteractive};
  }
  cursor: pointer;
  width: 100%;
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
  font-size: 12px;
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

const PoolSelectRow = ({ poolKey, handleClose }: { poolKey: PoolKey; handleClose: any }) => {
  const token0 = useCurrency(poolKey.token0)
  const token1 = useCurrency(poolKey.token1)

  const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, poolKey.fee)
  const { onPremiumCurrencyToggle, onMarginChange } = useMarginTradingActionHandlers()
  const { onSetMarginInPosToken, onActiveTabChange } = useSwapActionHandlers()

  const id = `${pool?.token0.wrapped.address.toLowerCase()}-${pool?.token1.wrapped.address.toLowerCase()}-${pool?.fee}`
  const poolOHLCData = usePoolOHLC(poolKey.token0, poolKey.token1, poolKey.fee)
  const delta = poolOHLCData?.delta24h

  // const { onPoolSelection } = useSwapActionHandlers()

  const [baseQuoteSymbol, token0IsBase] = useMemo(() => {
    if (pool && poolOHLCData) {
      const base = poolOHLCData?.base
      if (!base) {
        const priceData = poolOHLCData
        const token0Price = new BN(pool.token0Price.toFixed(18))
        const d1 = token0Price.minus(priceData.price24hAgo).abs()
        const d2 = new BN(1).div(token0Price).minus(priceData.price24hAgo).abs()
        if (d1.lt(d2)) {
          return [`${pool.token0.symbol}/${pool.token1.symbol}`, true]
        } else {
          return [`${pool.token1.symbol}/${pool.token0.symbol}`, false]
        }
      } else {
        if (base.toLowerCase() === pool.token0.address.toLowerCase()) {
          return [`${pool.token0.symbol}/${pool.token1.symbol}`, true]
        } else {
          return [`${pool.token1.symbol}/${pool.token0.symbol}`, false]
        }
      }
    }
    return [null, null]
  }, [poolOHLCData, pool])

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

  const currentPool = useCurrentPool()
  const poolId = currentPool?.poolId
  const setCurrentPool = useSetCurrentPool()
  const dispatch = useAppDispatch()

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

  const active = useMemo(() => {
    if (currentPool?.poolId === id) {
      return true
    } else {
      return false
    }
  }, [currentPool, id])

  const handleRowClick = useCallback(() => {
    if (token0 && token1 && poolId !== id && token0IsBase !== null && token0.symbol && token1.symbol) {
      localStorage.removeItem('defaultInputToken')
      onMarginChange('')
      onActiveTabChange(0)
      onPremiumCurrencyToggle(false)
      onSetMarginInPosToken(false)
      setCurrentPool(id, inputIsToken0, token0IsBase, token0.symbol, token1.symbol)
      handleClose()
      dispatch(setBLScrollPosition(undefined))
    }
  }, [
    token0,
    token1,
    onActiveTabChange,
    id,
    poolId,
    handleClose,
    inputIsToken0,
    setCurrentPool,
    onMarginChange,
    onPremiumCurrencyToggle,
    onSetMarginInPosToken,
    token0IsBase,
    dispatch,
  ])

  return (
    <RowWrapper active={active} onClick={handleRowClick}>
      <Row>
        <Pin onClick={handleClick}>{isPinned ? <FilledStar /> : <HollowStar />}</Pin>
        <PoolLabelWrapper>
          <ThemedText.LabelSmall fontSize={12}>{baseQuoteSymbol}</ThemedText.LabelSmall>
          <FeeWrapper>
            <ThemedText.BodyPrimary fontSize={10}>{pool?.fee ? `${pool?.fee / 10000}%` : ''}</ThemedText.BodyPrimary>
          </FeeWrapper>
        </PoolLabelWrapper>
      </Row>
      <ThemedText.BodyPrimary fontSize={12}>
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
  width: 28rem;
  & .MuiMenu-paper {
    border-radius: 10px;
    border: solid 1px ${({ theme }) => theme.backgroundOutline};
    background-color: ${({ theme }) => theme.backgroundSurface};
    width: 28rem;
    margin-top: 1rem;
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
            <ArrowUp size={16} strokeWidth={1.8} color={theme.accentActive} />
          ) : (
            <ArrowDown size={16} strokeWidth={1.8} color={theme.accentActive} />
          )}
        </>
      )}
    </PoolListHeader>
  )
}

function useFilteredKeys() {
  const sortMethod = useAtomValue(poolSortMethodAtom)
  const sortAscending = useAtomValue(poolSortAscendingAtom)

  const { poolList } = usePoolKeyList() // useRawPoolKeyList()

  // const pinnedPools = usePinnedPools()
  const poolFilterString = useAtomValue(poolFilterStringAtom)
  const poolOHLCData = useAppPoolOHLC()
  const { chainId } = useWeb3React()

  return useMemo(() => {
    if (poolList && poolList.length > 0 && chainId && poolOHLCData[chainId]) {
      let list = [...poolList]
      if (sortMethod === PoolSortMethod.PRICE) {
        list = list.filter((pool) => {
          const id = getPoolId(pool.token0, pool.token1, pool.fee)
          return !!poolOHLCData[chainId][id]
        })
        if (sortAscending) {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            const aPrice = poolOHLCData[chainId][aId]?.priceNow
            const bPrice = poolOHLCData[chainId][bId]?.priceNow
            return bPrice - aPrice
          })
        } else {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            const aPrice = poolOHLCData[chainId][aId]?.priceNow
            const bPrice = poolOHLCData[chainId][bId]?.priceNow
            return aPrice - bPrice
          })
        }
      } else if (sortMethod === PoolSortMethod.DELTA) {
        if (sortAscending) {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            const aDelta = poolOHLCData[chainId][aId]?.delta24h
            const bDelta = poolOHLCData[chainId][bId]?.delta24h
            return bDelta - aDelta
          })
        } else {
          list.sort((a, b) => {
            const aId = getPoolId(a.token0, a.token1, a.fee)
            const bId = getPoolId(b.token0, b.token1, b.fee)
            const aDelta = poolOHLCData[chainId][aId]?.delta24h
            const bDelta = poolOHLCData[chainId][bId]?.delta24h
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
  }, [sortMethod, sortAscending, poolList, poolFilterString, poolOHLCData, chainId])
}

export function SelectPool() {
  const { chainId } = useWeb3React()

  const outputCurrency = useCurrentOutputCurrency()
  const inputCurrency = useCurrentInputCurrency()
  const currentPool = useCurrentPool()

  const poolKey = currentPool?.poolKey
  const { result: poolData } = usePoolsData()

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const baseQuoteSymbol = useMemo(() => {
    if (currentPool) {
      const base = currentPool.token0IsBase ? currentPool.token0Symbol : currentPool.token1Symbol
      const quote = currentPool.token0IsBase ? currentPool.token1Symbol : currentPool.token0Symbol
      return `${base}/${quote}`
    }
    return null
  }, [currentPool])

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // const poolMenuLoading = inputCurrency && outputCurrency && poolKey && poolData && PoolsOHLC
  const filteredKeys = useFilteredKeys()

  if (!chainId || unsupportedChain(chainId)) {
    return (
      <MainWrapper>
        <SelectPoolWrapper aria-controls="simple-menu" aria-haspopup="true" onClick={() => {}}>
          <>
            <LabelWrapper>
              <Row gap="10">
                {inputCurrency && outputCurrency && (
                  <DoubleCurrencyLogo
                    currency0={inputCurrency as Currency}
                    currency1={outputCurrency as Currency}
                    size={20}
                  />
                )}
                <AutoColumn justify="flex-start">
                  <TextWithLoadingPlaceholder width={50} syncing={false}>
                    <Row gap="6">
                      <ThemedText.HeadlineSmall fontSize={16}>Select Pair</ThemedText.HeadlineSmall>
                    </Row>
                  </TextWithLoadingPlaceholder>
                </AutoColumn>
              </Row>
            </LabelWrapper>
            <ChevronIcon $rotated={false} />
          </>
        </SelectPoolWrapper>

        <StatsSkeleton />
      </MainWrapper>
    )
  }

  return (
    <MainWrapper>
      <SelectPoolWrapper aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
        {baseQuoteSymbol ? (
          <>
            <LabelWrapper>
              <Row gap="10">
                {inputCurrency && outputCurrency && (
                  <DoubleCurrencyLogo
                    currency0={inputCurrency as Currency}
                    currency1={outputCurrency as Currency}
                    size={20}
                  />
                )}
                <AutoColumn justify="flex-start">
                  <TextWithLoadingPlaceholder width={50} syncing={!baseQuoteSymbol}>
                    <Row gap="6">
                      <ThemedText.HeadlineSmall fontSize={16}>
                        {baseQuoteSymbol ? `${baseQuoteSymbol}` : ''}
                      </ThemedText.HeadlineSmall>
                      <ThemedText.BodySmall fontSize="12px">
                        ({poolKey?.fee ? poolKey.fee / 10000 : 0}%)
                      </ThemedText.BodySmall>
                    </Row>
                  </TextWithLoadingPlaceholder>
                </AutoColumn>
              </Row>
            </LabelWrapper>
            <ChevronIcon $rotated={open} />
          </>
        ) : (
          <PoolSelectLoading />
        )}
      </SelectPoolWrapper>
      <PoolStatsSection
        poolData={poolData}
        chainId={chainId}
        address0={poolKey?.token0}
        address1={poolKey?.token1}
        fee={poolKey?.fee}
      />
      <StyledMenu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        style={{ position: 'absolute' }}
        marginThreshold={0}
      >
        <PoolSearchBar />
        <PoolListContainer>
          <PoolListHeaderRow>
            <PoolListHeader style={{ marginLeft: '40px' }}>Pairs</PoolListHeader>
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
