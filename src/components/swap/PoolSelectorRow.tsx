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
  onCurrencySelect: (currencyIn: Currency, currencyOut: Currency, currencyInAdd: string, currencyOutAdd: string) => void
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

export default function ChainSelectorRow({ currencyId, onCurrencySelect, setIsOpen }: PoolSelectorRowProps) {
  // const { chainId } = useWeb3React()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const active = currencyId[0] === inputCurrencyId && currencyId[1] === outputCurrencyId
  const currencyIn = useCurrency(currencyId[0])
  const labelIn = currencyIn?.symbol as string
  const currencyOut = useCurrency(currencyId[1])
  const labelOut = currencyOut?.symbol as string

  const theme = useTheme()

  return (
    <Container
      disabled={false}
      onClick={() => {
        currencyIn && currencyOut && onCurrencySelect(currencyIn, currencyOut, currencyId[0], currencyId[1])
        setIsOpen(() => false)
      }}
    >
      <Status>{active && <CheckMarkIcon width={LOGO_SIZE} height={LOGO_SIZE} color={theme.accentActive} />}</Status>
      <div style={{ display: 'flex' }}>
        <DoubleCurrencyLogo currency0={currencyIn as Currency} currency1={currencyOut as Currency} size={22} margin />
        <Label>{`${labelIn} - ${labelOut} (fee)`}</Label>
      </div>

      <p>Test</p>
      <p>Test</p>
    </Container>
  )
}
