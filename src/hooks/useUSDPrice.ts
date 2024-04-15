import { NetworkStatus } from '@apollo/client'
import { Currency, CurrencyAmount, Price, SupportedChainId, TradeType } from '@uniswap/sdk-core'
import axios from 'axios'
import { BigNumber as BN } from 'bignumber.js'
import { nativeOnChain } from 'constants/tokens'
import { Chain, useTokenSpotPriceQuery } from 'graphql/data/__generated__/types-and-hooks'
import { chainIdToBackendName, isGqlSupportedChain, PollingInterval } from 'graphql/data/util'
import { useState, useMemo } from 'react'
import { useQuery } from 'react-query'
import { BnToCurrencyAmount } from 'state/marginTrading/hooks'
import { RouterPreference } from 'state/routing/slice'
import { TradeState } from 'state/routing/types'
import { useRoutingAPITrade } from 'state/routing/useRoutingAPITrade'
import { getNativeTokenDBAddress } from 'utils/nativeTokens'
import { SupportedChainId as SupportedChainIdLMT } from 'constants/chains'
import { TokenBN } from 'utils/lmtSDK/internalConstants'

import useStablecoinPrice from './useStablecoinPrice'

// ETH amounts used when calculating spot price for a given currency.
// The amount is large enough to filter low liquidity pairs.
const ETH_AMOUNT_OUT: { [chainId: number]: CurrencyAmount<Currency> } = {
  [SupportedChainId.MAINNET]: CurrencyAmount.fromRawAmount(nativeOnChain(SupportedChainId.MAINNET), 100e18),
  [SupportedChainId.ARBITRUM_ONE]: CurrencyAmount.fromRawAmount(nativeOnChain(SupportedChainId.ARBITRUM_ONE), 10e18),
  [SupportedChainId.OPTIMISM]: CurrencyAmount.fromRawAmount(nativeOnChain(SupportedChainId.OPTIMISM), 10e18),
  [SupportedChainId.POLYGON]: CurrencyAmount.fromRawAmount(nativeOnChain(SupportedChainId.POLYGON), 10_000e18),
  [SupportedChainId.CELO]: CurrencyAmount.fromRawAmount(nativeOnChain(SupportedChainId.CELO), 10e18),
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

export function useUSDPriceBNV2(amount?: BN | TokenBN, currency?: Currency): { data: number | undefined; isLoading: boolean } {
  const symbol = useMemo(() => {
    if (currency?.symbol === 'wBTC') return 'wrapped-bitcoin'
    if (currency?.symbol === 'USDC') return 'usd-coin'
    if (currency?.symbol === 'UNI') return 'uniswap'
    if (currency?.symbol == 'STG') return 'stargate-finance'
    if (currency?.symbol == 'ARB') return 'arbitrum'
    if (currency?.symbol == 'RDNT') return 'radiant-capital'
    if (currency?.symbol == 'XPET') return 'xpet-tech'
    if (currency?.symbol == 'GNS') return 'gains-network'
    if (currency?.symbol == 'CRV') return 'curve-dao-token'
    if (currency?.symbol == 'LDO') return 'lido-dao'
    if (currency?.symbol == 'LINK') return 'chainlink'
    return currency?.symbol
  }, [currency])


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
    }
    else return undefined
  }, [amount, currency])
    
  const { data } = useQuery(
    ['usdPrice', currency],
    async () => {
      if (!currency || !symbol) throw new Error('Currency not found')
      try {
        if (!apiKey) throw new Error('missing key')
        let response
        if (currency?.chainId === SupportedChainIdLMT.BASE) {
          response = await axios.get(`https://pro-api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=${currency?.wrapped.address}&vs_currencies=usd`,{
            headers: {
              Accept: 'application/json',
              'x-cg-pro-api-key': apiKey,
            },
          })
          if (response.status === 200) {
            return response.data[currency?.wrapped.address.toLowerCase()]['usd']
          }

        } else {
          response = await axios.get(`https://pro-api.coingecko.com/api/v3/coins/${symbol.toLocaleLowerCase()}`, {
            headers: {
              Accept: 'application/json',
              'x-cg-pro-api-key': apiKey,
            },
          })
        }
        if (response.status === 200) {
          return response.data.market_data.current_price.usd
        }
        throw new Error(`response status ${response.status}`)
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
    return { data: data * parseFloat(currencyAmount.toExact()), isLoading: false }
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
  // console.log('sucess', '-----useUSDPrice----', currencyAmount)
  // Use USDC price for chains not supported by backend yet
  const stablecoinPrice = useStablecoinPrice(!isGqlSupportedChain(currency?.chainId) ? currency : undefined)
  if (!isGqlSupportedChain(currency?.chainId) && currencyAmount && stablecoinPrice) {
    return { data: parseFloat(stablecoinPrice.quote(currencyAmount).toSignificant()), isLoading: false }
  }

  const isFirstLoad = networkStatus === NetworkStatus.loading

  // Otherwise, get the price of the token in ETH, and then multiple by the price of ETH
  const ethUSDPrice = data?.token?.project?.markets?.[0]?.price?.value
  if (!ethUSDPrice || !ethValue) return { data: undefined, isLoading: isEthValueLoading || isFirstLoad }

  return { data: parseFloat(ethValue.toExact()) * ethUSDPrice, isLoading: false }
}
