import { SupportedChainId } from 'constants/chains'
import { useEffect } from 'react'
import { useDarkModeManager } from 'theme/components/ThemeToggle'
import { useChainId } from 'wagmi'

import { darkTheme, lightTheme } from '../colors'

const initialStyles = {
  width: '200vw',
  height: '200vh',
  transform: 'translate(-50vw, -100vh)',
}
const backgroundResetStyles = {
  width: '100vw',
  height: '100vh',
  transform: 'unset',
}

type TargetBackgroundStyles = typeof initialStyles | typeof backgroundResetStyles

const backgroundRadialGradientElement = document.getElementById('background-radial-gradient')
const setBackground = (newValues: TargetBackgroundStyles) =>
  Object.entries(newValues).forEach(([key, value]) => {
    if (backgroundRadialGradientElement) {
      backgroundRadialGradientElement.style[key as keyof typeof backgroundResetStyles] = value
    }
  })

export default function RadialGradientByChainUpdater(): null {
  const chainId = useChainId()
  const [darkMode] = useDarkModeManager()

  // manage background color
  useEffect(() => {
    if (!backgroundRadialGradientElement) {
      return
    }

    switch (chainId) {
      case SupportedChainId.ARBITRUM_ONE: {
        setBackground(backgroundResetStyles)
        const arbitrumLightGradient = 'linear-gradient(180deg, #202738 0%, #070816 100%)'

        // 'radial-gradient(100% 100% at 50% 0%, rgba(205, 232, 251, 0.7) 0%, rgba(252, 243, 249, 0.6536) 49.48%, rgba(255, 255, 255, 0) 100%), #FFFFFF'
        const arbitrumDarkGradient =
          // 'radial-gradient(100% 100% at 50% 0%, rgba(10, 41, 75, 0.7) 0%, rgba(34, 30, 48, 0.6536) 49.48%, rgba(31, 33, 40, 0) 100%), #0D0E0E'
          'linear-gradient(180deg, #202738 0%, #070816 100%)'

        backgroundRadialGradientElement.style.background = darkMode ? arbitrumDarkGradient : arbitrumLightGradient
        break
      }

      default: {
        setBackground(initialStyles)
        const defaultLightGradient =
          'radial-gradient(100% 100% at 50% 0%, rgba(255, 184, 226, 0.51) 0%, rgba(255, 255, 255, 0) 100%), #FFFFFF'
        const defaultDarkGradient = '' //'linear-gradient(180deg, #202738 0%, #070816 100%)'
        backgroundRadialGradientElement.style.backgroundColor = darkMode
          ? darkTheme.backgroundBackdrop
          : lightTheme.backgroundSurface //defaultDarkGradient : defaultLightGradient
      }
    }
  }, [darkMode, chainId])
  return null
}
