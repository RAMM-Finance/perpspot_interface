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
  lastPremiumPaymentTime: PromiseOrValue<BigNumberish>;
  openTime: PromiseOrValue<BigNumberish>;
  borrowInfo: LiquidityLoanStruct[];
};

export type PositionStructOutput = [
  string,
  boolean,
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
  lastPremiumPaymentTime: number;
  openTime: number;
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

export interface FacilityInterface extends utils.Interface {
  functions: {
    "PremiumDeposit(bytes32)": FunctionFragment;
    "approveTokens(address,address)": FunctionFragment;
    "canForceClose(((address,bool,uint256,uint256,uint32,uint32,(int24,uint128,uint256,uint256,uint256,uint256)[]),uint256,uint256))": FunctionFragment;
    "checkPositionExists(address,address,bool)": FunctionFragment;
    "checkPremiumCondition(address,address,bool,uint256)": FunctionFragment;
    "depositPremium((address,address,uint24),address,bool,uint256)": FunctionFragment;
    "executioner()": FunctionFragment;
    "getBorrowInfo(address,address,bool)": FunctionFragment;
    "getLastRepayTime(address,address,bool)": FunctionFragment;
    "maxWithdrawablePremium((address,address,uint24),address,bool)": FunctionFragment;
    "multicall(bytes[])": FunctionFragment;
    "payPremium((address,address,uint24),bool,uint256)": FunctionFragment;
    "setAddPaused(bool)": FunctionFragment;
    "setForceClosePaused(bool)": FunctionFragment;
    "setOwner(address)": FunctionFragment;
    "setReducePaused(bool)": FunctionFragment;
    "withdrawPremium((address,address,uint24),bool,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "PremiumDeposit"
      | "approveTokens"
      | "canForceClose"
      | "checkPositionExists"
      | "checkPremiumCondition"
      | "depositPremium"
      | "executioner"
      | "getBorrowInfo"
      | "getLastRepayTime"
      | "maxWithdrawablePremium"
      | "multicall"
      | "payPremium"
      | "setAddPaused"
      | "setForceClosePaused"
      | "setOwner"
      | "setReducePaused"
      | "withdrawPremium"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "PremiumDeposit",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "approveTokens",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "canForceClose",
    values: [MarginPositionStruct]
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
    functionFragment: "checkPremiumCondition",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>
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
    functionFragment: "maxWithdrawablePremium",
    values: [PoolKeyStruct, PromiseOrValue<string>, PromiseOrValue<boolean>]
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
    functionFragment: "setAddPaused",
    values: [PromiseOrValue<boolean>]
  ): string;
  encodeFunctionData(
    functionFragment: "setForceClosePaused",
    values: [PromiseOrValue<boolean>]
  ): string;
  encodeFunctionData(
    functionFragment: "setOwner",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setReducePaused",
    values: [PromiseOrValue<boolean>]
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
    functionFragment: "PremiumDeposit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "approveTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "canForceClose",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "checkPositionExists",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "checkPremiumCondition",
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
  decodeFunctionResult(
    functionFragment: "maxWithdrawablePremium",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "multicall", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "payPremium", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setAddPaused",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setForceClosePaused",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setOwner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setReducePaused",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawPremium",
    data: BytesLike
  ): Result;

  events: {
    "PremiumDeposited(address,address,bool,uint256)": EventFragment;
    "PremiumWithdrawn(address,address,bool,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "PremiumDeposited"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PremiumWithdrawn"): EventFragment;
}

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

    approveTokens(
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    canForceClose(
      position: MarginPositionStruct,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    checkPositionExists(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    checkPremiumCondition(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      minPremiumDepositPercentage: PromiseOrValue<BigNumberish>,
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

    maxWithdrawablePremium(
      key: PoolKeyStruct,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

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

    setAddPaused(
      addPaused: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setForceClosePaused(
      forceClosePaused: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setReducePaused(
      reducePaused: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    withdrawPremium(
      key: PoolKeyStruct,
      borrowToken1: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  PremiumDeposit(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  approveTokens(
    token0: PromiseOrValue<string>,
    token1: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  canForceClose(
    position: MarginPositionStruct,
    overrides?: CallOverrides
  ): Promise<boolean>;

  checkPositionExists(
    pool: PromiseOrValue<string>,
    borrower: PromiseOrValue<string>,
    borrowedToken1: PromiseOrValue<boolean>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  checkPremiumCondition(
    pool: PromiseOrValue<string>,
    borrower: PromiseOrValue<string>,
    borrowedToken1: PromiseOrValue<boolean>,
    minPremiumDepositPercentage: PromiseOrValue<BigNumberish>,
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

  maxWithdrawablePremium(
    key: PoolKeyStruct,
    borrower: PromiseOrValue<string>,
    borrowedToken1: PromiseOrValue<boolean>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

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

  setAddPaused(
    addPaused: PromiseOrValue<boolean>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setForceClosePaused(
    forceClosePaused: PromiseOrValue<boolean>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setOwner(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setReducePaused(
    reducePaused: PromiseOrValue<boolean>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  withdrawPremium(
    key: PoolKeyStruct,
    borrowToken1: PromiseOrValue<boolean>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    PremiumDeposit(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    approveTokens(
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    canForceClose(
      position: MarginPositionStruct,
      overrides?: CallOverrides
    ): Promise<boolean>;

    checkPositionExists(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    checkPremiumCondition(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      minPremiumDepositPercentage: PromiseOrValue<BigNumberish>,
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

    maxWithdrawablePremium(
      key: PoolKeyStruct,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

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

    setAddPaused(
      addPaused: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<void>;

    setForceClosePaused(
      forceClosePaused: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<void>;

    setOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setReducePaused(
      reducePaused: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawPremium(
      key: PoolKeyStruct,
      borrowToken1: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
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

    approveTokens(
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    canForceClose(
      position: MarginPositionStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    checkPositionExists(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    checkPremiumCondition(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      minPremiumDepositPercentage: PromiseOrValue<BigNumberish>,
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

    maxWithdrawablePremium(
      key: PoolKeyStruct,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
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

    setAddPaused(
      addPaused: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setForceClosePaused(
      forceClosePaused: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setReducePaused(
      reducePaused: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    withdrawPremium(
      key: PoolKeyStruct,
      borrowToken1: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    PremiumDeposit(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    approveTokens(
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    canForceClose(
      position: MarginPositionStruct,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    checkPositionExists(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    checkPremiumCondition(
      pool: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
      minPremiumDepositPercentage: PromiseOrValue<BigNumberish>,
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

    maxWithdrawablePremium(
      key: PoolKeyStruct,
      borrower: PromiseOrValue<string>,
      borrowedToken1: PromiseOrValue<boolean>,
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

    setAddPaused(
      addPaused: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setForceClosePaused(
      forceClosePaused: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setReducePaused(
      reducePaused: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    withdrawPremium(
      key: PoolKeyStruct,
      borrowToken1: PromiseOrValue<boolean>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
