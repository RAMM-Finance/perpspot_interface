import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import affiliate from './affiliate-marketing.png'
import coin from './coin.png'
import star from './star_616489.png'

const Wrapper = styled.div`
  margin: 0 auto;
  display: flex;
  gap: 6rem;
  margin-top: 10px;
`
const Point = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  margin-top: 15px;
  text-align: left;
  gap: 5px;
`

const Value = styled.div`
  display: flex;
  flex-direction: column;
`

export default function Points() {
  return (
    <Wrapper>
      <Point>
        <img src={coin} width={30} />
        <Value>
          <ThemedText.BodySecondary fontWeight={900}>1000.00</ThemedText.BodySecondary>
          <ThemedText.BodyPrimary fontWeight={300}>Trade Point</ThemedText.BodyPrimary>
        </Value>
      </Point>
      <Point>
        <img src={star} width={30} />
        <Value>
          <ThemedText.BodySecondary fontWeight={900}>500.00</ThemedText.BodySecondary>
          <ThemedText.BodyPrimary fontWeight={300}>LP Point</ThemedText.BodyPrimary>
        </Value>
      </Point>
      <Point>
        <img src={affiliate} width={30} />
        <Value>
          <ThemedText.BodySecondary fontWeight={900}>200.00</ThemedText.BodySecondary>
          <ThemedText.BodyPrimary fontWeight={300}>Referral Point</ThemedText.BodyPrimary>
        </Value>
      </Point>
      <Point>
        <img src={star} width={30} />
        <Value>
          <ThemedText.BodySecondary fontWeight={900}>8000.00</ThemedText.BodySecondary>
          <ThemedText.BodyPrimary fontWeight={300}>Total Point</ThemedText.BodyPrimary>
        </Value>
      </Point>
      <Point>
        <img src={star} width={30} />
        <Value>
          <ThemedText.BodySecondary fontWeight={900}># 7</ThemedText.BodySecondary>
          <ThemedText.BodyPrimary fontWeight={300}>Rank</ThemedText.BodyPrimary>
        </Value>
      </Point>
    </Wrapper>
  )
}
