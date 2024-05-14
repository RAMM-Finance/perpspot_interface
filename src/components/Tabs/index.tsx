import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import SettingsTab from 'components/Settings'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import React, { useCallback, useMemo } from 'react'
import { useMarginTradingActionHandlers, useMarginTradingState } from 'state/marginTrading/hooks'
import { useCurrentPool, useSelectInputCurrency } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { getDefaultBaseQuote } from 'utils/getBaseQuote'
// import Styles from "./tabs.styles.less";

const TabHeader = styled.div<{ isActive: boolean; first: boolean; last: boolean }>`
  padding: 10px 20px;
  background-color: ${({ theme, isActive }) => (isActive ? theme.backgroundSurface : theme.background)};
  cursor: pointer;
  // border-radius: 10px;
  // border-top-left-radius: ${({ first }) => (first ? '8px' : '0')};
  // border-top-right-radius: ${({ last }) => (last ? '8px' : '0')};
  color: ${({ theme, isActive }) => (isActive ? theme.textSecondary : theme.inactiveColor)};
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

export function useCurrentTabIsLong() {
  const currentPool = useCurrentPool()
  const inputIsToken0 = currentPool?.inputInToken0
  const { chainId } = useWeb3React()
  return useMemo(() => {
    if (currentPool && chainId) {
      const { poolKey } = currentPool
      const [base, quote, inputInToken0ByDefault] = getDefaultBaseQuote(poolKey.token0, poolKey.token1, chainId)
      if (inputIsToken0 && inputInToken0ByDefault) {
        return true
      } else if (!inputIsToken0 && !inputInToken0ByDefault) {
        return true
      } else {
        return false
      }
    }
    return undefined
  }, [chainId, inputIsToken0, currentPool])
}

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
  /**
   * activeTab can be derived from the current pool
   *
   */
  const { onSetIsSwap } = useMarginTradingActionHandlers()
  const { isSwap } = useMarginTradingState()

  const { onMarginChange, onLeverageFactorChange, onPremiumCurrencyToggle, onSetMarginInPosToken } =
    useMarginTradingActionHandlers()

  const [debouncedLeverageFactor, onDebouncedLeverageFactor] = useDebouncedChangeHandler('', onLeverageFactorChange)
  const { marginInPosToken } = useMarginTradingState()

  // const inputIsToken0: boolean | undefined = useAppSelector((state) => state.user.currentInputInToken0)
  const currentPool = useCurrentPool()
  const setInputIsToken0 = useSelectInputCurrency()

  const isLong = useCurrentTabIsLong()
  const { chainId } = useWeb3React()

  const handleTabChange = useCallback(
    (_isSwap: boolean, _isLong: boolean) => {
      if (!currentPool || !chainId) return
      if (isSwap && _isSwap === isSwap) {
        return
      } else if (!isSwap && !_isSwap && isLong === _isLong) {
        return
      }
      if (!_isSwap) {
        if (marginInPosToken) {
          onSetMarginInPosToken(!marginInPosToken)
        }
        const [, , inputInToken0ByDefault] = getDefaultBaseQuote(
          currentPool.poolKey.token0,
          currentPool.poolKey.token1,
          chainId
        )
        // if _isLong
        if (_isLong) {
          setInputIsToken0(inputInToken0ByDefault)
        } else {
          setInputIsToken0(!inputInToken0ByDefault)
        }

        onPremiumCurrencyToggle(false)
        onMarginChange('')
        onDebouncedLeverageFactor('')
        onSetIsSwap(_isSwap)
      } else {
        onMarginChange('')
        onDebouncedLeverageFactor('')
        onSetIsSwap(_isSwap)
      }
    },
    [
      onSetIsSwap,
      onMarginChange,
      onDebouncedLeverageFactor,
      setInputIsToken0,
      chainId,
      currentPool,
      isLong,
      onSetMarginInPosToken,
      marginInPosToken,
      onPremiumCurrencyToggle,
      isSwap,
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
          onClick={() => handleTabChange(false, true)}
          isActive={isLong && !isSwap}
          // selectedTab={selectedTab}
          tabValue="Long"
          fontSize="14px"
          first={true}
          activeTab={0}
        >
          <Trans>Long</Trans>
        </TabElement>
        <TabElement
          onClick={() => handleTabChange(false, false)}
          isActive={!isLong && !isSwap}
          // selectedTab={selectedTab}
          tabValue="Short"
          fontSize="14px"
          activeTab={1}
        >
          <Trans>Short</Trans>
        </TabElement>
        <TabElement
          onClick={() => handleTabChange(true, false)}
          isActive={isSwap}
          // selectedTab={selectedTab}
          tabValue="Swap"
          fontSize="14px"
          last={true}
          activeTab={2}
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
