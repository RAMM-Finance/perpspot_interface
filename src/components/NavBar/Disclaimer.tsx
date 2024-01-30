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
        Don't invest unless you are prepared to lose all the money you invest. This is a high-risk investment and you
        should not expect to be protected if something goes wrong. Please read carefully and understand risk disclosure
        and disclaimers before you proceed.
      </ThemedText.DeprecatedBlack>
      <CloseIcon style={{ color: 'black' }} onClick={() => setWarning(false)} size="16" />
    </Wrapper>
  )
}

export default Disclaimer
