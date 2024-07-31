import Column from 'components/Column'
import { parseLocalActivity } from 'components/WalletDropdown/MiniPortfolio/Activity/parseLocal'
import { PortfolioLogo } from 'components/WalletDropdown/MiniPortfolio/PortfolioLogo'
import PortfolioRow from 'components/WalletDropdown/MiniPortfolio/PortfolioRow'
import useENSName from 'hooks/useENSName'
import { useMemo } from 'react'
import { X } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { useActivePopups } from 'state/application/hooks'
import { useCombinedActiveList } from 'state/lists/hooks'
import { useTransaction } from 'state/transactions/hooks'
import { TransactionDetails, TransactionType } from 'state/transactions/types'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { useChainId } from 'wagmi'

import { PopupAlertTriangle } from './FailedNetworkSwitchPopup'
import { useDefaultActiveTokens } from 'hooks/Tokens'

export const Descriptor = styled(ThemedText.BodySmall)`
  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

function TransactionPopupContent({
  tx,
  chainId,
  removeThisPopup,
}: {
  tx: TransactionDetails
  chainId: number
  removeThisPopup: (e: any) => void
}) {
  const success = tx.receipt?.status === 1
  // const tokens1 = useCombinedActiveList()
  const tokens = useDefaultActiveTokens()

  console.log("TOKENS COMBINED LIST", tokens)

  const activity = parseLocalActivity(tx, chainId, tokens)
  const { ENSName } = useENSName(activity?.otherAccount)

  const explorerUrl = getExplorerLink(chainId, tx.hash, ExplorerDataType.TRANSACTION)
  const navigate = useNavigate()
  const redirect = useMemo(() => {
    if (tx.info.type === TransactionType.ZAP_AND_MINT) {
      return () => {
        navigate('/pools/advanced')
        removeThisPopup(null)
      }
    }
    return undefined
  }, [tx, navigate, removeThisPopup])

  if (!activity) return null

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
      onClick={() => (redirect ? redirect() : window.open(explorerUrl, '_blank'))}
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
const StatusPopup = styled.div`
  width: 350px;
  height: 30px;
  position: fixed;
  bottom: 8vh;
  right: 1vw;
  background-color: ${({ theme }) => theme.popup};
  /* border: 1px solid red; */
  border-radius: 16px;
  padding: 4px;
  padding-right: 35px;
`

export default function TransactionPopup({
  hash,
  removeThisPopup,
}: {
  hash: string
  removeThisPopup: (e: any) => void
}) {
  const chainId = useChainId()

  const tx = useTransaction(hash)
  const theme = useTheme()
  if (!chainId || !tx) return null

  switch (tx.info.type) {
    default:
      return (
        <Popup>
          <StyledClose color={theme.textSecondary} onClick={removeThisPopup} />
          <TransactionPopupContent tx={tx} chainId={chainId} removeThisPopup={removeThisPopup} />
        </Popup>
      )
  }
}

export function TransactionStatusPopup() {
  const activePopups: any = useActivePopups()

  return (
    <StatusPopup>
      {activePopups.map((item: any) => (
        <TransactionStatusPopupItem key={item.key} hash={item.content.txn.hash} />
      ))}
    </StatusPopup>
  )
}

function TransactionStatusPopupItem({ hash, removeThisPopup }: { hash?: string; removeThisPopup?: () => void }) {
  const tx: any = useTransaction(hash)
  const chainId = useChainId()
  // const success = tx.receipt?.status === 1
  const tokens = useCombinedActiveList()
  const activity: any = parseLocalActivity(tx, chainId, tokens)
  const { ENSName } = useENSName(activity?.otherAccount)
  return (
    <div>
      <ThemedText.SubHeader fontWeight={500}>{activity.title}</ThemedText.SubHeader>
      <Descriptor color="textSecondary">
        {activity.descriptor}
        {ENSName ?? activity.otherAccount}
      </Descriptor>
    </div>
  )
}
