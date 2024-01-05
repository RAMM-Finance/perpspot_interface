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
import { useState } from 'react'
import styled from 'styled-components/macro'
import { Separator, ThemedText } from 'theme'

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
}: {
  txnInfo?: DerivedLimitReducePositionInfo
  loading: boolean
  inputCurrency?: Currency
}) {
  const [invertedPrice, setInverted] = useState(false)

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
          <TextWithLoadingPlaceholder syncing={loading} width={65} height="14px">
            {txnInfo ? (
              <Underlined>
                <LmtTradePrice
                  setShowInverted={setInverted}
                  price={txnInfo.startingTriggerPrice}
                  showInverted={invertedPrice}
                />
              </Underlined>
            ) : (
              <ThemedText.BodySmall textAlign="right" color="textSecondary">
                -
              </ThemedText.BodySmall>
            )}
          </TextWithLoadingPlaceholder>
        </RowBetween>
      </AutoColumn>
    </StyledBGCard>
  )
}
