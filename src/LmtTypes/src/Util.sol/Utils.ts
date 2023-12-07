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

export interface UtilsInterface extends utils.Interface {
  functions: {
    "applySlippageX96(uint160,uint256,bool)": FunctionFragment;
    "getAmountsRequired((int24,uint128,uint256,uint256,uint256,uint256)[],uint256,int24,int24,uint160)": FunctionFragment;
    "getFilledAmount((int24,uint128,uint256,uint256,uint256,uint256)[],bool,int24)": FunctionFragment;
    "getMinMaxTicks((int24,uint128,uint256,uint256,uint256,uint256)[])": FunctionFragment;
    "getRangeConditions((int24,uint128,uint256,uint256,uint256,uint256)[],bool,int24,int24)": FunctionFragment;
    "getRepayInfo((int24,uint128,uint256,uint256,uint256,uint256)[],uint256)": FunctionFragment;
    "mergeLiquidityLoans((int24,uint128,uint256,uint256,uint256,uint256)[],(int24,uint128,uint256,uint256,uint256,uint256)[])": FunctionFragment;
    "rangeConditions(bool,int24,int24,int24,int24)": FunctionFragment;
    "roundTick(int24,bool,int24)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "applySlippageX96"
      | "getAmountsRequired"
      | "getFilledAmount"
      | "getMinMaxTicks"
      | "getRangeConditions"
      | "getRepayInfo"
      | "mergeLiquidityLoans"
      | "rangeConditions"
      | "roundTick"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "applySlippageX96",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<boolean>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getAmountsRequired",
    values: [
      LiquidityLoanStruct[],
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getFilledAmount",
    values: [
      LiquidityLoanStruct[],
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getMinMaxTicks",
    values: [LiquidityLoanStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getRangeConditions",
    values: [
      LiquidityLoanStruct[],
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getRepayInfo",
    values: [LiquidityLoanStruct[], PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "mergeLiquidityLoans",
    values: [LiquidityLoanStruct[], LiquidityLoanStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "rangeConditions",
    values: [
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "roundTick",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "applySlippageX96",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAmountsRequired",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getFilledAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMinMaxTicks",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRangeConditions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRepayInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "mergeLiquidityLoans",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "rangeConditions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "roundTick", data: BytesLike): Result;

  events: {};
}

export interface Utils extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: UtilsInterface;

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
    applySlippageX96(
      price: PromiseOrValue<BigNumberish>,
      maxSlippage: PromiseOrValue<BigNumberish>,
      down: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getAmountsRequired(
      borrowInfo: LiquidityLoanStruct[],
      percentageClosed: PromiseOrValue<BigNumberish>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      tick: PromiseOrValue<BigNumberish>,
      sqrtPriceX96: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        amount0Required: BigNumber;
        amount1Required: BigNumber;
      }
    >;

    getFilledAmount(
      borrowInfo: LiquidityLoanStruct[],
      getToken0: PromiseOrValue<boolean>,
      tickSpacing: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { filledAmount: BigNumber }>;

    getMinMaxTicks(
      borrowInfo: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<[number, number] & { min: number; max: number }>;

    getRangeConditions(
      borrowInfo: LiquidityLoanStruct[],
      positionIsToken0: PromiseOrValue<boolean>,
      curTick: PromiseOrValue<BigNumberish>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getRepayInfo(
      borrowInfo: LiquidityLoanStruct[],
      reducePercentage: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[LiquidityLoanStructOutput[]]>;

    mergeLiquidityLoans(
      loans1: LiquidityLoanStruct[],
      loans2: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<[LiquidityLoanStructOutput[]]>;

    rangeConditions(
      positionIsToken0: PromiseOrValue<boolean>,
      curTick: PromiseOrValue<BigNumberish>,
      maxTick: PromiseOrValue<BigNumberish>,
      minTick: PromiseOrValue<BigNumberish>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    roundTick(
      tick: PromiseOrValue<BigNumberish>,
      down: PromiseOrValue<boolean>,
      tickSpacing: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[number]>;
  };

  applySlippageX96(
    price: PromiseOrValue<BigNumberish>,
    maxSlippage: PromiseOrValue<BigNumberish>,
    down: PromiseOrValue<boolean>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getAmountsRequired(
    borrowInfo: LiquidityLoanStruct[],
    percentageClosed: PromiseOrValue<BigNumberish>,
    tickDiscretization: PromiseOrValue<BigNumberish>,
    tick: PromiseOrValue<BigNumberish>,
    sqrtPriceX96: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & {
      amount0Required: BigNumber;
      amount1Required: BigNumber;
    }
  >;

  getFilledAmount(
    borrowInfo: LiquidityLoanStruct[],
    getToken0: PromiseOrValue<boolean>,
    tickSpacing: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getMinMaxTicks(
    borrowInfo: LiquidityLoanStruct[],
    overrides?: CallOverrides
  ): Promise<[number, number] & { min: number; max: number }>;

  getRangeConditions(
    borrowInfo: LiquidityLoanStruct[],
    positionIsToken0: PromiseOrValue<boolean>,
    curTick: PromiseOrValue<BigNumberish>,
    tickDiscretization: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getRepayInfo(
    borrowInfo: LiquidityLoanStruct[],
    reducePercentage: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<LiquidityLoanStructOutput[]>;

  mergeLiquidityLoans(
    loans1: LiquidityLoanStruct[],
    loans2: LiquidityLoanStruct[],
    overrides?: CallOverrides
  ): Promise<LiquidityLoanStructOutput[]>;

  rangeConditions(
    positionIsToken0: PromiseOrValue<boolean>,
    curTick: PromiseOrValue<BigNumberish>,
    maxTick: PromiseOrValue<BigNumberish>,
    minTick: PromiseOrValue<BigNumberish>,
    tickDiscretization: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  roundTick(
    tick: PromiseOrValue<BigNumberish>,
    down: PromiseOrValue<boolean>,
    tickSpacing: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<number>;

  callStatic: {
    applySlippageX96(
      price: PromiseOrValue<BigNumberish>,
      maxSlippage: PromiseOrValue<BigNumberish>,
      down: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAmountsRequired(
      borrowInfo: LiquidityLoanStruct[],
      percentageClosed: PromiseOrValue<BigNumberish>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      tick: PromiseOrValue<BigNumberish>,
      sqrtPriceX96: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        amount0Required: BigNumber;
        amount1Required: BigNumber;
      }
    >;

    getFilledAmount(
      borrowInfo: LiquidityLoanStruct[],
      getToken0: PromiseOrValue<boolean>,
      tickSpacing: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getMinMaxTicks(
      borrowInfo: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<[number, number] & { min: number; max: number }>;

    getRangeConditions(
      borrowInfo: LiquidityLoanStruct[],
      positionIsToken0: PromiseOrValue<boolean>,
      curTick: PromiseOrValue<BigNumberish>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRepayInfo(
      borrowInfo: LiquidityLoanStruct[],
      reducePercentage: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<LiquidityLoanStructOutput[]>;

    mergeLiquidityLoans(
      loans1: LiquidityLoanStruct[],
      loans2: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<LiquidityLoanStructOutput[]>;

    rangeConditions(
      positionIsToken0: PromiseOrValue<boolean>,
      curTick: PromiseOrValue<BigNumberish>,
      maxTick: PromiseOrValue<BigNumberish>,
      minTick: PromiseOrValue<BigNumberish>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    roundTick(
      tick: PromiseOrValue<BigNumberish>,
      down: PromiseOrValue<boolean>,
      tickSpacing: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<number>;
  };

  filters: {};

  estimateGas: {
    applySlippageX96(
      price: PromiseOrValue<BigNumberish>,
      maxSlippage: PromiseOrValue<BigNumberish>,
      down: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAmountsRequired(
      borrowInfo: LiquidityLoanStruct[],
      percentageClosed: PromiseOrValue<BigNumberish>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      tick: PromiseOrValue<BigNumberish>,
      sqrtPriceX96: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getFilledAmount(
      borrowInfo: LiquidityLoanStruct[],
      getToken0: PromiseOrValue<boolean>,
      tickSpacing: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getMinMaxTicks(
      borrowInfo: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRangeConditions(
      borrowInfo: LiquidityLoanStruct[],
      positionIsToken0: PromiseOrValue<boolean>,
      curTick: PromiseOrValue<BigNumberish>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRepayInfo(
      borrowInfo: LiquidityLoanStruct[],
      reducePercentage: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    mergeLiquidityLoans(
      loans1: LiquidityLoanStruct[],
      loans2: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    rangeConditions(
      positionIsToken0: PromiseOrValue<boolean>,
      curTick: PromiseOrValue<BigNumberish>,
      maxTick: PromiseOrValue<BigNumberish>,
      minTick: PromiseOrValue<BigNumberish>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    roundTick(
      tick: PromiseOrValue<BigNumberish>,
      down: PromiseOrValue<boolean>,
      tickSpacing: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    applySlippageX96(
      price: PromiseOrValue<BigNumberish>,
      maxSlippage: PromiseOrValue<BigNumberish>,
      down: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAmountsRequired(
      borrowInfo: LiquidityLoanStruct[],
      percentageClosed: PromiseOrValue<BigNumberish>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      tick: PromiseOrValue<BigNumberish>,
      sqrtPriceX96: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getFilledAmount(
      borrowInfo: LiquidityLoanStruct[],
      getToken0: PromiseOrValue<boolean>,
      tickSpacing: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getMinMaxTicks(
      borrowInfo: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getRangeConditions(
      borrowInfo: LiquidityLoanStruct[],
      positionIsToken0: PromiseOrValue<boolean>,
      curTick: PromiseOrValue<BigNumberish>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getRepayInfo(
      borrowInfo: LiquidityLoanStruct[],
      reducePercentage: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    mergeLiquidityLoans(
      loans1: LiquidityLoanStruct[],
      loans2: LiquidityLoanStruct[],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    rangeConditions(
      positionIsToken0: PromiseOrValue<boolean>,
      curTick: PromiseOrValue<BigNumberish>,
      maxTick: PromiseOrValue<BigNumberish>,
      minTick: PromiseOrValue<BigNumberish>,
      tickDiscretization: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    roundTick(
      tick: PromiseOrValue<BigNumberish>,
      down: PromiseOrValue<boolean>,
      tickSpacing: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
