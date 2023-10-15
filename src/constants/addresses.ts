import { FACTORY_ADDRESS as V2_FACTORY_ADDRESS } from '@uniswap/v2-sdk'
import { FACTORY_ADDRESS as V3_FACTORY_ADDRESS } from '@uniswap/v3-sdk'
import { SupportedChainId } from 'constants/chains'

import { constructSameAddressMap } from '../utils/constructSameAddressMap'

type AddressMap = { [chainId: number]: string }

export const UNI_ADDRESS: AddressMap = constructSameAddressMap('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984')

export const UNISWAP_NFT_AIRDROP_CLAIM_ADDRESS = '0x8B799381ac40b838BBA4131ffB26197C432AFe78'

export const V2_FACTORY_ADDRESSES: AddressMap = constructSameAddressMap(V2_FACTORY_ADDRESS)
export const V2_ROUTER_ADDRESS: AddressMap = constructSameAddressMap('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')

// LMT V2 CONSTANTS
// deploying "Utils" (tx: 0x114ffe8c2df661dbc479c4dbea80bdb26986cb0a5f35d015d913671386a3dfa8)...: deployed at 0x95368Ed1B65Ee7D9E44556d64e9Bec9d32b0eDe6 with 2170472 gas
// deploying "MarginPositionLib" (tx: 0xa5642a190fef22954fef7c71f92f04d8d961b504d3739bb50200d3cbb0e25bd7)...: deployed at 0xaa42C3671E2D4Ca5d6ACFE0A16Bd43fa42144ea5 with 332823 gas
// deploying "MatchingEngine" (tx: 0xda15ab5f20fa0b4f7e5a0a18bdf05c9ca15d620765db754a03427719eb60a296)...: deployed at 0x2251244a517661e3A83C7CdB7b1261D0A4d01F06 with 3590953 gas
// deploying "PremiumComputer" (tx: 0x2d90228c5ff2eef9cbc4579089182344dd2d0aa4ab5cb5355651c98bfdfc5da9)...\: deployed at 0x352905c495dba0454e7686226C565Ae4F3474d26 with 1164438 gas
// deploying "PoolManager" (tx: 0xa401dd0d685ab3b3f5628b3b3eeacf293621002e2ca24a23e2a40ac367afadd8)...: deployed at 0x3699BA9D83eD838d718b9dA18A1529684e39e12C with 5409067 gas
// deploying "Executioner" (tx: 0xce44a873f5373ae59d4e082e1955a1cddaf38f05a6f04ebccd9b5c28f2cd774f)...: deployed at 0x805D7593093c112dc8652958FA302472a03fce44 with 1151574 gas
// deploying "MarginFacility" (tx: 0x3fa48e8f57bb0fa5511457632196526e789098fdfca11681609090336a896470)...: deployed at 0x5494650218b60dbCA2Fe5C3a9aC7eb783C6afE6B with 5437936 gas
// deploying "DataProvider" (tx: 0x1bf8e1f18b4e6b3a015d7a99c2790cca63823296065f2aa9b036a4017b0f4778)...: deployed at 0x30D9aa3dFc6cb8d36142d0734431A67727565490 with 1513875 gas
// deploying "NonfungiblePositionManager" (tx: 0xd112ab5a7ff2c7df734c343f779fc99972fe2565a8951f2c6ea504640e8d895a)...: deployed at 0xF4a2f7E473d389F1808de86EDF355eCc8e66620b with 3498325 gas
// export const V3_POOL_FACTORY = "0x1bdA285c89dB36004c7027eC2C4b6aC8479b9Ed2"
// export const V3_ROUTER_SEPOLIA = "0xe65b4E1Ea7556287CAfBF91c84BB6808067e0Cb2"
// export const PS_QUOTER_V2 = '0x96f612DC2C0180a90A35A5611eA4dF690911D02b'
// export const PS_NONFUNGIBLE_POSITION_MANAGER = '0x50A6f15941E6C6042c9c68Fe6199344Df6dC5787'
export const POOL_INIT_CODE_HASH = '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54'

export const SEPOLIA_TICK_LENS = '0x3608234ef94d0CCF4AC46284DFb102568aac2aB2'

export const SEPOLIA_V3_POOL_FACTORY = '0x1bdA285c89dB36004c7027eC2C4b6aC8479b9Ed2'

export const SEPOLIA_ROUTER = '0xe65b4E1Ea7556287CAfBF91c84BB6808067e0Cb2'

