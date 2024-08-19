import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { t } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { Currency, Percent } from '@uniswap/sdk-core'
import { Pool, Route } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { getSlippedTicks } from 'components/PositionTable/LeveragePositionTable/DecreasePositionContent'
import { LMT_MARGIN_FACILITY } from 'constants/addresses'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useCallback, useMemo, useState } from 'react'
import { getOutputQuote } from 'state/marginTrading/getOutputQuote'
import { AddMarginTrade, BnToCurrencyAmount } from 'state/marginTrading/hooks'
import { TransactionType } from 'state/transactions/types'
import { TraderPositionKey } from 'types/lmtv2position'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { GasEstimationError, getErrorMessage, parseContractError } from 'utils/lmtSDK/errors'
import { MarginFacilitySDK, ReducePositionOptions } from 'utils/lmtSDK/MarginFacility'
import { MulticallSDK } from 'utils/lmtSDK/multicall'
import { useAccount, useChainId } from 'wagmi'
import { useEthersSigner } from 'wagmi-lib/adapters'

// import BorrowManagerData from '../perpspotContracts/BorrowManager.json'
import { useTransactionAdder } from '../state/transactions/hooks'
import useTransactionDeadline from './useTransactionDeadline'
import { RPC_URLS } from 'constants/networks'
import { ethers } from 'ethers'
import { useMarginLMTPositionFromPositionId } from './useLMTV2Positions'
import { useTokenContract } from './useContract'
import { MaxUint256 } from '@ethersproject/constants'

class ModifiedAddPositionError extends Error {
  constructor() {
    super(
      t`Your swap was modified through your wallet. If this was a mistake, please cancel immediately or risk losing your funds.`
    )
  }
}

