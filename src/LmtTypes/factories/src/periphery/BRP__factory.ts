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
        name: "user",
        type: "address",
      },
    ],
    name: "AddedUser",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "who",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "claimableBoxes",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "randomNumber",
        type: "uint256",
      },
    ],
    name: "BoxUnlocked",
    type: "event",
  },
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
    anonymous: false,
    inputs: [],
    name: "UpdatedPoints",
    type: "event",
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
    name: "addAllPoint",
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
    name: "addAllPoints",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "addBox",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
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
        name: "who",
        type: "address",
      },
    ],
    name: "claimableBoxes",
    outputs: [
      {
        internalType: "uint256",
        name: "claimableBoxes",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalPoints",
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
    name: "freeBoxUsed",
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
    inputs: [],
    name: "getBlock",
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
    inputs: [],
    name: "getLastUpdate",
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
    name: "getUsers",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
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
    name: "isListed",
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
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "numBoxes",
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
    inputs: [],
    name: "pointPerAdd",
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
    name: "pointPerUnlocks",
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
    name: "pointsUsedForNewBoxes",
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
    name: "pointsUsedForUnlocks",
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
    inputs: [
      {
        internalType: "uint256",
        name: "rangelow",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "rangeHigh",
        type: "uint256",
      },
    ],
    name: "randomWithinRange",
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
    name: "rangeHigh",
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
    name: "rangeLow",
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
        internalType: "address",
        name: "who",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "boxes",
        type: "uint256",
      },
    ],
    name: "setNumBoxes",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "who",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "boxes",
        type: "uint256",
      },
    ],
    name: "setNumBoxesBulk",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "pointPerAdd_",
        type: "uint256",
      },
    ],
    name: "setPointPerAdd",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "pointPerUnlocks_",
        type: "uint256",
      },
    ],
    name: "setPointPerUnlocks",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "rangeLow_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "rangeHigh_",
        type: "uint256",
      },
    ],
    name: "setRandomRange",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "rewardToken_",
        type: "address",
      },
    ],
    name: "setRewardToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "setlastUpdate",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [],
    name: "unlockBox",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "users",
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
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50611f4f806100206000396000f3fe608060405234801561001057600080fd5b50600436106102525760003560e01c806387dcbbc111610146578063b901164b116100c3578063da7dd8ca11610087578063da7dd8ca14610557578063dc8417e01461058a578063ea2277ad146105aa578063f1f91518146105b3578063f794062e146105c6578063f7c618c1146105e957600080fd5b8063b901164b146104d4578063bc8c67a2146104fe578063c1c4eec314610511578063d0c5de6a14610531578063d375c81d1461054457600080fd5b8063a60b7b701161010a578063a60b7b701461048a578063ab5b5e8414610493578063af592d27146104a6578063b60f1840146104ae578063b753a98c146104c157600080fd5b806387dcbbc1146104145780638aee8127146104275780638da5cb5b1461043a57806393196a6d1461044d5780639aa1f9b21461046a57600080fd5b8063485cc955116101d45780635ffab0e3116101985780635ffab0e3146103895780636143e733146103ab578063673d66ad146103cb578063705f40c7146103eb57806380f2fb6f1461040b57600080fd5b8063485cc955146103285780634c89867f1461033b5780634f26af421461034357806351d08cd51461036357806357175f8c1461037657600080fd5b80632e97766d1161021b5780632e97766d146102d357806330291a3e146102d9578063365b98b2146102ec578063372500ab146103175780633798443b1461031f57600080fd5b8062ce8e3e146102575780630ec22747146102755780631c786ce0146102a3578063289035c7146102b85780632a3606d5146102cb575b600080fd5b61025f6105fc565b60405161026c919061198a565b60405180910390f35b6102956102833660046119f3565b60076020526000908152604090205481565b60405190815260200161026c565b6102b66102b1366004611a15565b61065e565b005b6102b66102c6366004611a8b565b6106ad565b6102b6610879565b43610295565b6102b66102e7366004611b4f565b610993565b6102ff6102fa366004611b4f565b6109c2565b6040516001600160a01b03909116815260200161026c565b6102956109ec565b610295600f5481565b6102b6610336366004611b68565b610ba8565b600954610295565b6102956103513660046119f3565b60106020526000908152604090205481565b6102b6610371366004611b9b565b610d7c565b610295610384366004611bd4565b610dda565b61039c610397366004611bf6565b610eb5565b60405161026c93929190611c73565b6102956103b9366004611b4f565b60036020526000908152604090205481565b6102956103d93660046119f3565b60026020526000908152604090205481565b6102956103f93660046119f3565b600c6020526000908152604090205481565b61029560115481565b6102b6610422366004611bd4565b6110f7565b6102b66104353660046119f3565b61112c565b6005546102ff906001600160a01b031681565b610455611178565b6040805192835260208301919091520161026c565b6102956104783660046119f3565b600d6020526000908152604090205481565b610295600e5481565b6102b66104a1366004611a8b565b611430565b6102b66114c7565b6102b66104bc366004611b9b565b6114f7565b6102b66104cf366004611a15565b611631565b6102b66104e2366004611a15565b6001600160a01b03909116600090815260026020526040902055565b61045561050c3660046119f3565b6116d2565b61029561051f3660046119f3565b60016020526000908152604090205481565b6102b661053f366004611cb6565b6117ed565b6102b6610552366004611b4f565b61183a565b61057a6105653660046119f3565b60136020526000908152604090205460ff1681565b604051901515815260200161026c565b6102956105983660046119f3565b60086020526000908152604090205481565b61029560125481565b6102b66105c1366004611d02565b611869565b61057a6105d43660046119f3565b600a6020526000908152604090205460ff1681565b6006546102ff906001600160a01b031681565b6060600b80548060200260200160405190810160405280929190818152602001828054801561065457602002820191906000526020600020905b81546001600160a01b03168152600190910190602001808311610636575b5050505050905090565b6005546001600160a01b031633146106915760405162461bcd60e51b815260040161068890611d6e565b60405180910390fd5b6001600160a01b039091166000908152600c6020526040902055565b60005b87811015610841576107328989838181106106cd576106cd611d8e565b90506020020160208101906106e291906119f3565b8888848181106106f4576106f4611d8e565b9050602002013587878581811061070d5761070d611d8e565b9050602002013586868681811061072657610726611d8e565b905060200201356114f7565b600a60008a8a8481811061074857610748611d8e565b905060200201602081019061075d91906119f3565b6001600160a01b0316815260208101919091526040016000205460ff1661082f576001600a60008b8b8581811061079657610796611d8e565b90506020020160208101906107ab91906119f3565b6001600160a01b031681526020810191909152604001600020805460ff1916911515919091179055600b8989838181106107e7576107e7611d8e565b90506020020160208101906107fc91906119f3565b81546001810183556000928352602090922090910180546001600160a01b0319166001600160a01b039092169190911790555b8061083981611dba565b9150506106b0565b506040517f2d25400765776242d664638c9c6b84875af2835cfa621d55979981e9bd8d67a590600090a1505042600955505050505050565b336000908152600c6020526040902054156108bf5760405162461bcd60e51b81526020600482015260066024820152650d0c2e684def60d31b6044820152606401610688565b336000908152600d6020908152604080832054601083528184205460028452828520546008855283862054600790955292852054919490939092916109049190611dd3565b61090e9190611dd3565b9050600061091c8385611dd3565b82111561093b578361092e8484611de6565b6109389190611de6565b90505b600f5481111561098d57600f543360009081526010602052604081208054909190610967908490611dd3565b9091555050336000908152600c6020526040812080549161098783611dba565b91905055505b50505050565b6005546001600160a01b031633146109bd5760405162461bcd60e51b815260040161068890611d6e565b600f55565b600b81815481106109d257600080fd5b6000918252602090912001546001600160a01b0316905081565b3360009081526001602090815260408083205460029092528220548291610a1291611de6565b600480546040516302b0540360e31b815233928101929092529192506000916001600160a01b031690631582a01890602401602060405180830381865afa158015610a61573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a859190611df9565b600081815260036020526040812054919250610aa482620f4240611e12565b610ab185620f4240611e12565b610abb9190611e3f565b60065460405163a9059cbb60e01b8152336004820152602481018390529192506001600160a01b03169063a9059cbb906044016020604051808303816000875af1158015610b0d573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b319190611e53565b5060065460408051868152602081018690529081018390526001600160a01b039091169033907ff8b680a8b775e82d2dcf9aad6301ed13b0563379af7820e6495737a4abf3bfbe9060600160405180910390a333600090815260026020908152604080832054600190925290912055949350505050565b600054610100900460ff1615808015610bc85750600054600160ff909116105b80610be25750303b158015610be2575060005460ff166001145b610c455760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b6064820152608401610688565b6000805460ff191660011790558015610c68576000805461ff0019166101001790555b600480546001600160a01b038086166001600160a01b03199283161790925560068054928516928216929092179091556005805490911633179055600360205261029e7f3617319a054d772f909f7c479a2cebe5066e836a939412e32403c99029b92eff5561014f7fa15bc60c955c405d20d9149c709e2460f1c2d9a497496a7f46004d1772c3054c55600260005260e17fc3a24b0501bd2c13a7e57f2db4369ec4c223447539fc0724a9d55ac4a06ebd4d55612710600e819055600f81905560115561c3506012558015610d77576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b505050565b6005546001600160a01b03163314610da65760405162461bcd60e51b815260040161068890611d6e565b6001600160a01b03909316600090815260076020908152604080832094909455600881528382209290925560029091522055565b6000828211610e1b5760405162461bcd60e51b815260206004820152600d60248201526c496e76616c69642072616e676560981b6044820152606401610688565b6000610e278484611de6565b610e32906001611dd3565b90506000610e41600143611de6565b604080519140602083018190526bffffffffffffffffffffffff193360601b1691830191909152426054830152915060009060740160408051601f19818403018152919052805160209091012090506000610e9c8483611e75565b9050610ea88188611dd3565b9450505050505b92915050565b6060808060008467ffffffffffffffff811115610ed457610ed4611e89565b604051908082528060200260200182016040528015610efd578160200160208202803683370190505b50905060008567ffffffffffffffff811115610f1b57610f1b611e89565b604051908082528060200260200182016040528015610f44578160200160208202803683370190505b50905060008667ffffffffffffffff811115610f6257610f62611e89565b604051908082528060200260200182016040528015610f8b578160200160208202803683370190505b50905060005b878110156110e857600760008a8a84818110610faf57610faf611d8e565b9050602002016020810190610fc491906119f3565b6001600160a01b03166001600160a01b0316815260200190815260200160002054848281518110610ff757610ff7611d8e565b602002602001018181525050600860008a8a8481811061101957611019611d8e565b905060200201602081019061102e91906119f3565b6001600160a01b03166001600160a01b031681526020019081526020016000205483828151811061106157611061611d8e565b602002602001018181525050600260008a8a8481811061108357611083611d8e565b905060200201602081019061109891906119f3565b6001600160a01b03166001600160a01b03168152602001908152602001600020548282815181106110cb576110cb611d8e565b6020908102919091010152806110e081611dba565b915050610f91565b50919450925090509250925092565b6005546001600160a01b031633146111215760405162461bcd60e51b815260040161068890611d6e565b601191909155601255565b6005546001600160a01b031633146111565760405162461bcd60e51b815260040161068890611d6e565b600680546001600160a01b0319166001600160a01b0392909216919091179055565b336000908152600c602052604081205481906111bf5760405162461bcd60e51b815260040161068890602080825260049082015263060c4def60e31b604082015260600190565b3360009081526013602052604090205460ff166112f457336000908152600c602052604081208054916111f183611e9f565b9091555050336000908152601360205260408120805460ff191660011790556011546012546112209190610dda565b9050600061123682670de0b6b3a7640000611e12565b60065460405163a9059cbb60e01b8152336004820152602481018390529192506001600160a01b03169063a9059cbb906044016020604051808303816000875af1158015611288573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112ac9190611e53565b50604080516000808252602082015233917f556f2cd053c19fa678c33006534a7ba4416fc1737d8dfebdf44da21c443222a2910160405180910390a250600093849350915050565b600080611300336116d2565b600e54336000908152600d6020526040812080549496509294509092611327908490611dd3565b9091555050336000908152600c6020526040812080549161134783611e9f565b9190505550600061135c601154601254610dda565b9050600061137282670de0b6b3a7640000611e12565b60065460405163a9059cbb60e01b8152336004820152602481018390529192506001600160a01b03169063a9059cbb906044016020604051808303816000875af11580156113c4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113e89190611e53565b50604080518581526020810184905233917f556f2cd053c19fa678c33006534a7ba4416fc1737d8dfebdf44da21c443222a2910160405180910390a250919491935090915050565b60005b87811015610841576114b589898381811061145057611450611d8e565b905060200201602081019061146591906119f3565b88888481811061147757611477611d8e565b9050602002013587878581811061149057611490611d8e565b905060200201358686868181106114a9576114a9611d8e565b90506020020135610d7c565b806114bf81611dba565b915050611433565b6005546001600160a01b031633146114f15760405162461bcd60e51b815260040161068890611d6e565b42600955565b6005546001600160a01b031633146115215760405162461bcd60e51b815260040161068890611d6e565b6001600160a01b03841660009081526007602052604081208054859290611549908490611dd3565b90915550506001600160a01b03841660009081526008602052604081208054849290611576908490611dd3565b90915550506001600160a01b038416600090815260026020526040812080548392906115a3908490611dd3565b90915550506001600160a01b0384166000908152600a602052604090205460ff1661098d575050506001600160a01b03166000818152600a60205260408120805460ff19166001908117909155600b805491820181559091527f0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01db90180546001600160a01b0319169091179055565b6005546001600160a01b0316331461165b5760405162461bcd60e51b815260040161068890611d6e565b60055460405163a9059cbb60e01b81526001600160a01b039182166004820152602481018390529083169063a9059cbb906044016020604051808303816000875af11580156116ae573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d779190611e53565b6001600160a01b0381166000908152600c602090815260408083205460028352818420546008845282852054600790945291842054849391929161171591611dd3565b61171f9190611dd3565b91506000600d6000866001600160a01b03166001600160a01b0316815260200190815260200160002054905061177c6040518060400160405280600b81526020016a746f74616c706f696e747360a81b8152508483600e54611925565b8083106117a157600e546117908285611de6565b61179a9190611e3f565b93506117a6565b600093505b8184106117b357816117b5565b835b6001600160a01b03861660009081526013602052604090205490945060ff166117e657836117e281611dba565b9450505b5050915091565b60005b8281101561098d5761182884848381811061180d5761180d611d8e565b905060200201602081019061182291906119f3565b8361065e565b8061183281611dba565b9150506117f0565b6005546001600160a01b031633146118645760405162461bcd60e51b815260040161068890611d6e565b600e55565b8281146118a25760405162461bcd60e51b8152602060048201526007602482015266042d8cadccee8d60cb1b6044820152606401610688565b60005b8381101561191e5761190c8585838181106118c2576118c2611d8e565b90506020020160208101906118d791906119f3565b8484848181106118e9576118e9611d8e565b905060200201356001600160a01b03909116600090815260026020526040902055565b8061191681611dba565b9150506118a5565b5050505050565b61098d8484848460405160240161193f9493929190611eb6565b60408051601f198184030181529190526020810180516001600160e01b03166304772b3360e11b17905280516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b6020808252825182820181905260009190848201906040850190845b818110156119cb5783516001600160a01b0316835292840192918401916001016119a6565b50909695505050505050565b80356001600160a01b03811681146119ee57600080fd5b919050565b600060208284031215611a0557600080fd5b611a0e826119d7565b9392505050565b60008060408385031215611a2857600080fd5b611a31836119d7565b946020939093013593505050565b60008083601f840112611a5157600080fd5b50813567ffffffffffffffff811115611a6957600080fd5b6020830191508360208260051b8501011115611a8457600080fd5b9250929050565b6000806000806000806000806080898b031215611aa757600080fd5b883567ffffffffffffffff80821115611abf57600080fd5b611acb8c838d01611a3f565b909a50985060208b0135915080821115611ae457600080fd5b611af08c838d01611a3f565b909850965060408b0135915080821115611b0957600080fd5b611b158c838d01611a3f565b909650945060608b0135915080821115611b2e57600080fd5b50611b3b8b828c01611a3f565b999c989b5096995094979396929594505050565b600060208284031215611b6157600080fd5b5035919050565b60008060408385031215611b7b57600080fd5b611b84836119d7565b9150611b92602084016119d7565b90509250929050565b60008060008060808587031215611bb157600080fd5b611bba856119d7565b966020860135965060408601359560600135945092505050565b60008060408385031215611be757600080fd5b50508035926020909101359150565b60008060208385031215611c0957600080fd5b823567ffffffffffffffff811115611c2057600080fd5b611c2c85828601611a3f565b90969095509350505050565b600081518084526020808501945080840160005b83811015611c6857815187529582019590820190600101611c4c565b509495945050505050565b606081526000611c866060830186611c38565b8281036020840152611c988186611c38565b90508281036040840152611cac8185611c38565b9695505050505050565b600080600060408486031215611ccb57600080fd5b833567ffffffffffffffff811115611ce257600080fd5b611cee86828701611a3f565b909790965060209590950135949350505050565b60008060008060408587031215611d1857600080fd5b843567ffffffffffffffff80821115611d3057600080fd5b611d3c88838901611a3f565b90965094506020870135915080821115611d5557600080fd5b50611d6287828801611a3f565b95989497509550505050565b60208082526006908201526510b7bbb732b960d11b604082015260600190565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600060018201611dcc57611dcc611da4565b5060010190565b80820180821115610eaf57610eaf611da4565b81810381811115610eaf57610eaf611da4565b600060208284031215611e0b57600080fd5b5051919050565b8082028115828204841417610eaf57610eaf611da4565b634e487b7160e01b600052601260045260246000fd5b600082611e4e57611e4e611e29565b500490565b600060208284031215611e6557600080fd5b81518015158114611a0e57600080fd5b600082611e8457611e84611e29565b500690565b634e487b7160e01b600052604160045260246000fd5b600081611eae57611eae611da4565b506000190190565b608081526000855180608084015260005b81811015611ee457602081890181015160a0868401015201611ec7565b50600060a0828501015260a0601f19601f8301168401019150508460208301528360408301528260608301529594505050505056fea26469706673582212200e06c8756252b98f68126a7db112b22acd7def88f14343ecc8045614d1bae23d64736f6c63430008120033";

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
