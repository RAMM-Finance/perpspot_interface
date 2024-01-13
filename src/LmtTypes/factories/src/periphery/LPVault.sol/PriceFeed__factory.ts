/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  PriceFeed,
  PriceFeedInterface,
} from "../../../../src/periphery/LPVault.sol/PriceFeed";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "getPrice",
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
    inputs: [],
    name: "usdc",
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
    inputs: [],
    name: "wbtc",
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
    inputs: [],
    name: "wbtcPrice",
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
    inputs: [],
    name: "weth",
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
    inputs: [],
    name: "wethPrice",
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
] as const;

const _bytecode =
  "0x60806040526877432217e6836000006000556908e4d31682768640000060015534801561002b57600080fd5b50600280546001600160a01b031990811673639fe6ab55c921f74e7fac1ee960c0b6293ba6121790915560038054909116736ce185860a4963106506c203335a2910413708e9179055610357806100836000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c80633cdc5389146100675780633e413bee1461009f5780633fc8cef3146100ba57806341976e09146100d557806349a8ce2b146100f6578063e6048a0b146100ff575b600080fd5b610082732f2a2543b76a4166549f7aab2e75bef0aefc5b0f81565b6040516001600160a01b0390911681526020015b60405180910390f35b61008273af88d065e77c8cc2239327c5edb3a432268e583181565b6100827382af49447d8a07e3bd95bd0d56f35241523fbab181565b6100e86100e3366004610263565b610108565b604051908152602001610096565b6100e860005481565b6100e860015481565b6000732f2a2543b76a4166549f7aab2e75bef0aefc5b0e196001600160a01b038316016101bb5760035460408051633fabe5a360e21b815290516000926001600160a01b03169163feaf968c9160048083019260a09291908290030181865afa158015610179573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061019d91906102a6565b505050915050806402540be4006101b491906102f6565b9392505050565b7382af49447d8a07e3bd95bd0d56f35241523fbab0196001600160a01b0383160161022a5760025460408051633fabe5a360e21b815290516000926001600160a01b03169163feaf968c9160048083019260a09291908290030181865afa158015610179573d6000803e3d6000fd5b73af88d065e77c8cc2239327c5edb3a432268e5830196001600160a01b0383160161025e5750670de0b6b3a7640000919050565b919050565b60006020828403121561027557600080fd5b81356001600160a01b03811681146101b457600080fd5b805169ffffffffffffffffffff8116811461025e57600080fd5b600080600080600060a086880312156102be57600080fd5b6102c78661028c565b94506020860151935060408601519250606086015191506102ea6080870161028c565b90509295509295909350565b808202811582820484141761031b57634e487b7160e01b600052601160045260246000fd5b9291505056fea2646970667358221220149b33f1bec63aaea86d727826b0dfcf2c0ad351f0fb1551c32358fc58e9746e64736f6c63430008120033";

type PriceFeedConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PriceFeedConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class PriceFeed__factory extends ContractFactory {
  constructor(...args: PriceFeedConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<PriceFeed> {
    return super.deploy(overrides || {}) as Promise<PriceFeed>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): PriceFeed {
    return super.attach(address) as PriceFeed;
  }
  override connect(signer: Signer): PriceFeed__factory {
    return super.connect(signer) as PriceFeed__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PriceFeedInterface {
    return new utils.Interface(_abi) as PriceFeedInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PriceFeed {
    return new Contract(address, _abi, signerOrProvider) as PriceFeed;
  }
}
