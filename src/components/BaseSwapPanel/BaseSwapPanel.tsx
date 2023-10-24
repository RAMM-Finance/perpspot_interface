import { Trans } from '@lingui/macro'
import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, SwapEventName } from '@uniswap/analytics-events'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { useWeb3React } from '@web3-react/core'
import { AutoColumn } from 'components/Column'
import { LoadingOpacityContainer, loadingOpacityMixin } from 'components/Loader/styled'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { isSupportedChain } from 'constants/chains'
import { darken } from 'polished'
import { ReactNode, useCallback, useState } from 'react'
import { Lock } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'
import { flexColumnNoWrap, flexRowNoWrap } from 'theme/styles'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { useCurrencyBalance } from '../../state/connection/hooks'
import { ThemedText } from '../../theme'
import { ButtonGray } from '../Button'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Input as NumericalInput } from '../NumericalInput'
import { RowBetween, RowFixed } from '../Row'
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
  padding-top: 1vh;
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
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  display: flex;
  justify-content: space-between;
  align-items: start;
`

const CurrencySelect = styled(ButtonGray)<{
  visible: boolean
  selected: boolean
  hideInput?: boolean
  disabled?: boolean
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
`

const InputRow = styled.div`
  display: flex;
  align-items: center; // vertically align items in the middle
  justify-content: space-around; // maximize the space between items
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
  padding-top: 1vh;
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
    stroke: ${({ selected, theme }) => (selected ? theme.textPrimary : theme.white)};
    stroke-width: 2px;
  }
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size: 20px;
  font-weight: 600;
`

const StyledBalanceMax = styled.button<{ disabled?: boolean }>`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.textSecondary};
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
  font-size: 18px;
  line-height: 25px;
  font-variant: small-caps;
`

// const StyledTrans = styled(Trans)`
//   margin-right: 10px;
// `;

interface SwapCurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: ReactNode
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  fiatValue: { data?: number; isLoading: boolean }
  priceImpact?: Percent
  id: string
  showCommonBases?: boolean
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
  renderBalance?: (amount: CurrencyAmount<Currency>) => ReactNode
  locked?: boolean
  loading?: boolean
  isInput?: boolean
  isTrade?: boolean
  isLevered?: boolean
  // leverageFactor?: string
  disabled?: boolean
  premium?: CurrencyAmount<Currency>
}

interface BaseSwapPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  fiatValue: { data?: number; isLoading: boolean }
  priceImpact?: Percent
  id: string
  showCommonBases?: boolean
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
  renderBalance?: (amount: CurrencyAmount<Currency>) => ReactNode
  disabled?: boolean
  locked?: boolean
  loading?: boolean
  label?: string
  showPremium?: boolean
  premium?: CurrencyAmount<Currency>
}

export function BaseSwapPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  onCurrencySelect,
  currency,
  hideBalance = false,
  pair,
  hideInput = false,
  otherCurrency,
  fiatValue,
  priceImpact,
  id,
  showCommonBases = false,
  showCurrencyAmount = false,
  disableNonToken,
  renderBalance,
  disabled = false,
  locked = false,
  loading = false,
  label,
  premium,
  showPremium,
  ...rest
}: BaseSwapPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { account, chainId } = useWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const theme = useTheme()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const chainAllowed = isSupportedChain(chainId)

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
          {/* <div style={{ marginRight: '10px', fontSize: '15px' }}>
            <Trans>{label}</Trans>
          </div> */}
          <CurrencySelect
            disabled={!chainAllowed}
            visible={currency !== undefined}
            selected={!!currency}
            hideInput={hideInput}
            className="open-currency-select-button"
            onClick={() => {
              if (onCurrencySelect) {
                setModalOpen(true)
              }
            }}
          >
            <RowFixed>
              {pair ? (
                <span style={{ marginRight: '0.5rem' }}>
                  <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
                </span>
              ) : currency ? (
                <CurrencyLogo style={{ marginRight: '2px' }} currency={currency} size="18px" />
              ) : null}
              {pair ? (
                <StyledTokenName style={{ fontSize: '12px' }} className="pair-name-container">
                  {pair?.token0.symbol}:{pair?.token1.symbol}
                </StyledTokenName>
              ) : (
                <StyledTokenName
                  style={{ fontSize: '12px' }}
                  className="token-symbol-container"
                  active={Boolean(currency && currency.symbol)}
                >
                  {(currency && currency.symbol && currency.symbol.length > 20
                    ? currency.symbol.slice(0, 4) +
                      '...' +
                      currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                    : currency?.symbol) || <Trans>Select token</Trans>}
                </StyledTokenName>
              )}
            </RowFixed>
            {/* {onCurrencySelect && <StyledDropDown selected={!!currency} />} */}
          </CurrencySelect>
        </InputRow>
        {Boolean(!hideInput && !hideBalance) && (
          <FiatRow>
            <RowBetween>
              <LoadingOpacityContainer $loading={loading}>
                <FiatValue fiatValue={fiatValue} priceImpact={priceImpact} />
              </LoadingOpacityContainer>
              {account ? (
                <AutoColumn>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
                    <RowFixed style={{ height: '17px' }}>
                      <ThemedText.DeprecatedBody
                        color={theme.textSecondary}
                        fontWeight={400}
                        fontSize={12}
                        style={{ display: 'inline' }}
                      >
                        {!hideBalance && currency && selectedCurrencyBalance ? (
                          renderBalance ? (
                            renderBalance(selectedCurrencyBalance)
                          ) : (
                            <Trans>Wallet-Balance: {formatCurrencyAmount(selectedCurrencyBalance, 4)}</Trans>
                          )
                        ) : null}
                      </ThemedText.DeprecatedBody>
                      {showMaxButton && selectedCurrencyBalance ? (
                        <TraceEvent
                          events={[BrowserEvent.onClick]}
                          name={SwapEventName.SWAP_MAX_TOKEN_AMOUNT_SELECTED}
                          element={InterfaceElementName.MAX_TOKEN_AMOUNT_BUTTON}
                        >
                          <StyledBalanceMax style={{ fontSize: '12px' }} onClick={onMax}>
                            <Trans>Max</Trans>
                          </StyledBalanceMax>
                        </TraceEvent>
                      ) : null}
                    </RowFixed>
                    {showPremium && (
                      <RowFixed style={{ height: '17px' }}>
                        <ThemedText.DeprecatedBody
                          color={theme.textSecondary}
                          fontWeight={400}
                          fontSize={12}
                          style={{ display: 'inline' }}
                        >
                          <div style={{ fontSize: '14px' }}>
                            <Trans>
                              Est. Premium: {!premium ? '0' : formatCurrencyAmount(premium, 4)}{' '}
                              {premium?.currency.symbol ?? ''}
                            </Trans>
                          </div>
                        </ThemedText.DeprecatedBody>
                      </RowFixed>
                    )}
                  </div>
                </AutoColumn>
              ) : (
                <span />
              )}
            </RowBetween>
          </FiatRow>
        )}
      </Container>
      <Container hideInput={hideInput}>
        {!hideInput && (
          <StyledNumericalInput
            style={{ paddingTop: '1vh', paddingLeft: '.5vw' }}
            className="token-amount-input"
            value={value}
            onUserInput={onUserInput}
            disabled={!chainAllowed || disabled}
            $loading={loading}
            label="label"
          />
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
