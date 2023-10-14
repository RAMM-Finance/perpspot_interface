import { Trans } from '@lingui/macro'
import { Currency } from '@uniswap/sdk-core'
import { AutoColumn } from 'components/Column'
import { LoadingOpacityContainer, loadingOpacityMixin } from 'components/Loader/styled'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { darken } from 'polished'
import { Lock } from 'react-feather'
import styled from 'styled-components/macro'
import { flexColumnNoWrap, flexRowNoWrap } from 'theme/styles'

import { ThemedText } from '../../theme'
import { ButtonGray } from '../Button'
import { Input as NumericalInput } from '../NumericalInput'
import { RowBetween } from '../Row'

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${flexColumnNoWrap};
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  transition: height 1s ease;
  will-change: height;
`

const FixedContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`

const Container = styled.div<{ hideInput: boolean }>`
  min-height: 44px;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
`

const CurrencySelect = styled(ButtonGray)<{
  visible: boolean
  selected: boolean
  hideInput?: boolean
  disabled?: boolean
}>`
  align-items: center;
  background-color: ${({ selected, theme }) => (selected ? theme.backgroundInteractive : theme.accentAction)};
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  color: ${({ selected, theme }) => (selected ? theme.textPrimary : theme.white)};
  cursor: pointer;
  height: unset;
  border-radius: 16px;
  outline: none;
  user-select: none;
  border: none;
  font-size: 24px;
  font-weight: 400;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: ${({ selected }) => (selected ? '4px 8px 4px 4px' : '6px 6px 6px 8px')};
  gap: 8px;
  justify-content: space-between;
  margin-left: ${({ hideInput }) => (hideInput ? '0' : '12px')};

  &:hover,
  &:active {
    background-color: ${({ theme, selected }) => (selected ? theme.backgroundInteractive : theme.accentAction)};
  }

  &:before {
    background-size: 100%;
    border-radius: inherit;

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    content: '';
  }

  &:hover:before {
    background-color: ${({ theme }) => theme.stateOverlayHover};
  }

  &:active:before {
    background-color: ${({ theme }) => theme.stateOverlayPressed};
  }

  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
`

const InputRow = styled.div`
  ${flexRowNoWrap};
  align-items: center;
  justify-content: space-between;
`

const LabelRow = styled.div`
  ${flexRowNoWrap};
  align-items: center;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.75rem;
  line-height: 1rem;

  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.textSecondary)};
  }
`

const FiatRow = styled(LabelRow)`
  justify-content: flex-end;
  min-height: 20px;
  padding: 8px 0px 0px 0px;
`

const StyledBalanceMax = styled.button<{ disabled?: boolean }>`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.accentAction};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  padding: 4px 6px;
  pointer-events: ${({ disabled }) => (!disabled ? 'initial' : 'none')};

  :hover {
    opacity: ${({ disabled }) => (!disabled ? 0.8 : 0.4)};
  }

  :focus {
    outline: none;
  }
`

const StyledNumericalInput = styled(NumericalInput)<{ $loading: boolean }>`
  ${loadingOpacityMixin};
  text-align: left;
  font-size: 36px;
  line-height: 44px;
  font-variant: small-caps;
`

// interface SwapCurrencyInputPanelProps {
//   value: string
//   onUserInput: (value: string) => void
//   onMax?: () => void
//   showMaxButton: boolean
//   label?: ReactNode
//   onCurrencySelect?: (currency: Currency) => void
//   currency?: Currency | null
//   hideBalance?: boolean
//   pair?: Pair | null
//   hideInput?: boolean
//   otherCurrency?: Currency | null
//   fiatValue: { data?: number; isLoading: boolean }
//   priceImpact?: Percent
//   id: string
//   showCommonBases?: boolean
//   showCurrencyAmount?: boolean
//   disableNonToken?: boolean
//   renderBalance?: (amount: CurrencyAmount<Currency>) => ReactNode
//   locked?: boolean
//   loading?: boolean
//   disabled?: boolean
//   parsedAmount?: CurrencyAmount<Currency> | undefined
// }
interface LeverageDebtInputPanelProps {
  value: string
  // onUserInput: (value: string) => void
  currency?: Currency | null
  id: string
  locked?: boolean
  loading?: boolean
  parsedAmount?: string
  hideInput?: boolean
}

export default function LeverageDebtInputPanel({
  value,
  // onUserInput,
  currency,
  id,
  locked = false,
  loading = false,
  hideInput = false,
  parsedAmount,
  ...rest
}: LeverageDebtInputPanelProps) {
  const userInputAmount: string | undefined = parsedAmount ?? undefined

  return (
    <InputPanel id={id} hideInput={hideInput} {...rest}>
      {locked && (
        <FixedContainer>
          <AutoColumn gap="sm" justify="center">
            <Lock />
            <ThemedText.DeprecatedLabel fontSize="12px" textAlign="center" padding="0 12px">
              <Trans>The market price is outside your specified price range. Single-asset deposit only.</Trans>
            </ThemedText.DeprecatedLabel>
          </AutoColumn>
        </FixedContainer>
      )}
      <Container hideInput={hideInput}>
        <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}}>
          <div style={{ marginRight: '10px', fontSize: '15px' }}>
            <Trans>Position Size</Trans>
          </div>
          {/* {!hideInput && (
            <StyledNumericalInput
              className="token-amount-input"
              value={value}
              onUserInput={onUserInput}
              disabled={true}
              $loading={loading}
            />
          )} */}
          <CurrencyLogo style={{ marginRight: '2px' }} currency={currency} size="24px" />
        </InputRow>
        <FiatRow>
          <RowBetween>
            <LoadingOpacityContainer $loading={loading}>
              <div style={{ fontSize: '12px' }}>
                <Trans>
                  {'You are borrowing: '}
                  {Number(value) > 0 && userInputAmount ? Number(value) - Number(userInputAmount) : '-'}
                </Trans>
              </div>
            </LoadingOpacityContainer>
          </RowBetween>
        </FiatRow>
      </Container>
    </InputPanel>
  )
}
