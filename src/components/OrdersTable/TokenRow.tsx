import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { ConfirmCancelOrderHeader } from 'components/PositionTable/LeveragePositionTable/ConfirmModalHeaders'
import { useCancelLimitOrderCallback } from 'components/PositionTable/LeveragePositionTable/DecreasePositionContent/CancelLimitOrder'
import { BaseFooter } from 'components/PositionTable/LeveragePositionTable/DepositPremiumContent'
import { EditCell } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import ConfirmModifyPositionModal from 'components/PositionTable/LeveragePositionTable/TransactionModal'
import Row, { AutoRow, RowBetween } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import { SupportedChainId } from 'constants/chains'
import { useCurrency } from 'hooks/Tokens'
import { useAtomValue } from 'jotai/utils'
import { SmallMaxButton } from 'pages/RemoveLiquidity/styled'
import { ForwardedRef, forwardRef, useCallback, useMemo, useState } from 'react'
import { CSSProperties, ReactNode } from 'react'
import { ArrowDown, ArrowUp, Info } from 'react-feather'
import { Link } from 'react-router-dom'
import { Box } from 'rebass'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import styled, { css, useTheme } from 'styled-components/macro'
import { ClickableStyle, ThemedText } from 'theme'
import { MarginLimitOrder, OrderPositionKey, TraderPositionKey } from 'types/lmtv2position'

import { TradeModalActiveTab } from '../PositionTable/LeveragePositionTable/LeveragePositionModal'
import {
  LARGE_MEDIA_BREAKPOINT,
  MAX_WIDTH_MEDIA_BREAKPOINT,
  MEDIUM_MEDIA_BREAKPOINT,
  SMALL_MEDIA_BREAKPOINT,
} from './constants'
import { LoadingBubble } from './loading'
import { filterStringAtom, OrderSortMethod, sortAscendingAtom, sortMethodAtom, useSetSortMethod } from './state'

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
  background-color: transparent;
  display: grid;
  font-size: 16px;
  grid-template-columns: 1.5fr 2.5fr 2.5fr 2.5fr 2.5fr 2.5fr 1fr;
  line-height: 24px;
  /* max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT}; */
  :390px ;
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
    grid-template-columns: 1.5fr 2fr 2fr 2fr 2fr 2fr 1fr;
  }

  @media only screen and (max-width: ${LARGE_MEDIA_BREAKPOINT}) {
    grid-template-columns: 1.5fr 2fr 2fr 2fr 2fr 2fr 1fr;
  }

  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    grid-template-columns: 1.5fr 2fr 2fr 2fr 2fr 2fr 1fr;
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

const DataCell = styled(Cell)<{ sortable: boolean }>`
  justify-content: flex-end;
  user-select: ${({ sortable }) => (sortable ? 'none' : 'unset')};
  transition: ${({
    theme: {
      transition: { duration, timing },
    },
  }) => css`background-color ${duration.medium} ${timing.ease}`};
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

export const GreenText = styled.span`
  color: ${({ theme }) => theme.accentSuccess};
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

const HEADER_DESCRIPTIONS: Record<OrderSortMethod, ReactNode | undefined> = {
  [OrderSortMethod.PAIR]: <Trans>Pair</Trans>,
  [OrderSortMethod.LEVERAGE]: <Trans>Leverage</Trans>,
  [OrderSortMethod.INPUT]: <Trans>Total Input Amount</Trans>,
  [OrderSortMethod.OUTPUT]: <Trans>Output amount specified by your order price.</Trans>,
  [OrderSortMethod.DEADLINE]: <Trans>Valid For</Trans>,
}

const SortingEnabled = {
  [OrderSortMethod.PAIR]: false,
  [OrderSortMethod.LEVERAGE]: false,
  [OrderSortMethod.INPUT]: false,
  [OrderSortMethod.OUTPUT]: false,
  [OrderSortMethod.DEADLINE]: false,
}

