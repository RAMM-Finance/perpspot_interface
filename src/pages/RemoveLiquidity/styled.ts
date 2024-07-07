import { MaxButton } from 'pages/LP/styleds'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  position: relative;
  padding: 20px;
  min-width: 460px;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
    min-width: 340px;
  `};
`

export const SmallMaxButton = styled(MaxButton)`
  display: flex;
  align-items: center;
  font-size: 12px;
`

export const ReduceButton = styled(MaxButton)`
  font-size: 12px;
  padding: 4px;
  min-width: 50px;
`

export const ResponsiveHeaderText = styled(Text)`
  font-size: 16px;
  font-weight: 500;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
     font-size: 24px
  `};
`
