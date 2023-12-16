import CurrencyInputPanel from 'components/BaseSwapPanel'
import { AutoColumn } from 'components/Column'
import Input from 'components/NumericalInput'
import { BodyWrapper } from 'pages/AppBody'
import styled from 'styled-components/macro'

import { ButtonError, ButtonPrimary } from '../../components/Button'

export const PageWrapper = styled(BodyWrapper)<{ wide: boolean }>`
  max-width: ${({ wide }) => (wide ? '1200px' : '800px')};
  background-color: ${({ theme }) => theme.backgroundSurface};
  width: 100%;

  padding: ${({ wide }) => (wide ? '10px' : '0')};

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    max-width: 480px;
  `};
`
export const Wrapper = styled.div`
  position: relative;
  padding: 26px 16px;
  width: 90%;
`

export const PositionPreviewWrapper = styled.div`
  padding: 2 rem;
`

export const ScrollablePage = styled.div`
  position: relative;
  padding-top: 15px;
  display: flex;
  flex-direction: column;
  width: 90%;
  height: auto;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    max-width: 480px;
    margin: 0 auto;
  `};

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding: 48px 8px 0px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: 20px;
  }
`

export const DynamicSection = styled(AutoColumn)<{ disabled?: boolean }>`
  opacity: ${({ disabled }) => (disabled ? '0.2' : '1')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'initial')};
`

export const CurrencyDropdown = styled(CurrencyInputPanel)`
  font-size: 14px;
  transform: scale(1.2, 1.2);
`

export const StyledInput = styled(Input)`
  background-color: ${({ theme }) => theme.backgroundSurface};
  text-align: left;
  font-size: 18px;
  width: 100%;
`

export const StyledButtonPrimary = styled(ButtonPrimary)`
  font-size: 12px;
  width: 200px;
  height: 40px;
  border-radius: 10px;
`
export const StyledButtonError = styled(ButtonError)`
  font-size: 12px;
  width: 200px;
  height: 40px;
  border-radius: 10px;
`

/* two-column layout where DepositAmount is moved at the very end on mobile. */
export const ResponsiveTwoColumns = styled.div<{ wide: boolean }>`
  display: grid;
  grid-column-gap: 50px;
  grid-row-gap: 15px;
  grid-template-columns: ${({ wide }) => (wide ? '1fr 1fr' : '1fr')};
  grid-template-rows: max-content;
  grid-auto-flow: row;

  padding-top: 20px;

  border-top: 1px solid ${({ theme }) => theme.backgroundInteractive};

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    grid-template-columns: 1fr;

    margin-top: 0;
  `};
`

export const RightContainer = styled(AutoColumn)`
  grid-row: 1 / 3;
  grid-column: 2;
  height: fit-content;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
  grid-row: 2 / 3;
  grid-column: 1;
  `};
`
export const SectionWrapper = styled.div`
  display: flex;

  justify-content: space-around;
`

export const LeftSection = styled(AutoColumn)`
  width: 45%;
`

export const RightSection = styled(AutoColumn)`
  width: 40%;
`

export const StackedContainer = styled.div`
  display: grid;
`

export const StackedItem = styled.div<{ zIndex?: number }>`
  grid-column: 1;
  grid-row: 1;
  height: 100%;
  z-index: ${({ zIndex }) => zIndex};
`

export const MediumOnly = styled.div`
  display: flex;
  justify-content: center;
`

export const HideMedium = styled.div`
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    display: block;
  `};
`