/* Get singular header cell for header row */
function HeaderCell({
  category,
}: {
  category: OrderSortMethod // TODO: change this to make it work for trans
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
  pair,
  leverage,
  input,
  output,
  buttons,
  deadline,
  ...rest
}: {
  first?: boolean
  header: boolean
  loading?: boolean
  // repaymentTime: ReactNode
  positionInfo: ReactNode
  positionKey?: TraderPositionKey
  // recentPremium: ReactNode
  // unusedPremium: ReactNode
  pair: ReactNode
  input: ReactNode
  output: ReactNode
  deadline: ReactNode
  buttons: ReactNode
  leverage: ReactNode
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
      {/* <LeveragePositionModal
        positionKey={positionKey}
        selectedTab={selectedTab}
        isOpen={showModal}
        onClose={handleCloseModal}
      /> */}
      <NameCell data-testid="name-cell">{positionInfo}</NameCell>
      <PriceCell data-testid="value-cell" sortable={header}>
        <EditCell
          onClick={() => {
            setShowModal(!showModal)
            setSelectedTab(TradeModalActiveTab.INCREASE_POSITION)
          }}
          disabled={false}
        >
          {pair}
        </EditCell>
      </PriceCell>
      {/*<PriceCell data-testid="repaymentTime-cell" sortable={header}>
        {repaymentTime}
      </PriceCell>*/}
      <PriceCell data-testid="premium-cell" sortable={header}>
        <EditCell
          onClick={() => {
            setShowModal(!showModal)
            setSelectedTab(TradeModalActiveTab.DEPOSIT_PREMIUM)
          }}
          disabled={true}
        >
          {input}
        </EditCell>
      </PriceCell>
      <PriceCell data-testid="premium-cell" sortable={header}>
        {output}
      </PriceCell>
      <PriceCell data-testid="premium-cell" sortable={header}>
        {leverage}
      </PriceCell>
      <PriceCell data-testid="premium-cell" sortable={header}>
        {deadline}
      </PriceCell>
      {/* <ActionCell data-testid="action-cell" sortable={header}>
        {actions}
      </ActionCell> */}
      {/* <SparkLineCell>{sparkLine}</SparkLineCell> */}
      <NameCell>{buttons}</NameCell>
    </>
  )

  if (header) return <StyledHeaderRow data-testid="header-row">{rowCells}</StyledHeaderRow>
  return <StyledTokenRow {...rest}>{rowCells}</StyledTokenRow>
}

