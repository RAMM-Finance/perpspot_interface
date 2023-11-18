/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { Facility, FacilityInterface } from "../../src/Facility";

const _abi = [
  {
    inputs: [],
    name: "exceedMaxWithdrawablePremium",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "pool",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isToken1",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "PremiumDeposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "withdrawer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "pool",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isToken1",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "PremiumWithdrawn",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "PositionId",
        name: "",
        type: "bytes32",
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
        name: "pool",
        type: "address",
      },
      {
        internalType: "address",
        name: "borrower",
        type: "address",
      },
      {
        internalType: "bool",
        name: "borrowedToken1",
        type: "bool",
      },
    ],
    name: "checkPositionExists",
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
        name: "pool",
        type: "address",
      },
      {
        internalType: "address",
        name: "borrower",
        type: "address",
      },
      {
        internalType: "bool",
        name: "borrowedToken1",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "minPremiumDepositPercentage",
        type: "uint256",
      },
    ],
    name: "checkPremiumCondition",
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
        name: "borrowToken1",
        type: "bool",
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
        name: "pool",
        type: "address",
      },
      {
        internalType: "address",
        name: "borrower",
        type: "address",
      },
      {
        internalType: "bool",
        name: "borrowedToken1",
        type: "bool",
      },
    ],
    name: "getBorrowInfo",
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
        name: "borrower",
        type: "address",
      },
      {
        internalType: "bool",
        name: "borrowedToken1",
        type: "bool",
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
        internalType: "PositionId",
        name: "positionId",
        type: "bytes32",
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
        internalType: "bool",
        name: "payToken1",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "depositAmount",
        type: "uint256",
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
        internalType: "bool",
        name: "addPaused",
        type: "bool",
      },
    ],
    name: "setAddPaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "forceClosePaused",
        type: "bool",
      },
    ],
    name: "setForceClosePaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "setOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "reducePaused",
        type: "bool",
      },
    ],
    name: "setReducePaused",
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
        internalType: "bool",
        name: "borrowToken1",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
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
