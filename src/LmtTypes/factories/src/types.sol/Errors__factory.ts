/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { Errors, ErrorsInterface } from "../../../src/types.sol/Errors";

const _abi = [
  {
    inputs: [],
    name: "addReduceInvalidTick",
    type: "error",
  },
  {
    inputs: [],
    name: "cantForceClose",
    type: "error",
  },
  {
    inputs: [],
    name: "exceedMaxWithdrawablePremium",
    type: "error",
  },
  {
    inputs: [],
    name: "incorrectBorrow",
    type: "error",
  },
  {
    inputs: [],
    name: "incorrectReduce",
    type: "error",
  },
  {
    inputs: [],
    name: "insolventAMM",
    type: "error",
  },
  {
    inputs: [],
    name: "insolventMarginFacility",
    type: "error",
  },
  {
    inputs: [],
    name: "insufficientPremiumDeposit",
    type: "error",
  },
  {
    inputs: [],
    name: "noOrder",
    type: "error",
  },
  {
    inputs: [],
    name: "noPosition",
    type: "error",
  },
  {
    inputs: [],
    name: "notEnoughPremiumDeposit",
    type: "error",
  },
  {
    inputs: [],
    name: "onlyFiller",
    type: "error",
  },
  {
    inputs: [],
    name: "orderExpired",
    type: "error",
  },
  {
    inputs: [],
    name: "orderOpen",
    type: "error",
  },
  {
    inputs: [],
    name: "wrongAmountRepay",
    type: "error",
  },
  {
    inputs: [],
    name: "wrongExecution",
    type: "error",
  },
  {
    inputs: [],
    name: "wrongTokenRepay",
    type: "error",
  },
] as const;

const _bytecode =
  "0x60566037600b82828239805160001a607314602a57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea264697066735822122069ba247e1180301a55de92b197d2876f379e37213a870d02449ba4074393fd9b64736f6c63430008120033";

type ErrorsConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ErrorsConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Errors__factory extends ContractFactory {
  constructor(...args: ErrorsConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Errors> {
    return super.deploy(overrides || {}) as Promise<Errors>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Errors {
    return super.attach(address) as Errors;
  }
  override connect(signer: Signer): Errors__factory {
    return super.connect(signer) as Errors__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ErrorsInterface {
    return new utils.Interface(_abi) as ErrorsInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Errors {
    return new Contract(address, _abi, signerOrProvider) as Errors;
  }
}
