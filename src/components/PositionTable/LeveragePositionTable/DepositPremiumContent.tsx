import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Trans } from '@lingui/macro'
import { formatNumberOrString, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'
import { Pool, priceToClosestTick } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import AnimatedDropdown from 'components/AnimatedDropdown'
import CurrencyInputPanel from 'components/BaseSwapPanel'
import { ButtonError, ButtonPrimary } from 'components/Button'
import { DarkCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Icons/LoadingSpinner'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import {
  RotatingArrow,
  Spinner,
  StyledCard,
  StyledInfoIcon,
  StyledPolling,
  StyledPollingDot,
  TextWithLoadingPlaceholder,
  TransactionDetails,
} from 'components/modalFooters/common'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { ValueLabel } from 'components/swap/AdvancedSwapDetails'
import { CallbackError, TruncatedText } from 'components/swap/styleds'
import { MouseoverTooltip } from 'components/Tooltip'
import { LMT_MARGIN_FACILITY } from 'constants/addresses'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useMarginFacilityContract } from 'hooks/useContract'
import { useMarginLMTPositionFromPositionId } from 'hooks/useLMTV2Positions'
import { usePool } from 'hooks/usePools'
import JSBI from 'jsbi'
import useCurrencyBalance from 'lib/hooks/useCurrencyBalance'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Info } from 'react-feather'
import { Text } from 'rebass'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import { useTheme } from 'styled-components/macro'
import styled from 'styled-components/macro'
import { HideSmall, ThemedText } from 'theme'
import { MarginPositionDetails, TraderPositionKey } from 'types/lmtv2position'

import ConfirmModifyPositionModal from './TransactionModal'

interface DerivedDepositPremiumInfo {
  newDepositAmount: BN
}

