import { NetworkStatus } from '@apollo/client'
import { Currency, CurrencyAmount, Price, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import axios from 'axios'
import { BigNumber as BN } from 'bignumber.js'
import { SupportedChainId } from 'constants/chains'
import { nativeOnChain } from 'constants/tokens'
import { Chain, useTokenSpotPriceQuery } from 'graphql/data/__generated__/types-and-hooks'
import { chainIdToBackendName, isGqlSupportedChain, PollingInterval } from 'graphql/data/util'
import { MultipleTokensPriceQuery, TokenDataFromUniswapQuery } from 'graphql/limitlessGraph/queries'
import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { BnToCurrencyAmount } from 'state/marginTrading/hooks'
import { RouterPreference } from 'state/routing/slice'
import { TradeState } from 'state/routing/types'
import { useRoutingAPITrade } from 'state/routing/useRoutingAPITrade'
import { TokenBN } from 'utils/lmtSDK/internalConstants'
import { getNativeTokenDBAddress } from 'utils/nativeTokens'

import useStablecoinPrice from './useStablecoinPrice'

// ETH amounts used when calculating spot price for a given currency.
// The amount is large enough to filter low liquidity pairs.
const ETH_AMOUNT_OUT: { [chainId: number]: CurrencyAmount<Currency> } = {
  // [SupportedChainId.MAINNET]: CurrencyAmount.fromRawAmount(nativeOnChain(SupportedChainId.MAINNET), 100e18),
  [SupportedChainId.ARBITRUM_ONE]: CurrencyAmount.fromRawAmount(nativeOnChain(SupportedChainId.ARBITRUM_ONE), 10e18),
  // [SupportedChainId.OPTIMISM]: CurrencyAmount.fromRawAmount(nativeOnChain(SupportedChainId.OPTIMISM), 10e18),
  // [SupportedChainId.POLYGON]: CurrencyAmount.fromRawAmount(nativeOnChain(SupportedChainId.POLYGON), 10_000e18),
  // [SupportedChainId.CELO]: CurrencyAmount.fromRawAmount(nativeOnChain(SupportedChainId.CELO), 10e18),
}

function useETHValue(currencyAmount?: CurrencyAmount<Currency>): {
  data: CurrencyAmount<Currency> | undefined
  isLoading: boolean
} {
  const chainId = currencyAmount?.currency?.chainId

  const amountOut = isGqlSupportedChain(chainId) ? ETH_AMOUNT_OUT[chainId] : undefined
  const { trade, state } = useRoutingAPITrade(
    TradeType.EXACT_OUTPUT,
    amountOut,
    currencyAmount?.currency,
    RouterPreference.PRICE
  )
  // console.log('useethvalue', trade)
  // Get ETH value of ETH or WETH
  if (chainId && currencyAmount && currencyAmount.currency.wrapped.equals(nativeOnChain(chainId).wrapped)) {
    return {
      data: new Price(currencyAmount.currency, currencyAmount.currency, '1', '1').quote(currencyAmount),
      isLoading: false,
    }
  }

  if (!trade || !currencyAmount?.currency || !isGqlSupportedChain(chainId)) {
    return { data: undefined, isLoading: state === TradeState.LOADING || state === TradeState.SYNCING }
  }

  const { numerator, denominator } = trade.routes[0].midPrice
  const price = new Price(currencyAmount?.currency, nativeOnChain(chainId), denominator, numerator)
  return { data: price.quote(currencyAmount), isLoading: false }
}

const apiKey = process.env.REACT_APP_GECKO_API_KEY

export interface UniswapQueryTokenInfo {
  id: string
  name: string
  symbol: string
  decimals: number
  lastPriceUSD: string
}

export async function getMultipleUsdPriceData(
  chainId: number,
  tokenIds: string[]
) {
  let url = 'https://graph.defined.fi/graphql'
  const definedApiKey = process.env.REACT_APP_DEFINEDFI_KEY
  let newTokenIds = tokenIds.map((id) => {
    if (chainId === SupportedChainId.ARBITRUM_ONE) {
      if (id === 'ETH') {
        return '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
      } else return id
    } else if (chainId === SupportedChainId.BASE) {
      if (id === 'ETH') {
        return '0x4200000000000000000000000000000000000006'
      } else return id
    } else {
      if (id === 'ETH') {
        return '0x4200000000000000000000000000000000000006'
      } else return id
    }
  })

  let res: any = await axios.post(
    url, {
      query: MultipleTokensPriceQuery(tokenIds, chainId)
    },
    {
      headers: {
        Accept: 'application/json',
        Authorization: definedApiKey, 
      },
    }
  )
  return res?.data?.data?.getTokenPrices
}

export async function getDecimalAndUsdValueData(
  chainId: number | undefined,
  tokenId: string
): Promise<UniswapQueryTokenInfo> {
  let url = 'https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-'
  let network = 'arbitrum-one'

  if (chainId === SupportedChainId.ARBITRUM_ONE) {
    if (tokenId === 'ETH') {
      tokenId = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
    }
    url += 'arbitrum'
    network = 'arbitrum-one'
  } else if (chainId === SupportedChainId.BASE) {
    if (tokenId === 'ETH') {
      tokenId = '0x4200000000000000000000000000000000000006'
    }
    url += 'base'
    network = 'base'
  } else {
    if (tokenId === 'ETH') {
      tokenId = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
    }
    url += 'arbitrum'
    network = 'arbitrum-one'
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

export function useUSDPriceBNV2(
  amount?: BN | TokenBN,
  currency?: Currency
): { data: number | undefined; isLoading: boolean } {
  // const symbol = useMemo(() => {

  //   if (currency?.symbol === 'wBTC') return 'wrapped-bitcoin'
  //   if (currency?.symbol === 'USDC') return 'usd-coin'
  //   if (currency?.symbol === 'UNI') return 'uniswap'
  //   if (currency?.symbol == 'STG') return 'stargate-finance'
  //   if (currency?.symbol == 'ARB') return 'arbitrum'
  //   if (currency?.symbol == 'RDNT') return 'radiant-capital'
  //   if (currency?.symbol == 'XPET') return 'xpet-tech'
  //   if (currency?.symbol == 'GNS') return 'gains-network'
  //   if (currency?.symbol == 'CRV') return 'curve-dao-token'
  //   if (currency?.symbol == 'LDO') return 'lido-dao'
  //   if (currency?.symbol == 'LINK') return 'chainlink'
  //   return currency?.symbol
  // }, [currency])

  const { chainId } = useWeb3React()
  const [prevAmount, setPrevAmount] = useState<TokenBN | undefined>(undefined)

  const currencyAmount = useMemo(() => {
    if (amount && currency) {
      if ('tokenAddress' in amount) {
        if (amount.tokenAddress === currency.wrapped.address && prevAmount !== amount) {
          setPrevAmount(amount)
          return BnToCurrencyAmount(amount, currency)
        } else {
          return undefined
        }
      } else {
        return BnToCurrencyAmount(amount, currency)
      }
    } else return undefined
  }, [amount, currency])

  const { data } = useQuery(
    ['usdPrice', currency],
    async () => {
      if (!currency) throw new Error('Currency not found')
      try {
        if (!apiKey) throw new Error('missing key')

        const token = await getDecimalAndUsdValueData(chainId, currency?.wrapped.address)
        // response = await axios.get(`https://pro-api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=${currency?.wrapped.address}&vs_currencies=usd`,{
        //     headers: {
        //       Accept: 'application/json',
        //       'x-cg-pro-api-key': apiKey,
        //     },
        //   })
        //   if (response.status === 200) {
        //     return response.data[currency?.wrapped.address.toLowerCase()]['usd']
        //   }

        // if (response.status === 200) {
        //   return response.data.market_data.current_price.usd
        // }
        return token?.lastPriceUSD
        // throw new Error(`response status ${response.status}`)
      } catch (err) {
        throw new Error('Failed to fetch token data')
      }
    },
    {
      enabled: !!currency,
      refetchInterval: 1000 * 45,
      keepPreviousData: true,
    }
  )
  return useMemo(() => {
    if (!data || !currencyAmount) {
      return { data: undefined, isLoading: false }
    }
    return { data: parseFloat(data) * parseFloat(currencyAmount.toExact()), isLoading: false }
  }, [data, currencyAmount])
}

export function useUSDPriceBN(
  amount?: BN,
  currency?: Currency
): {
  data: number | undefined
  isLoading: boolean
} {
  const currencyAmount = useMemo(() => {
    if (amount && currency) return BnToCurrencyAmount(amount, currency)
    else return undefined
  }, [amount, currency])

  const chain = currencyAmount?.currency.chainId ? chainIdToBackendName(currencyAmount?.currency.chainId) : undefined
  // const currency = currencyAmount?.currency
  // console.log('useUSd', currencyAmount?.currency?.name)
  const { data: ethValue, isLoading: isEthValueLoading } = useETHValue(currencyAmount)
  // console.log('got ethvalue', ethValue?.toExact())
  const { data, networkStatus } = useTokenSpotPriceQuery({
    variables: { chain: chain ?? Chain.Ethereum, address: getNativeTokenDBAddress(chain ?? Chain.Ethereum) },
    skip: !chain || !isGqlSupportedChain(currency?.chainId),
    pollInterval: PollingInterval.Normal,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  })

  // console.logconsole.log('stablecoinPrice', stablecoinPrice)('native price', data?.token?.project?.markets?.[0]?.price?.value, networkStatus)
  // Use USDC price for chains not supported by backend yet
  const stablecoinPrice = useStablecoinPrice(!isGqlSupportedChain(currency?.chainId) ? currency : undefined)
  if (!isGqlSupportedChain(currency?.chainId) && currencyAmount && stablecoinPrice) {
    return { data: parseFloat(stablecoinPrice.quote(currencyAmount).toSignificant()), isLoading: false }
  }
  // console.log('stablecoinPrice', stablecoinPrice)
  const isFirstLoad = networkStatus === NetworkStatus.loading

  // Otherwise, get the price of the token in ETH, and then multiple by the price of ETH
  const ethUSDPrice = data?.token?.project?.markets?.[0]?.price?.value
  if (!ethUSDPrice || !ethValue) return { data: undefined, isLoading: isEthValueLoading || isFirstLoad }

  return { data: parseFloat(ethValue.toExact()) * ethUSDPrice, isLoading: false }
}

export function useUSDPrice(currencyAmount?: CurrencyAmount<Currency>): {
  data: number | undefined
  isLoading: boolean
} {
  const chain = currencyAmount?.currency.chainId ? chainIdToBackendName(currencyAmount?.currency.chainId) : undefined
  const currency = currencyAmount?.currency
  const { data: ethValue, isLoading: isEthValueLoading } = useETHValue(currencyAmount)
  const { data, networkStatus } = useTokenSpotPriceQuery({
    variables: { chain: chain ?? Chain.Ethereum, address: getNativeTokenDBAddress(chain ?? Chain.Ethereum) },
    skip: !chain || !isGqlSupportedChain(currency?.chainId),
    pollInterval: PollingInterval.Normal,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  })
  // Use USDC price for chains not supported by backend yet
  const stablecoinPrice = useStablecoinPrice(!isGqlSupportedChain(currency?.chainId) ? currency : undefined)
  if (!isGqlSupportedChain(currency?.chainId) && currencyAmount && stablecoinPrice) {
    return { data: parseFloat(stablecoinPrice.quote(currencyAmount).toSignificant()), isLoading: false }
  }

  const isFirstLoad = networkStatus === NetworkStatus.loading
  // console.log('sucess', '-----useUSDPrice----', currencyAmount, stablecoinPrice)

  // Otherwise, get the price of the token in ETH, and then multiple by the price of ETH
  const ethUSDPrice = data?.token?.project?.markets?.[0]?.price?.value
  if (!ethUSDPrice || !ethValue) return { data: undefined, isLoading: isEthValueLoading || isFirstLoad }

  return { data: parseFloat(ethValue.toExact()) * ethUSDPrice, isLoading: false }
}
