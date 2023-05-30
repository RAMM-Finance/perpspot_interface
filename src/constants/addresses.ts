import { FACTORY_ADDRESS as V2_FACTORY_ADDRESS } from '@uniswap/v2-sdk'
import { FACTORY_ADDRESS as V3_FACTORY_ADDRESS } from '@uniswap/v3-sdk'
import { SupportedChainId } from 'constants/chains'

import { constructSameAddressMap } from '../utils/constructSameAddressMap'

type AddressMap = { [chainId: number]: string }

export const UNI_ADDRESS: AddressMap = constructSameAddressMap('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984')

export const UNISWAP_NFT_AIRDROP_CLAIM_ADDRESS = '0x8B799381ac40b838BBA4131ffB26197C432AFe78'

export const V2_FACTORY_ADDRESSES: AddressMap = constructSameAddressMap(V2_FACTORY_ADDRESS)
export const V2_ROUTER_ADDRESS: AddressMap = constructSameAddressMap('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')

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
export const PS_V3_POOL_FACTORY = '0x9b05b74830a773333227A89f27C7FF17a131eBC2'
export const tokenA = "0xC98ceDe38A5692989363aef8a945EccE2930683c"
export const tokenB = "0x3324ff636509c8263F5Bc8241177eBc418d0A34e"
export const feth = "0xa826985DF0507632C7DAB6de761d8d4efC353d1F"
export const fusdc = "0x54D374769278b45713549B85Ca9Dd9cae3e286cc"
export const PS_QUOTER_V2 = '0x32A4D14405e5A2f38114eC20658C84fCdE832E1A'
export const PS_ROUTER = '0xdC621b002Faf223fa9a7ba940281598e3eB7Ab57'
export const PS_NONFUNGIBLE_POSITION_MANAGER = '0x2576705747160A0eccc7116E086547C6caDf0F89'
export const POOL_INIT_CODE_HASH = "0x18f0d0966d35dcf7d7a12788fcd90b4fd971cbe77c091e0e08b474632da35a22"
export const LEVERAGE_INIT_CODE_HASH = "0x17caecdb443aede65ab1d298c05c4b1e9b2b36bfe43c848639128270c98ba620"
export const GlOBAL_STORAGE_ADDRESS = "0x7fbB8C74ebBa5313DaA13755f023972567Ab8054";
export const LEVERAGE_MANAGER_FACTORY_ADDRESS = "0xfE3053F7eF429F0445b4de0aAD3E77AE96bb86b5"

// deploying "GlobalStorage" (tx: 0xea1cd8ab3b4d30eca5408d576787771fb97eca57c87faef103753ed2301e6085)...: deployed at 0x7fbB8C74ebBa5313DaA13755f023972567Ab8054 with 3063026 gas
// deploying "MergeLib" (tx: 0xe41f8dd007817753e2a9be73eddb04fef947ac0cf0c66d61302bd95140ceed9c)...: deployed at 0x5EE6843Fa6eB071fa7944c5F22AF53C90c21aa5b with 72217 gas
// deploying "LeverageManagerFactory" (tx: 0xd8845d079c12e3c85694cd73cd5d1e9b4ccdb57273d07c1fcbe26bedba7fb93c)...: deployed at 0xfE3053F7eF429F0445b4de0aAD3E77AE96bb86b5 with 5315335 gas
// deploying "LiquidityManagerFactory" (tx: 0x8a14efd9e61988f14954fdc21e4ba5b7f4f0475a10595186db9c9fdf3f06ee95)...: deployed at 0xA92Ea2907fFEe307149425185afA2e7B0c150Ffd with 3985266 gas
// deploying "BorrowManagerFactory" (tx: 0xc161289002567473049a9bd512527d60a13941b611536b793f14284384218508)...: deployed at 0xD1F08764d88c118bf6e981B35287Ca7165b1B8F4 with 4167845 gas
// deploying "UniswapV3Factory" (tx: 0x5fcc748c20001768fbab225328c59e31860062a97c8c8c9b9624615ebd7eb9b9)...: deployed at 0x9b05b74830a773333227A89f27C7FF17a131eBC2 with 5415506 gas
// deployed universal router at:  0xdC621b002Faf223fa9a7ba940281598e3eB7Ab57
// poolInitCodeHash:  0x18f0d0966d35dcf7d7a12788fcd90b4fd971cbe77c091e0e08b474632da35a22
// leverageInitCodeHash:  0x17caecdb443aede65ab1d298c05c4b1e9b2b36bfe43c848639128270c98ba620
// NFTDescriptor deployed to: 0x111Fe7b8D44Eb5428eB1925978f5FAC493eB4a76
// NFT_DESCRIPTOR_ADDRESS= '0x111Fe7b8D44Eb5428eB1925978f5FAC493eB4a76'
// POSITION_DESCRIPTOR_ADDRESS= '0x3D96D8a0Ac146bD17b78DCC2e642a2DD3e8eecee'
// POSITION_MANAGER_ADDRESS= '0x2576705747160A0eccc7116E086547C6caDf0F89'
// QUOTER_V2_ADDRESS= '0x32A4D14405e5A2f38114eC20658C84fCdE832E1A'

export const LEVERAGE_MANAGER_FACTORY_ADDRESSES: AddressMap = {
  [SupportedChainId.POLYGON_MUMBAI]: LEVERAGE_MANAGER_FACTORY_ADDRESS
}

/* V3 Contract Addresses */
export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  ...constructSameAddressMap(V3_FACTORY_ADDRESS, [
    SupportedChainId.OPTIMISM,
    SupportedChainId.ARBITRUM_ONE,
    SupportedChainId.POLYGON,
  ]),
  [SupportedChainId.POLYGON_MUMBAI]: PS_V3_POOL_FACTORY,
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
  [SupportedChainId.POLYGON_MUMBAI]: PS_QUOTER_V2,
  [SupportedChainId.CELO]: CELO_QUOTER_ADDRESSES,
  [SupportedChainId.CELO_ALFAJORES]: CELO_QUOTER_ADDRESSES,
  [SupportedChainId.BNB]: BNB_QUOTER_ADDRESSES,
  [SupportedChainId.OPTIMISM_GOERLI]: OPTIMISM_GOERLI_QUOTER_ADDRESSES,
  [SupportedChainId.ARBITRUM_GOERLI]: ARBITRUM_GOERLI_QUOTER_ADDRESSES,
}

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0xC36442b4a4522E871399CD717aBDD847Ab11FE88', [
    SupportedChainId.OPTIMISM,
    SupportedChainId.ARBITRUM_ONE,
    // SupportedChainId.POLYGON_MUMBAI,
    SupportedChainId.POLYGON,
  ]),
  [SupportedChainId.POLYGON_MUMBAI]: PS_NONFUNGIBLE_POSITION_MANAGER,
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
}
