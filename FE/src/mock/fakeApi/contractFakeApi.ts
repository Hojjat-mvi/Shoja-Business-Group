import { mock } from '../MockAdapter'
import { contractsData } from '../data/contractData'
import type { Contract, ContractStatusChange } from '@/@types/contract'

// In-memory copy for CRUD operations
let contracts = [...contractsData]

// GET /api/contracts - Get all contracts (filtered by role/permissions)
mock.onGet(/\/api\/contracts$/).reply((config) => {
    // In real implementation, filter based on user role and permissions
    // For now, return all
    return [200, { data: contracts }]
})

// GET /api/contracts/pending - Get pending contracts (Super Admin)
// MUST be before /:id route to avoid matching "pending" as an ID
mock.onGet('/api/contracts/pending').reply(() => {
    const pending = contracts.filter((c) => c.status === 'pending')
    return [200, { data: pending }]
})

// GET /api/contracts/my-contracts?userId=xxx - Get current user's contracts
// MUST be before /:id route to avoid matching "my-contracts" as an ID
mock.onGet('/api/contracts/my-contracts').reply((config) => {
    const userId = config.params?.userId

    const userContracts = contracts.filter((c) => c.agentId === userId)

    return [200, { data: userContracts }]
})

// GET /api/contracts/statistics - Get contract statistics
// MUST be before /:id route to avoid matching "statistics" as an ID
mock.onGet('/api/contracts/statistics').reply(() => {
    const stats = {
        totalContracts: contracts.length,
        pendingContracts: contracts.filter((c) => c.status === 'pending').length,
        approvedContracts: contracts.filter((c) => c.status === 'approved').length,
        rejectedContracts: contracts.filter((c) => c.status === 'rejected').length,
        paidContracts: contracts.filter((c) => c.status === 'paid').length,
        totalValue: contracts.reduce((sum, c) => sum + c.finalPrice, 0),
        totalCommissions: contracts
            .filter((c) => (c.status === 'approved' || c.status === 'paid') && c.commissionAmount !== undefined)
            .reduce((sum, c) => sum + (c.commissionAmount || 0), 0),
    }

    return [200, { data: stats }]
})

// GET /api/contracts/:id - Get single contract
// MUST be AFTER all specific routes to avoid false matches
mock.onGet(/\/api\/contracts\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop()
    const contract = contracts.find((c) => c.id === id)

    if (contract) {
        return [200, { data: contract }]
    }
    return [404, { message: 'Contract not found' }]
})

// POST /api/contracts - Upload new contract
mock.onPost('/api/contracts').reply((config) => {
    const newContract = JSON.parse(config.data) as Omit<Contract, 'id'>

    const id = `contract-${contracts.length + 1}`

    const statusChange: ContractStatusChange = {
        status: 'pending',
        changedBy: newContract.agentId,
        changedByName: newContract.agentName,
        changedAt: new Date().toISOString(),
        notes: 'قرارداد آپلود شد',
    }

    const contractToCreate: Contract = {
        ...newContract,
        id,
        status: 'pending',
        statusHistory: [statusChange],
        uploadedAt: new Date().toISOString(),
    }

    contracts.push(contractToCreate)

    return [
        201,
        { data: contractToCreate, message: 'Contract uploaded successfully' },
    ]
})

// PUT /api/contracts/:id - Update contract (status change, payment, etc.)
mock.onPut(/\/api\/contracts\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop()
    const updates = JSON.parse(config.data)

    const index = contracts.findIndex((c) => c.id === id)

    if (index !== -1) {
        const contract = contracts[index]

        // If status is changing, add to status history
        if (updates.status && updates.status !== contract.status) {
            const statusChange: ContractStatusChange = {
                status: updates.status,
                changedBy: updates.changedBy || 'system',
                changedByName: updates.changedByName || 'System',
                changedAt: new Date().toISOString(),
                notes: updates.statusNotes || '',
            }

            updates.statusHistory = [...contract.statusHistory, statusChange]

            // If approved or rejected, set review fields
            if (updates.status === 'approved' || updates.status === 'rejected') {
                updates.reviewedBy = updates.changedBy
                updates.reviewedByName = updates.changedByName
                updates.reviewedAt = new Date().toISOString()
                updates.reviewNotes = updates.statusNotes

                // If approved, handle commission entry
                if (updates.status === 'approved' && updates.commissionAmount !== undefined) {
                    updates.commissionAmount = updates.commissionAmount
                    updates.commissionNotes = updates.commissionNotes || ''
                    updates.commissionEnteredBy = updates.changedBy
                    updates.commissionEnteredByName = updates.changedByName
                    updates.commissionEnteredAt = new Date().toISOString()
                }
            }

            // If paid, set payment fields
            if (updates.status === 'paid') {
                updates.paidAt = new Date().toISOString()
                if (updates.paymentReference) {
                    updates.paymentReference = updates.paymentReference
                }
            }
        }

        contracts[index] = { ...contract, ...updates }

        return [200, { data: contracts[index], message: 'Contract updated' }]
    }

    return [404, { message: 'Contract not found' }]
})

// GET /api/contracts/commissions/:userId - Get commission summaries
mock.onGet(/\/api\/contracts\/commissions\/[^/]+$/).reply((config) => {
    const userId = config.url?.split('/').pop()

    // Get commissions for user's contracts (only paid contracts for agents)
    const userContracts = contracts.filter(
        (c) => c.agentId === userId && c.status === 'paid' && c.commissionAmount !== undefined
    )

    const commissions = userContracts.map((contract) => {
        // Use manually entered commission amount
        const agentCommission = contract.commissionAmount || 0

        return {
            contractId: contract.id,
            agentId: contract.agentId,
            agentName: contract.agentName,
            agentCommission,
            totalCommission: agentCommission,
            contractFinalPrice: contract.finalPrice,
            calculatedAt: new Date().toISOString(),
        }
    })

    return [200, { data: commissions }]
})
