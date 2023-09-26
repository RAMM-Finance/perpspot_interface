import { createStore, Store } from 'redux'

import { ActiveSwapTab, Field, selectCurrency } from './actions'
import reducer, { SwapState } from './reducer'

describe('swap reducer', () => {
  let store: Store<SwapState>

  beforeEach(() => {
    store = createStore(reducer, {
      [Field.OUTPUT]: { currencyId: '' },
      [Field.INPUT]: { currencyId: '' },
      typedValue: '',
      independentField: Field.INPUT,
      recipient: null,
      leverageFactor: null,
      hideClosedLeveragePositions: false,
      leverage: false,
      leverageManagerAddress: null,
      activeTab: ActiveSwapTab.BORROW,
      ltv: null,
      borrowManagerAddress: null,
      premium: null,
      tab: 'Long',
      originInputId: null,
      originOutputId: null,
    })
  })

  describe('selectToken', () => {
    it('changes token', () => {
      store.dispatch(
        selectCurrency({
          field: Field.OUTPUT,
          currencyId: '0x0000',
        })
      )

      expect(store.getState()).toEqual({
        [Field.OUTPUT]: { currencyId: '0x0000' },
        [Field.INPUT]: { currencyId: '' },
        typedValue: '',
        independentField: Field.INPUT,
        recipient: null,
      })
    })
  })
})
