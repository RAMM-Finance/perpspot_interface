import { Percent } from '@uniswap/sdk-core'
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
  return (
    <>
      <StyledSwapHeader>
        <SwapTabHeader
          autoSlippage={allowedSlippage}
          autoPremiumDepositPercent={autoPremiumDepositPercent}
          isLimitOrder={isLimitOrder}
        />
      </StyledSwapHeader>
    </>
  )
}

const StyledSwapHeader = styled.div`
  margin-bottom: 0.5rem;
  width: 100%;
  color: ${({ theme }) => theme.textSecondary};
`
