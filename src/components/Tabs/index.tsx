import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import SettingsTab from 'components/Settings'
import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ActiveSwapTab } from 'state/swap/actions'
import { useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import styled from 'styled-components/macro'
// import Styles from "./tabs.styles.less";

const TabHeader = styled.div<{ isActive: boolean; first: boolean; last: boolean }>`
  padding: 10px 20px;
  background-color: ${({ theme, isActive }) => (isActive ? theme.backgroundSurface : theme.background)};
  cursor: pointer;
  // border-radius: 10px;
  // border-top-left-radius: ${({ first }) => (first ? '8px' : '0')};
  // border-top-right-radius: ${({ last }) => (last ? '8px' : '0')};
  color: ${({ theme, isActive }) => (isActive ? theme.textSecondary : theme.textTertiary)};
  font-size: 14px;
  font-weight: 500;

  :hover {
    user-select: initial;
    color: ${({ theme }) => theme.textSecondary};
  }
`

const SettingWrapper = styled.div`
  display: flex;
  margin-right: 10px;
`

// the order of displayed base currencies from left to right is always in sort order
// currencyA is treated as the preferred base currency
export default function SwapTabHeader({
  activeTab,
  handleSetTab,
  allowedSlippage,
}: {
  activeTab: number
  handleSetTab: () => void
  allowedSlippage: Percent
}) {
  // const isTrade = activeTab == ActiveSwapTab.TRADE
  const [isTrade, setIsTrade] = useState(ActiveSwapTab.TRADE)
  const { leverage } = useSwapState()
  const { onSwitchTokens } = useSwapActionHandlers()
  const { onActiveTabChange, onLeverageChange, onSwitchSwapModalTab } = useSwapActionHandlers()
  const selectedTab = useSelector((state: any) => state.swap.tab)
  // const handleTabChange = onActiveTabChange(isTrade)

  const onChangeSwapModeHandler = (e: React.MouseEvent<HTMLSpanElement>) => {
    const eventTarget = e.target as HTMLElement

    if (eventTarget.innerText === selectedTab) {
      return
    }

    if (eventTarget.innerText === 'Long' || eventTarget.innerText === 'Short') {
      setIsTrade(ActiveSwapTab.TRADE)
      onSwitchSwapModalTab(eventTarget.innerText)
      onSwitchTokens(leverage)
      onLeverageChange(true)
    }

    if (eventTarget.innerText === 'Swap') {
      setIsTrade(ActiveSwapTab.TRADE)
      onSwitchSwapModalTab(eventTarget.innerText)
      onSwitchTokens(leverage)
      onLeverageChange(false)
    }
  }

  useEffect(() => {
    onActiveTabChange(isTrade)
  }, [onActiveTabChange, isTrade])

  return (
    <div
      style={{
        // width: 'fit-content',
        display: 'flex',
        flexFlow: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <TapWrapper>
        <TabElement
          onClick={onChangeSwapModeHandler}
          isActive={isTrade}
          selectedTab={selectedTab}
          tabValue="Long"
          fontSize="18px"
          first={true}
        >
          <Trans>Long</Trans>
        </TabElement>
        <TabElement
          onClick={onChangeSwapModeHandler}
          isActive={isTrade}
          selectedTab={selectedTab}
          tabValue="Short"
          fontSize="18px"
        >
          <Trans>Short</Trans>
        </TabElement>
        <TabElement
          onClick={() => {
            setIsTrade(ActiveSwapTab.BORROW)
            onSwitchSwapModalTab('notthing')
          }}
          isActive={!isTrade}
          fontSize="18px"
        >
          <Trans>Borrow</Trans>
        </TabElement>
        <TabElement
          // onClick={() =>
          //   onLeverageChange(!leverage)}
          onClick={onChangeSwapModeHandler}
          isActive={isTrade}
          selectedTab={selectedTab}
          tabValue="Swap"
          fontSize="18px"
          last={true}
        >
          <Trans>Swap</Trans>
        </TabElement>
      </TapWrapper>
      <SettingWrapper>
        <SettingsTab placeholderSlippage={allowedSlippage} />
      </SettingWrapper>
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
  background: transparent;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
`

const TabElement = styled.button<{
  isActive?: number | boolean
  fontSize?: string
  selectedTab?: string
  tabValue?: string
  isTrade?: number
  first?: boolean
  last?: boolean
}>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.25rem 0.6rem;
  // border-radius: 10px;
  justify-content: center;
  height: 100%;
  border: none;
  border-right: 1px solid ${({ theme }) => theme.backgroundOutline};
  background: ${({ theme, isActive, selectedTab, tabValue }) => {
    return !isActive && selectedTab === tabValue ? theme.deprecated_primary5 : 'none'
  }};
  color: ${({ theme, isActive, selectedTab, tabValue }) =>
    !isActive && selectedTab === tabValue ? theme.textSecondary : theme.textTertiary};
  font-size: ${({ fontSize }) => fontSize ?? '1rem'};
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;

  // border-top-right-radius: ${({ last }) => (last ? '8px' : '0')};
  // border-bottom-right-radius: ${({ last }) => (last ? '8px' : '0')};
  // border-top-left-radius: ${({ first }) => (first ? '8px' : '0')};
  // border-bottom-left-radius: ${({ first }) => (first ? '8px' : '0')};

  :hover {
    user-select: initial;
    color: ${({ isTrade, theme }) => theme.textSecondary};
  }

  :active {
    user-select: initial;
    color: ${({ isTrade, theme }) => (isTrade === 0 ? theme.textSecondary : 'none')};
    // background: ${({ isTrade, theme }) => (isTrade === 0 ? theme.deprecated_primary5 : 'none')};
    transition: left 0.5s;
  }
`

const SwapBtn = styled(TabElement)`
  cursor: ${({ isTrade }) => (isTrade === 0 ? 'pointer' : 'default')};
  :hover {
    user-select: initial;
    color: ${({ isTrade, theme }) => (isTrade === 0 ? theme.textSecondary : 'none')};
  }
  :active {
    user-select: initial;
    color: ${({ isTrade, theme }) => (isTrade === 0 ? theme.textSecondary : 'none')};
    background: ${({ isTrade, theme }) => (isTrade === 0 ? theme.deprecated_primary5 : 'none')};
  }
`
