import { LoadingBubble } from 'components/Tokens/loading'
import { Box } from 'nft/components/Box'
import { Row } from 'nft/components/Flex'
import { ReactNode } from 'react'
import { ThemedText } from 'theme'

const StatsItem = ({
  children,
  label,
  shouldHide,
  loading,
}: {
  children: ReactNode
  label: string
  shouldHide: boolean
  loading: boolean
}) => {
  return (
    <Box display={shouldHide ? 'none' : 'flex'} flexDirection="column" alignItems="baseline" gap="6" height="min">
      <ThemedText.SubHeader color="textSecondary">
        {loading ? <LoadingBubble width="80px" /> : children}
      </ThemedText.SubHeader>
      <ThemedText.CellName color="stateLabel" fontSize="14px">
        {label}
      </ThemedText.CellName>
    </Box>
  )
}

const InfoItemStats = ({ stats, brpData, loading }: { stats: any; brpData: any; loading: boolean }) => {
  // console.log('brpData', brpData)
  // console.log('stats', stats)
  return (
    <Row gap={{ sm: '24', md: '36', lg: '48', xl: '60' }} marginBottom="28" marginTop="32">
      <StatsItem label="Total boxes" shouldHide={false} loading={loading}>
        {brpData?.totalBoxes}
      </StatsItem>
      <StatsItem label="Total unlockable boxes" shouldHide={false} loading={loading}>
        {brpData?.totalUnlockableBoxes}
      </StatsItem>
      <StatsItem label="Total LMT" shouldHide={false} loading={loading}>
        {stats}
      </StatsItem>
      <StatsItem label="LMT required per unlock" shouldHide={false} loading={loading}>
        {brpData?.lmtRequiredPerUnlock}
      </StatsItem>
    </Row>
  )
}

export default InfoItemStats
