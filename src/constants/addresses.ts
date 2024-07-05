// import { V2_FACTORY_ADDRESSES as V2_FACTORY_ADDRESS } from '@uniswap/v2-sdk'
import { FACTORY_ADDRESS as V3_FACTORY_ADDRESS } from '@uniswap/v3-sdk'
import { SupportedChainId } from 'constants/chains'

import { constructSameAddressMap } from '../utils/constructSameAddressMap'
import { ZERO_ADDRESS } from './misc'

type AddressMap = { [chainId: number]: string }

export const UNI_ADDRESS: AddressMap = constructSameAddressMap('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984')

export const UNISWAP_NFT_AIRDROP_CLAIM_ADDRESS = '0x8B799381ac40b838BBA4131ffB26197C432AFe78'

// export const V2_FACTORY_ADDRESSES: AddressMap = constructSameAddressMap(V2_FACTORY_ADDRESS)
export const V2_ROUTER_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'),
}

export const tokenAddressIsWeth = (address: string, chainId?: number) => {
  if (chainId === SupportedChainId.ARBITRUM_ONE) {
    return address.toLowerCase() === '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'.toLowerCase()
  } else if (chainId === SupportedChainId.BASE) {
    return address.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()
  }
  return address.toLowerCase() === '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'.toLowerCase()
}

const isWeth = (address: string, chainId?: number) => {
  if (chainId === SupportedChainId.ARBITRUM_ONE) {
    return address.toLowerCase() === '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'.toLowerCase()
  }
  return address.toLowerCase() === '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'.toLowerCase()
}

const isUSDC = (address: string, chainId?: number) => {
  if (chainId === SupportedChainId.ARBITRUM_ONE) {
    return address.toLowerCase() === '0xaf88d065e77c8cc2239327c5edb3a432268e5831'.toLowerCase()
  }
  return address.toLowerCase() === '0xaf88d065e77c8cc2239327c5edb3a432268e5831'.toLowerCase()
}

const iswBTC = (address: string, chainId?: number) => {
  if (chainId === SupportedChainId.ARBITRUM_ONE) {
    return address.toLowerCase() === '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'.toLowerCase()
  }
  return address.toLowerCase() === '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'.toLowerCase()
}

export const getInvertPrice = (token0: string, token1: string, chainId?: number) => {
  if (isWeth(token0, chainId) && !isUSDC(token1, chainId)) {
    return true
  } else if (isUSDC(token0, chainId)) {
    return true
  } else if (iswBTC(token0, chainId) && isWeth(token1, chainId)) {
    return true
  }
  return false
}

// LMT V2 CONSTANTS
// Compiled 81 Solidity files successfully
export const SEPOLIA_V3_POOL_FACTORY = '0xb059a3C8189CaB0Df211EdE3b8421c0C4B17ecf6'
export const SEPOLIA_ROUTER = '0x0ff38A972508641dbC96D42a4a0845715a037DCE'
export const SEPOLIA_QUOTER_V2 = '0xaBDB28dEDDeB90a86838668d4fd7d811c91D2C2e'
export const SEPOLIA_NONFUNGIBLE_POSITION_MANAGER = '0x866bce1A92bcA659086e1FEc6810bd3bFC8A0F11'
export const SEPOLIA_POOL_MANAGER = '0xCDd2B4718846e1F6eC3a77A06964E4cF6f4774E1'
export const SEPOLIA_MARGIN_FACILITY = '0x583397D71F0bb793F42AE1D38c9c9E2bABb6e7F7'
export const SEPOLIA_DATA_PROVIDER = '0xea1b1cd78d168A85FE28Bce768d9079e65a19A07'
export const SEPOLIA_NFPM = '0xf649991A8f7d8d87ACEFD3a722653fB8ADE1e319'

export const POOL_INIT_CODE_HASH = '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54'

export const SEPOLIA_TICK_LENS = '0x3608234ef94d0CCF4AC46284DFb102568aac2aB2'

export const DATA_PROVIDER_ADDRESSES: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: '0x82568508B06E2b7b7eEc1612fDE6DD988FDaCB37',
  [SupportedChainId.BERA_ARTIO]: '0xd758471Ef17D894764c5c6ce9836Cb263c8C119A',
  [SupportedChainId.LINEA]: '0x83a6aEa2FFEF56Da01aDd410e9aE989776c47Bc8',
  // [SupportedChainId.BASE]: '0x87E697c3EBe41eD707E4AD52541f19292Be81177',
  // [SupportedChainId.BASE]: '0xEd1c5ef64923B6783e9b82Dd088ADB1478E1243b',
  [SupportedChainId.BASE]: '0x92fcfd6E016276ec0f278be073bA887a597Cca87',
}

