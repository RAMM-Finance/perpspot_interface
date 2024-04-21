/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  LIM_Token,
  LIM_TokenInterface,
} from "../../../src/periphery/LIM_Token";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "AddedExternal",
    type: "event",
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
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "assets",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    name: "Deposit",
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
        name: "caller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "PnL",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "exchangeRate",
        type: "uint256",
      },
    ],
    name: "Repay",
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Use",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "assets",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "externalToken",
        type: "address",
      },
    ],
    name: "addExternalTokenToBalance",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [],
    name: "asset",
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
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    name: "convertToAssets",
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
        internalType: "uint256",
        name: "assets",
        type: "uint256",
      },
    ],
    name: "convertToShares",
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
        internalType: "uint256",
        name: "assets",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "deposit",
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
        name: "",
        type: "address",
      },
    ],
    name: "externalTokensAmount",
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
        internalType: "address",
        name: "assetAddress",
        type: "address",
      },
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
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isStrategist",
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
        name: "",
        type: "address",
      },
    ],
    name: "maxDeposit",
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
    name: "maxMint",
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
    ],
    name: "maxRedeem",
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
    ],
    name: "maxWithdraw",
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
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "mint",
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
        internalType: "uint256",
        name: "assets",
        type: "uint256",
      },
    ],
    name: "previewDeposit",
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
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    name: "previewMint",
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
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    name: "previewRedeem",
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
        internalType: "uint256",
        name: "assets",
        type: "uint256",
      },
    ],
    name: "previewWithdraw",
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
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "redeem",
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
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "int256",
        name: "PnL",
        type: "int256",
      },
    ],
    name: "repayBalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountSold",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountBought",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "externalToken",
        type: "address",
      },
    ],
    name: "sellExternalToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "strategist",
        type: "address",
      },
    ],
    name: "setStrategist",
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
    name: "tokenBalance",
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
    name: "totalAssets",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "useBalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "utilizedBalance",
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
        internalType: "uint256",
        name: "assets",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "withdraw",
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
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506124db806100206000396000f3fe608060405234801561001057600080fd5b50600436106102275760003560e01c80639065714711610130578063ba087652116100b8578063d905777e1161007c578063d905777e1461049c578063dd62ed3e146104af578063ef8b30f714610463578063f005af3e146104c2578063f367cddf146104d557600080fd5b8063ba08765214610450578063c63d75b61461033d578063c6e6f59214610463578063c7b9d53014610476578063ce96cb771461048957600080fd5b80639e1a4d19116100ff5780639e1a4d19146103fb578063a457c2d714610404578063a9059cbb14610417578063b3d7f6b91461042a578063b460af941461043d57600080fd5b806390657147146103ba57806394bf804d146103cd57806395d89b41146103e057806396721d8a146103e857600080fd5b806338d52e0f116101b35780634cdad506116101825780634cdad5061461025c5780636734faee146103525780636e553f651461037557806370a08231146103885780638f697f91146103b157600080fd5b806338d52e0f146102fa57806339509351146103155780633bc034bd14610328578063402d267d1461033d57600080fd5b80630a28a477116101fa5780630a28a4771461029257806318160ddd146102a557806319f12d50146102ad57806323b872dd146102cd578063313ce567146102e057600080fd5b806301e1d1141461022c57806306fdde031461024757806307a2d13a1461025c578063095ea7b31461026f575b600080fd5b6102346104e8565b6040519081526020015b60405180910390f35b61024f610578565b60405161023e9190611df5565b61023461026a366004611e08565b61060a565b61028261027d366004611e3d565b61061d565b604051901515815260200161023e565b6102346102a0366004611e08565b610635565b603554610234565b6102346102bb366004611e67565b60996020526000908152604090205481565b6102826102db366004611e82565b610642565b6102e8610668565b60405160ff909116815260200161023e565b6065546040516001600160a01b03909116815260200161023e565b610282610323366004611e3d565b610682565b61033b610336366004611ebe565b6106a4565b005b61023461034b366004611e67565b5060001990565b610282610360366004611e67565b60986020526000908152604090205460ff1681565b610234610383366004611ee0565b61080f565b610234610396366004611e67565b6001600160a01b031660009081526033602052604090205490565b610234609a5481565b61033b6103c8366004611faf565b610829565b6102346103db366004611ee0565b61095a565b61024f610974565b61033b6103f6366004611ee0565b610983565b610234609b5481565b610282610412366004611e3d565b610a27565b610282610425366004611e3d565b610aad565b610234610438366004611e08565b610abb565b61023461044b366004612023565b610ac8565b61023461045e366004612023565b610b44565b610234610471366004611e08565b610bb8565b61033b610484366004611e67565b610bc5565b610234610497366004611e67565b610c31565b6102346104aa366004611e67565b610c55565b6102346104bd36600461205f565b610c73565b61033b6104d0366004611e08565b610c9e565b61033b6104e3366004612089565b610d7c565b6000609a546104ff6065546001600160a01b031690565b6040516370a0823160e01b81523060048201526001600160a01b0391909116906370a0823190602401602060405180830381865afa158015610545573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061056991906120b5565b61057391906120e4565b905090565b606060368054610587906120f7565b80601f01602080910402602001604051908101604052809291908181526020018280546105b3906120f7565b80156106005780601f106105d557610100808354040283529160200191610600565b820191906000526020600020905b8154815290600101906020018083116105e357829003601f168201915b5050505050905090565b6000610617826000610e71565b92915050565b60003361062b818585610eab565b5060019392505050565b6000610617826001610fcf565b600033610650858285610fff565b61065b858585611073565b60019150505b9392505050565b6000806065546105739190600160a01b900460ff16612131565b60003361062b8185856106958383610c73565b61069f91906120e4565b610eab565b3360009081526098602052604090205460ff166106dc5760405162461bcd60e51b81526004016106d39061214a565b60405180910390fd5b81609a60008282546106ee919061216f565b909155505060008112156107175761070581612182565b609b54610712919061216f565b610725565b80609b5461072591906120e4565b609b5561076961073d6065546001600160a01b031690565b33306000851361075f5761075085612182565b61075a908761216f565b61121e565b61075a85876120e4565b6107b7604051806040016040528060088152602001677265706179696e6760c01b815250600083136107ad5761079e83612182565b6107a8908561216f565b6112a8565b6107a883856120e4565b337f189a059db90c880aad8670707f71b9d6a92d6d9f67ce202423508d86c3dbc6b483836107ec670de0b6b3a7640000610abb565b604080519384526020840192909252908201526060015b60405180910390a25050565b60008061081b84610bb8565b9050610661338486846112f1565b600054610100900460ff16158080156108495750600054600160ff909116105b806108635750303b158015610863575060005460ff166001145b6108c65760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b60648201526084016106d3565b6000805460ff1916600117905580156108e9576000805461ff0019166101001790555b6108f28461137e565b6108fc83836113b1565b609780546001600160a01b031916331790558015610954576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b50505050565b60008061096684610abb565b9050610661338483876112f1565b606060378054610587906120f7565b3360009081526098602052604090205460ff166109b25760405162461bcd60e51b81526004016106d39061214a565b6001600160a01b038116600090815260996020526040812080548492906109da9084906120e4565b909155506109ec90508133308561121e565b806001600160a01b03167f36ffac572f12ccdd8e663178562b6a764cb46e1e0d7ef0b17a03cc6bf34ca1878360405161080391815260200190565b60003381610a358286610c73565b905083811015610a955760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b60648201526084016106d3565b610aa28286868403610eab565b506001949350505050565b60003361062b818585611073565b6000610617826001610e71565b6000610ad382610c31565b841115610b225760405162461bcd60e51b815260206004820152601f60248201527f455243343632363a207769746864726177206d6f7265207468616e206d61780060448201526064016106d3565b6000610b2d85610635565b9050610b3c33858588856113e2565b949350505050565b6000610b4f82610c55565b841115610b9e5760405162461bcd60e51b815260206004820152601d60248201527f455243343632363a2072656465656d206d6f7265207468616e206d617800000060448201526064016106d3565b6000610ba98561060a565b9050610b3c33858584896113e2565b6000610617826000610fcf565b6097546001600160a01b03163314610c085760405162461bcd60e51b815260206004820152600660248201526510b7bbb732b960d11b60448201526064016106d3565b6001600160a01b03166000908152609860205260409020805460ff19811660ff90911615179055565b6001600160a01b038116600090815260336020526040812054610617906000610e71565b6001600160a01b038116600090815260336020526040812054610617565b6001600160a01b03918216600090815260346020908152604080832093909416825291909152205490565b3360009081526098602052604090205460ff16610ccd5760405162461bcd60e51b81526004016106d39061214a565b80609a54610cdb91906120e4565b609b541015610d165760405162461bcd60e51b815260206004820152600760248201526608585b5bdd5b9d60ca1b60448201526064016106d3565b80609a6000828254610d2891906120e4565b9091555050606554610d44906001600160a01b03163383611553565b60405181815233907f095a6ca7abcfe34d4a2c0943555a21fd5531b0a8c33bf91725429b968d2c81bd9060200160405180910390a250565b3360009081526098602052604090205460ff16610dab5760405162461bcd60e51b81526004016106d39061214a565b6001600160a01b038116600090815260996020526040902054831115610dfd5760405162461bcd60e51b815260206004820152600760248201526608585b5bdd5b9d60ca1b60448201526064016106d3565b6001600160a01b03811660009081526099602052604081208054859290610e2590849061216f565b9250508190555081609b6000828254610e3e91906120e4565b90915550610e4f9050813385611553565b610e6c610e646065546001600160a01b031690565b33308561121e565b505050565b6000610661610e7e6104e8565b610e899060016120e4565b610e956000600a612282565b603554610ea291906120e4565b859190856115cb565b6001600160a01b038316610f0d5760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b60648201526084016106d3565b6001600160a01b038216610f6e5760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b60648201526084016106d3565b6001600160a01b0383811660008181526034602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6000610661610fdf82600a612282565b603554610fec91906120e4565b610ff46104e8565b610ea29060016120e4565b600061100b8484610c73565b9050600019811461095457818110156110665760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e636500000060448201526064016106d3565b6109548484848403610eab565b6001600160a01b0383166110d75760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b60648201526084016106d3565b6001600160a01b0382166111395760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b60648201526084016106d3565b6001600160a01b038316600090815260336020526040902054818110156111b15760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b60648201526084016106d3565b6001600160a01b0380851660008181526033602052604080822086860390559286168082529083902080548601905591517fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef906112119086815260200190565b60405180910390a3610954565b60006040516323b872dd60e01b81528460048201528360248201528260448201526020600060648360008a5af13d15601f3d11600160005114161716915050806112a15760405162461bcd60e51b81526020600482015260146024820152731514905394d1915497d19493d357d1905253115160621b60448201526064016106d3565b5050505050565b6112ed82826040516024016112be929190612291565b60408051601f198184030181529190526020810180516001600160e01b03166309710a9d60e41b179052611628565b5050565b61130e6113066065546001600160a01b031690565b853085611649565b61131883826116b4565b81609b600082825461132a91906120e4565b909155505060408051838152602081018390526001600160a01b0380861692908716917fdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7910160405180910390a350505050565b600054610100900460ff166113a55760405162461bcd60e51b81526004016106d3906122b3565b6113ae81611775565b50565b600054610100900460ff166113d85760405162461bcd60e51b81526004016106d3906122b3565b6112ed82826117fa565b826001600160a01b0316856001600160a01b03161461140657611406838683610fff565b81609b6000828254611418919061216f565b909155506114289050838261183a565b6114d060405180604001604052806008815260200167030b9b9b2ba3996160c51b815250836114556104e8565b6065546001600160a01b03166040516370a0823160e01b81523060048201526001600160a01b0391909116906370a0823190602401602060405180830381865afa1580156114a7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114cb91906120b5565b61196e565b6114ec6114e56065546001600160a01b031690565b85846119b7565b826001600160a01b0316846001600160a01b0316866001600160a01b03167ffbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db8585604051611544929190918252602082015260400190565b60405180910390a45050505050565b600060405163a9059cbb60e01b8152836004820152826024820152602060006044836000895af13d15601f3d11600160005114161716915050806109545760405162461bcd60e51b815260206004820152600f60248201526e1514905394d1915497d19052531151608a1b60448201526064016106d3565b6000806115d98686866119e7565b905060018360028111156115ef576115ef6122fe565b14801561160c57506000848061160757611607612314565b868809115b1561161f5761161c6001826120e4565b90505b95945050505050565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b6040516001600160a01b03808516602483015283166044820152606481018290526109549085906323b872dd60e01b906084015b60408051601f198184030181529190526020810180516001600160e01b03166001600160e01b031990931692909217909152611ad1565b6001600160a01b03821661170a5760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f20616464726573730060448201526064016106d3565b806035600082825461171c91906120e4565b90915550506001600160a01b0382166000818152603360209081526040808320805486019055518481527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a35050565b600054610100900460ff1661179c5760405162461bcd60e51b81526004016106d3906122b3565b6000806117a883611ba6565b91509150816117b85760126117ba565b805b606580546001600160a01b039095166001600160a01b031960ff93909316600160a01b02929092166001600160a81b031990951694909417179092555050565b600054610100900460ff166118215760405162461bcd60e51b81526004016106d3906122b3565b603661182d8382612378565b506037610e6c8282612378565b6001600160a01b03821661189a5760405162461bcd60e51b815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f206164647265736044820152607360f81b60648201526084016106d3565b6001600160a01b0382166000908152603360205260409020548181101561190e5760405162461bcd60e51b815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e604482015261636560f01b60648201526084016106d3565b6001600160a01b03831660008181526033602090815260408083208686039055603580548790039055518581529192917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a3505050565b610954848484846040516024016119889493929190612438565b60408051601f198184030181529190526020810180516001600160e01b03166304772b3360e11b179052611628565b6040516001600160a01b038316602482015260448101829052610e6c90849063a9059cbb60e01b9060640161167d565b6000808060001985870985870292508281108382030391505080600003611a2157838281611a1757611a17612314565b0492505050610661565b808411611a685760405162461bcd60e51b81526020600482015260156024820152744d6174683a206d756c446976206f766572666c6f7760581b60448201526064016106d3565b60008486880960026001871981018816978890046003810283188082028403028082028403028082028403028082028403028082028403029081029092039091026000889003889004909101858311909403939093029303949094049190911702949350505050565b6000611b26826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b0316611c829092919063ffffffff16565b9050805160001480611b47575080806020019051810190611b479190612467565b610e6c5760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6044820152691bdd081cdd58d8d9595960b21b60648201526084016106d3565b60408051600481526024810182526020810180516001600160e01b031663313ce56760e01b17905290516000918291829182916001600160a01b03871691611bed91612489565b600060405180830381855afa9150503d8060008114611c28576040519150601f19603f3d011682016040523d82523d6000602084013e611c2d565b606091505b5091509150818015611c4157506020815110155b15611c7557600081806020019051810190611c5c91906120b5565b905060ff8111611c73576001969095509350505050565b505b5060009485945092505050565b6060610b3c848460008585600080866001600160a01b03168587604051611ca99190612489565b60006040518083038185875af1925050503d8060008114611ce6576040519150601f19603f3d011682016040523d82523d6000602084013e611ceb565b606091505b5091509150611cfc87838387611d07565b979650505050505050565b60608315611d76578251600003611d6f576001600160a01b0385163b611d6f5760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060448201526064016106d3565b5081610b3c565b610b3c8383815115611d8b5781518083602001fd5b8060405162461bcd60e51b81526004016106d39190611df5565b60005b83811015611dc0578181015183820152602001611da8565b50506000910152565b60008151808452611de1816020860160208601611da5565b601f01601f19169290920160200192915050565b6020815260006106616020830184611dc9565b600060208284031215611e1a57600080fd5b5035919050565b80356001600160a01b0381168114611e3857600080fd5b919050565b60008060408385031215611e5057600080fd5b611e5983611e21565b946020939093013593505050565b600060208284031215611e7957600080fd5b61066182611e21565b600080600060608486031215611e9757600080fd5b611ea084611e21565b9250611eae60208501611e21565b9150604084013590509250925092565b60008060408385031215611ed157600080fd5b50508035926020909101359150565b60008060408385031215611ef357600080fd5b82359150611f0360208401611e21565b90509250929050565b634e487b7160e01b600052604160045260246000fd5b600082601f830112611f3357600080fd5b813567ffffffffffffffff80821115611f4e57611f4e611f0c565b604051601f8301601f19908116603f01168101908282118183101715611f7657611f76611f0c565b81604052838152866020858801011115611f8f57600080fd5b836020870160208301376000602085830101528094505050505092915050565b600080600060608486031215611fc457600080fd5b611fcd84611e21565b9250602084013567ffffffffffffffff80821115611fea57600080fd5b611ff687838801611f22565b9350604086013591508082111561200c57600080fd5b5061201986828701611f22565b9150509250925092565b60008060006060848603121561203857600080fd5b8335925061204860208501611e21565b915061205660408501611e21565b90509250925092565b6000806040838503121561207257600080fd5b61207b83611e21565b9150611f0360208401611e21565b60008060006060848603121561209e57600080fd5b833592506020840135915061205660408501611e21565b6000602082840312156120c757600080fd5b5051919050565b634e487b7160e01b600052601160045260246000fd5b80820180821115610617576106176120ce565b600181811c9082168061210b57607f821691505b60208210810361212b57634e487b7160e01b600052602260045260246000fd5b50919050565b60ff8181168382160190811115610617576106176120ce565b6020808252600b908201526a085cdd1c985d1959da5cdd60aa1b604082015260600190565b81810381811115610617576106176120ce565b6000600160ff1b8201612197576121976120ce565b5060000390565b600181815b808511156121d95781600019048211156121bf576121bf6120ce565b808516156121cc57918102915b93841c93908002906121a3565b509250929050565b6000826121f057506001610617565b816121fd57506000610617565b8160018114612213576002811461221d57612239565b6001915050610617565b60ff84111561222e5761222e6120ce565b50506001821b610617565b5060208310610133831016604e8410600b841016171561225c575081810a610617565b612266838361219e565b806000190482111561227a5761227a6120ce565b029392505050565b600061066160ff8416836121e1565b6040815260006122a46040830185611dc9565b90508260208301529392505050565b6020808252602b908201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960408201526a6e697469616c697a696e6760a81b606082015260800190565b634e487b7160e01b600052602160045260246000fd5b634e487b7160e01b600052601260045260246000fd5b601f821115610e6c57600081815260208120601f850160051c810160208610156123515750805b601f850160051c820191505b818110156123705782815560010161235d565b505050505050565b815167ffffffffffffffff81111561239257612392611f0c565b6123a6816123a084546120f7565b8461232a565b602080601f8311600181146123db57600084156123c35750858301515b600019600386901b1c1916600185901b178555612370565b600085815260208120601f198616915b8281101561240a578886015182559484019460019091019084016123eb565b50858210156124285787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b60808152600061244b6080830187611dc9565b6020830195909552506040810192909252606090910152919050565b60006020828403121561247957600080fd5b8151801515811461066157600080fd5b6000825161249b818460208701611da5565b919091019291505056fea26469706673582212204eb18a371f954ebc0092c47286f492c5eb4dcfb835d3eb439b5f8eb470a26c9164736f6c63430008120033";

type LIM_TokenConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: LIM_TokenConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class LIM_Token__factory extends ContractFactory {
  constructor(...args: LIM_TokenConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<LIM_Token> {
    return super.deploy(overrides || {}) as Promise<LIM_Token>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): LIM_Token {
    return super.attach(address) as LIM_Token;
  }
  override connect(signer: Signer): LIM_Token__factory {
    return super.connect(signer) as LIM_Token__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): LIM_TokenInterface {
    return new utils.Interface(_abi) as LIM_TokenInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): LIM_Token {
    return new Contract(address, _abi, signerOrProvider) as LIM_Token;
  }
}
