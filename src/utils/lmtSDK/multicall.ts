import { Interface } from '@ethersproject/abi'
import IMulticall from '@uniswap/v3-periphery/artifacts/contracts/interfaces/IMulticall.sol/IMulticall.json'

export abstract class MulticallSDK {
  public static INTERFACE: Interface = new Interface(IMulticall.abi)

  /**
   * Cannot be constructed.
   */
  private constructor() {}

  public static encodeMulticall(calldatas: string | string[]): string {
    if (!Array.isArray(calldatas)) {
      calldatas = [calldatas]
    }

    return calldatas.length === 1 ? calldatas[0] : MulticallSDK.INTERFACE.encodeFunctionData('multicall', [calldatas])
  }
}
