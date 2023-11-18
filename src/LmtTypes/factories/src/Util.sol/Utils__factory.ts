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
  "0x61199761003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106100875760003560e01c806334dc54581161006557806334dc54581461010457806337a614211461011757806341533fe714610144578063b45082e21461016557600080fd5b8063055d15481461008c5780630b7cb7c1146100b9578063207b0576146100d9575b600080fd5b61009f61009a366004611527565b61018b565b604080519283526020830191909152015b60405180910390f35b6100cc6100c73660046115a0565b6103dc565b6040516100b09190611604565b6100ec6100e7366004611698565b610905565b6040516001600160a01b0390911681526020016100b0565b6100cc6101123660046116d4565b61096d565b61012a610125366004611719565b6109fa565b60408051600293840b81529190920b6020820152016100b0565b61015761015236600461174e565b610ae1565b6040519081526020016100b0565b6101786101733660046117a3565b610c29565b60405160029190910b81526020016100b0565b60008060005b87518110156103d15760006101d58983815181106101b1576101b16117cf565b6020026020010151602001516001600160801b031689670de0b6b3a7640000610c9a565b90508560020b8983815181106101ed576101ed6117cf565b60200260200101516000015160020b1315801561023757508560020b878a848151811061021c5761021c6117cf565b60200260200101516000015161023291906117fb565b60020b135b156102ce576000610279866102738a8d8781518110610258576102586117cf565b60200260200101516000015161026e91906117fb565b610d78565b8461109b565b905060006102ad6102a68c8681518110610295576102956117cf565b602002602001015160000151610d78565b88856110e0565b90506102b98287611820565b95506102c58186611820565b945050506103be565b6102da86600189610c29565b60020b8983815181106102ef576102ef6117cf565b60200260200101516000015160020b136103485761033761031b8a8481518110610295576102956117cf565b610331898c8681518110610258576102586117cf565b836110e0565b6103419084611820565b92506103be565b61035486600089610c29565b60020b898381518110610369576103696117cf565b60200260200101516000015160020b126103be576103b16103958a8481518110610295576102956117cf565b6103ab898c8681518110610258576102586117cf565b8361109b565b6103bb9085611820565b93505b50806103c981611833565b915050610191565b509550959350505050565b60606000825184516103ee9190611820565b67ffffffffffffffff811115610406576104066113a5565b60405190808252806020026020018201604052801561043f57816020015b61042c611363565b8152602001906001900390816104245790505b5084519091506000805b86518110156104aa57868181518110610464576104646117cf565b602002602001015184828151811061047e5761047e6117cf565b6020026020010181905250818061049490611833565b92505080806104a290611833565b915050610449565b5060005b855181101561080b576000805b88518110156107a1578581815181106104d6576104d66117cf565b60200260200101516000015160020b8884815181106104f7576104f76117cf565b60200260200101516000015160020b0361078f576040518060c00160405280878381518110610528576105286117cf565b60200260200101516000015160020b815260200189858151811061054e5761054e6117cf565b60200260200101516020015188848151811061056c5761056c6117cf565b602002602001015160200151610582919061184c565b6001600160801b03168152602001600081526020018783815181106105a9576105a96117cf565b60200260200101516060015181526020018783815181106105cc576105cc6117cf565b60200260200101516080015181526020018783815181106105ef576105ef6117cf565b602002602001015160a00151815250868281518110610610576106106117cf565b602002602001018190525087838151811061062d5761062d6117cf565b60200260200101516060015186828151811061064b5761064b6117cf565b602002602001015160600151146106975760405162461bcd60e51b815260206004820152600b60248201526a06d657267656d61746368360ac1b60448201526064015b60405180910390fd5b8783815181106106a9576106a96117cf565b6020026020010151608001518682815181106106c7576106c76117cf565b6020026020010151608001511461070e5760405162461bcd60e51b815260206004820152600b60248201526a6d657267656d617463683160a81b604482015260640161068e565b878381518110610720576107206117cf565b602002602001015160a0015186828151811061073e5761073e6117cf565b602002602001015160a001511461078a5760405162461bcd60e51b815260206004820152601060248201526f0dacae4cecadac2e8c6d0cee4deeee8d60831b604482015260640161068e565b600191505b8061079981611833565b9150506104bb565b50806107f8578682815181106107b9576107b96117cf565b60200260200101518585846107ce9190611820565b815181106107de576107de6117cf565b602002602001018190525082806107f490611833565b9350505b508061080381611833565b9150506104ae565b5060008167ffffffffffffffff811115610827576108276113a5565b60405190808252806020026020018201604052801561086057816020015b61084d611363565b8152602001906001900390816108455790505b5090506000805b85518110156108f657858181518110610882576108826117cf565b6020026020010151602001516001600160801b03166000146108e4578581815181106108b0576108b06117cf565b60200260200101518383815181106108ca576108ca6117cf565b602002602001018190525081806108e090611833565b9250505b806108ee81611833565b915050610867565b50909450505050505b92915050565b6000816109125782610925565b610925670de0b6b3a76400008085610c9a565b9250600061094084600160601b670de0b6b3a7640000610c9a565b905061096261095d866001600160a01b031683600160601b610c9a565b61110f565b9150505b9392505050565b606060005b83518110156109f2576109b4848281518110610990576109906117cf565b6020026020010151602001516001600160801b031684670de0b6b3a7640000610c9a565b8482815181106109c6576109c66117cf565b6020908102919091018101516001600160801b03909216910152806109ea81611833565b915050610972565b509192915050565b60008082600081518110610a1057610a106117cf565b602090810291909101015151915081905060015b8351811015610adb578260020b848281518110610a4357610a436117cf565b60200260200101516000015160020b1215610a7d57838181518110610a6a57610a6a6117cf565b6020026020010151600001519250610ac9565b8160020b848281518110610a9357610a936117cf565b60200260200101516000015160020b1315610ac957838181518110610aba57610aba6117cf565b60200260200101516000015191505b80610ad381611833565b915050610a24565b50915091565b6000805b8451811015610c2157848181518110610b0057610b006117cf565b6020026020010151602001516001600160801b031660000315610c0f578315610ba857610b8e610b3b868381518110610295576102956117cf565b610b5185888581518110610258576102586117cf565b610b80888581518110610b6657610b666117cf565b6020026020010151602001516001600160801b031661115d565b610b8990611873565b61109b565b610b97906118a2565b610ba19083611820565b9150610c0f565b610bf9610bc0868381518110610295576102956117cf565b610bd685888581518110610258576102586117cf565b610beb888581518110610b6657610b666117cf565b610bf490611873565b6110e0565b610c02906118a2565b610c0c9083611820565b91505b80610c1981611833565b915050610ae5565b509392505050565b600080610c3683866118d4565b905060008560020b1315610c765783610c645782610c558260016117fb565b610c5f919061191c565b610c6e565b610c6e838261191c565b915050610966565b83610c8557610c5f838261191c565b82610c90818361191c565b610c6e919061193c565b6000808060001985870985870292508281108382030391505080600003610cd35760008411610cc857600080fd5b508290049050610966565b808411610d0b5760405162461bcd60e51b815260206004820152600660248201526536bab62234bb60d11b604482015260640161068e565b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150509392505050565b60008060008360020b12610d8f578260020b610d97565b8260020b6000035b9050620d89e8811115610dbd576040516315e4079d60e11b815260040160405180910390fd5b600081600116600003610dd457600160801b610de6565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff1690506002821615610e1a576ffff97272373d413259a46990580e213a0260801c5b6004821615610e39576ffff2e50f5f656932ef12357cf3c7fdcc0260801c5b6008821615610e58576fffe5caca7e10e4e61c3624eaa0941cd00260801c5b6010821615610e77576fffcb9843d60f6159c9db58835c9266440260801c5b6020821615610e96576fff973b41fa98c081472e6896dfb254c00260801c5b6040821615610eb5576fff2ea16466c96a3843ec78b326b528610260801c5b6080821615610ed4576ffe5dee046a99a2a811c461f1969c30530260801c5b610100821615610ef4576ffcbe86c7900a88aedcffc83b479aa3a40260801c5b610200821615610f14576ff987a7253ac413176f2b074cf7815e540260801c5b610400821615610f34576ff3392b0822b70005940c7a398e4b70f30260801c5b610800821615610f54576fe7159475a2c29b7443b29c7fa6e889d90260801c5b611000821615610f74576fd097f3bdfd2022b8845ad8f792aa58250260801c5b612000821615610f94576fa9f746462d870fdf8a65dc1f90e061e50260801c5b614000821615610fb4576f70d869a156d2a1b890bb3df62baf32f70260801c5b618000821615610fd4576f31be135f97d08fd981231505542fcfa60260801c5b62010000821615610ff5576f09aa508b5b7a84e1c677de54f3e99bc90260801c5b62020000821615611015576e5d6af8dedb81196699c329225ee6040260801c5b62040000821615611034576d2216e584f5fa1ea926041bedfe980260801c5b62080000821615611051576b048a170391f7dc42444e8fa20260801c5b60008460020b131561107257806000198161106e5761106e6118be565b0490505b640100000000810615611086576001611089565b60005b60ff16602082901c0192505050919050565b60008082600f0b126110c1576110bc6110b7858585600161119d565b61125d565b6110d8565b6110d46110b7858585600003600061119d565b6000035b949350505050565b60008082600f0b126110fc576110bc6110b785858560016112aa565b6110d46110b785858560000360006112aa565b806001600160a01b03811681146111585760405162461bcd60e51b815260206004820152600d60248201526c31b0b9ba34b7339032b93937b960991b604482015260640161068e565b919050565b80600f81900b81146111585760405162461bcd60e51b81526020600482015260096024820152681cd859994818d85cdd60ba1b604482015260640161068e565b6000836001600160a01b0316856001600160a01b031611156111bd579293925b6fffffffffffffffffffffffffffffffff60601b606084901b166001600160a01b0386860381169087166111f057600080fd5b8361122657866001600160a01b03166112138383896001600160a01b0316610c9a565b81611220576112206118be565b04611252565b61125261123d8383896001600160a01b0316611323565b886001600160a01b0316808204910615150190565b979650505050505050565b6000600160ff1b82106112a65760405162461bcd60e51b8152602060048201526011602482015270191a9b1031b0b9ba34b7339032b93937b960791b604482015260640161068e565b5090565b6000836001600160a01b0316856001600160a01b031611156112ca579293925b816112f7576112f2836001600160801b03168686036001600160a01b0316600160601b610c9a565b61131a565b61131a836001600160801b03168686036001600160a01b0316600160601b611323565b95945050505050565b6000611330848484610c9a565b905060008280611342576113426118be565b848609111561096657600019811061135957600080fd5b6001019392505050565b6040518060c00160405280600060020b815260200160006001600160801b03168152602001600081526020016000815260200160008152602001600081525090565b634e487b7160e01b600052604160045260246000fd5b60405160c0810167ffffffffffffffff811182821017156113de576113de6113a5565b60405290565b604051601f8201601f1916810167ffffffffffffffff8111828210171561140d5761140d6113a5565b604052919050565b8035600281900b811461115857600080fd5b600082601f83011261143857600080fd5b8135602067ffffffffffffffff821115611454576114546113a5565b611462818360051b016113e4565b82815260c0928302850182019282820191908785111561148157600080fd5b8387015b858110156115035781818a03121561149d5760008081fd5b6114a56113bb565b6114ae82611415565b8152858201356001600160801b03811681146114ca5760008081fd5b8187015260408281013590820152606080830135908201526080808301359082015260a080830135908201528452928401928101611485565b5090979650505050505050565b80356001600160a01b038116811461115857600080fd5b600080600080600060a0868803121561153f57600080fd5b853567ffffffffffffffff81111561155657600080fd5b61156288828901611427565b9550506020860135935061157860408701611415565b925061158660608701611415565b915061159460808701611510565b90509295509295909350565b600080604083850312156115b357600080fd5b823567ffffffffffffffff808211156115cb57600080fd5b6115d786838701611427565b935060208501359150808211156115ed57600080fd5b506115fa85828601611427565b9150509250929050565b602080825282518282018190526000919060409081850190868401855b8281101561167b578151805160020b8552868101516001600160801b0316878601528581015186860152606080820151908601526080808201519086015260a0908101519085015260c09093019290850190600101611621565b5091979650505050505050565b8035801515811461115857600080fd5b6000806000606084860312156116ad57600080fd5b6116b684611510565b9250602084013591506116cb60408501611688565b90509250925092565b600080604083850312156116e757600080fd5b823567ffffffffffffffff8111156116fe57600080fd5b61170a85828601611427565b95602094909401359450505050565b60006020828403121561172b57600080fd5b813567ffffffffffffffff81111561174257600080fd5b6110d884828501611427565b60008060006060848603121561176357600080fd5b833567ffffffffffffffff81111561177a57600080fd5b61178686828701611427565b93505061179560208501611688565b91506116cb60408501611415565b6000806000606084860312156117b857600080fd5b6117c184611415565b925061179560208501611688565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600281810b9083900b01627fffff8113627fffff19821217156108ff576108ff6117e5565b808201808211156108ff576108ff6117e5565b600060018201611845576118456117e5565b5060010190565b6001600160801b0381811683821601908082111561186c5761186c6117e5565b5092915050565b600081600f0b6f7fffffffffffffffffffffffffffffff198103611899576118996117e5565b60000392915050565b6000600160ff1b82016118b7576118b76117e5565b5060000390565b634e487b7160e01b600052601260045260246000fd5b60008160020b8360020b806118f957634e487b7160e01b600052601260045260246000fd5b627fffff19821460001982141615611913576119136117e5565b90059392505050565b60008260020b8260020b028060020b915080821461186c5761186c6117e5565b600282810b9082900b03627fffff198112627fffff821317156108ff576108ff6117e556fea2646970667358221220b78a81a5fc5c72cdc8b20bd9f374be0b456fac024a441bf243c1bed8a8a42ee264736f6c63430008120033";

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
