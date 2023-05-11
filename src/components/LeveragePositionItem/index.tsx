import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import { Currency, Percent, Price, Token } from '@uniswap/sdk-core'
import { FeeAmount, Position, tickToPrice } from '@uniswap/v3-sdk'
import RangeBadge from 'components/Badge/RangeBadge'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import HoverInlineText from 'components/HoverInlineText'
import Loader from 'components/Icons/LoadingSpinner'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { useCurrency, useToken } from 'hooks/Tokens'
import useIsTickAtLimit from 'hooks/useIsTickAtLimit'
import { usePool } from 'hooks/usePools'
import { useMemo , useState, useCallback} from 'react'
import { Link } from 'react-router-dom'
import { Bound } from 'state/mint/v3/actions'
import styled from 'styled-components/macro'
import { HideSmall, MEDIA_WIDTHS, SmallOnly, ThemedText } from 'theme'
import { formatTickPrice } from 'utils/formatTickPrice'
import { unwrappedToken } from 'utils/unwrappedToken'
import { hasURL } from 'utils/urlChecks'
import { SmallButtonPrimary,ButtonPrimary } from 'components/Button'
import ConfirmLeverageSwapModal from 'components/swap/confirmLeverageSwapModal'
import ConfirmAddPremiumModal from 'components/swap/ConfirmAddPremiumModal'
import { DAI, USDC_MAINNET, USDT, WBTC, WRAPPED_NATIVE_CURRENCY } from '../../constants/tokens'
import Column, { AutoColumn } from 'components/Column'
import { useSwapState } from 'state/swap/hooks'
import { Field } from '@uniswap/widgets'
import { monthYearDayFormatter } from 'utils/formatChartTimes'
import { useActiveLocale } from 'hooks/useActiveLocale'
import moment from "moment"
import { BigNumber as BN } from "bignumber.js"
import ClosePositionModal, { AddPremiumModal } from 'components/swap/CloseLeveragePositionModal'
import { useWeb3React } from '@web3-react/core'
import {  useLeveragePositionFromTokenId } from 'hooks/useV3Positions'

const ResponsiveButtonPrimary = styled(SmallButtonPrimary)`
  border-radius: 12px;
  font-size: 13px;
  padding: 3px 4px;
  width: fit-content;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex: 1 1 auto;
    width: 100%;
  `};
`

const ItemWrapper = styled.div`
  align-items: center;
  display: flex;
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: ${({ theme }) => theme.textPrimary};
  padding: 16px;
  text-decoration: none;
  font-weight: 500;

  & > div:not(:first-child) {
    text-align: center;
  }
  :hover {
    background-color: ${({ theme }) => theme.hoverDefault};
  }

  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToSmall}px) {
    /* flex-direction: row; */
  }

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex-direction: column;
    row-gap: 8px;
  `};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.background};
  margin: 4px;
`

const DataLineItem = styled.div`
  font-size: 14px;
`

const RangeLineItem = styled(DataLineItem)`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
  width: 100%;
`

const DoubleArrow = styled.span`
  font-size: 12px;
  margin: 0 2px;
  color: ${({ theme }) => theme.textTertiary};
`

const RangeText = styled(ThemedText.Caption)`
  font-size: 12px !important;
  word-break: break-word;
  padding: 0.25rem 0.25rem;
  border-radius: 8px;
`

const ValueLabel = styled.div`

`

const FeeTierText = styled(ThemedText.UtilityBadge)`
  font-size: 10px !important;
  margin-left: 14px !important;
`
const ExtentsText = styled(ThemedText.Caption)`
  color: ${({ theme }) => theme.textTertiary};
  display: inline-block;
  line-height: 16px;
  margin-right: 4px !important;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    display: none;
  `};
`

const PrimaryPositionIdData = styled(AutoColumn)`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  > * {
    margin-right: 2px;
  }
  margin-bottom: 2px;
