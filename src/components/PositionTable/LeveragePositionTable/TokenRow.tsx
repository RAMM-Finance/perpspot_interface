import { Trans } from '@lingui/macro'
import { formatNumber, NumberType } from '@uniswap/conedison/format'
import { BigNumber as BN } from 'bignumber.js'
import { SmallButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import Row, { RowBetween, RowFixed } from 'components/Row'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { MouseoverTooltip } from 'components/Tooltip'
import { useCurrency } from 'hooks/Tokens'
import { useInvertedPrice } from 'hooks/useInvertedPrice'
import { useLiveTick } from 'hooks/useLiveTick'
import { useAtomValue } from 'jotai'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ForwardedRef, forwardRef, memo, useCallback, useState } from 'react'
import { CSSProperties, ReactNode } from 'react'
import { ArrowDown, ArrowUp, CornerDownRight, Info } from 'react-feather'
import { Box } from 'rebass'
import styled, { css, keyframes, useTheme } from 'styled-components/macro'
import { ClickableStyle, ThemedText } from 'theme'
import { MarginPositionDetails, TraderPositionKey } from 'types/lmtv2position'

import { MEDIUM_MEDIA_BREAKPOINT, SMALL_MEDIA_BREAKPOINT } from './constants'
import { LeveragePositionModal, TradeModalActiveTab } from './LeveragePositionModal'
import { LoadingBubble } from './loading'
import { ReactComponent as More } from './More.svg'
import PositionInfoModal from './PositionInfoModal'
import { PositionSortMethod, sortAscendingAtom, sortMethodAtom, useSetSortMethod } from './state'
import { computePrice } from './TokenTable'

export const EditCell = styled(RowBetween)<{ disabled: boolean }>`
  padding: 0;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
`

export const UnderlineText = styled(Row)`
  width: fit-content;
  align-items: flex-start;
  text-decoration: ${({ theme }) => `underline dashed ${theme.textPrimary}`};
`
const Cell = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 12px;
`
const StyledTokenRow = styled.div<{
  first?: boolean
  last?: boolean
  loading?: boolean
}>`
  cursor: pointer;
  background-color: transparent;
  display: grid;
  font-size: 12px;
  border-radius: 8px;
  column-gap: 0.75rem;
  grid-column-gap: 0.5rem;
  grid-template-columns: 0.7fr 1fr 1fr 1fr 1.2fr 1.2fr 1fr 0.7fr;
  line-height: 24px;
  ${({ first, last }) => css`
    height: ${first || last ? '72px' : '64px'};
    padding-top: ${first ? '8px' : '0px'};
    padding-bottom: ${last ? '8px' : '0px'};
  `}
  transition: ${({
    theme: {
      transition: { duration, timing },
    },
  }) => css`background-color ${duration.medium} ${timing.ease}`};
  width: 100%;
  transition-duration: ${({ theme }) => theme.transition.duration.fast};

  &:hover {
    ${({ loading, theme }) =>
      !loading &&
      css`
        background-color: ${theme.hoverDefault};
      `}
    ${({ last }) =>
      last &&
      css`
        border-radius: 0px 0px 8px 8px;
      `}
  }

  @media only screen and (max-width: 1600px) {
    /* grid-template-columns: 100px 105px 70px 100px 105px 120px 110px 70px; */
    /* grid-template-columns: 100px 110px 110px 100px 125px 155px 110px 70px; */
    grid-template-columns: 90px 100px 90px 90px 150px 150px 100px 100px;
  }

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    width: 100%;
    display: grid;
    border-bottom: 0.5px solid ${({ theme }) => theme.backgroundModule};

    :last-of-type {
      border-bottom: none;
    }
  }
`

const ClickableContent = styled.div`
  display: flex;
  text-decoration: none;
  color: ${({ theme }) => theme.textPrimary};
  align-items: center;
  cursor: pointer;
  width: fit-content;
`
const ClickableName = styled(ClickableContent)`
  gap: 8px;
  max-width: 100%;
`

const StyledMore = styled(More)`
  fill: ${({ theme }) => theme.textSecondary};
  &:hover {
    cursor: pointer;
  }
