/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  LPManager2,
  LPManager2Interface,
} from "../../../../src/periphery/LPManager.sol/LPManager2";

const _abi = [
  {
    inputs: [],
    name: "T",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token0",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token1",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint24",
        name: "fee",
        type: "uint24",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee0Collected",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee1Collected",
        type: "uint256",
      },
    ],
    name: "CollectedFees",
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
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "UtilizedByKey",
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
        internalType: "int24",
        name: "tickLower",
        type: "int24",
      },
      {
        internalType: "int24",
        name: "tickUpper",
        type: "int24",
      },
    ],
    name: "getMaxWithdrawable",
    outputs: [
      {
        internalType: "uint128",
        name: "maxWithdrawable",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getPosition",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "token0Amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "token1Amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "token0Repaid",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "token1Repaid",
            type: "uint256",
          },
          {
            internalType: "int24",
            name: "tickLower",
            type: "int24",
          },
          {
            internalType: "int24",
            name: "tickUpper",
            type: "int24",
          },
          {
            internalType: "uint128",
            name: "liquidity",
            type: "uint128",
          },
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
        ],
        internalType: "struct LPManager2.Position",
        name: "",
        type: "tuple",
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
    ],
    name: "getTokenIdsFromKey",
    outputs: [
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
        name: "_vault",
        type: "address",
      },
      {
        internalType: "address",
        name: "_poolManager",
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
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "keyToTokenIds",
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
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "lastRebalanceCenterTicks",
    outputs: [
      {
        internalType: "int24",
        name: "",
        type: "int24",
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
        internalType: "int24",
        name: "tickLower",
        type: "int24",
      },
      {
        internalType: "int24",
        name: "tickUpper",
        type: "int24",
      },
      {
        internalType: "uint256",
        name: "tokenAmount",
        type: "uint256",
      },
    ],
    name: "provideLiquidity",
    outputs: [
      {
        internalType: "uint256",
        name: "token0Amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "token1Amount",
        type: "uint256",
      },
      {
        internalType: "uint128",
        name: "liquidity",
        type: "uint128",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
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
        internalType: "int24",
        name: "tickOuter",
        type: "int24",
      },
      {
        internalType: "int24",
        name: "tickInner",
        type: "int24",
      },
      {
        internalType: "uint256",
        name: "percentageUse",
        type: "uint256",
      },
      {
        internalType: "int24",
        name: "rebalanceThreshold",
        type: "int24",
      },
    ],
    name: "rebalanceAroundCurrentPrice",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "token0Supplied",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "token1Supplied",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "token0Withdrawn",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "token1Withdrawn",
            type: "uint256",
          },
        ],
        internalType: "struct LPManager2.RebalanceReturn",
        name: "returnVars",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "key",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "removeTokenById",
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
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint128",
        name: "liquidity",
        type: "uint128",
      },
    ],
    name: "withdrawLiquidity",
    outputs: [
      {
        internalType: "uint256",
        name: "token0Out",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "token1Out",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50613563806100206000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c80639ced28c9116100715780639ced28c914610191578063c7b9d530146101b1578063eb02c301146101e8578063ee510ae014610208578063f5db29c91461023e578063ff785dc11461028457600080fd5b80631c75e316146100b957806345858877146100f5578063485cc955146101165780635d001c321461012b578063894b3c7c146101535780638e68ad3614610166575b600080fd5b6100cc6100c7366004612c87565b6102a4565b6040805193845260208401929092526001600160801b0316908201526060015b60405180910390f35b610108610103366004612cd7565b610817565b6040519081526020016100ec565b610129610124366004612cf9565b610848565b005b61013e610139366004612d47565b610af4565b604080519283526020830191909152016100ec565b610129610161366004612cd7565b611674565b610179610174366004612d84565b61177b565b6040516001600160801b0390911681526020016100ec565b6101a461019f366004612dce565b611a46565b6040516100ec9190612dea565b6101296101bf366004612e2e565b6001600160a01b03166000908152600460205260409020805460ff19811660ff90911615179055565b6101fb6101f6366004612e4b565b611b05565b6040516100ec9190612e64565b61022b610216366004612e4b565b60076020526000908152604090205460020b81565b60405160029190910b81526020016100ec565b61025161024c366004612efc565b611bc3565b6040516100ec91908151815260208083015190820152604080830151908201526060918201519181019190915260800190565b610108610292366004612e4b565b60086020526000908152604090205481565b336000908152600460205260408120548190819060ff166102fa5760405162461bcd60e51b815260206004820152600b60248201526a085cdd1c985d1959da5cdd60aa1b60448201526064015b60405180910390fd5b600087600001516001600160a01b0316600060029054906101000a90046001600160a01b03166001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa15801561035d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103819190612f63565b6001600160a01b0316149050806103b2576103ad61039e88612430565b6103a788612430565b87612753565b6103cd565b6103cd6103be88612430565b6103c788612430565b876127a6565b915060006127106103e087612711612f96565b6103ea9190612fc3565b600054604051637802d79f60e11b8152600481018390529192506201000090046001600160a01b03169063f005af3e90602401600060405180830381600087803b15801561043757600080fd5b505af115801561044b573d6000803e3d6000fd5b50506003805492509050600061046083612fd7565b909155505060035460009081526005602090815260408083208c518d8401518e840151935192959461049794929391929101612ff0565b60408051808303601f1901815291905280516020909101206004830154909150600160301b90046001600160801b03166000036104f55760008181526006602090815260408220600354815460018101835591845291909220909101555b848260040160068282829054906101000a90046001600160801b031661051b919061302c565b92506101000a8154816001600160801b0302191690836001600160801b03160217905550898260040160006101000a81548162ffffff021916908360020b62ffffff160217905550888260040160036101000a81548162ffffff021916908360020b62ffffff1602179055508a8260050160008201518160000160006101000a8154816001600160a01b0302191690836001600160a01b0316021790555060208201518160010160006101000a8154816001600160a01b0302191690836001600160a01b0316021790555060408201518160010160146101000a81548162ffffff021916908362ffffff160217905550905050600160009054906101000a90046001600160a01b03166001600160a01b031663b8919fa68c8c8c89306040518663ffffffff1660e01b81526004016106ad95949392919085516001600160a01b03908116825260208088015182169083015260409687015162ffffff1696820196909652600294850b60608201529290930b60808301526001600160801b031660a0820152911660c082015260e00190565b60408051808303816000875af11580156106cb573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106ef919061304c565b8354919850965087908390600090610708908490613070565b92505081905550858260010160008282546107239190613070565b9091555050815415610758576000818152600860205260408120805489929061074d908490613070565b9091555061077c9050565b60008181526008602052604081208054889290610776908490613070565b90915550505b6000546201000090046001600160a01b0316633bc034bd856107a7576107a28886613083565b6107b1565b6107b18986613083565b6040516001600160e01b031960e084901b168152600481019190915260006024820152604401600060405180830381600087803b1580156107f157600080fd5b505af1158015610805573d6000803e3d6000fd5b50505050505050509450945094915050565b6006602052816000526040600020818154811061083357600080fd5b90600052602060002001600091509150505481565b600054610100900460ff16158080156108685750600054600160ff909116105b806108825750303b158015610882575060005460ff166001145b6108e55760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b60648201526084016102f1565b6000805460ff191660011790558015610908576000805461ff0019166101001790555b6000805462010000600160b01b031916620100006001600160a01b03868116820292909217808455600180546001600160a01b03199081168886161790915560028054339216919091179055604080516338d52e0f60e01b8152905192909104909216916338d52e0f9160048083019260209291908290030181865afa158015610996573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109ba9190612f63565b60405163095ea7b360e01b81526001600160a01b03858116600483015260001960248301529192509082169063095ea7b3906044016020604051808303816000875af1158015610a0e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a3291906130a6565b5060405163095ea7b360e01b81526001600160a01b038581166004830152600019602483015282169063095ea7b3906044016020604051808303816000875af1158015610a83573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610aa791906130a6565b50508015610aef576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b505050565b33600090815260046020526040812054819060ff16610b435760405162461bcd60e51b815260206004820152600b60248201526a085cdd1c985d1959da5cdd60aa1b60448201526064016102f1565b600084815260056020526040902060048101546001600160801b03600160301b90910481169085161115610b9f5760405162461bcd60e51b81526020600482015260036024820152626c697160e81b60448201526064016102f1565b6004810154600090610bcf906001600160801b0387811691670de0b6b3a764000091600160301b9091041661283d565b6040805180820190915260118152701c195c98d95b9d1859d95499591d58d959607a1b60208201526004840154919250610c1e9183906001600160801b03808a1691600160301b90041661291b565b848260040160068282829054906101000a90046001600160801b0316610c4491906130c1565b82546101009290920a6001600160801b03818102199093169183160217909155600154600485810154604051632afe5e3960e21b815260058801546001600160a01b03908116938201939093526006880154808416602483015262ffffff60a09190911c166044820152600282810b6064830152630100000090920490910b608482015292891660a484015216915063abf978e49060c40160408051808303816000875af1158015610cfa573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d1e919061304c565b6001546004858101546040516319fa103360e01b815260058801546001600160a01b03908116938201939093526006880154808416602483015260a01c62ffffff166044820152600282810b6064830152630100000090920490910b60848201529397509195506000928392909116906319fa10339060a40160408051808303816000875af1158015610db5573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610dd991906130e1565b600686015460058701546040805162ffffff600160a01b85041681526001600160801b03868116602083015285168183015290519496509294506001600160a01b03918216939116917f0816a24e8386ec3fc6e374f1f9bc5f0848092a414747df77251edaabd79ce94b919081900360600190a3610e606001600160801b03831687613070565b9550610e756001600160801b03821686613070565b945085846002016000828254610e8b9190613070565b9250508190555084846003016000828254610ea69190613070565b9091555050600684015460058501546040805162ffffff600160a01b85041681526001600160801b03868116602083015285168183015290516001600160a01b0393841693909216917f0816a24e8386ec3fc6e374f1f9bc5f0848092a414747df77251edaabd79ce94b9181900360600190a38354600090610f319085670de0b6b3a764000061283d565b610f3b9088613110565b6001860154909150600090610f599086670de0b6b3a764000061283d565b610f639088613110565b9050610f946040518060400160405280600481526020016362616c6160e01b81525087600001548860010154612964565b610f9e88886129ab565b610fba846001600160801b0316846001600160801b03166129ab565b610fc3826129f5565b610fcc816129f5565b60058601546040516370a0823160e01b81523060048201526110af916001600160a01b0316906370a0823190602401602060405180830381865afa158015611018573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061103c9190613130565b60068801546040516370a0823160e01b81523060048201526001600160a01b03909116906370a0823190602401602060405180830381865afa158015611086573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110aa9190613130565b6129ab565b600586015460068701546040516000926110e9926001600160a01b039182169291811691600160a01b90910462ffffff1690602001612ff0565b60408051601f1981840301815291905280516020909101208754909150156112cd576000548754620100009091046001600160a01b031690633bc034bd9061113a9089670de0b6b3a764000061283d565b856040518363ffffffff1660e01b8152600401611161929190918252602082015260400190565b600060405180830381600087803b15801561117b57600080fd5b505af115801561118f573d6000803e3d6000fd5b50505050600088111561128f57600687015460005460405163095ea7b360e01b81526001600160a01b036201000090920482166004820152602481018b905291169063095ea7b3906044016020604051808303816000875af11580156111f9573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061121d91906130a6565b506000546006880154604051634b390ec560e11b8152600481018b90526001600160a01b0391821660248201526201000090920416906396721d8a90604401600060405180830381600087803b15801561127657600080fd5b505af115801561128a573d6000803e3d6000fd5b505050505b86546112a49087670de0b6b3a764000061283d565b600082815260086020526040812080549091906112c2908490613083565b909155506114909050565b6000546001880154620100009091046001600160a01b031690633bc034bd906112ff9089670de0b6b3a764000061283d565b846040518363ffffffff1660e01b8152600401611326929190918252602082015260400190565b600060405180830381600087803b15801561134057600080fd5b505af1158015611354573d6000803e3d6000fd5b50505050600089111561145457600587015460005460405163095ea7b360e01b81526001600160a01b036201000090920482166004820152602481018c905291169063095ea7b3906044016020604051808303816000875af11580156113be573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113e291906130a6565b506000546005880154604051634b390ec560e11b8152600481018c90526001600160a01b0391821660248201526201000090920416906396721d8a90604401600060405180830381600087803b15801561143b57600080fd5b505af115801561144f573d6000803e3d6000fd5b505050505b600187015461146c9087670de0b6b3a764000061283d565b6000828152600860205260408120805490919061148a908490613083565b90915550505b60408051808201825260058082526430b33a32b960d91b602083015289015491516370a0823160e01b815230600482015261158c926001600160a01b0316906370a0823190602401602060405180830381865afa1580156114f5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115199190613130565b60068a01546040516370a0823160e01b81523060048201526001600160a01b03909116906370a0823190602401602060405180830381865afa158015611563573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115879190613130565b612964565b6115b26115a187670de0b6b3a7640000613083565b885490670de0b6b3a764000061283d565b87556115dd6115c987670de0b6b3a7640000613083565b600189015490670de0b6b3a764000061283d565b600188015560048701546064600160301b9091046001600160801b03161161166657611609818c611674565b60008b81526005602081905260408220828155600181018390556002810183905560038101929092556004820180546001600160b01b0319169055810180546001600160a01b031916905560060180546001600160b81b03191690555b505050505050509250929050565b600082815260066020526040812054905b818110156117755760008481526006602052604090208054849190839081106116b0576116b0613149565b9060005260206000200154036117635760008481526006602052604090206116d9600184613083565b815481106116e9576116e9613149565b906000526020600020015460066000868152602001908152602001600020828154811061171857611718613149565b9060005260206000200181905550600660008581526020019081526020016000208054806117485761174861315f565b60019003818190600052602060002001600090559055611775565b8061176d81612fd7565b915050611685565b50505050565b600154604051632411122160e11b815260009182916001600160a01b03909116906348222442906117b0908890600401613175565b602060405180830381865afa1580156117cd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117f19190613130565b6001546040516315083fbb60e31b8152600481018390529192506000916001600160a01b039091169063a841fdd890602401602060405180830381865afa158015611840573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118649190613130565b600154604051630ca32ed160e31b8152600481018590529192506000916001600160a01b0390911690636519768890602401602060405180830381865afa1580156118b3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118d791906131c2565b6001600160801b03945090506000808080895b8960020b8160020b1215611a375760015460405163da69b0b360e01b8152600481018a9052600283900b60248201526001600160a01b039091169063da69b0b390604401602060405180830381865afa15801561194b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061196f91906131df565b6001546040516319fda27760e01b8152600481018b9052600284900b60248201529196508895506001600160a01b0316906319fda27790604401602060405180830381865afa1580156119c6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119ea91906131df565b9250826119f785876130c1565b611a0191906130c1565b9150886001600160801b0316826001600160801b031610611a225788611a24565b815b9850611a3086826131fc565b90506118ea565b50505050505050509392505050565b606060066000611a596020850185612e2e565b611a696040860160208701612e2e565b611a796060870160408801613221565b604051602001611a8b93929190612ff0565b604051602081830303815290604052805190602001208152602001908152602001600020805480602002602001604051908101604052809291908181526020018280548015611af957602002820191906000526020600020905b815481526020019060010190808311611ae5575b50505050509050919050565b611b0d612b0f565b5060009081526005602081815260409283902083516101008101855281548152600182015481840152600280830154828701526003830154606080840191909152600484015480830b60808501526301000000810490920b60a0840152600160301b9091046001600160801b031660c083015285519081018652938201546001600160a01b03908116855260069092015491821692840192909252600160a01b900462ffffff169282019290925260e082015290565b611bee6040518060800160405280600081526020016000815260200160008152602001600081525090565b604080516101e081018252600080825260208201819052818301819052606082018190526080820181905260a0820181905260c0820181905260e08201819052610100820181905261012082018190526101408201819052610160820181905261018082018190526101a082018190526101c08201526001549151639525092360e01b815290916001600160a01b031690639525092390611c93908a90600401613175565b6101c060405180830381865afa158015611cb1573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611cd5919061324e565b5060020b6101208301526001600160a01b0316610140820181905260408051633850c7bd60e01b81529051633850c7bd9160048082019260e0929091908290030181865afa158015611d2b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611d4f9190613345565b5050505060029190910b606084015250611d6e90506020880188612e2e565b611d7e6040890160208a01612e2e565b611d8e60608a0160408b01613221565b604051602001611da093929190612ff0565b60408051601f1981840301815291815281516020928301206101c08401819052600090815260079092529081902054600290810b91830182905260608301519085900b91611ded91612a3d565b60020b1215611dfc5750612427565b6101208101516060820151611e129082906133d8565b611e1c9190613412565b60020b60608201526101c0810151600090815260066020908152604080832080548251818502810185019093528083529192909190830182828015611e8057602002820191906000526020600020905b815481526020019060010190808311611e6c575b50505050509050611e8f612b0f565b60005b82518110156120c65760056000848381518110611eb157611eb1613149565b602090810291909101810151825281810192909252604090810160002081516101008101835281548152600182015481850152600280830154828501526003830154606080840191909152600484015480830b60808501526301000000810490920b60a0840152600160301b9091046001600160801b0390811660c084019081528551928301865260058501546001600160a01b03908116845260069095015494851696830196909652600160a01b90930462ffffff169381019390935260e081019290925291519093506064911611156120b457611f998a83608001518460a0015161177b565b6001600160801b03166101008501528251600090819061208190869085908110611fc557611fc5613149565b60200260200101518761010001516001600160801b031660056000898881518110611ff257611ff2613149565b6020026020010151815260200190815260200160002060040160069054906101000a90046001600160801b03166001600160801b03161015612076576005600088878151811061204457612044613149565b6020026020010151815260200190815260200160002060040160069054906101000a90046001600160801b0316610af4565b876101000151610af4565b9150915081876040018181516120979190613070565b9052506060870180518291906120ae908390613070565b90525050505b806120be81612fd7565b915050611e92565b50600060029054906101000a90046001600160a01b03166001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa15801561211a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061213e9190612f63565b6001600160a01b031661215460208b018b612e2e565b6001600160a01b0316146101608401819052156121ce578683610120015161217c9190613412565b836060015161218b91906131fc565b60020b60a08401526101208301516121a4908990613412565b83606001516121b391906131fc565b600290810b60c085015260a0840151900b60e084015261222d565b878361012001516121df9190613412565b83606001516121ee9190613432565b60020b60a0840152610120830151612207908890613412565b83606001516122169190613432565b600290810b60c085015260a0840151900b60e08401525b600060029054906101000a90046001600160a01b03166001600160a01b0316639e1a4d196040518163ffffffff1660e01b8152600401602060405180830381865afa158015612280573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906122a49190613130565b61018084019081526101c08401516000908152600860205260409020546101a0850181905290516122de9088670de0b6b3a764000061283d565b10156122eb576000612314565b6101a083015161018084015161230a9088670de0b6b3a764000061283d565b6123149190613083565b835261012083015160a084015160c08501516123309190613432565b61233a91906133d8565b83516123499160020b90612fc3565b60208401528251156123f5575b8260c0015160020b8360e0015160020b12156123f5576000806123a0612381368d90038d018d613457565b60e087015161012088015161239690826131fc565b88602001516102a4565b509150915081866000018181516123b79190613070565b9052506020860180518291906123ce908390613070565b905250505061012083015160e0840180516123ea9083906131fc565b60020b905250612356565b505060608101516101c0909101516000908152600760205260409020805462ffffff191662ffffff9092169190911790555b95945050505050565b60008060008360020b12612447578260020b61244f565b8260020b6000035b9050620d89e8811115612475576040516315e4079d60e11b815260040160405180910390fd5b60008160011660000361248c57600160801b61249e565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff16905060028216156124d2576ffff97272373d413259a46990580e213a0260801c5b60048216156124f1576ffff2e50f5f656932ef12357cf3c7fdcc0260801c5b6008821615612510576fffe5caca7e10e4e61c3624eaa0941cd00260801c5b601082161561252f576fffcb9843d60f6159c9db58835c9266440260801c5b602082161561254e576fff973b41fa98c081472e6896dfb254c00260801c5b604082161561256d576fff2ea16466c96a3843ec78b326b528610260801c5b608082161561258c576ffe5dee046a99a2a811c461f1969c30530260801c5b6101008216156125ac576ffcbe86c7900a88aedcffc83b479aa3a40260801c5b6102008216156125cc576ff987a7253ac413176f2b074cf7815e540260801c5b6104008216156125ec576ff3392b0822b70005940c7a398e4b70f30260801c5b61080082161561260c576fe7159475a2c29b7443b29c7fa6e889d90260801c5b61100082161561262c576fd097f3bdfd2022b8845ad8f792aa58250260801c5b61200082161561264c576fa9f746462d870fdf8a65dc1f90e061e50260801c5b61400082161561266c576f70d869a156d2a1b890bb3df62baf32f70260801c5b61800082161561268c576f31be135f97d08fd981231505542fcfa60260801c5b620100008216156126ad576f09aa508b5b7a84e1c677de54f3e99bc90260801c5b620200008216156126cd576e5d6af8dedb81196699c329225ee6040260801c5b620400008216156126ec576d2216e584f5fa1ea926041bedfe980260801c5b62080000821615612709576b048a170391f7dc42444e8fa20260801c5b60008460020b131561272a57806000198161272657612726612fad565b0490505b64010000000081061561273e576001612741565b60005b60ff16602082901c0192505050919050565b6000826001600160a01b0316846001600160a01b03161115612773579192915b61279c61279783600160601b6127898888613473565b6001600160a01b0316612a6e565b612aa8565b90505b9392505050565b6000826001600160a01b0316846001600160a01b031611156127c6579192915b60006127e9856001600160a01b0316856001600160a01b0316600160601b612a6e565b9050801561280b5761280361279784836127898989613473565b91505061279f565b612803612797612829856001600160a01b0389166127898a8a613473565b866001600160a01b0316600160601b612a6e565b6000808060001985870985870292508281108382030391505080600003612876576000841161286b57600080fd5b50829004905061279f565b8084116128ae5760405162461bcd60e51b815260206004820152600660248201526536bab62234bb60d11b60448201526064016102f1565b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150509392505050565b6117758484848460405160240161293594939291906134d9565b60408051601f198184030181529190526020810180516001600160e01b03166304772b3360e11b179052612aee565b610aef83838360405160240161297c93929190613508565b60408051601f198184030181529190526020810180516001600160e01b031663969cdd0360e01b179052612aee565b60405160248101839052604481018290526129f19060640160408051601f198184030181529190526020810180516001600160e01b031662d81ed360e71b179052612aee565b5050565b612a3a81604051602401612a0b91815260200190565b60408051601f198184030181529190526020810180516001600160e01b0316634e0c1d1d60e01b179052612aee565b50565b60008160020b8360020b13612a5b57612a568383613432565b612a65565b612a658284613432565b90505b92915050565b6000808060001985870985870292508281108382030391505080600003612a9c576000841161286b57600080fd5b8084116128ae57600080fd5b806001600160801b0381168114612ae95760405162461bcd60e51b81526020600482015260056024820152640858d85cdd60da1b60448201526064016102f1565b919050565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b60408051610100810182526000808252602080830182905282840182905260608084018390526080840183905260a0840183905260c0840183905284519081018552828152908101829052928301529060e082015290565b60405160e0810167ffffffffffffffff81118282101715612b9857634e487b7160e01b600052604160045260246000fd5b60405290565b60405160c0810167ffffffffffffffff81118282101715612b9857634e487b7160e01b600052604160045260246000fd5b6001600160a01b0381168114612a3a57600080fd5b803562ffffff81168114612ae957600080fd5b600060608284031215612c0957600080fd5b6040516060810181811067ffffffffffffffff82111715612c3a57634e487b7160e01b600052604160045260246000fd5b6040529050808235612c4b81612bcf565b81526020830135612c5b81612bcf565b6020820152612c6c60408401612be4565b60408201525092915050565b8060020b8114612a3a57600080fd5b60008060008060c08587031215612c9d57600080fd5b612ca78686612bf7565b93506060850135612cb781612c78565b92506080850135612cc781612c78565b9396929550929360a00135925050565b60008060408385031215612cea57600080fd5b50508035926020909101359150565b60008060408385031215612d0c57600080fd5b8235612d1781612bcf565b91506020830135612d2781612bcf565b809150509250929050565b6001600160801b0381168114612a3a57600080fd5b60008060408385031215612d5a57600080fd5b823591506020830135612d2781612d32565b600060608284031215612d7e57600080fd5b50919050565b600080600060a08486031215612d9957600080fd5b612da38585612d6c565b92506060840135612db381612c78565b91506080840135612dc381612c78565b809150509250925092565b600060608284031215612de057600080fd5b612a658383612d6c565b6020808252825182820181905260009190848201906040850190845b81811015612e2257835183529284019291840191600101612e06565b50909695505050505050565b600060208284031215612e4057600080fd5b813561279f81612bcf565b600060208284031215612e5d57600080fd5b5035919050565b60006101408201905082518252602083015160208301526040830151604083015260608301516060830152608083015160020b608083015260a083015160020b60a08301526001600160801b0360c08401511660c083015260e0830151612ef560e084018280516001600160a01b0390811683526020808301519091169083015260409081015162ffffff16910152565b5092915050565b600080600080600060e08688031215612f1457600080fd5b612f1e8787612d6c565b94506060860135612f2e81612c78565b93506080860135612f3e81612c78565b925060a0860135915060c0860135612f5581612c78565b809150509295509295909350565b600060208284031215612f7557600080fd5b815161279f81612bcf565b634e487b7160e01b600052601160045260246000fd5b8082028115828204841417612a6857612a68612f80565b634e487b7160e01b600052601260045260246000fd5b600082612fd257612fd2612fad565b500490565b600060018201612fe957612fe9612f80565b5060010190565b606093841b6bffffffffffffffffffffffff1990811682529290931b909116601483015260e81b6001600160e81b0319166028820152602b0190565b6001600160801b03818116838216019080821115612ef557612ef5612f80565b6000806040838503121561305f57600080fd5b505080516020909101519092909150565b80820180821115612a6857612a68612f80565b81810381811115612a6857612a68612f80565b80518015158114612ae957600080fd5b6000602082840312156130b857600080fd5b612a6582613096565b6001600160801b03828116828216039080821115612ef557612ef5612f80565b600080604083850312156130f457600080fd5b82516130ff81612d32565b6020840151909250612d2781612d32565b8181036000831280158383131683831282161715612ef557612ef5612f80565b60006020828403121561314257600080fd5b5051919050565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052603160045260246000fd5b60608101823561318481612bcf565b6001600160a01b0390811683526020840135906131a082612bcf565b16602083015262ffffff6131b660408501612be4565b16604083015292915050565b6000602082840312156131d457600080fd5b815161279f81612c78565b6000602082840312156131f157600080fd5b815161279f81612d32565b600281810b9083900b01627fffff8113627fffff1982121715612a6857612a68612f80565b60006020828403121561323357600080fd5b612a6582612be4565b805161ffff81168114612ae957600080fd5b60008060008385036101c081121561326557600080fd5b845161327081612bcf565b602086015190945061328181612c78565b9250603f19016101808082121561329757600080fd5b61329f612b67565b60c08312156132ad57600080fd5b6132b5612b9e565b925060408701518352606087015160208401526080870151604084015260a0870151606084015260c0870151608084015260e087015160a0840152828152610100870151602082015261012087015160408201526101408701516060820152613321610160880161323c565b60808201529086015160a08201526101a09095015160c08601525091949093509050565b600080600080600080600060e0888a03121561336057600080fd5b875161336b81612bcf565b602089015190975061337c81612c78565b955061338a6040890161323c565b94506133986060890161323c565b93506133a66080890161323c565b925060a088015160ff811681146133bc57600080fd5b91506133ca60c08901613096565b905092959891949750929550565b60008160020b8360020b806133ef576133ef612fad565b627fffff1982146000198214161561340957613409612f80565b90059392505050565b60008260020b8260020b028060020b9150808214612ef557612ef5612f80565b600282810b9082900b03627fffff198112627fffff82131715612a6857612a68612f80565b60006060828403121561346957600080fd5b612a658383612bf7565b6001600160a01b03828116828216039080821115612ef557612ef5612f80565b6000815180845260005b818110156134b95760208185018101518683018201520161349d565b506000602082860101526020601f19601f83011685010191505092915050565b6080815260006134ec6080830187613493565b6020830195909552506040810192909252606090910152919050565b60608152600061351b6060830186613493565b6020830194909452506040015291905056fea2646970667358221220ef42ae0c1aeb84d7833acbe7b7d9618b4e02491e8359d0db8acbcf42e0b94e2164736f6c63430008120033";

type LPManager2ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: LPManager2ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class LPManager2__factory extends ContractFactory {
  constructor(...args: LPManager2ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<LPManager2> {
    return super.deploy(overrides || {}) as Promise<LPManager2>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): LPManager2 {
    return super.attach(address) as LPManager2;
  }
  override connect(signer: Signer): LPManager2__factory {
    return super.connect(signer) as LPManager2__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): LPManager2Interface {
    return new utils.Interface(_abi) as LPManager2Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): LPManager2 {
    return new Contract(address, _abi, signerOrProvider) as LPManager2;
  }
}
