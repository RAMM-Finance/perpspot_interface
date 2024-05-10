import { LoadingBubble } from 'components/Tokens/loading'
import { Box } from 'nft/components/Box'
import { Row } from 'nft/components/Flex'
import { TBRPData } from 'pages/Loot'
import { ReactNode } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const ModalStatsBox = styled(Box)<{ isModal?: boolean }>`
  background-color: ${({ theme }) => theme.backgroundScrolledSurface};
  border-radius: 20px;
  height: 100%;
  padding: 1rem;
`

const StateLabelText = styled(ThemedText.CellName)`
  letter-spacing: -0.2px;
  word-spacing: -1.3px;
  white-space: nowrap;
`;

const ModalStateText = styled(ThemedText.MediumHeader)`
  white-space: nowrap;
`

export const StatsItem = ({
  children,
  label,
  loading,
}: {
  children: ReactNode
  label: string
  loading: boolean
  labelImg?: string
}) => {
  return (
    <Box flexDirection="column" alignItems="baseline" height="min">
      <ThemedText.SubHeader color="textSecondary">
        {loading ? <LoadingBubble width="80px" /> : children}
      </ThemedText.SubHeader>
      <StateLabelText color="stateLabel" fontSize="14px" marginTop="7px">
        {label}
      </StateLabelText>
    </Box>
  )
}

const ModalStatsItem = ({
  children,
  label,
  loading,
}: {
  children: ReactNode
  label: string
  loading: boolean
  labelImg?: string
}) => {
  return (
    <ModalStatsBox display="flex" flexDirection="column" justifyContent="space-between" gap="10" width="full">
      <ModalStateText color="textSecondary" fontWeight={600}>
        {loading ? <LoadingBubble width="80px" /> : children}
      </ModalStateText>
      <StateLabelText color="stateLabel" minWidth="90px" fontSize="14px">
        {label}
      </StateLabelText>
    </ModalStatsBox>
  )
}

const InfoItemStats = ({ brpData, loading }: { brpData: TBRPData; loading: boolean }) => {
  return (
    <Row gap={{ sm: '24', md: '36', lg: '48', xl: '60' }} marginBottom="28" marginTop="32">
      <StatsItem label="Total boxes" loading={loading}>
        {brpData?.totalBoxes}
      </StatsItem>
      <StatsItem label="Total unlockable boxes" loading={loading}>
        {brpData?.totalUnlockableBoxes}
      </StatsItem>
      <StatsItem label="Total LMT" loading={loading}>
        {brpData?.totalLMT}
      </StatsItem>
      <StatsItem label="LMT required per unlock" loading={loading}>
        {brpData?.lmtRequiredPerUnlock}
      </StatsItem>
      <StatsItem label="points used" loading={loading}>
        {brpData?.pointForUnlocks}
      </StatsItem>
    </Row>
  )
}

export const ModalItemStats = ({ brpData, loading }: { brpData: TBRPData; loading?: boolean }) => {
  const { totalLMT, lmtRequiredPerUnlock, NZTRageHigh, NZTRageRow, pointForUnlocks } = brpData
  return (
    <Row gap="12" marginBottom="20" marginTop="24">
      <ModalStatsItem label=" Current LMT" loading={false}>
        {totalLMT}
      </ModalStatsItem>
      <ModalStatsItem label="LMT needed for unlock" loading={false}>
        {lmtRequiredPerUnlock}
      </ModalStatsItem>
      <ModalStatsItem label="NZT rewards range" loading={false}>
        {NZTRageRow} ~ {NZTRageHigh}
      </ModalStatsItem>
      <ModalStatsItem label="points used" loading={false}>
        {pointForUnlocks}
      </ModalStatsItem>
    </Row>
  )
}

export default InfoItemStats
