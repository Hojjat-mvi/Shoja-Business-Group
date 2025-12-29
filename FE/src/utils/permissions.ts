import type { User } from '@/@types/user'
import type { Contract } from '@/@types/contract'
import type { Property } from '@/@types/property'
import {
    SUPER_ADMIN,
    EDUCATION_MANAGER,
    SALES_MANAGER,
    AGENT,
    getRoleLevel,
    type UserRole,
} from '@/constants/roles.constant'

// ============================================================================
// Role Hierarchy Checks
// ============================================================================

/**
 * Check if role1 is higher than role2 in hierarchy
 */
export function isHigherRole(role1: UserRole, role2: UserRole): boolean {
    return getRoleLevel(role1) > getRoleLevel(role2)
}

/**
 * Check if manager role can manage target role
 */
export function canManageRole(
    managerRole: UserRole,
    targetRole: UserRole
): boolean {
    return getRoleLevel(managerRole) > getRoleLevel(targetRole)
}

// ============================================================================
// Hierarchy Checks
// ============================================================================

/**
 * Check if userId is a subordinate of managerId (direct or indirect)
 */
export function isSubordinate(
    managerId: string,
    userId: string,
    allUsers: User[]
): boolean {
    const user = allUsers.find((u) => u.id === userId)
    if (!user) return false

    // Check direct manager
    if (user.managerId === managerId) return true

    // Check indirect (recursive up the chain)
    if (user.managerId) {
        return isSubordinate(managerId, user.managerId, allUsers)
    }

    return false
}

/**
 * Get all subordinate IDs for a manager (direct and indirect)
 */
export function getSubordinateIds(
    managerId: string,
    allUsers: User[]
): string[] {
    const subordinates: string[] = []

    // Get direct subordinates
    const directSubordinates = allUsers.filter((u) => u.managerId === managerId)

    directSubordinates.forEach((user) => {
        subordinates.push(user.id)
        // Recursively get their subordinates
        const nestedSubordinates = getSubordinateIds(user.id, allUsers)
        subordinates.push(...nestedSubordinates)
    })

    return subordinates
}

// ============================================================================
// User Management Permissions
// ============================================================================

/**
 * Check if current user can view target user
 */
export function canViewUser(currentUser: User, targetUser: User): boolean {
    // Super Admin can view all
    if (currentUser.role === SUPER_ADMIN) return true

    // Can view self
    if (currentUser.id === targetUser.id) return true

    // Can view direct manager
    if (currentUser.managerId === targetUser.id) return true

    // Managers can view subordinates
    if (targetUser.managerId === currentUser.id) return true

    return false
}

/**
 * Check if current user can edit target user
 */
export function canEditUser(currentUser: User, targetUser: User): boolean {
    // Super Admin can edit all
    if (currentUser.role === SUPER_ADMIN) return true

    // Can edit self (limited fields)
    if (currentUser.id === targetUser.id) return true

    // Manager can edit direct subordinates
    if (
        targetUser.managerId === currentUser.id &&
        canManageRole(currentUser.role!, targetUser.role!)
    ) {
        return true
    }

    return false
}

/**
 * Check if current user can delete target user
 */
export function canDeleteUser(currentUser: User, targetUser: User): boolean {
    // Only Super Admin can delete users
    return currentUser.role === SUPER_ADMIN
}

/**
 * Check if current user can approve new users
 */
export function canApproveUser(currentUser: User): boolean {
    // Only Super Admin can approve users
    return currentUser.role === SUPER_ADMIN
}

/**
 * Check if current user can create a user with specified role
 */
export function canCreateUserWithRole(
    currentUser: User,
    newUserRole: UserRole
): boolean {
    // Super Admin can create any role
    if (currentUser.role === SUPER_ADMIN) return true

    // Education Manager can create SM and Agent
    if (currentUser.role === EDUCATION_MANAGER) {
        return newUserRole === SALES_MANAGER || newUserRole === AGENT
    }

    // Sales Manager can create Agent only
    if (currentUser.role === SALES_MANAGER) {
        return newUserRole === AGENT
    }

    // Agents cannot create users
    return false
}

// ============================================================================
// Contract Permissions
// ============================================================================

/**
 * Check if current user can view contract
 */
export function canViewContract(
    currentUser: User,
    contract: Contract,
    allUsers?: User[]
): boolean {
    // Super Admin can view all
    if (currentUser.role === SUPER_ADMIN) return true

    // Own contracts
    if (contract.agentId === currentUser.id) return true

    // Manager can view subordinate contracts (if allUsers provided)
    if (allUsers && currentUser.id) {
        const subordinateIds = getSubordinateIds(currentUser.id, allUsers)
        if (subordinateIds.includes(contract.agentId)) return true
    }

    return false
}

