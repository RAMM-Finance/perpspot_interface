import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, SharedEventName } from '@uniswap/analytics-events'
import Column, { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { MouseoverTooltip } from 'components/Tooltip'
import { useCurrency } from 'hooks/Tokens'
import useENSName from 'hooks/useENSName'
import { useInvertedPrice } from 'hooks/useInvertedPrice'
import { useMemo } from 'react'
import { ArrowUpRight } from 'react-feather'
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
`

export const ActivityTableRow = styled.div`
  /* display: flex; */
  /* align-items: center; */
  display: flex;
  gap: 10px;
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
  .replace(/Price:\s*([\d.]+)/, (match: any, capturedGroup: any) => {
    return `Price: ${capturedGroup}`
  })
  .trim()
  // const modifiedDescriptor = descriptor
  //   .replace(/Price:\s*([\d.]+)/, (match: any, capturedGroup: any) => {
  //     const roundedNumber = Math.round(parseFloat(capturedGroup) * 1e6) / 1e6
  //     return `Price: ${roundedNumber.toString()}`
  //   })
  //   .trim()
  const priceIndex = modifiedDescriptor.indexOf('Price')

  const actionDescription = priceIndex !== -1 ? modifiedDescriptor.slice(0, priceIndex) : modifiedDescriptor
  let price = priceIndex !== -1 ? modifiedDescriptor.slice(priceIndex) : ''
  
  let priceNumber = 0
  // Extract the number following 'Price:' using regular expression.
  const priceRegex = /Price:\s*([\d.]+)/
  const priceMatch = price.match(priceRegex)
  if (priceMatch) {
    priceNumber = parseFloat(priceMatch[1])
  }
  // console.log(actionDescription, priceMatch, price, '-------processDescriptor------')
  let pnlNumber
  let marginToken
  let usdValue

  if (title === ActivityDescriptionType.REDUCE_POSITION && price.includes('Pnl')) {
    // Extract the number and token following 'Pnl' using regular expression.
    
    const pnlRegex = /Pnl:\s*(-?[\d.]+)\s*([A-Za-z]+)/
    const pnlMatch = price.match(pnlRegex)
    if (pnlMatch) {
      pnlNumber = parseFloat(pnlMatch[1]).toFixed(7)
      marginToken = pnlMatch[2]
    }

    const usdRegex = /\(\$(-?[\d.]+)\)/
    const usdMatch = price.match(usdRegex)
    if (usdMatch) {
      usdValue = parseFloat(usdMatch[1])
    }      

    price = price.slice(0, price.indexOf('Pnl')).trim()
  }
  return { actionDescription, pnlNumber, usdValue, marginToken, priceNumber }
}

export function ActivityRow({
  activity: { chainId, status, title, descriptor, logos, otherAccount, currencies, timestamp, hash, isOrder },
}: {
  activity: any
}) {
  const { ENSName } = useENSName(otherAccount)
  const timeSince = useTimeStamp(timestamp)
  // descript modified
  const { actionDescription, marginToken, usdValue, pnlNumber, priceNumber } = processDescriptor(descriptor, title)
  
  // console.log(descriptor, '-----descriptor----')
  // console.log('-----------marginToken', marginToken)
  const explorerUrl = getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)
  const { isInverted, invertedTooltipLogo } = useInvertedPrice(false)

  const [action, pair] = useMemo(() => {
    if (!actionDescription) return ['-', '-']
    return actionDescription.split(',')
  }, [actionDescription])

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
            <AutoColumn gap="5px">
              <ActivityTitle>
                <ThemedText.SubHeader fontWeight={500}>
                  {!isOrder ? title : title + ' (filled order)'}
                </ThemedText.SubHeader>
                <StyledTimestamp>{timeSince}</StyledTimestamp>
              </ActivityTitle>
              <RowBetween gap="20px">
              {pair ? 
                (
                  <>
                    <ThemedText.SubHeaderSmall fontSize={12} fontWeight={500} display="flex" alignItems="center">
                      {pair}
                    </ThemedText.SubHeaderSmall>
                    |
                  </>
                ) : 
                null
              }
                <ThemedText.SubHeaderSmall fontSize={12} fontWeight={500} display="flex" alignItems="center">
                  {action}
                  <MouseoverTooltip text="View on block explorer">
                    <ArrowUpRight size="16px" />
                  </MouseoverTooltip>
                </ThemedText.SubHeaderSmall>
                {(typeof pnlNumber !== 'undefined' && typeof usdValue !== 'undefined') ? (
                  <ThemedText.SubHeaderSmall fontSize={12} fontWeight={500} display="flex" alignItems="center">
                    <ActivityPrice>
                      <DeltaText delta={parseFloat(pnlNumber)}>{`Pnl: ${pnlNumber}`}</DeltaText>{' '}
                      {marginToken} 
                      <DeltaText delta={usdValue}>{` ($${usdValue.toString()})`}</DeltaText>
                    </ActivityPrice>
                  {ENSName ?? otherAccount}
                  </ThemedText.SubHeaderSmall>
                  ) : null
                }
              </RowBetween>
              {priceNumber ? (
                <ThemedText.SubHeaderSmall
                  style={{ gap: '5px' }}
                  fontSize={12}
                  fontWeight={500}
                  display="flex"
                  alignItems="center"
                >
                  <>
                    <ActivityPrice>
                    {`Price: ${
                      isInverted
                        ? ((1 / priceNumber) as number).toFixed((1 / priceNumber) < 1 ? 12 : 4)
                        : priceNumber.toFixed(priceNumber < 1 ? 12 : 4)
                    }`}
                    </ActivityPrice>
                    {invertedTooltipLogo} 
                  </>
                </ThemedText.SubHeaderSmall>
              ) : null}
            </AutoColumn>
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
