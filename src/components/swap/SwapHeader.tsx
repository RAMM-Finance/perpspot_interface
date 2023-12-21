import { Percent } from '@uniswap/sdk-core'
import { SmallButtonPrimary } from 'components/Button'
import SwapTabHeader from 'components/Tabs'
// import { useCallback } from 'react'
// import { useSwapActionHandlers } from 'state/swap/hooks'
import styled from 'styled-components/macro'

type SwapHeaderProps = {
  allowedSlippage?: Percent
  // autoSlippedTick?: Percent
  autoPremiumDepositPercent?: Percent
  isLimitOrder?: boolean
}

export default function SwapHeader({
  allowedSlippage,
  // autoSlippedTick,
  autoPremiumDepositPercent,
  isLimitOrder,
}: SwapHeaderProps) {
  // console.log(activeTab)
  return (
    <>
      <StyledSwapHeader>
        <SwapTabHeader
          autoSlippage={allowedSlippage}
          autoPremiumDepositPercent={autoPremiumDepositPercent}
          // autoSlippedTick={autoSlippedTick}
          isLimitOrder={isLimitOrder}
        />
      </StyledSwapHeader>
    </>
  )
}

const StyledSwapHeader = styled.div`
  margin-bottom: 12px;
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
