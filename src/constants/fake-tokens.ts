import { Token } from '@uniswap/sdk-core'
import { computePoolAddress } from 'hooks/usePools'

import { V3_CORE_FACTORY_ADDRESSES } from './addresses'
import { SupportedChainId } from './chains'

const weth_a = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
const wbtc_a = '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'
const usdc_a = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'

export const lusdc = '0x174652b085C32361121D519D788AbF0D9ad1C355'
export const lweth = '0x35B4c60a4677EcadaF2fe13fe3678efF724be16b'
export const WETH_ARBITRUM = new Token(42161, weth_a, 18, 'wETH', 'Wrapped ETH')
export const WBTC_ARBITRUM = new Token(42161, wbtc_a, 8, 'wBTC', 'Wrapped BTC')
export const USDC_ARBITRUM = new Token(42161, usdc_a, 6, 'USDC', 'USDC')
export const ARB_ARBITRUM = new Token(42161, '0x912CE59144191C1204E64559FE8253a0e49E6548', 18, 'ARB', 'Arbitrum')
export const UNI_ARBITRUM = new Token(42161, '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0', 18, 'UNI', 'Uniswap')
export const SUSHI_ARBITRUM = new Token(42161, '0xd4d42F0b6DEF4CE0383636770eF773390d85c61A', 18, 'SUSHI', 'SushiToken')
export const RNDT_ARBITRUM = new Token(42161, '0x3082CC23568eA640225c2467653dB90e9250AaA0', 18, 'RNDT', 'Radiant')
export const XPET_ARBITRUM = new Token(42161, '0x00CBcF7B3d37844e44b888Bc747bDd75FCf4E555', 18, 'XPET', 'xPet.tech Token')
export const CRV_ARBITRUM = new Token(42161, '0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978', 18, 'CRV', 'Curve DAO Token')
export const STG_ARBITRUM = new Token(42161, '0x6694340fc020c5E6B96567843da2df01b2CE1eb6', 18, 'STG', 'Stargaze Token')
export const XAI_ARBITRUM = new Token(42161, '0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66', 18, 'XAI', 'Xai')
export const MAGIC_ARBITRUM = new Token(42161, '0x539bdE0d7Dbd336b79148AA742883198BBF60342', 18, 'MAGIC', 'MAGIC')
export const DAI_ARBITRUM = new Token(42161, '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', 18, 'DAI', 'Dai Stablecoin')
export const LDO_ARBITRUM = new Token(42161, '0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60', 18, 'LDO', 'Lido DAO Token')
export const GNS_ARBITRUM = new Token(42161, '0x18c11FD286C5EC11c3b683Caa813B77f5163A122', 18, 'GNS', 'Gains Network')
export const PENDLE_ARBITRUM = new Token(42161, '0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8', 18, 'PENDLE', 'Pendle')
export const LINK_ARBITRUM = new Token(42161, '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', 18, 'LINK', 'ChainLink Token')
export const GMX_ARBITRUM = new Token(42161, '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', 18, 'GMX', 'GMX')

export const USDC_BERA = new Token(80085, lusdc, 18, 'USDC', 'Limitless USDC')
export const WETH_BERA = new Token(80085, lweth, 18, 'WETH', 'Limitless WETH')

export const TokensArbitrum: { [address: string]: Token } = {
  [WETH_ARBITRUM.address]: WETH_ARBITRUM,
  // [WBTC_ARBITRUM.address]: WBTC_ARBITRUM,
  // [USDC_ARBITRUM.address]: USDC_ARBITRUM,
  // [ARB_ARBITRUM.address]: ARB_ARBITRUM,
  // [UNI_ARBITRUM.address]: UNI_ARBITRUM,
  // [SUSHI_ARBITRUM.address]: SUSHI_ARBITRUM,
  // [RNDT_ARBITRUM.address]: RNDT_ARBITRUM,
  // [XPET_ARBITRUM.address]: XPET_ARBITRUM,
  // [CRV_ARBITRUM.address]: CRV_ARBITRUM,
  // [STG_ARBITRUM.address]: STG_ARBITRUM,
  // [XAI_ARBITRUM.address]: XAI_ARBITRUM,
  // [MAGIC_ARBITRUM.address]: MAGIC_ARBITRUM,
  [DAI_ARBITRUM.address]: DAI_ARBITRUM,
  // [LDO_ARBITRUM.address]: LDO_ARBITRUM,
  // [GNS_ARBITRUM.address]: GNS_ARBITRUM,
  // [PENDLE_ARBITRUM.address]: PENDLE_ARBITRUM,
  // [LINK_ARBITRUM.address]: LINK_ARBITRUM,
  // [GMX_ARBITRUM.address]: GMX_ARBITRUM,
}

