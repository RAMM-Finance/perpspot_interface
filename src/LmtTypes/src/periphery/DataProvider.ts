/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";

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

export type URateParamStruct = {
  pivotRate: PromiseOrValue<BigNumberish>;
  slope1: PromiseOrValue<BigNumberish>;
  intercept1: PromiseOrValue<BigNumberish>;
  slope2: PromiseOrValue<BigNumberish>;
  intercept2: PromiseOrValue<BigNumberish>;
};

export type URateParamStructOutput = [
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber
] & {
  pivotRate: BigNumber;
  slope1: BigNumber;
  intercept1: BigNumber;
  slope2: BigNumber;
  intercept2: BigNumber;
};

export declare namespace DataProvider {
  export type MarginPositionInfoStruct = {
    poolKey: PoolKeyStruct;
    isToken0: PromiseOrValue<boolean>;
    totalDebtOutput: PromiseOrValue<BigNumberish>;
    totalDebtInput: PromiseOrValue<BigNumberish>;
    openTime: PromiseOrValue<BigNumberish>;
    repayTime: PromiseOrValue<BigNumberish>;
    premiumDeposit: PromiseOrValue<BigNumberish>;
    totalPosition: PromiseOrValue<BigNumberish>;
    margin: PromiseOrValue<BigNumberish>;
    premiumOwed: PromiseOrValue<BigNumberish>;
    token0Decimals: PromiseOrValue<BigNumberish>;
    token1Decimals: PromiseOrValue<BigNumberish>;
  };

  export type MarginPositionInfoStructOutput = [
    PoolKeyStructOutput,
    boolean,
    BigNumber,
    BigNumber,
    number,
    number,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    number,
    number
  ] & {
    poolKey: PoolKeyStructOutput;
    isToken0: boolean;
    totalDebtOutput: BigNumber;
    totalDebtInput: BigNumber;
    openTime: number;
    repayTime: number;
    premiumDeposit: BigNumber;
    totalPosition: BigNumber;
    margin: BigNumber;
    premiumOwed: BigNumber;
    token0Decimals: number;
    token1Decimals: number;
  };
}

