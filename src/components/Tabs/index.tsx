import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import SettingsTab from 'components/Settings'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useMarginTradingActionHandlers, useMarginTradingState } from 'state/marginTrading/hooks'
import { ActiveSwapTab } from 'state/swap/actions'
import { useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import { useCurrentPool, useSelectInputCurrency } from 'state/user/hooks'
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
  const { onActiveTabChange, onSetMarginInPosToken } = useSwapActionHandlers()

  const { onMarginChange, onLeverageFactorChange, onPremiumCurrencyToggle } = useMarginTradingActionHandlers()

  const [debouncedLeverageFactor, onDebouncedLeverageFactor] = useDebouncedChangeHandler('', onLeverageFactorChange)
  const { marginInPosToken } = useMarginTradingState()

  // const inputIsToken0: boolean | undefined = useAppSelector((state) => state.user.currentInputInToken0)
  const currentPool = useCurrentPool()
  const inputIsToken0 = currentPool?.inputInToken0
  const switchTokens = useSelectInputCurrency()

  useEffect(() => {
    if (activeTab === 0 && inputIsToken0 !== undefined && localStorage.getItem('defaultInputToken') === null) {
      localStorage.setItem('defaultInputToken', JSON.stringify(inputIsToken0))
    }
    return
  }, [activeTab, inputIsToken0])

  const keyExists = localStorage.getItem('defaultInputToken') === null

  const initial = useMemo(() => {
    if (keyExists) {
      return undefined
    } else {
      return JSON.parse(localStorage.getItem('defaultInputToken') || '{}')
    }
  }, [keyExists])

  const handleTabChange = useCallback(
    (active: ActiveSwapTab) => {
      if (active === activeTab) {
        return
      }
      if (marginInPosToken) {
        onSetMarginInPosToken(!marginInPosToken)
      }
      switchTokens(!inputIsToken0)
      onPremiumCurrencyToggle(false)
      onMarginChange('')
      onDebouncedLeverageFactor('')
      onActiveTabChange(active)
    },
    [
      onActiveTabChange,
      onMarginChange,
      onDebouncedLeverageFactor,
      switchTokens,
      onSetMarginInPosToken,
      marginInPosToken,
      activeTab,
      onPremiumCurrencyToggle,
      initial,
    ]
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
  padding: 0.25rem;
  justify-content: center;
  height: 100%;
  border-style: solid;
  border-width: 2px;
  height: 2rem;
  border-color: ${({ activeTab, theme, isActive }) =>
    isActive
      ? activeTab === 0
        ? theme.longBtnBorder
        : activeTab === 1
        ? theme.shortBtnBorder
        : theme.swapBtnBorder
      : theme.inactiveBtnBorder};

  background: ${({ activeTab, theme, isActive }) =>
    isActive
      ? activeTab === 0
        ? theme.longBtnBackground
        : activeTab === 1
        ? theme.shortBtnBackground
        : theme.swapBtnBackground
      : theme.inactiveBtnBackground};

  color: ${({ isActive, theme }) => (isActive ? theme.textSecondary : theme.inactiveColor)};

  font-size: ${({ fontSize }) => fontSize ?? '.9rem'};
  font-weight: 900;
  white-space: nowrap;
  cursor: pointer;

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
