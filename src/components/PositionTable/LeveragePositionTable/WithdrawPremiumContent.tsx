import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import AnimatedDropdown from 'components/AnimatedDropdown'
import SwapCurrencyInputPanelV2 from 'components/BaseSwapPanel/CurrencyInputPanel'
import { ButtonError } from 'components/Button'
import { DarkCard, LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
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
import Row, { RowBetween, RowFixed } from 'components/Row'
import { ValueLabel } from 'components/swap/AdvancedSwapDetails'
import Toggle from 'components/Toggle'
import { useCurrency } from 'hooks/Tokens'
import { useMarginFacilityContract } from 'hooks/useContract'
import { usePool } from 'hooks/usePools'
import useCurrencyBalance from 'lib/hooks/useCurrencyBalance'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Text } from 'rebass'
import { parseBN } from 'state/marginTrading/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import { useTheme } from 'styled-components/macro'
import styled from 'styled-components/macro'
import { HideSmall, ThemedText } from 'theme'
import { MarginPositionDetails, TraderPositionKey } from 'types/lmtv2position'
import { getErrorMessage, parseContractError } from 'utils/lmtSDK/errors'
import { TokenBN } from 'utils/lmtSDK/internalConstants'

import { BaseFooter } from './DepositPremiumContent'
import { AlteredPositionProperties } from './LeveragePositionModal'
import ConfirmModifyPositionModal from './TransactionModal'

interface DerivedWithdrawPremiumInfo {
  newDepositAmount: TokenBN
  amount: TokenBN
}

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
`

const StyledBGCard = styled(StyledCard)`
  background: ${({ theme }) => theme.surface1};
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`

const StyledHeaderRow = styled(RowBetween)<{ disabled: boolean; open: boolean }>`
  padding: 0;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
`

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
`

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

enum DerivedInfoState {
  LOADING,
  VALID,
  INVALID,
  SYNCING, // syncing means already loaded valid info, but updating to newest info
}

const CloseText = styled(ThemedText.LabelSmall)<{ isActive: boolean }>`
  color: ${({ theme, isActive }) => (isActive ? theme.textSecondary : theme.textPrimary)};
`

function useDerivedWithdrawPremiumInfo(
  amount: string,
  positionKey: TraderPositionKey,
  position: MarginPositionDetails | undefined,
  setState: (state: DerivedInfoState) => void,
  onPositionChange: (newPos: AlteredPositionProperties) => void,
  withdrawAll: boolean
): {
  txnInfo: DerivedWithdrawPremiumInfo | undefined
  inputError: ReactNode | undefined
} {
  const marginFacility = useMarginFacilityContract()
  const inputCurrency = useCurrency(
    position?.isToken0 ? positionKey.poolKey.token1Address : positionKey.poolKey.token0Address
  )
  const outputCurrency = useCurrency(
    position?.isToken0 ? positionKey.poolKey.token0Address : positionKey.poolKey.token1Address
  )

  const [txnInfo, setTxnInfo] = useState<DerivedWithdrawPremiumInfo>()
  const [contractError, setContractError] = useState<React.ReactNode>()
  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)

  const { account } = useWeb3React()

  const parsedAmount = useMemo(() => parseBN(amount), [amount])

  useEffect(() => {
    const lagged = async () => {
      if (
        !marginFacility ||
        !position ||
        !parsedAmount ||
        parsedAmount.isLessThanOrEqualTo(0) ||
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
        await marginFacility.callStatic.withdrawPremium(
          {
            token0: positionKey.poolKey.token0Address,
            token1: positionKey.poolKey.token1Address,
            fee: positionKey.poolKey.fee,
          },
          positionKey.isToken0,
          withdrawAll
            ? position.premiumLeft.shiftedBy(inputCurrency.decimals).toFixed(0)
            : parsedAmount.shiftedBy(inputCurrency.decimals).toFixed(0)
        )

        const info: DerivedWithdrawPremiumInfo = {
          newDepositAmount: withdrawAll
            ? new TokenBN(0, inputCurrency.wrapped, false)
            : new TokenBN(position.premiumLeft.minus(parsedAmount), inputCurrency.wrapped, false),
          amount: withdrawAll
            ? new TokenBN(position.premiumLeft, inputCurrency.wrapped, false)
            : new TokenBN(parsedAmount, inputCurrency.wrapped, false),
        }

        onPositionChange({
          premiumLeft: info.newDepositAmount,
        })

        setTxnInfo(info)
        setState(DerivedInfoState.VALID)
        setContractError(undefined)
      } catch (err) {
        setState(DerivedInfoState.INVALID)
        setContractError(err)
        setTxnInfo(undefined)
        onPositionChange({})
      }
    }

    lagged()
  }, [
    setState,
    onPositionChange,
    pool,
    marginFacility,
    account,
    parsedAmount,
    position,
    positionKey,
    inputCurrency,
    outputCurrency,
    withdrawAll,
  ])

  const inputError = useMemo(() => {
    let error: React.ReactNode | undefined

    if (!parsedAmount || parsedAmount.isLessThanOrEqualTo(0)) {
      error = error ?? <Trans>Enter an amount</Trans>
    }
    if (!withdrawAll && parsedAmount && position && parsedAmount.gt(position.premiumLeft)) {
      error = error ?? <Trans>Withdraw amount exceeds current deposit</Trans>
    }
    return error
  }, [parsedAmount, position, withdrawAll])

  return useMemo(() => {
    return {
      txnInfo,
      inputError,
    }
  }, [txnInfo, inputError])
}

