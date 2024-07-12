import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { SupportedChainId } from 'constants/chains'
import { useChainId } from 'wagmi'
import { useDefaultActiveTokens } from './Tokens'
import { useAllPoolAndTokenPriceData } from './useUserPriceData'
import { ActivityDescriptionType } from 'components/WalletDropdown/MiniPortfolio/Activity/types'

export const useHistoryToShow = (history: any[] | undefined) => {
  const chainId = useChainId()
  const tokens = useDefaultActiveTokens()
  const { tokens: tokenPriceData } = useAllPoolAndTokenPriceData()
  
  // const enabled = useMemo(() => {
  //   return Boolean(history)
  // }, [history, chainId])

  // const queryKey = useMemo(() => {
  //   if (!history) return []
  //   return ['historyToShow', history, chainId]
  // }, [history, chainId])
  

  const getFixedDecimal = useCallback((amount: number, decimal?: number, fixed?: number) => {
    let value
    if (decimal) {
      value = Number(amount) / 10 ** decimal
    } else {
      value = Number(amount)
    }
    const decimalPlaces = (value.toString().split('.')[1] || []).length
    let displayValue = decimalPlaces > (fixed || 10) ? value.toFixed(fixed || 10) : value.toString()
  
    if (Number(displayValue).toString() === '0' || Number(displayValue).toString() === '-0') {
      displayValue = '0'
    }
    return displayValue
  }, [chainId])

  const getDescriptor = useCallback((chainId: number | undefined, entry: any, tokens: any, tokenPriceData: any) => {
    const token0Name = tokens[entry.token0]?.symbol ?? tokens[entry.token0]?.name
    const token1Name = tokens[entry.token1]?.symbol ?? tokens[entry.token1]?.name

  
    const token0Decimal = tokens[entry.token0]?.decimals
    const token1Decimal = tokens[entry.token1]?.decimals
  
    const token0PriceUSD = tokenPriceData[entry.token0.toLowerCase()]?.usdPrice
    const token1PriceUSD = tokenPriceData[entry.token1.toLowerCase()]?.usdPrice

    if (entry.actionType == ActivityDescriptionType.ADD_ORDER) {
      const price = entry.marginInPosToken
        ? entry.positionIsToken0
          ? token0Decimal / entry.startoutput
          : token1Decimal / entry.startoutput
        : entry.positionIsToken0
        ? token1Decimal / entry.inputAmount
        : token0Decimal / entry.inputAmount
      if (entry.positionIsToken0)
        return (
          'Added order for ' +
          token0Name +
          ' with ' +
          token1Name +
          `, Pair: ${token0Name}/${token1Name}` +
          `, Price: ${price}`
        )
      else
        return (
          'Added order for ' +
          token1Name +
          ' with' +
          token0Name +
          `, Pair: ${token0Name}/${token1Name}` +
          `, Price: ${price}`
        )
    } else if (entry.actionType == ActivityDescriptionType.CANCLE_ORDER) {
      if (entry.positionIsToken0)
        return `Canceled order for ${token0Name} with ${token1Name}, Pair: ${token0Name}/${token1Name}`//'Canceled order for ' + token0Name + ' with ' + token1Name + `, Pair: ${token0Name}/${token1Name}`
      else return `Canceled order for ${token1Name} with ${token0Name}`//'Canceled order for ' + token1Name + ' with' + token0Name
    } else if (entry.actionType == ActivityDescriptionType.ADD_POSITION) {
      const price = entry.marginInPosToken
        ? entry.positionIsToken0
          ? (Number(entry.addedAmount) - Number(entry.marginAmount)) /
            10 ** token0Decimal /
            (Number(entry.borrowAmount) / 10 ** token1Decimal)
          : (Number(entry.addedAmount) - Number(entry.marginAmount)) /
            10 ** token1Decimal /
            (Number(entry.borrowAmount) / 10 ** token0Decimal)
        : entry.positionIsToken0
        ? Number(entry.addedAmount) /
          10 ** token0Decimal /
          ((Number(entry.marginAmount) + Number(entry.borrowAmount)) / 10 ** token1Decimal)
        : Number(entry.addedAmount) /
          10 ** token1Decimal /
          ((Number(entry.marginAmount) + Number(entry.borrowAmount)) / 10 ** token0Decimal)
      const margin = entry.marginInPosToken
        ? entry.positionIsToken0
          ? Number(entry.marginAmount / 10 ** token0Decimal)
          : Number(entry.marginAmount / 10 ** token1Decimal)
        : entry.positionIsToken0
        ? Number(entry.marginAmount / 10 ** token1Decimal)
        : Number(entry.marginAmount / 10 ** token0Decimal)
  
      if (entry.positionIsToken0)
        return (
          'Added ' +
          getFixedDecimal(entry.addedAmount, token0Decimal) +
          ' ' +
          token0Name +
          '  with ' +
          getFixedDecimal(margin) +
          ' ' +
          (entry.marginInPosToken ? token0Name : token1Name) +
          `, Pair: ${token0Name}/${token1Name}` +
          `, Price: ${getFixedDecimal(price, 0, 12)}`
        )
      else
        return (
          'Added ' +
          getFixedDecimal(entry.addedAmount, token1Decimal) +
          ' ' +
          token1Name +
          '  with ' +
          getFixedDecimal(margin) +
          ' ' +
          (entry.marginInPosToken ? token1Name : token0Name) +
          `, Pair: ${token0Name}/${token1Name}` +
          `, Price: ${getFixedDecimal(price, 0, 12)}`
        )
    } else if (entry.actionType == ActivityDescriptionType.FORCE_CLOSED) {
      if (entry.positionIsToken0)
        return (
          `Force Closed ${getFixedDecimal(entry.forcedClosedAmount, token0Decimal)} 
          ${token0Name} for ${token0Name}/${token1Name}`
        )
      else
        return (
          `Force Closed ${getFixedDecimal(entry.forcedClosedAmount, token1Decimal)} 
          ${token1Name} for ${token0Name}/${token1Name}`
        )
    } else if (entry.actionType == ActivityDescriptionType.REDUCE_POSITION) {
      const price = String(-(Number(entry.amount0) / 10 ** token0Decimal) / (Number(entry.amount1) / 10 ** token1Decimal))
      const PnL = entry.marginInPosToken
        ? entry.positionIsToken0
          ? Number(entry.PnL) / 10 ** token0Decimal
          : Number(entry.PnL) / 10 ** token1Decimal
        : entry.positionIsToken0
        ? Number(entry.PnL) / 10 ** token1Decimal
        : Number(entry.PnL) / 10 ** token0Decimal
  
      // const marginToken = (entry.marginInPosToken && entry.positionIsToken0) ? token0Name : token1Name
  
      const marginToken = entry.marginInPosToken
        ? entry.positionIsToken0
          ? token0Name
          : token1Name
        : entry.positionIsToken0
        ? token1Name
        : token0Name
  
      const pnlPriceUSD = parseFloat(
        entry.marginInPosToken
          ? entry.positionIsToken0
            ? token0PriceUSD
            : token1PriceUSD
          : entry.positionIsToken0
          ? token1PriceUSD
          : token0PriceUSD
      )
  
      if (entry.positionIsToken0) {
        return (
          'Reduced ' +
          getFixedDecimal(entry.reduceAmount, token0Decimal) +
          ' ' +
          token0Name +
          ' from ' +
          token0Name +
          '/' +
          token1Name +
          `, Pair: ${token0Name}/${token1Name}` +
          `, Price: ${getFixedDecimal(Number(price), 0, 12)}` +
          ` Pnl: ${getFixedDecimal(PnL, 0, 9)} ${marginToken} ($${(pnlPriceUSD * PnL).toFixed(9)})`
        )
      } else
        return (
          'Reduced ' +
          getFixedDecimal(entry.reduceAmount, token1Decimal) +
          ' ' +
          token1Name +
          ' for ' +
          token0Name +
          '/' +
          token1Name +
          `, Pair: ${token0Name}/${token1Name}` +
          `, Price:  ${getFixedDecimal(Number(price), 0, 12)}` +
          ` Pnl: ${getFixedDecimal(PnL, 0, 9)} ${marginToken} ($${(pnlPriceUSD * PnL).toFixed(9)})`
        )
    } else {
      return ' '
    }
  }, [history, chainId])

  const sortedHistory = useMemo(() => {
    if (!chainId || !history || !tokens || !tokenPriceData) return undefined
    const processedHistory: any[] = history.map((entry : any) => {
      const descriptor = getDescriptor(chainId, entry, tokens, tokenPriceData)
      return {
        chainId,
        status: undefined,
        timestamp: Number(entry.blockTimestamp),
        title: entry.actionType,
        descriptor: descriptor ?? ' ',
        logos: undefined,
        currencies: [entry.token0, entry.token1],
        hash: entry.transactionHash,
        isOrder: entry.actionType == 'Reduce Position' ? (entry.trader != entry.filler ? true : false) : false,
      }
    })
    const sortedHistory = [...processedHistory].sort((hist, hist2) => hist2.timestamp - hist.timestamp)

    return sortedHistory
  }, [chainId, history, tokens, tokenPriceData])

  return useMemo(() => {
    if (sortedHistory) {
      return sortedHistory
    } else {
      return []
    }
  }, [sortedHistory, chainId])
  
}