const Wrapper = styled.div`
  padding: 1rem;
  padding-top: 0rem;
  background-color: ${({ theme }) => theme.backgroundSurface};
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

enum DerivedInfoState {
  LOADING,
  VALID,
  INVALID,
  SYNCING, // syncing means already loaded valid info, but updating to newest info
}

function useDerivedDepositPremiumInfo(
  amount: string,
  positionKey: TraderPositionKey,
  position: MarginPositionDetails | undefined,
  setState: (state: DerivedInfoState) => void
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

  const [txnInfo, setTxnInfo] = useState<DerivedDepositPremiumInfo>()
  const [contractError, setContractError] = useState<React.ReactNode>()
  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)

  const { account } = useWeb3React()

  useEffect(() => {
    const lagged = async () => {
      if (
        !marginFacility ||
        !position ||
        Number(amount) <= 0 ||
        !amount ||
        !pool ||
        !inputCurrency ||
        !outputCurrency ||
        !account
      ) {
        setState(DerivedInfoState.INVALID)
        setTxnInfo(undefined)
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
          new BN(amount).shiftedBy(inputCurrency.decimals).toFixed(0)
        )

        const info: DerivedDepositPremiumInfo = {
          newDepositAmount: position.premiumDeposit.plus(amount),
        }

        setTxnInfo(info)
        setState(DerivedInfoState.VALID)
        setContractError(undefined)
      } catch (err) {
        console.log('reduce error', err)
        setState(DerivedInfoState.INVALID)
        setContractError(err)
        setTxnInfo(undefined)
      }
    }

    lagged()
  }, [setState, pool, marginFacility, account, amount, position, positionKey, inputCurrency, outputCurrency])

  const inputError = useMemo(() => {
    let error: React.ReactNode | undefined

    if (amount === '') {
      error = <Trans>Enter an amount</Trans>
    }

    return error
  }, [amount])

  return useMemo(() => {
    return {
      txnInfo,
      inputError,
    }
  }, [txnInfo, inputError])
}

export function DepositPremiumContent({ positionKey }: { positionKey: TraderPositionKey }) {
  // state inputs, derived, handlers for trade confirmation
  const [amount, setAmount] = useState('')
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [showDetails, setShowDetails] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [tradeState, setTradeState] = useState<DerivedInfoState>(DerivedInfoState.INVALID)
  const { position, loading: positionLoading } = useMarginLMTPositionFromPositionId(positionKey)
  const [errorMessage, setErrorMessage] = useState<string>()

  const inputCurrency = useCurrency(
    position?.isToken0 ? position?.poolKey?.token1Address : position?.poolKey.token0Address
  )
  const outputCurrency = useCurrency(
    position?.isToken0 ? position?.poolKey?.token0Address : position?.poolKey.token1Address
  )

  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)

  const { txnInfo, inputError } = useDerivedDepositPremiumInfo(amount, positionKey, position, setTradeState)
  const { account, chainId, provider } = useWeb3React()

  const currencyAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    if (!amount || !inputCurrency) return undefined
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

      const response = await marginFacility.depositPremium(
        {
          token0: positionKey.poolKey.token0Address,
          token1: positionKey.poolKey.token1Address,
          fee: positionKey.poolKey.fee,
        },
        account,
        positionKey.isToken0,
        new BN(amount).shiftedBy(inputCurrency.decimals).toFixed(0)
      )

      return response
    } catch (err) {
      console.log('reduce callback error', err)
      throw new Error('reduce callback error')
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
        setAmount('')
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

  const theme = useTheme()

  const loading = useMemo(() => tradeState === DerivedInfoState.LOADING, [tradeState])

  const handleDismiss = useCallback(() => {
    setShowModal(false)
    setAttemptingTxn(false)
    setTxHash(undefined)
    setErrorMessage(undefined)
  }, [])

  return (
    <DarkCard>
      {showModal && (
        <ConfirmModifyPositionModal
          onDismiss={handleDismiss}
          isOpen={showModal}
          attemptingTxn={attemptingTxn}
          txHash={txHash}
          header={<Trans>Premium Position Details here</Trans>}
          bottom={
            <BaseFooter
              errorMessage={<Trans>{errorMessage}</Trans>}
              onConfirm={handleDeposit}
              confirmText="Confirm Deposit"
              disabledConfirm={!!inputError || !txnInfo}
            />
          }
          pendingText={<Trans>Depositing ...</Trans>}
          currencyToAdd={outputCurrency ?? undefined}
          recipient={account ?? null}
          errorMessage={errorMessage ? <Trans>{errorMessage}</Trans> : undefined}
        />
      )}
      <ValueLabel
        description="Current Premium Deposit"
        label="Current Premium Deposit"
        value={formatBNToString(position?.premiumDeposit, NumberType.SwapTradeAmount)}
        syncing={positionLoading}
        symbolAppend={inputCurrency?.symbol}
      />
      <ValueLabel
        description="Current Premium Owed"
        label="Current Premium Owed"
        value={formatBNToString(position?.premiumOwed, NumberType.SwapTradeAmount)}
        syncing={positionLoading}
        symbolAppend={inputCurrency?.symbol}
      />
      <ValueLabel
        description="Current Premium Left"
        label="Current Premium Left"
        value={formatBNToString(position?.premiumLeft, NumberType.SwapTradeAmount)}
        syncing={positionLoading}
        symbolAppend={inputCurrency?.symbol}
      />
      <RowBetween>
        <ThemedText.DeprecatedMain fontWeight={400}>
          <Trans>Deposit Amount</Trans>
        </ThemedText.DeprecatedMain>
      </RowBetween>
      <AutoColumn>
        <CurrencyInputPanel
          value={amount}
          id="deposit-premium-input"
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
          hideBalance={false}
          currency={inputCurrency}
        />
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
                  {position ? (
                    loading ? (
                      <ThemedText.DeprecatedMain fontSize={14}>
                        <Trans>Fetching details...</Trans>
                      </ThemedText.DeprecatedMain>
                    ) : (
                      <LoadingOpacityContainer $loading={loading}>Trade Details</LoadingOpacityContainer>
                    )
                  ) : null}
                </RowFixed>
                <RowFixed>
                  <RotatingArrow stroke={theme.textTertiary} open={Boolean(showDetails)} />
                </RowFixed>
              </StyledHeaderRow>
              <AnimatedDropdown open={showDetails}>
                <AutoColumn gap="sm" style={{ padding: '0', paddingBottom: '8px' }}>
                  {!loading && txnInfo ? (
                    <StyledCard>
                      <AutoColumn gap="sm">
                        <RowBetween>
                          <RowFixed>
                            <MouseoverTooltip text={<Trans>Amount of Collateral Returned</Trans>}>
                              <ThemedText.DeprecatedSubHeader color={theme.textPrimary}>
                                <Trans>New Deposit Amount</Trans>
                              </ThemedText.DeprecatedSubHeader>
                            </MouseoverTooltip>
                          </RowFixed>
                          <TextWithLoadingPlaceholder syncing={loading} width={65}>
                            <ThemedText.DeprecatedBlack textAlign="right" fontSize={14}>
                              <TruncatedText>
                                {txnInfo && `${Number(txnInfo?.newDepositAmount)}  ${inputCurrency?.symbol}`}
                              </TruncatedText>
                            </ThemedText.DeprecatedBlack>
                          </TextWithLoadingPlaceholder>
                        </RowBetween>
                      </AutoColumn>
                    </StyledCard>
                  ) : null}
                </AutoColumn>
              </AnimatedDropdown>
            </AutoColumn>
          </Wrapper>
        </TransactionDetails>
        {!inputError && approvalState !== ApprovalState.APPROVED ? (
          <ButtonPrimary
            onClick={updateAllowance}
            style={{ gap: 14 }}
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
            style={{ fontSize: '14px', borderRadius: '10px' }}
            width="14"
            padding=".25rem"
            onClick={handleDeposit}
            id="leverage-button"
            disabled={!!inputError || tradeState !== DerivedInfoState.VALID}
          >
            <ThemedText.BodyPrimary fontWeight={600}>
              {inputError ? (
                inputError
              ) : tradeState !== DerivedInfoState.VALID ? (
                <Trans>Invalid Transaction</Trans>
              ) : (
                <Trans>Execute</Trans>
              )}
            </ThemedText.BodyPrimary>
          </ButtonError>
        )}
      </AutoColumn>
    </DarkCard>
  )
}

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
      <AutoRow>
        <ButtonError onClick={onConfirm} disabled={disabledConfirm} style={{ margin: '10px 0 0 0' }}>
          <Text fontSize={20} fontWeight={500}>
            <Trans>{confirmText}</Trans>
          </Text>
        </ButtonError>

        {errorMessage ? <CallbackError error={errorMessage} /> : null}
      </AutoRow>
    </>
  )
}

export function getSlippedTicks(
  pool: Pool,
  slippedTickTolerance: Percent
): { slippedTickMin: number; slippedTickMax: number } {
  const pullUp = JSBI.BigInt(10_000 + Math.floor(Number(slippedTickTolerance.toFixed(18)) * 100))

  const pullDown = JSBI.BigInt(10_000 - Math.floor(Number(slippedTickTolerance.toFixed(18)) * 100))

  const minPrice = new Price(
    pool.token0,
    pool.token1,
    JSBI.multiply(pool.token0Price.denominator, JSBI.BigInt(10_000)),
    JSBI.multiply(pool.token0Price.numerator, pullDown)
  )

  const maxPrice = new Price(
    pool.token0,
    pool.token1,
    JSBI.multiply(pool.token0Price.denominator, JSBI.BigInt(10_000)),
    JSBI.multiply(pool.token0Price.numerator, pullUp)
  )

  // get slipped min/max tick
  const slippedTickMax = priceToClosestTick(maxPrice)
  const slippedTickMin = priceToClosestTick(minPrice)

  return {
    slippedTickMax,
    slippedTickMin,
  }
}
