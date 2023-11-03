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
  "0x61262861003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe730000000000000000000000000000000000000000301460806040526004361061009d5760003560e01c806337a614211161007057806337a614211461012d57806341533fe71461015a57806394cdfca51461017b5780639887b5891461018e578063b45082e2146101a157600080fd5b8063055d1548146100a2578063207b0576146100cf57806330940b88146100fa57806334dc54581461011a575b600080fd5b6100b56100b0366004611ec0565b6101c7565b604080519283526020830191909152015b60405180910390f35b6100e26100dd366004611f4f565b610507565b6040516001600160a01b0390911681526020016100c6565b61010d610108366004611f91565b61056f565b6040516100c69190611ff5565b61010d610128366004612079565b610bfe565b61014061013b3660046120be565b610c8b565b60408051600293840b81529190920b6020820152016100c6565b61016d6101683660046120f3565b610d72565b6040519081526020016100c6565b61016d61018936600461214c565b610eba565b6100b561019c3660046121b6565b610ffc565b6101b46101af3660046121e6565b61128b565b60405160029190910b81526020016100c6565b60008060005b87518110156104fc5760006102118983815181106101ed576101ed612216565b6020026020010151602001516001600160801b031689670de0b6b3a76400006112fc565b90506102516040518060400160405280602081526020017f2d207574696c732067657474696e6720616d6f756e74732072657175697265648152506113df565b61027a89838151811061026657610266612216565b60200260200101516000015160020b611425565b61028c816001600160801b031661146a565b6102a361029b8760018a61128b565b60020b611425565b8560020b8983815181106102b9576102b9612216565b60200260200101516000015160020b1315801561030357508560020b878a84815181106102e8576102e8612216565b6020026020010151600001516102fe9190612242565b60020b135b156103d65760006103458661033f8a8d878151811061032457610324612216565b60200260200101516000015161033a9190612242565b6114af565b846117d2565b905060006103796103728c868151811061036157610361612216565b6020026020010151600001516114af565b8885611817565b90506103858287612267565b95506103918186612267565b94506103c36040518060400160405280600d81526020016c2d2d696e6265747765656e2d2d60981b8152508383611846565b6103cf8860020b611425565b50506104e9565b6103e28660018961128b565b60020b8983815181106103f7576103f7612216565b60200260200101516000015160020b136104735761043f6104238a848151811061036157610361612216565b610439898c868151811061032457610324612216565b83611817565b6104499084612267565b925061046e604051806040016040528060028152602001613f3f60f01b8152506113df565b6104e9565b61047f8660008961128b565b60020b89838151811061049457610494612216565b60200260200101516000015160020b126104e9576104dc6104c08a848151811061036157610361612216565b6104d6898c868151811061032457610324612216565b836117d2565b6104e69085612267565b93505b50806104f48161227a565b9150506101cd565b509550959350505050565b6000816105145782610527565b610527670de0b6b3a764000080856112fc565b9250600061054284600160601b670de0b6b3a76400006112fc565b905061056461055f866001600160a01b031683600160601b6112fc565b611892565b9150505b9392505050565b815181516060919060006105838284612267565b905060008167ffffffffffffffff8111156105a0576105a0611d39565b6040519080825280602002602001820160405280156105d957816020015b6105c6611cf7565b8152602001906001900390816105be5790505b50905060008060005b86831080156105f057508582105b156107dd57600061063b8b858151811061060c5761060c612216565b6020026020010151600001518b858151811061062a5761062a612216565b6020026020010151600001516118e0565b121561068b5789838151811061065357610653612216565b602002602001015184828151811061066d5761066d612216565b602002602001018190525082806106839061227a565b9350506107cb565b60006106a28b858151811061060c5761060c612216565b13156106f2578882815181106106ba576106ba612216565b60200260200101518482815181106106d4576106d4612216565b602002602001018190525081806106ea9061227a565b9250506107cb565b6040518060c001604052808b858151811061070f5761070f612216565b60200260200101516000015160020b81526020018a848151811061073557610735612216565b6020026020010151602001518c868151811061075357610753612216565b6020026020010151602001516107699190612293565b6001600160801b0316815260200160008152602001600081526020016000815260200160008152508482815181106107a3576107a3612216565b602002602001018190525082806107b99061227a565b93505081806107c79061227a565b9250505b806107d58161227a565b9150506105e2565b8683101561083d578983815181106107f7576107f7612216565b602002602001015184828151811061081157610811612216565b602002602001018190525082806108279061227a565b93505080806108359061227a565b9150506107dd565b8582101561089d5788828151811061085757610857612216565b602002602001015184828151811061087157610871612216565b602002602001018190525081806108879061227a565b92505080806108959061227a565b91505061083d565b60008093505b85841015610a235760006108b8856001612267565b93505b868410156109c5578584815181106108d5576108d5612216565b60200260200101516000015160020b8686815181106108f6576108f6612216565b60200260200101516000015160020b036109b3576001905085848151811061092057610920612216565b60200260200101516020015186868151811061093e5761093e612216565b60200260200101516020018181516109569190612293565b6001600160801b0316905250855186908690811061097657610976612216565b60200260200101516020015186858151811061099457610994612216565b6020908102919091018101516001600160801b039092169101526109c5565b836109bd8161227a565b9450506108bb565b80610a10578585815181106109dc576109dc612216565b60200260200101518683815181106109f6576109f6612216565b60200260200101819052508180610a0c9061227a565b9250505b5083610a1b8161227a565b9450506108a3565b808552610a3c856000610a376001856122ba565b611929565b60008167ffffffffffffffff811115610a5757610a57611d39565b604051908082528060200260200182016040528015610a9057816020015b610a7d611cf7565b815260200190600190039081610a755790505b5090506000935060005b8651811015610b5557868181518110610ab557610ab5612216565b60200260200101516000015160020b6000148015610af95750868181518110610ae057610ae0612216565b6020026020010151602001516001600160801b03166000145b610b4357868181518110610b0f57610b0f612216565b6020026020010151828681518110610b2957610b29612216565b60200260200101819052508480610b3f9061227a565b9550505b80610b4d8161227a565b915050610a9a565b508560018751610b6591906122ba565b81518110610b7557610b75612216565b60200260200101516000015160020b6000148015610bc657508560018751610b9d91906122ba565b81518110610bad57610bad612216565b6020026020010151602001516001600160801b03166000145b15610bdc5781610bd5816122cd565b9250508181525b610bed816000610a376001866122ba565b985050505050505050505b92915050565b606060005b8351811015610c8357610c45848281518110610c2157610c21612216565b6020026020010151602001516001600160801b031684670de0b6b3a76400006112fc565b848281518110610c5757610c57612216565b6020908102919091018101516001600160801b0390921691015280610c7b8161227a565b915050610c03565b509192915050565b60008082600081518110610ca157610ca1612216565b602090810291909101015151915081905060015b8351811015610d6c578260020b848281518110610cd457610cd4612216565b60200260200101516000015160020b1215610d0e57838181518110610cfb57610cfb612216565b6020026020010151600001519250610d5a565b8160020b848281518110610d2457610d24612216565b60200260200101516000015160020b1315610d5a57838181518110610d4b57610d4b612216565b60200260200101516000015191505b80610d648161227a565b915050610cb5565b50915091565b6000805b8451811015610eb257848181518110610d9157610d91612216565b6020026020010151602001516001600160801b031660000315610ea0578315610e3957610e1f610dcc86838151811061036157610361612216565b610de28588858151811061032457610324612216565b610e11888581518110610df757610df7612216565b6020026020010151602001516001600160801b0316611ad0565b610e1a906122e4565b6117d2565b610e2890612313565b610e329083612267565b9150610ea0565b610e8a610e5186838151811061036157610361612216565b610e678588858151811061032457610324612216565b610e7c888581518110610df757610df7612216565b610e85906122e4565b611817565b610e9390612313565b610e9d9083612267565b91505b80610eaa8161227a565b915050610d76565b509392505050565b6000805b8551811015610ff357858181518110610ed957610ed9612216565b6020026020010151602001516001600160801b031660000315610fe1578415610f8557610f6b610f1487838151811061036157610361612216565b610f2a8689858151811061032457610324612216565b610e11610f668a8681518110610f4257610f42612216565b6020026020010151602001516001600160801b031688670de0b6b3a76400006112fc565b611ad0565b610f7490612313565b610f7e9083612267565b9150610fe1565b610fcb610f9d87838151811061036157610361612216565b610fb38689858151811061032457610324612216565b610e7c610f668a8681518110610f4257610f42612216565b610fd490612313565b610fde9083612267565b91505b80610feb8161227a565b915050610ebe565b50949350505050565b6000806000856001600160a01b0316633850c7bd6040518163ffffffff1660e01b815260040160e060405180830381865afa15801561103f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611063919061234c565b505060405163f30dba9360e01b815260028b900b60048201529395506000945084936001600160a01b038c16935063f30dba939250602401905061010060405180830381865afa1580156110bb573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110df91906123e4565b505060405163f30dba9360e01b815260028d900b600482015293975091955060009450849350506001600160a01b038c169163f30dba93915060240161010060405180830381865afa158015611139573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061115d91906123e4565b505050509350935050508860020b8560020b1215611184578184039650808303955061127e565b8760020b8560020b12156112735760008a6001600160a01b031663f30583996040518163ffffffff1660e01b8152600401602060405180830381865afa1580156111d2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111f69190612492565b905060008b6001600160a01b031663461413196040518163ffffffff1660e01b8152600401602060405180830381865afa158015611238573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061125c9190612492565b90508386830303985082858203039750505061127e565b838203965082810395505b5050505050935093915050565b60008061129883866124c1565b905060008560020b13156112d857836112c657826112b7826001612242565b6112c191906124fb565b6112d0565b6112d083826124fb565b915050610568565b836112e7576112c183826124fb565b826112f281836124fb565b6112d0919061251b565b6000808060001985870985870292508281108382030391505080600003611335576000841161132a57600080fd5b508290049050610568565b8084116113725760405162461bcd60e51b815260206004820152600660248201526536bab62234bb60d11b60448201526064015b60405180910390fd5b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150509392505050565b611422816040516024016113f39190612586565b60408051601f198184030181529190526020810180516001600160e01b031663104c13eb60e21b179052611b10565b50565b6114228160405160240161143b91815260200190565b60408051601f198184030181529190526020810180516001600160e01b0316634e0c1d1d60e01b179052611b10565b6114228160405160240161148091815260200190565b60408051601f198184030181529190526020810180516001600160e01b031663f5b1bba960e01b179052611b10565b60008060008360020b126114c6578260020b6114ce565b8260020b6000035b9050620d89e88111156114f4576040516315e4079d60e11b815260040160405180910390fd5b60008160011660000361150b57600160801b61151d565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff1690506002821615611551576ffff97272373d413259a46990580e213a0260801c5b6004821615611570576ffff2e50f5f656932ef12357cf3c7fdcc0260801c5b600882161561158f576fffe5caca7e10e4e61c3624eaa0941cd00260801c5b60108216156115ae576fffcb9843d60f6159c9db58835c9266440260801c5b60208216156115cd576fff973b41fa98c081472e6896dfb254c00260801c5b60408216156115ec576fff2ea16466c96a3843ec78b326b528610260801c5b608082161561160b576ffe5dee046a99a2a811c461f1969c30530260801c5b61010082161561162b576ffcbe86c7900a88aedcffc83b479aa3a40260801c5b61020082161561164b576ff987a7253ac413176f2b074cf7815e540260801c5b61040082161561166b576ff3392b0822b70005940c7a398e4b70f30260801c5b61080082161561168b576fe7159475a2c29b7443b29c7fa6e889d90260801c5b6110008216156116ab576fd097f3bdfd2022b8845ad8f792aa58250260801c5b6120008216156116cb576fa9f746462d870fdf8a65dc1f90e061e50260801c5b6140008216156116eb576f70d869a156d2a1b890bb3df62baf32f70260801c5b61800082161561170b576f31be135f97d08fd981231505542fcfa60260801c5b6201000082161561172c576f09aa508b5b7a84e1c677de54f3e99bc90260801c5b6202000082161561174c576e5d6af8dedb81196699c329225ee6040260801c5b6204000082161561176b576d2216e584f5fa1ea926041bedfe980260801c5b62080000821615611788576b048a170391f7dc42444e8fa20260801c5b60008460020b13156117a95780600019816117a5576117a56124ab565b0490505b6401000000008106156117bd5760016117c0565b60005b60ff16602082901c0192505050919050565b60008082600f0b126117f8576117f36117ee8585856001611b31565b611bf1565b61180f565b61180b6117ee8585856000036000611b31565b6000035b949350505050565b60008082600f0b12611833576117f36117ee8585856001611c3e565b61180b6117ee8585856000036000611c3e565b61188d83838360405160240161185e93929190612599565b60408051601f198184030181529190526020810180516001600160e01b031663969cdd0360e01b179052611b10565b505050565b806001600160a01b03811681146118db5760405162461bcd60e51b815260206004820152600d60248201526c31b0b9ba34b7339032b93937b960991b6044820152606401611369565b919050565b6000808360020b1280156118f7575060008260020b125b15611915578260020b8260020b61190e91906125be565b9050610bf8565b61191f828461251b565b60020b9392505050565b80821061193557505050565b600161194183836122ba565b1161194b57505050565b8181600085600261195c8486612267565b61196691906125de565b8151811061197657611976612216565b602002602001015190505b818311611aa2575b806000015160020b8684815181106119a3576119a3612216565b60200260200101516000015160020b12156119ca57826119c28161227a565b935050611989565b806000015160020b8683815181106119e4576119e4612216565b60200260200101516000015160020b1315611a0b5781611a03816122cd565b9250506119ca565b818311611a9d57858281518110611a2457611a24612216565b6020026020010151868481518110611a3e57611a3e612216565b6020026020010151878581518110611a5857611a58612216565b60200260200101888581518110611a7157611a71612216565b6020026020010182905282905250508280611a8b9061227a565b9350508180611a99906122cd565b9250505b611981565b81851015611ab557611ab5868684611929565b83831015611ac857611ac8868486611929565b505050505050565b80600f81900b81146118db5760405162461bcd60e51b81526020600482015260096024820152681cd859994818d85cdd60ba1b6044820152606401611369565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b6000836001600160a01b0316856001600160a01b03161115611b51579293925b6fffffffffffffffffffffffffffffffff60601b606084901b166001600160a01b038686038116908716611b8457600080fd5b83611bba57866001600160a01b0316611ba78383896001600160a01b03166112fc565b81611bb457611bb46124ab565b04611be6565b611be6611bd18383896001600160a01b0316611cb7565b886001600160a01b0316808204910615150190565b979650505050505050565b6000600160ff1b8210611c3a5760405162461bcd60e51b8152602060048201526011602482015270191a9b1031b0b9ba34b7339032b93937b960791b6044820152606401611369565b5090565b6000836001600160a01b0316856001600160a01b03161115611c5e579293925b81611c8b57611c86836001600160801b03168686036001600160a01b0316600160601b6112fc565b611cae565b611cae836001600160801b03168686036001600160a01b0316600160601b611cb7565b95945050505050565b6000611cc48484846112fc565b905060008280611cd657611cd66124ab565b8486091115610568576000198110611ced57600080fd5b6001019392505050565b6040518060c00160405280600060020b815260200160006001600160801b03168152602001600081526020016000815260200160008152602001600081525090565b634e487b7160e01b600052604160045260246000fd5b60405160c0810167ffffffffffffffff81118282101715611d7257611d72611d39565b60405290565b604051601f8201601f1916810167ffffffffffffffff81118282101715611da157611da1611d39565b604052919050565b8060020b811461142257600080fd5b6001600160801b038116811461142257600080fd5b600082601f830112611dde57600080fd5b8135602067ffffffffffffffff821115611dfa57611dfa611d39565b611e08818360051b01611d78565b82815260c09283028501820192828201919087851115611e2757600080fd5b8387015b85811015611e9e5781818a031215611e435760008081fd5b611e4b611d4f565b8135611e5681611da9565b815281860135611e6581611db8565b8187015260408281013590820152606080830135908201526080808301359082015260a080830135908201528452928401928101611e2b565b5090979650505050505050565b6001600160a01b038116811461142257600080fd5b600080600080600060a08688031215611ed857600080fd5b853567ffffffffffffffff811115611eef57600080fd5b611efb88828901611dcd565b955050602086013593506040860135611f1381611da9565b92506060860135611f2381611da9565b91506080860135611f3381611eab565b809150509295509295909350565b801515811461142257600080fd5b600080600060608486031215611f6457600080fd5b8335611f6f81611eab565b9250602084013591506040840135611f8681611f41565b809150509250925092565b60008060408385031215611fa457600080fd5b823567ffffffffffffffff80821115611fbc57600080fd5b611fc886838701611dcd565b93506020850135915080821115611fde57600080fd5b50611feb85828601611dcd565b9150509250929050565b602080825282518282018190526000919060409081850190868401855b8281101561206c578151805160020b8552868101516001600160801b0316878601528581015186860152606080820151908601526080808201519086015260a0908101519085015260c09093019290850190600101612012565b5091979650505050505050565b6000806040838503121561208c57600080fd5b823567ffffffffffffffff8111156120a357600080fd5b6120af85828601611dcd565b95602094909401359450505050565b6000602082840312156120d057600080fd5b813567ffffffffffffffff8111156120e757600080fd5b61180f84828501611dcd565b60008060006060848603121561210857600080fd5b833567ffffffffffffffff81111561211f57600080fd5b61212b86828701611dcd565b935050602084013561213c81611f41565b91506040840135611f8681611da9565b6000806000806080858703121561216257600080fd5b843567ffffffffffffffff81111561217957600080fd5b61218587828801611dcd565b945050602085013561219681611f41565b925060408501356121a681611da9565b9396929550929360600135925050565b6000806000606084860312156121cb57600080fd5b83356121d681611eab565b9250602084013561213c81611da9565b6000806000606084860312156121fb57600080fd5b833561220681611da9565b9250602084013561213c81611f41565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600281810b9083900b01627fffff8113627fffff1982121715610bf857610bf861222c565b80820180821115610bf857610bf861222c565b60006001820161228c5761228c61222c565b5060010190565b6001600160801b038181168382160190808211156122b3576122b361222c565b5092915050565b81810381811115610bf857610bf861222c565b6000816122dc576122dc61222c565b506000190190565b600081600f0b6f7fffffffffffffffffffffffffffffff19810361230a5761230a61222c565b60000392915050565b6000600160ff1b82016123285761232861222c565b5060000390565b805161ffff811681146118db57600080fd5b80516118db81611f41565b600080600080600080600060e0888a03121561236757600080fd5b875161237281611eab565b602089015190975061238381611da9565b95506123916040890161232f565b945061239f6060890161232f565b93506123ad6080890161232f565b925060a088015160ff811681146123c357600080fd5b60c08901519092506123d481611f41565b8091505092959891949750929550565b600080600080600080600080610100898b03121561240157600080fd5b885161240c81611db8565b80985050602089015180600f0b811461242457600080fd5b80975050604089015195506060890151945060808901518060060b811461244a57600080fd5b60a08a015190945061245b81611eab565b60c08a015190935063ffffffff8116811461247557600080fd5b915061248360e08a01612341565b90509295985092959890939650565b6000602082840312156124a457600080fd5b5051919050565b634e487b7160e01b600052601260045260246000fd5b60008160020b8360020b806124d8576124d86124ab565b627fffff198214600019821416156124f2576124f261222c565b90059392505050565b60008260020b8260020b028060020b91508082146122b3576122b361222c565b600282810b9082900b03627fffff198112627fffff82131715610bf857610bf861222c565b6000815180845260005b818110156125665760208185018101518683018201520161254a565b506000602082860101526020601f19601f83011685010191505092915050565b6020815260006105686020830184612540565b6060815260006125ac6060830186612540565b60208301949094525060400152919050565b81810360008312801583831316838312821617156122b3576122b361222c565b6000826125ed576125ed6124ab565b50049056fea264697066735822122073b3b7e6e9b8c43d3e3964134d912d022673f0e0f3245f3864a1c4d88fd0284864736f6c63430008120033";

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
