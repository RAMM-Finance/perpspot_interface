import { Trans } from '@lingui/macro'
import { LOCALE_LABEL, SupportedLocale } from 'constants/locales'
import { useActiveLocale } from 'hooks/useActiveLocale'
import { useLocationLinkProps } from 'hooks/useLocationLinkProps'
import { useState } from 'react'
import { Check } from 'react-feather'
import { Link, useLocation } from 'react-router-dom'
import { useFontFamily } from 'state/fontSetting/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { ClickableStyle, ThemedText } from 'theme'

import { GitVersionRow } from './GitVersionRow'
import { SlideOutMenu } from './SlideOutMenu'
import { SmallBalanceToggle } from './SmallBalanceToggle'

const InternalLinkMenuItem = styled(Link)`
  ${ClickableStyle}
  flex: 1;
  color: ${({ theme }) => theme.textTertiary};
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 0;
  justify-content: space-between;
  text-decoration: none;
  color: ${({ theme }) => theme.textPrimary};
`

const MenuItem = styled.div`
  flex: 1;
  color: ${({ theme }) => theme.textTertiary};
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 0;
  justify-content: space-between;
  text-decoration: none;
  color: ${({ theme }) => theme.textPrimary};
  cursor: pointer;

  :hover,
  :focus {
    opacity: 0.7;
  }
`

function LanguageMenuItem({ locale, isActive }: { locale: SupportedLocale; isActive: boolean }) {
  const { to, onClick } = useLocationLinkProps(locale)
  const theme = useTheme()

  if (!to) return null

  return (
    <InternalLinkMenuItem onClick={onClick} to={to}>
      <ThemedText.BodySmall data-testid="wallet-language-item">{LOCALE_LABEL[locale]}</ThemedText.BodySmall>
      {isActive && <Check color={theme.accentActive} opacity={1} size={20} />}
    </InternalLinkMenuItem>
  )
}

enum FontKey {
  PRIMARY = 'primary',
  HELVETICA = 'helvetica',
  SERIF = 'serif',
  MONOSPACE = 'monospace',
  HANDWRITING = 'handwriting',
}

interface FontMenuItemProps {
  fontKey: FontKey
  isActive: boolean
  currentFont: string
  setCurrentFont: (fontKey: string) => void
}

function FontMenuItem({ fontKey, currentFont, setCurrentFont }: FontMenuItemProps) {
  const { setFont } = useFontFamily()
  const handleClick = (fontKey: FontKey) => {
    setCurrentFont(fontKey)
    setFont(fontKey)
  }

  return (
    <MenuItem onClick={() => handleClick(fontKey)}>
      {currentFont === fontKey ? (
        <ThemedText.BodyPrimary lineHeight={1.5} fontSize={16} fontWeight={700}>
          {fontKey}
        </ThemedText.BodyPrimary>
      ) : (
        <ThemedText.BodyPrimary lineHeight={1.5} fontSize={14}>
          {fontKey}
        </ThemedText.BodyPrimary>
      )}
    </MenuItem>
  )
}
const SectionTitle = styled(ThemedText.SubHeader)`
  color: ${({ theme }) => theme.textSecondary};
  padding-bottom: 24px;
`

const ThemeToggleContainer = styled.div`
  margin: 0 0 6px;
`

const BalanceToggleContainer = styled.div`
  padding: 16px 0;
  margin-bottom: 26px;
`
export default function SettingsMenu({ onClose }: { onClose: () => void }) {
  const [currentFont, setCurrentFont] = useState('primary')

  const activeLocale = useActiveLocale()
  const { pathname } = useLocation()
  const isWalletPage = pathname.includes('/wallet')

  const fontKeys = Object.values(FontKey)
  return (
    <SlideOutMenu title={<Trans>Settings</Trans>} onClose={onClose}>
      <SectionTitle>
        <Trans>Preferences</Trans>
      </SectionTitle>
      {/* <ThemeToggleContainer>
        <ThemeToggle disabled={true} />
      </ThemeToggleContainer> */}
      <BalanceToggleContainer>
        <SmallBalanceToggle />
      </BalanceToggleContainer>

      <SectionTitle data-testid="wallet-header">
        {/* <Trans>Language</Trans> */}
        <Trans>Fonts</Trans>
      </SectionTitle>
      {/* {SUPPORTED_LOCALES.map((locale) => (
        <LanguageMenuItem locale={locale} isActive={activeLocale === locale} key={locale} />
      ))} */}
      {fontKeys.map((fontKey: FontKey) => (
        <FontMenuItem
          key={fontKey}
          currentFont={currentFont}
          setCurrentFont={setCurrentFont}
          fontKey={fontKey}
          isActive={false}
        />
      ))}
      <GitVersionRow />
    </SlideOutMenu>
  )
}
