/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  DelegateCall,
  DelegateCallInterface,
} from "../../../src/utils/DelegateCall";

const _abi = [
  {
    inputs: [],
    name: "LowLevelDelegateCallFailed",
    type: "error",
  },
] as const;

const _bytecode =
  "0x60566037600b82828239805160001a607314602a57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea26469706673582212200fcde1ead5d559688640a82abfff4165f5a255e4bdc9a08a8cd82c38545b6b2464736f6c63430008120033";

type DelegateCallConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DelegateCallConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DelegateCall__factory extends ContractFactory {
  constructor(...args: DelegateCallConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<DelegateCall> {
    return super.deploy(overrides || {}) as Promise<DelegateCall>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): DelegateCall {
    return super.attach(address) as DelegateCall;
  }
  override connect(signer: Signer): DelegateCall__factory {
    return super.connect(signer) as DelegateCall__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DelegateCallInterface {
    return new utils.Interface(_abi) as DelegateCallInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DelegateCall {
    return new Contract(address, _abi, signerOrProvider) as DelegateCall;
  }
}
