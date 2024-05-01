import Row from 'components/Row'
import { Box } from 'nft/components/Box'
import { Column } from 'nft/components/Flex'
import { body } from 'nft/css/common.css'
import { TBRPData } from 'pages/NewItemsList'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import InfoItemStats from './InfoItemStats'

import bluePill from '../../assets/images/bluePill.jpg'


const BluePillImg = styled.img`
  position: absolute;
  width: 76px;
  height: 37px;
  background-color: transparent;
  transform: scale(1.3);
  opacity: 0.8;
  right: 0px;
  /* bottom: -10.5px; */
  z-index: -999;
`

const DescriptionText = styled(ThemedText.CellName)<{ color?: string; fontSize?: number }>`
  vertical-align: top;
  text-overflow: ellipsis;
  color: ${({ theme, color }) => (color ? color : theme.textTertiary)};
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '16px')};
`

const ToggleDescriptionText = ({
  description,
  color,
  fontSize,
}: {
  description: string
  color?: string
  fontSize?: number
}) => {
  return (
    <Box>
      <DescriptionText className={body} color={color} fontSize={fontSize}>
        {description}
      </DescriptionText>
    </Box>
  )
}

export const InfoDescription = ({
  title,
  description,
  color,
  fontSize,
}: {
  title?: boolean
  description: string
  color?: string
  fontSize?: number
}) => {
  return (
    <Box display="flex" justifyContent="center" position="relative" flexDirection="column" width="full">
      <Box>
        {title ? (
          <Row>
            <ThemedText.HeadlineMedium color={color ? color : 'textSecondary'} fontSize={fontSize}>
              {description}
            </ThemedText.HeadlineMedium>
          </Row>
        ) : (
          <ToggleDescriptionText description={description} color={color} fontSize={fontSize} />
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
    <Column marginTop="40" marginBottom="28" gap="18" marginX="24" position="relative">
      <InfoDescription title={true} description={title} fontSize={20}/>
      {/* <BluePillImg src={bluePill}/> */}
      <InfoDescription description={description} />
      <InfoItemStats brpData={brpData} loading={loading} />
    </Column>
  )
}

export default InfoDescriptionSection
