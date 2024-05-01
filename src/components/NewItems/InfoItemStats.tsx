import { LoadingBubble } from 'components/Tokens/loading'
import { Box } from 'nft/components/Box'
import { Row } from 'nft/components/Flex'
import { TBRPData } from 'pages/NewItemsList'
import { ReactNode } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

// import bluePill from '../../assets/images/bluePill.jpg'

// const BluePillImg = styled.img`
//   position: absolute;
//   width: 76px;
//   height: 37px;
//   background-color: transparent;
//   transform: scale(1.3);
//   opacity: 0.8;
//   right: -58px;
//   bottom: -10.5px;
//   z-index: -999;
// `

const ModalStatsBox = styled(Box)<{ isModal?: boolean }>`
  background-color: ${({ theme }) => theme.backgroundScrolledSurface};
  border-radius: 20px;
  height: 100%;
  padding: 1rem;
`

const StatsItem = ({
  children,
  label,
  shouldHide,
  loading,
  labelImg,
}: {
  children: ReactNode
  label: string
  shouldHide: boolean
  loading: boolean
  labelImg?: string
  isModal?: boolean
}) => {
  return (
    <Box
      position="relative"
      display={shouldHide ? 'none' : 'flex'}
      flexDirection="column"
      alignItems="baseline"
      gap="6"
      height="min"
    >
      <ThemedText.SubHeader color="textSecondary">
        {loading ? <LoadingBubble width="80px" /> : children}
      </ThemedText.SubHeader>
      <ThemedText.CellName color="stateLabel" fontSize="14px">
        {label}
        {/* {!loading && labelImg && <BluePillImg src={labelImg} />} */}
      </ThemedText.CellName>
    </Box>
  )
}

const ModalStatsItem = ({
  children,
  label,
  shouldHide,
  loading,
}: {
  children: ReactNode
  label: string
  shouldHide: boolean
  loading: boolean
  labelImg?: string
}) => {
  return (
    <ModalStatsBox
      position="relative"
      display={shouldHide ? 'none' : 'flex'}
      flexDirection="column"
      alignItems="baseline"
      gap="10"
      height="min"
      width="full"
    >
      <ThemedText.SubHeader color="textSecondary">
        {loading ? <LoadingBubble width="80px" /> : children}
      </ThemedText.SubHeader>
      <ThemedText.BodySmall color="stateLabel" minWidth="90px">
        {label}
      </ThemedText.BodySmall>
    </ModalStatsBox>
  )
}

const InfoItemStats = ({ brpData, loading }: { brpData: TBRPData; loading: boolean }) => {
  // console.log('brpData', brpData)
  return (
    <Row gap={{ sm: '24', md: '36', lg: '48', xl: '60' }} marginBottom="28" marginTop="32">
      <StatsItem label="Total boxes" shouldHide={false} loading={loading}>
        {brpData?.totalBoxes}
      </StatsItem>
      <StatsItem label="Total unlockable boxes" shouldHide={false} loading={loading}>
        {brpData?.totalUnlockableBoxes}
      </StatsItem>
      <StatsItem label="Total LMT" shouldHide={false} loading={loading}>
        {brpData?.totalLMT}
      </StatsItem>
      <StatsItem label="LMT required per unlock" shouldHide={false} loading={loading}>
        {brpData?.lmtRequiredPerUnlock}
      </StatsItem>
      {/* <StatsItem label="My NZT balance" shouldHide={false} loading={loading} labelImg={bluePill}>
        0
      </StatsItem> */}
    </Row>
  )
}

export const ModalItemStats = ({ brpData, loading }: { brpData: TBRPData, loading?: boolean }) => {
  // console.log('brpData', brpData)
  const { totalLMT, lmtRequiredPerUnlock, NZTRageHigh, NZTRageRow } = brpData
  return (
    <Row gap="12" marginBottom="20" marginTop="24">
      <ModalStatsItem label=" Current LMT" shouldHide={false} loading={false}>
        {totalLMT}
      </ModalStatsItem>
      <ModalStatsItem label="LMT needed for unlock" shouldHide={false} loading={false}>
        {lmtRequiredPerUnlock}
      </ModalStatsItem>
      <ModalStatsItem label="NZT rewards range" shouldHide={false} loading={false}>
        {NZTRageRow} ~ {NZTRageHigh}
      </ModalStatsItem>
    </Row>
  )
}

export default InfoItemStats
