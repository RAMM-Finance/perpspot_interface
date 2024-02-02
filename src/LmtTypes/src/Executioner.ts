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
} from "../common";

export interface ExecutionerInterface extends utils.Interface {
  functions: {
    "executeFiller(address,bool,uint256,uint256,address,address)": FunctionFragment;
    "executeUniswapWithMinOutput(address,bool,int256,address,address,uint256)": FunctionFragment;
    "marginFacility()": FunctionFragment;
    "owner()": FunctionFragment;
    "poolManager()": FunctionFragment;
    "setContracts(address,address)": FunctionFragment;
    "uniswapV3SwapCallback(int256,int256,bytes)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "executeFiller"
      | "executeUniswapWithMinOutput"
      | "marginFacility"
      | "owner"
      | "poolManager"
      | "setContracts"
      | "uniswapV3SwapCallback"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "executeFiller",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "executeUniswapWithMinOutput",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "marginFacility",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "poolManager",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setContracts",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "uniswapV3SwapCallback",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "executeFiller",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeUniswapWithMinOutput",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "marginFacility",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "poolManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setContracts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "uniswapV3SwapCallback",
    data: BytesLike
  ): Result;

  events: {};
}

export interface Executioner extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ExecutionerInterface;

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
    executeFiller(
      filler: PromiseOrValue<string>,
      outIsToken0: PromiseOrValue<boolean>,
      outputAmount: PromiseOrValue<BigNumberish>,
      inputAmount: PromiseOrValue<BigNumberish>,
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    executeUniswapWithMinOutput(
      pool: PromiseOrValue<string>,
      down: PromiseOrValue<boolean>,
      swapIn: PromiseOrValue<BigNumberish>,
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      minOutput: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    marginFacility(overrides?: CallOverrides): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    poolManager(overrides?: CallOverrides): Promise<[string]>;

    setContracts(
      _marginFacility: PromiseOrValue<string>,
      _poolManager: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    uniswapV3SwapCallback(
      amount0Delta: PromiseOrValue<BigNumberish>,
      amount1Delta: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  executeFiller(
    filler: PromiseOrValue<string>,
    outIsToken0: PromiseOrValue<boolean>,
    outputAmount: PromiseOrValue<BigNumberish>,
    inputAmount: PromiseOrValue<BigNumberish>,
    token0: PromiseOrValue<string>,
    token1: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  executeUniswapWithMinOutput(
    pool: PromiseOrValue<string>,
    down: PromiseOrValue<boolean>,
    swapIn: PromiseOrValue<BigNumberish>,
    token0: PromiseOrValue<string>,
    token1: PromiseOrValue<string>,
    minOutput: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  marginFacility(overrides?: CallOverrides): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  poolManager(overrides?: CallOverrides): Promise<string>;

  setContracts(
    _marginFacility: PromiseOrValue<string>,
    _poolManager: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  uniswapV3SwapCallback(
    amount0Delta: PromiseOrValue<BigNumberish>,
    amount1Delta: PromiseOrValue<BigNumberish>,
    data: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    executeFiller(
      filler: PromiseOrValue<string>,
      outIsToken0: PromiseOrValue<boolean>,
      outputAmount: PromiseOrValue<BigNumberish>,
      inputAmount: PromiseOrValue<BigNumberish>,
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { amount0: BigNumber; amount1: BigNumber }
    >;

    executeUniswapWithMinOutput(
      pool: PromiseOrValue<string>,
      down: PromiseOrValue<boolean>,
      swapIn: PromiseOrValue<BigNumberish>,
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      minOutput: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { amount0: BigNumber; amount1: BigNumber }
    >;

    marginFacility(overrides?: CallOverrides): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    poolManager(overrides?: CallOverrides): Promise<string>;

    setContracts(
      _marginFacility: PromiseOrValue<string>,
      _poolManager: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    uniswapV3SwapCallback(
      amount0Delta: PromiseOrValue<BigNumberish>,
      amount1Delta: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    executeFiller(
      filler: PromiseOrValue<string>,
      outIsToken0: PromiseOrValue<boolean>,
      outputAmount: PromiseOrValue<BigNumberish>,
      inputAmount: PromiseOrValue<BigNumberish>,
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    executeUniswapWithMinOutput(
      pool: PromiseOrValue<string>,
      down: PromiseOrValue<boolean>,
      swapIn: PromiseOrValue<BigNumberish>,
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      minOutput: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    marginFacility(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    poolManager(overrides?: CallOverrides): Promise<BigNumber>;

    setContracts(
      _marginFacility: PromiseOrValue<string>,
      _poolManager: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    uniswapV3SwapCallback(
      amount0Delta: PromiseOrValue<BigNumberish>,
      amount1Delta: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    executeFiller(
      filler: PromiseOrValue<string>,
      outIsToken0: PromiseOrValue<boolean>,
      outputAmount: PromiseOrValue<BigNumberish>,
      inputAmount: PromiseOrValue<BigNumberish>,
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    executeUniswapWithMinOutput(
      pool: PromiseOrValue<string>,
      down: PromiseOrValue<boolean>,
      swapIn: PromiseOrValue<BigNumberish>,
      token0: PromiseOrValue<string>,
      token1: PromiseOrValue<string>,
      minOutput: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    marginFacility(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    poolManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setContracts(
      _marginFacility: PromiseOrValue<string>,
      _poolManager: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    uniswapV3SwapCallback(
      amount0Delta: PromiseOrValue<BigNumberish>,
      amount1Delta: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
