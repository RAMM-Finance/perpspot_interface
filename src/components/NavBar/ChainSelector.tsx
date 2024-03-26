import { t } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { MouseoverTooltip } from 'components/Tooltip'
import { ConnectionType } from 'connection'
import { useGetConnection } from 'connection'
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

import * as styles from './ChainSelector.css'
import ChainSelectorRow from './ChainSelectorRow'
import { NavDropdown } from './NavDropdown'

const NETWORK_SELECTOR_CHAINS = [
  // SupportedChainId.MAINNET,
  // SupportedChainId.POLYGON,
  // SupportedChainId.OPTIMISM,
  SupportedChainId.ARBITRUM_ONE,
  // SupportedChainId.CELO,
  // SupportedChainId.BNB,
  SupportedChainId.BERA_ARTIO,
  SupportedChainId.LINEA,
]

interface ChainSelectorProps {
  leftAlign?: boolean
}

export const ChainSelector = ({ leftAlign }: ChainSelectorProps) => {
  const { account, chainId, connector } = useWeb3React()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const isMobile = useIsMobile()

  const theme = useTheme()

  const ref = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setIsOpen(false), [modalRef])

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
    },
    [selectChain, setIsOpen]
  )

  const getConnection = useGetConnection()
  const connectionType = getConnection(connector).type
  const isUniWallet = connectionType === ConnectionType.UNIWALLET

  if (!chainId) {
    return null
  }

  const isSupported = !!info

  const dropdown = (
    <NavDropdown top="56" left={leftAlign ? '0' : 'auto'} right={leftAlign ? 'auto' : '0'} ref={modalRef}>
      <Column paddingX="8">
        {NETWORK_SELECTOR_CHAINS.map((chainId: SupportedChainId) => (
          <ChainSelectorRow
            disabled={isUniWallet && chainId === SupportedChainId.CELO}
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

// <ChainSelectorWrapper ref={ref}>
//   <MouseoverTooltip text={t`Your wallet's current network is unsupported.`} disabled={isSupported}>
//     <ChainSelectorButton data-testid="chain-selector" onClick={() => setIsOpen(!isOpen)} isOpen={isOpen}>
//       {!isSupported ? (
//         <AlertTriangle size={20} color={theme.neutral2} />
//       ) : (
//         <ChainLogo chainId={chainId} size={20} testId="chain-selector-logo" />
//       )}
//       {isOpen ? <ChevronUp {...chevronProps} /> : <ChevronDown {...chevronProps} />}
//     </ChainSelectorButton>
//   </MouseoverTooltip>
//   {isOpen && (isMobile ? <Portal>{dropdown}</Portal> : <>{dropdown}</>)}
// </ChainSelectorWrapper>