`

const StyledHeaderRow = styled(StyledTokenRow)`
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.backgroundOutline};
  border-radius: 8px 8px 0px 0px;
  color: ${({ theme }) => theme.textSecondary};
  padding: 0 10px;
  font-size: 14px;
  height: 48px;
  line-height: 16px;
  width: 100%;
  letter-spacing: -1px;
  &:hover {
    background-color: transparent;
  }
  /* @media only screen and (max-width: 1200px) {
    grid-template-columns: 90px 90px 110px 70px 120px 110px 120px 60px;
    grid-column-gap: 0.75rem;
    text-align: center;
  }  */
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    justify-content: space-between;
  }
`

const ListNumberCell = styled(Cell)<{ header: boolean }>`
  color: ${({ theme }) => theme.textSecondary};
  min-width: 32px;
  font-size: 14px;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    display: none;
  }
`
const DataCell = styled(Cell)<{ sortable: boolean }>`
  justify-content: flex-end;
  user-select: ${({ sortable }) => (sortable ? 'none' : 'unset')};
  transition: ${({
    theme: {
      transition: { duration, timing },
    },
  }) => css`background-color ${duration.medium} ${timing.ease}`};
`
const TvlCell = styled(DataCell)`
  padding-right: 8px;
  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    display: none;
  }
`
const NameCell = styled(Cell)`
  justify-content: flex-start;
  padding-right: 8px;
`
const PriceCell = styled(DataCell)`
  width: 1;
  justify-content: flex-start;
  padding-right: 8px;
`

const ActionCell = styled(DataCell)`
  justify-content: center;
  align-items: center;
  min-width: 60px;
`

const PercentChangeCell = styled(DataCell)`
  padding-right: 8px;
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    display: none;
  }
`
const PercentChangeInfoCell = styled(Cell)`
  display: none;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    display: flex;
    justify-content: flex-end;
    color: ${({ theme }) => theme.textSecondary};
    font-size: 12px;
    line-height: 16px;
  }
`
const PriceInfoCell = styled(Cell)`
  justify-content: flex-end;
  flex: 1;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    flex-direction: column;
    align-items: flex-end;
  }
`

const GreenText = styled.span`
  color: ${({ theme }) => theme.accentSuccess};
  cursor: pointer;
`

const RedText = styled.span`
  color: ${({ theme }) => theme.accentFailure};
`

const HeaderCellWrapper = styled.span<{ onClick?: () => void }>`
  display: flex;
  align-items: center;
  /* flex-flow: row nowrap; */
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'unset')};
  gap: 4px;
  justify-content: flex-start;

  width: 100%;
  white-space: nowrap;
  &:hover {
    ${ClickableStyle}
  }
`

const fadeInOutDanger = keyframes`
0%, 100% {
  opacity: 0.5;
}
50% {
  opacity: 1;
}

`

const StyledLoadedRow = styled.div<{ danger?: boolean }>`
  text-decoration: none;
  cursor: pointer;
  background-color: ${({ theme, danger }) => (danger ? theme.accentFailureSoft : 'transparent')};
  animation: ${({ danger }) =>
    danger
      ? css`
          ${fadeInOutDanger} 2s infinite
        `
      : 'none'};
  white-space: nowrap;
  border-radius: 8px;
  width: 100%;
  /* min-width: 700px; */
`

const MediumLoadingBubble = styled(LoadingBubble)`
  width: 65%;
`
const LongLoadingBubble = styled(LoadingBubble)`
  width: 90%;
`
const IconLoadingBubble = styled(LoadingBubble)`
  border-radius: 50%;
  width: 24px;
`
export const SparkLineLoadingBubble = styled(LongLoadingBubble)`
  height: 4px;
`

const InfoIconContainer = styled.div`
  margin-left: 2px;
  display: flex;
  align-items: center;
  cursor: help;
`
const PositionInfo = styled(AutoColumn)`
  margin-left: 8px;
`

const ActionText = styled(ThemedText.BodySmall)`
  white-space: nowrap;
`

const ActionButton = styled(SmallButtonPrimary)`
  height: 30px;
  line-height: 15px;
  min-width: 30px;
  background: transparent;
  &:hover {
    background-color: ${({ theme, disabled }) => !disabled && theme.backgroundOutline};
  }
