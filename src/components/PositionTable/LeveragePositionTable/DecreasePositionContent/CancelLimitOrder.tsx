import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Currency } from '@uniswap/sdk-core'
import { computePoolAddress, Pool } from '@uniswap/v3-sdk'
import { ButtonError } from 'components/Button'
import { TextWrapper } from 'components/HoverInlineText'
import { RowFixed } from 'components/Row'
import { LMT_MARGIN_FACILITY, V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { BigNumber } from 'ethers'
import { useToken } from 'hooks/Tokens'
import { useEstimatedPnL } from 'hooks/useEstimatedPnL'
import { useCallback, useMemo, useState } from 'react'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { MarginLimitOrder, MarginPositionDetails, OrderPositionKey } from 'types/lmtv2position'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { getErrorMessage, parseContractError } from 'utils/lmtSDK/errors'
import { CancelOrderOptions, MarginFacilitySDK } from 'utils/lmtSDK/MarginFacility'
import { MulticallSDK } from 'utils/lmtSDK/multicall'
import { useAccount, useChainId } from 'wagmi'
import { useEthersSigner } from 'wagmi-lib/adapters'

import ExistingReduceOrderDetails from './ReduceOrderDetails'

const ReduceOrderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0.5rem;
  border-radius: 20px;
  min-width: 370px;
  justify-content: flex-start;
  // background: ${({ theme }) => theme.backgroundSurface};
  // border: 1px solid ${({ theme }) => theme.backgroundOutline};
  padding: 0.5rem;
`

const OrderHeader = styled(TextWrapper)`
  font-size: 18px;
  font-weight: 800;
  line-height: 20px;
  padding-left: 1rem;
  width: 100%;
  // border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};
  color: ${({ theme }) => theme.textPrimary};
`

export const useCancelLimitOrderCallback = (key?: OrderPositionKey) => {
  const account = useAccount().address
  const chainId = useChainId()
  const signer = useEthersSigner({ chainId })
  const token0 = useToken(key?.poolKey.token0)
  const token1 = useToken(key?.poolKey.token1)
  const callback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!signer) throw new Error('missing provider')
      if (!key || !token0 || !token1) throw new Error('missing key')

      const pool = computePoolAddress({
        factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
        tokenA: token0,
        tokenB: token1,
        fee: key.poolKey.fee,
      })

      const param: CancelOrderOptions = {
        pool,
        isAdd: key.isAdd,
        isToken0: key.isToken0,
      }
      const calldata = MarginFacilitySDK.cancelLimitOrder(param)
      console.log('param for cancel limit', param)
      const tx = {
        from: account,
        to: LMT_MARGIN_FACILITY[chainId],
        data: MulticallSDK.encodeMulticall(calldata),
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
  }, [account, chainId, signer, key, token0, token1])

  return { callback }
}

// cancelOrder(address pool, bool positionIsToken0, bool isAdd

export const ExistingReduceOrderSection = ({
  order,
  orderKey,
  pool,
  position,
  inputCurrency,
  outputCurrency,
  loading,
}: {
  order: MarginLimitOrder
  orderKey: OrderPositionKey
  position: MarginPositionDetails
  loading: boolean
  pool: Pool
  inputCurrency: Currency
  outputCurrency: Currency
}) => {
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<string>()
  const [showConfirm, setShowConfirm] = useState(false)

  const limitPrice = useMemo(() => {
    return order.currentOutput.div(order.inputAmount)
  }, [order])
  const { result: estimatedPnL } = useEstimatedPnL(
    orderKey,
    position,
    order.inputAmount,
    limitPrice,
    outputCurrency,
    inputCurrency
  )

  const { callback: cancelCallback } = useCancelLimitOrderCallback(orderKey)
  const addTransaction = useTransactionAdder()

  const handleDismiss = useCallback(() => {
    setShowConfirm(false)
    setAttemptingTxn(false)
    setTxHash(undefined)
    setError(undefined)
  }, [])

  const handleCancel = useCallback(() => {
    if (!cancelCallback) return

    setAttemptingTxn(true)
    cancelCallback()
      .then((response) => {
        setAttemptingTxn(false)
        setTxHash(response?.hash)
        setError(undefined)
        addTransaction(response, {
          type: TransactionType.CANCEL_LIMIT_ORDER,
          inputCurrencyId: inputCurrency.wrapped.address,
          outputCurrencyId: outputCurrency.wrapped.address,
          isAdd: false,
        })
      })
      .catch((error) => {
        setAttemptingTxn(false)
        setTxHash(undefined)
        setError(error.message)
      })
  }, [cancelCallback, addTransaction, inputCurrency, outputCurrency])

  return (
    <ReduceOrderWrapper>
      {/* {showConfirm && (
        <ConfirmModifyPositionModal
          onDismiss={handleDismiss}
          isOpen={showConfirm}
          attemptingTxn={attemptingTxn}
          txHash={txHash}
          header={
            <ConfirmCancelOrderHeader order={order} inputCurrency={inputCurrency} outputCurrency={outputCurrency} />
          }
          bottom={
            <BaseFooter
              errorMessage={error ? <Trans>{error}</Trans> : null}
              onConfirm={handleCancel}
              confirmText="Confirm Cancel Order"
              disabledConfirm={false}
            />
          }
          title="Confirm Cancel Order"
          pendingText={<Trans>Cancelling Position ...</Trans>}
          currencyToAdd={outputCurrency ?? undefined}
          recipient={account ?? null}
          errorMessage={error ? <Trans>{error}</Trans> : undefined}
        />
      )} */}
      <OrderHeader margin={false}>Existing Reduce Limit Order</OrderHeader>
      <ExistingReduceOrderDetails
        order={order}
        pool={pool}
        inputCurrency={inputCurrency}
        outputCurrency={outputCurrency}
        loading={loading}
        estimatedPnL={estimatedPnL}
      />
      <RowFixed>
        <ButtonError
          style={{
            fontSize: '12px',
            borderRadius: '10px',
            width: 'fit-content',
            height: '15px',
          }}
          padding=".25rem"
          onClick={() => {
            handleCancel()
          }}
        >
          <ThemedText.BodySmall fontWeight={600}>Remove</ThemedText.BodySmall>
        </ButtonError>
      </RowFixed>
    </ReduceOrderWrapper>
  )
}
