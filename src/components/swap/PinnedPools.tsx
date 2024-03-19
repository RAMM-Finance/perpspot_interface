import { BigNumber as BN } from 'bignumber.js'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { useCurrency } from 'hooks/Tokens'
import { usePool } from 'hooks/usePools'
import { useCallback, useMemo } from 'react'
import { useAppPoolOHLC } from 'state/application/hooks'
import { useCurrentPool, usePinnedPools, useRemovePinnedPool, useSetCurrentPool } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { PoolKey } from 'types/lmtv2position'

import { FilledStar } from './PoolSelect'
// import { RawPoolKey } from 'types/lmtv2position'

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  /* border: solid 1px ${({ theme }) => theme.backgroundOutline}; */
  border: 1px solid #303045;
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

  const id = getPoolId(poolKey?.token0, poolKey?.token1, poolKey?.fee)
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

  // const { onPoolSelection } = useSwapActionHandlers()
  const setCurrentPool = useSetCurrentPool()
  const currentPool = useCurrentPool()
  const poolId = currentPool?.poolId
  const remove = useRemovePinnedPool()

  const inputIsToken0 = poolOHLCData?.base?.toLowerCase() === poolKey.token0.toLowerCase()

  const handleRowClick = useCallback(() => {
    if (token0 && token1 && poolId !== id) {
      setCurrentPool(id, inputIsToken0)
    }
  }, [token0, token1, setCurrentPool, inputIsToken0, poolId, id])

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
