import Row from 'components/Row'
import { Box } from 'nft/components/Box'
import { Column } from 'nft/components/Flex'
import { DiscordIcon } from 'nft/components/icons'
import { body } from 'nft/css/common.css'
import { useEffect, useReducer, useRef, useState } from 'react'
import { Bookmark, GitHub } from 'react-feather'
import ReactMarkdown from 'react-markdown'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'

import { ReactComponent as X } from '../../components/Footer/twitter.svg'
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

const ReadMore = styled.span`
  vertical-align: top;
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;
  margin-left: 4px;
`

const ToggleDescriptionText = ({ description }: { description: string }) => {
  const [showReadMore, setShowReadMore] = useState(false)
  const [readMore, toggleReadMore] = useReducer((state) => !state, false)
  const descriptionRef = useRef<HTMLDivElement>(null)

  // useEffect(() => {
  //   const handleResize = () => {
  //     if (descriptionRef.current) {
  //       setShowReadMore(descriptionRef.current.offsetWidth <= descriptionRef.current.scrollWidth)
  //     }
  //   }

  //   handleResize()

  //   window.addEventListener('resize', handleResize)
  //   return () => window.removeEventListener('resize', handleResize)
  // }, [description])

  return (
    // <Box style={{ maxWidth: '680px' }}>
    <Box>
      <DescriptionText readMore={readMore} ref={descriptionRef} className={body}>
        {description}
        {/* <ReactMarkdown
          source={description}
          allowedTypes={['link', 'paragraph', 'strong', 'code', 'emphasis', 'text']}
          renderers={{ paragraph: 'span' }}
        /> */}
      </DescriptionText>
      {/* {showReadMore && (
        <ReadMore className={body} onClick={toggleReadMore}>
          show {readMore ? 'less' : 'more'}
        </ReadMore>
      )} */}
    </Box>
  )
}

const IconWrapper = styled.div`
  margin-left: 2.5rem;
  margin-top: 0.5rem;
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
`

const Link = styled.a`
  cursor: pointer;
`

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
      {/* {isCollectionStatsLoading && (
            <Box as="div" borderRadius="round" position="absolute" className={styles.collectionImageIsLoadingBackground} />
          )} */}
      {/* <Box
            as={isCollectionStatsLoading ? 'div' : 'img'}
            background="explicitWhite"
            borderRadius="round"
            position="absolute"
            className={isCollectionStatsLoading ? styles.collectionImageIsLoading : styles.collectionImage}
            src={stats.isFoundation && !stats.imageUrl ? '/nft/svgs/marketplaces/foundation.svg' : stats.imageUrl}
          /> */}
      <Box>
        {/* <CollectionName
              collectionStats={stats}
              name={''}
              isVerified={stats.isVerified ?? false}
              isMobile={isMobile}
              collectionSocialsIsOpen={collectionSocialsIsOpen}
              toggleCollectionSocials={toggleCollectionSocials}
            /> */}
        {title ? (
          <Row>
            <ThemedText.HeadlineMedium color="textSecondary">{description}</ThemedText.HeadlineMedium>
            <IconWrapper>
              <Link href="https://twitter.com/LimitlessFi_" rel="noopener noreferrer" target="_blank">
                <X fill="#b8c0dc" width="18px" />
              </Link>
              <Link href="https://discord.com/invite/v7Dq4vTvUE" rel="noopener noreferrer" target="_blank">
                <DiscordIcon fill="#b8c0dc" width="28px" />
              </Link>
              <Link rel="noopener noreferrer" target="_blank">
                <GitHub fill="#b8c0dc" width="23px" />
              </Link>
              <Link href="https://linktr.ee/limitlessfi" rel="noopener noreferrer" target="_blank">
                <Bookmark fill="#b8c0dc" width="23px" />
              </Link>
            </IconWrapper>
          </Row>
        ) : (
          <ToggleDescriptionText description={description} />
        )}
        {/* <StatsRow display={{ sm: 'none', md: 'flex' }} overflow="hidden" stats={stats} marginTop="20" /> */}
      </Box>
      {/* TODO: mobile display section */}
      {/* <ToggleDescriptionText description="dev testing2..... 2" /> */}
      {/* <div id="nft-anchor-mobile" />
          <StatsRow isMobile display={{ sm: 'flex', md: 'none' }} stats={stats} marginTop="20" marginBottom="12" /> */}
    </Box>
  )
}

const InfoDescriptionSection = ({ title, description }: { title: string; description: string }) => {
  return (
    <Column marginTop="40" marginBottom="28">
      <InfoDescription title={true} description={title} />
      <InfoDescription description={description} />
      <InfoItemStats/>
    </Column>
  )
}

export default InfoDescriptionSection
