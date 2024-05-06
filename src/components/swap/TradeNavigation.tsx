import React from 'react'
import { ArrowRight } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { ThemedText } from 'theme'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const Element = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
  padding: 10px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
`
const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const TradeNavigation = () => {
  const navigate = useNavigate()
  return (
    <Wrapper>
      <Element onClick={() => navigate('/leaderboard')}>
        <TextWrapper>
          <ThemedText.BodySmall>Next - Tokenomics and Roadmap </ThemedText.BodySmall>LMT
        </TextWrapper>
        <ArrowRight />
      </Element>
      <Element onClick={() => navigate('/loot')}>
        <TextWrapper>
          <ThemedText.BodySmall>Next - Tokenomics and Roadmap </ThemedText.BodySmall>Loot
        </TextWrapper>
        <ArrowRight />
      </Element>
    </Wrapper>
  )
}

export default TradeNavigation
