import './react-tabs-style.css'

import { Trans } from '@lingui/macro'
import { Token } from '@uniswap/sdk-core'
import React, { useState } from 'react'
import { Tab, TabList, Tabs } from 'react-tabs'
import styled from 'styled-components/macro'

import LimitInput from './LimitInput'

const Wrapper = styled.div`
  padding: 1rem;
  padding-bottom: 0px;
  background-color: ${({ theme }) => theme.backgroundSurface};
`

const Outline = styled.div`
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 12px;
  align-items: center;
  justify-content: space-around;
  position: relative;
`

interface TabInterface {
  currency0: Token | null
  tab: string
}

const LimitContent: React.FC<TabInterface> = ({ currency0, tab }) => {
  const [value, setValue] = useState<number | string>('')

  const header = (
    <div style={{ display: 'flex', gap: '.5vw' }}>
      <Tabs>
        <TabList>
          <Tab>
            <Trans>Market</Trans>
          </Tab>
          <Tab>
            <Trans>Limit</Trans>
          </Tab>
        </TabList>
      </Tabs>
    </div>
  )

  return (
    <>
      {tab === 'Swap' ? null : (
        <Wrapper>
          {header}
          <Outline>
            <LimitInput currency0={currency0} value={value} setValue={setValue} />
          </Outline>
        </Wrapper>
      )}
    </>
  )
}

export default LimitContent
