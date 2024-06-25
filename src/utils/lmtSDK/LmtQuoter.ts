import LPmanager2 from 'abis_v2/Quoter.json'
import { Interface } from 'ethers/lib/utils'

export abstract class LmtQuoterSDK {
  private constructor() {}

  public static INTERFACE: Interface = new Interface(LPmanager2.abi)
}
