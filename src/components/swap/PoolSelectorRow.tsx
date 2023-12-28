import { Currency } from '@uniswap/sdk-core'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { useCurrency } from 'hooks/Tokens'
import { CheckMarkIcon } from 'nft/components/icons'
import { Dispatch, SetStateAction } from 'react'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
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
  grid-template-columns: 0.5fr 3fr 1fr 1fr;
  line-height: 24px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  text-align: left;
  transition: ${({ theme }) => theme.transition.duration.medium} ${({ theme }) => theme.transition.timing.ease}
    background-color;
  width: 375px;

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
  onCurrencySelect: (
    currencyIn: Currency,
    currencyOut: Currency,
    currencyInAdd: string,
    currencyOutAdd: string,
    fee: number
  ) => void
  setIsOpen: Dispatch<SetStateAction<boolean>>
  fee: number
}

export default function ChainSelectorRow({ currencyId, onCurrencySelect, setIsOpen, fee }: PoolSelectorRowProps) {
  // const { chainId } = useWeb3React()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const active = currencyId[0] === inputCurrencyId && currencyId[1] === outputCurrencyId
  const baseCurrency = useCurrency(currencyId[0])
  const quoteCurrency = useCurrency(currencyId[1])
  const [token0, token1] =
    baseCurrency && quoteCurrency && quoteCurrency?.wrapped.sortsBefore(baseCurrency?.wrapped)
      ? [baseCurrency, quoteCurrency]
      : [quoteCurrency, baseCurrency]
  const labelIn = token0?.symbol as string
  const labelOut = token1?.symbol as string

  console.log(token0?.wrapped.address)

  const theme = useTheme()

  return (
    <Container
      disabled={false}
      onClick={() => {
        token0 && token1 && onCurrencySelect(token0, token1, token0?.wrapped.address, token1?.wrapped.address, fee)
        setIsOpen(() => false)
      }}
    >
      <Status>{active && <CheckMarkIcon width={LOGO_SIZE} height={LOGO_SIZE} color={theme.accentActive} />}</Status>
      <div style={{ display: 'flex' }}>
        <DoubleCurrencyLogo currency0={token0 as Currency} currency1={token1 as Currency} size={22} margin />
        <Label>{`${labelIn} - ${labelOut} (${fee})`}</Label>
      </div>

      <p>Test</p>
      <p>Test</p>
    </Container>
  )
}