export function useAddPositionCallback(
  trade: AddMarginTrade | undefined,
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  pool: Pool | undefined,
  allowedSlippage: Percent
): { callback: null | (() => Promise<string>) } {
  const deadline = useTransactionDeadline()
  const chainId = useChainId()
  const signer = useEthersSigner({ chainId })
  console.log("SIGNER1", signer)
  const account = useAccount().address
  const addTransaction = useTransactionAdder()
  // console.log("allowedSlippage", allowedSlippage)
  const addPositionCallback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!signer) throw new Error('missing provider')
      if (!trade) throw new Error('missing trade')
      if (!deadline) throw new Error('missing deadline')
      if (!inputCurrency || !outputCurrency) throw new Error('missing currencies')
      if (!pool) throw new Error('missing pool')

      const {
        premium,
        inputIsToken0,
        marginInPosToken,
        feePercent,
        premiumInPosToken,
        allowedSlippage,
        borrowAmount,
        marginInOutput,
        marginInInput,
      } = trade

      const swapRoute = new Route(
        [pool],
        inputIsToken0 ? pool.token0 : pool.token1,
        inputIsToken0 ? pool.token1 : pool.token0
      )

      const premiumSwapRoute = new Route(
        [pool],
        inputIsToken0 ? pool.token1 : pool.token0,
        inputIsToken0 ? pool.token0 : pool.token1
      )

      const positionKey: TraderPositionKey = {
        poolKey: {
          token0: pool.token0.address,
          token1: pool.token1.address,
          fee: pool.fee,
        },
        isToken0: !inputIsToken0,
        isBorrow: false,
        trader: account,
      }

      // amount of input (minus fees) swapped for position token.
      let swapInput: BN
      // simulatedOutput in contracts
      let amountOut: BN
      if (marginInPosToken) {
        swapInput = borrowAmount.times(new BN(1).minus(feePercent))
        // console.log('zeke:callback:swapInput', swapInput.toFixed(0))
        const output = await getOutputQuote(BnToCurrencyAmount(swapInput, inputCurrency), swapRoute, signer, chainId)
        if (!output) throw new Error('Quoter Error')
        amountOut = new BN(output.toString())
        amountOut = amountOut.plus(marginInOutput.shiftedBy(outputCurrency.decimals))
      } else {
        swapInput = marginInInput.plus(borrowAmount).times(new BN(1).minus(feePercent))
        const output = await getOutputQuote(BnToCurrencyAmount(swapInput, inputCurrency), swapRoute, signer, chainId)
        if (!output) throw new Error('Quoter Error')
        amountOut = new BN(output.toString())
      }

      let minPremiumOutput: string | undefined
      const bnAllowedSlippage = new BN(allowedSlippage.toFixed(18)).div(100)
      if (premiumInPosToken) {
        const output = await getOutputQuote(
          BnToCurrencyAmount(premium, outputCurrency),
          premiumSwapRoute,
          signer,
          chainId
        )
        if (!output) throw new Error('Quoter Error')

        const bnAllowedSlippage = new BN(allowedSlippage.toFixed(18)).div(100)
        minPremiumOutput = new BN(output.toString()).times(new BN(1).minus(bnAllowedSlippage)).toFixed(0)
      }

      const outputDecimals = outputCurrency.decimals

      // calculate minimum output amount
      const { slippedTickMax, slippedTickMin } = getSlippedTicks(pool, allowedSlippage)
      const currentPrice = trade.inputIsToken0
        ? new BN(pool.token0Price.toFixed(18))
        : new BN(pool.token1Price.toFixed(18))

      const minimumOutput = swapInput.times(currentPrice).times(new BN(1).minus(bnAllowedSlippage))

      const calldatas = MarginFacilitySDK.addPositionParameters({
        positionKey,
        margin: trade.margin.shiftedBy(marginInPosToken ? outputCurrency.decimals : inputCurrency.decimals).toFixed(0),
        borrowAmount: trade.borrowAmount.shiftedBy(inputCurrency.decimals).toFixed(0),
        minimumOutput: marginInPosToken ? '0' : minimumOutput.shiftedBy(outputDecimals).toFixed(0),
        deadline: deadline.toString(),
        simulatedOutput: amountOut.toFixed(0),
        executionOption: 1,
        depositPremium: premium
          .shiftedBy(premiumInPosToken ? outputCurrency.decimals : inputCurrency.decimals)
          .toFixed(0),
        slippedTickMin,
        slippedTickMax,
        marginInPosToken,
        premiumInPosToken,
        minPremiumOutput,
      })

      const tx = {
        from: account,
        to: LMT_MARGIN_FACILITY[chainId],
        data: MulticallSDK.encodeMulticall(calldatas),
      }

      let gasEstimate: BigNumber

      try {
        gasEstimate = await signer.estimateGas(tx)
      } catch (gasError) {
        throw new GasEstimationError()
      }
      const gasLimit = calculateGasMargin(gasEstimate)

      const response = await signer.sendTransaction({ ...tx, gasLimit }).then((response: any) => {
        if (tx.data !== response.data) {
          if (!response.data || response.data.length === 0 || response.data === '0x') {
            console.log('errorrrr')
            throw new ModifiedAddPositionError()
          }
        }
        return response
      })

      return response
    } catch (error: unknown) {
      console.log('ett', error, getErrorMessage(parseContractError(error)))
      throw new Error(getErrorMessage(parseContractError(error)))
    }
  }, [deadline, account, chainId, signer, trade, outputCurrency, inputCurrency, pool])

  const callback = useMemo(() => {
    if (!trade || !addPositionCallback || !outputCurrency || !inputCurrency) return null
    return () =>
      addPositionCallback().then((response) => {
        console.log()
        addTransaction(response, {
          type: TransactionType.ADD_LEVERAGE,
          margin: formatBNToString(trade.margin, NumberType.SwapTradeAmount),
          marginInPosToken: trade.marginInPosToken,
          inputCurrencyId: inputCurrency.wrapped.address,
          outputCurrencyId: outputCurrency.wrapped.address,
          expectedAddedPosition: formatBNToString(trade.expectedAddedOutput, NumberType.SwapTradeAmount),
        })
        return response.hash
      })
  }, [addPositionCallback, addTransaction, trade, inputCurrency, outputCurrency, signer, account, deadline, pool])

  return {
    callback,
  }
}


