import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import { formatNumberOrString, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
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
import { usePool } from 'hooks/usePools'
import { useUSDPrice } from 'hooks/useUSDPrice'
import useCurrencyBalance from 'lib/hooks/useCurrencyBalance'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Info } from 'react-feather'
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

import { AlteredPositionProperties } from './LeveragePositionModal'
import ConfirmModifyPositionModal from './TransactionModal'

interface DerivedDepositPremiumInfo {
  newDepositAmount: TokenBN
  amount: TokenBN
}

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
`

const StyledBGCard = styled(StyledCard)`
  background: ${({ theme }) => theme.surface1};
`

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
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

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`

function useDerivedDepositPremiumInfo(
  amount: string,
  positionKey: TraderPositionKey,
  position: MarginPositionDetails | undefined,
  setState: (state: DerivedInfoState) => void,
  onPositionChange: (newPosition: AlteredPositionProperties) => void
): {
  txnInfo: DerivedDepositPremiumInfo | undefined
  inputError: ReactNode | undefined
} {
  const marginFacility = useMarginFacilityContract()
  const inputCurrency = useCurrency(
    position?.isToken0 ? positionKey.poolKey.token1Address : positionKey.poolKey.token0Address
  )
  const outputCurrency = useCurrency(
    position?.isToken0 ? positionKey.poolKey.token0Address : positionKey.poolKey.token1Address
  )

  const parsedAmount = useMemo(() => {
    return parseBN(amount)
  }, [amount])

  const [txnInfo, setTxnInfo] = useState<DerivedDepositPremiumInfo>()
  const [contractError, setContractError] = useState<React.ReactNode>()
  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)

  const { account } = useWeb3React()

  useEffect(() => {
    const lagged = async () => {
      if (
        !marginFacility ||
        !position ||
        !parsedAmount ||
        !parsedAmount.isGreaterThan(0) ||
        !pool ||
        !inputCurrency ||
        !outputCurrency ||
        !account
      ) {
        setState(DerivedInfoState.INVALID)
        setTxnInfo(undefined)
        onPositionChange({})
        return
      }

      setState(DerivedInfoState.LOADING)

      try {
        await marginFacility.callStatic.depositPremium(
          {
            token0: positionKey.poolKey.token0Address,
            token1: positionKey.poolKey.token1Address,
            fee: positionKey.poolKey.fee,
          },
          account,
          positionKey.isToken0,
          parsedAmount.shiftedBy(inputCurrency.decimals).toFixed(0)
        )

        const info: DerivedDepositPremiumInfo = {
          newDepositAmount: new TokenBN(position.premiumLeft.plus(parsedAmount), inputCurrency.wrapped, false),
          amount: new TokenBN(parsedAmount, inputCurrency.wrapped, false),
        }
        onPositionChange({
          premiumLeft: position.premiumLeft.plus(parsedAmount),
        })

        setTxnInfo(info)
        setState(DerivedInfoState.VALID)
        setContractError(undefined)
      } catch (err) {
        console.log('reduce error', err)
        setState(DerivedInfoState.INVALID)
        onPositionChange({})
        setContractError(err)
        setTxnInfo(undefined)
      }
    }

    lagged()
  }, [
    onPositionChange,
    setState,
    pool,
    marginFacility,
    account,
    parsedAmount,
    position,
    positionKey,
    inputCurrency,
    outputCurrency,
  ])

  const inputError = useMemo(() => {
    let error: React.ReactNode | undefined

    if (!parsedAmount || parsedAmount.isLessThanOrEqualTo(0)) {
      error = <Trans>Enter an amount</Trans>
    }

    return error
  }, [parsedAmount])

  return useMemo(() => {
    return {
      txnInfo,
      inputError,
    }
  }, [txnInfo, inputError])
}

