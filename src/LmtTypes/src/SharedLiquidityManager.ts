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
} from "../common";

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

export type LiquidityLoanStruct = {
  tick: PromiseOrValue<BigNumberish>;
  liquidity: PromiseOrValue<BigNumberish>;
  premium: PromiseOrValue<BigNumberish>;
  feeGrowthInside0LastX128: PromiseOrValue<BigNumberish>;
  feeGrowthInside1LastX128: PromiseOrValue<BigNumberish>;
  lastGrowth: PromiseOrValue<BigNumberish>;
};

export type LiquidityLoanStructOutput = [
  number,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber
] & {
  tick: number;
  liquidity: BigNumber;
  premium: BigNumber;
  feeGrowthInside0LastX128: BigNumber;
  feeGrowthInside1LastX128: BigNumber;
  lastGrowth: BigNumber;
};

export interface SharedLiquidityManagerInterface extends utils.Interface {
  functions: {
    "approvePoolManager()": FunctionFragment;
    "exposureToPair(bytes32)": FunctionFragment;
    "getHashedKey((address,address,uint24))": FunctionFragment;
    "getInstantLiq(bool,uint256,uint256,uint160,(address,address,uint24))": FunctionFragment;
    "getMaxWithdrawable((address,address,uint24),int24,int24)": FunctionFragment;
    "id()": FunctionFragment;
    "idToExposure(uint256)": FunctionFragment;
    "initialize(address,address)": FunctionFragment;
    "instantLiqIds(uint256)": FunctionFragment;
    "maxPerPairs(bytes32)": FunctionFragment;
    "maxPerPositions(bytes32)": FunctionFragment;
    "maxTickDiff()": FunctionFragment;
    "minTickDiffs(bytes32)": FunctionFragment;
    "provideInstantLiquidity((address,address,uint24),(int24,uint128,uint256,uint256,uint256,uint256))": FunctionFragment;
    "removeExposureById(uint256)": FunctionFragment;
    "setPoolParams((address,address,uint24),int24,uint256,uint256)": FunctionFragment;
    "timeAgo()": FunctionFragment;
    "withdrawInstantLiquidities()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "approvePoolManager"
      | "exposureToPair"
      | "getHashedKey"
      | "getInstantLiq"
      | "getMaxWithdrawable"
      | "id"
      | "idToExposure"
      | "initialize"
      | "instantLiqIds"
      | "maxPerPairs"
      | "maxPerPositions"
      | "maxTickDiff"
      | "minTickDiffs"
      | "provideInstantLiquidity"
      | "removeExposureById"
      | "setPoolParams"
      | "timeAgo"
      | "withdrawInstantLiquidities"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "approvePoolManager",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "exposureToPair",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "getHashedKey",
    values: [PoolKeyStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "getInstantLiq",
    values: [
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PoolKeyStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getMaxWithdrawable",
    values: [
      PoolKeyStruct,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(functionFragment: "id", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "idToExposure",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "instantLiqIds",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "maxPerPairs",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "maxPerPositions",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "maxTickDiff",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "minTickDiffs",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "provideInstantLiquidity",
    values: [PoolKeyStruct, LiquidityLoanStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "removeExposureById",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "setPoolParams",
    values: [
      PoolKeyStruct,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(functionFragment: "timeAgo", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "withdrawInstantLiquidities",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "approvePoolManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "exposureToPair",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getHashedKey",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getInstantLiq",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMaxWithdrawable",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "id", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "idToExposure",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "instantLiqIds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "maxPerPairs",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "maxPerPositions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "maxTickDiff",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "minTickDiffs",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "provideInstantLiquidity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "removeExposureById",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setPoolParams",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "timeAgo", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawInstantLiquidities",
    data: BytesLike
  ): Result;

  events: {
    "Initialized(uint8)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
}

export interface InitializedEventObject {
  version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface SharedLiquidityManager extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: SharedLiquidityManagerInterface;

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
    approvePoolManager(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    exposureToPair(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getHashedKey(
      key: PoolKeyStruct,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getInstantLiq(
      borrowBelow: PromiseOrValue<boolean>,
      borrowAmount: PromiseOrValue<BigNumberish>,
      simulatedOutput: PromiseOrValue<BigNumberish>,
      finishPriceX96: PromiseOrValue<BigNumberish>,
      key: PoolKeyStruct,
      overrides?: CallOverrides
    ): Promise<[LiquidityLoanStructOutput[]]>;

    getMaxWithdrawable(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { maxWithdrawable: BigNumber }>;

    id(overrides?: CallOverrides): Promise<[BigNumber]>;

    idToExposure(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, number, BigNumber, PoolKeyStructOutput] & {
        amount: BigNumber;
        tick: number;
        liquidity: BigNumber;
        key: PoolKeyStructOutput;
      }
    >;

    initialize(
      _vault: PromiseOrValue<string>,
      _poolManager: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    instantLiqIds(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    maxPerPairs(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    maxPerPositions(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    maxTickDiff(overrides?: CallOverrides): Promise<[number]>;

    minTickDiffs(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[number]>;

    provideInstantLiquidity(
      key: PoolKeyStruct,
      borrowInfo: LiquidityLoanStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    removeExposureById(
      id: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setPoolParams(
      key: PoolKeyStruct,
      minTickDiff: PromiseOrValue<BigNumberish>,
      maxPerPosition: PromiseOrValue<BigNumberish>,
      maxPerPair: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    timeAgo(overrides?: CallOverrides): Promise<[BigNumber]>;

    withdrawInstantLiquidities(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  approvePoolManager(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  exposureToPair(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getHashedKey(key: PoolKeyStruct, overrides?: CallOverrides): Promise<string>;

  getInstantLiq(
    borrowBelow: PromiseOrValue<boolean>,
    borrowAmount: PromiseOrValue<BigNumberish>,
    simulatedOutput: PromiseOrValue<BigNumberish>,
    finishPriceX96: PromiseOrValue<BigNumberish>,
    key: PoolKeyStruct,
    overrides?: CallOverrides
  ): Promise<LiquidityLoanStructOutput[]>;

  getMaxWithdrawable(
    key: PoolKeyStruct,
    tickLower: PromiseOrValue<BigNumberish>,
    tickUpper: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  id(overrides?: CallOverrides): Promise<BigNumber>;

  idToExposure(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, number, BigNumber, PoolKeyStructOutput] & {
      amount: BigNumber;
      tick: number;
      liquidity: BigNumber;
      key: PoolKeyStructOutput;
    }
  >;

  initialize(
    _vault: PromiseOrValue<string>,
    _poolManager: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  instantLiqIds(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  maxPerPairs(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  maxPerPositions(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  maxTickDiff(overrides?: CallOverrides): Promise<number>;

  minTickDiffs(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<number>;

  provideInstantLiquidity(
    key: PoolKeyStruct,
    borrowInfo: LiquidityLoanStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  removeExposureById(
    id: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setPoolParams(
    key: PoolKeyStruct,
    minTickDiff: PromiseOrValue<BigNumberish>,
    maxPerPosition: PromiseOrValue<BigNumberish>,
    maxPerPair: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  timeAgo(overrides?: CallOverrides): Promise<BigNumber>;

  withdrawInstantLiquidities(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    approvePoolManager(overrides?: CallOverrides): Promise<void>;

    exposureToPair(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getHashedKey(
      key: PoolKeyStruct,
      overrides?: CallOverrides
    ): Promise<string>;

    getInstantLiq(
      borrowBelow: PromiseOrValue<boolean>,
      borrowAmount: PromiseOrValue<BigNumberish>,
      simulatedOutput: PromiseOrValue<BigNumberish>,
      finishPriceX96: PromiseOrValue<BigNumberish>,
      key: PoolKeyStruct,
      overrides?: CallOverrides
    ): Promise<LiquidityLoanStructOutput[]>;

    getMaxWithdrawable(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    id(overrides?: CallOverrides): Promise<BigNumber>;

    idToExposure(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, number, BigNumber, PoolKeyStructOutput] & {
        amount: BigNumber;
        tick: number;
        liquidity: BigNumber;
        key: PoolKeyStructOutput;
      }
    >;

    initialize(
      _vault: PromiseOrValue<string>,
      _poolManager: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    instantLiqIds(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    maxPerPairs(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    maxPerPositions(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    maxTickDiff(overrides?: CallOverrides): Promise<number>;

    minTickDiffs(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<number>;

    provideInstantLiquidity(
      key: PoolKeyStruct,
      borrowInfo: LiquidityLoanStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    removeExposureById(
      id: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setPoolParams(
      key: PoolKeyStruct,
      minTickDiff: PromiseOrValue<BigNumberish>,
      maxPerPosition: PromiseOrValue<BigNumberish>,
      maxPerPair: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    timeAgo(overrides?: CallOverrides): Promise<BigNumber>;

    withdrawInstantLiquidities(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber] & {
        token0Outs: BigNumber;
        token1Outs: BigNumber;
        collectedFeesTotal0: BigNumber;
        collectedFeesTotal1: BigNumber;
      }
    >;
  };

  filters: {
    "Initialized(uint8)"(version?: null): InitializedEventFilter;
    Initialized(version?: null): InitializedEventFilter;
  };

  estimateGas: {
    approvePoolManager(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    exposureToPair(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getHashedKey(
      key: PoolKeyStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getInstantLiq(
      borrowBelow: PromiseOrValue<boolean>,
      borrowAmount: PromiseOrValue<BigNumberish>,
      simulatedOutput: PromiseOrValue<BigNumberish>,
      finishPriceX96: PromiseOrValue<BigNumberish>,
      key: PoolKeyStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getMaxWithdrawable(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    id(overrides?: CallOverrides): Promise<BigNumber>;

    idToExposure(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initialize(
      _vault: PromiseOrValue<string>,
      _poolManager: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    instantLiqIds(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    maxPerPairs(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    maxPerPositions(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    maxTickDiff(overrides?: CallOverrides): Promise<BigNumber>;

    minTickDiffs(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    provideInstantLiquidity(
      key: PoolKeyStruct,
      borrowInfo: LiquidityLoanStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    removeExposureById(
      id: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setPoolParams(
      key: PoolKeyStruct,
      minTickDiff: PromiseOrValue<BigNumberish>,
      maxPerPosition: PromiseOrValue<BigNumberish>,
      maxPerPair: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    timeAgo(overrides?: CallOverrides): Promise<BigNumber>;

    withdrawInstantLiquidities(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    approvePoolManager(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    exposureToPair(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getHashedKey(
      key: PoolKeyStruct,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getInstantLiq(
      borrowBelow: PromiseOrValue<boolean>,
      borrowAmount: PromiseOrValue<BigNumberish>,
      simulatedOutput: PromiseOrValue<BigNumberish>,
      finishPriceX96: PromiseOrValue<BigNumberish>,
      key: PoolKeyStruct,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getMaxWithdrawable(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    id(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    idToExposure(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    initialize(
      _vault: PromiseOrValue<string>,
      _poolManager: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    instantLiqIds(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    maxPerPairs(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    maxPerPositions(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    maxTickDiff(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    minTickDiffs(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    provideInstantLiquidity(
      key: PoolKeyStruct,
      borrowInfo: LiquidityLoanStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    removeExposureById(
      id: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setPoolParams(
      key: PoolKeyStruct,
      minTickDiff: PromiseOrValue<BigNumberish>,
      maxPerPosition: PromiseOrValue<BigNumberish>,
      maxPerPair: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    timeAgo(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    withdrawInstantLiquidities(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