`
const SymbolLabel = ( {value}: { value: string|undefined}) => (
 
    <FeeTierText>
      {value}
    </FeeTierText>
)
const ItemValueLabel = ({label, value}: { label: string, value: string}) => (
  <Column style={{width: "fit-content"}}>
    <ThemedText.Caption style={{whiteSpace: "nowrap"}}>
      {label}
    </ThemedText.Caption>
    <ThemedText.SubHeader>
      {value}
    </ThemedText.SubHeader>
  </Column>
)

// interface PositionListItemProps {
//   token0: string
//   token1: string
//   tokenId: BigNumber
//   fee: number
//   liquidity: BigNumber
//   tickLower: number
//   tickUpper: number
// }

interface LeveragePositionListItemProps {
  tokenId: string
  totalLiquidity: string // totalPosition
  totalDebt: string // total debt in output token
  totalDebtInput: string // total debt in input token
  // borrowedLiquidity: string
  // creationTick: string
  isToken0: boolean
  openTime: string
  repayTime: string
  tickStart: string // borrowStartTick
  tickFinish: string // borrowFinishTick
  initialCollateral: string
  recentPremium: string
}


export function getPriceOrderingFromPositionForUI(position?: Position): {
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  quote?: Token
  base?: Token
} {
  if (!position) {
    return {}
  }

  const token0 = position.amount0.currency
  const token1 = position.amount1.currency

  // if token0 is a dollar-stable asset, set it as the quote token
  const stables = [DAI, USDC_MAINNET, USDT]
  if (stables.some((stable) => stable.equals(token0))) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1,
    }
  }

  // if token1 is an ETH-/BTC-stable asset, set it as the base token
  const bases = [...Object.values(WRAPPED_NATIVE_CURRENCY), WBTC]
  if (bases.some((base) => base && base.equals(token1))) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1,
    }
  }

  // if both prices are below 1, invert
  if (position.token0PriceUpper.lessThan(1)) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1,
    }
  }

  // otherwise, just return the default
  return {
    priceLower: position.token0PriceLower,
    priceUpper: position.token0PriceUpper,
    quote: token1,
    base: token0,
  }
}

export default function LeveragePositionItem({
  tokenId,
  tickFinish,
  tickStart,
  totalLiquidity,

  totalDebtInput,
  totalDebt, 
  isToken0,
  openTime,
  repayTime, 
  initialCollateral,
  recentPremium
}: LeveragePositionListItemProps) {
  // const token0 = useToken(token0Address)
  // const token1 = useToken(token1Address)
  const { 
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    leverageManagerAddress
   } = useSwapState()
    const { account } = useWeb3React()
   const swapInputCurrency = useCurrency(inputCurrencyId)
   const swapOutputCurrency = useCurrency(outputCurrencyId)
  const inputIsToken0 = useMemo(() => {
    if (swapInputCurrency && swapOutputCurrency) {
      return swapInputCurrency.wrapped.sortsBefore(swapOutputCurrency.wrapped)
    } 
    return false;
  }, [inputCurrencyId, outputCurrencyId])

  const currency0 = inputIsToken0 ? swapInputCurrency : swapOutputCurrency
  const currency1 = inputIsToken0 ? swapOutputCurrency : swapInputCurrency

  const [showClose, setShowClose] = useState(false); 
  const [showAddPremium, setShowAddPremium] = useState(false);
  const locale = useActiveLocale()
  const dateFormatter = monthYearDayFormatter(locale)
  // const collateral = (totalLiquidity - totalDebt)
  const handleConfirmDismiss = ()=>{
    setShowClose(false); 
  } 
  const handlePremiumConfirmDismiss = ()=>{
    setShowAddPremium(false); 
  }

  const { loading, error, position} = useLeveragePositionFromTokenId(tokenId)
  const token0 = useCurrency(position?.token0Address ?? undefined)
  const token1 = useCurrency(position?.token1Address ?? undefined)
  const [poolState, pool] = usePool(token0 ?? undefined, token1 ?? undefined, position?.poolFee)

  // enter token0 price in token1
  const enterPrice = new BN(1)
  // token0 price.
  const currentPrice = pool?.token0Price.toSignificant(3)
  const totalValue = isToken0? (Number(totalLiquidity)*Number(currentPrice)).toFixed(3).toString() : 
     (Number(totalLiquidity)/Number(currentPrice)).toFixed(3).toString();
  const PNL = useMemo(() => {
    let x = isToken0 ? 1:Number(currentPrice)// : 1/Number(currentPrice)
    // console.log("x", x, totalDebtInput, totalLiquidity, currentPrice, enterPrice)
    return !isToken0?(Number(totalLiquidity))*(1/Number(currentPrice) - 1/Number(enterPrice?.toFixed(10)))
          : (Number(totalLiquidity))*(Number(currentPrice) - Number(enterPrice?.toFixed(10)))
  }, [pool, enterPrice])
  const remainingPremium = ((1- (Date.now() - Number(repayTime)*1000)/86400000)*
            Number(recentPremium)).toFixed(7)
  // &nbsp;{currency0?.symbol}&nbsp;/&nbsp;{currency1?.symbol}
  return (
    <ItemWrapper>
      <RowBetween width = {"100"}>
        <PrimaryPositionIdData>
          <AutoColumn>
            <DoubleCurrencyLogo currency0={currency0 ?? undefined} currency1={currency1 ?? undefined} size={18} margin />
            <ThemedText.Caption>
              {(Number(totalValue)/Number(initialCollateral)).toFixed(1).toString()}x Long {isToken0 ? currency0?.symbol : currency1?.symbol}/ 
              {isToken0 ? currency1?.symbol : currency0?.symbol}
            </ThemedText.Caption>
            {true ? (
              <RangeLineItem>
                <RangeText>
                  <ExtentsText>
                    <Trans>Enter Price: </Trans>
                  </ExtentsText>
                  <Trans>
                    <span>
                    </span>
                    <HoverInlineText text={currency0?.symbol} /> per <HoverInlineText text={currency1?.symbol ?? ''} />
                  </Trans>
                </RangeText>{' '}
                {/* <HideSmall>
                  <DoubleArrow>↔</DoubleArrow>{' '}
                </HideSmall>
               <<SmallOnly>
                  <DoubleArrow>↔</DoubleArrow>{' '}
                </SmallOnly>
                RangeText>
                  <ExtentsText>
                    <Trans>Cur Price:</Trans>
                  </ExtentsText>
                  <Trans>
                    <span>
                      {pool?.token0Price.toSignificant(3) ?? "-"}{' '}
                    </span>
                    <HoverInlineText text={currency0?.symbol} /> per{' '}
                    <HoverInlineText maxCharacters={10} text={currency1?.symbol} />
                  </Trans>
                </RangeText>*/}
              </RangeLineItem>
            ) : (
              <Loader />
            )}
          </AutoColumn>
        </PrimaryPositionIdData>
        <AutoColumn gap="px" style={{marginRight: "15px"}}>
            <ItemValueLabel label={"Position"} value={Number(totalLiquidity).toFixed(2).toString() + " "}/>
            <SymbolLabel value= {(isToken0 ? currency0?.symbol : currency1?.symbol)} />
        </AutoColumn>
        <AutoColumn gap="2px" style={{marginRight: "15px"}}>
            <ItemValueLabel label={"Position Value"} value={Number(totalValue).toFixed(2).toString()}/>
            <SymbolLabel value= {(!isToken0 ? currency0?.symbol : currency1?.symbol)} />
        </AutoColumn>
          <AutoColumn gap="2px" style={{marginRight: "15px"}}>
          <ItemValueLabel label={"Collateral"} value={new BN(initialCollateral).toString()}/>
          <SymbolLabel value= {(isToken0 ? currency0?.symbol : currency1?.symbol)} />          
          </AutoColumn>
          <AutoColumn gap="8px" style={{marginRight: "15px"}}>
          <ItemValueLabel label={"Debt"} value={new BN(totalDebtInput).toString()}/>
          <SymbolLabel value= {(isToken0 ? currency0?.symbol : currency1?.symbol)} />          
          </AutoColumn>
          <AutoColumn gap="2px" style={{marginRight: "15px"}}>
          <ItemValueLabel label={"Remaining Premium "} value={
            (Number(remainingPremium)>0?remainingPremium.toString():"0" )}/>
          <SymbolLabel value= {(isToken0 ? currency0?.symbol : currency1?.symbol)} />          

          </AutoColumn>
          <AutoColumn gap="2px" style={{marginRight: "10px" }} >
            <ResponsiveButtonPrimary 
            //data-cy="join-pool-button" id="join-pool-button"
             onClick={() => setShowClose(!showClose)}>
              <Trans>Close</Trans>
            </ResponsiveButtonPrimary>
          <ResponsiveButtonPrimary onClick={() => setShowAddPremium(!showAddPremium)} >
            <Trans>Add Premium</Trans>
          </ResponsiveButtonPrimary>
          </AutoColumn>

      </RowBetween>
      <RowBetween>
        <AutoRow>
          <RangeText>
            <ExtentsText>
              <Trans>PnL(without fees/slippage):</Trans>
            </ExtentsText>
            <Trans>
              <span>
                {(new BN(PNL).toFixed(3) ?? "-") + ` ${isToken0 ? currency1?.symbol : currency0?.symbol}`}
              </span>
            </Trans>
          </RangeText>


        </AutoRow>
        <AutoRow gap="8px">

          {showClose && (
                      <ClosePositionModal
                      isOpen={showClose}
                      trader={account}
                      leverageManagerAddress={leverageManagerAddress ?? undefined}
                      tokenId={tokenId}
                      onDismiss={handleConfirmDismiss}
                      onAcceptChanges={() => {}}
                      onConfirm={() => {}}
                    />
          )}
          {showAddPremium && (
            <AddPremiumModal
            trader={account}
            isOpen={showAddPremium}
            tokenId={tokenId}
            leverageManagerAddress={leverageManagerAddress ?? undefined}
            onDismiss={handlePremiumConfirmDismiss}
            onAcceptChanges={() => {}}
            onConfirm={() => {}}
            />
          )}
        </AutoRow>
      </RowBetween>
    </ItemWrapper>
  )
}
