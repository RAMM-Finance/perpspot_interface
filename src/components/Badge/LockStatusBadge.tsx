import { Trans } from '@lingui/macro'
import { AlertTriangle } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'

const ActiveDot = styled.span`
  background-color: ${({ theme }) => theme.accentSuccess};
  border-radius: 50%;
  height: 8px;
  width: 8px;
`

const BadgeWrapper = styled.div`
  font-size: 14px;
  display: flex;
  justify-content: flex-end;
`

const BadgeText = styled.div`
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  margin-right: 8px;
  white-space: nowrap;
`

const LabelText = styled.div<{ color: string }>`
  align-items: center;
  color: ${({ color }) => color};
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`

export default function LockStatusBadge({ isLocked }: { isLocked: boolean | undefined }) {
  const theme = useTheme()
  return (
    <BadgeWrapper>
      {isLocked ? (
        // <MouseoverTooltip
        //   text={
        //     <Trans>
        //       The price of this pool is within your selected range. Your position will earn trading fees and premiums.
        //     </Trans>
        //   }
        // >
        <LabelText color={theme.accentWarning}>
          <BadgeText>
            <Trans>Locked</Trans>
          </BadgeText>
          <AlertTriangle width={12} height={12} />
        </LabelText>
      ) : (
        // </MouseoverTooltip>
        // <MouseoverTooltip
        //   text={
        //     <Trans>The price of this pool is outside of your selected range. Your position will earn premiums.</Trans>
        //   }
        // >
        <LabelText color={theme.accentSuccess}>
          <BadgeText>
            <Trans>Unlocked</Trans>
          </BadgeText>
          <ActiveDot />
        </LabelText>
        // </MouseoverTooltip>
      )}
    </BadgeWrapper>
  )
}
