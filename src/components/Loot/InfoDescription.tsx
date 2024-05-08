import { Box } from 'nft/components/Box'
import { Column, Row } from 'nft/components/Flex'
import { TBRPData } from 'pages/Loot'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import bluePill from '../../assets/images/bluePill.jpg'
import InfoItemStats from './InfoItemStats'
import { ButtonPrimary } from 'components/Button'
import { Trans } from '@lingui/macro'

const BluePillImg = styled.img`
  position: absolute;
  width: 155px;
  height: 65px;
  background-color: transparent;
  transform: scale(1.3);
  opacity: 0.8;
  right: -130px;
  bottom: -24px;
  z-index: -999;
`

const DescriptionText = styled(ThemedText.CellName)`
  word-spacing: -0.5px;
`

const TitleDescriptionText = styled(ThemedText.HeadlineMedium)<{ spacing?: number }>`
  word-spacing: ${({ spacing }) => spacing && `${spacing}px`};
  white-space: nowrap;
`

export const InfoDescription = ({
  title,
  description,
  color,
  fontSize,
  spacing,
}: {
  title?: boolean
  description: string
  color?: string
  fontSize?: number
  spacing?: number
}) => {
  return (
    <Box display="flex" justifyContent="center" position="relative" flexDirection="column">
      <Box>
        {title ? (
          <TitleDescriptionText
            color={color ? color : 'textSecondary'}
            fontSize={fontSize}
            fontWeight={600}
            spacing={spacing}
          >
            {description}
          </TitleDescriptionText>
        ) : (
          <DescriptionText color={color ? color : 'textTertiary'} fontSize={fontSize} marginTop="5px">
            {description}
          </DescriptionText>
        )}
      </Box>
    </Box>
  )
}

const InfoDescriptionSection = ({
  title,
  description,
  brpData,
  loading,
}: {
  title: string
  description: string
  brpData: TBRPData
  loading: boolean
}) => {
  return (
    <Column marginTop="40" marginBottom="28" gap="18" marginX="24" flexWrap="wrap">
      <Row alignItems="center">
        <InfoDescription title={true} description={title} fontSize={20} />
        <Row position="relative" gap="8" marginLeft="32" alignItems="center" marginTop="8">
          <ThemedText.CellName fontSize="14px" fontWeight={600} width="min">
            My NZT balance
          </ThemedText.CellName>
          <ThemedText.SubHeader color="textSecondary">0</ThemedText.SubHeader>
          <BluePillImg src={bluePill} />
        </Row>
      </Row>
      <InfoDescription description={description} fontSize={18} />
      <InfoItemStats brpData={brpData} loading={loading} />
    </Column>
  )
}

export default InfoDescriptionSection