export function DepositPremiumContent({
  positionKey,
  onPositionChange,
  inputCurrency,
  outputCurrency,
  positionData,
}: {
  positionKey: TraderPositionKey
  onPositionChange: (newPosition: AlteredPositionProperties) => void
  inputCurrency: Currency | undefined
  outputCurrency: Currency | undefined
  positionData: {
    position: MarginPositionDetails | undefined
    loading: boolean
  }
}) {
  const { position, loading: positionLoading } = positionData
  // state inputs, derived, handlers for trade confirmation
  const [amount, setAmount] = useState('')
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [showDetails, setShowDetails] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [tradeState, setTradeState] = useState<DerivedInfoState>(DerivedInfoState.INVALID)
  // const { position, loading: positionLoading } = useMarginLMTPositionFromPositionId(positionKey)
  const [errorMessage, setErrorMessage] = useState<string>()

  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)

  const { txnInfo, inputError } = useDerivedDepositPremiumInfo(
    amount,
    positionKey,
    position,
    setTradeState,
    onPositionChange
  )
  const { account, chainId, provider } = useWeb3React()

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
      if (!provider) throw new Error('missing provider')
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
        gasEstimate = await provider.estimateGas(tx)
      } catch (gasError) {
        console.log('gasError', gasError)
        throw new Error('gasError')
      }

      const gasLimit = calculateGasMargin(gasEstimate)

      const response = await provider
        .getSigner()
        .sendTransaction({ ...tx, gasLimit })
        .then((response) => {
          return response
        })
      return response
    } catch (err) {
      throw new Error(getErrorMessage(parseContractError(err)))
    }
  }, [
    account,
    chainId,
    provider,
    txnInfo,
    position,
    pool,
    outputCurrency,
    inputCurrency,
    tradeState,
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
          type: TransactionType.PREMIUM_LEVERAGE_DEPOSIT,
          inputCurrencyId: inputCurrency.wrapped.address,
          outputCurrencyId: outputCurrency.wrapped.address,
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

  // const theme = useTheme()

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
    <DarkCard width="390px" margin="0" padding="0" style={{ paddingRight: '1rem', paddingLeft: '1rem' }}>
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
          title="Confirm Deposit Premium"
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
    </DarkCard>
  )
}

// deposit amount, new deposit, fiat values, old position health, new position health

export function BaseFooter({
  onConfirm,
  errorMessage,
  disabledConfirm,
  confirmText,
}: {
  confirmText: string
  onConfirm: () => void
  errorMessage: ReactNode | undefined
  disabledConfirm: boolean
}) {
  return (
    <>
      <AutoRow justify="center">
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          style={{ margin: '10px 0 0 0', width: 'fit-content', borderRadius: '10px' }}
        >
          <Text fontSize={14} fontWeight={500}>
            <Trans>{confirmText}</Trans>
          </Text>
        </ButtonError>
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
              <Text fontSize={16} fontWeight={300} marginRight="6px">
                You Deposit
              </Text>
              <CurrencyLogo currency={inputCurrency} size="15px" style={{ marginRight: '4px' }} />
              <Text fontSize={16} fontWeight={500}>
                {txnInfo?.amount.tokenSymbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween align="center">
            <RowFixed gap="0px">
              <TruncatedText fontSize={16} fontWeight={500} color={theme.textSecondary}>
                {formatBNToString(txnInfo?.newDepositAmount, NumberType.SwapTradeAmount)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap="0px">
              <Text fontSize={16} fontWeight={300} marginRight="6px">
                Resulting Premium Deposit
              </Text>
              <CurrencyLogo currency={inputCurrency} size="15px" style={{ marginRight: '4px' }} />
              <Text fontSize={16} fontWeight={500}>
                {txnInfo?.newDepositAmount.tokenSymbol}
              </Text>
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

function DepositDetails({ txnInfo, loading }: { txnInfo: DerivedDepositPremiumInfo | undefined; loading: boolean }) {
  return (
    <StyledCard>
      <ValueLabel
        label="New Deposit Amount"
        description="Resulting Deposit Amount"
        value={formatBNToString(txnInfo?.newDepositAmount, NumberType.SwapTradeAmount)}
        symbolAppend={txnInfo?.newDepositAmount?.tokenSymbol}
        syncing={loading}
      />
    </StyledCard>
  )
}