export const SEPOLIA_QUOTER_V2 = '0x96f612DC2C0180a90A35A5611eA4dF690911D02b'

export const SEPOLIA_NONFUNGIBLE_POSITION_MANAGER = '0x50A6f15941E6C6042c9c68Fe6199344Df6dC5787'

export const DATA_PROVIDER_ADDRESSES: AddressMap = {
  [SupportedChainId.SEPOLIA]: '0x30D9aa3dFc6cb8d36142d0734431A67727565490',
}

export const LMT_MARGIN_FACILITY: AddressMap = {
  [SupportedChainId.SEPOLIA]: '0x5494650218b60dbCA2Fe5C3a9aC7eb783C6afE6B',
}

export const LMT_NFT_POSITION_MANAGER: AddressMap = {
  [SupportedChainId.SEPOLIA]: '0xF4a2f7E473d389F1808de86EDF355eCc8e66620b',
}

export const LMT_BORROW_FACILITY: AddressMap = {
  [SupportedChainId.SEPOLIA]: '',
}

export const LMT_EXECUTIONER: AddressMap = {
  [SupportedChainId.SEPOLIA]: '0x805D7593093c112dc8652958FA302472a03fce44',
}

export const LMT_POOL_MANAGER: AddressMap = {
  [SupportedChainId.SEPOLIA]: '0x3699BA9D83eD838d718b9dA18A1529684e39e12C',
}

export const LMT_V2_PREMIUM_COMPUTER: AddressMap = {
  [SupportedChainId.SEPOLIA]: '0x352905c495dba0454e7686226C565Ae4F3474d26',
}

// celo v3 addresses
const CELO_V3_CORE_FACTORY_ADDRESSES = '0xAfE208a311B21f13EF87E33A90049fC17A7acDEc'
const CELO_V3_MIGRATOR_ADDRESSES = '0x3cFd4d48EDfDCC53D3f173F596f621064614C582'
const CELO_MULTICALL_ADDRESS = '0x633987602DE5C4F337e3DbF265303A1080324204'
const CELO_QUOTER_ADDRESSES = '0x82825d0554fA07f7FC52Ab63c961F330fdEFa8E8'
const CELO_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = '0x3d79EdAaBC0EaB6F08ED885C05Fc0B014290D95A'
const CELO_TICK_LENS_ADDRESSES = '0x5f115D9113F88e0a0Db1b5033D90D4a9690AcD3D'

// BNB v3 addresses
const BNB_V3_CORE_FACTORY_ADDRESSES = '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7'
const BNB_V3_MIGRATOR_ADDRESSES = '0x32681814957e0C13117ddc0c2aba232b5c9e760f'
const BNB_MULTICALL_ADDRESS = '0x963Df249eD09c358A4819E39d9Cd5736c3087184'
const BNB_QUOTER_ADDRESSES = '0x78D78E420Da98ad378D7799bE8f4AF69033EB077'
const BNB_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = '0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613'
const BNB_TICK_LENS_ADDRESSES = '0xD9270014D396281579760619CCf4c3af0501A47C'

// optimism goerli addresses
const OPTIMISM_GOERLI_V3_CORE_FACTORY_ADDRESSES = '0xB656dA17129e7EB733A557f4EBc57B76CFbB5d10'
const OPTIMISM_GOERLI_V3_MIGRATOR_ADDRESSES = '0xf6c55fBe84B1C8c3283533c53F51bC32F5C7Aba8'
const OPTIMISM_GOERLI_MULTICALL_ADDRESS = '0x07F2D8a2a02251B62af965f22fC4744A5f96BCCd'
const OPTIMISM_GOERLI_QUOTER_ADDRESSES = '0x9569CbA925c8ca2248772A9A4976A516743A246F'
const OPTIMISM_GOERLI_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = '0x39Ca85Af2F383190cBf7d7c41ED9202D27426EF6'
const OPTIMISM_GOERLI_TICK_LENS_ADDRESSES = '0xe6140Bd164b63E8BfCfc40D5dF952f83e171758e'

