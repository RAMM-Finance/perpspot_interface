/* eslint-disable prettier/prettier */
import { Trans } from '@lingui/macro'
import { formatCurrencyAmount, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { useWeb3React } from '@web3-react/core'
// import { TraceEvent } from 'analytics'
import { AutoColumn } from 'components/Column'
import { LoadingOpacityContainer, loadingOpacityMixin } from 'components/Loader/styled'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import Tooltip from 'components/Tooltip'
import { isSupportedChain } from 'constants/chains'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { darken } from 'polished'
import { forwardRef, ReactNode, useCallback, useEffect, useState } from 'react'
import { Lock } from 'react-feather'
import styled, { useTheme } from 'styled-components'
import { ThemedText } from 'theme'
// import { ThemedText } from 'theme/components'
import { flexColumnNoWrap, flexRowNoWrap } from 'theme/styles'

// import { NumberType, useFormatter } from 'utils/formatNumbers'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { useCurrencyBalance } from '../../state/connection/hooks'
import { ButtonGray } from '../Button'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Input as NumericalInput } from '../NumericalInput'
import Row, { RowBetween, RowFixed } from '../Row'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import { FiatValue } from './FiatValue'

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

// const CurrencySelect = styled(ButtonGray)<{
//   visible: boolean
//   selected: boolean
//   hideInput?: boolean
//   disabled?: boolean
//   animateShake?: boolean
// }>`
//   align-items: center;
//   background-color: ${({ selected, theme }) => (selected ? theme.surface1 : theme.accentAction)};
//   opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
//   color: ${({ selected, theme }) => (selected ? theme.textPrimary : theme.white)};
//   cursor: pointer;
//   height: 36px;
//   border-radius: 18px;
//   outline: none;
//   user-select: none;
//   border: 1px solid ${({ selected, theme }) => (selected ? theme.backgroundOutline : theme.backgroundOutline)};
//   font-size: 24px;
//   font-weight: 485;
//   width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
//   padding: ${({ selected }) => (selected ? '4px 8px 4px 4px' : '6px 6px 6px 8px')};
//   gap: 8px;
//   justify-content: space-between;
//   margin-left: ${({ hideInput }) => (hideInput ? '0' : '12px')};
//   box-shadow: ${({ theme }) => theme.backgroundOutline};

//   &:hover,
//   &:active {
//     background-color: ${({ theme, selected }) => (selected ? theme.backgroundOutline : theme.backgroundOutline)};
//   }

//   &:before {
//     background-size: 100%;
//     border-radius: inherit;

//     position: absolute;
//     top: 0;
//     left: 0;

//     width: 100%;
//     height: 100%;
//     content: '';
//   }

//   &:hover:before {
//     background-color: ${({ theme }) => theme.backgroundOutline};
//   }

//   &:active:before {
//     background-color: ${({ theme }) => theme.backgroundOutline};
//   }

//   visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};

//   @keyframes horizontal-shaking {
//     0% {
//       transform: translateX(0);
//       animation-timing-function: ease-in-out;
//     }
//     20% {
//       transform: translateX(10px);
//       animation-timing-function: ease-in-out;
//     }
//     40% {
//       transform: translateX(-10px);
//       animation-timing-function: ease-in-out;
//     }
//     60% {
//       transform: translateX(10px);
//       animation-timing-function: ease-in-out;
//     }
//     80% {
//       transform: translateX(-10px);
//       animation-timing-function: ease-in-out;
//     }
//     100% {
//       transform: translateX(0);
//       animation-timing-function: ease-in-out;
//     }
//   }
//   animation: ${({ animateShake }) => (animateShake ? 'horizontal-shaking 300ms' : 'none')};
// `
const CurrencySelect = styled(ButtonGray)<{
  visible: boolean
  selected: boolean
  hideInput?: boolean
  disabled?: boolean
  animateShake?: boolean
}>`
  align-items: center;
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  color: ${({ selected, theme }) => (selected ? theme.textPrimary : theme.white)};
  cursor: pointer;
  height: unset;
  border-radius: 8px;
  outline: none;
  user-select: none;
  border: none;
  font-size: 24px;
  font-weight: 400;
  background-color: transparent;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: ${({ selected }) => (selected ? '4px 8px 4px 4px' : '6px 6px 6px 8px')};
  gap: 12px;
  justify-content: space-between;

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
  @keyframes horizontal-shaking {
    0% {
      transform: translateX(0);
      animation-timing-function: ease-in-out;
    }
    20% {
      transform: translateX(10px);
      animation-timing-function: ease-in-out;
    }
    40% {
      transform: translateX(-10px);
      animation-timing-function: ease-in-out;
    }
    60% {
      transform: translateX(10px);
      animation-timing-function: ease-in-out;
    }
    80% {
      transform: translateX(-10px);
      animation-timing-function: ease-in-out;
    }
    100% {
      transform: translateX(0);
      animation-timing-function: ease-in-out;
    }
  }
  animation: ${({ animateShake }) => (animateShake ? 'horizontal-shaking 300ms' : 'none')};
`

