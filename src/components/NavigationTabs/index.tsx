import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import { ReactNode } from 'react'
import { ArrowLeft } from 'react-feather'
import { Link as HistoryLink, useLocation } from 'react-router-dom'
import { Box } from 'rebass'
import { useAppDispatch } from 'state/hooks'
import { resetMintState } from 'state/mint/actions'
import { resetMintState as resetMintV3State } from 'state/mint/v3/actions'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { flexRowNoWrap } from 'theme/styles'

import Row, { RowBetween } from '../Row'
import SettingsTab from '../Settings'

const Tabs = styled.div`
  ${flexRowNoWrap};
  border-radius: 3rem;
`

const StyledHistoryLink = styled(HistoryLink)<{ flex: string | undefined }>`
  padding-right: 30px;
  display: flex;
  align-items: center;
`

const RowBetweenExt = styled(RowBetween)`
  padding: 1rem 1rem 0 1rem;
`

const LeftContainer = styled.div`
  display: flex;
  justify-content: end;
`

const RightContainer = styled.div`
  display: flex;
  justify-content: start;
`

const ActiveText = styled.div`
  font-weight: 500;
  font-size: 20px;
`

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.textPrimary};
`

export function FindPoolTabs({ origin }: { origin: string }) {
  return (
    <Tabs>
      <RowBetween style={{ padding: '1rem 1rem 0 1rem', position: 'relative' }}>
        <HistoryLink to={origin}>
          <StyledArrowLeft />
        </HistoryLink>
        <ActiveText style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <Trans>Import V2 Pool</Trans>
        </ActiveText>
      </RowBetween>
    </Tabs>
  )
}

export function AddRemoveTabs({
  adding,
  creating,
  defaultSlippage,
  positionID,
  children,
}: {
  adding: boolean
  creating: boolean
  defaultSlippage: Percent
  positionID?: string | undefined
  showBackLink?: boolean
  children?: ReactNode | undefined
}) {
  const theme = useTheme()
  // reset states on back
  const dispatch = useAppDispatch()
  const location = useLocation()

  // detect if back should redirect to v3 or v2 pool page
  const poolLink = location.pathname.includes('add/v2')
    ? '/pools/v2'
    : '/pools' + (positionID ? `/${positionID.toString()}` : '')

  return (
    <Tabs>
      <RowBetweenExt>
        <LeftContainer>
          <StyledHistoryLink
            to={poolLink}
            onClick={() => {
              if (adding) {
                // not 100% sure both of these are needed
                dispatch(resetMintState())
                dispatch(resetMintV3State())
              }
            }}
            flex={children ? '1' : undefined}
          >
            <StyledArrowLeft stroke={theme.textSecondary} size="12" />
          </StyledHistoryLink>
          <ThemedText.BodySecondary fontSize={16}>
            {creating ? (
              <Trans>Create a pair</Trans>
            ) : adding ? (
              <Trans>Add Liquidity</Trans>
            ) : (
              <Trans>Remove Liquidity</Trans>
            )}
          </ThemedText.BodySecondary>
        </LeftContainer>
        <RightContainer>
          <Box>{children}</Box>
          <SettingsTab allowedSlippage={defaultSlippage} />
        </RightContainer>
      </RowBetweenExt>
    </Tabs>
  )
}

export function CreateProposalTabs() {
  return (
    <Tabs>
      <Row style={{ padding: '1rem 1rem 0 1rem' }}>
        <HistoryLink to="/vote">
          <StyledArrowLeft />
        </HistoryLink>
        <ActiveText style={{ marginLeft: 'auto', marginRight: 'auto' }}>Create Proposal</ActiveText>
      </Row>
    </Tabs>
  )
}
