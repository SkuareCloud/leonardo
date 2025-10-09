// src/providers/counter-store-provider.tsx
"use client"

import { type ReactNode, createContext, useContext, useRef } from "react"
import { useStore } from "zustand"
import { type OperatorStore, createOperatorStore } from "./store"

export type OperatorStoreApi = ReturnType<typeof createOperatorStore>

export const OperatorStoreContext = createContext<OperatorStoreApi | undefined>(undefined)

export interface OperatorStoreProviderProps {
    children: ReactNode
}

export const OperatorStoreProvider = ({ children }: OperatorStoreProviderProps) => {
    const storeRef = useRef<OperatorStoreApi | null>(null)
    if (storeRef.current === null) {
        storeRef.current = createOperatorStore()
    }

    return (
        <OperatorStoreContext.Provider value={storeRef.current}>
            {children}
        </OperatorStoreContext.Provider>
    )
}

export const useOperatorStore = <T,>(selector: (store: OperatorStore) => T): T => {
    const operatorStoreContext = useContext(OperatorStoreContext)

    if (!operatorStoreContext) {
        throw new Error(`useOperatorStore must be used within OperatorStoreProvider`)
    }

    return useStore(operatorStoreContext, selector)
}
