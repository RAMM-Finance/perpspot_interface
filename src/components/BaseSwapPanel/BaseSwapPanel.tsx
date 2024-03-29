import { Trans } from '@lingui/macro'
import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, SwapEventName } from '@uniswap/analytics-events'
import { formatCurrencyAmount, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { useWeb3React } from '@web3-react/core'
import { YellowCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { LoadingOpacityContainer, loadingOpacityMixin } from 'components/Loader/styled'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { MouseoverTooltip } from 'components/Tooltip'
import { isSupportedChain } from 'constants/chains'
import { darken } from 'polished'
import { ReactNode, useCallback, useState } from 'react'
import { ChevronDown, ChevronUp, Info, Lock } from 'react-feather'
import styled from 'styled-components/macro'
import { flexColumnNoWrap, flexRowNoWrap } from 'theme/styles'

import { useCurrencyBalance } from '../../state/connection/hooks'
import { ThemedText } from '../../theme'
import { BaseButton, ButtonGray } from '../Button'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Input as NumericalInput } from '../NumericalInput'
import { StyledDropdown, TokenItem } from '../PremiumCurrencySelector/index'
import { RowBetween, RowFixed } from '../Row'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import { FiatValue } from './FiatValue'

const WalletBalance = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;
  padding-right: 6px;
`

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
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  display: flex;
  flex-direction: column;
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
`

const MarginSelect = styled(ButtonGray)<{
  visible: boolean
  selected: boolean
  hideInput?: boolean
  disabled?: boolean
}>`
  align-items: center;
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  color: ${({ selected, theme }) => (selected ? theme.white : theme.textPrimary)};
  cursor: pointer;
  height: unset;
  border-radius: 8px;
  outline: none;
  user-select: none;
  border: ${({ selected, theme }) =>
    selected ? `1.25px solid ${theme.accentActiveSoft}` : `1.25px solid ${theme.surface1}`};
  font-size: 24px;
  font-weight: 400;
  background-color: transparent;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: 4px 8px 4px 4px;
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

const MarginCurrencySelect = styled(BaseButton)<{
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
  background-color: transparent;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: ${({ selected }) => (selected ? '4px 8px 4px 4px' : '6px 6px 6px 8px')};
  gap: 12px;
  justify-content: space-between;

  &:hover,
  &:active {
    background-color: none;
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
    background-color: none;
  }

  &:active:before {
    background-color: none;
  }

  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
`

export const InputRow = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-around;
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
  padding-bottom: 1vh;
  width: 100%;
`

export const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size: 12px;
  font-weight: 600;
`

const StyledBalanceMax = styled.button<{ disabled?: boolean }>`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  padding: 0px;
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
  color: ${({ theme }) => theme.textSecondary};
  text-align: left;
  font-size: 16px;
  padding-left: 10px;
`

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
  bothCurrencies?: boolean
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
  bothCurrencies = false,
  ...rest
}: BaseSwapPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { account, chainId } = useWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  // const theme = useTheme()

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
        <InputRow>
          {!hideInput && (
            <StyledNumericalInput
              className="token-amount-input"
              value={value}
              onUserInput={onUserInput}
              disabled={!chainAllowed || disabled}
              $loading={loading}
              label="label"
            />
          )}
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
              {bothCurrencies ? (
                <>
                  <CurrencyLogo currency={currency} size="15px" />
                  <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                    {(currency && currency.symbol && currency.symbol.length > 20
                      ? currency.symbol.slice(0, 4) +
                        '...' +
                        currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                      : currency?.symbol) || <Trans>Select token</Trans>}{' '}
                  </StyledTokenName>
                  <div> / </div>
                  <CurrencyLogo currency={otherCurrency} size="15px" />
                  <StyledTokenName
                    className="token-symbol-container"
                    active={Boolean(otherCurrency && otherCurrency.symbol)}
                  >
                    {(otherCurrency && otherCurrency.symbol && otherCurrency.symbol.length > 20
                      ? otherCurrency.symbol.slice(0, 4) +
                        '...' +
                        otherCurrency.symbol.slice(otherCurrency.symbol.length - 5, otherCurrency.symbol.length)
                      : otherCurrency?.symbol) || <Trans>Select token</Trans>}
                  </StyledTokenName>
                </>
              ) : pair ? (
                <span>
                  <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
                </span>
              ) : currency ? (
                <CurrencyLogo currency={currency} size="15px" />
              ) : null}
              {bothCurrencies ? (
                <></>
              ) : pair ? (
                <StyledTokenName className="pair-name-container">
                  {pair?.token0.symbol}:{pair?.token1.symbol}
                </StyledTokenName>
              ) : (
                <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                  {(currency && currency.symbol && currency.symbol.length > 20
                    ? currency.symbol.slice(0, 4) +
                      '...' +
                      currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                    : currency?.symbol) || <Trans>Select token</Trans>}
                </StyledTokenName>
              )}
            </RowFixed>
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
                  <RowFixed>
                    <WalletBalance>
                      <ThemedText.BodySmall>
                        {!hideBalance && currency && selectedCurrencyBalance ? (
                          renderBalance ? (
                            renderBalance(selectedCurrencyBalance)
                          ) : (
                            <div style={{ display: 'flex', gap: '2px' }}>
                              <Trans>Wallet-Balance:</Trans>
                              <ThemedText.BodySmall>
                                {formatCurrencyAmount(selectedCurrencyBalance, NumberType.TokenNonTx)}
                              </ThemedText.BodySmall>
                            </div>
                          )
                        ) : null}
                      </ThemedText.BodySmall>
                    </WalletBalance>
                    {showMaxButton && selectedCurrencyBalance ? (
                      <TraceEvent
                        events={[BrowserEvent.onClick]}
                        name={SwapEventName.SWAP_MAX_TOKEN_AMOUNT_SELECTED}
                        element={InterfaceElementName.MAX_TOKEN_AMOUNT_BUTTON}
                      >
                        <StyledBalanceMax onClick={onMax}>
                          <Trans>Max</Trans>
                        </StyledBalanceMax>
                      </TraceEvent>
                    ) : null}
                  </RowFixed>
                </AutoColumn>
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

