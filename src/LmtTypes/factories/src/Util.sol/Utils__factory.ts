/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { Utils, UtilsInterface } from "../../../src/Util.sol/Utils";

const _abi = [
  {
    inputs: [],
    name: "T",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint160",
        name: "price",
        type: "uint160",
      },
      {
        internalType: "uint256",
        name: "maxSlippage",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "down",
        type: "bool",
      },
    ],
    name: "applySlippageX96",
    outputs: [
      {
        internalType: "uint160",
        name: "",
        type: "uint160",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
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
            name: "Urate",
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
      {
        internalType: "uint256",
        name: "percentageClosed",
        type: "uint256",
      },
      {
        internalType: "int24",
        name: "tickDiscretization",
        type: "int24",
      },
      {
        internalType: "int24",
        name: "tick",
        type: "int24",
      },
    ],
    name: "getAmountsRequired",
    outputs: [
      {
        internalType: "uint256",
        name: "amount0Required",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1Required",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IUniswapV3Pool",
        name: "pool",
        type: "IUniswapV3Pool",
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
    name: "getFeeGrowthInside",
    outputs: [
      {
        internalType: "uint256",
        name: "feeGrowthInside0X128",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "feeGrowthInside1X128",
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
            name: "Urate",
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
      {
        internalType: "bool",
        name: "getToken0",
        type: "bool",
      },
      {
        internalType: "int24",
        name: "tickSpacing",
        type: "int24",
      },
    ],
    name: "getFilledAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "filledAmount",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
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
            name: "Urate",
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
      {
        internalType: "bool",
        name: "getToken0",
        type: "bool",
      },
      {
        internalType: "int24",
        name: "tickSpacing",
        type: "int24",
      },
      {
        internalType: "uint256",
        name: "percentage",
        type: "uint256",
      },
    ],
    name: "getFilledAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "filledAmount",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
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
            name: "Urate",
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
    name: "getMinMaxTicks",
    outputs: [
      {
        internalType: "int24",
        name: "min",
        type: "int24",
      },
      {
        internalType: "int24",
        name: "max",
        type: "int24",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
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
            name: "Urate",
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
      {
        internalType: "uint256",
        name: "reducePercentage",
        type: "uint256",
      },
    ],
    name: "getRepayInfo",
    outputs: [
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
            name: "Urate",
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
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
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
            name: "Urate",
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
        name: "arr1",
        type: "tuple[]",
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
            name: "Urate",
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
        name: "arr2",
        type: "tuple[]",
      },
    ],
    name: "mergeSortedArrays",
    outputs: [
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
            name: "Urate",
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
        internalType: "int24",
        name: "tick",
        type: "int24",
      },
      {
        internalType: "bool",
        name: "down",
        type: "bool",
      },
      {
        internalType: "int24",
        name: "tickSpacing",
        type: "int24",
      },
    ],
    name: "roundTick",
    outputs: [
      {
        internalType: "int24",
        name: "",
        type: "int24",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
] as const;

const _bytecode =
  "0x6125c661003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe730000000000000000000000000000000000000000301460806040526004361061009d5760003560e01c806341533fe71161007057806341533fe71461013257806394cdfca5146101535780639887b58914610166578063ad44d2981461018e578063b45082e2146101a157600080fd5b8063207b0576146100a257806330940b88146100d257806334dc5458146100f257806337a6142114610105575b600080fd5b6100b56100b0366004611d2b565b6101c7565b6040516001600160a01b0390911681526020015b60405180910390f35b6100e56100e0366004611ee9565b61022f565b6040516100c99190611f4d565b6100e5610100366004611fdb565b6108c5565b610118610113366004612020565b610952565b60408051600293840b81529190920b6020820152016100c9565b610145610140366004612055565b610a39565b6040519081526020016100c9565b6101456101613660046120ae565b610bad565b610179610174366004612118565b610cef565b604080519283526020830191909152016100c9565b61017961019c366004612148565b610fba565b6101b46101af3660046121b4565b61129f565b60405160029190910b81526020016100c9565b6000816101d457826101e7565b6101e7670de0b6b3a76400008085611310565b9250600061020284600160601b670de0b6b3a7640000611310565b905061022461021f866001600160a01b031683600160601b611310565b6113f3565b9150505b9392505050565b8151815160609190600061024382846121fa565b905060008167ffffffffffffffff81111561026057610260611d6d565b60405190808252806020026020018201604052801561029957816020015b610286611cbf565b81526020019060019003908161027e5790505b50905060008060005b86831080156102b057508582105b156104a45760006102fb8b85815181106102cc576102cc61220d565b6020026020010151600001518b85815181106102ea576102ea61220d565b602002602001015160000151611441565b121561034b578983815181106103135761031361220d565b602002602001015184828151811061032d5761032d61220d565b6020026020010181905250828061034390612223565b935050610492565b60006103628b85815181106102cc576102cc61220d565b13156103b25788828151811061037a5761037a61220d565b60200260200101518482815181106103945761039461220d565b602002602001018190525081806103aa90612223565b925050610492565b6040518060e001604052808b85815181106103cf576103cf61220d565b60200260200101516000015160020b81526020018a84815181106103f5576103f561220d565b6020026020010151602001518c86815181106104135761041361220d565b602002602001015160200151610429919061223c565b6001600160801b0316815260200160008152602001600081526020016000815260200160008152602001600081525084828151811061046a5761046a61220d565b6020026020010181905250828061048090612223565b935050818061048e90612223565b9250505b8061049c81612223565b9150506102a2565b86831015610504578983815181106104be576104be61220d565b60200260200101518482815181106104d8576104d861220d565b602002602001018190525082806104ee90612223565b93505080806104fc90612223565b9150506104a4565b858210156105645788828151811061051e5761051e61220d565b60200260200101518482815181106105385761053861220d565b6020026020010181905250818061054e90612223565b925050808061055c90612223565b915050610504565b60008093505b858410156106ea57600061057f8560016121fa565b93505b8684101561068c5785848151811061059c5761059c61220d565b60200260200101516000015160020b8686815181106105bd576105bd61220d565b60200260200101516000015160020b0361067a57600190508584815181106105e7576105e761220d565b6020026020010151602001518686815181106106055761060561220d565b602002602001015160200181815161061d919061223c565b6001600160801b0316905250855186908690811061063d5761063d61220d565b60200260200101516020015186858151811061065b5761065b61220d565b6020908102919091018101516001600160801b0390921691015261068c565b8361068481612223565b945050610582565b806106d7578585815181106106a3576106a361220d565b60200260200101518683815181106106bd576106bd61220d565b602002602001018190525081806106d390612223565b9250505b50836106e281612223565b94505061056a565b8085526107038560006106fe600185612263565b61148a565b60008167ffffffffffffffff81111561071e5761071e611d6d565b60405190808252806020026020018201604052801561075757816020015b610744611cbf565b81526020019060019003908161073c5790505b5090506000935060005b865181101561081c5786818151811061077c5761077c61220d565b60200260200101516000015160020b60001480156107c057508681815181106107a7576107a761220d565b6020026020010151602001516001600160801b03166000145b61080a578681815181106107d6576107d661220d565b60200260200101518286815181106107f0576107f061220d565b6020026020010181905250848061080690612223565b9550505b8061081481612223565b915050610761565b50856001875161082c9190612263565b8151811061083c5761083c61220d565b60200260200101516000015160020b600014801561088d575085600187516108649190612263565b815181106108745761087461220d565b6020026020010151602001516001600160801b03166000145b156108a3578161089c81612276565b9250508181525b6108b48160006106fe600186612263565b985050505050505050505b92915050565b606060005b835181101561094a5761090c8482815181106108e8576108e861220d565b6020026020010151602001516001600160801b031684670de0b6b3a7640000611310565b84828151811061091e5761091e61220d565b6020908102919091018101516001600160801b039092169101528061094281612223565b9150506108ca565b509192915050565b600080826000815181106109685761096861220d565b602090810291909101015151915081905060015b8351811015610a33578260020b84828151811061099b5761099b61220d565b60200260200101516000015160020b12156109d5578381815181106109c2576109c261220d565b6020026020010151600001519250610a21565b8160020b8482815181106109eb576109eb61220d565b60200260200101516000015160020b1315610a2157838181518110610a1257610a1261220d565b60200260200101516000015191505b80610a2b81612223565b91505061097c565b50915091565b6000805b8451811015610ba557848181518110610a5857610a5861220d565b6020026020010151602001516001600160801b031660000315610b93578315610b2c57610b12610aa4868381518110610a9357610a9361220d565b602002602001015160000151611631565b610ad585888581518110610aba57610aba61220d565b602002602001015160000151610ad0919061228d565b611631565b610b04888581518110610aea57610aea61220d565b6020026020010151602001516001600160801b0316611954565b610b0d906122b2565b611994565b610b1b906122e1565b610b2590836121fa565b9150610b93565b610b7d610b44868381518110610a9357610a9361220d565b610b5a85888581518110610aba57610aba61220d565b610b6f888581518110610aea57610aea61220d565b610b78906122b2565b6119d9565b610b86906122e1565b610b9090836121fa565b91505b80610b9d81612223565b915050610a3d565b509392505050565b6000805b8551811015610ce657858181518110610bcc57610bcc61220d565b6020026020010151602001516001600160801b031660000315610cd4578415610c7857610c5e610c07878381518110610a9357610a9361220d565b610c1d86898581518110610aba57610aba61220d565b610b04610c598a8681518110610c3557610c3561220d565b6020026020010151602001516001600160801b031688670de0b6b3a7640000611310565b611954565b610c67906122e1565b610c7190836121fa565b9150610cd4565b610cbe610c90878381518110610a9357610a9361220d565b610ca686898581518110610aba57610aba61220d565b610b6f610c598a8681518110610c3557610c3561220d565b610cc7906122e1565b610cd190836121fa565b91505b80610cde81612223565b915050610bb1565b50949350505050565b6000806000856001600160a01b0316633850c7bd6040518163ffffffff1660e01b815260040160e060405180830381865afa158015610d32573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d56919061231a565b505060405163f30dba9360e01b815260028b900b60048201529395506000945084936001600160a01b038c16935063f30dba939250602401905061010060405180830381865afa158015610dae573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610dd291906123b2565b505060405163f30dba9360e01b815260028d900b600482015293975091955060009450849350506001600160a01b038c169163f30dba93915060240161010060405180830381865afa158015610e2c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e5091906123b2565b505050509350935050508860020b8560020b1215610e8557610e728285612263565b9650610e7e8184612263565b9550610fad565b8760020b8560020b1215610f945760008a6001600160a01b031663f30583996040518163ffffffff1660e01b8152600401602060405180830381865afa158015610ed3573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ef79190612460565b905060008b6001600160a01b031663461413196040518163ffffffff1660e01b8152600401602060405180830381865afa158015610f39573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f5d9190612460565b905083610f6a8784612263565b610f749190612263565b985082610f818683612263565b610f8b9190612263565b97505050610fad565b610f9e8483612263565b9650610faa8382612263565b95505b5050505050935093915050565b60008060005b8651811015611295576000610fe0888381518110610c3557610c3561220d565b90506110206040518060400160405280601881526020017f67657474696e6720616d6f756e74732072657175697265640000000000000000815250611a08565b6110498883815181106110355761103561220d565b60200260200101516000015160020b611a4e565b61105b816001600160801b0316611a93565b61107261106a8660018961129f565b60020b611a4e565b8460020b8883815181106110885761108861220d565b60200260200101516000015160020b131580156110d257508460020b868984815181106110b7576110b761220d565b6020026020010151600001516110cd919061228d565b60020b135b1561116f5760006111016110e587611631565b6110fb898c8781518110610aba57610aba61220d565b84611994565b9050600061112c61111d8b8681518110610a9357610a9361220d565b61112689611631565b856119d9565b905061113882876121fa565b955061114481866121fa565b9450611168604051806040016040528060018152602001603f60f81b815250611a08565b5050611282565b61117b8560018861129f565b60020b8883815181106111905761119061220d565b60200260200101516000015160020b1361120c576111d86111bc898481518110610a9357610a9361220d565b6111d2888b8681518110610aba57610aba61220d565b836119d9565b6111e290846121fa565b9250611207604051806040016040528060028152602001613f3f60f01b815250611a08565b611282565b6112188560008861129f565b60020b88838151811061122d5761122d61220d565b60200260200101516000015160020b1261128257611275611259898481518110610a9357610a9361220d565b61126f888b8681518110610aba57610aba61220d565b83611994565b61127f90856121fa565b93505b508061128d81612223565b915050610fc0565b5094509492505050565b6000806112ac838661248f565b905060008560020b13156112ec57836112da57826112cb82600161228d565b6112d591906124c9565b6112e4565b6112e483826124c9565b915050610228565b836112fb576112d583826124c9565b8261130681836124c9565b6112e491906124e9565b6000808060001985870985870292508281108382030391505080600003611349576000841161133e57600080fd5b508290049050610228565b8084116113865760405162461bcd60e51b815260206004820152600660248201526536bab62234bb60d11b60448201526064015b60405180910390fd5b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150509392505050565b806001600160a01b038116811461143c5760405162461bcd60e51b815260206004820152600d60248201526c31b0b9ba34b7339032b93937b960991b604482015260640161137d565b919050565b6000808360020b128015611458575060008260020b125b15611476578260020b8260020b61146f919061250e565b90506108bf565b61148082846124e9565b60020b9392505050565b80821061149657505050565b60016114a28383612263565b116114ac57505050565b818160008560026114bd84866121fa565b6114c7919061252e565b815181106114d7576114d761220d565b602002602001015190505b818311611603575b806000015160020b8684815181106115045761150461220d565b60200260200101516000015160020b121561152b578261152381612223565b9350506114ea565b806000015160020b8683815181106115455761154561220d565b60200260200101516000015160020b131561156c578161156481612276565b92505061152b565b8183116115fe578582815181106115855761158561220d565b602002602001015186848151811061159f5761159f61220d565b60200260200101518785815181106115b9576115b961220d565b602002602001018885815181106115d2576115d261220d565b60200260200101829052829052505082806115ec90612223565b93505081806115fa90612276565b9250505b6114e2565b818510156116165761161686868461148a565b838310156116295761162986848661148a565b505050505050565b60008060008360020b12611648578260020b611650565b8260020b6000035b9050620d89e8811115611676576040516315e4079d60e11b815260040160405180910390fd5b60008160011660000361168d57600160801b61169f565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff16905060028216156116d3576ffff97272373d413259a46990580e213a0260801c5b60048216156116f2576ffff2e50f5f656932ef12357cf3c7fdcc0260801c5b6008821615611711576fffe5caca7e10e4e61c3624eaa0941cd00260801c5b6010821615611730576fffcb9843d60f6159c9db58835c9266440260801c5b602082161561174f576fff973b41fa98c081472e6896dfb254c00260801c5b604082161561176e576fff2ea16466c96a3843ec78b326b528610260801c5b608082161561178d576ffe5dee046a99a2a811c461f1969c30530260801c5b6101008216156117ad576ffcbe86c7900a88aedcffc83b479aa3a40260801c5b6102008216156117cd576ff987a7253ac413176f2b074cf7815e540260801c5b6104008216156117ed576ff3392b0822b70005940c7a398e4b70f30260801c5b61080082161561180d576fe7159475a2c29b7443b29c7fa6e889d90260801c5b61100082161561182d576fd097f3bdfd2022b8845ad8f792aa58250260801c5b61200082161561184d576fa9f746462d870fdf8a65dc1f90e061e50260801c5b61400082161561186d576f70d869a156d2a1b890bb3df62baf32f70260801c5b61800082161561188d576f31be135f97d08fd981231505542fcfa60260801c5b620100008216156118ae576f09aa508b5b7a84e1c677de54f3e99bc90260801c5b620200008216156118ce576e5d6af8dedb81196699c329225ee6040260801c5b620400008216156118ed576d2216e584f5fa1ea926041bedfe980260801c5b6208000082161561190a576b048a170391f7dc42444e8fa20260801c5b60008460020b131561192b57806000198161192757611927612479565b0490505b64010000000081061561193f576001611942565b60005b60ff16602082901c0192505050919050565b80600f81900b811461143c5760405162461bcd60e51b81526020600482015260096024820152681cd859994818d85cdd60ba1b604482015260640161137d565b60008082600f0b126119ba576119b56119b08585856001611ad8565b611b98565b6119d1565b6119cd6119b08585856000036000611ad8565b6000035b949350505050565b60008082600f0b126119f5576119b56119b08585856001611be5565b6119cd6119b08585856000036000611be5565b611a4b81604051602401611a1c9190612542565b60408051601f198184030181529190526020810180516001600160e01b031663104c13eb60e21b179052611c5e565b50565b611a4b81604051602401611a6491815260200190565b60408051601f198184030181529190526020810180516001600160e01b0316634e0c1d1d60e01b179052611c5e565b611a4b81604051602401611aa991815260200190565b60408051601f198184030181529190526020810180516001600160e01b031663f5b1bba960e01b179052611c5e565b6000836001600160a01b0316856001600160a01b03161115611af8579293925b6fffffffffffffffffffffffffffffffff60601b606084901b166001600160a01b038686038116908716611b2b57600080fd5b83611b6157866001600160a01b0316611b4e8383896001600160a01b0316611310565b81611b5b57611b5b612479565b04611b8d565b611b8d611b788383896001600160a01b0316611c7f565b886001600160a01b0316808204910615150190565b979650505050505050565b6000600160ff1b8210611be15760405162461bcd60e51b8152602060048201526011602482015270191a9b1031b0b9ba34b7339032b93937b960791b604482015260640161137d565b5090565b6000836001600160a01b0316856001600160a01b03161115611c05579293925b81611c3257611c2d836001600160801b03168686036001600160a01b0316600160601b611310565b611c55565b611c55836001600160801b03168686036001600160a01b0316600160601b611c7f565b95945050505050565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b6000611c8c848484611310565b905060008280611c9e57611c9e612479565b8486091115610228576000198110611cb557600080fd5b6001019392505050565b6040518060e00160405280600060020b815260200160006001600160801b0316815260200160008152602001600081526020016000815260200160008152602001600081525090565b6001600160a01b0381168114611a4b57600080fd5b8015158114611a4b57600080fd5b600080600060608486031215611d4057600080fd5b8335611d4b81611d08565b9250602084013591506040840135611d6281611d1d565b809150509250925092565b634e487b7160e01b600052604160045260246000fd5b60405160e0810167ffffffffffffffff81118282101715611da657611da6611d6d565b60405290565b604051601f8201601f1916810167ffffffffffffffff81118282101715611dd557611dd5611d6d565b604052919050565b8060020b8114611a4b57600080fd5b6001600160801b0381168114611a4b57600080fd5b600082601f830112611e1257600080fd5b8135602067ffffffffffffffff821115611e2e57611e2e611d6d565b611e3c818360051b01611dac565b82815260e09283028501820192828201919087851115611e5b57600080fd5b8387015b85811015611edc5781818a031215611e775760008081fd5b611e7f611d83565b8135611e8a81611ddd565b815281860135611e9981611dec565b8187015260408281013590820152606080830135908201526080808301359082015260a0808301359082015260c080830135908201528452928401928101611e5f565b5090979650505050505050565b60008060408385031215611efc57600080fd5b823567ffffffffffffffff80821115611f1457600080fd5b611f2086838701611e01565b93506020850135915080821115611f3657600080fd5b50611f4385828601611e01565b9150509250929050565b602080825282518282018190526000919060409081850190868401855b82811015611fce578151805160020b8552868101516001600160801b0316878601528581015186860152606080820151908601526080808201519086015260a0808201519086015260c0908101519085015260e09093019290850190600101611f6a565b5091979650505050505050565b60008060408385031215611fee57600080fd5b823567ffffffffffffffff81111561200557600080fd5b61201185828601611e01565b95602094909401359450505050565b60006020828403121561203257600080fd5b813567ffffffffffffffff81111561204957600080fd5b6119d184828501611e01565b60008060006060848603121561206a57600080fd5b833567ffffffffffffffff81111561208157600080fd5b61208d86828701611e01565b935050602084013561209e81611d1d565b91506040840135611d6281611ddd565b600080600080608085870312156120c457600080fd5b843567ffffffffffffffff8111156120db57600080fd5b6120e787828801611e01565b94505060208501356120f881611d1d565b9250604085013561210881611ddd565b9396929550929360600135925050565b60008060006060848603121561212d57600080fd5b833561213881611d08565b9250602084013561209e81611ddd565b6000806000806080858703121561215e57600080fd5b843567ffffffffffffffff81111561217557600080fd5b61218187828801611e01565b94505060208501359250604085013561219981611ddd565b915060608501356121a981611ddd565b939692955090935050565b6000806000606084860312156121c957600080fd5b83356121d481611ddd565b9250602084013561209e81611d1d565b634e487b7160e01b600052601160045260246000fd5b808201808211156108bf576108bf6121e4565b634e487b7160e01b600052603260045260246000fd5b600060018201612235576122356121e4565b5060010190565b6001600160801b0381811683821601908082111561225c5761225c6121e4565b5092915050565b818103818111156108bf576108bf6121e4565b600081612285576122856121e4565b506000190190565b600281810b9083900b01627fffff8113627fffff19821217156108bf576108bf6121e4565b600081600f0b6f7fffffffffffffffffffffffffffffff1981036122d8576122d86121e4565b60000392915050565b6000600160ff1b82016122f6576122f66121e4565b5060000390565b805161ffff8116811461143c57600080fd5b805161143c81611d1d565b600080600080600080600060e0888a03121561233557600080fd5b875161234081611d08565b602089015190975061235181611ddd565b955061235f604089016122fd565b945061236d606089016122fd565b935061237b608089016122fd565b925060a088015160ff8116811461239157600080fd5b60c08901519092506123a281611d1d565b8091505092959891949750929550565b600080600080600080600080610100898b0312156123cf57600080fd5b88516123da81611dec565b80985050602089015180600f0b81146123f257600080fd5b80975050604089015195506060890151945060808901518060060b811461241857600080fd5b60a08a015190945061242981611d08565b60c08a015190935063ffffffff8116811461244357600080fd5b915061245160e08a0161230f565b90509295985092959890939650565b60006020828403121561247257600080fd5b5051919050565b634e487b7160e01b600052601260045260246000fd5b60008160020b8360020b806124a6576124a6612479565b627fffff198214600019821416156124c0576124c06121e4565b90059392505050565b60008260020b8260020b028060020b915080821461225c5761225c6121e4565b600282810b9082900b03627fffff198112627fffff821317156108bf576108bf6121e4565b818103600083128015838313168383128216171561225c5761225c6121e4565b60008261253d5761253d612479565b500490565b600060208083528351808285015260005b8181101561256f57858101830151858201604001528201612553565b506000604082860101526040601f19601f830116850101925050509291505056fea264697066735822122028cb7951371435a147482a26414543fab4fa25a71b81c530dcf0f24afe4fc25b64736f6c63430008120033";

type UtilsConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: UtilsConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Utils__factory extends ContractFactory {
  constructor(...args: UtilsConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Utils> {
    return super.deploy(overrides || {}) as Promise<Utils>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Utils {
    return super.attach(address) as Utils;
  }
  override connect(signer: Signer): Utils__factory {
    return super.connect(signer) as Utils__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): UtilsInterface {
    return new utils.Interface(_abi) as UtilsInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Utils {
    return new Contract(address, _abi, signerOrProvider) as Utils;
  }
}
