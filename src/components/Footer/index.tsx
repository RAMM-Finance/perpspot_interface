import { DiscordIcon } from 'nft/components/icons'
import { Bookmark, GitHub } from 'react-feather'
import styled from 'styled-components/macro'

import { ReactComponent as Logo } from '../../assets/svg/full_logo_black.svg'
import { ReactComponent as X } from './twitter.svg'

const Wrapper = styled.div`
  width: 99%;
  height: 200px;
  margin: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  padding: 30px;
  padding-bottom: 10px;
`
const IconWrapper = styled.div`
  display: flex;
  gap: 40px;
  justify-content: center;
  align-items: center;
`

const Link = styled.a`
  cursor: pointer;
`

const Footer = () => {
  return (
    <Wrapper>
      <Logo fill="#fff" width="200px" />
      <IconWrapper>
        <Link href="https://twitter.com/LimitlessFi_" rel="noopener noreferrer" target="_blank">
          <X fill="#b8c0dc" width="25px" />
        </Link>
        <Link href="https://discord.com/invite/v7Dq4vTvUE" rel="noopener noreferrer" target="_blank">
          <DiscordIcon fill="#b8c0dc" width="35px" />
        </Link>
        <Link rel="noopener noreferrer" target="_blank">
          <GitHub fill="#b8c0dc" width="30px" />
        </Link>
        <Link href="https://linktr.ee/limitlessfi" rel="noopener noreferrer" target="_blank">
          <Bookmark fill="#b8c0dc" width="30px" />
        </Link>
      </IconWrapper>
    </Wrapper>
  )
}

export default Footer
