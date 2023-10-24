import { style } from '@vanilla-extract/css'
import { lightGrayOverlayOnHover } from 'nft/css/common.css'

import { sprinkles } from '../../nft/css/sprinkles.css'

export const ChainSelector = style([
  lightGrayOverlayOnHover,
  sprinkles({
    borderRadius: '8',
    height: '28',
    cursor: 'pointer',
    border: 'none',
    color: 'textPrimary',
    background: 'none',
    width: 'full',
  }),
])

export const Image = style([
  sprinkles({
    width: '20',
    height: '20',
  }),
])
