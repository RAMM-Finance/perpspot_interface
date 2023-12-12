import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import affiliate from './affiliate-marketing.png'
import medal from './medal.png'
import trophy from './trophy.png'

const Wrapper = styled.div`
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 10px;
  padding: 10px;
`
const Achievement = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
  text-align: center;
  gap: 5px;
`

export default function Achievements() {
  return (
    <Wrapper>
      <Achievement>
        <img src={trophy} width={40} />
        <ThemedText.BodySmall>Earned 1,000 Points</ThemedText.BodySmall>
      </Achievement>
      <Achievement>
        <img src={affiliate} width={40} />
        <ThemedText.BodySmall>Referred 2 Friends</ThemedText.BodySmall>
      </Achievement>
      <Achievement>
        <img src={medal} width={40} />
        <ThemedText.BodySmall>Deposited 1000 USDC</ThemedText.BodySmall>
      </Achievement>
      <Achievement>
        <img src={trophy} width={40} />
        <ThemedText.BodySmall>Deposited 3 Days in a Row</ThemedText.BodySmall>
      </Achievement>
    </Wrapper>
  )
}
