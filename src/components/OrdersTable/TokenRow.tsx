import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Trans } from '@lingui/macro'
import { computePoolAddress } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { EditCell } from 'components/PositionTable/BorrowPositionTable/TokenRow'
import Row, { AutoRow, RowBetween } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { useCurrency } from 'hooks/Tokens'
import { useMarginFacilityContract } from 'hooks/useContract'
import { usePool } from 'hooks/usePools'
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
import { MarginLimitOrder, TraderPositionKey } from 'types/lmtv2position'

import { TradeModalActiveTab } from '../PositionTable/LeveragePositionTable/LeveragePositionModal'
import {
  LARGE_MEDIA_BREAKPOINT,
  MAX_WIDTH_MEDIA_BREAKPOINT,
  MEDIUM_MEDIA_BREAKPOINT,
  SMALL_MEDIA_BREAKPOINT,
} from './constants'
import { LoadingBubble } from './loading'
import { ReactComponent as More } from './More.svg'
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
  [OrderSortMethod.INPUT]: <Trans>Input</Trans>,
  [OrderSortMethod.OUTPUT]: <Trans>Output</Trans>,
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
  loading: boolean
}

/* Loaded State: row component with token information */
export const LoadedRow = forwardRef((props: LoadedRowProps, ref: ForwardedRef<HTMLDivElement>) => {
  // const { tokenListIndex, tokenListLength, token, sortRank } = props
  const filterString = useAtomValue(filterStringAtom)
  const { order: details, loading } = props

  // const positionKey: OrderPositionKey = useMemo(() => {
  //   return {
  //     poolKey: details.key,
  //     isAdd: details.isAdd,
  //     trader: 'yes',
  //     isToken0: false,
  //   }
  // }, [details])

  const [token0Address, token1Address] = useMemo(() => {
    if (details) {
      return [details.key.token0Address, details.key.token1Address]
    }
    return [undefined, undefined]
  }, [details])

  const inputCurrency = useCurrency(token0Address)
  const outputCurrency = useCurrency(token1Address)

  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, details?.key.fee)

  // const [inputAmount, startOutput, margin] = useMemo(() => {
  //   if (pool) {
  //     return [details.inputAmount, details.startOutput, details.margin]
  //   } else {
  //     return [undefined, undefined, undefined]
  //   }
  // }, [])
  console.log('details', details)

  const nowInSeconds = Math.floor(Date.now() / 1000)
  const duration = details.auctionStartTime + 24 * 60 * 60 - nowInSeconds

  // Calculate hours and remaining minutes
  const durationHours = Math.floor(duration / 3600)
  const durationMinutes = Math.floor((duration % 3600) / 60)

  // Create the formatted string
  const formattedDuration = `${durationHours}hr ${durationMinutes}m`

  const leverage = useMemo(() => (Number(details?.margin) + Number(details?.inputAmount)) / Number(details?.margin), [])

  const { account, chainId, provider } = useWeb3React()

  const marginFacility = useMarginFacilityContract(true)

  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [errorMessage, setErrorMessage] = useState<string>()

  const poolAddress = useMemo(() => {
    if (chainId && pool) {
      return computePoolAddress({
        factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
        tokenA: pool.token0,
        tokenB: pool.token1,
        fee: pool.fee,
      }).toLowerCase()
    }
    return undefined
  }, [chainId, pool])

  // CANCEL ORDER TO DO

  const callback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('missing account')
      if (!poolAddress) throw new Error('missing pool')
      if (!marginFacility) throw new Error('missing marginFacility contract')
      if (!chainId) throw new Error('missing chainId')
      if (!provider) throw new Error('missing provider')

      const response = await marginFacility.cancelOrder(poolAddress, details.positionIsToken0, details.isAdd)
      return response
    } catch (err) {
      console.log('cancel order error', err)
      throw new Error('cancel order error')
    }
  }, [account, chainId, details, marginFacility, poolAddress, provider])

  const addTransaction = useTransactionAdder()

  const handleCancel = useCallback(() => {
    if (!callback || !details || !inputCurrency || !outputCurrency) {
      return
    }
    setAttemptingTxn(true)

    callback()
      .then((response) => {
        setAttemptingTxn(false)
        setTxHash(response?.hash)
        setErrorMessage(undefined)
        addTransaction(response, {
          type: TransactionType.REMOVE_LIMIT_ORDER,
          inputCurrencyId: inputCurrency.wrapped.address,
          outputCurrencyId: outputCurrency.wrapped.address,
        })
        return response.hash
      })
      .catch((error) => {
        console.error(error)
        setAttemptingTxn(false)
        setTxHash(undefined)
        setErrorMessage(error.message)
      })
  }, [callback, details, inputCurrency, outputCurrency, addTransaction, setAttemptingTxn, setTxHash, setErrorMessage])

  return (
    <div ref={ref} data-testid="token-table-row">
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
                {(Number(details.inputAmount) / 1e18).toString()}
                <CurrencyLogo currency={outputCurrency} size="13px" />
                {outputCurrency?.symbol}
              </AutoRow>
            </FlexStartRow>
          }
          output={
            <FlexStartRow>
              <AutoRow gap="2px" justify="start">
                {(Number(details.startOutput) / 1e18).toString()}
                <CurrencyLogo currency={inputCurrency} size="13px" />
                {inputCurrency?.symbol}
              </AutoRow>
            </FlexStartRow>
          }
          leverage={
            <FlexStartRow>
              <AutoRow>{leverage.toString()}</AutoRow>
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
                    onClick={handleCancel}
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