export interface DataProviderInterface extends utils.Interface {
  functions: {
    "getActiveMarginPositions(address)": FunctionFragment;
    "getBorrowedLiquidityInBin((address,address,uint24),int24)": FunctionFragment;
    "getExpectedFeesOwed((int24,uint128,uint256,uint256,uint256,uint256)[],bool,address,int24)": FunctionFragment;
    "getExpectedInterestOwed((int24,uint128,uint256,uint256,uint256,uint256)[],bool,(uint256,uint256,uint256,uint256,uint256),address,int24)": FunctionFragment;
    "getExpectedPremiumOwed((address,address,uint24),address,bool)": FunctionFragment;
    "getIsBorrowable((address,address,uint24),(int24,uint128,uint256,uint256,uint256,uint256)[])": FunctionFragment;
    "getLiquidityInBin((address,address,uint24),int24)": FunctionFragment;
    "getMarginPosition(address,address,bool)": FunctionFragment;
    "getMaxWithdrawable((address,address,uint24),int24,int24)": FunctionFragment;
    "getPoolkeys(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "getActiveMarginPositions"
      | "getBorrowedLiquidityInBin"
      | "getExpectedFeesOwed"
      | "getExpectedInterestOwed"
      | "getExpectedPremiumOwed"
      | "getIsBorrowable"
      | "getLiquidityInBin"
      | "getMarginPosition"
      | "getMaxWithdrawable"
      | "getPoolkeys"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getActiveMarginPositions",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getBorrowedLiquidityInBin",
    values: [PoolKeyStruct, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getExpectedFeesOwed",
    values: [
      LiquidityLoanStruct[],
      PromiseOrValue<boolean>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getExpectedInterestOwed",
    values: [
      LiquidityLoanStruct[],
      PromiseOrValue<boolean>,
      URateParamStruct,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getExpectedPremiumOwed",
    values: [PoolKeyStruct, PromiseOrValue<string>, PromiseOrValue<boolean>]
  ): string;
  encodeFunctionData(
    functionFragment: "getIsBorrowable",
    values: [PoolKeyStruct, LiquidityLoanStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getLiquidityInBin",
    values: [PoolKeyStruct, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getMarginPosition",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<boolean>
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
  encodeFunctionData(
    functionFragment: "getPoolkeys",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(
    functionFragment: "getActiveMarginPositions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBorrowedLiquidityInBin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getExpectedFeesOwed",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getExpectedInterestOwed",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getExpectedPremiumOwed",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getIsBorrowable",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLiquidityInBin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMarginPosition",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMaxWithdrawable",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPoolkeys",
    data: BytesLike
  ): Result;

  events: {};
}

export interface DataProvider extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: DataProviderInterface;

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
    getActiveMarginPositions(
      trader: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[DataProvider.MarginPositionInfoStructOutput[]]>;

    getBorrowedLiquidityInBin(
      key: PoolKeyStruct,
      tick: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getExpectedFeesOwed(
      borrowInfo: LiquidityLoanStruct[],
      positionIsToken0: PromiseOrValue<boolean>,
      pool: PromiseOrValue<string>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getExpectedInterestOwed(
      borrowInfo: LiquidityLoanStruct[],
      positionIsToken0: PromiseOrValue<boolean>,
      uParam: URateParamStruct,
      pool: PromiseOrValue<string>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getExpectedPremiumOwed(
      poolKey: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getIsBorrowable(
      key: PoolKeyStruct,
      borrowInfo: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    getLiquidityInBin(
      key: PoolKeyStruct,
      tick: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getMarginPosition(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      isToken: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<[DataProvider.MarginPositionInfoStructOutput]>;

    getMaxWithdrawable(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { maxWithdrawable: BigNumber }>;

    getPoolkeys(
      pool: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [string, string, number] & { token0: string; token1: string; fee: number }
    >;
  };

  getActiveMarginPositions(
    trader: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<DataProvider.MarginPositionInfoStructOutput[]>;

  getBorrowedLiquidityInBin(
    key: PoolKeyStruct,
    tick: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getExpectedFeesOwed(
    borrowInfo: LiquidityLoanStruct[],
    positionIsToken0: PromiseOrValue<boolean>,
    pool: PromiseOrValue<string>,
    tickDiscretization: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getExpectedInterestOwed(
    borrowInfo: LiquidityLoanStruct[],
    positionIsToken0: PromiseOrValue<boolean>,
    uParam: URateParamStruct,
    pool: PromiseOrValue<string>,
    tickDiscretization: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getExpectedPremiumOwed(
    poolKey: PoolKeyStruct,
    trader: PromiseOrValue<string>,
    positionIsToken0: PromiseOrValue<boolean>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getIsBorrowable(
    key: PoolKeyStruct,
    borrowInfo: LiquidityLoanStruct[],
    overrides?: CallOverrides
  ): Promise<boolean>;

  getLiquidityInBin(
    key: PoolKeyStruct,
    tick: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getMarginPosition(
    pool: PromiseOrValue<string>,
    trader: PromiseOrValue<string>,
    isToken: PromiseOrValue<boolean>,
    overrides?: CallOverrides
  ): Promise<DataProvider.MarginPositionInfoStructOutput>;

  getMaxWithdrawable(
    key: PoolKeyStruct,
    tickLower: PromiseOrValue<BigNumberish>,
    tickUpper: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getPoolkeys(
    pool: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<
    [string, string, number] & { token0: string; token1: string; fee: number }
  >;

  callStatic: {
    getActiveMarginPositions(
      trader: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<DataProvider.MarginPositionInfoStructOutput[]>;

    getBorrowedLiquidityInBin(
      key: PoolKeyStruct,
      tick: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getExpectedFeesOwed(
      borrowInfo: LiquidityLoanStruct[],
      positionIsToken0: PromiseOrValue<boolean>,
      pool: PromiseOrValue<string>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getExpectedInterestOwed(
      borrowInfo: LiquidityLoanStruct[],
      positionIsToken0: PromiseOrValue<boolean>,
      uParam: URateParamStruct,
      pool: PromiseOrValue<string>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getExpectedPremiumOwed(
      poolKey: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getIsBorrowable(
      key: PoolKeyStruct,
      borrowInfo: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<boolean>;

    getLiquidityInBin(
      key: PoolKeyStruct,
      tick: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getMarginPosition(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      isToken: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<DataProvider.MarginPositionInfoStructOutput>;

    getMaxWithdrawable(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPoolkeys(
      pool: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [string, string, number] & { token0: string; token1: string; fee: number }
    >;
  };

  filters: {};

  estimateGas: {
    getActiveMarginPositions(
      trader: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getBorrowedLiquidityInBin(
      key: PoolKeyStruct,
      tick: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getExpectedFeesOwed(
      borrowInfo: LiquidityLoanStruct[],
      positionIsToken0: PromiseOrValue<boolean>,
      pool: PromiseOrValue<string>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getExpectedInterestOwed(
      borrowInfo: LiquidityLoanStruct[],
      positionIsToken0: PromiseOrValue<boolean>,
      uParam: URateParamStruct,
      pool: PromiseOrValue<string>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getExpectedPremiumOwed(
      poolKey: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getIsBorrowable(
      key: PoolKeyStruct,
      borrowInfo: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getLiquidityInBin(
      key: PoolKeyStruct,
      tick: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getMarginPosition(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      isToken: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getMaxWithdrawable(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPoolkeys(
      pool: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getActiveMarginPositions(
      trader: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getBorrowedLiquidityInBin(
      key: PoolKeyStruct,
      tick: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getExpectedFeesOwed(
      borrowInfo: LiquidityLoanStruct[],
      positionIsToken0: PromiseOrValue<boolean>,
      pool: PromiseOrValue<string>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getExpectedInterestOwed(
      borrowInfo: LiquidityLoanStruct[],
      positionIsToken0: PromiseOrValue<boolean>,
      uParam: URateParamStruct,
      pool: PromiseOrValue<string>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getExpectedPremiumOwed(
      poolKey: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getIsBorrowable(
      key: PoolKeyStruct,
      borrowInfo: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getLiquidityInBin(
      key: PoolKeyStruct,
      tick: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getMarginPosition(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      isToken: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getMaxWithdrawable(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPoolkeys(
      pool: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
