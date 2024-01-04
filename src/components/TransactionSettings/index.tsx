import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { L2_CHAIN_IDS } from 'constants/chains'
import { DEFAULT_DEADLINE_FROM_NOW, DEFAULT_LIMIT_DEADLINE_FROM_NOW } from 'constants/misc'
import ms from 'ms.macro'
import { darken } from 'polished'
import { useState } from 'react'
import {
  useUserLimitOrderTransactionTTL,
  useUserPremiumDepositPercent,
  useUserSlippageTolerance,
  useUserTransactionTTL,
} from 'state/user/hooks'
import styled, { useTheme } from 'styled-components/macro'

import { ThemedText } from '../../theme'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'

enum SlippageError {
  InvalidInput = 'InvalidInput',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

enum PremiumError {
  InvalidInput = 'InvalidInput',
}

enum SlippedTickError {
  InvalidInput = 'InvalidInput',
}

const FancyButton = styled.button`
  color: ${({ theme }) => theme.textPrimary};
  align-items: center;
  height: 2rem;
  border-radius: 36px;
  font-size: 1rem;
  width: auto;
  min-width: 3.5rem;
  border: 1px solid ${({ theme }) => theme.deprecated_bg3};
  outline: none;
  background: ${({ theme }) => theme.deprecated_bg1};
  :hover {
    border: 1px solid ${({ theme }) => theme.deprecated_bg4};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.accentAction};
  }
`

const Option = styled(FancyButton)<{ active: boolean }>`
  margin-right: 8px;
  border-radius: 12px;
  :hover {
    cursor: pointer;
  }
  background-color: ${({ active, theme }) => active && theme.accentAction};
  color: ${({ active, theme }) => (active ? theme.white : theme.textPrimary)};
`

const Input = styled.input`
  background: ${({ theme }) => theme.deprecated_bg1};
  font-size: 16px;
  border-radius: 12px;
  width: auto;
  outline: none;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  color: ${({ theme, color }) => (color === 'red' ? theme.accentFailure : theme.textPrimary)};
  text-align: right;

  ::placeholder {
    color: ${({ theme }) => theme.textTertiary};
  }
`

const OptionCustom = styled(FancyButton)<{ active?: boolean; warning?: boolean }>`
  height: 2rem;
  position: relative;
  padding: 0 0.75rem;
  border-radius: 12px;
  flex: 1;
  border: ${({ theme, active, warning }) =>
    active
      ? `1px solid ${warning ? theme.accentFailure : theme.accentAction}`
      : warning && `1px solid ${theme.accentFailure}`};
  :hover {
    border: ${({ theme, active, warning }) =>
      active && `1px solid ${warning ? darken(0.1, theme.accentFailure) : darken(0.1, theme.accentAction)}`};
  }

  input {
    width: 100%;
    height: 100%;
    border: 0px;
    border-radius: 2rem;
  }
`

const SlippageEmojiContainer = styled.span`
  color: #f3841e;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    display: none;
  `}
