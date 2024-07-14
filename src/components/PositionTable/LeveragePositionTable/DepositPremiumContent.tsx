import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { formatNumberOrString, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { BigNumber as BN } from 'bignumber.js'
import AnimatedDropdown from 'components/AnimatedDropdown'
import SwapCurrencyInputPanelV2 from 'components/BaseSwapPanel/CurrencyInputPanel'
import { ButtonError, ButtonPrimary } from 'components/Button'
import { DarkCard, LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Icons/LoadingSpinner'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import {
  RotatingArrow,
  Spinner,
  StyledCard,
  StyledInfoIcon,
  StyledPolling,
  StyledPollingDot,
  TransactionDetails,
  TruncatedText,
} from 'components/modalFooters/common'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { ValueLabel } from 'components/swap/AdvancedSwapDetails'
import { CallbackError } from 'components/swap/styleds'
import { MouseoverTooltip } from 'components/Tooltip'
import { LMT_MARGIN_FACILITY } from 'constants/addresses'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useMarginFacilityContract } from 'hooks/useContract'
import { usePoolV2 } from 'hooks/usePools'
import { useUSDPrice } from 'hooks/useUSDPrice'
import useCurrencyBalance from 'lib/hooks/useCurrencyBalance'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { MarginFacility } from 'LmtTypes'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Info } from 'react-feather'
import { Text } from 'rebass'
import { parseBN } from 'state/marginTrading/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import styled, { useTheme } from 'styled-components/macro'
import { HideSmall, ThemedText } from 'theme'
import { MarginPositionDetails, TraderPositionKey } from 'types/lmtv2position'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { getErrorMessage, parseContractError } from 'utils/lmtSDK/errors'
import { TokenBN } from 'utils/lmtSDK/internalConstants'
import { DepositPremiumOptions, MarginFacilitySDK } from 'utils/lmtSDK/MarginFacility'
import { useAccount, useChainId } from 'wagmi'
import { useEthersSigner } from 'wagmi-lib/adapters'

import { AlteredPositionProperties } from './LeveragePositionModal'
import ConfirmModifyPositionModal from './TransactionModal'

interface DerivedDepositPremiumInfo {
  newDepositAmount: TokenBN
  amount: TokenBN
}

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
`

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  gap: 1rem;
  /* height: 100%; */
  width: 100%;
  margin-top: 0.5rem;
`

const StyledHeaderRow = styled(RowBetween)<{ disabled: boolean; open: boolean }>`
  padding: 0;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
`

enum DerivedInfoState {
  LOADING,
  VALID,
  INVALID,
  SYNCING, // syncing means already loaded valid info, but updating to newest info
}

const InputSection = styled.div`
  background-color: ${({ theme }) => theme.surface1};
  margin-bottom: 10px;
  padding: 10px;
  margin-top: 5px;
  &:focus-within {
    border: 1px solid ${({ theme }) => theme.accentActive};
  }
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  color: ${({ theme }) => theme.textSecondary};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
`

interface DepositPremiumParams {
  account?: string
  marginFacility?: MarginFacility
  positionKey: TraderPositionKey
  inputCurrency?: Currency
  outputCurrency?: Currency
  parsedAmount?: BN
}

