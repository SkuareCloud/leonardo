import { persist } from "zustand/middleware"
import { createStore } from "zustand/vanilla"

export type OperatorState = {
  operatorSlot: number
  maxSlots: number
}

export type OperatorActions = {
  setOperatorSlot: (operatorSlot: number) => void
  setMaxSlots: (maxSlots: number) => void
}

export type OperatorStore = OperatorState & OperatorActions

export const defaultInitState: OperatorState = {
  operatorSlot: 1,
  maxSlots: 1,
}

export const createOperatorStore = (initState: OperatorState = defaultInitState) => {
  return createStore<OperatorStore>()(
    persist(
      (set) => ({
        ...initState,
        setOperatorSlot: (operatorSlot: number) => set(() => ({ operatorSlot })),
        setMaxSlots: (maxSlots: number) => set(() => ({ maxSlots })),
      }),
      {
        name: "operator-store", // unique name for localStorage key
        partialize: (state) => ({
          operatorSlot: state.operatorSlot,
          maxSlots: state.maxSlots,
        }), // only persist these fields
      }
    )
  )
}
