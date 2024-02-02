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

export type OrderStruct = {
  key: PoolKeyStruct;
  positionIsToken0: PromiseOrValue<boolean>;
  auctionDeadline: PromiseOrValue<BigNumberish>;
  auctionStartTime: PromiseOrValue<BigNumberish>;
  startOutput: PromiseOrValue<BigNumberish>;
  minOutput: PromiseOrValue<BigNumberish>;
  inputAmount: PromiseOrValue<BigNumberish>;
  decayRate: PromiseOrValue<BigNumberish>;
  margin: PromiseOrValue<BigNumberish>;
};

export type OrderStructOutput = [
  PoolKeyStructOutput,
  boolean,
  number,
  number,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber
] & {
  key: PoolKeyStructOutput;
  positionIsToken0: boolean;
  auctionDeadline: number;
  auctionStartTime: number;
  startOutput: BigNumber;
  minOutput: BigNumber;
  inputAmount: BigNumber;
  decayRate: BigNumber;
  margin: BigNumber;
};

export declare namespace DataProvider {
  export type MaxLeverageParamsStruct = {
    poolKey: PoolKeyStruct;
    isToken0: PromiseOrValue<boolean>;
    margin: PromiseOrValue<BigNumberish>;
    startingLeverage: PromiseOrValue<BigNumberish>;
    stepSize: PromiseOrValue<BigNumberish>;
  };

  export type MaxLeverageParamsStructOutput = [
    PoolKeyStructOutput,
    boolean,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    poolKey: PoolKeyStructOutput;
    isToken0: boolean;
    margin: BigNumber;
    startingLeverage: BigNumber;
    stepSize: BigNumber;
  };

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
    maxWithdrawablePremium: PromiseOrValue<BigNumberish>;
    borrowInfo: LiquidityLoanStruct[];
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
    number,
    BigNumber,
    LiquidityLoanStructOutput[]
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
    maxWithdrawablePremium: BigNumber;
    borrowInfo: LiquidityLoanStructOutput[];
  };

  export type BinDataStruct = {
    price: PromiseOrValue<BigNumberish>;
    token0Liquidity: PromiseOrValue<BigNumberish>;
    token1Liquidity: PromiseOrValue<BigNumberish>;
    token0Borrowed: PromiseOrValue<BigNumberish>;
    token1Borrowed: PromiseOrValue<BigNumberish>;
  };

  export type BinDataStructOutput = [
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    price: BigNumber;
    token0Liquidity: BigNumber;
    token1Liquidity: BigNumber;
    token0Borrowed: BigNumber;
    token1Borrowed: BigNumber;
  };

  export type LimitOrderInfoStruct = {
    key: PoolKeyStruct;
    isAdd: PromiseOrValue<boolean>;
    positionIsToken0: PromiseOrValue<boolean>;
    auctionDeadline: PromiseOrValue<BigNumberish>;
    auctionStartTime: PromiseOrValue<BigNumberish>;
    startOutput: PromiseOrValue<BigNumberish>;
    minOutput: PromiseOrValue<BigNumberish>;
    inputAmount: PromiseOrValue<BigNumberish>;
    decayRate: PromiseOrValue<BigNumberish>;
    margin: PromiseOrValue<BigNumberish>;
    currentOutput: PromiseOrValue<BigNumberish>;
    token0Decimals: PromiseOrValue<BigNumberish>;
    token1Decimals: PromiseOrValue<BigNumberish>;
  };

  export type LimitOrderInfoStructOutput = [
    PoolKeyStructOutput,
    boolean,
    boolean,
    number,
    number,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    key: PoolKeyStructOutput;
    isAdd: boolean;
    positionIsToken0: boolean;
    auctionDeadline: number;
    auctionStartTime: number;
    startOutput: BigNumber;
    minOutput: BigNumber;
    inputAmount: BigNumber;
    decayRate: BigNumber;
    margin: BigNumber;
    currentOutput: BigNumber;
    token0Decimals: BigNumber;
    token1Decimals: BigNumber;
  };
}

