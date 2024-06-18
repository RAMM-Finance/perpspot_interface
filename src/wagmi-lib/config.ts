import { createConfig } from '@wagmi/core'
import { base } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

import { Transports } from './transports'

const config = createConfig({
  chains: [base],
  connectors: [injected()],
  transports: {
    [base.id]: Transports[base.id],
  },
})

export default config