export const LMT_MARGIN_FACILITY: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: '0x3611CD2B957514222a94C93e1A9a5be66b0b2841',
  [SupportedChainId.BERA_ARTIO]: '0xAaE4021d575d31D03F7b706C8C76e6D845f3F225',
  [SupportedChainId.LINEA]: '0x3611CD2B957514222a94C93e1A9a5be66b0b2841',
  [SupportedChainId.BASE]: '0x536801AaE40cb214c08f178c6727d7594a7c655b',
}
// [SupportedChainId.BERA_ARTIO]: '0xD4c28F4Ce11878c19212FC32260Cf740b9b84638',
// [SupportedChainId.ARBITRUM_ONE]: '0x3471Dcf01431bED2A654d7b8D1460950CE1502da',
// [SupportedChainId.LINEA]: '0xfdA3E8c8134685c42f22f4B75e275949a6BbA454',
// [SupportedChainId.BASE]: '0xd9b8FF321a0d7D75E8022563fA157FCc3A33E54c',
export const LMT_QUOTER: AddressMap = {
  [SupportedChainId.BERA_ARTIO]: '0xD4c28F4Ce11878c19212FC32260Cf740b9b84638',
  [SupportedChainId.ARBITRUM_ONE]: '0x672b567F5d6888b23225183130A947298BE701Cc',
  [SupportedChainId.LINEA]: '0xfdA3E8c8134685c42f22f4B75e275949a6BbA454',
  // [SupportedChainId.BASE]: '0xA6145ed3cDcA9E6B58F9DbA7Df246b6C5974497E',
  // [SupportedChainId.BASE]: '0x90C0Fa8fDf10C2247969CFF1514824a2426e702E',
  // [SupportedChainId.BASE]: '0x2b19d4A7Ed0f8F0952eD8DCF359B44346017Dfd5',
  [SupportedChainId.BASE]: '0xED14586763578147136e55D20a0Ee884Cd8fBC6d',
}

export const LMT_NFT_POSITION_MANAGER: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: '0x6D73fc6F4C299E369377C0e60CebFef2409f86A0',
  [SupportedChainId.BERA_ARTIO]: '0xe4a79FA8E4880Fdd4F651eE7aF9391f21e87Cf57',
  [SupportedChainId.LINEA]: '0x726e3116AE07f43A7E1921c635352B75e2DEa4Ad',
  [SupportedChainId.BASE]: '0x3eF54A2Cf152f6E06C0928722412883D448F92eC',
}

export const LMT_NFPM_V2: AddressMap = {}

export const LMT_POOL_MANAGER: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: '0x536801AaE40cb214c08f178c6727d7594a7c655b',
  [SupportedChainId.BERA_ARTIO]: '0x778D60ee8E9015AAE12b661C4cFCf62b8efd6b5f',
  [SupportedChainId.LINEA]: '0x536801AaE40cb214c08f178c6727d7594a7c655b',
  [SupportedChainId.BASE]: '0x3956684648BC0860e251e315c3988a20f6963931',
}

export const LMT_EXECUTIONER: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: '0xeAFc4D06fD42bB97067B37132F428BD9aD2cF253',
  [SupportedChainId.LINEA]: '0x3956684648BC0860e251e315c3988a20f6963931',
  [SupportedChainId.BASE]: '0xCEe547fb51BBb75e313C22A9b1d25CfEDDdFB94A',
}

export const LMT_V2_PREMIUM_COMPUTER: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: '0xCEe547fb51BBb75e313C22A9b1d25CfEDDdFB94A',
  [SupportedChainId.LINEA]: '0xCEe547fb51BBb75e313C22A9b1d25CfEDDdFB94A',
  // [SupportedChainId.BASE]: '0xd536D64d106C27321214b0BBAd416355152bd1DE',
  [SupportedChainId.BASE]: '0xe2494c7817780b44Bf6FCF6afA853eB6627921d4',
}

export const LMT_REFERRAL: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: '0xd6787Ac04C1012558bd371eA39F943aebc1E5255',
  [SupportedChainId.LINEA]: '0xa3b4D70B2e746Be45B2BB9D81a8EEB37c18991Eb',
  [SupportedChainId.BASE]: '0xA7992F62f0acf5cdbA21e8dC6B35BfAEC1506beb',
}