function useDerivedDepositPremiumInfo(
  amount: string,
  positionKey: TraderPositionKey,
  position: MarginPositionDetails | undefined,
  onPositionChange: (newPosition: AlteredPositionProperties) => void,
  handleTxnInfo: (txnInfo: DerivedDepositPremiumInfo | undefined | null) => void
): {
  txnInfo: DerivedDepositPremiumInfo | undefined
  tradeState: DerivedInfoState
  inputError: ReactNode | undefined
} {
  const marginFacility = useMarginFacilityContract(true)
  const inputCurrency = useCurrency(position?.isToken0 ? positionKey.poolKey.token1 : positionKey.poolKey.token0)
  const outputCurrency = useCurrency(position?.isToken0 ? positionKey.poolKey.token0 : positionKey.poolKey.token1)

  const parsedAmount = useMemo(() => {
    return parseBN(amount)
  }, [amount])

  const account = useAccount().address

  const queryKeys = useMemo(() => {
    if (!marginFacility || !parsedAmount || !inputCurrency || !outputCurrency || parsedAmount.isLessThanOrEqualTo(0)) {
      return []
    }

    return ['depositPremium', parsedAmount.toString()]
  }, [marginFacility, parsedAmount, inputCurrency, outputCurrency])

  const simulateTxn = useCallback(async () => {
    if (
      !marginFacility ||
      !positionKey ||
      !inputCurrency ||
      !outputCurrency ||
      !positionKey ||
      !parsedAmount ||
      parsedAmount.isLessThanOrEqualTo(0) ||
      !account
    ) {
      throw new Error('invalid params')
    }

    // simulate the txn
    await marginFacility.callStatic.depositPremium(
      {
        token0: positionKey.poolKey.token0,
        token1: positionKey.poolKey.token1,
        fee: positionKey.poolKey.fee,
      },
      account,
      positionKey.isToken0,
      parsedAmount.shiftedBy(inputCurrency.decimals).toFixed(0)
    )
    return true
  }, [marginFacility, inputCurrency, outputCurrency, positionKey, parsedAmount, account, positionKey])

  const { isLoading, isError, data, error } = useQuery({
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 2000,
    refetchOnMount: false,
    refetchOnReconnect: true,
    enabled: queryKeys.length > 0,
    queryKey: queryKeys,
    queryFn: simulateTxn,
  })

  const inputError = useMemo(() => {
    let _error: React.ReactNode | undefined

    if (!parsedAmount || parsedAmount.isLessThanOrEqualTo(0)) {
      _error = <Trans>Enter an amount</Trans>
    }

    if (isError && !!error) {
      _error = <Trans>{getErrorMessage(parseContractError(error))}</Trans>
    }

    return _error
  }, [parsedAmount, isError, error])

  useEffect(() => {
    if (parsedAmount && position && inputCurrency) {
      onPositionChange({ premiumLeft: position?.premiumLeft.minus(parsedAmount) })
      handleTxnInfo({
        newDepositAmount: new TokenBN(position?.premiumLeft.plus(parsedAmount), inputCurrency?.wrapped, false),
        amount: new TokenBN(parsedAmount, inputCurrency.wrapped, false),
      })
    } else {
      if (position) {
        onPositionChange({})
        handleTxnInfo(null)
      }
    }
  }, [parsedAmount, position, onPositionChange, handleTxnInfo, inputCurrency])

  return useMemo(() => {
    if (data && position && parsedAmount && inputCurrency && !!queryKeys.length) {
      return {
        txnInfo: {
          newDepositAmount: new TokenBN(position.premiumLeft.plus(parsedAmount), inputCurrency.wrapped, false),
          amount: new TokenBN(parsedAmount, inputCurrency.wrapped, false),
        },
        tradeState: isLoading ? DerivedInfoState.LOADING : DerivedInfoState.VALID,
        inputError,
      }
    }

    if (isError || !!inputError) {
      return {
        txnInfo: undefined,
        tradeState: DerivedInfoState.INVALID,
        inputError,
      }
    }

    if (isLoading) {
      return {
        txnInfo: undefined,
        tradeState: DerivedInfoState.LOADING,
        inputError,
      }
    }

    return {
      txnInfo: undefined,
      tradeState: DerivedInfoState.INVALID,
      inputError,
    }
  }, [inputError, position, data, isLoading, isError, parsedAmount, inputCurrency, queryKeys])
}

const CardWrapper = styled(DarkCard)`
  width: 390px;
  margin: 0;
  padding: 0;
  padding-right: 1rem;
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`

