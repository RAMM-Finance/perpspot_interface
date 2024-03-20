import { Trans } from '@lingui/macro'
import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, InterfaceEventName } from '@uniswap/analytics-events'
import searchIcon from 'assets/svg/search.svg'
import xIcon from 'assets/svg/x.svg'
import { MEDIUM_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import useDebounce from 'hooks/useDebounce'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import styled from 'styled-components/macro'

import { poolFilterStringAtom } from './state'

const ICON_SIZE = '20px'
const SearchBarContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 0.5rem;
  top: 0; // Stick to the top of the container
  z-index: 999;
  // background-color: ${({ theme }) => theme.searchBackground};
`

const SearchInput = styled.input`
  background: no-repeat scroll 7px 7px;
  background-image: url(${searchIcon});
  background-size: 20px 20px;
  background-position: 12px center;
  /* border: solid 1px ${({ theme }) => theme.backgroundOutline}; */
  border: none;
  background-color: ${({ theme }) => theme.searchBackground};
  height: 100%;
  width: 95%;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-size: 14px;
  padding-left: 40px;
  color: ${({ theme }) => theme.textSecondary};
  transition-duration: ${({ theme }) => theme.transition.duration.fast};
  // :hover {
  //   background-color: ${({ theme }) => theme.backgroundSurface};
  // }

  :focus {
    outline: none;
    // background-color: ${({ theme }) => theme.backgroundSurface};
    // border-color: ${({ theme }) => theme.accentActionSoft};
  }

  ::placeholder {
    /* color: ${({ theme }) => theme.textTertiary}; */
    color: ${({ theme }) => theme.textPrimary};
  }

  ::-webkit-search-cancel-button {
    -webkit-appearance: none;
    appearance: none;
    height: ${ICON_SIZE};
    width: ${ICON_SIZE};
    background-image: url(${xIcon});
    /* margin-right: 0px; */
    background-size: ${ICON_SIZE} ${ICON_SIZE};
    cursor: pointer;
  }

  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    width: 95%;
  }
`

export default function PoolSearchBar() {
  const currentString = useAtomValue(poolFilterStringAtom)
  const [localFilterString, setLocalFilterString] = useState(currentString)
  const setFilterString = useUpdateAtom(poolFilterStringAtom)
  const debouncedLocalFilterString = useDebounce(localFilterString, 500)

  useEffect(() => {
    setLocalFilterString(currentString)
  }, [currentString])

  useEffect(() => {
    setFilterString(debouncedLocalFilterString)
  }, [debouncedLocalFilterString, setFilterString])

  return (
    <SearchBarContainer>
      <Trans
        render={({ translation }) => (
          <TraceEvent
            events={[BrowserEvent.onFocus]}
            name={InterfaceEventName.EXPLORE_SEARCH_SELECTED}
            element={InterfaceElementName.EXPLORE_SEARCH_INPUT}
          >
            <SearchInput
              data-cy="explore-tokens-search-input"
              type="search"
              placeholder={`${translation}`}
              id="searchBar"
              autoComplete="off"
              value={localFilterString}
              onChange={({ target: { value } }) => setLocalFilterString(value)}
            />
          </TraceEvent>
        )}
      >
        Search Pools
      </Trans>
    </SearchBarContainer>
  )
}
