import LimWeth from 'abis_v2/LIM_Token.json'
import { Interface } from 'ethers/lib/utils'

export abstract class LimWethSDK {
  private constructor() {}

  public static INTERFACE: Interface = new Interface(LimWeth.abi)
}
