import { useWeb3React } from '@web3-react/core'
import Column from 'components/Column'
import { parseLocalActivity } from 'components/WalletDropdown/MiniPortfolio/Activity/parseLocal'
import { PortfolioLogo } from 'components/WalletDropdown/MiniPortfolio/PortfolioLogo'
import PortfolioRow from 'components/WalletDropdown/MiniPortfolio/PortfolioRow'
import useENSName from 'hooks/useENSName'
import { X } from 'react-feather'
import { useCombinedActiveList } from 'state/lists/hooks'
import { useTransaction } from 'state/transactions/hooks'
import { TransactionDetails } from 'state/transactions/types'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

import { PopupAlertTriangle } from './FailedNetworkSwitchPopup'

export const Descriptor = styled(ThemedText.BodySmall)`
  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Wrapper = styled.div``

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
