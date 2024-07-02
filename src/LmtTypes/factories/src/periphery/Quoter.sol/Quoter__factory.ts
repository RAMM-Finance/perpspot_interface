/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  Quoter,
  QuoterInterface,
} from "../../../../src/periphery/Quoter.sol/Quoter";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_quoterV2",
        type: "address",
      },
      {
        internalType: "address",
        name: "_poolManager",
        type: "address",
      },
      {
        internalType: "address",
        name: "_dataProvider",
        type: "address",
      },
      {
        internalType: "address",
        name: "_sharedLiquidity",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    name: "addIsSlot6",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int24",
        name: "tickDiff",
        type: "int24",
      },
    ],
    name: "getAllAprUtil",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "token0",
                type: "address",
              },
              {
                internalType: "address",
                name: "token1",
                type: "address",
              },
              {
                internalType: "uint24",
                name: "fee",
                type: "uint24",
              },
            ],
            internalType: "struct PoolKey",
            name: "key",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "apr",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "utilTotal",
            type: "uint256",
          },
        ],
        internalType: "struct Quoter.AprUtilInfo[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPoolKeys",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "token0",
            type: "address",
          },
          {
            internalType: "address",
            name: "token1",
            type: "address",
          },
          {
            internalType: "string",
            name: "symbol0",
            type: "string",
          },
          {
            internalType: "string",
            name: "symbol1",
            type: "string",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "string",
            name: "name0",
            type: "string",
          },
          {
            internalType: "string",
            name: "name1",
            type: "string",
          },
          {
            internalType: "uint8",
            name: "decimals0",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "decimals1",
            type: "uint8",
          },
          {
            internalType: "int24",
            name: "tick",
            type: "int24",
          },
        ],
        internalType: "struct Quoter.PoolInfo[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSharedLiquidityInfo",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "token0",
                type: "address",
              },
              {
                internalType: "address",
                name: "token1",
                type: "address",
              },
              {
                internalType: "uint24",
                name: "fee",
                type: "uint24",
              },
            ],
            internalType: "struct PoolKey",
            name: "key",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "maxPerPair",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "exposureToPair",
            type: "uint256",
          },
        ],
        internalType: "struct Quoter.PairSharedLiquidityInfo[]",
        name: "",
        type: "tuple[]",
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
    name: "isSlot6",
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
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "token0",
                type: "address",
              },
              {
                internalType: "address",
                name: "token1",
                type: "address",
              },
              {
                internalType: "uint24",
                name: "fee",
                type: "uint24",
              },
            ],
            internalType: "struct PoolKey",
            name: "poolKey",
            type: "tuple",
          },
          {
            internalType: "bool",
            name: "isToken0",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "marginInInput",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "marginInOutput",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "borrowAmount",
            type: "uint256",
          },
          {
            internalType: "contract IQuoterV2",
            name: "quoter",
            type: "address",
          },
          {
            internalType: "bool",
            name: "marginInPosToken",
            type: "bool",
          },
        ],
        internalType: "struct Quoter.QuoteExactInputParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactInput",
    outputs: [
      {
        internalType: "uint256",
        name: "swapInput",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "positionOutput",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "borrowRate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "feeAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "avgPrice",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "int24",
            name: "tick",
            type: "int24",
          },
          {
            internalType: "uint128",
            name: "liquidity",
            type: "uint128",
          },
          {
            internalType: "uint256",
            name: "premium",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "feeGrowthInside0LastX128",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "feeGrowthInside1LastX128",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastGrowth",
            type: "uint256",
          },
        ],
        internalType: "struct LiquidityLoan[]",
        name: "borrowInfo",
        type: "tuple[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b506040516200274d3803806200274d8339810160408190526200003491620000b1565b600080546001600160a01b03199081166001600160a01b039687161790915560018054821694861694909417909355600280548416928516929092179091556003805483169190931617909155600480543392169190911790556200010e565b80516001600160a01b0381168114620000ac57600080fd5b919050565b60008060008060808587031215620000c857600080fd5b620000d38562000094565b9350620000e36020860162000094565b9250620000f36040860162000094565b9150620001036060860162000094565b905092959194509250565b61262f806200011e6000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c8063ae6e04091161005b578063ae6e0409146100eb578063b1b873a21461011e578063d183feee14610143578063e35ef2ce1461015857600080fd5b80630327b40c14610082578063359b805b146100ab5780638da5cb5b146100c0575b600080fd5b61009561009036600461191e565b61016d565b6040516100a29190611988565b60405180910390f35b6100b361065e565b6040516100a291906119d6565b6004546100d3906001600160a01b031681565b6040516001600160a01b0390911681526020016100a2565b61010e6100f9366004611a2d565b60056020526000908152604090205460ff1681565b60405190151581526020016100a2565b61013161012c366004611a4a565b610938565b6040516100a296959493929190611aa9565b61014b610fe2565b6040516100a29190611b6b565b61016b610166366004611a2d565b61129e565b005b60606000600160009054906101000a90046001600160a01b03166001600160a01b031663d41dcbea6040518163ffffffff1660e01b8152600401600060405180830381865afa1580156101c4573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526101ec9190810190611d51565b90506000815167ffffffffffffffff81111561020a5761020a611c9a565b60405190808252806020026020018201604052801561026957816020015b6040805160c0810182526000606082018181526080830182905260a08301829052825260208083018290529282015282526000199092019101816102285790505b50905060005b825181101561065657600083828151811061028c5761028c611df0565b60200260200101516001600160a01b0316630dfe16816040518163ffffffff1660e01b8152600401602060405180830381865afa1580156102d1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102f59190611e06565b9050600084838151811061030b5761030b611df0565b60200260200101516001600160a01b031663d21220a76040518163ffffffff1660e01b8152600401602060405180830381865afa158015610350573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103749190611e06565b905060006005600087868151811061038e5761038e611df0565b6020908102919091018101516001600160a01b031682528101919091526040016000205460ff1615610443578584815181106103cc576103cc611df0565b60200260200101516001600160a01b0316633850c7bd6040518163ffffffff1660e01b815260040160c060405180830381865afa158015610411573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104359190611e48565b509294506104c89350505050565b85848151811061045557610455611df0565b60200260200101516001600160a01b0316633850c7bd6040518163ffffffff1660e01b815260040160e060405180830381865afa15801561049a573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104be9190611ed6565b5093955050505050505b60006040518060600160405280856001600160a01b03168152602001846001600160a01b0316815260200188878151811061050557610505611df0565b60200260200101516001600160a01b031663ddca3f436040518163ffffffff1660e01b8152600401602060405180830381865afa15801561054a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061056e9190611f76565b62ffffff16905260025490915060009081906001600160a01b0316631f2ecd83846105998e88611fa9565b6105a38f89611fce565b6040518463ffffffff1660e01b81526004016105c193929190611ff3565b6040805180830381865afa1580156105dd573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610601919061201b565b9150915060405180606001604052808481526020018381526020018281525088888151811061063257610632611df0565b6020026020010181905250505050505050808061064e9061203f565b91505061026f565b509392505050565b6060600061066a610fe2565b90506000815167ffffffffffffffff81111561068857610688611c9a565b6040519080825280602002602001820160405280156106e757816020015b6040805160c0810182526000606082018181526080830182905260a08301829052825260208083018290529282015282526000199092019101816106a65790505b50905060005b8251811015610931576000604051806060016040528085848151811061071557610715611df0565b6020026020010151600001516001600160a01b0316815260200185848151811061074157610741611df0565b6020026020010151602001516001600160a01b0316815260200185848151811061076d5761076d611df0565b60209081029190910101516080015162ffffff169052600154604051632411122160e11b81529192506000916001600160a01b03909116906348222442906107b9908590600401612058565b602060405180830381865afa1580156107d6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107fa9190612066565b60035460405163fad56a4160e01b8152600481018390529192506000916001600160a01b039091169063fad56a4190602401602060405180830381865afa158015610849573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061086d9190612066565b6003546040516376efa68360e01b8152600481018590529192506000916001600160a01b03909116906376efa68390602401602060405180830381865afa1580156108bc573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108e09190612066565b905060405180606001604052808581526020018281526020018381525086868151811061090f5761090f611df0565b60200260200101819052505050505080806109299061203f565b9150506106ed565b5092915050565b600080808080606081806109536101008a0160e08b01611a2d565b6001600160a01b03161461097757610972610100890160e08a01611a2d565b610984565b6000546001600160a01b03165b905061098e6117e5565b600154604051632411122160e11b81526001600160a01b03909116906348222442906109be908c906004016120ca565b602060405180830381865afa1580156109db573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109ff9190612066565b6080820152600154604051639525092360e01b81526001600160a01b0390911690639525092390610a34908c906004016120ca565b6101c060405180830381865afa158015610a52573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a7691906120d8565b60a084015260020b60208301526001600160a01b0390811682526001546080830151604051636361616560e11b8152600481019190915291169063c6c2c2ca9060240160a060405180830381865afa158015610ad6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610afa91906121e6565b505050506001600160801b031660408281019190915281518151633850c7bd60e01b815291516001600160a01b0390911691633850c7bd9160048083019260e09291908290030181865afa158015610b56573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b7a9190611ed6565b5050506001600160a01b03909316606085015250610ba39150506101208a016101008b01612244565b15610d27576040810151610bc59060c08b013590670de0b6b3a764000061130a565b9450610bd58560c08b0135612261565b9750816001600160a01b031663c6a5026a6040518060a001604052808c6060016020810190610c049190612244565b610c1a57610c1560208e018e611a2d565b610c2a565b610c2a60408e0160208f01611a2d565b6001600160a01b03168152602001610c4860808e0160608f01612244565b610c6157610c5c60408e0160208f01611a2d565b610c6e565b610c6e60208e018e611a2d565b6001600160a01b031681526020018b81526020018c6000016040016020810190610c989190612274565b62ffffff16815260006020909101526040516001600160e01b031960e084901b168152610cc89190600401612291565b6080604051808303816000875af1158015610ce7573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d0b91906122d9565b50919850610d2091505060a08a01358861232b565b9650610ea0565b6040810151610d449060c08b013590670de0b6b3a764000061130a565b945060c0890135610d598660808c0135612261565b610d63919061232b565b9750816001600160a01b031663c6a5026a6040518060a001604052808c6060016020810190610d929190612244565b610da857610da360208e018e611a2d565b610db8565b610db860408e0160208f01611a2d565b6001600160a01b03168152602001610dd660808e0160608f01612244565b610def57610dea60408e0160208f01611a2d565b610dfc565b610dfc60208e018e611a2d565b6001600160a01b031681526020018b81526020018c6000016040016020810190610e269190612274565b62ffffff16815260006020909101526040516001600160e01b031960e084901b168152610e569190600401612291565b6080604051808303816000875af1158015610e75573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e9991906122d9565b5091985050505b6001546001600160a01b031663ad16ab7e8a60c0810135610ec76080830160608401612244565b8b86606001516040518663ffffffff1660e01b8152600401610eed95949392919061233e565b600060405180830381865afa158015610f0a573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610f329190810190612378565b8251600154602085015160a086015151608087015160405163aa7532af60e01b8152969a5094985073__$eacbb88ed4bd2af84aa4d43bcf675bcf7e$__9563aa7532af95610f9495946001600160a01b03169392918b916000916004016124b5565b602060405180830381865af4158015610fb1573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fd59190612066565b9550505091939550919395565b60606000600160009054906101000a90046001600160a01b03166001600160a01b031663d41dcbea6040518163ffffffff1660e01b8152600401600060405180830381865afa158015611039573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526110619190810190611d51565b90506000815167ffffffffffffffff81111561107f5761107f611c9a565b6040519080825280602002602001820160405280156110b857816020015b6110a5611821565b81526020019060019003908161109d5790505b50905060005b825181101561093157600560008483815181106110dd576110dd611df0565b6020908102919091018101516001600160a01b031682528101919091526040016000205460ff16156111d357600083828151811061111d5761111d611df0565b60200260200101516001600160a01b0316633850c7bd6040518163ffffffff1660e01b815260040160c060405180830381865afa158015611162573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111869190611e48565b505050509150506111b08483815181106111a2576111a2611df0565b6020026020010151826113e9565b8383815181106111c2576111c2611df0565b60200260200101819052505061128c565b60008382815181106111e7576111e7611df0565b60200260200101516001600160a01b0316633850c7bd6040518163ffffffff1660e01b815260040160e060405180830381865afa15801561122c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112509190611ed6565b505050505091505061126d8483815181106111a2576111a2611df0565b83838151811061127f5761127f611df0565b6020026020010181905250505b806112968161203f565b9150506110be565b6004546001600160a01b031633146112e65760405162461bcd60e51b815260206004820152600660248201526510b7bbb732b960d11b60448201526064015b60405180910390fd5b6001600160a01b03166000908152600560205260409020805460ff19166001179055565b6000808060001985870985870292508281108382030391505080600003611343576000841161133857600080fd5b5082900490506113e2565b80841161137b5760405162461bcd60e51b815260206004820152600660248201526536bab62234bb60d11b60448201526064016112dd565b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150505b9392505050565b6113f1611821565b6000836001600160a01b0316630dfe16816040518163ffffffff1660e01b8152600401602060405180830381865afa158015611431573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114559190611e06565b90506000846001600160a01b031663d21220a76040518163ffffffff1660e01b8152600401602060405180830381865afa158015611497573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114bb9190611e06565b9050604051806101400160405280836001600160a01b03168152602001826001600160a01b03168152602001836001600160a01b03166395d89b416040518163ffffffff1660e01b8152600401600060405180830381865afa158015611525573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261154d919081019061254a565b8152602001826001600160a01b03166395d89b416040518163ffffffff1660e01b8152600401600060405180830381865afa158015611590573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526115b8919081019061254a565b8152602001866001600160a01b031663ddca3f436040518163ffffffff1660e01b8152600401602060405180830381865afa1580156115fb573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061161f9190611f76565b62ffffff168152602001836001600160a01b03166306fdde036040518163ffffffff1660e01b8152600401600060405180830381865afa158015611667573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261168f919081019061254a565b8152602001826001600160a01b03166306fdde036040518163ffffffff1660e01b8152600401600060405180830381865afa1580156116d2573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526116fa919081019061254a565b8152602001836001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa15801561173d573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061176191906125de565b60ff168152602001826001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa1580156117a7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117cb91906125de565b60ff1681526020018560020b815250925050505b92915050565b6040805160c08101825260008082526020820181905291810182905260608101829052608081019190915260a0810161181c611894565b905290565b60405180610140016040528060006001600160a01b0316815260200160006001600160a01b031681526020016060815260200160608152602001600062ffffff1681526020016060815260200160608152602001600060ff168152602001600060ff168152602001600060020b81525090565b6040518060e001604052806118d86040518060c001604052806000815260200160008152602001600081526020016000815260200160008152602001600081525090565b8152602001600081526020016000815260200160008152602001600061ffff16815260200160008152602001600081525090565b8060020b811461191b57600080fd5b50565b60006020828403121561193057600080fd5b81356113e28161190c565b80516001600160a01b0390811683526020808301519091169083015260409081015162ffffff16910152565b61197282825161193b565b6020810151606083015260400151608090910152565b6020808252825182820181905260009190848201906040850190845b818110156119ca576119b7838551611967565b9284019260a092909201916001016119a4565b50909695505050505050565b6020808252825182820181905260009190848201906040850190845b818110156119ca57611a05838551611967565b9284019260a092909201916001016119f2565b6001600160a01b038116811461191b57600080fd5b600060208284031215611a3f57600080fd5b81356113e281611a18565b60006101208284031215611a5d57600080fd5b50919050565b805160020b82526001600160801b03602082015116602083015260408101516040830152606081015160608301526080810151608083015260a081015160a08301525050565b600060c0808301898452602089818601528860408601528760608601528660808601528260a086015281865180845260e087019150828801935060005b81811015611b0957611af9838651611a63565b9383019391850191600101611ae6565b50909c9b505050505050505050505050565b60005b83811015611b36578181015183820152602001611b1e565b50506000910152565b60008151808452611b57816020860160208601611b1b565b601f01601f19169290920160200192915050565b60006020808301818452808551808352604092508286019150828160051b87010184880160005b83811015611c8c57888303603f19018552815180516001600160a01b03168452610140818901516001600160a01b038116868b015250878201518189870152611bdd82870182611b3f565b91505060608083015186830382880152611bf78382611b3f565b92505050608080830151611c118288018262ffffff169052565b505060a08083015186830382880152611c2a8382611b3f565b9250505060c08083015186830382880152611c458382611b3f565b9250505060e080830151611c5d8288018260ff169052565b50506101008281015160ff16908601526101209182015160020b91909401529386019390860190600101611b92565b509098975050505050505050565b634e487b7160e01b600052604160045260246000fd5b60405160e0810167ffffffffffffffff81118282101715611cd357611cd3611c9a565b60405290565b60405160c0810167ffffffffffffffff81118282101715611cd357611cd3611c9a565b604051601f8201601f1916810167ffffffffffffffff81118282101715611d2557611d25611c9a565b604052919050565b600067ffffffffffffffff821115611d4757611d47611c9a565b5060051b60200190565b60006020808385031215611d6457600080fd5b825167ffffffffffffffff811115611d7b57600080fd5b8301601f81018513611d8c57600080fd5b8051611d9f611d9a82611d2d565b611cfc565b81815260059190911b82018301908381019087831115611dbe57600080fd5b928401925b82841015611de5578351611dd681611a18565b82529284019290840190611dc3565b979650505050505050565b634e487b7160e01b600052603260045260246000fd5b600060208284031215611e1857600080fd5b81516113e281611a18565b805161ffff81168114611e3557600080fd5b919050565b801515811461191b57600080fd5b60008060008060008060c08789031215611e6157600080fd5b8651611e6c81611a18565b6020880151909650611e7d8161190c565b9450611e8b60408801611e23565b9350611e9960608801611e23565b9250611ea760808801611e23565b915060a0870151611eb781611e3a565b809150509295509295509295565b805160ff81168114611e3557600080fd5b600080600080600080600060e0888a031215611ef157600080fd5b8751611efc81611a18565b6020890151909750611f0d8161190c565b9550611f1b60408901611e23565b9450611f2960608901611e23565b9350611f3760808901611e23565b9250611f4560a08901611ec5565b915060c0880151611f5581611e3a565b8091505092959891949750929550565b62ffffff8116811461191b57600080fd5b600060208284031215611f8857600080fd5b81516113e281611f65565b634e487b7160e01b600052601160045260246000fd5b600282810b9082900b03627fffff198112627fffff821317156117df576117df611f93565b600281810b9083900b01627fffff8113627fffff19821217156117df576117df611f93565b60a08101612001828661193b565b8360020b60608301528260020b6080830152949350505050565b6000806040838503121561202e57600080fd5b505080516020909101519092909150565b60006001820161205157612051611f93565b5060010190565b606081016117df828461193b565b60006020828403121561207857600080fd5b5051919050565b803561208a81611a18565b6001600160a01b0390811683526020820135906120a682611a18565b16602083015260408101356120ba81611f65565b62ffffff81166040840152505050565b606081016117df828461207f565b60008060008385036101c08112156120ef57600080fd5b84516120fa81611a18565b602086015190945061210b8161190c565b9250603f19016101808082121561212157600080fd5b612129611cb0565b60c083121561213757600080fd5b61213f611cd9565b925060408701518352606087015160208401526080870151604084015260a0870151606084015260c0870151608084015260e087015160a08401528281526101008701516020820152610120870151604082015261014087015160608201526121ab6101608801611e23565b60808201529086015160a08201526101a09095015160c08601525091949093509050565b80516001600160801b0381168114611e3557600080fd5b600080600080600060a086880312156121fe57600080fd5b612207866121cf565b9450612215602087016121cf565b9350612223604087016121cf565b9250612231606087016121cf565b9150608086015190509295509295909350565b60006020828403121561225657600080fd5b81356113e281611e3a565b818103818111156117df576117df611f93565b60006020828403121561228657600080fd5b81356113e281611f65565b81516001600160a01b0390811682526020808401518216908301526040808401519083015260608084015162ffffff1690830152608092830151169181019190915260a00190565b600080600080608085870312156122ef57600080fd5b84519350602085015161230181611a18565b604086015190935063ffffffff8116811461231b57600080fd5b6060959095015193969295505050565b808201808211156117df576117df611f93565b60e0810161234c828861207f565b6060820195909552921515608084015260a08301919091526001600160a01b031660c090910152919050565b600080604080848603121561238c57600080fd5b8351925060208085015167ffffffffffffffff8111156123ab57600080fd5b8501601f810187136123bc57600080fd5b80516123ca611d9a82611d2d565b81815260c0918202830184019184820191908a8411156123e957600080fd5b938501935b8385101561245f5780858c0312156124065760008081fd5b61240e611cd9565b85516124198161190c565b81526124268688016121cf565b818801528588015188820152606080870151908201526080808701519082015260a08087015190820152835293840193918501916123ee565b508096505050505050509250929050565b600081518084526020808501945080840160005b838110156124aa57612497878351611a63565b60c0969096019590820190600101612484565b509495945050505050565b600061018060018060a01b03808b168452808a166020850152508760020b60408401528651606084015260208701516080840152604087015160a0840152606087015160c0840152608087015160e084015260a08701516101008401528061012084015261252581840187612470565b91505061253761014083018515159052565b8261016083015298975050505050505050565b60006020828403121561255c57600080fd5b815167ffffffffffffffff8082111561257457600080fd5b818401915084601f83011261258857600080fd5b81518181111561259a5761259a611c9a565b6125ad601f8201601f1916602001611cfc565b91508082528560208285010111156125c457600080fd5b6125d5816020840160208601611b1b565b50949350505050565b6000602082840312156125f057600080fd5b6113e282611ec556fea26469706673582212205d3e50028a2c7b55b5f8bad04ea336111edbde02d7bbdb79bd3fdf5b137bc3cc64736f6c63430008120033";

