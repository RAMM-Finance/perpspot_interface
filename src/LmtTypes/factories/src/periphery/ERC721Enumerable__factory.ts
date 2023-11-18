/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  ERC721Enumerable,
  ERC721EnumerableInterface,
} from "../../../src/periphery/ERC721Enumerable";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
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
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
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
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
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
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
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
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
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
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "tokenByIndex",
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
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "tokenOfOwnerByIndex",
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
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
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
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604080518082018252600a8082526904c4d54204e4654204c560b41b602080840182905284518086019095529184529083015290600062000054838262000111565b50600162000063828262000111565b505050620001dd565b634e487b7160e01b600052604160045260246000fd5b600181811c908216806200009757607f821691505b602082108103620000b857634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200010c57600081815260208120601f850160051c81016020861015620000e75750805b601f850160051c820191505b818110156200010857828155600101620000f3565b5050505b505050565b81516001600160401b038111156200012d576200012d6200006c565b62000145816200013e845462000082565b84620000be565b602080601f8311600181146200017d5760008415620001645750858301515b600019600386901b1c1916600185901b17855562000108565b600085815260208120601f198616915b82811015620001ae578886015182559484019460019091019084016200018d565b5085821015620001cd5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b61159580620001ed6000396000f3fe608060405234801561001057600080fd5b50600436106101005760003560e01c80634f6ccce711610097578063a22cb46511610066578063a22cb4651461020e578063b88d4fde14610221578063c87b56dd14610234578063e985e9c51461024757600080fd5b80634f6ccce7146101cd5780636352211e146101e057806370a08231146101f357806395d89b411461020657600080fd5b806318160ddd116100d357806318160ddd1461018257806323b872dd146101945780632f745c59146101a757806342842e0e146101ba57600080fd5b806301ffc9a71461010557806306fdde031461012d578063081812fc14610142578063095ea7b31461016d575b600080fd5b6101186101133660046110d4565b610283565b60405190151581526020015b60405180910390f35b6101356102d5565b6040516101249190611141565b610155610150366004611154565b610367565b6040516001600160a01b039091168152602001610124565b61018061017b366004611189565b61038e565b005b6008545b604051908152602001610124565b6101806101a23660046111b3565b6104a8565b6101866101b5366004611189565b6104d9565b6101806101c83660046111b3565b61056f565b6101866101db366004611154565b61058a565b6101556101ee366004611154565b61061d565b6101866102013660046111ef565b61067d565b610135610703565b61018061021c36600461120a565b610712565b61018061022f36600461125c565b610721565b610135610242366004611154565b610759565b610118610255366004611338565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b60006001600160e01b031982166380ac58cd60e01b14806102b457506001600160e01b03198216635b5e139f60e01b145b806102cf57506301ffc9a760e01b6001600160e01b03198316145b92915050565b6060600080546102e49061136b565b80601f01602080910402602001604051908101604052809291908181526020018280546103109061136b565b801561035d5780601f106103325761010080835404028352916020019161035d565b820191906000526020600020905b81548152906001019060200180831161034057829003601f168201915b5050505050905090565b6000610372826107cd565b506000908152600460205260409020546001600160a01b031690565b60006103998261061d565b9050806001600160a01b0316836001600160a01b03160361040b5760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e656044820152603960f91b60648201526084015b60405180910390fd5b336001600160a01b038216148061042757506104278133610255565b6104995760405162461bcd60e51b815260206004820152603d60248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f7420746f60448201527f6b656e206f776e6572206f7220617070726f76656420666f7220616c6c0000006064820152608401610402565b6104a3838361082f565b505050565b6104b2338261089d565b6104ce5760405162461bcd60e51b8152600401610402906113a5565b6104a383838361091c565b60006104e48361067d565b82106105465760405162461bcd60e51b815260206004820152602b60248201527f455243373231456e756d657261626c653a206f776e657220696e646578206f7560448201526a74206f6620626f756e647360a81b6064820152608401610402565b506001600160a01b03919091166000908152600660209081526040808320938352929052205490565b6104a383838360405180602001604052806000815250610721565b600061059560085490565b82106105f85760405162461bcd60e51b815260206004820152602c60248201527f455243373231456e756d657261626c653a20676c6f62616c20696e646578206f60448201526b7574206f6620626f756e647360a01b6064820152608401610402565b6008828154811061060b5761060b6113f2565b90600052602060002001549050919050565b6000818152600260205260408120546001600160a01b0316806102cf5760405162461bcd60e51b8152602060048201526018602482015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b6044820152606401610402565b60006001600160a01b0382166106e75760405162461bcd60e51b815260206004820152602960248201527f4552433732313a2061646472657373207a65726f206973206e6f7420612076616044820152683634b21037bbb732b960b91b6064820152608401610402565b506001600160a01b031660009081526003602052604090205490565b6060600180546102e49061136b565b61071d338383610a8d565b5050565b61072b338361089d565b6107475760405162461bcd60e51b8152600401610402906113a5565b61075384848484610b5b565b50505050565b6060610764826107cd565b600061077b60408051602081019091526000815290565b9050600081511161079b57604051806020016040528060008152506107c6565b806107a584610b8e565b6040516020016107b6929190611408565b6040516020818303038152906040525b9392505050565b6000818152600260205260409020546001600160a01b031661082c5760405162461bcd60e51b8152602060048201526018602482015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b6044820152606401610402565b50565b600081815260046020526040902080546001600160a01b0319166001600160a01b03841690811790915581906108648261061d565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b6000806108a98361061d565b9050806001600160a01b0316846001600160a01b031614806108f057506001600160a01b0380821660009081526005602090815260408083209388168352929052205460ff165b806109145750836001600160a01b031661090984610367565b6001600160a01b0316145b949350505050565b826001600160a01b031661092f8261061d565b6001600160a01b0316146109555760405162461bcd60e51b815260040161040290611437565b6001600160a01b0382166109b75760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f206164646044820152637265737360e01b6064820152608401610402565b6109c48383836001610c21565b826001600160a01b03166109d78261061d565b6001600160a01b0316146109fd5760405162461bcd60e51b815260040161040290611437565b600081815260046020908152604080832080546001600160a01b03199081169091556001600160a01b0387811680865260038552838620805460001901905590871680865283862080546001019055868652600290945282852080549092168417909155905184937fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b816001600160a01b0316836001600160a01b031603610aee5760405162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c6572000000000000006044820152606401610402565b6001600160a01b03838116600081815260056020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b610b6684848461091c565b610b7284848484610d55565b6107535760405162461bcd60e51b81526004016104029061147c565b60606000610b9b83610e56565b600101905060008167ffffffffffffffff811115610bbb57610bbb611246565b6040519080825280601f01601f191660200182016040528015610be5576020820181803683370190505b5090508181016020015b600019016f181899199a1a9b1b9c1cb0b131b232b360811b600a86061a8153600a8504945084610bef57509392505050565b6001811115610c905760405162461bcd60e51b815260206004820152603560248201527f455243373231456e756d657261626c653a20636f6e7365637574697665207472604482015274185b9cd9995c9cc81b9bdd081cdd5c1c1bdc9d1959605a1b6064820152608401610402565b816001600160a01b038516610cec57610ce781600880546000838152600960205260408120829055600182018355919091527ff3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee30155565b610d0f565b836001600160a01b0316856001600160a01b031614610d0f57610d0f8582610f2e565b6001600160a01b038416610d2b57610d2681610fcb565b610d4e565b846001600160a01b0316846001600160a01b031614610d4e57610d4e848261107a565b5050505050565b60006001600160a01b0384163b15610e4b57604051630a85bd0160e11b81526001600160a01b0385169063150b7a0290610d999033908990889088906004016114ce565b6020604051808303816000875af1925050508015610dd4575060408051601f3d908101601f19168201909252610dd19181019061150b565b60015b610e31573d808015610e02576040519150601f19603f3d011682016040523d82523d6000602084013e610e07565b606091505b508051600003610e295760405162461bcd60e51b81526004016104029061147c565b805181602001fd5b6001600160e01b031916630a85bd0160e11b149050610914565b506001949350505050565b60008072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b8310610e955772184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b830492506040015b6d04ee2d6d415b85acef81000000008310610ec1576d04ee2d6d415b85acef8100000000830492506020015b662386f26fc100008310610edf57662386f26fc10000830492506010015b6305f5e1008310610ef7576305f5e100830492506008015b6127108310610f0b57612710830492506004015b60648310610f1d576064830492506002015b600a83106102cf5760010192915050565b60006001610f3b8461067d565b610f459190611528565b600083815260076020526040902054909150808214610f98576001600160a01b03841660009081526006602090815260408083208584528252808320548484528184208190558352600790915290208190555b5060009182526007602090815260408084208490556001600160a01b039094168352600681528383209183525290812055565b600854600090610fdd90600190611528565b60008381526009602052604081205460088054939450909284908110611005576110056113f2565b906000526020600020015490508060088381548110611026576110266113f2565b600091825260208083209091019290925582815260099091526040808220849055858252812055600880548061105e5761105e611549565b6001900381819060005260206000200160009055905550505050565b60006110858361067d565b6001600160a01b039093166000908152600660209081526040808320868452825280832085905593825260079052919091209190915550565b6001600160e01b03198116811461082c57600080fd5b6000602082840312156110e657600080fd5b81356107c6816110be565b60005b8381101561110c5781810151838201526020016110f4565b50506000910152565b6000815180845261112d8160208601602086016110f1565b601f01601f19169290920160200192915050565b6020815260006107c66020830184611115565b60006020828403121561116657600080fd5b5035919050565b80356001600160a01b038116811461118457600080fd5b919050565b6000806040838503121561119c57600080fd5b6111a58361116d565b946020939093013593505050565b6000806000606084860312156111c857600080fd5b6111d18461116d565b92506111df6020850161116d565b9150604084013590509250925092565b60006020828403121561120157600080fd5b6107c68261116d565b6000806040838503121561121d57600080fd5b6112268361116d565b91506020830135801515811461123b57600080fd5b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b6000806000806080858703121561127257600080fd5b61127b8561116d565b93506112896020860161116d565b925060408501359150606085013567ffffffffffffffff808211156112ad57600080fd5b818701915087601f8301126112c157600080fd5b8135818111156112d3576112d3611246565b604051601f8201601f19908116603f011681019083821181831017156112fb576112fb611246565b816040528281528a602084870101111561131457600080fd5b82602086016020830137600060208483010152809550505050505092959194509250565b6000806040838503121561134b57600080fd5b6113548361116d565b91506113626020840161116d565b90509250929050565b600181811c9082168061137f57607f821691505b60208210810361139f57634e487b7160e01b600052602260045260246000fd5b50919050565b6020808252602d908201527f4552433732313a2063616c6c6572206973206e6f7420746f6b656e206f776e6560408201526c1c881bdc88185c1c1c9bdd9959609a1b606082015260800190565b634e487b7160e01b600052603260045260246000fd5b6000835161141a8184602088016110f1565b83519083019061142e8183602088016110f1565b01949350505050565b60208082526025908201527f4552433732313a207472616e736665722066726f6d20696e636f72726563742060408201526437bbb732b960d91b606082015260800190565b60208082526032908201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560408201527131b2b4bb32b91034b6b83632b6b2b73a32b960711b606082015260800190565b6001600160a01b038581168252841660208201526040810183905260806060820181905260009061150190830184611115565b9695505050505050565b60006020828403121561151d57600080fd5b81516107c6816110be565b818103818111156102cf57634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052603160045260246000fdfea2646970667358221220ad725cd91e798580845de78ecee20fcd0b81f2cf320e685a85d01df02365886d64736f6c63430008120033";

type ERC721EnumerableConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ERC721EnumerableConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ERC721Enumerable__factory extends ContractFactory {
  constructor(...args: ERC721EnumerableConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ERC721Enumerable> {
    return super.deploy(overrides || {}) as Promise<ERC721Enumerable>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ERC721Enumerable {
    return super.attach(address) as ERC721Enumerable;
  }
  override connect(signer: Signer): ERC721Enumerable__factory {
    return super.connect(signer) as ERC721Enumerable__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ERC721EnumerableInterface {
    return new utils.Interface(_abi) as ERC721EnumerableInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC721Enumerable {
    return new Contract(address, _abi, signerOrProvider) as ERC721Enumerable;
  }
}
