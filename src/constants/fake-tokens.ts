import { Token } from '@uniswap/sdk-core'

import { SupportedChainId } from './chains'

export const feth_m = '0xa826985df0507632c7dab6de761d8d4efc353d1f'
export const fusdc_m = '0x54d374769278b45713549b85ca9dd9cae3e286cc'
export const fwbtc_m = '0xcbd6235bb2cf6bc3eafd36c4a53691a198bd372b'
export const fusdt_m = '0xec6aab8617f24f5ff6e2560bb2eaabc2ed1ddda8'
export const fdai_m = '0xdad060ea62ccf995e765e6df18587e8e5937fb80'

export const fwbtc_s = '0xf24ce4a61c1894219576f652cdf781bbb257ec8f'
export const fdai_s = '0x7131ba0d21cf74ae67e64c539af0cff8780bf836'
export const fusdc_s = '0x569f3140fdc0f3b9fc2e4919c35f35d39dd2b01a'
export const feth_s = '0x4e3f175b38098326a34f2c8b2d07af5ffdfc6fa9'
// console.log(fwbtc < fdai)
// console.log(fwbtc < fusdc)
// console.log(fwbtc < feth)
// console.log(fdai < fusdc)
// console.log(fusdc < feth)
// console.log(fdai < feth)
export const weth = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
export const wbtc = '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'
export const weth_a = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
export const wbtc_a = '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'
export const usdc_a = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'

export const lusdc = '0x174652b085C32361121D519D788AbF0D9ad1C355'
export const lweth = '0x35B4c60a4677EcadaF2fe13fe3678efF724be16b'
export const WETH_ARBITRUM = new Token(42161, weth_a, 18, 'wETH', 'Wrapped ETH')
export const WBTC_ARBITRUM = new Token(42161, wbtc_a, 8, 'wBTC', 'Wrapped BTC')
export const USDC_ARBITRUM = new Token(42161, usdc_a, 6, 'USDC', 'USDC')

export const USDC_BERA = new Token(80085, lusdc, 18, 'USDC', 'Limitless USDC')
export const WETH_BERA = new Token(80085, lweth, 18, 'WETH', 'Limitless WETH')

export const FETH_SEPOLIA = new Token(11155111, feth_s, 18, 'fETH', 'Fake ETH')
export const FUSDC_SEPOLIA = new Token(11155111, fusdc_s, 18, 'fUSDC', 'Fake USDC')
export const FWBTC_SEPOLIA = new Token(11155111, fwbtc_s, 18, 'fWBTC', 'Fake WBTC')
export const FDAI_SEPOLIA = new Token(11155111, fdai_s, 18, 'fDAI', 'Fake DAI')

export const FETH_MUMBAI = new Token(80001, feth_m, 18, 'fETH', 'Fake ETH')
export const FUSDC_MUMBAI = new Token(80001, fusdc_m, 18, 'fUSDC', 'Fake USDC')
export const FWBTC_MUMBAI = new Token(80001, fwbtc_m, 18, 'fWBTC', 'Fake WBTC')
export const FDAI_MUMBAI = new Token(80001, fdai_m, 18, 'fDAI', 'Fake DAI')

export const FakeTokens_SEPOLIA: Token[] = [FETH_SEPOLIA, FUSDC_SEPOLIA, FWBTC_SEPOLIA, FDAI_SEPOLIA]

export const FakeTokens_MUMBAI: Token[] = [FETH_MUMBAI, FUSDC_MUMBAI, FWBTC_MUMBAI, FDAI_MUMBAI]

export const FakeTokensMapSepolia: { [address: string]: Token } = {
  [FETH_SEPOLIA.address]: FETH_SEPOLIA,
  [FUSDC_SEPOLIA.address]: FUSDC_SEPOLIA,
  [FWBTC_SEPOLIA.address]: FWBTC_SEPOLIA,
  [FDAI_SEPOLIA.address]: FDAI_SEPOLIA,
}

export const FakeTokensMapMumbai: { [address: string]: Token } = {
  [FETH_MUMBAI.address]: FETH_MUMBAI,
  [FUSDC_MUMBAI.address]: FUSDC_MUMBAI,
  [FWBTC_MUMBAI.address]: FWBTC_MUMBAI,
  [FDAI_MUMBAI.address]: FDAI_MUMBAI,
}

export const TokensArbitrum: { [address: string]: Token } = {
  [WETH_ARBITRUM.address]: WETH_ARBITRUM,
  [WBTC_ARBITRUM.address]: WBTC_ARBITRUM,
  [USDC_ARBITRUM.address]: USDC_ARBITRUM,
}

export const TokensArtio: { [address: string]: Token } = {
  [USDC_BERA.address]: USDC_BERA,
  [WETH_BERA.address]: WETH_BERA,
}

const WETH_LINEA = new Token(59144, '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', 18, 'WETH', 'Wrapped Ether')
const USDC_LINEA = new Token(59144, '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', 6, 'USDC', 'USDC')
const WBTC_LINEA = new Token(59144, '0x3aAB2285ddcDdaD8edf438C1bAB47e1a9D05a9b4', 8, 'WBTC', 'Wrapped BTC')

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

export const getFakeTokensMap = (chainId?: number): { [address: string]: Token } => {
  if (chainId === SupportedChainId.SEPOLIA) {
    return FakeTokensMapSepolia
  } else if (chainId === SupportedChainId.ARBITRUM_ONE) {
    return TokensArbitrum
  } else if (chainId === SupportedChainId.BERA_ARTIO) {
    return TokensArtio
  } else {
    return FakeTokensMapMumbai
  }
}

export const getDefaultTokensMap = (chainId: number): { [address: string]: Token } => {
  if (chainId === SupportedChainId.ARBITRUM_ONE) {
    return TokensArbitrum
  } else if (chainId === SupportedChainId.LINEA) {
    return TokensLinea
  } else {
    return TokensArbitrum
  }
}
