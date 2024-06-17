import { JsonRpcSigner, Provider } from '@ethersproject/providers'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { Route, SwapQuoter } from '@uniswap/v3-sdk'
import { QUOTER_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { defaultAbiCoder } from 'ethers/lib/utils'
import JSBI from 'jsbi'

export async function getOutputQuote(
  amount?: CurrencyAmount<Currency>,
  route?: Route<Currency, Currency>,
  provider?: Provider | JsonRpcSigner,
  chainId?: number
): Promise<JSBI | undefined> {
  if (!amount || !route || !provider || !chainId) return undefined

  const { calldata } = await SwapQuoter.quoteCallParameters(route, amount, TradeType.EXACT_INPUT, {
    useQuoterV2: true,
  })
  const quoteCallReturnData = await provider.call({
    to: QUOTER_ADDRESSES[chainId ?? SupportedChainId.ARBITRUM_ONE],
    data: calldata,
  })

  return JSBI.BigInt(defaultAbiCoder.decode(['uint256'], quoteCallReturnData))
}
