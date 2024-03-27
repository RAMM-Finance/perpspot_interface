import ERC20_ABI from 'abis/erc20.json'
import { Interface } from 'ethers/lib/utils'

export const ERC20_INTERFACE = new Interface(ERC20_ABI)
