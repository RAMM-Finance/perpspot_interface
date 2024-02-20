import styled from 'styled-components/macro'

const StyledButton = styled.button<{ disabled?: boolean; marginRight?: string }>`
  background-color: ${({ disabled, theme }) => (disabled ? theme.accentTextDarkPrimary : theme.accentActionSoft)};
  border: none;
  border-radius: 10px;
  width: 100%;
  margin-right: ${({ marginRight }) => marginRight || '0'};
  max-height: 36px;
  min-height: 36px;
  font-weight: 500;
  padding: 9px;
  color: ${({ disabled, theme }) => (disabled ? 'rgb(165, 165, 168)' : theme.accentTextLightSecondary)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};

  :hover {
    user-select: initial;
    color: ${({ disabled, theme }) => (disabled ? 'rgb(165, 165, 168)' : theme.accentTextDarkPrimary)};
    background-color: ${({ disabled, theme }) => (disabled ? theme.accentTextDarkPrimary : '#4c82fb')};
  }
`

interface ITableButtonProps {
  text: string
  disabled?: boolean
  marginRight?: string
}

const TableButton = ({ text, disabled, marginRight }: ITableButtonProps) => {
  return (
    <StyledButton disabled={disabled} marginRight={marginRight}>
      {text}
    </StyledButton>
  )
}

export default TableButton
