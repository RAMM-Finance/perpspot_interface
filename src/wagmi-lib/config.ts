import { createConfig } from 'wagmi'
import { base } from 'wagmi/chains'

import { Transports } from './transports'

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: Transports[base.id],
  },
})

export default config