export const LMT_VAULT: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: '0xE0Cb6C672Bc20314e1BA33b3F780f1567c48c93a',
  [SupportedChainId.LINEA]: '0x944548BAdC8e7306A9779d547FF7c8aCbaCdeDC2',
  [SupportedChainId.BASE]: '0x1Cf3F6a9f8c6eEF1729E374B18F498E2d9fC6DCA',
}

export const LMT_VAULT_MANAGER: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: '0xd5328446304530679d960F09fA7673464171c7cE',
  [SupportedChainId.LINEA]: '0xd5328446304530679d960F09fA7673464171c7cE',
  [SupportedChainId.BASE]: '',
}

export const LIM_WETH: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: '0x3a4F8E8512624226d2aC14fE496Bb9A4DdB73a9a',
  [SupportedChainId.LINEA]: '0x5188b47Cb80D1A3E22Cc6221792F199f1Fb0DD3c',
  [SupportedChainId.BASE]: '0x845d629D2485555514B93F05Bdbe344cC2e4b0ce',
}

export const BRP_ADDRESS: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: '0xEe75f2edad8e8A3AC998541AC24B5634840327B0',
  [SupportedChainId.LINEA]: '0x5438D5541471c2aEfb11c4DdC33dC2699d7A7dEA',
  [SupportedChainId.BASE]: '0x31EA2dD90Bd140d565726531f402D461E25A5f60',
}

export const NZT: AddressMap = {
  [SupportedChainId.BASE]: '0x71dbf0bfc49d9c7088d160ec3b8bb0979556ea96',
}

export const SHARED_LIQUIDITY: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: '0x1c93b108F6Fc769fD8328624649AB8b61b7af9c7',
  [SupportedChainId.BASE]: '0xFCE669e8d8db25Ef8220cF4854e78477A816df6d',
}

//arb 7/3
// Utils deployed 0x0206450B8eF632183706bF8E60461c17dfD0b545
// PremiumComputer deployed 0x6eBcd9Be7bb45A51c047800A756A6FF4b7a668bA
// MatchingEngine deployed 0x2C13616FbEd909375730ecCC4082f54A1CaEEEd8
// MarginPositionHelper deployed 0xb8bBb1E0423527062E7E10fbd00bA00F0D770342
// Executioner deployed to:  0xeAFc4D06fD42bB97067B37132F428BD9aD2cF253
// limweth deployed to  0x3a4F8E8512624226d2aC14fE496Bb9A4DdB73a9a
// shared deployed to:  0x1c93b108F6Fc769fD8328624649AB8b61b7af9c7
// brp deployed to  0xEe75f2edad8e8A3AC998541AC24B5634840327B0


//meme add 0x71dbf0BfC49D9C7088D160eC3b8Bb0979556Ea96

// celo v3 addresses
// const CELO_V3_CORE_FACTORY_ADDRESSES = '0xAfE208a311B21f13EF87E33A90049fC17A7acDEc'
// const CELO_V3_MIGRATOR_ADDRESSES = '0x3cFd4d48EDfDCC53D3f173F596f621064614C582'
// const CELO_MULTICALL_ADDRESS = '0x633987602DE5C4F337e3DbF265303A1080324204'
// const CELO_QUOTER_ADDRESSES = '0x82825d0554fA07f7FC52Ab63c961F330fdEFa8E8'
// const CELO_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = '0x3d79EdAaBC0EaB6F08ED885C05Fc0B014290D95A'
// const CELO_TICK_LENS_ADDRESSES = '0x5f115D9113F88e0a0Db1b5033D90D4a9690AcD3D'

// // BNB v3 addresses
// const BNB_V3_CORE_FACTORY_ADDRESSES = '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7'
// const BNB_V3_MIGRATOR_ADDRESSES = '0x32681814957e0C13117ddc0c2aba232b5c9e760f'
// const BNB_MULTICALL_ADDRESS = '0x963Df249eD09c358A4819E39d9Cd5736c3087184'
// const BNB_QUOTER_ADDRESSES = '0x78D78E420Da98ad378D7799bE8f4AF69033EB077'
// const BNB_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = '0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613'
// const BNB_TICK_LENS_ADDRESSES = '0xD9270014D396281579760619CCf4c3af0501A47C'

