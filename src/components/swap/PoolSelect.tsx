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
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { TokenStatus, TokenStatusKey } from 'constants/newOrHot'
import { useCurrency } from 'hooks/Tokens'
import { usePoolsTVLandVolume } from 'hooks/useLMTPools'
import { useEstimatedAPR, usePool } from 'hooks/usePools'
import { getPoolAddress } from 'hooks/usePoolsOHLC'
import { useAllPoolAndTokenPriceData, usePoolPriceData } from 'hooks/useUserPriceData'
import { useAtomValue } from 'jotai'
import { Row } from 'nft/components/Flex'
import { darken } from 'polished'
import { useCallback, useMemo, useState } from 'react'
import React from 'react'
import { ChevronDown, ChevronUp, Star } from 'react-feather'
import { usePoolKeyList, usePoolsAprUtilList } from 'state/application/hooks'
import { useAddPinnedPool, usePinnedPools, useRemovePinnedPool } from 'state/lists/hooks'
import { useMarginTradingActionHandlers } from 'state/marginTrading/hooks'
import { useCurrentPool, useSetCurrentPool } from 'state/user/hooks'
import styled, { keyframes, useTheme } from 'styled-components/macro'
import { BREAKPOINTS, ThemedText } from 'theme'
import { PoolKey } from 'types/lmtv2position'
import { useChainId } from 'wagmi'

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
  max-height: 60vh;
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

