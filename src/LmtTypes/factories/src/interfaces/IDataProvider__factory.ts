/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IDataProvider,
  IDataProviderInterface,
} from "../../../src/interfaces/IDataProvider";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "trader",
        type: "address",
      },
    ],
    name: "getActiveMarginPositions",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "pool",
                type: "address",
              },
              {
                internalType: "bool",
                name: "underAuction",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "isToken0",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "totalDebtOutput",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalDebtInput",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "recentPremium",
                type: "uint256",
              },
              {
                internalType: "uint32",
                name: "openTime",
                type: "uint32",
              },
              {
                internalType: "uint32",
                name: "repayTime",
                type: "uint32",
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
                name: "borrowInfo",
                type: "tuple[]",
              },
            ],
            internalType: "struct Position",
            name: "base",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "totalPosition",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "margin",
            type: "uint256",
          },
        ],
        internalType: "struct MarginPosition[]",
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
        internalType: "address",
        name: "trader",
        type: "address",
      },
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    name: "getManagedLiquidityPositions",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "totalFeeGrowthInside0LastX128",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalFeeGrowthInside1LastX128",
            type: "uint256",
          },
          {
            internalType: "uint128",
            name: "amount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "tokensOwed0",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "tokensOwed1",
            type: "uint128",
          },
        ],
        internalType: "struct UniswapPosition[]",
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
        internalType: "address",
        name: "trader",
        type: "address",
      },
      {
        internalType: "address",
        name: "facility",
        type: "address",
      },
    ],
    name: "getPremiumDeposits",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        internalType: "struct IDataProvider.PremiumDeposit[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class IDataProvider__factory {
  static readonly abi = _abi;
  static createInterface(): IDataProviderInterface {
    return new utils.Interface(_abi) as IDataProviderInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IDataProvider {
    return new Contract(address, _abi, signerOrProvider) as IDataProvider;
  }
}
