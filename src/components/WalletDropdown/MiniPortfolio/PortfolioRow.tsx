import Column, { AutoColumn } from 'components/Column'
import Row from 'components/Row'
import { LoadingBubble } from 'components/Tokens/loading'
import styled, { css, keyframes } from 'styled-components/macro'

export const PortfolioRowWrapper = styled(Row)<{ onClick?: any; display?: string }>`
  padding: 8px;
  margin: 1px 0;
  gap: 8px;
  height: 100%;
  min-height: 65px;
  display: ${({ display }) => display && display};
  transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} background-color`};
  position: relative;
  border-bottom: 2px solid;
  border-color: ${({ theme }) => theme.tableBorder};
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
  isPopUp,
  display,
  isGrow = true,
}: {
  left: React.ReactNode
  title: React.ReactNode
  margin?: React.ReactNode
  descriptor?: React.ReactNode
  right?: React.ReactNode
  setIsHover?: (b: boolean) => void
  onClick?: () => void
  isPopUp?: boolean
  isGrow?: boolean
  display?: string
}) {
  return (
    <PortfolioRowWrapper onClick={onClick} display={display}>
      {left}
      {isPopUp ? (
        <AutoColumn justify="center" grow={isGrow}>
          {title}
          {descriptor}
        </AutoColumn>
      ) : (
        <>
          <AutoColumn justify="center" grow={isGrow}>
            {title}
          </AutoColumn>
          <AutoColumn justify="center" grow={isGrow}>
            {margin}
          </AutoColumn>
          <AutoColumn justify="center" grow={isGrow}>
            {descriptor}
          </AutoColumn>
          <AutoColumn justify="center" grow={isGrow}>
            {right}
          </AutoColumn>
        </>
      )}
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
