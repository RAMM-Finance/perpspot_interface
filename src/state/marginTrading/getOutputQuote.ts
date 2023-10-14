import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { Route, SwapQuoter } from '@uniswap/v3-sdk'
import { ROUTER_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { ethers } from 'ethers'

export async function getOutputQuote(
  amount: CurrencyAmount<Currency>,
  route: Route<Currency, Currency>,
  provider: ethers.providers.Provider,
  chainId: number
) {
  if (!provider) {
    throw new Error('Provider required to get pool state')
  }

  const { calldata } = await SwapQuoter.quoteCallParameters(route, amount, TradeType.EXACT_INPUT, {
    useQuoterV2: true,
  })

  const quoteCallReturnData = await provider.call({
    to: ROUTER_ADDRESSES[chainId ?? SupportedChainId.SEPOLIA],
    data: calldata,
  })

  return ethers.utils.defaultAbiCoder.decode(['uint256'], quoteCallReturnData)
}