// // optimism goerli addresses
// const OPTIMISM_GOERLI_V3_CORE_FACTORY_ADDRESSES = '0xB656dA17129e7EB733A557f4EBc57B76CFbB5d10'
// const OPTIMISM_GOERLI_V3_MIGRATOR_ADDRESSES = '0xf6c55fBe84B1C8c3283533c53F51bC32F5C7Aba8'
// const OPTIMISM_GOERLI_MULTICALL_ADDRESS = '0x07F2D8a2a02251B62af965f22fC4744A5f96BCCd'
// const OPTIMISM_GOERLI_QUOTER_ADDRESSES = '0x9569CbA925c8ca2248772A9A4976A516743A246F'
// const OPTIMISM_GOERLI_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = '0x39Ca85Af2F383190cBf7d7c41ED9202D27426EF6'
// const OPTIMISM_GOERLI_TICK_LENS_ADDRESSES = '0xe6140Bd164b63E8BfCfc40D5dF952f83e171758e'

// // arbitrum goerli v3 addresses
// const ARBITRUM_GOERLI_V3_CORE_FACTORY_ADDRESSES = '0x4893376342d5D7b3e31d4184c08b265e5aB2A3f6'
// const ARBITRUM_GOERLI_V3_MIGRATOR_ADDRESSES = '0xA815919D2584Ac3F76ea9CB62E6Fd40a43BCe0C3'
// const ARBITRUM_GOERLI_MULTICALL_ADDRESS = '0x8260CB40247290317a4c062F3542622367F206Ee'
// const ARBITRUM_GOERLI_QUOTER_ADDRESSES = '0x1dd92b83591781D0C6d98d07391eea4b9a6008FA'
// const ARBITRUM_GOERLI_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = '0x622e4726a167799826d1E1D150b076A7725f5D81'
// const ARBITRUM_GOERLI_TICK_LENS_ADDRESSES = '0xb52429333da969a0C79a60930a4Bf0020E5D1DE8'

// linea v3 addresses
const LINEA_V3_CORE_FACTORY_ADDRESSES = '0x31FAfd4889FA1269F7a13A66eE0fB458f27D72A9'
const LINEA_MULTICALL_ADDRESS = '0x93e253D101519578A8DF0BCe2A43D8292BFb3A1F'
const LINEA_QUOTER_ADDRESSES = '0x42bE4D6527829FeFA1493e1fb9F3676d2425C3C1'
const LINEA_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = '0x4615C383F85D0a2BbED973d83ccecf5CB7121463'
const LINEA_TICK_LENS_ADDRESSES = '0x3334d83e224aF5ef9C2E7DDA7c7C98Efd9621fA9'

// base v3 addresses
const BASE_V3_CORE_FACTORY_ADDRESSES = '0x33128a8fC17869897dcE68Ed026d694621f6FDfD'
const BASE_MULTICALL_ADDRESS = '0x091e99cb1C49331a94dD62755D168E941AbD0693'
const BASE_QUOTER_ADDRESSES = '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a'
const BASE_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1'
const BASE_TICK_LENS_ADDRESSES = '0x0CdeE061c75D43c82520eD998C23ac2991c9ac6d'

export const UNISWAP_POOL_INIT_CODE_HASH = '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54'
// limitless constants

export const MUMBAI_V3_POOL_FACTORY = '0x2c10E484D56a650622Cf79E03d6224D14C74e9AE'
export const MUMBAI_ROUTER = '0x7a35Ddcf6C85D6DC0F55B28Eb5c0434C8B724859'
export const MUMBAI_BORROW_MANAGER_FACTORY_ADDRESS = '0x3D405855a4Cb89907267d652550e8F975279f80f'
export const MUMBAI_LEVERAGE_MANAGER_FACTORY_ADDRESS = '0xF289e57E3603CD6b199EBe229c60AF3153D1a28a'
export const MUMBAI_LIQUIDITY_MANAGER_FACTORY_ADDRESS = '0xdDeEc55689330E248cC6aB29D45f62Af9172b96A'
export const MUMBAI_GlOBAL_STORAGE_ADDRESS = '0x9C2f11c755a5b6786D98e94f72718E1c1A78Df60'
export const MUMBAI_QUOTER_V2 = '0xee63e6B54807D60d94F6f0E87F88273327929B6d'
export const MUMBAI_NONFUNGIBLE_POSITION_MANAGER = '0xAc379176aB075346c8423165E273582ED79b4d6F'

