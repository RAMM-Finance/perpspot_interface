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
  LiquidityLoanStructOutput[]
] & {
  pool: string;
  isToken0: boolean;
  totalDebtOutput: BigNumber;
  totalDebtInput: BigNumber;
  recentPremium: BigNumber;
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

export interface IFacilityInterface extends utils.Interface {
  functions: {
    "canForceClose(((address,bool,uint256,uint256,uint256,uint32,uint32,(int24,uint128,uint256,uint256,uint256,uint256)[]),uint256,uint256))": FunctionFragment;
    "depositPremium((address,address,uint24),address,bool,uint256)": FunctionFragment;
    "maxWithdrawablePremium(bytes32)": FunctionFragment;
    "payPremium((address,address,uint24),bool,uint256)": FunctionFragment;
    "withdrawPremium((address,address,uint24),bool,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "canForceClose"
      | "depositPremium"
      | "maxWithdrawablePremium"
      | "payPremium"
      | "withdrawPremium"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "canForceClose",
    values: [MarginPositionStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "depositPremium",
    values: [
      PoolKeyStruct,
      PromiseOrValue<string>,
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "maxWithdrawablePremium",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "payPremium",
    values: [
      PoolKeyStruct,
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawPremium",
    values: [
      PoolKeyStruct,
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "canForceClose",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "depositPremium",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "maxWithdrawablePremium",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "payPremium", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawPremium",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IFacility extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IFacilityInterface;

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
    canForceClose(
      position: MarginPositionStruct,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    depositPremium(
      key: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      isToken0: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    maxWithdrawablePremium(
      positionId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    payPremium(
      key: PoolKeyStruct,
      payToken1: PromiseOrValue<boolean>,
      depositAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    withdrawPremium(
      key: PoolKeyStruct,
      isToken0: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  canForceClose(
    position: MarginPositionStruct,
    overrides?: CallOverrides
  ): Promise<boolean>;

  depositPremium(
    key: PoolKeyStruct,
    trader: PromiseOrValue<string>,
    isToken0: PromiseOrValue<boolean>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  maxWithdrawablePremium(
    positionId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  payPremium(
    key: PoolKeyStruct,
    payToken1: PromiseOrValue<boolean>,
    depositAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  withdrawPremium(
    key: PoolKeyStruct,
    isToken0: PromiseOrValue<boolean>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    canForceClose(
      position: MarginPositionStruct,
      overrides?: CallOverrides
    ): Promise<boolean>;

    depositPremium(
      key: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      isToken0: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    maxWithdrawablePremium(
      positionId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    payPremium(
      key: PoolKeyStruct,
      payToken1: PromiseOrValue<boolean>,
      depositAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdrawPremium(
      key: PoolKeyStruct,
      isToken0: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    canForceClose(
      position: MarginPositionStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    depositPremium(
      key: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      isToken0: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    maxWithdrawablePremium(
      positionId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    payPremium(
      key: PoolKeyStruct,
      payToken1: PromiseOrValue<boolean>,
      depositAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    withdrawPremium(
      key: PoolKeyStruct,
      isToken0: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    canForceClose(
      position: MarginPositionStruct,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    depositPremium(
      key: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      isToken0: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    maxWithdrawablePremium(
      positionId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    payPremium(
      key: PoolKeyStruct,
      payToken1: PromiseOrValue<boolean>,
      depositAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    withdrawPremium(
      key: PoolKeyStruct,
      isToken0: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
