/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../common";

export type PoolKeyStruct = {
  token0: PromiseOrValue<string>;
  token1: PromiseOrValue<string>;
  fee: PromiseOrValue<BigNumberish>;
};

export type PoolKeyStructOutput = [string, string, number] & {
  token0: string;
  token1: string;
  fee: number;
};

export declare namespace LPManager {
  export type PositionStruct = {
    token0Amount: PromiseOrValue<BigNumberish>;
    token1Amount: PromiseOrValue<BigNumberish>;
    token0Repaid: PromiseOrValue<BigNumberish>;
    token1Repaid: PromiseOrValue<BigNumberish>;
    tickLower: PromiseOrValue<BigNumberish>;
    tickUpper: PromiseOrValue<BigNumberish>;
    liquidity: PromiseOrValue<BigNumberish>;
    key: PoolKeyStruct;
  };

  export type PositionStructOutput = [
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    number,
    number,
    BigNumber,
    PoolKeyStructOutput
  ] & {
    token0Amount: BigNumber;
    token1Amount: BigNumber;
    token0Repaid: BigNumber;
    token1Repaid: BigNumber;
    tickLower: number;
    tickUpper: number;
    liquidity: BigNumber;
    key: PoolKeyStructOutput;
  };

  export type RebalanceReturnStruct = {
    token0Supplied: PromiseOrValue<BigNumberish>;
    token1Supplied: PromiseOrValue<BigNumberish>;
    token0Withdrawn: PromiseOrValue<BigNumberish>;
    token1Withdrawn: PromiseOrValue<BigNumberish>;
  };

  export type RebalanceReturnStructOutput = [
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    token0Supplied: BigNumber;
    token1Supplied: BigNumber;
    token0Withdrawn: BigNumber;
    token1Withdrawn: BigNumber;
  };
}

