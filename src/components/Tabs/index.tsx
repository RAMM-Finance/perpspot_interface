import { Trans } from '@lingui/macro'
import React, { useCallback, useLayoutEffect, useState } from 'react'
import { ActiveSwapTab } from 'state/swap/actions'
import { useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import styled from 'styled-components/macro'
// import Styles from "./tabs.styles.less";

const TabContainer = styled.div

const TabHeader = styled.div<{ isActive: boolean; first: boolean; last: boolean }>`
  padding: 10px 20px;
  background-color: ${({ theme, isActive }) => (isActive ? theme.backgroundSurface : theme.background)};
  cursor: pointer;
  // border-radius: 10px;
  border-top-left-radius: ${({ first }) => (first ? '8px' : '0')};
  border-top-right-radius: ${({ last }) => (last ? '8px' : '0')};
  color: ${({ theme, isActive }) => (isActive ? theme.textSecondary : theme.textTertiary)};
  font-size: 16px;
  font-weight: 500;

  :hover {
    user-select: initial;
    color: ${({ theme }) => theme.textSecondary};
  }
`

// the order of displayed base currencies from left to right is always in sort order
// currencyA is treated as the preferred base currency
export default function SwapTabHeader({ activeTab, handleSetTab }: { activeTab: number; handleSetTab: () => void }) {
  // const isTrade = activeTab == ActiveSwapTab.TRADE
  const [isTrade, setIsTrade] = useState(ActiveSwapTab.TRADE)
  const { leverage } = useSwapState()
  const [swapModalMode, setSwapModalMode] = useState('Long')
  const { onSwitchTokens } = useSwapActionHandlers()
  const { onActiveTabChange, onLeverageChange } = useSwapActionHandlers()

  // const handleTabChange = onActiveTabChange(isTrade)

  console.log(isTrade)

  const onChangeSwapModeHandler = (e: React.MouseEvent<HTMLSpanElement>) => {
    const eventTarget = e.target as HTMLElement
    if (eventTarget.innerText === swapModalMode) {
      return
    }
    setIsTrade(ActiveSwapTab.TRADE)
    setSwapModalMode(eventTarget.innerText)
    onSwitchTokens(leverage)
  }

  useLayoutEffect(() => {
    onActiveTabChange(isTrade)
  }, [isTrade])

  console.log(isTrade)

  return (
    <div
      style={{
        // width: 'fit-content',
        display: 'flex',
        alignItems: 'center',
      }} /* onClick={handleTabChange} */
    >
      <TapWrapper>
        <TapElement
          onClick={onChangeSwapModeHandler}
          isActive={isTrade}
          swapModalMode={swapModalMode}
          test="Long"
          fontSize="18px"
        >
          <Trans>Long</Trans>
        </TapElement>
        <TapElement
          onClick={onChangeSwapModeHandler}
          isActive={isTrade}
          swapModalMode={swapModalMode}
          test="Short"
          fontSize="18px"
        >
          <Trans>Short</Trans>
        </TapElement>
        <TapElement
          onClick={() => {
            setIsTrade(ActiveSwapTab.BORROW)
            setSwapModalMode('notthing')
          }}
          isActive={!isTrade}
          fontSize="18px"
        >
          <Trans>Borrow</Trans>
        </TapElement>
        <TapElement
          disabled={isTrade ? true : false}
          onClick={() => onLeverageChange(!leverage)}
          test="notthing"
          fontSize="18px"
        >
          <Trans>Swap</Trans>
        </TapElement>
      </TapWrapper>
    </div>
  )
}

export const TabContent = ({
  id,
  activeTab,
  children,
}: {
  id: number
  activeTab: number
  children: React.ReactNode
}) => {
  return activeTab === id ? <div>{children}</div> : null
}

export const TabNavItem = ({
  id,
  activeTab,
  setActiveTab,
  first,
  last,
  children,
}: {
  id: number
  activeTab: number
  setActiveTab: (id: number) => void
  children: React.ReactNode
  first?: boolean
  last?: boolean
}) => {
  const handleClick = useCallback(() => {
    setActiveTab(id)
  }, [id, setActiveTab])

  return (
    <TabHeader isActive={id === activeTab} onClick={handleClick} first={first ?? false} last={last ?? false}>
      {children}
    </TabHeader>
  )
}

const TapWrapper = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0px;
  background: ${({ theme }) => theme.deprecated_bg1};
  border-radius: 10px;
  border: none;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
`

const TapElement = styled.button<{
  isActive?: number | boolean
  fontSize?: string
  swapModalMode?: string
  test?: string
}>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 0.6rem;
  border-radius: 10px;
  justify-content: center;
  height: 100%;
  background: ${({ theme, isActive, swapModalMode, test }) =>
    !isActive && swapModalMode === test ? theme.deprecated_primary5 : 'none'};
  color: ${({ theme, isActive, swapModalMode, test }) =>
    !isActive && swapModalMode === test ? theme.textSecondary : theme.textTertiary};
  font-size: ${({ fontSize }) => fontSize ?? '1rem'};
  font-weight: 500;
  white-space: nowrap;
  border: none;
  cursor: pointer;

  :hover {
    user-select: initial;
    color: ${({ theme }) => theme.textSecondary};
  }

  :active {
    user-select: initial;
    color: ${({ theme }) => theme.textSecondary};
    background: ${({ theme }) => theme.deprecated_primary5};
  }
`
