import { OpacityHoverState, ScrollBarStyles } from 'components/Common'
import { Box } from 'nft/components/Box'
import { ActivityEventType, CollectionInfoForAsset, GenieAsset } from 'nft/types'
import { Link as RouterLink } from 'react-router-dom'
import styled from 'styled-components/macro'

import * as styles from './AssetDetails.css'

const AssetPriceDetailsContainer = styled.div`
  margin-top: 20px;
  display: none;
  @media (max-width: 960px) {
    display: block;
  }
`

const MediaContainer = styled.div`
  display: flex;
  justify-content: center;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 780px;
`

const AddressTextLink = styled.a`
  display: inline-block;
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  max-width: 100%;
  word-wrap: break-word;
  ${OpacityHoverState};
`

const SocialsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
`

const DescriptionText = styled.div`
  margin-top: 8px;
  font-size: 14px;
  line-height: 20px;
`

const RarityWrap = styled.span`
  display: flex;
  color: ${({ theme }) => theme.textSecondary};
  padding: 2px 4px;
  border-radius: 4px;
  align-items: center;
  gap: 4px;
`

const EmptyActivitiesContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: ${({ theme }) => theme.textPrimary};
  font-size: 28px;
  line-height: 36px;
  padding: 56px 0px;
`

const Link = styled(RouterLink)`
  color: ${({ theme }) => theme.accentAction};
  text-decoration: none;
  font-size: 14px;
  line-height: 16px;
  margin-top: 12px;
  cursor: pointer;
  ${OpacityHoverState};
`

const ActivitySelectContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 34px;
  overflow-x: auto;
  ${ScrollBarStyles}

  @media (max-width: 720px) {
    padding-bottom: 8px;
  }
`

const ContentNotAvailable = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.backgroundSurface};
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  line-height: 20px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  width: 450px;
  height: 450px;
`

const FilterBox = styled.div<{ backgroundColor: string }>`
  box-sizing: border-box;
  background-color: ${({ backgroundColor }) => backgroundColor};
  font-size: 14px;
  font-weight: 600;
  line-height: 14px;
  color: ${({ theme }) => theme.textPrimary};
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  box-sizing: border-box;
  ${OpacityHoverState};
`

const ByText = styled.span`
  font-size: 14px;
  line-height: 20px;
`

const Img = styled.img`
  background-color: white;
`

const HoverImageContainer = styled.div`
  display: flex;
  margin-right: 4px;
`

const HoverContainer = styled.div`
  display: flex;
`

const ContainerText = styled.span`
  font-size: 14px;
`

const AudioPlayer = ({
  imageUrl,
  animationUrl,
  name,
  collectionName,
  dominantColor,
}: GenieAsset & { dominantColor: [number, number, number] }) => {
  return (
    <Box position="relative" display="inline-block" alignSelf="center">
      <Box as="audio" className={styles.audioControls} width="292" controls src={animationUrl} />
      <img
        className={styles.image}
        src={imageUrl}
        alt={name || collectionName}
        style={{
          ['--shadow' as string]: `rgba(${dominantColor.join(', ')}, 0.5)`,
          minWidth: '300px',
          minHeight: '300px',
        }}
      />
    </Box>
  )
}

const initialFilterState = {
  [ActivityEventType.Listing]: true,
  [ActivityEventType.Sale]: true,
  [ActivityEventType.Transfer]: false,
  [ActivityEventType.CancelListing]: false,
}

enum MediaType {
  Audio = 'audio',
  Video = 'video',
  Image = 'image',
  Embed = 'embed',
}

const AssetView = ({
  mediaType,
  asset,
  dominantColor,
}: {
  mediaType: MediaType
  asset: GenieAsset
  dominantColor: [number, number, number]
}) => {
  const style = { ['--shadow' as string]: `rgba(${dominantColor.join(', ')}, 0.5)` }

  switch (mediaType) {
    case MediaType.Video:
      return <video src={asset.animationUrl} className={styles.image} autoPlay controls muted loop style={style} />
    case MediaType.Image:
      return (
        <img className={styles.image} src={asset.imageUrl} alt={asset.name || asset.collectionName} style={style} />
      )
    case MediaType.Audio:
      return <AudioPlayer {...asset} dominantColor={dominantColor} />
    case MediaType.Embed:
      return (
        <div className={styles.embedContainer}>
          <iframe
            title={asset.name ?? `${asset.collectionName} #${asset.tokenId}`}
            src={asset.animationUrl}
            className={styles.embed}
            style={style}
            frameBorder={0}
            height="100%"
            width="100%"
            sandbox="allow-scripts"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
  }
}

interface AssetDetailsProps {
  asset: GenieAsset
  collection: CollectionInfoForAsset
}