const PoolSelectRow = ({
  poolKey,
  handleClose,
}: {
  poolKey: PoolKey
  handleClose: any
  addPinnedPool: (i: PoolKey) => void
  removePinnedPool: (i: PoolKey) => void
  pinnedPools: PoolKey[]
}) => {
  const token0 = useCurrency(poolKey.token0)
  const token1 = useCurrency(poolKey.token1)
  const addPinnedPool = useAddPinnedPool()
  const removePinnedPool = useRemovePinnedPool()
  const pinnedPools = usePinnedPools()
  const {
    onPremiumCurrencyToggle,
    onMarginChange,
    onLeverageFactorChange,
    onSetMarginInPosToken,
    onSetIsSwap,
    onEstimatedDurationChange,
  } = useMarginTradingActionHandlers()

  const id = `${poolKey.token0.toLowerCase()}-${poolKey.token1.toLowerCase()}-${poolKey.fee}`

  const { data: poolOHLCData } = usePoolPriceData(poolKey.token0, poolKey.token1, poolKey.fee)
  const delta = poolOHLCData?.delta24h

  const chainId = useChainId()

  const baseQuoteSymbol = useMemo(() => {
    if (!poolOHLCData || !token0?.symbol || !token1?.symbol || !chainId) return null

    const base = poolOHLCData.token0IsBase ? token0.symbol : token1.symbol
    const quote = poolOHLCData.token0IsBase ? token1.symbol : token0.symbol
    return `${base}/${quote}`
  }, [poolOHLCData, token0, token1, chainId])

  const isPinned = useMemo(() => {
    return pinnedPools.some((p) => {
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

  const active = useMemo(() => {
    if (currentPool?.poolId === id) {
      return true
    } else {
      return false
    }
  }, [currentPool, id])

  const handleRowClick = useCallback(() => {
    if (token0 && token1 && poolId !== id && poolOHLCData && token0.symbol && token1.symbol && chainId) {
      localStorage.removeItem('defaultInputToken')
      onMarginChange('')
      onSetIsSwap(false)
      onPremiumCurrencyToggle(false)
      onSetMarginInPosToken(false)
      onLeverageFactorChange('')
      onEstimatedDurationChange('')
      setCurrentPool(id, !poolOHLCData.token0IsBase, poolOHLCData.token0IsBase, token0.symbol, token1.symbol)
      handleClose()
    }
  }, [
    token0,
    token1,
    onSetIsSwap,
    id,
    poolId,
    handleClose,
    setCurrentPool,
    onMarginChange,
    onPremiumCurrencyToggle,
    onSetMarginInPosToken,
    poolOHLCData,
    chainId,
    onLeverageFactorChange,
    onEstimatedDurationChange,
  ])

  return (
    <RowWrapper active={active} onClick={handleRowClick}>
      <Row>
        <Pin onClick={handleClick}>{isPinned ? <FilledStar /> : <HollowStar />}</Pin>
        <PoolLabelWrapper>
          <ThemedText.LabelSmall fontSize={12}>{baseQuoteSymbol}</ThemedText.LabelSmall>
          <FeeWrapper>
            <ThemedText.BodyPrimary fontSize={10}>
              {poolKey.fee ? `${poolKey.fee / 10000}%` : ''}
            </ThemedText.BodyPrimary>
          </FeeWrapper>
          {token0?.symbol &&
            token1?.symbol &&
            (TokenStatus[token0.symbol as TokenStatusKey] === 'New' ||
            TokenStatus[token1.symbol as TokenStatusKey] === 'New' ? (
              <NewOrHotWrapper>
                <NewOrHotStatusText fontWeight={600} paddingBottom="10px">
                  {TokenStatus[token0.symbol as TokenStatusKey] || TokenStatus[token1.symbol as TokenStatusKey]}
                </NewOrHotStatusText>
              </NewOrHotWrapper>
            ) : (
              <NewOrHotStatusText fontWeight={600} paddingBottom="2px" fontSize={14}>
                {TokenStatus[token0.symbol as TokenStatusKey] || TokenStatus[token1.symbol as TokenStatusKey]}
              </NewOrHotStatusText>
            ))}
        </PoolLabelWrapper>
      </Row>
      <ThemedText.BodyPrimary fontSize={12}>
        {poolOHLCData?.priceNow
          ? poolOHLCData.priceNow < 1
            ? poolOHLCData.priceNow.toFixed(10)
            : poolOHLCData.priceNow.toFixed(4)
          : ''}
        {/* formatBNToString(new BN(poolOHLCData.priceNow), NumberType.FiatGasPrice, true) : ''} */}
      </ThemedText.BodyPrimary>
      <DeltaText delta={delta}>{delta !== undefined ? `${delta.toFixed(2)}%` : 'N/A'}</DeltaText>
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
  @media only screen and (max-width: ${BREAKPOINTS.sm}px) {
    width: 27.5rem;
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

function checkFilterString(pool: any, str: string[]): boolean {
  return str.every((x: string) => {
    x = x.trim().toLowerCase()
    // const name0 = pool.name0.toLowerCase()
    // const name1 = pool.name1.toLowerCase()
    const symbol0 = pool.symbol0.toLowerCase()
    const symbol1 = pool.symbol1.toLowerCase()
    const fee = pool.fee.toString()
    return fee.includes(x) || symbol0.includes(x) || symbol1.includes(x)
  })
}

function useFilteredKeys() {
  const sortMethod = useAtomValue(poolSortMethodAtom)
  const sortAscending = useAtomValue(poolSortAscendingAtom)

  const { poolList } = usePoolKeyList()
  const poolFilterString = useAtomValue(poolFilterStringAtom)
  const { pools: poolOHLCData } = useAllPoolAndTokenPriceData()
  const chainId = useChainId()

  return useMemo(() => {
    if (poolList && poolList.length > 0 && chainId && poolOHLCData) {
      let list = [...poolList]
      if (sortMethod === PoolSortMethod.PRICE) {
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
      } else if (sortMethod === PoolSortMethod.DELTA) {
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
  }, [sortMethod, sortAscending, poolList, poolFilterString, poolOHLCData, chainId])
}

const DropdownMenu = ({
  anchorEl,
  handleClose,
  open,
}: {
  anchorEl?: Element
  open: boolean
  handleClose: () => void
}) => {
  const addPinnedPool = useAddPinnedPool()
  const removePinnedPool = useRemovePinnedPool()
  const pinnedPools = usePinnedPools()
  const filteredKeys = useFilteredKeys()

  return (
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
              return (
                <PoolSelectRow
                  key={id}
                  poolKey={poolKey}
                  handleClose={handleClose}
                  addPinnedPool={addPinnedPool}
                  removePinnedPool={removePinnedPool}
                  pinnedPools={pinnedPools}
                />
              )
            })}
          </ListWrapper>
        )}
      </PoolListContainer>
    </StyledMenu>
  )
}

function SelectPool() {
  const chainId = useChainId()

  const currentPool = useCurrentPool()

  const poolKey = currentPool?.poolKey
  const poolId = currentPool?.poolId
  const { result: poolData, loading: loading } = usePoolsTVLandVolume()

  const token0 = useCurrency(poolKey?.token0 ?? null)
  const token1 = useCurrency(poolKey?.token1 ?? null)

  const [, pool, tickSpacing] = usePool(token0 ?? undefined, token1 ?? undefined, poolKey?.fee ?? undefined)

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
    if (!aprPoolList || !poolId || aprPoolList) return undefined
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

  const estimatedAPR = useEstimatedAPR(token0, token1, pool, tickSpacing, priceInverted, depositAmountUSD)

  if (chainId && unsupportedChain(chainId)) {
    return (
      <MainWrapper>
        <SelectPoolWrapper aria-controls="simple-menu" aria-haspopup="true" onClick={() => {}}>
          <>
            <LabelWrapper>
              <Row gap="10">
                {/* {baseCurrency && quoteCurrency && (
                  <DoubleCurrencyLogo
                    currency0={baseCurrency as Currency}
                    currency1={quoteCurrency as Currency}
                    size={40}
                  />
                )} */}
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

  return (
    <>
      {showModal && (
        <ZapModal
          isOpen={showModal}
          onClose={handleCloseModal}
          apr={apr !== undefined ? apr + estimatedAPR : undefined}
          tvl={(poolData && poolId && poolData[poolId]?.totalValueLocked) || undefined}
          token0={token0}
          token1={token1}
          poolKey={poolKey}
        />
      )}
      <MainWrapper>
        <SelectPoolWrapper aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
          {baseQuoteSymbol ? (
            <>
              <LabelWrapper>
                <Row gap="10">
                  {baseCurrency && quoteCurrency && (
                    <DoubleCurrencyLogo
                      currency0={baseCurrency as Currency}
                      currency1={quoteCurrency as Currency}
                      size={25}
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
                        {token0?.symbol &&
                          token1?.symbol &&
                          (TokenStatus[token0.symbol as TokenStatusKey] === 'New' ||
                          TokenStatus[token1.symbol as TokenStatusKey] === 'New' ? (
                            <NewOrHotStatusText fontWeight={600} paddingBottom="10">
                              {TokenStatus[token0.symbol as TokenStatusKey] ||
                                TokenStatus[token1.symbol as TokenStatusKey]}
                            </NewOrHotStatusText>
                          ) : (
                            <NewOrHotStatusText fontWeight={600} paddingBottom="5px" fontSize={14}>
                              {TokenStatus[token0.symbol as TokenStatusKey] ||
                                TokenStatus[token1.symbol as TokenStatusKey]}
                            </NewOrHotStatusText>
                          ))}
                      </Row>
                    </TextWithLoadingPlaceholder>
                  </AutoColumn>
                </Row>
              </LabelWrapper>
              <ChevronIcon $rotated={open} size={30} />
            </>
          ) : (
            <PoolSelectLoading />
          )}
        </SelectPoolWrapper>
        <EarnButton onClick={handleZap}>Zap In</EarnButton>
        <PoolStatsSection
          poolData={poolData}
          chainId={chainId}
          address0={poolKey?.token0}
          address1={poolKey?.token1}
          fee={poolKey?.fee}
          poolLoading={loading}
        />
        {open && <DropdownMenu anchorEl={anchorEl ?? undefined} handleClose={handleClose} open={open} />}
      </MainWrapper>
    </>
  )
}

export default React.memo(SelectPool)
