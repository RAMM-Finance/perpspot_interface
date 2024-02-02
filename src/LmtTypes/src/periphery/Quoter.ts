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

export declare namespace Quoter {
  export type QuoteExactInputParamsStruct = {
    poolKey: PoolKeyStruct;
    isToken0: PromiseOrValue<boolean>;
    margin: PromiseOrValue<BigNumberish>;
    borrowAmount: PromiseOrValue<BigNumberish>;
    quoter: PromiseOrValue<string>;
  };

  export type QuoteExactInputParamsStructOutput = [
    PoolKeyStructOutput,
    boolean,
    BigNumber,
    BigNumber,
    string
  ] & {
    poolKey: PoolKeyStructOutput;
    isToken0: boolean;
    margin: BigNumber;
    borrowAmount: BigNumber;
    quoter: string;
  };
}

export interface QuoterInterface extends utils.Interface {
  functions: {
    "quoteExactInput(((address,address,uint24),bool,uint256,uint256,address))": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "quoteExactInput"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "quoteExactInput",
    values: [Quoter.QuoteExactInputParamsStruct]
  ): string;

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
    quoteExactInput(
      params: Quoter.QuoteExactInputParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  quoteExactInput(
    params: Quoter.QuoteExactInputParamsStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
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
    quoteExactInput(
      params: Quoter.QuoteExactInputParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    quoteExactInput(
      params: Quoter.QuoteExactInputParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
