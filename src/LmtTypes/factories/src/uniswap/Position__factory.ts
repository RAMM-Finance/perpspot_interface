/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  Position,
  PositionInterface,
} from "../../../src/uniswap/Position";

const _abi = [
  {
    inputs: [],
    name: "NP",
    type: "error",
  },
] as const;

const _bytecode =
  "0x60566037600b82828239805160001a607314602a57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea264697066735822122000dbffc4c357a0c30bbe834f4ca26b38b2db7d631d2f497d2eacc5941b79807b64736f6c63430008120033";

type PositionConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PositionConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Position__factory extends ContractFactory {
  constructor(...args: PositionConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Position> {
    return super.deploy(overrides || {}) as Promise<Position>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Position {
    return super.attach(address) as Position;
  }
  override connect(signer: Signer): Position__factory {
    return super.connect(signer) as Position__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PositionInterface {
    return new utils.Interface(_abi) as PositionInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Position {
    return new Contract(address, _abi, signerOrProvider) as Position;
  }
}
