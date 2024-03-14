/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { Tick, TickInterface } from "../../../src/uniswap/Tick";

const _abi = [
  {
    inputs: [],
    name: "LO",
    type: "error",
  },
] as const;

const _bytecode =
  "0x60566037600b82828239805160001a607314602a57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea264697066735822122023954c77d08cbd7c883202a4c29e3e32e75808679d1f16b8130c392827b80faf64736f6c63430008120033";

type TickConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TickConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Tick__factory extends ContractFactory {
  constructor(...args: TickConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Tick> {
    return super.deploy(overrides || {}) as Promise<Tick>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Tick {
    return super.attach(address) as Tick;
  }
  override connect(signer: Signer): Tick__factory {
    return super.connect(signer) as Tick__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TickInterface {
    return new utils.Interface(_abi) as TickInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Tick {
    return new Contract(address, _abi, signerOrProvider) as Tick;
  }
}
