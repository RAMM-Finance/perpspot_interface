// import { BigintIsh } from '@uniswap/sdk-core'

import LPVault from 'abis_v2/LPVault.json'
import { Interface } from 'ethers/lib/utils'

export abstract class LPVaultSDK {
  private constructor() {}

  public static INTERFACE: Interface = new Interface(LPVault.abi)
}
