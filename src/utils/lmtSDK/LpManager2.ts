import LPmanager2 from 'abis_v2/LPManager2.json'
import { Interface } from 'ethers/lib/utils'

export abstract class LPmanager2SDK {
  private constructor() {}

  public static INTERFACE: Interface = new Interface(LPmanager2.abi)
}
