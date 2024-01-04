import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { PAGE_SIZE, useTopTokens } from 'graphql/data/TopTokens'
import { validateUrlChainParam } from 'graphql/data/util'
import { client } from 'graphql/limitlessGraph/limitlessClients'
import { PoolAddedQuery } from 'graphql/limitlessGraph/queries'
import { usePoolsData } from 'hooks/useLMTPools'
import { ReactNode, useMemo } from 'react'
import { useEffect, useState } from 'react'
import { AlertTriangle } from 'react-feather'
import { useParams } from 'react-router-dom'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatDollar } from 'utils/formatNumbers'

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
          poolQueryData.data.poolAddeds.map((val: Pool) => {
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
  // const tokenAddresses = [
  //   ['0x569f3140FDc0f3B9Fc2E4919C35f35D39dd2B01A', '0x4E3F175b38098326a34F2C8B2D07AF5fFdfc6fA9'],
  //   ['0x569f3140FDc0f3B9Fc2E4919C35f35D39dd2B01A', '0xf24Ce4A61c1894219576f652cDF781BBB257Ec8F'],
  //   ['0x4E3F175b38098326a34F2C8B2D07AF5fFdfc6fA9', '0xf24Ce4A61c1894219576f652cDF781BBB257Ec8F'],
  // ]
  // const _tokens = tokenAddresses.map((value: string[]) => {
  //   const token0 = useToken(value[0])
  //   const token1 = useToken(value[1])
  //   return { token0, token1 }
  // })

  const { chainId, account, provider } = useWeb3React()

  /* loading and error state */
  if (!chainId || !account || !provider) {
    return (
      <GridContainer>
        <Trans>Connect Wallet to Arbitrum</Trans>
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
          {poolsInfo.volume ? poolsInfo.volume : '0'}
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
        Liquidity Providers (LPs) earn spot-trading fees while capital is lent out. They also earn fees in the form of
        premiums when capital is being utlized.
      </p>
      <p>LPs can deposit their existing Non-Fungible Token Position (NFT) or create a new LP Position</p>
    </HowTo>
  )
}
