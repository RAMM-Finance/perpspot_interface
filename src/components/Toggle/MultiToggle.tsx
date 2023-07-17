import styled from 'styled-components/macro'

export const ToggleWrapper = styled.button<{ width?: string }>`
  display: flex;
  align-items: center;
  width: ${({ width }) => width ?? '100%'};
  padding: 0px;
  background: ${({ theme }) => theme.deprecated_bg1};
  border-radius: 10px;
  border: none /* ${({ theme }) => '1px solid ' + theme.backgroundInteractive} */;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
`

export const ToggleElement = styled.span<{
  isActive?: number | boolean
  fontSize?: string
}>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 4px 0.5rem;
  border-radius: 10px;
  justify-content: center;
  height: 100%;
  background: ${({ theme, isActive }) => (isActive ? theme.backgroundSurface : 'none')};
  color: ${({ theme, isActive }) => (isActive ? theme.textSecondary : theme.textTertiary)};
  font-size: ${({ fontSize }) => fontSize ?? '1rem'};
  font-weight: 500;
  white-space: nowrap;
  :hover {
    user-select: initial;
    color: ${({ theme, isActive }) => (isActive ? theme.textSecondary : theme.textTertiary)};
  }
`
