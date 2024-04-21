/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  Quoter,
  QuoterInterface,
} from "../../../../src/periphery/Quoter.sol/Quoter";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_quoterV2",
        type: "address",
      },
      {
        internalType: "address",
        name: "_poolManager",
        type: "address",
      },
      {
        internalType: "address",
        name: "_dataProvider",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "getPoolKeys",
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
            internalType: "string",
            name: "symbol0",
            type: "string",
          },
          {
            internalType: "string",
            name: "symbol1",
            type: "string",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "string",
            name: "name0",
            type: "string",
          },
          {
            internalType: "string",
            name: "name1",
            type: "string",
          },
          {
            internalType: "uint8",
            name: "decimals0",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "decimals1",
            type: "uint8",
          },
          {
            internalType: "int24",
            name: "tick",
            type: "int24",
          },
          {
            internalType: "uint256",
            name: "apr",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "utilTotal",
            type: "uint256",
          },
        ],
        internalType: "struct Quoter.PoolInfo[]",
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
            name: "poolKey",
            type: "tuple",
          },
          {
            internalType: "bool",
            name: "isToken0",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "marginInInput",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "marginInOutput",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "borrowAmount",
            type: "uint256",
          },
          {
            internalType: "contract IQuoterV2",
            name: "quoter",
            type: "address",
          },
          {
            internalType: "bool",
            name: "marginInPosToken",
            type: "bool",
          },
        ],
        internalType: "struct Quoter.QuoteExactInputParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactInput",
    outputs: [
      {
        internalType: "uint256",
        name: "swapInput",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "positionOutput",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "borrowRate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "feeAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "avgPrice",
        type: "uint256",
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
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405162001d2138038062001d21833981016040819052620000349162000094565b600080546001600160a01b039485166001600160a01b031991821617909155600180549385169382169390931790925560028054919093169116179055620000de565b80516001600160a01b03811681146200008f57600080fd5b919050565b600080600060608486031215620000aa57600080fd5b620000b58462000077565b9250620000c56020850162000077565b9150620000d56040850162000077565b90509250925092565b611c3380620000ee6000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063b1b873a21461003b578063d183feee14610069575b600080fd5b61004e6100493660046110a6565b61007e565b60405161006096959493929190611105565b60405180910390f35b610071610736565b60405161006091906111c7565b600080808080606081806100996101008a0160e08b01611324565b6001600160a01b0316146100bd576100b8610100890160e08a01611324565b6100ca565b6000546001600160a01b03165b90506100d4610ff2565b600154604051632411122160e11b81526001600160a01b0390911690634822244290610104908c9060040161139d565b602060405180830381865afa158015610121573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061014591906113b1565b6080820152600154604051639525092360e01b81526001600160a01b039091169063952509239061017a908c9060040161139d565b6101c060405180830381865afa158015610198573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101bc9190611486565b60a084015260020b60208301526001600160a01b0390811682526001546080830151604051636361616560e11b8152600481019190915291169063c6c2c2ca9060240160a060405180830381865afa15801561021c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102409190611591565b505050506001600160801b031660408281019190915281518151633850c7bd60e01b815291516001600160a01b0390911691633850c7bd9160048083019260e09291908290030181865afa15801561029c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102c0919061160e565b5050506001600160a01b039093166060850152506102e99150506101208a016101008b0161169a565b1561046d57604081015161030b9060c08b013590670de0b6b3a7640000610f0f565b945061031b8560c08b01356116cd565b9750816001600160a01b031663c6a5026a6040518060a001604052808c606001602081019061034a919061169a565b6103605761035b60208e018e611324565b610370565b61037060408e0160208f01611324565b6001600160a01b0316815260200161038e60808e0160608f0161169a565b6103a7576103a260408e0160208f01611324565b6103b4565b6103b460208e018e611324565b6001600160a01b031681526020018b81526020018c60000160400160208101906103de91906116e0565b62ffffff16815260006020909101526040516001600160e01b031960e084901b16815261040e91906004016116fd565b6080604051808303816000875af115801561042d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104519190611745565b5091985061046691505060a08a013588611797565b96506105f4565b604081015161049890670de0b6b3a764000061049160c08d013560808e0135611797565b9190610f0f565b945060c08901356104ad8660808c01356116cd565b6104b79190611797565b9750816001600160a01b031663c6a5026a6040518060a001604052808c60600160208101906104e6919061169a565b6104fc576104f760208e018e611324565b61050c565b61050c60408e0160208f01611324565b6001600160a01b0316815260200161052a60808e0160608f0161169a565b6105435761053e60408e0160208f01611324565b610550565b61055060208e018e611324565b6001600160a01b031681526020018b81526020018c600001604001602081019061057a91906116e0565b62ffffff16815260006020909101526040516001600160e01b031960e084901b1681526105aa91906004016116fd565b6080604051808303816000875af11580156105c9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105ed9190611745565b5091985050505b6001546001600160a01b031663ad16ab7e8a60c081013561061b608083016060840161169a565b8b86606001516040518663ffffffff1660e01b81526004016106419594939291906117aa565b600060405180830381865afa15801561065e573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526106869190810190611808565b8251600154602085015160a086015151608087015160405163aa7532af60e01b8152969a5094985073__$eacbb88ed4bd2af84aa4d43bcf675bcf7e$__9563aa7532af956106e895946001600160a01b03169392918b91600091600401611948565b602060405180830381865af4158015610705573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061072991906113b1565b9550505091939550919395565b60606000600160009054906101000a90046001600160a01b03166001600160a01b031663d41dcbea6040518163ffffffff1660e01b8152600401600060405180830381865afa15801561078d573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526107b591908101906119dd565b90506000815167ffffffffffffffff8111156107d3576107d36113e1565b60405190808252806020026020018201604052801561088857816020015b61087560405180610180016040528060006001600160a01b0316815260200160006001600160a01b031681526020016060815260200160608152602001600062ffffff1681526020016060815260200160608152602001600060ff168152602001600060ff168152602001600060020b815260200160008152602001600081525090565b8152602001906001900390816107f15790505b50905060005b8251811015610f085760008382815181106108ab576108ab611a77565b60200260200101516001600160a01b0316630dfe16816040518163ffffffff1660e01b8152600401602060405180830381865afa1580156108f0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109149190611a8d565b9050600084838151811061092a5761092a611a77565b60200260200101516001600160a01b031663d21220a76040518163ffffffff1660e01b8152600401602060405180830381865afa15801561096f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109939190611a8d565b905060008584815181106109a9576109a9611a77565b60200260200101516001600160a01b0316633850c7bd6040518163ffffffff1660e01b815260040160e060405180830381865afa1580156109ee573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a12919061160e565b505050505091505060006040518060600160405280856001600160a01b03168152602001846001600160a01b03168152602001888781518110610a5757610a57611a77565b60200260200101516001600160a01b031663ddca3f436040518163ffffffff1660e01b8152600401602060405180830381865afa158015610a9c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ac09190611aaa565b62ffffff16905260025490915060009081906001600160a01b0316631f2ecd8384610aed6103e888611ac7565b610af9886103e8611aec565b604080516001600160e01b031960e087901b16815284516001600160a01b039081166004830152602086015116602482015293015162ffffff166044840152600291820b6064840152900b608482015260a4016040805180830381865afa158015610b68573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b8c9190611b11565b91509150604051806101800160405280876001600160a01b03168152602001866001600160a01b03168152602001876001600160a01b03166395d89b416040518163ffffffff1660e01b8152600401600060405180830381865afa158015610bf8573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610c209190810190611b35565b8152602001866001600160a01b03166395d89b416040518163ffffffff1660e01b8152600401600060405180830381865afa158015610c63573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610c8b9190810190611b35565b81526020018a8981518110610ca257610ca2611a77565b60200260200101516001600160a01b031663ddca3f436040518163ffffffff1660e01b8152600401602060405180830381865afa158015610ce7573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d0b9190611aaa565b62ffffff168152602001876001600160a01b03166306fdde036040518163ffffffff1660e01b8152600401600060405180830381865afa158015610d53573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610d7b9190810190611b35565b8152602001866001600160a01b03166306fdde036040518163ffffffff1660e01b8152600401600060405180830381865afa158015610dbe573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610de69190810190611b35565b8152602001876001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015610e29573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e4d9190611bc9565b60ff168152602001866001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015610e93573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610eb79190611bc9565b60ff1681526020018560020b815260200183815260200182815250888881518110610ee457610ee4611a77565b60200260200101819052505050505050508080610f0090611be4565b91505061088e565b5092915050565b6000808060001985870985870292508281108382030391505080600003610f485760008411610f3d57600080fd5b508290049050610feb565b808411610f845760405162461bcd60e51b815260206004820152600660248201526536bab62234bb60d11b604482015260640160405180910390fd5b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150505b9392505050565b6040805160c08101825260008082526020820181905291810182905260608101829052608081019190915260a0810161102961102e565b905290565b6040518060e001604052806110726040518060c001604052806000815260200160008152602001600081526020016000815260200160008152602001600081525090565b8152602001600081526020016000815260200160008152602001600061ffff16815260200160008152602001600081525090565b600061012082840312156110b957600080fd5b50919050565b805160020b82526001600160801b03602082015116602083015260408101516040830152606081015160608301526080810151608083015260a081015160a08301525050565b600060c0808301898452602089818601528860408601528760608601528660808601528260a086015281865180845260e087019150828801935060005b81811015611165576111558386516110bf565b9383019391850191600101611142565b50909c9b505050505050505050505050565b60005b8381101561119257818101518382015260200161117a565b50506000910152565b600081518084526111b3816020860160208601611177565b601f01601f19169290920160200192915050565b60006020808301818452808551808352604092508286019150828160051b87010184880160005b838110156112fe57888303603f19018552815180516001600160a01b03168452610180818901516001600160a01b038116868b0152508782015181898701526112398287018261119b565b91505060608083015186830382880152611253838261119b565b9250505060808083015161126d8288018262ffffff169052565b505060a08083015186830382880152611286838261119b565b9250505060c080830151868303828801526112a1838261119b565b9250505060e0808301516112b98288018260ff169052565b50506101008281015160ff16908601526101208083015160020b90860152610140808301519086015261016091820151919094015293860193908601906001016111ee565b509098975050505050505050565b6001600160a01b038116811461132157600080fd5b50565b60006020828403121561133657600080fd5b8135610feb8161130c565b62ffffff8116811461132157600080fd5b803561135d8161130c565b6001600160a01b0390811683526020820135906113798261130c565b166020830152604081013561138d81611341565b62ffffff81166040840152505050565b606081016113ab8284611352565b92915050565b6000602082840312156113c357600080fd5b5051919050565b8051600281900b81146113dc57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b60405160e0810167ffffffffffffffff8111828210171561141a5761141a6113e1565b60405290565b60405160c0810167ffffffffffffffff8111828210171561141a5761141a6113e1565b604051601f8201601f1916810167ffffffffffffffff8111828210171561146c5761146c6113e1565b604052919050565b805161ffff811681146113dc57600080fd5b60008060008385036101c081121561149d57600080fd5b84516114a88161130c565b93506114b6602086016113ca565b9250603f1901610180808212156114cc57600080fd5b6114d46113f7565b60c08312156114e257600080fd5b6114ea611420565b925060408701518352606087015160208401526080870151604084015260a0870151606084015260c0870151608084015260e087015160a08401528281526101008701516020820152610120870151604082015261014087015160608201526115566101608801611474565b60808201529086015160a08201526101a09095015160c08601525091949093509050565b80516001600160801b03811681146113dc57600080fd5b600080600080600060a086880312156115a957600080fd5b6115b28661157a565b94506115c06020870161157a565b93506115ce6040870161157a565b92506115dc6060870161157a565b9150608086015190509295509295909350565b805160ff811681146113dc57600080fd5b801515811461132157600080fd5b600080600080600080600060e0888a03121561162957600080fd5b87516116348161130c565b9650611642602089016113ca565b955061165060408901611474565b945061165e60608901611474565b935061166c60808901611474565b925061167a60a089016115ef565b915060c088015161168a81611600565b8091505092959891949750929550565b6000602082840312156116ac57600080fd5b8135610feb81611600565b634e487b7160e01b600052601160045260246000fd5b818103818111156113ab576113ab6116b7565b6000602082840312156116f257600080fd5b8135610feb81611341565b81516001600160a01b0390811682526020808401518216908301526040808401519083015260608084015162ffffff1690830152608092830151169181019190915260a00190565b6000806000806080858703121561175b57600080fd5b84519350602085015161176d8161130c565b604086015190935063ffffffff8116811461178757600080fd5b6060959095015193969295505050565b808201808211156113ab576113ab6116b7565b60e081016117b88288611352565b6060820195909552921515608084015260a08301919091526001600160a01b031660c090910152919050565b600067ffffffffffffffff8211156117fe576117fe6113e1565b5060051b60200190565b600080604080848603121561181c57600080fd5b8351925060208085015167ffffffffffffffff81111561183b57600080fd5b8501601f8101871361184c57600080fd5b805161185f61185a826117e4565b611443565b81815260c0918202830184019184820191908a84111561187e57600080fd5b938501935b838510156118f25780858c03121561189b5760008081fd5b6118a3611420565b6118ac866113ca565b81526118b987870161157a565b818801528588015188820152606080870151908201526080808701519082015260a0808701519082015283529384019391850191611883565b508096505050505050509250929050565b600081518084526020808501945080840160005b8381101561193d5761192a8783516110bf565b60c0969096019590820190600101611917565b509495945050505050565b600061018060018060a01b03808b168452808a166020850152508760020b60408401528651606084015260208701516080840152604087015160a0840152606087015160c0840152608087015160e084015260a0870151610100840152806101208401526119b881840187611903565b9150506119ca61014083018515159052565b8261016083015298975050505050505050565b600060208083850312156119f057600080fd5b825167ffffffffffffffff811115611a0757600080fd5b8301601f81018513611a1857600080fd5b8051611a2661185a826117e4565b81815260059190911b82018301908381019087831115611a4557600080fd5b928401925b82841015611a6c578351611a5d8161130c565b82529284019290840190611a4a565b979650505050505050565b634e487b7160e01b600052603260045260246000fd5b600060208284031215611a9f57600080fd5b8151610feb8161130c565b600060208284031215611abc57600080fd5b8151610feb81611341565b600282810b9082900b03627fffff198112627fffff821317156113ab576113ab6116b7565b600281810b9083900b01627fffff8113627fffff19821217156113ab576113ab6116b7565b60008060408385031215611b2457600080fd5b505080516020909101519092909150565b600060208284031215611b4757600080fd5b815167ffffffffffffffff80821115611b5f57600080fd5b818401915084601f830112611b7357600080fd5b815181811115611b8557611b856113e1565b611b98601f8201601f1916602001611443565b9150808252856020828501011115611baf57600080fd5b611bc0816020840160208601611177565b50949350505050565b600060208284031215611bdb57600080fd5b610feb826115ef565b600060018201611bf657611bf66116b7565b506001019056fea26469706673582212208da54e1f2681736a9071b5ebaafa81e3fcad70fffc0580af42ce46cd744f19d264736f6c63430008120033";

type QuoterConstructorParams =
  | [linkLibraryAddresses: QuoterLibraryAddresses, signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: QuoterConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => {
  return (
    typeof xs[0] === "string" ||
    (Array.isArray as (arg: any) => arg is readonly any[])(xs[0]) ||
    "_isInterface" in xs[0]
  );
};

export class Quoter__factory extends ContractFactory {
  constructor(...args: QuoterConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      const [linkLibraryAddresses, signer] = args;
      super(_abi, Quoter__factory.linkBytecode(linkLibraryAddresses), signer);
    }
  }

  static linkBytecode(linkLibraryAddresses: QuoterLibraryAddresses): string {
    let linkedBytecode = _bytecode;

    linkedBytecode = linkedBytecode.replace(
      new RegExp("__\\$eacbb88ed4bd2af84aa4d43bcf675bcf7e\\$__", "g"),
      linkLibraryAddresses["src/PremiumComputer.sol:PremiumComputer"]
        .replace(/^0x/, "")
        .toLowerCase()
    );

    return linkedBytecode;
  }

  override deploy(
    _quoterV2: PromiseOrValue<string>,
    _poolManager: PromiseOrValue<string>,
    _dataProvider: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Quoter> {
    return super.deploy(
      _quoterV2,
      _poolManager,
      _dataProvider,
      overrides || {}
    ) as Promise<Quoter>;
  }
  override getDeployTransaction(
    _quoterV2: PromiseOrValue<string>,
    _poolManager: PromiseOrValue<string>,
    _dataProvider: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _quoterV2,
      _poolManager,
      _dataProvider,
      overrides || {}
    );
  }
  override attach(address: string): Quoter {
    return super.attach(address) as Quoter;
  }
  override connect(signer: Signer): Quoter__factory {
    return super.connect(signer) as Quoter__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): QuoterInterface {
    return new utils.Interface(_abi) as QuoterInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Quoter {
    return new Contract(address, _abi, signerOrProvider) as Quoter;
  }
}

export interface QuoterLibraryAddresses {
  ["src/PremiumComputer.sol:PremiumComputer"]: string;
}
