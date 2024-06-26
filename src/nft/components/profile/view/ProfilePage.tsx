import { Box } from 'nft/components/Box'
import { Column, Row } from 'nft/components/Flex'
import { CrossIcon } from 'nft/components/icons'
import { ScreenBreakpointsPaddings } from 'nft/pages/collection/index.css'
import { WalletCollection } from 'nft/types'
import styled from 'styled-components/macro'

import * as styles from './ProfilePage.css'

const ProfilePageColumn = styled(Column)`
  ${ScreenBreakpointsPaddings}
`

const ProfileHeader = styled.div`
  font-size: 28px;
  font-weight: 500;
  line-height: 38px;
  padding-bottom: 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    font-size: 20px;
    line-height: 28px;
    margin-bottom: 0px;
  }
`

const EmptyStateContainer = styled.div`
  margin-top: 164px;
`

export const DEFAULT_WALLET_ASSET_QUERY_AMOUNT = 25
export const WALLET_COLLECTIONS_PAGINATION_LIMIT = 300

const CollectionFilterItem = ({
  collection,
  setCollectionFilters,
}: {
  collection: WalletCollection | undefined
  setCollectionFilters: (address: string) => void
}) => {
  if (!collection) return null
  return (
    <Row
      justifyContent="center"
      paddingTop="6"
      paddingRight="6"
      paddingBottom="6"
      paddingLeft="12"
      borderRadius="8"
      background="backgroundOutline"
      fontSize="14"
    >
      <Box as="img" borderRadius="round" width="20" height="20" src={collection.image} />
      <Box marginLeft="6" className={styles.collectionFilterBubbleText}>
        {collection?.name}
      </Box>
      <Box
        color="textSecondary"
        background="none"
        height="28"
        width="28"
        padding="0"
        as="button"
        border="none"
        cursor="pointer"
        onClick={() => setCollectionFilters(collection.address)}
      >
        <CrossIcon />
      </Box>
    </Row>
  )
}
