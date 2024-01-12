import { Contract } from '@ethersproject/contracts'
import QuoterV2Json from '@uniswap/swap-router-contracts/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'
import IUniswapV2PairJson from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import IUniswapV2Router02Json from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import QuoterJson from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import TickLensJson from '@uniswap/v3-periphery/artifacts/contracts/lens/TickLens.sol/TickLens.json'
import UniswapInterfaceMulticallJson from '@uniswap/v3-periphery/artifacts/contracts/lens/UniswapInterfaceMulticall.sol/UniswapInterfaceMulticall.json'
import NonfungiblePositionManagerJson from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import V3MigratorJson from '@uniswap/v3-periphery/artifacts/contracts/V3Migrator.sol/V3Migrator.json'
import { useWeb3React } from '@web3-react/core'
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
  DATA_PROVIDER_ADDRESSES,
  ENS_REGISTRAR_ADDRESSES,
  LMT_MARGIN_FACILITY,
  LMT_NFT_POSITION_MANAGER,
  LMT_POOL_MANAGER,
  LMT_REFERRAL,
  LMT_VAULT,
  MULTICALL_ADDRESS,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  QUOTER_ADDRESSES,
  TICK_LENS_ADDRESSES,
  V2_ROUTER_ADDRESS,
  V3_MIGRATOR_ADDRESSES,
} from 'constants/addresses'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useMemo } from 'react'
import { NonfungiblePositionManager, Quoter, QuoterV2, TickLens, UniswapInterfaceMulticall } from 'types/v3'
import { V3Migrator } from 'types/v3/V3Migrator'

import { abi as DataProviderABI } from '../abis_v2/DataProvider.json'
import { abi as MarginFacilityAbi } from '../abis_v2/MarginFacility.json'
import LmtNFTManagerJson from '../abis_v2/NonfungiblePositionManager.json'
import LmtPoolManagerJson from '../abis_v2/PoolManager.json'
import { abi as ReferralSystemABI } from '../abis_v2/ReferralSystem.json'
import { abi as testTokenAbi } from '../abis_v2/TestToken.json'
import { abi as PoolAbi } from '../abis_v2/UniswapV3Pool.json'
import {abi as VaultAbi} from '../abis_v2/LPVault.json'
import {
  DataProvider,
  MarginFacility,
  NonfungiblePositionManager as LmtNonfungiblePositionManager,
  PoolManager as LmtPoolManager,
  ReferralSystem,
  LPVault,
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
  '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f':40000, 
  // weth -arb
  '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1':2000,
  '0xaf88d065e77c8cc2239327c5edb3a432268e5831': 1

}

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
  '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f':8, 
  // weth -arb
  '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1':18,
  '0xaf88d065e77c8cc2239327c5edb3a432268e5831': 6,
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
  return useContract<MarginFacility>(LMT_MARGIN_FACILITY, MarginFacilityAbi, withSignerIfPossible)
}

export function useDataProviderContract(withSignerIfPossible?: boolean) {
  return useContract<DataProvider>(DATA_PROVIDER_ADDRESSES, DataProviderABI, withSignerIfPossible)
}

export function useReferralContract(withSignerIfPossible?: boolean) {
  return useContract<ReferralSystem>(LMT_REFERRAL, ReferralSystemABI, withSignerIfPossible)
}

export function useVaultContract(withSignerIfPossible?: boolean){
  return useContract<LPVault>(LMT_VAULT,VaultAbi, withSignerIfPossible )
}

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { provider, account, chainId } = useWeb3React()

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !provider || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null
    try {
      return getContract(address, ABI, provider, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, provider, chainId, withSignerIfPossible, account]) as T
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
  return useContract(poolAddress, PoolAbi, withSignerIfPossible)
}

export function useTestTokenContract(testTokenAd?: string, withSignerIfPossible?: boolean) {
  const contract = useContract(testTokenAd, testTokenAbi, withSignerIfPossible)

  return useContract(testTokenAd, testTokenAbi, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean) {
  const { chainId } = useWeb3React()
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
  const { chainId } = useWeb3React()
  const address = chainId ? TICK_LENS_ADDRESSES[chainId] : undefined
  return useContract(address, TickLensABI, true) as TickLens | null
}