`

const HEADER_DESCRIPTIONS: Record<PositionSortMethod, ReactNode | undefined> = {
  [PositionSortMethod.VALUE]: (
    <Trans>
      Position Value. If your position asset goes up by x%, your PnL goes up by your leverage * x%, denominated in your
      margin.
    </Trans>
  ),
  [PositionSortMethod.COLLATERAL]: <Trans>Initial Margin Deposited. Your PnL is denominated in your margin.</Trans>,
  [PositionSortMethod.RATE]: (
    <Trans>
      Current borrow rate per hour, continuously paid by your deposit. This is variable, and will change based on the
      underlying asset's price and utilization rates.{' '}
    </Trans>
  ),
  [PositionSortMethod.ENTRYPRICE]: <Trans>Your Entry and Current Price</Trans>,
  [PositionSortMethod.PNL]: <Trans>Profit/Loss based on mark price excluding slippage+fees+premiums</Trans>,
  [PositionSortMethod.REMAINING]: (
    <Trans>
      Remaining Interest that maintains this position. Your position is forced closed when your deposit is depleted.{' '}
    </Trans>
  ),
  [PositionSortMethod.ACTIONS]: '',
}

const SortingEnabled = {
  [PositionSortMethod.VALUE]: true,
  [PositionSortMethod.COLLATERAL]: true,
  [PositionSortMethod.RATE]: true,
  [PositionSortMethod.ENTRYPRICE]: false,
  [PositionSortMethod.PNL]: true,
  [PositionSortMethod.REMAINING]: true,
  [PositionSortMethod.ACTIONS]: false,
}

/* Get singular header cell for header row */
function HeaderCell({
  category,
}: {
  category: PositionSortMethod // TODO: change this to make it work for trans
}) {
  const theme = useTheme()
  const sortAscending = useAtomValue(sortAscendingAtom)
  const handleSortCategory = useSetSortMethod(category)
  const sortMethod = useAtomValue(sortMethodAtom)

  const description = HEADER_DESCRIPTIONS[category]
  const enabled = SortingEnabled[category]

  return (
    <HeaderCellWrapper onClick={() => enabled && handleSortCategory()}>
      {category}
      {description && (
        <MouseoverTooltip text={description} placement="right">
          <InfoIconContainer>
            <Info size={14} />
          </InfoIconContainer>
        </MouseoverTooltip>
      )}
      {sortMethod === category && enabled && (
        <>
          {sortAscending ? (
            <ArrowUp size={20} strokeWidth={1.8} color={theme.accentActive} />
          ) : (
            <ArrowDown size={20} strokeWidth={1.8} color={theme.accentActive} />
          )}
        </>
      )}
    </HeaderCellWrapper>
  )
}

/* Token Row: skeleton row component */
function PositionRow({
  header,
  positionInfo,
  value,
  collateral,
  rate,
  PnL,
  entryPrice,
  positionKey,
  remainingPremium,
  actions,
  marginInPosToken,

  ...rest
}: {
  first?: boolean
  header: boolean
  loading?: boolean
  value: ReactNode
  actions: ReactNode
  collateral: ReactNode
  rate: ReactNode
  positionInfo: ReactNode
  positionKey?: TraderPositionKey
  // recentPremium: ReactNode
  // unusedPremium: ReactNode
  PnL: ReactNode
  entryPrice: ReactNode
  remainingPremium: ReactNode
  marginInPosToken: boolean
  last?: boolean
  style?: CSSProperties
}) {
  const [selectedTab, setSelectedTab] = useState<TradeModalActiveTab>()
  const [showModal, setShowModal] = useState(false)

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  const rowCells = (
    <>
      {showModal && (
        <LeveragePositionModal
          marginInPosToken={marginInPosToken}
          positionKey={positionKey}
          selectedTab={selectedTab}
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      )}
      <NameCell data-testid="name-cell">{positionInfo}</NameCell>
      <PriceCell data-testid="value-cell" sortable={header}>
        <EditCell
          onClick={() => {
            setShowModal(!showModal)
            setSelectedTab(TradeModalActiveTab.INCREASE_POSITION)
          }}
          disabled={false}
        >
          {value}
        </EditCell>
      </PriceCell>
      <PriceCell data-testid="collateral-cell" sortable={header}>
        {collateral}
      </PriceCell>
      <PriceCell data-testid="rate-cell" sortable={header}>
        {rate}
      </PriceCell>
      <PriceCell data-testid="premium-cell" sortable={header}>
        <EditCell
          onClick={() => {
            setShowModal(!showModal)
            setSelectedTab(TradeModalActiveTab.DEPOSIT_PREMIUM)
          }}
          disabled={true}
        >
          {remainingPremium}
        </EditCell>
      </PriceCell>
      <PriceCell data-testid="premium-cell" sortable={header}>
        {entryPrice}
      </PriceCell>
      <PriceCell data-testid="premium-cell" sortable={header}>
        {PnL}
      </PriceCell>
      <ActionCell data-testid="action-cell" sortable={header}>
        {actions}
      </ActionCell>
    </>
  )

  if (header) return <StyledHeaderRow data-testid="header-row">{rowCells}</StyledHeaderRow>
  return (
    <StyledTokenRow
      onClick={() => {
        setShowModal(!showModal)
        setSelectedTab(TradeModalActiveTab.DECREASE_POSITION)
      }}
      {...rest}
    >
      {rowCells}
    </StyledTokenRow>
  )
}

/* Header Row: top header row component for table */
export function HeaderRow() {
  return (
    <PositionRow
      header={true}
      positionInfo={
        <Box marginLeft="8px">
          <ThemedText.TableText>Position</ThemedText.TableText>
        </Box>
      }
      marginInPosToken={false}
      value={<HeaderCell category={PositionSortMethod.VALUE} />}
      collateral={<HeaderCell category={PositionSortMethod.COLLATERAL} />}
      PnL={<HeaderCell category={PositionSortMethod.PNL} />}
      entryPrice={<HeaderCell category={PositionSortMethod.ENTRYPRICE} />}
      remainingPremium={<HeaderCell category={PositionSortMethod.REMAINING} />}
      rate={<HeaderCell category={PositionSortMethod.RATE} />}
      actions={<HeaderCell category={PositionSortMethod.ACTIONS} />}
    />
  )
}

export const TruncatedTableText = styled(ThemedText.TableText)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`
/* Loading State: row component with loading bubbles */
export function LoadingRow(props: { first?: boolean; last?: boolean }) {
  return (
    <PositionRow
      header={false}
      // listNumber={<SmallLoadingBubble />}
      loading
      marginInPosToken={false}
      positionInfo={
        <>
          <IconLoadingBubble />
          <MediumLoadingBubble />
        </>
      }
      value={<MediumLoadingBubble />}
      collateral={<LoadingBubble />}
      rate={<LoadingBubble />}
      PnL={<LoadingBubble />}
      entryPrice={<LoadingBubble />}
      remainingPremium={<LoadingBubble />}
      actions={<LoadingBubble />}
      {...props}
    />
  )
}

