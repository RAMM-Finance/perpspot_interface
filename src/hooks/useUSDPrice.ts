import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import axios from 'axios'
import { BigNumber as BN } from 'bignumber.js'
import { SupportedChainId } from 'constants/chains'
import { nativeOnChain } from 'constants/tokens'
import { MultipleTokensPriceQuery, TokenDataFromUniswapQuery } from 'graphql/limitlessGraph/queries'
import { GRAPH_API_KEY } from 'graphql/limitlessGraph/uniswapClients'
import { useMemo } from 'react'
import { definedfiEndpoint } from 'utils/definedfiUtils'
import { TokenBN } from 'utils/lmtSDK/internalConstants'

import { useAllPoolAndTokenPriceData } from './useUserPriceData'

// ETH amounts used when calculating spot price for a given currency.
// The amount is large enough to filter low liquidity pairs.
const ETH_AMOUNT_OUT: { [chainId: number]: CurrencyAmount<Currency> } = {
  // [SupportedChainId.MAINNET]: CurrencyAmount.fromRawAmount(nativeOnChain(SupportedChainId.MAINNET), 100e18),
  [SupportedChainId.ARBITRUM_ONE]: CurrencyAmount.fromRawAmount(nativeOnChain(SupportedChainId.ARBITRUM_ONE), 10e18),
  // [SupportedChainId.OPTIMISM]: CurrencyAmount.fromRawAmount(nativeOnChain(SupportedChainId.OPTIMISM), 10e18),
  // [SupportedChainId.POLYGON]: CurrencyAmount.fromRawAmount(nativeOnChain(SupportedChainId.POLYGON), 10_000e18),
  // [SupportedChainId.CELO]: CurrencyAmount.fromRawAmount(nativeOnChain(SupportedChainId.CELO), 10e18),
}

const apiKey = process.env.REACT_APP_GECKO_API_KEY

export interface UniswapQueryTokenInfo {
  id: string
  name: string
  symbol: string
  decimals: number
  lastPriceUSD: string
}

export const chunk = (array: any[], size: number) => {
  return array.reduce((acc: any[][], _, i) => {
    if (i % size === 0) acc.push(array.slice(i, i + size))
    return acc
  }, [])
}

export async function getMultipleUsdPriceData(
  chainId: number,
  tokenIds: string[]
): Promise<{ address: string; networkId: number; priceUsd: number }[]> {
  const url = definedfiEndpoint
  const definedApiKey = process.env.REACT_APP_DEFINEDFI_KEY

  const tokenIdsChunks = chunk(tokenIds, 25)

  const promises = tokenIdsChunks.map(async (chunk) => {
    const newTokenIds = chunk.map((id) => {
      if (chainId === SupportedChainId.ARBITRUM_ONE) {
        return id === 'ETH' ? '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' : id
      } else if (chainId === SupportedChainId.BASE) {
        return id === 'ETH' ? '0x4200000000000000000000000000000000000006' : id
      } else {
        return id === 'ETH' ? '0x4200000000000000000000000000000000000006' : id
      }
    })

    const res = await axios.post(
      url,
      {
        query: MultipleTokensPriceQuery(newTokenIds, chainId),
      },
      {
        headers: {
          Accept: 'application/json',
          Authorization: definedApiKey,
        },
      }
    )

    return res?.data?.data?.getTokenPrices
  })

  const results = await Promise.all(promises)
  return results.flat()
}

export async function getDecimalAndUsdValueData(
  chainId: number | undefined,
  tokenId: string
): Promise<UniswapQueryTokenInfo> {
  // https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/FUbEPQw1oMghy39fwWBFY5fE6MXPXZQtjncQy2cXdrNS
  // https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/FQ6JYszEKApsBpAmiHesRsd9Ygc6mzmpNRANeVQFYoVX
  // let url = 'https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-'
  // https://gateway-arbitrum.network.thegraph.com/api/{api-key}/subgraphs/id/FUbEPQw1oMghy39fwWBFY5fE6MXPXZQtjncQy2cXdrNS

  let network = 'arbitrum-one'
  let url = `https://gateway-arbitrum.network.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/FQ6JYszEKApsBpAmiHesRsd9Ygc6mzmpNRANeVQFYoVX`
  if (chainId === SupportedChainId.ARBITRUM_ONE) {
    if (tokenId === 'ETH') {
      tokenId = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
    }

    // url += 'arbitrum'
    network = 'arbitrum-one'
  } else if (chainId === SupportedChainId.BASE) {
    if (tokenId === 'ETH') {
      tokenId = '0x4200000000000000000000000000000000000006'
    }
    url = `https://gateway-arbitrum.network.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/FUbEPQw1oMghy39fwWBFY5fE6MXPXZQtjncQy2cXdrNS`
    // url += 'base'
    network = 'base'
  } else {
    if (tokenId === 'ETH') {
      tokenId = '0x4200000000000000000000000000000000000006'
    }
    // url += 'arbitrum'
    network = 'base'
  }

  let res: any = await axios.post(url, {
    query: TokenDataFromUniswapQuery(tokenId),
  })

  const token: UniswapQueryTokenInfo = res?.data?.data?.token
  // if (true) {
  if (!token || !token?.lastPriceUSD || token.lastPriceUSD === '0') {
    try {
      res = await axios.get(
        `https://pro-api.coingecko.com/api/v3/simple/token_price/${network}?contract_addresses=${tokenId}&vs_currencies=usd`,
        {
          headers: {
            Accept: 'application/json',
            'x-cg-pro-api-key': apiKey,
          },
        }
      )
      const data: any = res?.data
      // console.log("DATA!", data)
      const usdValues = Object.values(data).map((value: any) => value.usd)

      return { ...token, lastPriceUSD: usdValues[0].toString() }
    } catch (e) {
      console.error('COINGECKO ERROR', e)
    }
  }

  return token
}

export function useUSDPriceBN(
  amount?: BN | TokenBN,
  currency?: Currency
): {
  data: number | undefined
  isLoading: boolean
} {
  const { tokens } = useAllPoolAndTokenPriceData()
  const tokenAddress = currency?.wrapped.address.toLowerCase()

  const priceUsd = tokens && tokenAddress ? tokens[tokenAddress]?.usdPrice : undefined
  return useMemo(() => {
    console.log("PRICE USD AND AMOUNT", priceUsd, amount, currency)
    if (!priceUsd || !amount) {
      return { data: undefined, isLoading: false }
    }
    return { data: priceUsd * amount.toNumber(), isLoading: false }
  }, [tokens, tokenAddress, amount])
}

export function useUSDPrice(currencyAmount?: CurrencyAmount<Currency>): {
  data: number | undefined
  isLoading: boolean
} {
  const { tokens } = useAllPoolAndTokenPriceData()
  const tokenAddress = currencyAmount?.currency?.wrapped.address.toLowerCase()

  const priceUsd = tokens && tokenAddress ? tokens[tokenAddress]?.usdPrice : undefined
  return useMemo(() => {
    if (!priceUsd || !currencyAmount) {
      return { data: undefined, isLoading: false }
    }
    return { data: priceUsd * parseFloat(currencyAmount.toExact()), isLoading: false }
  }, [tokens, tokenAddress, currencyAmount])
}
