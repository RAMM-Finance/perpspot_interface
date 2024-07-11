/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  OwnedToken,
  OwnedTokenInterface,
} from "../../../../src/periphery/LPVault.sol/OwnedToken";

const _abi = [
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
        name: "value",
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
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
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
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
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
        name: "account",
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
    inputs: [
      {
        internalType: "address",
        name: "who",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    name: "burnPermissioned",
    outputs: [],
    stateMutability: "nonpayable",
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
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
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
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
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
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_symbol",
        type: "string",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "locked",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
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
        name: "shares",
        type: "uint256",
      },
    ],
    name: "mintPermissioned",
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
    name: "toggleLock",
    outputs: [],
    stateMutability: "nonpayable",
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
  "0x608060405234801561001057600080fd5b50611059806100206000396000f3fe608060405234801561001057600080fd5b50600436106101005760003560e01c806370a0823111610097578063cf30901211610066578063cf3090121461020c578063d56ed8b714610220578063dd62ed3e14610233578063ff9413d81461024657600080fd5b806370a08231146101b557806395d89b41146101de578063a457c2d7146101e6578063a9059cbb146101f957600080fd5b806323b872dd116100d357806323b872dd1461016d578063313ce56714610180578063395093511461018f5780634cd88b76146101a257600080fd5b806306fdde0314610105578063095ea7b314610123578063165965711461014657806318160ddd1461015b575b600080fd5b61010d61024e565b60405161011a9190610c23565b60405180910390f35b610136610131366004610c8d565b6102e0565b604051901515815260200161011a565b610159610154366004610c8d565b6102fa565b005b6035545b60405190815260200161011a565b61013661017b366004610cb7565b61033b565b6040516012815260200161011a565b61013661019d366004610c8d565b61035f565b6101596101b0366004610d96565b610381565b61015f6101c3366004610dfa565b6001600160a01b031660009081526033602052604090205490565b61010d6104a8565b6101366101f4366004610c8d565b6104b7565b610136610207366004610c8d565b610532565b60655461013690600160a01b900460ff1681565b61015961022e366004610c8d565b610540565b61015f610241366004610e1c565b610574565b61015961059f565b60606036805461025d90610e4f565b80601f016020809104026020016040519081016040528092919081815260200182805461028990610e4f565b80156102d65780601f106102ab576101008083540402835291602001916102d6565b820191906000526020600020905b8154815290600101906020018083116102b957829003601f168201915b5050505050905090565b6000336102ee8185856105ea565b60019150505b92915050565b6065546001600160a01b0316331461032d5760405162461bcd60e51b815260040161032490610e89565b60405180910390fd5b610337828261070e565b5050565b60003361034985828561084e565b6103548585856108c8565b506001949350505050565b6000336102ee8185856103728383610574565b61037c9190610ea9565b6105ea565b600054610100900460ff16158080156103a15750600054600160ff909116105b806103bb5750303b1580156103bb575060005460ff166001145b61041e5760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b6064820152608401610324565b6000805460ff191660011790558015610441576000805461ff0019166101001790555b61044b8383610a7e565b606580546001600160a01b0319163317905580156104a3576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b505050565b60606037805461025d90610e4f565b600033816104c58286610574565b9050838110156105255760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b6064820152608401610324565b61035482868684036105ea565b6000336102ee8185856108c8565b6065546001600160a01b0316331461056a5760405162461bcd60e51b815260040161032490610e89565b6103378282610aaf565b6001600160a01b03918216600090815260346020908152604080832093909416825291909152205490565b6065546001600160a01b031633146105c95760405162461bcd60e51b815260040161032490610e89565b6065805460ff60a01b198116600160a01b9182900460ff1615909102179055565b6001600160a01b03831661064c5760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b6064820152608401610324565b6001600160a01b0382166106ad5760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b6064820152608401610324565b6001600160a01b0383811660008181526034602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6001600160a01b03821661076e5760405162461bcd60e51b815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f206164647265736044820152607360f81b6064820152608401610324565b61077a82600083610b7c565b6001600160a01b038216600090815260336020526040902054818110156107ee5760405162461bcd60e51b815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e604482015261636560f01b6064820152608401610324565b6001600160a01b03831660008181526033602090815260408083208686039055603580548790039055518581529192917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a3505050565b600061085a8484610574565b905060001981146108c257818110156108b55760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e63650000006044820152606401610324565b6108c284848484036105ea565b50505050565b6001600160a01b03831661092c5760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b6064820152608401610324565b6001600160a01b03821661098e5760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b6064820152608401610324565b610999838383610b7c565b6001600160a01b03831660009081526033602052604090205481811015610a115760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b6064820152608401610324565b6001600160a01b0380851660008181526033602052604080822086860390559286168082529083902080548601905591517fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef90610a719086815260200190565b60405180910390a36108c2565b600054610100900460ff16610aa55760405162461bcd60e51b815260040161032490610eca565b6103378282610be3565b6001600160a01b038216610b055760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f2061646472657373006044820152606401610324565b610b1160008383610b7c565b8060356000828254610b239190610ea9565b90915550506001600160a01b0382166000818152603360209081526040808320805486019055518481527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a35050565b7331ea2dd90bd140d565726531f402d461e25a5f606001600160a01b038416146104a357606554600160a01b900460ff16156104a35760405162461bcd60e51b81526020600482015260066024820152651b1bd8dad95960d21b6044820152606401610324565b600054610100900460ff16610c0a5760405162461bcd60e51b815260040161032490610eca565b6036610c168382610f63565b5060376104a38282610f63565b600060208083528351808285015260005b81811015610c5057858101830151858201604001528201610c34565b506000604082860101526040601f19601f8301168501019250505092915050565b80356001600160a01b0381168114610c8857600080fd5b919050565b60008060408385031215610ca057600080fd5b610ca983610c71565b946020939093013593505050565b600080600060608486031215610ccc57600080fd5b610cd584610c71565b9250610ce360208501610c71565b9150604084013590509250925092565b634e487b7160e01b600052604160045260246000fd5b600082601f830112610d1a57600080fd5b813567ffffffffffffffff80821115610d3557610d35610cf3565b604051601f8301601f19908116603f01168101908282118183101715610d5d57610d5d610cf3565b81604052838152866020858801011115610d7657600080fd5b836020870160208301376000602085830101528094505050505092915050565b60008060408385031215610da957600080fd5b823567ffffffffffffffff80821115610dc157600080fd5b610dcd86838701610d09565b93506020850135915080821115610de357600080fd5b50610df085828601610d09565b9150509250929050565b600060208284031215610e0c57600080fd5b610e1582610c71565b9392505050565b60008060408385031215610e2f57600080fd5b610e3883610c71565b9150610e4660208401610c71565b90509250929050565b600181811c90821680610e6357607f821691505b602082108103610e8357634e487b7160e01b600052602260045260246000fd5b50919050565b60208082526006908201526510b7bbb732b960d11b604082015260600190565b808201808211156102f457634e487b7160e01b600052601160045260246000fd5b6020808252602b908201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960408201526a6e697469616c697a696e6760a81b606082015260800190565b601f8211156104a357600081815260208120601f850160051c81016020861015610f3c5750805b601f850160051c820191505b81811015610f5b57828155600101610f48565b505050505050565b815167ffffffffffffffff811115610f7d57610f7d610cf3565b610f9181610f8b8454610e4f565b84610f15565b602080601f831160018114610fc65760008415610fae5750858301515b600019600386901b1c1916600185901b178555610f5b565b600085815260208120601f198616915b82811015610ff557888601518255948401946001909101908401610fd6565b50858210156110135787850151600019600388901b60f8161c191681555b5050505050600190811b0190555056fea26469706673582212201a4aae1f734cc5b6adef19e25f4ac8c889c75eebda8d06d9e71c20acf4c0918a64736f6c63430008120033";

type OwnedTokenConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: OwnedTokenConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class OwnedToken__factory extends ContractFactory {
  constructor(...args: OwnedTokenConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<OwnedToken> {
    return super.deploy(overrides || {}) as Promise<OwnedToken>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): OwnedToken {
    return super.attach(address) as OwnedToken;
  }
  override connect(signer: Signer): OwnedToken__factory {
    return super.connect(signer) as OwnedToken__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): OwnedTokenInterface {
    return new utils.Interface(_abi) as OwnedTokenInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): OwnedToken {
    return new Contract(address, _abi, signerOrProvider) as OwnedToken;
  }
}
