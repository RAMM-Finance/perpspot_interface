/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type { Reclaimer, ReclaimerInterface } from "../../src/Reclaimer";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_marginFacility",
        type: "address",
      },
      {
        internalType: "address",
        name: "_poolManager",
        type: "address",
      },
      {
        internalType: "address",
        name: "_borrowFacility",
        type: "address",
      },
      {
        internalType: "address",
        name: "_executioner",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "token0",
            type: "address",
          },
          {
            internalType: "address",
            name: "token1",
            type: "address",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
        ],
        internalType: "struct PoolKey",
        name: "key",
        type: "tuple",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "bool",
        name: "positionIsToken0",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "positionIsBorrow",
        type: "bool",
      },
      {
        internalType: "contract ISwapper",
        name: "swapper",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "path",
        type: "bytes",
      },
    ],
    name: "reclaim",
    outputs: [
      {
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061063f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632bcda3381461003b578063f8c8765e14610067575b600080fd5b61004e6100493660046103c4565b6100c7565b6040805192835260208301919091520160405180910390f35b6100c561007536600461049b565b600080546001600160a01b039586166001600160a01b0319918216179091556002805494861694821694909417909355600180549285169284169290921790915560038054919093169116179055565b005b6000806100d26102b1565b6002546001600160a01b0316631698ee826100f060208d018d6104f7565b61010060408e0160208f016104f7565b8d6040016020810190610113919061051b565b6040516001600160e01b031960e086901b1681526001600160a01b03938416600482015292909116602483015262ffffff166044820152606401602060405180830381865afa15801561016a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061018e9190610540565b6001600160a01b03811660c08301526040516bffffffffffffffffffffffff19606092831b81166020830152918b901b909116603482015288151560f81b604882015260490160408051601f1981840301815291815281516020909201919091208083526002549151630ca32ed160e31b81526001600160a01b03909216916365197688916102239160040190815260200190565b602060405180830381865afa158015610240573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102649190610574565b60020b61012082015260405162461bcd60e51b8152602060048201526015602482015274506f736974696f6e206e6f7420636c6f7361626c6560581b604482015260640160405180910390fd5b604051806101c0016040528060008019168152602001600081526020016000815260200160008152602001600081526020016000815260200160006001600160a01b03168152602001600060020b8152602001600060020b8152602001600060020b8152602001600060020b815260200161038a60405180610120016040528060006001600160a01b03168152602001600015158152602001600015158152602001600081526020016000815260200160008152602001600063ffffffff168152602001600063ffffffff168152602001606081525090565b815260006020820181905260409091015290565b6001600160a01b03811681146103b357600080fd5b50565b80151581146103b357600080fd5b60008060008060008060008789036101008112156103e157600080fd5b60608112156103ef57600080fd5b5087965060608801356104018161039e565b95506080880135610411816103b6565b945060a0880135610421816103b6565b935060c08801356104318161039e565b925060e088013567ffffffffffffffff8082111561044e57600080fd5b818a0191508a601f83011261046257600080fd5b81358181111561047157600080fd5b8b602082850101111561048357600080fd5b60208301945080935050505092959891949750929550565b600080600080608085870312156104b157600080fd5b84356104bc8161039e565b935060208501356104cc8161039e565b925060408501356104dc8161039e565b915060608501356104ec8161039e565b939692955090935050565b60006020828403121561050957600080fd5b81356105148161039e565b9392505050565b60006020828403121561052d57600080fd5b813562ffffff8116811461051457600080fd5b60006020828403121561055257600080fd5b81516105148161039e565b8051600281900b811461056f57600080fd5b919050565b60006020828403121561058657600080fd5b6105148261055d565b828110156105fc578151805160020b8552868101516fffffffffffffffffffffffffffffffff16878601528581015186860152606080820151908601526080808201519086015260a0808201519086015260c0908101519085015260e0909301929085019060010161058f565b509197965050505050505056fea2646970667358221220deee593bf66a2a06bf021b88d21964ac02e47106116ac5581fa2703a3d7b566a64736f6c63430008120033";

type ReclaimerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ReclaimerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Reclaimer__factory extends ContractFactory {
  constructor(...args: ReclaimerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Reclaimer> {
    return super.deploy(overrides || {}) as Promise<Reclaimer>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Reclaimer {
    return super.attach(address) as Reclaimer;
  }
  override connect(signer: Signer): Reclaimer__factory {
    return super.connect(signer) as Reclaimer__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ReclaimerInterface {
    return new utils.Interface(_abi) as ReclaimerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Reclaimer {
    return new Contract(address, _abi, signerOrProvider) as Reclaimer;
  }
}
