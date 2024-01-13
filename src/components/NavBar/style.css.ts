import { style } from '@vanilla-extract/css'

import { subhead } from '../../nft/css/common.css'
import { sprinkles } from '../../nft/css/sprinkles.css'

export const logoContainer = style([
  sprinkles({
    display: 'flex',
    marginRight: '12',
    alignItems: 'center',
    cursor: 'pointer',
  }),
])

export const logo = style([
  sprinkles({
    display: 'block',
    color: 'textPrimary',
  }),
])

export const baseSideContainer = style([
  sprinkles({
    display: 'flex',
    width: 'full',
    flex: '1',
    flexShrink: '2',
  }),
])

export const leftSideContainer = style([
  baseSideContainer,
  sprinkles({
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: '0',
  }),
])

export const searchContainer = style([
  sprinkles({
    flex: '1',
    flexShrink: '1',
    justifyContent: { lg: 'flex-end', xl: 'center' },
    display: { sm: 'none', navSearchInputVisible: 'flex' },
    alignSelf: 'center',
    height: '48',
    alignItems: 'flex-start',
  }),
])

export const blueButton = style([
  sprinkles({
    color: 'textSecondary',
  }),
  {
    fontSize: '12px',
    backgroundColor: 'accentActive',
    ':hover': {
      color: 'white',
      background: 'accentActiveSoft',
      fontWeight: 'bold',
      opacity: '80%',
    },
  },
])

export const rightSideContainer = style([
  baseSideContainer,
  sprinkles({
    alignItems: 'center',
    justifyContent: 'flex-end',
  }),
])

const baseMenuItem = style([
  subhead,
  sprinkles({
    paddingY: '4',
    paddingX: '14',
    // marginY: '4',
    borderRadius: '12',
    transition: '250',
    height: 'max',
    width: 'full',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    gap: '4',
  }),
  {
    lineHeight: '24px',
    textDecoration: 'none',
  },
])

export const menuItem = style([
  baseMenuItem,
  sprinkles({
    color: 'textSecondary',
  }),
  {
    fontSize: '1em',
    ':hover': {
      color: 'white',
      background: 'accentActiveSoft',
      fontWeight: 'bold',
      transform: 'scale(1.1,1.1)',
    },
  },
])

export const activeMenuItem = style([
  baseMenuItem,
  sprinkles({
    background: 'transparent',
    fontWeight: 'bold',
    color: 'textPrimary',
  }),
  {
    fontSize: '1em',
  },
])
