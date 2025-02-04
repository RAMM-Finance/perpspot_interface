import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from 'constants/chains'
import { PAGE_SIZE, useTopTokens } from 'graphql/data/TopTokens'
import { validateUrlChainParam } from 'graphql/data/util'
import { ReactNode } from 'react'
import { AlertTriangle } from 'react-feather'
import { useParams } from 'react-router-dom'
import styled from 'styled-components/macro'

// import {useToken} from 'hooks/Tokens'
import { useToken } from '../../../hooks/Tokens'
import { MAX_WIDTH_MEDIA_BREAKPOINT } from '../constants'
// import { PHeaderRow, PLoadedRow, PLoadingRow } from './PairsRow'
import { PHeaderRow, PLoadedRow } from './PairsRow'
import { HeaderRow, LoadingRow } from './TokenRow'

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
  /* max-width: 1480px; */
  /* background-color: ${({ theme }) => theme.background}; */
  background-color: #0d111c;
  border: 1px solid #98a1c03d;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.05), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  padding: 40px;
  margin-left: auto;
  margin-right: auto;
  border-radius: 36px;
  justify-content: center;
  align-items: center;
`

const TokenDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
  width: 100%;
`

const NoTokenDisplay = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 60px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 16px;
  font-weight: 500;
  align-items: center;
  padding: 0px 28px;
  gap: 8px;
`

function NoTokensState({ message }: { message: ReactNode }) {
  return (
    <GridContainer>
      <HeaderRow />
      <NoTokenDisplay>{message}</NoTokenDisplay>
    </GridContainer>
  )
}

const LoadingRows = ({ rowCount }: { rowCount: number }) => (
  <>
    {Array(rowCount)
      .fill(null)
      .map((_, index) => {
        return <LoadingRow key={index} first={index === 0} last={index === rowCount - 1} />
      })}
  </>
)

// function LoadingTokenTable({ rowCount = PAGE_SIZE }: { rowCount?: number }) {
//   return (
//     <GridContainer>
//       <HeaderRow />
//       <TokenDataContainer>
//         <LoadingRows rowCount={rowCount} />
//       </TokenDataContainer>
//     </GridContainer>
//   )
// }

function LoadingTokenTable({ rowCount = PAGE_SIZE }: { rowCount?: number }) {
  return (
    <GridContainer>
      {/* <PHeaderRow /> */}
      <TokenDataContainer>
        <LoadingRows rowCount={rowCount} />
      </TokenDataContainer>
    </GridContainer>
  )
}

// export default function TokenTable() {
//   const chainName = validateUrlChainParam(useParams<{ chainName?: string }>().chainName)
//   const { tokens, tokenSortRank, loadingTokens, sparklines } = useTopTokens(chainName)

//   /* loading and error state */
//   if (loadingTokens && !tokens) {
//     return <LoadingTokenTable rowCount={PAGE_SIZE} />
//   } else if (!tokens) {
//     return (
//       <NoTokensState
//         message={
//           <>
//             <AlertTriangle size={16} />
//             <Trans>An error occurred loading tokens. Please try again.</Trans>
//           </>
//         }
//       />
//     )
//   } else if (tokens?.length === 0) {
//     return <NoTokensState message={<Trans>No tokens found</Trans>} />
//   } else {
//     return (
//       <GridContainer>
//         <HeaderRow />
//         <TokenDataContainer>
//           {tokens.map(
//             (token, index) =>
//               token?.address && (
//                 <LoadedRow
//                   key={token.address}
//                   tokenListIndex={index}
//                   tokenListLength={tokens.length}
//                   token={token}
//                   sparklineMap={sparklines}
//                   sortRank={tokenSortRank[token.address]}
//                 />
//               )
//           )}
//         </TokenDataContainer>
//       </GridContainer>
//     )
//   }
// }

export default function TokenTable() {
  const chainName = validateUrlChainParam(useParams<{ chainName?: string }>().chainName)
  const { tokens, tokenSortRank, loadingTokens, sparklines } = useTopTokens(chainName)
  const levManagerAddreses = ['0x184773ef390325BEbe7d49d8481A5914B35c6c4C']
  // const _tokens = levManagerAddreses.map((value: string)=>{
  //   const leverageManager = useLeverageManagerContract(value)
  //   const { result: token0_, loading, error } = useSingleCallResult(leverageManager, 'token0', [])
  //   const { result: token1_, loading: l, error:e } = useSingleCallResult(leverageManager, 'token1', [])
  //   const token0 = useToken(token0_?.toString())
  //   const token1 = useToken(token1_?.toString())
  //   // names, price, percentchange, tvl, volume
  //   // const token0_ = useTokenContract(token0);
  //   // const token1_ = useTokenContract(token1);

  //   // const{ result: name0, loading: l0, error:e0 } = useSingleCallResult(token0_, 'name', [])
  //   // const{ result: name1, loading: l1, error:e1 } = useSingleCallResult(token1_, 'name', [])

  //   return {token0, token1}
  // } )
  const tokenAddresses = [
    ['0x569f3140FDc0f3B9Fc2E4919C35f35D39dd2B01A', '0x4E3F175b38098326a34F2C8B2D07AF5fFdfc6fA9'],
    ['0x569f3140FDc0f3B9Fc2E4919C35f35D39dd2B01A', '0xf24Ce4A61c1894219576f652cDF781BBB257Ec8F'],
    ['0x4E3F175b38098326a34F2C8B2D07AF5fFdfc6fA9', '0xf24Ce4A61c1894219576f652cDF781BBB257Ec8F'],
  ]
  const _tokens = tokenAddresses.map((value: string[]) => {
    const token0 = useToken(value[0])
    const token1 = useToken(value[1])
    return { token0, token1 }
  })

  const { chainId, account, provider } = useWeb3React()

  /* loading and error state */
  if (chainId !== SupportedChainId.SEPOLIA || !account || !provider) {
    return (
      <GridContainer>
        <Trans>Connect Wallet to Sepolia</Trans>
      </GridContainer>
    )
  } else if (loadingTokens && !tokens) {
    return <LoadingTokenTable rowCount={PAGE_SIZE} />
  } else if (!tokens) {
    return (
      <NoTokensState
        message={
          <>
            <AlertTriangle size={16} />
            <Trans>An error occurred loading tokens. Please try again.</Trans>
          </>
        }
      />
    )
  } else if (tokens?.length === 0) {
    return <NoTokensState message={<Trans>No tokens found</Trans>} />
  } else {
    return (
      <GridContainer>
        <PHeaderRow />
        <TokenDataContainer>
          {_tokens.map(
            ({ token0, token1 }) =>
              token0?.address &&
              token1?.address && (
                <PLoadedRow
                  key={token0?.address}
                  tokenListIndex={1}
                  tokenListLength={1}
                  token0={token0}
                  token1={token1}
                  sparklineMap={sparklines}
                  sortRank={tokenSortRank[token0.address]}
                />
              )
          )}
        </TokenDataContainer>
      </GridContainer>
    )
  }
}
