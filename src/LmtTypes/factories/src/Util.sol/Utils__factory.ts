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
  "0x611b7961003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe730000000000000000000000000000000000000000301460806040526004361061009d5760003560e01c806337a614211161007057806337a614211461012d57806341533fe71461015a5780636e96fa7a1461017b578063a36b91681461018e578063b45082e2146101a157600080fd5b8063055d1548146100a25780630b7cb7c1146100cf578063207b0576146100ef57806334dc54581461011a575b600080fd5b6100b56100b0366004611641565b6101c7565b604080519283526020830191909152015b60405180910390f35b6100e26100dd3660046116ba565b610420565b6040516100c6919061171e565b6101026100fd3660046117b2565b6108b8565b6040516001600160a01b0390911681526020016100c6565b6100e26101283660046117ee565b610920565b61014061013b366004611833565b6109b0565b60408051600293840b81529190920b6020820152016100c6565b61016d610168366004611868565b610a97565b6040519081526020016100c6565b61016d6101893660046118bd565b610c2f565b61016d61019c36600461192c565b610c59565b6101b46101af366004611985565b610cd0565b60405160029190910b81526020016100c6565b60008060005b87518110156104155760006102196102148a84815181106101f0576101f06119b1565b6020026020010151602001516001600160801b03168a670de0b6b3a7640000610d41565b610e1f565b90508560020b898381518110610231576102316119b1565b60200260200101516000015160020b1315801561027b57508560020b878a8481518110610260576102606119b1565b60200260200101516000015161027691906119dd565b60020b135b156103125760006102bd866102b78a8d878151811061029c5761029c6119b1565b6020026020010151600001516102b291906119dd565b610e71565b84611194565b905060006102f16102ea8c86815181106102d9576102d96119b1565b602002602001015160000151610e71565b88856111d9565b90506102fd8287611a02565b95506103098186611a02565b94505050610402565b61031e86600189610cd0565b60020b898381518110610333576103336119b1565b60200260200101516000015160020b1361038c5761037b61035f8a84815181106102d9576102d96119b1565b610375898c868151811061029c5761029c6119b1565b836111d9565b6103859084611a02565b9250610402565b61039886600089610cd0565b60020b8983815181106103ad576103ad6119b1565b60200260200101516000015160020b12610402576103f56103d98a84815181106102d9576102d96119b1565b6103ef898c868151811061029c5761029c6119b1565b83611194565b6103ff9085611a02565b93505b508061040d81611a15565b9150506101cd565b509550959350505050565b60606000825184516104329190611a02565b67ffffffffffffffff81111561044a5761044a6114bf565b60405190808252806020026020018201604052801561048357816020015b61047061147d565b8152602001906001900390816104685790505b5084519091506000805b86518110156104ee578681815181106104a8576104a86119b1565b60200260200101518482815181106104c2576104c26119b1565b602002602001018190525081806104d890611a15565b92505080806104e690611a15565b91505061048d565b5060005b85518110156107be576000805b88518110156107545785818151811061051a5761051a6119b1565b60200260200101516000015160020b88848151811061053b5761053b6119b1565b60200260200101516000015160020b0361074257878381518110610561576105616119b1565b60200260200101516020015186828151811061057f5761057f6119b1565b60200260200101516020018181516105979190611a2e565b6001600160801b031690525085516000908790839081106105ba576105ba6119b1565b602002602001015160400181815250508783815181106105dc576105dc6119b1565b6020026020010151606001518682815181106105fa576105fa6119b1565b602002602001015160600151146106465760405162461bcd60e51b815260206004820152600b60248201526a06d657267656d61746368360ac1b60448201526064015b60405180910390fd5b878381518110610658576106586119b1565b602002602001015160800151868281518110610676576106766119b1565b602002602001015160800151146106bd5760405162461bcd60e51b815260206004820152600b60248201526a6d657267656d617463683160a81b604482015260640161063d565b8783815181106106cf576106cf6119b1565b602002602001015160a001518682815181106106ed576106ed6119b1565b602002602001015160a00151146107395760405162461bcd60e51b815260206004820152601060248201526f0dacae4cecadac2e8c6d0cee4deeee8d60831b604482015260640161063d565b60019150610754565b8061074c81611a15565b9150506104ff565b50806107ab5786828151811061076c5761076c6119b1565b60200260200101518585846107819190611a02565b81518110610791576107916119b1565b602002602001018190525082806107a790611a15565b9350505b50806107b681611a15565b9150506104f2565b5060008167ffffffffffffffff8111156107da576107da6114bf565b60405190808252806020026020018201604052801561081357816020015b61080061147d565b8152602001906001900390816107f85790505b5090506000805b85518110156108a957858181518110610835576108356119b1565b6020026020010151602001516001600160801b031660001461089757858181518110610863576108636119b1565b602002602001015183838151811061087d5761087d6119b1565b6020026020010181905250818061089390611a15565b9250505b806108a181611a15565b91505061081a565b50909450505050505b92915050565b6000816108c557826108d8565b6108d8670de0b6b3a76400008085610d41565b925060006108f384600160601b670de0b6b3a7640000610d41565b9050610915610910866001600160a01b031683600160601b610d41565b611208565b9150505b9392505050565b606060005b83518110156109a85761096a610214858381518110610946576109466119b1565b6020026020010151602001516001600160801b031685670de0b6b3a7640000610d41565b84828151811061097c5761097c6119b1565b6020908102919091018101516001600160801b03909216910152806109a081611a15565b915050610925565b509192915050565b600080826000815181106109c6576109c66119b1565b602090810291909101015151915081905060015b8351811015610a91578260020b8482815181106109f9576109f96119b1565b60200260200101516000015160020b1215610a3357838181518110610a2057610a206119b1565b6020026020010151600001519250610a7f565b8160020b848281518110610a4957610a496119b1565b60200260200101516000015160020b1315610a7f57838181518110610a7057610a706119b1565b60200260200101516000015191505b80610a8981611a15565b9150506109da565b50915091565b60008215610b735760005b8451811015610b6d57848181518110610abd57610abd6119b1565b6020026020010151602001516001600160801b031660000315610b5b57610b45610af28683815181106102d9576102d96119b1565b610b088588858151811061029c5761029c6119b1565b610b37888581518110610b1d57610b1d6119b1565b6020026020010151602001516001600160801b0316611251565b610b4090611a55565b611194565b610b4e90611a84565b610b589083611a02565b91505b80610b6581611a15565b915050610aa2565b50610919565b60005b8451811015610c2757848181518110610b9157610b916119b1565b6020026020010151602001516001600160801b031660000315610c1557610bff610bc68683815181106102d9576102d96119b1565b610bdc8588858151811061029c5761029c6119b1565b610bf1888581518110610b1d57610b1d6119b1565b610bfa90611a55565b6111d9565b610c0890611a84565b610c129083611a02565b91505b80610c1f81611a15565b915050610b76565b509392505050565b6000806000610c3d876109b0565b91509150610c4e8686838588610c59565b979650505050505050565b600085610c6e578260020b8560020b12610c82565b610c7882856119dd565b60020b8560020b12155b15610c8f57506001610cc7565b85610cac57610c9e82856119dd565b60020b8560020b1215610cb6565b8260020b8560020b125b15610cc357506002610cc7565b5060035b95945050505050565b600080610cdd8386611ab6565b905060008560020b1315610d1d5783610d0b5782610cfc8260016119dd565b610d069190611afe565b610d15565b610d158382611afe565b915050610919565b83610d2c57610d068382611afe565b82610d378183611afe565b610d159190611b1e565b6000808060001985870985870292508281108382030391505080600003610d7a5760008411610d6f57600080fd5b508290049050610919565b808411610db25760405162461bcd60e51b815260206004820152600660248201526536bab62234bb60d11b604482015260640161063d565b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150509392505050565b806001600160801b0381168114610e6c5760405162461bcd60e51b8152602060048201526011602482015270189b181031b0b9ba34b7339032b93937b960791b604482015260640161063d565b919050565b60008060008360020b12610e88578260020b610e90565b8260020b6000035b9050620d89e8811115610eb6576040516315e4079d60e11b815260040160405180910390fd5b600081600116600003610ecd57600160801b610edf565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff1690506002821615610f13576ffff97272373d413259a46990580e213a0260801c5b6004821615610f32576ffff2e50f5f656932ef12357cf3c7fdcc0260801c5b6008821615610f51576fffe5caca7e10e4e61c3624eaa0941cd00260801c5b6010821615610f70576fffcb9843d60f6159c9db58835c9266440260801c5b6020821615610f8f576fff973b41fa98c081472e6896dfb254c00260801c5b6040821615610fae576fff2ea16466c96a3843ec78b326b528610260801c5b6080821615610fcd576ffe5dee046a99a2a811c461f1969c30530260801c5b610100821615610fed576ffcbe86c7900a88aedcffc83b479aa3a40260801c5b61020082161561100d576ff987a7253ac413176f2b074cf7815e540260801c5b61040082161561102d576ff3392b0822b70005940c7a398e4b70f30260801c5b61080082161561104d576fe7159475a2c29b7443b29c7fa6e889d90260801c5b61100082161561106d576fd097f3bdfd2022b8845ad8f792aa58250260801c5b61200082161561108d576fa9f746462d870fdf8a65dc1f90e061e50260801c5b6140008216156110ad576f70d869a156d2a1b890bb3df62baf32f70260801c5b6180008216156110cd576f31be135f97d08fd981231505542fcfa60260801c5b620100008216156110ee576f09aa508b5b7a84e1c677de54f3e99bc90260801c5b6202000082161561110e576e5d6af8dedb81196699c329225ee6040260801c5b6204000082161561112d576d2216e584f5fa1ea926041bedfe980260801c5b6208000082161561114a576b048a170391f7dc42444e8fa20260801c5b60008460020b131561116b57806000198161116757611167611aa0565b0490505b64010000000081061561117f576001611182565b60005b60ff16602082901c0192505050919050565b60008082600f0b126111ba576111b56111b08585856001611291565b611346565b6111d1565b6111cd6111b08585856000036000611291565b6000035b949350505050565b60008082600f0b126111f5576111b56111b08585856001611393565b6111cd6111b08585856000036000611393565b806001600160a01b0381168114610e6c5760405162461bcd60e51b815260206004820152600d60248201526c31b0b9ba34b7339032b93937b960991b604482015260640161063d565b80600f81900b8114610e6c5760405162461bcd60e51b81526020600482015260096024820152681cd859994818d85cdd60ba1b604482015260640161063d565b6000836001600160a01b0316856001600160a01b031611156112b1579293925b6fffffffffffffffffffffffffffffffff60601b606084901b166001600160a01b0386860381169087166112e457600080fd5b8361131a57866001600160a01b03166113078383896001600160a01b0316611403565b8161131457611314611aa0565b04610c4e565b610c4e6113318383896001600160a01b031661143d565b886001600160a01b0316808204910615150190565b6000600160ff1b821061138f5760405162461bcd60e51b8152602060048201526011602482015270191a9b1031b0b9ba34b7339032b93937b960791b604482015260640161063d565b5090565b6000836001600160a01b0316856001600160a01b031611156113b3579293925b816113e0576113db836001600160801b03168686036001600160a01b0316600160601b611403565b610cc7565b610cc7836001600160801b03168686036001600160a01b0316600160601b61143d565b60008080600019858709858702925082811083820303915050806000036114315760008411610d6f57600080fd5b808411610db257600080fd5b600061144a848484611403565b90506000828061145c5761145c611aa0565b848609111561091957600019811061147357600080fd5b6001019392505050565b6040518060c00160405280600060020b815260200160006001600160801b03168152602001600081526020016000815260200160008152602001600081525090565b634e487b7160e01b600052604160045260246000fd5b60405160c0810167ffffffffffffffff811182821017156114f8576114f86114bf565b60405290565b604051601f8201601f1916810167ffffffffffffffff81118282101715611527576115276114bf565b604052919050565b8035600281900b8114610e6c57600080fd5b600082601f83011261155257600080fd5b8135602067ffffffffffffffff82111561156e5761156e6114bf565b61157c818360051b016114fe565b82815260c0928302850182019282820191908785111561159b57600080fd5b8387015b8581101561161d5781818a0312156115b75760008081fd5b6115bf6114d5565b6115c88261152f565b8152858201356001600160801b03811681146115e45760008081fd5b8187015260408281013590820152606080830135908201526080808301359082015260a08083013590820152845292840192810161159f565b5090979650505050505050565b80356001600160a01b0381168114610e6c57600080fd5b600080600080600060a0868803121561165957600080fd5b853567ffffffffffffffff81111561167057600080fd5b61167c88828901611541565b955050602086013593506116926040870161152f565b92506116a06060870161152f565b91506116ae6080870161162a565b90509295509295909350565b600080604083850312156116cd57600080fd5b823567ffffffffffffffff808211156116e557600080fd5b6116f186838701611541565b9350602085013591508082111561170757600080fd5b5061171485828601611541565b9150509250929050565b602080825282518282018190526000919060409081850190868401855b82811015611795578151805160020b8552868101516001600160801b0316878601528581015186860152606080820151908601526080808201519086015260a0908101519085015260c0909301929085019060010161173b565b5091979650505050505050565b80358015158114610e6c57600080fd5b6000806000606084860312156117c757600080fd5b6117d08461162a565b9250602084013591506117e5604085016117a2565b90509250925092565b6000806040838503121561180157600080fd5b823567ffffffffffffffff81111561181857600080fd5b61182485828601611541565b95602094909401359450505050565b60006020828403121561184557600080fd5b813567ffffffffffffffff81111561185c57600080fd5b6111d184828501611541565b60008060006060848603121561187d57600080fd5b833567ffffffffffffffff81111561189457600080fd5b6118a086828701611541565b9350506118af602085016117a2565b91506117e56040850161152f565b600080600080608085870312156118d357600080fd5b843567ffffffffffffffff8111156118ea57600080fd5b6118f687828801611541565b945050611905602086016117a2565b92506119136040860161152f565b91506119216060860161152f565b905092959194509250565b600080600080600060a0868803121561194457600080fd5b61194d866117a2565b945061195b6020870161152f565b93506119696040870161152f565b92506119776060870161152f565b91506116ae6080870161152f565b60008060006060848603121561199a57600080fd5b6119a38461152f565b92506118af602085016117a2565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600281810b9083900b01627fffff8113627fffff19821217156108b2576108b26119c7565b808201808211156108b2576108b26119c7565b600060018201611a2757611a276119c7565b5060010190565b6001600160801b03818116838216019080821115611a4e57611a4e6119c7565b5092915050565b600081600f0b6f7fffffffffffffffffffffffffffffff198103611a7b57611a7b6119c7565b60000392915050565b6000600160ff1b8201611a9957611a996119c7565b5060000390565b634e487b7160e01b600052601260045260246000fd5b60008160020b8360020b80611adb57634e487b7160e01b600052601260045260246000fd5b627fffff19821460001982141615611af557611af56119c7565b90059392505050565b60008260020b8260020b028060020b9150808214611a4e57611a4e6119c7565b600282810b9082900b03627fffff198112627fffff821317156108b2576108b26119c756fea264697066735822122097404e6ec019d77a535e29ab7f0253f09adcad7e519477e5bbd923efc8439bce64736f6c63430008120033";

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