export const LEVERAGE_INIT_CODE_HASH = '0xabb4604e9648f406b7b26a502f811469bfadfd9e1685f095668f96e2f487fd9b'
export const LIQUITITY_INIT_CODE_HASH = '0xb4d390fcf5eea87775b7ef2860b5e06610a579d0185f31e432c51a74a9a1a6f4'
export const BORROW_INIT_CODE_HASH = '0xb73c04c4fbcf3265289afac278101bee546bd45dda2509638b531a4f1fa32203'
export const SEPOLIA_BORROW_MANAGER_FACTORY_ADDRESS = '0x97917eb0A6CE7AE392fde315a55C7a59cA1954FD'
export const SEPOLIA_LEVERAGE_MANAGER_FACTORY_ADDRESS = '0xca532627577E7Ce8c5AD9DBAC31e80f6a20025F5'
export const SEPOLIA_LIQUIDITY_MANAGER_FACTORY_ADDRESS = '0x53c967BE367B4985eD93219071C54eF80BE0Ac07'
export const SEPOLIA_GlOBAL_STORAGE_ADDRESS = '0xC646146DeDdE36EAF9DC63316F362602d4e1f941'

export const ROUTER_ADDRESSES: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: '0x5E325eDA8064b456f4781070C0738d849c824258', // ROUTER V3 : '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
  [SupportedChainId.BASE]: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
}

/* V3 Contract Addresses */
export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  ...constructSameAddressMap(V3_FACTORY_ADDRESS, [SupportedChainId.ARBITRUM_ONE]),
  [SupportedChainId.BERA_ARTIO]: '0xd6787Ac04C1012558bd371eA39F943aebc1E5255',
  [SupportedChainId.LINEA]: LINEA_V3_CORE_FACTORY_ADDRESSES,
  [SupportedChainId.BASE]: BASE_V3_CORE_FACTORY_ADDRESSES,
}

export const V3_MIGRATOR_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0xA5644E29708357803b5A882D272c41cC0dF92B34', [SupportedChainId.ARBITRUM_ONE]),
}

export const MULTICALL_ADDRESS: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: '0xadF885960B47eA2CD9B55E6DAc6B42b7Cb2806dB',
  [SupportedChainId.BERA_ARTIO]: '0x792F0a4800193304f96fCC5F8B681bDe53aD926C',
  [SupportedChainId.LINEA]: LINEA_MULTICALL_ADDRESS,
  [SupportedChainId.BASE]: BASE_MULTICALL_ADDRESS,
}

/**
 * The oldest V0 governance address
 */
export const GOVERNANCE_ALPHA_V0_ADDRESSES: AddressMap = constructSameAddressMap(
  '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F'
)
/**
 * The older V1 governance address
 */
export const GOVERNANCE_ALPHA_V1_ADDRESSES: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: ZERO_ADDRESS,
}
/**
 * The latest governor bravo that is currently admin of timelock
 */
export const GOVERNANCE_BRAVO_ADDRESSES: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: ZERO_ADDRESS,
}

export const TIMELOCK_ADDRESS: AddressMap = constructSameAddressMap('0x1a9C8182C09F50C8318d769245beA52c32BE35BC')

export const MERKLE_DISTRIBUTOR_ADDRESS: AddressMap = {
  // [SupportedChainId.ARBITRUM_ONE]: ZERO_ADDRESS,
}

export const ARGENT_WALLET_DETECTOR_ADDRESS: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: ZERO_ADDRESS,
}

export const QUOTER_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0x61fFE014bA17989E743c5F6cB21bF9697530B21e', [SupportedChainId.ARBITRUM_ONE]),
  [SupportedChainId.BERA_ARTIO]: '0x5F54beCfCecF3284227D493DF26603f9fD459F6c',
  [SupportedChainId.LINEA]: LINEA_QUOTER_ADDRESSES,
  [SupportedChainId.BASE]: BASE_QUOTER_ADDRESSES,
}

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0xC36442b4a4522E871399CD717aBDD847Ab11FE88', [SupportedChainId.ARBITRUM_ONE]),

  [SupportedChainId.LINEA]: LINEA_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  [SupportedChainId.BASE]: BASE_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
}

export const LMT_LP_MANAGER2: AddressMap = {
  [SupportedChainId.BASE]: '0x958b6F9CfB46C476BB89E40d3978D8c9827EA68F',
}

export const ENS_REGISTRAR_ADDRESSES: AddressMap = {
  [SupportedChainId.GOERLI]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
}

export const SOCKS_CONTROLLER_ADDRESSES: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: ZERO_ADDRESS,
}

export const TICK_LENS_ADDRESSES: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: '0xbfd8137f7d1516D3ea5cA83523914859ec47F573',
  [SupportedChainId.LINEA]: LINEA_TICK_LENS_ADDRESSES,
  [SupportedChainId.BASE]: BASE_TICK_LENS_ADDRESSES,
}
