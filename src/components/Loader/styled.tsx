import styled, { css, keyframes } from 'styled-components/macro'

export const loadingAnimation = keyframes`
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`
const loadingTextAnimation = keyframes`
  0%, 20% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`
export const LoadingText = styled.div<{ size?: string }>`
  font-size: ${({ size }) => size || '16px'};
  color: ${({ theme }) => theme.textPrimary};
  animation: ${loadingTextAnimation} 2s infinite ease-in-out;
  margin: auto;
  text-align: center;
`;

export const LoadingRows = styled.div`
  display: grid;

  & > div {
    animation: ${loadingAnimation} 1.5s infinite;
    animation-fill-mode: both;
    background: linear-gradient(
      to left,
      ${({ theme }) => theme.deprecated_bg1} 25%,
      ${({ theme }) => theme.backgroundInteractive} 50%,
      ${({ theme }) => theme.deprecated_bg1} 75%
    );
    background-size: 400%;
    border-radius: 12px;
    height: 2.4em;
    will-change: background-position;
  }
`

export const loadingOpacityMixin = css<{ $loading: boolean }>`
  filter: ${({ $loading }) => ($loading ? 'grayscale(1)' : 'none')};
  opacity: ${({ $loading }) => ($loading ? '0.4' : '1')};
  transition: opacity 0.2s ease-in-out;
`

export const LoadingOpacityContainer = styled.div<{ $loading: boolean }>`
  ${loadingOpacityMixin}
`
