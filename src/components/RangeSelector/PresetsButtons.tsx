import { Trans } from '@lingui/macro'
import { ButtonOutlined } from 'components/Button'
import { AutoRow } from 'components/Row'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const Button = styled(ButtonOutlined).attrs(() => ({
  padding: '8px',
  minHeight: '60px',
  $borderRadius: '8px',
}))`
  color: ${({ theme }) => theme.textPrimary};
  flex: 1;
  border-color: ${({ theme }) => theme.backgroundInteractive};
`

interface PresetsButtonsProps {
  btnName: string,
  onSetRecommendedRange: () => void
  isRecommended?: boolean
}

export function PresetsButtons({ btnName, onSetRecommendedRange, isRecommended }: PresetsButtonsProps) {
  return (
    <AutoRow style={{ zIndex: '1' }} gap="4px" width="fit-content">
      <Button onClick={onSetRecommendedRange}>
        <div style={{ flexDirection: 'column' }}>
          <ThemedText.DeprecatedBody fontSize={12}>
            <Trans>{btnName}</Trans>
          </ThemedText.DeprecatedBody>
          {isRecommended ?
            <>
              <ThemedText.DeprecatedBody fontSize={12}>
                <Trans>(Recommended)</Trans>
              </ThemedText.DeprecatedBody>
            </>
            : null
          }
        </div>
      </Button>
    </AutoRow>
  )
}

export function PresetsButtonsFull({ onSetRecommendedRange }: PresetsButtonsProps) {
  return (
    <AutoRow style={{ zIndex: '1' }} gap="4px" width="auto">
      <Button onClick={onSetRecommendedRange}>
        <ThemedText.DeprecatedBody fontSize={12}>
          <Trans>Full Range</Trans>
        </ThemedText.DeprecatedBody>
      </Button>
    </AutoRow>
  )
}
