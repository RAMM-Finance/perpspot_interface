import { Currency } from '@uniswap/sdk-core'
import { BigNumber as BN } from 'bignumber.js'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { useCurrency } from 'hooks/Tokens'
import { CheckMarkIcon } from 'nft/components/icons'
import { Dispatch, SetStateAction } from 'react'
import { usePoolOHLC } from 'state/application/hooks'
import styled, { useTheme } from 'styled-components/macro'
const LOGO_SIZE = 20

const Container = styled.button<{ disabled: boolean }>`
  align-items: center;
  background: none;
  border: none;
  border-radius: 12px;
  color: ${({ theme }) => theme.textPrimary};
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  display: grid;
  grid-template-columns: 3.5fr 2fr 0.5fr 0.5fr;
  line-height: 24px;
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
  width: 10rem;
  padding-left: 1rem;
`
const Status = styled.div`
  display: flex;
  align-items: center;
  width: ${LOGO_SIZE}px;
`
const CaptionText = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
`
const Logo = styled.img`
  height: ${LOGO_SIZE}px;
  width: ${LOGO_SIZE}px;
  margin-right: 12px;
`

interface PoolSelectorRowProps {
  currencyId: string[]
  // tvl: number
  // volume: number
  onPoolSelect: (currencyIn: Currency, currencyOut: Currency, fee: number) => void
  setIsOpen: Dispatch<SetStateAction<boolean>>
  fee: number
  setSelectPair?: Dispatch<SetStateAction<boolean>>
  active?: boolean
}

export default function PoolSelectorRow({
  currencyId,
  onPoolSelect,
  setIsOpen,
  fee,
  setSelectPair,
  // tvl,
  // volume,
  active,
}: PoolSelectorRowProps) {
  const baseCurrency = useCurrency(currencyId[0])
  const quoteCurrency = useCurrency(currencyId[1])
  const [token0, token1] =
    baseCurrency && quoteCurrency && quoteCurrency?.wrapped.sortsBefore(baseCurrency?.wrapped)
      ? [baseCurrency, quoteCurrency]
      : [quoteCurrency, baseCurrency]
  const labelIn = token0?.symbol as string
  const labelOut = token1?.symbol as string
  const theme = useTheme()

  const poolOHLCData = usePoolOHLC(token0?.wrapped?.address, token1?.wrapped?.address, fee)
  return (
    <Container
      disabled={false}
      onClick={() => {
        token0 && token1 && onPoolSelect(token0, token1, fee)
        setIsOpen(() => false)
        setSelectPair && setSelectPair(() => false)
      }}
    >
      <div style={{ display: 'flex' }}>
        <DoubleCurrencyLogo currency0={token0 as Currency} currency1={token1 as Currency} size={22} margin />
        <Label>{`${labelIn}/${labelOut} (${fee / 10000}%)`}</Label>
      </div>
      <p>{poolOHLCData?.priceNow ? formatBN(new BN(poolOHLCData.priceNow)) : ''}</p>
      <DeltaText delta={poolOHLCData?.delta24h}>
        {poolOHLCData?.delta24h ? `${(poolOHLCData.delta24h * 100).toFixed(2)}%` : 'N/A'}
      </DeltaText>
      <Status>{active && <CheckMarkIcon width={LOGO_SIZE} height={LOGO_SIZE} color={theme.accentActive} />}</Status>
    </Container>
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
