import { SwapWrapper } from "../../components/swap/styleds";
import { useWeb3React } from "@web3-react/core";
import SwapTabContent from "./swapModal";
import styled from "styled-components/macro";
import { InterfaceTrade } from "state/routing/types";
import { Currency, TradeType } from "@uniswap/sdk-core";
import { TradeState } from "state/routing/types";
import { ReactNode, useState } from "react";
import { useCallback } from "react";
import { CurrencyState } from "state/swap/SwapContext";
import { NATIVE_CHAIN_ID } from "constants/tokens";
import { addressesAreEquivalent } from "utils/addressesAreEquivalent";
import { getTokenDetailsURL } from "graphql/data/util";
import { useLocation } from "react-router-dom";
import { SwapAndLimitContextProvider, SwapContextProvider } from "state/swap/SwapContext";
import { isSupportedChain } from "constants/chains";
import useParsedQueryString from "hooks/useParsedQueryString";
import { useMemo } from "react";
import { queryParametersToCurrencyState } from "state/swap/hooks";
import { useCurrency } from "hooks/Tokens";
import { NetworkAlert } from "components/NetworkAlert/NetworkAlert";
import Tokens from "components/WalletDropdown/MiniPortfolio/Tokens";


export const PageWrapper = styled.div`
  padding: 68px 8px 0px;
  max-width: 480px;
  width: 100%;
`;

export const InputHeader = styled.div`
  padding-left: 6px;
  padding-top: 3px;
`;

export const ArrowContainer = styled.div`
  display: inline-block;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  rotate: -45deg;
  width: 100%;
  height: 100%;
`;

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
`;

export const DetailsSwapSection = styled(SwapSection)`
  border: none;
  width: 100%;
`;

export const InputSection = styled(SwapSection)`
  background-color: ${({ theme }) => theme.surface1};
  margin-bottom: 10px;
  padding: 10px;
  padding-top: 8px;
  padding-bottom: 8px;
  margin-top: 5px;
`;

export const OutputSwapSection = styled(SwapSection)<{
  showDetailsDropdown: boolean;
}>`
  padding: 10px;
  background-color: ${({ theme }) => theme.surface1};
`;

export function getIsValidSwapQuote(
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined,
  tradeState: TradeState,
  swapInputError?: ReactNode
): boolean {
  return (
    !!swapInputError &&
    !!trade &&
    (tradeState === TradeState.VALID || tradeState === TradeState.SYNCING)
  );
}

function getCurrencyURLAddress(currency?: Currency): string {
  if (!currency) return "";

  if (currency.isToken) {
    return currency.address;
  }
  return NATIVE_CHAIN_ID;
}

export default function SwapPage() {
  const location = useLocation()

  const { chainId } = useWeb3React()
  
  // const chainId = isSupportedChain(connectedChainId) ? connectedChainId : 
  // const chainId = supportedChainId || ChainId.MAINNET

  const parsedQs = useParsedQueryString()
  console.log("PARSED QS")
  console.log(parsedQs)
  const parsedCurrencyState = useMemo(() => {
    return queryParametersToCurrencyState(parsedQs)
  }, [parsedQs])



  // const initialInputCurrency = useCurrency(parsedCurrencyState.inputCurrencyId) || undefined;
  // const initialOutputCurrency = useCurrency(parsedCurrencyState.outputCurrencyId) || undefined;

  return (
      <PageWrapper>
        <Swap
          chainId={chainId}
        />
        <NetworkAlert />
      </PageWrapper>
  )
}

interface SwapProps {
  chainId: number | undefined;
  // onCurrencyChange: (tokens: CurrencyState) => void;
  // initialInputCurrency?: Currency | undefined;
  // initialOutputCurrency?: Currency | undefined;
}

export function Swap({ 
  chainId,
  // onCurrencyChange,
  // initialInputCurrency,
  // initialOutputCurrency,
 }: SwapProps) {

  // const [initialInputCurrency, setInitialInputCurrency] = useState<Currency>()
  // const [initialOutputCurrency, setInitialOutputCurrency] = useState<Currency>()

  // const handleCurrencyChange = useCallback(
  //   (Tokens: CurrencyState) => {
  //     console.log("HANDLE CURRENCY CHANGE")
  //     console.log(Tokens.inputCurrency)
  //     if (Tokens.inputCurrency) {
  //       // const input = useCurrency(Tokens.inputCurrency)
  //       // setInitialInputCurrency(input)
  //     }
  //     if (Tokens.outputCurrency) {
  //       // const output = useCurrency(Tokens.outputCurrency)
  //       // setInitialOutputCurrency(output)
  //     }
      
      
  //   },
  //   []
  // )

  return (
    <SwapAndLimitContextProvider
    chainId={chainId}
    // initialInputCurrency={initialInputCurrency}
    // initialOutputCurrency={initialOutputCurrency}
    >
      <SwapContextProvider>
        <PageWrapper>
          <SwapWrapper chainId={chainId} id="swap-page">
            <SwapTabContent />
          </SwapWrapper>
        </PageWrapper>
      </SwapContextProvider>
    </SwapAndLimitContextProvider>
  );
}
