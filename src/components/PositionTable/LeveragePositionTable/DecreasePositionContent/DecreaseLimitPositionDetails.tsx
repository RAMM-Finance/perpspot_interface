import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { Currency } from '@uniswap/sdk-core'
import { AutoColumn } from 'components/Column'
import { StyledCard, TextWithLoadingPlaceholder } from 'components/modalFooters/common'
import { RowBetween, RowFixed } from 'components/Row'
import { ValueLabel } from 'components/swap/AdvancedSwapDetails'
import { LmtTradePrice } from 'components/swap/TradePrice'
import { MouseoverTooltip } from 'components/Tooltip'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import { Separator, ThemedText } from 'theme'
import { MarginPositionDetails } from 'types/lmtv2position'

import { DerivedLimitReducePositionInfo } from '.'

const StyledBGCard = styled(StyledCard)`
  background: ${({ theme }) => theme.surface1};
`

const Underlined = styled.div`
  text-decoration: ${({ theme }) => `underline dashed ${theme.textTertiary}`};
`

export default function DecreasePositionLimitDetails({
  txnInfo,
  loading,
  inputCurrency,
  existingPosition,
}: {
  txnInfo?: DerivedLimitReducePositionInfo
  existingPosition?: MarginPositionDetails
  loading: boolean
  inputCurrency?: Currency
}) {
  const [invertedPrice, setInverted] = useState(false)

  const recieveAmount = useMemo(() => {
    if (!txnInfo || !existingPosition) return undefined
    return existingPosition.margin.minus(txnInfo.margin).plus(txnInfo.estimatedPnL)
  }, [txnInfo, existingPosition])

  return (
    <StyledBGCard style={{ width: '100%' }}>
      <AutoColumn gap="sm">
        <ValueLabel
          label="Debt Reduction"
          value={formatBNToString(txnInfo?.startingDebtReduceAmount, NumberType.SwapTradeAmount)}
          description="Maximum Debt Reduction"
          syncing={loading}
          symbolAppend={inputCurrency?.symbol}
          height="14px"
        />
        <ValueLabel
          label="Recieve"
          value={formatBNToString(recieveAmount, NumberType.SwapTradeAmount)}
          description="What you receive is your reduced margin + PnL"
          syncing={loading}
          delta={true}
          height="14px"
          symbolAppend={inputCurrency?.symbol}
        />
        <ValueLabel
          label="Estimated PnL"
          description="Amount the reduced position converts to, given your order price"
          syncing={loading}
          value={formatBNToString(txnInfo?.estimatedPnL, NumberType.SwapTradeAmount)}
          delta={true}
          symbolAppend={inputCurrency?.symbol}
          height="14px"
        />
        <Separator />
        <RowBetween>
          <RowFixed>
            <MouseoverTooltip text={<Trans>Initial execution price of the limit order</Trans>}>
              <ThemedText.BodySmall color="textPrimary">
                <Trans>Starting Trigger Price</Trans>
              </ThemedText.BodySmall>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={loading} width={65} height="16px">
            {txnInfo ? (
              <Underlined>
                <LmtTradePrice
                  setShowInverted={setInverted}
                  price={txnInfo.startingTriggerPrice}
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
      </AutoColumn>
    </StyledBGCard>
  )
}