export function useAddPositionCallback2(
  trade: AddMarginTrade | undefined,
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  pool: Pool | undefined,
  allowedSlippage: Percent,
  pk: string[]
): { callback: null | (() => Promise<string>) } {
  const deadline = useTransactionDeadline()
  const chainId = useChainId()
  const jsonRpcUrl = RPC_URLS[chainId as keyof typeof RPC_URLS][0]
  const signertest = useEthersSigner({ chainId })
  
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl)
  // const wallet = new ethers.Wallet(privateKey, provider)

  let signers = pk?.map((pk) => {
    const wallet = new ethers.Wallet(pk, provider)
    return wallet.connect(provider)
  })
  // console.log("SIGNSER0, 1", signer1[0], signer1[1])
  // let signers = [signer1[1]]
  
  const account = useAccount().address
  const addTransaction = useTransactionAdder()
  
  const tokenContract = useTokenContract(inputCurrency?.wrapped.address, true)
  
  const [positionKeys, setPositionKeys] = useState<TraderPositionKey[]>([])
  const { position: existingPosition, loading: positionLoading } = useMarginLMTPositionFromPositionId(positionKeys[0])
  // console.log("allowedSlippage", allowedSlippage)
  const addPositionCallback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!signers || signers.length === 0) throw new Error('missing provider')
      if (!trade) throw new Error('missing trade')
      if (!deadline) throw new Error('missing deadline')
      if (!inputCurrency || !outputCurrency) throw new Error('missing currencies')
      if (!pool) throw new Error('missing pool')
      if (!tokenContract) throw new Error("missing token contract")
        
      const {
        premium,
        inputIsToken0,
        marginInPosToken,
        feePercent,
        premiumInPosToken,
        allowedSlippage,
        borrowAmount,
        marginInOutput,
        marginInInput,
      } = trade

      const swapRoute = new Route(
        [pool],
        inputIsToken0 ? pool.token0 : pool.token1,
        inputIsToken0 ? pool.token1 : pool.token0
      )

      const premiumSwapRoute = new Route(
        [pool],
        inputIsToken0 ? pool.token1 : pool.token0,
        inputIsToken0 ? pool.token0 : pool.token1
      )
      const positionKeys: TraderPositionKey[] = signers.map(signer => {
        return {
          poolKey: {
            token0: pool.token0.address,
            token1: pool.token1.address,
            fee: pool.fee,
          },
          isToken0: !inputIsToken0,
          isBorrow: false,
          trader: signer.address
        }
      })
      // const positionKey: TraderPositionKey = {
      //   poolKey: {
      //     token0: pool.token0.address,
      //     token1: pool.token1.address,
      //     fee: pool.fee,
      //   },
      //   isToken0: !inputIsToken0,
      //   isBorrow: false,
      //   trader: account,
      // }
      console.log("POS KEYS", positionKeys)
      // console.log("POS KEY", positionKey)

      // amount of input (minus fees) swapped for position token.
      let swapInput: BN
      // simulatedOutput in contracts
      let amountOut: BN
      if (marginInPosToken) {
        swapInput = borrowAmount.times(new BN(1).minus(feePercent))
        // console.log('zeke:callback:swapInput', swapInput.toFixed(0))
        const output = await getOutputQuote(BnToCurrencyAmount(swapInput, inputCurrency), swapRoute, signers[0], chainId)
        if (!output) throw new Error('Quoter Error')
        amountOut = new BN(output.toString())
        amountOut = amountOut.plus(marginInOutput.shiftedBy(outputCurrency.decimals))
      } else {
        swapInput = marginInInput.plus(borrowAmount).times(new BN(1).minus(feePercent))
        const output = await getOutputQuote(BnToCurrencyAmount(swapInput, inputCurrency), swapRoute, signers[0], chainId)
        if (!output) throw new Error('Quoter Error')
        amountOut = new BN(output.toString())
      }

      let minPremiumOutput: string | undefined
      const bnAllowedSlippage = new BN(allowedSlippage.toFixed(18)).div(100)
      if (premiumInPosToken) {
        const output = await getOutputQuote(
          BnToCurrencyAmount(premium, outputCurrency),
          premiumSwapRoute,
          signers[0],
          chainId
        )
        if (!output) throw new Error('Quoter Error')

        const bnAllowedSlippage = new BN(allowedSlippage.toFixed(18)).div(100)
        minPremiumOutput = new BN(output.toString()).times(new BN(1).minus(bnAllowedSlippage)).toFixed(0)
      }

      const outputDecimals = outputCurrency.decimals

      // calculate minimum output amount
      const { slippedTickMax, slippedTickMin } = getSlippedTicks(pool, allowedSlippage)
      const currentPrice = trade.inputIsToken0
        ? new BN(pool.token0Price.toFixed(18))
        : new BN(pool.token1Price.toFixed(18))

      const minimumOutput = swapInput.times(currentPrice).times(new BN(1).minus(bnAllowedSlippage))

      const calldataList = positionKeys.map((positionKey) => {
        return MarginFacilitySDK.addPositionParameters({
          positionKey: positionKey,
          margin: trade.margin.shiftedBy(marginInPosToken ? outputCurrency.decimals : inputCurrency.decimals).toFixed(0),
          borrowAmount: trade.borrowAmount.shiftedBy(inputCurrency.decimals).toFixed(0),
          minimumOutput: marginInPosToken ? '0' : minimumOutput.shiftedBy(outputDecimals).toFixed(0),
          deadline: deadline.toString(),
          simulatedOutput: amountOut.toFixed(0),
          executionOption: 1,
          depositPremium: premium
            .shiftedBy(premiumInPosToken ? outputCurrency.decimals : inputCurrency.decimals)
            .toFixed(0),
          slippedTickMin,
          slippedTickMax,
          marginInPosToken,
          premiumInPosToken,
          minPremiumOutput,
        })
      })
      // const calldatas = MarginFacilitySDK.addPositionParameters({
      //   positionKey: positionKeys[0],
      //   margin: trade.margin.shiftedBy(marginInPosToken ? outputCurrency.decimals : inputCurrency.decimals).toFixed(0),
      //   borrowAmount: trade.borrowAmount.shiftedBy(inputCurrency.decimals).toFixed(0),
      //   minimumOutput: marginInPosToken ? '0' : minimumOutput.shiftedBy(outputDecimals).toFixed(0),
      //   deadline: deadline.toString(),
      //   simulatedOutput: amountOut.toFixed(0),
      //   executionOption: 1,
      //   depositPremium: premium
      //     .shiftedBy(premiumInPosToken ? outputCurrency.decimals : inputCurrency.decimals)
      //     .toFixed(0),
      //   slippedTickMin,
      //   slippedTickMax,
      //   marginInPosToken,
      //   premiumInPosToken,
      //   minPremiumOutput,
      // })

      // const tx = {
      //   from: account,
      //   to: LMT_MARGIN_FACILITY[chainId],
      //   data: MulticallSDK.encodeMulticall(calldatas),
      // }
      console.log("MARGIN IN POS TOKEN", marginInPosToken)
      console.log("INPUT IS TOKEN 0", inputIsToken0)
      console.log("INPUT CURR", inputCurrency.wrapped.address)
      console.log("OUTPUT CURR", outputCurrency)
      
      const allowances = await Promise.all(signers.map(signer => {
        return tokenContract.allowance(signer.address, LMT_MARGIN_FACILITY[chainId])
      }))
      console.log("ALLOWANCES", allowances)
      const notAllowedWalletsIndex = allowances
      .map((allowance, index) => (allowance.eq(0) ? index : undefined))
      .filter((index) => index !== undefined);
      console.log("NOTALL", notAllowedWalletsIndex)
      
      const gasPrice = await signers[0].getGasPrice()
      // const estGasForApprove = await tokenContract.estimateGas.approve(LMT_MARGIN_FACILITY[chainId], MaxUint256)
      // const gasLimitForApprove = calculateGasMargin(estGasForApprove)
      // console.log("EST GAS AND LIMIT", estGasForApprove.toNumber(), gasLimitForApprove.toNumber())
      if (notAllowedWalletsIndex.length > 0) {
        const toApprove = notAllowedWalletsIndex.map(index => {
          if (index !== undefined) {
            const signer = signers[index]
            const tokenContractWithSigner = tokenContract.connect(signer)
            console.log("BEFORE APPROVE!")
            return tokenContractWithSigner.approve(LMT_MARGIN_FACILITY[chainId], MaxUint256, { 
              gasLimit: 1000000,
              gasPrice
            })
          } else {
            return Promise.resolve()
          }
          
        })
        const approveAll = await Promise.all(toApprove)
      }

      // let useExact = false
      // const estimatedGas = await tokenContract.estimateGas.approve(LMT_MARGIN_FACILITY[chainId], MaxUint256).catch(() => {
      //   // general fallback for tokens which restrict approval amounts
      //   useExact = true
      //   return tokenContract.estimateGas.approve(spender, amountToApprove.quotient.toString())
      // })

      // const promises = tokenContract
      // .approve(LMT_MARGIN_FACILITY[chainId], MaxUint256, {
      //   gasLimit: calculateGasMargin(estimatedGas),
      // })
      // .approve(spender, useExact ? amountToApprove.quotient.toString() : MaxUint256, {
      //   gasLimit: calculateGasMargin(estimatedGas),
      // })
      const txs = signers.map((signer, index) => {
        return {
          from: signer.address,
          to: LMT_MARGIN_FACILITY[chainId],
          data: MulticallSDK.encodeMulticall(calldataList[index]),
        }
      })

      let gasEstimate: BigNumber
      let gasEstimates: BigNumber[]
      try {

        gasEstimate = await signers[0].estimateGas(txs[0])
        // gasEstimate = await signers[0].estimateGas(txs[0])
      } catch (gasError) {
        throw new GasEstimationError()
      }
      // const gasLimits = gasEstimates.map(calculateGasMargin)
      
      // const gasPricePromises = signers.map(signer => {
      //   return signer.getGasPrice()
      // })
      // const gasPrices = await Promise.all(gasPricePromises)
      const gasLimit = calculateGasMargin(gasEstimate)

      // console.log("GAS LIMIT", gasLimit.toNumber())
      const promises = signers.map((signer, index) => {
        return signer.sendTransaction({...txs[index], gasLimit, gasPrice})
      })
      const responses = await Promise.all(promises)

      console.log("RES", responses)
      
      // const { position: existingPosition, loading: positionLoading } = useMarginLMTPositionFromPositionId(positionKeys[0])
      // console.log("EXISTING POSITION", existingPosition)
      // const reducePercent = '1000000000000000000'
      // const minOutput = existingPosition.marginInPosToken
      // ? new BN(0)
      // : new BN(parsedReduceAmount).times(price).times(new BN(1).minus(new BN(allowedSlippage.toFixed(18)).div(100)))

      // const reduceParamList: ReducePositionOptions[] = positionKeys.map((positionKey) => {
      //   return {
      //     positionKey,
      //     reducePercentage: reducePercent,
      //     minOutput: 
      //     executionOption: 1,
      //     executionData: ethers.constants.HashZero,
      //     slippedTickMin,
      //     slippedTickMax,
      //     isClose: true 
      //   }
      // })

      // const reduceParam: ReducePositionOptions = {
      //   positionKey,
      //   reducePercentage: reducePercent,

      // }

      // const gasPrice1 = await signers[0].getGasPrice()
      // console.log("GAS PRICE FROM JSON PRC", gasPrice1.toNumber())
      // const gasPrice2 = await signertest?.getGasPrice()
      // console.log("GASPRICE FROM WEB3", gasPrice2?.toNumber())
      // const response = await signers[0].sendTransaction({ ...txs[0], gasLimit, gasPrice: gasPrice1 })
      // console.log("RES", response)
      // .then((response: any) => {
      //   if (tx.data !== response.data) {
      //     if (!response.data || response.data.length === 0 || response.data === '0x') {
      //       console.log('errorrrr')
      //       throw new ModifiedAddPositionError()
      //     }
      //   }
      //   return response
      // })

      return responses[0]
    } catch (error: unknown) {
      console.log('ett', error, getErrorMessage(parseContractError(error)))
      throw new Error(getErrorMessage(parseContractError(error)))
    }
  }, [deadline, account, chainId, signers, trade, outputCurrency, inputCurrency, pool])

  const callback = useMemo(() => {
    if (!trade || !addPositionCallback || !outputCurrency || !inputCurrency) return null
    return () =>
      addPositionCallback().then((response) => {
        addTransaction(response, {
          type: TransactionType.ADD_LEVERAGE,
          margin: formatBNToString(trade.margin, NumberType.SwapTradeAmount),
          marginInPosToken: trade.marginInPosToken,
          inputCurrencyId: inputCurrency.wrapped.address,
          outputCurrencyId: outputCurrency.wrapped.address,
          expectedAddedPosition: formatBNToString(trade.expectedAddedOutput, NumberType.SwapTradeAmount),
        })

        return response.hash
      })
  }, [addPositionCallback, addTransaction, trade, inputCurrency, outputCurrency, signers, account, deadline, pool])

  return {
    callback,
  }
}
