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
        internalType: "address[]",
        name: "users",
        type: "address[]",
      },
    ],
    name: "getData",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
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
    name: "lastRecordedLpPoints",
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
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "lastRecordedTradePoints",
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
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tradePoint",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lpPoint",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "referralPoint",
        type: "uint256",
      },
    ],
    name: "updateAllPoint",
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
        name: "tradePoints",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "lpPoints",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "referralPoints",
        type: "uint256[]",
      },
    ],
    name: "updateAllPoints",
    outputs: [],
    stateMutability: "nonpayable",
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
  "0x608060405234801561001057600080fd5b50610f37806100206000396000f3fe608060405234801561001057600080fd5b50600436106100f55760003560e01c80638da5cb5b11610097578063c1c4eec311610066578063c1c4eec31461023a578063dc8417e01461025a578063f1f915181461027a578063f7c618c11461028d57600080fd5b80638da5cb5b146101bf578063ab5b5e84146101ea578063b753a98c146101fd578063b901164b1461021057600080fd5b806351d08cd5116100d357806351d08cd51461014a5780635ffab0e31461015d5780636143e7331461017f578063673d66ad1461019f57600080fd5b80630ec22747146100fa578063372500ab1461012d578063485cc95514610135575b600080fd5b61011a610108366004610b0c565b60076020526000908152604090205481565b6040519081526020015b60405180910390f35b61011a6102a0565b610148610143366004610b2e565b61045c565b005b610148610158366004610b61565b61061f565b61017061016b366004610be6565b610696565b60405161012493929190610c63565b61011a61018d366004610ca6565b60036020526000908152604090205481565b61011a6101ad366004610b0c565b60026020526000908152604090205481565b6005546101d2906001600160a01b031681565b6040516001600160a01b039091168152602001610124565b6101486101f8366004610cbf565b6108d8565b61014861020b366004610d83565b61097a565b61014861021e366004610d83565b6001600160a01b03909116600090815260026020526040902055565b61011a610248366004610b0c565b60016020526000908152604090205481565b61011a610268366004610b0c565b60086020526000908152604090205481565b610148610288366004610dad565b610a34565b6006546101d2906001600160a01b031681565b33600090815260016020908152604080832054600290925282205482916102c691610e2f565b600480546040516302b0540360e31b815233928101929092529192506000916001600160a01b031690631582a01890602401602060405180830381865afa158015610315573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103399190610e48565b60008181526003602052604081205491925061035882620f4240610e61565b61036585620f4240610e61565b61036f9190610e78565b60065460405163a9059cbb60e01b8152336004820152602481018390529192506001600160a01b03169063a9059cbb906044016020604051808303816000875af11580156103c1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103e59190610e9a565b5060065460408051868152602081018690529081018390526001600160a01b039091169033907ff8b680a8b775e82d2dcf9aad6301ed13b0563379af7820e6495737a4abf3bfbe9060600160405180910390a333600090815260026020908152604080832054600190925290912055949350505050565b600054610100900460ff161580801561047c5750600054600160ff909116105b806104965750303b158015610496575060005460ff166001145b6104fe5760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b60648201526084015b60405180910390fd5b6000805460ff191660011790558015610521576000805461ff0019166101001790555b600480546001600160a01b038086166001600160a01b03199283161790925560068054928516928216929092179091556005805490911633179055600360205261029e7f3617319a054d772f909f7c479a2cebe5066e836a939412e32403c99029b92eff5561014f7fa15bc60c955c405d20d9149c709e2460f1c2d9a497496a7f46004d1772c3054c55600260005260e17fc3a24b0501bd2c13a7e57f2db4369ec4c223447539fc0724a9d55ac4a06ebd4d55801561061a576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b505050565b6005546001600160a01b031633146106625760405162461bcd60e51b815260206004820152600660248201526510b7bbb732b960d11b60448201526064016104f5565b6001600160a01b03909316600090815260076020908152604080832094909455600881528382209290925560029091522055565b6060808060008467ffffffffffffffff8111156106b5576106b5610ebc565b6040519080825280602002602001820160405280156106de578160200160208202803683370190505b50905060008567ffffffffffffffff8111156106fc576106fc610ebc565b604051908082528060200260200182016040528015610725578160200160208202803683370190505b50905060008667ffffffffffffffff81111561074357610743610ebc565b60405190808252806020026020018201604052801561076c578160200160208202803683370190505b50905060005b878110156108c957600760008a8a8481811061079057610790610ed2565b90506020020160208101906107a59190610b0c565b6001600160a01b03166001600160a01b03168152602001908152602001600020548482815181106107d8576107d8610ed2565b602002602001018181525050600860008a8a848181106107fa576107fa610ed2565b905060200201602081019061080f9190610b0c565b6001600160a01b03166001600160a01b031681526020019081526020016000205483828151811061084257610842610ed2565b602002602001018181525050600260008a8a8481811061086457610864610ed2565b90506020020160208101906108799190610b0c565b6001600160a01b03166001600160a01b03168152602001908152602001600020548282815181106108ac576108ac610ed2565b6020908102919091010152806108c181610ee8565b915050610772565b50919450925090509250925092565b60005b8781101561096f5761095d8989838181106108f8576108f8610ed2565b905060200201602081019061090d9190610b0c565b88888481811061091f5761091f610ed2565b9050602002013587878581811061093857610938610ed2565b9050602002013586868681811061095157610951610ed2565b9050602002013561061f565b8061096781610ee8565b9150506108db565b505050505050505050565b6005546001600160a01b031633146109bd5760405162461bcd60e51b815260206004820152600660248201526510b7bbb732b960d11b60448201526064016104f5565b60055460405163a9059cbb60e01b81526001600160a01b039182166004820152602481018390529083169063a9059cbb906044016020604051808303816000875af1158015610a10573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061061a9190610e9a565b828114610a6d5760405162461bcd60e51b8152602060048201526007602482015266042d8cadccee8d60cb1b60448201526064016104f5565b60005b83811015610ae957610ad7858583818110610a8d57610a8d610ed2565b9050602002016020810190610aa29190610b0c565b848484818110610ab457610ab4610ed2565b905060200201356001600160a01b03909116600090815260026020526040902055565b80610ae181610ee8565b915050610a70565b5050505050565b80356001600160a01b0381168114610b0757600080fd5b919050565b600060208284031215610b1e57600080fd5b610b2782610af0565b9392505050565b60008060408385031215610b4157600080fd5b610b4a83610af0565b9150610b5860208401610af0565b90509250929050565b60008060008060808587031215610b7757600080fd5b610b8085610af0565b966020860135965060408601359560600135945092505050565b60008083601f840112610bac57600080fd5b50813567ffffffffffffffff811115610bc457600080fd5b6020830191508360208260051b8501011115610bdf57600080fd5b9250929050565b60008060208385031215610bf957600080fd5b823567ffffffffffffffff811115610c1057600080fd5b610c1c85828601610b9a565b90969095509350505050565b600081518084526020808501945080840160005b83811015610c5857815187529582019590820190600101610c3c565b509495945050505050565b606081526000610c766060830186610c28565b8281036020840152610c888186610c28565b90508281036040840152610c9c8185610c28565b9695505050505050565b600060208284031215610cb857600080fd5b5035919050565b6000806000806000806000806080898b031215610cdb57600080fd5b883567ffffffffffffffff80821115610cf357600080fd5b610cff8c838d01610b9a565b909a50985060208b0135915080821115610d1857600080fd5b610d248c838d01610b9a565b909850965060408b0135915080821115610d3d57600080fd5b610d498c838d01610b9a565b909650945060608b0135915080821115610d6257600080fd5b50610d6f8b828c01610b9a565b999c989b5096995094979396929594505050565b60008060408385031215610d9657600080fd5b610d9f83610af0565b946020939093013593505050565b60008060008060408587031215610dc357600080fd5b843567ffffffffffffffff80821115610ddb57600080fd5b610de788838901610b9a565b90965094506020870135915080821115610e0057600080fd5b50610e0d87828801610b9a565b95989497509550505050565b634e487b7160e01b600052601160045260246000fd5b81810381811115610e4257610e42610e19565b92915050565b600060208284031215610e5a57600080fd5b5051919050565b8082028115828204841417610e4257610e42610e19565b600082610e9557634e487b7160e01b600052601260045260246000fd5b500490565b600060208284031215610eac57600080fd5b81518015158114610b2757600080fd5b634e487b7160e01b600052604160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b600060018201610efa57610efa610e19565b506001019056fea2646970667358221220e6cb911f676f1c47b1155210980999fb0c063efeff3d8f20c1bf07fdc74348ec64736f6c63430008120033";

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
