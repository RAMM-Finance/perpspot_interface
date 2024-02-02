/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  LPManager,
  LPManagerInterface,
} from "../../../src/periphery/LPManager";

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
        internalType: "struct LPManager.Position",
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
      {
        internalType: "address",
        name: "token",
        type: "address",
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
  "0x608060405234801561001057600080fd5b50611a47806100206000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80630e5ecb541461005c578063485cc955146100985780635d001c32146100ad578063c7b9d530146100d5578063eb02c3011461010c575b600080fd5b61006f61006a3660046115c4565b61012c565b6040805193845260208401929092526001600160801b0316908201526060015b60405180910390f35b6100ab6100a6366004611698565b6105ca565b005b6100c06100bb3660046116e6565b610876565b6040805192835260208301919091520161008f565b6100ab6100e336600461170b565b6001600160a01b03166000908152600460205260409020805460ff19811660ff90911615179055565b61011f61011a366004611728565b610edd565b60405161008f9190611741565b336000908152600460205260408120548190819060ff166101825760405162461bcd60e51b815260206004820152600b60248201526a085cdd1c985d1959da5cdd60aa1b60448201526064015b60405180910390fd5b87516001600160a01b03858116911614806101b7576101b26101a389610fee565b6101ac89610fee565b88611311565b6101d2565b6101d26101c389610fee565b6101cc89610fee565b88611364565b915060006127106101e5886127116117ef565b6101ef9190611822565b600054604051637802d79f60e11b8152600481018390529192506201000090046001600160a01b03169063f005af3e90602401600060405180830381600087803b15801561023c57600080fd5b505af1158015610250573d6000803e3d6000fd5b50506003805492509050600061026583611844565b909155505060035460009081526005602052604090206004810180548591906006906102a2908490600160301b90046001600160801b031661185d565b92506101000a8154816001600160801b0302191690836001600160801b03160217905550898160040160006101000a81548162ffffff021916908360020b62ffffff160217905550888160040160036101000a81548162ffffff021916908360020b62ffffff1602179055508a8160050160008201518160000160006101000a8154816001600160a01b0302191690836001600160a01b0316021790555060208201518160010160006101000a8154816001600160a01b0302191690836001600160a01b0316021790555060408201518160010160146101000a81548162ffffff021916908362ffffff1602179055509050506104446040518060400160405280600781526020016662616c616e636560c81b81525089866001600160801b03168a6001600160a01b03166370a08231306040518263ffffffff1660e01b81526004016103fe91906001600160a01b0391909116815260200190565b602060405180830381865afa15801561041b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061043f919061187d565b6113fb565b60015460408051635c48cfd360e11b81528d516001600160a01b03908116600483015260208f015181166024830152918e015162ffffff16604482015260028d810b60648301528c900b60848201526001600160801b03871660a48201523060c482015291169063b8919fa69060e40160408051808303816000875af11580156104d2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104f69190611896565b825491975095508690829060009061050f9084906118ba565b925050819055508481600101600082825461052a91906118ba565b90915550506000546201000090046001600160a01b0316633bc034bd8461055a5761055587856118cd565b610564565b61056488856118cd565b6040516001600160e01b031960e084901b168152600481019190915260006024820152604401600060405180830381600087803b1580156105a457600080fd5b505af11580156105b8573d6000803e3d6000fd5b50505050505050955095509592505050565b600054610100900460ff16158080156105ea5750600054600160ff909116105b806106045750303b158015610604575060005460ff166001145b6106675760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b6064820152608401610179565b6000805460ff19166001179055801561068a576000805461ff0019166101001790555b6000805462010000600160b01b031916620100006001600160a01b03868116820292909217808455600180546001600160a01b03199081168886161790915560028054339216919091179055604080516338d52e0f60e01b8152905192909104909216916338d52e0f9160048083019260209291908290030181865afa158015610718573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061073c91906118e0565b60405163095ea7b360e01b81526001600160a01b03858116600483015260001960248301529192509082169063095ea7b3906044016020604051808303816000875af1158015610790573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107b491906118fd565b5060405163095ea7b360e01b81526001600160a01b038581166004830152600019602483015282169063095ea7b3906044016020604051808303816000875af1158015610805573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061082991906118fd565b50508015610871576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b505050565b33600090815260046020526040812054819060ff166108c55760405162461bcd60e51b815260206004820152600b60248201526a085cdd1c985d1959da5cdd60aa1b6044820152606401610179565b600084815260056020526040902060048101546001600160801b03600160301b909104811690851611156109215760405162461bcd60e51b81526020600482015260036024820152626c697160e81b6044820152606401610179565b838160040160068282829054906101000a90046001600160801b0316610947919061191f565b82546101009290920a6001600160801b03818102199093169183160217909155600154600484810154604051632afe5e3960e21b815260058701546001600160a01b03908116938201939093526006870154808416602483015262ffffff60a09190911c166044820152600282810b6064830152630100000090920490910b608482015292881660a484015216915063abf978e49060c40160408051808303816000875af11580156109fd573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a219190611896565b6001546004848101546040516319fa103360e01b815260058701546001600160a01b03908116938201939093526006870154808416602483015260a01c62ffffff166044820152600282810b6064830152630100000090920490910b60848201529396509194506000928392909116906319fa10339060a40160408051808303816000875af1158015610ab8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610adc919061193f565b9092509050610af46001600160801b038316866118ba565b9450610b096001600160801b038216856118ba565b935084836002016000828254610b1f91906118ba565b9250508190555083836003016000828254610b3a91906118ba565b909155505060048301546064600160301b9091046001600160801b031611610ed35782546002840154600091610b6f9161196e565b9050600084600101548560030154610b87919061196e565b855490915015610d03576000548554604051633bc034bd60e01b8152600481019190915260248101849052620100009091046001600160a01b031690633bc034bd90604401600060405180830381600087803b158015610be657600080fd5b505af1158015610bfa573d6000803e3d6000fd5b505050506006850154600054600387015460405163095ea7b360e01b81526001600160a01b036201000090930483166004820152602481019190915291169063095ea7b3906044016020604051808303816000875af1158015610c61573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c8591906118fd565b5060005460038601546006870154604051634b390ec560e11b815260048101929092526001600160a01b03908116602483015262010000909204909116906396721d8a90604401600060405180830381600087803b158015610ce657600080fd5b505af1158015610cfa573d6000803e3d6000fd5b50505050610e74565b6000546001860154604051633bc034bd60e01b8152600481019190915260248101839052620100009091046001600160a01b031690633bc034bd90604401600060405180830381600087803b158015610d5b57600080fd5b505af1158015610d6f573d6000803e3d6000fd5b505050506005850154600054600287015460405163095ea7b360e01b81526001600160a01b036201000090930483166004820152602481019190915291169063095ea7b3906044016020604051808303816000875af1158015610dd6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610dfa91906118fd565b5060005460028601546005870154604051634b390ec560e11b815260048101929092526001600160a01b03908116602483015262010000909204909116906396721d8a90604401600060405180830381600087803b158015610e5b57600080fd5b505af1158015610e6f573d6000803e3d6000fd5b505050505b505060008781526005602081905260408220828155600181018390556002810183905560038101929092556004820180546001600160b01b0319169055810180546001600160a01b031916905560060180546001600160b81b03191690555b5050509250929050565b610f3860408051610100810182526000808252602080830182905282840182905260608084018390526080840183905260a0840183905260c0840183905284519081018552828152908101829052928301529060e082015290565b5060009081526005602081815260409283902083516101008101855281548152600182015481840152600280830154828701526003830154606080840191909152600484015480830b60808501526301000000810490920b60a0840152600160301b9091046001600160801b031660c083015285519081018652938201546001600160a01b03908116855260069092015491821692840192909252600160a01b900462ffffff169282019290925260e082015290565b60008060008360020b12611005578260020b61100d565b8260020b6000035b9050620d89e8811115611033576040516315e4079d60e11b815260040160405180910390fd5b60008160011660000361104a57600160801b61105c565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff1690506002821615611090576ffff97272373d413259a46990580e213a0260801c5b60048216156110af576ffff2e50f5f656932ef12357cf3c7fdcc0260801c5b60088216156110ce576fffe5caca7e10e4e61c3624eaa0941cd00260801c5b60108216156110ed576fffcb9843d60f6159c9db58835c9266440260801c5b602082161561110c576fff973b41fa98c081472e6896dfb254c00260801c5b604082161561112b576fff2ea16466c96a3843ec78b326b528610260801c5b608082161561114a576ffe5dee046a99a2a811c461f1969c30530260801c5b61010082161561116a576ffcbe86c7900a88aedcffc83b479aa3a40260801c5b61020082161561118a576ff987a7253ac413176f2b074cf7815e540260801c5b6104008216156111aa576ff3392b0822b70005940c7a398e4b70f30260801c5b6108008216156111ca576fe7159475a2c29b7443b29c7fa6e889d90260801c5b6110008216156111ea576fd097f3bdfd2022b8845ad8f792aa58250260801c5b61200082161561120a576fa9f746462d870fdf8a65dc1f90e061e50260801c5b61400082161561122a576f70d869a156d2a1b890bb3df62baf32f70260801c5b61800082161561124a576f31be135f97d08fd981231505542fcfa60260801c5b6201000082161561126b576f09aa508b5b7a84e1c677de54f3e99bc90260801c5b6202000082161561128b576e5d6af8dedb81196699c329225ee6040260801c5b620400008216156112aa576d2216e584f5fa1ea926041bedfe980260801c5b620800008216156112c7576b048a170391f7dc42444e8fa20260801c5b60008460020b13156112e85780600019816112e4576112e461180c565b0490505b6401000000008106156112fc5760016112ff565b60005b60ff16602082901c0192505050919050565b6000826001600160a01b0316846001600160a01b03161115611331579192915b61135a61135583600160601b611347888861198e565b6001600160a01b031661144a565b611528565b90505b9392505050565b6000826001600160a01b0316846001600160a01b03161115611384579192915b60006113a7856001600160a01b0316856001600160a01b0316600160601b61144a565b905080156113c9576113c16113558483611347898961198e565b91505061135d565b6113c16113556113e7856001600160a01b0389166113478a8a61198e565b866001600160a01b0316600160601b61144a565b6114448484848460405160240161141594939291906119ae565b60408051601f198184030181529190526020810180516001600160e01b03166304772b3360e11b17905261156e565b50505050565b6000808060001985870985870292508281108382030391505080600003611483576000841161147857600080fd5b50829004905061135d565b8084116114bb5760405162461bcd60e51b815260206004820152600660248201526536bab62234bb60d11b6044820152606401610179565b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150509392505050565b806001600160801b03811681146115695760405162461bcd60e51b81526020600482015260056024820152640858d85cdd60da1b6044820152606401610179565b919050565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b6001600160a01b03811681146115a457600080fd5b50565b80356115698161158f565b8035600281900b811461156957600080fd5b600080600080600085870360e08112156115dd57600080fd5b60608112156115eb57600080fd5b506040516060810181811067ffffffffffffffff8211171561161d57634e487b7160e01b600052604160045260246000fd5b604052863561162b8161158f565b8152602087013561163b8161158f565b6020820152604087013562ffffff8116811461165657600080fd5b60408201529450611669606087016115b2565b9350611677608087016115b2565b925060a0860135915061168c60c087016115a7565b90509295509295909350565b600080604083850312156116ab57600080fd5b82356116b68161158f565b915060208301356116c68161158f565b809150509250929050565b6001600160801b03811681146115a457600080fd5b600080604083850312156116f957600080fd5b8235915060208301356116c6816116d1565b60006020828403121561171d57600080fd5b813561135d8161158f565b60006020828403121561173a57600080fd5b5035919050565b60006101408201905082518252602083015160208301526040830151604083015260608301516060830152608083015160020b608083015260a083015160020b60a08301526001600160801b0360c08401511660c083015260e08301516117d260e084018280516001600160a01b0390811683526020808301519091169083015260409081015162ffffff16910152565b5092915050565b634e487b7160e01b600052601160045260246000fd5b8082028115828204841417611806576118066117d9565b92915050565b634e487b7160e01b600052601260045260246000fd5b60008261183f57634e487b7160e01b600052601260045260246000fd5b500490565b600060018201611856576118566117d9565b5060010190565b6001600160801b038181168382160190808211156117d2576117d26117d9565b60006020828403121561188f57600080fd5b5051919050565b600080604083850312156118a957600080fd5b505080516020909101519092909150565b80820180821115611806576118066117d9565b81810381811115611806576118066117d9565b6000602082840312156118f257600080fd5b815161135d8161158f565b60006020828403121561190f57600080fd5b8151801515811461135d57600080fd5b6001600160801b038281168282160390808211156117d2576117d26117d9565b6000806040838503121561195257600080fd5b825161195d816116d1565b60208401519092506116c6816116d1565b81810360008312801583831316838312821617156117d2576117d26117d9565b6001600160a01b038281168282160390808211156117d2576117d26117d9565b608081526000855180608084015260005b818110156119dc57602081890181015160a08684010152016119bf565b50600060a0828501015260a0601f19601f8301168401019150508460208301528360408301528260608301529594505050505056fea2646970667358221220332b10310243466b47561f5a6b1214f87b95adc3e8844192a39af9c54e73ccde64736f6c63430008120033";

type LPManagerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: LPManagerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class LPManager__factory extends ContractFactory {
  constructor(...args: LPManagerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<LPManager> {
    return super.deploy(overrides || {}) as Promise<LPManager>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): LPManager {
    return super.attach(address) as LPManager;
  }
  override connect(signer: Signer): LPManager__factory {
    return super.connect(signer) as LPManager__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): LPManagerInterface {
    return new utils.Interface(_abi) as LPManagerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): LPManager {
    return new Contract(address, _abi, signerOrProvider) as LPManager;
  }
}
