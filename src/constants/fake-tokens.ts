import { Token } from '@uniswap/sdk-core'
import { computePoolAddress } from 'hooks/usePools'

import { V3_CORE_FACTORY_ADDRESSES } from './addresses'
import { SupportedChainId } from './chains'

const weth_a = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
const wbtc_a = '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'
const usdc_a = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'

export const lusdc = '0x174652b085C32361121D519D788AbF0D9ad1C355'
export const lweth = '0x35B4c60a4677EcadaF2fe13fe3678efF724be16b'
const WETH_ARBITRUM = new Token(42161, weth_a, 18, 'wETH', 'Wrapped ETH')
const WBTC_ARBITRUM = new Token(42161, wbtc_a, 8, 'wBTC', 'Wrapped BTC')
const USDC_ARBITRUM = new Token(42161, usdc_a, 6, 'USDC', 'USDC')
const ARB_ARBITRUM = new Token(42161, '0x912CE59144191C1204E64559FE8253a0e49E6548', 18, 'ARB', 'Arbitrum')

export const USDC_BERA = new Token(80085, lusdc, 18, 'USDC', 'Limitless USDC')
export const WETH_BERA = new Token(80085, lweth, 18, 'WETH', 'Limitless WETH')

export const TokensArbitrum: { [address: string]: Token } = {
  [WETH_ARBITRUM.address]: WETH_ARBITRUM,
  [WBTC_ARBITRUM.address]: WBTC_ARBITRUM,
  [USDC_ARBITRUM.address]: USDC_ARBITRUM,
  [ARB_ARBITRUM.address]: ARB_ARBITRUM,
}

export const TokensArtio: { [address: string]: Token } = {
  [USDC_BERA.address]: USDC_BERA,
  [WETH_BERA.address]: WETH_BERA,
}

const WETH_LINEA = new Token(59144, '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', 18, 'WETH', 'Wrapped Ether')
const USDC_LINEA = new Token(59144, '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', 6, 'USDC', 'USDC')
const WBTC_LINEA = new Token(59144, '0x3aAB2285ddcDdaD8edf438C1bAB47e1a9D05a9b4', 8, 'WBTC', 'Wrapped BTC')
const WETH_BASE = new Token(8453, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether')
const USDC_BASE = new Token(8453, '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', 6, 'USDC', 'USD Coin')

export const TokensLinea: { [address: string]: Token } = {
  [WETH_LINEA.address]: WETH_LINEA,
  [USDC_LINEA.address]: USDC_LINEA,
  [WBTC_LINEA.address]: WBTC_LINEA,
}

const LINEA_TO_ARBITRUM: { [address: string]: string } = {
  [WETH_LINEA.address.toLowerCase()]: WETH_ARBITRUM.address,
  [USDC_LINEA.address.toLowerCase()]: USDC_ARBITRUM.address,
  [WBTC_LINEA.address.toLowerCase()]: WBTC_ARBITRUM.address,
}

const TokensBase: { [address: string]: Token } = {
  [WETH_BASE.address]: WETH_BASE,
  [USDC_BASE.address]: USDC_BASE,
}

const BERA_TO_ARBITRUM: { [address: string]: string } = {
  [USDC_BERA.address.toLowerCase()]: USDC_ARBITRUM.address,
  [WETH_BERA.address.toLowerCase()]: WETH_ARBITRUM.address,
}

const ARBITRUM_TO_LINEA: { [address: string]: string } = {
  [WETH_ARBITRUM.address.toLowerCase()]: WETH_LINEA.address,
  [USDC_ARBITRUM.address.toLowerCase()]: USDC_LINEA.address,
  [WBTC_ARBITRUM.address.toLowerCase()]: WBTC_LINEA.address,
}
const ARBITRUM_TO_BERA: { [address: string]: string } = {
  [USDC_ARBITRUM.address.toLowerCase()]: USDC_BERA.address,
  [WETH_ARBITRUM.address.toLowerCase()]: WETH_BERA.address,
}

export const UNSUPPORTED_GECKO_CHAINS = [SupportedChainId.LINEA, SupportedChainId.BERA_ARTIO]

export const switchChainAddress = (fromChainId: number, toChainId: number, address: string) => {
  if (fromChainId === SupportedChainId.LINEA && toChainId === SupportedChainId.ARBITRUM_ONE) {
    return LINEA_TO_ARBITRUM[address.toLowerCase()]
  } else if (fromChainId === SupportedChainId.BERA_ARTIO && toChainId === SupportedChainId.ARBITRUM_ONE) {
    return BERA_TO_ARBITRUM[address.toLowerCase()]
  } else if (fromChainId === SupportedChainId.ARBITRUM_ONE && toChainId === SupportedChainId.LINEA) {
    return ARBITRUM_TO_LINEA[address.toLowerCase()]
  } else if (fromChainId === SupportedChainId.ARBITRUM_ONE && toChainId === SupportedChainId.BERA_ARTIO) {
    return ARBITRUM_TO_BERA[address.toLowerCase()]
  }
  return address
}

export const switchPoolAddress = (
  fromChainId: number,
  toChainId: number,
  tokenA: string,
  tokenB: string,
  fee: number
) => {
  const _tokenA = switchChainAddress(fromChainId, toChainId, tokenA)
  const _tokenB = switchChainAddress(fromChainId, toChainId, tokenB)

  return computePoolAddress({
    factoryAddress: V3_CORE_FACTORY_ADDRESSES[toChainId],
    tokenA: _tokenA,
    tokenB: _tokenB,
    fee,
  })
}

export const getDefaultTokensMap = (chainId: number): { [address: string]: Token } => {
  if (chainId === SupportedChainId.ARBITRUM_ONE) {
    return TokensArbitrum
  } else if (chainId === SupportedChainId.LINEA) {
    return TokensLinea
  } else if (chainId === SupportedChainId.BERA_ARTIO) {
    return TokensArtio
  } else if (chainId === SupportedChainId.BASE) {
    return TokensBase
  } else {
    return {}
  }
}
