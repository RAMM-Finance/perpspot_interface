import { Contract } from '@ethersproject/contracts'
import QuoterV2Json from '@uniswap/swap-router-contracts/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'
import IUniswapV2PairJson from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import IUniswapV2Router02Json from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import QuoterJson from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import TickLensJson from '@uniswap/v3-periphery/artifacts/contracts/lens/TickLens.sol/TickLens.json'
import UniswapInterfaceMulticallJson from '@uniswap/v3-periphery/artifacts/contracts/lens/UniswapInterfaceMulticall.sol/UniswapInterfaceMulticall.json'
import NonfungiblePositionManagerJson from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import V3MigratorJson from '@uniswap/v3-periphery/artifacts/contracts/V3Migrator.sol/V3Migrator.json'
import ARGENT_WALLET_DETECTOR_ABI from 'abis/argent-wallet-detector.json'
import EIP_2612 from 'abis/eip_2612.json'
import ENS_PUBLIC_RESOLVER_ABI from 'abis/ens-public-resolver.json'
import ENS_ABI from 'abis/ens-registrar.json'
import ERC20_ABI from 'abis/erc20.json'
import ERC20_BYTES32_ABI from 'abis/erc20_bytes32.json'
import ERC721_ABI from 'abis/erc721.json'
import ERC1155_ABI from 'abis/erc1155.json'
import { ArgentWalletDetector, EnsPublicResolver, EnsRegistrar, Erc20, Erc721, Erc1155, Weth } from 'abis/types'
import WETH_ABI from 'abis/weth.json'
import {
  ARGENT_WALLET_DETECTOR_ADDRESS,
  BRP_ADDRESS,
  DATA_PROVIDER_ADDRESSES,
  ENS_REGISTRAR_ADDRESSES,
  LIM_WETH,
  LMT_LP_MANAGER2,
  LMT_MARGIN_FACILITY,
  LMT_NFT_POSITION_MANAGER,
  LMT_POOL_MANAGER,
  LMT_QUOTER,
  LMT_REFERRAL,
  LMT_VAULT,
  MULTICALL_ADDRESS,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  QUOTER_ADDRESSES,
  SHARED_LIQUIDITY,
  TICK_LENS_ADDRESSES,
  V2_ROUTER_ADDRESS,
  V3_MIGRATOR_ADDRESSES,
} from 'constants/addresses'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { Quoter as LmtQuoter } from 'LmtTypes/src/periphery/Quoter.sol/Quoter'
import { useMemo } from 'react'
import { NonfungiblePositionManager, Quoter, QuoterV2, TickLens, UniswapInterfaceMulticall } from 'types/v3'
import { V3Migrator } from 'types/v3/V3Migrator'
import { useAccount, useChainId } from 'wagmi'
import { useEthersProvider, useEthersSigner } from 'wagmi-lib/adapters'

import BRP_ABI from '../abis_v2/BRP.json'
import DataProviderABI from '../abis_v2/DataProvider.json'
import LIM_TokenABI from '../abis_v2/LIM_Token.json'
import LP_MANAGER2_ABI from '../abis_v2/LPManager2.json'
import VaultAbi from '../abis_v2/LPVault.json'
import MarginFacilityAbi from '../abis_v2/MarginFacility.json'
import LmtNFTManagerJson from '../abis_v2/NonfungiblePositionManager.json'
import LmtPoolManagerJson from '../abis_v2/PoolManager.json'
import LmtQuoterAbi from '../abis_v2/Quoter.json'
import ReferralSystemABI from '../abis_v2/ReferralSystem.json'
import SharedLiquidityAbi from '../abis_v2/SharedLiquidity.json'
import testTokenAbi from '../abis_v2/TestToken.json'
import PoolAbi from '../abis_v2/UniswapV3Pool.json'
import {
  BRP,
  DataProvider,
  LIM_Token,
  LPManager2,
  LPVault,
  MarginFacility,
  NonfungiblePositionManager as LmtNonfungiblePositionManager,
  PoolManager as LmtPoolManager,
  ReferralSystem,
  SharedLiquidityManager,
} from '../LmtTypes'
import { getContract } from '../utils'