const InputRow = styled.div`
  ${flexRowNoWrap};
  align-items: center;
  justify-content: space-between;
`

const LabelRow = styled.div`
  ${flexRowNoWrap};
  align-items: center;
  color: ${({ theme }) => theme.backgroundOutline};
  font-size: 0.75rem;
  line-height: 1rem;

  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.backgroundOutline)};
  }
`

const FiatRow = styled(LabelRow)`
  justify-content: flex-end;
  min-height: 24px;
  padding: 8px 0px 0px 0px;
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.35rem;
  height: 35%;
  margin-left: 8px;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.backgroundOutline : theme.white)};
    stroke-width: 2px;
  }
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size: 14px;
  font-weight: 535;
`

const StyledBalanceMax = styled.button<{ disabled?: boolean }>`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.accentTextLightPrimary};
  cursor: pointer;
  font-size: 12px;
  font-weight: 535;
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

const StyledNumericalInput = styled(NumericalInput)<{ $loading: boolean; fontSize?: string }>`
  ${loadingOpacityMixin};
  text-align: left;
  font-size: 16px;
  font-weight: 485;
  max-height: 44px;
`

interface SwapCurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label: ReactNode
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  fiatValue?: { data?: number; isLoading: boolean } 
  priceImpact?: Percent
  id: string
  showCommonBases?: boolean
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
  renderBalance?: (amount: CurrencyAmount<Currency>) => ReactNode
  locked?: boolean
  loading?: boolean
  disabled?: boolean
  numericalInputSettings?: {
    disabled?: boolean
    onDisabledClick?: () => void
    disabledTooltipBody?: ReactNode
  }
  isPrice?: ReactNode
}

const SwapCurrencyInputPanelV2 = forwardRef<HTMLInputElement, SwapCurrencyInputPanelProps>(
  ({
    value,
    onUserInput,
    onMax,
    showMaxButton,
    onCurrencySelect,
    currency,
    otherCurrency,
    id,
    showCommonBases,
    showCurrencyAmount,
    disableNonToken,
    renderBalance,
    fiatValue,
    priceImpact,
    hideBalance = false,
    pair = null, // used for double token logo
    hideInput = false,
    locked = false,
    loading = false,
    disabled = false,
    numericalInputSettings,
    label,
    isPrice,
    ...rest
  }) => {
    const [modalOpen, setModalOpen] = useState(false)
    const { account, chainId } = useWeb3React()
    const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
    const theme = useTheme()
    // const { formatCurrencyAmount } = useFormatter()
    // console.log('-usd-', fiatValue, value, currency)
    const handleDismissSearch = useCallback(() => {
      setModalOpen(false)
    }, [setModalOpen])

    const [tooltipVisible, setTooltipVisible] = useState(false)
    const handleDisabledNumericalInputClick = useCallback(() => {
      if (numericalInputSettings?.disabled && !tooltipVisible) {
        setTooltipVisible(true)
        setTimeout(() => setTooltipVisible(false), 4000) // reset shake animation state after 4s
        numericalInputSettings.onDisabledClick?.()
      }
    }, [tooltipVisible, numericalInputSettings])

    const chainAllowed = isSupportedChain(chainId)

    // reset tooltip state when currency changes
    useEffect(() => setTooltipVisible(false), [currency])

    return (
      <InputPanel id={id} hideInput={hideInput} {...rest}>
        {locked && (
          <FixedContainer>
            <AutoColumn gap="sm" justify="center">
              <Lock />
              <ThemedText.BodySecondary fontSize="12px" textAlign="center" padding="0 12px">
                <Trans>The market price is outside your specified price range. Single-asset deposit only.</Trans>
              </ThemedText.BodySecondary>
            </AutoColumn>
          </FixedContainer>
        )}

        <Container hideInput={hideInput}>
          <ThemedText.SubHeaderSmall style={{ userSelect: 'none', marginBottom: '10px' }}>
            {label}
          </ThemedText.SubHeaderSmall>
          <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}}>
            {!hideInput && (
              <div style={{ display: 'flex', flexGrow: '1' }} onClick={handleDisabledNumericalInputClick}>
                <StyledNumericalInput
                  className="token-amount-input"
                  value={value}
                  onUserInput={onUserInput}
                  disabled={!chainAllowed || disabled || numericalInputSettings?.disabled}
                  $loading={loading}
                  id={id}
                />
              </div>
            )}
            <div>
              <Tooltip
                show={tooltipVisible && !modalOpen}
                placement="bottom"
                offsetY={14}
                text={numericalInputSettings?.disabledTooltipBody}
              >
                <Aligner>
                  <RowFixed>
                    {pair ? (
                      <span style={{ marginRight: '0.5rem' }}>
                        <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
                      </span>
                    ) : currency ? (
                      <CurrencyLogo style={{ marginRight: '2px' }} currency={currency} size="24px" />
                    ) : null}
                    {pair ? (
                      <StyledTokenName className="pair-name-container">
                        {pair?.token0.symbol}:{pair?.token1.symbol}
                      </StyledTokenName>
                    ) : (
                      <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                        {(currency && currency.symbol && currency.symbol.length > 20
                          ? currency.symbol.slice(0, 4) +
                            '...' +
                            currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                          : currency?.symbol) || 
                          <Row marginLeft="2.5rem">
                            <Trans>Select token</Trans>
                          </Row>
                          }
                      </StyledTokenName>
                    )}
                  </RowFixed>
                  {onCurrencySelect && <StyledDropDown selected={!!currency} />}
                </Aligner>
              </Tooltip>
              <div>{isPrice ? <RowFixed>{isPrice}</RowFixed> : null}</div>
            </div>
          </InputRow>
          {Boolean(!hideInput && !hideBalance) && (
            <FiatRow>
              <RowBetween>
                <LoadingOpacityContainer $loading={loading}>
                  <FiatValue fiatValue={fiatValue} priceImpact={priceImpact} />
                </LoadingOpacityContainer>
                {account ? (
                  <RowFixed style={{ height: '16px' }}>
                    <ThemedText.DeprecatedBody
                      data-testid="balance-text"
                      color="textSecondary"
                      fontWeight={485}
                      fontSize={13}
                      style={{ display: 'inline' }}
                    >
                      {!hideBalance && currency && selectedCurrencyBalance ? (
                        renderBalance ? (
                          renderBalance(selectedCurrencyBalance)
                        ) : (
                          <Trans>Balance: {formatCurrencyAmount(selectedCurrencyBalance, NumberType.TokenNonTx)}</Trans>
                        )
                      ) : null}
                    </ThemedText.DeprecatedBody>
                    {showMaxButton && selectedCurrencyBalance ? (
                      <StyledBalanceMax onClick={onMax}>
                        <Trans>Max</Trans>
                      </StyledBalanceMax>
                    ) : null}
                  </RowFixed>
                ) : (
                  <span />
                )}
              </RowBetween>
            </FiatRow>
          )}
        </Container>
        {onCurrencySelect && (
          <CurrencySearchModal
            isOpen={modalOpen}
            onDismiss={handleDismissSearch}
            onCurrencySelect={onCurrencySelect}
            selectedCurrency={currency}
            otherSelectedCurrency={otherCurrency}
            showCommonBases={showCommonBases}
            showCurrencyAmount={showCurrencyAmount}
            disableNonToken={disableNonToken}
          />
        )}
      </InputPanel>
    )
  }
)
SwapCurrencyInputPanelV2.displayName = 'SwapCurrencyInputPanel'

export default SwapCurrencyInputPanelV2
