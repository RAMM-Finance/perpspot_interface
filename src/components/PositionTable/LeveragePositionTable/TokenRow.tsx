import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { ResponsiveButton, SmallButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import Row, { RowBetween, RowFixed } from 'components/Row'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { MouseoverTooltip } from 'components/Tooltip'
import { useCurrency } from 'hooks/Tokens'
import { useInvertedPrice } from 'hooks/useInvertedPrice'
import { useInstantaeneousRate } from 'hooks/useLMTV2Positions'
import { usePool } from 'hooks/usePools'
import { useUSDPriceBNV2 } from 'hooks/useUSDPrice'
import { useAtomValue } from 'jotai/utils'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ForwardedRef, forwardRef, memo, useCallback, useMemo, useState } from 'react'
import { CSSProperties, ReactNode } from 'react'
import { ArrowDown, ArrowUp, Info } from 'react-feather'
import { Box } from 'rebass'
import { usePoolOHLC } from 'state/application/hooks'
import { useCurrentPool, useSetCurrentPool } from 'state/user/hooks'
import styled, { css, useTheme } from 'styled-components/macro'
import { ClickableStyle, ThemedText } from 'theme'
import { MarginPositionDetails, TraderPositionKey } from 'types/lmtv2position'

import { MEDIUM_MEDIA_BREAKPOINT, SMALL_MEDIA_BREAKPOINT } from './constants'
import { LeveragePositionModal, TradeModalActiveTab } from './LeveragePositionModal'
import { LoadingBubble } from './loading'
import { ReactComponent as More } from './More.svg'
import PositionInfoModal from './PositionInfoModal'
import { PositionSortMethod, sortAscendingAtom, sortMethodAtom, useSetSortMethod } from './state'

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
  column-gap: 0.75rem;
  grid-column-gap: 0.5rem;
  grid-template-columns: 0.7fr 1fr 1fr 1fr 1fr 1.2fr 1.5fr 1fr;
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

  @media only screen and (max-width: 1400px) {
    /* grid-template-columns: 100px 105px 70px 100px 105px 120px 110px 70px; */
    /* grid-template-columns: 100px 110px 110px 100px 125px 155px 110px 70px; */
    grid-template-columns: 90px 100px 90px 90px 100px 135px 160px 90px;
  }

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    display: grid;
    grid-template-columns: 2fr 3fr;
    min-width: unset;
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

const StyledLoadedRow = styled.div`
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
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
  padding-right: 1vw;
`
const PositionInfo = styled(AutoColumn)`
  margin-left: 8px;
`