const { abi: IUniswapV2PairABI } = IUniswapV2PairJson
const { abi: IUniswapV2Router02ABI } = IUniswapV2Router02Json
const { abi: QuoterABI } = QuoterJson
const { abi: QuoterV2ABI } = QuoterV2Json
const { abi: TickLensABI } = TickLensJson
const { abi: MulticallABI } = UniswapInterfaceMulticallJson
const { abi: NFTPositionManagerABI } = NonfungiblePositionManagerJson
const { abi: V2MigratorABI } = V3MigratorJson

type PricesMap = { [address: string]: number }

const usdValueData: PricesMap = {
  // feth
  '0x4E3F175b38098326a34F2C8B2D07AF5fFdfc6fA9': 2000,
  // fusdc
  '0x569f3140FDc0f3B9Fc2E4919C35f35D39dd2B01A': 1,

  // wbtc -arb
  '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f': 40000,
  // weth -arb
  '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': 2200,
  '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': 1,

  '0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60': 2.7, //ldo
  '0x912CE59144191C1204E64559FE8253a0e49E6548': 1.6, //arb
  '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a': 45, //gmx
  '0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8': 2.5, //pendle
  '0x539bdE0d7Dbd336b79148AA742883198BBF60342': 1.25, //magic
  '0x00CBcF7B3d37844e44b888Bc747bDd75FCf4E555': 1.1, //xpet
  '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4': 15, //link
  '0x3082CC23568eA640225c2467653dB90e9250AaA0': 0.28, //rdnt
  '0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66': 1.3, //xai
  '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0': 7, //uni
  '0x18c11FD286C5EC11c3b683Caa813B77f5163A122': 6.5, //gns
  '0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978': 0.6, //crv
  '0x6694340fc020c5E6B96567843da2df01b2CE1eb6': 0.6, // stg
}

export const dailyLMT = new Proxy<any>(
  {},
  {
    get: (target, address: string) => {
      address in target ? target[address] : 1
    },
  }
)

export const usdValue = new Proxy<PricesMap>(usdValueData, {
  get: (target, address: string) => (address in target ? target[address] : 0),
})

type DecimalMap = { [address: string]: number }
const DecimalValues: DecimalMap = {
  // feth
  '0x4E3F175b38098326a34F2C8B2D07AF5fFdfc6fA9': 18,
  // fusdc
  '0x569f3140FDc0f3B9Fc2E4919C35f35D39dd2B01A': 18,
  // wbtc -arb
  '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f': 8,
  // weth -arb
  '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': 18,
  '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': 6,
  '0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60': 18,
  '0x912CE59144191C1204E64559FE8253a0e49E6548': 18,
  '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a': 18,
}

export const tokenDecimal = new Proxy<DecimalMap>(DecimalValues, {
  get: (target, address: string) => (address in target ? target[address] : 18),
})

// LMT V2
export function useLmtNFTPositionManager(withSignerIfPossible?: boolean) {
  return useContract<LmtNonfungiblePositionManager>(
    LMT_NFT_POSITION_MANAGER,
    LmtNFTManagerJson.abi,
    withSignerIfPossible
  )
}

export function useLmtPoolManagerContract(withSignerIfPossible?: boolean) {
  return useContract<LmtPoolManager>(LMT_POOL_MANAGER, LmtPoolManagerJson.abi, withSignerIfPossible)
}

export function useMarginFacilityContract(withSignerIfPossible?: boolean) {
  return useContract<MarginFacility>(LMT_MARGIN_FACILITY, MarginFacilityAbi.abi, withSignerIfPossible)
}

export function useLmtQuoterContract(withSignerIfPossible?: boolean) {
  return useContract<LmtQuoter>(LMT_QUOTER, LmtQuoterAbi.abi, withSignerIfPossible)
}

export function useDataProviderContract(withSignerIfPossible?: boolean) {
  return useContract<DataProvider>(DATA_PROVIDER_ADDRESSES, DataProviderABI.abi, withSignerIfPossible)
}

export function useReferralContract(withSignerIfPossible?: boolean) {
  return useContract<ReferralSystem>(LMT_REFERRAL, ReferralSystemABI.abi, withSignerIfPossible)
}

export function useVaultContract(withSignerIfPossible?: boolean) {
  return useContract<LPVault>(LMT_VAULT, VaultAbi.abi, withSignerIfPossible)
}

export function useLimweth(withSignerIfPossible?: boolean) {
  return useContract<LIM_Token>(LIM_WETH, LIM_TokenABI.abi, withSignerIfPossible)
}

