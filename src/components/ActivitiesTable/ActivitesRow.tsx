import {
  LARGE_MEDIA_BREAKPOINT,
  MAX_WIDTH_MEDIA_BREAKPOINT,
  MEDIUM_MEDIA_BREAKPOINT,
  SMALL_MEDIA_BREAKPOINT,
} from 'components/Tokens/constants'
import styled, { css } from 'styled-components/macro'
import { ClickableStyle, ThemedText } from 'theme'

const Cell = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 12px;
`

const StyledActivityRow = styled.div<{
  first?: boolean
  last?: boolean
  loading?: boolean
}>`
  background-color: transparent;
  display: grid;
  font-size: 16px;
  grid-template-columns: 1fr 1.3fr 1fr 1fr 1.3fr 1fr 0.1fr;
  line-height: 24px;
  min-width: 390px;
  ${({ first, last }) => css`
    height: ${first || last ? '72px' : '64px'};
    padding-top: ${first ? '8px' : '0px'};
    padding-bottom: ${last ? '8px' : '0px'};
  `}
  transition: ${({
    theme: {
      transition: { duration, timing },
    },
  }) => css`background-color ${duration.medium} ${timing.ease}`};
  width: 100%;
  transition-duration: ${({ theme }) => theme.transition.duration.fast};

  &:hover {
    ${({ loading, theme }) =>
      !loading &&
      css`
        background-color: ${theme.hoverDefault};
      `}
    ${({ last }) =>
      last &&
      css`
        border-radius: 0px 0px 8px 8px;
      `}
  }

  @media only screen and (max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT}) {
    grid-template-columns: 1fr 1fr 1fr 0.75fr 1fr 1fr 0.1fr;
  }

  @media only screen and (max-width: ${LARGE_MEDIA_BREAKPOINT}) {
    grid-template-columns: 1fr 1fr 1fr 0.75fr 1fr 1fr 0.1fr;
  }

  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    grid-template-columns: 1fr 1fr 1fr 0.75fr 1fr 1fr 0.1fr;
  }

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    grid-template-columns: 2fr 3fr;
    min-width: unset;
    border-bottom: 0.5px solid ${({ theme }) => theme.backgroundModule};

    :last-of-type {
      border-bottom: none;
    }
  }
`

const StyledHeaderRow = styled.div<{
  first?: boolean
  last?: boolean
  loading?: boolean
}>`
  grid-template-columns: 0.7fr 1fr 1fr 1fr 1fr 1fr 1fr 0.5fr;
  cursor: pointer;
  background-color: transparent;
  display: grid;
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
  justify-content: ${({ isFirst }) => (isFirst ? 'flex-center' : 'flex-start')};
  width: 100%;
  padding-right: 8px;
  padding-left: 8px;

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
    </StyledHeaderRow>
  )
}

// export const ActivitesRow = () => {
//   return <div>ActivitesRow</div>
// }

// export default ActivitesRow
