import { BigNumber as BN } from 'bignumber.js'
import { useCurrency } from 'hooks/Tokens'
import { usePool } from 'hooks/usePools'
import { useCallback, useMemo } from 'react'
import { useAppPoolOHLC } from 'state/application/hooks'
import { useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import { usePinnedPools, useRemovePinnedPool } from 'state/user/hooks'
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
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 10px;
  overflow-x: auto;
`

const ItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  width: fit-content;
  margin-right: 0.5rem;
`

const PoolLabelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
`

const StarWrapper = styled.div`
  display: flex;
`

const DeltaText = styled.span<{ delta: number | undefined }>`
  color: ${({ theme, delta }) =>
    delta !== undefined ? (Math.sign(delta) < 0 ? theme.accentFailure : theme.accentSuccess) : theme.textPrimary};
`

const PinnedPool = ({ poolKey }: { poolKey: PoolKey }) => {
  const poolOHLCDatas = useAppPoolOHLC()
  const token0 = useCurrency(poolKey.token0)
  const token1 = useCurrency(poolKey.token1)
  const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, poolKey.fee)
  const id = `${poolKey.token0.toLowerCase()}-${poolKey.token1.toLowerCase()}-${poolKey.fee}`
  const poolOHLCData = poolOHLCDatas[id]
  const delta = poolOHLCData?.delta24h
  const baseQuoteSymbol = useMemo(() => {
    if (pool && poolOHLCData) {
      const token0Price = new BN(pool.token0Price.toFixed(18))
      const geckoPrice = new BN(poolOHLCData.priceNow)
      const d1 = token0Price.minus(geckoPrice).abs()
      const d2 = new BN(1).div(token0Price).minus(geckoPrice).abs()
      if (d1.lt(d2)) {
        return `${pool.token0?.symbol}/${pool.token1?.symbol}`
      }
      return `${pool.token1?.symbol}/${pool.token0?.symbol}`
    }
    return null
  }, [pool, poolOHLCData])

  const { onPoolSelection } = useSwapActionHandlers()
  const { poolId } = useSwapState()
  const remove = useRemovePinnedPool()

  const handleRowClick = useCallback(() => {
    if (token0 && token1 && poolId !== id) {
      onPoolSelection(token0, token1, poolKey)
    }
  }, [token0, token1, poolKey, onPoolSelection, poolId, id])

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
        <ThemedText.DeprecatedLabel>{baseQuoteSymbol}</ThemedText.DeprecatedLabel>
        <ThemedText.LabelSmall>{pool?.fee}%</ThemedText.LabelSmall>
      </PoolLabelWrapper>
      <DeltaText delta={delta}>{delta !== undefined ? `${(delta * 100).toFixed(2)}%` : 'N/A'}</DeltaText>
    </ItemWrapper>
  )
}

export function PinnedPools() {
  const pinnedPools = usePinnedPools()
  return (
    <Wrapper>
      {pinnedPools?.map((poolKey) => {
        const id = `${poolKey.token0.toLowerCase()}-${poolKey.token1.toLowerCase()}-${poolKey.fee}`
        return <PinnedPool key={id} poolKey={poolKey} />
      })}
    </Wrapper>
  )
}