/**
 * Check if current user can edit contract
 */
export function canEditContract(currentUser: User, contract: Contract): boolean {
    // Super Admin can edit all
    if (currentUser.role === SUPER_ADMIN) return true

    // Can edit own contract (before approval)
    if (
        contract.agentId === currentUser.id &&
        contract.status === 'pending'
    ) {
        return true
    }

    return false
}

/**
 * Check if current user can review/approve contracts
 */
export function canReviewContract(currentUser: User): boolean {
    // Only Super Admin can review contracts
    return currentUser.role === SUPER_ADMIN
}

/**
 * Check if current user can mark contracts as paid
 */
export function canPayContract(currentUser: User): boolean {
    // Only Super Admin can mark as paid
    return currentUser.role === SUPER_ADMIN
}

/**
 * Check if current user can upload contracts
 */
export function canUploadContract(currentUser: User): boolean {
    // All roles can upload contracts
    return true
}

// ============================================================================
// Property Permissions
// ============================================================================

/**
 * Check if current user can view property
 */
export function canViewProperty(
    currentUser: User,
    property: Property,
    allUsers?: User[]
): boolean {
    // Super Admin can view all
    if (currentUser.role === SUPER_ADMIN) return true

    // Own properties
    if (property.ownerId === currentUser.id) return true

    // Manager can view subordinate properties (if allUsers provided)
    if (allUsers && currentUser.id) {
        const subordinateIds = getSubordinateIds(currentUser.id, allUsers)
        if (subordinateIds.includes(property.ownerId)) return true
    }

    return false
}

/**
 * Check if current user can edit property
 */
export function canEditProperty(
    currentUser: User,
    property: Property
): boolean {
    // Super Admin can edit all
    if (currentUser.role === SUPER_ADMIN) return true

    // Owner can edit own property
    if (property.ownerId === currentUser.id) return true

    return false
}

/**
 * Check if current user can delete property
 */
export function canDeleteProperty(
    currentUser: User,
    property: Property
): boolean {
    // Super Admin can delete all
    if (currentUser.role === SUPER_ADMIN) return true

    // Owner can delete own property
    if (property.ownerId === currentUser.id) return true

    return false
}

/**
 * Check if current user can create properties
 */
export function canCreateProperty(currentUser: User): boolean {
    // All roles can create properties
    return true
}

// ============================================================================
// Data Visibility Permissions
// ============================================================================

/**
 * Check if current user can see customer data in contract
 * According to requirements: Only the agent who owns the contract can see customer details
 */
export function canViewCustomerData(
    currentUser: User,
    contract: Contract
): boolean {
    // Super Admin CANNOT see customer data (per requirements)
    if (currentUser.role === SUPER_ADMIN) return false

    // Only the owning agent can see customer data
    return contract.agentId === currentUser.id
}

/**
 * Check if current user can view detailed sales (not just totals)
 */
export function canViewDetailedSales(
    currentUser: User,
    targetUserId: string,
    allUsers?: User[]
): boolean {
    // Super Admin can see all details
    if (currentUser.role === SUPER_ADMIN) return true

    // Can see own details
    if (currentUser.id === targetUserId) return true

    // Sales Manager can see direct subordinate details (not peers)
    if (currentUser.role === SALES_MANAGER && allUsers) {
        const directSubordinates = allUsers.filter(
            (u) => u.managerId === currentUser.id
        )
        return directSubordinates.some((u) => u.id === targetUserId)
    }

    return false
}

// ============================================================================
// Admin Permissions
// ============================================================================

/**
 * Check if user has admin privileges
 */
export function isAdmin(currentUser: User): boolean {
    return currentUser.role === SUPER_ADMIN
}

/**
 * Check if user is a manager (EM or SM)
 */
export function isManager(currentUser: User): boolean {
    return (
        currentUser.role === EDUCATION_MANAGER ||
        currentUser.role === SALES_MANAGER
    )
}

/**
 * Check if user can access admin panel
 */
export function canAccessAdminPanel(currentUser: User): boolean {
    return currentUser.role === SUPER_ADMIN
}

/**
 * Check if user can view company-wide statistics
 */
export function canViewCompanyStats(currentUser: User): boolean {
    return currentUser.role === SUPER_ADMIN
}
