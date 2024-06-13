import { BigNumber } from '@ethersproject/bignumber'
import type { JsonRpcProvider } from '@ethersproject/providers'
import { parseEther } from '@ethersproject/units'
import { useNativeCurrencyBalances } from 'state/connection/hooks'
import { useAccount, useChainId } from 'wagmi'
import { useEthersProvider } from 'wagmi-lib/adapters'

interface WalletBalanceProps {
  address: string
  balance: string
  weiBalance: BigNumber
  provider: JsonRpcProvider | undefined
}

export function useWalletBalance(): WalletBalanceProps {
  const chainId = useChainId()
  const provider = useEthersProvider({ chainId })
  const address = useAccount().address
  const balanceString = useNativeCurrencyBalances(address ? [address] : [])?.[address ?? '']?.toSignificant(3) || '0'

  return address == null
    ? {
        address: '',
        balance: '0',
        weiBalance: parseEther('0'),
        provider: undefined,
      }
    : {
        address,
        balance: balanceString,
        weiBalance: parseEther(balanceString),
        provider,
      }
}
