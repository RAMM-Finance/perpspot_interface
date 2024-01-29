import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { PAGE_SIZE, useTopTokens } from 'graphql/data/TopTokens'
import { validateUrlChainParam } from 'graphql/data/util'
import { client } from 'graphql/limitlessGraph/limitlessClients'
import { PoolAddedQuery } from 'graphql/limitlessGraph/queries'
import { usePoolsData } from 'hooks/useLMTPools'
import { ReactNode, useMemo } from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatDollar } from 'utils/formatNumbers'
import {ethers} from 'ethers'
// import {useToken} from 'hooks/Tokens'
import { MAX_WIDTH_MEDIA_BREAKPOINT } from '../constants'
// import { PHeaderRow, PLoadedRow, PLoadingRow } from './PairsRow'
import { PHeaderRow, PLoadedRow } from './PairsRow'
import { HeaderRow, LoadingRow } from './TokenRow'

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  // max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
  /* max-width: 1480px; */
  /* background-color: ${({ theme }) => theme.background}; */
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.05), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  margin-left: auto;
  margin-right: auto;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
`

const TokenDataContainer = styled.div`
  display: flex;
  flex-direction: column;
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

  const [data, setData] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()

  interface Pool {
    blockTimeStamp: string
    fee: number
    id: string
    pool: string
    tickDiscretization: number
    token0: string
    token1: string
    __typename: string
  }

  useEffect(() => {
    // if (!trader || loading || !blockNumber || (lastBlockNumber && lastBlockNumber + 2 > blockNumber)) return
    if (!client || !PoolAddedQuery || loading || error) return
    const call = async () => {
      try {
        setLoading(true)

        const poolQueryData = await client.query(PoolAddedQuery, {}).toPromise()
        setData(
          poolQueryData.data?.poolAddeds
            .filter(
              (val: Pool) =>
                val.token0 !== '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1' &&
                val.token1 !== '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1' &&

   
                ethers.utils.getAddress(val.token0) !== '0x539bdE0d7Dbd336b79148AA742883198BBF60342' &&
                ethers.utils.getAddress(val.token1) !== '0x539bdE0d7Dbd336b79148AA742883198BBF60342' &&

                ethers.utils.getAddress(val.token0) !== '0x00CBcF7B3d37844e44b888Bc747bDd75FCf4E555' &&
                ethers.utils.getAddress(val.token1) !== '0x00CBcF7B3d37844e44b888Bc747bDd75FCf4E555' &&

                ethers.utils.getAddress(val.token0) !== '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4' &&
                ethers.utils.getAddress(val.token1) !== '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4' &&

                ethers.utils.getAddress(val.token0) !== '0x3082CC23568eA640225c2467653dB90e9250AaA0' &&
                ethers.utils.getAddress(val.token1) !== '0x3082CC23568eA640225c2467653dB90e9250AaA0' &&

                ethers.utils.getAddress(val.token0) !== '0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66' &&
                ethers.utils.getAddress(val.token1) !== '0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66' 
              
            )
            .map((val: Pool) => {
              return { token0: val.token0, token1: val.token1, fee: val.fee }
            })
        )
        setLoading(false)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }
    call()
  }, [error, loading])

  const poolData = usePoolsData()

  const poolsInfo = useMemo(() => {
    if (poolData) {
      return {
        tvl: Object.values(poolData).reduce((accum: number, pool: any) => accum + pool.totalValueLocked, 0),
        volume: Object.values(poolData).reduce((accum: number, pool: any) => accum + pool.volume, 0),
      }
    } else {
      return null
    }
  }, [poolData])

  const dataInfo = useMemo(() => {
    if (poolData && data) {
      const lowerCasePool = Object.fromEntries(Object.entries(poolData).map(([k, v]) => [k.toLowerCase(), v]))

      return data.map((pool: any) => {
        if (Object.keys(lowerCasePool).find((pair: any) => `${pool.token0}-${pool.token1}-${pool.fee}`)) {
          return {
            ...pool,
            tvl: lowerCasePool[`${pool.token0}-${pool.token1}-${pool.fee}`]?.totalValueLocked,
            volume: lowerCasePool[`${pool.token0}-${pool.token1}-${pool.fee}`]?.volume,
          }
        } else {
          return pool
        }
      })
    } else {
      return null
    }
  }, [poolData, data])

  const { chainId, account, provider } = useWeb3React()

  /* loading and error state */
  if (!chainId || !provider) {
    return (
      <GridContainer>
        <Trans>Connect Wallet to Arbitrum</Trans>
      </GridContainer>
    )
  } else if (loading) {
    return <LoadingTokenTable rowCount={PAGE_SIZE} />
  }
  // else if (!tokens) {
  //   return (
  //     <NoTokensState
  //       message={
  //         <>
  //           <AlertTriangle size={16} />
  //           <Trans>An error occurred loading tokens. Please try again.</Trans>
  //         </>
  //       }
  //     />
  //   )
  // }
  // else if (tokens?.length === 0) {
  //   return <NoTokensState message={<Trans>No tokens found</Trans>} />
  // }
  else {
    return (
      <>
        <PairInfoContainer>
          <TVLInfoContainer poolsInfo={poolsInfo} />
          <HowToDetails />
        </PairInfoContainer>
        <GridContainer>
          <PHeaderRow />
          <TokenDataContainer>
            {dataInfo &&
              dataInfo.map((dat: any) => (
                <PLoadedRow
                  key={`${dat.token0}-${dat.token1}-${dat.fee}`}
                  tokenListIndex={1}
                  tokenListLength={1}
                  tokenA={dat.token0}
                  tokenB={dat.token1}
                  fee={dat.fee}
                  tvl={dat.tvl}
                  volume={dat.volume}
                />
              ))}
          </TokenDataContainer>
        </GridContainer>
      </>
    )
  }
}

