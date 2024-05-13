import PoolManagerABI from 'abis_v2/PoolManager.json'
import { Interface } from 'ethers/lib/utils'

export abstract class PoolManagerSDK {
  private constructor() {}

  public static INTERFACE: Interface = new Interface(PoolManagerABI.abi)
}
