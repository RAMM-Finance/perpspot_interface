import { Ether, NativeCurrency, Token, WETH9 } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'

export const NATIVE_CHAIN_ID = 'NATIVE'

// When decimals are not specified for an ERC20 token
// use default ERC20 token decimals as specified here:
// https://docs.openzeppelin.com/contracts/3.x/erc20
export const DEFAULT_ERC20_DECIMALS = 18

const USDC_GOERLI = new Token(
  SupportedChainId.GOERLI,
  '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
  6,
  'USDC',
  'USD//C'
)

export const USDC_ARBITRUM = new Token(
  SupportedChainId.ARBITRUM_ONE,
  // '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
  '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
  6,
  'USDC',
  'USD//C'
)

export const DAI_ARBITRUM_ONE = new Token(
  SupportedChainId.ARBITRUM_ONE,
  '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  18,
  'DAI',
  'Dai stable coin'
)

export const USDT_ARBITRUM_ONE = new Token(
  SupportedChainId.ARBITRUM_ONE,
  '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  6,
  'USDT',
  'Tether USD'
)

export const WBTC_ARBITRUM_ONE = new Token(
  SupportedChainId.ARBITRUM_ONE,
  '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
  8,
  'WBTC',
  'Wrapped BTC'
)

export const UNI: { [chainId: number]: Token } = {
  // [SupportedChainId.MAINNET]: new Token(SupportedChainId.MAINNET, UNI_ADDRESS[1], 18, 'UNI', 'Uniswap'),
  // [SupportedChainId.GOERLI]: new Token(SupportedChainId.GOERLI, UNI_ADDRESS[5], 18, 'UNI', 'Uniswap'),
}

export const ARB = new Token(
  SupportedChainId.ARBITRUM_ONE,
  '0x912CE59144191C1204E64559FE8253a0e49E6548',
  18,
  'ARB',
  'Arbitrum'
)

export const USDC_BASE = new Token(
  SupportedChainId.BASE,
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  6,
  'USDC',
  'USD//C'
)

export const WETH_MAP: { [chainId: number]: string } = {
  [SupportedChainId.ARBITRUM_ONE]: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  [SupportedChainId.BASE]: '0x4200000000000000000000000000000000000006',
}

export const USDC_MAP: { [chainId: number]: string } = {
  [SupportedChainId.ARBITRUM_ONE]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  [SupportedChainId.BASE]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
}

export const WRAPPED_NATIVE_CURRENCY: { [chainId: number]: Token | undefined } = {
  ...(WETH9 as Record<SupportedChainId, Token>),
  // [SupportedChainId.OPTIMISM]: new Token(
  //   SupportedChainId.OPTIMISM,
  //   '0x4200000000000000000000000000000000000006',
  //   18,
  //   'WETH',
  //   'Wrapped Ether'
  // ),
  // [SupportedChainId.SEPOLIA]: new Token(
  //   SupportedChainId.SEPOLIA,
  //   '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
  //   18,
  //   'WETH',
  //   'Wrapped Ether'
  // ),
  // [SupportedChainId.OPTIMISM_GOERLI]: new Token(
  //   SupportedChainId.OPTIMISM_GOERLI,
  //   '0x4200000000000000000000000000000000000006',
  //   18,
  //   'WETH',
  //   'Wrapped Ether'
  // ),
  [SupportedChainId.ARBITRUM_ONE]: new Token(
    SupportedChainId.ARBITRUM_ONE,
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    18,
    'WETH',
    'Wrapped Ether'
  ),
  // [SupportedChainId.ARBITRUM_GOERLI]: new Token(
  //   SupportedChainId.ARBITRUM_GOERLI,
  //   '0xe39Ab88f8A4777030A534146A9Ca3B52bd5D43A3',
  //   18,
  //   'WETH',
  //   'Wrapped Ether'
  // ),
  // [SupportedChainId.POLYGON]: new Token(
  //   SupportedChainId.POLYGON,
  //   '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  //   18,
  //   'WMATIC',
  //   'Wrapped MATIC'
  // ),
  // [SupportedChainId.POLYGON_MUMBAI]: new Token(
  //   SupportedChainId.POLYGON_MUMBAI,
  //   '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
  //   18,
  //   'WMATIC',
  //   'Wrapped MATIC'
  // ),
  // [SupportedChainId.CELO]: new Token(
  //   SupportedChainId.CELO,
  //   '0x471ece3750da237f93b8e339c536989b8978a438',
  //   18,
  //   'CELO',
  //   'Celo native asset'
  // ),
  // [SupportedChainId.CELO_ALFAJORES]: new Token(
  //   SupportedChainId.CELO_ALFAJORES,
  //   '0xf194afdf50b03e69bd7d057c1aa9e10c9954e4c9',
  //   18,
  //   'CELO',
  //   'Celo native asset'
  // ),
  // [SupportedChainId.BNB]: new Token(
  //   SupportedChainId.BNB,
  //   '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  //   18,
  //   'WBNB',
  //   'Wrapped BNB'
  // ),
  [SupportedChainId.BERA_ARTIO]: new Token(
    SupportedChainId.BERA_ARTIO,
    '0x5806E416dA447b267cEA759358cF22Cc41FAE80F',
    18,
    'wBERA',
    'Wrapped Bera'
  ),
  [SupportedChainId.LINEA]: new Token(
    SupportedChainId.LINEA,
    '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f',
    18,
    'WETH',
    'Wrapped Ether'
  ),
  [SupportedChainId.BASE]: new Token(
    SupportedChainId.BASE,
    '0x4200000000000000000000000000000000000006',
    18,
    'WETH',
    'Wrapped Ether'
  ),
}

