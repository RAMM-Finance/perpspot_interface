import Row from 'components/Row'
import { Box } from 'nft/components/Box'
import { Column } from 'nft/components/Flex'
import { TBRPData } from 'pages/NewItemsList'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import bluePill from '../../assets/images/bluePill.jpg'
import InfoItemStats from './InfoItemStats'

const BluePillImg = styled.img`
  position: absolute;
  width: 155px;
  height: 68px;
  background-color: transparent;
  transform: scale(1.3);
  opacity: 0.8;
  right: 10px;
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
    <Column marginTop="40" marginBottom="28" gap="18" marginX="24">
      <Row alignItems="center">
        <InfoDescription title={true} description={title} fontSize={20} />
        <Column position="relative" gap="8" marginLeft="60">
          <ThemedText.SubHeader color="textSecondary">0</ThemedText.SubHeader>
          <ThemedText.CellName color="stateLabel" fontSize="14px" fontWeight={500} width="250px">
            My NZT balance
          </ThemedText.CellName>
          <BluePillImg src={bluePill} />
        </Column>
      </Row>
      <InfoDescription description={description} />
      <InfoItemStats brpData={brpData} loading={loading} />
    </Column>
  )
}

export default InfoDescriptionSection
