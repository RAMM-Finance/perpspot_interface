/**
 * Preset styles of the Rebass Text component
 */

import { Text, TextProps as TextPropsOriginal } from 'rebass'
import styled from 'styled-components/macro'

const TextWrapper = styled(Text).withConfig({
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: keyof string }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`

type TextProps = Omit<TextPropsOriginal, 'css'>

// todo: export each component individually

export const BodyPrimary = styled(Text)`
  font-weight: 400;
  font-size: 16px;
  color: ${({ theme }) => theme.textPrimary};
`

export const BodySecondary = styled(Text)`
  font-weight: 400;
  font-size: 16px;
  color: ${({ theme }) => theme.textSecondary};
`

export const Gold = styled(Text)`
  font-weight: 800;
  font-size: 16px;
  color: gold;
`

export const BodySmall = styled(Text)`
  font-weight: 400;
  font-size: 14px;
  color: ${({ theme }) => theme.textPrimary};
`

export const TableText = styled(Text)`
  font-weight: 400;
  font-size: 12px;
  color: ${({ theme }) => theme.textPrimary};
`

export const Caption = styled(Text)`
  font-weight: 400;
  font-size: 12px;
  color: ${({ theme }) => theme.textPrimary};
`

export const HeadlineSmall = styled(Text)`
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  color: ${({ theme }) => theme.textPrimary};
`

export const PriceSmall = styled(Text)`
  font-weight: 600;
  font-size: 16px;
  line-height: 28px;
  color: ${({ theme }) => theme.textPrimary};
`

export const HeadlineMedium = styled(Text)`
  font-weight: 500;
  font-size: 28px;
  color: ${({ theme }) => theme.textPrimary};
`

export const HeadlineLarge = styled(Text)`
  font-weight: 600;
  font-size: 36px;
  line-height: 44px;
  color: ${({ theme }) => theme.textPrimary};
`

export const LargeHeader = styled(Text)`
  font-weight: 400;
  font-size: 36px;
  color: ${({ theme }) => theme.textPrimary};
`

export const Hero = styled(Text)`
  font-weight: 500;
  font-size: 48px;
  color: ${({ theme }) => theme.textPrimary};
`

export const LabelSmall = styled(Text)`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.textSecondary};
`

export const Link = styled(Text)`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.accentAction};
`

export const MediumHeader = styled(Text)`
  font-weight: 400;
  font-size: 20px;
  color: ${({ theme }) => theme.textPrimary};
`

export const SubHeader = styled(Text)`
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.textPrimary};
`

export const SubHeaderSmall = styled(Text)`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.textSecondary};
`

export const UtilityBadge = styled(Text)`
  font-weight: 600;
  font-size: 8px;
  line-height: 12px;
`

export const DeprecatedMain = styled(Text)`
  font-weight: 500;
  color: ${({ theme }) => theme.textSecondary};
`

export const DeprecatedLink = styled(Text)`
  font-weight: 500;
  color: ${({ theme }) => theme.accentAction};
`

export const DeprecatedLabel = styled(Text)`
  font-weight: 600;
  color: ${({ theme }) => theme.textPrimary};
`

export const DeprecatedBlack = styled(Text)`
  font-weight: 500;
  color: ${({ theme }) => theme.textPrimary};
`

export const DeprecatedWhite = styled(Text)`
  font-weight: 500;
  color: ${({ theme }) => theme.white};
`

export const LmtWhite = styled(Text)`
  font-weight: 1000;
  font-size: 20px;
  color: ${({ theme }) => theme.white};
`

export const DeprecatedBody = styled(Text)`
  font-weight: 400;
  font-size: 16px;
  color: ${({ theme }) => theme.textPrimary};
`

export const DeprecatedLargeHeader = styled(Text)`
  font-weight: 600;
  font-size: 24px;
`

export const DeprecatedMediumHeader = styled(Text)`
  font-weight: 500;
  font-size: 20px;
`

export const DeprecatedSubHeader = styled(Text)`
  font-weight: 400;
  font-size: 14px;
`

export const DeprecatedSmall = styled(Text)`
  font-weight: 500;
  font-size: 11px;
`

export const DeprecatedBlue = styled(Text)`
  font-weight: 500;
  color: ${({ theme }) => theme.accentAction};
