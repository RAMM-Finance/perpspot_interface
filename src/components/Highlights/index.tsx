import React from 'react'
import { usePoolsAprUtilList } from 'state/application/hooks'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import HighlightPair from './HighlightPair'

const Wrapper = styled.div`
  border: solid ${({ theme }) => theme.backgroundOutline};
  border-width: 1px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.backgroundSurface};
  margin-bottom: 0.7rem;
  height: 150px;
  padding-top: 10px;
  padding-left: 5px;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
`
const GroupWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 105px);
  gap: 15px;
  padding-top: 15px;
`

const Highlights = () => {
  const { poolList } = usePoolsAprUtilList()
  const arr = poolList && Object.entries(poolList).slice(0, 3)

  return (
    <>
      <Wrapper>
        <ThemedText.SubHeaderSmall color="primary" fontWeight={800}>
          APR & LMT Highlights
        </ThemedText.SubHeaderSmall>
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
