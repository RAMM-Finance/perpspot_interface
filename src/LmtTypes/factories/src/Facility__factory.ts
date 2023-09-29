/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { Facility, FacilityInterface } from "../../src/Facility";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "PremiumDeposit",
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
    name: "approveTokens",
    outputs: [],
    stateMutability: "nonpayable",
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
        internalType: "struct MarginPosition",
        name: "position",
        type: "tuple",
      },
    ],
    name: "canForceClose",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
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
    name: "depositPremium",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "trader",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "depositPremium",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "trader",
        type: "address",
      },
    ],
    name: "maxWithdrawablePremium",
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
        internalType: "address",
        name: "trader",
        type: "address",
      },
      {
        internalType: "bool",
        name: "positionIsToken0",
        type: "bool",
      },
    ],
    name: "payPremium",
    outputs: [
      {
        internalType: "uint256",
        name: "premiumOwed",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
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
    name: "positions",
    outputs: [
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
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "trader",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "reciever",
        type: "address",
      },
    ],
    name: "withdrawPremium",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class Facility__factory {
  static readonly abi = _abi;
  static createInterface(): FacilityInterface {
    return new utils.Interface(_abi) as FacilityInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Facility {
    return new Contract(address, _abi, signerOrProvider) as Facility;
  }
}
