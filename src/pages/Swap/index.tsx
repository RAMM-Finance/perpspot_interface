import { Currency, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
import { NATIVE_CHAIN_ID } from 'constants/tokens'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { ReactNode } from 'react'
import { useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { InterfaceTrade } from 'state/routing/types'
import { TradeState } from 'state/routing/types'
import { queryParametersToCurrencyState } from 'state/swap/hooks'
import { SwapAndLimitContextProvider, SwapContextProvider } from 'state/swap/SwapContext'
import styled from 'styled-components/macro'

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

function getCurrencyURLAddress(currency?: Currency): string {
  if (!currency) return ''

  if (currency.isToken) {
    return currency.address
  }
  return NATIVE_CHAIN_ID
}

export default function SwapPage() {
  const location = useLocation()

  const { chainId } = useWeb3React()

  const parsedQs = useParsedQueryString()

  const parsedCurrencyState = useMemo(() => {
    return queryParametersToCurrencyState(parsedQs)
  }, [parsedQs])


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
