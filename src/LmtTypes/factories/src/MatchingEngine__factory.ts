/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  MatchingEngine,
  MatchingEngineInterface,
} from "../../src/MatchingEngine";

const _abi = [
  {
    inputs: [],
    name: "R",
    type: "error",
  },
  {
    inputs: [],
    name: "T",
    type: "error",
  },
  {
    inputs: [],
    name: "insufficientBorrowLiquidity",
    type: "error",
  },
  {
    inputs: [],
    name: "invalidStartingPrice",
    type: "error",
  },
  {
    inputs: [],
    name: "outOfBoundsPrice",
    type: "error",
  },
  {
    inputs: [],
    name: "roundedTicksOverlap",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "borrowBelow",
        type: "bool",
      },
      {
        internalType: "int24",
        name: "finishTickExact",
        type: "int24",
      },
      {
        internalType: "uint160",
        name: "strikePriceX96",
        type: "uint160",
      },
      {
        internalType: "int24",
        name: "binSize",
        type: "int24",
      },
    ],
    name: "computeBoundaryTicks",
    outputs: [
      {
        internalType: "int24",
        name: "startingTick",
        type: "int24",
      },
      {
        internalType: "int24",
        name: "finishTick",
        type: "int24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int24",
        name: "tick",
        type: "int24",
      },
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
      {
        internalType: "uint160",
        name: "sqrtStrikePrice",
        type: "uint160",
      },
      {
        internalType: "int24",
        name: "binSize",
        type: "int24",
      },
    ],
    name: "computeMaxLiquidity",
    outputs: [
      {
        internalType: "uint256",
        name: "liquidity",
        type: "uint256",
      },
      {
        internalType: "uint160",
        name: "pA",
        type: "uint160",
      },
      {
        internalType: "uint160",
        name: "pB",
        type: "uint160",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "borrowBelow",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "simulatedOutput",
        type: "uint256",
      },
    ],
    name: "computeSqrtStartingPriceX96",
    outputs: [
      {
        internalType: "uint160",
        name: "sqrtStartingPriceX96",
        type: "uint160",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "borrowBelow",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "margin",
        type: "uint256",
      },
      {
        internalType: "uint160",
        name: "finishPriceX96",
        type: "uint160",
      },
    ],
    name: "computeSqrtStrikePriceX96",
    outputs: [
      {
        internalType: "uint160",
        name: "",
        type: "uint160",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int24",
        name: "tick",
        type: "int24",
      },
      {
        internalType: "int128",
        name: "liquidity",
        type: "int128",
      },
      {
        internalType: "int24",
        name: "binSize",
        type: "int24",
      },
      {
        internalType: "bool",
        name: "borrowBelow",
        type: "bool",
      },
    ],
    name: "getFilled",
    outputs: [
      {
        internalType: "uint256",
        name: "filledAmount",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
] as const;

const _bytecode =
  "0x613fd361003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe730000000000000000000000000000000000000000301460806040526004361061009d5760003560e01c806389798c4c1161007057806389798c4c1461014457806389e08d8414610157578063a1b461f81461018f578063ccac77bc146101a2578063e5561d0d146101cd57600080fd5b80630d838d0a146100a2578063204f4ae8146100c857806332cfe816146100f55780637058199114610117575b600080fd5b6100b56100b036600461380e565b6101e0565b6040519081526020015b60405180910390f35b6100db6100d6366004613886565b610287565b60408051600293840b81529190920b6020820152016100bf565b6101086101033660046138f4565b610563565b6040516100bf939291906139c5565b61012a610125366004613a59565b610b4a565b6040805160029390930b83529015156020830152016100bf565b610108610152366004613ad0565b610c9a565b61016a610165366004613b33565b610d87565b604080519384526001600160a01b0392831660208501529116908201526060016100bf565b61010861019d366004613b90565b610faf565b6101b56101b0366004613be8565b611037565b6040516001600160a01b0390911681526020016100bf565b6101b56101db366004613c23565b6110c7565b6000811561023857600084600f0b13610225576102176101ff8661112f565b61021161020c8689613c6c565b61112f565b86611452565b61022090613c91565b610231565b6102316101ff8661112f565b905061027f565b600084600f0b136102705761026261024f8661112f565b61025c61020c8689613c6c565b86611499565b61026b90613c91565b61027c565b61027c61024f8661112f565b90505b949350505050565b60008061029e610296856114c8565b60020b6117ce565b60006102b46102ac866114c8565b600186611816565b90506102e66040518060400160405280600f81526020016e1cdd185c9d131bddd95c909bdd5b99608a1b815250611884565b6102f28160020b6117ce565b60006102fe8583613c6c565b90506103306040518060400160405280600f81526020016e1cdd185c9d155c1c195c909bdd5b99608a1b815250611884565b61033c8160020b6117ce565b600061036d670de0b6b3a7640000886001600160a01b031661035d8561112f565b6001600160a01b031691906118c7565b610395670de0b6b3a76400006103828661112f565b6001600160a01b038b81169291166118c7565b1090506103a5620d89e719613cad565b60020b8860020b131580156103c25750620d89e719600289900b12155b6103df5760405163c08724f560e01b815260040160405180910390fd5b61041160405180604001604052806011815260200170677265617465725468616e537472696b6560781b815250611884565b61041a816119aa565b6104268360020b6117ce565b6104328260020b6117ce565b88156104b557806104435781610445565b825b945061045388600188611816565b935061046d610465620d89e719613cad565b600188611816565b60020b8460020b131561048d5761048a610465620d89e719613cad565b93505b620d89e719600286900b12156104b0576104ad620d89e719600088611816565b94505b610557565b806104c057826104ca565b6104ca8684613ccf565b9450856104d989600089611816565b6104e39190613ccf565b93506104f5620d89e719600088611816565b60020b8460020b121561051557610512620d89e719600088611816565b93505b610525610465620d89e719613cad565b60020b8560020b12610557578561054a610542620d89e719613cad565b600189611816565b6105549190613ccf565b94505b50505094509492505050565b600080606061059e6040518060400160405280601581526020017413505510d2125391c8115391d253914814d5105495605a1b815250611884565b604080516101808101825260008082526020820181905281830181905260608083018290526080830182905260a0830182905260c0830182905260e083018290526101008301829052610120830182905261014083019190915261016082015285519151630ca32ed160e31b81526004810192909252903090636519768890602401602060405180830381865afa15801561063d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106619190613cf4565b60020b60a0820152606085015160009061067a906114c8565b905061069486602001518288604001518560a00151610287565b600290810b60808501520b606083015260408051808201909152600b81526a626f72726f7742656c6f7760a81b6020828101919091528701516106d791906119eb565b6107026040518060400160405280600a81526020016966696e6973685469636b60b01b815250611884565b610712826080015160020b6117ce565b61073f6040518060400160405280600c81526020016b7374617274696e675469636b60a01b815250611884565b61074f826060015160020b6117ce565b61077f6040518060400160405280600f81526020016e199a5b9a5cda151a58dad15e1858dd608a1b815250611884565b61078b8160020b6117ce565b85602001516107bf57816060015160020b826080015160020b1280156107ba5750816060015160020b8160020b125b6107e5565b816060015160020b826080015160020b1380156107e55750816060015160020b8160020b135b610802576040516394f849a160e01b815260040160405180910390fd5b8560200151610824578160a00151826060015161081f9190613c6c565b610838565b8160a0015182606001516108389190613ccf565b60020b6020830152608082015161084e9061112f565b6001600160a01b0316604080840191909152606083015160020b835286015161087690611a34565b61012083015260208601516000906108b0578260a00151836080015184606001516108a19190613ccf565b6108ab9190613d27565b6108d3565b8260a00151836060015184608001516108c99190613ccf565b6108d39190613d27565b90506108e0816002613d61565b60020b67ffffffffffffffff8111156108fb576108fb6138de565b60405190808252806020026020018201604052801561093457816020015b6109216137ad565b8152602001906001900390816109195790505b506101608401525b6000876080015111801561095e5750826080015160020b836000015160020b14155b156109d35761096e888885611a55565b6080870151158061098c5750826080015160020b836000015160020b145b156109b9576080870151156109b457604051636ac1de9360e11b815260040160405180910390fd5b6109d3565b8261014001516109ce576109ce8888856121a1565b61093c565b6109ff6040518060400160405280600581526020016439ba3ab33360d91b815250846101000151612b0d565b608087015115610a2257604051636ac1de9360e11b815260040160405180910390fd5b826101600151518360c001511015610af55760008360c0015167ffffffffffffffff811115610a5357610a536138de565b604051908082528060200260200182016040528015610a8c57816020015b610a796137ad565b815260200190600190039081610a715790505b50905060005b8460c00151811015610aed578461016001518181518110610ab557610ab5613d88565b6020026020010151828281518110610acf57610acf613d88565b60200260200101819052508080610ae590613d9e565b915050610a92565b506101608401525b610b296040518060400160405280601381526020017213505510d2125391c8115391d2539148115391606a1b815250611884565b8261010001518360e001518461016001519550955095505050509250925092565b60008060008760020b8960020b128015610b62575085155b905060008860020b8a60020b138015610b785750865b905086610b855789610b8f565b610b8f888b613ccf565b995060005b85811015610c8b57600087815260208d905260409020610bb6908c8b8b612b52565b9095509350620d89e719600286900b1280610be35750610bd9620d89e719613cad565b60020b8560020b12155b15610bf15760009350610c8b565b8315610c3257828015610c0a57508960020b8560020b12155b80610c235750818015610c2357508960020b8560020b13155b15610c2d57600093505b610c8b565b87610c3d5784610c47565b610c478986613ccf565b9a50828015610c5c57508960020b8b60020b12155b80610c755750818015610c7557508960020b8b60020b13155b610c8b5780610c8381613d9e565b915050610b94565b50505097509795505050505050565b60008060606000610cac8a8a8a6110c7565b90506000610cbc8b8b8a8a611037565b90508a610cdd57806001600160a01b0316826001600160a01b031611610cf3565b806001600160a01b0316826001600160a01b0316105b15610d11576040516343fc7e6560e01b815260040160405180910390fd5b610d728c6040518061010001604052808981526020018e15158152602001856001600160a01b031681526020018a6001600160a01b031681526020018d81526020016001815260200160028152602001670c7d713b49da0000815250610563565b919e909d50909b509950505050505050505050565b6000806000610dff60405180610160016040528060006001600160a01b0316815260200160006001600160a01b03168152602001600081526020016000815260200160008152602001600081526020016000815260200160008152602001600081526020016000151581526020016000151581525090565b610e0c61020c868b613c6c565b9150610e178961112f565b9250610e238383613db7565b6001600160a01b0316606082019081526040805180820190915260078152667042202d20704160c81b60208201529051610e5d9190612b0d565b610ea0610e7c6001600160a01b0388811690600160601b9087166118c7565b600160601b610e996001600160a01b038a811690839088166118c7565b91906118c7565b60808201908152604080518082019091526002815261707360f01b60208201529051610ecc9190612b0d565b610ee96001600160a01b038716600160601b610e998b83836118c7565b60a08201819052871115610f56578060800151600160601b1115610f11576000935050610fa4565b610f4f600160601b610f40600160601b8460800151610f309190613dd7565b606085015190600160601b6118c7565b60a0840151610e99908b613dd7565b9350610fa2565b600160601b81608001511115610f70576000935050610fa4565b610f9f600160601b610f8f8360800151600160601b610f309190613dd7565b898460a00151610e999190613dd7565b93505b505b955095509592505050565b60008060606000610fc18989896110c7565b90506110248a6040518061010001604052808881526020018c15158152602001846001600160a01b03168152602001896001600160a01b031681526020018b81526020016001815260200160028152602001670c7d713b49da0000815250610563565b919c909b50909950975050505050505050565b600080856110635761105e611059670de0b6b3a764000087610e998882613dea565b612c94565b611084565b611084611059670de0b6b3a764000061107c8789613dea565b8891906118c7565b90506110bd8161109b670de0b6b3a7640000612c94565b6110ae906001600160a01b038716613dfd565b6110b89190613e11565b612d38565b9695505050505050565b600080846110ea576110e561105984670de0b6b3a7640000876118c7565b611100565b61110061105985670de0b6b3a7640000866118c7565b90506111266110b8600160601b61111e670de0b6b3a7640000612c94565b8491906118c7565b95945050505050565b60008060008360020b12611146578260020b61114e565b8260020b6000035b9050620d89e8811115611174576040516315e4079d60e11b815260040160405180910390fd5b60008160011660000361118b57600160801b61119d565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff16905060028216156111d1576ffff97272373d413259a46990580e213a0260801c5b60048216156111f0576ffff2e50f5f656932ef12357cf3c7fdcc0260801c5b600882161561120f576fffe5caca7e10e4e61c3624eaa0941cd00260801c5b601082161561122e576fffcb9843d60f6159c9db58835c9266440260801c5b602082161561124d576fff973b41fa98c081472e6896dfb254c00260801c5b604082161561126c576fff2ea16466c96a3843ec78b326b528610260801c5b608082161561128b576ffe5dee046a99a2a811c461f1969c30530260801c5b6101008216156112ab576ffcbe86c7900a88aedcffc83b479aa3a40260801c5b6102008216156112cb576ff987a7253ac413176f2b074cf7815e540260801c5b6104008216156112eb576ff3392b0822b70005940c7a398e4b70f30260801c5b61080082161561130b576fe7159475a2c29b7443b29c7fa6e889d90260801c5b61100082161561132b576fd097f3bdfd2022b8845ad8f792aa58250260801c5b61200082161561134b576fa9f746462d870fdf8a65dc1f90e061e50260801c5b61400082161561136b576f70d869a156d2a1b890bb3df62baf32f70260801c5b61800082161561138b576f31be135f97d08fd981231505542fcfa60260801c5b620100008216156113ac576f09aa508b5b7a84e1c677de54f3e99bc90260801c5b620200008216156113cc576e5d6af8dedb81196699c329225ee6040260801c5b620400008216156113eb576d2216e584f5fa1ea926041bedfe980260801c5b62080000821615611408576b048a170391f7dc42444e8fa20260801c5b60008460020b131561142957806000198161142557611425613d11565b0490505b64010000000081061561143d576001611440565b60005b60ff16602082901c0192505050919050565b60008082600f0b126114785761147361146e8585856001612d8a565b612e41565b61148f565b61148b61146e8585856000036000612d8a565b6000035b90505b9392505050565b60008082600f0b126114b55761147361146e8585856001612e8e565b61148b61146e8585856000036000612e8e565b60006401000276a36001600160a01b03831610801590611504575073fffd8963efd1fc6a506488495d951d5263988d266001600160a01b038316105b611521576040516324c070df60e11b815260040160405180910390fd5b640100000000600160c01b03602083901b166001600160801b03811160071b81811c67ffffffffffffffff811160061b90811c63ffffffff811160051b90811c61ffff811160041b90811c60ff8111600390811b91821c600f811160021b90811c918211600190811b92831c979088119617909417909217179091171717608081106115b557607f810383901c91506115bf565b80607f0383901b91505b908002607f81811c60ff83811c9190911c800280831c81831c1c800280841c81841c1c800280851c81851c1c800280861c81861c1c800280871c81871c1c800280881c81881c1c800280891c81891c1c8002808a1c818a1c1c8002808b1c818b1c1c8002808c1c818c1c1c8002808d1c818d1c1c8002808e1c9c81901c9c909c1c80029c8d901c9e9d607f198f0160401b60c09190911c678000000000000000161760c19b909b1c674000000000000000169a909a1760c29990991c672000000000000000169890981760c39790971c671000000000000000169690961760c49590951c670800000000000000169490941760c59390931c670400000000000000169290921760c69190911c670200000000000000161760c79190911c670100000000000000161760c89190911c6680000000000000161760c99190911c6640000000000000161760ca9190911c6620000000000000161760cb9190911c6610000000000000161760cc9190911c6608000000000000161760cd9190911c66040000000000001617693627a301d71055774c8581026f028f6481ab7f045a5af012a19d003aa9198101608090811d906fdb2df09e81959a81455e260799a0632f8301901d600281810b9083900b146117bf57886001600160a01b03166117a48261112f565b6001600160a01b031611156117b957816117c1565b806117c1565b815b9998505050505050505050565b611813816040516024016117e491815260200190565b60408051601f198184030181529190526020810180516001600160e01b0316634e0c1d1d60e01b179052612ef9565b50565b6000806118238386613d27565b905060008560020b121561183f5761183c600182613ccf565b90505b6118498386613e28565b60020b1561187b57836118715782611862826001613c6c565b61186c9190613d61565b611126565b61186c8382613d61565b50929392505050565b611813816040516024016118989190613e90565b60408051601f198184030181529190526020810180516001600160e01b031663104c13eb60e21b179052612ef9565b600080806000198587098587029250828110838203039150508060000361190057600084116118f557600080fd5b508290049050611492565b80841161193d5760405162461bcd60e51b815260206004820152600660248201526536bab62234bb60d11b60448201526064015b60405180910390fd5b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150509392505050565b60405181151560248201526118139060440160408051601f198184030181529190526020810180516001600160e01b03166332458eed60e01b179052612ef9565b611a308282604051602401611a01929190613ea3565b60408051601f198184030181529190526020810180516001600160e01b031663c3b5563560e01b179052612ef9565b5050565b600080611a4083612f1a565b90506114928182670de0b6b3a76400006118c7565b6040805160e081018252600080825260208201819052918101829052606081018290526080810182905260a0810182905260c08101829052905b8360c0015181101561219a578351835160405163da69b0b360e01b8152309263da69b0b392611acc9260040191825260020b602082015260400190565b602060405180830381865afa158015611ae9573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b0d9190613ec7565b6001600160801b03168252835183516040516319fda27760e01b815230926319fda27792611b499260040191825260020b602082015260400190565b602060405180830381865afa158015611b66573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b8a9190613ec7565b6001600160801b03166020830181905282518390611ba9908390613ef0565b6001600160801b039081169091528351166000039050611d7657611bf06040518060400160405280600c81526020016b6e6f206c697175696469747960a01b815250611884565b8351600090815260208681526040808320838052909152902054611c1390612f41565b600080611c3b87866000015187608001518860a001518a60200151158b60000151603c610b4a565b9150915080611c5d57604051636ac1de9360e11b815260040160405180910390fd5b600282900b808652865160405163da69b0b360e01b815260048101919091526024810191909152309063da69b0b390604401602060405180830381865afa158015611cac573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611cd09190613ec7565b6001600160801b0316845285516040516319fda27760e01b81526004810191909152600283900b602482015230906319fda27790604401602060405180830381865afa158015611d24573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611d489190613ec7565b6001600160801b03166020850181905284518590611d67908390613ef0565b6001600160801b031690525050505b606482600001516001600160801b031611611d9657600080835260208301525b8251611da19061112f565b6001600160a01b0316604083015260a08301518351611dc09190613c6c565b60020b60608301819052611dd39061112f565b6001600160a01b0316608083015260e0840151600090611e2990611dff90670de0b6b3a7640000613dd7565b60208501518551670de0b6b3a764000091611e1991613f10565b6001600160801b031691906118c7565b90506000816001600160801b031684600001516001600160801b031611611e51576000611e5e565b8351611e5e908390613ef0565b9050806001600160801b0316600003611e7c57600080600080611ec1565b611ec18660200151611e92578460800151611e98565b84604001515b8760200151611eab578560400151611eb1565b85608001515b836001600160ff1b036000612f86565b505060a0860181905215905061210d57845161016086015160c087015181518110611eee57611eee613d88565b60209081029190910181015160029290920b909152860151611f3357611f2e84604001518560800151611f298760a001518a60800151613178565b613193565b611f57565b611f5784604001518560800151611f528760a001518a60800151613178565b61323d565b8561016001518660c0015181518110611f7257611f72613d88565b6020026020010151602001906001600160801b031690816001600160801b031681525050611fdc84600001516001600160801b03168661016001518760c0015181518110611fc257611fc2613d88565b6020026020010151602001516001600160801b0316613178565b8561016001518660c0015181518110611ff757611ff7613d88565b6020026020010151602001906001600160801b031690816001600160801b0316815250506120958561016001518660c001518151811061203957612039613d88565b60200260200101516000015161207d8761016001518860c001518151811061206357612063613d88565b6020026020010151602001516001600160801b0316613273565b61208690613f30565b8760a0015189602001516101e0565b8560e0018181516120a69190613dea565b90525060c085018051906120b982613d9e565b815250506120cf8460a001518760800151613178565b85610100018181516120e19190613dea565b90525060a084015160808701516120f89190613178565b866080018181516121099190613dd7565b9052505b856020015161212c5760a085015185516121279190613ccf565b61213d565b60a0850151855161213d9190613c6c565b60020b855260808601516000036121575750505050505050565b846080015160020b856000015160020b0361218557604051636ac1de9360e11b815260040160405180910390fd5b5050808061219290613d9e565b915050611a8f565b5050505050565b6040805160e081018252600080825260208201819052918101829052606081018290526080810182905260a0810182905260c0810191909152612210604051806040016040528060158152602001743d3d3d536561726368204f70706f736974653d3d3d60581b815250611884565b60005b8360a0015181101561219a5783602001516122655760a083015161224961223d620d89e719613cad565b60018660a00151611816565b6122539190613ccf565b60020b836020015160020b1215612287565b612279620d89e71960008560a00151611816565b60020b836020015160020b13155b156122d5576122b660405180604001604052806009815260200168736561726368696e6760b81b815250611884565b6122c6836020015160020b6117ce565b50506001610140909101525050565b8351602084015160405163da69b0b360e01b8152309263da69b0b3926123099260040191825260020b602082015260400190565b602060405180830381865afa158015612326573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061234a9190613ec7565b6001600160801b03168252835160208401516040516319fda27760e01b815230926319fda277926123899260040191825260020b602082015260400190565b602060405180830381865afa1580156123a6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906123ca9190613ec7565b6001600160801b031660208301819052825183906123e9908390613ef0565b6001600160801b031690525060408051808201909152600c81526b7469636b4f70706f7369746560a01b602082015261242190611884565b612431836020015160020b6117ce565b61245b604051806040016040528060098152602001686c697175696469747960b81b815250611884565b815161246f906001600160801b0316612f41565b81516001600160801b0316600003612649576124b26040518060400160405280601081526020016f66696e64696e674c697175696469747960801b815250611884565b6000806124d987866020015187608001518860a001518a602001518b60000151603c610b4a565b91509150806125265761250c604051806040016040528060098152602001684e455854205449434b60b81b815250611884565b6125188260020b6117ce565b5060020b602084015261219a565b600282900b6020860152855160405163da69b0b360e01b8152309163da69b0b3916125629190869060040191825260020b602082015260400190565b602060405180830381865afa15801561257f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906125a39190613ec7565b6001600160801b0316845285516040516319fda27760e01b81526004810191909152600283900b602482015230906319fda27790604401602060405180830381865afa1580156125f7573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061261b9190613ec7565b6001600160801b0316602085018190528451859061263a908390613ef0565b6001600160801b031690525050505b606482600001516001600160801b03161161266957600080835260208301525b612696604051806040016040528060018152602001601f60f91b8152508460e001518561010001516132b3565b6126d86040518060400160405280600c81526020016b74617267657420707269636560a01b8152506126d36126ce866060015161112f565b611a34565b612b0d565b6000806000612730866020015188602001516126f9578761010001516126ff565b8760e001515b8960200151612712578860e00151612719565b8861010001515b6127268a6060015161112f565b8a60a00151610d87565b925092509250612760604051806040016040528060068152602001656d61784c697160d01b8152508460646132b3565b60648311612772575050505050505050565b60006127a98860e00151670de0b6b3a764000061278f9190613dd7565b60208801518851670de0b6b3a764000091611e1991613f10565b90506000816001600160801b031687600001516001600160801b0316116127d15760006127de565b86516127de908390613ef0565b60208a01519091506001600160801b038216861115906128395761282b84868361282257612814856001600160801b0316613273565b61281d90613f30565b611452565b61281489613273565b61283490613c91565b612875565b61286c84868361286357612855856001600160801b0316613273565b61285e90613f30565b611499565b61285589613273565b61287590613c91565b60c08901908152604080518082019091526008815267189bdc9c9bddd95960c21b602082015290516128a79190612b0d565b88602001518961016001518a60c00151815181106128c7576128c7613d88565b60209081029190910181015160029290920b9091528a01516128ff576128fa8486611f298b60c001518e60800151613178565b612916565b6129168486611f528b60c001518e60800151613178565b8961016001518a60c001518151811061293157612931613d88565b6020026020010151602001906001600160801b031690816001600160801b03168152505061298188600001516001600160801b03168a61016001518b60c0015181518110611fc257611fc2613d88565b8961016001518a60c001518151811061299c5761299c613d88565b6020026020010151602001906001600160801b031690816001600160801b031681525050612a208961016001518a60c00151815181106129de576129de613d88565b602002602001015160000151612a088b61016001518c60c001518151811061206357612063613d88565b612a1190613f30565b8b60a001518d602001516101e0565b8960e001818151612a319190613dea565b90525060c08901805190612a4482613d9e565b905250612a598860c001518b60800151613178565b8961010001818151612a6b9190613dea565b90525060c088015160808b0151612a829190613178565b8a608001818151612a939190613dd7565b90525060208a0151612ab8578860a001518960200151612ab39190613c6c565b612acc565b8860a001518960200151612acc9190613ccf565b60020b60208a01528080612ae2575060808a0151155b15612af4575050505050505050505050565b5050505050508080612b0590613d9e565b915050612213565b611a308282604051602401612b23929190613f56565b60408051601f198184030181529190526020810180516001600160e01b03166309710a9d60e41b179052612ef9565b60008060008460020b8660020b81612b6c57612b6c613d11565b05905060008660020b128015612b9957508460020b8660020b81612b9257612b92613d11565b0760020b15155b15612ba357600019015b8315612c1757600281900b600881901d600181810b600090815260208b9052604090205461010090930760ff81169190911b80016000190192831680151595509192909185612bf957888360ff16860302612c0c565b88612c03826132ff565b840360ff168603025b965050505050612c8a565b600181810160020b600881901d80830b600090815260208b9052604090205461010090920760ff81169390931b600019011991821680151595509092919085612c6d57888360ff0360ff16866001010102612c83565b8883612c788361339f565b0360ff168660010101025b9650505050505b5094509492505050565b60b581600160881b8110612cad5760409190911b9060801c5b69010000000000000000008110612cc95760209190911b9060401c5b650100000000008110612ce15760109190911b9060201c5b63010000008110612cf75760089190911b9060101c5b62010000010260121c80820401600190811c80830401811c80830401811c80830401811c80830401811c80830401811c80830401901c908190048111900390565b806001600160a01b0381168114612d855760405162461bcd60e51b8152602060048201526011602482015270189b181031b0b9ba34b7339032b93937b960791b6044820152606401611934565b919050565b6000836001600160a01b0316856001600160a01b03161115612daa579293925b600160601b600160e01b03606084901b166001600160a01b038686038116908716612dd457600080fd5b83612e0a57866001600160a01b0316612df78383896001600160a01b0316613489565b81612e0457612e04613d11565b04612e36565b612e36612e218383896001600160a01b03166134c3565b886001600160a01b0316808204910615150190565b979650505050505050565b6000600160ff1b8210612e8a5760405162461bcd60e51b8152602060048201526011602482015270191a9b1031b0b9ba34b7339032b93937b960791b6044820152606401611934565b5090565b6000836001600160a01b0316856001600160a01b03161115612eae579293925b81612ed65761026b836001600160801b03168686036001600160a01b0316600160601b613489565b61027c836001600160801b03168686036001600160a01b0316600160601b6134c3565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b60006060612f396001600160a01b038416670de0b6b3a7640000613e11565b901c92915050565b61181381604051602401612f5791815260200190565b60408051601f198184030181529190526020810180516001600160e01b031663f5b1bba960e01b179052612ef9565b60008080806001600160a01b03808916908a16101581871280159061300b576000612fbf8989620f42400362ffffff16620f4240613489565b905082612fd857612fd38c8c8c6001612e8e565b612fe5565b612fe58b8d8c6001612d8a565b9550858110612ff6578a9650613005565b6130028c8b8386613503565b96505b50613055565b816130225761301d8b8b8b6000612d8a565b61302f565b61302f8a8c8b6000612e8e565b935083886000031061304357899550613055565b6130528b8a8a6000038561354f565b95505b6001600160a01b038a81169087161482156130b8578080156130745750815b61308a57613085878d8c6001612d8a565b61308c565b855b9550808015613099575081155b6130af576130aa878d8c6000612e8e565b6130b1565b845b9450613102565b8080156130c25750815b6130d8576130d38c888c6001612e8e565b6130da565b855b95508080156130e7575081155b6130fd576130f88c888c6000612d8a565b6130ff565b845b94505b8115801561311257508860000385115b1561311e578860000394505b81801561313d57508a6001600160a01b0316876001600160a01b031614155b1561314c578589039350613169565b613166868962ffffff168a620f42400362ffffff166134c3565b93505b50505095509550955095915050565b600081831115613188578161318a565b825b90505b92915050565b6000826001600160a01b0316846001600160a01b031611156131b3579192915b60006131d6856001600160a01b0316856001600160a01b0316600160601b613489565b9050801561320b576132036131fe84836131f08989613db7565b6001600160a01b0316613489565b61359b565b915050611492565b6132036131fe613229856001600160a01b0389166131f08a8a613db7565b866001600160a01b0316600160601b613489565b6000826001600160a01b0316846001600160a01b0316111561325d579192915b61148f6131fe83600160601b6131f08888613db7565b80600f81900b8114612d855760405162461bcd60e51b81526020600482015260096024820152681cd859994818d85cdd60ba1b6044820152606401611934565b6132fa8383836040516024016132cb93929190613f78565b60408051601f198184030181529190526020810180516001600160e01b031663969cdd0360e01b179052612ef9565b505050565b600080821161330d57600080fd5b600160801b821061332057608091821c91015b68010000000000000000821061333857604091821c91015b640100000000821061334c57602091821c91015b62010000821061335e57601091821c91015b610100821061336f57600891821c91015b6010821061337f57600491821c91015b6004821061338f57600291821c91015b60028210612d8557600101919050565b60008082116133ad57600080fd5b5060ff6001600160801b038216156133c857607f19016133d0565b608082901c91505b67ffffffffffffffff8216156133e957603f19016133f1565b604082901c91505b63ffffffff82161561340657601f190161340e565b602082901c91505b61ffff82161561342157600f1901613429565b601082901c91505b60ff82161561343b5760071901613443565b600882901c91505b600f821615613455576003190161345d565b600482901c91505b600382161561346f5760011901613477565b600282901c91505b6001821615612d855760001901919050565b60008080600019858709858702925082811083820303915050806000036134b757600084116118f557600080fd5b80841161193d57600080fd5b60006134d0848484613489565b9050600082806134e2576134e2613d11565b84860911156114925760001981106134f957600080fd5b6001019392505050565b600080856001600160a01b03161161351a57600080fd5b6000846001600160801b03161161353057600080fd5b816135425761026b85858560016135dc565b61027c85858560016136bd565b600080856001600160a01b03161161356657600080fd5b6000846001600160801b03161161357c57600080fd5b8161358e5761026b85858560006136bd565b61027c85858560006135dc565b806001600160801b0381168114612d855760405162461bcd60e51b81526020600482015260056024820152640858d85cdd60da1b6044820152606401611934565b600081156136495760006001600160a01b038411156136125761360d84600160601b876001600160801b0316613489565b613629565b6136296001600160801b038616606086901b613dfd565b90506136416110b8826001600160a01b038916613dea565b91505061027f565b60006001600160a01b038411156136775761367284600160601b876001600160801b03166134c3565b613694565b613694606085901b6001600160801b038716808204910615150190565b905080866001600160a01b0316116136ab57600080fd5b6001600160a01b03861603905061027f565b6000826000036136ce57508361027f565b600160601b600160e01b03606085901b168215613760576001600160a01b0386168481029085828161370257613702613d11565b0403613732578181018281106137305761372683896001600160a01b0316836134c3565b935050505061027f565b505b50613641818561374b6001600160a01b038a1683613dfd565b6137559190613dea565b808204910615150190565b6001600160a01b0386168481029085828161377d5761377d613d11565b0414801561378a57508082115b61379357600080fd5b8082036137266110b8846001600160a01b038b16846134c3565b6040518060c00160405280600060020b815260200160006001600160801b03168152602001600081526020016000815260200160008152602001600081525090565b8060020b811461181357600080fd5b80358015158114612d8557600080fd5b6000806000806080858703121561382457600080fd5b843561382f816137ef565b93506020850135600f81900b811461384657600080fd5b92506040850135613856816137ef565b9150613864606086016137fe565b905092959194509250565b80356001600160a01b0381168114612d8557600080fd5b6000806000806080858703121561389c57600080fd5b6138a5856137fe565b935060208501356138b5816137ef565b92506138c36040860161386f565b915060608501356138d3816137ef565b939692955090935050565b634e487b7160e01b600052604160045260246000fd5b60008082840361012081121561390957600080fd5b8335925061010080601f198301121561392157600080fd5b604051915080820182811067ffffffffffffffff8211171561395357634e487b7160e01b600052604160045260246000fd5b80604052506020850135825261396b604086016137fe565b602083015261397c6060860161386f565b604083015261398d6080860161386f565b606083015260a0850135608083015260c085013560a083015260e085013560c08301528085013560e083015250809150509250929050565b60006060808301868452602086818601526040838187015282875180855260809450848801915083890160005b82811015613a48578151805160020b8552868101516001600160801b03168786015285810151868601528881015189860152878101518886015260a0908101519085015260c090930192908501906001016139f2565b50919b9a5050505050505050505050565b600080600080600080600060e0888a031215613a7457600080fd5b873596506020880135613a86816137ef565b95506040880135613a96816137ef565b94506060880135613aa6816137ef565b9350613ab4608089016137fe565b925060a0880135915060c0880135905092959891949750929550565b600080600080600080600060e0888a031215613aeb57600080fd5b87359650613afb602089016137fe565b9550604088013594506060880135935060808801359250613b1e60a0890161386f565b915060c0880135905092959891949750929550565b600080600080600060a08688031215613b4b57600080fd5b8535613b56816137ef565b94506020860135935060408601359250613b726060870161386f565b91506080860135613b82816137ef565b809150509295509295909350565b60008060008060008060c08789031215613ba957600080fd5b86359550613bb9602088016137fe565b94506040870135935060608701359250613bd56080880161386f565b915060a087013590509295509295509295565b60008060008060808587031215613bfe57600080fd5b613c07856137fe565b935060208501359250604085013591506138646060860161386f565b600080600060608486031215613c3857600080fd5b613c41846137fe565b95602085013595506040909401359392505050565b634e487b7160e01b600052601160045260246000fd5b600281810b9083900b01627fffff8113627fffff198212171561318d5761318d613c56565b6000600160ff1b8201613ca657613ca6613c56565b5060000390565b60008160020b627fffff198103613cc657613cc6613c56565b60000392915050565b600282810b9082900b03627fffff198112627fffff8213171561318d5761318d613c56565b600060208284031215613d0657600080fd5b8151611492816137ef565b634e487b7160e01b600052601260045260246000fd5b60008160020b8360020b80613d3e57613d3e613d11565b627fffff19821460001982141615613d5857613d58613c56565b90059392505050565b60008260020b8260020b028060020b9150808214613d8157613d81613c56565b5092915050565b634e487b7160e01b600052603260045260246000fd5b600060018201613db057613db0613c56565b5060010190565b6001600160a01b03828116828216039080821115613d8157613d81613c56565b8181038181111561318d5761318d613c56565b8082018082111561318d5761318d613c56565b600082613e0c57613e0c613d11565b500490565b808202811582820484141761318d5761318d613c56565b60008260020b80613e3b57613e3b613d11565b808360020b0791505092915050565b6000815180845260005b81811015613e7057602081850181015186830182015201613e54565b506000602082860101526020601f19601f83011685010191505092915050565b60208152600061318a6020830184613e4a565b604081526000613eb66040830185613e4a565b905082151560208301529392505050565b600060208284031215613ed957600080fd5b81516001600160801b038116811461149257600080fd5b6001600160801b03828116828216039080821115613d8157613d81613c56565b6001600160801b03818116838216019080821115613d8157613d81613c56565b600081600f0b6f7fffffffffffffffffffffffffffffff198103613cc657613cc6613c56565b604081526000613f696040830185613e4a565b90508260208301529392505050565b606081526000613f8b6060830186613e4a565b6020830194909452506040015291905056fea2646970667358221220ac2983e2f7bd7b64685ab89d35ab5d94a263b5f2cb430890167bef4429535f8c64736f6c63430008120033";

type MatchingEngineConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MatchingEngineConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MatchingEngine__factory extends ContractFactory {
  constructor(...args: MatchingEngineConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<MatchingEngine> {
    return super.deploy(overrides || {}) as Promise<MatchingEngine>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): MatchingEngine {
    return super.attach(address) as MatchingEngine;
  }
  override connect(signer: Signer): MatchingEngine__factory {
    return super.connect(signer) as MatchingEngine__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MatchingEngineInterface {
    return new utils.Interface(_abi) as MatchingEngineInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MatchingEngine {
    return new Contract(address, _abi, signerOrProvider) as MatchingEngine;
  }
}
