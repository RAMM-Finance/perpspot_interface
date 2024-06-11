import { SMALL_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import React from 'react'
import { usePoolsAprUtilList } from 'state/application/hooks'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import HighlightPair from './HighlightPair'

const Wrapper = styled.div`
  border: solid ${({ theme }) => theme.backgroundOutline};
  border-width: 1px;
  border-radius: 10px;
  height: 150px;
  padding-top: 10px;
  padding-left: 10px;
  overflow-y: scroll;
  width: 475px;
  ::-webkit-scrollbar {
    display: none;
  }
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    transform-origin: left top;
    transform: scale(0.9);
  }
`
const GroupWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 140px);
  gap: 15px;
  padding-top: 15px;
`

const Highlights = () => {
  const { poolList } = usePoolsAprUtilList()
  const arr = poolList && Object.entries(poolList).slice(0, 3)

  return (
    <>
      <Wrapper>
        <ThemedText.BodySecondary fontSize={15} fontWeight={800}>
          APR & LMT Highlights
        </ThemedText.BodySecondary>
        <GroupWrapper>
          {arr?.map((pool) => (
            <HighlightPair key={pool[0]} aprInfo={pool} />
          ))}
        </GroupWrapper>
      </Wrapper>
    </>
  )
}

export default Highlights
