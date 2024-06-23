export function getDecimals(tokenId: string): number {
  return tokenId.toLowerCase() === '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'.toLowerCase() ? 6 // USDC
  : (tokenId.toLowerCase() === '0x7F12d13B34F5F4f0a9449c16Bcd42f0da47AF200'.toLowerCase()
  || tokenId.toLowerCase() === '0x698DC45e4F10966f6D1D98e3bFd7071d8144C233'.toLowerCase()
  || tokenId.toLowerCase() === '0x768BE13e1680b5ebE0024C42c896E3dB59ec0149'.toLowerCase()
  ) ? 9 // NORMIE, PEPE, SKI
  : 18
}