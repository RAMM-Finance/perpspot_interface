import { NumberType } from '@uniswap/conedison/format'
import { Currency } from '@uniswap/sdk-core'
import { computePoolAddress } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { getInvertPrice, V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { useCurrency } from 'hooks/Tokens'
import { useLatestPoolPriceData } from 'hooks/usePoolPriceData'
import { usePool } from 'hooks/usePools'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useMemo } from 'react'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const Container = styled.button<{ disabled: boolean; active: boolean }>`
  background: ${({ theme, active }) => (active ? theme.accentActiveSoft : 'none')};
  border: none;
  border-radius: 5px;
  color: ${({ theme, active }) => (active ? theme.textSecondary : theme.textPrimary)};
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  display: grid;
  grid-template-columns: 2.4fr 0.8fr 1fr;
  line-height: 10px;
  align-items: center;
  padding: 3px;

  margin-bottom: 5px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  text-align: left;
  transition: ${({ theme }) => theme.transition.duration.medium} ${({ theme }) => theme.transition.timing.ease}
    background-color;
  width: 100%;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    width: 100%;
  }

  &:hover {
    background-color: ${({ disabled, theme }) => (disabled ? 'none' : theme.backgroundOutline)};
  }
`

const Label = styled.div`
  font-size: 12px;
  margin-left: 5px;
  width: 8rem;
`

interface PoolSelectorRowProps {
  currencyId: string[]
  tvl?: number
  volume?: number
  onCurrencySelect: (currencyIn: Currency, currencyOut: Currency, fee: number) => void
  fee: number
  chainId: number | undefined
  closeModal?: (close: boolean) => void
}

function PoolSelectRow({ onCurrencySelect, currencyId, fee, chainId, closeModal }: PoolSelectorRowProps) {
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const baseCurrency = useCurrency(currencyId[0])
  const quoteCurrency = useCurrency(currencyId[1])

  const [token0, token1] =
    baseCurrency && quoteCurrency && quoteCurrency?.wrapped.sortsBefore(baseCurrency?.wrapped)
      ? [baseCurrency, quoteCurrency]
      : [quoteCurrency, baseCurrency]
  const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, fee)

  const labelIn = token0?.symbol as string
  const labelOut = token1?.symbol as string
  const active = token0?.wrapped.address === inputCurrencyId && token1?.wrapped.address === outputCurrencyId
  const poolAddress = useMemo(() => {
    if (!pool || !chainId) return null
    return computePoolAddress({
      factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
      tokenA: pool.token0,
      tokenB: pool.token1,
      fee: pool.fee,
    })
  }, [chainId, pool])
  const { data: priceData } = useLatestPoolPriceData(poolAddress ?? undefined)
  // const priceData = undefined as any
  // const token0Decimals = pool?.token0?.decimals
  // const token1Decimals = pool?.token1?.decimals
  // const { provider } = useWeb3React()
  // const { data: token0Price } = useQuery(
  //   ['currentPrice', poolAddress, token0Decimals, token1Decimals],
  //   async () => {
  //     if (!poolAddress) throw new Error('No pool address')
  //     if (!token1Decimals) throw new Error('No token1 decimals')
  //     if (!token0Decimals) throw new Error('No token0 decimals')
  //     if (!provider) throw new Error('provider')
  //     return await getToken0Price(poolAddress, token0Decimals, token1Decimals, provider)
  //   },
  //   {
  //     keepPreviousData: true,
  //     refetchInterval: 1000 * 20,
  //   }
  // )

  const [currentPrice, delta] = useMemo(() => {
    if (!priceData || !pool) return [undefined, undefined]

    const invertPrice = getInvertPrice(pool.token0.address, pool.token1.address, chainId)
    const token0Price = new BN(pool.token0Price.toFixed(18))
    const price = invertPrice ? new BN(1).div(token0Price) : token0Price

    const price24hAgo = priceData.price24hAgo
    const delt = price.minus(price24hAgo).div(price).times(100)
    return [price, delt]
  }, [chainId, priceData, pool])

  return (
    <Container
      disabled={false}
      active={active}
      onClick={() => {
        token0 && token1 && pool?.fee && onCurrencySelect(token0, token1, pool.fee)
        closeModal && closeModal(false)
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <DoubleCurrencyLogo currency0={token0 as Currency} currency1={token1 as Currency} size={20} margin />
        <Label style={{ display: 'flex', gap: '2px' }}>
          <ThemedText.BodySmall color="textSecondary" fontWeight={800}>
            {labelIn}
          </ThemedText.BodySmall>
          /<ThemedText.BodySmall fontWeight={800}>{labelOut}</ThemedText.BodySmall>
          <ThemedText.BodySmall fontSize="10px">({fee / 10000}%)</ThemedText.BodySmall>
        </Label>
      </div>

      <ThemedText.BodySmall>
        <DeltaText delta={delta?.toNumber()}>
          {delta ? formatBNToString(delta?.abs() ?? undefined, NumberType.TokenNonTx) + '%' : '-'}
        </DeltaText>
      </ThemedText.BodySmall>
      <ThemedText.BodySmall>{formatBNToString(currentPrice, NumberType.FiatTokenPrice, true)}</ThemedText.BodySmall>
    </Container>
  )
}

export default PoolSelectRow
