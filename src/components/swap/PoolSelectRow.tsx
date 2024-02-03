import { NumberType } from '@uniswap/conedison/format'
import { Currency } from '@uniswap/sdk-core'
import { computePoolAddress } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
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
  onCurrencySelect: (currencyIn: Currency, currencyOut: Currency) => void
  fee: number
  chainId: number | undefined
  closeModal?: (close: boolean) => void
}

function PoolSelectRow({ onCurrencySelect, currencyId, fee, chainId, closeModal }: PoolSelectorRowProps) {
  // const { chainId } = useWeb3React()
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
  // const decimal = useMemo(() => {
  //   if (token1?.wrapped.symbol === 'wBTC' && token0?.wrapped.symbol === 'WETH') {
  //     return 10
  //   } else if (token1?.wrapped.symbol === 'WETH' && token0?.wrapped.symbol === 'USDC') {
  //     return -12
  //   } else if (token1?.wrapped.symbol === 'wBTC' && token0?.wrapped.symbol === 'USDC') {
  //     return -2
  //   } else {
  //     return 0
  //   }
  // }, [token0, token1])
  // const currentPrice = (Number(pool?.sqrtRatioX96) ** 2 / 2 ** 192 / Number(`1e${decimal}`)).toFixed(1)
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

  const currentPricePool = useMemo(() => {
    if (!pool || priceData) return undefined
    const token0 = pool.token0
    const token1 = pool.token1
    let price = new BN(Number(pool.token0Price.quotient.toString()))
    if (price.toString() == '0') price = new BN(Number(pool.token1Price.quotient.toString()))
    if (token0?.wrapped.symbol === 'wBTC' && token1?.wrapped.symbol === 'WETH') {
      // return price.div( new BN( 10** (token1?.wrapped.decimals - token0?.wrapped.decimals)))
      return new BN(1).div(price.div(new BN(10 ** (token1?.wrapped.decimals - token0?.wrapped.decimals))))
    } else if (token0?.wrapped.symbol === 'WETH' && token1?.wrapped.symbol === 'USDC') {
      return new BN(1).div(price.div(new BN(10 ** (token0?.wrapped.decimals - token1?.wrapped.decimals))))
    } else if (token0?.wrapped.symbol === 'wBTC' && token1?.wrapped.symbol === 'USDC') {
      return price.div(new BN(10 ** (token1?.wrapped.decimals - token0?.wrapped.decimals)))
    } else if (token0?.wrapped.symbol === 'WETH' && token1?.wrapped.symbol === 'ARB') {
      return price
    } else if (token0?.wrapped.symbol === 'LDO' && token1?.wrapped.symbol === 'WETH') {
      return price
    } else {
      return new BN(1).div(price.div(new BN(10 ** (token1?.wrapped.decimals - token0?.wrapped.decimals))))
    }
  }, [priceData, pool])

  const [currPrice, delta] = useMemo(() => {
    if (!priceData) return [undefined, undefined]
    let price = priceData.priceNow
    let invertPrice = false //price.lt(1)
    if (
      pool?.token0.address.toLowerCase() == '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'.toLowerCase() &&
      pool?.token1.address.toLowerCase() == '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'.toLowerCase()
    )
      invertPrice = false

    let delt
    const price24hAgo = new BN(1).div(priceData.price24hAgo)
    if (invertPrice) {
      price = new BN(1).div(price)
      delt = price.minus(price24hAgo).div(price).times(100)
    } else {
      delt = price.minus(priceData.price24hAgo).div(price).times(100)
    }
    return [price, delt]
  }, [priceData, pool])

  return (
    // <MouseoverTooltip
    //   text={
    //     <div style={{ display: 'flex', gap: '5px' }}>
    //       <ThemedText.BodySmall color="textPrimary">TVL:</ThemedText.BodySmall>
    //       <ThemedText.BodySmall color="textSecondary">{formatDollar({ num: tvl, digits: 0 })}</ThemedText.BodySmall>
    //       <ThemedText.BodySmall color="textPrimary">Volume:</ThemedText.BodySmall>
    //       <ThemedText.BodySmall color="textSecondary">
    //         {formatDollar({ num: volume, digits: 0 })}
    //       </ThemedText.BodySmall>
    //     </div>
    //   }
    // >
    <Container
      disabled={false}
      active={active}
      onClick={() => {
        token0 && token1 && onCurrencySelect(token0, token1)
        closeModal && closeModal(false)
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <DoubleCurrencyLogo currency0={token0 as Currency} currency1={token1 as Currency} size={20} margin />
        <Label style={{ display: 'flex', gap: '2px' }}>
          <ThemedText.BodySmall color="textSecondary" fontWeight={800}>
            {labelIn}
          </ThemedText.BodySmall>
          {/*/<ThemedText.BodySmall fontWeight={800}>{labelOut + `(${fee / 10000}%)`}</ThemedText.BodySmall>*/}/
          <ThemedText.BodySmall fontWeight={800}>{labelOut}</ThemedText.BodySmall>
          <ThemedText.BodySmall fontSize="10px">({fee / 10000}%)</ThemedText.BodySmall>
        </Label>
      </div>
      {/*<ThemedText.BodySmall>{formatDollar({ num: tvl, digits: 0 })}</ThemedText.BodySmall>
      <ThemedText.BodySmall>{formatDollar({ num: volume, digits: 0 })}</ThemedText.BodySmall>*/}
      <ThemedText.BodySmall>
        <DeltaText delta={delta?.toNumber()}>
          {delta ? formatBNToString(delta?.abs() ?? undefined, NumberType.TokenNonTx) + '%' : '-'}
        </DeltaText>
      </ThemedText.BodySmall>
      <ThemedText.BodySmall>
        {formatBNToString(currPrice ?? currentPricePool, NumberType.TokenNonTx)}
      </ThemedText.BodySmall>
    </Container>
    // </MouseoverTooltip>
  )
}

export default PoolSelectRow
