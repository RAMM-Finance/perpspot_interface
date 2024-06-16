import useENSAvatar from 'hooks/useENSAvatar'
import styled from 'styled-components/macro'
import { flexColumnNoWrap } from 'theme/styles'
import { useAccount } from 'wagmi'

import sockImg from '../../assets/svg/socks.svg'

export const IconWrapper = styled.div<{ size?: number }>`
  position: relative;
  ${flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    align-items: flex-end;
  `};
`

const MiniIconContainer = styled.div<{ side: 'left' | 'right' }>`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  bottom: -4px;
  ${({ side }) => `${side === 'left' ? 'left' : 'right'}: -4px;`}
  border-radius: 50%;
  outline: 2px solid ${({ theme }) => theme.backgroundSurface};
  outline-offset: -0.1px;
  background-color: ${({ theme }) => theme.backgroundSurface};
  overflow: hidden;
  @supports (overflow: clip) {
    overflow: clip;
  }
`

const MiniImg = styled.img`
  width: 16px;
  height: 16px;
`

const Socks = () => {
  return (
    <MiniIconContainer side="left">
      <MiniImg src={sockImg} />
    </MiniIconContainer>
  )
}

const MiniWalletIcon = ({ side }: { side: 'left' | 'right' }) => {
  return (
    <MiniIconContainer side={side}>
      {/* <MiniImg src={connection.getIcon?.()} alt={`${connection.getName()} icon`} /> */}
    </MiniIconContainer>
  )
}

const MainWalletIcon = ({ size }: { size: number }) => {
  const account = useAccount().address
  const { avatar } = useENSAvatar(account ?? undefined)
  return null

  // if (!account) {
  //   return null
  // } else if (avatar || (connection.type === ConnectionType.INJECTED && connection.getName() === 'MetaMask')) {
  //   return <Identicon size={size} />
  // } else {
  //   return <Unicon address={account} size={size} />
  // }
}

export default function StatusIcon({ size = 16, showMiniIcons = true }: { size?: number; showMiniIcons?: boolean }) {
  return (
    <IconWrapper size={size} data-testid="StatusIconRoot">
      <MainWalletIcon size={size} />
      {showMiniIcons && <MiniWalletIcon side="right" />}
      {/* {hasSocks && showMiniIcons && <Socks />} */}
    </IconWrapper>
  )
}
// export function WagmiStatusIcon({ size = 16, showMiniIcons = true }) {
//   return (
//     <IconWrapper size={size} data-testid="StatusIconRoot">
//       <WagmiMainWalletIcon connection={connection} size={size} />
//       {showMiniIcons && <WagmiMiniWalletIcon connection={connection} side="right" />}
//     </IconWrapper>
//   )
// }

// const WagmiMiniWalletIcon = ({ connection, side }: { connection: Connection; side: 'left' | 'right' }) => {
//   return (
//     <MiniIconContainer side={side}>
//       <MiniImg src={connection.getIcon?.()} alt={`${connection.getName()} icon`} />
//     </MiniIconContainer>
//   )
// }

// const WagmiMainWalletIcon = ({ connection, size }: { connection: Connection; size: number }) => {
//   const account = useAccount().address
//   const { avatar } = useENSAvatar(account ?? undefined)

//   if (!account) {
//     return null
//   } else if (avatar || (connection.type === ConnectionType.INJECTED && connection.getName() === 'MetaMask')) {
//     return <Identicon size={size} />
//   } else {
//     return <Unicon address={account} size={size} />
//   }
// }
