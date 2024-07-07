import { BigNumber } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import { useSingleCallResult } from 'lib/hooks/multicall'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { unwrappedToken } from 'utils/unwrappedToken'

import { useLmtNFTPositionManager, useNFPMV2 } from './useContract'

const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1)

export function useLMTPositionFees(
  pool?: Pool,
  tokenId?: BigNumber,
  asWETH = false
): [feeValue0: CurrencyAmount<Currency>, feeValue1: CurrencyAmount<Currency>] | [undefined, undefined] {
  const nfpm = useNFPMV2(true)
  const owner: string | undefined = useSingleCallResult(tokenId ? nfpm : null, 'ownerOf', [tokenId]).result?.[0]

  const queryKey = useMemo(() => {
    if (!tokenId || !nfpm || !owner) return []
    return ['collect', tokenId, owner]
  }, [tokenId, nfpm, owner])

  const simulate = useCallback(async () => {
    if (!tokenId || !nfpm || !owner) throw new Error('invalid')
    const result = await nfpm.callStatic.collect({
      tokenId: tokenId.toString(),
      recipient: owner,
    })

    return result
  }, [tokenId, nfpm, owner])

  const {
    data: result,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    enabled: queryKey.length > 0,
    queryFn: simulate,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  return useMemo(() => {
    if (!result || !pool) return [undefined, undefined]
    return [
      CurrencyAmount.fromRawAmount(asWETH ? pool.token0 : unwrappedToken(pool.token0), result[0].toString()),
      CurrencyAmount.fromRawAmount(asWETH ? pool.token1 : unwrappedToken(pool.token1), result[1].toString()),
    ]
  }, [result, isLoading, error])
}

export function useLMTV1PositionFees(
  pool?: Pool,
  tokenId?: BigNumber,
  asWETH = false
): [CurrencyAmount<Currency>, CurrencyAmount<Currency>] | [undefined, undefined] {
  const positionManager = useLmtNFTPositionManager()
  const owner: string | undefined = useSingleCallResult(tokenId ? positionManager : null, 'ownerOf', [tokenId])
    .result?.[0]

  const tokenIdHexString = tokenId?.toHexString()
  const latestBlockNumber = useBlockNumber()

  // we can't use multicall for this because we need to simulate the call from a specific address
  // latestBlockNumber is included to ensure data stays up-to-date every block
  const [amounts, setAmounts] = useState<[BigNumber, BigNumber] | undefined>()

  useEffect(() => {
    if (positionManager && tokenIdHexString && owner) {
      positionManager.callStatic
        .collect(
          {
            tokenId: tokenIdHexString,
            recipient: owner, // some tokens might fail if transferred to address(0)
          },
          { from: owner } // need to simulate the call as the owner
        )
        .then((results) => {
          setAmounts([results.tokensOwed0, results.tokensOwed1])
        })
    }
  }, [positionManager, tokenIdHexString, owner, latestBlockNumber])

  if (pool && amounts) {
    return [
      CurrencyAmount.fromRawAmount(asWETH ? pool.token0 : unwrappedToken(pool.token0), amounts[0].toString()),
      CurrencyAmount.fromRawAmount(asWETH ? pool.token1 : unwrappedToken(pool.token1), amounts[1].toString()),
    ]
  } else {
    return [undefined, undefined]
  }
}
