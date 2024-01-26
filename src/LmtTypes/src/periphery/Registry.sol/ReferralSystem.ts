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
} from "../../../common";

export interface ReferralSystemInterface extends utils.Interface {
  functions: {
    "codeOwners(bytes32)": FunctionFragment;
    "codeUsedAmount(bytes32)": FunctionFragment;
    "codeUsers(bytes32,uint256)": FunctionFragment;
    "codesByOwners(address,uint256)": FunctionFragment;
    "getMaxValues()": FunctionFragment;
    "getReferees(address)": FunctionFragment;
    "initialize()": FunctionFragment;
    "isAuth(address)": FunctionFragment;
    "numCodes(address)": FunctionFragment;
    "referralMultipliers(address)": FunctionFragment;
    "referrerTiers(address)": FunctionFragment;
    "registerCode(bytes32)": FunctionFragment;
    "registerCodeAdmin(bytes32,address)": FunctionFragment;
    "registerCodes(bytes32[])": FunctionFragment;
    "setHandler(address,bool)": FunctionFragment;
    "setMaxCode(uint256)": FunctionFragment;
    "setMaxValues(uint256,uint256)": FunctionFragment;
    "setReferralCode(address,bytes32)": FunctionFragment;
    "setReferralCodeByUser(bytes32)": FunctionFragment;
    "setReferralMultiplier(address,uint256)": FunctionFragment;
    "setTier(address,uint256)": FunctionFragment;
    "userReferralCodes(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "codeOwners"
      | "codeUsedAmount"
      | "codeUsers"
      | "codesByOwners"
      | "getMaxValues"
      | "getReferees"
      | "initialize"
      | "isAuth"
      | "numCodes"
      | "referralMultipliers"
      | "referrerTiers"
      | "registerCode"
      | "registerCodeAdmin"
      | "registerCodes"
      | "setHandler"
      | "setMaxCode"
      | "setMaxValues"
      | "setReferralCode"
      | "setReferralCodeByUser"
      | "setReferralMultiplier"
      | "setTier"
      | "userReferralCodes"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "codeOwners",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "codeUsedAmount",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "codeUsers",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "codesByOwners",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getMaxValues",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getReferees",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "isAuth",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "numCodes",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "referralMultipliers",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "referrerTiers",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "registerCode",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "registerCodeAdmin",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "registerCodes",
    values: [PromiseOrValue<BytesLike>[]]
  ): string;
  encodeFunctionData(
    functionFragment: "setHandler",
    values: [PromiseOrValue<string>, PromiseOrValue<boolean>]
  ): string;
  encodeFunctionData(
    functionFragment: "setMaxCode",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "setMaxValues",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "setReferralCode",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "setReferralCodeByUser",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "setReferralMultiplier",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "setTier",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "userReferralCodes",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(functionFragment: "codeOwners", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "codeUsedAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "codeUsers", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "codesByOwners",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMaxValues",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getReferees",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "isAuth", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "numCodes", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "referralMultipliers",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "referrerTiers",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerCode",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerCodeAdmin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerCodes",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setHandler", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setMaxCode", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setMaxValues",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setReferralCode",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setReferralCodeByUser",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setReferralMultiplier",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setTier", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "userReferralCodes",
    data: BytesLike
  ): Result;

  events: {
    "Initialized(uint8)": EventFragment;
    "RegisterCode(address,bytes32)": EventFragment;
    "SetReferralCode(address,bytes32)": EventFragment;
    "SetReferrerTier(address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RegisterCode"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SetReferralCode"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SetReferrerTier"): EventFragment;
}

export interface InitializedEventObject {
  version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface RegisterCodeEventObject {
  account: string;
  code: string;
}
export type RegisterCodeEvent = TypedEvent<
  [string, string],
  RegisterCodeEventObject
>;

export type RegisterCodeEventFilter = TypedEventFilter<RegisterCodeEvent>;

export interface SetReferralCodeEventObject {
  account: string;
  code: string;
}
export type SetReferralCodeEvent = TypedEvent<
  [string, string],
  SetReferralCodeEventObject
>;

export type SetReferralCodeEventFilter = TypedEventFilter<SetReferralCodeEvent>;

export interface SetReferrerTierEventObject {
  account: string;
  id: BigNumber;
}
export type SetReferrerTierEvent = TypedEvent<
  [string, BigNumber],
  SetReferrerTierEventObject
>;

export type SetReferrerTierEventFilter = TypedEventFilter<SetReferrerTierEvent>;

export interface ReferralSystem extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ReferralSystemInterface;

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
    codeOwners(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    codeUsedAmount(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    codeUsers(
      arg0: PromiseOrValue<BytesLike>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    codesByOwners(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getMaxValues(overrides?: CallOverrides): Promise<[BigNumber, BigNumber]>;

    getReferees(
      codeOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    initialize(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    isAuth(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    numCodes(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    referralMultipliers(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    referrerTiers(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    registerCode(
      _code: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    registerCodeAdmin(
      _code: PromiseOrValue<BytesLike>,
      who: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    registerCodes(
      _codes: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setHandler(
      _auth: PromiseOrValue<string>,
      _isActive: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setMaxCode(
      max: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setMaxValues(
      maxCode: PromiseOrValue<BigNumberish>,
      maxUsage: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setReferralCode(
      _account: PromiseOrValue<string>,
      _code: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setReferralCodeByUser(
      _code: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setReferralMultiplier(
      _referrer: PromiseOrValue<string>,
      _referralMultiplier: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setTier(
      _referrer: PromiseOrValue<string>,
      _tierId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    userReferralCodes(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;
  };

  codeOwners(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string>;

  codeUsedAmount(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  codeUsers(
    arg0: PromiseOrValue<BytesLike>,
    arg1: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  codesByOwners(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  getMaxValues(overrides?: CallOverrides): Promise<[BigNumber, BigNumber]>;

  getReferees(
    codeOwner: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string[]>;

  initialize(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  isAuth(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  numCodes(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  referralMultipliers(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  referrerTiers(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  registerCode(
    _code: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  registerCodeAdmin(
    _code: PromiseOrValue<BytesLike>,
    who: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  registerCodes(
    _codes: PromiseOrValue<BytesLike>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setHandler(
    _auth: PromiseOrValue<string>,
    _isActive: PromiseOrValue<boolean>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setMaxCode(
    max: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setMaxValues(
    maxCode: PromiseOrValue<BigNumberish>,
    maxUsage: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setReferralCode(
    _account: PromiseOrValue<string>,
    _code: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setReferralCodeByUser(
    _code: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setReferralMultiplier(
    _referrer: PromiseOrValue<string>,
    _referralMultiplier: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setTier(
    _referrer: PromiseOrValue<string>,
    _tierId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  userReferralCodes(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  callStatic: {
    codeOwners(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    codeUsedAmount(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    codeUsers(
      arg0: PromiseOrValue<BytesLike>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    codesByOwners(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    getMaxValues(overrides?: CallOverrides): Promise<[BigNumber, BigNumber]>;

    getReferees(
      codeOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string[]>;

    initialize(overrides?: CallOverrides): Promise<void>;

    isAuth(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    numCodes(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    referralMultipliers(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    referrerTiers(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    registerCode(
      _code: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    registerCodeAdmin(
      _code: PromiseOrValue<BytesLike>,
      who: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    registerCodes(
      _codes: PromiseOrValue<BytesLike>[],
      overrides?: CallOverrides
    ): Promise<void>;

    setHandler(
      _auth: PromiseOrValue<string>,
      _isActive: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<void>;

    setMaxCode(
      max: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setMaxValues(
      maxCode: PromiseOrValue<BigNumberish>,
      maxUsage: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setReferralCode(
      _account: PromiseOrValue<string>,
      _code: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    setReferralCodeByUser(
      _code: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    setReferralMultiplier(
      _referrer: PromiseOrValue<string>,
      _referralMultiplier: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setTier(
      _referrer: PromiseOrValue<string>,
      _tierId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    userReferralCodes(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {
    "Initialized(uint8)"(version?: null): InitializedEventFilter;
    Initialized(version?: null): InitializedEventFilter;

    "RegisterCode(address,bytes32)"(
      account?: null,
      code?: null
    ): RegisterCodeEventFilter;
    RegisterCode(account?: null, code?: null): RegisterCodeEventFilter;

    "SetReferralCode(address,bytes32)"(
      account?: null,
      code?: null
    ): SetReferralCodeEventFilter;
    SetReferralCode(account?: null, code?: null): SetReferralCodeEventFilter;

    "SetReferrerTier(address,uint256)"(
      account?: null,
      id?: null
    ): SetReferrerTierEventFilter;
    SetReferrerTier(account?: null, id?: null): SetReferrerTierEventFilter;
  };

  estimateGas: {
    codeOwners(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    codeUsedAmount(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    codeUsers(
      arg0: PromiseOrValue<BytesLike>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    codesByOwners(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getMaxValues(overrides?: CallOverrides): Promise<BigNumber>;

    getReferees(
      codeOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initialize(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    isAuth(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    numCodes(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    referralMultipliers(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    referrerTiers(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    registerCode(
      _code: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    registerCodeAdmin(
      _code: PromiseOrValue<BytesLike>,
      who: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    registerCodes(
      _codes: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setHandler(
      _auth: PromiseOrValue<string>,
      _isActive: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setMaxCode(
      max: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setMaxValues(
      maxCode: PromiseOrValue<BigNumberish>,
      maxUsage: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setReferralCode(
      _account: PromiseOrValue<string>,
      _code: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setReferralCodeByUser(
      _code: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setReferralMultiplier(
      _referrer: PromiseOrValue<string>,
      _referralMultiplier: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setTier(
      _referrer: PromiseOrValue<string>,
      _tierId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    userReferralCodes(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    codeOwners(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    codeUsedAmount(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    codeUsers(
      arg0: PromiseOrValue<BytesLike>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    codesByOwners(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getMaxValues(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getReferees(
      codeOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    initialize(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    isAuth(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    numCodes(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    referralMultipliers(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    referrerTiers(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    registerCode(
      _code: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    registerCodeAdmin(
      _code: PromiseOrValue<BytesLike>,
      who: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    registerCodes(
      _codes: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setHandler(
      _auth: PromiseOrValue<string>,
      _isActive: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setMaxCode(
      max: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setMaxValues(
      maxCode: PromiseOrValue<BigNumberish>,
      maxUsage: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setReferralCode(
      _account: PromiseOrValue<string>,
      _code: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setReferralCodeByUser(
      _code: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setReferralMultiplier(
      _referrer: PromiseOrValue<string>,
      _referralMultiplier: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setTier(
      _referrer: PromiseOrValue<string>,
      _tierId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    userReferralCodes(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
