import { BigNumber as BN } from 'bignumber.js'
import { LIM_WETH, LMT_VAULT } from 'constants/addresses'
import { useLimweth, useVaultContract } from 'hooks/useContract'
import { useContractCallV2 } from 'hooks/useContractCall'
import { useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { DecodedError } from 'utils/ethersErrorHandler/types'
import { parseContractError } from 'utils/lmtSDK/errors'
import { LimWethSDK } from 'utils/lmtSDK/LimWeth'
import { LPVaultSDK } from 'utils/lmtSDK/LPVault'

export const useVaultStaticDepositAnyToken = (
  enabled: boolean,
  baseCurrency?: string,
  amountIn?: string,
  account?: string
): { result: number | undefined; error: DecodedError | undefined; loading: boolean } => {
  const calldata = useMemo(() => {
    if (!baseCurrency || !amountIn || !account || !enabled) return undefined
    return LPVaultSDK.INTERFACE.encodeFunctionData('depositAnyToken', [baseCurrency, amountIn, account])
  }, [baseCurrency, amountIn, account, enabled])

  const { result, error, loading } = useContractCallV2(LMT_VAULT, calldata, ['depositAnyToken'], true, enabled)

  return useMemo(() => {
    if (!result || !enabled) {
      return {
        result: undefined,
        error,
        loading,
      }
    } else {
      try {
        const parsed = LPVaultSDK.INTERFACE.decodeFunctionResult('depositAnyToken', result)
        return {
          result: new BN(parsed[0].toString()).shiftedBy(-18).toNumber(),
          error,
          loading,
        }
      } catch (err) {
        return {
          result: undefined,
          error: parseContractError(err),
          loading,
        }
      }
    }
  }, [result, error, loading, enabled])
}

export const useVaultStaticRedeemAnyToken = (
  enabled: boolean,
  baseCurrency?: string,
  amountIn?: string,
  account?: string,
  decimals?: number
): { result: number | undefined; error: DecodedError | undefined; loading: boolean } => {
  const calldata = useMemo(() => {
    if (!baseCurrency || !amountIn || !account || !enabled || !decimals) return undefined
    return LPVaultSDK.INTERFACE.encodeFunctionData('redeemToAnyToken', [baseCurrency, amountIn, account, account])
  }, [baseCurrency, amountIn, account, enabled, decimals])

  const { result, error, loading } = useContractCallV2(LMT_VAULT, calldata, ['redeemToAnyToken'], true, enabled)

  return useMemo(() => {
    if (!result || !enabled || !decimals) {
      return {
        result: undefined,
        error,
        loading,
      }
    } else {
      try {
        const parsed = LPVaultSDK.INTERFACE.decodeFunctionResult('redeemToAnyToken', result)
        return {
          result: new BN(parsed[0].toString()).shiftedBy(-decimals).toNumber(),
          error,
          loading,
        }
      } catch (err) {
        return {
          result: undefined,
          error: parseContractError(err),
          loading,
        }
      }
    }
  }, [result, error, loading, enabled, decimals])
}

export const useLimWethStaticDeposit = (
  enabled: boolean,
  amountIn?: string,
  account?: string,
  currencyDeimcals?: number
): { result: number | undefined; error: DecodedError | undefined; loading: boolean } => {
  const calldata = useMemo(() => {
    if (!currencyDeimcals || !amountIn || !enabled) return undefined
    return LimWethSDK.INTERFACE.encodeFunctionData('previewDeposit', [amountIn])
  }, [amountIn, account, enabled, currencyDeimcals])

  const { result, error, loading } = useContractCallV2(LIM_WETH, calldata, ['previewDeposit'], false, enabled)

  return useMemo(() => {
    if (!result || !enabled || !currencyDeimcals) {
      return {
        result: undefined,
        error,
        loading,
      }
    } else {
      try {
        const parsed = LimWethSDK.INTERFACE.decodeFunctionResult('deposit', result)
        return {
          result: new BN(parsed[0].toString()).shiftedBy(-currencyDeimcals).toNumber(),
          error,
          loading,
        }
      } catch (err) {
        return {
          result: undefined,
          error: parseContractError(err),
          loading,
        }
      }
    }
  }, [result, error, loading, enabled, currencyDeimcals])
}

export const useLimWethStaticRedeem = (
  enabled: boolean,
  amountIn?: string,
  account?: string,
  currencyDeimcals?: number
): { result: number | undefined; error: DecodedError | undefined; loading: boolean } => {
  const calldata = useMemo(() => {
    if (!currencyDeimcals || !amountIn || !account || !enabled) return undefined
    return LimWethSDK.INTERFACE.encodeFunctionData('previewRedeem', [amountIn])
  }, [amountIn, account, enabled, currencyDeimcals])
  const { result, error, loading } = useContractCallV2(LIM_WETH, calldata, ['previewRedeem'], false, enabled)

  return useMemo(() => {
    if (!result || !enabled || !currencyDeimcals) {
      return {
        result: undefined,
        error,
        loading,
      }
    } else {
      try {
        const parsed = LimWethSDK.INTERFACE.decodeFunctionResult('redeem', result)
        return {
          result: new BN(parsed[0].toString()).shiftedBy(-currencyDeimcals).toNumber(),
          error,
          loading,
        }
      } catch (err) {
        return {
          result: undefined,
          error: parseContractError(err),
          loading,
        }
      }
    }
  }, [result, error, loading, enabled, currencyDeimcals])
}

export const useLlpBalance = (account?: string): number => {
  const vaultContact = useVaultContract()

  const { result, error, loading } = useSingleCallResult(vaultContact, 'balanceOf', [account])
  // console.log('zeke:llpBalance', result)
  return useMemo(() => {
    if (!result || loading || !account || error) {
      return 0
    } else {
      return new BN(result[0].toString()).shiftedBy(-18).toNumber()
    }
  }, [result, error, loading, account])
}

export const useLimWethBalance = (account?: string): number => {
  const limWethContract = useVaultContract()

  const { result, error, loading } = useSingleCallResult(limWethContract, 'balanceOf', [account])

  return useMemo(() => {
    if (!result || loading || !account || error) {
      return 0
    } else {
      return new BN(result[0].toString()).shiftedBy(-18).toNumber()
    }
  }, [result, error, loading, account])
}

export const useLimWethTotalSupply = (): number => {
  const limWethContract = useLimweth()

  const { result, error, loading } = useSingleCallResult(limWethContract, 'totalSupply')

  return useMemo(() => {
    if (!result || loading || error) {
      return 0
    } else {
      return new BN(result[0].toString()).shiftedBy(-18).toNumber()
    }
  }, [result, error, loading])
}

export const useLimWethTokenBalance = (): number => {
  const limWethContract = useLimweth()

  const { result, error, loading } = useSingleCallResult(limWethContract, 'tokenBalance')

  return useMemo(() => {
    if (!result || loading || error) {
      return 0
    } else {
      return new BN(result[0].toString()).shiftedBy(-18).toNumber()
    }
  }, [result, error, loading])
}

export const useLimWethUtilizedBalance = (): number => {
  const limWethContract = useLimweth()

  const { result, error, loading } = useSingleCallResult(limWethContract, 'utilizedBalance')
  return useMemo(() => {
    if (!result || loading || error) {
      return 0
    } else {
      return new BN(result[0].toString()).shiftedBy(-18).toNumber()
    }
  }, [result, error, loading])
}

export const useLimWethPrice = (): number => {
  const limWethContract = useLimweth()

  const { result, error, loading } = useSingleCallResult(limWethContract, 'previewRedeem', [
    new BN(1).shiftedBy(18).toString(),
  ])

  return useMemo(() => {
    if (!result || loading || error) {
      return 0
    } else {
      return new BN(result[0].toString()).shiftedBy(-18).toNumber()
    }
  }, [result, error, loading])
}

export const useLlpPrice = (): number => {
  const vaultContract = useVaultContract()

  const { result, error, loading } = useSingleCallResult(vaultContract, 'previewRedeem', [
    new BN(1).shiftedBy(18).toString(),
  ])

  return useMemo(() => {
    if (!result || loading || error) {
      return 0
    } else {
      return new BN(result[0].toString()).shiftedBy(-18).toNumber()
    }
  }, [result, error, loading])
}

export const useMaxRedeemableInToken = (
  tokens: string[] | undefined
): ({ maxShares: number; assets: number } | undefined)[] => {
  const vaultContract = useVaultContract()

  const callStates = useSingleContractMultipleData(
    vaultContract,
    'maxRedeemableInToken',
    tokens ? tokens.map((t) => [t]) : []
  )

  return useMemo(() => {
    return callStates.map((callState) => {
      if (!callState.result || callState.loading || callState.error) {
        return undefined
      } else {
        return callState.result
          ? {
              maxShares: new BN(callState.result.maxShares.toString()).shiftedBy(-18).toNumber(),
              assets: new BN(callState.result.assets.toString()).shiftedBy(-18).toNumber(),
            }
          : undefined
      }
    })
  }, [callStates])
}

export const useVaultData = () => {
  const vaultContract = useVaultContract()

  const { result, error, loading } = useSingleCallResult(vaultContract, 'getData')
  return useMemo(() => {
    if (!result || loading || error) {
      return undefined
    } else {
      return result
    }
  }, [result, error, loading])
}
