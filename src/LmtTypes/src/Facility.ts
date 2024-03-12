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

export interface FacilityInterface extends utils.Interface {
  functions: {
    "PremiumDeposit(bytes32)": FunctionFragment;
    "_initialize(address,address)": FunctionFragment;
    "approveTokens(address,address)": FunctionFragment;
    "checkPositionExists(address,address,bool)": FunctionFragment;
    "depositPremium((address,address,uint24),address,bool,uint256)": FunctionFragment;
    "executioner()": FunctionFragment;
    "getBorrowInfo(address,address,bool)": FunctionFragment;
    "getLastRepayTime(address,address,bool)": FunctionFragment;
    "getOrderId(address,address,bool,bool)": FunctionFragment;
    "getPositionId(address,address,bool)": FunctionFragment;
    "multicall(bytes[])": FunctionFragment;
    "payPremium((address,address,uint24),bool,uint256)": FunctionFragment;
    "setOwner(address)": FunctionFragment;
    "setProtocolContracts(address,address)": FunctionFragment;
    "swapAndDepositPremium((address,address,uint24),address,bool,uint256,uint256)": FunctionFragment;
    "withdrawPremium((address,address,uint24),bool,uint256,bool)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "PremiumDeposit"
      | "_initialize"
      | "approveTokens"
      | "checkPositionExists"
      | "depositPremium"
      | "executioner"
      | "getBorrowInfo"
      | "getLastRepayTime"
      | "getOrderId"
      | "getPositionId"
      | "multicall"
      | "payPremium"
      | "setOwner"
      | "setProtocolContracts"
      | "swapAndDepositPremium"
      | "withdrawPremium"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "PremiumDeposit",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "_initialize",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "approveTokens",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "checkPositionExists",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<boolean>
    ]
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
    functionFragment: "executioner",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getBorrowInfo",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<boolean>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getLastRepayTime",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<boolean>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getOrderId",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<boolean>,
      PromiseOrValue<boolean>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getPositionId",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<boolean>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "multicall",
    values: [PromiseOrValue<BytesLike>[]]
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
    functionFragment: "setOwner",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setProtocolContracts",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "swapAndDepositPremium",
    values: [
      PoolKeyStruct,
      PromiseOrValue<string>,
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawPremium",
    values: [
      PoolKeyStruct,
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<boolean>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "PremiumDeposit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_initialize",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "approveTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "checkPositionExists",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "depositPremium",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executioner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBorrowInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLastRepayTime",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getOrderId", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getPositionId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "multicall", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "payPremium", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setOwner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setProtocolContracts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "swapAndDepositPremium",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawPremium",
    data: BytesLike
  ): Result;

  events: {
    "Initialized(uint8)": EventFragment;
    "PremiumDeposited(address,address,bool,uint256)": EventFragment;
    "PremiumWithdrawn(address,address,bool,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PremiumDeposited"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PremiumWithdrawn"): EventFragment;
}

export interface InitializedEventObject {
  version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface PremiumDepositedEventObject {
  payer: string;
  pool: string;
  isToken1: boolean;
  amount: BigNumber;
}
export type PremiumDepositedEvent = TypedEvent<
  [string, string, boolean, BigNumber],
  PremiumDepositedEventObject
>;

export type PremiumDepositedEventFilter =
  TypedEventFilter<PremiumDepositedEvent>;

export interface PremiumWithdrawnEventObject {
  withdrawer: string;
  pool: string;
  isToken1: boolean;
  amount: BigNumber;
}
export type PremiumWithdrawnEvent = TypedEvent<
  [string, string, boolean, BigNumber],
  PremiumWithdrawnEventObject
>;

export type PremiumWithdrawnEventFilter =
  TypedEventFilter<PremiumWithdrawnEvent>;

export interface Facility extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: FacilityInterface;

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
    PremiumDeposit(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    _initialize(
      pm: PromiseOrValue<string>,
      ex: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    approveTokens(
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    checkPositionExists(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    depositPremium(
      key: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      borrowToken1: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    executioner(overrides?: CallOverrides): Promise<[string]>;

    getBorrowInfo(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<[LiquidityLoanStructOutput[]]>;

    getLastRepayTime(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<[number]>;

    getOrderId(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      isAdd: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getPositionId(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    multicall(
      data: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    payPremium(
      key: PoolKeyStruct,
      payToken1: PromiseOrValue<boolean>,
      depositAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setProtocolContracts(
      poolManager_: PromiseOrValue<string>,
      executioner_: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    swapAndDepositPremium(
      key: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      borrowToken1: PromiseOrValue<boolean>,
      toSwapAmount: PromiseOrValue<BigNumberish>,
      minOutput: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    withdrawPremium(
      key: PoolKeyStruct,
      borrowToken1: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      isClose: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  PremiumDeposit(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  _initialize(
    pm: PromiseOrValue<string>,
    ex: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  approveTokens(
    token0: PromiseOrValue<string>,
    token1: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  checkPositionExists(
    pool: PromiseOrValue<string>,
    borrower: PromiseOrValue<string>,
    borrowedToken1: PromiseOrValue<boolean>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  depositPremium(
    key: PoolKeyStruct,
    trader: PromiseOrValue<string>,
    borrowToken1: PromiseOrValue<boolean>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  executioner(overrides?: CallOverrides): Promise<string>;

  getBorrowInfo(
    pool: PromiseOrValue<string>,
    borrower: PromiseOrValue<string>,
    borrowedToken1: PromiseOrValue<boolean>,
    overrides?: CallOverrides
  ): Promise<LiquidityLoanStructOutput[]>;

  getLastRepayTime(
    pool: PromiseOrValue<string>,
    borrower: PromiseOrValue<string>,
    borrowedToken1: PromiseOrValue<boolean>,
    overrides?: CallOverrides
  ): Promise<number>;

  getOrderId(
    pool: PromiseOrValue<string>,
    trader: PromiseOrValue<string>,
    positionIsToken0: PromiseOrValue<boolean>,
    isAdd: PromiseOrValue<boolean>,
    overrides?: CallOverrides
  ): Promise<string>;

  getPositionId(
    pool: PromiseOrValue<string>,
    trader: PromiseOrValue<string>,
    positionIsToken0: PromiseOrValue<boolean>,
    overrides?: CallOverrides
  ): Promise<string>;

  multicall(
    data: PromiseOrValue<BytesLike>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  payPremium(
    key: PoolKeyStruct,
    payToken1: PromiseOrValue<boolean>,
    depositAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setOwner(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setProtocolContracts(
    poolManager_: PromiseOrValue<string>,
    executioner_: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  swapAndDepositPremium(
    key: PoolKeyStruct,
    trader: PromiseOrValue<string>,
    borrowToken1: PromiseOrValue<boolean>,
    toSwapAmount: PromiseOrValue<BigNumberish>,
    minOutput: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  withdrawPremium(
    key: PoolKeyStruct,
    borrowToken1: PromiseOrValue<boolean>,
    amount: PromiseOrValue<BigNumberish>,
    isClose: PromiseOrValue<boolean>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    PremiumDeposit(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    _initialize(
      pm: PromiseOrValue<string>,
      ex: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    approveTokens(
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    checkPositionExists(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    depositPremium(
      key: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      borrowToken1: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    executioner(overrides?: CallOverrides): Promise<string>;

    getBorrowInfo(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<LiquidityLoanStructOutput[]>;

    getLastRepayTime(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<number>;

    getOrderId(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      isAdd: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<string>;

    getPositionId(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<string>;

    multicall(
      data: PromiseOrValue<BytesLike>[],
      overrides?: CallOverrides
    ): Promise<string[]>;

    payPremium(
      key: PoolKeyStruct,
      payToken1: PromiseOrValue<boolean>,
      depositAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setProtocolContracts(
      poolManager_: PromiseOrValue<string>,
      executioner_: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    swapAndDepositPremium(
      key: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      borrowToken1: PromiseOrValue<boolean>,
      toSwapAmount: PromiseOrValue<BigNumberish>,
      minOutput: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawPremium(
      key: PoolKeyStruct,
      borrowToken1: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      isClose: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "Initialized(uint8)"(version?: null): InitializedEventFilter;
    Initialized(version?: null): InitializedEventFilter;

    "PremiumDeposited(address,address,bool,uint256)"(
      payer?: PromiseOrValue<string> | null,
      pool?: PromiseOrValue<string> | null,
      isToken1?: null,
      amount?: null
    ): PremiumDepositedEventFilter;
    PremiumDeposited(
      payer?: PromiseOrValue<string> | null,
      pool?: PromiseOrValue<string> | null,
      isToken1?: null,
      amount?: null
    ): PremiumDepositedEventFilter;

    "PremiumWithdrawn(address,address,bool,uint256)"(
      withdrawer?: PromiseOrValue<string> | null,
      pool?: PromiseOrValue<string> | null,
      isToken1?: null,
      amount?: null
    ): PremiumWithdrawnEventFilter;
    PremiumWithdrawn(
      withdrawer?: PromiseOrValue<string> | null,
      pool?: PromiseOrValue<string> | null,
      isToken1?: null,
      amount?: null
    ): PremiumWithdrawnEventFilter;
  };

  estimateGas: {
    PremiumDeposit(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    _initialize(
      pm: PromiseOrValue<string>,
      ex: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    approveTokens(
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    checkPositionExists(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    depositPremium(
      key: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      borrowToken1: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    executioner(overrides?: CallOverrides): Promise<BigNumber>;

    getBorrowInfo(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getLastRepayTime(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getOrderId(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      isAdd: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPositionId(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    multicall(
      data: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    payPremium(
      key: PoolKeyStruct,
      payToken1: PromiseOrValue<boolean>,
      depositAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setProtocolContracts(
      poolManager_: PromiseOrValue<string>,
      executioner_: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    swapAndDepositPremium(
      key: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      borrowToken1: PromiseOrValue<boolean>,
      toSwapAmount: PromiseOrValue<BigNumberish>,
      minOutput: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    withdrawPremium(
      key: PoolKeyStruct,
      borrowToken1: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      isClose: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    PremiumDeposit(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    _initialize(
      pm: PromiseOrValue<string>,
      ex: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    approveTokens(
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    checkPositionExists(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    depositPremium(
      key: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      borrowToken1: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    executioner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getBorrowInfo(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getLastRepayTime(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getOrderId(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      isAdd: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPositionId(
      pool: PromiseOrValue<string>,
      trader: PromiseOrValue<string>,
      positionIsToken0: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    multicall(
      data: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    payPremium(
      key: PoolKeyStruct,
      payToken1: PromiseOrValue<boolean>,
      depositAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setProtocolContracts(
      poolManager_: PromiseOrValue<string>,
      executioner_: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    swapAndDepositPremium(
      key: PoolKeyStruct,
      trader: PromiseOrValue<string>,
      borrowToken1: PromiseOrValue<boolean>,
      toSwapAmount: PromiseOrValue<BigNumberish>,
      minOutput: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    withdrawPremium(
      key: PoolKeyStruct,
      borrowToken1: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      isClose: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
