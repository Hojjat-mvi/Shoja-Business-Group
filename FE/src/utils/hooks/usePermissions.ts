import { useMemo } from 'react'
import { useSessionUser } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import type { User } from '@/@types/user'
import type { Contract } from '@/@types/contract'
import type { Property } from '@/@types/property'
import {
    SUPER_ADMIN,
    EDUCATION_MANAGER,
    SALES_MANAGER,
    AGENT,
} from '@/constants/roles.constant'
import * as permissions from '../permissions'

/**
 * Custom hook for checking permissions in React components
 * Provides convenient access to all permission checks with current user context
 */
export function usePermissions() {
    const currentUser = useSessionUser((state) => state.user)
    const allUsers = useUserStore((state) => state.users)

    // Convert auth user to User type with required fields
    const user: User = useMemo(
        () => ({
            id: currentUser.userId || '',
            email: currentUser.email || '',
            userName: currentUser.userName || '',
            avatar: currentUser.avatar || '',
            role: currentUser.role || AGENT,
            managerId: currentUser.managerId,
            managerName: currentUser.managerName,
            phone: currentUser.phone,
            status: currentUser.status || 'active',
            createdAt: new Date().toISOString(),
        }),
        [currentUser]
    )

    return useMemo(
        () => ({
            // Current user info
            currentUser: user,

            // Role checks
            isSuperAdmin: user.role === SUPER_ADMIN,
            isEducationManager: user.role === EDUCATION_MANAGER,
            isSalesManager: user.role === SALES_MANAGER,
            isAgent: user.role === AGENT,
            isManager: permissions.isManager(user),
            isAdmin: permissions.isAdmin(user),

            // User permissions
            canViewUser: (targetUser: User) =>
                permissions.canViewUser(user, targetUser),
            canEditUser: (targetUser: User) =>
                permissions.canEditUser(user, targetUser),
            canDeleteUser: (targetUser: User) =>
                permissions.canDeleteUser(user, targetUser),
            canApproveUser: () => permissions.canApproveUser(user),
            canCreateUserWithRole: (newUserRole: string) =>
                permissions.canCreateUserWithRole(
                    user,
                    newUserRole as any
                ),

            // Contract permissions
            canViewContract: (contract: Contract) =>
                permissions.canViewContract(user, contract, allUsers),
            canEditContract: (contract: Contract) =>
                permissions.canEditContract(user, contract),
            canReviewContract: () => permissions.canReviewContract(user),
            canPayContract: () => permissions.canPayContract(user),
            canUploadContract: () => permissions.canUploadContract(user),
            canViewCustomerData: (contract: Contract) =>
                permissions.canViewCustomerData(user, contract),

            // Property permissions
            canViewProperty: (property: Property) =>
                permissions.canViewProperty(user, property, allUsers),
            canEditProperty: (property: Property) =>
                permissions.canEditProperty(user, property),
            canDeleteProperty: (property: Property) =>
                permissions.canDeleteProperty(user, property),
            canCreateProperty: () => permissions.canCreateProperty(user),

            // Admin permissions
            canAccessAdminPanel: () =>
                permissions.canAccessAdminPanel(user),
            canViewCompanyStats: () => permissions.canViewCompanyStats(user),

            // Data visibility
            canViewDetailedSales: (targetUserId: string) =>
                permissions.canViewDetailedSales(
                    user,
                    targetUserId,
                    allUsers
                ),

            // Hierarchy helpers
            isSubordinate: (managerId: string, userId: string) =>
                permissions.isSubordinate(managerId, userId, allUsers),
            getSubordinateIds: (managerId: string) =>
                permissions.getSubordinateIds(managerId, allUsers),
        }),
        [user, allUsers]
    )
}