`

interface TransactionSettingsProps {
  placeholderSlippage?: Percent // varies according to the context in which the settings dialog is placed
  // placeholderSlippedTick?: Percent
  placeholderPremium?: Percent
  isLimitOrder?: boolean
}

const THREE_DAYS_IN_SECONDS = ms`3 days` / 1000

export default function TransactionSettings({
  placeholderSlippage,
  // placeholderSlippedTick,
  placeholderPremium,
  isLimitOrder,
}: TransactionSettingsProps) {
  const { chainId } = useWeb3React()
  const theme = useTheme()

  const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippageTolerance()
  // const [userSlippedTickTolerance, setUserSlippedTickTolerance] = useUserSlippedTickTolerance()
  const [userPremiumDepositPercent, setUserPremiumDepositPercent] = useUserPremiumDepositPercent()
  const [limitDeadline, setLimitDeadline] = useUserLimitOrderTransactionTTL()
  const [limitDeadlineInput, setLimitDeadlineInput] = useState('')
  const [limitDeadlineError, setLimitDeadlineError] = useState<DeadlineError | false>(false)

  const [deadline, setDeadline] = useUserTransactionTTL()

  const [slippageInput, setSlippageInput] = useState('')
  const [slippageError, setSlippageError] = useState<SlippageError | false>(false)

  const [deadlineInput, setDeadlineInput] = useState('')
  const [deadlineError, setDeadlineError] = useState<DeadlineError | false>(false)

  // const [premiumInput, setPremiumInput] = useState('')
  // const [premiumError, setPremiumError] = useState<PremiumError | false>(false)

  // const [slippedTickInput, setSlippedTickInput] = useState('')
  // const [slippedTickError, setSlippedTickError] = useState<SlippedTickError | false>(false)
  const [premiumPercentInput, setPremiumPercentInput] = useState('')
  const [premiumPercentError, setPremiumPercentError] = useState<SlippedTickError | false>(false)

  function parseSlippageInput(value: string) {
    // populate what the user typed and clear the error
    setSlippageInput(value)
    setSlippageError(false)

    if (value.length === 0) {
      setUserSlippageTolerance('auto')
    } else {
      const parsed = Math.floor(Number.parseFloat(value) * 100)

      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 5000) {
        setUserSlippageTolerance('auto')
        if (value !== '.') {
          setSlippageError(SlippageError.InvalidInput)
        }
      } else {
        setUserSlippageTolerance(new Percent(parsed, 10_000))
      }
    }
  }

  const slippageTooLow = userSlippageTolerance !== 'auto' && userSlippageTolerance.lessThan(new Percent(5, 10_000))
  const slippageTooHigh = userSlippageTolerance !== 'auto' && userSlippageTolerance.greaterThan(new Percent(1, 100))

  function parseCustomDeadline(value: string) {
    // populate what the user typed and clear the error
    setDeadlineInput(value)
    setDeadlineError(false)

    if (value.length === 0) {
      setDeadline(DEFAULT_DEADLINE_FROM_NOW)
    } else {
      try {
        const parsed: number = Math.floor(Number.parseFloat(value) * 60)
        if (!Number.isInteger(parsed) || parsed < 60 || parsed > THREE_DAYS_IN_SECONDS) {
          setDeadlineError(DeadlineError.InvalidInput)
        } else {
          setDeadline(parsed)
        }
      } catch (error) {
        console.error(error)
        setDeadlineError(DeadlineError.InvalidInput)
      }
    }
  }

  // function parseSlippedTickInput(value: string) {
  //   // populate what the user typed and clear the error
  //   setSlippedTickInput(value)
  //   setSlippedTickError(false)

  //   if (value.length === 0) {
  //     setUserSlippedTickTolerance('auto')
  //   } else {
  //     const parsed = Math.floor(Number.parseFloat(value) * 100)

  //     if (!Number.isInteger(parsed) || parsed < 0 || parsed > 5000) {
  //       setUserSlippedTickTolerance('auto')
  //       if (value !== '.') {
  //         setSlippedTickError(SlippedTickError.InvalidInput)
  //       }
  //     } else {
  //       setUserSlippedTickTolerance(new Percent(parsed, 10_000))
  //     }
  //   }
  // }

  function parsePremiumInput(value: string) {
    setPremiumPercentInput(value)
    setPremiumPercentError(false)

    if (value.length === 0) {
      setUserPremiumDepositPercent('auto')
    } else {
      const parsed = Math.floor(Number.parseFloat(value) * 100)

      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 5000) {
        setUserPremiumDepositPercent('auto')
        if (value !== '.') {
          setPremiumPercentError(SlippedTickError.InvalidInput)
        }
      } else {
        setUserPremiumDepositPercent(new Percent(parsed, 10_000))
      }
    }
  }

  function parseLimitDeadlineInput(value: string) {
    // populate what the user typed and clear the error
    setLimitDeadlineInput(value)
    setLimitDeadlineError(false)

    if (value.length === 0) {
      setLimitDeadline(DEFAULT_LIMIT_DEADLINE_FROM_NOW)
    } else {
      try {
        const parsed: number = Math.floor(Number.parseFloat(value) * 60)
        if (!Number.isInteger(parsed) || parsed < 60 || parsed > THREE_DAYS_IN_SECONDS) {
          setLimitDeadlineError(DeadlineError.InvalidInput)
        } else {
          setLimitDeadline(parsed)
        }
      } catch (error) {
        console.error(error)
        setLimitDeadlineError(DeadlineError.InvalidInput)
      }
    }
  }

  const premiumTooLow =
    userPremiumDepositPercent !== 'auto' && userPremiumDepositPercent.lessThan(new Percent(5, 10_000))

  const showCustomDeadlineRow = Boolean(chainId && !L2_CHAIN_IDS.includes(chainId))

  // const selectedTab = useSelector((state: any) => state.swap.tab)

  return (
    <AutoColumn gap="md">
      {placeholderPremium && (
        <AutoColumn gap="sm">
          <RowFixed>
            <ThemedText.DeprecatedBlack fontWeight={400} fontSize={14} color={theme.textSecondary}>
              <Trans>Premium Deposit</Trans>
            </ThemedText.DeprecatedBlack>
            <QuestionHelper
              text={
                <Trans>
                  When positions are added you are automatically supplying this amount of premium, as a percentage of
                  borrowed amount.
                </Trans>
              }
            />
          </RowFixed>
          <RowBetween>
            <Option
              onClick={() => {
                parsePremiumInput('')
              }}
              active={userPremiumDepositPercent === 'auto'}
            >
              <Trans>Auto</Trans>
            </Option>
            <OptionCustom active={userPremiumDepositPercent !== 'auto'} warning={!!premiumPercentError} tabIndex={-1}>
              <RowBetween>
                {premiumTooLow ? (
                  <SlippageEmojiContainer>
                    <span role="img" aria-label="warning">
                      ⚠️
                    </span>
                  </SlippageEmojiContainer>
                ) : null}
                <Input
                  placeholder={placeholderPremium?.toFixed(2)}
                  value={
                    premiumPercentInput.length > 0
                      ? premiumPercentInput
                      : userPremiumDepositPercent === 'auto'
                      ? ''
                      : userPremiumDepositPercent.toFixed(2)
                  }
                  onChange={(e) => parsePremiumInput(e.target.value)}
                  onBlur={() => {
                    setPremiumPercentInput('')
                    setPremiumPercentError(false)
                  }}
                  color={premiumPercentError ? 'red' : ''}
                />
                %
              </RowBetween>
            </OptionCustom>
          </RowBetween>
          {premiumPercentError || premiumTooLow ? (
            <RowBetween
              style={{
                fontSize: '14px',
                paddingTop: '7px',
                color: premiumPercentError ? 'red' : '#F3841E',
              }}
            >
              {premiumPercentError ? (
                <Trans>Enter a valid slippage percentage</Trans>
              ) : premiumTooLow ? (
                <Trans>Your transaction may fail</Trans>
              ) : null}
            </RowBetween>
          ) : null}
        </AutoColumn>
      )}
      {isLimitOrder && (
        <AutoColumn gap="sm">
          <RowFixed>
            <ThemedText.DeprecatedBlack fontSize={14} fontWeight={400} color={theme.textSecondary}>
              <Trans>Limit Order deadline</Trans>
            </ThemedText.DeprecatedBlack>
            <QuestionHelper
              text={<Trans>Your order will only be valid for this period after tx is processed.</Trans>}
            />
          </RowFixed>
          <RowFixed>
            <OptionCustom style={{ width: '80px' }} warning={!!limitDeadlineError} tabIndex={-1}>
              <Input
                placeholder={(DEFAULT_LIMIT_DEADLINE_FROM_NOW / 60).toString()}
                value={
                  limitDeadlineInput.length > 0
                    ? limitDeadlineInput
                    : limitDeadline === DEFAULT_LIMIT_DEADLINE_FROM_NOW
                    ? ''
                    : (limitDeadline / 60).toString()
                }
                onChange={(e) => parseLimitDeadlineInput(e.target.value)}
                onBlur={() => {
                  parseLimitDeadlineInput('')
                  setLimitDeadlineError(false)
                }}
                color={limitDeadlineError ? 'red' : ''}
              />
            </OptionCustom>
            <ThemedText.DeprecatedBody style={{ paddingLeft: '8px' }} fontSize={14}>
              <Trans>minutes</Trans>
            </ThemedText.DeprecatedBody>
          </RowFixed>
        </AutoColumn>
      )}
      {/* {placeholderSlippedTick && (
        <AutoColumn gap="sm">
          <RowFixed>
            <ThemedText.DeprecatedBlack fontWeight={400} fontSize={14} color={theme.textSecondary}>
              <Trans>Slipped Tick Tolerance</Trans>
            </ThemedText.DeprecatedBlack>
            <QuestionHelper
              text={
                <Trans>
                  Your transaction will revert if the price changes unfavorably by more than this percentage.
                </Trans>
              }
            />
          </RowFixed>
          <RowBetween>
            <Option
              onClick={() => {
                parseSlippedTickInput('')
              }}
              active={userSlippedTickTolerance === 'auto'}
            >
              <Trans>Auto</Trans>
            </Option>
            <OptionCustom active={userSlippedTickTolerance !== 'auto'} warning={!!slippedTickError} tabIndex={-1}>
              <RowBetween>
                <Input
                  placeholder={placeholderSlippedTick?.toFixed(2)}
                  value={
                    slippedTickInput.length > 0
                      ? slippedTickInput
                      : userSlippedTickTolerance === 'auto'
                      ? ''
                      : userSlippedTickTolerance.toFixed(2)
                  }
                  onChange={(e) => parseSlippedTickInput(e.target.value)}
                  onBlur={() => {
                    setSlippageInput('')
                    setSlippageError(false)
                  }}
                  color={slippageError ? 'red' : ''}
                />
                %
              </RowBetween>
            </OptionCustom>
          </RowBetween>
          {slippedTickError ? (
            <RowBetween
              style={{
                fontSize: '14px',
                paddingTop: '7px',
                color: slippageError ? 'red' : '#F3841E',
              }}
            >
              <Trans>Enter a valid slipped tick percentage</Trans>
            </RowBetween>
          ) : null}
        </AutoColumn>
      )} */}
      {placeholderSlippage && (
        <AutoColumn gap="sm">
          <RowFixed>
            <ThemedText.DeprecatedBlack fontWeight={400} fontSize={14} color={theme.textSecondary}>
              <Trans>Trade Slippage tolerance</Trans>
            </ThemedText.DeprecatedBlack>
            <QuestionHelper
              text={
                <Trans>
                  Your transaction will revert if the price changes unfavorably by more than this percentage.
                </Trans>
              }
            />
          </RowFixed>
          <RowBetween>
            <Option
              onClick={() => {
                parseSlippageInput('')
              }}
              active={userSlippageTolerance === 'auto'}
            >
              <Trans>Auto</Trans>
            </Option>
            <OptionCustom active={userSlippageTolerance !== 'auto'} warning={!!slippageError} tabIndex={-1}>
              <RowBetween>
                {slippageTooLow || slippageTooHigh ? (
                  <SlippageEmojiContainer>
                    <span role="img" aria-label="warning">
                      ⚠️
                    </span>
                  </SlippageEmojiContainer>
                ) : null}
                <Input
                  placeholder={placeholderSlippage.toFixed(2)}
                  value={
                    slippageInput.length > 0
                      ? slippageInput
                      : userSlippageTolerance === 'auto'
                      ? ''
                      : userSlippageTolerance.toFixed(2)
                  }
                  onChange={(e) => parseSlippageInput(e.target.value)}
                  onBlur={() => {
                    setSlippageInput('')
                    setSlippageError(false)
                  }}
                  color={slippageError ? 'red' : ''}
                />
                %
              </RowBetween>
            </OptionCustom>
          </RowBetween>
          {slippageError || slippageTooLow || slippageTooHigh ? (
            <RowBetween
              style={{
                fontSize: '14px',
                paddingTop: '7px',
                color: slippageError ? 'red' : '#F3841E',
              }}
            >
              {slippageError ? (
                <Trans>Enter a valid slippage percentage</Trans>
              ) : slippageTooLow ? (
                <Trans>Your transaction may fail</Trans>
              ) : (
                <Trans>Your transaction may be frontrun</Trans>
              )}
            </RowBetween>
          ) : null}
        </AutoColumn>
      )}
      {showCustomDeadlineRow && (
        <AutoColumn gap="sm">
          <RowFixed>
            <ThemedText.DeprecatedBlack fontSize={14} fontWeight={400} color={theme.textSecondary}>
              <Trans>Transaction deadline</Trans>
            </ThemedText.DeprecatedBlack>
            <QuestionHelper
              text={<Trans>Your transaction will revert if it is pending for more than this period of time.</Trans>}
            />
          </RowFixed>
          <RowFixed>
            <OptionCustom style={{ width: '80px' }} warning={!!deadlineError} tabIndex={-1}>
              <Input
                placeholder={(DEFAULT_DEADLINE_FROM_NOW / 60).toString()}
                value={
                  deadlineInput.length > 0
                    ? deadlineInput
                    : deadline === DEFAULT_DEADLINE_FROM_NOW
                    ? ''
                    : (deadline / 60).toString()
                }
                onChange={(e) => parseCustomDeadline(e.target.value)}
                onBlur={() => {
                  setDeadlineInput('')
                  setDeadlineError(false)
                }}
                color={deadlineError ? 'red' : ''}
              />
            </OptionCustom>
            <ThemedText.DeprecatedBody style={{ paddingLeft: '8px' }} fontSize={14}>
              <Trans>minutes</Trans>
            </ThemedText.DeprecatedBody>
          </RowFixed>
        </AutoColumn>
      )}
    </AutoColumn>
  )
}
