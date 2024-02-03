import { NumberType } from '@uniswap/conedison/format'
import { Currency } from '@uniswap/sdk-core'
import { AutoColumn } from 'components/Column'
import { StyledCard } from 'components/modalFooters/common'
import { ValueLabel } from 'components/swap/AdvancedSwapDetails'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import { MarginPositionDetails } from 'types/lmtv2position'
import { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import {  TextWithLoadingPlaceholder, TruncatedText } from 'components/modalFooters/common'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { Trans } from '@lingui/macro'
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
          label="Repaying"
          value={formatBNToString(txnInfo?.startingDebtReduceAmount, NumberType.SwapTradeAmount)}
          description="Amount you are repaying"
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
        {/*<ValueLabel
          label="Estimated PnL"
          description="PnL"
          syncing={loading}
          value={formatBNToString(txnInfo?.estimatedPnL, NumberType.SwapTradeAmount)}
          delta={true}
          symbolAppend={inputCurrency?.symbol}
          height="14px"
        />*/}

        <RowBetween>
          <RowFixed>
            <MouseoverTooltip text={<Trans>Estimated PnL when position is closed at current market price</Trans>}>
              <ThemedText.BodySmall color="textPrimary">
                <Trans>Estimated PnL</Trans>
              </ThemedText.BodySmall>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={loading} width={65} height="14px">
            <ThemedText.BodySmall textAlign="right" color="textSecondary">
              <TruncatedText>
                <DeltaText delta={Number(txnInfo?.estimatedPnL)}>
                  {txnInfo
                    ? `(${(
                        (Number(txnInfo?.estimatedPnL.toNumber()) / Number(existingPosition?.margin.toNumber())) *
                        100
                      ).toFixed(2)}%) ${formatBNToString(txnInfo?.estimatedPnL, NumberType.SwapTradeAmount)}  ${
                        inputCurrency?.symbol
                      }`
                    : '-'}
                </DeltaText>
              </TruncatedText>
            </ThemedText.BodySmall>
          </TextWithLoadingPlaceholder>
        </RowBetween>



      </AutoColumn>
    </StyledBGCard>
  )
}