export function getNativeAddress(chainId: number): string {
  if (chainId === SupportedChainId.ARBITRUM_ONE) {
    return WETH_ARBITRUM.address
  } else if (chainId === SupportedChainId.BASE) {
    return WETH_BASE.address
  }
  return ''
}

export const TokensArtio: { [address: string]: Token } = {
  // [USDC_BERA.address]: USDC_BERA,
  [WETH_BERA.address]: WETH_BERA,
}

const WETH_LINEA = new Token(59144, '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', 18, 'WETH', 'Wrapped Ether')
const USDC_LINEA = new Token(59144, '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', 6, 'USDC', 'USDC')
const WBTC_LINEA = new Token(59144, '0x3aAB2285ddcDdaD8edf438C1bAB47e1a9D05a9b4', 8, 'WBTC', 'Wrapped BTC')

const WETH_BASE = new Token(8453, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether')
const USDC_BASE = new Token(8453, '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', 6, 'USDC', 'USD Coin')
const LIMWETH_BASE = new Token(8453, '0x845d629D2485555514B93F05Bdbe344cC2e4b0ce', 18, 'limWETH', 'Limit WETH')
// const TOSHI_BASE = new Token(8453, '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4', 18, 'TOSHI', 'Toshi')
// const DEGEN_BASE = new Token(8453, '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 18, 'DEGEN', 'Degen')
// const BRETT_BASE = new Token(8453, '0x532f27101965dd16442E59d40670FaF5eBB142E4', 18, 'BRETT', 'Brett')
// const AERO_BASE = new Token(8453, '0x940181a94A35A4569E4529A3CDfB74e38FD98631', 18, 'AERO', 'Aerodrome')
// const OKAYEG_BASE = new Token(8453, '0xdb6e0e5094A25a052aB6845a9f1e486B9A9B3DdE', 18, 'OKAYEG', 'Okayeg')
// const BSHIB_BASE = new Token(8453, '0xfEA9DcDc9E23a9068bF557AD5b186675C61d33eA', 18, 'BSHIB', 'Based Shiba Inu')



const ARBITRUM_STABLES: string[] = [USDC_ARBITRUM.address]
const BASE_STABLES: string[] = [USDC_BASE.address]

export function getStables(chainId: number): string[] {
  if (chainId === SupportedChainId.ARBITRUM_ONE) {
    return ARBITRUM_STABLES
  } else if (chainId === SupportedChainId.BASE) {
    return BASE_STABLES
  }
  return []
}

export const TokensLinea: { [address: string]: Token } = {
  [WETH_LINEA.address]: WETH_LINEA,
  // [USDC_LINEA.address]: USDC_LINEA,
  // [WBTC_LINEA.address]: WBTC_LINEA,
}

const LINEA_TO_ARBITRUM: { [address: string]: string } = {
  [WETH_LINEA.address.toLowerCase()]: WETH_ARBITRUM.address,
  [USDC_LINEA.address.toLowerCase()]: USDC_ARBITRUM.address,
  [WBTC_LINEA.address.toLowerCase()]: WBTC_ARBITRUM.address,
}

const TokensBase: { [address: string]: Token } = {
  [WETH_BASE.address]: WETH_BASE,
  [LIMWETH_BASE.address]: LIMWETH_BASE
  // [USDC_BASE.address]: USDC_BASE,
  // [TOSHI_BASE.address]: TOSHI_BASE,
  // [DEGEN_BASE.address]: DEGEN_BASE,
  // [BRETT_BASE.address]: BRETT_BASE,
  // [AERO_BASE.address]: AERO_BASE,
  // [OKAYEG_BASE.address]: OKAYEG_BASE,
  // [BSHIB_BASE.address]: BSHIB_BASE,
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
