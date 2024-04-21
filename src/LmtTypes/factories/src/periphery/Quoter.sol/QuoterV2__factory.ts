/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  QuoterV2,
  QuoterV2Interface,
} from "../../../../src/periphery/Quoter.sol/QuoterV2";

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
  "0x60c06040523480156200001157600080fd5b5060405162001e9c38038062001e9c833981016040819052620000349162000069565b6001600160a01b039182166080521660a052620000a1565b80516001600160a01b03811681146200006457600080fd5b919050565b600080604083850312156200007d57600080fd5b62000088836200004c565b915062000098602084016200004c565b90509250929050565b60805160a051611dcf620000cd600039600060b30152600081816101380152610aac0152611dcf6000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c8063c45a01551161005b578063c45a015514610133578063c6a5026a1461015a578063cdca17531461016d578063fa461e331461018057600080fd5b80632f80bb1d146100825780634aa4a4fc146100ae578063bd21704a146100ed575b600080fd5b6100956100903660046116f5565b610195565b6040516100a5949392919061173a565b60405180910390f35b6100d57f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b0390911681526020016100a5565b6101006100fb36600461188a565b61036c565b604080519485526001600160a01b03909316602085015263ffffffff9091169183019190915260608201526080016100a5565b6100d57f000000000000000000000000000000000000000000000000000000000000000081565b61010061016836600461188a565b61054d565b61009561017b3660046116f5565b6106cf565b61019361018e3660046118ad565b610888565b005b600060608060006101a5866109d2565b67ffffffffffffffff8111156101bd576101bd611630565b6040519080825280602002602001820160405280156101e6578160200160208202803683370190505b5092506101f2866109d2565b67ffffffffffffffff81111561020a5761020a611630565b604051908082528060200260200182016040528015610233578160200160208202803683370190505b50915060005b60008060006102478a6109fe565b9250925092506000806000806102a36040518060a00160405280886001600160a01b03168152602001896001600160a01b031681526020018f81526020018762ffffff16815260200160006001600160a01b031681525061036c565b9350935093509350828b89815181106102be576102be6118fd565b60200260200101906001600160a01b031690816001600160a01b031681525050818a89815181106102f1576102f16118fd565b602002602001019063ffffffff16908163ffffffff1681525050839c50808961031a9190611929565b9850876103268161193c565b9850506103328e610a3a565b15610347576103408e610a74565b9d50610357565b8c9b505050505050505050610363565b50505050505050610239565b92959194509250565b6020810151815160608301516000928392839283926001600160a01b038082169084161092849261039d9290610aa5565b905086608001516001600160a01b03166000036103bd5760408701516000555b60005a9050816001600160a01b031663128acb0830856103e08c60400151610ae3565b6103e990611955565b60808d01516001600160a01b031615610406578c6080015161043f565b8761042f5761042a600173fffd8963efd1fc6a506488495d951d5263988d26611971565b61043f565b61043f6401000276a36001611998565b8d602001518e606001518f60000151604051602001610460939291906119b8565b6040516020818303038152906040526040518663ffffffff1660e01b815260040161048f959493929190611a43565b60408051808303816000875af19250505080156104c9575060408051601f3d908101601f191682019092526104c691810190611a89565b60015b610540573d8080156104f7576040519150601f19603f3d011682016040523d82523d6000602084013e6104fc565b606091505b505a6105089083611aad565b945088608001516001600160a01b031660000361052457600080555b61052f818487610b35565b975097509750975050505050610546565b50505050505b9193509193565b6020810151815160608301516000928392839283926001600160a01b038082169084161092849261057e9290610aa5565b905060005a9050816001600160a01b031663128acb0830856105a38c60400151610ae3565b60808d01516001600160a01b0316156105c0578c608001516105f9565b876105e9576105e4600173fffd8963efd1fc6a506488495d951d5263988d26611971565b6105f9565b6105f96401000276a36001611998565b8d600001518e606001518f6020015160405160200161061a939291906119b8565b6040516020818303038152906040526040518663ffffffff1660e01b8152600401610649959493929190611a43565b60408051808303816000875af1925050508015610683575060408051601f3d908101601f1916820190925261068091810190611a89565b60015b610540573d8080156106b1576040519150601f19603f3d011682016040523d82523d6000602084013e6106b6565b606091505b505a6106c29083611aad565b945061052f818487610b35565b600060608060006106df866109d2565b67ffffffffffffffff8111156106f7576106f7611630565b604051908082528060200260200182016040528015610720578160200160208202803683370190505b50925061072c866109d2565b67ffffffffffffffff81111561074457610744611630565b60405190808252806020026020018201604052801561076d578160200160208202803683370190505b50915060005b60008060006107818a6109fe565b9250925092506000806000806107dd6040518060a00160405280896001600160a01b03168152602001886001600160a01b031681526020018f81526020018762ffffff16815260200160006001600160a01b031681525061054d565b9350935093509350828b89815181106107f8576107f86118fd565b60200260200101906001600160a01b031690816001600160a01b031681525050818a898151811061082b5761082b6118fd565b602002602001019063ffffffff16908163ffffffff1681525050839c5080896108549190611929565b9850876108608161193c565b98505061086c8e610a3a565b156103475761087a8e610a74565b9d5050505050505050610773565b60008313806108975750600082135b6108a057600080fd5b60008060006108ae846109fe565b92509250925060008060008089136108e557856001600160a01b0316856001600160a01b031610888a6108e090611955565b610905565b846001600160a01b0316866001600160a01b031610898961090590611955565b9250925092506000610918878787610aa5565b9050600080826001600160a01b0316633850c7bd6040518163ffffffff1660e01b815260040160e060405180830381865afa15801561095b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061097f9190611ae9565b50505050509150915085156109a557604051848152826020820152816040820152606081fd5b600054156109bb5760005484146109bb57600080fd5b604051858152826020820152816040820152606081fd5b60006109e060036014611929565b601483516109ee9190611aad565b6109f89190611b99565b92915050565b60008080610a0c8482610be0565b9250610a19846014610c94565b9050610a31610a2a60036014611929565b8590610be0565b91509193909250565b6000610a4860036014611929565b6014610a55600382611929565b610a5f9190611929565b610a699190611929565b825110159050919050565b60606109f8610a8560036014611929565b610a9160036014611929565b8451610a9d9190611aad565b849190610d3f565b6000610adb7f0000000000000000000000000000000000000000000000000000000000000000610ad6868686610e96565b610f01565b949350505050565b6000600160ff1b8210610b315760405162461bcd60e51b8152602060048201526011602482015270191a9b1031b0b9ba34b7339032b93937b960791b60448201526064015b60405180910390fd5b5090565b600080600080600080876001600160a01b0316633850c7bd6040518163ffffffff1660e01b815260040160e060405180830381865afa158015610b7c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ba09190611ae9565b50939650610bb594508d9350610fea92505050565b91975095509050610bd06001600160a01b0389168383611091565b9350869250505093509350935093565b600081610bee816014611929565b1015610c315760405162461bcd60e51b8152602060048201526012602482015271746f416464726573735f6f766572666c6f7760701b6044820152606401610b28565b610c3c826014611929565b83511015610c845760405162461bcd60e51b8152602060048201526015602482015274746f416464726573735f6f75744f66426f756e647360581b6044820152606401610b28565b500160200151600160601b900490565b600081610ca2816003611929565b1015610ce45760405162461bcd60e51b8152602060048201526011602482015270746f55696e7432345f6f766572666c6f7760781b6044820152606401610b28565b610cef826003611929565b83511015610d365760405162461bcd60e51b8152602060048201526014602482015273746f55696e7432345f6f75744f66426f756e647360601b6044820152606401610b28565b50016003015190565b606081610d4d81601f611929565b1015610d8c5760405162461bcd60e51b815260206004820152600e60248201526d736c6963655f6f766572666c6f7760901b6044820152606401610b28565b82610d978382611929565b1015610dd65760405162461bcd60e51b815260206004820152600e60248201526d736c6963655f6f766572666c6f7760901b6044820152606401610b28565b610de08284611929565b84511015610e245760405162461bcd60e51b8152602060048201526011602482015270736c6963655f6f75744f66426f756e647360781b6044820152606401610b28565b606082158015610e435760405191506000825260208201604052610e8d565b6040519150601f8416801560200281840101858101878315602002848b0101015b81831015610e7c578051835260209283019201610e64565b5050858452601f01601f1916604052505b50949350505050565b6040805160608101825260008082526020820181905291810191909152826001600160a01b0316846001600160a01b03161115610ed1579192915b50604080516060810182526001600160a01b03948516815292909316602083015262ffffff169181019190915290565b600081602001516001600160a01b031682600001516001600160a01b031610610f2957600080fd5b815160208084015160408086015181516001600160a01b0395861681860152949092168482015262ffffff90911660608085019190915281518085038201815260808501909252815191909201206001600160f81b031960a08401529085901b6bffffffffffffffffffffffff191660a183015260b58201527f5c6020674693acf03a04dccd6eb9e56f715a9006cab47fc1a6708576f6feb64060d582015260f50160408051601f1981840301815291905280516020909101209392505050565b600080600083516060146110705760448451101561103d5760405162461bcd60e51b815260206004820152601060248201526f2ab732bc3832b1ba32b21032b93937b960811b6044820152606401610b28565b600484019350838060200190518101906110579190611bad565b60405162461bcd60e51b8152600401610b289190611c24565b838060200190518101906110849190611c37565b9250925092509193909250565b60008060008060008060008060088b6001600160a01b031663d0c93a7c6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156110dd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111019190611c75565b61110b908c611c90565b60020b901d905060006101008c6001600160a01b031663d0c93a7c6040518163ffffffff1660e01b8152600401602060405180830381865afa158015611155573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111799190611c75565b611183908d611c90565b61118d9190611cca565b9050600060088d6001600160a01b031663d0c93a7c6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156111d1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111f59190611c75565b6111ff908d611c90565b60020b901d905060006101008e6001600160a01b031663d0c93a7c6040518163ffffffff1660e01b8152600401602060405180830381865afa158015611249573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061126d9190611c75565b611277908e611c90565b6112819190611cca565b905060008160ff166001901b8f6001600160a01b0316635339c296856040518263ffffffff1660e01b81526004016112c2919060019190910b815260200190565b602060405180830381865afa1580156112df573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113039190611cec565b1611801561137d57508d6001600160a01b031663d0c93a7c6040518163ffffffff1660e01b8152600401602060405180830381865afa15801561134a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061136e9190611c75565b611378908d611cca565b60020b155b801561138e57508b60020b8d60020b135b945060008360ff166001901b8f6001600160a01b0316635339c296876040518263ffffffff1660e01b81526004016113cf919060019190910b815260200190565b602060405180830381865afa1580156113ec573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114109190611cec565b1611801561148a57508d6001600160a01b031663d0c93a7c6040518163ffffffff1660e01b8152600401602060405180830381865afa158015611457573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061147b9190611c75565b611485908e611cca565b60020b155b801561149b57508b60020b8d60020b125b95508160010b8460010b12806114c757508160010b8460010b1480156114c757508060ff168360ff1611155b156114dd578399508297508198508096506114ea565b8199508097508398508296505b505060001960ff87161b9150505b8560010b8760010b136115ce578560010b8760010b036115295761151d8460ff611d05565b60001960ff919091161c165b60405163299ce14b60e11b8152600188900b600482015260009082906001600160a01b038e1690635339c29690602401602060405180830381865afa158015611576573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061159a9190611cec565b1690506115a681611604565b6115b49061ffff168a611d1e565b9850876115c081611d3b565b9850506000199150506114f8565b81156115e2576115df600189611d5b565b97505b82156115f6576115f3600189611d5b565b97505b505050505050509392505050565b6000805b82156109f8578061161881611d78565b91506116279050600184611aad565b83169250611608565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff8111828210171561166f5761166f611630565b604052919050565b600067ffffffffffffffff82111561169157611691611630565b50601f01601f191660200190565b600082601f8301126116b057600080fd5b81356116c36116be82611677565b611646565b8181528460208386010111156116d857600080fd5b816020850160208301376000918101602001919091529392505050565b6000806040838503121561170857600080fd5b823567ffffffffffffffff81111561171f57600080fd5b61172b8582860161169f565b95602094909401359450505050565b600060808201868352602060808185015281875180845260a086019150828901935060005b818110156117845784516001600160a01b03168352938301939183019160010161175f565b50508481036040860152865180825290820192508187019060005b818110156117c157825163ffffffff168552938301939183019160010161179f565b5050505060609290920192909252949350505050565b6001600160a01b03811681146117ec57600080fd5b50565b600060a0828403121561180157600080fd5b60405160a0810181811067ffffffffffffffff8211171561182457611824611630565b6040529050808235611835816117d7565b81526020830135611845816117d7565b602082015260408381013590820152606083013562ffffff8116811461186a57600080fd5b6060820152608083013561187d816117d7565b6080919091015292915050565b600060a0828403121561189c57600080fd5b6118a683836117ef565b9392505050565b6000806000606084860312156118c257600080fd5b8335925060208401359150604084013567ffffffffffffffff8111156118e757600080fd5b6118f38682870161169f565b9150509250925092565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b808201808211156109f8576109f8611913565b60006001820161194e5761194e611913565b5060010190565b6000600160ff1b820161196a5761196a611913565b5060000390565b6001600160a01b0382811682821603908082111561199157611991611913565b5092915050565b6001600160a01b0381811683821601908082111561199157611991611913565b606093841b6bffffffffffffffffffffffff19908116825260e89390931b6001600160e81b0319166014820152921b166017820152602b0190565b60005b83811015611a0e5781810151838201526020016119f6565b50506000910152565b60008151808452611a2f8160208601602086016119f3565b601f01601f19169290920160200192915050565b6001600160a01b0386811682528515156020830152604082018590528316606082015260a060808201819052600090611a7e90830184611a17565b979650505050505050565b60008060408385031215611a9c57600080fd5b505080516020909101519092909150565b818103818111156109f8576109f8611913565b8051600281900b8114611ad257600080fd5b919050565b805161ffff81168114611ad257600080fd5b600080600080600080600060e0888a031215611b0457600080fd5b8751611b0f816117d7565b9650611b1d60208901611ac0565b9550611b2b60408901611ad7565b9450611b3960608901611ad7565b9350611b4760808901611ad7565b925060a088015160ff81168114611b5d57600080fd5b60c08901519092508015158114611b7357600080fd5b8091505092959891949750929550565b634e487b7160e01b600052601260045260246000fd5b600082611ba857611ba8611b83565b500490565b600060208284031215611bbf57600080fd5b815167ffffffffffffffff811115611bd657600080fd5b8201601f81018413611be757600080fd5b8051611bf56116be82611677565b818152856020838501011115611c0a57600080fd5b611c1b8260208301602086016119f3565b95945050505050565b6020815260006118a66020830184611a17565b600080600060608486031215611c4c57600080fd5b835192506020840151611c5e816117d7565b9150611c6c60408501611ac0565b90509250925092565b600060208284031215611c8757600080fd5b6118a682611ac0565b60008160020b8360020b80611ca757611ca7611b83565b627fffff19821460001982141615611cc157611cc1611913565b90059392505050565b60008260020b80611cdd57611cdd611b83565b808360020b0791505092915050565b600060208284031215611cfe57600080fd5b5051919050565b60ff82811682821603908111156109f8576109f8611913565b63ffffffff81811683821601908082111561199157611991611913565b60008160010b617fff8103611d5257611d52611913565b60010192915050565b63ffffffff82811682821603908082111561199157611991611913565b600061ffff808316818103611d8f57611d8f611913565b600101939250505056fea2646970667358221220565b1ef84578ed7ced24538974d52d19d29dba43dc51f6554220fe542733639564736f6c63430008120033";

type QuoterV2ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: QuoterV2ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class QuoterV2__factory extends ContractFactory {
  constructor(...args: QuoterV2ConstructorParams) {
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
  ): Promise<QuoterV2> {
    return super.deploy(_factory, _WETH9, overrides || {}) as Promise<QuoterV2>;
  }
  override getDeployTransaction(
    _factory: PromiseOrValue<string>,
    _WETH9: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_factory, _WETH9, overrides || {});
  }
  override attach(address: string): QuoterV2 {
    return super.attach(address) as QuoterV2;
  }
  override connect(signer: Signer): QuoterV2__factory {
    return super.connect(signer) as QuoterV2__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): QuoterV2Interface {
    return new utils.Interface(_abi) as QuoterV2Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): QuoterV2 {
    return new Contract(address, _abi, signerOrProvider) as QuoterV2;
  }
}
