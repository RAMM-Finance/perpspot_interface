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
        internalType: "uint256",
        name: "swapIn",
        type: "uint256",
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
  "0x6080604052600160005534801561001557600080fd5b50611377806100256000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c80639c3f1e901161005b5780639c3f1e9014610399578063a9a1f11e146104a6578063e76001cc146104bc578063fa461e33146104cf57600080fd5b8063228e062a1461008d5780632609e93414610175578063379743101461019b5780635778472a146101c3575b600080fd5b61017361009b366004610dd6565b604080516bffffffffffffffffffffffff1960609b8c1b811660208084019190915233909c1b16603482015298151560f881811b60488c015298151590981b60498a01528051808a03602a018152604a90990181528851988a0198909820600090815260019099529690972060028101805464ffffffffff191664ffffffff00199097169690961761010063ffffffff968716021768ffffffff00000000001916600160281b429690961695909502949094179094556004830155600382015560058101919091556006810192909255600790910155565b005b610188610183366004610f2f565b6104e2565b6040519081526020015b60405180910390f35b6101ae6101a9366004610fc9565b610553565b60408051928352602083019190915201610192565b6102f16101d1366004611042565b60408051610180810182526000610120820181815261014083018290526101608301829052825260208201819052918101829052606081018290526080810182905260a0810182905260c0810182905260e081018290526101008101919091525060009081526001602081815260409283902083516101808101855281546001600160a01b0390811661012083019081529483015490811661014083015262ffffff600160a01b90910416610160820152928352600281015460ff811615159284019290925263ffffffff610100808404821695850195909552600160281b909204909116606083015260038101546080830152600481015460a0830152600581015460c0830152600681015460e0830152600701549181019190915290565b6040516101929190815180516001600160a01b0390811683526020808301519091169083015260409081015162ffffff16908201526101608101602083015115156060830152604083015163ffffffff8116608084015250606083015163ffffffff811660a084015250608083015160c083015260a083015160e083015260c0830151610100818185015260e085015161012085015280850151610140850152505092915050565b6104336103a7366004611042565b600160208181526000928352604092839020835160608101855281546001600160a01b0390811682529382015493841692810192909252600160a01b90920462ffffff16928101929092526002810154600382015460048301546005840154600685015460079095015460ff851695610100860463ffffffff90811696600160281b9004169493929189565b604080518a516001600160a01b0390811682526020808d0151909116908201529981015162ffffff16908a0152961515606089015263ffffffff95861660808901529490931660a087015260c086019190915260e085015261010084015261012083015261014082015261016001610192565b6101ae6104b436600461105b565b600080915091565b6101ae6104ca366004611078565b61061c565b6101736104dd3660046110f3565b610a37565b6000808260e001516000146105235761051e836060015163ffffffff164261050a9190611189565b60e085015190670de0b6b3a7640000610b4d565b61052d565b670de0b6b3a76400005b608084015190915060009061054b9083670de0b6b3a7640000610c0b565b949350505050565b600080876001600160a01b031663128acb0833898989338a8a60405160200161059c939291906001600160a01b0393841681529183166020830152909116604082015260600190565b6040516020818303038152906040526040518663ffffffff1660e01b81526004016105cb9594939291906111e8565b60408051808303816000875af11580156105e9573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061060d919061122e565b90999098509650505050505050565b600080600060016000858152602001908152602001600020905061065f604051806040016040528060028152602001613f3f60f01b815250826005015489610cea565b610687604051806040016040528060068152602001651bdd5d1c1d5d60d21b81525089610d36565b61069a88670de0b6b3a764000089610c0b565b6005820154604080516101808101825284546001600160a01b039081166101208301908152600187015491821661014084015262ffffff600160a01b909204919091166101608301528152600285015460ff81161515602083015263ffffffff610100808304821694840194909452600160281b90910416606082015260038501546080820152600485015460a082015260c08101839052600685015460e082015260078501549181019190915261076691670de0b6b3a76400009161075f906104e2565b9190610c0b565b11156107a45760405162461bcd60e51b8152602060048201526008602482015267085bd85b5bdd5b9d60c21b60448201526064015b60405180910390fd5b604080518082018252600580825264707269636560d81b6020808401919091529084015483516101808101855285546001600160a01b0390811661012083019081526001880154918216610140840152600160a01b90910462ffffff166101608301528152600286015460ff811615159382019390935261010080840463ffffffff90811696830196909652600160281b909304909416606085015260038501546080850152600485015460a085015260c08401819052600685015460e08501526007850154918401919091526108a49261088c91670de0b6b3a76400009161075f906104e2565b61089f8b670de0b6b3a76400008c610c0b565b610cea565b6000848152600160208190526040822080546001600160a01b031916815590810180546001600160b81b031916905560028101805468ffffffffffffffffff191690556003810182905560048101829055600581018290556006810182905560070155886109125784610914565b855b6001600160a01b03166323b872dd8b338b6040518463ffffffff1660e01b815260040161094393929190611252565b6020604051808303816000875af1158015610962573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109869190611276565b50886109925785610994565b845b6001600160a01b03166323b872dd338c8a6040518463ffffffff1660e01b81526004016109c393929190611252565b6020604051808303816000875af11580156109e2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a069190611276565b5088610a1b5786610a1689611293565b610a26565b610a2488611293565b875b909b909a5098505050505050505050565b60008080610a47848601866112af565b9250925092506000871315610acf576040516323b872dd60e01b81526001600160a01b038316906323b872dd90610a8690869033908c90600401611252565b6020604051808303816000875af1158015610aa5573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ac99190611276565b50610b44565b6040516323b872dd60e01b81526001600160a01b038216906323b872dd90610aff90869033908b90600401611252565b6020604051808303816000875af1158015610b1e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b429190611276565b505b50505050505050565b6000838015610bed57600184168015610b6857859250610b6c565b8392505b508260011c8460011c94505b8415610be7578560801c15610b8c57600080fd5b85860281810181811015610b9f57600080fd5b8590049650506001851615610bdc578583028387820414610bc5578615610bc557600080fd5b81810181811015610bd557600080fd5b8590049350505b8460011c9450610b78565b50610c03565b838015610bfd5760009250610c01565b8392505b505b509392505050565b6000808060001985870985870292508281108382030391505080600003610c445760008411610c3957600080fd5b508290049050610ce3565b808411610c7c5760405162461bcd60e51b815260206004820152600660248201526536bab62234bb60d11b604482015260640161079b565b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150505b9392505050565b610d31838383604051602401610d02939291906112fa565b60408051601f198184030181529190526020810180516001600160e01b031663969cdd0360e01b179052610d7f565b505050565b610d7b8282604051602401610d4c92919061131f565b60408051601f198184030181529190526020810180516001600160e01b03166309710a9d60e41b179052610d7f565b5050565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b6001600160a01b0381168114610db557600080fd5b50565b8015158114610db557600080fd5b8035610dd181610db8565b919050565b60008060008060008060008060006101208a8c031215610df557600080fd5b8935610e0081610da0565b985060208a0135610e1081610db8565b975060408a0135610e2081610db8565b989b979a5097986060810135985060808101359760a0820135975060c0820135965060e08201359550610100909101359350915050565b604051610120810167ffffffffffffffff81118282101715610e8957634e487b7160e01b600052604160045260246000fd5b60405290565b600060608284031215610ea157600080fd5b6040516060810181811067ffffffffffffffff82111715610ed257634e487b7160e01b600052604160045260246000fd5b6040529050808235610ee381610da0565b81526020830135610ef381610da0565b6020820152604083013562ffffff81168114610f0e57600080fd5b6040919091015292915050565b803563ffffffff81168114610dd157600080fd5b60006101608284031215610f4257600080fd5b610f4a610e57565b610f548484610e8f565b8152610f6260608401610dc6565b6020820152610f7360808401610f1b565b6040820152610f8460a08401610f1b565b606082015260c0830135608082015260e083013560a08201526101008084013560c083015261012084013560e083015261014084013581830152508091505092915050565b60008060008060008060c08789031215610fe257600080fd5b8635610fed81610da0565b95506020870135610ffd81610db8565b945060408701359350606087013561101481610da0565b9250608087013561102481610da0565b915060a087013561103481610da0565b809150509295509295509295565b60006020828403121561105457600080fd5b5035919050565b60006020828403121561106d57600080fd5b8135610ce381610da0565b600080600080600080600060e0888a03121561109357600080fd5b873561109e81610da0565b965060208801356110ae81610db8565b9550604088013594506060880135935060808801356110cc81610da0565b925060a08801356110dc81610da0565b8092505060c0880135905092959891949750929550565b6000806000806060858703121561110957600080fd5b8435935060208501359250604085013567ffffffffffffffff8082111561112f57600080fd5b818701915087601f83011261114357600080fd5b81358181111561115257600080fd5b88602082850101111561116457600080fd5b95989497505060200194505050565b634e487b7160e01b600052601160045260246000fd5b8181038181111561119c5761119c611173565b92915050565b6000815180845260005b818110156111c8576020818501810151868301820152016111ac565b506000602082860101526020601f19601f83011685010191505092915050565b6001600160a01b0386811682528515156020830152604082018590528316606082015260a060808201819052600090611223908301846111a2565b979650505050505050565b6000806040838503121561124157600080fd5b505080516020909101519092909150565b6001600160a01b039384168152919092166020820152604081019190915260600190565b60006020828403121561128857600080fd5b8151610ce381610db8565b6000600160ff1b82016112a8576112a8611173565b5060000390565b6000806000606084860312156112c457600080fd5b83356112cf81610da0565b925060208401356112df81610da0565b915060408401356112ef81610da0565b809150509250925092565b60608152600061130d60608301866111a2565b60208301949094525060400152919050565b60408152600061133260408301856111a2565b9050826020830152939250505056fea264697066735822122000a30c8df22c68953b714c6198f0ab55e0054053934dddfb0ac44535165731cb64736f6c63430008120033";

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
