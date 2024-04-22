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

export declare namespace Quoter {
  export type AprUtilInfoStruct = {
    key: PoolKeyStruct;
    apr: PromiseOrValue<BigNumberish>;
    utilTotal: PromiseOrValue<BigNumberish>;
  };

  export type AprUtilInfoStructOutput = [
    PoolKeyStructOutput,
    BigNumber,
    BigNumber
  ] & { key: PoolKeyStructOutput; apr: BigNumber; utilTotal: BigNumber };

  export type PoolInfoStruct = {
    token0: PromiseOrValue<string>;
    token1: PromiseOrValue<string>;
    symbol0: PromiseOrValue<string>;
    symbol1: PromiseOrValue<string>;
    fee: PromiseOrValue<BigNumberish>;
    name0: PromiseOrValue<string>;
    name1: PromiseOrValue<string>;
    decimals0: PromiseOrValue<BigNumberish>;
    decimals1: PromiseOrValue<BigNumberish>;
    tick: PromiseOrValue<BigNumberish>;
  };

  export type PoolInfoStructOutput = [
    string,
    string,
    string,
    string,
    number,
    string,
    string,
    number,
    number,
    number
  ] & {
    token0: string;
    token1: string;
    symbol0: string;
    symbol1: string;
    fee: number;
    name0: string;
    name1: string;
    decimals0: number;
    decimals1: number;
    tick: number;
  };

  export type QuoteExactInputParamsStruct = {
    poolKey: PoolKeyStruct;
    isToken0: PromiseOrValue<boolean>;
    marginInInput: PromiseOrValue<BigNumberish>;
    marginInOutput: PromiseOrValue<BigNumberish>;
    borrowAmount: PromiseOrValue<BigNumberish>;
    quoter: PromiseOrValue<string>;
    marginInPosToken: PromiseOrValue<boolean>;
  };

  export type QuoteExactInputParamsStructOutput = [
    PoolKeyStructOutput,
    boolean,
    BigNumber,
    BigNumber,
    BigNumber,
    string,
    boolean
  ] & {
    poolKey: PoolKeyStructOutput;
    isToken0: boolean;
    marginInInput: BigNumber;
    marginInOutput: BigNumber;
    borrowAmount: BigNumber;
    quoter: string;
    marginInPosToken: boolean;
  };
}

export interface QuoterInterface extends utils.Interface {
  functions: {
    "getAllAprUtil(int24)": FunctionFragment;
    "getPoolKeys()": FunctionFragment;
    "quoteExactInput(((address,address,uint24),bool,uint256,uint256,uint256,address,bool))": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "getAllAprUtil" | "getPoolKeys" | "quoteExactInput"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getAllAprUtil",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getPoolKeys",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "quoteExactInput",
    values: [Quoter.QuoteExactInputParamsStruct]
  ): string;

  decodeFunctionResult(
    functionFragment: "getAllAprUtil",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPoolKeys",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "quoteExactInput",
    data: BytesLike
  ): Result;

  events: {};
}

export interface Quoter extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: QuoterInterface;

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
    getAllAprUtil(
      tickDiff: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[Quoter.AprUtilInfoStructOutput[]]>;

    getPoolKeys(
      overrides?: CallOverrides
    ): Promise<[Quoter.PoolInfoStructOutput[]]>;

    quoteExactInput(
      params: Quoter.QuoteExactInputParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  getAllAprUtil(
    tickDiff: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<Quoter.AprUtilInfoStructOutput[]>;

  getPoolKeys(
    overrides?: CallOverrides
  ): Promise<Quoter.PoolInfoStructOutput[]>;

  quoteExactInput(
    params: Quoter.QuoteExactInputParamsStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    getAllAprUtil(
      tickDiff: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<Quoter.AprUtilInfoStructOutput[]>;

    getPoolKeys(
      overrides?: CallOverrides
    ): Promise<Quoter.PoolInfoStructOutput[]>;

    quoteExactInput(
      params: Quoter.QuoteExactInputParamsStruct,
      overrides?: CallOverrides
    ): Promise<
      [
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        LiquidityLoanStructOutput[]
      ] & {
        swapInput: BigNumber;
        positionOutput: BigNumber;
        borrowRate: BigNumber;
        feeAmount: BigNumber;
        avgPrice: BigNumber;
        borrowInfo: LiquidityLoanStructOutput[];
      }
    >;
  };

  filters: {};

  estimateGas: {
    getAllAprUtil(
      tickDiff: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPoolKeys(overrides?: CallOverrides): Promise<BigNumber>;

    quoteExactInput(
      params: Quoter.QuoteExactInputParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getAllAprUtil(
      tickDiff: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPoolKeys(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    quoteExactInput(
      params: Quoter.QuoteExactInputParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
