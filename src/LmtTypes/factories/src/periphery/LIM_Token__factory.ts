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
        indexed: true,
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
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
    name: "DepositLimToken",
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
    name: "RepayLimToken",
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
    name: "UseLimToken",
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "caller",
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
    name: "WithdrawLimToken",
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
        internalType: "uint256",
        name: "addedBalance",
        type: "uint256",
      },
    ],
    name: "addTokenBalance",
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
        name: "newTokenBalance",
        type: "uint256",
      },
    ],
    name: "updateTokenBalance",
    outputs: [],
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
  "0x608060405234801561001057600080fd5b506123f3806100206000396000f3fe608060405234801561001057600080fd5b506004361061023d5760003560e01c80638f697f911161013b578063ba087652116100b8578063d905777e1161007c578063d905777e146104d4578063dd62ed3e146104e7578063ef8b30f71461049b578063f005af3e146104fa578063f367cddf1461050d57600080fd5b8063ba08765214610488578063c63d75b61461034f578063c6e6f5921461049b578063c7b9d530146104ae578063ce96cb77146104c157600080fd5b80639e1a4d19116100ff5780639e1a4d1914610433578063a457c2d71461043c578063a9059cbb1461044f578063b3d7f6b914610462578063b460af941461047557600080fd5b80638f697f91146103e957806390657147146103f257806394bf804d1461040557806395d89b411461041857806396721d8a1461042057600080fd5b806338d52e0f116101c95780636734faee1161018d5780636734faee14610364578063694d1ed4146103875780636e553f651461039a57806370a08231146103ad578063882dd41e146103d657600080fd5b806338d52e0f1461030c57806339509351146103275780633bc034bd1461033a578063402d267d1461034f5780634cdad5061461026e57600080fd5b80630a28a477116102105780630a28a477146102a457806318160ddd146102b757806319f12d50146102bf57806323b872dd146102df578063313ce567146102f257600080fd5b806301e1d1141461024257806306fdde031461025957806307a2d13a1461026e578063095ea7b314610281575b600080fd5b609b545b6040519081526020015b60405180910390f35b610261610520565b6040516102509190611d1c565b61024661027c366004611d2f565b6105b2565b61029461028f366004611d64565b6105c5565b6040519015158152602001610250565b6102466102b2366004611d2f565b6105dd565b603554610246565b6102466102cd366004611d8e565b60996020526000908152604090205481565b6102946102ed366004611da9565b6105ea565b6102fa610610565b60405160ff9091168152602001610250565b6065546040516001600160a01b039091168152602001610250565b610294610335366004611d64565b61062f565b61034d610348366004611de5565b610651565b005b61024661035d366004611d8e565b5060001990565b610294610372366004611d8e565b60986020526000908152604090205460ff1681565b61034d610395366004611d2f565b6107bc565b6102466103a8366004611e07565b610818565b6102466103bb366004611d8e565b6001600160a01b031660009081526033602052604090205490565b61034d6103e4366004611d2f565b610832565b610246609a5481565b61034d610400366004611ed6565b610861565b610246610413366004611e07565b610992565b6102616109ac565b61034d61042e366004611e07565b6109bb565b610246609b5481565b61029461044a366004611d64565b610a5f565b61029461045d366004611d64565b610ae5565b610246610470366004611d2f565b610af3565b610246610483366004611f4a565b610b00565b610246610496366004611f4a565b610b7c565b6102466104a9366004611d2f565b610bf0565b61034d6104bc366004611d8e565b610bfd565b6102466104cf366004611d8e565b610c50565b6102466104e2366004611d8e565b610c74565b6102466104f5366004611f86565b610c92565b61034d610508366004611d2f565b610cbd565b61034d61051b366004611fb0565b610d9b565b60606036805461052f90611fdc565b80601f016020809104026020016040519081016040528092919081815260200182805461055b90611fdc565b80156105a85780601f1061057d576101008083540402835291602001916105a8565b820191906000526020600020905b81548152906001019060200180831161058b57829003601f168201915b5050505050905090565b60006105bf826000610e90565b92915050565b6000336105d3818585610ecb565b5060019392505050565b60006105bf826001610fef565b6000336105f885828561101a565b61060385858561108e565b60019150505b9392505050565b60008060655461062a9190600160a01b900460ff1661202c565b905090565b6000336105d38185856106428383610c92565b61064c9190612045565b610ecb565b3360009081526098602052604090205460ff166106895760405162461bcd60e51b815260040161068090612058565b60405180910390fd5b81609a600082825461069b919061207d565b909155505060008112156106c4576106b281612090565b609b546106bf919061207d565b6106d2565b80609b546106d29190612045565b609b556107166106ea6065546001600160a01b031690565b33306000851361070c576106fd85612090565b610707908761207d565b611239565b6107078587612045565b610764604051806040016040528060088152602001677265706179696e6760c01b8152506000831361075a5761074b83612090565b610755908561207d565b6112c3565b6107558385612045565b337f99994a63a8b56425b5fddb041bf0625028dcf3ffca66e039defe4adcb5b128148383610799670de0b6b3a7640000610af3565b604080519384526020840192909252908201526060015b60405180910390a25050565b6097546001600160a01b031633146107e65760405162461bcd60e51b8152600401610680906120ac565b80609b60008282546107f89190612045565b9091555050606554610815906001600160a01b0316333084611239565b50565b60008061082484610bf0565b90506106093384868461130c565b6097546001600160a01b0316331461085c5760405162461bcd60e51b8152600401610680906120ac565b609b55565b600054610100900460ff16158080156108815750600054600160ff909116105b8061089b5750303b15801561089b575060005460ff166001145b6108fe5760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b6064820152608401610680565b6000805460ff191660011790558015610921576000805461ff0019166101001790555b61092a84611399565b61093483836113c9565b609780546001600160a01b03191633179055801561098c576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b50505050565b60008061099e84610af3565b90506106093384838761130c565b60606037805461052f90611fdc565b3360009081526098602052604090205460ff166109ea5760405162461bcd60e51b815260040161068090612058565b6001600160a01b03811660009081526099602052604081208054849290610a12908490612045565b90915550610a24905081333085611239565b806001600160a01b03167f36ffac572f12ccdd8e663178562b6a764cb46e1e0d7ef0b17a03cc6bf34ca187836040516107b091815260200190565b60003381610a6d8286610c92565b905083811015610acd5760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b6064820152608401610680565b610ada8286868403610ecb565b506001949350505050565b6000336105d381858561108e565b60006105bf826001610e90565b6000610b0b82610c50565b841115610b5a5760405162461bcd60e51b815260206004820152601f60248201527f455243343632363a207769746864726177206d6f7265207468616e206d6178006044820152606401610680565b6000610b65856105dd565b9050610b7433858588856113fa565b949350505050565b6000610b8782610c74565b841115610bd65760405162461bcd60e51b815260206004820152601d60248201527f455243343632363a2072656465656d206d6f7265207468616e206d61780000006044820152606401610680565b6000610be1856105b2565b9050610b7433858584896113fa565b60006105bf826000610fef565b6097546001600160a01b03163314610c275760405162461bcd60e51b8152600401610680906120ac565b6001600160a01b03166000908152609860205260409020805460ff19811660ff90911615179055565b6001600160a01b0381166000908152603360205260408120546105bf906000610e90565b6001600160a01b0381166000908152603360205260408120546105bf565b6001600160a01b03918216600090815260346020908152604080832093909416825291909152205490565b3360009081526098602052604090205460ff16610cec5760405162461bcd60e51b815260040161068090612058565b80609a54610cfa9190612045565b609b541015610d355760405162461bcd60e51b815260206004820152600760248201526608585b5bdd5b9d60ca1b6044820152606401610680565b80609a6000828254610d479190612045565b9091555050606554610d63906001600160a01b031633836114c3565b60405181815233907fb5edc59845a8ebef445ad9ae792a7b25d2f6e6a078027b297e58015898bb4adf9060200160405180910390a250565b3360009081526098602052604090205460ff16610dca5760405162461bcd60e51b815260040161068090612058565b6001600160a01b038116600090815260996020526040902054831115610e1c5760405162461bcd60e51b815260206004820152600760248201526608585b5bdd5b9d60ca1b6044820152606401610680565b6001600160a01b03811660009081526099602052604081208054859290610e4490849061207d565b9250508190555081609b6000828254610e5d9190612045565b90915550610e6e90508133856114c3565b610e8b610e836065546001600160a01b031690565b333085611239565b505050565b6000610609610e9e609b5490565b610ea9906001612045565b610eb56000600a6121b0565b603554610ec29190612045565b8591908561153b565b6001600160a01b038316610f2d5760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b6064820152608401610680565b6001600160a01b038216610f8e5760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b6064820152608401610680565b6001600160a01b0383811660008181526034602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6000610609610fff82600a6121b0565b60355461100c9190612045565b609b54610ec2906001612045565b60006110268484610c92565b9050600019811461098c57818110156110815760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e63650000006044820152606401610680565b61098c8484848403610ecb565b6001600160a01b0383166110f25760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b6064820152608401610680565b6001600160a01b0382166111545760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b6064820152608401610680565b6001600160a01b038316600090815260336020526040902054818110156111cc5760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b6064820152608401610680565b6001600160a01b0380851660008181526033602052604080822086860390559286168082529083902080548601905591517fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9061122c9086815260200190565b60405180910390a361098c565b60006040516323b872dd60e01b81528460048201528360248201528260448201526020600060648360008a5af13d15601f3d11600160005114161716915050806112bc5760405162461bcd60e51b81526020600482015260146024820152731514905394d1915497d19493d357d1905253115160621b6044820152606401610680565b5050505050565b61130882826040516024016112d99291906121bf565b60408051601f198184030181529190526020810180516001600160e01b03166309710a9d60e41b179052611598565b5050565b6113296113216065546001600160a01b031690565b8530856115b9565b6113338382611624565b81609b60008282546113459190612045565b909155505060408051838152602081018390526001600160a01b0380861692908716917f134ca5188d42e19724be2eee0d7989e0bfac7009be7cf49ba710b84844732d3b910160405180910390a350505050565b600054610100900460ff166113c05760405162461bcd60e51b8152600401610680906121e1565b610815816116e5565b600054610100900460ff166113f05760405162461bcd60e51b8152600401610680906121e1565b611308828261176a565b826001600160a01b0316856001600160a01b03161461141e5761141e83868361101a565b81609b6000828254611430919061207d565b90915550611440905083826117aa565b61145c6114556065546001600160a01b031690565b85846118de565b826001600160a01b0316846001600160a01b0316866001600160a01b03167f35d43f7392d6aaebdf94af18f4d5d4ada9aff48ffe7067f1777edaebd2111d7f85856040516114b4929190918252602082015260400190565b60405180910390a45050505050565b600060405163a9059cbb60e01b8152836004820152826024820152602060006044836000895af13d15601f3d116001600051141617169150508061098c5760405162461bcd60e51b815260206004820152600f60248201526e1514905394d1915497d19052531151608a1b6044820152606401610680565b60008061154986868661190e565b9050600183600281111561155f5761155f61222c565b14801561157c57506000848061157757611577612242565b868809115b1561158f5761158c600182612045565b90505b95945050505050565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b6040516001600160a01b038085166024830152831660448201526064810182905261098c9085906323b872dd60e01b906084015b60408051601f198184030181529190526020810180516001600160e01b03166001600160e01b0319909316929092179091526119f8565b6001600160a01b03821661167a5760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f2061646472657373006044820152606401610680565b806035600082825461168c9190612045565b90915550506001600160a01b0382166000818152603360209081526040808320805486019055518481527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a35050565b600054610100900460ff1661170c5760405162461bcd60e51b8152600401610680906121e1565b60008061171883611acd565b915091508161172857601261172a565b805b606580546001600160a01b039095166001600160a01b031960ff93909316600160a01b02929092166001600160a81b031990951694909417179092555050565b600054610100900460ff166117915760405162461bcd60e51b8152600401610680906121e1565b603661179d83826122a6565b506037610e8b82826122a6565b6001600160a01b03821661180a5760405162461bcd60e51b815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f206164647265736044820152607360f81b6064820152608401610680565b6001600160a01b0382166000908152603360205260409020548181101561187e5760405162461bcd60e51b815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e604482015261636560f01b6064820152608401610680565b6001600160a01b03831660008181526033602090815260408083208686039055603580548790039055518581529192917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a3505050565b6040516001600160a01b038316602482015260448101829052610e8b90849063a9059cbb60e01b906064016115ed565b60008080600019858709858702925082811083820303915050806000036119485783828161193e5761193e612242565b0492505050610609565b80841161198f5760405162461bcd60e51b81526020600482015260156024820152744d6174683a206d756c446976206f766572666c6f7760581b6044820152606401610680565b60008486880960026001871981018816978890046003810283188082028403028082028403028082028403028082028403028082028403029081029092039091026000889003889004909101858311909403939093029303949094049190911702949350505050565b6000611a4d826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b0316611ba99092919063ffffffff16565b9050805160001480611a6e575080806020019051810190611a6e9190612366565b610e8b5760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6044820152691bdd081cdd58d8d9595960b21b6064820152608401610680565b60408051600481526024810182526020810180516001600160e01b031663313ce56760e01b17905290516000918291829182916001600160a01b03871691611b1491612388565b600060405180830381855afa9150503d8060008114611b4f576040519150601f19603f3d011682016040523d82523d6000602084013e611b54565b606091505b5091509150818015611b6857506020815110155b15611b9c57600081806020019051810190611b8391906123a4565b905060ff8111611b9a576001969095509350505050565b505b5060009485945092505050565b6060610b74848460008585600080866001600160a01b03168587604051611bd09190612388565b60006040518083038185875af1925050503d8060008114611c0d576040519150601f19603f3d011682016040523d82523d6000602084013e611c12565b606091505b5091509150611c2387838387611c2e565b979650505050505050565b60608315611c9d578251600003611c96576001600160a01b0385163b611c965760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610680565b5081610b74565b610b748383815115611cb25781518083602001fd5b8060405162461bcd60e51b81526004016106809190611d1c565b60005b83811015611ce7578181015183820152602001611ccf565b50506000910152565b60008151808452611d08816020860160208601611ccc565b601f01601f19169290920160200192915050565b6020815260006106096020830184611cf0565b600060208284031215611d4157600080fd5b5035919050565b80356001600160a01b0381168114611d5f57600080fd5b919050565b60008060408385031215611d7757600080fd5b611d8083611d48565b946020939093013593505050565b600060208284031215611da057600080fd5b61060982611d48565b600080600060608486031215611dbe57600080fd5b611dc784611d48565b9250611dd560208501611d48565b9150604084013590509250925092565b60008060408385031215611df857600080fd5b50508035926020909101359150565b60008060408385031215611e1a57600080fd5b82359150611e2a60208401611d48565b90509250929050565b634e487b7160e01b600052604160045260246000fd5b600082601f830112611e5a57600080fd5b813567ffffffffffffffff80821115611e7557611e75611e33565b604051601f8301601f19908116603f01168101908282118183101715611e9d57611e9d611e33565b81604052838152866020858801011115611eb657600080fd5b836020870160208301376000602085830101528094505050505092915050565b600080600060608486031215611eeb57600080fd5b611ef484611d48565b9250602084013567ffffffffffffffff80821115611f1157600080fd5b611f1d87838801611e49565b93506040860135915080821115611f3357600080fd5b50611f4086828701611e49565b9150509250925092565b600080600060608486031215611f5f57600080fd5b83359250611f6f60208501611d48565b9150611f7d60408501611d48565b90509250925092565b60008060408385031215611f9957600080fd5b611fa283611d48565b9150611e2a60208401611d48565b600080600060608486031215611fc557600080fd5b8335925060208401359150611f7d60408501611d48565b600181811c90821680611ff057607f821691505b60208210810361201057634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b60ff81811683821601908111156105bf576105bf612016565b808201808211156105bf576105bf612016565b6020808252600b908201526a085cdd1c985d1959da5cdd60aa1b604082015260600190565b818103818111156105bf576105bf612016565b6000600160ff1b82016120a5576120a5612016565b5060000390565b60208082526006908201526510b7bbb732b960d11b604082015260600190565b600181815b808511156121075781600019048211156120ed576120ed612016565b808516156120fa57918102915b93841c93908002906120d1565b509250929050565b60008261211e575060016105bf565b8161212b575060006105bf565b8160018114612141576002811461214b57612167565b60019150506105bf565b60ff84111561215c5761215c612016565b50506001821b6105bf565b5060208310610133831016604e8410600b841016171561218a575081810a6105bf565b61219483836120cc565b80600019048211156121a8576121a8612016565b029392505050565b600061060960ff84168361210f565b6040815260006121d26040830185611cf0565b90508260208301529392505050565b6020808252602b908201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960408201526a6e697469616c697a696e6760a81b606082015260800190565b634e487b7160e01b600052602160045260246000fd5b634e487b7160e01b600052601260045260246000fd5b601f821115610e8b57600081815260208120601f850160051c8101602086101561227f5750805b601f850160051c820191505b8181101561229e5782815560010161228b565b505050505050565b815167ffffffffffffffff8111156122c0576122c0611e33565b6122d4816122ce8454611fdc565b84612258565b602080601f83116001811461230957600084156122f15750858301515b600019600386901b1c1916600185901b17855561229e565b600085815260208120601f198616915b8281101561233857888601518255948401946001909101908401612319565b50858210156123565787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b60006020828403121561237857600080fd5b8151801515811461060957600080fd5b6000825161239a818460208701611ccc565b9190910192915050565b6000602082840312156123b657600080fd5b505191905056fea2646970667358221220922083c555b9fbab1af089da0f5e104104c2401fde637b743318cbdcbf88d3f064736f6c63430008120033";

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
