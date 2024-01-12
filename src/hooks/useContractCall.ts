import { AddressMap } from '@uniswap/smart-order-router'
import { useWeb3React } from '@web3-react/core'
import { ZERO_ADDRESS } from 'constants/misc'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ErrorType } from 'utils/ethersErrorHandler'
import { DecodedError } from 'utils/ethersErrorHandler/types'
import { parseContractError } from 'utils/lmtSDK/errors'

interface CallOutput {
  result: string | undefined
  error: DecodedError | undefined
  loading: boolean
  syncing: boolean
}

/**
 * @returns loading: true when fetching data for new params, syncing: true when fetching data for old params, block updates only
 */
export function useContractCall(
  address?: string | AddressMap,
  calldata?: string,
  useSigner = false,
  blocksPerFetch = 0
): CallOutput {
  const [result, setResult] = useState<string>()
  const [error, setError] = useState<DecodedError>()
  const [lastParams, setLastParams] = useState<{
    to: string
    calldata: string
  }>()
  const [syncing, setSyncing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastBlockNumber, setBlockNumber] = useState<number>()
  const blockNumber = useBlockNumber()
  const { provider, chainId } = useWeb3React()

  const fetch = useCallback(async () => {
    if (!provider || !address || !calldata || !chainId) {
      console.log('fetching5')
      return undefined
    }
    console.log('fetching6')

    const isStr = typeof address === 'string'
    const to = isStr ? address : address[chainId] ?? ZERO_ADDRESS

    let data
    if (useSigner) {
      data = await provider.getSigner()?.call({
        to,
        data: calldata,
      })
    } else {
      data = await provider.call({
        to,
        data: calldata,
      })
    }

    return { data, to, calldata }
  }, [provider, address, calldata, useSigner, chainId])

  /**
   * things to check:
   * if it's loading then don't do call the function again, unless the calldata has changed
   * if the calldata hasn't changed then only call again if the blocknumber has changed by enough
   * if there's an error then don't call again unless the blocknumber has changed by enough or the params have changed
   */
  useEffect(() => {
    if (!blockNumber || !address || !calldata || !provider || !chainId) {
      return
    }

    // console.log('useContractCall params', blockNumber, lastBlockNumber, loading, error, lastParams, address, calldata)
    const _to = typeof address === 'string' ? address : address[chainId] ?? ZERO_ADDRESS
    const paramsUnchanged = lastParams?.to === _to && lastParams?.calldata === calldata
    if (error && lastBlockNumber && lastBlockNumber + blocksPerFetch >= blockNumber) {
      return
    }

    if (loading || syncing) {
      return
    }

    if (lastBlockNumber && lastBlockNumber + blocksPerFetch >= blockNumber && lastParams && paramsUnchanged) {
      return
    }

    if (lastParams && paramsUnchanged) {
      setSyncing(true)
    } else {
      setLoading(true)
    }

    fetch()
      .then((data) => {
        if (!data) {
          setError({
            type: ErrorType.EmptyError,
            error: 'missing params',
            data: undefined,
          })
          setLastParams(undefined)
          setResult(undefined)
          setLoading(false)
          setSyncing(false)
        } else {
          const { data: _result, to, calldata } = data
          // console.log('fetching9', _result, to, calldata)
          setResult(_result)
          setLastParams({ to, calldata })
          setError(undefined)
          setLoading(false)
          setSyncing(false)
        }
        setBlockNumber(blockNumber)
      })
      .catch((err) => {
        console.log('fetching10')
        setError(parseContractError(err))
        setLastParams(undefined)
        setResult(undefined)
        setLoading(false)
        setSyncing(false)
        setBlockNumber(blockNumber)
      })
  }, [
    calldata,
    provider,
    chainId,
    blockNumber,
    lastBlockNumber,
    loading,
    error,
    fetch,
    blocksPerFetch,
    lastParams,
    address,
    syncing,
  ])

  return useMemo(() => {
    if (!address || !calldata || !chainId) {
      return { result: undefined, error, loading, syncing }
    }
    const _to = typeof address === 'string' ? address : address[chainId] ?? ZERO_ADDRESS
    if (result && lastParams && lastParams.calldata === calldata && lastParams.to === _to) {
      return { result, error, loading, syncing }
    }
    return { result: undefined, error, loading, syncing }
  }, [loading, error, result, lastParams, address, chainId, calldata, syncing])
}
