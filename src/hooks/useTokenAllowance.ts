import { BigNumberish } from '@ethersproject/bignumber'
import { ContractTransaction } from '@ethersproject/contracts'
import { useQuery } from '@tanstack/react-query'
import { CurrencyAmount, MaxUint256, Token } from '@uniswap/sdk-core'
import { useTokenContract } from 'hooks/useContract'
import { useCallback, useMemo } from 'react'
import { ApproveTransactionInfo, TransactionType } from 'state/transactions/types'

export function useTokenAllowance(
  token?: Token,
  owner?: string,
  spender?: string
): {
  tokenAllowance: CurrencyAmount<Token> | undefined
  isSyncing: boolean
} {
  const queryKey = useMemo(() => {
    if (!token || !owner || !spender) return []
    return ['allowance', token.address, owner, spender]
  }, [token, owner, spender])

  const tokenContract = useTokenContract(token?.address)

  const simulate = useCallback(async () => {
    if (!tokenContract || !owner || !spender || !token) return
    const allowance = await tokenContract.callStatic.allowance(owner, spender)
    return CurrencyAmount.fromRawAmount(token, allowance.toString())
  }, [token, owner, spender, tokenContract])

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: simulate,
    enabled: queryKey.length > 0,
    refetchOnMount: false,
    refetchInterval: 3000,
    staleTime: 3000,
  })

  return useMemo(() => {
    return {
      tokenAllowance: data,
      isSyncing: isLoading || isFetching,
    }
  }, [data, isLoading, isFetching])
  // const contract = useTokenContract(token?.address, false)
  // const inputs = useMemo(() => [owner, spender], [owner, spender])

  // // If there is no allowance yet, re-check next observed block.
  // // This guarantees that the tokenAllowance is marked isSyncing upon approval and updated upon being synced.
  // const [blocksPerFetch, setBlocksPerFetch] = useState<1>()
  // const { result, syncing: isSyncing } = useSingleCallResult(contract, 'allowance', inputs, { blocksPerFetch }) as {
  //   result: Awaited<ReturnType<NonNullable<typeof contract>['allowance']>> | undefined
  //   syncing: boolean
  // }

  // const rawAmount = result?.toString() // convert to a string before using in a hook, to avoid spurious rerenders
  // const allowance = useMemo(
  //   () => (token && rawAmount ? CurrencyAmount.fromRawAmount(token, rawAmount) : undefined),
  //   [token, rawAmount]
  // )
  // useEffect(() => setBlocksPerFetch(allowance?.equalTo(0) ? 1 : undefined), [allowance])

  // return useMemo(() => ({ tokenAllowance: allowance, isSyncing }), [allowance, isSyncing])
}

export function useUpdateTokenAllowance(
  amount: CurrencyAmount<Token> | undefined,
  spender: string
): () => Promise<{ response: ContractTransaction; info: ApproveTransactionInfo }> {
  const contract = useTokenContract(amount?.currency.address, true)

  return useCallback(async () => {
    try {
      if (!amount) throw new Error('missing amount')
      if (!contract) throw new Error('missing contract')
      if (!spender) throw new Error('missing spender')

      const allowance: BigNumberish = MaxUint256.toString()
      const response = await contract.approve(spender, allowance)
      return {
        response,
        info: {
          type: TransactionType.APPROVAL,
          tokenAddress: contract.address,
          spender,
        },
      }
    } catch (e: unknown) {
      const symbol = amount?.currency.symbol ?? 'Token'
      throw new Error(`${symbol} token allowance failed: ${e instanceof Error ? e.message : e}`)
    }
  }, [amount, contract, spender])
}
