import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import SettingsTab from 'components/Settings'
import React, { useCallback } from 'react'
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
  margin-right: 20px;
  margin-top: 17px;
`

// the order of displayed base currencies from left to right is always in sort order
// currencyA is treated as the preferred base currency
export default function SwapTabHeader({
  autoSlippage,
  // autoSlippedTick,
  autoPremiumDepositPercent,
  isLimitOrder,
}: {
  autoSlippage?: Percent
  // autoSlippedTick?: Percent
  autoPremiumDepositPercent?: Percent
  isLimitOrder?: boolean
}) {
  const { activeTab } = useSwapState()
  const { onActiveTabChange } = useSwapActionHandlers()

  const handleTabChange = useCallback(
    (active: ActiveSwapTab) => {
      onActiveTabChange(active)
    },
    [onActiveTabChange]
  )
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
      <TabWrapper>
        <TabElement
          onClick={() => handleTabChange(ActiveSwapTab.LONG)}
          isActive={activeTab === ActiveSwapTab.LONG}
          // selectedTab={selectedTab}
          tabValue="Long"
          fontSize="14px"
          first={true}
          activeTab={activeTab}
        >
          <Trans>Long</Trans>
        </TabElement>
        <TabElement
          onClick={() => handleTabChange(ActiveSwapTab.SHORT)}
          isActive={activeTab === ActiveSwapTab.SHORT}
          // selectedTab={selectedTab}
          tabValue="Short"
          fontSize="14px"
          activeTab={activeTab}
        >
          <Trans>Short</Trans>
        </TabElement>
        <TabElement
          onClick={() => handleTabChange(ActiveSwapTab.SWAP)}
          isActive={activeTab === ActiveSwapTab.SWAP}
          // selectedTab={selectedTab}
          tabValue="Swap"
          fontSize="14px"
          last={true}
          activeTab={activeTab}
        >
          <Trans>Swap</Trans>
        </TabElement>
      </TabWrapper>
      <SettingWrapper>
        <SettingsTab
          allowedSlippage={autoSlippage}
          // autoSlippedTick={autoSlippedTick}
          autoPremiumPercent={autoPremiumDepositPercent}
          isLimitOrder={isLimitOrder}
        />
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

const TabWrapper = styled.div`
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
  tabValue?: string
  isTrade?: number
  first?: boolean
  last?: boolean
  activeTab?: number
}>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 6px 8px;
  justify-content: center;
  height: 100%;
  border: none;
  border-radius: 10px;
  background: ${({ activeTab, theme, isActive }) => {
    if (isActive) {
      if (activeTab === 0) {
        return theme.accentSuccessSoft
      } else if (activeTab === 1) {
        return theme.accentFailureSoft
      } else {
        return theme.accentActiveSoft
      }
    }
    return 'none'
  }};
  color: ${({ theme }) => {
    return theme.textSecondary
  }};
  font-size: ${({ fontSize }) => fontSize ?? '.9rem'};
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  margin-right: ${({ last }) => (last ? '8px' : '0')};
  margin-top: 15px;

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