interface MarginSelectPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  onCurrencySelect?: (currency: Currency) => void
  inputCurrency?: Currency | null
  outputCurrency?: Currency | null
  hideBalance?: boolean
  hideInput?: boolean
  fiatValue: { data?: number; isLoading: boolean }
  priceImpact?: Percent
  id: string
  renderBalance?: (amount: CurrencyAmount<Currency>) => ReactNode
  disabled?: boolean
  locked?: boolean
  loading?: boolean
  label?: string
  showPremium?: boolean
  premium?: CurrencyAmount<Currency>
  marginInPosToken: boolean
  existingPosition?: boolean
  onMarginTokenChange?: () => void
}

export function MarginSelectPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  onCurrencySelect,
  inputCurrency,
  outputCurrency,
  hideBalance = false,
  hideInput = false,
  fiatValue,
  priceImpact,
  id,
  renderBalance,
  disabled = false,
  locked = false,
  loading = false,
  onMarginTokenChange,
  marginInPosToken,
  existingPosition,
  ...rest
}: MarginSelectPanelProps) {
  const { account, chainId } = useWeb3React()

  const chainAllowed = isSupportedChain(chainId)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const currency = marginInPosToken ? outputCurrency : inputCurrency
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const otherCurrency = marginInPosToken ? inputCurrency : outputCurrency
  return (
    <>
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
          <InputRow>
            {!hideInput && (
              <StyledNumericalInput
                className="token-amount-input"
                value={value}
                onUserInput={onUserInput}
                disabled={!chainAllowed || disabled}
                $loading={loading}
                label="label"
              />
            )}
            {!existingPosition ? (
              <CurrencySelect
                disabled={!chainAllowed}
                visible={currency !== undefined}
                selected={!!currency}
                hideInput={hideInput}
                className="open-currency-select-button"
                onClick={handleClick}
              >
                <RowFixed>
                  <CurrencyLogo currency={currency} size="15px" />
                  <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                    {(currency && currency.symbol && currency.symbol.length > 20
                      ? currency.symbol.slice(0, 4) +
                        '...' +
                        currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                      : currency?.symbol) || <Trans>Select token</Trans>}
                  </StyledTokenName>
                  {open ? <ChevronUp style={{ width: '15px' }} /> : <ChevronDown style={{ width: '15px' }} />}
                </RowFixed>
              </CurrencySelect>
            ) : (
              <RowFixed>
                <CurrencyLogo currency={currency} size="15px" />
                <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                  {(currency && currency.symbol && currency.symbol.length > 20
                    ? currency.symbol.slice(0, 4) +
                      '...' +
                      currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                    : currency?.symbol) || null}
                </StyledTokenName>
              </RowFixed>
            )}
          </InputRow>
          {Boolean(!hideInput && !hideBalance) && (
            <FiatRow>
              <RowBetween>
                <LoadingOpacityContainer $loading={loading}>
                  <FiatValue fiatValue={fiatValue} priceImpact={priceImpact} />
                </LoadingOpacityContainer>
                {account ? (
                  <AutoColumn>
                    <RowFixed>
                      <WalletBalance>
                        <ThemedText.BodySmall>
                          {!hideBalance && currency && selectedCurrencyBalance ? (
                            renderBalance ? (
                              renderBalance(selectedCurrencyBalance)
                            ) : (
                              <div style={{ display: 'flex', gap: '2px' }}>
                                <Trans>Wallet-Balance:</Trans>
                                <ThemedText.BodySmall>
                                  {formatCurrencyAmount(selectedCurrencyBalance, NumberType.TokenNonTx)}
                                </ThemedText.BodySmall>
                              </div>
                            )
                          ) : null}
                        </ThemedText.BodySmall>
                      </WalletBalance>
                      {showMaxButton && selectedCurrencyBalance ? (
                        <TraceEvent
                          events={[BrowserEvent.onClick]}
                          name={SwapEventName.SWAP_MAX_TOKEN_AMOUNT_SELECTED}
                          element={InterfaceElementName.MAX_TOKEN_AMOUNT_BUTTON}
                        >
                          <StyledBalanceMax onClick={onMax}>
                            <Trans>Max</Trans>
                          </StyledBalanceMax>
                        </TraceEvent>
                      ) : null}
                    </RowFixed>
                  </AutoColumn>
                ) : (
                  <span />
                )}
              </RowBetween>
            </FiatRow>
          )}
          {existingPosition && (
            <YellowCard style={{ padding: '3px', lineHeight: '13px', display: 'flex', gap: '5px' }}>
              <ThemedText.BodySmall fontSize="10px">Margin selection unavailable</ThemedText.BodySmall>
              <MouseoverTooltip text="Unable to change margin as position with given margin is currently open. Open positions can be modified/closed in the `Leverage Positions` table.">
                <Info size={11} />
              </MouseoverTooltip>
            </YellowCard>
          )}
        </Container>
      </InputPanel>
      <StyledDropdown
        slotProps={{ paper: { sx: { paddingX: '5px', backgroundColor: '#141a2a' } } }}
        MenuListProps={{
          sx: {
            color: 'white',
          },
        }}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
      >
        <TokenItem onClick={onMarginTokenChange}>
          <RowFixed>
            <CurrencyLogo currency={otherCurrency} size="15px" />
            <StyledTokenName className="token-symbol-container" active={Boolean(otherCurrency && otherCurrency.symbol)}>
              {otherCurrency && otherCurrency.symbol && otherCurrency.symbol.length > 20
                ? otherCurrency.symbol.slice(0, 4) +
                  '...' +
                  otherCurrency.symbol.slice(otherCurrency.symbol.length - 5, otherCurrency.symbol.length)
                : otherCurrency?.symbol}
            </StyledTokenName>
          </RowFixed>
        </TokenItem>
      </StyledDropdown>
    </>
  )
}
