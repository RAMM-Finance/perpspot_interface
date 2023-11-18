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
  "0x613ec861003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106100875760003560e01c80637058199111610065578063705819911461010157806389e08d841461012e578063ccac77bc14610166578063e5561d0d1461019e57600080fd5b80630d838d0a1461008c578063204f4ae8146100b257806332cfe816146100df575b600080fd5b61009f61009a3660046137b8565b6101b1565b6040519081526020015b60405180910390f35b6100c56100c0366004613830565b610258565b60408051600293840b81529190920b6020820152016100a9565b6100f26100ed36600461389e565b610540565b6040516100a99392919061396f565b61011461010f366004613a03565b610a63565b6040805160029390930b83529015156020830152016100a9565b61014161013c366004613a7a565b610bb3565b604080519384526001600160a01b0392831660208501529116908201526060016100a9565b81801561017257600080fd5b50610186610181366004613ad7565b610fe4565b6040516001600160a01b0390911681526020016100a9565b6101866101ac366004613b12565b611074565b6000811561020957600084600f0b136101f6576101e86101d0866110dc565b6101e26101dd8689613b5b565b6110dc565b866113ff565b6101f190613b80565b610202565b6102026101d0866110dc565b9050610250565b600084600f0b1361024157610233610220866110dc565b61022d6101dd8689613b5b565b86611446565b61023c90613b80565b61024d565b61024d610220866110dc565b90505b949350505050565b600080600061027161026986611475565b60018661177b565b9050600061027f8583613b5b565b90506000866001600160a01b0316670de0b6b3a764000061029f846110dc565b6001600160a01b03166102b29190613b9c565b6102bc9190613bc9565b6102c5846110dc565b6001600160a01b0316670de0b6b3a7640000896001600160a01b03166102eb9190613b9c565b6102f59190613bc9565b109050610305620d89e719613bdd565b60020b8860020b131580156103225750620d89e719600289900b12155b61032b57600080fd5b61035d60405180604001604052806011815260200170677265617465725468616e537472696b6560781b8152506117cf565b61036681611815565b6103728360020b611856565b61037e8260020b611856565b881561043a578061038f5781610391565b825b945061039f8860018861177b565b93506103b96103b1620d89e719613bdd565b60018861177b565b60020b8460020b13156103d9576103d66103b1620d89e719613bdd565b93505b620d89e719600286900b12156103fc576103f9620d89e71960008861177b565b94505b61041d6040518060600160405280602b8152602001613e68602b91396117cf565b6104298560020b611856565b6104358460020b611856565b610534565b80610445578261044f565b61044f8684613bff565b94508561045e8960008961177b565b6104689190613bff565b93508561047b620d89e71960008961177b565b6104859190613bff565b60020b8460020b12156104b057856104a3620d89e71960008961177b565b6104ad9190613bff565b93505b6104c06103b1620d89e719613bdd565b60020b8560020b126104f257856104e56104dd620d89e719613bdd565b60018961177b565b6104ef9190613bff565b94505b6105136040518060600160405280602b8152602001613e68602b91396117cf565b61051c81611815565b6105288560020b611856565b6105348460020b611856565b50505094509492505050565b604080516101808101825260008082526020820181905291810182905260608181018390526080820183905260a0820183905260c0820183905260e08201839052610100820183905261012082018390526101408201839052610160820181905282918451604051630ca32ed160e31b815260048101919091523090636519768890602401602060405180830381865afa1580156105e2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106069190613c24565b60020b60a0820152606085015160009061061f90611475565b905061063986602001518288604001518560a00151610258565b600290810b60808501520b606083015260408051808201909152600b81526a626f72726f7742656c6f7760a81b60208281019190915287015161067c919061189b565b61068c826080015160020b611856565b61069c826060015160020b611856565b6106a88160020b611856565b85602001516106dc57816060015160020b826080015160020b1280156106d75750816060015160020b8160020b125b610702565b816060015160020b826080015160020b1380156107025750816060015160020b8160020b135b61074b5760405162461bcd60e51b81526020600482015260156024820152740726f756e646564207469636b73206f7665726c617605c1b60448201526064015b60405180910390fd5b856020015161076d578160a0015182606001516107689190613b5b565b610781565b8160a0015182606001516107819190613bff565b60020b60208301526080820151610797906110dc565b6001600160a01b0316604080840191909152606083015160020b83528601516107bf906118e4565b61012083015260208601516000906107f9578260a00151836080015184606001516107ea9190613bff565b6107f49190613c41565b61081c565b8260a00151836060015184608001516108129190613bff565b61081c9190613c41565b9050610829816002613c7b565b60020b67ffffffffffffffff81111561084457610844613888565b60405190808252806020026020018201604052801561087d57816020015b61086a613757565b8152602001906001900390816108625790505b506101608401525b600087608001511180156108a75750826080015160020b836000015160020b14155b15610934576108b7888885611905565b608087015115806108d55750826080015160020b836000015160020b145b1561091a576080870151156109155760405162461bcd60e51b815260040161074290602080825260049082015263216c697160e01b604082015260600190565b610934565b82610140015161092f5761092f888885612214565b610885565b60808701511561096f5760405162461bcd60e51b815260040161074290602080825260049082015263216c697160e01b604082015260600190565b826101600151518360c001511015610a425760008360c0015167ffffffffffffffff8111156109a0576109a0613888565b6040519080825280602002602001820160405280156109d957816020015b6109c6613757565b8152602001906001900390816109be5790505b50905060005b8460c00151811015610a3a578461016001518181518110610a0257610a02613ca2565b6020026020010151828281518110610a1c57610a1c613ca2565b60200260200101819052508080610a3290613cb8565b9150506109df565b506101608401525b8261010001518360e001518461016001519550955095505050509250925092565b60008060008760020b8960020b128015610a7b575085155b905060008860020b8a60020b138015610a915750865b905086610a9e5789610aa8565b610aa8888b613bff565b995060005b85811015610ba457600087815260208d905260409020610acf908c8b8b612a5f565b9095509350620d89e719600286900b1280610afc5750610af2620d89e719613bdd565b60020b8560020b12155b15610b0a5760009350610ba4565b8315610b4b57828015610b2357508960020b8560020b12155b80610b3c5750818015610b3c57508960020b8560020b13155b15610b4657600093505b610ba4565b87610b565784610b60565b610b608986613bff565b9a50828015610b7557508960020b8b60020b12155b80610b8e5750818015610b8e57508960020b8b60020b13155b610ba45780610b9c81613cb8565b915050610aad565b50505097509795505050505050565b6000806000610c2460405180610140016040528060006001600160a01b0316815260200160006001600160a01b031681526020016000815260200160008152602001600081526020016000815260200160008152602001600081526020016000151581526020016000151581525090565b610c316101dd868b613b5b565b9150610c3c896110dc565b9250610c6b60405180604001604052806002815260200161704160f01b815250846001600160a01b0316612ba1565b610c9860405180604001604052806002815260200161382160f11b815250836001600160a01b0316612ba1565b610cb36001600160a01b03838116908516600160601b612be6565b60408201819052600003610ce5576001610100820152610cdf6001600160a01b03808516908416613b9c565b60408201525b610d0d60405180604001604052806002815260200161783160f01b8152508260400151612ba1565b610d178383613cd1565b6001600160a01b0316606082019081526040805180820190915260028152613c1960f11b60208201529051610d4c9190612ba1565b806101000151610d745760608101516040820151610d6f91600160601b90612be6565b610d88565b80606001518160400151610d889190613bc9565b60808201908152604080518082019091526002815261783360f01b60208201529051610db49190612ba1565b610dcc6001600160a01b03871680600160601b612be6565b60a08201819052600003610dfb576001610120820152610df56001600160a01b03871680613b9c565b60a08201525b610e23604051806040016040528060028152602001611e0d60f21b8152508260a00151612ba1565b806101200151610e465760a0810151610e419088600160601b612be6565b610e56565b868160a00151610e569190613bc9565b60c08201908152604080518082019091526002815261783560f01b60208201529051610e829190612ba1565b878160c0015110610f1f57604081015160a0820151610ea591600160601b612be6565b600160601b1015610eba576000935050610fd9565b610ed2888260c00151610ecd9190613cf1565b612cc4565b604081015160a0820151610f1591600160601b91610ef09183612be6565b610efe90600160601b613cf1565b8a8460c00151610f0e9190613cf1565b9190612be6565b60e0820152610f95565b604081015160a0820151610f3791600160601b612be6565b600160601b1115610f4c576000935050610fd9565b610f8f600160601b80610f768460400151600160601b8660a00151612be69092919063ffffffff16565b610f809190613cf1565b60c0840151610f0e908c613cf1565b60e08201525b610fbd604051806040016040528060028152602001613c1b60f11b8152508260e00151612ba1565b608081015160e0820151610fd591600160601b612be6565b9350505b955095509592505050565b600080856110105761100b611006670de0b6b3a764000087610f0e8882613d04565b612d09565b611031565b611031611006670de0b6b3a76400006110298789613d04565b889190612be6565b905061106a81611048670de0b6b3a7640000612d09565b61105b906001600160a01b038716613bc9565b6110659190613b9c565b612dad565b9695505050505050565b600080846110975761109261100684670de0b6b3a764000087612be6565b6110ad565b6110ad61100685670de0b6b3a764000086612be6565b90506110d3611065600160601b6110cb670de0b6b3a7640000612d09565b849190612be6565b95945050505050565b60008060008360020b126110f3578260020b6110fb565b8260020b6000035b9050620d89e8811115611121576040516315e4079d60e11b815260040160405180910390fd5b60008160011660000361113857600160801b61114a565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff169050600282161561117e576ffff97272373d413259a46990580e213a0260801c5b600482161561119d576ffff2e50f5f656932ef12357cf3c7fdcc0260801c5b60088216156111bc576fffe5caca7e10e4e61c3624eaa0941cd00260801c5b60108216156111db576fffcb9843d60f6159c9db58835c9266440260801c5b60208216156111fa576fff973b41fa98c081472e6896dfb254c00260801c5b6040821615611219576fff2ea16466c96a3843ec78b326b528610260801c5b6080821615611238576ffe5dee046a99a2a811c461f1969c30530260801c5b610100821615611258576ffcbe86c7900a88aedcffc83b479aa3a40260801c5b610200821615611278576ff987a7253ac413176f2b074cf7815e540260801c5b610400821615611298576ff3392b0822b70005940c7a398e4b70f30260801c5b6108008216156112b8576fe7159475a2c29b7443b29c7fa6e889d90260801c5b6110008216156112d8576fd097f3bdfd2022b8845ad8f792aa58250260801c5b6120008216156112f8576fa9f746462d870fdf8a65dc1f90e061e50260801c5b614000821615611318576f70d869a156d2a1b890bb3df62baf32f70260801c5b618000821615611338576f31be135f97d08fd981231505542fcfa60260801c5b62010000821615611359576f09aa508b5b7a84e1c677de54f3e99bc90260801c5b62020000821615611379576e5d6af8dedb81196699c329225ee6040260801c5b62040000821615611398576d2216e584f5fa1ea926041bedfe980260801c5b620800008216156113b5576b048a170391f7dc42444e8fa20260801c5b60008460020b13156113d65780600019816113d2576113d2613bb3565b0490505b6401000000008106156113ea5760016113ed565b60005b60ff16602082901c0192505050919050565b60008082600f0b126114255761142061141b8585856001612dff565b612eb6565b61143c565b61143861141b8585856000036000612dff565b6000035b90505b9392505050565b60008082600f0b126114625761142061141b8585856001612f03565b61143861141b8585856000036000612f03565b60006401000276a36001600160a01b038316108015906114b1575073fffd8963efd1fc6a506488495d951d5263988d266001600160a01b038316105b6114ce576040516324c070df60e11b815260040160405180910390fd5b640100000000600160c01b03602083901b166001600160801b03811160071b81811c67ffffffffffffffff811160061b90811c63ffffffff811160051b90811c61ffff811160041b90811c60ff8111600390811b91821c600f811160021b90811c918211600190811b92831c9790881196179094179092171790911717176080811061156257607f810383901c915061156c565b80607f0383901b91505b908002607f81811c60ff83811c9190911c800280831c81831c1c800280841c81841c1c800280851c81851c1c800280861c81861c1c800280871c81871c1c800280881c81881c1c800280891c81891c1c8002808a1c818a1c1c8002808b1c818b1c1c8002808c1c818c1c1c8002808d1c818d1c1c8002808e1c9c81901c9c909c1c80029c8d901c9e9d607f198f0160401b60c09190911c678000000000000000161760c19b909b1c674000000000000000169a909a1760c29990991c672000000000000000169890981760c39790971c671000000000000000169690961760c49590951c670800000000000000169490941760c59390931c670400000000000000169290921760c69190911c670200000000000000161760c79190911c670100000000000000161760c89190911c6680000000000000161760c99190911c6640000000000000161760ca9190911c6620000000000000161760cb9190911c6610000000000000161760cc9190911c6608000000000000161760cd9190911c66040000000000001617693627a301d71055774c8581026f028f6481ab7f045a5af012a19d003aa9198101608090811d906fdb2df09e81959a81455e260799a0632f8301901d600281810b9083900b1461176c57886001600160a01b0316611751826110dc565b6001600160a01b03161115611766578161176e565b8061176e565b815b9998505050505050505050565b6000806117888386613c41565b90506117948386613d17565b60020b156117c657836117bc57826117ad826001613b5b565b6117b79190613c7b565b6110d3565b6117b78382613c7b565b50929392505050565b611812816040516024016117e39190613d7f565b60408051601f198184030181529190526020810180516001600160e01b031663104c13eb60e21b179052612f6e565b50565b60405181151560248201526118129060440160408051601f198184030181529190526020810180516001600160e01b03166332458eed60e01b179052612f6e565b6118128160405160240161186c91815260200190565b60408051601f198184030181529190526020810180516001600160e01b0316634e0c1d1d60e01b179052612f6e565b6118e082826040516024016118b1929190613d92565b60408051601f198184030181529190526020810180516001600160e01b031663c3b5563560e01b179052612f6e565b5050565b6000806118f083612f8f565b905061143f8182670de0b6b3a7640000612be6565b611939604051806040016040528060138152602001723d3d3d536561726368204e6f726d616c3d3d3d60681b8152506117cf565b6040805160e081018252600080825260208201819052918101829052606081018290526080810182905260a0810182905260c08101829052905b8360c0015181101561220d578351835160405163da69b0b360e01b8152309263da69b0b3926119b09260040191825260020b602082015260400190565b602060405180830381865afa1580156119cd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119f19190613db6565b6001600160801b03168252835183516040516319fda27760e01b815230926319fda27792611a2d9260040191825260020b602082015260400190565b602060405180830381865afa158015611a4a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611a6e9190613db6565b6001600160801b03166020830181905282518390611a8d908390613ddf565b6001600160801b03169052506040805180820190915260048152637469636b60e01b6020820152611abd906117cf565b8251611acb9060020b611856565b611b03604051806040016040528060098152602001686c697175696469747960b81b81525083600001516001600160801b0316612ba1565b611b4360405180604001604052806011815260200170626f72726f7765644c697175696469747960781b81525083602001516001600160801b0316612ba1565b81516001600160801b0316600003611db157611b826040518060400160405280600c81526020016b6e6f206c697175696469747960a01b8152506117cf565b8351600090815260208681526040808320838052909152902054611ba590612cc4565b600080611bcd87866000015187608001518860a001518a60200151158b60000151603c610a63565b91509150611bfa604051806040016040528060078152602001667375636365737360c81b8152508261189b565b611c23604051806040016040528060088152602001676e6578745469636b60c01b8152506117cf565b611c2f8260020b611856565b60a0850151611c3e9083613d17565b60020b15611c4b57600080fd5b80611c985760405162461bcd60e51b815260206004820152601860248201527f6e6f20696e697469616c697a65642062696e20666f756e6400000000000000006044820152606401610742565b600282900b808652865160405163da69b0b360e01b815260048101919091526024810191909152309063da69b0b390604401602060405180830381865afa158015611ce7573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611d0b9190613db6565b6001600160801b0316845285516040516319fda27760e01b81526004810191909152600283900b602482015230906319fda27790604401602060405180830381865afa158015611d5f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611d839190613db6565b6001600160801b03166020850181905284518590611da2908390613ddf565b6001600160801b031690525050505b8251611dbc906110dc565b6001600160a01b0316604083015260a08301518351611ddb9190613b5b565b60020b60608301819052611dee906110dc565b6001600160a01b0316608083015260e0840151600090611e4490611e1a90670de0b6b3a7640000613cf1565b60208501518551670de0b6b3a764000091611e3491613dff565b6001600160801b03169190612be6565b90506000816001600160801b031684600001516001600160801b031611611e6c576000611e79565b8351611e79908390613ddf565b9050806001600160801b0316600003611e9757600080600080611edc565b611edc8660200151611ead578460800151611eb3565b84604001515b8760200151611ec6578560400151611ecc565b85608001515b836001600160ff1b036000612fb6565b505060a0860181905215905061212857845161016086015160c087015181518110611f0957611f09613ca2565b60209081029190910181015160029290920b909152860151611f4e57611f4984604001518560800151611f448760a001518a608001516131a8565b6131c3565b611f72565b611f7284604001518560800151611f6d8760a001518a608001516131a8565b61326d565b8561016001518660c0015181518110611f8d57611f8d613ca2565b6020026020010151602001906001600160801b031690816001600160801b031681525050611ff784600001516001600160801b03168661016001518760c0015181518110611fdd57611fdd613ca2565b6020026020010151602001516001600160801b03166131a8565b8561016001518660c001518151811061201257612012613ca2565b6020026020010151602001906001600160801b031690816001600160801b0316815250506120b08561016001518660c001518151811061205457612054613ca2565b6020026020010151600001516120988761016001518860c001518151811061207e5761207e613ca2565b6020026020010151602001516001600160801b03166132a3565b6120a190613e1f565b8760a0015189602001516101b1565b8560e0018181516120c19190613d04565b90525060c085018051906120d482613cb8565b815250506120ea8460a0015187608001516131a8565b85610100018181516120fc9190613d04565b90525060a0840151608087015161211391906131a8565b866080018181516121249190613cf1565b9052505b85602001516121475760a085015185516121429190613bff565b612158565b60a085015185516121589190613b5b565b60020b855260808601516000036121725750505050505050565b6121a46040518060400160405280600c81526020016b189bdc9c9bddd05b5bdd5b9d60a21b8152508760800151612ba1565b846080015160020b856000015160020b036121f85760405162461bcd60e51b81526020600482015260146024820152736e6f7420656e6f756768206c697175696469747960601b6044820152606401610742565b5050808061220590613cb8565b915050611973565b5050505050565b6040805160e081018252600080825260208201819052918101829052606081018290526080810182905260a0810182905260c0810191909152612283604051806040016040528060158152602001743d3d3d536561726368204f70706f736974653d3d3d60581b8152506117cf565b60005b8360a0015181101561220d5783602001516122d85760a08301516122bc6122b0620d89e719613bdd565b60018660a0015161177b565b6122c69190613bff565b60020b836020015160020b12156122fa565b6122ec620d89e71960008560a0015161177b565b60020b836020015160020b13155b1561230e5750506001610140909101525050565b8351602084015160405163da69b0b360e01b8152309263da69b0b3926123429260040191825260020b602082015260400190565b602060405180830381865afa15801561235f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906123839190613db6565b6001600160801b03168252835160208401516040516319fda27760e01b815230926319fda277926123c29260040191825260020b602082015260400190565b602060405180830381865afa1580156123df573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906124039190613db6565b6001600160801b03166020830181905282518390612422908390613ddf565b6001600160801b031690525060408051808201909152600c81526b7469636b4f70706f7369746560a01b602082015261245a906117cf565b61246a836020015160020b611856565b612494604051806040016040528060098152602001686c697175696469747960b81b8152506117cf565b81516124a8906001600160801b0316612cc4565b81516001600160801b0316600003612681576124eb6040518060400160405280601081526020016f66696e64696e674c697175696469747960801b8152506117cf565b60008061251287866020015187608001518860a001518a602001518b60000151603c610a63565b9150915061253f604051806040016040528060078152602001667375636365737360c81b8152508261189b565b61254b8260020b611856565b8061255e575060020b602084015261220d565b600282900b6020860152855160405163da69b0b360e01b8152309163da69b0b39161259a9190869060040191825260020b602082015260400190565b602060405180830381865afa1580156125b7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906125db9190613db6565b6001600160801b0316845285516040516319fda27760e01b81526004810191909152600283900b602482015230906319fda27790604401602060405180830381865afa15801561262f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906126539190613db6565b6001600160801b03166020850181905284518590612672908390613ddf565b6001600160801b031690525050505b60008060006126d9866020015188602001516126a2578761010001516126a8565b8760e001515b89602001516126bb578860e001516126c2565b8861010001515b6126cf8a606001516110dc565b8a60a00151610bb3565b925092509250606483116126f1575050505050505050565b60006127288860e00151670de0b6b3a764000061270e9190613cf1565b60208801518851670de0b6b3a764000091611e3491613dff565b90506000816001600160801b031687600001516001600160801b03161161275057600061275d565b865161275d908390613ddf565b60208a01519091506001600160801b038216861115906127b8576127aa8486836127a157612793856001600160801b03166132a3565b61279c90613e1f565b6113ff565b612793896132a3565b6127b390613b80565b6127f4565b6127eb8486836127e2576127d4856001600160801b03166132a3565b6127dd90613e1f565b611446565b6127d4896132a3565b6127f490613b80565b60c089015288602001518961016001518a60c001518151811061281957612819613ca2565b60209081029190910181015160029290920b9091528a01516128515761284c8486611f448b60c001518e608001516131a8565b612868565b6128688486611f6d8b60c001518e608001516131a8565b8961016001518a60c001518151811061288357612883613ca2565b6020026020010151602001906001600160801b031690816001600160801b0316815250506128d388600001516001600160801b03168a61016001518b60c0015181518110611fdd57611fdd613ca2565b8961016001518a60c00151815181106128ee576128ee613ca2565b6020026020010151602001906001600160801b031690816001600160801b0316815250506129728961016001518a60c001518151811061293057612930613ca2565b60200260200101516000015161295a8b61016001518c60c001518151811061207e5761207e613ca2565b61296390613e1f565b8b60a001518d602001516101b1565b8960e0018181516129839190613d04565b90525060c0890180519061299682613cb8565b9052506129ab8860c001518b608001516131a8565b89610100018181516129bd9190613d04565b90525060c088015160808b01516129d491906131a8565b8a6080018181516129e59190613cf1565b90525060208a0151612a0a578860a001518960200151612a059190613b5b565b612a1e565b8860a001518960200151612a1e9190613bff565b60020b60208a01528080612a34575060808a0151155b15612a46575050505050505050505050565b5050505050508080612a5790613cb8565b915050612286565b60008060008460020b8660020b81612a7957612a79613bb3565b05905060008660020b128015612aa657508460020b8660020b81612a9f57612a9f613bb3565b0760020b15155b15612ab057600019015b8315612b2457600281900b600881901d600181810b600090815260208b9052604090205461010090930760ff81169190911b80016000190192831680151595509192909185612b0657888360ff16860302612b19565b88612b10826132e3565b840360ff168603025b965050505050612b97565b600181810160020b600881901d80830b600090815260208b9052604090205461010090920760ff81169390931b600019011991821680151595509092919085612b7a57888360ff0360ff16866001010102612b90565b8883612b8583613383565b0360ff168660010101025b9650505050505b5094509492505050565b6118e08282604051602401612bb7929190613e45565b60408051601f198184030181529190526020810180516001600160e01b03166309710a9d60e41b179052612f6e565b6000808060001985870985870292508281108382030391505080600003612c1f5760008411612c1457600080fd5b50829004905061143f565b808411612c575760405162461bcd60e51b815260206004820152600660248201526536bab62234bb60d11b6044820152606401610742565b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150509392505050565b61181281604051602401612cda91815260200190565b60408051601f198184030181529190526020810180516001600160e01b031663f5b1bba960e01b179052612f6e565b60b581600160881b8110612d225760409190911b9060801c5b69010000000000000000008110612d3e5760209190911b9060401c5b650100000000008110612d565760109190911b9060201c5b63010000008110612d6c5760089190911b9060101c5b62010000010260121c80820401600190811c80830401811c80830401811c80830401811c80830401811c80830401811c80830401901c908190048111900390565b806001600160a01b0381168114612dfa5760405162461bcd60e51b8152602060048201526011602482015270189b181031b0b9ba34b7339032b93937b960791b6044820152606401610742565b919050565b6000836001600160a01b0316856001600160a01b03161115612e1f579293925b600160601b600160e01b03606084901b166001600160a01b038686038116908716612e4957600080fd5b83612e7f57866001600160a01b0316612e6c8383896001600160a01b0316612be6565b81612e7957612e79613bb3565b04612eab565b612eab612e968383896001600160a01b031661346d565b886001600160a01b0316808204910615150190565b979650505050505050565b6000600160ff1b8210612eff5760405162461bcd60e51b8152602060048201526011602482015270191a9b1031b0b9ba34b7339032b93937b960791b6044820152606401610742565b5090565b6000836001600160a01b0316856001600160a01b03161115612f23579293925b81612f4b5761023c836001600160801b03168686036001600160a01b0316600160601b612be6565b61024d836001600160801b03168686036001600160a01b0316600160601b61346d565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b60006060612fae6001600160a01b038416670de0b6b3a7640000613b9c565b901c92915050565b60008080806001600160a01b03808916908a16101581871280159061303b576000612fef8989620f42400362ffffff16620f4240612be6565b905082613008576130038c8c8c6001612f03565b613015565b6130158b8d8c6001612dff565b9550858110613026578a9650613035565b6130328c8b83866134ad565b96505b50613085565b816130525761304d8b8b8b6000612dff565b61305f565b61305f8a8c8b6000612f03565b935083886000031061307357899550613085565b6130828b8a8a600003856134f9565b95505b6001600160a01b038a81169087161482156130e8578080156130a45750815b6130ba576130b5878d8c6001612dff565b6130bc565b855b95508080156130c9575081155b6130df576130da878d8c6000612f03565b6130e1565b845b9450613132565b8080156130f25750815b613108576131038c888c6001612f03565b61310a565b855b9550808015613117575081155b61312d576131288c888c6000612dff565b61312f565b845b94505b8115801561314257508860000385115b1561314e578860000394505b81801561316d57508a6001600160a01b0316876001600160a01b031614155b1561317c578589039350613199565b613196868962ffffff168a620f42400362ffffff1661346d565b93505b50505095509550955095915050565b6000818311156131b857816131ba565b825b90505b92915050565b6000826001600160a01b0316846001600160a01b031611156131e3579192915b6000613206856001600160a01b0316856001600160a01b0316600160601b612be6565b9050801561323b5761323361322e84836132208989613cd1565b6001600160a01b0316612be6565b613545565b91505061143f565b61323361322e613259856001600160a01b0389166132208a8a613cd1565b866001600160a01b0316600160601b612be6565b6000826001600160a01b0316846001600160a01b0316111561328d579192915b61143c61322e83600160601b6132208888613cd1565b80600f81900b8114612dfa5760405162461bcd60e51b81526020600482015260096024820152681cd859994818d85cdd60ba1b6044820152606401610742565b60008082116132f157600080fd5b600160801b821061330457608091821c91015b68010000000000000000821061331c57604091821c91015b640100000000821061333057602091821c91015b62010000821061334257601091821c91015b610100821061335357600891821c91015b6010821061336357600491821c91015b6004821061337357600291821c91015b60028210612dfa57600101919050565b600080821161339157600080fd5b5060ff6001600160801b038216156133ac57607f19016133b4565b608082901c91505b67ffffffffffffffff8216156133cd57603f19016133d5565b604082901c91505b63ffffffff8216156133ea57601f19016133f2565b602082901c91505b61ffff82161561340557600f190161340d565b601082901c91505b60ff82161561341f5760071901613427565b600882901c91505b600f8216156134395760031901613441565b600482901c91505b6003821615613453576001190161345b565b600282901c91505b6001821615612dfa5760001901919050565b600061347a848484612be6565b90506000828061348c5761348c613bb3565b848609111561143f5760001981106134a357600080fd5b6001019392505050565b600080856001600160a01b0316116134c457600080fd5b6000846001600160801b0316116134da57600080fd5b816134ec5761023c8585856001613586565b61024d8585856001613667565b600080856001600160a01b03161161351057600080fd5b6000846001600160801b03161161352657600080fd5b816135385761023c8585856000613667565b61024d8585856000613586565b806001600160801b0381168114612dfa5760405162461bcd60e51b81526020600482015260056024820152640858d85cdd60da1b6044820152606401610742565b600081156135f35760006001600160a01b038411156135bc576135b784600160601b876001600160801b0316612be6565b6135d3565b6135d36001600160801b038616606086901b613bc9565b90506135eb611065826001600160a01b038916613d04565b915050610250565b60006001600160a01b038411156136215761361c84600160601b876001600160801b031661346d565b61363e565b61363e606085901b6001600160801b038716808204910615150190565b905080866001600160a01b03161161365557600080fd5b6001600160a01b038616039050610250565b600082600003613678575083610250565b600160601b600160e01b03606085901b16821561370a576001600160a01b038616848102908582816136ac576136ac613bb3565b04036136dc578181018281106136da576136d083896001600160a01b03168361346d565b9350505050610250565b505b506135eb81856136f56001600160a01b038a1683613bc9565b6136ff9190613d04565b808204910615150190565b6001600160a01b0386168481029085828161372757613727613bb3565b0414801561373457508082115b61373d57600080fd5b8082036136d0611065846001600160a01b038b168461346d565b6040518060c00160405280600060020b815260200160006001600160801b03168152602001600081526020016000815260200160008152602001600081525090565b8060020b811461181257600080fd5b80358015158114612dfa57600080fd5b600080600080608085870312156137ce57600080fd5b84356137d981613799565b93506020850135600f81900b81146137f057600080fd5b9250604085013561380081613799565b915061380e606086016137a8565b905092959194509250565b80356001600160a01b0381168114612dfa57600080fd5b6000806000806080858703121561384657600080fd5b61384f856137a8565b9350602085013561385f81613799565b925061386d60408601613819565b9150606085013561387d81613799565b939692955090935050565b634e487b7160e01b600052604160045260246000fd5b6000808284036101208112156138b357600080fd5b8335925061010080601f19830112156138cb57600080fd5b604051915080820182811067ffffffffffffffff821117156138fd57634e487b7160e01b600052604160045260246000fd5b806040525060208501358252613915604086016137a8565b602083015261392660608601613819565b604083015261393760808601613819565b606083015260a0850135608083015260c085013560a083015260e085013560c08301528085013560e083015250809150509250929050565b60006060808301868452602086818601526040838187015282875180855260809450848801915083890160005b828110156139f2578151805160020b8552868101516001600160801b03168786015285810151868601528881015189860152878101518886015260a0908101519085015260c0909301929085019060010161399c565b50919b9a5050505050505050505050565b600080600080600080600060e0888a031215613a1e57600080fd5b873596506020880135613a3081613799565b95506040880135613a4081613799565b94506060880135613a5081613799565b9350613a5e608089016137a8565b925060a0880135915060c0880135905092959891949750929550565b600080600080600060a08688031215613a9257600080fd5b8535613a9d81613799565b94506020860135935060408601359250613ab960608701613819565b91506080860135613ac981613799565b809150509295509295909350565b60008060008060808587031215613aed57600080fd5b613af6856137a8565b9350602085013592506040850135915061380e60608601613819565b600080600060608486031215613b2757600080fd5b613b30846137a8565b95602085013595506040909401359392505050565b634e487b7160e01b600052601160045260246000fd5b600281810b9083900b01627fffff8113627fffff19821217156131bd576131bd613b45565b6000600160ff1b8201613b9557613b95613b45565b5060000390565b80820281158282048414176131bd576131bd613b45565b634e487b7160e01b600052601260045260246000fd5b600082613bd857613bd8613bb3565b500490565b60008160020b627fffff198103613bf657613bf6613b45565b60000392915050565b600282810b9082900b03627fffff198112627fffff821317156131bd576131bd613b45565b600060208284031215613c3657600080fd5b815161143f81613799565b60008160020b8360020b80613c5857613c58613bb3565b627fffff19821460001982141615613c7257613c72613b45565b90059392505050565b60008260020b8260020b028060020b9150808214613c9b57613c9b613b45565b5092915050565b634e487b7160e01b600052603260045260246000fd5b600060018201613cca57613cca613b45565b5060010190565b6001600160a01b03828116828216039080821115613c9b57613c9b613b45565b818103818111156131bd576131bd613b45565b808201808211156131bd576131bd613b45565b60008260020b80613d2a57613d2a613bb3565b808360020b0791505092915050565b6000815180845260005b81811015613d5f57602081850181015186830182015201613d43565b506000602082860101526020601f19601f83011685010191505092915050565b6020815260006131ba6020830184613d39565b604081526000613da56040830185613d39565b905082151560208301529392505050565b600060208284031215613dc857600080fd5b81516001600160801b038116811461143f57600080fd5b6001600160801b03828116828216039080821115613c9b57613c9b613b45565b6001600160801b03818116838216019080821115613c9b57613c9b613b45565b600081600f0b6f7fffffffffffffffffffffffffffffff198103613bf657613bf6613b45565b604081526000613e586040830185613d39565b9050826020830152939250505056fe7374617274696e675469636b20616e642066696e6973685469636b20616e642063757272656e745469636ba2646970667358221220f14f7bb7a5a11a5a7dd9fd2b5aa0e8cba6957816fd7fec0ef3809ef36344551964736f6c63430008120033";

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
