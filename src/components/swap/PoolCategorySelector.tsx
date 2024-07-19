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

export default function PairCategorySelector() {
  const currentCategory = useAtomValue(poolFilterByCategory)
  const [localCategory, setLocalCategory] = useState(currentCategory)
  const setCategory = useSetAtom(poolFilterByCategory)

  useEffect(() => {
    setLocalCategory(currentCategory)
  }, [currentCategory])

  useEffect(() => {
    setCategory(localCategory)
  }, [setCategory, localCategory])

  return (
    <CategoryWrapper>
      <Category
        onClick={() => setLocalCategory(PoolFilterByCategory.ALL)}
        active={currentCategory === PoolFilterByCategory.ALL}
        color={currentCategory === PoolFilterByCategory.ALL ? 'accentActive' : 'textSecondary'}
        fontSize={11}
        fontWeight={currentCategory === PoolFilterByCategory.ALL ? 600 : 400}
      >
        All
      </Category>
      <Category
        onClick={() => setLocalCategory(PoolFilterByCategory.NEW)}
        active={currentCategory === PoolFilterByCategory.NEW}
        fontSize={11}
        color={currentCategory === PoolFilterByCategory.NEW ? 'accentActive' : 'textSecondary'}
        fontWeight={currentCategory === PoolFilterByCategory.NEW ? 600 : 400}
      >
        New
      </Category>
      <Category
        onClick={() => setLocalCategory(PoolFilterByCategory.AI)}
        active={currentCategory === PoolFilterByCategory.AI}
        fontSize={11}
        color={currentCategory === PoolFilterByCategory.AI ? 'accentActive' : 'textSecondary'}
        fontWeight={currentCategory === PoolFilterByCategory.AI ? 600 : 400}
      >
        AI
      </Category>
      <Category
        onClick={() => setLocalCategory(PoolFilterByCategory.DEFI)}
        active={currentCategory === PoolFilterByCategory.DEFI}
        fontSize={11}
        color={currentCategory === PoolFilterByCategory.DEFI ? 'accentActive' : 'textSecondary'}
        fontWeight={currentCategory === PoolFilterByCategory.DEFI ? 600 : 400}
      >
        DeFi
      </Category>
      <Category
        onClick={() => setLocalCategory(PoolFilterByCategory.MEME)}
        active={currentCategory === PoolFilterByCategory.MEME}
        fontSize={11}
        color={currentCategory === PoolFilterByCategory.MEME ? 'accentActive' : 'textSecondary'}
        fontWeight={currentCategory === PoolFilterByCategory.MEME ? 600 : 400}
      >
        Meme
      </Category>
    </CategoryWrapper>
  )
}
