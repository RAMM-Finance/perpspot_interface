import styled from 'styled-components/macro'

interface ITabTitleProps {
  title: string
}

const StyledTabTitle = styled.h1`
  color: ${({ theme }) => theme.textSecondary};
`

const TabTitle = ({ title }: ITabTitleProps) => {
  return <StyledTabTitle>{title}</StyledTabTitle>
}

export default TabTitle
