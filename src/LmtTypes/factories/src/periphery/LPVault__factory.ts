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
  LPVault,
  LPVaultInterface,
} from "../../../src/periphery/LPVault";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "priceFeed",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_taxRate",
        type: "uint256",
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
        name: "caller",
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
        name: "token",
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
        name: "amount",
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
    name: "Use",
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
    name: "Withdraw",
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
        name: "tokenAddress",
        type: "address",
      },
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
    name: "depositAnyToken",
    outputs: [
      {
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllTokens",
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
        name: "tokenAddress",
        type: "address",
      },
    ],
    name: "maxRedeemableInToken",
    outputs: [
      {
        internalType: "uint256",
        name: "assets",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxShares",
        type: "uint256",
      },
    ],
    stateMutability: "view",
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
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
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
    name: "redeemToAnyToken",
    outputs: [
      {
        internalType: "uint256",
        name: "assets",
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
        name: "tokenAddress",
        type: "address",
      },
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
        internalType: "address",
        name: "_priceFeed",
        type: "address",
      },
    ],
    name: "setPricefeed",
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
    inputs: [
      {
        internalType: "uint256",
        name: "_taxRate",
        type: "uint256",
      },
    ],
    name: "setTaxRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    name: "setToken",
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
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
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
        name: "totalAsset",
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
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
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
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
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
] as const;

