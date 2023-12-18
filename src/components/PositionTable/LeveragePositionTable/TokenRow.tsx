import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { AutoColumn } from 'components/Column'
import { EditCell, UnderlineText } from 'components/PositionTable/BorrowPositionTable/TokenRow'
import Row, { AutoRow, RowBetween } from 'components/Row'
import { DeltaText, getDeltaArrow } from 'components/Tokens/TokenDetails/PriceChart'
import { MouseoverTooltip } from 'components/Tooltip'
import { useCurrency } from 'hooks/Tokens'
import { usePool } from 'hooks/usePools'
import { useAtomValue } from 'jotai/utils'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { SmallMaxButton } from 'pages/RemoveLiquidity/styled'
import { ForwardedRef, forwardRef, useCallback, useMemo, useState } from 'react'
import { CSSProperties, ReactNode } from 'react'
import { ArrowDown, ArrowUp, Edit3, Info } from 'react-feather'
import { Link } from 'react-router-dom'
import { Box } from 'rebass'
import styled, { css, useTheme } from 'styled-components/macro'
import { ClickableStyle, ThemedText } from 'theme'
import { MarginPositionDetails, TraderPositionKey } from 'types/lmtv2position'
import { MarginPosition } from 'utils/lmtSDK/MarginPosition'

import {
  LARGE_MEDIA_BREAKPOINT,
  MAX_WIDTH_MEDIA_BREAKPOINT,
  MEDIUM_MEDIA_BREAKPOINT,
  SMALL_MEDIA_BREAKPOINT,
} from './constants'
import { LeveragePositionModal, TradeModalActiveTab } from './LeveragePositionModal'
import { LoadingBubble } from './loading'
import { ReactComponent as More } from './More.svg'
import { filterStringAtom, PositionSortMethod, sortAscendingAtom, sortMethodAtom, useSetSortMethod } from './state'

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
  grid-template-columns: 0.7fr 1fr 1fr 1fr 1fr 1.3fr 0.7fr;
  line-height: 24px;
  /* max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT}; */
  min-width: 390px;
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

  @media only screen and (max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT}) {
    grid-template-columns: 0.7fr 1fr 1fr 0.75fr 1fr 1fr 1fr;
  }

  @media only screen and (max-width: ${LARGE_MEDIA_BREAKPOINT}) {
    grid-template-columns: 0.7fr 1fr 1fr 0.75fr 1fr 1fr 1fr;
  }

  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    grid-template-columns: 0.7fr 1fr 1fr 0.75fr 1fr 1fr 1fr;
  }

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
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
  justify-content: center;

  &:hover {
    background-color: transparent;
  }

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
  width: 100%;
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
  align-items: center;
  flex-flow: row nowrap;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'unset')};
  display: flex;
  gap: 4px;
  justify-content: flex-start;
  width: 100%;

  &:hover {
    ${ClickableStyle}
  }
`
const SparkLineCell = styled(Cell)`
  padding: 0px 24px;
  min-width: 120px;

  @media only screen and (max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT}) {
    display: none;
  }
`
const SparkLine = styled(Cell)`
  width: 124px;
  height: 42px;
`
const StyledLink = styled(Link)`
  text-decoration: none;
`

const StyledLoadedRow = styled.div`
  text-decoration: none;
  cursor: pointer;
`

const TokenInfoCell = styled(Cell)`
  gap: 8px;
  line-height: 24px;
  font-size: 16px;
  max-width: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    justify-content: flex-start;
    flex-direction: column;
    gap: 0px;
    width: max-content;
    font-weight: 500;
  }
