import {
  SMALL_MEDIA_BREAKPOINT,
} from 'components/Tokens/constants'
import styled, { css } from 'styled-components/macro'
import { ClickableStyle } from 'theme'

const Cell = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 12px;
`
const StyledHeaderRow = styled.div<{
  first?: boolean
  last?: boolean
  loading?: boolean
}>`
  display: grid;
  grid-template-columns: 0.1fr 0.7fr 0.7fr 0.5fr 0.8fr 1fr 0.5fr 1fr;
  cursor: pointer;
  background-color: transparent;
  min-width: 390px;
  line-height: 24px;
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.backgroundOutline};
  border-radius: 8px 8px 0px 0px;
  color: ${({ theme }) => theme.textSecondary};
  padding: 0 10px;
  font-size: 12px;
  height: 48px;
  line-height: 16px;
  width: 100%;
  border-bottom: 1px solid;
  border-color: #869eff29;
  border-radius: 8px 8px 0px 0px;
  color: #f5f6fc;
  justify-content: center;

  &:hover {
    background-color: transparent;
  }
  transition: ${({
    theme: {
      transition: { duration, timing },
    },
  }) => css`background-color ${duration.medium} ${timing.ease}`};
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    justify-content: space-between;
  }
`

const HeaderCell = styled.div<{ onClick?: () => void; isFirst?: boolean }>`
  color: ${({ isFirst }) => (isFirst ? '#B8C0DC' : '#F5F6FC')};
  /* text-align: ${({ isFirst }) => (isFirst ? 'end' : 'start')}; */
  text-align: center;
  align-items: center;
  flex-flow: row nowrap;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'unset')};
  display: flex;
  gap: 6px;
  justify-content: ${({ isFirst }) => (isFirst ? 'start' : 'center')};
  width: 100%;
  padding-right: ${({ isFirst }) => (isFirst ? '8px' : '3px')};;
  padding-left: ${({ isFirst }) => (isFirst ? '8px' : '0')};;

  &:hover {
    ${ClickableStyle}
  }
`

/* ActivitiesHeader Row: top header row component for table */
export function ActivitiesHeaderRow() {
  return (
    <StyledHeaderRow>
      <HeaderCell isFirst={true}>Position</HeaderCell>
      <HeaderCell>Acition</HeaderCell>
      <HeaderCell>Margin </HeaderCell>
      <HeaderCell>Price</HeaderCell>
      <HeaderCell>Size</HeaderCell>
      <HeaderCell>PnL</HeaderCell>
      <HeaderCell>Fee</HeaderCell>
      <HeaderCell>Time</HeaderCell>
    </StyledHeaderRow>
  )
}

// export const ActivitesRow = () => {
//   return <div>ActivitesRow</div>
// }

// export default ActivitesRow