`

export const DeprecatedYellow = styled(Text)`
  font-weight: 500;
  color: ${({ theme }) => theme.deprecated_yellow3};
`

export const DeprecatedDarkGray = styled(Text)`
  font-weight: 500;
  color: ${({ theme }) => theme.textTertiary};
`

export const DeprecatedGray = styled(Text)`
  font-weight: 500;
  color: ${({ theme }) => theme.deprecated_bg3};
`

export const DeprecatedItalic = styled(Text)`
  font-weight: 500;
  font-size: 12px;
  font-style: italic;
  color: ${({ theme }) => theme.textSecondary};
`

export const DeprecatedError = styled(Text)<{ error: boolean }>`
  font-weight: 500;
  color: ${({ error, theme }) => (error ? theme.accentFailure : theme.textSecondary)};
`

export const ThemedText = {
  // todo: there should be just one `Body` with default color, no need to make all variations
  BodyPrimary(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color="textPrimary" {...props} />
  },
  BodySecondary(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color="textSecondary" {...props} />
  },
  Gold(props: TextProps) {
    return <TextWrapper fontWeight={800} fontSize={16} color="gold" {...props} />
  },
  BodySmall(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} color="textPrimary" {...props} />
  },
  TableText(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={12} color="textPrimary" {...props} />
  },
  Caption(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={12} color="textPrimary" {...props} />
  },
  HeadlineSmall(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={20} lineHeight="28px" color="textPrimary" {...props} />
  },
  PriceSmall(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={16} lineHeight="28px" color="textPrimary" {...props} />
  },
  HeadlineMedium(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={28} color="textPrimary" {...props} />
  },
  HeadlineLarge(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={36} lineHeight="44px" color="textPrimary" {...props} />
  },
  LargeHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={36} color="textPrimary" {...props} />
  },
  Hero(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={48} color="textPrimary" {...props} />
  },
  LabelSmall(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={14} color="textSecondary" {...props} />
  },
  Link(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={14} color="accentAction" {...props} />
  },
  MediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={20} color="textPrimary" {...props} />
  },
  SubHeader(props: TextProps) {
    // @todo designs use `fontWeight: 500` and we currently have a mix of 600 and 500
    return <TextWrapper fontWeight={600} fontSize={16} color="textPrimary" {...props} />
  },
  SubHeaderSmall(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={14} color="textSecondary" {...props} />
  },
  UtilityBadge(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize="8px" lineHeight="12px" {...props} />
  },
  DeprecatedMain(props: TextProps) {
    return <TextWrapper fontWeight={500} color="textSecondary" {...props} />
  },
  DeprecatedLink(props: TextProps) {
    return <TextWrapper fontWeight={500} color="accentAction" {...props} />
  },
  DeprecatedLabel(props: TextProps) {
    return <TextWrapper fontWeight={600} color="textPrimary" {...props} />
  },
  DeprecatedBlack(props: TextProps) {
    return <TextWrapper fontWeight={500} color="textPrimary" {...props} />
  },
  DeprecatedWhite(props: TextProps) {
    return <TextWrapper fontWeight={500} color="white" {...props} />
  },
  LmtWhite(props: TextProps) {
    return <TextWrapper fontWeight={1000} fontSize="20px" color="white" {...props} />
  },
  DeprecatedBody(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color="textPrimary" {...props} />
  },
  DeprecatedLargeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} {...props} />
  },
  DeprecatedMediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={20} {...props} />
  },
  DeprecatedSubHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />
  },
  DeprecatedSmall(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={11} {...props} />
  },
  DeprecatedBlue(props: TextProps) {
    return <TextWrapper fontWeight={500} color="accentAction" {...props} />
  },
  DeprecatedYellow(props: TextProps) {
    return <TextWrapper fontWeight={500} color="deprecated_yellow3" {...props} />
  },
  DeprecatedDarkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color="textTertiary" {...props} />
  },
  DeprecatedGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color="deprecated_bg3" {...props} />
  },
  DeprecatedItalic(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={12} fontStyle="italic" color="textSecondary" {...props} />
  },
  DeprecatedError({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} color={error ? 'accentFailure' : 'textSecondary'} {...props} />
  },
}