export function useBRP(withSignerIfPossible?: boolean) {
  return useContract<BRP>(BRP_ADDRESS, BRP_ABI.abi, withSignerIfPossible)
}

export function useSharedLiquidity(withSignerIfPossible?: boolean) {
  return useContract<SharedLiquidityManager>(SHARED_LIQUIDITY, SharedLiquidityAbi.abi, withSignerIfPossible)
}

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = false
): T | null {
  const account = useAccount().address
  const chainId = useChainId()
  const provider = useEthersProvider({ chainId })
  const signer = useEthersSigner({ chainId })
  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !provider || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null
    try {
      if (withSignerIfPossible) {
        return getContract(address, ABI, signer ?? provider)
      } else {
        return getContract(address, ABI, provider)
      }
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, signer, provider, chainId, withSignerIfPossible, account]) as T
}

export function useLpManager2(withSignerIfPossible?: boolean) {
  return useContract<LPManager2>(LMT_LP_MANAGER2, LP_MANAGER2_ABI.abi, withSignerIfPossible)
}

export function useV2MigratorContract() {
  return useContract<V3Migrator>(V3_MIGRATOR_ADDRESSES, V2MigratorABI, true)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean) {
  return useContract<Erc20>(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useLeverageManagerContract(leverageManagerAddress?: string, withSignerIfPossible?: boolean) {
  return useContract(leverageManagerAddress, ERC20_ABI, withSignerIfPossible)
}

export function useLiquidityManagerContract(liquidityManagerAddress?: string, withSignerIfPossible?: boolean) {
  return useContract('', ERC20_ABI, withSignerIfPossible)
}

export function useBorrowManagerContract(borrowManagerAddress?: string, withSignerIfPossible?: boolean) {
  return useContract('', ERC20_ABI, withSignerIfPossible)
}

export function usePoolContract(poolAddress?: string, withSignerIfPossible?: boolean) {
  return useContract(poolAddress, PoolAbi.abi, withSignerIfPossible)
}

export function useTestTokenContract(testTokenAd?: string, withSignerIfPossible?: boolean) {
  const contract = useContract(testTokenAd, testTokenAbi.abi, withSignerIfPossible)

  return useContract(testTokenAd, testTokenAbi.abi, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean) {
  const chainId = useChainId()
  return useContract<Weth>(
    chainId ? WRAPPED_NATIVE_CURRENCY[chainId]?.address : undefined,
    WETH_ABI,
    withSignerIfPossible
  )
}

export function useERC721Contract(nftAddress?: string) {
  return useContract<Erc721>(nftAddress, ERC721_ABI, false)
}

export function useERC1155Contract(nftAddress?: string) {
  return useContract<Erc1155>(nftAddress, ERC1155_ABI, false)
}

export function useArgentWalletDetectorContract() {
  return useContract<ArgentWalletDetector>(ARGENT_WALLET_DETECTOR_ADDRESS, ARGENT_WALLET_DETECTOR_ABI, false)
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean) {
  return useContract<EnsRegistrar>(ENS_REGISTRAR_ADDRESSES, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean) {
  return useContract<EnsPublicResolver>(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useEIP2612Contract(tokenAddress?: string): Contract | null {
  return useContract(tokenAddress, EIP_2612, false)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
}

export function useV2RouterContract(): Contract | null {
  return useContract(V2_ROUTER_ADDRESS, IUniswapV2Router02ABI, true)
}

export function useInterfaceMulticall() {
  return useContract<UniswapInterfaceMulticall>(MULTICALL_ADDRESS, MulticallABI, false) as UniswapInterfaceMulticall
}

export function useV3NFTPositionManagerContract(withSignerIfPossible?: boolean): NonfungiblePositionManager | null {
  return useContract<NonfungiblePositionManager>(
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
    NFTPositionManagerABI,
    withSignerIfPossible
  )
}

export function useQuoter(useQuoterV2: boolean) {
  return useContract<Quoter | QuoterV2>(QUOTER_ADDRESSES, useQuoterV2 ? QuoterV2ABI : QuoterABI)
}

export function useTickLens(): TickLens | null {
  const chainId = useChainId()
  const address = chainId ? TICK_LENS_ADDRESSES[chainId] : undefined
  return useContract(address, TickLensABI, true) as TickLens | null
}