const FlexStartRow = styled(Row)`
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
`

export interface PositionRowProps {
  // position: MarginPositionDetails // REMOVE EVENTUALLY

  // essentials
  positionKey: TraderPositionKey
  entryPrice: BN // positionEntryPrice
  currentPrice: BN // if isToken0 then token0Price else token1Price
  pnl: BN
  pnlPercentage: string
  inputTokenUsdPrice: BN
  outputTokenUsdPrice: BN
  pnlUsd: BN
  leverageFactor: BN
  marginInPosToken: boolean
  outputCurrencySymbol: string
  inputCurrencySymbol: string
  totalPosition: BN
  margin: BN
  apr: BN
  premiumLeft: BN
  premiumDeposited: BN
  estimatedTimeToClose: number
  premiumsPaid: BN
  pnLWithPremiums: BN
  pnlPremiumsUsd: BN
  position: MarginPositionDetails
  poolAddress: string
  poolPrice: any
  poolData: any
  tokens: any
  handlePoolSelect: (e: any) => void
}

// input token per 1 output token.
export function positionEntryPrice(position: MarginPositionDetails): BN {
  const { marginInPosToken, totalDebtInput, totalPosition, margin, poolKey } = position
  let fee
  if (poolKey?.fee == 500) fee = 0.0005
  else if (poolKey?.fee == 3000) fee = 0.003
  else if (poolKey?.fee == 10000) fee = 0.01
  else fee = 0
  if (marginInPosToken) {
    if (fee == 0.0005) fee += 0.001
    else fee += 0.005
    return totalDebtInput.times(1 - fee).div(totalPosition.minus(margin))
  }
  return totalDebtInput
    .plus(margin)
    .times(1 - fee)
    .div(totalPosition)
}

