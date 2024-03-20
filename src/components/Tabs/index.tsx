import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import SettingsTab from 'components/Settings'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import React, { useCallback } from 'react'
import { useMarginTradingActionHandlers } from 'state/marginTrading/hooks'
import { ActiveSwapTab } from 'state/swap/actions'
import { useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import styled from 'styled-components/macro'
import { colors } from 'theme/colors'
// import Styles from "./tabs.styles.less";

const TabHeader = styled.div<{ isActive: boolean; first: boolean; last: boolean }>`
  padding: 10px 20px;
  background-color: ${({ theme, isActive }) => (isActive ? theme.backgroundSurface : theme.background)};
  cursor: pointer;
  // border-radius: 10px;
  // border-top-left-radius: ${({ first }) => (first ? '8px' : '0')};
  // border-top-right-radius: ${({ last }) => (last ? '8px' : '0')};
  color: ${({ theme, isActive }) => (isActive ? theme.textSecondary : '#97969c')};
  /* font-size: 14px; */
  font-size: 16px;
  font-weight: 500;

  :hover {
    user-select: initial;
    color: ${({ theme }) => theme.textSecondary};
  }
`

const SettingWrapper = styled.div`
  display: flex;
  margin-right: 20px;
  width: 8px;
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

  const { onMarginChange, onLeverageFactorChange } = useMarginTradingActionHandlers()

  const [debouncedLeverageFactor, onDebouncedLeverageFactor] = useDebouncedChangeHandler('', onLeverageFactorChange)

  const handleTabChange = useCallback(
    (active: ActiveSwapTab) => {
      onMarginChange('')
      onDebouncedLeverageFactor('')
      onActiveTabChange(active)
    },
    [onActiveTabChange, onMarginChange, onDebouncedLeverageFactor]
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
          fontSize="16px"
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
          fontSize="16px"
          activeTab={activeTab}
        >
          <Trans>Short</Trans>
        </TabElement>
        <TabElement
          onClick={() => handleTabChange(ActiveSwapTab.SWAP)}
          isActive={activeTab === ActiveSwapTab.SWAP}
          // selectedTab={selectedTab}
          tabValue="Swap"
          fontSize="16px"
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
  column-gap: 5px;
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
  padding: 0.25rem;
  justify-content: center;
  height: 100%;
  min-height: 30px;
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
    return colors.gray650
  }};
  color: ${({ theme, isActive }) => {
    if (isActive) return theme.textSecondary
    return theme.textPrimary
  }};
  opacity: ${({ theme, isActive }) => {
    if (isActive) return 1
    return 0.5
  }};;
  font-size: ${({ fontSize }) => fontSize ?? '.9rem'};
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.4s ease;
  min-width: inherit;

  :hover {
    user-select: initial;
    color: ${({ isTrade, theme }) => theme.textSecondary};
    opacity: 1;
  }

  :active {
    user-select: initial;
    color: ${({ isTrade, theme }) => (isTrade === 0 ? theme.textSecondary : 'none')};
    // background: ${({ isTrade, theme }) => (isTrade === 0 ? theme.deprecated_primary5 : 'none')};
    transition: left 0.5s;
  }
`
