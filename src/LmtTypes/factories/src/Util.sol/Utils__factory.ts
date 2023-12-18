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
      {
        internalType: "uint160",
        name: "sqrtPriceX96",
        type: "uint160",
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
        name: "positionIsToken0",
        type: "bool",
      },
      {
        internalType: "int24",
        name: "curTick",
        type: "int24",
      },
      {
        internalType: "int24",
        name: "tickDiscretization",
        type: "int24",
      },
    ],
    name: "getRangeConditions",
    outputs: [
      {
        internalType: "uint256",
        name: "",
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
        name: "loans1",
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
        name: "loans2",
        type: "tuple[]",
      },
    ],
    name: "mergeLiquidityLoans",
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
        internalType: "bool",
        name: "positionIsToken0",
        type: "bool",
      },
      {
        internalType: "int24",
        name: "curTick",
        type: "int24",
      },
      {
        internalType: "int24",
        name: "maxTick",
        type: "int24",
      },
      {
        internalType: "int24",
        name: "minTick",
        type: "int24",
      },
      {
        internalType: "int24",
        name: "tickDiscretization",
        type: "int24",
      },
    ],
    name: "rangeConditions",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
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
  "0x611b2461003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe730000000000000000000000000000000000000000301460806040526004361061009d5760003560e01c806337a614211161007057806337a614211461012d57806341533fe71461015a5780636e96fa7a1461017b578063a36b91681461018e578063b45082e2146101a157600080fd5b8063055d1548146100a25780630b7cb7c1146100cf578063207b0576146100ef57806334dc54581461011a575b600080fd5b6100b56100b03660046115ec565b6101c7565b604080519283526020830191909152015b60405180910390f35b6100e26100dd366004611665565b610418565b6040516100c691906116c9565b6101026100fd36600461175d565b610941565b6040516001600160a01b0390911681526020016100c6565b6100e2610128366004611799565b6109a9565b61014061013b3660046117de565b610a36565b60408051600293840b81529190920b6020820152016100c6565b61016d610168366004611813565b610b1d565b6040519081526020016100c6565b61016d610189366004611868565b610c65565b61016d61019c3660046118d7565b610c8f565b6101b46101af366004611930565b610d06565b60405160029190910b81526020016100c6565b60008060005b875181101561040d5760006102118983815181106101ed576101ed61195c565b6020026020010151602001516001600160801b031689670de0b6b3a7640000610d77565b90508560020b8983815181106102295761022961195c565b60200260200101516000015160020b1315801561027357508560020b878a84815181106102585761025861195c565b60200260200101516000015161026e9190611988565b60020b135b1561030a5760006102b5866102af8a8d87815181106102945761029461195c565b6020026020010151600001516102aa9190611988565b610e55565b84611178565b905060006102e96102e28c86815181106102d1576102d161195c565b602002602001015160000151610e55565b88856111bd565b90506102f582876119ad565b955061030181866119ad565b945050506103fa565b61031686600189610d06565b60020b89838151811061032b5761032b61195c565b60200260200101516000015160020b13610384576103736103578a84815181106102d1576102d161195c565b61036d898c86815181106102945761029461195c565b836111bd565b61037d90846119ad565b92506103fa565b61039086600089610d06565b60020b8983815181106103a5576103a561195c565b60200260200101516000015160020b126103fa576103ed6103d18a84815181106102d1576102d161195c565b6103e7898c86815181106102945761029461195c565b83611178565b6103f790856119ad565b93505b5080610405816119c0565b9150506101cd565b509550959350505050565b606060008251845161042a91906119ad565b67ffffffffffffffff8111156104425761044261146a565b60405190808252806020026020018201604052801561047b57816020015b610468611428565b8152602001906001900390816104605790505b5084519091506000805b86518110156104e6578681815181106104a0576104a061195c565b60200260200101518482815181106104ba576104ba61195c565b602002602001018190525081806104d0906119c0565b92505080806104de906119c0565b915050610485565b5060005b8551811015610847576000805b88518110156107dd578581815181106105125761051261195c565b60200260200101516000015160020b8884815181106105335761053361195c565b60200260200101516000015160020b036107cb576040518060c001604052808783815181106105645761056461195c565b60200260200101516000015160020b815260200189858151811061058a5761058a61195c565b6020026020010151602001518884815181106105a8576105a861195c565b6020026020010151602001516105be91906119d9565b6001600160801b03168152602001600081526020018783815181106105e5576105e561195c565b60200260200101516060015181526020018783815181106106085761060861195c565b602002602001015160800151815260200187838151811061062b5761062b61195c565b602002602001015160a0015181525086828151811061064c5761064c61195c565b60200260200101819052508783815181106106695761066961195c565b6020026020010151606001518682815181106106875761068761195c565b602002602001015160600151146106d35760405162461bcd60e51b815260206004820152600b60248201526a06d657267656d61746368360ac1b60448201526064015b60405180910390fd5b8783815181106106e5576106e561195c565b6020026020010151608001518682815181106107035761070361195c565b6020026020010151608001511461074a5760405162461bcd60e51b815260206004820152600b60248201526a6d657267656d617463683160a81b60448201526064016106ca565b87838151811061075c5761075c61195c565b602002602001015160a0015186828151811061077a5761077a61195c565b602002602001015160a00151146107c65760405162461bcd60e51b815260206004820152601060248201526f0dacae4cecadac2e8c6d0cee4deeee8d60831b60448201526064016106ca565b600191505b806107d5816119c0565b9150506104f7565b5080610834578682815181106107f5576107f561195c565b602002602001015185858461080a91906119ad565b8151811061081a5761081a61195c565b60200260200101819052508280610830906119c0565b9350505b508061083f816119c0565b9150506104ea565b5060008167ffffffffffffffff8111156108635761086361146a565b60405190808252806020026020018201604052801561089c57816020015b610889611428565b8152602001906001900390816108815790505b5090506000805b8551811015610932578581815181106108be576108be61195c565b6020026020010151602001516001600160801b0316600014610920578581815181106108ec576108ec61195c565b60200260200101518383815181106109065761090661195c565b6020026020010181905250818061091c906119c0565b9250505b8061092a816119c0565b9150506108a3565b50909450505050505b92915050565b60008161094e5782610961565b610961670de0b6b3a76400008085610d77565b9250600061097c84600160601b670de0b6b3a7640000610d77565b905061099e610999866001600160a01b031683600160601b610d77565b6111ec565b9150505b9392505050565b606060005b8351811015610a2e576109f08482815181106109cc576109cc61195c565b6020026020010151602001516001600160801b031684670de0b6b3a7640000610d77565b848281518110610a0257610a0261195c565b6020908102919091018101516001600160801b0390921691015280610a26816119c0565b9150506109ae565b509192915050565b60008082600081518110610a4c57610a4c61195c565b602090810291909101015151915081905060015b8351811015610b17578260020b848281518110610a7f57610a7f61195c565b60200260200101516000015160020b1215610ab957838181518110610aa657610aa661195c565b6020026020010151600001519250610b05565b8160020b848281518110610acf57610acf61195c565b60200260200101516000015160020b1315610b0557838181518110610af657610af661195c565b60200260200101516000015191505b80610b0f816119c0565b915050610a60565b50915091565b6000805b8451811015610c5d57848181518110610b3c57610b3c61195c565b6020026020010151602001516001600160801b031660000315610c4b578315610be457610bca610b778683815181106102d1576102d161195c565b610b8d858885815181106102945761029461195c565b610bbc888581518110610ba257610ba261195c565b6020026020010151602001516001600160801b031661123a565b610bc590611a00565b611178565b610bd390611a2f565b610bdd90836119ad565b9150610c4b565b610c35610bfc8683815181106102d1576102d161195c565b610c12858885815181106102945761029461195c565b610c27888581518110610ba257610ba261195c565b610c3090611a00565b6111bd565b610c3e90611a2f565b610c4890836119ad565b91505b80610c55816119c0565b915050610b21565b509392505050565b6000806000610c7387610a36565b91509150610c848686838588610c8f565b979650505050505050565b600085610ca4578260020b8560020b12610cb8565b610cae8285611988565b60020b8560020b12155b15610cc557506001610cfd565b85610ce257610cd48285611988565b60020b8560020b1215610cec565b8260020b8560020b125b15610cf957506002610cfd565b5060035b95945050505050565b600080610d138386611a61565b905060008560020b1315610d535783610d415782610d32826001611988565b610d3c9190611aa9565b610d4b565b610d4b8382611aa9565b9150506109a2565b83610d6257610d3c8382611aa9565b82610d6d8183611aa9565b610d4b9190611ac9565b6000808060001985870985870292508281108382030391505080600003610db05760008411610da557600080fd5b5082900490506109a2565b808411610de85760405162461bcd60e51b815260206004820152600660248201526536bab62234bb60d11b60448201526064016106ca565b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150509392505050565b60008060008360020b12610e6c578260020b610e74565b8260020b6000035b9050620d89e8811115610e9a576040516315e4079d60e11b815260040160405180910390fd5b600081600116600003610eb157600160801b610ec3565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff1690506002821615610ef7576ffff97272373d413259a46990580e213a0260801c5b6004821615610f16576ffff2e50f5f656932ef12357cf3c7fdcc0260801c5b6008821615610f35576fffe5caca7e10e4e61c3624eaa0941cd00260801c5b6010821615610f54576fffcb9843d60f6159c9db58835c9266440260801c5b6020821615610f73576fff973b41fa98c081472e6896dfb254c00260801c5b6040821615610f92576fff2ea16466c96a3843ec78b326b528610260801c5b6080821615610fb1576ffe5dee046a99a2a811c461f1969c30530260801c5b610100821615610fd1576ffcbe86c7900a88aedcffc83b479aa3a40260801c5b610200821615610ff1576ff987a7253ac413176f2b074cf7815e540260801c5b610400821615611011576ff3392b0822b70005940c7a398e4b70f30260801c5b610800821615611031576fe7159475a2c29b7443b29c7fa6e889d90260801c5b611000821615611051576fd097f3bdfd2022b8845ad8f792aa58250260801c5b612000821615611071576fa9f746462d870fdf8a65dc1f90e061e50260801c5b614000821615611091576f70d869a156d2a1b890bb3df62baf32f70260801c5b6180008216156110b1576f31be135f97d08fd981231505542fcfa60260801c5b620100008216156110d2576f09aa508b5b7a84e1c677de54f3e99bc90260801c5b620200008216156110f2576e5d6af8dedb81196699c329225ee6040260801c5b62040000821615611111576d2216e584f5fa1ea926041bedfe980260801c5b6208000082161561112e576b048a170391f7dc42444e8fa20260801c5b60008460020b131561114f57806000198161114b5761114b611a4b565b0490505b640100000000810615611163576001611166565b60005b60ff16602082901c0192505050919050565b60008082600f0b1261119e57611199611194858585600161127a565b61132f565b6111b5565b6111b1611194858585600003600061127a565b6000035b949350505050565b60008082600f0b126111d957611199611194858585600161137c565b6111b1611194858585600003600061137c565b806001600160a01b03811681146112355760405162461bcd60e51b815260206004820152600d60248201526c31b0b9ba34b7339032b93937b960991b60448201526064016106ca565b919050565b80600f81900b81146112355760405162461bcd60e51b81526020600482015260096024820152681cd859994818d85cdd60ba1b60448201526064016106ca565b6000836001600160a01b0316856001600160a01b0316111561129a579293925b6fffffffffffffffffffffffffffffffff60601b606084901b166001600160a01b0386860381169087166112cd57600080fd5b8361130357866001600160a01b03166112f08383896001600160a01b0316610d77565b816112fd576112fd611a4b565b04610c84565b610c8461131a8383896001600160a01b03166113e8565b886001600160a01b0316808204910615150190565b6000600160ff1b82106113785760405162461bcd60e51b8152602060048201526011602482015270191a9b1031b0b9ba34b7339032b93937b960791b60448201526064016106ca565b5090565b6000836001600160a01b0316856001600160a01b0316111561139c579293925b816113c9576113c4836001600160801b03168686036001600160a01b0316600160601b610d77565b610cfd565b610cfd836001600160801b03168686036001600160a01b0316600160601b5b60006113f5848484610d77565b90506000828061140757611407611a4b565b84860911156109a257600019811061141e57600080fd5b6001019392505050565b6040518060c00160405280600060020b815260200160006001600160801b03168152602001600081526020016000815260200160008152602001600081525090565b634e487b7160e01b600052604160045260246000fd5b60405160c0810167ffffffffffffffff811182821017156114a3576114a361146a565b60405290565b604051601f8201601f1916810167ffffffffffffffff811182821017156114d2576114d261146a565b604052919050565b8035600281900b811461123557600080fd5b600082601f8301126114fd57600080fd5b8135602067ffffffffffffffff8211156115195761151961146a565b611527818360051b016114a9565b82815260c0928302850182019282820191908785111561154657600080fd5b8387015b858110156115c85781818a0312156115625760008081fd5b61156a611480565b611573826114da565b8152858201356001600160801b038116811461158f5760008081fd5b8187015260408281013590820152606080830135908201526080808301359082015260a08083013590820152845292840192810161154a565b5090979650505050505050565b80356001600160a01b038116811461123557600080fd5b600080600080600060a0868803121561160457600080fd5b853567ffffffffffffffff81111561161b57600080fd5b611627888289016114ec565b9550506020860135935061163d604087016114da565b925061164b606087016114da565b9150611659608087016115d5565b90509295509295909350565b6000806040838503121561167857600080fd5b823567ffffffffffffffff8082111561169057600080fd5b61169c868387016114ec565b935060208501359150808211156116b257600080fd5b506116bf858286016114ec565b9150509250929050565b602080825282518282018190526000919060409081850190868401855b82811015611740578151805160020b8552868101516001600160801b0316878601528581015186860152606080820151908601526080808201519086015260a0908101519085015260c090930192908501906001016116e6565b5091979650505050505050565b8035801515811461123557600080fd5b60008060006060848603121561177257600080fd5b61177b846115d5565b9250602084013591506117906040850161174d565b90509250925092565b600080604083850312156117ac57600080fd5b823567ffffffffffffffff8111156117c357600080fd5b6117cf858286016114ec565b95602094909401359450505050565b6000602082840312156117f057600080fd5b813567ffffffffffffffff81111561180757600080fd5b6111b5848285016114ec565b60008060006060848603121561182857600080fd5b833567ffffffffffffffff81111561183f57600080fd5b61184b868287016114ec565b93505061185a6020850161174d565b9150611790604085016114da565b6000806000806080858703121561187e57600080fd5b843567ffffffffffffffff81111561189557600080fd5b6118a1878288016114ec565b9450506118b06020860161174d565b92506118be604086016114da565b91506118cc606086016114da565b905092959194509250565b600080600080600060a086880312156118ef57600080fd5b6118f88661174d565b9450611906602087016114da565b9350611914604087016114da565b9250611922606087016114da565b9150611659608087016114da565b60008060006060848603121561194557600080fd5b61194e846114da565b925061185a6020850161174d565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600281810b9083900b01627fffff8113627fffff198212171561093b5761093b611972565b8082018082111561093b5761093b611972565b6000600182016119d2576119d2611972565b5060010190565b6001600160801b038181168382160190808211156119f9576119f9611972565b5092915050565b600081600f0b6f7fffffffffffffffffffffffffffffff198103611a2657611a26611972565b60000392915050565b6000600160ff1b8201611a4457611a44611972565b5060000390565b634e487b7160e01b600052601260045260246000fd5b60008160020b8360020b80611a8657634e487b7160e01b600052601260045260246000fd5b627fffff19821460001982141615611aa057611aa0611972565b90059392505050565b60008260020b8260020b028060020b91508082146119f9576119f9611972565b600282810b9082900b03627fffff198112627fffff8213171561093b5761093b61197256fea2646970667358221220071dccf7fdd545e95a69a8f8f5bd2a569a88511c06d8e49275eecf8709d8d07464736f6c63430008120033";

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
