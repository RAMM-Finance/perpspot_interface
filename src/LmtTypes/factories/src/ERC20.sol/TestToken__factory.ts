/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  TestToken,
  TestTokenInterface,
} from "../../../src/ERC20.sol/TestToken";

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_symbol",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "dec",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "who",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "faucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "nonces",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60e06040523480156200001157600080fd5b5060405162001022380380620010228339810160408190526200003491620001db565b8282826000620000458482620002ef565b506001620000548382620002ef565b5060ff81166080524660a0526200006a6200007a565b60c0525062000439945050505050565b60007f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f6000604051620000ae9190620003bb565b6040805191829003822060208301939093528101919091527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608201524660808201523060a082015260c00160405160208183030381529060405280519060200120905090565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126200013e57600080fd5b81516001600160401b03808211156200015b576200015b62000116565b604051601f8301601f19908116603f0116810190828211818310171562000186576200018662000116565b81604052838152602092508683858801011115620001a357600080fd5b600091505b83821015620001c75785820183015181830184015290820190620001a8565b600093810190920192909252949350505050565b600080600060608486031215620001f157600080fd5b83516001600160401b03808211156200020957600080fd5b62000217878388016200012c565b945060208601519150808211156200022e57600080fd5b506200023d868287016200012c565b925050604084015160ff811681146200025557600080fd5b809150509250925092565b600181811c908216806200027557607f821691505b6020821081036200029657634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115620002ea57600081815260208120601f850160051c81016020861015620002c55750805b601f850160051c820191505b81811015620002e657828155600101620002d1565b5050505b505050565b81516001600160401b038111156200030b576200030b62000116565b62000323816200031c845462000260565b846200029c565b602080601f8311600181146200035b5760008415620003425750858301515b600019600386901b1c1916600185901b178555620002e6565b600085815260208120601f198616915b828110156200038c578886015182559484019460019091019084016200036b565b5085821015620003ab5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b6000808354620003cb8162000260565b60018281168015620003e65760018114620003fc576200042d565b60ff19841687528215158302870194506200042d565b8760005260208060002060005b85811015620004245781548a82015290840190820162000409565b50505082870194505b50929695505050505050565b60805160a05160c051610bb96200046960003960006104c20152600061048d015260006101440152610bb96000f3fe608060405234801561001057600080fd5b50600436106100cf5760003560e01c806370a082311161008c57806395d89b411161006657806395d89b41146101d5578063a9059cbb146101dd578063d505accf146101f0578063dd62ed3e1461020357600080fd5b806370a08231146101805780637b56c2b2146101a05780637ecebe00146101b557600080fd5b806306fdde03146100d4578063095ea7b3146100f257806318160ddd1461011557806323b872dd1461012c578063313ce5671461013f5780633644e51514610178575b600080fd5b6100dc61022e565b6040516100e991906108f1565b60405180910390f35b61010561010036600461095b565b6102bc565b60405190151581526020016100e9565b61011e60025481565b6040519081526020016100e9565b61010561013a366004610985565b610329565b6101667f000000000000000000000000000000000000000000000000000000000000000081565b60405160ff90911681526020016100e9565b61011e610489565b61011e61018e3660046109c1565b60036020526000908152604090205481565b6101b36101ae36600461095b565b6104e4565b005b61011e6101c33660046109c1565b60056020526000908152604090205481565b6100dc6104f2565b6101056101eb36600461095b565b6104ff565b6101b36101fe3660046109e3565b6105a8565b61011e610211366004610a56565b600460209081526000928352604080842090915290825290205481565b6000805461023b90610a89565b80601f016020809104026020016040519081016040528092919081815260200182805461026790610a89565b80156102b45780601f10610289576101008083540402835291602001916102b4565b820191906000526020600020905b81548152906001019060200180831161029757829003601f168201915b505050505081565b3360008181526004602090815260408083206001600160a01b038716808552925280832085905551919290917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925906103179086815260200190565b60405180910390a35060015b92915050565b6001600160a01b0383166000908152600360205260408120548211156103815760405162461bcd60e51b81526020600482015260086024820152672162616c616e636560c01b60448201526064015b60405180910390fd5b6001600160a01b0384166000908152600460209081526040808320338452909152902054828110156103e25760405162461bcd60e51b815260206004820152600a60248201526921616c6c6f77616e636560b01b6044820152606401610378565b6000198114610414576001600160a01b0385166000908152600460209081526040808320338452909152902083820390555b6001600160a01b03808616600081815260036020526040808220805488900390559287168082529083902080548701905591517fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef906104769087815260200190565b60405180910390a3506001949350505050565b60007f000000000000000000000000000000000000000000000000000000000000000046146104bf576104ba6107ec565b905090565b507f000000000000000000000000000000000000000000000000000000000000000090565b6104ee8282610886565b5050565b6001805461023b90610a89565b336000908152600360205260408120548211156105495760405162461bcd60e51b81526020600482015260086024820152672162616c616e636560c01b6044820152606401610378565b336000818152600360209081526040808320805487900390556001600160a01b03871680845292819020805487019055518581529192917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9101610317565b428410156105f85760405162461bcd60e51b815260206004820152601760248201527f5045524d49545f444541444c494e455f455850495245440000000000000000006044820152606401610378565b60006001610604610489565b6001600160a01b038a811660008181526005602090815260409182902080546001810190915582517f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c98184015280840194909452938d166060840152608083018c905260a083019390935260c08083018b90528151808403909101815260e08301909152805192019190912061190160f01b6101008301526101028201929092526101228101919091526101420160408051601f198184030181528282528051602091820120600084529083018083525260ff871690820152606081018590526080810184905260a0016020604051602081039080840390855afa158015610710573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b038116158015906107465750876001600160a01b0316816001600160a01b0316145b6107835760405162461bcd60e51b815260206004820152600e60248201526d24a72b20a624a22fa9a4a3a722a960911b6044820152606401610378565b6001600160a01b0390811660009081526004602090815260408083208a8516808552908352928190208990555188815291928a16917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a350505050505050565b60007f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f600060405161081e9190610ac3565b6040805191829003822060208301939093528101919091527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608201524660808201523060a082015260c00160405160208183030381529060405280519060200120905090565b80600260008282546108989190610b62565b90915550506001600160a01b0382166000818152600360209081526040808320805486019055518481527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a35050565b600060208083528351808285015260005b8181101561091e57858101830151858201604001528201610902565b506000604082860101526040601f19601f8301168501019250505092915050565b80356001600160a01b038116811461095657600080fd5b919050565b6000806040838503121561096e57600080fd5b6109778361093f565b946020939093013593505050565b60008060006060848603121561099a57600080fd5b6109a38461093f565b92506109b16020850161093f565b9150604084013590509250925092565b6000602082840312156109d357600080fd5b6109dc8261093f565b9392505050565b600080600080600080600060e0888a0312156109fe57600080fd5b610a078861093f565b9650610a156020890161093f565b95506040880135945060608801359350608088013560ff81168114610a3957600080fd5b9699959850939692959460a0840135945060c09093013592915050565b60008060408385031215610a6957600080fd5b610a728361093f565b9150610a806020840161093f565b90509250929050565b600181811c90821680610a9d57607f821691505b602082108103610abd57634e487b7160e01b600052602260045260246000fd5b50919050565b600080835481600182811c915080831680610adf57607f831692505b60208084108203610afe57634e487b7160e01b86526022600452602486fd5b818015610b125760018114610b2757610b54565b60ff1986168952841515850289019650610b54565b60008a81526020902060005b86811015610b4c5781548b820152908501908301610b33565b505084890196505b509498975050505050505050565b8082018082111561032357634e487b7160e01b600052601160045260246000fdfea2646970667358221220278d8af94d5a2a6fccaf84ef5e97886f28e6d308982ea397c9e06bab40400e6164736f6c63430008120033";

type TestTokenConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TestTokenConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TestToken__factory extends ContractFactory {
  constructor(...args: TestTokenConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _name: PromiseOrValue<string>,
    _symbol: PromiseOrValue<string>,
    dec: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<TestToken> {
    return super.deploy(
      _name,
      _symbol,
      dec,
      overrides || {}
    ) as Promise<TestToken>;
  }
  override getDeployTransaction(
    _name: PromiseOrValue<string>,
    _symbol: PromiseOrValue<string>,
    dec: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_name, _symbol, dec, overrides || {});
  }
  override attach(address: string): TestToken {
    return super.attach(address) as TestToken;
  }
  override connect(signer: Signer): TestToken__factory {
    return super.connect(signer) as TestToken__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TestTokenInterface {
    return new utils.Interface(_abi) as TestTokenInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TestToken {
    return new Contract(address, _abi, signerOrProvider) as TestToken;
  }
}
