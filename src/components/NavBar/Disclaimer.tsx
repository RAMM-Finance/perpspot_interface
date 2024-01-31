import React from 'react'
import styled from 'styled-components/macro'
import { CloseIcon, ThemedText } from 'theme'

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: ${({ theme }) => theme.deprecated_yellow1};
  width: 100%;
`

function Disclaimer({ setWarning }: { setWarning: (val: boolean) => void }) {
  return (
    <Wrapper>
      <ThemedText.DeprecatedBlack fontSize={14} color="black">
        Limitless is currently in Beta. There might be minor frontend bugs. Although the contracts have 
        undergone a lot of stateful fuzz tests, don't invest more than you are willing to lose.
      </ThemedText.DeprecatedBlack>
      <CloseIcon style={{ color: 'black' }} onClick={() => setWarning(false)} size="16" />
    </Wrapper>
  )
}

export default Disclaimer
