import { darken } from 'polished'
import { useState } from 'react'
import styled, { keyframes } from 'styled-components/macro'

const Wrapper = styled.button<{
  isActive?: boolean
  activeElement?: boolean
  transform?: number | undefined
  borderDark: boolean
}>`
  align-items: center;
  background: ${({ isActive, theme }) => (isActive ? theme.deprecated_primary2 : 'transparent')};
  border: ${({ theme, isActive, borderDark }) =>
    isActive ? '1px solid transparent' : `1px solid ${borderDark ? theme.textSecondary : theme.backgroundOutline}`};
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  outline: none;
  padding: 4px;
  width: fit-content;
  transform: ${({ transform }) => (transform ? `scale(${transform})` : 'none')};
`

const turnOnToggle = keyframes`
  from {
    margin-left: 0em;
    margin-right: 2.2em;
  }
  to {
    margin-left: 2.2em;
    margin-right: 0em;
  }
`

const turnOffToggle = keyframes`
  from {
    margin-left: 2.2em;
    margin-right: 0em;
  }
  to {
    margin-left: 0em;
    margin-right: 2.2em;
  }
`

const ToggleElementHoverStyle = (hasBgColor: boolean, theme: any, isActive?: boolean) =>
  hasBgColor
    ? {
        opacity: '0.8',
      }
    : {
        background: isActive ? darken(0.05, theme.textPrimary) : darken(0.05, theme.textPrimary),
        color: isActive ? theme.textPrimary : theme.textPrimary,
      }

const ToggleElement = styled.span<{ isActive?: boolean; bgColor?: string; isInitialToggleLoad?: boolean }>`
  animation: 0.1s
    ${({ isActive, isInitialToggleLoad }) => (isInitialToggleLoad ? 'none' : isActive ? turnOnToggle : turnOffToggle)}
    ease-in;
  background: ${({ theme, bgColor, isActive }) =>
    isActive ? bgColor ?? theme.textPrimary : bgColor ? theme.textPrimary : theme.textPrimary};
  border-radius: 50%;
  height: 15px;
  :hover {
    ${({ bgColor, theme, isActive }) => ToggleElementHoverStyle(!!bgColor, theme, isActive)}
  }
  margin-left: ${({ isActive }) => isActive && '2.2em'};
  margin-right: ${({ isActive }) => !isActive && '2.2em'};
  width: 15px;
`

interface ToggleProps {
  id?: string
  bgColor?: string
  isActive: boolean
  toggle: () => void
  transform?: number
  borderDark?: boolean
}

export default function Toggle({ id, bgColor, isActive, toggle, transform, borderDark }: ToggleProps) {
  const [isInitialToggleLoad, setIsInitialToggleLoad] = useState(true)

  const switchToggle = () => {
    toggle()
    if (isInitialToggleLoad) setIsInitialToggleLoad(false)
  }

  return (
    <Wrapper id={id} isActive={isActive} onClick={switchToggle} transform={transform} borderDark={borderDark}>
      <ToggleElement isActive={isActive} bgColor={bgColor} isInitialToggleLoad={isInitialToggleLoad} />
    </Wrapper>
  )
}
