import { Currency } from '@uniswap/sdk-core'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { useCurrency } from 'hooks/Tokens'
import { CheckMarkIcon } from 'nft/components/icons'
import { Dispatch, SetStateAction } from 'react'
import { useCurrentPool } from 'state/user/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { PoolKey } from 'types/lmtv2position'
import { formatDollar } from 'utils/formatNumbers'

const LOGO_SIZE = 20

const Container = styled.button<{ disabled: boolean }>`
  align-items: center;
  background: none;
  border: none;
  border-radius: 12px;
  color: ${({ theme }) => theme.textPrimary};
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 0.5fr;
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
  tvl: number
  volume: number
  onPoolSelect: (
    currencyIn: Currency,
    currencyOut: Currency,
    fee: number
  ) => void
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
  tvl,
  volume,
  active
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
        <Label>{`${labelIn} - ${labelOut} (${fee / 10000}%)`}</Label>
      </div>
      <p>{formatDollar({ num: tvl, digits: 1 })}</p>
      <p>{formatDollar({ num: volume, digits: 1 })}</p>
      <Status>{active && <CheckMarkIcon width={LOGO_SIZE} height={LOGO_SIZE} color={theme.accentActive} />}</Status>
    </Container>
  )
}