// export function isCelo(chainId: number): chainId is SupportedChainId.CELO | SupportedChainId.CELO_ALFAJORES {
//   return chainId === SupportedChainId.CELO_ALFAJORES || chainId === SupportedChainId.CELO
// }

// function isMatic(chainId: number): chainId is SupportedChainId.POLYGON | SupportedChainId.POLYGON_MUMBAI {
//   return chainId === SupportedChainId.POLYGON_MUMBAI || chainId === SupportedChainId.POLYGON
// }

// class MaticNativeCurrency extends NativeCurrency {
//   equals(other: Currency): boolean {
//     return other.isNative && other.chainId === this.chainId
//   }

//   get wrapped(): Token {
//     if (!isMatic(this.chainId)) throw new Error('Not matic')
//     const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId]
//     invariant(wrapped instanceof Token)
//     return wrapped
//   }

//   public constructor(chainId: number) {
//     if (!isMatic(chainId)) throw new Error('Not matic')
//     super(chainId, 18, 'MATIC', 'Polygon Matic')
//   }
// }

// function isBsc(chainId: number): chainId is SupportedChainId.BNB {
//   return chainId === SupportedChainId.BNB
// }

// class BscNativeCurrency extends NativeCurrency {
//   equals(other: Currency): boolean {
//     return other.isNative && other.chainId === this.chainId
//   }

//   get wrapped(): Token {
//     if (!isBsc(this.chainId)) throw new Error('Not bnb')
//     const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId]
//     invariant(wrapped instanceof Token)
//     return wrapped
//   }

//   public constructor(chainId: number) {
//     if (!isBsc(chainId)) throw new Error('Not bnb')
//     super(chainId, 18, 'BNB', 'BNB')
//   }
// }

class ExtendedEther extends Ether {
  public get wrapped(): Token {
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId]
    if (wrapped) return wrapped
    throw new Error(`Unsupported chain ID: ${this.chainId}`)
  }

  private static _cachedExtendedEther: { [chainId: number]: NativeCurrency } = {}

  public static onChain(chainId: number): ExtendedEther {
    return this._cachedExtendedEther[chainId] ?? (this._cachedExtendedEther[chainId] = new ExtendedEther(chainId))
  }
}

const cachedNativeCurrency: { [chainId: number]: NativeCurrency | Token } = {}
export function nativeOnChain(chainId: number): NativeCurrency | Token {
  if (cachedNativeCurrency[chainId]) return cachedNativeCurrency[chainId]
  const nativeCurrency: NativeCurrency | Token = ExtendedEther.onChain(chainId)
  // if (isMatic(chainId)) {
  //   nativeCurrency = new MaticNativeCurrency(chainId)
  // } else if (isCelo(chainId)) {
  //   nativeCurrency = getCeloNativeCurrency(chainId)
  // } else if (isBsc(chainId)) {
  //   nativeCurrency = new BscNativeCurrency(chainId)
  // } else {
  //   nativeCurrency =
  // }
  return (cachedNativeCurrency[chainId] = nativeCurrency)
}

export const TOKEN_SHORTHANDS: { [shorthand: string]: { [chainId in SupportedChainId]?: string } } = {
  USDC: {
    // [SupportedChainId.MAINNET]: USDC_MAINNET.address,
    [SupportedChainId.ARBITRUM_ONE]: USDC_ARBITRUM.address,
    // [SupportedChainId.ARBITRUM_GOERLI]: USDC_ARBITRUM_GOERLI.address,
    // [SupportedChainId.OPTIMISM]: USDC_OPTIMISM.address,
    // [SupportedChainId.OPTIMISM_GOERLI]: USDC_OPTIMISM_GOERLI.address,
    // [SupportedChainId.POLYGON]: USDC_POLYGON.address,
    // [SupportedChainId.POLYGON_MUMBAI]: USDC_POLYGON_MUMB/AI.address,
    // [SupportedChainId.BNB]: USDC_BSC.address,/
    // [SupportedChainId.CELO]: PORTAL_USDC_CELO.address,
    // [SupportedChainId.CELO_ALFAJORES]: PORTAL_USDC_CELO.address,
    [SupportedChainId.GOERLI]: USDC_GOERLI.address,
  },
}
