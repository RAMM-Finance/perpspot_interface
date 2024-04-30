import Row from 'components/Row'
import { Box } from 'nft/components/Box'
import { Column } from 'nft/components/Flex'
import { body } from 'nft/css/common.css'
import { useReducer, useRef, useState } from 'react'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'

import { TBRPData } from './BoxesContainr'
import InfoItemStats from './InfoItemStats'

const DescriptionText = styled.div<{ readMore: boolean }>`
  vertical-align: top;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.textTertiary};
  /* ${({ readMore }) =>
    readMore
      ? css`
          white-space: normal;
          overflow: visible;
          display: inline;
          max-width: 100%;
        `
      : css`
          white-space: nowrap;
          overflow: hidden;
          display: inline-block;
          max-width: min(calc(100% - 112px), 600px);
        `}

  a[href] {
    color: ${({ theme }) => theme.textSecondary};
    text-decoration: none;

    :hover {
      opacity: ${({ theme }) => theme.opacity.hover};
    }

    :focus {
      opacity: ${({ theme }) => theme.opacity.click};
    }
  } */
`

const ToggleDescriptionText = ({ description }: { description: string }) => {
  const [showReadMore, setShowReadMore] = useState(false)
  const [readMore, toggleReadMore] = useReducer((state) => !state, false)
  const descriptionRef = useRef<HTMLDivElement>(null)

  return (
    <Box>
      <DescriptionText readMore={readMore} ref={descriptionRef} className={body}>
        {description}
      </DescriptionText>
    </Box>
  )
}

const InfoDescription = ({ title, description }: { title?: boolean; description: string }) => {
  return (
    <Box
      display="flex"
      //   marginTop={isMobile && !stats.bannerImageUrl ? (collectionSocialsIsOpen ? '52' : '20') : '0'}
      justifyContent="center"
      position="relative"
      flexDirection="column"
      width="full"
    >
      <Box>
        {title ? (
          <Row>
            <ThemedText.HeadlineMedium color="textSecondary">{description}</ThemedText.HeadlineMedium>
          </Row>
        ) : (
          <ToggleDescriptionText description={description} />
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
      <InfoDescription title={true} description={title} />
      <InfoDescription description={description} />
      <InfoItemStats brpData={brpData} loading={loading} />
    </Column>
  )
}

export default InfoDescriptionSection
