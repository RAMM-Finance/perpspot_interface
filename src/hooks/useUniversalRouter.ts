import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { t } from '@lingui/macro'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { FeeOptions, toHex } from '@uniswap/v3-sdk'
import { ROUTER_ADDRESSES } from 'constants/addresses'
import { useCallback } from 'react'
import { SwapTrade } from 'state/routing/tradeEntity'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import isZero from 'utils/isZero'
import { LocalSwapRouter } from 'utils/lmtSDK/SwapRouter'
// import { trace } from 'tracing'
import { swapErrorToUserReadableMessage } from 'utils/swapErrorToUserReadableMessage'
import { useAccount, useChainId } from 'wagmi'
import { useEthersSigner } from 'wagmi-lib/adapters'

import { PermitSignature } from './usePermitAllowance'

/** Thrown when gas estimation fails. This class of error usually requires an emulator to determine the root cause. */
class GasEstimationError extends Error {
  constructor() {
    super(t`Your swap is expected to fail.`)
  }
}

/**
 * Thrown when the user modifies the transaction in-wallet before submitting it.
 * In-wallet calldata modification nullifies any safeguards (eg slippage) from the interface, so we recommend reverting them immediately.
 */
class ModifiedSwapError extends Error {
  constructor() {
    super(
      t`Your swap was modified through your wallet. If this was a mistake, please cancel immediately or risk losing your funds.`
    )
  }
}

interface SwapOptions {
  slippageTolerance: Percent
  deadline?: BigNumber
  permit?: PermitSignature
  feeOptions?: FeeOptions
}

export function useUniversalRouterSwapCallback(
  trade: SwapTrade<Currency, Currency, TradeType> | undefined,
  fiatValues: { amountIn: number | undefined; amountOut: number | undefined },
  options: SwapOptions
) {
  const chainId = useChainId()
  const signer = useEthersSigner({ chainId })
  const account = useAccount().address

  return useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!signer) throw new Error('missing provider')
      if (!trade) throw new Error('missing trade')

      // setTraceData('slippageTolerance', options.slippageTolerance.toFixed(2))
      const { calldata: data, value } = LocalSwapRouter.swapERC20CallParameters(trade, {
        slippageTolerance: options.slippageTolerance,
        deadlineOrPreviousBlockhash: options.deadline?.toString(),
        inputTokenPermit: options.permit,
        fee: options.feeOptions,
      })
      const tx = {
        from: account,
        to: ROUTER_ADDRESSES[chainId],
        data,
        // TODO(https://github.com/Uniswap/universal-router-sdk/issues/113): universal-router-sdk returns a non-hexlified value.
        ...(value && !isZero(value) ? { value: toHex(value) } : {}),
      }

      let gasEstimate: BigNumber
      try {
        gasEstimate = await signer.estimateGas(tx)
      } catch (gasError) {
        // setTraceStatus('failed_precondition')
        // setTraceError(gasError)
        console.warn(gasError)
        throw new GasEstimationError()
      }
      const gasLimit = calculateGasMargin(gasEstimate)
      // setTraceData('gasLimit', gasLimit.toNumber())
      const response = await signer.sendTransaction({ ...tx, gasLimit }).then((response) => {
        if (tx.data !== response.data) {
          throw new ModifiedSwapError()
        }
        return response
      })
      return response
    } catch (swapError: unknown) {
      if (swapError instanceof ModifiedSwapError) throw swapError
      throw new Error(swapErrorToUserReadableMessage(swapError))
    }
  }, [
    account,
    chainId,
    fiatValues,
    options.deadline,
    options.feeOptions,
    options.permit,
    options.slippageTolerance,
    signer,
    trade,
  ])
}
