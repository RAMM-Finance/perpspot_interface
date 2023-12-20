import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import affiliate from './affiliate-marketing.png'
import coin from './coin.png'
import star from './star_616489.png'

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  width: 100%;
  height: 3vh;
`
const Point = styled.div`
  display: flex;
  justify-content: start;
  padding: 0 1rem;
  gap: 5px;
  border-left: 1px solid ${({ theme }) => theme.backgroundOutline};
`

const Value = styled.div`
  display: flex;
  gap: 5px;
  align-items: end;
`

export default function Points() {
  return (
    <Wrapper>
      <Point style={{ border: 'none' }}>
        <img src={star} width={22} />
        <Value>
          <ThemedText.BodySecondary fontWeight={900}># 7</ThemedText.BodySecondary>
          <ThemedText.BodySmall fontWeight={300}>Rank</ThemedText.BodySmall>
        </Value>
      </Point>
      <Point>
        <img src={coin} width={22} />
        <Value>
          <ThemedText.BodySecondary fontWeight={900}>1000.00</ThemedText.BodySecondary>
          <ThemedText.BodySmall fontWeight={300}>Trade Point</ThemedText.BodySmall>
        </Value>
      </Point>
      <Point>
        <img src={star} width={22} />
        <Value>
          <ThemedText.BodySecondary fontWeight={900}>500.00</ThemedText.BodySecondary>
          <ThemedText.BodySmall fontWeight={300}>LP Point</ThemedText.BodySmall>
        </Value>
      </Point>
      <Point>
        <img src={affiliate} width={22} />
        <Value>
          <ThemedText.BodySecondary fontWeight={900}>200.00</ThemedText.BodySecondary>
          <ThemedText.BodySmall fontWeight={300}>Referral Point</ThemedText.BodySmall>
        </Value>
      </Point>
      <Point>
        <img src={star} width={22} />
        <Value>
          <ThemedText.BodySecondary fontWeight={900}>8000.00</ThemedText.BodySecondary>
          <ThemedText.BodySmall fontWeight={300}>Total Point</ThemedText.BodySmall>
        </Value>
      </Point>
    </Wrapper>
  )
}