export default function DepositPremiumContent({
  positionKey,
  onPositionChange,
  inputCurrency,
  outputCurrency,
  positionData,
  handleTxnInfo,
}: {
  positionKey: TraderPositionKey
  onPositionChange: (newPosition: AlteredPositionProperties) => void
  inputCurrency: Currency | undefined
  outputCurrency: Currency | undefined
  positionData: {
    position: MarginPositionDetails | undefined
    loading: boolean
  }
  handleTxnInfo: (txnInfo: DerivedDepositPremiumInfo | undefined | null) => void
}) {
  const { position } = positionData
  // state inputs, derived, handlers for trade confirmation
  const [amount, setAmount] = useState('')
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [showDetails, setShowDetails] = useState(true)
  const [showModal, setShowModal] = useState(false)
  // const [tradeState, setTradeState] = useState<DerivedInfoState>(DerivedInfoState.INVALID)
  const [errorMessage, setErrorMessage] = useState<string>()

  const [, pool] = usePoolV2(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)

  const { txnInfo, inputError, tradeState } = useDerivedDepositPremiumInfo(
    amount,
    positionKey,
    position,
    onPositionChange,
    handleTxnInfo
  )

  const account = useAccount().address
  const chainId = useChainId()
  const signer = useEthersSigner({ chainId })

  const currencyAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    if (!amount || !inputCurrency || isNaN(Number(amount))) return undefined
    return CurrencyAmount.fromRawAmount(inputCurrency, new BN(amount).shiftedBy(inputCurrency.decimals).toFixed(0))
  }, [amount, inputCurrency])

  const [approvalState, approve] = useApproveCallback(
    currencyAmount,
    chainId ? LMT_MARGIN_FACILITY[chainId] : undefined
  )
  const updateAllowance = useCallback(async () => {
    try {
      await approve()
    } catch (err) {
      console.log('approve marginFacility err: ', err)
    }
  }, [approve])

  const inputCurrencyBalance = useCurrencyBalance(account, inputCurrency ?? undefined)

  const addTransaction = useTransactionAdder()

  // callback
  const callback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!signer) throw new Error('missing provider')
      if (!txnInfo) throw new Error('missing txn info')
      if (!position) throw new Error('missing position')
      if (!pool || !outputCurrency || !inputCurrency) throw new Error('missing pool')
      if (tradeState !== DerivedInfoState.VALID) throw new Error('invalid trade state')

      const params: DepositPremiumOptions = {
        positionKey,
        amount: new BN(amount).shiftedBy(inputCurrency.decimals).toFixed(0),
      }

      const { calldata } = MarginFacilitySDK.depositPremiumParameters(params)

      const tx = {
        from: account,
        to: LMT_MARGIN_FACILITY[chainId],
        data: calldata,
      }

      let gasEstimate: BigNumber

      try {
        gasEstimate = await signer.estimateGas(tx)
      } catch (gasError) {
        console.log('gasError', gasError)
        throw new Error('gasError')
      }

      const gasLimit = calculateGasMargin(gasEstimate)

      const response = await signer.sendTransaction({ ...tx, gasLimit }).then((response) => {
        return response
      })
      return response
    } catch (err) {
      throw new Error(getErrorMessage(parseContractError(err)))
    }
  }, [
    account,
    chainId,
    signer,
    tradeState,
    txnInfo,
    position,
    pool,
    outputCurrency,
    inputCurrency,
    positionKey,
    amount,
  ])

  const handleDeposit = useCallback(() => {
    if (!callback || !position || !txnInfo || !inputCurrency || !outputCurrency) {
      return
    }
    setAttemptingTxn(true)

    callback()
      .then((response) => {
        setAttemptingTxn(false)
        setTxHash(response?.hash)
        setErrorMessage(undefined)
        addTransaction(response, {
          type: TransactionType.PREMIUM_DEPOSIT,
          inputCurrencyId: inputCurrency.wrapped.address,
          outputCurrencyId: outputCurrency.wrapped.address,
          amount: formatBNToString(txnInfo.amount, NumberType.SwapTradeAmount),
        })
        return response.hash
      })
      .catch((error) => {
        console.error(error)
        setAttemptingTxn(false)
        setTxHash(undefined)
        setErrorMessage(error.message)
      })
  }, [
    callback,
    position,
    txnInfo,
    inputCurrency,
    outputCurrency,
    addTransaction,
    setAttemptingTxn,
    setTxHash,
    setErrorMessage,
  ])

  const loading = useMemo(() => tradeState === DerivedInfoState.LOADING, [tradeState])

  const handleDismiss = useCallback(() => {
    if (txHash) {
      setAmount('')
    }
    setShowModal(false)
    setAttemptingTxn(false)
    setTxHash(undefined)
    setErrorMessage(undefined)
  }, [setShowModal, setAttemptingTxn, setTxHash, setErrorMessage, setAmount, txHash])

  const fiatDepositAmount = useUSDPrice(currencyAmount)
  const theme = useTheme()
  return (
    <CardWrapper>
      {showModal && (
        <ConfirmModifyPositionModal
          onDismiss={handleDismiss}
          isOpen={showModal}
          attemptingTxn={attemptingTxn}
          txHash={txHash}
          header={<DepositPremiumHeader txnInfo={txnInfo} loading={loading} inputCurrency={inputCurrency} />}
          bottom={
            <BaseFooter
              errorMessage={errorMessage ? <Trans>{errorMessage}</Trans> : null}
              onConfirm={handleDeposit}
              confirmText="Confirm Deposit"
              disabledConfirm={!!inputError || !txnInfo}
            />
          }
          title="Confirm Deposit Iterest"
          pendingText={<Trans>Depositing ...</Trans>}
          currencyToAdd={outputCurrency ?? undefined}
          recipient={account ?? null}
          errorMessage={errorMessage ? <Trans>{errorMessage}</Trans> : null}
        />
      )}
      <InputWrapper>
        <InputSection>
          <SwapCurrencyInputPanelV2
            value={amount}
            fiatValue={fiatDepositAmount}
            onUserInput={(str: string) => {
              if (inputCurrencyBalance) {
                const balance = inputCurrencyBalance.toExact()
                if (str === '') {
                  setAmount('')
                } else if (Number(str) > Number(balance)) {
                  return
                } else {
                  setAmount(str)
                }
              }
            }}
            showFiat={true}
            showMaxButton={true}
            onMax={() => {
              inputCurrencyBalance && setAmount(inputCurrencyBalance.toExact())
            }}
            currency={inputCurrency ?? undefined}
            label="Deposit Amount"
            id="deposit-premium-input"
          />
        </InputSection>
        <TransactionDetails>
          <Wrapper style={{ marginTop: '0' }}>
            <AutoColumn gap="sm" style={{ width: '100%', marginBottom: '-8px' }}>
              <StyledHeaderRow onClick={() => setShowDetails(!showDetails)} disabled={false} open={showDetails}>
                <RowFixed style={{ position: 'relative' }}>
                  {loading ? (
                    <StyledPolling>
                      <StyledPollingDot>
                        <Spinner />
                      </StyledPollingDot>
                    </StyledPolling>
                  ) : (
                    <HideSmall>
                      <StyledInfoIcon color={theme.deprecated_bg3} />
                    </HideSmall>
                  )}
                  {loading ? (
                    <ThemedText.BodySmall>
                      <Trans>Fetching details...</Trans>
                    </ThemedText.BodySmall>
                  ) : (
                    <LoadingOpacityContainer $loading={loading}>
                      <ThemedText.BodySmall>Trade Details </ThemedText.BodySmall>
                    </LoadingOpacityContainer>
                  )}
                </RowFixed>
                <RowFixed>
                  <RotatingArrow stroke={theme.textTertiary} open={Boolean(showDetails)} />
                </RowFixed>
              </StyledHeaderRow>
              <AnimatedDropdown open={showDetails}>
                <AutoColumn gap="sm" style={{ padding: '0', paddingBottom: '8px' }}>
                  <DepositDetails txnInfo={txnInfo} loading={loading} />
                </AutoColumn>
              </AnimatedDropdown>
            </AutoColumn>
          </Wrapper>
        </TransactionDetails>
      </InputWrapper>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        {!inputError && approvalState !== ApprovalState.APPROVED ? (
          <ButtonPrimary
            onClick={updateAllowance}
            style={{ fontSize: '12px', borderRadius: '10px', width: 'fit-content', height: '15px' }}
            padding=".25rem"
            disabled={approvalState === ApprovalState.PENDING}
          >
            {approvalState === ApprovalState.PENDING ? (
              <>
                <Loader size="20px" />
                <Trans>Approval pending</Trans>
              </>
            ) : (
              <>
                <MouseoverTooltip
                  text={
                    <Trans>
                      Permission is required for Limitless to use each token.{' '}
                      {`Allowance of ${formatNumberOrString(Number(amount), NumberType.SwapTradeAmount)} ${
                        inputCurrency?.symbol
                      } required.`}
                    </Trans>
                  }
                >
                  <RowBetween>
                    <Info size={20} />
                    <Trans>Approve use of {inputCurrency?.symbol}</Trans>
                  </RowBetween>
                </MouseoverTooltip>
              </>
            )}
          </ButtonPrimary>
        ) : (
          <ButtonError
            style={{ fontSize: '12px', borderRadius: '10px', width: 'fit-content', height: '15px' }}
            padding=".25rem"
            onClick={() => {
              setShowModal(true)
            }}
            id="leverage-button"
            disabled={!!inputError || tradeState !== DerivedInfoState.VALID}
          >
            <ThemedText.BodySmall fontWeight={600}>
              {inputError ? (
                inputError
              ) : tradeState !== DerivedInfoState.VALID ? (
                <Trans>Invalid Transaction</Trans>
              ) : (
                <Trans>Execute</Trans>
              )}
            </ThemedText.BodySmall>
          </ButtonError>
        )}
      </div>
    </CardWrapper>
  )
}