export interface LPManagerInterface extends utils.Interface {
  functions: {
    "addLiquidityToPositions()": FunctionFragment;
    "approve(address,address)": FunctionFragment;
    "getMaxWithdrawable((address,address,uint24),int24,int24)": FunctionFragment;
    "getPosition(uint256)": FunctionFragment;
    "getTokenIdsFromKey((address,address,uint24))": FunctionFragment;
    "initialize(address,address)": FunctionFragment;
    "keyToTokenIds(bytes32,uint256)": FunctionFragment;
    "lastRebalanceCenterTicks(bytes32)": FunctionFragment;
    "provideLiquidity((address,address,uint24),int24,int24,uint256,address)": FunctionFragment;
    "rebalanceAroundCurrentPrice((address,address,uint24),int24,int24,uint256,int24)": FunctionFragment;
    "removeLiquidityFromPositions()": FunctionFragment;
    "removeTokenById(bytes32,uint256)": FunctionFragment;
    "setStrategist(address)": FunctionFragment;
    "setVault(address)": FunctionFragment;
    "withdrawLiquidity(uint256,uint128)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "addLiquidityToPositions"
      | "approve"
      | "getMaxWithdrawable"
      | "getPosition"
      | "getTokenIdsFromKey"
      | "initialize"
      | "keyToTokenIds"
      | "lastRebalanceCenterTicks"
      | "provideLiquidity"
      | "rebalanceAroundCurrentPrice"
      | "removeLiquidityFromPositions"
      | "removeTokenById"
      | "setStrategist"
      | "setVault"
      | "withdrawLiquidity"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addLiquidityToPositions",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "approve",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getMaxWithdrawable",
    values: [
      PoolKeyStruct,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getPosition",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenIdsFromKey",
    values: [PoolKeyStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "keyToTokenIds",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "lastRebalanceCenterTicks",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "provideLiquidity",
    values: [
      PoolKeyStruct,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "rebalanceAroundCurrentPrice",
    values: [
      PoolKeyStruct,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "removeLiquidityFromPositions",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "removeTokenById",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "setStrategist",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setVault",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawLiquidity",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(
    functionFragment: "addLiquidityToPositions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getMaxWithdrawable",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPosition",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenIdsFromKey",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "keyToTokenIds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lastRebalanceCenterTicks",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "provideLiquidity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "rebalanceAroundCurrentPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "removeLiquidityFromPositions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "removeTokenById",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setStrategist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setVault", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawLiquidity",
    data: BytesLike
  ): Result;

  events: {
    "CollectedFees(address,address,uint24,uint256,uint256)": EventFragment;
    "Initialized(uint8)": EventFragment;
    "ProvidedLiquidity(uint256,address,address,uint24,uint256,uint256)": EventFragment;
    "RepaidLiquidity(uint256,address,address,uint24,uint128)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "CollectedFees"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProvidedLiquidity"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RepaidLiquidity"): EventFragment;
}

export interface CollectedFeesEventObject {
  token0: string;
  token1: string;
  fee: number;
  fee0Collected: BigNumber;
  fee1Collected: BigNumber;
}
export type CollectedFeesEvent = TypedEvent<
  [string, string, number, BigNumber, BigNumber],
  CollectedFeesEventObject
>;

export type CollectedFeesEventFilter = TypedEventFilter<CollectedFeesEvent>;

export interface InitializedEventObject {
  version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface ProvidedLiquidityEventObject {
  tokenId: BigNumber;
  token0: string;
  token1: string;
  fee: number;
  token0Amount: BigNumber;
  token1Amount: BigNumber;
}
export type ProvidedLiquidityEvent = TypedEvent<
  [BigNumber, string, string, number, BigNumber, BigNumber],
  ProvidedLiquidityEventObject
>;

export type ProvidedLiquidityEventFilter =
  TypedEventFilter<ProvidedLiquidityEvent>;

export interface RepaidLiquidityEventObject {
  tokenId: BigNumber;
  token0: string;
  token1: string;
  fee: number;
  liquidity: BigNumber;
}
export type RepaidLiquidityEvent = TypedEvent<
  [BigNumber, string, string, number, BigNumber],
  RepaidLiquidityEventObject
>;

export type RepaidLiquidityEventFilter = TypedEventFilter<RepaidLiquidityEvent>;

export interface LPManager extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: LPManagerInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    addLiquidityToPositions(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    approve(
      token: PromiseOrValue<string>,
      who: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getMaxWithdrawable(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { maxWithdrawable: BigNumber }>;

    getPosition(
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[LPManager.PositionStructOutput]>;

    getTokenIdsFromKey(
      key: PoolKeyStruct,
      overrides?: CallOverrides
    ): Promise<[BigNumber[]]>;

    initialize(
      _vault: PromiseOrValue<string>,
      _poolManager: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    keyToTokenIds(
      arg0: PromiseOrValue<BytesLike>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    lastRebalanceCenterTicks(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[number]>;

    provideLiquidity(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      tokenAmount: PromiseOrValue<BigNumberish>,
      token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    rebalanceAroundCurrentPrice(
      key: PoolKeyStruct,
      tickOuter: PromiseOrValue<BigNumberish>,
      tickInner: PromiseOrValue<BigNumberish>,
      percentageUse: PromiseOrValue<BigNumberish>,
      rebalanceThreshold: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    removeLiquidityFromPositions(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    removeTokenById(
      key: PromiseOrValue<BytesLike>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setStrategist(
      strategist: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setVault(
      _vault: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    withdrawLiquidity(
      tokenId: PromiseOrValue<BigNumberish>,
      liquidity: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  addLiquidityToPositions(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  approve(
    token: PromiseOrValue<string>,
    who: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getMaxWithdrawable(
    key: PoolKeyStruct,
    tickLower: PromiseOrValue<BigNumberish>,
    tickUpper: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getPosition(
    tokenId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<LPManager.PositionStructOutput>;

  getTokenIdsFromKey(
    key: PoolKeyStruct,
    overrides?: CallOverrides
  ): Promise<BigNumber[]>;

  initialize(
    _vault: PromiseOrValue<string>,
    _poolManager: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  keyToTokenIds(
    arg0: PromiseOrValue<BytesLike>,
    arg1: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  lastRebalanceCenterTicks(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<number>;

  provideLiquidity(
    key: PoolKeyStruct,
    tickLower: PromiseOrValue<BigNumberish>,
    tickUpper: PromiseOrValue<BigNumberish>,
    tokenAmount: PromiseOrValue<BigNumberish>,
    token: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  rebalanceAroundCurrentPrice(
    key: PoolKeyStruct,
    tickOuter: PromiseOrValue<BigNumberish>,
    tickInner: PromiseOrValue<BigNumberish>,
    percentageUse: PromiseOrValue<BigNumberish>,
    rebalanceThreshold: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  removeLiquidityFromPositions(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  removeTokenById(
    key: PromiseOrValue<BytesLike>,
    tokenId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setStrategist(
    strategist: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setVault(
    _vault: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  withdrawLiquidity(
    tokenId: PromiseOrValue<BigNumberish>,
    liquidity: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addLiquidityToPositions(overrides?: CallOverrides): Promise<void>;

    approve(
      token: PromiseOrValue<string>,
      who: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    getMaxWithdrawable(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPosition(
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<LPManager.PositionStructOutput>;

    getTokenIdsFromKey(
      key: PoolKeyStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    initialize(
      _vault: PromiseOrValue<string>,
      _poolManager: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    keyToTokenIds(
      arg0: PromiseOrValue<BytesLike>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    lastRebalanceCenterTicks(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<number>;

    provideLiquidity(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      tokenAmount: PromiseOrValue<BigNumberish>,
      token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber] & {
        token0Amount: BigNumber;
        token1Amount: BigNumber;
        liquidity: BigNumber;
      }
    >;

    rebalanceAroundCurrentPrice(
      key: PoolKeyStruct,
      tickOuter: PromiseOrValue<BigNumberish>,
      tickInner: PromiseOrValue<BigNumberish>,
      percentageUse: PromiseOrValue<BigNumberish>,
      rebalanceThreshold: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<LPManager.RebalanceReturnStructOutput>;

    removeLiquidityFromPositions(overrides?: CallOverrides): Promise<void>;

    removeTokenById(
      key: PromiseOrValue<BytesLike>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setStrategist(
      strategist: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setVault(
      _vault: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawLiquidity(
      tokenId: PromiseOrValue<BigNumberish>,
      liquidity: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { token0Out: BigNumber; token1Out: BigNumber }
    >;
  };

  filters: {
    "CollectedFees(address,address,uint24,uint256,uint256)"(
      token0?: PromiseOrValue<string> | null,
      token1?: PromiseOrValue<string> | null,
      fee?: null,
      fee0Collected?: null,
      fee1Collected?: null
    ): CollectedFeesEventFilter;
    CollectedFees(
      token0?: PromiseOrValue<string> | null,
      token1?: PromiseOrValue<string> | null,
      fee?: null,
      fee0Collected?: null,
      fee1Collected?: null
    ): CollectedFeesEventFilter;

    "Initialized(uint8)"(version?: null): InitializedEventFilter;
    Initialized(version?: null): InitializedEventFilter;

    "ProvidedLiquidity(uint256,address,address,uint24,uint256,uint256)"(
      tokenId?: null,
      token0?: PromiseOrValue<string> | null,
      token1?: PromiseOrValue<string> | null,
      fee?: null,
      token0Amount?: null,
      token1Amount?: null
    ): ProvidedLiquidityEventFilter;
    ProvidedLiquidity(
      tokenId?: null,
      token0?: PromiseOrValue<string> | null,
      token1?: PromiseOrValue<string> | null,
      fee?: null,
      token0Amount?: null,
      token1Amount?: null
    ): ProvidedLiquidityEventFilter;

    "RepaidLiquidity(uint256,address,address,uint24,uint128)"(
      tokenId?: null,
      token0?: PromiseOrValue<string> | null,
      token1?: PromiseOrValue<string> | null,
      fee?: null,
      liquidity?: null
    ): RepaidLiquidityEventFilter;
    RepaidLiquidity(
      tokenId?: null,
      token0?: PromiseOrValue<string> | null,
      token1?: PromiseOrValue<string> | null,
      fee?: null,
      liquidity?: null
    ): RepaidLiquidityEventFilter;
  };

  estimateGas: {
    addLiquidityToPositions(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    approve(
      token: PromiseOrValue<string>,
      who: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getMaxWithdrawable(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPosition(
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTokenIdsFromKey(
      key: PoolKeyStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initialize(
      _vault: PromiseOrValue<string>,
      _poolManager: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    keyToTokenIds(
      arg0: PromiseOrValue<BytesLike>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    lastRebalanceCenterTicks(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    provideLiquidity(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      tokenAmount: PromiseOrValue<BigNumberish>,
      token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    rebalanceAroundCurrentPrice(
      key: PoolKeyStruct,
      tickOuter: PromiseOrValue<BigNumberish>,
      tickInner: PromiseOrValue<BigNumberish>,
      percentageUse: PromiseOrValue<BigNumberish>,
      rebalanceThreshold: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    removeLiquidityFromPositions(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    removeTokenById(
      key: PromiseOrValue<BytesLike>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setStrategist(
      strategist: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setVault(
      _vault: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    withdrawLiquidity(
      tokenId: PromiseOrValue<BigNumberish>,
      liquidity: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addLiquidityToPositions(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    approve(
      token: PromiseOrValue<string>,
      who: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getMaxWithdrawable(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPosition(
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTokenIdsFromKey(
      key: PoolKeyStruct,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    initialize(
      _vault: PromiseOrValue<string>,
      _poolManager: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    keyToTokenIds(
      arg0: PromiseOrValue<BytesLike>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    lastRebalanceCenterTicks(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    provideLiquidity(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      tokenAmount: PromiseOrValue<BigNumberish>,
      token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    rebalanceAroundCurrentPrice(
      key: PoolKeyStruct,
      tickOuter: PromiseOrValue<BigNumberish>,
      tickInner: PromiseOrValue<BigNumberish>,
      percentageUse: PromiseOrValue<BigNumberish>,
      rebalanceThreshold: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    removeLiquidityFromPositions(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    removeTokenById(
      key: PromiseOrValue<BytesLike>,
      tokenId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setStrategist(
      strategist: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setVault(
      _vault: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    withdrawLiquidity(
      tokenId: PromiseOrValue<BigNumberish>,
      liquidity: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