/* Loaded State: row component with token information */
export const LoadedRow = memo(
  forwardRef((props: PositionRowProps, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      // essentials
      positionKey,
      position,
      poolAddress,
      poolPrice,
      poolData,
      tokens,
      handlePoolSelect,
    } = props

    const { isInverted, invertedTooltipLogo } = useInvertedPrice(false)
    const [showInfo, setShowInfo] = useState(false)

    const handleCloseInfo = useCallback(() => {
      setShowInfo(false)
    }, [])

    const handleShowInfo = useCallback((e: any) => {
      e.stopPropagation()
      setShowInfo(true)
    }, [])

    const outputCurrency = useCurrency(positionKey.isToken0 ? positionKey.poolKey.token0 : positionKey.poolKey.token1)
    const inputCurrency = useCurrency(positionKey.isToken0 ? positionKey.poolKey.token1 : positionKey.poolKey.token0)

    const liveTick = useLiveTick(poolAddress)

    // const poolId = getPoolId(positionKey.poolKey.token0, positionKey.poolKey.token1, positionKey.poolKey.fee)

    // const { token0IsBase } = poolPrice
    const {
      marginInPosToken,
      totalPosition,
      margin,
      totalDebtInput,
      premiumOwed,
      apr,
      premiumLeft,
      premiumDeposit,
      pnl,
    } = position
    const { symbol0, symbol1, tick: poolDataTick, decimals0, decimals1 } = poolData
    // console.log("LIVE TICK CURRENT PRICE", symbol0, symbol1, liveTick)
    let tick
    if (liveTick === undefined) {
      tick = poolDataTick
    } else {
      tick = liveTick
    }

    const token0Price = computePrice(tick, decimals0, decimals1)

    const currentPrice = position.isToken0 ? new BN(token0Price) : new BN(1).div(token0Price)
    // console.log("CURRENT PRICE", symbol0, symbol1, currentPrice.toNumber())
    const inputToken = position.isToken0 ? position.poolKey.token1 : position.poolKey.token0
    const outputToken = position.isToken0 ? position.poolKey.token0 : position.poolKey.token1
    const outputCurrencySymbol = position.isToken0 ? symbol0 : symbol1
    const inputCurrencySymbol = position.isToken0 ? symbol1 : symbol0
    const inputTokenUsdPrice = new BN(tokens[inputToken.toLowerCase()].usdPrice)
    const outputTokenUsdPrice = new BN(tokens[outputToken.toLowerCase()].usdPrice)
    const entryPrice = positionEntryPrice(position)
    // const isWethUsdc =
    //   (symbol0.toLowerCase() === 'weth' && symbol1.toLowerCase() === 'usdc') ||
    //   (symbol1.toLowerCase() === 'usdc' && symbol0.toLowerCase() === 'weth')

    const leverageFactor = marginInPosToken ? totalPosition.div(margin) : margin.plus(totalDebtInput).div(margin)
    const ratePerHour = Number(apr.toNumber()) / 365 / 24
    const premPerHour = Number(totalDebtInput) * ratePerHour

    const hours = Number(premiumLeft) / premPerHour

    const estimatedTimeToClose = Math.round(hours * 100) / 100

    let pnlMarginToken = margin.times(-1)
    let pnlUsd = margin.times(-1).times(marginInPosToken ? outputTokenUsdPrice : inputTokenUsdPrice)
    let pnlUsdWithPremium = margin
      .times(-1)
      .times(marginInPosToken ? outputTokenUsdPrice : inputTokenUsdPrice)
      .minus(premiumOwed.times(inputTokenUsdPrice))
    const price = position.isToken0 ? new BN(1).div(token0Price) : token0Price
    let pnlWithPremium = marginInPosToken
      ? margin.times(-1).minus(premiumOwed.times(price))
      : margin.times(-1).minus(premiumOwed)
    let pnlPercentage = new BN(-1)
    const premiumOwedUsd = premiumOwed.times(inputTokenUsdPrice)
    if (pnl) {
      pnlMarginToken = pnl
      pnlUsd = marginInPosToken ? pnlMarginToken.times(outputTokenUsdPrice) : pnlMarginToken.times(inputTokenUsdPrice)
      pnlPercentage = pnl.div(margin)
      if (marginInPosToken) {
        pnlWithPremium = pnlMarginToken.minus(premiumOwed.times(price))
        pnlUsdWithPremium = pnlWithPremium.times(outputTokenUsdPrice)
      } else {
        pnlWithPremium = pnlMarginToken.minus(premiumOwed)
        pnlUsdWithPremium = pnlWithPremium.times(inputTokenUsdPrice)
      }
    }

    // PnL computation
    // let pnlPercentage
    // let pnlUsd
    // let pnlPremiumsUsd
    // let premiumsPaid
    // let pnLWithPremiums
    // let pnl
    // if (marginInPosToken) {
    //   const initialPnL = totalPosition.minus(totalDebtInput.div(currentPrice)).minus(margin)
    //   if (!isWethUsdc) {
    //     pnlPercentage = initialPnL.times(0.9).div(margin).times(100).toFixed(2)
    //   } else {
    //     pnlPercentage = initialPnL.div(margin).times(100).toFixed(2)
    //   }
    //   pnl =
    //     new BN(1).div(currentPrice).times(initialPnL).isGreaterThan(0) && !isWethUsdc
    //       ? initialPnL.times(0.9)
    //       : initialPnL
    //   pnLWithPremiums =
    //     new BN(1).div(currentPrice).times(initialPnL).isGreaterThan(0) && !isWethUsdc
    //       ? initialPnL.minus(premiumOwed.times(new BN(1).div(currentPrice))).times(0.9)
    //       : initialPnL.minus(premiumOwed.times(new BN(1).div(currentPrice)))
    //   pnlUsd = pnl.times(outputTokenUsdPrice)
    //   pnlPremiumsUsd = pnLWithPremiums.times(outputTokenUsdPrice)
    //   premiumsPaid = premiumOwed.times(inputTokenUsdPrice)
    // } else {
    //   const initialPnL = totalPosition.times(currentPrice.minus(entryPrice))
    //   if (!isWethUsdc) {
    //     pnlPercentage = initialPnL.times(0.9).div(margin).times(100).toFixed(2)
    //   } else {
    //     pnlPercentage = initialPnL.div(margin).times(100).toFixed(2)
    //   }

    //   pnl = initialPnL.isGreaterThan(0) && !isWethUsdc ? initialPnL.times(0.9) : initialPnL
    //   pnLWithPremiums =
    //     initialPnL.isGreaterThan(0) && !isWethUsdc
    //       ? initialPnL.minus(premiumOwed).times(0.9)
    //       : initialPnL.minus(premiumOwed)
    //   pnlUsd = pnl.times(inputTokenUsdPrice)
    //   pnlPremiumsUsd = pnLWithPremiums.times(inputTokenUsdPrice)
    //   premiumsPaid = premiumOwed.times(inputTokenUsdPrice)
    // }

    return (
      <>
        {showInfo && (
          <PositionInfoModal
            showInfo={showInfo}
            handleCloseInfo={handleCloseInfo}
            outputCurrency={outputCurrency}
            inputCurrency={inputCurrency}
            pnl={formatBNToString(pnlMarginToken, NumberType.SwapTradeAmount)}
            pnlPercent={`(${pnlPercentage.times(100).toFixed(3)} %)`}
            currentPrice={formatBNToString(currentPrice, NumberType.SwapTradeAmount)}
            entryPrice={formatBNToString(entryPrice, NumberType.SwapTradeAmount)}
            leverageValue={Math.round(leverageFactor.toNumber() * 1000) / 1000}
            marginInPosToken={marginInPosToken}
          />
        )}
        <div style={{ width: '100%' }} ref={ref} data-testid="token-table-row">
          <StyledLoadedRow danger={estimatedTimeToClose ? estimatedTimeToClose < 6 : false}>
            <PositionRow
              header={false}
              positionKey={positionKey}
              marginInPosToken={marginInPosToken}
              positionInfo={
                <ClickableContent>
                  <RowBetween>
                    <PositionInfo>
                      <GreenText>x{`${Math.round(leverageFactor.toNumber() * 1000) / 1000} `}</GreenText>
                      <GreenText>{`${outputCurrencySymbol}/${inputCurrencySymbol}`}</GreenText>
                    </PositionInfo>
                  </RowBetween>
                </ClickableContent>
              }
              value={
                <MouseoverTooltip
                  text={
                    <Trans>
                      <AutoColumn style={{ width: '185px' }} gap="5px">
                        <RowBetween>
                          <div>Net Value (USD):</div>
                          <div>${totalPosition.times(outputTokenUsdPrice).toFixed(2)}</div>
                        </RowBetween>
                      </AutoColumn>
                    </Trans>
                  }
                >
                  <FlexStartRow style={{ flexWrap: 'wrap', lineHeight: 1 }}>
                    <AutoColumn gap="5px">
                      <RowFixed style={{ flexWrap: 'wrap', gap: '5px' }}>
                        <CurrencyLogo currency={outputCurrency} size="10px" />
                        {`${formatBNToString(totalPosition, NumberType.SwapTradeAmount)}`}
                      </RowFixed>
                      <div>{` ${outputCurrencySymbol}`}</div>
                    </AutoColumn>
                  </FlexStartRow>
                </MouseoverTooltip>
              }
              collateral={
                <MouseoverTooltip
                  text={
                    <Trans>
                      <AutoColumn style={{ width: '160px' }} gap="5px">
                        <RowBetween>
                          <div>Margin (USD):</div>
                          <div>
                            $
                            {marginInPosToken
                              ? margin.times(outputTokenUsdPrice).toFixed(2)
                              : margin.times(inputTokenUsdPrice).toFixed(2)}
                          </div>
                        </RowBetween>
                      </AutoColumn>
                    </Trans>
                  }
                >
                  <FlexStartRow style={{ flexWrap: 'wrap', lineHeight: 1 }}>
                    <AutoColumn gap="5px">
                      <RowFixed style={{ flexWrap: 'wrap', gap: '5px' }}>
                        <CurrencyLogo currency={marginInPosToken ? outputCurrency : inputCurrency} size="10px" />
                        {formatBNToString(margin, NumberType.SwapTradeAmount)}
                      </RowFixed>
                      <div>{` ${marginInPosToken ? outputCurrencySymbol : inputCurrencySymbol}`}</div>
                    </AutoColumn>
                  </FlexStartRow>
                </MouseoverTooltip>
              }
              rate={
                <MouseoverTooltip
                  text={
                    <Trans>
                      {'Annualized Rate: ' +
                        formatNumber(apr.toNumber() * 100) +
                        ' %. Rates are higher than other trading platforms since there are no liquidations and associated fees.'}
                    </Trans>
                  }
                  disableHover={false}
                >
                  <FlexStartRow>{formatNumber((apr.toNumber() / 365 / 24) * 100) + '%'}</FlexStartRow>
                </MouseoverTooltip>
              }
              PnL={
                <MouseoverTooltip
                  style={{ width: '100%' }}
                  text={
                    <Trans>
                      <AutoColumn style={{ width: 'fit-content' }} gap="5px">
                        <RowBetween gap="5px">
                          <div>PnL (USD):</div>
                          <DeltaText delta={pnlUsd.toNumber()}>{`$${formatBNToString(
                            pnlUsd,
                            NumberType.SwapTradeAmount
                          )}`}</DeltaText>
                        </RowBetween>
                        <RowBetween gap="5px">
                          <div>PnL + interest (USD):</div>
                          <DeltaText delta={pnlUsdWithPremium.toNumber()}>{`$${formatBNToString(
                            pnlUsdWithPremium,
                            NumberType.SwapTradeAmount
                          )}`}</DeltaText>
                        </RowBetween>
                        <RowBetween gap="5px">
                          <div>Interest owed:</div>
                          <DeltaText delta={premiumOwedUsd.toNumber()}>{`$${formatBNToString(
                            premiumOwedUsd,
                            NumberType.SwapTradeAmount
                          )}`}</DeltaText>
                        </RowBetween>
                        <RowBetween gap="5px">
                          <div style={{ whiteSpace: 'nowrap' }}>PnL + interest:</div>
                          <DeltaText delta={pnlWithPremium?.toNumber()} isNoWrap={true}>
                            {`${formatBNToString(pnlWithPremium, NumberType.SwapTradeAmount)} `}{' '}
                            {marginInPosToken ? outputCurrencySymbol : inputCurrencySymbol}
                          </DeltaText>
                        </RowBetween>
                      </AutoColumn>
                    </Trans>
                  }
                  disableHover={false}
                >
                  <FlexStartRow>
                    <AutoColumn style={{ lineHeight: 1.5 }}>
                      <DeltaText style={{ lineHeight: '1' }} delta={Number(pnlMarginToken?.toNumber())}>
                        {`(${pnlPercentage ? (pnlPercentage.toNumber() * 100).toFixed(3) : '-100'}%)`}
                      </DeltaText>

                      <div>
                        <DeltaText style={{ lineHeight: '1' }} delta={pnlMarginToken?.toNumber() ?? -100}>
                          {formatBNToString(pnlMarginToken, NumberType.SwapTradeAmount)}
                        </DeltaText>
                        {marginInPosToken ? ` ${outputCurrencySymbol}` : ` ${inputCurrencySymbol}`}
                      </div>
                    </AutoColumn>
                  </FlexStartRow>
                </MouseoverTooltip>
              }
              entryPrice={
                <FlexStartRow>
                  <AutoColumn style={{ lineHeight: 1.5 }}>
                    <RowBetween gap="5px">
                      {isInverted ? (
                        <>
                          <AutoColumn>
                            <span>{formatBNToString(new BN(1).div(entryPrice), NumberType.SwapTradeAmount)}</span>
                            <span>{formatBNToString(new BN(1).div(currentPrice), NumberType.SwapTradeAmount)}</span>
                          </AutoColumn>
                        </>
                      ) : (
                        <>
                          <AutoColumn>
                            <span>{formatBNToString(entryPrice, NumberType.SwapTradeAmount)}/</span>{' '}
                            <span>{formatBNToString(currentPrice, NumberType.SwapTradeAmount)}</span>
                          </AutoColumn>
                        </>
                      )}
                      {invertedTooltipLogo}
                    </RowBetween>
                  </AutoColumn>
                </FlexStartRow>
              }
              remainingPremium={
                <MouseoverTooltip
                  text={<Trans>{'Estimated Time Until Close: ' + String(estimatedTimeToClose) + ' hrs'}</Trans>}
                  disableHover={false}
                >
                  <FlexStartRow>
                    {premiumLeft.isGreaterThan(0) ? (
                      <AutoColumn style={{ lineHeight: 1.5 }}>
                        <UnderlineText>
                          <GreenText style={{ display: 'flex', alignItems: 'center' }}>
                            {formatBNToString(
                              !marginInPosToken ? premiumLeft : premiumLeft.times(new BN(1).div(currentPrice)),
                              NumberType.SwapTradeAmount
                            )}
                            /
                          </GreenText>
                        </UnderlineText>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          <UnderlineText>
                            <GreenText style={{ display: 'flex', alignItems: 'center' }}>
                              {formatBNToString(
                                !marginInPosToken ? premiumDeposit : premiumDeposit.times(new BN(1).div(currentPrice)),
                                NumberType.SwapTradeAmount
                              )}
                            </GreenText>
                          </UnderlineText>
                          {!marginInPosToken ? inputCurrencySymbol : outputCurrencySymbol}
                        </div>
                      </AutoColumn>
                    ) : (
                      <RedText>0</RedText>
                    )}
                  </FlexStartRow>
                </MouseoverTooltip>
              }
              actions={
                <Row gap="4px">
                  <MouseoverTooltip
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                    text="Select Pair"
                  >
                    {' '}
                    <ActionButton onClick={handlePoolSelect}>
                      <CornerDownRight size={17} />
                    </ActionButton>
                  </MouseoverTooltip>
                  <MouseoverTooltip
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      marginRight: '5px',
                    }}
                    text="More Info"
                  >
                    {' '}
                    <ActionButton onClick={handleShowInfo}>
                      <Info size={17} />
                    </ActionButton>
                  </MouseoverTooltip>
                </Row>
              }
            />
          </StyledLoadedRow>
        </div>
      </>
    )
  })
)

LoadedRow.displayName = 'LoadedRow'
