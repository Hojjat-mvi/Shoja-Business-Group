import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Contract, ContractStatus, CommissionSummary } from '@/@types/contract'
import {
    apiGetContracts,
    apiGetMyContracts,
    apiGetPendingContracts,
    apiUploadContract,
    apiUpdateContractStatus,
    apiGetCommissions,
} from '@/services/ContractService'

type ContractState = {
    contracts: Contract[]
    myContracts: Contract[]
    pendingContracts: Contract[]
    commissionSummaries: CommissionSummary[]
    selectedContract: Contract | null
    lastFetch: number | null
}

type ContractAction = {
    setContracts: (contracts: Contract[]) => void
    setMyContracts: (contracts: Contract[]) => void
    setPendingContracts: (contracts: Contract[]) => void
    setCommissionSummaries: (summaries: CommissionSummary[]) => void
    addContract: (contract: Contract) => void
    updateContract: (contractId: string, updates: Partial<Contract>) => void
    setSelectedContract: (contract: Contract | null) => void
    clearContractData: () => void

    // API methods
    fetchContracts: () => Promise<void>
    fetchMyContracts: (userId: string) => Promise<void>
    fetchPendingContracts: () => Promise<void>
    fetchCommissions: (userId: string) => Promise<void>
    uploadContract: (contractData: Partial<Contract>) => Promise<void>
    updateContractStatusAction: (
        contractId: string,
        status: ContractStatus,
        changedBy: string,
        changedByName: string,
        statusNotes?: string,
        commissionAmount?: number,
        commissionNotes?: string,
        paymentReference?: string
    ) => Promise<void>
}

const initialState: ContractState = {
    contracts: [],
    myContracts: [],
    pendingContracts: [],
    commissionSummaries: [],
    selectedContract: null,
    lastFetch: null,
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useContractStore = create<ContractState & ContractAction>()(
    persist(
        (set, get) => ({
            ...initialState,

            setContracts: (contracts) =>
                set(() => ({
                    contracts,
                    lastFetch: Date.now(),
                })),

            setMyContracts: (contracts) =>
                set(() => ({
                    myContracts: contracts,
                })),

            setPendingContracts: (contracts) =>
                set(() => ({
                    pendingContracts: contracts,
                })),

            setCommissionSummaries: (summaries) =>
                set(() => ({
                    commissionSummaries: summaries,
                })),

            addContract: (contract) =>
                set((state) => ({
                    contracts: [...state.contracts, contract],
                    myContracts: [...state.myContracts, contract],
                })),

            updateContract: (contractId, updates) =>
                set((state) => ({
                    contracts: state.contracts.map((contract) =>
                        contract.id === contractId
                            ? { ...contract, ...updates }
                            : contract
                    ),
                    myContracts: state.myContracts.map((contract) =>
                        contract.id === contractId
                            ? { ...contract, ...updates }
                            : contract
                    ),
                    pendingContracts: state.pendingContracts.map((contract) =>
                        contract.id === contractId
                            ? { ...contract, ...updates }
                            : contract
                    ),
                    selectedContract:
                        state.selectedContract?.id === contractId
                            ? { ...state.selectedContract, ...updates }
                            : state.selectedContract,
                })),

            setSelectedContract: (contract) =>
                set(() => ({
                    selectedContract: contract,
                })),

            clearContractData: () => set(initialState),

            // API methods
            fetchContracts: async () => {
                const state = get()
                const now = Date.now()

                // Use cached data if it's fresh enough
                if (state.lastFetch && now - state.lastFetch < CACHE_DURATION && state.contracts.length > 0) {
                    return
                }

                const response = await apiGetContracts()
                if (response.data) {
                    set({ contracts: response.data, lastFetch: now })
                }
            },

            fetchMyContracts: async (userId: string) => {
                const response = await apiGetMyContracts(userId)
                if (response.data) {
                    set({ myContracts: response.data })
                }
            },

            fetchPendingContracts: async () => {
                const response = await apiGetPendingContracts()
                if (response.data) {
                    set({ pendingContracts: response.data })
                }
            },

            fetchCommissions: async (userId: string) => {
                const response = await apiGetCommissions(userId)
                if (response.data) {
                    set({ commissionSummaries: response.data })
                }
            },

            uploadContract: async (contractData: Partial<Contract>) => {
                const response = await apiUploadContract(contractData)
                if (response.data) {
                    set((state) => ({
                        contracts: [...state.contracts, response.data],
                        myContracts: [...state.myContracts, response.data],
                    }))
                }
            },

            updateContractStatusAction: async (
                contractId: string,
                status: ContractStatus,
                changedBy: string,
                changedByName: string,
                statusNotes?: string,
                commissionAmount?: number,
                commissionNotes?: string,
                paymentReference?: string
            ) => {
                const response = await apiUpdateContractStatus(
                    contractId,
                    status,
                    changedBy,
                    changedByName,
                    statusNotes,
                    commissionAmount,
                    commissionNotes,
                    paymentReference
                )
                if (response.data) {
                    set((state) => ({
                        contracts: state.contracts.map((c) =>
                            c.id === contractId ? response.data : c
                        ),
                        myContracts: state.myContracts.map((c) =>
                            c.id === contractId ? response.data : c
                        ),
                        pendingContracts: state.pendingContracts.map((c) =>
                            c.id === contractId ? response.data : c
                        ),
                    }))
                }
            },
        }),
        {
            name: 'contract-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)