`
const TokenName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`
const TokenSymbol = styled(Cell)`
  color: ${({ theme }) => theme.textTertiary};
  text-transform: uppercase;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    font-size: 12px;
    height: 16px;
    justify-content: flex-start;
    width: 100%;
  }
`
const VolumeCell = styled(DataCell)`
  padding-right: 8px;
  @media only screen and (max-width: ${LARGE_MEDIA_BREAKPOINT}) {
    display: none;
  }
`
const RepaymentTimeCell = styled(DataCell)`
  padding-right: 8px;
  @media only screen and (max-width: ${LARGE_MEDIA_BREAKPOINT}) {
    display: none;
  }
`

const SmallLoadingBubble = styled(LoadingBubble)`
  width: 25%;
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

const ResponsiveButtonPrimary = styled(SmallMaxButton)`
  border-radius: 12px;
  font-size: 13px;
  padding: 3px 4px;
  width: fit-content;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex: 1 1 auto;
    width: 100%;
  `};
`

// const ActionsContainer = styled(AutoColumn)`
//   align-items: center;
//   display: flex;
//   justify-content: center;
// `

const HEADER_DESCRIPTIONS: Record<PositionSortMethod, ReactNode | undefined> = {
  [PositionSortMethod.VALUE]: <Trans>Position Value</Trans>,
  [PositionSortMethod.COLLATERAL]: <Trans>Initial Margin Deposited</Trans>,
  [PositionSortMethod.REPAYTIME]: <Trans>Borrow rate per hour</Trans>,
  [PositionSortMethod.ENTRYPRICE]: <Trans>Your Entry and Current Price</Trans>,
  [PositionSortMethod.PNL]: <Trans>Profit/Loss excluding slippage+fees, loss may be greater than collateral</Trans>,
  [PositionSortMethod.REMAINING]: (
    <Trans>Remaining Premium that maintains this position. Position is forced closed when this becomes 0 </Trans>
  ),
  // [PositionSortMethod.ACTIONS]: <Trans>(Reduce): reduce position size (Pay): pay premium</Trans>,
  // [PositionSortMethod.RECENT_PREMIUM]: (
  //   <Trans>Recent Premium (Total Premium Paid)</Trans>
  // ),
  // [PositionSortMethod.UNUSED_PREMIUM]: (
  //   <Trans>Unused Premium Description</Trans>
  // )
}

