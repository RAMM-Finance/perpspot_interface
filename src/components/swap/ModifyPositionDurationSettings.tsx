// eslint-disable-next-line no-restricted-imports
import { Trans } from '@lingui/macro'
import { BigNumber as BN } from 'bignumber.js'
import Input from 'components/NumericalInput'
import { RowBetween } from 'components/Row'
import { DurationSliderMarks } from 'components/Slider/MUISlider'
import { MouseoverTooltip } from 'components/Tooltip'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import { LeverageInputSection } from 'pages/Trade'
import { useCallback, useEffect, useMemo } from 'react'
import { Text } from 'rebass'
import { MarginField } from 'state/marginTrading/actions'
import {
  AddMarginTrade,
  parseBN,
  updatedPremiumFromAdjustedDuration,
  useMarginTradingActionHandlers,
  useMarginTradingState,
} from 'state/marginTrading/hooks'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { AutoColumn } from '../Column'

const StyledDurationInput = styled(Input)`
  width: 4.2rem;
  text-align: right;
  padding-right: 5px;
  padding-left: 5px;
  height: 20px;
  line-height: 12px;
  font-size: 11px;
  border-radius: 10px;
`
const ResetWrapper = styled.div`
  // display: flex;
  // justify-content: center;
  // align-items: center;
  // margin-top: 5px;
  // margin-left: 3px;
  &:hover {
    cursor: pointer;
    // transform: rotate(180deg);
    // transition: transform 0.2s linear;
    transform: scale(1.1);
  }
`

export default function ModifyPositionDurationSettings({
  estValue,
  trade,
}: {
  estValue: string | undefined | number
  trade?: AddMarginTrade
}) {
  const { onEstimatedDurationChange, onUpdatedPremiumChange } = useMarginTradingActionHandlers()
  const { [MarginField.EST_DURATION]: selectedDuration, updatedPremium } = useMarginTradingState()

  const [debouncedDuration, onDebouncedDuration] = useDebouncedChangeHandler(
    selectedDuration ?? '',
    onEstimatedDurationChange
  )

  const parsedSelectedDuration = useMemo(() => parseBN(debouncedDuration), [debouncedDuration])

  const _updatedPremium = useMemo(() => {
    if (!trade || !parsedSelectedDuration) return undefined
    return updatedPremiumFromAdjustedDuration(
      parsedSelectedDuration,
      trade.executionPrice,
      trade.borrowRate,
      trade.borrowAmount,
      trade.premiumInPosToken
    )
  }, [trade, parsedSelectedDuration])

  const handleUpdatePremium = useCallback(
    (value: BN | undefined) => {
      onUpdatedPremiumChange(value)
    },
    [onUpdatedPremiumChange]
  )

  useEffect(() => {
    if (!_updatedPremium) return
    if (_updatedPremium === updatedPremium) return
    if (!debouncedDuration) return
    handleUpdatePremium(_updatedPremium)
    return
  }, [_updatedPremium, handleUpdatePremium, updatedPremium, debouncedDuration])

  return (
    <AutoColumn gap="md" style={{ padding: '.5rem' }}>
      <RowBetween align="start">
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            whiteSpace: 'nowrap',
          }}
        >
          <Text fontWeight={600} fontSize={12}>
            Set Estimated Duration
          </Text>
          <MouseoverTooltip text={<Trans>Adjust to desired hourly duration</Trans>}></MouseoverTooltip>
        </div>
        <MouseoverTooltip text="Reset to default position duration">
          {/* <ResetWrapper>
            <RefreshCw size={12} />
          </ResetWrapper> */}
          <ResetWrapper
            onClick={() => {
              handleUpdatePremium(undefined)
              onDebouncedDuration('')
            }}
          >
            <ThemedText.BodySmall fontSize={10} fontWeight={600}>
              Reset
            </ThemedText.BodySmall>
          </ResetWrapper>
        </MouseoverTooltip>
      </RowBetween>
      <RowBetween gap="3px" style={{ flexWrap: 'nowrap', justifyContent: 'end' }}>
        <LeverageInputSection>
          <StyledDurationInput
            className="token-amount-input"
            value={selectedDuration ? debouncedDuration : estValue ?? ''}
            placeholder={`${estValue ? estValue : '100'}`}
            onUserInput={(str: string) => {
              if (str === '') {
                onDebouncedDuration('')
              } else if (!!str && Number(str) >= 0) {
                if (Number(str) > 500) {
                  return
                }
                if (Number(str) >= 0) {
                  onDebouncedDuration(str)
                }
              }
            }}
            disabled={false}
          />
        </LeverageInputSection>
        <ThemedText.BodySmall>hrs</ThemedText.BodySmall>
      </RowBetween>

      <>
        <DurationSliderMarks
          max={500}
          initialValue={
            debouncedDuration === '' ? Number(estValue) : Math.round(Number(debouncedDuration) * 1000) / 1000
          }
          maxLeverage="500"
          onChange={(val) => onDebouncedDuration(val.toString())}
          duration={true}
        />
      </>
    </AutoColumn>
  )
}
