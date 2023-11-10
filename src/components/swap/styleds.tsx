import { TooltipContainer } from 'components/Tooltip'
import { transparentize } from 'polished'
import { ReactNode } from 'react'
import { AlertTriangle } from 'react-feather'
import { Text } from 'rebass'
import styled, { css } from 'styled-components/macro'

import { AutoColumn } from '../Column'

export const PageWrapper = styled.div`
  // padding: 10px 14px 0px;
  /* max-width: 1700px; */
  /* display: grid;
  grid-template-columns: 2fr 0.6fr; */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  /* border: solid ${({ theme }) => theme.backgroundOutline};
  border-width: 0 0 1px 0; */
  width: 100%;
  min-height: calc(100vh - 65px);

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 48px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: 20px;
  }
`

// Mostly copied from `AppBody` but it was getting too hard to maintain backwards compatibility.
export const SwapWrapper = styled.main<{ chainId: number | undefined }>`
  position: relative;
  min-width: 325px;
  flex-flow: row nowrap;
  align-items: space-evenly;
  margin-bottom: 0.5rem;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  transition: transform 250ms ease;
  // background-color: ${({ theme }) => theme.backgroundSurface};
`
// export const LimitWrapper = styled.div`
//   position: relative;
// `

export const ArrowWrapper = styled.div<{ clickable: boolean }>`
  border-radius: 999px;
  height: 30px;
  width: 30px;
  position: relative;
  margin-top: -20px;
  margin-bottom: -15px;
  margin-left: auto;
  margin-right: auto;
  background-color: ${({ theme }) => theme.backgroundInteractive};
  border: 4px solid;
  border-color: ${({ theme }) => theme.backgroundSurface};

  z-index: 2;
  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
            opacity: 0.8;
          }
        `
      : null}
`

export const ErrorText = styled(Text)<{ severity?: 0 | 1 | 2 | 3 | 4 }>`
  color: ${({ theme, severity }) =>
    severity === 3 || severity === 4
      ? theme.accentFailure
      : severity === 2
      ? theme.deprecated_yellow2
      : severity === 1
      ? theme.textPrimary
      : theme.textSecondary};
`

export const TruncatedText = styled(Text)<{ width?: string }>`
  text-overflow: ellipsis;
  max-width: ${({ width }) => (width ? width : '195px')};
  overflow: hidden;
  text-align: right;
`

// styles
export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`

const SwapCallbackErrorInner = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.accentFailure)};
  border-radius: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.825rem;
  width: 100%;
  padding: 3rem 1.25rem 1rem 1rem;
  margin-top: -2rem;
  color: ${({ theme }) => theme.accentFailure};
  z-index: -1;
  p {
    padding: 0;
    margin: 0;
    font-weight: 500;
  }
`

const SwapCallbackErrorInnerAlertTriangle = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.accentFailure)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 12px;
  min-width: 48px;
  height: 48px;
`

export function SwapCallbackError({ error }: { error: ReactNode }) {
  return (
    <SwapCallbackErrorInner>
      <SwapCallbackErrorInnerAlertTriangle>
        <AlertTriangle size={24} />
      </SwapCallbackErrorInnerAlertTriangle>
      <p style={{ wordBreak: 'break-word' }}>{error}</p>
    </SwapCallbackErrorInner>
  )
}

export const SwapShowAcceptChanges = styled(AutoColumn)`
  background-color: ${({ theme }) => transparentize(0.95, theme.deprecated_primary3)};
  color: ${({ theme }) => theme.accentAction};
  padding: 0.5rem;
  border-radius: 12px;
  margin-top: 8px;
`

export const ResponsiveTooltipContainer = styled(TooltipContainer)<{ origin?: string; width?: string }>`
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: 1px solid ${({ theme }) => theme.backgroundInteractive};
  padding: 1rem;
  width: ${({ width }) => width ?? 'auto'};

  ${({ theme, origin }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
    transform: scale(0.8);
    transform-origin: ${origin ?? 'top left'};
  `}
`