// arbitrum goerli v3 addresses
const ARBITRUM_GOERLI_V3_CORE_FACTORY_ADDRESSES = '0x4893376342d5D7b3e31d4184c08b265e5aB2A3f6'
const ARBITRUM_GOERLI_V3_MIGRATOR_ADDRESSES = '0xA815919D2584Ac3F76ea9CB62E6Fd40a43BCe0C3'
const ARBITRUM_GOERLI_MULTICALL_ADDRESS = '0x8260CB40247290317a4c062F3542622367F206Ee'
const ARBITRUM_GOERLI_QUOTER_ADDRESSES = '0x1dd92b83591781D0C6d98d07391eea4b9a6008FA'
const ARBITRUM_GOERLI_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = '0x622e4726a167799826d1E1D150b076A7725f5D81'
const ARBITRUM_GOERLI_TICK_LENS_ADDRESSES = '0xb52429333da969a0C79a60930a4Bf0020E5D1DE8'

export const UNISWAP_POOL_INIT_CODE_HASH = '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54'
// limitless constants

// export const POOL_INIT_CODE_HASH = "0xb1b47910c82b6b4686fdefe8f5c45c76ec04eaa295d60a2b2ae2580e65d20004"
// export const LEVERAGE_INIT_CODE_HASH = "0x49f53372a62c3cfd24334e1f82b799b5504d4440a185b0e5183fe2be12bf9007"
// export const LIQUITITY_INIT_CODE_HASH = "0x45abd4fbed459a1138d7d1f5b508d3ad6e0bd17dadf92cf1a8660d7afae13cc4"
// export const BORROW_INIT_CODE_HASH = "0x9f90643aa231df1a9cfa58421b3024e078cdc482b2c54b69f98528e6df417ded"
export const MUMBAI_V3_POOL_FACTORY = '0x2c10E484D56a650622Cf79E03d6224D14C74e9AE'
export const MUMBAI_ROUTER = '0x7a35Ddcf6C85D6DC0F55B28Eb5c0434C8B724859'
export const MUMBAI_BORROW_MANAGER_FACTORY_ADDRESS = '0x3D405855a4Cb89907267d652550e8F975279f80f'
export const MUMBAI_LEVERAGE_MANAGER_FACTORY_ADDRESS = '0xF289e57E3603CD6b199EBe229c60AF3153D1a28a'
export const MUMBAI_LIQUIDITY_MANAGER_FACTORY_ADDRESS = '0xdDeEc55689330E248cC6aB29D45f62Af9172b96A'
export const MUMBAI_GlOBAL_STORAGE_ADDRESS = '0x9C2f11c755a5b6786D98e94f72718E1c1A78Df60'
export const MUMBAI_QUOTER_V2 = '0xee63e6B54807D60d94F6f0E87F88273327929B6d'
export const MUMBAI_NONFUNGIBLE_POSITION_MANAGER = '0xAc379176aB075346c8423165E273582ED79b4d6F'

// export const POOL_INIT_CODE_HASH = '0x3a5ea655bc52819b785fc9d2b3ff381fcda613e789567190e3698af1520125f4'
export const LEVERAGE_INIT_CODE_HASH = '0xabb4604e9648f406b7b26a502f811469bfadfd9e1685f095668f96e2f487fd9b'
export const LIQUITITY_INIT_CODE_HASH = '0xb4d390fcf5eea87775b7ef2860b5e06610a579d0185f31e432c51a74a9a1a6f4'
export const BORROW_INIT_CODE_HASH = '0xb73c04c4fbcf3265289afac278101bee546bd45dda2509638b531a4f1fa32203'
// export const SEPOLIA_V3_POOL_FACTORY = '0x77591e6B23125de337b797Cd8Ef523e6Ac6EBf89'
// export const SEPOLIA_ROUTER = '0xE04B3f7926C221d9F0986BC7D1E3ce1a66FCA33D'
export const SEPOLIA_BORROW_MANAGER_FACTORY_ADDRESS = '0x97917eb0A6CE7AE392fde315a55C7a59cA1954FD'
export const SEPOLIA_LEVERAGE_MANAGER_FACTORY_ADDRESS = '0xca532627577E7Ce8c5AD9DBAC31e80f6a20025F5'
export const SEPOLIA_LIQUIDITY_MANAGER_FACTORY_ADDRESS = '0x53c967BE367B4985eD93219071C54eF80BE0Ac07'
export const SEPOLIA_GlOBAL_STORAGE_ADDRESS = '0xC646146DeDdE36EAF9DC63316F362602d4e1f941'
// export const SEPOLIA_QUOTER_V2 = '0x945FCF70DF738873110D33AfCf473CFF9E51C8e9'
// export const SEPOLIA_NONFUNGIBLE_POSITION_MANAGER = '0xf75A649b3c803FC440bf5cD5DC533317de2e1Fc6'
// export const SEPOLIA_TICK_LENS = '0x3608234ef94d0CCF4AC46284DFb102568aac2aB2'

