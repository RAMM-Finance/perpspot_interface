import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, SharedEventName } from '@uniswap/analytics-events'
import { formatNumber, NumberType } from '@uniswap/conedison/format'
import { ThemeButton } from 'components/Button'
import Column from 'components/Column'
import Row from 'components/Row'
import { LoadingBubble } from 'components/Tokens/loading'
import { formatDelta } from 'components/Tokens/TokenDetails/PriceChart'
import { usePortfolioBalancesQuery } from 'graphql/data/__generated__/types-and-hooks'
import useENSName from 'hooks/useENSName'
import { useCallback } from 'react'
import { ArrowDownRight, ArrowUpRight, Copy, IconProps, Info, Power, Settings } from 'react-feather'
import { useAppDispatch } from 'state/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { CopyHelper, ExternalLink, ThemedText } from 'theme'
import { useDisconnect } from 'wagmi'

import { shortenAddress } from '../../nft/utils/address'
import StatusIcon from '../Identicon/StatusIcon'
import { useToggleWalletDrawer } from '.'
import IconButton, { IconHoverText } from './IconButton'
import MiniPortfolio from './MiniPortfolio'
import { portfolioFadeInAnimation } from './MiniPortfolio/PortfolioRow'

const AuthenticatedHeaderWrapper = styled.div`
  padding: 14px 12px 16px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
`

const HeaderButton = styled(ThemeButton)`
  border-color: transparent;
  border-radius: 12px;
  border-style: solid;
  border-width: 1px;
  height: 40px;
  margin-top: 8px;
`

const WalletButton = styled(ThemeButton)`
  border-radius: 12px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-top: 4px;
  color: white;
  border: none;
`

const UNIButton = styled(WalletButton)`
  border-radius: 12px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-top: 4px;
  color: white;
  border: none;
  background: linear-gradient(to right, #9139b0 0%, #4261d6 100%);
`

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  & > a,
  & > button {
    margin-right: 8px;
  }

  & > button:last-child {
    margin-right: 0px;
    ${IconHoverText}:last-child {
      left: 0px;
    }
  }
`
const FiatOnrampNotAvailableText = styled(ThemedText.Caption)`
  align-items: center;
  color: ${({ theme }) => theme.textSecondary};
  display: flex;
  justify-content: center;
`
const FiatOnrampAvailabilityExternalLink = styled(ExternalLink)`
  align-items: center;
  display: flex;
  height: 14px;
  justify-content: center;
  margin-left: 6px;
  width: 14px;
`

const StatusWrapper = styled.div`
  display: inline-block;
  width: 70%;
  padding-right: 4px;
  display: inline-flex;
`

const AccountNamesWrapper = styled.div`
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
`

const StyledInfoIcon = styled(Info)`
  height: 12px;
  width: 12px;
  flex: 1 1 auto;
`

const HeaderWrapper = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`

const CopyText = styled(CopyHelper).attrs({
  InitialIcon: Copy,
  CopiedIcon: Copy,
  gap: 4,
  iconSize: 14,
  iconPosition: 'right',
})``

const FadeInColumn = styled(Column)`
  ${portfolioFadeInAnimation}
`
const FadeInRow = styled(Row)`
  ${portfolioFadeInAnimation}
  gap: 25px;
`

const PortfolioDrawerContainer = styled(Column)`
  flex: 1;
`

export function PortfolioArrow({ change, ...rest }: { change: number } & IconProps) {
  const theme = useTheme()
  return change < 0 ? (
    <ArrowDownRight color={theme.accentCritical} size={20} {...rest} />
  ) : (
    <ArrowUpRight color={theme.accentSuccess} size={20} {...rest} />
  )
}

export default function AuthenticatedHeader({ account, openSettings }: { account: string; openSettings: () => void }) {
  const { ENSName } = useENSName(account)
  const dispatch = useAppDispatch()

  const toggleWalletDrawer = useToggleWalletDrawer()
  // const getConnection = useGetConnection()
  // const connection = getConnection(connector)
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const disconnect = useCallback(() => {
    wagmiDisconnect()
    toggleWalletDrawer()
  }, [dispatch, toggleWalletDrawer])

  const { data: portfolioBalances } = usePortfolioBalancesQuery({
    variables: { ownerAddress: account ?? '' },
    fetchPolicy: 'cache-only', // PrefetchBalancesWrapper handles balance fetching/staleness; this component only reads from cache
  })
  const portfolio = portfolioBalances?.portfolios?.[0]
  const totalBalance = portfolio?.tokensTotalDenominatedValue?.value
  const absoluteChange = portfolio?.tokensTotalDenominatedValueChange?.absolute?.value
  const percentChange = portfolio?.tokensTotalDenominatedValueChange?.percentage?.value

  return (
    <AuthenticatedHeaderWrapper>
      <HeaderWrapper>
        <StatusWrapper>
          <StatusIcon size={30} />
          {account && (
            <AccountNamesWrapper>
              <ThemedText.SubHeader color="textPrimary" fontWeight={500}>
                <CopyText toCopy={ENSName ?? account}>{ENSName ?? shortenAddress(account, 4, 4)}</CopyText>
              </ThemedText.SubHeader>
              {/* Displays smaller view of account if ENS name was rendered above */}
              {ENSName && (
                <ThemedText.BodySmall color="textTertiary">
                  <CopyText toCopy={account}>{shortenAddress(account, 4, 4)}</CopyText>
                </ThemedText.BodySmall>
              )}
            </AccountNamesWrapper>
          )}
        </StatusWrapper>
        <IconContainer>
          <IconButton data-testid="wallet-settings" onClick={openSettings} Icon={Settings} />
          <TraceEvent
            events={[BrowserEvent.onClick]}
            name={SharedEventName.ELEMENT_CLICKED}
            element={InterfaceElementName.DISCONNECT_WALLET_BUTTON}
          >
            <IconButton data-testid="wallet-disconnect" onClick={disconnect} Icon={Power} />
          </TraceEvent>
        </IconContainer>
      </HeaderWrapper>
      <PortfolioDrawerContainer>
        {totalBalance !== undefined ? (
          <FadeInRow align="center">
            <ThemedText.HeadlineLarge fontSize={22} fontWeight={500}>
              {formatNumber(totalBalance, NumberType.PortfolioBalance)}
            </ThemedText.HeadlineLarge>
            <Row marginTop="5px" align="center">
              {absoluteChange !== 0 && percentChange && (
                <>
                  <PortfolioArrow size="16" change={absoluteChange as number} />
                  <ThemedText.BodySecondary fontSize={12}>
                    {`${formatNumber(Math.abs(absoluteChange as number), NumberType.PortfolioBalance)} (${formatDelta(
                      percentChange
                    )})`}
                  </ThemedText.BodySecondary>
                </>
              )}
            </Row>
          </FadeInRow>
        ) : (
          <Row gap="md">
            <LoadingBubble height="44px" width="170px" />
            <LoadingBubble height="16px" width="100px" margin="4px 0 20px 0" />
          </Row>
        )}
        <MiniPortfolio account={account} />
      </PortfolioDrawerContainer>
    </AuthenticatedHeaderWrapper>
  )
}
