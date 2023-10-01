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
  "0x608060405234801561001057600080fd5b50610cd6806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632bcda3381461003b578063f8c8765e14610067575b600080fd5b61004e610049366004610699565b6100c7565b6040805192835260208301919091520160405180910390f35b6100c5610075366004610770565b600080546001600160a01b039586166001600160a01b0319918216179091556002805494861694821694909417909355600180549285169284169290921790915560038054919093169116179055565b005b6000806100d2610586565b6002546001600160a01b0316631698ee826100f060208d018d6107cc565b61010060408e0160208f016107cc565b8d604001602081019061011391906107e9565b6040516001600160e01b031960e086901b1681526001600160a01b03938416600482015292909116602483015262ffffff166044820152606401602060405180830381865afa15801561016a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061018e919061081e565b6001600160a01b03811660c08301526040516bffffffffffffffffffffffff19606092831b81166020830152918b901b909116603482015288151560f81b604882015260490160408051601f1981840301815291815281516020909201919091208083526002549151630ca32ed160e31b81526001600160a01b03909216916365197688916102239160040190815260200190565b602060405180830381865afa158015610240573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610264919061084d565b60020b6101208201528051610278906104c9565b6102c05760405162461bcd60e51b8152602060048201526015602482015274506f736974696f6e206e6f7420636c6f7361626c6560581b604482015260640160405180910390fd5b8661034b57600054815160405163514ea4bf60e01b81526001600160a01b039092169163514ea4bf916102f99160040190815260200190565b600060405180830381865afa158015610316573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261033e9190810190610a0e565b5060208301526101608201525b80610160015160800151816040018181525050806101600151606001518160600181815250508060c001516001600160a01b0316633850c7bd6040518163ffffffff1660e01b815260040160e060405180830381865afa1580156103b3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103d79190610b18565b5050505060029190910b60e0840152506001600160a01b031660a082015261016081015161010001516040516337a6142160e01b815273__$d23a8dd93b7205fa6b646ffed38c165d68$__916337a61421916104369190600401610bad565b6040805180830381865af4158015610452573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104769190610c3b565b600290810b6101408401520b6101008201528661049e576000546001600160a01b03166104ab565b6001546001600160a01b03165b6001600160a01b03166101a090910152909890975095505050505050565b6000805460405163514ea4bf60e01b81526004810184905282916001600160a01b03169063514ea4bf90602401600060405180830381865afa158015610513573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261053b9190810190610a0e565b5050905060008160c0015163ffffffff161180156105715750428160e00151620151806105689190610c6e565b63ffffffff1610155b801561057f57508060200151155b9392505050565b604051806101c0016040528060008019168152602001600081526020016000815260200160008152602001600081526020016000815260200160006001600160a01b03168152602001600060020b8152602001600060020b8152602001600060020b8152602001600060020b815260200161065f60405180610120016040528060006001600160a01b03168152602001600015158152602001600015158152602001600081526020016000815260200160008152602001600063ffffffff168152602001600063ffffffff168152602001606081525090565b815260006020820181905260409091015290565b6001600160a01b038116811461068857600080fd5b50565b801515811461068857600080fd5b60008060008060008060008789036101008112156106b657600080fd5b60608112156106c457600080fd5b5087965060608801356106d681610673565b955060808801356106e68161068b565b945060a08801356106f68161068b565b935060c088013561070681610673565b925060e088013567ffffffffffffffff8082111561072357600080fd5b818a0191508a601f83011261073757600080fd5b81358181111561074657600080fd5b8b602082850101111561075857600080fd5b60208301945080935050505092959891949750929550565b6000806000806080858703121561078657600080fd5b843561079181610673565b935060208501356107a181610673565b925060408501356107b181610673565b915060608501356107c181610673565b939692955090935050565b6000602082840312156107de57600080fd5b813561057f81610673565b6000602082840312156107fb57600080fd5b813562ffffff8116811461057f57600080fd5b805161081981610673565b919050565b60006020828403121561083057600080fd5b815161057f81610673565b8051600281900b811461081957600080fd5b60006020828403121561085f57600080fd5b61057f8261083b565b634e487b7160e01b600052604160045260246000fd5b60405160e0810167ffffffffffffffff811182821017156108a1576108a1610868565b60405290565b604051610120810167ffffffffffffffff811182821017156108a1576108a1610868565b604051601f8201601f1916810167ffffffffffffffff811182821017156108f4576108f4610868565b604052919050565b80516108198161068b565b805163ffffffff8116811461081957600080fd5b600082601f83011261092c57600080fd5b8151602067ffffffffffffffff82111561094857610948610868565b610956818360051b016108cb565b82815260e0928302850182019282820191908785111561097557600080fd5b8387015b85811015610a015781818a0312156109915760008081fd5b61099961087e565b6109a28261083b565b8152858201516001600160801b03811681146109be5760008081fd5b8187015260408281015190820152606080830151908201526080808301519082015260a0808301519082015260c080830151908201528452928401928101610979565b5090979650505050505050565b600080600060608486031215610a2357600080fd5b835167ffffffffffffffff80821115610a3b57600080fd5b908501906101208288031215610a5057600080fd5b610a586108a7565b610a618361080e565b8152610a6f602084016108fc565b6020820152610a80604084016108fc565b6040820152606083015160608201526080830151608082015260a083015160a0820152610aaf60c08401610907565b60c0820152610ac060e08401610907565b60e08201526101008084015183811115610ad957600080fd5b610ae58a82870161091b565b82840152505080955050505060208401519150604084015190509250925092565b805161ffff8116811461081957600080fd5b600080600080600080600060e0888a031215610b3357600080fd5b8751610b3e81610673565b9650610b4c6020890161083b565b9550610b5a60408901610b06565b9450610b6860608901610b06565b9350610b7660808901610b06565b925060a088015160ff81168114610b8c57600080fd5b60c0890151909250610b9d8161068b565b8091505092959891949750929550565b602080825282518282018190526000919060409081850190868401855b82811015610c2e578151805160020b8552868101516001600160801b0316878601528581015186860152606080820151908601526080808201519086015260a0808201519086015260c0908101519085015260e09093019290850190600101610bca565b5091979650505050505050565b60008060408385031215610c4e57600080fd5b610c578361083b565b9150610c656020840161083b565b90509250929050565b63ffffffff818116838216019080821115610c9957634e487b7160e01b600052601160045260246000fd5b509291505056fea2646970667358221220aa6a2b5e5011e5f175e0d36b52c8cc3998c615e1c1d069e7dddf7218f849610864736f6c63430008120033";

type ReclaimerConstructorParams =
  | [linkLibraryAddresses: ReclaimerLibraryAddresses, signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ReclaimerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => {
  return (
    typeof xs[0] === "string" ||
    (Array.isArray as (arg: any) => arg is readonly any[])(xs[0]) ||
    "_isInterface" in xs[0]
  );
};

export class Reclaimer__factory extends ContractFactory {
  constructor(...args: ReclaimerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      const [linkLibraryAddresses, signer] = args;
      super(
        _abi,
        Reclaimer__factory.linkBytecode(linkLibraryAddresses),
        signer
      );
    }
  }

  static linkBytecode(linkLibraryAddresses: ReclaimerLibraryAddresses): string {
    let linkedBytecode = _bytecode;

    linkedBytecode = linkedBytecode.replace(
      new RegExp("__\\$d23a8dd93b7205fa6b646ffed38c165d68\\$__", "g"),
      linkLibraryAddresses["src/Util.sol:Utils"]
        .replace(/^0x/, "")
        .toLowerCase()
    );

    return linkedBytecode;
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

export interface ReclaimerLibraryAddresses {
  ["src/Util.sol:Utils"]: string;
}
