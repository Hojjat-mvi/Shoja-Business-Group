import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, UserWithTeam, HierarchyNode } from '@/@types/user'
import type { UserApprovalRequest } from '@/@types/notification'
import {
    apiGetUsers,
    apiGetUserById,
    apiCreateUser,
    apiUpdateUser,
    apiDeleteUser,
    apiGetUserTeam,
    apiGetUserHierarchy,
    apiGetPendingApprovals,
    apiApproveUser,
} from '@/services/UserService'

type UserState = {
    users: User[]
    currentUserTeam: UserWithTeam | null
    hierarchyTree: HierarchyNode | null
    selectedUser: User | null
    pendingApprovals: UserApprovalRequest[]
    lastFetch: number | null
}

type UserAction = {
    setUsers: (users: User[]) => void
    setCurrentUserTeam: (team: UserWithTeam | null) => void
    setHierarchyTree: (tree: HierarchyNode | null) => void
    setSelectedUser: (user: User | null) => void
    addUser: (user: User) => void
    updateUser: (userId: string, updates: Partial<User>) => void
    removeUser: (userId: string) => void
    clearUserData: () => void

    // API methods
    fetchUsers: () => Promise<void>
    fetchUserById: (userId: string) => Promise<void>
    fetchUserTeam: (userId: string) => Promise<void>
    fetchUserHierarchy: (userId: string) => Promise<void>
    fetchPendingApprovals: () => Promise<void>
    createUser: (userData: Partial<User>) => Promise<void>
    deleteUser: (userId: string) => Promise<void>
    approveUserRequest: (
        requestId: string,
        status: 'approved' | 'rejected',
        reviewedBy: string,
        reviewedByName: string,
        reviewNotes?: string
    ) => Promise<void>
}

const initialState: UserState = {
    users: [],
    currentUserTeam: null,
    hierarchyTree: null,
    selectedUser: null,
    pendingApprovals: [],
    lastFetch: null,
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useUserStore = create<UserState & UserAction>()(
    persist(
        (set, get) => ({
            ...initialState,

            setUsers: (users) =>
                set(() => ({
                    users,
                    lastFetch: Date.now(),
                })),

            setCurrentUserTeam: (team) =>
                set(() => ({
                    currentUserTeam: team,
                })),

            setHierarchyTree: (tree) =>
                set(() => ({
                    hierarchyTree: tree,
                })),

            setSelectedUser: (user) =>
                set(() => ({
                    selectedUser: user,
                })),

            addUser: (user) =>
                set((state) => ({
                    users: [...state.users, user],
                })),

            updateUser: (userId, updates) =>
                set((state) => ({
                    users: state.users.map((user) =>
                        user.id === userId ? { ...user, ...updates } : user
                    ),
                    selectedUser:
                        state.selectedUser?.id === userId
                            ? { ...state.selectedUser, ...updates }
                            : state.selectedUser,
                })),

            removeUser: (userId) =>
                set((state) => ({
                    users: state.users.filter((user) => user.id !== userId),
                    selectedUser:
                        state.selectedUser?.id === userId ? null : state.selectedUser,
                })),

            clearUserData: () => set(initialState),

            // API methods
            fetchUsers: async () => {
                const state = get()
                const now = Date.now()

                // Use cached data if it's fresh enough
                if (state.lastFetch && now - state.lastFetch < CACHE_DURATION && state.users.length > 0) {
                    return
                }

                const response = await apiGetUsers()
                if (response.data) {
                    set({ users: response.data, lastFetch: now })
                }
            },

            fetchUserById: async (userId: string) => {
                const response = await apiGetUserById(userId)
                if (response.data) {
                    set({ selectedUser: response.data })
                }
            },

            fetchUserTeam: async (userId: string) => {
                const response = await apiGetUserTeam(userId)
                if (response.data) {
                    set({ currentUserTeam: response.data })
                }
            },

            fetchUserHierarchy: async (userId: string) => {
                const response = await apiGetUserHierarchy(userId)
                if (response.data) {
                    set({ hierarchyTree: response.data })
                }
            },

            fetchPendingApprovals: async () => {
                const response = await apiGetPendingApprovals()
                if (response.data) {
                    set({ pendingApprovals: response.data })
                }
            },

            createUser: async (userData: Partial<User>) => {
                const response = await apiCreateUser(userData)
                if (response.data) {
                    set((state) => ({
                        users: [...state.users, response.data],
                    }))
                }
            },

            deleteUser: async (userId: string) => {
                await apiDeleteUser(userId)
                set((state) => ({
                    users: state.users.filter((user) => user.id !== userId),
                    selectedUser:
                        state.selectedUser?.id === userId ? null : state.selectedUser,
                }))
            },

            approveUserRequest: async (
                requestId: string,
                status: 'approved' | 'rejected',
                reviewedBy: string,
                reviewedByName: string,
                reviewNotes?: string
            ) => {
                await apiApproveUser(
                    requestId,
                    status,
                    reviewedBy,
                    reviewedByName,
                    reviewNotes
                )
                // Refresh both pending approvals and users list after approval/rejection
                const [approvalsResponse, usersResponse] = await Promise.all([
                    apiGetPendingApprovals(),
                    apiGetUsers()
                ])

                if (approvalsResponse.data) {
                    set({ pendingApprovals: approvalsResponse.data })
                }
                if (usersResponse.data) {
                    set({
                        users: usersResponse.data,
                        lastFetch: Date.now()
                    })
                }
            },
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)
