import { createReducer } from "@reduxjs/toolkit";
import { getPoolId } from "components/PositionTable/LeveragePositionTable/TokenRow";
import { RawPoolKey } from "types/lmtv2position";

import {
  ActiveSwapTab,
  Field,
  replaceSwapState,
  selectCurrency,
  selectPool,
  setActiveTab,
  // setBorrowManagerAddress,
  // setHideClosedLeveragePositions,
  setLeverage,
  setLeverageFactor,
  setLTV,
  // setPremium,
  setRecipient,
  switchCurrencies,
  typeInput,
} from "./actions";
import { getInitialSwapState } from "./hooks";

export interface SwapState {
  readonly independentField: Field;
  readonly typedValue: string;
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined | null;
  };
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined | null;
  };
  // token0-token1-fee
  readonly poolId: string | undefined | null;
  readonly poolKey: RawPoolKey | undefined | null;

  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null;
  readonly leverageFactor: string | null;
  readonly leverage: boolean;
  readonly activeTab: ActiveSwapTab;
  readonly ltv: string | undefined | null;
}

const initialState: SwapState = getInitialSwapState();

export default createReducer<SwapState>(initialState, (builder) =>
  builder
    .addCase(
      replaceSwapState,
      (
        state,
        {
          payload: {
            typedValue,
            recipient,
            field,
            inputCurrencyId,
            outputCurrencyId,
            leverage,
            leverageFactor,
            activeTab,
            ltv,
            poolKey,
          },
        }
      ) => {
        return {
          [Field.INPUT]: {
            currencyId: inputCurrencyId ?? null,
          },
          [Field.OUTPUT]: {
            currencyId: outputCurrencyId ?? null,
          },
          independentField: field,
          typedValue: "",
          recipient,
          leverageFactor: leverageFactor ?? null,
          leverage,
          activeTab,
          ltv: ltv ?? null,
          poolKey,
          poolId: null,
        };
      }
    )
    .addCase(
      selectPool,
      (state, { payload: { inputCurrencyId, outputCurrencyId, poolKey } }) => {
        let _inputCurrencyId = inputCurrencyId;
        let _outputCurrencyId = outputCurrencyId;
        if (
          inputCurrencyId.toLocaleLowerCase() ===
          "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1".toLocaleLowerCase()
        ) {
          if (
            outputCurrencyId.toLocaleLowerCase() ===
              "0xaf88d065e77c8cC2239327C5EDb3A432268e5831".toLocaleLowerCase() ||
            outputCurrencyId.toLocaleLowerCase() ===
              "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f".toLocaleLowerCase()
          ) {
            _inputCurrencyId = outputCurrencyId;
            _outputCurrencyId = inputCurrencyId;
          }
        }
        if (
          outputCurrencyId.toLocaleLowerCase() ===
          "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1".toLocaleLowerCase()
        ) {
          if (
            inputCurrencyId.toLocaleLowerCase() ===
              "0xaf88d065e77c8cC2239327C5EDb3A432268e5831".toLocaleLowerCase() ||
            inputCurrencyId.toLocaleLowerCase() ===
              "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f".toLocaleLowerCase()
          ) {
            _inputCurrencyId = inputCurrencyId;
            _outputCurrencyId = outputCurrencyId;
          } else {
            _inputCurrencyId = outputCurrencyId;
            _outputCurrencyId = inputCurrencyId;
          }
        }
        if (
          outputCurrencyId.toLocaleLowerCase() ===
          "0xaf88d065e77c8cC2239327C5EDb3A432268e5831".toLocaleLowerCase()
        ) {
          _inputCurrencyId = outputCurrencyId;
          _outputCurrencyId = inputCurrencyId;
        }

        return {
          ...state,
          [Field.INPUT]: { currencyId: _inputCurrencyId },
          [Field.OUTPUT]: { currencyId: _outputCurrencyId },
          poolId: getPoolId(poolKey.token0, poolKey.token1, poolKey.fee),
          poolKey,
        };
      }
    )
    .addCase(selectCurrency, (state, { payload: { field, currencyId } }) => {
      console.log("SELECT CURRENCY")
      console.log(currencyId)
      return {
        ...state,
        // [field]:
        //   field === Field.INPUT
        //     ? { currencyId: state[Field.INPUT].currencyId }
        //     : { currencyId: state[Field.OUTPUT].currencyId },
        [field]: { currencyId },
      };
    })
    .addCase(switchCurrencies, (state, { payload: { leverage } }) => {
      return {
        ...state,
        independentField: !leverage
          ? state.independentField === Field.INPUT
            ? Field.OUTPUT
            : Field.INPUT
          : Field.INPUT,
        typedValue: "",
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
      };
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue,
      };
    })
    .addCase(setLeverage, (state, { payload: { leverage } }) => ({
      ...state,
      leverage,
    }))
    .addCase(setLeverageFactor, (state, { payload: { leverageFactor } }) => {
      return {
        ...state,
        leverageFactor,
      };
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient;
    })
    .addCase(setActiveTab, (state, { payload: { activeTab } }) => {
      if (
        state.activeTab === ActiveSwapTab.LONG ||
        state.activeTab === ActiveSwapTab.SHORT
      ) {
        if (
          activeTab === ActiveSwapTab.LONG ||
          activeTab === ActiveSwapTab.SHORT
        ) {
          if (activeTab != state.activeTab) {
            return {
              ...state,
              activeTab,
              typedValue: "",
              independentField: Field.INPUT,
              [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
              [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
            };
          }
        }
      }
      if (activeTab === ActiveSwapTab.SWAP && state.poolKey) {
        return {
          ...state,
          activeTab,
          typedValue: "",
          independentField: Field.INPUT,
          [Field.INPUT]: { currencyId: state.poolKey.token1 },
          [Field.OUTPUT]: { currencyId: state.poolKey.token0 },
        };
      }
      return {
        ...state,
        activeTab,
      };
    })
    .addCase(setLTV, (state, { payload: { ltv } }) => ({
      ...state,
      ltv,
    }))
);