type QuoterConstructorParams =
  | [linkLibraryAddresses: QuoterLibraryAddresses, signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: QuoterConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => {
  return (
    typeof xs[0] === "string" ||
    (Array.isArray as (arg: any) => arg is readonly any[])(xs[0]) ||
    "_isInterface" in xs[0]
  );
};

export class Quoter__factory extends ContractFactory {
  constructor(...args: QuoterConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      const [linkLibraryAddresses, signer] = args;
      super(_abi, Quoter__factory.linkBytecode(linkLibraryAddresses), signer);
    }
  }

  static linkBytecode(linkLibraryAddresses: QuoterLibraryAddresses): string {
    let linkedBytecode = _bytecode;

    linkedBytecode = linkedBytecode.replace(
      new RegExp("__\\$eacbb88ed4bd2af84aa4d43bcf675bcf7e\\$__", "g"),
      linkLibraryAddresses["src/PremiumComputer.sol:PremiumComputer"]
        .replace(/^0x/, "")
        .toLowerCase()
    );

    return linkedBytecode;
  }

  override deploy(
    _quoterV2: PromiseOrValue<string>,
    _poolManager: PromiseOrValue<string>,
    _dataProvider: PromiseOrValue<string>,
    _sharedLiquidity: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Quoter> {
    return super.deploy(
      _quoterV2,
      _poolManager,
      _dataProvider,
      _sharedLiquidity,
      overrides || {}
    ) as Promise<Quoter>;
  }
  override getDeployTransaction(
    _quoterV2: PromiseOrValue<string>,
    _poolManager: PromiseOrValue<string>,
    _dataProvider: PromiseOrValue<string>,
    _sharedLiquidity: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _quoterV2,
      _poolManager,
      _dataProvider,
      _sharedLiquidity,
      overrides || {}
    );
  }
  override attach(address: string): Quoter {
    return super.attach(address) as Quoter;
  }
  override connect(signer: Signer): Quoter__factory {
    return super.connect(signer) as Quoter__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): QuoterInterface {
    return new utils.Interface(_abi) as QuoterInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Quoter {
    return new Contract(address, _abi, signerOrProvider) as Quoter;
  }
}

export interface QuoterLibraryAddresses {
  ["src/PremiumComputer.sol:PremiumComputer"]: string;
}
