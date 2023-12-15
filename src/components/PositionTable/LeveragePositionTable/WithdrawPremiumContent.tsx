import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import AnimatedDropdown from 'components/AnimatedDropdown'
import CurrencyInputPanel from 'components/BaseSwapPanel'
import { ButtonError } from 'components/Button'
import { DarkCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { Break } from 'components/earn/styled'
import {
  Spinner,
  StyledCard,
  StyledPolling,
  StyledPollingDot,
  TransactionDetails,
} from 'components/modalFooters/common'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { ValueLabel } from 'components/swap/AdvancedSwapDetails'
import { CallbackError } from 'components/swap/styleds'
import { useCurrency } from 'hooks/Tokens'
import { useMarginFacilityContract } from 'hooks/useContract'
import { useMarginLMTPositionFromPositionId } from 'hooks/useLMTV2Positions'
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
import { ThemedText } from 'theme'
import { MarginPositionDetails, TraderPositionKey } from 'types/lmtv2position'

import ConfirmModifyPositionModal from './TransactionModal'

interface DerivedDepositPremiumInfo {
  newDepositAmount: BN
}

const Wrapper = styled.div`
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

function useDerivedWithdrawPremiumInfo(
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
          parsedAmount.shiftedBy(inputCurrency.decimals).toFixed(0)
        )

        const info: DerivedDepositPremiumInfo = {
          newDepositAmount: position.premiumDeposit.plus(parsedAmount),
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
  }, [setState, pool, marginFacility, account, parsedAmount, position, positionKey, inputCurrency, outputCurrency])

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

export function WithdrawPremiumContent({ positionKey }: { positionKey: TraderPositionKey }) {
  // state inputs, derived, handlers for trade confirmation
  const [amount, setAmount] = useState('')
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [showDetails, setShowDetails] = useState(true)
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

  const { txnInfo, inputError } = useDerivedWithdrawPremiumInfo(amount, positionKey, position, setTradeState)
  const { account, chainId, provider } = useWeb3React()

  const maxWithdrawAmount: BN | undefined = useMemo(() => {
    if (!position) return undefined
    return position.premiumLeft
  }, [position])

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
      // (PoolKey calldata key, bool borrowToken1, uint256 amount)
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
              onConfirm={handleWithdraw}
              confirmText="Confirm Deposit"
              disabledConfirm={!!inputError || !txnInfo}
            />
          }
          pendingText={<Trans>Withdrawing ...</Trans>}
          currencyToAdd={inputCurrency ?? undefined}
          recipient={account ?? null}
          errorMessage={errorMessage ? <Trans>{errorMessage}</Trans> : undefined}
        />
      )}
      <AutoColumn>
        <RowBetween style={{ marginBottom: '10px' }}>
          <ThemedText.BodyPrimary fontWeight={400}>
            <Trans>Withdraw Amount</Trans>
          </ThemedText.BodyPrimary>
        </RowBetween>
      </AutoColumn>
      <AutoColumn gap="10px" style={{ width: '95%', marginLeft: '10px' }}>
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
            if (maxWithdrawAmount) {
              setAmount(String(maxWithdrawAmount.toNumber()))
            }
          }}
          hideBalance={true}
          currency={inputCurrency}
        />
        <StyledCard>
          <AutoColumn style={{ marginBottom: '10px' }} justify="space-between">
            {/*<ValueLabel
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
            />*/}
            <ValueLabel
              description="Current Premium Left In Deposit"
              label="Premium Left"
              value={formatBNToString(position?.premiumLeft, NumberType.SwapTradeAmount)}
              syncing={positionLoading}
              symbolAppend={inputCurrency?.symbol}
            />
            <ValueLabel
              description="Maximum premium you can withdraw"
              label="Max Withdrawable Premium"
              value={position?.maxWithdrawablePremium}
              syncing={positionLoading}
              symbolAppend={inputCurrency?.symbol}
            />
          </AutoColumn>
          <Break />
          <TransactionDetails>
            <Wrapper style={{ marginTop: '0' }}>
              <AutoColumn gap="sm" style={{ width: '100%', marginBottom: '-8px' }}>
                <StyledHeaderRow onClick={() => setShowDetails(!showDetails)} disabled={false} open={showDetails}>
                  <RowFixed style={{ position: 'relative' }}>
                    {
                      loading ? (
                        <StyledPolling>
                          <StyledPollingDot>
                            <Spinner />
                          </StyledPollingDot>
                        </StyledPolling>
                      ) : null
                      // <HideSmall>
                      //   <StyledInfoIcon color={theme.deprecated_bg3} />
                      // </HideSmall>
                    }
                    {position ? (
                      loading ? (
                        <ThemedText.BodySmall>
                          <Trans>Fetching details...</Trans>
                        </ThemedText.BodySmall>
                      ) : null
                    ) : // <LoadingOpacityContainer $loading={loading}>
                    //   <ThemedText.BodySmall>Trade Details </ThemedText.BodySmall>
                    // </LoadingOpacityContainer>
                    null}
                  </RowFixed>
                  {/* <RowFixed>
                    <RotatingArrow stroke={theme.textTertiary} open={Boolean(showDetails)} />
                  </RowFixed> */}
                </StyledHeaderRow>
                <AnimatedDropdown open={showDetails}>
                  {/*<AutoColumn gap="sm" style={{ padding: '0', paddingBottom: '8px' }}>
                    {!loading ? (
                      <AutoColumn gap="sm">
                        <RowBetween>
                          <RowFixed>
                            <MouseoverTooltip text={<Trans>Amount of Collateral Returned</Trans>}>
                              <ThemedText.BodySmall color={theme.textPrimary}>
                                <Trans>New Deposit Amount</Trans>
                              </ThemedText.BodySmall>
                            </MouseoverTooltip>
                          </RowFixed>
                          <TextWithLoadingPlaceholder syncing={loading} width={65}>
                            <ThemedText.BodySmall textAlign="right" color="textSecondary">
                              <TruncatedText>
                                {txnInfo && `${Number(txnInfo?.newDepositAmount)}  ${inputCurrency?.symbol}`}
                              </TruncatedText>
                            </ThemedText.BodySmall>
                          </TextWithLoadingPlaceholder>
                        </RowBetween>
                      </AutoColumn>
                    ) : null}
                  </AutoColumn>*/}
                </AnimatedDropdown>
              </AutoColumn>
            </Wrapper>
          </TransactionDetails>
        </StyledCard>
      </AutoColumn>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <ButtonError
          style={{ fontSize: '14px', borderRadius: '10px', width: 'fit-content', height: '15px' }}
          padding=".25rem"
          onClick={handleWithdraw}
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

function BaseFooter({
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
