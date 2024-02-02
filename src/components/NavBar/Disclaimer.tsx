import React from 'react'
import styled from 'styled-components/macro'
import { CloseIcon, ThemedText } from 'theme'

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: ${({ theme }) => theme.deprecated_yellow1};
  width: 100%;
  margin-top: 5px;
`

function Disclaimer({ setWarning }: { setWarning: (val: boolean) => void }) {
  return (
    <Wrapper>
      <ThemedText.DeprecatedBlack fontSize={14} color="black">
        Limitless is currently in Beta. There will be minor frontend bugs(if you spot them, please report). Although the
        contracts have undergone plentiful stateful fuzz tests, they are still new so don't invest more than you are
        willing to lose.
      </ThemedText.DeprecatedBlack>
      <CloseIcon
        style={{ color: 'black' }}
        onClick={() => {
          localStorage.setItem('warning', 'true')
          setWarning(true)
        }}
        size="16"
      />
    </Wrapper>
  )
}

export default Disclaimer
