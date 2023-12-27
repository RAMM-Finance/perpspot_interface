/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type { Executioner, ExecutionerInterface } from "../../src/Executioner";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "T",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "contract ISwapper",
        name: "swapper",
        type: "address",
      },
    ],
    name: "executeAggregator",
    outputs: [
      {
        internalType: "int256",
        name: "amount0",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "amount1",
        type: "int256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "filler",
        type: "address",
      },
      {
        internalType: "bool",
        name: "outIsToken0",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "outputAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "inputAmount",
        type: "uint256",
      },
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
    ],
    name: "executeFiller",
    outputs: [
      {
        internalType: "int256",
        name: "amount0",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "amount1",
        type: "int256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "filler",
        type: "address",
      },
      {
        internalType: "bool",
        name: "outIsToken0",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "outputAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "inputAmount",
        type: "uint256",
      },
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
        internalType: "bytes32",
        name: "key",
        type: "bytes32",
      },
    ],
    name: "executeFiller",
    outputs: [
      {
        internalType: "int256",
        name: "amount0",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "amount1",
        type: "int256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
      {
        internalType: "bool",
        name: "down",
        type: "bool",
      },
      {
        internalType: "int256",
        name: "swapIn",
        type: "int256",
      },
      {
        internalType: "uint160",
        name: "limit",
        type: "uint160",
      },
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
    ],
    name: "executeUniswap",
    outputs: [
      {
        internalType: "int256",
        name: "amount0",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "amount1",
        type: "int256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
      {
        internalType: "bool",
        name: "down",
        type: "bool",
      },
      {
        internalType: "int256",
        name: "swapIn",
        type: "int256",
      },
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
        internalType: "uint256",
        name: "minOutput",
        type: "uint256",
      },
    ],
    name: "executeUniswapWithMinOutput",
    outputs: [
      {
        internalType: "int256",
        name: "amount0",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "amount1",
        type: "int256",
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
    ],
    name: "getOrder",
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
            internalType: "bool",
            name: "positionIsToken0",
            type: "bool",
          },
          {
            internalType: "uint32",
            name: "auctionDeadline",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "auctionStartTime",
            type: "uint32",
          },
          {
            internalType: "uint256",
            name: "startOutput",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minOutput",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "inputAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "decayRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "margin",
            type: "uint256",
          },
        ],
        internalType: "struct Order",
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
            internalType: "bool",
            name: "positionIsToken0",
            type: "bool",
          },
          {
            internalType: "uint32",
            name: "auctionDeadline",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "auctionStartTime",
            type: "uint32",
          },
          {
            internalType: "uint256",
            name: "startOutput",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minOutput",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "inputAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "decayRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "margin",
            type: "uint256",
          },
        ],
        internalType: "struct Order",
        name: "order",
        type: "tuple",
      },
    ],
    name: "getRequiredOutput",
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
    name: "orders",
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
        internalType: "bool",
        name: "positionIsToken0",
        type: "bool",
      },
      {
        internalType: "uint32",
        name: "auctionDeadline",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "auctionStartTime",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "startOutput",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minOutput",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "inputAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "decayRate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "margin",
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
        name: "pool",
        type: "address",
      },
      {
        internalType: "bool",
        name: "positionIsToken0",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isAdd",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startOutput",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minOutput",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "inputAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "decayRate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "margin",
        type: "uint256",
      },
    ],
    name: "submitOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int256",
        name: "amount0Delta",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "amount1Delta",
        type: "int256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "uniswapV3SwapCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x6080604052600160005534801561001557600080fd5b50611abe806100256000396000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c80639c3f1e90116100665780639c3f1e90146103c2578063a9a1f11e146104cf578063c90050de146104e5578063e76001cc146104f8578063fa461e331461050b57600080fd5b8063228e062a146100a35780632609e9341461018b578063549140ad146101b15780635778472a146101d957806393b9e134146103af575b600080fd5b6101896100b13660046113d9565b604080516bffffffffffffffffffffffff1960609b8c1b811660208084019190915233909c1b16603482015298151560f881811b60488c015298151590981b60498a01528051808a03602a018152604a90990181528851988a0198909820600090815260019099529690972060028101805464ffffffffff191664ffffffff00199097169690961761010063ffffffff968716021768ffffffff00000000001916600160281b429690961695909502949094179094556004830155600382015560058101919091556006810192909255600790910155565b005b61019e610199366004611532565b61051e565b6040519081526020015b60405180910390f35b6101c46101bf3660046115cc565b61058f565b604080519283526020830191909152016101a8565b6103076101e736600461163c565b60408051610180810182526000610120820181815261014083018290526101608301829052825260208201819052918101829052606081018290526080810182905260a0810182905260c0810182905260e081018290526101008101919091525060009081526001602081815260409283902083516101808101855281546001600160a01b0390811661012083019081529483015490811661014083015262ffffff600160a01b90910416610160820152928352600281015460ff811615159284019290925263ffffffff610100808404821695850195909552600160281b909204909116606083015260038101546080830152600481015460a0830152600581015460c0830152600681015460e0830152600701549181019190915290565b6040516101a89190815180516001600160a01b0390811683526020808301519091169083015260409081015162ffffff16908201526101608101602083015115156060830152604083015163ffffffff8116608084015250606083015163ffffffff811660a084015250608083015160c083015260a083015160e083015260c0830151610100818185015260e085015161012085015280850151610140850152505092915050565b6101c46103bd366004611655565b610716565b61045c6103d036600461163c565b600160208181526000928352604092839020835160608101855281546001600160a01b0390811682529382015493841692810192909252600160a01b90920462ffffff16928101929092526002810154600382015460048301546005840154600685015460079095015460ff851695610100860463ffffffff90811696600160281b9004169493929189565b604080518a516001600160a01b0390811682526020808d0151909116908201529981015162ffffff16908a0152961515606089015263ffffffff95861660808901529490931660a087015260c086019190915260e0850152610100840152610120830152610140820152610160016101a8565b6101c46104dd3660046116c5565b600080915091565b6101c46104f33660046116e2565b610847565b6101c461050636600461173d565b610901565b6101896105193660046117b8565b610d17565b6000808260e0015160001461055f5761055a836060015163ffffffff1642610546919061184e565b60e085015190670de0b6b3a7640000610e2d565b610569565b670de0b6b3a76400005b60808401519091506000906105879083670de0b6b3a7640000610eeb565b949350505050565b600080876001600160a01b031663128acb083389896105d98c6105ca5760016105bb620d89e719611867565b6105c59190611889565b610fca565b6105c5620d89e71960016118ae565b604080513360208201526001600160a01b03808e1692820192909252908b1660608201526080016040516020818303038152906040526040518663ffffffff1660e01b815260040161062f959493929190611919565b60408051808303816000875af115801561064d573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610671919061195f565b909250905060008112156106ca578261068982611983565b116106c55760405162461bcd60e51b815260206004820152600760248201526604d494e535741560cc1b60448201526064015b60405180910390fd5b61070b565b826106d483611983565b1161070b5760405162461bcd60e51b815260206004820152600760248201526604d494e535741560cc1b60448201526064016106bc565b965096945050505050565b600080866107245782610726565b835b6001600160a01b03166323b872dd8933896040518463ffffffff1660e01b81526004016107559392919061199f565b6020604051808303816000875af1158015610774573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061079891906119c3565b50866107a457836107a6565b825b6001600160a01b03166323b872dd338a886040518463ffffffff1660e01b81526004016107d59392919061199f565b6020604051808303816000875af11580156107f4573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061081891906119c3565b508661082d578461082887611983565b610838565b61083686611983565b855b90999098509650505050505050565b600080876001600160a01b031663128acb0833898989338a8a604051602001610890939291906001600160a01b0393841681529183166020830152909116604082015260600190565b6040516020818303038152906040526040518663ffffffff1660e01b81526004016108bf959493929190611919565b60408051808303816000875af11580156108dd573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610838919061195f565b6000806000600160008581526020019081526020016000209050610944604051806040016040528060028152602001613f3f60f01b8152508260050154896112ed565b61096c604051806040016040528060068152602001651bdd5d1c1d5d60d21b81525089611339565b61097f88670de0b6b3a764000089610eeb565b6005820154604080516101808101825284546001600160a01b039081166101208301908152600187015491821661014084015262ffffff600160a01b909204919091166101608301528152600285015460ff81161515602083015263ffffffff610100808304821694840194909452600160281b90910416606082015260038501546080820152600485015460a082015260c08101839052600685015460e0820152600785015491810191909152610a4b91670de0b6b3a764000091610a449061051e565b9190610eeb565b1115610a845760405162461bcd60e51b8152602060048201526008602482015267085bd85b5bdd5b9d60c21b60448201526064016106bc565b604080518082018252600580825264707269636560d81b6020808401919091529084015483516101808101855285546001600160a01b0390811661012083019081526001880154918216610140840152600160a01b90910462ffffff166101608301528152600286015460ff811615159382019390935261010080840463ffffffff90811696830196909652600160281b909304909416606085015260038501546080850152600485015460a085015260c08401819052600685015460e0850152600785015491840191909152610b8492610b6c91670de0b6b3a764000091610a449061051e565b610b7f8b670de0b6b3a76400008c610eeb565b6112ed565b6000848152600160208190526040822080546001600160a01b031916815590810180546001600160b81b031916905560028101805468ffffffffffffffffff19169055600381018290556004810182905560058101829055600681018290556007015588610bf25784610bf4565b855b6001600160a01b03166323b872dd8b338b6040518463ffffffff1660e01b8152600401610c239392919061199f565b6020604051808303816000875af1158015610c42573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c6691906119c3565b5088610c725785610c74565b845b6001600160a01b03166323b872dd338c8a6040518463ffffffff1660e01b8152600401610ca39392919061199f565b6020604051808303816000875af1158015610cc2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ce691906119c3565b5088610cfb5786610cf689611983565b610d06565b610d0488611983565b875b909b909a5098505050505050505050565b60008080610d27848601866119e0565b9250925092506000871315610daf576040516323b872dd60e01b81526001600160a01b038316906323b872dd90610d6690869033908c9060040161199f565b6020604051808303816000875af1158015610d85573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610da991906119c3565b50610e24565b6040516323b872dd60e01b81526001600160a01b038216906323b872dd90610ddf90869033908b9060040161199f565b6020604051808303816000875af1158015610dfe573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e2291906119c3565b505b50505050505050565b6000838015610ecd57600184168015610e4857859250610e4c565b8392505b508260011c8460011c94505b8415610ec7578560801c15610e6c57600080fd5b85860281810181811015610e7f57600080fd5b8590049650506001851615610ebc578583028387820414610ea5578615610ea557600080fd5b81810181811015610eb557600080fd5b8590049350505b8460011c9450610e58565b50610ee3565b838015610edd5760009250610ee1565b8392505b505b509392505050565b6000808060001985870985870292508281108382030391505080600003610f245760008411610f1957600080fd5b508290049050610fc3565b808411610f5c5760405162461bcd60e51b815260206004820152600660248201526536bab62234bb60d11b60448201526064016106bc565b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150505b9392505050565b60008060008360020b12610fe1578260020b610fe9565b8260020b6000035b9050620d89e881111561100f576040516315e4079d60e11b815260040160405180910390fd5b60008160011660000361102657600160801b611038565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff169050600282161561106c576ffff97272373d413259a46990580e213a0260801c5b600482161561108b576ffff2e50f5f656932ef12357cf3c7fdcc0260801c5b60088216156110aa576fffe5caca7e10e4e61c3624eaa0941cd00260801c5b60108216156110c9576fffcb9843d60f6159c9db58835c9266440260801c5b60208216156110e8576fff973b41fa98c081472e6896dfb254c00260801c5b6040821615611107576fff2ea16466c96a3843ec78b326b528610260801c5b6080821615611126576ffe5dee046a99a2a811c461f1969c30530260801c5b610100821615611146576ffcbe86c7900a88aedcffc83b479aa3a40260801c5b610200821615611166576ff987a7253ac413176f2b074cf7815e540260801c5b610400821615611186576ff3392b0822b70005940c7a398e4b70f30260801c5b6108008216156111a6576fe7159475a2c29b7443b29c7fa6e889d90260801c5b6110008216156111c6576fd097f3bdfd2022b8845ad8f792aa58250260801c5b6120008216156111e6576fa9f746462d870fdf8a65dc1f90e061e50260801c5b614000821615611206576f70d869a156d2a1b890bb3df62baf32f70260801c5b618000821615611226576f31be135f97d08fd981231505542fcfa60260801c5b62010000821615611247576f09aa508b5b7a84e1c677de54f3e99bc90260801c5b62020000821615611267576e5d6af8dedb81196699c329225ee6040260801c5b62040000821615611286576d2216e584f5fa1ea926041bedfe980260801c5b620800008216156112a3576b048a170391f7dc42444e8fa20260801c5b60008460020b13156112c45780600019816112c0576112c0611a2b565b0490505b6401000000008106156112d85760016112db565b60005b60ff16602082901c0192505050919050565b61133483838360405160240161130593929190611a41565b60408051601f198184030181529190526020810180516001600160e01b031663969cdd0360e01b179052611382565b505050565b61137e828260405160240161134f929190611a66565b60408051601f198184030181529190526020810180516001600160e01b03166309710a9d60e41b179052611382565b5050565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b6001600160a01b03811681146113b857600080fd5b50565b80151581146113b857600080fd5b80356113d4816113bb565b919050565b60008060008060008060008060006101208a8c0312156113f857600080fd5b8935611403816113a3565b985060208a0135611413816113bb565b975060408a0135611423816113bb565b989b979a5097986060810135985060808101359760a0820135975060c0820135965060e08201359550610100909101359350915050565b604051610120810167ffffffffffffffff8111828210171561148c57634e487b7160e01b600052604160045260246000fd5b60405290565b6000606082840312156114a457600080fd5b6040516060810181811067ffffffffffffffff821117156114d557634e487b7160e01b600052604160045260246000fd5b60405290508082356114e6816113a3565b815260208301356114f6816113a3565b6020820152604083013562ffffff8116811461151157600080fd5b6040919091015292915050565b803563ffffffff811681146113d457600080fd5b6000610160828403121561154557600080fd5b61154d61145a565b6115578484611492565b8152611565606084016113c9565b60208201526115766080840161151e565b604082015261158760a0840161151e565b606082015260c0830135608082015260e083013560a08201526101008084013560c083015261012084013560e083015261014084013581830152508091505092915050565b60008060008060008060c087890312156115e557600080fd5b86356115f0816113a3565b95506020870135611600816113bb565b9450604087013593506060870135611617816113a3565b92506080870135611627816113a3565b8092505060a087013590509295509295509295565b60006020828403121561164e57600080fd5b5035919050565b60008060008060008060c0878903121561166e57600080fd5b8635611679816113a3565b95506020870135611689816113bb565b9450604087013593506060870135925060808701356116a7816113a3565b915060a08701356116b7816113a3565b809150509295509295509295565b6000602082840312156116d757600080fd5b8135610fc3816113a3565b60008060008060008060c087890312156116fb57600080fd5b8635611706816113a3565b95506020870135611716816113bb565b945060408701359350606087013561172d816113a3565b925060808701356116a7816113a3565b600080600080600080600060e0888a03121561175857600080fd5b8735611763816113a3565b96506020880135611773816113bb565b955060408801359450606088013593506080880135611791816113a3565b925060a08801356117a1816113a3565b8092505060c0880135905092959891949750929550565b600080600080606085870312156117ce57600080fd5b8435935060208501359250604085013567ffffffffffffffff808211156117f457600080fd5b818701915087601f83011261180857600080fd5b81358181111561181757600080fd5b88602082850101111561182957600080fd5b95989497505060200194505050565b634e487b7160e01b600052601160045260246000fd5b8181038181111561186157611861611838565b92915050565b60008160020b627fffff19810361188057611880611838565b60000392915050565b600282810b9082900b03627fffff198112627fffff8213171561186157611861611838565b600281810b9083900b01627fffff8113627fffff198212171561186157611861611838565b6000815180845260005b818110156118f9576020818501810151868301820152016118dd565b506000602082860101526020601f19601f83011685010191505092915050565b6001600160a01b0386811682528515156020830152604082018590528316606082015260a060808201819052600090611954908301846118d3565b979650505050505050565b6000806040838503121561197257600080fd5b505080516020909101519092909150565b6000600160ff1b820161199857611998611838565b5060000390565b6001600160a01b039384168152919092166020820152604081019190915260600190565b6000602082840312156119d557600080fd5b8151610fc3816113bb565b6000806000606084860312156119f557600080fd5b8335611a00816113a3565b92506020840135611a10816113a3565b91506040840135611a20816113a3565b809150509250925092565b634e487b7160e01b600052601260045260246000fd5b606081526000611a5460608301866118d3565b60208301949094525060400152919050565b604081526000611a7960408301856118d3565b9050826020830152939250505056fea26469706673582212204cfd28fce82a107acd113042b05b9a983d323d02d53543e324f65a6d926041c764736f6c63430008120033";

type ExecutionerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ExecutionerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Executioner__factory extends ContractFactory {
  constructor(...args: ExecutionerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Executioner> {
    return super.deploy(overrides || {}) as Promise<Executioner>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Executioner {
    return super.attach(address) as Executioner;
  }
  override connect(signer: Signer): Executioner__factory {
    return super.connect(signer) as Executioner__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ExecutionerInterface {
    return new utils.Interface(_abi) as ExecutionerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Executioner {
    return new Contract(address, _abi, signerOrProvider) as Executioner;
  }
}
