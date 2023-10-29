/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  PremiumComputer,
  PremiumComputerInterface,
} from "../../src/PremiumComputer";

const _abi = [
  {
    inputs: [],
    name: "T",
    type: "error",
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
        name: "poolManager",
        type: "address",
      },
      {
        internalType: "bool",
        name: "borrowToken0",
        type: "bool",
      },
      {
        internalType: "int24",
        name: "tickDiscretization",
        type: "int24",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "pivotRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "slope1",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "intercept1",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "slope2",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "intercept2",
            type: "uint256",
          },
        ],
        internalType: "struct URateParam",
        name: "param",
        type: "tuple",
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
    name: "computePremium",
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
        name: "",
        type: "tuple[]",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
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
        name: "pool",
        type: "address",
      },
      {
        internalType: "int24",
        name: "tickDiscretization",
        type: "int24",
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
    name: "getInitFeeGrowthInside",
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
            internalType: "uint256",
            name: "pivotRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "slope1",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "intercept1",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "slope2",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "intercept2",
            type: "uint256",
          },
        ],
        internalType: "struct URateParam",
        name: "param",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "uRate",
        type: "uint256",
      },
    ],
    name: "getInterestRate",
    outputs: [
      {
        internalType: "uint256",
        name: "ratePerSecond",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x6113c361003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe730000000000000000000000000000000000000000301460806040526004361061004b5760003560e01c80630d527ba91461005057806317b474bf1461007b578063ea0531cc1461009c575b600080fd5b61006361005e366004611007565b6100bc565b60405161007293929190611125565b60405180910390f35b61008e61008936600461114a565b6106c4565b604051908152602001610072565b6100af6100aa366004611175565b61072e565b60405161007291906111d3565b606060008061010960405180610100016040528060008152602001600081526020016000815260200160008152602001600081526020016000815260200160008152602001600081525090565b60008060005b87518110156106b05773__$d23a8dd93b7205fa6b646ffed38c165d68$__639887b5898e8a8481518110610145576101456111e6565b6020026020010151600001518d8c8681518110610164576101646111e6565b60200260200101516000015161017a9190611212565b6040516001600160e01b031960e086901b1681526001600160a01b039093166004840152600291820b6024840152900b60448201526064016040805180830381865af41580156101ce573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101f29190611237565b6020860152845287516001600160a01b038d16906304ad52fc908f908b9085908110610220576102206111e6565b60209081029190910181015151604080516001600160e01b031960e087901b1681526001600160a01b03909416600485015260029190910b60248401528d516044840152908d015160648301528c0151608482015260608c015160a482015260808c015160c482015260e401602060405180830381865afa1580156102a9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102cd919061125b565b8460e0018181525050610320604051806040016040528060068152602001650cee4deeee8d60d31b8152508560e001518a848151811061030f5761030f6111e6565b602002602001015160c00151610886565b670de0b6b3a764000088828151811061033b5761033b6111e6565b602002602001015160c001518560e001516103569190611274565b6103609190611274565b60c085019081526040805180820190915260088152671a5b9d195c995cdd60c21b6020820152905161039291906108d2565b670de0b6b3a76400008460e001516103aa9190611274565b8882815181106103bc576103bc6111e6565b602002602001015160c001818152505061042f8882815181106103e1576103e16111e6565b6020026020010151602001516001600160801b0316600160801b8a848151811061040d5761040d6111e6565b60200260200101516080015187600001516104289190611274565b919061091b565b608085015287516104939089908390811061044c5761044c6111e6565b6020026020010151602001516001600160801b0316600160801b8a8481518110610478576104786111e6565b602002602001015160a0015187602001516104289190611274565b60a085015260808401516040850180516104ae908390611287565b90525060a08401516060850180516104c7908390611287565b905250835188518990839081106104e0576104e06111e6565b602002602001015160800181815250508360200151888281518110610507576105076111e6565b602002602001015160a00181815250508a6105fb576105c2610545898381518110610534576105346111e6565b6020026020010151600001516109fd565b6105768c8b858151811061055b5761055b6111e6565b6020026020010151600001516105719190611212565b6109fd565b6105bd8b858151811061058b5761058b6111e6565b6020026020010151602001516001600160801b0316670de0b6b3a76400008960c0015161091b9092919063ffffffff16565b610d20565b60c0850181905260a08501516105d89190611287565b6105e29084611287565b92508360800151826105f49190611287565b9150610678565b610643610613898381518110610534576105346111e6565b6106298c8b858151811061055b5761055b6111e6565b61063e8b858151811061058b5761058b6111e6565b610d72565b60c0850181905260808501516106599190611287565b6106639084611287565b92508360a00151826106759190611287565b91505b8360c0015188828151811061068f5761068f6111e6565b602090810291909101015160400152806106a88161129a565b91505061010f565b50959b909a50949850939650505050505050565b81516000908210156106fe57604083015160208401516106ed9084670de0b6b3a764000061091b565b6106f79190611287565b9050610728565b6080830151606084015161071b9084670de0b6b3a764000061091b565b6107259190611287565b90505b92915050565b606060008060005b84518110156108785773__$d23a8dd93b7205fa6b646ffed38c165d68$__639887b5898887848151811061076c5761076c6111e6565b6020026020010151600001518989868151811061078b5761078b6111e6565b6020026020010151600001516107a19190611212565b6040516001600160e01b031960e086901b1681526001600160a01b039093166004840152600291820b6024840152900b60448201526064016040805180830381865af41580156107f5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108199190611237565b809350819450505082858281518110610834576108346111e6565b6020026020010151608001818152505081858281518110610857576108576111e6565b602090810291909101015160a00152806108708161129a565b915050610736565b5083925050505b9392505050565b6108cd83838360405160240161089e939291906112f9565b60408051601f198184030181529190526020810180516001600160e01b031663969cdd0360e01b179052610de5565b505050565b61091782826040516024016108e892919061130c565b60408051601f198184030181529190526020810180516001600160e01b03166309710a9d60e41b179052610de5565b5050565b6000808060001985870985870292508281108382030391505080600003610954576000841161094957600080fd5b50829004905061087f565b8084116109905760405162461bcd60e51b815260206004820152600660248201526536bab62234bb60d11b604482015260640160405180910390fd5b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150509392505050565b60008060008360020b12610a14578260020b610a1c565b8260020b6000035b9050620d89e8811115610a42576040516315e4079d60e11b815260040160405180910390fd5b600081600116600003610a5957600160801b610a6b565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff1690506002821615610a9f576ffff97272373d413259a46990580e213a0260801c5b6004821615610abe576ffff2e50f5f656932ef12357cf3c7fdcc0260801c5b6008821615610add576fffe5caca7e10e4e61c3624eaa0941cd00260801c5b6010821615610afc576fffcb9843d60f6159c9db58835c9266440260801c5b6020821615610b1b576fff973b41fa98c081472e6896dfb254c00260801c5b6040821615610b3a576fff2ea16466c96a3843ec78b326b528610260801c5b6080821615610b59576ffe5dee046a99a2a811c461f1969c30530260801c5b610100821615610b79576ffcbe86c7900a88aedcffc83b479aa3a40260801c5b610200821615610b99576ff987a7253ac413176f2b074cf7815e540260801c5b610400821615610bb9576ff3392b0822b70005940c7a398e4b70f30260801c5b610800821615610bd9576fe7159475a2c29b7443b29c7fa6e889d90260801c5b611000821615610bf9576fd097f3bdfd2022b8845ad8f792aa58250260801c5b612000821615610c19576fa9f746462d870fdf8a65dc1f90e061e50260801c5b614000821615610c39576f70d869a156d2a1b890bb3df62baf32f70260801c5b618000821615610c59576f31be135f97d08fd981231505542fcfa60260801c5b62010000821615610c7a576f09aa508b5b7a84e1c677de54f3e99bc90260801c5b62020000821615610c9a576e5d6af8dedb81196699c329225ee6040260801c5b62040000821615610cb9576d2216e584f5fa1ea926041bedfe980260801c5b62080000821615610cd6576b048a170391f7dc42444e8fa20260801c5b60008460020b1315610cf7578060001981610cf357610cf361132e565b0490505b640100000000810615610d0b576001610d0e565b60005b60ff16602082901c0192505050919050565b6000826001600160a01b0316846001600160a01b03161115610d40579192915b610d6a6001600160801b038316610d578686611344565b6001600160a01b0316600160601b61091b565b949350505050565b6000826001600160a01b0316846001600160a01b03161115610d92579192915b6001600160a01b038416610ddb6fffffffffffffffffffffffffffffffff60601b606085901b16610dc38787611344565b6001600160a01b0316866001600160a01b031661091b565b610d6a919061136b565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b80356001600160a01b0381168114610e1d57600080fd5b919050565b8035600281900b8114610e1d57600080fd5b634e487b7160e01b600052604160045260246000fd5b60405160e0810167ffffffffffffffff81118282101715610e6d57610e6d610e34565b60405290565b604051601f8201601f1916810167ffffffffffffffff81118282101715610e9c57610e9c610e34565b604052919050565b600060a08284031215610eb657600080fd5b60405160a0810181811067ffffffffffffffff82111715610ed957610ed9610e34565b806040525080915082358152602083013560208201526040830135604082015260608301356060820152608083013560808201525092915050565b600082601f830112610f2557600080fd5b8135602067ffffffffffffffff821115610f4157610f41610e34565b610f4f818360051b01610e73565b82815260e09283028501820192828201919087851115610f6e57600080fd5b8387015b85811015610ffa5781818a031215610f8a5760008081fd5b610f92610e4a565b610f9b82610e22565b8152858201356001600160801b0381168114610fb75760008081fd5b8187015260408281013590820152606080830135908201526080808301359082015260a0808301359082015260c080830135908201528452928401928101610f72565b5090979650505050505050565b600080600080600080610140878903121561102157600080fd5b61102a87610e06565b955061103860208801610e06565b94506040870135801515811461104d57600080fd5b935061105b60608801610e22565b925061106a8860808901610ea4565b915061012087013567ffffffffffffffff81111561108757600080fd5b61109389828a01610f14565b9150509295509295509295565b600081518084526020808501945080840160005b8381101561111a578151805160020b8852838101516001600160801b03168489015260408082015190890152606080820151908901526080808201519089015260a0808201519089015260c0908101519088015260e090960195908201906001016110b4565b509495945050505050565b60608152600061113860608301866110a0565b60208301949094525060400152919050565b60008060c0838503121561115d57600080fd5b6111678484610ea4565b9460a0939093013593505050565b60008060006060848603121561118a57600080fd5b61119384610e06565b92506111a160208501610e22565b9150604084013567ffffffffffffffff8111156111bd57600080fd5b6111c986828701610f14565b9150509250925092565b60208152600061072560208301846110a0565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600281810b9083900b01627fffff8113627fffff1982121715610728576107286111fc565b6000806040838503121561124a57600080fd5b505080516020909101519092909150565b60006020828403121561126d57600080fd5b5051919050565b81810381811115610728576107286111fc565b80820180821115610728576107286111fc565b6000600182016112ac576112ac6111fc565b5060010190565b6000815180845260005b818110156112d9576020818501810151868301820152016112bd565b506000602082860101526020601f19601f83011685010191505092915050565b60608152600061113860608301866112b3565b60408152600061131f60408301856112b3565b90508260208301529392505050565b634e487b7160e01b600052601260045260246000fd5b6001600160a01b03828116828216039080821115611364576113646111fc565b5092915050565b60008261138857634e487b7160e01b600052601260045260246000fd5b50049056fea26469706673582212205de88b2f4786fb45f7f5b6b4845a456a714f1e4a987410b5b1385c597fae07a064736f6c63430008120033";

type PremiumComputerConstructorParams =
  | [linkLibraryAddresses: PremiumComputerLibraryAddresses, signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PremiumComputerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => {
  return (
    typeof xs[0] === "string" ||
    (Array.isArray as (arg: any) => arg is readonly any[])(xs[0]) ||
    "_isInterface" in xs[0]
  );
};

export class PremiumComputer__factory extends ContractFactory {
  constructor(...args: PremiumComputerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      const [linkLibraryAddresses, signer] = args;
      super(
        _abi,
        PremiumComputer__factory.linkBytecode(linkLibraryAddresses),
        signer
      );
    }
  }

  static linkBytecode(
    linkLibraryAddresses: PremiumComputerLibraryAddresses
  ): string {
    let linkedBytecode = _bytecode;

    linkedBytecode = linkedBytecode.replace(
      new RegExp("__\\$d23a8dd93b7205fa6b646ffed38c165d68\\$__", "g"),
      linkLibraryAddresses["src/Util.sol:Utils"]
        .replace(/^0x/, "")
        .toLowerCase()
    );

    return linkedBytecode;
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<PremiumComputer> {
    return super.deploy(overrides || {}) as Promise<PremiumComputer>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): PremiumComputer {
    return super.attach(address) as PremiumComputer;
  }
  override connect(signer: Signer): PremiumComputer__factory {
    return super.connect(signer) as PremiumComputer__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PremiumComputerInterface {
    return new utils.Interface(_abi) as PremiumComputerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PremiumComputer {
    return new Contract(address, _abi, signerOrProvider) as PremiumComputer;
  }
}

export interface PremiumComputerLibraryAddresses {
  ["src/Util.sol:Utils"]: string;
}