export interface DataProviderInterface extends utils.Interface {
  functions: {
    "computeMaxLeverage(((address,address,uint24),bool,uint256,uint256,uint256))": FunctionFragment;
    "findTicks((address,address,uint24),uint256,uint256,bool,uint256,uint160)": FunctionFragment;
    "getActiveMarginPositions(address)": FunctionFragment;
    "getBinsDataInBulk((address,address,uint24),int24,int24)": FunctionFragment;
    "getBorrowedLiquidityInBin((address,address,uint24),int24)": FunctionFragment;
    "getEstimatedPnl((address,address,uint24),address,bool,uint256,uint256)": FunctionFragment;
    "getExpectedPremiumOwed((address,address,uint24),address,bool)": FunctionFragment;
    "getIsBorrowable((address,address,uint24),(int24,uint128,uint256,uint256,uint256,uint256)[])": FunctionFragment;
    "getLiquidityInBin((address,address,uint24),int24)": FunctionFragment;
    "getMarginPosition(address,address,bool)": FunctionFragment;
    "getMaxWithdrawable((address,address,uint24),int24,int24)": FunctionFragment;
    "getMinMaxTicks((int24,uint128,uint256,uint256,uint256,uint256)[])": FunctionFragment;
    "getOrder(address,address,bool,bool)": FunctionFragment;
    "getOrderInfo(address,address,bool,bool)": FunctionFragment;
    "getOrders(address)": FunctionFragment;
    "getPoolkeys(address)": FunctionFragment;
    "getPostInstantaneousRate((address,address,uint24),address,bool)": FunctionFragment;
    "getPreInstantaeneousRate((address,address,uint24),(int24,uint128,uint256,uint256,uint256,uint256)[])": FunctionFragment;
    "getUtilAndAPR((address,address,uint24),int24,int24)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "computeMaxLeverage"
      | "findTicks"
      | "getActiveMarginPositions"
      | "getBinsDataInBulk"
      | "getBorrowedLiquidityInBin"
      | "getEstimatedPnl"
      | "getExpectedPremiumOwed"
      | "getIsBorrowable"
      | "getLiquidityInBin"
      | "getMarginPosition"
      | "getMaxWithdrawable"
      | "getMinMaxTicks"
      | "getOrder"
      | "getOrderInfo"
      | "getOrders"
      | "getPoolkeys"
      | "getPostInstantaneousRate"
      | "getPreInstantaeneousRate"
      | "getUtilAndAPR"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "computeMaxLeverage",
    values: [DataProvider.MaxLeverageParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "findTicks",
    values: [
      PoolKeyStruct,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getActiveMarginPositions",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getBinsDataInBulk",
    values: [
      PoolKeyStruct,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getBorrowedLiquidityInBin",
    values: [PoolKeyStruct, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getEstimatedPnl",
    values: [
      PoolKeyStruct,
      PromiseOrValue<string>,
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>,
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
    functionFragment: "getMinMaxTicks",
    values: [LiquidityLoanStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getOrder",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<boolean>,
      PromiseOrValue<boolean>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getOrderInfo",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<boolean>,
      PromiseOrValue<boolean>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getOrders",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getPoolkeys",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getPostInstantaneousRate",
    values: [PoolKeyStruct, PromiseOrValue<string>, PromiseOrValue<boolean>]
  ): string;
  encodeFunctionData(
    functionFragment: "getPreInstantaeneousRate",
    values: [PoolKeyStruct, LiquidityLoanStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getUtilAndAPR",
    values: [
      PoolKeyStruct,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "computeMaxLeverage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "findTicks", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getActiveMarginPositions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBinsDataInBulk",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBorrowedLiquidityInBin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getEstimatedPnl",
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
    functionFragment: "getMinMaxTicks",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getOrder", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getOrderInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getOrders", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getPoolkeys",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPostInstantaneousRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPreInstantaeneousRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUtilAndAPR",
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
    computeMaxLeverage(
      params: DataProvider.MaxLeverageParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    findTicks(
      key: PoolKeyStruct,
      margin: PromiseOrValue<BigNumberish>,
      borrowAmount: PromiseOrValue<BigNumberish>,
      positionIsToken0: PromiseOrValue<boolean>,
      simulatedOutput: PromiseOrValue<BigNumberish>,
      sqrtPriceX160: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber, LiquidityLoanStructOutput[]]>;

    getActiveMarginPositions(
      trader: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[DataProvider.MarginPositionInfoStructOutput[]]>;

    getBinsDataInBulk(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[DataProvider.BinDataStructOutput[]]>;

    getBorrowedLiquidityInBin(
      key: PoolKeyStruct,
      tick: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getEstimatedPnl(
      poolKey: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      reducePercentage: PromiseOrValue<BigNumberish>,
      fillerOutput: PromiseOrValue<BigNumberish>,
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

    getMinMaxTicks(
      borrowInfo: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<[number, number] & { min: number; max: number }>;

    getOrder(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      isAdd: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<[OrderStructOutput] & { order: OrderStructOutput }>;

    getOrderInfo(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      isAdd: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<
      [DataProvider.LimitOrderInfoStructOutput] & {
        order: DataProvider.LimitOrderInfoStructOutput;
      }
    >;

    getOrders(
      trader: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[DataProvider.LimitOrderInfoStructOutput[]]>;

    getPoolkeys(
      pool: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [string, string, number] & { token0: string; token1: string; fee: number }
    >;

    getPostInstantaneousRate(
      poolKey: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getPreInstantaeneousRate(
      poolKey: PoolKeyStruct,
      borrowInfo: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getUtilAndAPR(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { apr: BigNumber; utilTotal: BigNumber }
    >;
  };

  computeMaxLeverage(
    params: DataProvider.MaxLeverageParamsStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  findTicks(
    key: PoolKeyStruct,
    margin: PromiseOrValue<BigNumberish>,
    borrowAmount: PromiseOrValue<BigNumberish>,
    positionIsToken0: PromiseOrValue<boolean>,
    simulatedOutput: PromiseOrValue<BigNumberish>,
    sqrtPriceX160: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<[BigNumber, LiquidityLoanStructOutput[]]>;

  getActiveMarginPositions(
    trader: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<DataProvider.MarginPositionInfoStructOutput[]>;

  getBinsDataInBulk(
    key: PoolKeyStruct,
    tickLower: PromiseOrValue<BigNumberish>,
    tickUpper: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<DataProvider.BinDataStructOutput[]>;

  getBorrowedLiquidityInBin(
    key: PoolKeyStruct,
    tick: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getEstimatedPnl(
    poolKey: PoolKeyStruct,
    trader: PromiseOrValue<string>,
    positionIsToken0: PromiseOrValue<boolean>,
    reducePercentage: PromiseOrValue<BigNumberish>,
    fillerOutput: PromiseOrValue<BigNumberish>,
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

  getMinMaxTicks(
    borrowInfo: LiquidityLoanStruct[],
    overrides?: CallOverrides
  ): Promise<[number, number] & { min: number; max: number }>;

  getOrder(
    pool: PromiseOrValue<string>,
    trader: PromiseOrValue<string>,
    positionIsToken0: PromiseOrValue<boolean>,
    isAdd: PromiseOrValue<boolean>,
    overrides?: CallOverrides
  ): Promise<OrderStructOutput>;

  getOrderInfo(
    pool: PromiseOrValue<string>,
    trader: PromiseOrValue<string>,
    positionIsToken0: PromiseOrValue<boolean>,
    isAdd: PromiseOrValue<boolean>,
    overrides?: CallOverrides
  ): Promise<DataProvider.LimitOrderInfoStructOutput>;

  getOrders(
    trader: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<DataProvider.LimitOrderInfoStructOutput[]>;

  getPoolkeys(
    pool: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<
    [string, string, number] & { token0: string; token1: string; fee: number }
  >;

  getPostInstantaneousRate(
    poolKey: PoolKeyStruct,
    trader: PromiseOrValue<string>,
    positionIsToken0: PromiseOrValue<boolean>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getPreInstantaeneousRate(
    poolKey: PoolKeyStruct,
    borrowInfo: LiquidityLoanStruct[],
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getUtilAndAPR(
    key: PoolKeyStruct,
    tickLower: PromiseOrValue<BigNumberish>,
    tickUpper: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<[BigNumber, BigNumber] & { apr: BigNumber; utilTotal: BigNumber }>;

  callStatic: {
    computeMaxLeverage(
      params: DataProvider.MaxLeverageParamsStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    findTicks(
      key: PoolKeyStruct,
      margin: PromiseOrValue<BigNumberish>,
      borrowAmount: PromiseOrValue<BigNumberish>,
      positionIsToken0: PromiseOrValue<boolean>,
      simulatedOutput: PromiseOrValue<BigNumberish>,
      sqrtPriceX160: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber, LiquidityLoanStructOutput[]]>;

    getActiveMarginPositions(
      trader: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<DataProvider.MarginPositionInfoStructOutput[]>;

    getBinsDataInBulk(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<DataProvider.BinDataStructOutput[]>;

    getBorrowedLiquidityInBin(
      key: PoolKeyStruct,
      tick: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getEstimatedPnl(
      poolKey: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      reducePercentage: PromiseOrValue<BigNumberish>,
      fillerOutput: PromiseOrValue<BigNumberish>,
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

    getMinMaxTicks(
      borrowInfo: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<[number, number] & { min: number; max: number }>;

    getOrder(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      isAdd: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<OrderStructOutput>;

    getOrderInfo(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      isAdd: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<DataProvider.LimitOrderInfoStructOutput>;

    getOrders(
      trader: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<DataProvider.LimitOrderInfoStructOutput[]>;

    getPoolkeys(
      pool: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [string, string, number] & { token0: string; token1: string; fee: number }
    >;

    getPostInstantaneousRate(
      poolKey: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPreInstantaeneousRate(
      poolKey: PoolKeyStruct,
      borrowInfo: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getUtilAndAPR(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { apr: BigNumber; utilTotal: BigNumber }
    >;
  };

  filters: {};

  estimateGas: {
    computeMaxLeverage(
      params: DataProvider.MaxLeverageParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    findTicks(
      key: PoolKeyStruct,
      margin: PromiseOrValue<BigNumberish>,
      borrowAmount: PromiseOrValue<BigNumberish>,
      positionIsToken0: PromiseOrValue<boolean>,
      simulatedOutput: PromiseOrValue<BigNumberish>,
      sqrtPriceX160: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getActiveMarginPositions(
      trader: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getBinsDataInBulk(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getBorrowedLiquidityInBin(
      key: PoolKeyStruct,
      tick: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getEstimatedPnl(
      poolKey: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      reducePercentage: PromiseOrValue<BigNumberish>,
      fillerOutput: PromiseOrValue<BigNumberish>,
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

    getMinMaxTicks(
      borrowInfo: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getOrder(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      isAdd: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getOrderInfo(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      isAdd: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getOrders(
      trader: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPoolkeys(
      pool: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPostInstantaneousRate(
      poolKey: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPreInstantaeneousRate(
      poolKey: PoolKeyStruct,
      borrowInfo: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getUtilAndAPR(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    computeMaxLeverage(
      params: DataProvider.MaxLeverageParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    findTicks(
      key: PoolKeyStruct,
      margin: PromiseOrValue<BigNumberish>,
      borrowAmount: PromiseOrValue<BigNumberish>,
      positionIsToken0: PromiseOrValue<boolean>,
      simulatedOutput: PromiseOrValue<BigNumberish>,
      sqrtPriceX160: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getActiveMarginPositions(
      trader: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getBinsDataInBulk(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getBorrowedLiquidityInBin(
      key: PoolKeyStruct,
      tick: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getEstimatedPnl(
      poolKey: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      reducePercentage: PromiseOrValue<BigNumberish>,
      fillerOutput: PromiseOrValue<BigNumberish>,
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

    getMinMaxTicks(
      borrowInfo: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getOrder(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      isAdd: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getOrderInfo(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      isAdd: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getOrders(
      trader: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPoolkeys(
      pool: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPostInstantaneousRate(
      poolKey: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPreInstantaeneousRate(
      poolKey: PoolKeyStruct,
      borrowInfo: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getUtilAndAPR(
      key: PoolKeyStruct,
      tickLower: PromiseOrValue<BigNumberish>,
      tickUpper: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
