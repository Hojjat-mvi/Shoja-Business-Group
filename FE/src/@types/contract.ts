export type ContractStatus = 'pending' | 'approved' | 'rejected' | 'paid'

export interface ContractStatusChange {
    status: ContractStatus
    changedBy: string
    changedByName: string
    changedAt: string
    notes?: string
}

export interface Contract {
    id: string

    // Agent information
    agentId: string
    agentName: string
    agentRole: string

    // Property reference (optional - contract may exist without property in system)
    propertyId?: string
    propertyTitle?: string

    // Customer information
    customerName: string
    customerPhone?: string
    customerEmail?: string
    customerNationalId?: string

    // Seller information
    sellerName: string
    sellerPhone?: string

    // Financial information
    finalPrice: number

    // Commission information (entered manually by Super Admin/Managers during approval)
    commissionAmount?: number  // Manually entered commission amount
    commissionNotes?: string   // Optional notes about commission amount
    commissionEnteredBy?: string // User ID who entered the commission
    commissionEnteredByName?: string // User name who entered the commission
    commissionEnteredAt?: string // When commission was entered

    // Date information
    contractDate: string
    settlementDate?: string

    // Contract document (REQUIRED)
    contractDocument: string
    uploadedAt: string

    // Status workflow
    status: ContractStatus
    statusHistory: ContractStatusChange[]

    // Review information (Super Admin)
    reviewedBy?: string
    reviewedByName?: string
    reviewedAt?: string
    reviewNotes?: string

    // Payment information
    paidAt?: string
    paymentReference?: string
}

export interface CommissionSummary {
    contractId: string
    agentId: string
    agentName: string
    agentCommission: number
    salesManagerId?: string
    salesManagerName?: string
    salesManagerCommission?: number
    educationManagerId?: string
    educationManagerName?: string
    educationManagerCommission?: number
    totalCommission: number
    contractFinalPrice: number
    calculatedAt: string
}

export interface ContractStatistics {
    totalContracts: number
    pendingContracts: number
    approvedContracts: number
    rejectedContracts: number
    paidContracts: number
    totalValue: number
    totalCommissions: number
    byAgent: {
        [agentId: string]: {
            agentName: string
            count: number
            totalValue: number
        }
    }
}
