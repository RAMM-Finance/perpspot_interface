import { BigNumber as BN } from 'bignumber.js'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { useCurrency } from 'hooks/Tokens'
import { usePool } from 'hooks/usePools'
import { useCallback, useMemo } from 'react'
import { useAppPoolOHLC } from 'state/application/hooks'
import { useMarginTradingActionHandlers } from 'state/marginTrading/hooks'
import { useSwapActionHandlers } from 'state/swap/hooks'
import { useCurrentPool, usePinnedPools, useRemovePinnedPool, useSetCurrentPool } from 'state/user/hooks'
import styled from 'styled-components'
import { ThemedText } from 'theme'
import { PoolKey } from 'types/lmtv2position'

import { FilledStar } from './PoolSelect'
// import { RawPoolKey } from 'types/lmtv2position'

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  border-radius: 10px;
  overflow-x: auto;
  align-items: start;
`

const ItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: start;
  justify-content: space-between;
  padding: 0.2rem 1rem;
  width: fit-content;
  margin-right: 0.5rem;
  height: 100%;
`

const PoolLabelWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`

const StarWrapper = styled.div`
  display: flex;
  cursor: pointer;
`

const DeltaText = styled.span<{ delta: number | undefined }>`
  margin-top: 1px;
  font-size: 12px;
  color: ${({ theme, delta }) =>
    delta !== undefined ? (Math.sign(delta) < 0 ? theme.accentFailure : theme.accentSuccess) : theme.textPrimary};
`

const PinnedPool = ({ poolKey }: { poolKey: PoolKey }) => {
  const { onPremiumCurrencyToggle, onMarginChange } = useMarginTradingActionHandlers()
  const { onSetMarginInPosToken, onActiveTabChange } = useSwapActionHandlers()
  const poolOHLCDatas = useAppPoolOHLC()
  const token0 = useCurrency(poolKey.token0)
  const token1 = useCurrency(poolKey.token1)

  const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, poolKey.fee)

  const id = getPoolId(poolKey?.token0, poolKey?.token1, poolKey?.fee)
  const poolOHLCData = poolOHLCDatas[id]
  const delta = poolOHLCData?.delta24h
  const [baseQuoteSymbol, token0IsBase] = useMemo(() => {
    if (pool && poolOHLCData) {
      const token0Price = new BN(pool.token0Price.toFixed(18))
      const geckoPrice = new BN(poolOHLCData.priceNow)
      const d1 = token0Price.minus(geckoPrice).abs()
      const d2 = new BN(1).div(token0Price).minus(geckoPrice).abs()
      if (d1.lt(d2)) {
        return [`${pool.token0?.symbol}/${pool.token1?.symbol}`, true]
      }
      return [`${pool.token1?.symbol}/${pool.token0?.symbol}`, false]
    }
    return [null, null]
  }, [pool, poolOHLCData])

  const setCurrentPool = useSetCurrentPool()
  const currentPool = useCurrentPool()
  const poolId = currentPool?.poolId
  const remove = useRemovePinnedPool()

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
    if (token0 && token1 && poolId !== id && token0.symbol && token1.symbol && token0IsBase !== null) {
      onMarginChange('')
      onActiveTabChange(0)
      onPremiumCurrencyToggle(false)
      onSetMarginInPosToken(false)
      setCurrentPool(id, inputIsToken0, token0IsBase, token0.symbol, token1.symbol)
    }
  }, [
    token0,
    token1,
    setCurrentPool,
    inputIsToken0,
    poolId,
    id,
    onMarginChange,
    onActiveTabChange,
    onPremiumCurrencyToggle,
    onSetMarginInPosToken,
    token0IsBase,
  ])

  const unpinPool = useCallback(
    (e: any) => {
      e.stopPropagation()
      remove(poolKey)
    },
    [poolKey, remove]
  )

  if (!pool || !baseQuoteSymbol) return null
  return (
    <ItemWrapper onClick={handleRowClick}>
      <StarWrapper onClick={unpinPool} style={{ marginRight: '8px' }}>
        <FilledStar />
      </StarWrapper>
      <PoolLabelWrapper style={{ marginRight: '8px' }}>
        <ThemedText.DeprecatedLabel fontSize="14px" color="textSecondary">
          {baseQuoteSymbol}
        </ThemedText.DeprecatedLabel>
        <ThemedText.LabelSmall fontSize="12px" color="textPrimary">
          {pool?.fee / 10000}%
        </ThemedText.LabelSmall>
      </PoolLabelWrapper>
      <DeltaText delta={delta}>{delta !== undefined ? `${(delta * 100).toFixed(2)}%` : 'N/A'}</DeltaText>
    </ItemWrapper>
  )
}

export function PinnedPools() {
  const pinnedPools = usePinnedPools()
  return (
    <PinnedWrapper>
      <TitleWrapper>
        <ThemedText.DeprecatedLabel fontSize="14px" color="textSecondary">
          Pinned Pools
        </ThemedText.DeprecatedLabel>
      </TitleWrapper>
      <Wrapper>
        {pinnedPools?.map((poolKey) => {
          const id = `${poolKey.token0.toLowerCase()}-${poolKey.token1.toLowerCase()}-${poolKey.fee}`
          return <PinnedPool key={id} poolKey={poolKey} />
        })}
      </Wrapper>
    </PinnedWrapper>
  )
}

const PinnedWrapper = styled.div`
  display: flex;
  align-items: center;
`

const TitleWrapper = styled.div`
  min-width: 120px;
  margin-left: 10px;
`
