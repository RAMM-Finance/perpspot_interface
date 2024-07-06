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
    inputs: [
      {
        internalType: "uint256",
        name: "passcode_",
        type: "uint256",
      },
    ],
    name: "claimBoxes",
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
    name: "claimed",
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
        name: "passcode_",
        type: "uint256",
      },
    ],
    name: "setPasscode",
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
  "0x608060405234801561001057600080fd5b50611cab806100206000396000f3fe608060405234801561001057600080fd5b50600436106102735760003560e01c80638aee812711610151578063bc8c67a2116100c3578063da7dd8ca11610087578063da7dd8ca146105cd578063dc8417e0146105f0578063ea2277ad14610610578063f1f9151814610619578063f794062e1461062c578063f7c618c11461064f57600080fd5b8063bc8c67a214610541578063c1c4eec314610554578063c884ef8314610574578063d0c5de6a146105a7578063d375c81d146105ba57600080fd5b8063ab5b5e8411610115578063ab5b5e84146104c3578063af592d27146104d6578063b1f1f653146104de578063b60f1840146104f1578063b753a98c14610504578063b901164b1461051757600080fd5b80638aee81271461045b5780638da5cb5b1461046e57806393196a6d146104815780639aa1f9b21461049a578063a60b7b70146104ba57600080fd5b80634c89867f116101ea5780636143e733116101ae5780636143e733146103cc578063673d66ad146103ec578063705f40c71461040c57806380f2fb6f1461042c57806387dcbbc114610435578063880489e01461044857600080fd5b80634c89867f1461035c5780634f26af421461036457806351d08cd51461038457806357175f8c146103975780635ffab0e3146103aa57600080fd5b80632e97766d1161023c5780632e97766d146102f457806330291a3e146102fa578063365b98b21461030d578063372500ab146103385780633798443b14610340578063485cc9551461034957600080fd5b8062ce8e3e146102785780630ec22747146102965780631c786ce0146102c4578063289035c7146102d95780632a3606d5146102ec575b600080fd5b610280610662565b60405161028d9190611760565b60405180910390f35b6102b66102a43660046117c9565b60076020526000908152604090205481565b60405190815260200161028d565b6102d76102d23660046117eb565b6106c4565b005b6102d76102e7366004611861565b610713565b6102d76108df565b436102b6565b6102d7610308366004611925565b6109f9565b61032061031b366004611925565b610a28565b6040516001600160a01b03909116815260200161028d565b6102b6610a52565b6102b6600f5481565b6102d761035736600461193e565b610c0e565b6009546102b6565b6102b66103723660046117c9565b60106020526000908152604090205481565b6102d7610392366004611971565b610de2565b6102b66103a53660046119aa565b610e40565b6103bd6103b83660046119cc565b610f1b565b60405161028d93929190611a49565b6102b66103da366004611925565b60036020526000908152604090205481565b6102b66103fa3660046117c9565b60026020526000908152604090205481565b6102b661041a3660046117c9565b600c6020526000908152604090205481565b6102b660115481565b6102d76104433660046119aa565b61115d565b6102d7610456366004611925565b611192565b6102d76104693660046117c9565b611260565b600554610320906001600160a01b031681565b6000805b6040805192835260208301919091520161028d565b6102b66104a83660046117c9565b600d6020526000908152604090205481565b6102b6600e5481565b6102d76104d1366004611861565b6112ac565b6102d7611343565b6102d76104ec366004611925565b601455565b6102d76104ff366004611971565b611373565b6102d76105123660046117eb565b6114ad565b6102d76105253660046117eb565b6001600160a01b03909116600090815260026020526040902055565b61048561054f3660046117c9565b61154e565b6102b66105623660046117c9565b60016020526000908152604090205481565b6105976105823660046117c9565b60156020526000908152604090205460ff1681565b604051901515815260200161028d565b6102d76105b5366004611a8c565b611628565b6102d76105c8366004611925565b611675565b6105976105db3660046117c9565b60136020526000908152604090205460ff1681565b6102b66105fe3660046117c9565b60086020526000908152604090205481565b6102b660125481565b6102d7610627366004611ad8565b6116a4565b61059761063a3660046117c9565b600a6020526000908152604090205460ff1681565b600654610320906001600160a01b031681565b6060600b8054806020026020016040519081016040528092919081815260200182805480156106ba57602002820191906000526020600020905b81546001600160a01b0316815260019091019060200180831161069c575b5050505050905090565b6005546001600160a01b031633146106f75760405162461bcd60e51b81526004016106ee90611b44565b60405180910390fd5b6001600160a01b039091166000908152600c6020526040902055565b60005b878110156108a75761079889898381811061073357610733611b64565b905060200201602081019061074891906117c9565b88888481811061075a5761075a611b64565b9050602002013587878581811061077357610773611b64565b9050602002013586868681811061078c5761078c611b64565b90506020020135611373565b600a60008a8a848181106107ae576107ae611b64565b90506020020160208101906107c391906117c9565b6001600160a01b0316815260208101919091526040016000205460ff16610895576001600a60008b8b858181106107fc576107fc611b64565b905060200201602081019061081191906117c9565b6001600160a01b031681526020810191909152604001600020805460ff1916911515919091179055600b89898381811061084d5761084d611b64565b905060200201602081019061086291906117c9565b81546001810183556000928352602090922090910180546001600160a01b0319166001600160a01b039092169190911790555b8061089f81611b90565b915050610716565b506040517f2d25400765776242d664638c9c6b84875af2835cfa621d55979981e9bd8d67a590600090a1505042600955505050505050565b336000908152600c6020526040902054156109255760405162461bcd60e51b81526020600482015260066024820152650d0c2e684def60d31b60448201526064016106ee565b336000908152600d60209081526040808320546010835281842054600284528285205460088552838620546007909552928520549194909390929161096a9190611ba9565b6109749190611ba9565b905060006109828385611ba9565b8211156109a157836109948484611bbc565b61099e9190611bbc565b90505b600f548111156109f357600f5433600090815260106020526040812080549091906109cd908490611ba9565b9091555050336000908152600c602052604081208054916109ed83611b90565b91905055505b50505050565b6005546001600160a01b03163314610a235760405162461bcd60e51b81526004016106ee90611b44565b600f55565b600b8181548110610a3857600080fd5b6000918252602090912001546001600160a01b0316905081565b3360009081526001602090815260408083205460029092528220548291610a7891611bbc565b600480546040516302b0540360e31b815233928101929092529192506000916001600160a01b031690631582a01890602401602060405180830381865afa158015610ac7573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610aeb9190611bcf565b600081815260036020526040812054919250610b0a82620f4240611be8565b610b1785620f4240611be8565b610b219190611c15565b60065460405163a9059cbb60e01b8152336004820152602481018390529192506001600160a01b03169063a9059cbb906044016020604051808303816000875af1158015610b73573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b979190611c29565b5060065460408051868152602081018690529081018390526001600160a01b039091169033907ff8b680a8b775e82d2dcf9aad6301ed13b0563379af7820e6495737a4abf3bfbe9060600160405180910390a333600090815260026020908152604080832054600190925290912055949350505050565b600054610100900460ff1615808015610c2e5750600054600160ff909116105b80610c485750303b158015610c48575060005460ff166001145b610cab5760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b60648201526084016106ee565b6000805460ff191660011790558015610cce576000805461ff0019166101001790555b600480546001600160a01b038086166001600160a01b03199283161790925560068054928516928216929092179091556005805490911633179055600360205261029e7f3617319a054d772f909f7c479a2cebe5066e836a939412e32403c99029b92eff5561014f7fa15bc60c955c405d20d9149c709e2460f1c2d9a497496a7f46004d1772c3054c55600260005260e17fc3a24b0501bd2c13a7e57f2db4369ec4c223447539fc0724a9d55ac4a06ebd4d55612710600e819055600f81905560115561c3506012558015610ddd576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b505050565b6005546001600160a01b03163314610e0c5760405162461bcd60e51b81526004016106ee90611b44565b6001600160a01b03909316600090815260076020908152604080832094909455600881528382209290925560029091522055565b6000828211610e815760405162461bcd60e51b815260206004820152600d60248201526c496e76616c69642072616e676560981b60448201526064016106ee565b6000610e8d8484611bbc565b610e98906001611ba9565b90506000610ea7600143611bbc565b604080519140602083018190526bffffffffffffffffffffffff193360601b1691830191909152426054830152915060009060740160408051601f19818403018152919052805160209091012090506000610f028483611c4b565b9050610f0e8188611ba9565b9450505050505b92915050565b6060808060008467ffffffffffffffff811115610f3a57610f3a611c5f565b604051908082528060200260200182016040528015610f63578160200160208202803683370190505b50905060008567ffffffffffffffff811115610f8157610f81611c5f565b604051908082528060200260200182016040528015610faa578160200160208202803683370190505b50905060008667ffffffffffffffff811115610fc857610fc8611c5f565b604051908082528060200260200182016040528015610ff1578160200160208202803683370190505b50905060005b8781101561114e57600760008a8a8481811061101557611015611b64565b905060200201602081019061102a91906117c9565b6001600160a01b03166001600160a01b031681526020019081526020016000205484828151811061105d5761105d611b64565b602002602001018181525050600860008a8a8481811061107f5761107f611b64565b905060200201602081019061109491906117c9565b6001600160a01b03166001600160a01b03168152602001908152602001600020548382815181106110c7576110c7611b64565b602002602001018181525050600260008a8a848181106110e9576110e9611b64565b90506020020160208101906110fe91906117c9565b6001600160a01b03166001600160a01b031681526020019081526020016000205482828151811061113157611131611b64565b60209081029190910101528061114681611b90565b915050610ff7565b50919450925090509250925092565b6005546001600160a01b031633146111875760405162461bcd60e51b81526004016106ee90611b44565b601191909155601255565b60145481146111d45760405162461bcd60e51b815260206004820152600e60248201526d77726f6e672070617373636f646560901b60448201526064016106ee565b3360009081526015602052604090205460ff161561121e5760405162461bcd60e51b815260206004820152600760248201526618db185a5b595960ca1b60448201526064016106ee565b336000908152600c6020526040812080546014929061123e908490611ba9565b9091555050336000908152601560205260409020805460ff1916600117905550565b6005546001600160a01b0316331461128a5760405162461bcd60e51b81526004016106ee90611b44565b600680546001600160a01b0319166001600160a01b0392909216919091179055565b60005b878110156108a7576113318989838181106112cc576112cc611b64565b90506020020160208101906112e191906117c9565b8888848181106112f3576112f3611b64565b9050602002013587878581811061130c5761130c611b64565b9050602002013586868681811061132557611325611b64565b90506020020135610de2565b8061133b81611b90565b9150506112af565b6005546001600160a01b0316331461136d5760405162461bcd60e51b81526004016106ee90611b44565b42600955565b6005546001600160a01b0316331461139d5760405162461bcd60e51b81526004016106ee90611b44565b6001600160a01b038416600090815260076020526040812080548592906113c5908490611ba9565b90915550506001600160a01b038416600090815260086020526040812080548492906113f2908490611ba9565b90915550506001600160a01b0384166000908152600260205260408120805483929061141f908490611ba9565b90915550506001600160a01b0384166000908152600a602052604090205460ff166109f3575050506001600160a01b03166000818152600a60205260408120805460ff19166001908117909155600b805491820181559091527f0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01db90180546001600160a01b0319169091179055565b6005546001600160a01b031633146114d75760405162461bcd60e51b81526004016106ee90611b44565b60055460405163a9059cbb60e01b81526001600160a01b039182166004820152602481018390529083169063a9059cbb906044016020604051808303816000875af115801561152a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ddd9190611c29565b6001600160a01b0381166000908152600c602090815260408083205460028352818420546008845282852054600790945291842054849391929161159191611ba9565b61159b9190611ba9565b6001600160a01b0385166000908152600d60205260409020549092508083106115dc57600e546115cb8285611bbc565b6115d59190611c15565b93506115e1565b600093505b8184106115ee57816115f0565b835b6001600160a01b03861660009081526013602052604090205490945060ff16611621578361161d81611b90565b9450505b5050915091565b60005b828110156109f35761166384848381811061164857611648611b64565b905060200201602081019061165d91906117c9565b836106c4565b8061166d81611b90565b91505061162b565b6005546001600160a01b0316331461169f5760405162461bcd60e51b81526004016106ee90611b44565b600e55565b8281146116dd5760405162461bcd60e51b8152602060048201526007602482015266042d8cadccee8d60cb1b60448201526064016106ee565b60005b83811015611759576117478585838181106116fd576116fd611b64565b905060200201602081019061171291906117c9565b84848481811061172457611724611b64565b905060200201356001600160a01b03909116600090815260026020526040902055565b8061175181611b90565b9150506116e0565b5050505050565b6020808252825182820181905260009190848201906040850190845b818110156117a15783516001600160a01b03168352928401929184019160010161177c565b50909695505050505050565b80356001600160a01b03811681146117c457600080fd5b919050565b6000602082840312156117db57600080fd5b6117e4826117ad565b9392505050565b600080604083850312156117fe57600080fd5b611807836117ad565b946020939093013593505050565b60008083601f84011261182757600080fd5b50813567ffffffffffffffff81111561183f57600080fd5b6020830191508360208260051b850101111561185a57600080fd5b9250929050565b6000806000806000806000806080898b03121561187d57600080fd5b883567ffffffffffffffff8082111561189557600080fd5b6118a18c838d01611815565b909a50985060208b01359150808211156118ba57600080fd5b6118c68c838d01611815565b909850965060408b01359150808211156118df57600080fd5b6118eb8c838d01611815565b909650945060608b013591508082111561190457600080fd5b506119118b828c01611815565b999c989b5096995094979396929594505050565b60006020828403121561193757600080fd5b5035919050565b6000806040838503121561195157600080fd5b61195a836117ad565b9150611968602084016117ad565b90509250929050565b6000806000806080858703121561198757600080fd5b611990856117ad565b966020860135965060408601359560600135945092505050565b600080604083850312156119bd57600080fd5b50508035926020909101359150565b600080602083850312156119df57600080fd5b823567ffffffffffffffff8111156119f657600080fd5b611a0285828601611815565b90969095509350505050565b600081518084526020808501945080840160005b83811015611a3e57815187529582019590820190600101611a22565b509495945050505050565b606081526000611a5c6060830186611a0e565b8281036020840152611a6e8186611a0e565b90508281036040840152611a828185611a0e565b9695505050505050565b600080600060408486031215611aa157600080fd5b833567ffffffffffffffff811115611ab857600080fd5b611ac486828701611815565b909790965060209590950135949350505050565b60008060008060408587031215611aee57600080fd5b843567ffffffffffffffff80821115611b0657600080fd5b611b1288838901611815565b90965094506020870135915080821115611b2b57600080fd5b50611b3887828801611815565b95989497509550505050565b60208082526006908201526510b7bbb732b960d11b604082015260600190565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600060018201611ba257611ba2611b7a565b5060010190565b80820180821115610f1557610f15611b7a565b81810381811115610f1557610f15611b7a565b600060208284031215611be157600080fd5b5051919050565b8082028115828204841417610f1557610f15611b7a565b634e487b7160e01b600052601260045260246000fd5b600082611c2457611c24611bff565b500490565b600060208284031215611c3b57600080fd5b815180151581146117e457600080fd5b600082611c5a57611c5a611bff565b500690565b634e487b7160e01b600052604160045260246000fdfea2646970667358221220b62b24a2a627fe0c4e9288fbd0ec9b64512fb1bc08b48719af83b06680150cfd64736f6c63430008120033";

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
