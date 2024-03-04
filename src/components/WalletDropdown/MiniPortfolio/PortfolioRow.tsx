import Column, { AutoColumn } from 'components/Column'
import Row from 'components/Row'
import { LoadingBubble } from 'components/Tokens/loading'
import styled, { css, keyframes } from 'styled-components/macro'

export const PortfolioRowWrapper = styled(Row)<{ onClick?: any }>`
  gap: 12px;
  height: 68px;

  transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} background-color`};

  ${({ onClick }) => onClick && 'cursor: pointer'};

  &:hover {
    cursor: pointer;
  }
`

const EndColumn = styled(Column)`
  align-items: flex-end;
`

export default function PortfolioRow({
  left,
  title,
  margin,
  descriptor,
  right,
  onClick,
}: {
  left: React.ReactNode
  title: React.ReactNode
  margin?: React.ReactNode
  descriptor?: React.ReactNode
  right?: React.ReactNode
  setIsHover?: (b: boolean) => void
  onClick?: () => void
}) {
  return (
    <PortfolioRowWrapper onClick={onClick}>
      {left}
      <AutoColumn justify="center" grow>
        {title}
      </AutoColumn>
      <AutoColumn justify="center" grow>
        {margin}
      </AutoColumn>
      <AutoColumn justify="center" grow></AutoColumn>
      <AutoColumn justify="center" grow>
        {descriptor}
      </AutoColumn>
      <AutoColumn justify="center" grow></AutoColumn>
      <AutoColumn justify="center" grow></AutoColumn>
      <AutoColumn justify="center" grow>
        {right}
      </AutoColumn>
    </PortfolioRowWrapper>
  )
}

function PortfolioSkeletonRow({ shrinkRight }: { shrinkRight?: boolean }) {
  return (
    <PortfolioRowWrapper>
      <LoadingBubble height="40px" width="40px" round />
      <AutoColumn grow gap="4px">
        <LoadingBubble height="16px" width="60px" delay="300ms" />
        <LoadingBubble height="10px" width="90px" delay="300ms" />
      </AutoColumn>
      <EndColumn gap="xs">
        {shrinkRight ? (
          <LoadingBubble height="12px" width="20px" delay="600ms" />
        ) : (
          <>
            <LoadingBubble height="14px" width="70px" delay="600ms" />
            <LoadingBubble height="14px" width="50px" delay="600ms" />
          </>
        )}
      </EndColumn>
    </PortfolioRowWrapper>
  )
}

export function PortfolioSkeleton({ shrinkRight = false }: { shrinkRight?: boolean }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <PortfolioSkeletonRow shrinkRight={shrinkRight} key={`portfolio loading row${i}`} />
      ))}
    </>
  )
}

const fadeIn = keyframes`
  from { opacity: .25 }
  to { opacity: 1 }
`
export const portfolioFadeInAnimation = css`
  animation: ${fadeIn} ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.in}`};
`

export const PortfolioTabWrapper = styled.div`
  padding: 5px;
  ${portfolioFadeInAnimation}
`
