import { arrayify } from '@ethersproject/bytes'
import { parseBytes32String } from '@ethersproject/strings'
import { Currency, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { isSupportedChain } from 'constants/chains'
import { useBytes32TokenContract, useTokenContract } from 'hooks/useContract'
import { useSingleCallResult } from 'lib/hooks/multicall'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { useMemo } from 'react'

import { DEFAULT_ERC20_DECIMALS } from '../../constants/tokens'
import { TOKEN_SHORTHANDS } from '../../constants/tokens'
import { isAddress } from '../../utils'
import { supportedChainId } from '../../utils/supportedChainId'

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/

function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
  return str && str.length > 0
    ? str
    : // need to check for proper bytes string and valid terminator
    bytes32 && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
    ? parseBytes32String(bytes32)
    : defaultValue
}

export const UNKNOWN_TOKEN_SYMBOL = 'UNKNOWN'
const UNKNOWN_TOKEN_NAME = 'Unknown Token'

/**
 * Returns a Token from the tokenAddress.
 * Returns null if token is loading or null was passed.
 * Returns undefined if tokenAddress is invalid or token does not exist.
 */
export function useTokenFromActiveNetwork(tokenAddress: string | undefined): Token | null | undefined {
  const { chainId } = useWeb3React()

  const formattedAddress = isAddress(tokenAddress)
  const tokenContract = useTokenContract(formattedAddress ? formattedAddress : undefined, false)
  const tokenContractBytes32 = useBytes32TokenContract(formattedAddress ? formattedAddress : undefined, false)

  // TODO (WEB-3009): reduce this to one RPC call instead of 5
  // TODO: Fix redux-multicall so that these values do not reload.
  const tokenName = useSingleCallResult(tokenContract, 'name')
  const tokenNameBytes32 = useSingleCallResult(tokenContractBytes32, 'name')
  const symbol = useSingleCallResult(tokenContract, 'symbol')
  const symbolBytes32 = useSingleCallResult(tokenContractBytes32, 'symbol')
  const decimals = useSingleCallResult(tokenContract, 'decimals')

  const isLoading = useMemo(
    () => decimals.loading || symbol.loading || tokenName.loading,
    [decimals.loading, symbol.loading, tokenName.loading]
  )
  const parsedDecimals = useMemo(() => decimals?.result?.[0] ?? DEFAULT_ERC20_DECIMALS, [decimals.result])

  const parsedSymbol = useMemo(
    () => parseStringOrBytes32(symbol.result?.[0], symbolBytes32.result?.[0], UNKNOWN_TOKEN_SYMBOL),
    [symbol.result, symbolBytes32.result]
  )
  const parsedName = useMemo(
    () => parseStringOrBytes32(tokenName.result?.[0], tokenNameBytes32.result?.[0], UNKNOWN_TOKEN_NAME),
    [tokenName.result, tokenNameBytes32.result]
  )

  return useMemo(() => {
    // If the token is on another chain, we cannot fetch it on-chain, and it is invalid.
    if (typeof tokenAddress !== 'string' || !isSupportedChain(chainId) || !formattedAddress) return undefined
    if (isLoading || !chainId) return null

    return new Token(chainId, formattedAddress, parsedDecimals, parsedSymbol, parsedName)
  }, [chainId, tokenAddress, formattedAddress, isLoading, parsedDecimals, parsedSymbol, parsedName])
}

type TokenMap = { [address: string]: Token }

/**
 * Returns a Token from the tokenAddress.
 * Returns null if token is loading or null was passed.
 * Returns undefined if tokenAddress is invalid or token does not exist.
 */
export function useTokenFromMapOrNetwork(tokens: TokenMap, tokenAddress?: string | null): Token | null | undefined {
  // console.log('tokenAddress', tokenAddress)
  const address = isAddress(tokenAddress)
  if (address == '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1') return useTokenFromActiveNetwork(address)
  // else if(address =="0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60") return useTokenFromActiveNetwork(address)
  const token: Token | undefined = address ? tokens[address] : undefined
  let tokenFromNetwork = useTokenFromActiveNetwork(token ? undefined : address ? address : undefined)
  if (
    (address == '0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60' ||
      address == '0x912CE59144191C1204E64559FE8253a0e49E6548' ||
      address == '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a' ||
      address == '0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8' ||
      address == '0x539bdE0d7Dbd336b79148AA742883198BBF60342' ||
      address == '0x00CBcF7B3d37844e44b888Bc747bDd75FCf4E555' ||
      address == '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4' ||
      address == '0x3082CC23568eA640225c2467653dB90e9250AaA0' ||
      address == '0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66' ||
      address == '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0' ||
      address == '0x18c11FD286C5EC11c3b683Caa813B77f5163A122' ||
      address == '0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978' ||
      address == '0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66' ||
      address == '0x6694340fc020c5e6b96567843da2df01b2ce1eb6' ||
      address == '0xd4d42F0b6DEF4CE0383636770eF773390d85c61A' ||
      address == '0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55') &&
    token
  )
    tokenFromNetwork = new Token(token?.chainId, token?.address, token?.decimals, token?.symbol, token?.name)

  return tokenFromNetwork ?? token
}

/**
 * Returns a Currency from the currencyId.
 * Returns null if currency is loading or null was passed.
 * Returns undefined if currencyId is invalid or token does not exist.
 */
export function useCurrencyFromMap(tokens: TokenMap, currencyId?: string | null): Currency | null | undefined {
  const nativeCurrency = useNativeCurrency()
  const { chainId } = useWeb3React()
  const isNative = Boolean(nativeCurrency && currencyId?.toUpperCase() === 'ETH')
  const shorthandMatchAddress = useMemo(() => {
    const chain = supportedChainId(chainId)
    return chain && currencyId ? TOKEN_SHORTHANDS[currencyId.toUpperCase()]?.[chain] : undefined
  }, [chainId, currencyId])

  const token = useTokenFromMapOrNetwork(tokens, isNative ? undefined : shorthandMatchAddress ?? currencyId)

  if (currencyId === null || currencyId === undefined || !isSupportedChain(chainId)) return null

  // this case so we use our builtin wrapped token instead of wrapped tokens on token lists
  const wrappedNative = nativeCurrency?.wrapped
  if (wrappedNative?.address?.toUpperCase() === currencyId?.toUpperCase()) return wrappedNative

  return isNative ? nativeCurrency : token
}
