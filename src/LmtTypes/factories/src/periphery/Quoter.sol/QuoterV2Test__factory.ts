/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  QuoterV2Test,
  QuoterV2TestInterface,
} from "../../../../src/periphery/Quoter.sol/QuoterV2Test";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_factory",
        type: "address",
      },
      {
        internalType: "address",
        name: "_WETH9",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "WETH9",
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
    name: "factory",
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
    inputs: [
      {
        internalType: "bytes",
        name: "path",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
    ],
    name: "quoteExactInput",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        internalType: "uint160[]",
        name: "sqrtPriceX96AfterList",
        type: "uint160[]",
      },
      {
        internalType: "uint32[]",
        name: "initializedTicksCrossedList",
        type: "uint32[]",
      },
      {
        internalType: "uint256",
        name: "gasEstimate",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "tokenIn",
            type: "address",
          },
          {
            internalType: "address",
            name: "tokenOut",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
        internalType: "struct IQuoterV2.QuoteExactInputSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactInputSingle",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        internalType: "uint160",
        name: "sqrtPriceX96After",
        type: "uint160",
      },
      {
        internalType: "uint32",
        name: "initializedTicksCrossed",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "gasEstimate",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "path",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
    ],
    name: "quoteExactOutput",
    outputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "uint160[]",
        name: "sqrtPriceX96AfterList",
        type: "uint160[]",
      },
      {
        internalType: "uint32[]",
        name: "initializedTicksCrossedList",
        type: "uint32[]",
      },
      {
        internalType: "uint256",
        name: "gasEstimate",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "tokenIn",
            type: "address",
          },
          {
            internalType: "address",
            name: "tokenOut",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
        internalType: "struct IQuoterV2.QuoteExactOutputSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactOutputSingle",
    outputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "uint160",
        name: "sqrtPriceX96After",
        type: "uint160",
      },
      {
        internalType: "uint32",
        name: "initializedTicksCrossed",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "gasEstimate",
        type: "uint256",
      },
    ],
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
        name: "path",
        type: "bytes",
      },
    ],
    name: "uniswapV3SwapCallback",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60c06040523480156200001157600080fd5b5060405162001d3438038062001d3483398101604081905262000034916200007f565b6001600160a01b039182166080819052911660a052600180546001600160a01b0319169091179055620000b7565b80516001600160a01b03811681146200007a57600080fd5b919050565b600080604083850312156200009357600080fd5b6200009e8362000062565b9150620000ae6020840162000062565b90509250929050565b60805160a051611c58620000dc600039600060b3015260006101380152611c586000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c8063c45a01551161005b578063c45a015514610133578063c6a5026a1461015a578063cdca17531461016d578063fa461e331461018057600080fd5b80632f80bb1d146100825780634aa4a4fc146100ae578063bd21704a146100ed575b600080fd5b61009561009036600461157e565b610195565b6040516100a594939291906115c3565b60405180910390f35b6100d57f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b0390911681526020016100a5565b6101006100fb366004611713565b61036c565b604080519485526001600160a01b03909316602085015263ffffffff9091169183019190915260608201526080016100a5565b6100d57f000000000000000000000000000000000000000000000000000000000000000081565b610100610168366004611713565b610557565b61009561017b36600461157e565b6106e3565b61019361018e366004611736565b61089c565b005b600060608060006101a5866109ed565b67ffffffffffffffff8111156101bd576101bd6114b9565b6040519080825280602002602001820160405280156101e6578160200160208202803683370190505b5092506101f2866109ed565b67ffffffffffffffff81111561020a5761020a6114b9565b604051908082528060200260200182016040528015610233578160200160208202803683370190505b50915060005b60008060006102478a610a19565b9250925092506000806000806102a36040518060a00160405280886001600160a01b03168152602001896001600160a01b031681526020018f81526020018762ffffff16815260200160006001600160a01b031681525061036c565b9350935093509350828b89815181106102be576102be611786565b60200260200101906001600160a01b031690816001600160a01b031681525050818a89815181106102f1576102f1611786565b602002602001019063ffffffff16908163ffffffff1681525050839c50808961031a91906117b2565b985087610326816117c5565b9850506103328e610a55565b15610347576103408e610a8f565b9d50610357565b8c9b505050505050505050610363565b50505050505050610239565b92959194509250565b600080600080600085602001516001600160a01b031686600001516001600160a01b031610905060006103a76001546001600160a01b031690565b905086608001516001600160a01b03166000036103c75760408701516000555b60005a9050816001600160a01b031663128acb0830856103ea8c60400151610ac0565b6103f3906117de565b60808d01516001600160a01b031615610410578c60800151610449565b8761043957610434600173fffd8963efd1fc6a506488495d951d5263988d266117fa565b610449565b6104496401000276a36001611821565b8d602001518e606001518f6000015160405160200161046a93929190611841565b6040516020818303038152906040526040518663ffffffff1660e01b81526004016104999594939291906118cc565b60408051808303816000875af19250505080156104d3575060408051601f3d908101601f191682019092526104d091810190611912565b60015b61054a573d808015610501576040519150601f19603f3d011682016040523d82523d6000602084013e610506565b606091505b505a6105129083611936565b945088608001516001600160a01b031660000361052e57600080555b610539818487610b12565b975097509750975050505050610550565b50505050505b9193509193565b600080600080600085602001516001600160a01b031686600001516001600160a01b031610905060006105926001546001600160a01b031690565b905060005a9050816001600160a01b031663128acb0830856105b78c60400151610ac0565b60808d01516001600160a01b0316156105d4578c6080015161060d565b876105fd576105f8600173fffd8963efd1fc6a506488495d951d5263988d266117fa565b61060d565b61060d6401000276a36001611821565b8d600001518e606001518f6020015160405160200161062e93929190611841565b6040516020818303038152906040526040518663ffffffff1660e01b815260040161065d9594939291906118cc565b60408051808303816000875af1925050508015610697575060408051601f3d908101601f1916820190925261069491810190611912565b60015b61054a573d8080156106c5576040519150601f19603f3d011682016040523d82523d6000602084013e6106ca565b606091505b505a6106d69083611936565b9450610539818487610b12565b600060608060006106f3866109ed565b67ffffffffffffffff81111561070b5761070b6114b9565b604051908082528060200260200182016040528015610734578160200160208202803683370190505b509250610740866109ed565b67ffffffffffffffff811115610758576107586114b9565b604051908082528060200260200182016040528015610781578160200160208202803683370190505b50915060005b60008060006107958a610a19565b9250925092506000806000806107f16040518060a00160405280896001600160a01b03168152602001886001600160a01b031681526020018f81526020018762ffffff16815260200160006001600160a01b0316815250610557565b9350935093509350828b898151811061080c5761080c611786565b60200260200101906001600160a01b031690816001600160a01b031681525050818a898151811061083f5761083f611786565b602002602001019063ffffffff16908163ffffffff1681525050839c50808961086891906117b2565b985087610874816117c5565b9850506108808e610a55565b156103475761088e8e610a8f565b9d5050505050505050610787565b60008313806108ab5750600082135b6108b457600080fd5b60008060006108c284610a19565b92509250925060008060008089136108f957856001600160a01b0316856001600160a01b031610888a6108f4906117de565b610919565b846001600160a01b0316866001600160a01b0316108989610919906117de565b92509250925060006109336001546001600160a01b031690565b9050600080826001600160a01b0316633850c7bd6040518163ffffffff1660e01b815260040160e060405180830381865afa158015610976573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061099a9190611972565b50505050509150915085156109c057604051848152826020820152816040820152606081fd5b600054156109d65760005484146109d657600080fd5b604051858152826020820152816040820152606081fd5b60006109fb600360146117b2565b60148351610a099190611936565b610a139190611a22565b92915050565b60008080610a278482610bbd565b9250610a34846014610c71565b9050610a4c610a45600360146117b2565b8590610bbd565b91509193909250565b6000610a63600360146117b2565b6014610a706003826117b2565b610a7a91906117b2565b610a8491906117b2565b825110159050919050565b6060610a13610aa0600360146117b2565b610aac600360146117b2565b8451610ab89190611936565b849190610d1c565b6000600160ff1b8210610b0e5760405162461bcd60e51b8152602060048201526011602482015270191a9b1031b0b9ba34b7339032b93937b960791b60448201526064015b60405180910390fd5b5090565b600080600080600080876001600160a01b0316633850c7bd6040518163ffffffff1660e01b815260040160e060405180830381865afa158015610b59573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b7d9190611972565b50939650610b9294508d9350610e7392505050565b91975095509050610bad6001600160a01b0389168383610f1a565b9350869250505093509350935093565b600081610bcb8160146117b2565b1015610c0e5760405162461bcd60e51b8152602060048201526012602482015271746f416464726573735f6f766572666c6f7760701b6044820152606401610b05565b610c198260146117b2565b83511015610c615760405162461bcd60e51b8152602060048201526015602482015274746f416464726573735f6f75744f66426f756e647360581b6044820152606401610b05565b500160200151600160601b900490565b600081610c7f8160036117b2565b1015610cc15760405162461bcd60e51b8152602060048201526011602482015270746f55696e7432345f6f766572666c6f7760781b6044820152606401610b05565b610ccc8260036117b2565b83511015610d135760405162461bcd60e51b8152602060048201526014602482015273746f55696e7432345f6f75744f66426f756e647360601b6044820152606401610b05565b50016003015190565b606081610d2a81601f6117b2565b1015610d695760405162461bcd60e51b815260206004820152600e60248201526d736c6963655f6f766572666c6f7760901b6044820152606401610b05565b82610d7483826117b2565b1015610db35760405162461bcd60e51b815260206004820152600e60248201526d736c6963655f6f766572666c6f7760901b6044820152606401610b05565b610dbd82846117b2565b84511015610e015760405162461bcd60e51b8152602060048201526011602482015270736c6963655f6f75744f66426f756e647360781b6044820152606401610b05565b606082158015610e205760405191506000825260208201604052610e6a565b6040519150601f8416801560200281840101858101878315602002848b0101015b81831015610e59578051835260209283019201610e41565b5050858452601f01601f1916604052505b50949350505050565b60008060008351606014610ef957604484511015610ec65760405162461bcd60e51b815260206004820152601060248201526f2ab732bc3832b1ba32b21032b93937b960811b6044820152606401610b05565b60048401935083806020019051810190610ee09190611a36565b60405162461bcd60e51b8152600401610b059190611aad565b83806020019051810190610f0d9190611ac0565b9250925092509193909250565b60008060008060008060008060088b6001600160a01b031663d0c93a7c6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610f66573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f8a9190611afe565b610f94908c611b19565b60020b901d905060006101008c6001600160a01b031663d0c93a7c6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610fde573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110029190611afe565b61100c908d611b19565b6110169190611b53565b9050600060088d6001600160a01b031663d0c93a7c6040518163ffffffff1660e01b8152600401602060405180830381865afa15801561105a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061107e9190611afe565b611088908d611b19565b60020b901d905060006101008e6001600160a01b031663d0c93a7c6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156110d2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110f69190611afe565b611100908e611b19565b61110a9190611b53565b905060008160ff166001901b8f6001600160a01b0316635339c296856040518263ffffffff1660e01b815260040161114b919060019190910b815260200190565b602060405180830381865afa158015611168573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061118c9190611b75565b1611801561120657508d6001600160a01b031663d0c93a7c6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156111d3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111f79190611afe565b611201908d611b53565b60020b155b801561121757508b60020b8d60020b135b945060008360ff166001901b8f6001600160a01b0316635339c296876040518263ffffffff1660e01b8152600401611258919060019190910b815260200190565b602060405180830381865afa158015611275573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112999190611b75565b1611801561131357508d6001600160a01b031663d0c93a7c6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156112e0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113049190611afe565b61130e908e611b53565b60020b155b801561132457508b60020b8d60020b125b95508160010b8460010b128061135057508160010b8460010b14801561135057508060ff168360ff1611155b1561136657839950829750819850809650611373565b8199508097508398508296505b505060001960ff87161b9150505b8560010b8760010b13611457578560010b8760010b036113b2576113a68460ff611b8e565b60001960ff919091161c165b60405163299ce14b60e11b8152600188900b600482015260009082906001600160a01b038e1690635339c29690602401602060405180830381865afa1580156113ff573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114239190611b75565b16905061142f8161148d565b61143d9061ffff168a611ba7565b98508761144981611bc4565b985050600019915050611381565b811561146b57611468600189611be4565b97505b821561147f5761147c600189611be4565b97505b505050505050509392505050565b6000805b8215610a1357806114a181611c01565b91506114b09050600184611936565b83169250611491565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff811182821017156114f8576114f86114b9565b604052919050565b600067ffffffffffffffff82111561151a5761151a6114b9565b50601f01601f191660200190565b600082601f83011261153957600080fd5b813561154c61154782611500565b6114cf565b81815284602083860101111561156157600080fd5b816020850160208301376000918101602001919091529392505050565b6000806040838503121561159157600080fd5b823567ffffffffffffffff8111156115a857600080fd5b6115b485828601611528565b95602094909401359450505050565b600060808201868352602060808185015281875180845260a086019150828901935060005b8181101561160d5784516001600160a01b0316835293830193918301916001016115e8565b50508481036040860152865180825290820192508187019060005b8181101561164a57825163ffffffff1685529383019391830191600101611628565b5050505060609290920192909252949350505050565b6001600160a01b038116811461167557600080fd5b50565b600060a0828403121561168a57600080fd5b60405160a0810181811067ffffffffffffffff821117156116ad576116ad6114b9565b60405290508082356116be81611660565b815260208301356116ce81611660565b602082015260408381013590820152606083013562ffffff811681146116f357600080fd5b6060820152608083013561170681611660565b6080919091015292915050565b600060a0828403121561172557600080fd5b61172f8383611678565b9392505050565b60008060006060848603121561174b57600080fd5b8335925060208401359150604084013567ffffffffffffffff81111561177057600080fd5b61177c86828701611528565b9150509250925092565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b80820180821115610a1357610a1361179c565b6000600182016117d7576117d761179c565b5060010190565b6000600160ff1b82016117f3576117f361179c565b5060000390565b6001600160a01b0382811682821603908082111561181a5761181a61179c565b5092915050565b6001600160a01b0381811683821601908082111561181a5761181a61179c565b606093841b6bffffffffffffffffffffffff19908116825260e89390931b6001600160e81b0319166014820152921b166017820152602b0190565b60005b8381101561189757818101518382015260200161187f565b50506000910152565b600081518084526118b881602086016020860161187c565b601f01601f19169290920160200192915050565b6001600160a01b0386811682528515156020830152604082018590528316606082015260a060808201819052600090611907908301846118a0565b979650505050505050565b6000806040838503121561192557600080fd5b505080516020909101519092909150565b81810381811115610a1357610a1361179c565b8051600281900b811461195b57600080fd5b919050565b805161ffff8116811461195b57600080fd5b600080600080600080600060e0888a03121561198d57600080fd5b875161199881611660565b96506119a660208901611949565b95506119b460408901611960565b94506119c260608901611960565b93506119d060808901611960565b925060a088015160ff811681146119e657600080fd5b60c089015190925080151581146119fc57600080fd5b8091505092959891949750929550565b634e487b7160e01b600052601260045260246000fd5b600082611a3157611a31611a0c565b500490565b600060208284031215611a4857600080fd5b815167ffffffffffffffff811115611a5f57600080fd5b8201601f81018413611a7057600080fd5b8051611a7e61154782611500565b818152856020838501011115611a9357600080fd5b611aa482602083016020860161187c565b95945050505050565b60208152600061172f60208301846118a0565b600080600060608486031215611ad557600080fd5b835192506020840151611ae781611660565b9150611af560408501611949565b90509250925092565b600060208284031215611b1057600080fd5b61172f82611949565b60008160020b8360020b80611b3057611b30611a0c565b627fffff19821460001982141615611b4a57611b4a61179c565b90059392505050565b60008260020b80611b6657611b66611a0c565b808360020b0791505092915050565b600060208284031215611b8757600080fd5b5051919050565b60ff8281168282160390811115610a1357610a1361179c565b63ffffffff81811683821601908082111561181a5761181a61179c565b60008160010b617fff8103611bdb57611bdb61179c565b60010192915050565b63ffffffff82811682821603908082111561181a5761181a61179c565b600061ffff808316818103611c1857611c1861179c565b600101939250505056fea26469706673582212206534ebd62b6657bed9ba1bb8b7fde8a27eea70128967a2155da466c7cc4cd36a64736f6c63430008120033";

type QuoterV2TestConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: QuoterV2TestConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class QuoterV2Test__factory extends ContractFactory {
  constructor(...args: QuoterV2TestConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _factory: PromiseOrValue<string>,
    _WETH9: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<QuoterV2Test> {
    return super.deploy(
      _factory,
      _WETH9,
      overrides || {}
    ) as Promise<QuoterV2Test>;
  }
  override getDeployTransaction(
    _factory: PromiseOrValue<string>,
    _WETH9: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_factory, _WETH9, overrides || {});
  }
  override attach(address: string): QuoterV2Test {
    return super.attach(address) as QuoterV2Test;
  }
  override connect(signer: Signer): QuoterV2Test__factory {
    return super.connect(signer) as QuoterV2Test__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): QuoterV2TestInterface {
    return new utils.Interface(_abi) as QuoterV2TestInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): QuoterV2Test {
    return new Contract(address, _abi, signerOrProvider) as QuoterV2Test;
  }
}
