import { Currency, TradeType } from '@uniswap/sdk-core'
import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
import { ReactNode } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { TradeState } from 'state/routing/types'
import { SwapAndLimitContextProvider, SwapContextProvider } from 'state/swap/SwapContext'
import styled from 'styled-components/macro'
import { useChainId } from 'wagmi'

import { SwapWrapper } from '../../components/swap/styleds'
import SwapTabContent from './swapModal'

export const PageWrapper = styled.div`
  padding: 68px 8px 0px;
  max-width: 480px;
  width: 100%;
`

export const InputHeader = styled.div`
  padding-left: 6px;
  padding-top: 3px;
`

export const ArrowContainer = styled.div`
  display: inline-block;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  rotate: -45deg;
  width: 100%;
  height: 100%;
`

const SwapSection = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.backgroundSurface};
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;

  &:focus-within {
    border: 1px solid ${({ theme }) => theme.accentActive};
  }
`

export const DetailsSwapSection = styled(SwapSection)`
  border: none;
  width: 100%;
`

export const InputSection = styled(SwapSection)`
  background-color: ${({ theme }) => theme.surface1};
  margin-bottom: 10px;
  padding: 10px;
  padding-top: 8px;
  padding-bottom: 8px;
  margin-top: 5px;
`

export const OutputSwapSection = styled(SwapSection)<{
  showDetailsDropdown: boolean
}>`
  padding: 10px;
  background-color: ${({ theme }) => theme.surface1};
`

export function getIsValidSwapQuote(
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined,
  tradeState: TradeState,
  swapInputError?: ReactNode
): boolean {
  return !!swapInputError && !!trade && (tradeState === TradeState.VALID || tradeState === TradeState.SYNCING)
}

export default function SwapPage() {
  const chainId = useChainId()
  return (
    <PageWrapper>
      <Swap chainId={chainId} />
      <NetworkAlert />
    </PageWrapper>
  )
}

interface SwapProps {
  chainId: number | undefined
}

export function Swap({ chainId }: SwapProps) {
  return (
    <SwapAndLimitContextProvider chainId={chainId}>
      <SwapContextProvider>
        <PageWrapper>
          <SwapWrapper chainId={chainId} id="swap-page">
            <SwapTabContent />
          </SwapWrapper>
        </PageWrapper>
      </SwapContextProvider>
    </SwapAndLimitContextProvider>
  )
}