export const ROUTER_ADDRESSES: AddressMap = {
  [SupportedChainId.SEPOLIA]: SEPOLIA_ROUTER,
  [SupportedChainId.POLYGON_MUMBAI]: MUMBAI_ROUTER,
}

export const LEVERAGE_MANAGER_FACTORY_ADDRESSES: AddressMap = {
  [SupportedChainId.SEPOLIA]: SEPOLIA_LEVERAGE_MANAGER_FACTORY_ADDRESS,
  [SupportedChainId.POLYGON_MUMBAI]: MUMBAI_LEVERAGE_MANAGER_FACTORY_ADDRESS,
}

export const BORROW_MANAGER_FACTORY_ADDRESSES: AddressMap = {
  [SupportedChainId.SEPOLIA]: SEPOLIA_BORROW_MANAGER_FACTORY_ADDRESS,
  [SupportedChainId.POLYGON_MUMBAI]: MUMBAI_BORROW_MANAGER_FACTORY_ADDRESS,
}

export const LIQUIDITY_MANAGER_FACTORY_ADDRESSES: AddressMap = {
  [SupportedChainId.SEPOLIA]: SEPOLIA_LIQUIDITY_MANAGER_FACTORY_ADDRESS,
  [SupportedChainId.POLYGON_MUMBAI]: SEPOLIA_LIQUIDITY_MANAGER_FACTORY_ADDRESS,
}

/* V3 Contract Addresses */
export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  ...constructSameAddressMap(V3_FACTORY_ADDRESS, [
    SupportedChainId.OPTIMISM,
    SupportedChainId.ARBITRUM_ONE,
    SupportedChainId.POLYGON,
  ]),
  [SupportedChainId.POLYGON_MUMBAI]: MUMBAI_V3_POOL_FACTORY,
  [SupportedChainId.SEPOLIA]: SEPOLIA_V3_POOL_FACTORY,
  [SupportedChainId.CELO]: CELO_V3_CORE_FACTORY_ADDRESSES,
  [SupportedChainId.CELO_ALFAJORES]: CELO_V3_CORE_FACTORY_ADDRESSES,
  [SupportedChainId.BNB]: BNB_V3_CORE_FACTORY_ADDRESSES,
  [SupportedChainId.OPTIMISM_GOERLI]: OPTIMISM_GOERLI_V3_CORE_FACTORY_ADDRESSES,
  [SupportedChainId.ARBITRUM_GOERLI]: ARBITRUM_GOERLI_V3_CORE_FACTORY_ADDRESSES,
}

export const V3_MIGRATOR_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0xA5644E29708357803b5A882D272c41cC0dF92B34', [
    SupportedChainId.ARBITRUM_ONE,
    SupportedChainId.POLYGON_MUMBAI,
    SupportedChainId.POLYGON,
  ]),
  [SupportedChainId.CELO]: CELO_V3_MIGRATOR_ADDRESSES,
  [SupportedChainId.CELO_ALFAJORES]: CELO_V3_MIGRATOR_ADDRESSES,
  [SupportedChainId.BNB]: BNB_V3_MIGRATOR_ADDRESSES,
  [SupportedChainId.OPTIMISM_GOERLI]: OPTIMISM_GOERLI_V3_MIGRATOR_ADDRESSES,
  [SupportedChainId.ARBITRUM_GOERLI]: ARBITRUM_GOERLI_V3_MIGRATOR_ADDRESSES,
}

export const MULTICALL_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0x1F98415757620B543A52E61c46B32eB19261F984', [
    SupportedChainId.OPTIMISM,
    SupportedChainId.POLYGON_MUMBAI,
    SupportedChainId.POLYGON,
  ]),
  [SupportedChainId.SEPOLIA]: '0x15BcA4E50Af1FAF338b6593e37738783b15b5CD4',
  [SupportedChainId.ARBITRUM_ONE]: '0xadF885960B47eA2CD9B55E6DAc6B42b7Cb2806dB',
  [SupportedChainId.CELO]: CELO_MULTICALL_ADDRESS,
  [SupportedChainId.CELO_ALFAJORES]: CELO_MULTICALL_ADDRESS,
  [SupportedChainId.BNB]: BNB_MULTICALL_ADDRESS,
  [SupportedChainId.OPTIMISM_GOERLI]: OPTIMISM_GOERLI_MULTICALL_ADDRESS,
  [SupportedChainId.ARBITRUM_GOERLI]: ARBITRUM_GOERLI_MULTICALL_ADDRESS,
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
  [SupportedChainId.MAINNET]: '0xC4e172459f1E7939D522503B81AFAaC1014CE6F6',
}
/**
 * The latest governor bravo that is currently admin of timelock
 */
