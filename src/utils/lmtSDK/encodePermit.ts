import { PermitSingle } from '@uniswap/permit2-sdk'
import { ethers } from 'ethers'

import { CommandType, RoutePlanner } from './routerCommands'

export interface Permit2Permit extends PermitSingle {
  signature: string
}

const SIGNATURE_LENGTH = 65
const EIP_2098_SIGNATURE_LENGTH = 64

export function encodePermit(planner: RoutePlanner, permit2: Permit2Permit): void {
  let signature = permit2.signature

  const length = ethers.utils.arrayify(permit2.signature).length
  // signature data provided for EIP-1271 may have length different from ECDSA signature
  if (length === SIGNATURE_LENGTH || length === EIP_2098_SIGNATURE_LENGTH) {
    // sanitizes signature to cover edge cases of malformed EIP-2098 sigs and v used as recovery id
    signature = ethers.utils.joinSignature(ethers.utils.splitSignature(permit2.signature))
  }

  planner.addCommand(CommandType.PERMIT2_PERMIT, [permit2, signature])
}
