import { Box } from 'nft/components/Box'
import { Row } from 'nft/components/Flex'
import { ReactNode } from 'react'
import { ThemedText } from 'theme'
import styled from 'styled-components/macro'

const PercentChange = styled.div<{ isNegative: boolean }>`
  color: ${({ theme, isNegative }) => (isNegative ? theme.accentFailure : theme.accentSuccess)};
  display: flex;
  align-items: center;
  justify-content: center;
`

const StatsItem = ({ children, label, shouldHide }: { children: ReactNode; label: string; shouldHide: boolean }) => {
  return (
    <Box display={shouldHide ? 'none' : 'flex'} flexDirection="column" alignItems="baseline" gap="6" height="min">
      <ThemedText.SubHeader color="textSecondary">{children}</ThemedText.SubHeader>
      <ThemedText.CellName color="stateLabel" fontSize="14px">{label}</ThemedText.CellName>
    </Box>
  )
}

const InfoItemStats = ({stats} : {stats: any}) => {
  return (
    <Row gap={{ sm: '24', md: '36', lg: '48', xl: '60' }} marginBottom="28" marginTop="32">
      <StatsItem label="Total boxes" shouldHide={false}>
        ETH
      </StatsItem>
      <StatsItem label="Total unlockable boxes" shouldHide={false}>
        <PercentChange isNegative={false}>
          {/* {arrow} */}
          {/* {floorChangeStr} */}%
        </PercentChange>
      </StatsItem>
      <StatsItem label="Total LMT" shouldHide={false}>
        {stats} ETH
      </StatsItem>
      {/* <StatsItem label="Items" shouldHide={isMobile ?? false}>
          {totalSupplyStr}
        </StatsItem> */}
      <StatsItem label="LMT required per unlock" shouldHide={false}>
        %
      </StatsItem>
      {/* <StatsItem label="LMT required per unlock" shouldHide={false}>
        %
      </StatsItem> */}
    </Row>
  )
}

export default InfoItemStats
