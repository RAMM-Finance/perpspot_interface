import { useWeb3React } from '@web3-react/core'
import { SmallButtonPrimary } from 'components/Button'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { ClickableRate } from 'components/Tokens/TokenTable/PairsRow'
import ZapModal from 'components/Tokens/TokenTable/ZapModal/ZapModal'
import { LMT_PER_USD_PER_DAY, LMT_PER_USD_PER_DAY_USDC } from 'constants/misc'
import { useCurrency } from 'hooks/Tokens'
import { usePoolsData } from 'hooks/useLMTPools'
import { useEstimatedAPR, usePool } from 'hooks/usePools'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePoolOHLC } from 'state/application/hooks'
import { useCurrentPool, useSetCurrentPool } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { getPoolId } from 'utils/lmtSDK/LmtIds'

const PairWrapper = styled.div`
  display: grid;
  grid-template-rows: auto auto;
  justify-items: center;
  gap: 5px;
`
const DataRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: end;
  gap: 3px;
`
const ButtonRow = styled.div`
  display: flex;
  gap: 2px;
`

const PairButton = styled(SmallButtonPrimary)`
  font-size: 10px;
  width: 60px;
  height: 25px;
  border-radius: 5px;
`

interface AprObj {
  apr: number
  utilTotal: number | undefined
}

const HighlightPair = ({ aprInfo }: { aprInfo: [string, AprObj] }) => {
  const { chainId } = useWeb3React()
  const navigate = useNavigate()

  function destructurePoolId(poolId: string): [string, string, number] {
    const destruct = poolId.split('-')
    return [destruct[0], destruct[1], parseInt(destruct[2])]
  }

  const [token0, token1, fee] = destructurePoolId(aprInfo[0])

  const token0Address = token0 && token1 ? (token0.toLowerCase() < token1.toLowerCase() ? token0 : token1) : null
  const token1Address = token0 && token1 ? (token0.toLowerCase() < token1.toLowerCase() ? token1 : token0) : null

  const currency0 = useCurrency(token0Address)
  const currency1 = useCurrency(token1Address)
  const depositAmountUSD = 1000

  const [, pool, tickSpacing] = usePool(currency0 ?? undefined, currency1 ?? undefined, fee ?? undefined)
  const poolOHLC = usePoolOHLC(token0Address, token1Address, fee)

  const [price, delta] = useMemo(() => {
    if (poolOHLC) {
      return [poolOHLC.priceNow, poolOHLC.delta24h]
    }
    return [undefined, undefined]
  }, [poolOHLC])

  const priceInverted = useMemo(() => {
    if (!poolOHLC) return undefined
    else return poolOHLC?.token0IsBase ? price : price ? 1 / price : 0
  }, [poolOHLC, price])

  const estimatedAPR = useEstimatedAPR(currency0, currency1, pool, tickSpacing, priceInverted, depositAmountUSD)

  const setCurrentPool = useSetCurrentPool()
  const currentPool = useCurrentPool()
  const poolId = currentPool?.poolId

  const handlePoolSelect = useCallback(
    (e: any) => {
      navigate('/trade/')
      if (fee && currency0 && currency1 && currency0.symbol && currency1.symbol && pool && chainId) {
        const id = getPoolId(currency0.wrapped.address, currency1.wrapped.address, fee)
        if (poolOHLC && poolId !== id && id) {
          e.stopPropagation()
          setCurrentPool(id, !poolOHLC.token0IsBase, poolOHLC.token0IsBase, currency0.symbol, currency1.symbol)
        }
      }
    },
    [setCurrentPool, poolId, poolOHLC, pool, fee, currency0, currency1, chainId, navigate]
  )

  const [showModal, setShowModal] = useState(false)
  const handleCloseModal = useCallback(() => {
    setShowModal(false)
  }, [])

  const handleZap = useCallback(
    (e: any) => {
      e.stopPropagation()
      setShowModal(true)
    },
    [setShowModal]
  )
  const { result: poolTvlData } = usePoolsData()
  
  return (
    <PairWrapper>
      {showModal && (
        <ZapModal
          isOpen={showModal}
          onClose={handleCloseModal}
          apr={aprInfo[1].apr !== undefined ? aprInfo[1].apr + estimatedAPR : undefined}
          tvl={(poolTvlData && poolId && poolTvlData[poolId]?.totalValueLocked) || undefined}
          token0={currency0}
          token1={currency1}
          poolKey={
            currency0 && currency1 && fee
              ? { token0: currency0.wrapped.address, token1: currency1.wrapped.address, fee }
              : undefined
          }
        />
      )}
      <DoubleCurrencyLogo size={26} currency0={currency0} currency1={currency1} />
      <DataRow>
        <ThemedText.BodySmall>APR:</ThemedText.BodySmall>
        <ClickableRate
          style={{ fontSize: '14px', cursor: 'default' }}
          rate={(aprInfo[1].apr ?? 0) + (estimatedAPR ?? 0)}
        >
          {aprInfo[1].apr !== undefined ? `${(aprInfo[1].apr + estimatedAPR || 0)?.toFixed(4)}%` : '-'}
        </ClickableRate>
      </DataRow>
      <DataRow>
        <ThemedText.BodySmall>LMT:</ThemedText.BodySmall>
        <ClickableRate
          style={{ fontSize: '14px', cursor: 'default' }}
          rate={
            (currency0?.symbol === 'USDC' && currency1?.symbol === 'WETH') ||
            (currency0?.symbol === 'WETH' && currency1?.symbol === 'USDC')
              ? LMT_PER_USD_PER_DAY_USDC
              : LMT_PER_USD_PER_DAY
          }
        >
          {(currency0?.symbol === 'USDC' && currency1?.symbol === 'WETH') ||
          (currency0?.symbol === 'WETH' && currency1?.symbol === 'USDC')
            ? `${LMT_PER_USD_PER_DAY_USDC} LMT/USD`
            : `${LMT_PER_USD_PER_DAY} LMT/USD`}
        </ClickableRate>
        {/* <ClickableRate style={{ fontSize: '14px', cursor: 'default' }} rate={LMT_PER_USD_PER_DAY}>
          {LMT_PER_USD_PER_DAY ?? '-'}
        </ClickableRate> */}
      </DataRow>
      <ButtonRow>
        <PairButton onClick={handleZap} style={{ width: '50px' }}>
          Deposit
        </PairButton>
        <PairButton onClick={handlePoolSelect}>Leverage</PairButton>
      </ButtonRow>
    </PairWrapper>
  )
}

export default HighlightPair
