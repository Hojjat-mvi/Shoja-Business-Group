import ApiService from './ApiService'
import type {
    Contract,
    ContractStatus,
    CommissionSummary,
    ContractStatistics,
} from '@/@types/contract'

// Get all contracts (filtered by role/permissions on backend)
export async function apiGetContracts() {
    return ApiService.fetchDataWithAxios<{ data: Contract[] }>({
        url: '/api/contracts',
        method: 'get',
    })
}

// Get single contract by ID
export async function apiGetContractById(contractId: string) {
    return ApiService.fetchDataWithAxios<{ data: Contract }>({
        url: `/api/contracts/${contractId}`,
        method: 'get',
    })
}

// Get current user's contracts
export async function apiGetMyContracts(userId: string) {
    return ApiService.fetchDataWithAxios<{ data: Contract[] }>({
        url: '/api/contracts/my-contracts',
        method: 'get',
        params: { userId },
    })
}

// Get pending contracts (Super Admin review)
export async function apiGetPendingContracts() {
    return ApiService.fetchDataWithAxios<{ data: Contract[] }>({
        url: '/api/contracts/pending',
        method: 'get',
    })
}

// Upload new contract
export async function apiUploadContract(contractData: Partial<Contract>) {
    return ApiService.fetchDataWithAxios<{ data: Contract; message: string }>({
        url: '/api/contracts',
        method: 'post',
        data: contractData,
    })
}

// Update contract (generic - can update any field)
export async function apiUpdateContract(
    contractId: string,
    updates: Partial<Contract>
) {
    return ApiService.fetchDataWithAxios<{ data: Contract; message: string }>({
        url: `/api/contracts/${contractId}`,
        method: 'put',
        data: updates,
    })
}

// Update contract status (approve/reject/pay)
export async function apiUpdateContractStatus(
    contractId: string,
    status: ContractStatus,
    changedBy: string,
    changedByName: string,
    statusNotes?: string,
    commissionAmount?: number,
    commissionNotes?: string,
    paymentReference?: string
) {
    return ApiService.fetchDataWithAxios<{ data: Contract; message: string }>({
        url: `/api/contracts/${contractId}`,
        method: 'put',
        data: {
            status,
            changedBy,
            changedByName,
            statusNotes,
            commissionAmount,
            commissionNotes,
            paymentReference,
        },
    })
}

// Get commission summaries for a user
export async function apiGetCommissions(userId: string) {
    return ApiService.fetchDataWithAxios<{ data: CommissionSummary[] }>({
        url: `/api/contracts/commissions/${userId}`,
        method: 'get',
    })
}

// Get contract statistics
export async function apiGetContractStatistics() {
    return ApiService.fetchDataWithAxios<{ data: ContractStatistics }>({
        url: '/api/contracts/statistics',
        method: 'get',
    })
}