const SortingEnabled = {
  [PositionSortMethod.VALUE]: false,
  [PositionSortMethod.COLLATERAL]: false,
  [PositionSortMethod.REPAYTIME]: true,
  [PositionSortMethod.ENTRYPRICE]: false,
  [PositionSortMethod.PNL]: false,
  [PositionSortMethod.REMAINING]: true,
  // [PositionSortMethod.ACTIONS]: false,
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
      {sortMethod === category && enabled && (
        <>
          {sortAscending ? (
            <ArrowUp size={20} strokeWidth={1.8} color={theme.accentActive} />
          ) : (
            <ArrowDown size={20} strokeWidth={1.8} color={theme.accentActive} />
          )}
        </>
      )}
      {category}
      {description && (
        <MouseoverTooltip text={description} placement="right">
          <InfoIconContainer>
            <Info size={14} />
          </InfoIconContainer>
        </MouseoverTooltip>
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
  repaymentTime,
  PnL,
  entryPrice,
  positionKey,
  remainingPremium,
  ...rest
}: {
  first?: boolean
  header: boolean
  loading?: boolean
  value: ReactNode
  collateral: ReactNode
  repaymentTime: ReactNode
  positionInfo: ReactNode
  positionKey?: TraderPositionKey
  // recentPremium: ReactNode
  // unusedPremium: ReactNode
  PnL: ReactNode
  entryPrice: ReactNode
  remainingPremium: ReactNode
  last?: boolean
  style?: CSSProperties
}) {
  const [showReduce, setShowReduce] = useState(false)
  const [selectedTab, setSelectedTab] = useState<TradeModalActiveTab>()
  const [showModal, setShowModal] = useState(false)

  // const collateral = (totalLiquidity - totalDebt)
  const handleConfirmDismiss = () => {
    setShowReduce(false)
  }

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  const rowCells = (
    <>
      <LeveragePositionModal
        positionKey={positionKey}
        selectedTab={selectedTab}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
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
      <PriceCell data-testid="repaymentTime-cell" sortable={header}>
        {repaymentTime}
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
      {/* <ActionCell data-testid="action-cell" sortable={header}>
        {actions}
      </ActionCell> */}
      {/* <SparkLineCell>{sparkLine}</SparkLineCell> */}
    </>
  )

  if (header) return <StyledHeaderRow data-testid="header-row">{rowCells}</StyledHeaderRow>
  return (
    <StyledTokenRow
      onClick={() => {
        setShowModal(!showModal)
        setSelectedTab(TradeModalActiveTab.WITHDRAW_PREMIUM)
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
      value={<HeaderCell category={PositionSortMethod.VALUE} />}
      collateral={<HeaderCell category={PositionSortMethod.COLLATERAL} />}
      PnL={<HeaderCell category={PositionSortMethod.PNL} />}
      entryPrice={<HeaderCell category={PositionSortMethod.ENTRYPRICE} />}
      remainingPremium={<HeaderCell category={PositionSortMethod.REMAINING} />}
      repaymentTime={<HeaderCell category={PositionSortMethod.REPAYTIME} />}
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
      positionInfo={
        <>
          <IconLoadingBubble />
          <MediumLoadingBubble />
        </>
      }
      value={<MediumLoadingBubble />}
      collateral={<LoadingBubble />}
      repaymentTime={<LoadingBubble />}
      PnL={<LoadingBubble />}
      entryPrice={<LoadingBubble />}
      remainingPremium={<LoadingBubble />}
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

/* Loaded State: row component with token information */
export const LoadedRow = forwardRef((props: LoadedRowProps, ref: ForwardedRef<HTMLDivElement>) => {
  // const { tokenListIndex, tokenListLength, token, sortRank } = props
  const filterString = useAtomValue(filterStringAtom)
  const { position: details } = props
  const { account } = useWeb3React()

  const positionKey: TraderPositionKey = useMemo(() => {
    return {
      trader: details.trader,
      poolKey: details.poolKey,
      isBorrow: false,
      isToken0: details.isToken0,
    }
  }, [details])

  const { isToken0, margin, totalDebtInput } = details
  const [token0Address, token1Address] = useMemo(() => {
    if (details) {
      return [details.poolKey.token0Address, details.poolKey.token1Address]
    }
    return [undefined, undefined]
  }, [details])
  const token0 = useCurrency(token0Address)
  const token1 = useCurrency(token1Address)

  const [poolState, pool] = usePool(token0 ?? undefined, token1 ?? undefined, details?.poolKey.fee)

  const leverageFactor = useMemo(
    () => (Number(margin) + Number(totalDebtInput)) / Number(margin),
    [margin, totalDebtInput]
  )

  const [entryPrice, currentPrice, baseToken, quoteToken, position, existingDeposit] = useMemo(() => {
    if (pool) {
      const _position = new MarginPosition(pool, details)

      const _entryPrice = _position.entryPrice()
      const _currentPrice = new BN(pool.token0Price.toFixed(18))

      if (_entryPrice.isLessThan(1)) {
        return [
          new BN(1).div(_entryPrice),
          new BN(1).div(_currentPrice),
          pool.token1,
          pool.token0,
          _position,
          _position.premiumLeft.plus(_position.premiumOwed),
        ]
      } else {
        return [
          _entryPrice,
          _currentPrice,
          pool.token0,
          pool.token1,
          _position,
          _position.premiumLeft.plus(_position.premiumOwed),
        ]
      }
    } else {
      return [undefined, undefined, undefined]
    }
  }, [pool, details])
  // console.log(margin)
  // const rate = useInstantaeneousRate(
  //   position?.pool?.token0?.address,
  //   position?.pool?.token1?.address,
  //   position?.pool?.fee,
  //   account,
  //   position?.isToken0
  //   )

  // console.log('position at table', position, rate)
  // /**
  //    * Returns the current mid price of the pool in terms of token0, i.e. the ratio of token1 over token0
  //    */
  // get token0Price(): Price<Token, Token>;
  // /**
  //  * Returns the current mid price of the pool in terms of token1, i.e. the ratio of token0 over token1
  //  */
  // get token1Price(): Price<Token, Token>;

  const arrow = getDeltaArrow(position?.PnL().toNumber(), 18)
  // Number(formatBNToString(position?.premiumLeft.minus(position?.premiumOwed), NumberType.SwapTradeAmount)) -
  // Number(formatBNToString(position?.premiumOwed, NumberType.SwapTradeAmount))

  // console.log('leverageFactor', leverageFactor, initialCollateral, totalDebtInput)

  // TODO: currency logo sizing mobile (32px) vs. desktop (24px)
  return (
    <div ref={ref} data-testid="token-table-row">
      <StyledLoadedRow>
        <PositionRow
          header={false}
          positionKey={positionKey}
          positionInfo={
            <ClickableContent>
              <RowBetween>
                <PositionInfo>
                  <GreenText>
                    {' '}
                    x{`${Math.round(leverageFactor * 1000) / 1000} ${position?.outputCurrency.symbol}`}
                  </GreenText>
                </PositionInfo>
              </RowBetween>
            </ClickableContent>
          }
          value={
            <FlexStartRow>
              <UnderlineText>
                {`${formatBNToString(position?.totalPosition, NumberType.SwapTradeAmount)} ${
                  position?.outputCurrency?.symbol
                }`}
              </UnderlineText>
              <Edit3 size={14} />
            </FlexStartRow>
          }
          collateral={
            <FlexStartRow>
              {`${formatBNToString(position?.margin, NumberType.SwapTradeAmount)} ${position?.inputCurrency?.symbol}`}
            </FlexStartRow>
          }
          repaymentTime={
            <FlexStartRow>
              {position?.timeLeft()[0] ? <GreenText>{position?.timeLeft()[1]}</GreenText> : <RedText>{0}</RedText>}
            </FlexStartRow>
          }
          PnL={
            <FlexStartRow>
              <AutoRow>
                <RowBetween>
                  <DeltaText delta={Number(position?.PnL().toNumber())}>
                    {`${formatBNToString(position?.PnL(), NumberType.SwapTradeAmount)} ${
                      position?.inputCurrency?.symbol
                    }`}
                  </DeltaText>
                </RowBetween>
              </AutoRow>
            </FlexStartRow>
          }
          entryPrice={
            <FlexStartRow>
              <AutoColumn
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  lineHeight: 1.5,
                }}
              >
                {`${formatBNToString(entryPrice, NumberType.SwapTradeAmount)}/${formatBNToString(
                  currentPrice,
                  NumberType.SwapTradeAmount
                )} `}
                <AutoColumn>{`${baseToken?.symbol}/${quoteToken?.symbol}`}</AutoColumn>
              </AutoColumn>
            </FlexStartRow>
          }
          remainingPremium={
            <FlexStartRow>
              <UnderlineText>
                {position?.premiumLeft.isGreaterThan(0) ? (
                  <GreenText>
                    <div>
                      {formatBNToString(position?.premiumLeft, NumberType.SwapTradeAmount)}/
                      {formatBNToString(existingDeposit, NumberType.SwapTradeAmount)}
                    </div>
                    <div>
                      {' ' + position?.inputCurrency?.symbol} <Edit3 size={14} />
                    </div>
                  </GreenText>
                ) : (
                  <RedText>
                    0
                    <Edit3 size={14} />
                  </RedText>
                )}
              </UnderlineText>
            </FlexStartRow>
          }
        />
      </StyledLoadedRow>
    </div>
  )
})

LoadedRow.displayName = 'LoadedRow'
