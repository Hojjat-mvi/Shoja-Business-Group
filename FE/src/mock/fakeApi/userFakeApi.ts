import { mock } from '../MockAdapter'
import { usersData } from '../data/userData'
import { userApprovalRequestsData } from '../data/notificationData'
import type { User } from '@/@types/user'

// In-memory copy for CRUD operations
let users = [...usersData]
let approvalRequests = [...userApprovalRequestsData]

// GET /api/users - Get all users (Super Admin only)
mock.onGet(/\/api\/users$/).reply(() => {
    return [200, { data: users }]
})

// GET /api/users/pending-approvals - Get pending user approvals (must be before /:id route)
mock.onGet('/api/users/pending-approvals').reply(() => {
    const pending = approvalRequests.filter((r) => r.status === 'pending')
    return [200, { data: pending }]
})

// GET /api/users/:id - Get single user
mock.onGet(/\/api\/users\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop()
    const user = users.find((u) => u.id === id)

    if (user) {
        return [200, { data: user }]
    }
    return [404, { message: 'User not found' }]
})

// GET /api/users/team/:userId - Get user's direct subordinates
mock.onGet(/\/api\/users\/team\/[^/]+$/).reply((config) => {
    const userId = config.url?.split('/').pop()

    const subordinates = users.filter((u) => u.managerId === userId)

    const user = users.find((u) => u.id === userId)

    if (user) {
        return [
            200,
            {
                data: {
                    ...user,
                    subordinates,
                    subordinateCount: subordinates.length,
                },
            },
        ]
    }

    return [404, { message: 'User not found' }]
})

// GET /api/users/hierarchy/:userId - Get full hierarchy tree
mock.onGet(/\/api\/users\/hierarchy\/[^/]+$/).reply((config) => {
    const userId = config.url?.split('/').pop()

    const buildHierarchy = (parentId: string, level: number): any => {
        const user = users.find((u) => u.id === parentId)
        if (!user) return null

        const children = users
            .filter((u) => u.managerId === parentId)
            .map((child) => buildHierarchy(child.id, level + 1))
            .filter((c) => c !== null)

        return {
            user,
            children,
            level,
        }
    }

    const hierarchy = buildHierarchy(userId!, 0)

    if (hierarchy) {
        return [200, { data: hierarchy }]
    }

    return [404, { message: 'User not found' }]
})

// POST /api/users - Create new user (triggers approval workflow)
mock.onPost('/api/users').reply((config) => {
    const newUser = JSON.parse(config.data) as User

    // Generate ID
    const id = `user-${users.length + 1}`

    const userToCreate: User = {
        ...newUser,
        id,
        status: 'pending_approval',
        createdAt: new Date().toISOString(),
    }

    users.push(userToCreate)

    // Create approval request
    const approvalRequest = {
        id: `approval-${approvalRequests.length + 1}`,
        requestedUserId: id,
        requestedUserName: newUser.userName,
        requestedUserEmail: newUser.email,
        requestedUserRole: newUser.role,
        requestedByManagerId: newUser.createdBy || '',
        requestedByManagerName:
            users.find((u) => u.id === newUser.createdBy)?.userName || '',
        requestedByManagerRole:
            users.find((u) => u.id === newUser.createdBy)?.role || 'agent',
        status: 'pending' as const,
        requestedAt: new Date().toISOString(),
    }

    approvalRequests.push(approvalRequest)

    return [201, { data: userToCreate, message: 'User created, pending approval' }]
})

// PUT /api/users/:id - Update user
mock.onPut(/\/api\/users\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop()
    const updates = JSON.parse(config.data)

    const index = users.findIndex((u) => u.id === id)

    if (index !== -1) {
        users[index] = { ...users[index], ...updates }
        return [200, { data: users[index], message: 'User updated' }]
    }

    return [404, { message: 'User not found' }]
})

// DELETE /api/users/:id - Delete user (Super Admin only)
mock.onDelete(/\/api\/users\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop()

    const index = users.findIndex((u) => u.id === id)

    if (index !== -1) {
        users.splice(index, 1)
        return [200, { message: 'User deleted' }]
    }

    return [404, { message: 'User not found' }]
})

// PUT /api/approvals/:id - Approve/reject user
mock.onPut(/\/api\/approvals\/[^/]+$/).reply((config) => {
    const id = config.url?.split('/').pop()
    const { status, reviewNotes, reviewedBy, reviewedByName } = JSON.parse(
        config.data
    )

    const requestIndex = approvalRequests.findIndex((r) => r.id === id)

    if (requestIndex !== -1) {
        const request = approvalRequests[requestIndex]

        // Update approval request
        approvalRequests[requestIndex] = {
            ...request,
            status,
            reviewNotes,
            reviewedBy,
            reviewedByName,
            reviewedAt: new Date().toISOString(),
        }

        // Update user status
        const userIndex = users.findIndex((u) => u.id === request.requestedUserId)
        if (userIndex !== -1) {
            users[userIndex].status = status === 'approved' ? 'active' : 'inactive'
        }

        return [
            200,
            {
                data: approvalRequests[requestIndex],
                message: `User ${status}`,
            },
        ]
    }

    return [404, { message: 'Approval request not found' }]
})
