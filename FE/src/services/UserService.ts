import ApiService from './ApiService'
import type { User, UserWithTeam, HierarchyNode } from '@/@types/user'
import type { UserApprovalRequest } from '@/@types/notification'

// Get all users
export async function apiGetUsers() {
    return ApiService.fetchDataWithAxios<{ data: User[] }>({
        url: '/api/users',
        method: 'get',
    })
}

// Get single user by ID
export async function apiGetUserById(userId: string) {
    return ApiService.fetchDataWithAxios<{ data: User }>({
        url: `/api/users/${userId}`,
        method: 'get',
    })
}

// Get user's direct team (subordinates)
export async function apiGetUserTeam(userId: string) {
    return ApiService.fetchDataWithAxios<{ data: UserWithTeam }>({
        url: `/api/users/team/${userId}`,
        method: 'get',
    })
}

// Get full hierarchy tree for a user
export async function apiGetUserHierarchy(userId: string) {
    return ApiService.fetchDataWithAxios<{ data: HierarchyNode }>({
        url: `/api/users/hierarchy/${userId}`,
        method: 'get',
    })
}

// Create new user (requires approval)
export async function apiCreateUser(userData: Partial<User>) {
    return ApiService.fetchDataWithAxios<{ data: User; message: string }>({
        url: '/api/users',
        method: 'post',
        data: userData,
    })
}

// Update user
export async function apiUpdateUser(userId: string, updates: Partial<User>) {
    return ApiService.fetchDataWithAxios<{ data: User; message: string }>({
        url: `/api/users/${userId}`,
        method: 'put',
        data: updates,
    })
}

// Delete user (Super Admin only)
export async function apiDeleteUser(userId: string) {
    return ApiService.fetchDataWithAxios<{ message: string }>({
        url: `/api/users/${userId}`,
        method: 'delete',
    })
}

// Get pending user approvals (Super Admin)
export async function apiGetPendingApprovals() {
    return ApiService.fetchDataWithAxios<{ data: UserApprovalRequest[] }>({
        url: '/api/users/pending-approvals',
        method: 'get',
    })
}

// Approve or reject user
export async function apiApproveUser(
    requestId: string,
    status: 'approved' | 'rejected',
    reviewedBy: string,
    reviewedByName: string,
    reviewNotes?: string
) {
    return ApiService.fetchDataWithAxios<{
        data: UserApprovalRequest
        message: string
    }>({
        url: `/api/approvals/${requestId}`,
        method: 'put',
        data: {
            status,
            reviewedBy,
            reviewedByName,
            reviewNotes,
        },
    })
}
