import Column from 'components/Column'
import { WalletModalV2 } from 'components/WalletModal'
import { useCallback, useState } from 'react'
import styled from 'styled-components/macro'
import { useAccount, useConnect } from 'wagmi'

import AuthenticatedHeader from './AuthenticatedHeader'
import SettingsMenu from './SettingsMenu'

const DefaultMenuWrap = styled(Column)`
  width: 100%;
  height: 100%;
`

enum MenuState {
  DEFAULT,
  SETTINGS,
}

function DefaultMenu() {
  const account = useAccount().address
  const isAuthenticated = !!account

  const [menu, setMenu] = useState<MenuState>(MenuState.DEFAULT)
  const openSettings = useCallback(() => setMenu(MenuState.SETTINGS), [])
  const closeSettings = useCallback(() => setMenu(MenuState.DEFAULT), [])

  const { connectors, connect, isPending, isSuccess, isError, data } = useConnect()


  return (
    <DefaultMenuWrap>
      {menu === MenuState.DEFAULT &&
        (isAuthenticated ? (
          <AuthenticatedHeader account={account} openSettings={openSettings} />
        ) : (
          <>
            <WalletModalV2 openSettings={openSettings} />
          </>
        ))}
      {menu === MenuState.SETTINGS && <SettingsMenu onClose={closeSettings} />}
    </DefaultMenuWrap>
  )
}

export default DefaultMenu
