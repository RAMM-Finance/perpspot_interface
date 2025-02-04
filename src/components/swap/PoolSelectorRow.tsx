import { Currency } from '@uniswap/sdk-core'
import { useCurrency } from 'hooks/Tokens'
import { CheckMarkIcon } from 'nft/components/icons'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import styled, { useTheme } from 'styled-components/macro'
import DoubleCurrencyLogo from 'components/DoubleLogo'

const LOGO_SIZE = 20

const Container = styled.button<{ disabled: boolean }>`
  align-items: center;
  background: none;
  border: none;
  border-radius: 12px;
  color: ${({ theme }) => theme.textPrimary};
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  display: grid;
  grid-template-columns:  1fr 4fr 1fr 1fr 1fr;
  justify-content: space-between;
  line-height: 24px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  padding: 10px 8px;
  text-align: left;
  transition: ${({ theme }) => theme.transition.duration.medium} ${({ theme }) => theme.transition.timing.ease}
    background-color;
  width: 450px;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    width: 100%;
  }

  &:hover {
    background-color: ${({ disabled, theme }) => (disabled ? 'none' : theme.backgroundOutline)};
  }
`
const Label = styled.div`
  font-size: 16px;
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
  onCurrencySelect: (currencyIn: Currency, currencyOut: Currency) => void
}

export default function ChainSelectorRow({ currencyId, onCurrencySelect }: PoolSelectorRowProps) {
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
        currencyIn && currencyOut && onCurrencySelect(currencyIn, currencyOut)
      }}
    >
      <DoubleCurrencyLogo
          currency0={currencyIn as Currency}
          currency1={currencyOut as Currency}
          size={30}
          margin
          />
      <Label>{`${labelIn} - ${labelOut} (fee)`}</Label>
      <p>Test</p>
      <p>Test</p>
      <Status>{active && <CheckMarkIcon width={LOGO_SIZE} height={LOGO_SIZE} color={theme.accentActive} />}</Status>
    </Container>
  )
}
