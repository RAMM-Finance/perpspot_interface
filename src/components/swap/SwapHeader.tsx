import { Percent } from '@uniswap/sdk-core'
import { SmallButtonPrimary } from 'components/Button'
import SwapTabHeader from 'components/Tabs'
import { useCallback } from 'react'
import { ActiveSwapTab } from 'state/swap/actions'
import { useSwapActionHandlers } from 'state/swap/hooks'
import styled from 'styled-components/macro'

import { RowBetween, RowFixed } from '../Row'
import SettingsTab from '../Settings'

const StyledSwapHeader = styled.div`
  padding: 0px 12px;
  margin-bottom: 8px;
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
export default function SwapHeader({ activeTab, allowedSlippage }: { activeTab: ActiveSwapTab, allowedSlippage: Percent }) {
  const { onActiveTabChange } = useSwapActionHandlers();

  const handleTabChange = useCallback(() => {
    onActiveTabChange(activeTab === ActiveSwapTab.TRADE ? ActiveSwapTab.BORROW : ActiveSwapTab.TRADE)
  }, [activeTab])
  return (
    <StyledSwapHeader>
      <RowBetween>
        <RowFixed>
          <SwapTabHeader activeTab={activeTab} handleSetTab={handleTabChange}/>
        </RowFixed>

        <RowFixed>
          <SettingsTab placeholderSlippage={allowedSlippage} />
        </RowFixed>
      </RowBetween>
    </StyledSwapHeader>
  )
}