export const GOVERNANCE_BRAVO_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x408ED6354d4973f66138C91495F2f2FCbd8724C3',
}

export const TIMELOCK_ADDRESS: AddressMap = constructSameAddressMap('0x1a9C8182C09F50C8318d769245beA52c32BE35BC')

export const MERKLE_DISTRIBUTOR_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0x090D4613473dEE047c3f2706764f49E0821D256e',
}

export const ARGENT_WALLET_DETECTOR_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0xeca4B0bDBf7c55E9b7925919d03CbF8Dc82537E8',
}

export const QUOTER_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6', [
    SupportedChainId.OPTIMISM,
    SupportedChainId.ARBITRUM_ONE,
    // SupportedChainId.POLYGON_MUMBAI,
    SupportedChainId.POLYGON,
  ]),
  [SupportedChainId.POLYGON_MUMBAI]: MUMBAI_QUOTER_V2,
  [SupportedChainId.SEPOLIA]: SEPOLIA_QUOTER_V2,
  [SupportedChainId.CELO]: CELO_QUOTER_ADDRESSES,
  [SupportedChainId.CELO_ALFAJORES]: CELO_QUOTER_ADDRESSES,
  [SupportedChainId.BNB]: BNB_QUOTER_ADDRESSES,
  [SupportedChainId.OPTIMISM_GOERLI]: OPTIMISM_GOERLI_QUOTER_ADDRESSES,
  [SupportedChainId.ARBITRUM_GOERLI]: ARBITRUM_GOERLI_QUOTER_ADDRESSES,
}

export const GLOBAL_STORAGE_ADDRESSES: AddressMap = {
  [SupportedChainId.POLYGON_MUMBAI]: MUMBAI_GlOBAL_STORAGE_ADDRESS,
  [SupportedChainId.SEPOLIA]: SEPOLIA_GlOBAL_STORAGE_ADDRESS,
}

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0xC36442b4a4522E871399CD717aBDD847Ab11FE88', [
    SupportedChainId.OPTIMISM,
    SupportedChainId.ARBITRUM_ONE,
    // SupportedChainId.POLYGON_MUMBAI,
    SupportedChainId.POLYGON,
  ]),
  [SupportedChainId.POLYGON_MUMBAI]: MUMBAI_NONFUNGIBLE_POSITION_MANAGER,
  [SupportedChainId.SEPOLIA]: SEPOLIA_NONFUNGIBLE_POSITION_MANAGER,
  [SupportedChainId.CELO]: CELO_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  [SupportedChainId.CELO_ALFAJORES]: CELO_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  [SupportedChainId.BNB]: BNB_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  [SupportedChainId.OPTIMISM_GOERLI]: OPTIMISM_GOERLI_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  [SupportedChainId.ARBITRUM_GOERLI]: ARBITRUM_GOERLI_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
}

export const ENS_REGISTRAR_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  [SupportedChainId.GOERLI]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
}

export const SOCKS_CONTROLLER_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x65770b5283117639760beA3F867b69b3697a91dd',
}

export const TICK_LENS_ADDRESSES: AddressMap = {
  [SupportedChainId.ARBITRUM_ONE]: '0xbfd8137f7d1516D3ea5cA83523914859ec47F573',
  [SupportedChainId.ARBITRUM_GOERLI]: ARBITRUM_GOERLI_TICK_LENS_ADDRESSES,
  [SupportedChainId.CELO]: CELO_TICK_LENS_ADDRESSES,
  [SupportedChainId.CELO_ALFAJORES]: CELO_TICK_LENS_ADDRESSES,
  [SupportedChainId.BNB]: BNB_TICK_LENS_ADDRESSES,
  [SupportedChainId.OPTIMISM_GOERLI]: OPTIMISM_GOERLI_TICK_LENS_ADDRESSES,
  [SupportedChainId.SEPOLIA]: SEPOLIA_TICK_LENS,
}
