import { animated, useSpring } from 'react-spring'
import useResizeObserver from 'use-resize-observer'
import styled from 'styled-components/macro'

/**
 * @param open conditional to show content or hide
 * @returns Wrapper to smoothly hide and expand content
 */
export default function AnimatedDropdown({ open, children }: React.PropsWithChildren<{ open: boolean }>) {
  const { ref, height } = useResizeObserver()

  const props = useSpring({
    height: open ? height ?? 0 : 0,
    config: {
      mass: 1.2,
      tension: 300,
      friction: 20,
      clamp: true,
      velocity: 0.01,
    },
  })

  return (
    <animated.div
      style={{
        ...props,
        overflow: 'hidden',
        width: '100%',
        willChange: 'height',
      }}
    >
      <div ref={ref}>{children}</div>
    </animated.div>
  )
}

export const AnimatedDropSide = ({ open, children }: React.PropsWithChildren<{ open: boolean }>) => {

  const props = useSpring({
    width: open ? 380 ?? 0 : 0,
    config: {
      mass: 1.2,
      tension: 300,
      friction: 30,
      clamp: true,
      velocity: 0.01,
    },
  })

  return (
    <AnimatedDropSideBox
      style={{
        ...props,
      }}
    >
      <div>{children}</div>
    </AnimatedDropSideBox>
  )
}

// The box is hidden when the screen is smaller than 760px
const AnimatedDropSideBox = styled(animated.div)`
  overflow: 'hidden';
  height: '100%';
  will-change: 'width';
  @media screen and (max-width: ${({ theme }) => theme.breakpoint.md}px) {
    display: none;
  }
`
