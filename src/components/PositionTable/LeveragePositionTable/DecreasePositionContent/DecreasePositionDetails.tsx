import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { Currency, Percent } from '@uniswap/sdk-core'
import { AutoColumn } from 'components/Column'
import { StyledCard, TextWithLoadingPlaceholder, TruncatedText } from 'components/modalFooters/common'
import { RowBetween, RowFixed } from 'components/Row'
import { ValueLabel } from 'components/swap/AdvancedSwapDetails'
import { LmtTradePrice } from 'components/swap/TradePrice'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { MouseoverTooltip } from 'components/Tooltip'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import { Separator, ThemedText } from 'theme'
import { MarginPositionDetails } from 'types/lmtv2position'

import { DerivedReducePositionInfo } from '.'

function MouseoverValueLabel({
  description,
  label,
  value,
  appendSymbol,
  syncing,
}: {
  description: string
  label: React.ReactNode
  value: React.ReactNode | string
  appendSymbol?: string
  syncing?: boolean
}) {
  // const theme = useTheme()

  return (
    <RowBetween padding="1px">
      <RowFixed>
        <MouseoverTooltip text={<Trans>{description}</Trans>} disableHover={false}>
          <ThemedText.BodySmall color="textSecondary">{label}</ThemedText.BodySmall>
        </MouseoverTooltip>
      </RowFixed>
      <TextWithLoadingPlaceholder syncing={syncing ?? false} width={65}>
        <ThemedText.BodySmall color="textSecondary" textAlign="right">
          {`${value ?? '-'} ${appendSymbol ?? ''}`}
        </ThemedText.BodySmall>
      </TextWithLoadingPlaceholder>
    </RowBetween>
  )
}

const StyledBGCard = styled(StyledCard)`
  background: ${({ theme }) => theme.surface1};
`

const Underlined = styled.div`
  text-decoration: ${({ theme }) => `underline dashed ${theme.textTertiary}`};
`

export function DecreasePositionDetails({
  txnInfo,
  inputCurrency,
  loading,
  existingPosition,
  allowedSlippage,
  removePremium,
}: {
  txnInfo?: DerivedReducePositionInfo
  inputCurrency?: Currency
  loading: boolean
  existingPosition?: MarginPositionDetails
  allowedSlippage: Percent
  removePremium: boolean
}) {
  const [invertedPrice, setInverted] = useState(false)

  const receiveAmount = useMemo(() => {
    if (!txnInfo || !existingPosition) return undefined

    const re = removePremium
      ? existingPosition.margin.minus(txnInfo.margin).plus(txnInfo.PnL).plus(txnInfo.withdrawnPremium)
      : existingPosition.margin.minus(txnInfo.margin).plus(txnInfo.PnL)

    return re
  }, [txnInfo, existingPosition, removePremium])

  const PnLWithPremiums = useMemo(() => {
    if (!txnInfo || !existingPosition) return undefined
    return txnInfo?.PnL.minus(existingPosition?.premiumOwed)
  }, [txnInfo, existingPosition])

  return (
    <StyledBGCard style={{ width: '100%' }}>
      <AutoColumn gap="md">
        <RowBetween>
          <RowFixed>
            <MouseoverTooltip text={<Trans>Estimated PnL when position is closed at current market price</Trans>}>
              <ThemedText.BodySmall color="textPrimary">
                <Trans> PnL including premiums</Trans>
              </ThemedText.BodySmall>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={loading} width={65} height="14px">
            <ThemedText.BodySmall textAlign="right" color="textSecondary">
              <TruncatedText>
                <DeltaText delta={Number(PnLWithPremiums)}>
                  {txnInfo
                    ? `(${(
                        (Number(PnLWithPremiums?.toNumber()) / Number(existingPosition?.margin.toNumber())) *
                        100
                      ).toFixed(2)}%) ${formatBNToString(PnLWithPremiums, NumberType.SwapTradeAmount)}  ${
                        inputCurrency?.symbol
                      }`
                    : '-'}
                </DeltaText>
              </TruncatedText>
            </ThemedText.BodySmall>
          </TextWithLoadingPlaceholder>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <MouseoverTooltip text={<Trans>Estimated PnL when position is closed at current market price</Trans>}>
              <ThemedText.BodySmall color="textPrimary">
                <Trans> PnL</Trans>
              </ThemedText.BodySmall>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={loading} width={65} height="14px">
            <ThemedText.BodySmall textAlign="right" color="textSecondary">
              <TruncatedText>
                <DeltaText delta={Number(txnInfo?.PnL)}>
                  {txnInfo
                    ? `(${(
                        (Number(txnInfo?.PnL.toNumber()) / Number(existingPosition?.margin.toNumber())) *
                        100
                      ).toFixed(2)}%) ${formatBNToString(txnInfo?.PnL, NumberType.SwapTradeAmount)}  ${
                        inputCurrency?.symbol
                      }`
                    : '-'}
                </DeltaText>
              </TruncatedText>
            </ThemedText.BodySmall>
          </TextWithLoadingPlaceholder>
        </RowBetween>
        {removePremium ? (
          <ValueLabel
            label="Returned Deposit"
            description="Position will automatically withdraw your remaining 
              premium deposit and refund you."
            value={formatBNToString(txnInfo?.withdrawnPremium, NumberType.SwapTradeAmount)}
            symbolAppend={inputCurrency?.symbol}
            syncing={loading}
            height="14px"
          />
        ) : null}
        <ValueLabel
          label="Total Received"
          description={
            !removePremium
              ? 'What you receive is your reduced margin + PnL'
              : 'What you recieve is your reduced margin + PnL + returned deposit'
          }
          value={formatBNToString(receiveAmount, NumberType.SwapTradeAmount)}
          symbolAppend={inputCurrency?.symbol}
          syncing={loading}
          height="14px"
        />
        <RowBetween>
          <RowFixed>
            <MouseoverTooltip text={<Trans>Execution price of transactionHash</Trans>}>
              <ThemedText.BodySmall color="textPrimary">
                <Trans>Reduce Execution Price</Trans>
              </ThemedText.BodySmall>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={loading} width={65} height="16px">
            {txnInfo ? (
              <Underlined>
                <LmtTradePrice
                  setShowInverted={setInverted}
                  price={txnInfo.executionPrice}
                  showInverted={invertedPrice}
                />
              </Underlined>
            ) : (
              <ThemedText.BodySmall fontSize="14px" textAlign="right" color="textSecondary">
                -
              </ThemedText.BodySmall>
            )}
          </TextWithLoadingPlaceholder>
        </RowBetween>
        <Separator />
        {existingPosition?.marginInPosToken ? (
          <></>
        ) : (
          <ValueLabel
            label="Minimum output"
            description="The minimum amount your reduced position is guaranteed to convert to. If the price slips any further, your transaction will revert."
            value={formatBNToString(txnInfo?.minimumOutput, NumberType.SwapTradeAmount)}
            symbolAppend={inputCurrency?.symbol}
            syncing={loading}
            height="14px"
          />
        )}
      </AutoColumn>
    </StyledBGCard>
  )
}
