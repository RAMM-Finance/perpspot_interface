import { TokenFilterByCategory, tokenFilterByCategory } from 'components/Tokens/TokenTable/TokenTable'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { PoolFilterByCategory, poolFilterByCategory } from './state'

const CategoryWrapper = styled.div`
  display: flex;
  gap: 10px;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
`
const Category = styled(ThemedText.DeprecatedSubHeader)<{ active?: boolean }>`
  border-radius: 5px;
  border: 2px solid
    ${({ theme, active }) => (active ? ` ${theme.accentActiveSoft}` : `${theme.accentTextLightTertiary}`)};
  background: ${({ theme, active }) => (active ? ` ${theme.accentActiveSoft}` : `${theme.accentTextLightTertiary}`)};
  padding: 3px;
  &:hover {
    cursor: pointer;
    transform: scale(1.05);
  }
`

export default function PairCategorySelector({ tokenTable }: { tokenTable?: boolean }) {
  const currentCategory = useAtomValue(tokenTable ? tokenFilterByCategory : poolFilterByCategory)
  const [localCategory, setLocalCategory] = useState(currentCategory)
  const setCategory = useSetAtom(tokenTable ? tokenFilterByCategory : poolFilterByCategory)

  const tokenTableOrSelector = tokenTable ? PoolFilterByCategory : TokenFilterByCategory

  useEffect(() => {
    setLocalCategory(currentCategory)
  }, [currentCategory])

  useEffect(() => {
    setCategory(localCategory)
  }, [setCategory, localCategory])

  return (
    <CategoryWrapper>
      <Category
        onClick={() => setLocalCategory(tokenTableOrSelector.ALL)}
        active={currentCategory === tokenTableOrSelector.ALL}
        color={currentCategory === tokenTableOrSelector.ALL ? 'accentActive' : 'textSecondary'}
        fontSize={11}
        fontWeight={currentCategory === tokenTableOrSelector.ALL ? 600 : 400}
      >
        All
      </Category>
      <Category
        onClick={() => setLocalCategory(tokenTableOrSelector.NEW)}
        active={currentCategory === tokenTableOrSelector.NEW}
        fontSize={11}
        color={currentCategory === tokenTableOrSelector.NEW ? 'accentActive' : 'textSecondary'}
        fontWeight={currentCategory === tokenTableOrSelector.NEW ? 600 : 400}
      >
        New
      </Category>
      <Category
        onClick={() => setLocalCategory(tokenTableOrSelector.AI)}
        active={currentCategory === tokenTableOrSelector.AI}
        fontSize={11}
        color={currentCategory === tokenTableOrSelector.AI ? 'accentActive' : 'textSecondary'}
        fontWeight={currentCategory === tokenTableOrSelector.AI ? 600 : 400}
      >
        AI
      </Category>
      <Category
        onClick={() => setLocalCategory(tokenTableOrSelector.DEFI)}
        active={currentCategory === tokenTableOrSelector.DEFI}
        fontSize={11}
        color={currentCategory === tokenTableOrSelector.DEFI ? 'accentActive' : 'textSecondary'}
        fontWeight={currentCategory === tokenTableOrSelector.DEFI ? 600 : 400}
      >
        DeFi
      </Category>
      <Category
        onClick={() => setLocalCategory(tokenTableOrSelector.MEME)}
        active={currentCategory === tokenTableOrSelector.MEME}
        fontSize={11}
        color={currentCategory === tokenTableOrSelector.MEME ? 'accentActive' : 'textSecondary'}
        fontWeight={currentCategory === tokenTableOrSelector.MEME ? 600 : 400}
      >
        Meme
      </Category>
    </CategoryWrapper>
  )
}
