import type { UserRole } from '@/constants/roles.constant'

export type UserStatus = 'active' | 'pending_approval' | 'inactive'
export type MaritalStatus = 'single' | 'married'

export interface User {
    id: string
    email: string
    userName: string
    avatar: string
    role: UserRole
    managerId?: string | null
    managerName?: string
    phone: string
    nationalId: string
    homeAddress?: string
    maritalStatus?: MaritalStatus
    description?: string
    status: UserStatus
    createdAt: string
    createdBy?: string
}

export interface UserWithTeam extends User {
    subordinates: User[]
    subordinateCount: number
}

export interface HierarchyNode {
    user: User
    children: HierarchyNode[]
    level: number
}

export interface TeamPerformance {
    userId: string
    userName: string
    role: UserRole
    totalSales: number
    totalCommission: number
    activeProperties: number
    completedContracts: number
    pendingContracts: number
    subordinateCount: number
    period: {
        startDate: string
        endDate: string
    }
}

export interface UserStatistics {
    totalUsers: number
    activeUsers: number
    pendingApproval: number
    byRole: {
        [key: string]: number
    }
}
