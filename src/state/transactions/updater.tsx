// import { TransactionReceipt } from 'viem/types/transaction'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { DEFAULT_TXN_DISMISS_MS, L2_TXN_DISMISS_MS } from 'constants/misc'
import LibUpdater from 'lib/hooks/transactions/updater'
import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { TransactionInfo } from 'state/transactions/types'
import { useChainId } from 'wagmi'

import { L2_CHAIN_IDS } from '../../constants/chains'
import { useDerivedSwapInfo } from '../../state/swap/hooks'
import { useAddPopup } from '../application/hooks'
import { checkedTransaction, finalizeTransaction } from './reducer'

// const formatAnalyticsEventProperties = ({ trade, hash, allowedSlippage, succeeded }: AnalyticsEventProps) => ({
//   estimated_network_fee_usd: trade.gasUseEstimateUSD ? formatToDecimal(trade.gasUseEstimateUSD, 2) : undefined,
//   transaction_hash: hash,
//   token_in_address: getTokenAddress(trade.inputAmount.currency),
//   token_out_address: getTokenAddress(trade.outputAmount.currency),
//   token_in_symbol: trade.inputAmount.currency.symbol,
//   token_out_symbol: trade.outputAmount.currency.symbol,
//   token_in_amount: formatToDecimal(trade.inputAmount, trade.inputAmount.currency.decimals),
//   token_out_amount: formatToDecimal(trade.outputAmount, trade.outputAmount.currency.decimals),
//   price_impact_basis_points: formatPercentInBasisPointsNumber(computeRealizedPriceImpact(trade)),
//   allowed_slippage_basis_points: formatPercentInBasisPointsNumber(allowedSlippage),
//   chain_id:
//     trade.inputAmount.currency.chainId === trade.outputAmount.currency.chainId
//       ? trade.inputAmount.currency.chainId
//       : undefined,
//   swap_quote_block_number: trade.blockNumber,
//   succeeded,
// })

export default function Updater() {
  const chainId = useChainId()
  const addPopup = useAddPopup()
  // speed up popup dismisall time if on L2
  const isL2 = Boolean(chainId && L2_CHAIN_IDS.includes(chainId))
  const transactions = useAppSelector((state) => state.transactions)
  const {
    trade: { trade },
    allowedSlippage,
  } = useDerivedSwapInfo()

  const dispatch = useAppDispatch()
  const onCheck = useCallback(
    ({ chainId, hash, blockNumber }: { chainId: number; hash: string; blockNumber: number }) =>
      dispatch(checkedTransaction({ chainId, hash, blockNumber })),
    [dispatch]
  )

  const onReceipt = useCallback(
    ({
      chainId,
      hash,
      receipt,
      transactionInfo,
    }: {
      chainId: number
      hash: string
      receipt: TransactionReceipt
      transactionInfo: TransactionInfo
    }) => {
      dispatch(
        finalizeTransaction({
          chainId,
          hash,
          receipt: {
            blockHash: receipt.blockHash,
            blockNumber: Number(receipt.blockNumber),
            contractAddress: receipt.contractAddress,
            from: receipt.from,
            status: receipt.status,
            to: receipt.to,
            transactionHash: receipt.transactionHash,
            transactionIndex: receipt.transactionIndex,
          },
        })
      )

      const tx = transactions[chainId]?.[hash]

      addPopup(
        {
          txn: { hash },
        },
        hash,
        isL2 ? L2_TXN_DISMISS_MS : DEFAULT_TXN_DISMISS_MS
      )

      // if (transactionInfo.type === TransactionType.ADD_LEVERAGE) {
      //   transactionInfo.callback()
      // }
    },
    [addPopup, dispatch, isL2, transactions]
  )

  const pendingTransactions = useMemo(() => (chainId ? transactions[chainId] ?? {} : {}), [chainId, transactions])

  // console.log('zeke:pendingTransactions', pendingTransactions)

  return <LibUpdater pendingTransactions={pendingTransactions} onCheck={onCheck} onReceipt={onReceipt} />
}
