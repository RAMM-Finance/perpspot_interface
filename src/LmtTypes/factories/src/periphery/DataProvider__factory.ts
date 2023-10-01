/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  DataProvider,
  DataProviderInterface,
} from "../../../src/periphery/DataProvider";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "poolManager",
        type: "address",
      },
      {
        internalType: "address",
        name: "marginFacility",
        type: "address",
      },
      {
        internalType: "address",
        name: "borrowFacility",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
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
        name: "pool",
        type: "address",
      },
    ],
    name: "getPoolkeys",
    outputs: [
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

const _bytecode =
  "0x608060405234801561001057600080fd5b5060405161128138038061128183398101604081905261002f9161008b565b600080546001600160a01b03199081166001600160a01b0394851617909155600180548216948416949094179093556002805490931691161790556100ce565b80516001600160a01b038116811461008657600080fd5b919050565b6000806000606084860312156100a057600080fd5b6100a98461006f565b92506100b76020850161006f565b91506100c56040850161006f565b90509250925092565b6111a4806100dd6000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c8063be18810214610051578063c229a3321461007d578063dd65c328146100bb578063f7b3dab2146100db575b600080fd5b61006761005f366004610a1e565b606092915050565b6040516100749190610a57565b60405180910390f35b61009061008b366004610ad3565b6100fb565b604080516001600160a01b03948516815293909216602084015262ffffff1690820152606001610074565b6100ce6100c9366004610ad3565b610233565b6040516100749190610b7c565b6100ee6100e9366004610a1e565b610611565b6040516100749190610c99565b6000806000836001600160a01b0316630dfe16816040518163ffffffff1660e01b8152600401602060405180830381865afa15801561013e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101629190610cf4565b846001600160a01b031663d21220a76040518163ffffffff1660e01b8152600401602060405180830381865afa1580156101a0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101c49190610cf4565b856001600160a01b031663ddca3f436040518163ffffffff1660e01b8152600401602060405180830381865afa158015610202573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102269190610d11565b9196909550909350915050565b60606000600160009054906101000a90046001600160a01b03166001600160a01b031663d41dcbea6040518163ffffffff1660e01b8152600401600060405180830381865afa15801561028a573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526102b29190810190610e11565b90506000815160026102c49190610ec6565b905060008167ffffffffffffffff8111156102e1576102e1610d36565b60405190808252806020026020018201604052801561031a57816020015b61030761099f565b8152602001906001900390816102ff5790505b5090506000805b8451811015610547576000805486516001600160a01b0390911690638c1395f89088908590811061035457610354610edd565b60209081029190910101516040516001600160e01b031960e084901b1681526001600160a01b039182166004820152908b16602482015260006044820152606401600060405180830381865afa1580156103b2573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526103da9190810190611001565b905060008060009054906101000a90046001600160a01b03166001600160a01b0316638c1395f888858151811061041357610413610edd565b60209081029190910101516040516001600160e01b031960e084901b1681526001600160a01b039182166004820152908c16602482015260016044820152606401600060405180830381865afa158015610471573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526104999190810190611001565b805160c0015190915063ffffffff16156104d95780856104b98686611129565b815181106104c9576104c9610edd565b60200260200101819052506104e7565b836104e38161113c565b9450505b815160c0015163ffffffff16156105245781856105048686611129565b8151811061051457610514610edd565b6020026020010181905250610532565b8361052e8161113c565b9450505b5050808061053f9061113c565b915050610321565b5060006105548285611129565b67ffffffffffffffff81111561056c5761056c610d36565b6040519080825280602002602001820160405280156105a557816020015b61059261099f565b81526020019060019003908161058a5790505b50905060005b6105b58386611129565b811015610606578381815181106105ce576105ce610edd565b60200260200101518282815181106105e8576105e8610edd565b602002602001018190525080806105fe9061113c565b9150506105ab565b509695505050505050565b60606000600160009054906101000a90046001600160a01b03166001600160a01b031663273cbaa06040518163ffffffff1660e01b8152600401600060405180830381865afa158015610668573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526106909190810190610e11565b805190915060008167ffffffffffffffff8111156106b0576106b0610d36565b6040519080825280602002602001820160405280156106f557816020015b60408051808201909152600080825260208201528152602001906001900390816106ce5790505b5090506000805b838110156108c6576000876001600160a01b0316639ff5b2dc87848151811061072757610727610edd565b60200260200101518b6040518363ffffffff1660e01b81526004016107629291906001600160a01b0392831681529116602082015260400190565b602060405180830381865afa15801561077f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107a39190611155565b11156108a65760405180604001604052808683815181106107c6576107c6610edd565b60200260200101516001600160a01b03168152602001886001600160a01b0316639ff5b2dc8885815181106107fd576107fd610edd565b60200260200101518c6040518363ffffffff1660e01b81526004016108389291906001600160a01b0392831681529116602082015260400190565b602060405180830381865afa158015610855573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108799190611155565b9052836108868484611129565b8151811061089657610896610edd565b60200260200101819052506108b4565b816108b08161113c565b9250505b806108be8161113c565b9150506106fc565b5060006108d38285611129565b67ffffffffffffffff8111156108eb576108eb610d36565b60405190808252806020026020018201604052801561093057816020015b60408051808201909152600080825260208201528152602001906001900390816109095790505b50905060005b6109408386611129565b8110156109915783818151811061095957610959610edd565b602002602001015182828151811061097357610973610edd565b602002602001018190525080806109899061113c565b915050610936565b509450505050505b92915050565b604080516101808101909152600060608083018281526080840183905260a0840183905260c0840183905260e08401839052610100840183905261012084018390526101408401929092526101608301528190815260200160008152602001600081525090565b6001600160a01b0381168114610a1b57600080fd5b50565b60008060408385031215610a3157600080fd5b8235610a3c81610a06565b91506020830135610a4c81610a06565b809150509250929050565b602080825282518282018190526000919060409081850190868401855b82811015610ac6578151805185528681015187860152858101516001600160801b0390811687870152606080830151821690870152608091820151169085015260a09093019290850190600101610a74565b5091979650505050505050565b600060208284031215610ae557600080fd5b8135610af081610a06565b9392505050565b600081518084526020808501945080840160005b83811015610b71578151805160020b8852838101516001600160801b03168489015260408082015190890152606080820151908901526080808201519089015260a0808201519089015260c0908101519088015260e09096019590820190600101610b0b565b509495945050505050565b60006020808301818452808551808352604092508286019150828160051b87010184880160005b83811015610c8b57888303603f1901855281518051606080865281516001600160a01b03168187015290898101516080610be08189018315159052565b8a830151915060a0610bf5818a018415159052565b9383015160c0898101919091529083015160e0808a019190915293830151610100808a01919091529083015193610120925090610c39838a018663ffffffff169052565b9083015163ffffffff16610140890152909101516101608701919091529050610c66610180860182610af7565b828a0151868b0152918801519488019490945294870194925090860190600101610ba3565b509098975050505050505050565b602080825282518282018190526000919060409081850190868401855b82811015610ac657815180516001600160a01b03168552860151868501529284019290850190600101610cb6565b8051610cef81610a06565b919050565b600060208284031215610d0657600080fd5b8151610af081610a06565b600060208284031215610d2357600080fd5b815162ffffff81168114610af057600080fd5b634e487b7160e01b600052604160045260246000fd5b60405160e0810167ffffffffffffffff81118282101715610d6f57610d6f610d36565b60405290565b6040516060810167ffffffffffffffff81118282101715610d6f57610d6f610d36565b604051610120810167ffffffffffffffff81118282101715610d6f57610d6f610d36565b604051601f8201601f1916810167ffffffffffffffff81118282101715610de557610de5610d36565b604052919050565b600067ffffffffffffffff821115610e0757610e07610d36565b5060051b60200190565b60006020808385031215610e2457600080fd5b825167ffffffffffffffff811115610e3b57600080fd5b8301601f81018513610e4c57600080fd5b8051610e5f610e5a82610ded565b610dbc565b81815260059190911b82018301908381019087831115610e7e57600080fd5b928401925b82841015610ea5578351610e9681610a06565b82529284019290840190610e83565b979650505050505050565b634e487b7160e01b600052601160045260246000fd5b808202811582820484141761099957610999610eb0565b634e487b7160e01b600052603260045260246000fd5b80518015158114610cef57600080fd5b805163ffffffff81168114610cef57600080fd5b80516001600160801b0381168114610cef57600080fd5b600082601f830112610f3f57600080fd5b81516020610f4f610e5a83610ded565b82815260e09283028501820192828201919087851115610f6e57600080fd5b8387015b85811015610ff45781818a031215610f8a5760008081fd5b610f92610d4c565b81518060020b8114610fa45760008081fd5b8152610fb1828701610f17565b8187015260408281015190820152606080830151908201526080808301519082015260a0808301519082015260c080830151908201528452928401928101610f72565b5090979650505050505050565b60006020828403121561101357600080fd5b815167ffffffffffffffff8082111561102b57600080fd5b908301906060828603121561103f57600080fd5b611047610d75565b82518281111561105657600080fd5b8301610120818803121561106957600080fd5b611071610d98565b61107a82610ce4565b815261108860208301610ef3565b602082015261109960408301610ef3565b6040820152606082015160608201526080820151608082015260a082015160a08201526110c860c08301610f03565b60c08201526110d960e08301610f03565b60e082015261010080830151858111156110f257600080fd5b6110fe8a828601610f2e565b8284015250508083525050602083015160208201526040830151604082015280935050505092915050565b8181038181111561099957610999610eb0565b60006001820161114e5761114e610eb0565b5060010190565b60006020828403121561116757600080fd5b505191905056fea26469706673582212201e8a8c4969f1292cca30998e35aed762e4f9568d8890c71d8b65ec6950cdca4764736f6c63430008120033";

type DataProviderConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DataProviderConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DataProvider__factory extends ContractFactory {
  constructor(...args: DataProviderConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    poolManager: PromiseOrValue<string>,
    marginFacility: PromiseOrValue<string>,
    borrowFacility: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<DataProvider> {
    return super.deploy(
      poolManager,
      marginFacility,
      borrowFacility,
      overrides || {}
    ) as Promise<DataProvider>;
  }
  override getDeployTransaction(
    poolManager: PromiseOrValue<string>,
    marginFacility: PromiseOrValue<string>,
    borrowFacility: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      poolManager,
      marginFacility,
      borrowFacility,
      overrides || {}
    );
  }
  override attach(address: string): DataProvider {
    return super.attach(address) as DataProvider;
  }
  override connect(signer: Signer): DataProvider__factory {
    return super.connect(signer) as DataProvider__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DataProviderInterface {
    return new utils.Interface(_abi) as DataProviderInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DataProvider {
    return new Contract(address, _abi, signerOrProvider) as DataProvider;
  }
}
