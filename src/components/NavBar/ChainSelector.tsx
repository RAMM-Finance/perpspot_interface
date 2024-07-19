import { t } from '@lingui/macro'
import { MouseoverTooltip } from 'components/Tooltip'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useSelectChain from 'hooks/useSelectChain'
import useSyncChainQuery from 'hooks/useSyncChainQuery'
import { Box } from 'nft/components/Box'
import { Portal } from 'nft/components/common/Portal'
import { Column, Row } from 'nft/components/Flex'
import { useIsMobile } from 'nft/hooks'
import { useCallback, useRef, useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp } from 'react-feather'
import { useTheme } from 'styled-components/macro'
import { useChainId } from 'wagmi'

import * as styles from './ChainSelector.css'
import ChainSelectorRow from './ChainSelectorRow'
import { NavDropdown } from './NavDropdown'
import { useNavigate } from 'react-router-dom'

const NETWORK_SELECTOR_CHAINS = [
  // SupportedChainId.ARBITRUM_ONE,
  // SupportedChainId.BERA_ARTIO,
  // SupportedChainId.LINEA,
  SupportedChainId.BASE,
]

interface ChainSelectorProps {
  leftAlign?: boolean
}

const supportedChains = [8453, 42161]

export function unsupportedChain(chainId: SupportedChainId) {
  // const info = getChainInfo(chainId)
  // return !info
  return !supportedChains.includes(chainId)
}

export const ChainSelector = ({ leftAlign }: ChainSelectorProps) => {
  const navigate = useNavigate()
  const chainId = useChainId()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const isMobile = useIsMobile()

  const theme = useTheme()
  const ref = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setIsOpen(false), [modalRef])
  // const { chainId: accountChainId } = useAccount()
  const info = getChainInfo(chainId)

  const selectChain = useSelectChain()
  useSyncChainQuery()

  const [pendingChainId, setPendingChainId] = useState<SupportedChainId | undefined>(undefined)

  const onSelectChain = useCallback(
    async (targetChainId: SupportedChainId) => {
      setPendingChainId(targetChainId)
      await selectChain(targetChainId)
      setPendingChainId(undefined)
      setIsOpen(false)
      const currentUrl = window.location.href
      if (currentUrl.includes('add/v2/')) {
        navigate('/add/v2');
      }
    },
    [selectChain, setIsOpen]
  )

  if (!chainId) {
    return null
  }

  const isSupported = !!info

  const dropdown = (
    <NavDropdown top="56" left={leftAlign ? '0' : 'auto'} right={leftAlign ? 'auto' : '0'} ref={modalRef}>
      <Column paddingX="8">
        {NETWORK_SELECTOR_CHAINS.map((chainId: SupportedChainId) => (
          <ChainSelectorRow
            disabled={false}
            onSelectChain={onSelectChain}
            targetChain={chainId}
            key={chainId}
            isPending={chainId === pendingChainId}
          />
        ))}
      </Column>
    </NavDropdown>
  )

  const chevronProps = {
    height: 14,
    width: 14,
    color: theme.textSecondary,
  }

  return (
    <Box position="relative" ref={ref}>
      <MouseoverTooltip text={t`Your wallet's current network is unsupported.`} disableHover={isSupported}>
        <Row
          as="button"
          gap="8"
          className={styles.ChainSelector}
          background={isOpen ? 'accentActiveSoft' : 'none'}
          onClick={() => setIsOpen(!isOpen)}
        >
          {!isSupported ? (
            <AlertTriangle size={18} color={theme.textSecondary} />
          ) : (
            <img src={info.logoUrl} alt={info.label} className={styles.Image} data-testid="chain-selector-logo" />
          )}
          {isOpen ? <ChevronUp {...chevronProps} /> : <ChevronDown {...chevronProps} />}
        </Row>
      </MouseoverTooltip>
      {isOpen && (isMobile ? <Portal>{dropdown}</Portal> : <>{dropdown}</>)}
    </Box>
  )
}
