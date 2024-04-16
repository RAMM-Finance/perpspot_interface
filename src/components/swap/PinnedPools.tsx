import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { useCurrency } from 'hooks/Tokens'
import { usePool } from 'hooks/usePools'
import { useCallback, useMemo } from 'react'
import { usePoolOHLC } from 'state/application/hooks'
import { useMarginTradingActionHandlers } from 'state/marginTrading/hooks'
import { useCurrentPool, useRemovePinnedPool, useSetCurrentPool } from 'state/user/hooks'
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
  const { onPremiumCurrencyToggle, onMarginChange, onSetMarginInPosToken, onSetIsSwap } =
    useMarginTradingActionHandlers()

  const poolOHLCData = usePoolOHLC(poolKey.token0, poolKey.token1, poolKey.fee)
  const token0 = useCurrency(poolKey.token0)
  const token1 = useCurrency(poolKey.token1)

  const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, poolKey.fee)

  const id = getPoolId(poolKey?.token0, poolKey?.token1, poolKey?.fee)
  const delta = poolOHLCData?.delta24h

  const baseQuoteSymbol = useMemo(() => {
    if (!poolOHLCData || !token0?.symbol || !token1?.symbol) {
      return null
    }

    const base = poolOHLCData.token0IsBase ? token0?.symbol : token1?.symbol
    const quote = poolOHLCData.token0IsBase ? token1?.symbol : token0?.symbol
    return `${base}/${quote}`
  }, [poolOHLCData, token0?.symbol, token1?.symbol])

  const setCurrentPool = useSetCurrentPool()
  const currentPool = useCurrentPool()
  const poolId = currentPool?.poolId
  const remove = useRemovePinnedPool()

  const handleRowClick = useCallback(() => {
    if (token0 && token1 && poolId !== id && token0.symbol && token1.symbol && poolOHLCData) {
      onMarginChange('')
      onSetIsSwap(false)
      onPremiumCurrencyToggle(false)
      onSetMarginInPosToken(false)
      setCurrentPool(id, !poolOHLCData.token0IsBase, poolOHLCData.token0IsBase, token0.symbol, token1.symbol, false)
    }
  }, [
    token0,
    token1,
    setCurrentPool,
    poolId,
    id,
    onMarginChange,
    onSetIsSwap,
    onPremiumCurrencyToggle,
    onSetMarginInPosToken,
    poolOHLCData,
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

export function PinnedPools({ pinnedPools }: { pinnedPools: PoolKey[] }) {
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