/* Header Row: top header row component for table */
export function HeaderRow() {
  return (
    <PositionRow
      header={true}
      positionInfo={
        <Box marginLeft="8px">
          <ThemedText.TableText>Order</ThemedText.TableText>
        </Box>
      }
      pair={<HeaderCell category={OrderSortMethod.PAIR} />}
      input={<HeaderCell category={OrderSortMethod.INPUT} />}
      output={<HeaderCell category={OrderSortMethod.OUTPUT} />}
      leverage={<HeaderCell category={OrderSortMethod.LEVERAGE} />}
      deadline={<HeaderCell category={OrderSortMethod.DEADLINE} />}
      buttons={<></>}

      // repaymentTime={<HeaderCell category={OrderSortMethod.REPAYTIME} />}
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
      pair={<MediumLoadingBubble />}
      // repaymentTime={<LoadingBubble />}
      input={<LoadingBubble />}
      output={<LoadingBubble />}
      leverage={<LoadingBubble />}
      deadline={<LoadingBubble />}
      buttons={<LoadingBubble />}
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
  order: MarginLimitOrder
  loading?: boolean
}

/* Loaded State: row component with token information */
export const LoadedRow = forwardRef((props: LoadedRowProps, ref: ForwardedRef<HTMLDivElement>) => {
  // const { tokenListIndex, tokenListLength, token, sortRank } = props
  const filterString = useAtomValue(filterStringAtom)
  const { order: details, loading } = props

  const [token0Address, token1Address, inputIs1] = useMemo(() => {
    if (details) {
      return [details.key.token0, details.key.token1, details.positionIsToken0]
    }
    return [undefined, undefined]
  }, [details])
  const { account, chainId, provider } = useWeb3React()

  if (
    chainId === SupportedChainId.LINEA &&
    (token1Address?.toLowerCase() === '0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60'.toLowerCase() ||
      token0Address?.toLowerCase() === '0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60'.toLowerCase())
  ) {
    console.log('SOMETHING AMISS2')
  }

  const inputCurrency = useCurrency(inputIs1 ? token1Address : token0Address)
  const outputCurrency = useCurrency(inputIs1 ? token0Address : token1Address)

  const orderKey: OrderPositionKey | undefined = useMemo(() => {
    if (!details || !account) return undefined
    return {
      poolKey: details.key,
      trader: account,
      isAdd: details.isAdd,
      isToken0: details.positionIsToken0,
    }
  }, [details, account])
  // const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, details?.key.fee)

  const nowInSeconds = Math.floor(Date.now() / 1000)

  const duration = details.auctionDeadline - nowInSeconds

  // Calculate hours and remaining minutes
  const durationHours = Math.floor(duration / 3600)
  const durationMinutes = Math.floor((duration % 3600) / 60)

  // Create the formatted string
  const formattedDuration = `${durationHours}hr ${durationMinutes}m`

  const leverage = useMemo(() => {
    if (Number(details?.margin) == 0) return 0
    else return (Number(details?.margin) + Number(details?.inputAmount)) / Number(details?.margin)
  }, [])

  // const marginFacility = useMarginFacilityContract(true)

  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [showModal, setShowModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  // CANCEL ORDER TO DO

  const { callback: cancelCallback } = useCancelLimitOrderCallback(orderKey)

  const addTransaction = useTransactionAdder()

  const handleCancel = useCallback(() => {
    if (!cancelCallback || !details || !inputCurrency || !outputCurrency) {
      return
    }
    setAttemptingTxn(true)

    cancelCallback()
      .then((response) => {
        setAttemptingTxn(false)
        setTxHash(response?.hash)
        setErrorMessage(undefined)
        addTransaction(response, {
          type: TransactionType.CANCEL_LIMIT_ORDER,
          inputCurrencyId: inputCurrency.wrapped.address,
          outputCurrencyId: outputCurrency.wrapped.address,
          isAdd: details.isAdd,
        })
        return response.hash
      })
      .catch((error) => {
        console.error(error)
        setAttemptingTxn(false)
        setTxHash(undefined)
        setErrorMessage(error.message)
      })
  }, [
    cancelCallback,
    details,
    inputCurrency,
    outputCurrency,
    addTransaction,
    setAttemptingTxn,
    setTxHash,
    setErrorMessage,
  ])

  const handleDismiss = useCallback(() => {
    setShowModal(false)
    setAttemptingTxn(false)
    setTxHash(undefined)
    setErrorMessage(undefined)
  }, [])

  return (
    <div ref={ref} data-testid="token-table-row">
      {showModal && (
        <ConfirmModifyPositionModal
          onDismiss={handleDismiss}
          isOpen={showModal}
          attemptingTxn={attemptingTxn}
          txHash={txHash}
          header={
            <ConfirmCancelOrderHeader
              order={details}
              inputCurrency={inputCurrency ?? undefined}
              outputCurrency={outputCurrency ?? undefined}
            />
          }
          bottom={
            <BaseFooter
              errorMessage={errorMessage ? <Trans>{errorMessage}</Trans> : null}
              onConfirm={handleCancel}
              confirmText="Confirm Cancel Order"
              disabledConfirm={false}
            />
          }
          title="Confirm Cancel Order"
          pendingText={<Trans>Cancelling Position ...</Trans>}
          currencyToAdd={outputCurrency ?? undefined}
          recipient={account ?? null}
          errorMessage={errorMessage ? <Trans>{errorMessage}</Trans> : undefined}
        />
      )}
      <StyledLoadedRow>
        <PositionRow
          header={false}
          // positionKey={positionKey}
          positionInfo={
            <ClickableContent>
              <RowBetween>
                <PositionInfo>
                  <GreenText>
                    {details?.isAdd ? 'Add Order' : 'Reduce Order'}{' '}
                    {/* x{`${Math.round(leverageFactor * 1000) / 1000} ${position?.totalPosition.currency?.symbol}`} */}
                  </GreenText>
                </PositionInfo>
              </RowBetween>
            </ClickableContent>
          }
          pair={
            <FlexStartRow>
              <div style={{ display: 'flex', gap: '5px' }}>
                <>{inputCurrency?.symbol}/</>

                <>{outputCurrency?.symbol} </>
              </div>
            </FlexStartRow>
          }
          input={
            <FlexStartRow>
              <AutoRow gap="2px">
                {/* {!loading ? formatBNToString(details.inputAmount, NumberType.SwapTradeAmount) : null} */}
                {Number(details.inputAmount).toString()}
                <CurrencyLogo currency={inputCurrency} size="13px" />
                {inputCurrency?.symbol}
              </AutoRow>
            </FlexStartRow>
          }
          output={
            <FlexStartRow>
              <AutoRow gap="2px" justify="start">
                {Number(details.startOutput).toString()}
                <CurrencyLogo currency={outputCurrency} size="13px" />
                {outputCurrency?.symbol}
              </AutoRow>
            </FlexStartRow>
          }
          leverage={
            <FlexStartRow>
              <AutoRow>{(Math.round(leverage * 100) / 100).toString()}</AutoRow>
            </FlexStartRow>
          }
          deadline={
            <FlexStartRow>
              <AutoRow>
                <RowBetween>
                  {durationMinutes > 0 ? <GreenText>{formattedDuration}</GreenText> : <RedText>0h 0m</RedText>}
                </RowBetween>
              </AutoRow>
            </FlexStartRow>
          }
          buttons={
            <FlexStartRow style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AutoRow>
                <RowBetween>
                  <ButtonPrimary
                    onClick={() => setShowModal(true)}
                    style={{
                      height: '15px',
                      fontSize: '10px',
                      width: '40px',
                      borderRadius: '10px',
                    }}
                  >
                    Cancel
                  </ButtonPrimary>
                </RowBetween>
              </AutoRow>
            </FlexStartRow>
          }
        />
      </StyledLoadedRow>
    </div>
  )
})

LoadedRow.displayName = 'LoadedRow'
