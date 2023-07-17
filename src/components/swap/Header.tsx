import React, { ReactNode } from 'react'
import styled from 'styled-components'

type HeaderProps = {
  children: ReactNode
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const Header = ({ children, onClick }: HeaderProps) => {
  return <HeaderButton onClick={onClick}>{children}</HeaderButton>
}

export default Header

const HeaderButton = styled.button``
