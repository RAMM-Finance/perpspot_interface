import { useCallback, useEffect } from 'react'
import { X } from 'react-feather'
import { TransactionType } from 'state/transactions/types'
import styled, { useTheme } from 'styled-components/macro'

import { useRemovePopup } from '../../state/application/hooks'
import { PopupContent } from '../../state/application/reducer'
import FailedNetworkSwitchPopup from './FailedNetworkSwitchPopup'
import TransactionPopup from './TransactionPopup'

const StyledClose = styled(X)`
  position: absolute;
  right: 20px;
  top: 20px;

  :hover {
    cursor: pointer;
  }
`
const Popup = styled.div`
  display: inline-block;
  width: 100%;
  padding: 1em;
  background-color: ${({ theme }) => theme.backgroundSurface};
  position: relative;
  border-radius: 16px;
  padding: 20px;
  padding-right: 35px;
  overflow: hidden;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    min-width: 290px;
    &:not(:last-of-type) {
      margin-right: 20px;
    }
  `}
`

export default function PopupItem({
  removeAfterMs,
  content,
  popKey,
}: {
  removeAfterMs: number | null
  content: PopupContent
  popKey: string
}) {
  const removePopup = useRemovePopup()
  removeAfterMs = 25000
  const removeThisPopup = useCallback(() => removePopup(popKey), [popKey, removePopup])
  useEffect(() => {
    if (removeAfterMs === null) return undefined

    const timeout = setTimeout(() => {
      removeThisPopup()
    }, removeAfterMs)

    return () => {
      clearTimeout(timeout)
    }
  }, [removeAfterMs, removeThisPopup])

  const theme = useTheme()

  let popupContent
  let transactionType: TransactionType
  if ('txn' in content) {
    popupContent = TransactionPopup({ hash: content.txn.hash, removeThisPopup })

    return <>{popupContent}</>
  } else if ('failedSwitchNetwork' in content) {
    popupContent = <FailedNetworkSwitchPopup chainId={content.failedSwitchNetwork} />

    return (
      <Popup>
        <StyledClose color={theme.textSecondary} onClick={removeThisPopup} />
        {popupContent}
      </Popup>
    )
  }
  return null

  // return popupContent ? (
  //   <Popup>
  //     <StyledClose color={theme.textSecondary} onClick={removeThisPopup} />
  //     {popupContent}
  //   </Popup>
  // ) : null
}