export function WithdrawPremiumContent({
  positionKey,
  onPositionChange,
  inputCurrency,
  outputCurrency,
  positionData,
}: {
  positionKey: TraderPositionKey
  onPositionChange: (newPos: AlteredPositionProperties) => void
  inputCurrency: Currency | undefined
  outputCurrency: Currency | undefined
  positionData: { position: MarginPositionDetails | undefined; loading: boolean }
}) {
  const { position, loading: positionLoading } = positionData
  // state inputs, derived, handlers for trade confirmation
  const [amount, setAmount] = useState('')
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [showDetails, setShowDetails] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [tradeState, setTradeState] = useState<DerivedInfoState>(DerivedInfoState.INVALID)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [withdrawAll, setWithdrawAll] = useState<boolean>(false)

  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)

  const { txnInfo, inputError } = useDerivedWithdrawPremiumInfo(
    amount,
    positionKey,
    position,
    setTradeState,
    onPositionChange,
    withdrawAll
  )

  const { account, chainId, provider } = useWeb3React()

  const inputCurrencyBalance = useCurrencyBalance(account, inputCurrency ?? undefined)

  const marginFacility = useMarginFacilityContract(true)

  const addTransaction = useTransactionAdder()

  // callback
  const callback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!provider) throw new Error('missing provider')
      if (!txnInfo) throw new Error('missing txn info')
      if (!marginFacility) throw new Error('missing marginFacility contract')
      if (!position) throw new Error('missing position')
      if (!pool || !outputCurrency || !inputCurrency) throw new Error('missing pool')
      if (tradeState !== DerivedInfoState.VALID) throw new Error('invalid trade state')
      const response = await marginFacility.withdrawPremium(
        {
          token0: positionKey.poolKey.token0Address,
          token1: positionKey.poolKey.token1Address,
          fee: positionKey.poolKey.fee,
        },
        positionKey.isToken0,
        new BN(amount).shiftedBy(inputCurrency.decimals).toFixed(0)
      )

      return response
    } catch (err) {
      throw new Error(getErrorMessage(parseContractError(err)))
    }
  }, [
    account,
    chainId,
    provider,
    txnInfo,
    marginFacility,
    position,
    pool,
    outputCurrency,
    inputCurrency,
    tradeState,
    positionKey,
    amount,
  ])

  const handleWithdraw = useCallback(() => {
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
        setErrorMessage(error.message)
        setTxHash(undefined)
        setAttemptingTxn(false)
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

  useEffect(() => {
    if (withdrawAll && position) {
      setAmount(String(position.premiumLeft.toNumber().toString()))
    }
  }, [position, withdrawAll])

  const theme = useTheme()

  const loading = useMemo(() => tradeState === DerivedInfoState.LOADING, [tradeState])

  const handleDismiss = useCallback(() => {
    if (txHash) {
      setAmount('')
    }
    setShowModal(false)
    setAttemptingTxn(false)
    setTxHash(undefined)
    setErrorMessage(undefined)
  }, [txHash])

  return (
    <DarkCard width="390px" margin="0" padding="0" style={{ paddingRight: '1rem', paddingLeft: '1rem' }}>
      {showModal && (
        <ConfirmModifyPositionModal
          title="Confirm Withdraw Premium"
          onDismiss={handleDismiss}
          isOpen={showModal}
          attemptingTxn={attemptingTxn}
          txHash={txHash}
          header={<WithdrawPremiumHeader txnInfo={txnInfo} loading={loading} inputCurrency={inputCurrency} />}
          bottom={
            <BaseFooter
              errorMessage={errorMessage ? <Trans>{errorMessage}</Trans> : null}
              onConfirm={handleWithdraw}
              confirmText="Confirm Withdrawal"
              disabledConfirm={!!inputError || !txnInfo}
            />
          }
          pendingText={<Trans>Withdrawing ...</Trans>}
          currencyToAdd={inputCurrency ?? undefined}
          recipient={account ?? null}
          errorMessage={errorMessage ? <Trans>{errorMessage}</Trans> : undefined}
        />
      )}
      <InputWrapper>
        <InputSection>
          <SwapCurrencyInputPanelV2
            label="Withdraw Amount"
            value={withdrawAll ? String(position?.premiumLeft.toNumber()) : amount}
            id="withdraw-premium-input"
            showMaxButton={false}
            onUserInput={(str: string) => {
              if (inputCurrencyBalance) {
                const balance = inputCurrencyBalance.toExact()
                if (str === '') {
                  setAmount('')
                  if (withdrawAll) {
                    setWithdrawAll(false)
                  }
                } else if (Number(str) > Number(balance)) {
                  return
                } else {
                  setAmount(str)
                  if (withdrawAll) {
                    setWithdrawAll(false)
                  }
                }
              }
            }}
            hideBalance={true}
            currency={inputCurrency}
          />
        </InputSection>
        <Row gap="5px">
          <Toggle
            id="toggle-local-routing-button"
            isActive={withdrawAll}
            toggle={() => {
              if (position) {
                if (withdrawAll) {
                  setWithdrawAll(false)
                  setAmount('')
                } else {
                  setWithdrawAll(true)
                  setAmount(String(position.premiumLeft.toNumber()))
                }
              }
            }}
          />
          <CloseText isActive={withdrawAll}>Withdraw All</CloseText>
        </Row>
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
                <WithdrawDetails loading={loading} txnInfo={txnInfo} />
              </AnimatedDropdown>
            </AutoColumn>
          </Wrapper>
        </TransactionDetails>
      </InputWrapper>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <ButtonError
          style={{ fontSize: '14px', borderRadius: '10px', width: 'fit-content', height: '15px' }}
          padding=".25rem"
          onClick={() => setShowModal(true)}
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
      </div>
    </DarkCard>
  )
}

const HeaderWrapper = styled(AutoColumn)`
  margin-top: 1rem;
  margin-bottom: 1rem;
`

function WithdrawPremiumHeader({
  txnInfo,
  loading,
  inputCurrency,
}: {
  txnInfo: DerivedWithdrawPremiumInfo | undefined
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
                You Recieve
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

function WithdrawDetails({ txnInfo, loading }: { txnInfo: DerivedWithdrawPremiumInfo | undefined; loading: boolean }) {
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