const PairInfoContainer = styled.div`
  display: flex;
  margin-left: auto;
  margin-right: auto;
  // max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
  padding-bottom: 2rem;
  padding-top: 1rem;
  justify-content: space-between;
  align-items: center;
`

interface TVLInfoProps {
  first: boolean
}

const TVLInfo = styled.div<TVLInfoProps>`
  width: 12rem;
  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 0.75rem;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  border-right: ${({ first, theme }) => (first ? `1px solid ${theme.backgroundOutline}` : 'none')};
`
const HowTo = styled.div`
  width: 40rem;
  background-color: ${({ theme }) => theme.backgroundSurface};
  padding: 0.75rem;
  border-radius: 10px;
  font-size: 0.8rem;
  margin-left: 1rem;
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
`

const TVLInfoWrapper = styled.div`
  display: flex;
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  height: 7rem;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.backgroundSurface};
`

function TVLInfoContainer({ poolsInfo }: { poolsInfo?: any }) {
  return (
    <TVLInfoWrapper>
      <TVLInfo first={true}>
        <ThemedText.SubHeader fontSize={14}>TVL</ThemedText.SubHeader>
        <ThemedText.HeadlineMedium color="textSecondary">
          {poolsInfo.tvl ? formatDollar({ num: poolsInfo.tvl, digits: 0 }) : '0'}
        </ThemedText.HeadlineMedium>
      </TVLInfo>
      <TVLInfo first={false}>
        <ThemedText.SubHeader fontSize={14}>Volume</ThemedText.SubHeader>
        <ThemedText.HeadlineMedium color="textSecondary">
          {poolsInfo.tvl ? formatDollar({ num: poolsInfo.volume, digits: 1 }) : '0'}
        </ThemedText.HeadlineMedium>
      </TVLInfo>
    </TVLInfoWrapper>
  )
}

function HowToDetails() {
  return (
    <HowTo>
      <ThemedText.HeadlineSmall>How It Works</ThemedText.HeadlineSmall>
      <p>
        Liquidity Providers (LPs) earn swap fees from Uniswap when the position is in range, and also 
          earn additional premiums for out-of-range capital being lent out to traders. 
      </p>
      <p>
        LPs in individual pools therefore always earns at least Uniswap swap fees. LPs can create a new LP Position, which will automatically provide liquidity to Uniswap. 
      </p>
    </HowTo>
  )
}