const _bytecode =
  "0x60e06040523480156200001157600080fd5b506040516200258238038062002582833981016040819052620000349162000207565b8181601260006200004684826200032a565b5060016200005583826200032a565b5060ff81166080524660a0526200006b620000a6565b60c0525050600b80546001600160a01b039096166001600160a01b03199687161790555050600980549093163317909255600a555062000474565b60007f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f6000604051620000da9190620003f6565b6040805191829003822060208301939093528101919091527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608201524660808201523060a082015260c00160405160208183030381529060405280519060200120905090565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126200016a57600080fd5b81516001600160401b038082111562000187576200018762000142565b604051601f8301601f19908116603f01168101908282118183101715620001b257620001b262000142565b81604052838152602092508683858801011115620001cf57600080fd5b600091505b83821015620001f35785820183015181830184015290820190620001d4565b600093810190920192909252949350505050565b600080600080608085870312156200021e57600080fd5b84516001600160a01b03811681146200023657600080fd5b6020860151604087015191955093506001600160401b03808211156200025b57600080fd5b620002698883890162000158565b935060608701519150808211156200028057600080fd5b506200028f8782880162000158565b91505092959194509250565b600181811c90821680620002b057607f821691505b602082108103620002d157634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200032557600081815260208120601f850160051c81016020861015620003005750805b601f850160051c820191505b8181101562000321578281556001016200030c565b5050505b505050565b81516001600160401b0381111562000346576200034662000142565b6200035e816200035784546200029b565b84620002d7565b602080601f8311600181146200039657600084156200037d5750858301515b600019600386901b1c1916600185901b17855562000321565b600085815260208120601f198616915b82811015620003c757888601518255948401946001909101908401620003a6565b5085821015620003e65787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b600080835462000406816200029b565b60018281168015620004215760018114620004375762000468565b60ff198416875282151583028701945062000468565b8760005260208060002060005b858110156200045f5781548a82015290840190820162000444565b50505082870194505b50929695505050505050565b60805160a05160c0516120de620004a46000396000610a4a01526000610a15015260006102ad01526120de6000f3fe608060405234801561001057600080fd5b50600436106101cf5760003560e01c80637ecebe0011610104578063c7b9d530116100a2578063dd62ed3e11610071578063dd62ed3e1461040f578063eab476551461043a578063eedc966a1461044d578063ef8b30f71461046d57600080fd5b8063c7b9d530146103c3578063d505accf146103d6578063d6724a2d146103e9578063d95c409b146103fc57600080fd5b8063b0071c81116100de578063b0071c811461036a578063c15973eb1461037d578063c6d69a301461039d578063c6e6f592146103b057600080fd5b80637ecebe001461032f57806395d89b411461034f578063a9059cbb1461035757600080fd5b806323b872dd116101715780633644e5151161014b5780633644e515146102e157806349327ed0146102e95780634cdad506146102fc57806370a082311461030f57600080fd5b806323b872dd146102805780632a5c792a14610293578063313ce567146102a857600080fd5b8063095ea7b3116101ad578063095ea7b3146102175780630d95f6bc1461023a578063144fa6d71461026257806318160ddd1461027757600080fd5b806301e1d114146101d457806306fdde03146101ef57806307a2d13a14610204575b600080fd5b6101dc610480565b6040519081526020015b60405180910390f35b6101f761059b565b6040516101e69190611afd565b6101dc610212366004611b10565b610629565b61022a610225366004611b45565b610656565b60405190151581526020016101e6565b61024d610248366004611b6f565b6106c3565b604080519283526020830191909152016101e6565b610275610270366004611b6f565b6107e1565b005b6101dc60025481565b61022a61028e366004611b8a565b610866565b61029b6109af565b6040516101e69190611bc6565b6102cf7f000000000000000000000000000000000000000000000000000000000000000081565b60405160ff90911681526020016101e6565b6101dc610a11565b6101dc6102f7366004611c13565b610a6c565b6101dc61030a366004611b10565b610c13565b6101dc61031d366004611b6f565b60036020526000908152604090205481565b6101dc61033d366004611b6f565b60056020526000908152604090205481565b6101f7610c1e565b61022a610365366004611b45565b610c2b565b610275610378366004611b6f565b610cc2565b6101dc61038b366004611b6f565b60076020526000908152604090205481565b6102756103ab366004611b10565b610d0e565b6101dc6103be366004611b10565b610d3d565b6102756103d1366004611b6f565b610d5d565b6102756103e4366004611c5e565b610db0565b6102756103f7366004611b45565b610ff4565b6101dc61040a366004611ccb565b611134565b6101dc61041d366004611d18565b600460209081526000928352604080842090915290825290205481565b610275610448366004611d4b565b61140c565b6101dc61045b366004611b6f565b60066020526000908152604090205481565b6101dc61047b366004611b10565b61160a565b6000806000805b60085481101561059557600881815481106104a4576104a4611d7e565b6000918252602090912001546001600160a01b031692506104c483611615565b9150826001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015610504573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105289190611d94565b610533906012611dc7565b61053e90600a611ec4565b6105489083611ed3565b6001600160a01b0384166000908152600660205260409020549092506105779083670de0b6b3a7640000611684565b6105819085611eea565b93508061058d81611efd565b915050610487565b50505090565b600080546105a890611f16565b80601f01602080910402602001604051908101604052809291908181526020018280546105d490611f16565b80156106215780601f106105f657610100808354040283529160200191610621565b820191906000526020600020905b81548152906001019060200180831161060457829003601f168201915b505050505081565b600254600090801561064d57610648610640610480565b849083611684565b61064f565b825b9392505050565b3360008181526004602090815260408083206001600160a01b038716808552925280832085905551919290917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925906106b19086815260200190565b60405180910390a35060015b92915050565b60008060006106d184611615565b90506000846001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015610713573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107379190611d94565b6001600160a01b03861660009081526007602090815260408083205460069092529091205460ff92909216925011156107715760006107a0565b6001600160a01b0385166000908152600760209081526040808320546006909252909120546107a09190611f50565b93506107ad816012611f50565b6107b890600a611f63565b6107ce61047b8685670de0b6b3a7640000611684565b6107d89190611ed3565b92505050915091565b6009546001600160a01b031633146108145760405162461bcd60e51b815260040161080b90611f6f565b60405180910390fd5b600880546001810182556000919091527ff3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee30180546001600160a01b0319166001600160a01b0392909216919091179055565b6001600160a01b0383166000908152600360205260408120548211156108b95760405162461bcd60e51b81526020600482015260086024820152672162616c616e636560c01b604482015260640161080b565b6001600160a01b03841660009081526004602090815260408083203384529091529020548281101561091a5760405162461bcd60e51b815260206004820152600a60248201526921616c6c6f77616e636560b01b604482015260640161080b565b600019811461094c576001600160a01b0385166000908152600460209081526040808320338452909152902083820390555b6001600160a01b03808616600081815260036020526040808220805488900390559287168082529083902080548701905591516000805160206120898339815191529061099c9087815260200190565b60405180910390a3506001949350505050565b60606008805480602002602001604051908101604052809291908181526020018280548015610a0757602002820191906000526020600020905b81546001600160a01b031681526001909101906020018083116109e9575b5050505050905090565b60007f00000000000000000000000000000000000000000000000000000000000000004614610a4757610a42611762565b905090565b507f000000000000000000000000000000000000000000000000000000000000000090565b600080846001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015610aad573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ad19190611d94565b610adc906012611dc7565b610ae790600a611ec4565b610b03610af387611615565b8690670de0b6b3a7640000611684565b610b0d9190611ed3565b90506000610b2b600a54620f4240846116849092919063ffffffff16565b610b359083611f50565b9050610b408161160a565b925082600003610b805760405162461bcd60e51b815260206004820152600b60248201526a5a45524f5f53484152455360a81b604482015260640161080b565b6001600160a01b03861660009081526006602052604081208054879290610ba8908490611eea565b90915550610bba9050863330886117fc565b610bc48484611886565b60408051828152602081018590526001600160a01b0386169133917fdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7910160405180910390a350509392505050565b60006106bd82610629565b600180546105a890611f16565b33600090815260036020526040812054821115610c755760405162461bcd60e51b81526020600482015260086024820152672162616c616e636560c01b604482015260640161080b565b336000818152600360209081526040808320805487900390556001600160a01b038716808452928190208054870190555185815291929160008051602061208983398151915291016106b1565b6009546001600160a01b03163314610cec5760405162461bcd60e51b815260040161080b90611f6f565b600b80546001600160a01b0319166001600160a01b0392909216919091179055565b6009546001600160a01b03163314610d385760405162461bcd60e51b815260040161080b90611f6f565b600a55565b600254600090801561064d5761064881610d55610480565b859190611684565b6009546001600160a01b03163314610d875760405162461bcd60e51b815260040161080b90611f6f565b6001600160a01b03166000908152600c60205260409020805460ff19811660ff90911615179055565b42841015610e005760405162461bcd60e51b815260206004820152601760248201527f5045524d49545f444541444c494e455f45585049524544000000000000000000604482015260640161080b565b60006001610e0c610a11565b6001600160a01b038a811660008181526005602090815260409182902080546001810190915582517f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c98184015280840194909452938d166060840152608083018c905260a083019390935260c08083018b90528151808403909101815260e08301909152805192019190912061190160f01b6101008301526101028201929092526101228101919091526101420160408051601f198184030181528282528051602091820120600084529083018083525260ff871690820152606081018590526080810184905260a0016020604051602081039080840390855afa158015610f18573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b03811615801590610f4e5750876001600160a01b0316816001600160a01b0316145b610f8b5760405162461bcd60e51b815260206004820152600e60248201526d24a72b20a624a22fa9a4a3a722a960911b604482015260640161080b565b6001600160a01b0390811660009081526004602090815260408083208a8516808552908352928190208990555188815291928a16917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a350505050505050565b336000908152600c602052604090205460ff166110415760405162461bcd60e51b815260206004820152600b60248201526a085cdd1c985d1959da5cdd60aa1b604482015260640161080b565b6001600160a01b038216600090815260076020526040902054611065908290611eea565b6001600160a01b03831660009081526006602052604090205410156110b65760405162461bcd60e51b815260206004820152600760248201526608585b5bdd5b9d60ca1b604482015260640161080b565b6001600160a01b038216600090815260076020526040812080548392906110de908490611eea565b909155506110ef90508233836118dc565b6040518181526001600160a01b0383169033907ff7323cc8651e605a3101ab9f324d55d253525b18b53d28377cfe9a481764ebf9906020015b60405180910390a35050565b6000336001600160a01b038316146111a4576001600160a01b038216600090815260046020908152604080832033845290915290205460001981146111a25761117d8582611f50565b6001600160a01b03841660009081526004602090815260408083203384529091529020555b505b60006111af85610c13565b9050806000036111ef5760405162461bcd60e51b815260206004820152600b60248201526a5a45524f5f41535345545360a81b604482015260640161080b565b61122460405180604001604052806012815260200171617373657473496e556e6465726c79696e6760701b815250828761195a565b6112c3670de0b6b3a7640000876001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa15801561126e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112929190611d94565b61129d906012611dc7565b6112a890600a611ec4565b6112b189611615565b6112bb9190611ed3565b839190611684565b600a549092506112d8908390620f4240611684565b6112e29083611f50565b6001600160a01b038716600090815260076020526040902054909250611309908390611eea565b6001600160a01b03871660009081526006602052604090205410156113705760405162461bcd60e51b815260206004820152601b60248201527f4558434545445320415641494c41424c45204c49515549444954590000000000604482015260640161080b565b6001600160a01b03861660009081526006602052604081208054849290611398908490611f50565b909155506113a39050565b6113ad83866119a6565b60408051838152602081018790526001600160a01b03808616929087169133917ffbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db910160405180910390a46114038685846118dc565b50949350505050565b336000908152600c602052604090205460ff166114595760405162461bcd60e51b815260206004820152600b60248201526a085cdd1c985d1959da5cdd60aa1b604482015260640161080b565b6114a5604051806040016040528060048152602001633f3f3f3f60e01b81525060076000866001600160a01b03166001600160a01b03168152602001908152602001600020548461195a565b6001600160a01b0383166000908152600660205260408120546114dd918312156114d7576114d283611f8f565b611a08565b82611a08565b6114e681611a4e565b6001600160a01b0383166000908152600760205260408120805484929061150e908490611f50565b9091555050600081121561154d5761152581611f8f565b6001600160a01b0384166000908152600660205260409020546115489190611f50565b611571565b6001600160a01b038316600090815260066020526040902054611571908290611eea565b6001600160a01b0384166000908152600660205260408120919091556115bf9084903390309085136115b5576115a685611f8f565b6115b09087611f50565b6117fc565b6115b08587611eea565b60408051838152602081018390526001600160a01b0385169133917fa9c3d23a0f7956e89c9bf07856e64dce527c8f8cb4fb51711ffe133b2e59eca4910160405180910390a3505050565b60006106bd82610d3d565b600b546040516341976e0960e01b81526001600160a01b03838116600483015260009216906341976e0990602401602060405180830381865afa158015611660573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106bd9190611fab565b60008080600019858709858702925082811083820303915050806000036116bd57600084116116b257600080fd5b50829004905061064f565b8084116116f55760405162461bcd60e51b815260206004820152600660248201526536bab62234bb60d11b604482015260640161080b565b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150509392505050565b60007f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60006040516117949190611fc4565b6040805191829003822060208301939093528101919091527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608201524660808201523060a082015260c00160405160208183030381529060405280519060200120905090565b60006040516323b872dd60e01b81528460048201528360248201528260448201526020600060648360008a5af13d15601f3d116001600051141617169150508061187f5760405162461bcd60e51b81526020600482015260146024820152731514905394d1915497d19493d357d1905253115160621b604482015260640161080b565b5050505050565b80600260008282546118989190611eea565b90915550506001600160a01b0382166000818152600360209081526040808320805486019055518481526000805160206120898339815191529101611128565b5050565b600060405163a9059cbb60e01b8152836004820152826024820152602060006044836000895af13d15601f3d11600160005114161716915050806119545760405162461bcd60e51b815260206004820152600f60248201526e1514905394d1915497d19052531151608a1b604482015260640161080b565b50505050565b6119a183838360405160240161197293929190612063565b60408051601f198184030181529190526020810180516001600160e01b031663969cdd0360e01b179052611a96565b505050565b6001600160a01b038216600090815260036020526040812080548392906119ce908490611f50565b90915550506002805482900390556040518181526000906001600160a01b0384169060008051602061208983398151915290602001611128565b60405160248101839052604481018290526118d89060640160408051601f198184030181529190526020810180516001600160e01b031662d81ed360e71b179052611a96565b611a9381604051602401611a6491815260200190565b60408051601f198184030181529190526020810180516001600160e01b0316634e0c1d1d60e01b179052611a96565b50565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b6000815180845260005b81811015611add57602081850181015186830182015201611ac1565b506000602082860101526020601f19601f83011685010191505092915050565b60208152600061064f6020830184611ab7565b600060208284031215611b2257600080fd5b5035919050565b80356001600160a01b0381168114611b4057600080fd5b919050565b60008060408385031215611b5857600080fd5b611b6183611b29565b946020939093013593505050565b600060208284031215611b8157600080fd5b61064f82611b29565b600080600060608486031215611b9f57600080fd5b611ba884611b29565b9250611bb660208501611b29565b9150604084013590509250925092565b6020808252825182820181905260009190848201906040850190845b81811015611c075783516001600160a01b031683529284019291840191600101611be2565b50909695505050505050565b600080600060608486031215611c2857600080fd5b611c3184611b29565b925060208401359150611c4660408501611b29565b90509250925092565b60ff81168114611a9357600080fd5b600080600080600080600060e0888a031215611c7957600080fd5b611c8288611b29565b9650611c9060208901611b29565b955060408801359450606088013593506080880135611cae81611c4f565b9699959850939692959460a0840135945060c09093013592915050565b60008060008060808587031215611ce157600080fd5b611cea85611b29565b935060208501359250611cff60408601611b29565b9150611d0d60608601611b29565b905092959194509250565b60008060408385031215611d2b57600080fd5b611d3483611b29565b9150611d4260208401611b29565b90509250929050565b600080600060608486031215611d6057600080fd5b611d6984611b29565b95602085013595506040909401359392505050565b634e487b7160e01b600052603260045260246000fd5b600060208284031215611da657600080fd5b815161064f81611c4f565b634e487b7160e01b600052601160045260246000fd5b60ff82811682821603908111156106bd576106bd611db1565b600181815b80851115611e1b578160001904821115611e0157611e01611db1565b80851615611e0e57918102915b93841c9390800290611de5565b509250929050565b600082611e32575060016106bd565b81611e3f575060006106bd565b8160018114611e555760028114611e5f57611e7b565b60019150506106bd565b60ff841115611e7057611e70611db1565b50506001821b6106bd565b5060208310610133831016604e8410600b8410161715611e9e575081810a6106bd565b611ea88383611de0565b8060001904821115611ebc57611ebc611db1565b029392505050565b600061064f60ff841683611e23565b80820281158282048414176106bd576106bd611db1565b808201808211156106bd576106bd611db1565b600060018201611f0f57611f0f611db1565b5060010190565b600181811c90821680611f2a57607f821691505b602082108103611f4a57634e487b7160e01b600052602260045260246000fd5b50919050565b818103818111156106bd576106bd611db1565b600061064f8383611e23565b60208082526006908201526510b7bbb732b960d11b604082015260600190565b6000600160ff1b8201611fa457611fa4611db1565b5060000390565b600060208284031215611fbd57600080fd5b5051919050565b600080835481600182811c915080831680611fe057607f831692505b60208084108203611fff57634e487b7160e01b86526022600452602486fd5b818015612013576001811461202857612055565b60ff1986168952841515850289019650612055565b60008a81526020902060005b8681101561204d5781548b820152908501908301612034565b505084890196505b509498975050505050505050565b6060815260006120766060830186611ab7565b6020830194909452506040015291905056feddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa2646970667358221220f7faa8e0983fbeb5e05cbe839f9fe7ba0dfb92f7a77974e2ce717550eeb0b5bd64736f6c63430008120033";

type LPVaultConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: LPVaultConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class LPVault__factory extends ContractFactory {
  constructor(...args: LPVaultConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    priceFeed: PromiseOrValue<string>,
    _taxRate: PromiseOrValue<BigNumberish>,
    _name: PromiseOrValue<string>,
    _symbol: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<LPVault> {
    return super.deploy(
      priceFeed,
      _taxRate,
      _name,
      _symbol,
      overrides || {}
    ) as Promise<LPVault>;
  }
  override getDeployTransaction(
    priceFeed: PromiseOrValue<string>,
    _taxRate: PromiseOrValue<BigNumberish>,
    _name: PromiseOrValue<string>,
    _symbol: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      priceFeed,
      _taxRate,
      _name,
      _symbol,
      overrides || {}
    );
  }
  override attach(address: string): LPVault {
    return super.attach(address) as LPVault;
  }
  override connect(signer: Signer): LPVault__factory {
    return super.connect(signer) as LPVault__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): LPVaultInterface {
    return new utils.Interface(_abi) as LPVaultInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): LPVault {
    return new Contract(address, _abi, signerOrProvider) as LPVault;
  }
}