// deposit amount, new deposit, fiat values, old position health, new position health

export function BaseFooter({
  onConfirm,
  errorMessage,
  disabledConfirm,
  confirmText,
  showAcceptChanges,
  onAcceptChanges,
}: {
  confirmText: string
  onConfirm: () => void
  errorMessage: ReactNode | undefined
  disabledConfirm: boolean
  onAcceptChanges?: () => void
  showAcceptChanges?: boolean
}) {
  const theme = useTheme()
  return (
    <>
      <AutoRow justify="center">
        {onAcceptChanges ? (
          showAcceptChanges ? (
            <LightCard>
              <RowBetween>
                <MouseoverTooltip
                  text={'the price has been updated, please accept the changes to execute the transaction'}
                >
                  <RowFixed>
                    <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
                    <ThemedText.DeprecatedMain color={theme.textSecondary}>
                      <Trans>New Execution Price</Trans>
                    </ThemedText.DeprecatedMain>
                  </RowFixed>
                </MouseoverTooltip>
                <ButtonPrimary
                  style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '12px' }}
                  onClick={onAcceptChanges}
                >
                  <Trans>Accept Changes</Trans>
                </ButtonPrimary>
              </RowBetween>
            </LightCard>
          ) : (
            <ButtonError
              onClick={onConfirm}
              disabled={disabledConfirm}
              style={{ margin: '10px 0 0 0', width: 'fit-content', borderRadius: '10px' }}
            >
              <Text fontSize={14} fontWeight={500}>
                <Trans>{confirmText}</Trans>
              </Text>
            </ButtonError>
          )
        ) : (
          <ButtonError
            onClick={onConfirm}
            disabled={disabledConfirm}
            style={{ margin: '10px 0 0 0', width: 'fit-content', borderRadius: '10px' }}
          >
            <Text fontSize={14} fontWeight={500}>
              <Trans>{confirmText}</Trans>
            </Text>
          </ButtonError>
        )}
        {errorMessage ? <CallbackError error={errorMessage} /> : null}
      </AutoRow>
    </>
  )
}

