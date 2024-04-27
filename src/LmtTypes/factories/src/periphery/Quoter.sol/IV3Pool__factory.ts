/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IV3Pool,
  IV3PoolInterface,
} from "../../../../src/periphery/Quoter.sol/IV3Pool";

const _abi = [
  {
    inputs: [],
    name: "slot0",
    outputs: [
      {
        internalType: "uint160",
        name: "sqrtPriceX96",
        type: "uint160",
      },
      {
        internalType: "int24",
        name: "tick",
        type: "int24",
      },
      {
        internalType: "uint16",
        name: "observationIndex",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "observationCardinality",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "observationCardinalityNext",
        type: "uint16",
      },
      {
        internalType: "bool",
        name: "unlocked",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class IV3Pool__factory {
  static readonly abi = _abi;
  static createInterface(): IV3PoolInterface {
    return new utils.Interface(_abi) as IV3PoolInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IV3Pool {
    return new Contract(address, _abi, signerOrProvider) as IV3Pool;
  }
}
