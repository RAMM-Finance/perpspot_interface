import { Percent } from '@uniswap/sdk-core'
import { SmallButtonPrimary } from 'components/Button'
import SwapTabHeader from 'components/Tabs'
import { useCallback } from 'react'
import { ActiveSwapTab } from 'state/swap/actions'
import { useSwapActionHandlers } from 'state/swap/hooks'
import styled from 'styled-components/macro'

import SettingsTab from '../Settings'

type SwapHeaderProps = {
  activeTab: ActiveSwapTab
  allowedSlippage: Percent
}

export default function SwapHeader({ activeTab, allowedSlippage }: SwapHeaderProps) {
  const { onActiveTabChange } = useSwapActionHandlers()

  const handleTabChange = useCallback(() => {
    onActiveTabChange(activeTab === ActiveSwapTab.TRADE ? ActiveSwapTab.BORROW : ActiveSwapTab.TRADE)
  }, [activeTab])
  return (
    <>
      <SettingTabWarp>
        <SettingsTab placeholderSlippage={allowedSlippage} />
      </SettingTabWarp>
      <StyledSwapHeader>
        <SwapTabHeader activeTab={activeTab} handleSetTab={handleTabChange} />
      </StyledSwapHeader>
    </>
  )
}

const StyledSwapHeader = styled.div`
  margin-bottom: 20px;
  width: 100%;
  color: ${({ theme }) => theme.textSecondary};
`
const ResponsiveButtonPrimary = styled(SmallButtonPrimary)`
  border-radius: 16px;
  font-size: 12px;
  padding: 5px 6px;
  width: fit-content;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex: 1 1 auto;
    width: 100%;
  `};
`
const SettingTabWarp = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0 12px;
  margin-bottom: 10px;
  margin-right: 5px;
`