const HeaderWrapper = styled(AutoColumn)`
  margin-top: 1rem;
  margin-bottom: 1rem;
`
function DepositPremiumHeader({
  txnInfo,
  loading,
  inputCurrency,
}: {
  txnInfo: DerivedDepositPremiumInfo | undefined
  loading: boolean
  inputCurrency: Currency | undefined
}) {
  const theme = useTheme()
  return (
    <HeaderWrapper>
      <LightCard padding="0.75rem 1rem">
        <AutoColumn gap="md">
          <RowBetween align="center">
            <RowFixed gap="0px">
              <TruncatedText fontSize={16} fontWeight={500} color={theme.textSecondary}>
                {formatBNToString(txnInfo?.amount, NumberType.SwapTradeAmount)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <ThemedText.BodySmall marginRight="10px">You Deposit</ThemedText.BodySmall>
              <CurrencyLogo currency={inputCurrency} size="15px" style={{ marginRight: '4px' }} />
              <ThemedText.BodySecondary>{txnInfo?.amount.tokenSymbol}</ThemedText.BodySecondary>
            </RowFixed>
          </RowBetween>
          <RowBetween align="center">
            <RowFixed gap="0px">
              <TruncatedText fontSize={16} fontWeight={500} color={theme.textSecondary}>
                {formatBNToString(txnInfo?.newDepositAmount, NumberType.SwapTradeAmount)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <ThemedText.BodySmall fontSize="11px" marginRight="10px" textAlign="end">
                Resulting Interest Deposit
              </ThemedText.BodySmall>
              <CurrencyLogo currency={inputCurrency} size="15px" style={{ marginRight: '4px' }} />
              <ThemedText.BodySecondary>{txnInfo?.newDepositAmount.tokenSymbol}</ThemedText.BodySecondary>
            </RowFixed>
          </RowBetween>
          {/* <RowBetween>
            <FiatValue fiatValue={fiatValueInput} />
          </RowBetween> */}
        </AutoColumn>
      </LightCard>
    </HeaderWrapper>
  )
}
const DetailsWrapper = styled(StyledCard)`
  background-color: ${({ theme }) => theme.surface1};
`
function DepositDetails({ txnInfo, loading }: { txnInfo: DerivedDepositPremiumInfo | undefined; loading: boolean }) {
  return (
    <DetailsWrapper>
      <ValueLabel
        label="New Deposit Amount"
        description="Resulting Deposit Amount"
        value={formatBNToString(txnInfo?.newDepositAmount, NumberType.SwapTradeAmount)}
        symbolAppend={txnInfo?.newDepositAmount?.tokenSymbol}
        syncing={loading}
      />
    </DetailsWrapper>
  )
}
