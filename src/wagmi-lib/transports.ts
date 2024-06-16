import { http, Transport } from '@wagmi/core'
import { SupportedChainId } from 'constants/chains'

const ALCHEMY_KEY = process.env.REACT_APP_ALCHEMY_KEY
if (typeof ALCHEMY_KEY === 'undefined') {
  throw new Error(`REACT_APP_ALCHEMY_KEY must be a defined environment variable`)
}

export const Transports: { [chainId: number]: Transport } = {
  [SupportedChainId.BASE]: http(),
  // [SupportedChainId.BASE]: fallback([
  //   http(`https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`),
  //   http('https://base-rpc.publicnode.com'),
  //   http('https://base.blockpi.network/v1/rpc/public'),
  //   http('https://base.blockpi.network/v1/rpc/public'),
  //   http('https://base.llamarpc.com'),
  // ]),
}
