import { Trace } from '@uniswap/analytics'
import { InterfacePageName } from '@uniswap/analytics-events'
import Footer from 'components/Footer'
import { filterStringAtom } from 'components/Tokens/state'
import TokenTable from 'components/Tokens/TokenTable/TokenTable'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'

const ExploreContainer = styled.div`
  width: 85%;
  min-width: 320px;
  padding-top: 15px;
  flex-flow: column nowrap;
  max-width: 1480px;
  height: 100%;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 48px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: 20px;
  }
`

const Tokens = () => {
  const resetFilterString = useResetAtom(filterStringAtom)
  const location = useLocation()

  useEffect(() => {
    resetFilterString()
  }, [location, resetFilterString])

  return (
    <Trace page={InterfacePageName.TOKENS_PAGE} shouldLogImpression>
      <ExploreContainer>
        <TokenTable />
      </ExploreContainer>
      <Footer />
    </Trace>
  )
}

export default Tokens
