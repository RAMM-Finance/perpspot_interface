import { useWeb3React } from '@web3-react/core'
import Column from 'components/Column'
import { parseLocalActivity } from 'components/WalletDropdown/MiniPortfolio/Activity/parseLocal'
import { PortfolioLogo } from 'components/WalletDropdown/MiniPortfolio/PortfolioLogo'
import PortfolioRow from 'components/WalletDropdown/MiniPortfolio/PortfolioRow'
import useENSName from 'hooks/useENSName'
import { useState } from 'react'
import { X } from 'react-feather'
import { useActivePopups } from 'state/application/hooks'
import { PopupContent } from 'state/application/reducer'
import { useCombinedActiveList } from 'state/lists/hooks'
import { useTransaction } from 'state/transactions/hooks'
import { TransactionDetails } from 'state/transactions/types'
import styled, { useTheme } from 'styled-components/macro'
import { CustomLightSpinner, ThemedText } from 'theme'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

import Circle from '../../assets/images/blue-loader.svg'
import FailedNetworkSwitchPopup, { PopupAlertTriangle } from './FailedNetworkSwitchPopup'

export const Descriptor = styled(ThemedText.BodySmall)`
  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

function TransactionPopupContent({ tx, chainId }: { tx: TransactionDetails; chainId: number }) {
  const success = tx.receipt?.status === 1
  const tokens = useCombinedActiveList()
  const activity = parseLocalActivity(tx, chainId, tokens)
  const { ENSName } = useENSName(activity?.otherAccount)

  if (!activity) return null

  const explorerUrl = getExplorerLink(chainId, tx.hash, ExplorerDataType.TRANSACTION)

  return (
    <PortfolioRow
      isPopUp={true}
      left={
        success ? (
          <Column>
            <PortfolioLogo
              chainId={chainId}
              currencies={activity.currencies}
              images={activity.logos}
              accountAddress={activity.otherAccount}
            />
          </Column>
        ) : (
          <PopupAlertTriangle />
        )
      }
      title={<ThemedText.SubHeader fontWeight={500}>{activity.title}</ThemedText.SubHeader>}
      descriptor={
        typeof activity.descriptor === 'string' ? (
          <Descriptor color="textSecondary">
            {activity.descriptor}
            {ENSName ?? activity.otherAccount}
          </Descriptor>
        ) : (
          activity.descriptor
        )
      }
      onClick={() => window.open(explorerUrl, '_blank')}
    />
  )
}

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
  background-color: ${({ theme }) => theme.popup};
  position: relative;
  border-radius: 16px;
  padding: 4px;
  padding-right: 35px;
  overflow: hidden;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    min-width: 290px;
    &:not(:last-of-type) {
      margin-right: 20px;
    }
  `}
`

const StatusClose = styled(StyledClose)`
  top: 8px;
  right: 12px;
`
const StatusPopupWrapper = styled.div`
  width: max-content;
  min-width: 300px;
  height: 8vh;
  min-height: 70px;
  position: fixed;
  bottom: 3vh;
  right: 1vw;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* line-height: 2.5; */
  /* font-size: 2.5rem; */
  background-color: ${({ theme }) => theme.popup};
  color: ${({ theme }) => theme.accentTextLightPrimary};
  padding: 15px;
`

const StatusLoadingSpinner = styled(CustomLightSpinner)`
  position: absolute;
  bottom: 15%;
  right: 5%;
`

export default function TransactionPopup({ hash, removeThisPopup }: { hash: string; removeThisPopup: () => void }) {
  const { chainId } = useWeb3React()
  const tx = useTransaction(hash)
  const theme = useTheme()

  if (!chainId || !tx) return null

  switch (tx.info.type) {
    default:
      return (
        <Popup>
          <StyledClose color={theme.textSecondary} onClick={removeThisPopup} />
          <TransactionPopupContent tx={tx} chainId={chainId} />
        </Popup>
      )
  }
}

// export function TransactionStatusPopup({
//   loadingOrders,
//   loadingPositions,
// }: {
//   loadingOrders?: boolean
//   loadingPositions?: boolean
// }) {
//   const activePopups = useActivePopups()
//   console.log('---------activePopups-----', activePopups)
//   console.log('---------activePopupsLoading-----', loadingOrders, loadingPositions)
//   return (
//     <>
//       {
//         activePopups.length > 0 &&
//         activePopups.map((item) => {
//           <StatusPopupItem key={item.key} content={item.content} />
//         })}
//     </>
//   )
// }

// export function StatusPopupItem({
//   content,
// }: {
//   content: PopupContent
// }) {
//   const [IsShowStatus, setShowStatus] = useState(true)
//   const theme = useTheme()
//   let popupContent

//   if (!IsShowStatus) return null

//   if ('txn' in content) {
//     popupContent = StatusPopup({ hash: content.txn.hash })

//     return <>{popupContent}</>
//   } else if ('failedSwitchNetwork' in content) {
//     popupContent = <FailedNetworkSwitchPopup chainId={content.failedSwitchNetwork} />

//     return (
//       <StatusPopupWrapper>
//         <StatusClose color={theme.textSecondary} onClick={() => setShowStatus(false)} />
//         {popupContent}
//       </StatusPopupWrapper>
//     )
//   }
//   return null
// }

export function StatusPopup() {
  const theme = useTheme()
  const [IsShowStatus, setShowStatus] = useState(true)

  if(!IsShowStatus) return null;
  return (
    <StatusPopupWrapper>
      <ThemedText.SubHeaderSmall fontSize={16} fontWeight={500}>
        Fulfilling order request
      </ThemedText.SubHeaderSmall>
      <StatusClose color={theme.textSecondary} onClick={() => setShowStatus(false)} />
      {/* <ThemedText.SubHeader fontWeight={500}>
      </ThemedText.SubHeader> */}
      <StatusLoadingSpinner src={Circle} alt="loader" size="24px" />
    </StatusPopupWrapper>
  )
}



