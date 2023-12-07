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

export type PositionStruct = {
  pool: PromiseOrValue<string>;
  isToken0: PromiseOrValue<boolean>;
  totalDebtOutput: PromiseOrValue<BigNumberish>;
  totalDebtInput: PromiseOrValue<BigNumberish>;
  recentPremium: PromiseOrValue<BigNumberish>;
  lastPremiumPaymentTime: PromiseOrValue<BigNumberish>;
  openTime: PromiseOrValue<BigNumberish>;
  repayTime: PromiseOrValue<BigNumberish>;
  borrowInfo: LiquidityLoanStruct[];
};

export type PositionStructOutput = [
  string,
  boolean,
  BigNumber,
  BigNumber,
  BigNumber,
  number,
  number,
  number,
  LiquidityLoanStructOutput[]
] & {
  pool: string;
  isToken0: boolean;
  totalDebtOutput: BigNumber;
  totalDebtInput: BigNumber;
  recentPremium: BigNumber;
  lastPremiumPaymentTime: number;
  openTime: number;
  repayTime: number;
  borrowInfo: LiquidityLoanStructOutput[];
};

export type MarginPositionStruct = {
  base: PositionStruct;
  totalPosition: PromiseOrValue<BigNumberish>;
  margin: PromiseOrValue<BigNumberish>;
};

export type MarginPositionStructOutput = [
  PositionStructOutput,
  BigNumber,
  BigNumber
] & { base: PositionStructOutput; totalPosition: BigNumber; margin: BigNumber };

export declare namespace IDataProvider {
  export type PremiumDepositStruct = {
    token: PromiseOrValue<string>;
    amount: PromiseOrValue<BigNumberish>;
  };

  export type PremiumDepositStructOutput = [string, BigNumber] & {
    token: string;
    amount: BigNumber;
  };
}

export interface IDataProviderInterface extends utils.Interface {
  functions: {
    "getActiveMarginPositions(address)": FunctionFragment;
    "getPremiumDeposits(address,address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "getActiveMarginPositions" | "getPremiumDeposits"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getActiveMarginPositions",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getPremiumDeposits",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(
    functionFragment: "getActiveMarginPositions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPremiumDeposits",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IDataProvider extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IDataProviderInterface;

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
    ): Promise<[MarginPositionStructOutput[]]>;

    getPremiumDeposits(
      trader: PromiseOrValue<string>,
      facility: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[IDataProvider.PremiumDepositStructOutput[]]>;
  };

  getActiveMarginPositions(
    trader: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<MarginPositionStructOutput[]>;

  getPremiumDeposits(
    trader: PromiseOrValue<string>,
    facility: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<IDataProvider.PremiumDepositStructOutput[]>;

  callStatic: {
    getActiveMarginPositions(
      trader: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<MarginPositionStructOutput[]>;

    getPremiumDeposits(
      trader: PromiseOrValue<string>,
      facility: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<IDataProvider.PremiumDepositStructOutput[]>;
  };

  filters: {};

  estimateGas: {
    getActiveMarginPositions(
      trader: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPremiumDeposits(
      trader: PromiseOrValue<string>,
      facility: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getActiveMarginPositions(
      trader: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPremiumDeposits(
      trader: PromiseOrValue<string>,
      facility: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