const ActionText = styled(ThemedText.BodySmall)`
  white-space: nowrap;
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
          <InfoIconContainer style={{ paddingRight: '0px' }}>
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
  const [showReduce, setShowReduce] = useState(false)
  const [selectedTab, setSelectedTab] = useState<TradeModalActiveTab>()
  const [showModal, setShowModal] = useState(false)

  const handleConfirmDismiss = () => {
    setShowReduce(false)
  }

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

interface LoadedRowProps {
  position: MarginPositionDetails
}

export function getPoolId(tokenA: string, tokenB: string, fee: number) {
  const token0 = tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenA : tokenB
  const token1 = tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenB : tokenA
  return `${token0.toLowerCase()}-${token1.toLowerCase()}-${fee}`
}

// input token per 1 output token.
export function positionEntryPrice(position: MarginPositionDetails): BN {
  const { marginInPosToken, totalDebtInput, totalPosition, margin } = position

  if (marginInPosToken) {
    return totalDebtInput.div(totalPosition.minus(margin))
  }
  return totalDebtInput.plus(margin).div(totalPosition)
}

/* Loaded State: row component with token information */
export const LoadedRow = memo(
  forwardRef((props: LoadedRowProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { isInverted, invertedTooltipLogo } = useInvertedPrice(false)
    const { position: details } = props
    const { account } = useWeb3React()
    const theme = useTheme()
    const { chainId } = useWeb3React()

    const positionKey: TraderPositionKey = useMemo(() => {
      return {
        trader: details.trader,
        poolKey: details.poolKey,
        isBorrow: false,
        isToken0: details.isToken0,
      }
    }, [details])

    const { margin, totalDebtInput } = details
    const [token0Address, token1Address] = useMemo(() => {
      if (details) {
        return [details.poolKey.token0, details.poolKey.token1]
      }
      return [undefined, undefined]
    }, [details])

    const token0 = useCurrency(token0Address)
    const token1 = useCurrency(token1Address)

    const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, details?.poolKey.fee)

    const setCurrentPool = useSetCurrentPool()
    const poolOHLCData = usePoolOHLC(token0Address, token1Address, details?.poolKey.fee)

    const leverageFactor = useMemo(() => {
      if (details.marginInPosToken) {
        return Number(details.totalPosition) / Number(margin)
      } else {
        return (Number(margin) + Number(totalDebtInput)) / Number(margin)
      }
    }, [margin, totalDebtInput, details])

    const currentPool = useCurrentPool()
    const poolId = currentPool?.poolId
    const handlePoolSelect = useCallback(
      (e: any) => {
        e.stopPropagation()
        if (positionKey.poolKey.fee && token0 && token1 && token0.symbol && token1.symbol && pool && chainId) {
          const id = getPoolId(token0.wrapped.address, token1.wrapped.address, positionKey.poolKey.fee)
          if (poolOHLCData && poolId !== id && id) {
            console.log('zeke:handle2')
            setCurrentPool(id, !details.isToken0, poolOHLCData.token0IsBase, token0.symbol, token1.symbol)
          }
        }
      },
      [setCurrentPool, poolId, details, poolOHLCData, pool, positionKey, token0, token1, chainId]
    )

    const [showInfo, setShowInfo] = useState(false)

    const handleCloseInfo = useCallback(() => {
      // e.stopPropagation()
      setShowInfo(false)
    }, [])

    const handleShowInfo = useCallback((e: any) => {
      e.stopPropagation()
      setShowInfo(true)
    }, [])

    const outputCurrency = useCurrency(details.isToken0 ? details.poolKey.token0 : details.poolKey.token1)
    const inputCurrency = useCurrency(details.isToken0 ? details.poolKey.token1 : details.poolKey.token0)

    // prices are in input per output token
    const [entryPrice, currentPrice, baseToken, quoteToken] = useMemo(() => {
      if (pool) {
        const _entryPrice = positionEntryPrice(details)
        const _currentPrice = details.isToken0
          ? new BN(pool.token0Price.toFixed(18))
          : new BN(pool.token1Price.toFixed(18))

        return [
          _entryPrice,
          _currentPrice,
          details.isToken0 ? pool.token1 : pool.token0,
          details.isToken0 ? pool.token0 : pool.token1,
        ]
      } else {
        return [undefined, undefined, undefined]
      }
    }, [pool, details])

    const { result: rate } = useInstantaeneousRate(
      pool?.token0?.address,
      pool?.token1?.address,
      pool?.fee,
      account,
      details?.isToken0
    )

    // call once with 1 token
    const inputCurrencyPrice = useUSDPriceBNV2(new BN(1), inputCurrency ?? undefined)
    const outputCurrencyPrice = useUSDPriceBNV2(new BN(1), outputCurrency ?? undefined)

    const loading = !rate || !entryPrice || !currentPrice || !baseToken || !quoteToken

    const estimatedTimeToClose = useMemo(() => {
      if (!rate || !totalDebtInput) return undefined

      const ratePerHour = Number(rate) / 1e18 / (365 * 24)
      const premPerHour = Number(totalDebtInput) * ratePerHour

      const hours = Number(details?.premiumLeft) / premPerHour

      return Math.round(hours * 100) / 100
    }, [details, rate, totalDebtInput])

    // PnL in input/collateral token
    const initialPnL = useMemo(() => {
      if (!currentPrice || !entryPrice) return undefined

      return details.totalPosition.times(currentPrice.minus(entryPrice))
    }, [details, entryPrice, currentPrice])

    // PnL in input/collateral token including premium paid thus far
    const PnLWithPremiums = useMemo(() => {
      if (!initialPnL || !details.premiumLeft) return undefined
      return initialPnL.minus(details.premiumOwed)
    }, [details, initialPnL])

    const PnLPercentage = useMemo(() => {
      if (!currentPrice || !initialPnL || !details) return undefined
      if (details.marginInPosToken) {
        return ((new BN(1).div(currentPrice).times(initialPnL).toNumber() / details.margin.toNumber()) * 100).toFixed()
      } else {
        return ((initialPnL.toNumber() / details.margin.toNumber()) * 100).toFixed(2)
      }
    }, [currentPrice, initialPnL, details])

    const PnL = useMemo(() => {
      if (!initialPnL) return undefined
      return initialPnL.times(0.9)
    }, [initialPnL])

    const pnlInfo = useMemo(() => {
      if (!inputCurrencyPrice?.data || !PnL || !PnLWithPremiums) {
        return {
          pnlUSD: 0,
          pnlPremiumsUSD: 0,
          premiumsPaid: 0,
        }
      } else {
        return {
          pnlUSD: PnL.times(inputCurrencyPrice.data).toNumber(),
          pnlPremiumsUSD: PnLWithPremiums.times(inputCurrencyPrice.data).toNumber(),
          premiumsPaid: details.premiumOwed.times(inputCurrencyPrice.data).toNumber(),
        }
      }
    }, [inputCurrencyPrice?.data, details, PnLWithPremiums, PnL])

    if (loading) {
      return <LoadingRow />
    }

    console.log('here', formatBNToString(PnL, NumberType.SwapTradeAmount), details.marginInPosToken)

    return (
      <>
        {showInfo && (
          <PositionInfoModal
            showInfo={showInfo}
            handleCloseInfo={handleCloseInfo}
            outputCurrency={outputCurrency}
            inputCurrency={inputCurrency}
            pln={formatBNToString(PnL, NumberType.SwapTradeAmount)}
            pnlPercent={`${((Number(PnL) / details?.margin.toNumber()) * 100).toFixed(2)}%`}
            currentPrice={formatBNToString(currentPrice, NumberType.SwapTradeAmount)}
            entryPrice={formatBNToString(entryPrice, NumberType.SwapTradeAmount)}
            leverageValue={Math.round(leverageFactor * 1000) / 1000}
          />
        )}
        <div ref={ref} data-testid="token-table-row">
          <StyledLoadedRow>
            <PositionRow
              header={false}
              positionKey={positionKey}
              marginInPosToken={details.marginInPosToken}
              positionInfo={
                <ClickableContent>
                  <RowBetween>
                    <PositionInfo>
                      <GreenText>x{`${Math.round(leverageFactor * 1000) / 1000} `}</GreenText>
                      <GreenText>{`${outputCurrency?.symbol}/${inputCurrency?.symbol}`}</GreenText>
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
                          <div>
                            $
                            {details.totalPosition &&
                              outputCurrencyPrice.data &&
                              (details.totalPosition.toNumber() * outputCurrencyPrice?.data).toFixed(2)}
                          </div>
                        </RowBetween>
                      </AutoColumn>
                    </Trans>
                  }
                >
                  <FlexStartRow style={{ flexWrap: 'wrap', lineHeight: 1 }}>
                    <AutoColumn gap="5px">
                      <RowFixed style={{ flexWrap: 'wrap', gap: '5px' }}>
                        <CurrencyLogo currency={outputCurrency} size="10px" />
                        {`${formatBNToString(details?.totalPosition, NumberType.SwapTradeAmount)}`}
                      </RowFixed>
                      <div>{` ${outputCurrency?.symbol}`}</div>
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
                            {details.margin && outputCurrencyPrice.data && details.marginInPosToken
                              ? (details.margin.toNumber() * outputCurrencyPrice?.data).toFixed(2)
                              : inputCurrencyPrice.data &&
                                (details.margin.toNumber() * inputCurrencyPrice?.data).toFixed(2)}
                          </div>
                        </RowBetween>
                      </AutoColumn>
                    </Trans>
                  }
                >
                  <FlexStartRow style={{ flexWrap: 'wrap', lineHeight: 1 }}>
                    <AutoColumn gap="5px">
                      <RowFixed style={{ flexWrap: 'wrap', gap: '5px' }}>
                        <CurrencyLogo
                          currency={details.marginInPosToken ? outputCurrency : inputCurrency}
                          size="10px"
                        />
                        {formatBNToString(details?.margin, NumberType.SwapTradeAmount)}
                      </RowFixed>
                      <div>{` ${details.marginInPosToken ? outputCurrency?.symbol : inputCurrency?.symbol}`}</div>
                    </AutoColumn>
                  </FlexStartRow>
                </MouseoverTooltip>
              }
              rate={
                <MouseoverTooltip
                  text={
                    <Trans>
                      {'Annualized Rate: ' +
                        String((100 * Math.round((10000000 * Number(rate)) / 1e18)) / 10000000) +
                        ' %. Rates are higher than other trading platforms since there are no liquidations and associated fees.'}
                    </Trans>
                  }
                  disableHover={false}
                >
                  <FlexStartRow>
                    {rate && String((100 * Math.round((10000000 * Number(rate)) / 1e18 / (365 * 24))) / 10000000) + '%'}
                  </FlexStartRow>
                </MouseoverTooltip>
              }
              PnL={
                <MouseoverTooltip
                  text={
                    <Trans>
                      <AutoColumn style={{ width: '200px' }} gap="5px">
                        <RowBetween>
                          <div>PnL (USD):</div>
                          <DeltaText delta={pnlInfo.pnlUSD}>{`$${pnlInfo.pnlUSD.toFixed(2)}`}</DeltaText>
                        </RowBetween>
                        <RowBetween>
                          <div>Interest paid:</div>
                          <DeltaText delta={pnlInfo.premiumsPaid}>{`$${pnlInfo.premiumsPaid.toFixed(2)}`}</DeltaText>
                        </RowBetween>
                        <RowBetween>
                          <div>PnL inc. int:</div>
                          {`${formatBNToString(PnLWithPremiums, NumberType.SwapTradeAmount)} ` +
                          ' ' +
                          details.marginInPosToken
                            ? outputCurrency?.symbol
                            : inputCurrency?.symbol}
                        </RowBetween>
                        <RowBetween>
                          <div>PnL inc. int (USD):</div>
                          <DeltaText delta={pnlInfo.pnlPremiumsUSD}>{`$${pnlInfo.pnlPremiumsUSD.toFixed(
                            2
                          )}`}</DeltaText>
                        </RowBetween>
                      </AutoColumn>
                    </Trans>
                  }
                  disableHover={false}
                >
                  <FlexStartRow>
                    {details.marginInPosToken ? (
                      <AutoColumn style={{ lineHeight: 1.5 }}>
                        <DeltaText style={{ lineHeight: '1' }} delta={PnL?.toNumber()}>
                          {PnL &&
                          Number(formatBNToString(new BN(1).div(currentPrice).times(PnL), NumberType.SwapTradeAmount)) >
                            0
                            ? formatBNToString(PnL, NumberType.SwapTradeAmount)
                            : PnL &&
                              `${formatBNToString(
                                new BN(1).div(currentPrice).times(PnL),
                                NumberType.SwapTradeAmount
                              )} `}
                        </DeltaText>
                        <div>
                          <DeltaText style={{ lineHeight: '1' }} delta={Number(PnL?.toNumber())}>
                            {PnL && `(${PnLPercentage}%)`}
                          </DeltaText>
                          {' ' + outputCurrency?.symbol}
                        </div>
                      </AutoColumn>
                    ) : (
                      <AutoColumn style={{ lineHeight: 1.5 }}>
                        <DeltaText style={{ lineHeight: '1' }} delta={Number(PnL?.toNumber())}>
                          {PnL && Number(formatBNToString(PnL, NumberType.SwapTradeAmount)) > 0
                            ? formatBNToString(PnL, NumberType.SwapTradeAmount)
                            : PnL && `${formatBNToString(PnL, NumberType.SwapTradeAmount)} `}
                        </DeltaText>
                        <div>
                          <DeltaText style={{ lineHeight: '1' }} delta={Number(PnL?.toNumber())}>
                            {PnL && `(${PnLPercentage} %)`}
                          </DeltaText>
                          {' ' + inputCurrency?.symbol}
                        </div>
                      </AutoColumn>
                    )}
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
                    {details?.premiumLeft.isGreaterThan(0) ? (
                      <AutoColumn style={{ lineHeight: 1.5 }}>
                        <UnderlineText>
                          <GreenText style={{ display: 'flex', alignItems: 'center' }}>
                            {formatBNToString(details?.premiumLeft, NumberType.SwapTradeAmount)}/
                          </GreenText>
                        </UnderlineText>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          <UnderlineText>
                            <GreenText style={{ display: 'flex', alignItems: 'center' }}>
                              {formatBNToString(details.premiumDeposit, NumberType.SwapTradeAmount)}
                            </GreenText>
                          </UnderlineText>
                          {inputCurrency?.symbol}
                        </div>
                      </AutoColumn>
                    ) : (
                      <RedText>0</RedText>
                    )}
                  </FlexStartRow>
                </MouseoverTooltip>
              }
              actions={
                <Row gap="7px">
                  <SmallButtonPrimary
                    style={{
                      height: '40px',
                      lineHeight: '15px',
                      minWidth: '50px',
                      background: `${theme.backgroundOutline}`,
                    }}
                    onClick={handleShowInfo}
                  >
                    <ActionText>Info</ActionText>
                  </SmallButtonPrimary>
                  <ResponsiveButton
                    style={{
                      height: '40px',
                      minWidth: '140px',
                      lineHeight: '15px',
                      background: `${theme.backgroundOutline}`,
                    }}
                    onClick={handlePoolSelect}
                  >
                    <ActionText>Set Current Pair</ActionText>
                  </ResponsiveButton>
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
