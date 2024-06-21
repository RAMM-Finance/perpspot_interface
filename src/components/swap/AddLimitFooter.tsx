import { Trans } from '@lingui/macro'
import { InterfaceElementName } from '@uniswap/analytics-events'
import { ReactNode } from 'react'
import { Text } from 'rebass'
import { AddLimitTrade } from 'state/marginTrading/hooks'

import { ButtonError } from '../Button'
import { AutoRow } from '../Row'
import { SwapCallbackError } from './styleds'

export default function AddLimitModalFooter({
  trade,
  // allowedSlippage,
  hash,
  onConfirm,
  errorMessage,
  disabledConfirm,
}: {
  trade: AddLimitTrade
  hash: string | undefined
  // allowedSlippage: Percent
  onConfirm: () => void
  errorMessage: ReactNode | undefined
  disabledConfirm: boolean
}) {
  return (
    <>
      <AutoRow justify="center">
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          style={{ margin: '10px 0 0 0', width: 'fit-content', borderRadius: '10px' }}
          id={InterfaceElementName.CONFIRM_SWAP_BUTTON}
        >
          <Text fontSize={12} fontWeight={500}>
            <Trans>Confirm Limit Order</Trans>
          </Text>
        </ButtonError>

        {errorMessage ? <SwapCallbackError error={errorMessage} /> : null}
      </AutoRow>
    </>
  )
}
