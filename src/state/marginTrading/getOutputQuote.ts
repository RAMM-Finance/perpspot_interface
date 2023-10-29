import { defaultAbiCoder } from '@ethersproject/abi'
import { Provider } from '@ethersproject/providers'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { Route, SwapQuoter } from '@uniswap/v3-sdk'
import { QUOTER_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import JSBI from 'jsbi'

export async function getOutputQuote(
  amount?: CurrencyAmount<Currency>,
  route?: Route<Currency, Currency>,
  provider?: Provider,
  chainId?: number
): Promise<JSBI | undefined> {
  if (!amount || !route || !provider || !chainId) return undefined

  const { calldata } = await SwapQuoter.quoteCallParameters(route, amount, TradeType.EXACT_INPUT, {
    useQuoterV2: true,
  })

  const quoteCallReturnData = await provider.call({
    to: QUOTER_ADDRESSES[chainId ?? SupportedChainId.SEPOLIA],
    data: calldata,
  })

  return JSBI.BigInt(defaultAbiCoder.decode(['uint256'], quoteCallReturnData))
}
