import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, SharedEventName } from '@uniswap/analytics-events'
import Column from 'components/Column'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { useCurrency } from 'hooks/Tokens'
import useENSName from 'hooks/useENSName'
import { useInvertedPrice } from 'hooks/useInvertedPrice'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

import { PortfolioLogo } from '../PortfolioLogo'
import PortfolioRow from '../PortfolioRow'
import { useTimeStamp } from './parseRemote'
import { ActivityDescriptionType } from './types'

const ActivityTitle = styled.div`
  display: flex;
  align-items: center;
  column-gap: 0.5rem;
`

const ActivityPrice = styled.div`
  border-bottom: 1px dashed rgba(245, 246, 252, 0.5);
  margin-left: 0.5rem;
`

const ActivityTableRow = styled.div`
  /* display: flex; */
  /* align-items: center; */
`

const StyledTimestamp = styled.span`
  color: ${({ theme }) => theme.accentTextLightSecondary};
  font-variant: small;
  font-feature-settings: 'tnum' on, 'lnum' on, 'ss02' on;
  white-space: nowrap;
  font-size: 12px;
  padding-top: 1px;
`
function processDescriptor(descriptor: string, title?: string) {
  const modifiedDescriptor = descriptor
    .replace(/\d+(\.\d+)?/, (match: any) => {
      const roundedNumber = Math.round(parseFloat(match) * 1e6) / 1e6
      return roundedNumber.toString()
    })
    .split(/(?:for|long)\s/i)[0]
    .trim()

  const priceIndex = modifiedDescriptor.indexOf('Price')
  const actionDescription = modifiedDescriptor.slice(0, priceIndex)
  let price = priceIndex !== -1 ? modifiedDescriptor.slice(priceIndex) : ''
  let priceNumber = 0
  // Extract the number following 'Price:' using regular expression.
  const priceRegex = /Price:\s*([\d.]+)/
  const priceMatch = price.match(priceRegex)
  if (priceMatch) {
    priceNumber = parseFloat(priceMatch[1]);
  }
  let pnlNumber
  let marginToken
  if (title === ActivityDescriptionType.REDUCE_POSITION && price.includes('Pnl')) {
    // Extract the number and token following 'Pnl' using regular expression.
    const pnlRegex = /Pnl:\s*(-?[\d.]+)\s*([A-Za-z]+)/;
    const pnlMatch = price.match(pnlRegex)

    if (pnlMatch) {
      pnlNumber = parseFloat(pnlMatch[1])
      marginToken = pnlMatch[2]
    }
    price = price.slice(0, price.indexOf('Pnl')).trim()
    // console.log(pnlNumber, marginToken, priceNumber, price,'------------------')
  }

  return { actionDescription, pnlNumber, marginToken, priceNumber }
}

export function ActivityRow({
  activity: { chainId, status, title, descriptor, logos, otherAccount, currencies, timestamp, hash, isOrder },
}: {
  activity: any
}) {
  const { ENSName } = useENSName(otherAccount)
  const timeSince = useTimeStamp(timestamp)
  // descript modified
  const { actionDescription, marginToken, pnlNumber, priceNumber } = processDescriptor(descriptor, title)
  // console.log(   descriptor, pnlNumber, priceNumber, '-----descriptor----',)

  const explorerUrl = getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)
  const { isInverted, invertedTooltipLogo } = useInvertedPrice(false)

  return (
    <TraceEvent
      events={[BrowserEvent.onClick]}
      name={SharedEventName.ELEMENT_CLICKED}
      element={InterfaceElementName.MINI_PORTFOLIO_ACTIVITY_ROW}
      properties={{ hash, chain_id: chainId, explorer_url: explorerUrl }}
    >
      <PortfolioRow
        isGrow={false}
        left={
          <Column>
            <PortfolioLogo
              chainId={chainId}
              currencies={[useCurrency(currencies[0]), useCurrency(currencies[1])]}
              images={logos}
              accountAddress={otherAccount}
            />
          </Column>
        }
        title={
          <ActivityTableRow>
            <ActivityTitle>
              <ThemedText.SubHeader fontWeight={500}>
                {!isOrder ? title : title + ' (filled order)'}
              </ThemedText.SubHeader>
              <StyledTimestamp>{timeSince}</StyledTimestamp>
            </ActivityTitle>
            <ThemedText.SubHeaderSmall fontWeight={500} display="flex" alignItems="center">
              {actionDescription}
              {isInverted ? (
                priceNumber < 1 ?
                (<ActivityPrice>{`Price: ${( priceNumber / 1 as number).toFixed(7)}`}</ActivityPrice>)
                :
                (<ActivityPrice>{`Price: ${( 1 / priceNumber as number).toFixed(7)}`}</ActivityPrice>)
              ) : (
                <ActivityPrice>{`Price: ${priceNumber > 1 ? priceNumber.toFixed(2) : priceNumber.toFixed(5)}`}</ActivityPrice>
              )}
              {invertedTooltipLogo}
              {pnlNumber && (
                <ActivityPrice>
                  <DeltaText delta={pnlNumber}>{`Pnl: ${pnlNumber.toFixed(8)} `}</DeltaText>
                  {marginToken}
                </ActivityPrice>
              )}
              {ENSName ?? otherAccount}
            </ThemedText.SubHeaderSmall>
          </ActivityTableRow>
        }
        // descriptor= {
        // }
        // right={
        //   // status === TransactionStatus.Pending ? (
        //   //   <LoaderV2 />
        //   // ) : status === TransactionStatus.Confirmed ? (
        //   //   <StyledTimestamp>{timeSince}</StyledTimestamp>
        //   // ) : (
        //   //   <AlertTriangleFilled />
        //   // )
        // }
        onClick={() => window.open(explorerUrl, '_blank')}
      />
    </TraceEvent>
  )
}
