/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { BRP, BRPInterface } from "../../../src/periphery/BRP";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "claimer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "rewardToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "pointDifference",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tier",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "rewards",
        type: "uint256",
      },
    ],
    name: "ClaimedRebates",
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
    inputs: [],
    name: "claimRewards",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ref",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
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
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "lastClaimedPoints",
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
        name: "",
        type: "address",
      },
    ],
    name: "lastRecordedPoints",
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
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "push",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardToken",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "tierToRewards",
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
        name: "referrer",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "point",
        type: "uint256",
      },
    ],
    name: "updatePoint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "referrers",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "points",
        type: "uint256[]",
      },
    ],
    name: "updatePoints",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061092a806100206000396000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c8063b753a98c11610066578063b753a98c1461013e578063b901164b14610151578063c1c4eec31461017b578063f1f915181461019b578063f7c618c1146101ae57600080fd5b8063372500ab146100a3578063485cc955146100be5780636143e733146100d3578063673d66ad146100f35780638da5cb5b14610113575b600080fd5b6100ab6101c1565b6040519081526020015b60405180910390f35b6100d16100cc3660046106d2565b61037d565b005b6100ab6100e1366004610705565b60036020526000908152604090205481565b6100ab61010136600461071e565b60026020526000908152604090205481565b600554610126906001600160a01b031681565b6040516001600160a01b0390911681526020016100b5565b6100d161014c366004610740565b610540565b6100d161015f366004610740565b6001600160a01b03909116600090815260026020526040902055565b6100ab61018936600461071e565b60016020526000908152604090205481565b6100d16101a93660046107b6565b6105fa565b600654610126906001600160a01b031681565b33600090815260016020908152604080832054600290925282205482916101e791610838565b600480546040516302b0540360e31b815233928101929092529192506000916001600160a01b031690631582a01890602401602060405180830381865afa158015610236573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061025a9190610851565b60008181526003602052604081205491925061027982620f424061086a565b61028685620f424061086a565b6102909190610881565b60065460405163a9059cbb60e01b8152336004820152602481018390529192506001600160a01b03169063a9059cbb906044016020604051808303816000875af11580156102e2573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061030691906108a3565b5060065460408051868152602081018690529081018390526001600160a01b039091169033907ff8b680a8b775e82d2dcf9aad6301ed13b0563379af7820e6495737a4abf3bfbe9060600160405180910390a333600090815260026020908152604080832054600190925290912055949350505050565b600054610100900460ff161580801561039d5750600054600160ff909116105b806103b75750303b1580156103b7575060005460ff166001145b61041f5760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b60648201526084015b60405180910390fd5b6000805460ff191660011790558015610442576000805461ff0019166101001790555b600480546001600160a01b038086166001600160a01b03199283161790925560068054928516928216929092179091556005805490911633179055600360205261029e7f3617319a054d772f909f7c479a2cebe5066e836a939412e32403c99029b92eff5561014f7fa15bc60c955c405d20d9149c709e2460f1c2d9a497496a7f46004d1772c3054c55600260005260e17fc3a24b0501bd2c13a7e57f2db4369ec4c223447539fc0724a9d55ac4a06ebd4d55801561053b576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b505050565b6005546001600160a01b031633146105835760405162461bcd60e51b815260206004820152600660248201526510b7bbb732b960d11b6044820152606401610416565b60055460405163a9059cbb60e01b81526001600160a01b039182166004820152602481018390529083169063a9059cbb906044016020604051808303816000875af11580156105d6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061053b91906108a3565b8281146106335760405162461bcd60e51b8152602060048201526007602482015266042d8cadccee8d60cb1b6044820152606401610416565b60005b838110156106af5761069d858583818110610653576106536108c5565b9050602002016020810190610668919061071e565b84848481811061067a5761067a6108c5565b905060200201356001600160a01b03909116600090815260026020526040902055565b806106a7816108db565b915050610636565b5050505050565b80356001600160a01b03811681146106cd57600080fd5b919050565b600080604083850312156106e557600080fd5b6106ee836106b6565b91506106fc602084016106b6565b90509250929050565b60006020828403121561071757600080fd5b5035919050565b60006020828403121561073057600080fd5b610739826106b6565b9392505050565b6000806040838503121561075357600080fd5b61075c836106b6565b946020939093013593505050565b60008083601f84011261077c57600080fd5b50813567ffffffffffffffff81111561079457600080fd5b6020830191508360208260051b85010111156107af57600080fd5b9250929050565b600080600080604085870312156107cc57600080fd5b843567ffffffffffffffff808211156107e457600080fd5b6107f08883890161076a565b9096509450602087013591508082111561080957600080fd5b506108168782880161076a565b95989497509550505050565b634e487b7160e01b600052601160045260246000fd5b8181038181111561084b5761084b610822565b92915050565b60006020828403121561086357600080fd5b5051919050565b808202811582820484141761084b5761084b610822565b60008261089e57634e487b7160e01b600052601260045260246000fd5b500490565b6000602082840312156108b557600080fd5b8151801515811461073957600080fd5b634e487b7160e01b600052603260045260246000fd5b6000600182016108ed576108ed610822565b506001019056fea26469706673582212207c6c979e2661e5b56c379e787f2c18dc0a635fff9d08707706d8a3f7c11ebf6d64736f6c63430008120033";

type BRPConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: BRPConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class BRP__factory extends ContractFactory {
  constructor(...args: BRPConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<BRP> {
    return super.deploy(overrides || {}) as Promise<BRP>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): BRP {
    return super.attach(address) as BRP;
  }
  override connect(signer: Signer): BRP__factory {
    return super.connect(signer) as BRP__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BRPInterface {
    return new utils.Interface(_abi) as BRPInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): BRP {
    return new Contract(address, _abi, signerOrProvider) as BRP;
  }
}
