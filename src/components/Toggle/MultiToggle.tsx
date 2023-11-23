import styled from 'styled-components/macro'

export const ToggleWrapper = styled.button<{ width?: string }>`
  display: flex;
  align-items: center;
  width: ${({ width }) => width ?? '100%'};
  padding: 0px;
  background: ${({ theme }) => theme.backgroundSurface};
  border-radius: 10px;
  border: none /* ${({ theme }) => '1px solid ' + theme.backgroundInteractive} */;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
`

export const ToggleElement = styled.span<{
  isActive?: number | boolean
}>`
  font-size: 11px;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 5px 7px;
  line-height: 20px;
  border-radius: 10px;
  justify-content: center;
  height: 100%;
  background: ${({ theme, isActive }) => (isActive ? theme.deprecated_bg1 : 'none')};
  color: ${({ theme, isActive }) => (isActive ? theme.textSecondary : theme.textTertiary)};
  white-space: nowrap;
  :hover {
    user-select: initial;
    color: ${({ theme, isActive }) => (isActive ? theme.textSecondary : theme.textTertiary)};
  }
`
