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
  "0x608060405234801561001057600080fd5b50612087806100206000396000f3fe608060405234801561001057600080fd5b50600436106102735760003560e01c80638aee812711610151578063bc8c67a2116100c3578063da7dd8ca11610087578063da7dd8ca146105d1578063dc8417e0146105f4578063ea2277ad14610614578063f1f915181461061d578063f794062e14610630578063f7c618c11461065357600080fd5b8063bc8c67a214610545578063c1c4eec314610558578063c884ef8314610578578063d0c5de6a146105ab578063d375c81d146105be57600080fd5b8063ab5b5e8411610115578063ab5b5e84146104c7578063af592d27146104da578063b1f1f653146104e2578063b60f1840146104f5578063b753a98c14610508578063b901164b1461051b57600080fd5b80638aee81271461045b5780638da5cb5b1461046e57806393196a6d146104815780639aa1f9b21461049e578063a60b7b70146104be57600080fd5b80634c89867f116101ea5780636143e733116101ae5780636143e733146103cc578063673d66ad146103ec578063705f40c71461040c57806380f2fb6f1461042c57806387dcbbc114610435578063880489e01461044857600080fd5b80634c89867f1461035c5780634f26af421461036457806351d08cd51461038457806357175f8c146103975780635ffab0e3146103aa57600080fd5b80632e97766d1161023c5780632e97766d146102f457806330291a3e146102fa578063365b98b21461030d578063372500ab146103385780633798443b14610340578063485cc9551461034957600080fd5b8062ce8e3e146102785780630ec22747146102965780631c786ce0146102c4578063289035c7146102d95780632a3606d5146102ec575b600080fd5b610280610666565b60405161028d9190611ac2565b60405180910390f35b6102b66102a4366004611b2b565b60076020526000908152604090205481565b60405190815260200161028d565b6102d76102d2366004611b4d565b6106c8565b005b6102d76102e7366004611bc3565b610717565b6102d76108e3565b436102b6565b6102d7610308366004611c87565b6109fd565b61032061031b366004611c87565b610a2c565b6040516001600160a01b03909116815260200161028d565b6102b6610a56565b6102b6600f5481565b6102d7610357366004611ca0565b610c12565b6009546102b6565b6102b6610372366004611b2b565b60106020526000908152604090205481565b6102d7610392366004611cd3565b610de6565b6102b66103a5366004611d0c565b610e44565b6103bd6103b8366004611d2e565b610f1f565b60405161028d93929190611dab565b6102b66103da366004611c87565b60036020526000908152604090205481565b6102b66103fa366004611b2b565b60026020526000908152604090205481565b6102b661041a366004611b2b565b600c6020526000908152604090205481565b6102b660115481565b6102d7610443366004611d0c565b611161565b6102d7610456366004611c87565b611196565b6102d7610469366004611b2b565b611264565b600554610320906001600160a01b031681565b6104896112b0565b6040805192835260208301919091520161028d565b6102b66104ac366004611b2b565b600d6020526000908152604090205481565b6102b6600e5481565b6102d76104d5366004611bc3565b611568565b6102d76115ff565b6102d76104f0366004611c87565b601455565b6102d7610503366004611cd3565b61162f565b6102d7610516366004611b4d565b611769565b6102d7610529366004611b4d565b6001600160a01b03909116600090815260026020526040902055565b610489610553366004611b2b565b61180a565b6102b6610566366004611b2b565b60016020526000908152604090205481565b61059b610586366004611b2b565b60156020526000908152604090205460ff1681565b604051901515815260200161028d565b6102d76105b9366004611dee565b611925565b6102d76105cc366004611c87565b611972565b61059b6105df366004611b2b565b60136020526000908152604090205460ff1681565b6102b6610602366004611b2b565b60086020526000908152604090205481565b6102b660125481565b6102d761062b366004611e3a565b6119a1565b61059b61063e366004611b2b565b600a6020526000908152604090205460ff1681565b600654610320906001600160a01b031681565b6060600b8054806020026020016040519081016040528092919081815260200182805480156106be57602002820191906000526020600020905b81546001600160a01b031681526001909101906020018083116106a0575b5050505050905090565b6005546001600160a01b031633146106fb5760405162461bcd60e51b81526004016106f290611ea6565b60405180910390fd5b6001600160a01b039091166000908152600c6020526040902055565b60005b878110156108ab5761079c89898381811061073757610737611ec6565b905060200201602081019061074c9190611b2b565b88888481811061075e5761075e611ec6565b9050602002013587878581811061077757610777611ec6565b9050602002013586868681811061079057610790611ec6565b9050602002013561162f565b600a60008a8a848181106107b2576107b2611ec6565b90506020020160208101906107c79190611b2b565b6001600160a01b0316815260208101919091526040016000205460ff16610899576001600a60008b8b8581811061080057610800611ec6565b90506020020160208101906108159190611b2b565b6001600160a01b031681526020810191909152604001600020805460ff1916911515919091179055600b89898381811061085157610851611ec6565b90506020020160208101906108669190611b2b565b81546001810183556000928352602090922090910180546001600160a01b0319166001600160a01b039092169190911790555b806108a381611ef2565b91505061071a565b506040517f2d25400765776242d664638c9c6b84875af2835cfa621d55979981e9bd8d67a590600090a1505042600955505050505050565b336000908152600c6020526040902054156109295760405162461bcd60e51b81526020600482015260066024820152650d0c2e684def60d31b60448201526064016106f2565b336000908152600d60209081526040808320546010835281842054600284528285205460088552838620546007909552928520549194909390929161096e9190611f0b565b6109789190611f0b565b905060006109868385611f0b565b8211156109a557836109988484611f1e565b6109a29190611f1e565b90505b600f548111156109f757600f5433600090815260106020526040812080549091906109d1908490611f0b565b9091555050336000908152600c602052604081208054916109f183611ef2565b91905055505b50505050565b6005546001600160a01b03163314610a275760405162461bcd60e51b81526004016106f290611ea6565b600f55565b600b8181548110610a3c57600080fd5b6000918252602090912001546001600160a01b0316905081565b3360009081526001602090815260408083205460029092528220548291610a7c91611f1e565b600480546040516302b0540360e31b815233928101929092529192506000916001600160a01b031690631582a01890602401602060405180830381865afa158015610acb573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610aef9190611f31565b600081815260036020526040812054919250610b0e82620f4240611f4a565b610b1b85620f4240611f4a565b610b259190611f77565b60065460405163a9059cbb60e01b8152336004820152602481018390529192506001600160a01b03169063a9059cbb906044016020604051808303816000875af1158015610b77573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b9b9190611f8b565b5060065460408051868152602081018690529081018390526001600160a01b039091169033907ff8b680a8b775e82d2dcf9aad6301ed13b0563379af7820e6495737a4abf3bfbe9060600160405180910390a333600090815260026020908152604080832054600190925290912055949350505050565b600054610100900460ff1615808015610c325750600054600160ff909116105b80610c4c5750303b158015610c4c575060005460ff166001145b610caf5760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b60648201526084016106f2565b6000805460ff191660011790558015610cd2576000805461ff0019166101001790555b600480546001600160a01b038086166001600160a01b03199283161790925560068054928516928216929092179091556005805490911633179055600360205261029e7f3617319a054d772f909f7c479a2cebe5066e836a939412e32403c99029b92eff5561014f7fa15bc60c955c405d20d9149c709e2460f1c2d9a497496a7f46004d1772c3054c55600260005260e17fc3a24b0501bd2c13a7e57f2db4369ec4c223447539fc0724a9d55ac4a06ebd4d55612710600e819055600f81905560115561c3506012558015610de1576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b505050565b6005546001600160a01b03163314610e105760405162461bcd60e51b81526004016106f290611ea6565b6001600160a01b03909316600090815260076020908152604080832094909455600881528382209290925560029091522055565b6000828211610e855760405162461bcd60e51b815260206004820152600d60248201526c496e76616c69642072616e676560981b60448201526064016106f2565b6000610e918484611f1e565b610e9c906001611f0b565b90506000610eab600143611f1e565b604080519140602083018190526bffffffffffffffffffffffff193360601b1691830191909152426054830152915060009060740160408051601f19818403018152919052805160209091012090506000610f068483611fad565b9050610f128188611f0b565b9450505050505b92915050565b6060808060008467ffffffffffffffff811115610f3e57610f3e611fc1565b604051908082528060200260200182016040528015610f67578160200160208202803683370190505b50905060008567ffffffffffffffff811115610f8557610f85611fc1565b604051908082528060200260200182016040528015610fae578160200160208202803683370190505b50905060008667ffffffffffffffff811115610fcc57610fcc611fc1565b604051908082528060200260200182016040528015610ff5578160200160208202803683370190505b50905060005b8781101561115257600760008a8a8481811061101957611019611ec6565b905060200201602081019061102e9190611b2b565b6001600160a01b03166001600160a01b031681526020019081526020016000205484828151811061106157611061611ec6565b602002602001018181525050600860008a8a8481811061108357611083611ec6565b90506020020160208101906110989190611b2b565b6001600160a01b03166001600160a01b03168152602001908152602001600020548382815181106110cb576110cb611ec6565b602002602001018181525050600260008a8a848181106110ed576110ed611ec6565b90506020020160208101906111029190611b2b565b6001600160a01b03166001600160a01b031681526020019081526020016000205482828151811061113557611135611ec6565b60209081029190910101528061114a81611ef2565b915050610ffb565b50919450925090509250925092565b6005546001600160a01b0316331461118b5760405162461bcd60e51b81526004016106f290611ea6565b601191909155601255565b60145481146111d85760405162461bcd60e51b815260206004820152600e60248201526d77726f6e672070617373636f646560901b60448201526064016106f2565b3360009081526015602052604090205460ff16156112225760405162461bcd60e51b815260206004820152600760248201526618db185a5b595960ca1b60448201526064016106f2565b336000908152600c60205260408120805460149290611242908490611f0b565b9091555050336000908152601560205260409020805460ff1916600117905550565b6005546001600160a01b0316331461128e5760405162461bcd60e51b81526004016106f290611ea6565b600680546001600160a01b0319166001600160a01b0392909216919091179055565b336000908152600c602052604081205481906112f75760405162461bcd60e51b81526004016106f290602080825260049082015263060c4def60e31b604082015260600190565b3360009081526013602052604090205460ff1661142c57336000908152600c6020526040812080549161132983611fd7565b9091555050336000908152601360205260408120805460ff191660011790556011546012546113589190610e44565b9050600061136e82670de0b6b3a7640000611f4a565b60065460405163a9059cbb60e01b8152336004820152602481018390529192506001600160a01b03169063a9059cbb906044016020604051808303816000875af11580156113c0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113e49190611f8b565b50604080516000808252602082015233917f556f2cd053c19fa678c33006534a7ba4416fc1737d8dfebdf44da21c443222a2910160405180910390a250600093849350915050565b6000806114383361180a565b600e54336000908152600d602052604081208054949650929450909261145f908490611f0b565b9091555050336000908152600c6020526040812080549161147f83611fd7565b91905055506000611494601154601254610e44565b905060006114aa82670de0b6b3a7640000611f4a565b60065460405163a9059cbb60e01b8152336004820152602481018390529192506001600160a01b03169063a9059cbb906044016020604051808303816000875af11580156114fc573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115209190611f8b565b50604080518581526020810184905233917f556f2cd053c19fa678c33006534a7ba4416fc1737d8dfebdf44da21c443222a2910160405180910390a250919491935090915050565b60005b878110156108ab576115ed89898381811061158857611588611ec6565b905060200201602081019061159d9190611b2b565b8888848181106115af576115af611ec6565b905060200201358787858181106115c8576115c8611ec6565b905060200201358686868181106115e1576115e1611ec6565b90506020020135610de6565b806115f781611ef2565b91505061156b565b6005546001600160a01b031633146116295760405162461bcd60e51b81526004016106f290611ea6565b42600955565b6005546001600160a01b031633146116595760405162461bcd60e51b81526004016106f290611ea6565b6001600160a01b03841660009081526007602052604081208054859290611681908490611f0b565b90915550506001600160a01b038416600090815260086020526040812080548492906116ae908490611f0b565b90915550506001600160a01b038416600090815260026020526040812080548392906116db908490611f0b565b90915550506001600160a01b0384166000908152600a602052604090205460ff166109f7575050506001600160a01b03166000818152600a60205260408120805460ff19166001908117909155600b805491820181559091527f0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01db90180546001600160a01b0319169091179055565b6005546001600160a01b031633146117935760405162461bcd60e51b81526004016106f290611ea6565b60055460405163a9059cbb60e01b81526001600160a01b039182166004820152602481018390529083169063a9059cbb906044016020604051808303816000875af11580156117e6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610de19190611f8b565b6001600160a01b0381166000908152600c602090815260408083205460028352818420546008845282852054600790945291842054849391929161184d91611f0b565b6118579190611f0b565b91506000600d6000866001600160a01b03166001600160a01b031681526020019081526020016000205490506118b46040518060400160405280600b81526020016a746f74616c706f696e747360a81b8152508483600e54611a5d565b8083106118d957600e546118c88285611f1e565b6118d29190611f77565b93506118de565b600093505b8184106118eb57816118ed565b835b6001600160a01b03861660009081526013602052604090205490945060ff1661191e578361191a81611ef2565b9450505b5050915091565b60005b828110156109f75761196084848381811061194557611945611ec6565b905060200201602081019061195a9190611b2b565b836106c8565b8061196a81611ef2565b915050611928565b6005546001600160a01b0316331461199c5760405162461bcd60e51b81526004016106f290611ea6565b600e55565b8281146119da5760405162461bcd60e51b8152602060048201526007602482015266042d8cadccee8d60cb1b60448201526064016106f2565b60005b83811015611a5657611a448585838181106119fa576119fa611ec6565b9050602002016020810190611a0f9190611b2b565b848484818110611a2157611a21611ec6565b905060200201356001600160a01b03909116600090815260026020526040902055565b80611a4e81611ef2565b9150506119dd565b5050505050565b6109f784848484604051602401611a779493929190611fee565b60408051601f198184030181529190526020810180516001600160e01b03166304772b3360e11b17905280516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b6020808252825182820181905260009190848201906040850190845b81811015611b035783516001600160a01b031683529284019291840191600101611ade565b50909695505050505050565b80356001600160a01b0381168114611b2657600080fd5b919050565b600060208284031215611b3d57600080fd5b611b4682611b0f565b9392505050565b60008060408385031215611b6057600080fd5b611b6983611b0f565b946020939093013593505050565b60008083601f840112611b8957600080fd5b50813567ffffffffffffffff811115611ba157600080fd5b6020830191508360208260051b8501011115611bbc57600080fd5b9250929050565b6000806000806000806000806080898b031215611bdf57600080fd5b883567ffffffffffffffff80821115611bf757600080fd5b611c038c838d01611b77565b909a50985060208b0135915080821115611c1c57600080fd5b611c288c838d01611b77565b909850965060408b0135915080821115611c4157600080fd5b611c4d8c838d01611b77565b909650945060608b0135915080821115611c6657600080fd5b50611c738b828c01611b77565b999c989b5096995094979396929594505050565b600060208284031215611c9957600080fd5b5035919050565b60008060408385031215611cb357600080fd5b611cbc83611b0f565b9150611cca60208401611b0f565b90509250929050565b60008060008060808587031215611ce957600080fd5b611cf285611b0f565b966020860135965060408601359560600135945092505050565b60008060408385031215611d1f57600080fd5b50508035926020909101359150565b60008060208385031215611d4157600080fd5b823567ffffffffffffffff811115611d5857600080fd5b611d6485828601611b77565b90969095509350505050565b600081518084526020808501945080840160005b83811015611da057815187529582019590820190600101611d84565b509495945050505050565b606081526000611dbe6060830186611d70565b8281036020840152611dd08186611d70565b90508281036040840152611de48185611d70565b9695505050505050565b600080600060408486031215611e0357600080fd5b833567ffffffffffffffff811115611e1a57600080fd5b611e2686828701611b77565b909790965060209590950135949350505050565b60008060008060408587031215611e5057600080fd5b843567ffffffffffffffff80821115611e6857600080fd5b611e7488838901611b77565b90965094506020870135915080821115611e8d57600080fd5b50611e9a87828801611b77565b95989497509550505050565b60208082526006908201526510b7bbb732b960d11b604082015260600190565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600060018201611f0457611f04611edc565b5060010190565b80820180821115610f1957610f19611edc565b81810381811115610f1957610f19611edc565b600060208284031215611f4357600080fd5b5051919050565b8082028115828204841417610f1957610f19611edc565b634e487b7160e01b600052601260045260246000fd5b600082611f8657611f86611f61565b500490565b600060208284031215611f9d57600080fd5b81518015158114611b4657600080fd5b600082611fbc57611fbc611f61565b500690565b634e487b7160e01b600052604160045260246000fd5b600081611fe657611fe6611edc565b506000190190565b608081526000855180608084015260005b8181101561201c57602081890181015160a0868401015201611fff565b50600060a0828501015260a0601f19601f8301168401019150508460208301528360408301528260608301529594505050505056fea2646970667358221220d9b4097509da721ce5745cb0c784c4f51c6be44ddda7f829b8e01014690c651164736f6c63430008120033";

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
